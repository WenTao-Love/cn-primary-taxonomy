/**
 * FSRS 间隔复习引擎（简化版，借鉴 Word Atlas / Anki ts-fsrs 思想）
 * 
 * 核心思想：
 * - 每个知识点有"记忆稳定性"S（天），表示记忆能保持的时间
 * - 答对：S 增长（×2.5）；答错：S 衰减（×0.5）
 * - 下次复习时间 = 最后复习时间 + S 天
 * - 每日打开应用时，提示"今日待复习"的知识点
 * 
 * 数据只保存在 localStorage，不上传任何服务器
 */
(function() {
  'use strict';

  const STORAGE_KEY = 'cnpt_fsrs_v1';
  const DAY_MS = 24 * 3600 * 1000;

  class FsrsEngine {
    constructor() {
      this.stability = {};   // topicId -> 稳定性（天）
      this.lastReview = {};  // topicId -> 最后复习时间戳
      this.nextReview = {};  // topicId -> 下次复习时间戳
      this.reviewCount = {}; // topicId -> 复习次数
      this.load();
    }

    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const d = JSON.parse(raw);
          this.stability = d.stability || {};
          this.lastReview = d.lastReview || {};
          this.nextReview = d.nextReview || {};
          this.reviewCount = d.reviewCount || {};
        }
      } catch (e) {
        console.error('FSRS load error:', e);
      }
    }

    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          stability: this.stability,
          lastReview: this.lastReview,
          nextReview: this.nextReview,
          reviewCount: this.reviewCount
        }));
      } catch (e) {
        console.error('FSRS save error:', e);
      }
    }

    /**
     * 记录一次复习结果
     * @param {string} topicId - 知识点ID
     * @param {boolean} isCorrect - 是否答对
     */
    record(topicId, isCorrect) {
      const now = Date.now();
      let s = this.stability[topicId] || 1;

      if (isCorrect) {
        // 答对：稳定性增长，首次答对增长更快
        s = s * 2.5;
        if (s < 1) s = 1;
        if (s > 365) s = 365; // 上限一年
      } else {
        // 答错：稳定性衰减
        s = s * 0.5;
        if (s < 0.5) s = 0.5; // 下限半天
      }

      this.stability[topicId] = s;
      this.lastReview[topicId] = now;
      this.nextReview[topicId] = now + Math.round(s * DAY_MS);
      this.reviewCount[topicId] = (this.reviewCount[topicId] || 0) + 1;
      this.save();
    }

    /**
     * 批量记录诊断结果
     * @param {Object} results - { topicId: 'weak'|'unstable'|'mastered'|'untested' }
     */
    recordBatch(results) {
      const now = Date.now();
      for (const topicId in results) {
        const status = results[topicId];
        if (status === 'mastered') {
          this.record(topicId, true);
        } else if (status === 'weak' || status === 'unstable') {
          this.record(topicId, false);
        }
        // untested 不记录
      }
    }

    /**
     * 获取今日待复习的知识点ID列表
     */
    getDueToday() {
      const now = Date.now();
      const due = [];
      for (const topicId in this.nextReview) {
        if (this.nextReview[topicId] <= now) {
          due.push(topicId);
        }
      }
      return due;
    }

    /**
     * 获取知识点状态
     */
    getStatus(topicId) {
      const s = this.stability[topicId];
      const next = this.nextReview[topicId];
      if (!s || !next) return null;
      const now = Date.now();
      return {
        stability: s,
        nextReview: next,
        isDue: next <= now,
        daysUntil: Math.ceil((next - now) / DAY_MS)
      };
    }

    /**
     * 获取所有已记录的知识点的复习概览
     */
    getOverview() {
      const now = Date.now();
      let due = 0, total = 0, mastered = 0;
      for (const topicId in this.stability) {
        total++;
        if (this.nextReview[topicId] <= now) due++;
        if (this.stability[topicId] >= 7) mastered++;
      }
      return { total, due, mastered };
    }

    /**
     * 导出数据
     */
    export() {
      return {
        stability: this.stability,
        lastReview: this.lastReview,
        nextReview: this.nextReview,
        reviewCount: this.reviewCount,
        exportedAt: new Date().toISOString()
      };
    }

    /**
     * 导入数据
     */
    import(data) {
      if (data.stability) this.stability = data.stability;
      if (data.lastReview) this.lastReview = data.lastReview;
      if (data.nextReview) this.nextReview = data.nextReview;
      if (data.reviewCount) this.reviewCount = data.reviewCount;
      this.save();
    }

    /**
     * 清空所有数据
     */
    clear() {
      this.stability = {};
      this.lastReview = {};
      this.nextReview = {};
      this.reviewCount = {};
      this.save();
    }
  }

  // 注册到全局
  window.CNPT = window.CNPT || {};
  window.CNPT.FsrsEngine = FsrsEngine;
})();
