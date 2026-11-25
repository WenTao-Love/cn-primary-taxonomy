/**
 * FSRS 间隔复习引擎 v2（借鉴 费曼错题本 Pro v7.01）
 * 
 * 升级点：
 * 1. 6轮基础间隔：20分钟 / 1小时 / 1天 / 3天 / 7天 / 30天
 * 2. 自适应倍数：连续独立答对次数 → 1x / 1.5x / 2x（上限60天）
 * 3. 休眠抽检：连续3次独立答对后休眠，60天后抽检1题
 * 4. 信心校准：记录作答前信心（0/25/50/75/100），计算校准偏差
 * 5. 独立答对判定：只认独立答对，提示后答对不算通过
 * 
 * 数据只保存在 localStorage，不上传任何服务器
 */
(function() {
  'use strict';

  const STORAGE_KEY = 'cnpt_fsrs_v2';
  const DAY_MS = 24 * 3600 * 1000;
  const HOUR_MS = 3600 * 1000;
  const MIN_MS = 60 * 1000;

  // 6轮基础间隔（毫秒）
  const BASE_INTERVALS = [
    20 * MIN_MS,      // 第1轮：20分钟
    1 * HOUR_MS,      // 第2轮：1小时
    1 * DAY_MS,       // 第3轮：1天
    3 * DAY_MS,       // 第4轮：3天
    7 * DAY_MS,       // 第5轮：7天
    30 * DAY_MS       // 第6轮：30天
  ];

  // 自适应倍数
  const MULTIPLIERS = [1, 1.5, 2];  // 连续1/2/3次独立答对

  class FsrsEngine {
    constructor() {
      // 每个知识点的状态
      this.cards = {};  // topicId -> { round, consecutiveCorrect, stability, lastReview, nextReview, dormant, dormantSince, confidenceHistory }
      this.errorLog = [];  // 错题记录
      this.reviewLog = [];  // 复习记录
      this.load();
    }

    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const d = JSON.parse(raw);
          this.cards = d.cards || {};
          this.errorLog = d.errorLog || [];
          this.reviewLog = d.reviewLog || [];
        }
      } catch (e) {
        console.error('FSRS v2 load error:', e);
      }
    }

    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          cards: this.cards,
          errorLog: this.errorLog,
          reviewLog: this.reviewLog,
          savedAt: new Date().toISOString()
        }));
      } catch (e) {
        console.error('FSRS v2 save error:', e);
      }
    }

    /**
     * 获取卡片状态（不存在则创建）
     */
    getCard(topicId) {
      if (!this.cards[topicId]) {
        this.cards[topicId] = {
          round: 0,                // 当前轮次（0-6）
          consecutiveCorrect: 0,   // 连续独立答对次数
          lastReview: null,
          nextReview: null,
          dormant: false,          // 是否休眠
          dormantSince: null,      // 休眠开始时间
          totalReviews: 0,         // 总复习次数
          totalCorrect: 0,         // 总答对次数
          confidenceHistory: []    // 信心历史 [{confidence, correct, timestamp}]
        };
      }
      return this.cards[topicId];
    }

    /**
     * 记录一次作答
     * @param {string} topicId - 知识点ID
     * @param {boolean} isCorrect - 是否答对
     * @param {boolean} isIndependent - 是否独立答对（无提示）
     * @param {number} confidence - 作答前信心（0/25/50/75/100）
     * @param {object} questionInfo - 题目信息 {questionId, question, options, answer, selected}
     */
    recordAnswer(topicId, isCorrect, isIndependent, confidence, questionInfo) {
      const card = this.getCard(topicId);
      const now = Date.now();

      // 记录复习
      const reviewEntry = {
        topicId,
        isCorrect,
        isIndependent,
        confidence,
        timestamp: now,
        questionId: questionInfo ? questionInfo.questionId : null
      };
      this.reviewLog.push(reviewEntry);
      card.totalReviews++;
      if (isCorrect) card.totalCorrect++;

      // 记录信心历史
      card.confidenceHistory.push({
        confidence: confidence,
        correct: isCorrect,
        timestamp: now
      });
      // 只保留最近50条
      if (card.confidenceHistory.length > 50) {
        card.confidenceHistory = card.confidenceHistory.slice(-50);
      }

      // 计算下次复习时间
      if (isCorrect && isIndependent) {
        card.consecutiveCorrect++;
        
        // 检查是否进入休眠
        if (card.consecutiveCorrect >= 3) {
          card.dormant = true;
          card.dormantSince = now;
          card.nextReview = now + 60 * DAY_MS;  // 60天后抽检
        } else {
          // 计算间隔
          const roundIndex = Math.min(card.round, BASE_INTERVALS.length - 1);
          const baseInterval = BASE_INTERVALS[roundIndex];
          const multiplier = MULTIPLIERS[Math.min(card.consecutiveCorrect - 1, MULTIPLIERS.length - 1)];
          let interval = Math.round(baseInterval * multiplier);
          if (interval > 60 * DAY_MS) interval = 60 * DAY_MS;  // 上限60天
          
          card.nextReview = now + interval;
          card.round = Math.min(card.round + 1, BASE_INTERVALS.length);
        }
      } else if (isCorrect && !isIndependent) {
        // 提示后答对：不算通过，连续次数归零
        card.consecutiveCorrect = 0;
        card.round = 0;
        card.nextReview = now + BASE_INTERVALS[0];  // 回到第1轮
        card.dormant = false;
      } else {
        // 答错：连续次数归零，间隔回到第1轮
        card.consecutiveCorrect = 0;
        card.round = 0;
        card.nextReview = now + BASE_INTERVALS[0];
        card.dormant = false;
        
        // 记录错题
        this.errorLog.push({
          topicId,
          questionId: questionInfo ? questionInfo.questionId : null,
          question: questionInfo ? questionInfo.question : null,
          options: questionInfo ? questionInfo.options : null,
          answer: questionInfo ? questionInfo.answer : null,
          selected: questionInfo ? questionInfo.selected : null,
          confidence: confidence,
          timestamp: now
        });
      }

      card.lastReview = now;
      this.save();
    }

    /**
     * 获取今日待复习的知识点ID列表
     */
    getDueToday() {
      const now = Date.now();
      const due = [];
      for (const topicId in this.cards) {
        const card = this.cards[topicId];
        if (card.dormant) {
          // 休眠卡片：60天后抽检
          if (card.nextReview && card.nextReview <= now) {
            due.push(topicId);
          }
        } else {
          if (card.nextReview && card.nextReview <= now) {
            due.push(topicId);
          }
        }
      }
      return due;
    }

    /**
     * 获取错题列表
     */
    getErrors() {
      return this.errorLog;
    }

    /**
     * 给最近一道错题补标错因与「当时怎么想的」
     * reason: careless(粗心) / unknown(没掌握) / unsolved(不会做)
     */
    updateLastError(reason, note) {
      if (this.errorLog.length === 0) return null;
      const last = this.errorLog[this.errorLog.length - 1];
      if (reason) last.reason = reason;
      if (note !== undefined && note !== null) last.note = note;
      this.save();
      return last;
    }

    /**
     * 给指定知识点的最近一道错题补标错因（结果页薄弱项使用）
     */
    updateLastErrorByTopic(topicId, reason, note) {
      for (let i = this.errorLog.length - 1; i >= 0; i--) {
        if (this.errorLog[i].topicId === topicId) {
          if (reason) this.errorLog[i].reason = reason;
          if (note !== undefined && note !== null) this.errorLog[i].note = note;
          this.save();
          return this.errorLog[i];
        }
      }
      return null;
    }

    /**
     * 获取错题统计
     */
    getErrorStats() {
      const byTopic = {};
      for (const err of this.errorLog) {
        if (!byTopic[err.topicId]) {
          byTopic[err.topicId] = { count: 0, lastError: err.timestamp };
        }
        byTopic[err.topicId].count++;
        if (err.timestamp > byTopic[err.topicId].lastError) {
          byTopic[err.topicId].lastError = err.timestamp;
        }
      }
      return byTopic;
    }

    /**
     * 计算信心校准偏差
     * 校准偏差 = 平均信心 - 实际正确率
     * 正值表示高估自己，负值表示低估自己
     */
    getCalibrationBias() {
      if (this.reviewLog.length === 0) return null;
      
      let totalConfidence = 0;
      let totalCorrect = 0;
      let count = 0;
      
      for (const log of this.reviewLog) {
        if (log.confidence !== null && log.confidence !== undefined) {
          totalConfidence += log.confidence;
          totalCorrect += log.isCorrect ? 1 : 0;
          count++;
        }
      }
      
      if (count === 0) return null;
      
      const avgConfidence = totalConfidence / count;
      const actualAccuracy = (totalCorrect / count) * 100;
      
      return {
        avgConfidence: Math.round(avgConfidence),
        actualAccuracy: Math.round(actualAccuracy),
        bias: Math.round(avgConfidence - actualAccuracy),
        sampleSize: count
      };
    }

    /**
     * 计算独立答对率
     */
    getIndependentAccuracy() {
      if (this.reviewLog.length === 0) return null;
      
      let independentCount = 0;
      let independentCorrect = 0;
      
      for (const log of this.reviewLog) {
        if (log.isIndependent) {
          independentCount++;
          if (log.isCorrect) independentCorrect++;
        }
      }
      
      if (independentCount === 0) return null;
      
      return {
        independentCount,
        independentCorrect,
        rate: Math.round((independentCorrect / independentCount) * 100)
      };
    }

    /**
     * 计算同类错误复发率（30天内）
     */
    getRecurrenceRate() {
      if (this.errorLog.length === 0) return null;
      
      const now = Date.now();
      const windowMs = 30 * DAY_MS;
      
      // 按知识点分组
      const byTopic = {};
      for (const err of this.errorLog) {
        if (!byTopic[err.topicId]) byTopic[err.topicId] = [];
        byTopic[err.topicId].push(err.timestamp);
      }
      
      let recurrentTopics = 0;
      let totalTopics = 0;
      
      for (const topicId in byTopic) {
        const timestamps = byTopic[topicId].sort((a, b) => a - b);
        if (timestamps.length >= 2) {
          totalTopics++;
          // 检查30天内是否有多次错误
          for (let i = 1; i < timestamps.length; i++) {
            if (timestamps[i] - timestamps[i-1] < windowMs) {
              recurrentTopics++;
              break;
            }
          }
        }
      }
      
      if (totalTopics === 0) return null;
      
      return {
        recurrentTopics,
        totalTopics,
        rate: Math.round((recurrentTopics / totalTopics) * 100)
      };
    }

    /**
     * 获取每周战报
     */
    getWeeklyReport() {
      const now = Date.now();
      const weekAgo = now - 7 * DAY_MS;
      
      const weekLogs = this.reviewLog.filter(l => l.timestamp >= weekAgo);
      
      const calibration = this.getCalibrationBias();
      const independent = this.getIndependentAccuracy();
      const recurrence = this.getRecurrenceRate();
      
      return {
        period: '本周',
        totalReviews: weekLogs.length,
        calibration,
        independentAccuracy: independent,
        recurrenceRate: recurrence,
        errorCount: this.errorLog.filter(e => e.timestamp >= weekAgo).length,
        generatedAt: new Date().toISOString()
      };
    }

    /**
     * 获取卡片状态
     */
    getStatus(topicId) {
      const card = this.cards[topicId];
      if (!card) return null;
      
      const now = Date.now();
      return {
        round: card.round,
        consecutiveCorrect: card.consecutiveCorrect,
        dormant: card.dormant,
        nextReview: card.nextReview,
        isDue: card.nextReview ? card.nextReview <= now : false,
        daysUntil: card.nextReview ? Math.ceil((card.nextReview - now) / DAY_MS) : null,
        totalReviews: card.totalReviews,
        totalCorrect: card.totalCorrect
      };
    }

    /**
     * 获取所有卡片概览
     */
    getOverview() {
      const now = Date.now();
      let due = 0, total = 0, dormant = 0, mastered = 0;
      for (const topicId in this.cards) {
        total++;
        const card = this.cards[topicId];
        if (card.nextReview && card.nextReview <= now) due++;
        if (card.dormant) dormant++;
        if (card.consecutiveCorrect >= 3) mastered++;
      }
      return { total, due, dormant, mastered };
    }

    /**
     * 导出数据
     */
    export() {
      return {
        cards: this.cards,
        errorLog: this.errorLog,
        reviewLog: this.reviewLog,
        exportedAt: new Date().toISOString()
      };
    }

    /**
     * 导入数据
     */
    import(data) {
      if (data.cards) this.cards = data.cards;
      if (data.errorLog) this.errorLog = data.errorLog;
      if (data.reviewLog) this.reviewLog = data.reviewLog;
      this.save();
    }

    /**
     * 清空所有数据
     */
    clear() {
      this.cards = {};
      this.errorLog = [];
      this.reviewLog = [];
      this.save();
    }
  }

  // 注册到全局
  window.CNPT = window.CNPT || {};
  window.CNPT.FsrsEngine = FsrsEngine;
})();
