/*!
 * CN-Primary-Taxonomy · FSRS-6 调度内核（官方 21 参数，浏览器 / Node 通用）
 *
 * 来源与方法：
 *   - FSRS-6 官方实现 open-spaced-repetition/fsrs-rs（src/model_v6.rs、src/inference_v6.rs、src/simulation.rs）
 *     · R(t) = (1 + FACTOR·t/S)^DECAY，DECAY = -w[20]，FACTOR = 0.9^(1/DECAY) - 1
 *     · I(S,R) = S/FACTOR·(R^(1/DECAY) - 1)
 *     · initStability = w[rating-1]；initDifficulty = w4 - exp(w5·(rating-1)) + 1
 *     · nextDifficulty = meanReversion(w7, initD(4), D + (10-D)/9·(-w6·(rating-3)))
 *     · 成功 S' = S·(exp(w8)·(11-D)·S^(-w9)·(exp((1-R)·w10)-1)·hardPenalty·easyBonus + 1)
 *     · 失败 S' = min(S/exp(w17·w18), w11·D^(-w12)·((S+1)^w13-1)·exp((1-R)·w14))
 *     · 短期（当天复习）S' = S·(rating≥2 ? max(1,sinc) : sinc)，sinc = exp(w17·(rating-3+w18))·S^(-w19)
 *   - 17 → 21 参数迁移（官方 check_and_fill_parameters_fsrs6）：
 *       p[4] += 2·p[5]; p[5] = ln(3·p[5]+1)/3; p[6] += 0.5; p[17..19]=0; p[20]=0.5
 *
 * 定位：**影子运行内核**。默认不接管排期，由 fsrs-engine.js 在每次作答后并行计算 FSRS-6 间隔，
 *       写入 reviewLog 的 shadow6IntervalDays 字段，供 reports 与校准对比使用。
 *
 * 无第三方依赖。
 */
