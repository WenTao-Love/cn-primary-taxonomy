/*!
 * CN-Primary-Taxonomy · 诊断测评引擎
 * 为培训机构/辅导班提供入学诊断能力
 * 输入薄弱知识点，反推前置知识缺失
 */
(function() {
  'use strict';

  /**
   * 诊断测评引擎
   */
  class DiagnosticEngine {
    /**
     * @param {Object} fullData - 完整数据 {topics, deps, clusters}
     * @param {Object} indices - 由CNPT.indices.buildIndices构建的索引
     */
    constructor(fullData, indices) {
      this.data = fullData;
      this.indices = indices;
      this.topicMap = indices.topicMap || new Map();
    }

    /**
     * 执行诊断分析
     * @param {Object} params - 诊断参数
     * @param {string} [params.targetTopicId] - 目标知识点ID
     * @param {string} [params.subject] - 诊断学科
     * @param {number} [params.grade] - 诊断年级
     * @param {string[]} [params.knownMastered] - 已掌握的知识点ID列表
     * @returns {Object} 诊断报告
     */
    diagnose(params = {}) {
      const { targetTopicId, subject, grade, knownMastered = [] } = params;

      const report = {
        timestamp: Date.now(),
        target: null,
        masteredCount: knownMastered.length,
        gaps: [],
        recommendations: [],
        estimatedHours: 0,
        difficulty: 'medium'
      };

      // 场景1：基于目标知识点的诊断
      if (targetTopicId) {
        return this._diagnoseByTarget(targetTopicId, knownMastered, report);
      }

      // 场景2：基于学科/年级的广泛诊断
      if (subject && grade) {
        return this._diagnoseBySubject(subject, grade, knownMastered, report);
      }

      return report;
    }

    /**
     * 基于目标知识点的诊断
     */
    _diagnoseByTarget(targetTopicId, knownMastered, report) {
      const target = this.topicMap.get(targetTopicId);
      if (!target) {
        report.error = '未找到目标知识点';
        return report;
      }

      report.target = {
        id: target.id,
        name: target.name,
        subject: target.subject,
        grade: target.grade,
        difficulty: target.difficulty
      };

      // 获取所有前置依赖（递归）
      const allPrereqs = this._getAllPrerequisites(targetTopicId);
      const masteredSet = new Set(knownMastered);

      // 筛选未掌握的前置知识
      allPrereqs.forEach(prereqId => {
        if (!masteredSet.has(prereqId)) {
          const topic = this.topicMap.get(prereqId);
          if (topic) {
            report.gaps.push({
              id: topic.id,
              name: topic.name,
              subject: topic.subject,
              grade: topic.grade,
              difficulty: topic.difficulty,
              isDirect: this._isDirectPrereq(prereqId, targetTopicId)
            });
          }
        }
      });

      // 生成学习建议
      report.recommendations = this._generateRecommendations(report.gaps);
      report.estimatedHours = this._estimateLearningHours(report.gaps);
      report.difficulty = this._assessDifficulty(report.gaps);

      return report;
    }

    /**
     * 基于学科/年级的广泛诊断
     */
    _diagnoseBySubject(subject, grade, knownMastered, report) {
      const topics = this.data.topics.topics.filter(
        t => t.subject === subject && t.grade === grade
      );

      const masteredSet = new Set(knownMastered);
      const unmastered = topics.filter(t => !masteredSet.has(t.id));

      // 找出前置知识缺失的知识点
      unmastered.forEach(topic => {
        const directPrereqs = this._getDirectPrerequisites(topic.id);
        const missingPrereqs = directPrereqs.filter(p => !masteredSet.has(p));
        if (missingPrereqs.length > 0) {
          report.gaps.push({
            id: topic.id,
            name: topic.name,
            subject: topic.subject,
            grade: topic.grade,
            difficulty: topic.difficulty,
            missingPrereqs: missingPrereqs.length,
            isDirect: false
          });
        }
      });

      // 按缺失前置数量排序
      report.gaps.sort((a, b) => (b.missingPrereqs || 0) - (a.missingPrereqs || 0));

      report.target = { subject, grade, totalTopics: topics.length };
      report.recommendations = this._generateRecommendations(report.gaps.slice(0, 10));
      report.estimatedHours = this._estimateLearningHours(report.gaps.slice(0, 10));
      report.difficulty = this._assessDifficulty(report.gaps.slice(0, 10));

      return report;
    }

    /**
     * 获取所有前置依赖（递归）
     */
    _getAllPrerequisites(topicId, visited = new Set()) {
      if (visited.has(topicId)) return [];
      visited.add(topicId);

      const direct = this._getDirectPrerequisites(topicId);
      let all = [...direct];

      direct.forEach(prereqId => {
        const subPrereqs = this._getAllPrerequisites(prereqId, visited);
        subPrereqs.forEach(sp => {
          if (!all.includes(sp)) all.push(sp);
        });
      });

      return all;
    }

    /**
     * 获取直接前置依赖
     */
    _getDirectPrerequisites(topicId) {
      const deps = this.data.deps.dependencies.filter(d => d.topicId === topicId);
      return deps.map(d => d.prerequisiteId);
    }

    /**
     * 检查是否为直接前置
     */
    _isDirectPrereq(prereqId, topicId) {
      return this.data.deps.dependencies.some(
        d => d.topicId === topicId && d.prerequisiteId === prereqId
      );
    }

    /**
     * 生成学习建议
     */
    _generateRecommendations(gaps) {
      if (gaps.length === 0) return ['基础知识扎实，可直接进入目标内容学习'];

      const recs = [];
      const bySubject = {};

      gaps.forEach(g => {
        bySubject[g.subject] = (bySubject[g.subject] || 0) + 1;
      });

      // 按缺失最多的学科优先
      const sorted = Object.entries(bySubject).sort((a, b) => b[1] - a[1]);

      if (sorted.length > 0) {
        recs.push(`优先补强${sorted[0][0]}（缺失${sorted[0][1]}个前置知识点）`);
      }
      if (sorted.length > 1) {
        recs.push(`其次补强${sorted[1][0]}（缺失${sorted[1][1]}个前置知识点）`);
      }

      // 如果缺失较少
      if (gaps.length <= 3) {
        recs.push(`缺失知识点较少，预计1-2课时可补齐`);
      } else if (gaps.length <= 10) {
        recs.push(`缺失知识点中等，建议安排3-5课时集中补强`);
      } else {
        recs.push(`缺失知识点较多(${gaps.length}个)，建议制定系统学习计划`);
      }

      return recs;
    }

    /**
     * 估算学习时长
     */
    _estimateLearningHours(gaps) {
      return gaps.reduce((sum, g) => {
        const difficultyHours = { 1: 0.5, 2: 1, 3: 1.5, 4: 2, 5: 3 };
        return sum + (difficultyHours[g.difficulty] || 1);
      }, 0);
    }

    /**
     * 评估整体难度
     */
    _assessDifficulty(gaps) {
      if (gaps.length === 0) return 'easy';
      const avgDiff = gaps.reduce((sum, g) => sum + (g.difficulty || 3), 0) / gaps.length;
      if (avgDiff <= 2) return 'easy';
      if (avgDiff <= 3.5) return 'medium';
      return 'hard';
    }

    /**
     * 生成快速诊断问卷配置
     * @param {string} subject - 学科
     * @param {number} grade - 年级
     * @param {number} [count=10] - 题目数量
     * @returns {Object[]} 问卷题目配置
     */
    generateQuickAssessment(subject, grade, count = 10) {
      const topics = this.data.topics.topics.filter(
        t => t.subject === subject && t.grade === grade && t.commonMistakes && t.commonMistakes.length > 0
      );

      // 随机取样
      const shuffled = topics.sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(count, shuffled.length));

      return selected.map((t, idx) => ({
        index: idx,
        topicId: t.id,
        topicName: t.name,
        difficulty: t.difficulty,
        question: t.commonMistakes[0] || t.description || `关于"${t.name}"的理解`,
        type: 'choice',
        options: this._generateOptions(t),
        correctAnswer: 0
      }));
    }

    /**
     * 生成选项
     */
    _generateOptions(topic) {
      // 简化的选项生成：基于evidence和commonMistakes
      const correct = topic.evidence || topic.description || '正确理解';
      const mistakes = topic.commonMistakes || [];

      const options = [correct];
      mistakes.slice(0, 3).forEach(m => {
        if (options.length < 4) options.push(m);
      });
      // 不足4个时填充占位
      while (options.length < 4) options.push(`选项${options.length + 1}`);

      return options.sort(() => Math.random() - 0.5);
    }
  }

  // 注册到CNPT命名空间
  window.CNPT = window.CNPT || {};
  window.CNPT.DiagnosticEngine = DiagnosticEngine;

})();
