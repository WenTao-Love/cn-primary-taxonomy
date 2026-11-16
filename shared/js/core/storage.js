/*!
 * CN-Primary-Taxonomy · 分角色存储管理
 * 为家长、学生、教师提供隔离的localStorage空间
 */
(function() {
  'use strict';

  window.CNPT = window.CNPT || {};

  /**
   * 存储管理器
   * @param {string} role - 角色标识 (parent/student/teacher)
   */
  function StorageManager(role) {
    this.role = role;
    const keys = window.CNPT.constants.STORAGE_KEYS[role] || window.CNPT.constants.STORAGE_KEYS.parent;
    this.keys = keys;
  }

  /**
   * 安全读取JSON
   */
  StorageManager.prototype._read = function(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || '{}');
    } catch (e) {
      return {};
    }
  };

  /**
   * 安全写入JSON
   */
  StorageManager.prototype._write = function(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      return false;
    }
  };

  // === 掌握状态 ===

  StorageManager.prototype.getMastery = function() {
    return this._read(this.keys.mastery);
  };

  StorageManager.prototype.setMastery = function(data) {
    return this._write(this.keys.mastery, data);
  };

  StorageManager.prototype.getTopicStatus = function(topicId) {
    const mastery = this.getMastery();
    return mastery[topicId] || 'not-started';
  };

  StorageManager.prototype.setTopicStatus = function(topicId, status) {
    const mastery = this.getMastery();
    if (status === 'not-started') {
      delete mastery[topicId];
    } else {
      mastery[topicId] = status;
    }
    return this.setMastery(mastery);
  };

  // === 错题本 ===

  StorageManager.prototype.getWrongBook = function() {
    try {
      return JSON.parse(localStorage.getItem(this.keys.wrongBook) || '[]');
    } catch (e) {
      return [];
    }
  };

  StorageManager.prototype.addWrongItem = function(item) {
    const book = this.getWrongBook();
    book.unshift(item);
    if (book.length > 200) book.length = 200;
    return this._write(this.keys.wrongBook, book);
  };

  StorageManager.prototype.clearWrongBook = function() {
    return this._write(this.keys.wrongBook, []);
  };

  // === FSRS 间隔复习 ===

  /**
   * 读取 FSRS 引擎状态（卡片/复习日志/错题日志/首做记录/每日计时）
   * 返回 {} 表示尚未产生任何复习数据
   */
  StorageManager.prototype.getFsrsState = function() {
    return this._read(this.keys.fsrs);
  };

  /**
   * 写回 FSRS 引擎状态
   */
  StorageManager.prototype.setFsrsState = function(state) {
    return this._write(this.keys.fsrs, state || {});
  };

  // === 低级失误台账（与知识性错题分离，借鉴《AI 自学数学账本》） ===

  /**
   * 追加一条低级失误记录
   * @param {object} item - { topicId, type, detail, timestamp }
   * type ∈ { 抄写错误, 口算错误, 单位遗漏, 符号遗漏, 漏题, 格式不规范 }
   */
  StorageManager.prototype.addLowLevelMistake = function(item) {
    const list = this.getLowLevelMistakes();
    list.unshift(Object.assign({ timestamp: Date.now() }, item));
    if (list.length > 200) list.length = 200;
    return this._write(this.keys.mistakeLedger, list);
  };

  StorageManager.prototype.getLowLevelMistakes = function() {
    try {
      return JSON.parse(localStorage.getItem(this.keys.mistakeLedger) || '[]');
    } catch (e) {
      return [];
    }
  };

  StorageManager.prototype.clearLowLevelMistakes = function() {
    return this._write(this.keys.mistakeLedger, []);
  };

  // === 每日学习日志（用于 75 分钟预算与"先复习后新学"排课） ===

  StorageManager.prototype.getDailyLog = function() {
    try {
      return JSON.parse(localStorage.getItem(this.keys.dailyLog) || '{}');
    } catch (e) {
      return {};
    }
  };

  /**
   * 记录某日学习时长（秒）
   * @param {string} dateKey - YYYY-MM-DD
   * @param {number} seconds - 本次新增时长
   * @param {string} [kind] - 'review' | 'new'
   */
  StorageManager.prototype.addDailySeconds = function(dateKey, seconds, kind) {
    if (!dateKey || !seconds) return this.getDailyLog();
    const log = this.getDailyLog();
    if (!log[dateKey]) log[dateKey] = { reviewSeconds: 0, newSeconds: 0, updatedAt: Date.now() };
    if (kind === 'new') log[dateKey].newSeconds += seconds;
    else log[dateKey].reviewSeconds += seconds;
    log[dateKey].updatedAt = Date.now();
    this._write(this.keys.dailyLog, log);
    return log[dateKey];
  };

  StorageManager.prototype.getTodaySeconds = function() {
    const key = window.CNPT.utils.localDateKey();
    const log = this.getDailyLog()[key];
    if (!log) return { reviewSeconds: 0, newSeconds: 0, totalSeconds: 0 };
    return {
      reviewSeconds: log.reviewSeconds || 0,
      newSeconds: log.newSeconds || 0,
      totalSeconds: (log.reviewSeconds || 0) + (log.newSeconds || 0)
    };
  };

  // === 诊断闭环（错题两步闭环 / 次日盲测 / 预检跳课） ===

  StorageManager.prototype.getDiagnosticState = function() {
    return this._read(this.keys.diagnostic);
  };

  StorageManager.prototype.setDiagnosticState = function(state) {
    return this._write(this.keys.diagnostic, state || {});
  };

  // === 统计 ===

  StorageManager.prototype.getStats = function() {
    const mastery = this.getMastery();
    const wrongBook = this.getWrongBook();
    const statuses = Object.values(mastery);
    return {
      mastered: statuses.filter(v => v === 'mastered').length,
      learning: statuses.filter(v => v === 'learning').length,
      wrongCount: wrongBook.length
    };
  };

  // === 学生专属：星星 ===

  StorageManager.prototype.getStars = function() {
    if (this.role !== 'student') return 0;
    try {
      return parseInt(localStorage.getItem(window.CNPT.constants.STORAGE_KEYS.student.stars) || '0');
    } catch (e) { return 0; }
  };

  StorageManager.prototype.addStar = function() {
    if (this.role !== 'student') return 0;
    const stars = this.getStars() + 1;
    localStorage.setItem(window.CNPT.constants.STORAGE_KEYS.student.stars, stars.toString());
    return stars;
  };

  // === 通用：学习天数 ===

  StorageManager.prototype.updateConsecutiveDays = function() {
    const today = new Date().toDateString();
    const lastKey = this.keys.lastVisit;
    const daysKey = this.keys.days;
    let days = parseInt(localStorage.getItem(daysKey) || '0');
    const lastVisit = localStorage.getItem(lastKey);

    if (lastVisit !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (lastVisit === yesterday) {
        days++;
      } else {
        days = 1;
      }
      localStorage.setItem(lastKey, today);
      localStorage.setItem(daysKey, days.toString());
    }

    return days;
  };

  StorageManager.prototype.getConsecutiveDays = function() {
    return parseInt(localStorage.getItem(this.keys.days) || '0');
  };

  // === 全部重置 ===

  StorageManager.prototype.resetAll = function() {
    Object.values(this.keys).forEach(key => {
      if (!key) return;
      localStorage.removeItem(key);
    });
    if (this.role === 'student') {
      localStorage.removeItem(window.CNPT.constants.STORAGE_KEYS.student.stars);
    }
  };

  /**
   * 创建指定角色的存储管理器
   */
  function create(role) {
    return new StorageManager(role);
  }

  window.CNPT.storage = {
    StorageManager,
    create
  };
})();