(function() {
  'use strict';

  const DAY_MS = 24 * 3600 * 1000;
  const S_MIN = 0.0001, S_MAX = 36500, D_MIN = 1, D_MAX = 10;
  const DEFAULT_RETENTION = 0.9;

  const RATING = { AGAIN: 1, HARD: 2, GOOD: 3, EASY: 4 };

  // FSRS-6 官方默认参数（21 个，末位为 decay 权重 w20）
  const DEFAULT_W = [
    0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666,
    0.796, 1.4835, 0.0614, 0.2629, 1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658,
    0.1542
  ];
  const FSRS5_DEFAULT_DECAY = 0.5;

  const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

  /** 官方 17 → 21 参数迁移 */
  function migrate17to21(w17) {
    const p = w17.slice();
    if (p.length !== 17) return null;
    p[4] = p[5] * 2 + p[4];
    p[5] = Math.log(p[5] * 3 + 1) / 3;
    p[6] = p[6] + 0.5;
    p.push(0, 0, 0, FSRS5_DEFAULT_DECAY);
    return p;
  }

  /**
   * 创建 FSRS-6 调度器
   * @param {object} [params] { w?: number[21], w17?: number[17], desiredRetention?: number }
   */
  function createScheduler(params) {
    const p = params || {};
    let w = null;
    if (Array.isArray(p.w) && p.w.length === 21 && p.w.every(x => typeof x === 'number' && isFinite(x))) {
      w = p.w.slice();
    } else if (Array.isArray(p.w17) && p.w17.length === 17 && p.w17.every(x => typeof x === 'number' && isFinite(x))) {
      w = migrate17to21(p.w17);
    }
    if (!w) w = DEFAULT_W.slice();
    const desiredRetention = (typeof p.desiredRetention === 'number' && p.desiredRetention > 0 && p.desiredRetention < 1)
      ? p.desiredRetention
      : DEFAULT_RETENTION;

    const decay = -w[20];
    const factor = Math.pow(0.9, 1 / decay) - 1;

    const initStability = rating => Math.max(w[rating - 1], S_MIN);
    const initDifficulty = rating => clamp(w[4] - Math.exp(w[5] * (rating - 1)) + 1, D_MIN, D_MAX);

    function retrievability(elapsedDays, stability) {
      const s = Math.max(stability, S_MIN);
      const t = Math.max(0, Math.round(elapsedDays));
      return Math.pow(t / s * factor + 1, decay);
    }

    const succS = (S, r, D, rating) => {
      const hardPenalty = rating === RATING.HARD ? w[15] : 1;
      const easyBonus = rating === RATING.EASY ? w[16] : 1;
      const v = S * (Math.exp(w[8]) * (11 - D) * Math.pow(S, -w[9]) *
        (Math.exp((1 - r) * w[10]) - 1) * hardPenalty * easyBonus + 1);
      return clamp(v, S_MIN, S_MAX);
    };
    const failS = (S, r, D) => {
      const newSMin = S / Math.exp(w[17] * w[18]);
      const newS = w[11] * Math.pow(D, -w[12]) * (Math.pow(S + 1, w[13]) - 1) * Math.exp((1 - r) * w[14]);
      return clamp(Math.min(newS, newSMin), S_MIN, S_MAX);
    };
    const shortTermS = (S, rating) => {
      const sinc = Math.exp(w[17] * (rating - 3 + w[18])) * Math.pow(S, -w[19]);
      return clamp(S * (rating >= 2 ? Math.max(1, sinc) : sinc), S_MIN, S_MAX);
    };
    const nextD = (d, rating) => {
      const deltaD = -w[6] * (rating - 3);
      const newD = d + (10 - d) / 9 * deltaD;
      return clamp(w[7] * initDifficulty(RATING.GOOD) + (1 - w[7]) * newD, D_MIN, D_MAX);
    };

    /** 由稳定性计算间隔天数（期望留存 desiredRetention） */
    function intervalDays(stability) {
      const days = stability / factor * (Math.pow(desiredRetention, 1 / decay) - 1);
      return Math.max(1, Math.round(days));
    }

    /**
     * 推进一步记忆状态
     * @param {object} card { stability, difficulty, lastReview }
     * @param {number} rating 1..4
     * @param {number} now 时间戳（毫秒）
     */
    function step(card, rating, now) {
      const prevS = Number(card && card.stability) || 0;
      const d = (card && typeof card.difficulty === 'number') ? clamp(card.difficulty, D_MIN, D_MAX) : initDifficulty(RATING.GOOD);
      const last = (card && card.lastReview) || null;
      const elapsedDays = last ? Math.max(0, (now - last) / DAY_MS) : 0;

      if (!last || !(prevS > 0)) {
        return {
          stability: Math.round(initStability(rating) * 10000) / 10000,
          difficulty: Math.round(initDifficulty(rating) * 1000) / 1000,
          intervalDays: intervalDays(initStability(rating)),
          retrievability: 1,
          sameDay: false
        };
      }
      // 官方：delta_t 四舍五入后为 0 才走当天短期分支
      const dtRounded = Math.max(0, Math.round(elapsedDays));
      const r = dtRounded > 0 ? retrievability(elapsedDays, prevS) : 1;
      let s;
      if (dtRounded === 0) s = shortTermS(prevS, rating);
      else if (rating === RATING.AGAIN) s = failS(prevS, r, d);
      else s = succS(prevS, r, d, rating);
      const nd = nextD(d, rating);
      return {
        stability: Math.round(s * 10000) / 10000,
        difficulty: Math.round(nd * 1000) / 1000,
        intervalDays: intervalDays(s),
        retrievability: Math.round(r * 1000) / 1000,
        sameDay: dtRounded === 0
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
      get params() { return { w: w.slice(), decay, factor, desiredRetention }; }
    };
  }

  const api = {
    createScheduler,
    migrate17to21,
    DEFAULT_W,
    RATING,
    DAY_MS,
    S_MIN,
    S_MAX,
    DEFAULT_RETENTION
  };
  if (typeof window !== 'undefined') {
    window.CNPT = window.CNPT || {};
    window.CNPT.fsrs6Scheduler = api;
  }
  if (typeof globalThis !== 'undefined' && !globalThis.CNPT) {
    globalThis.CNPT = { fsrs6Scheduler: api };
  }
})();
