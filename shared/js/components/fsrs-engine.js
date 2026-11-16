/*!
 * CN-Primary-Taxonomy · 共享组件：FSRS 间隔复习引擎（浏览器版）
 *
 * 移植自 scripts/fsrs-engine-v2.js（原为孤儿 Node 脚本，未被任何页面引用），
 * 并按四篇参考文章的方法论做了扩展：
 *   1. 《AI 自学数学账本》——75 分钟日预算、复习封顶一半预算、先复习后新学、
 *      知识边界硬约束、信心校准、错因探针、低级失误台账、连续 3 次独立答对后退役（休眠抽检）
 *   2. 《词光》——首次作答才计入"首做正确率"，重测（retest）不计入
 *   3. 《cn-math-taxonomy》——三态掌握（未开始/学习中/已掌握）与 FSRS 卡片相互独立但可互证
 *
 * 全部数据只保存在 localStorage，不上传任何服务器。
 */
(function() {
  'use strict';

  const DAY_MS = 24 * 3600 * 1000;
  const HOUR_MS = 3600 * 1000;
  const MIN_MS = 60 * 1000;

  // 6 轮基础间隔（毫秒）
  const BASE_INTERVALS = [
    20 * MIN_MS,   // 第1轮：20 分钟
    1 * HOUR_MS,   // 第2轮：1 小时
    1 * DAY_MS,    // 第3轮：1 天
    3 * DAY_MS,    // 第4轮：3 天
    7 * DAY_MS,    // 第5轮：7 天
    30 * DAY_MS    // 第6轮：30 天
  ];

  const MULTIPLIERS = [1, 1.5, 2];       // 连续 1/2/3 次独立答对
  const MAX_INTERVAL = 60 * DAY_MS;       // 间隔上限 60 天
  const DORMANT_AFTER = 3;                // 连续 3 次独立答对 → 退役（休眠）
  const DORMANT_PROBE = 60 * DAY_MS;      // 退役后 60 天抽检

  /**
   * FSRS 引擎实例（按角色隔离存储）
   */
  class FsrsEngine {
    /**
     * @param {string} role - parent | student | teacher
     */
    constructor(role) {
      this.role = role || 'student';
      this.storage = window.CNPT.storage.create(this.role);
      this.state = this._load();
    }

    // ---------------- 持久化 ----------------

    _load() {
      const raw = this.storage.getFsrsState();
      const s = (raw && typeof raw === 'object') ? raw : {};
      this.cards = s.cards && typeof s.cards === 'object' ? s.cards : {};
      this.reviewLog = Array.isArray(s.reviewLog) ? s.reviewLog : [];
      this.errorLog = Array.isArray(s.errorLog) ? s.errorLog : [];
      this.firstAttempts = s.firstAttempts && typeof s.firstAttempts === 'object' ? s.firstAttempts : {};
      this.dailySeconds = s.dailySeconds && typeof s.dailySeconds === 'object' ? s.dailySeconds : {};
      return s;
    }

    save() {
      this.storage.setFsrsState({
        version: 2,
        cards: this.cards,
        reviewLog: this.reviewLog.slice(-2000),
        errorLog: this.errorLog.slice(-500),
        firstAttempts: this.firstAttempts,
        dailySeconds: this.dailySeconds,
        savedAt: new Date().toISOString()
      });
    }

    // ---------------- 卡片 ----------------

    getCard(topicId) {
      if (!this.cards[topicId]) {
        this.cards[topicId] = {
          round: 0,
          consecutiveCorrect: 0,
          consecutiveWrong: 0,
          lastReview: null,
          nextReview: null,
          dormant: false,
          dormantSince: null,
          totalReviews: 0,
          totalCorrect: 0,
          confidenceHistory: []
        };
      }
      return this.cards[topicId];
    }

    /**
     * 记录一次作答
     * @param {object} p
     * @param {string} p.topicId
     * @param {boolean} p.isCorrect
     * @param {boolean} [p.isIndependent=true] 是否独立答对（看过提示/解析则 false）
     * @param {number} [p.confidence=50] 作答前信心 0/25/50/75/100
     * @param {string} [p.reason] 错因编号（P01-P11 / LOW），答错时建议填写
     * @param {boolean} [p.isLowLevel=false] 是否为低级失误（抄错/漏写/口算错）
     * @param {object} [p.questionInfo]
     */
    recordAnswer(p) {
      const topicId = p.topicId;
      const isCorrect = !!p.isCorrect;
      const isIndependent = p.isIndependent !== false;
      const confidence = (p.confidence === undefined || p.confidence === null) ? 50 : p.confidence;
      const now = Date.now();

      const card = this.getCard(topicId);

      // 首做记录：只有第一次作答进入"首做"统计，重测不计入（借鉴《词光》）
      if (!this.firstAttempts[topicId]) {
        this.firstAttempts[topicId] = {
          isCorrect,
          isIndependent,
          at: now,
          questionId: p.questionInfo ? p.questionInfo.questionId : null
        };
      }

      this.reviewLog.push({
        topicId,
        isCorrect,
        isIndependent,
        confidence,
        reason: p.reason || null,
        isLowLevel: !!p.isLowLevel,
        timestamp: now,
        questionId: p.questionInfo ? p.questionInfo.questionId : null
      });
      card.totalReviews++;
      if (isCorrect) card.totalCorrect++;

      card.confidenceHistory.push({ confidence, correct: isCorrect, timestamp: now });
      if (card.confidenceHistory.length > 50) {
        card.confidenceHistory = card.confidenceHistory.slice(-50);
      }

      if (isCorrect && isIndependent) {
        card.consecutiveCorrect++;
        card.consecutiveWrong = 0;

        if (card.consecutiveCorrect >= DORMANT_AFTER) {
          // 退役：连续 3 次独立答对 → 休眠，60 天后抽检
          card.dormant = true;
          card.dormantSince = now;
          card.nextReview = now + DORMANT_PROBE;
        } else {
          const roundIndex = Math.min(card.round, BASE_INTERVALS.length - 1);
          const baseInterval = BASE_INTERVALS[roundIndex];
          const multiplier = MULTIPLIERS[Math.min(card.consecutiveCorrect - 1, MULTIPLIERS.length - 1)];
          let interval = Math.round(baseInterval * multiplier);
          if (interval > MAX_INTERVAL) interval = MAX_INTERVAL;
          card.nextReview = now + interval;
          card.round = Math.min(card.round + 1, BASE_INTERVALS.length);
          card.dormant = false;
        }
      } else if (isCorrect && !isIndependent) {
        // 提示后答对：不算通过，回到第 1 轮
        card.consecutiveCorrect = 0;
        card.consecutiveWrong = 0;
        card.round = 0;
        card.nextReview = now + BASE_INTERVALS[0];
        card.dormant = false;
      } else {
        // 答错：归零并立即重排；若处于休眠则唤醒
        card.consecutiveCorrect = 0;
        card.consecutiveWrong++;
        card.round = 0;
        card.nextReview = now + BASE_INTERVALS[0];
        card.dormant = false;

        this.errorLog.push({
          topicId,
          questionId: p.questionInfo ? p.questionInfo.questionId : null,
          question: p.questionInfo ? p.questionInfo.question : null,
          options: p.questionInfo ? p.questionInfo.options : null,
          answer: p.questionInfo ? p.questionInfo.answer : null,
          selected: p.questionInfo ? p.questionInfo.selected : null,
          confidence,
          reason: p.reason || null,
          isLowLevel: !!p.isLowLevel,
          timestamp: now
        });

        // 低级失误单独进台账（与知识性错题分离）
        if (p.isLowLevel || p.reason === 'LOW') {
          this.storage.addLowLevelMistake({
            topicId,
            type: p.lowLevelType || '未分类',
            detail: p.questionInfo ? p.questionInfo.question : '',
            reason: p.reason || 'LOW'
          });
        }
      }

      card.lastReview = now;
      this.save();
      return card;
    }

    // ---------------- 查询 ----------------

    /** 今日到期的知识点 ID 列表（含休眠抽检） */
    getDueTopicIds() {
      const now = Date.now();
      const due = [];
      for (const topicId in this.cards) {
        const card = this.cards[topicId];
        if (card.nextReview && card.nextReview <= now) due.push(topicId);
      }
      // 到期优先复习答错次数多的
      return due.sort((a, b) => {
        const ca = this.cards[a], cb = this.cards[b];
        return (cb.consecutiveWrong - ca.consecutiveWrong) || (ca.nextReview - cb.nextReview);
      });
    }

    getErrors() { return this.errorLog; }

    getErrorStats() {
      const byTopic = {};
      for (const err of this.errorLog) {
        if (!byTopic[err.topicId]) byTopic[err.topicId] = { count: 0, lastError: err.timestamp, reasons: {} };
        byTopic[err.topicId].count++;
        if (err.timestamp > byTopic[err.topicId].lastError) byTopic[err.topicId].lastError = err.timestamp;
        if (err.reason) {
          byTopic[err.topicId].reasons[err.reason] = (byTopic[err.topicId].reasons[err.reason] || 0) + 1;
        }
      }
      return byTopic;
    }

    /**
     * 首做正确率（仅统计每个知识点的第一次作答，重测不计入）
     * 借鉴《词光》：首次作答计入正确率，避免反复重测刷高数据
     */
    getFirstAttemptAccuracy() {
      const ids = Object.keys(this.firstAttempts);
      if (!ids.length) return null;
      const correct = ids.filter(id => this.firstAttempts[id].isCorrect).length;
      const independent = ids.filter(id => this.firstAttempts[id].isIndependent);
      const indCorrect = independent.filter(id => this.firstAttempts[id].isCorrect);
      return {
        topics: ids.length,
        correct,
        rate: Math.round((correct / ids.length) * 100),
        independentTopics: independent.length,
        independentRate: independent.length ? Math.round((indCorrect.length / independent.length) * 100) : null
      };
    }

    /** 信心校准：平均信心 - 实际正确率（正值=高估自己） */
    getCalibrationBias() {
      const logs = this.reviewLog.filter(l => l.confidence !== null && l.confidence !== undefined);
      if (!logs.length) return null;
      let totalConfidence = 0, totalCorrect = 0;
      for (const l of logs) {
        totalConfidence += l.confidence;
        if (l.isCorrect) totalCorrect++;
      }
      const avg = totalConfidence / logs.length;
      const acc = (totalCorrect / logs.length) * 100;
      return { avgConfidence: Math.round(avg), actualAccuracy: Math.round(acc), bias: Math.round(avg - acc), sampleSize: logs.length };
    }

    /** 独立答对率 */
    getIndependentAccuracy() {
      const logs = this.reviewLog.filter(l => l.isIndependent);
      if (!logs.length) return null;
      const correct = logs.filter(l => l.isCorrect).length;
      return { count: logs.length, correct, rate: Math.round((correct / logs.length) * 100) };
    }

    /** 同类错误复发率（30 天内同一知识点重复出错） */
    getRecurrenceRate() {
      if (!this.errorLog.length) return null;
      const now = Date.now();
      const byTopic = {};
      for (const err of this.errorLog) {
        (byTopic[err.topicId] = byTopic[err.topicId] || []).push(err.timestamp);
      }
      let recurrent = 0, total = 0;
      for (const id in byTopic) {
        const ts = byTopic[id].sort((a, b) => a - b);
        if (ts.length < 2) continue;
        total++;
        for (let i = 1; i < ts.length; i++) {
          if (ts[i] - ts[i - 1] < 30 * DAY_MS) { recurrent++; break; }
        }
      }
      if (!total) return { recurrentTopics: 0, totalTopics: 0, rate: 0 };
      return { recurrentTopics: recurrent, totalTopics: total, rate: Math.round((recurrent / total) * 100), since: now };
    }

    /** 错因分布（P01-P11 / LOW 计数） */
    getReasonDistribution() {
      const dist = {};
      for (const err of this.errorLog) {
        const key = err.reason || 'UNCLASSIFIED';
        dist[key] = (dist[key] || 0) + 1;
      }
      return dist;
    }

    getStatus(topicId) {
      const card = this.cards[topicId];
      if (!card) return null;
      const now = Date.now();
      return {
        round: card.round,
        consecutiveCorrect: card.consecutiveCorrect,
        consecutiveWrong: card.consecutiveWrong,
        dormant: card.dormant,
        nextReview: card.nextReview,
        isDue: !!card.nextReview && card.nextReview <= now,
        daysUntil: card.nextReview ? Math.ceil((card.nextReview - now) / DAY_MS) : null,
        totalReviews: card.totalReviews,
        totalCorrect: card.totalCorrect
      };
    }

    getOverview() {
      const now = Date.now();
      let due = 0, total = 0, dormant = 0, mastered = 0;
      for (const id in this.cards) {
        total++;
        const card = this.cards[id];
        if (card.nextReview && card.nextReview <= now) due++;
        if (card.dormant) dormant++;
        if (card.consecutiveCorrect >= DORMANT_AFTER) mastered++;
      }
      return { total, due, dormant, mastered };
    }

    // ---------------- 今日任务（75 分钟预算 + 边界约束） ----------------

    /**
     * 生成今日学习任务
     * @param {object} cfg
     * @param {Map} cfg.topicMap   知识点索引（CNPT.indices.getTopicMap()）
     * @param {function} cfg.getIncoming 返回入边数组（CNPT.indices.getIncoming）
     * @param {function} cfg.isMastered  判断知识点是否已掌握 (topicId) => boolean
     * @param {number} [cfg.maxNew=5]
     * @param {number} [cfg.maxReview=10]
     */
    buildTodayPlan(cfg) {
      cfg = cfg || {};
      const topicMap = cfg.topicMap || new Map();
      const getIncoming = cfg.getIncoming || function() { return []; };
      const isMastered = cfg.isMastered || function() { return false; };
      const maxNew = cfg.maxNew || 5;
      const maxReview = cfg.maxReview || 10;
      const budget = (window.CNPT.constants && window.CNPT.constants.LEARNING_BUDGET) || { DAILY_MINUTES: 75, REVIEW_RATIO: 0.5 };
      const reviewMinutes = Math.floor(budget.DAILY_MINUTES * budget.REVIEW_RATIO);
      const newMinutes = budget.DAILY_MINUTES - reviewMinutes;

      const used = this.storage.getTodaySeconds();
      const reviewIds = this.getDueTopicIds();
      const review = reviewIds.slice(0, maxReview)
        .map(id => topicMap.get(id))
        .filter(Boolean);

      // 新学候选：从未建立卡片 + 全部硬前置已掌握（知识边界硬约束）
      // 注意：先全量扫描再截取，否则 blocked 会被 maxNew 提前截断
      const blocked = [];
      const newLearn = [];
      for (const [id, topic] of topicMap) {
        if (this.cards[id]) continue;              // 已学过（含在学）
        if (isMastered(id)) continue;              // 手动标记已掌握
        const inc = getIncoming(id) || [];
        const hard = inc.filter(e => e.strength === 'hard');
        if (!hard.length) {
          if (newLearn.length < maxNew) newLearn.push(topic);
          continue;
        }
        const unmet = hard.filter(e => !isMastered(e.source));
        if (unmet.length) {
          blocked.push({ topic, missing: unmet.map(e => ({ id: e.source, name: (topicMap.get(e.source) || {}).name || e.source, reason: e.reason })) });
        } else if (newLearn.length < maxNew) {
          newLearn.push(topic);
        }
      }

      const usedReview = Math.round((used.reviewSeconds || 0) / 60);
      const usedNew = Math.round((used.newSeconds || 0) / 60);
      const remaining = Math.max(0, budget.DAILY_MINUTES - usedReview - usedNew);
      const reviewRemaining = Math.max(0, reviewMinutes - usedReview);

      return {
        dateKey: window.CNPT.utils.localDateKey(),
        budgetMinutes: budget.DAILY_MINUTES,
        reviewMinutes,
        newMinutes,
        usedReviewMinutes: usedReview,
        usedNewMinutes: usedNew,
        remainingMinutes: remaining,
        reviewRemainingMinutes: reviewRemaining,
        reviewBudgetCapped: usedReview >= reviewMinutes,   // 复习封顶一半预算
        review,
        newLearn,
        blocked,
        hasDue: review.length > 0,
        summary: review.length
          ? `今天先复习 ${review.length} 个到期的知识点，再学新的。`
          : `今天没有到期复习，可以直接学新知识点。`
      };
    }

    // ---------------- 周报 / 导入导出 ----------------

    getWeeklyReport() {
      const now = Date.now();
      const weekAgo = now - 7 * DAY_MS;
      const weekLogs = this.reviewLog.filter(l => l.timestamp >= weekAgo);
      const first = this.getFirstAttemptAccuracy();
      return {
        period: '本周',
        totalReviews: weekLogs.length,
        correct: weekLogs.filter(l => l.isCorrect).length,
        firstAttemptAccuracy: first,
        calibration: this.getCalibrationBias(),
        independentAccuracy: this.getIndependentAccuracy(),
        recurrenceRate: this.getRecurrenceRate(),
        reasonDistribution: this.getReasonDistribution(),
        errorCount: this.errorLog.filter(e => e.timestamp >= weekAgo).length,
        lowLevelMistakes: this.storage.getLowLevelMistakes()
          .filter(m => m.timestamp >= weekAgo).length,
        generatedAt: new Date().toISOString()
      };
    }

    export() {
      return {
        version: 2,
        cards: this.cards,
        reviewLog: this.reviewLog,
        errorLog: this.errorLog,
        firstAttempts: this.firstAttempts,
        dailySeconds: this.dailySeconds,
        lowLevelMistakes: this.storage.getLowLevelMistakes(),
        exportedAt: new Date().toISOString()
      };
    }

    import(data) {
      if (!data || typeof data !== 'object') return false;
      if (data.cards) this.cards = data.cards;
      if (data.reviewLog) this.reviewLog = data.reviewLog;
      if (data.errorLog) this.errorLog = data.errorLog;
      if (data.firstAttempts) this.firstAttempts = data.firstAttempts;
      if (data.dailySeconds) this.dailySeconds = data.dailySeconds;
      this.save();
      return true;
    }

    clear() {
      this.cards = {};
      this.reviewLog = [];
      this.errorLog = [];
      this.firstAttempts = {};
      this.dailySeconds = {};
      this.save();
      this.storage.clearLowLevelMistakes();
    }
  }

  // 按角色缓存单例：同一角色下所有调用方共享同一份内存状态
  const _instances = {};

  // 低级失误细分类型（单独台账，与知识性错题分离）
  const LOW_LEVEL_TYPES = ['抄写错误', '口算错误', '单位遗漏', '符号遗漏', '漏题', '格式不规范'];

  window.CNPT = window.CNPT || {};
  window.CNPT.fsrs = {
    create(role) {
      const key = role || 'student';
      if (!_instances[key]) _instances[key] = new FsrsEngine(key);
      return _instances[key];
    },
    /** 仅调试/重置用：清空单例缓存 */
    _clearCache() { for (const k in _instances) delete _instances[k]; },
    LOW_LEVEL_TYPES,
    BASE_INTERVALS,
    DORMANT_AFTER,
    buildReasonOptions() {
      const reasons = (window.CNPT.constants && window.CNPT.constants.ERROR_REASONS) || {};
      return Object.keys(reasons).map(k => ({ value: k, label: `${k} ${reasons[k]}` }));
    }
  };
})();
