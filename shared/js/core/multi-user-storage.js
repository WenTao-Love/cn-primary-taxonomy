/*!
 * CN-Primary-Taxonomy · 多用户存储引擎
 * 支持培训机构/学校等场景下的多学生管理
 * 在原有storage基础上增加studentId维度
 */
(function() {
  'use strict';

  /**
   * 多用户存储管理器
   * 每个学生的数据独立隔离，支持学生档案的增删改查
   */
  class MultiUserStorage {
    /**
     * @param {string} role - 角色类型: parent/student/teacher/institution
     * @param {Object} [options] - 配置选项
     * @param {string} [options.prefix] - localStorage键前缀
     */
    constructor(role, options = {}) {
      this.role = role;
      this.prefix = options.prefix || `cnpt-${role}`;
      this.currentStudentId = null;

      // 学生元数据键（所有学生共享）
      this.studentsKey = `${this.prefix}-students`;
    }

    // ==================== 学生档案管理 ====================

    /**
     * 获取所有学生列表
     * @returns {Array} 学生档案数组 {id, name, grade, subject, createdAt, updatedAt}
     */
    getStudents() {
      try {
        const data = localStorage.getItem(this.studentsKey);
        return data ? JSON.parse(data) : [];
      } catch (e) {
        return [];
      }
    }

    /**
     * 添加学生
     * @param {Object} profile - 学生档案 {name, grade, subject?}
     * @returns {string} 学生ID
     */
    addStudent(profile) {
      const students = this.getStudents();
      const id = 's_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const student = {
        id,
        name: profile.name || '未命名',
        grade: profile.grade || '',
        subject: profile.subject || '',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      students.push(student);
      this._saveStudents(students);
      return id;
    }

    /**
     * 更新学生档案
     * @param {string} studentId - 学生ID
     * @param {Object} updates - 更新的字段
     */
    updateStudent(studentId, updates) {
      const students = this.getStudents();
      const idx = students.findIndex(s => s.id === studentId);
      if (idx >= 0) {
        Object.assign(students[idx], updates, { updatedAt: Date.now() });
        this._saveStudents(students);
      }
    }

    /**
     * 删除学生及其所有学习数据
     * @param {string} studentId - 学生ID
     */
    removeStudent(studentId) {
      const students = this.getStudents().filter(s => s.id !== studentId);
      this._saveStudents(students);

      // 清除该学生的学习数据
      const keysToRemove = [
        `${this.prefix}-${studentId}-mastery`,
        `${this.prefix}-${studentId}-wrong-book`,
        `${this.prefix}-${studentId}-stars`,
        `${this.prefix}-${studentId}-days`
      ];
      keysToRemove.forEach(k => localStorage.removeItem(k));

      if (this.currentStudentId === studentId) {
        this.currentStudentId = null;
      }
    }

    /**
     * 切换当前学生活动
     * @param {string} studentId - 学生ID
     */
    setCurrentStudent(studentId) {
      this.currentStudentId = studentId;
    }

    /**
     * 获取当前学生ID
     * @returns {string|null}
     */
    getCurrentStudent() {
      return this.currentStudentId;
    }

    // ==================== 学习数据操作 ====================

    /**
     * 获取指定学生的localStorage键
     * @param {string} dataType - 数据类型: mastery/wrong-book/stars/days
     * @param {string} [studentId] - 学生ID，默认使用currentStudentId
     * @returns {string} 完整的localStorage键
     */
    _getKey(dataType, studentId) {
      const sid = studentId || this.currentStudentId;
      return sid ? `${this.prefix}-${sid}-${dataType}` : `${this.prefix}-${dataType}`;
    }

    /**
     * 获取知识点掌握状态
     * @param {string} topicId - 知识点ID
     * @param {string} [studentId] - 学生ID
     * @returns {string} mastered/learning/not-started
     */
    getTopicStatus(topicId, studentId) {
      try {
        const data = localStorage.getItem(this._getKey('mastery', studentId));
        const mastery = data ? JSON.parse(data) : {};
        return mastery[topicId] || 'not-started';
      } catch (e) {
        return 'not-started';
      }
    }

    /**
     * 设置知识点掌握状态
     * @param {string} topicId - 知识点ID
     * @param {string} status - mastered/learning/not-started
     * @param {string} [studentId] - 学生ID
     */
    setTopicStatus(topicId, status, studentId) {
      try {
        const key = this._getKey('mastery', studentId);
        const data = localStorage.getItem(key);
        const mastery = data ? JSON.parse(data) : {};
        mastery[topicId] = status;
        localStorage.setItem(key, JSON.stringify(mastery));
        this._touchStudent(studentId);
      } catch (e) {
        // quota exceeded or other storage error
      }
    }

    /**
     * 批量获取掌握状态
     * @param {string[]} topicIds - 知识点ID数组
     * @param {string} [studentId] - 学生ID
     * @returns {Object} {topicId: status}
     */
    batchGetStatus(topicIds, studentId) {
      try {
        const data = localStorage.getItem(this._getKey('mastery', studentId));
        const mastery = data ? JSON.parse(data) : {};
        const result = {};
        topicIds.forEach(id => { result[id] = mastery[id] || 'not-started'; });
        return result;
      } catch (e) {
        return {};
      }
    }

    /**
     * 获取掌握度统计
     * @param {string} [studentId] - 学生ID
     * @returns {Object} {mastered, learning, not-started, total}
     */
    getStats(studentId) {
      try {
        const data = localStorage.getItem(this._getKey('mastery', studentId));
        const mastery = data ? JSON.parse(data) : {};
        const stats = { mastered: 0, learning: 0, 'not-started': 0, total: 0 };
        Object.values(mastery).forEach(s => {
          stats[s] = (stats[s] || 0) + 1;
          stats.total++;
        });
        return stats;
      } catch (e) {
        return { mastered: 0, learning: 0, 'not-started': 0, total: 0 };
      }
    }

    /**
     * 获取错题本
     * @param {string} [studentId] - 学生ID
     * @returns {Array}
     */
    getWrongBook(studentId) {
      try {
        const data = localStorage.getItem(this._getKey('wrong-book', studentId));
        return data ? JSON.parse(data) : [];
      } catch (e) {
        return [];
      }
    }

    /**
     * 添加错题记录
     * @param {Object} record - {topicId, question, userAnswer, correctAnswer}
     * @param {string} [studentId] - 学生ID
     */
    addWrongItem(record, studentId) {
      try {
        const key = this._getKey('wrong-book', studentId);
        const data = localStorage.getItem(key);
        const book = data ? JSON.parse(data) : [];
        book.unshift({
          ...record,
          timestamp: Date.now(),
          id: 'w_' + Date.now().toString(36)
        });
        // 保留最多200条
        if (book.length > 200) book.length = 200;
        localStorage.setItem(key, JSON.stringify(book));
        this._touchStudent(studentId);
      } catch (e) {
        // ignore
      }
    }

    /**
     * 获取星星数
     * @param {string} [studentId] - 学生ID
     * @returns {number}
     */
    getStars(studentId) {
      try {
        const data = localStorage.getItem(this._getKey('stars', studentId));
        return data ? parseInt(data, 10) : 0;
      } catch (e) {
        return 0;
      }
    }

    /**
     * 增加星星
     * @param {number} count - 增加数量
     * @param {string} [studentId] - 学生ID
     */
    addStars(count, studentId) {
      try {
        const key = this._getKey('stars', studentId);
        const current = this.getStars(studentId);
        localStorage.setItem(key, String(current + count));
        this._touchStudent(studentId);
      } catch (e) {
        // ignore
      }
    }

    /**
     * 获取学习天数
     * @param {string} [studentId] - 学生ID
     * @returns {number}
     */
    getDays(studentId) {
      try {
        const data = localStorage.getItem(this._getKey('days', studentId));
        return data ? parseInt(data, 10) : 0;
      } catch (e) {
        return 0;
      }
    }

    /**
     * 更新连续学习天数
     * @param {string} [studentId] - 学生ID
     */
    updateConsecutiveDays(studentId) {
      try {
        const key = this._getKey('days', studentId);
        const today = new Date().toDateString();
        const lastKey = this._getKey('last-day', studentId);

        const lastDay = localStorage.getItem(lastKey);
        if (lastDay === today) return;

        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const currentDays = this.getDays(studentId);

        if (lastDay === yesterday) {
          localStorage.setItem(key, String(currentDays + 1));
        } else if (lastDay !== today) {
          localStorage.setItem(key, '1');
        }
        localStorage.setItem(lastKey, today);
      } catch (e) {
        // ignore
      }
    }

    /**
     * 获取班级掌握度对比数据
     * @returns {Array} 每个学生的统计
     */
    getClassComparison() {
      const students = this.getStudents();
      return students.map(s => ({
        id: s.id,
        name: s.name,
        grade: s.grade,
        ...this.getStats(s.id),
        stars: this.getStars(s.id),
        days: this.getDays(s.id)
      }));
    }

    /**
     * 清除指定学生所有数据
     * @param {string} [studentId] - 学生ID
     */
    resetStudent(studentId) {
      const keys = ['mastery', 'wrong-book', 'stars', 'days', 'last-day'];
      keys.forEach(k => localStorage.removeItem(this._getKey(k, studentId)));
    }

    /**
     * 导出学生数据（JSON字符串）
     * @param {string} studentId - 学生ID
     * @returns {string} JSON
     */
    exportStudentData(studentId) {
      return JSON.stringify({
        student: this.getStudents().find(s => s.id === studentId),
        mastery: this.batchGetStatus(
          Object.keys(JSON.parse(localStorage.getItem(this._getKey('mastery', studentId)) || '{}')),
          studentId
        ),
        wrongBook: this.getWrongBook(studentId),
        stars: this.getStars(studentId),
        days: this.getDays(studentId),
        exportedAt: Date.now()
      }, null, 2);
    }

    // ==================== 内部方法 ====================

    _saveStudents(students) {
      try {
        localStorage.setItem(this.studentsKey, JSON.stringify(students));
      } catch (e) {
        // ignore
      }
    }

    _touchStudent(studentId) {
      const sid = studentId || this.currentStudentId;
      if (!sid) return;
      const students = this.getStudents();
      const idx = students.findIndex(s => s.id === sid);
      if (idx >= 0) {
        students[idx].updatedAt = Date.now();
        this._saveStudents(students);
      }
    }
  }

  // 注册到CNPT命名空间
  window.CNPT = window.CNPT || {};
  window.CNPT.MultiUserStorage = MultiUserStorage;

})();
