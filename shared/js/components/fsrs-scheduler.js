/*!
 * CN-Primary-Taxonomy · FSRS 调度内核（FSRS-4 公式，17 参数）
 *
 * 来源与方法：
 *   - 公式实现参考开放间隔重复社区 FSRS-4（17 参数）公开算法定义：
 *     https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm
 *   - 参数默认值为 FSRS-4 社区默认的近似值，**未经本项目真实数据校准**；
 *     正式参数请运行 `node scripts/calibrate-fsrs.mjs`（读取导出的 reviewLog）
 *     生成 data/fsrs-params.json，构建时注入为 window.__CNPT_FSRS_PARAMS__。
 *
 * 设计取舍（与本项目业务规则结合）：
 *   - 评分 1..4 = Again / Hard / Good / Easy，由上层把「答错 / 提示后答对 / 独立答对」映射得到。
 *   - 内核只负责「记忆状态（S 稳定性 / D 难度 / R 可提取性）」与「间隔天数」计算，
 *     不关心 75 分钟预算、错因台账、休眠抽检等业务规则（由 fsrs-engine.js 保留）。
 *   - 可提取性 R(t) = (1 + FACTOR * t / S) ^ DECAY，FACTOR = 19/81，DECAY = -0.5。
 *   - 间隔 I = S / FACTOR * (desiredRetention ^ (1/DECAY) - 1)，默认期望留存 0.9。
 *
 * 无第三方依赖，浏览器 / Node 均可运行（Node 测试通过 globalThis 注入）。
 */
(function() {
  'use strict';

  const DAY_MS = 24 * 3600 * 1000;
  const DECAY = -0.5;
  const FACTOR = 19 / 81;              // ≈ 0.2346
  const DEFAULT_RETENTION = 0.9;

  const RATING = { AGAIN: 1, HARD: 2, GOOD: 3, EASY: 4 };

  // FSRS-4 社区默认近似值（17 个权重）。索引含义：
  //   w0..w3  初始稳定性（Again/Hard/Good/Easy）
  //   w4..w7  初始难度（Again/Hard/Good/Easy）
  //   w8      难度更新步长
  //   w9      难度均值回归系数
  //   w10..w13  Again 后的稳定性公式权重
  //   w14      （保留）
  //   w15      Hard 惩罚
  //   w16      Easy 加成
  const DEFAULT_W = [
    0.4872, 1.4003, 3.7, 13.8,
    5.16, 1.23, 0.897, 0.031,
    1.647, 0.1367, 1.046, 1.986,
    0.12, 0.299, 2.293, 0.2318,
    0.2935
  ];

  const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

  /**
   * 创建调度器
   * @param {object} [params] { w?: number[17], desiredRetention?: number }
   */
  function createScheduler(params) {
    const p = params || {};
    const w = (Array.isArray(p.w) && p.w.length === 17 && p.w.every(x => typeof x === 'number' && isFinite(x)))
      ? p.w.slice()
      : DEFAULT_W.slice();
    const desiredRetention = (typeof p.desiredRetention === 'number' && p.desiredRetention > 0 && p.desiredRetention < 1)
      ? p.desiredRetention
      : DEFAULT_RETENTION;

    const initStability = rating => Math.max(w[rating - 1], 0.1);
    const initDifficulty = rating => clamp(w[4 + rating - 1], 1, 10);

    function meanReversion(init, current) {
      return w[9] * init + (1 - w[9]) * current;
    }

    function nextDifficulty(d, rating) {
      const next = d - w[8] * (rating - 3);
      return clamp(meanReversion(initDifficulty(RATING.GOOD), next), 1, 10);
    }

    /** 可提取性（留存概率） R(t) */
    function retrievability(elapsedDays, stability) {
      if (!(stability > 0)) return 0;
      if (!(elapsedDays > 0)) return 1;
      return Math.pow(1 + FACTOR * elapsedDays / stability, DECAY);
    }

    /** 复习成功后的稳定性（Again 走独立的短时分支） */
    function nextStability(stability, difficulty, rating, r) {
      if (rating === RATING.AGAIN) {
        // S' = w10 * D^-w11 * ((S+1)^w12 - 1)
        const s = w[10] * Math.pow(difficulty, -w[11]) * (Math.pow(stability + 1, w[12]) - 1);
        return Math.max(s, 0.1);
      }
      const hardPenalty = rating === RATING.HARD ? w[15] : 1;
      const easyBonus = rating === RATING.EASY ? w[16] : 1;
      const inc = 1 + Math.exp(w[8]) * (11 - difficulty) * Math.pow(stability, -w[9]) *
        (Math.exp(w[10] * (1 - r)) - 1) * hardPenalty * easyBonus;
      return Math.max(stability * inc, 0.1);
    }

    /** 由稳定性计算间隔天数（期望留存 desiredRetention） */
    function intervalDays(stability) {
      const days = stability / FACTOR * (Math.pow(desiredRetention, 1 / DECAY) - 1);
      return Math.max(1, Math.round(days));
    }

    /**
     * 推进一步记忆状态
     * @param {object} card { stability, difficulty, lastReview, reps, lapses }
     * @param {number} rating 1..4
     * @param {number} now 时间戳（毫秒）
     * @returns {{stability:number, difficulty:number, intervalDays:number, retrievability:number}}
     */
    function step(card, rating, now) {
      const prevS = Number(card && card.stability) || 0;
      const d = (card && typeof card.difficulty === 'number') ? card.difficulty : initDifficulty(RATING.GOOD);
      const last = (card && card.lastReview) || null;
      const elapsedDays = last ? Math.max(0, (now - last) / DAY_MS) : 0;
      const r = last ? retrievability(elapsedDays, prevS) : 1;

      let stability;
      let difficulty;
      if (!last || !(prevS > 0)) {
        // 新卡：直接取初始值
        stability = initStability(rating);
        difficulty = initDifficulty(rating);
      } else {
        difficulty = nextDifficulty(d, rating);
        stability = nextStability(prevS, d, rating, r);
      }
      return {
        stability: Math.round(stability * 10000) / 10000,
        difficulty: Math.round(difficulty * 1000) / 1000,
        intervalDays: intervalDays(stability),
        retrievability: Math.round(r * 1000) / 1000
      };
    }

    return {
      step,
      intervalDays,
      retrievability,
      initStability,
      initDifficulty,
      RATING,
      DAY_MS,
      get params() { return { w: w.slice(), desiredRetention }; }
    };
  }

  const api = { createScheduler, DEFAULT_W, RATING, DAY_MS, DECAY, FACTOR, DEFAULT_RETENTION };
  if (typeof window !== 'undefined') {
    window.CNPT = window.CNPT || {};
    window.CNPT.fsrsScheduler = api;
  }
  // Node 测试环境（无 window）
  if (typeof globalThis !== 'undefined' && !globalThis.CNPT) {
    globalThis.CNPT = { fsrsScheduler: api };
  }
})();
