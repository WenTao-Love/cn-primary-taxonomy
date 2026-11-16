/*!
 * CN-Primary-Taxonomy · 共享组件：诊断闭环（错题两步闭环 / 次日盲测 / 预检跳课）
 *
 * 借鉴《AI 自学数学账本》与《cn-math-taxonomy》：
 *   1. 错题两步闭环：答错 → 当天重测（第 1 步）→ 次日盲测（第 2 步），两步都过才算闭环
 *   2. 次日盲测：重测通过后进入次日队列，第二天以"盲测"形式出现（不给提示）
 *   3. retest 不计入首做正确率：首做统计由 fsrs-engine 的 firstAttempts 保证，重测不覆盖
 *   4. 预检跳课：新学知识点前可做 3 题预检，全对则直接标记"已掌握"，跳过正式学习
 *
 * 题目优先取自增强字段 quizQuestions（AI 生成初稿，未经学科教师逐条审核）；
 * 缺失时回退到知识点 commonMistakes 生成的判断题。
 * 全部数据只保存在 localStorage，不上传任何服务器。
 */
(function() {
  'use strict';

  const DAY_MS = 24 * 3600 * 1000;
  const RETEST_DELAY_MS = 20 * 60 * 1000;   // 第 1 步：20 分钟后重测
  const PRECHECK_COUNT = 3;                 // 预检 3 题全对可跳课

  const _instances = {};

  class DiagnosticLoop {
    constructor(role) {
      this.role = role || 'student';
      this.storage = window.CNPT.storage.create(this.role);
      this.fsrs = window.CNPT.fsrs.create(this.role);
      this.state = this._load();
    }

    _load() {
      const raw = this.storage.getDiagnosticState();
      const s = (raw && typeof raw === 'object') ? raw : {};
      this.retests = s.retests && typeof s.retests === 'object' ? s.retests : {};      // topicId -> {question, options, answer, dueAt, wrongAt}
      this.blindTests = s.blindTests && typeof s.blindTests === 'object' ? s.blindTests : {}; // topicId -> {question, options, answer, dueDate}
      this.prechecks = s.prechecks && typeof s.prechecks === 'object' ? s.prechecks : {};     // topicId -> {correct, total, updatedAt}
      return s;
    }

    save() {
      this.storage.setDiagnosticState({
        version: 1,
        retests: this.retests,
        blindTests: this.blindTests,
        prechecks: this.prechecks,
        savedAt: new Date().toISOString()
      });
    }

    // ---------------- 题目构造 ----------------

    /**
     * 从知识点取题（优先 AI 初稿 quizQuestions）
     * @returns {object|null} {question, options, answer, explanation, aiGenerated}
     */
    pickQuestion(topic, index) {
      const quiz = topic && Array.isArray(topic.quizQuestions) ? topic.quizQuestions : [];
      if (quiz.length) {
        const q = quiz[index % quiz.length];
        if (q && q.type === 'choice' && Array.isArray(q.options) && q.options.length >= 2) {
          return {
            question: q.question,
            options: q.options.slice(),
            answer: typeof q.answer === 'number' ? q.answer : 0,
            explanation: q.explanation || '',
            aiGenerated: true
          };
        }
      }
      // 回退：用易错点/掌握标准构造判断题
      const mistake = (topic && topic.commonMistakes && topic.commonMistakes[0]) || '';
      const evidence = (topic && topic.evidence && topic.evidence[0]) || '';
      if (mistake && evidence) {
        return {
          question: `关于"${topic.name}"，下面哪个说法是正确的？`,
          options: [mistake, evidence, '没有固定方法', '只需要死记硬背'],
          answer: 1,
          explanation: '理解概念比死记硬背更重要。',
          aiGenerated: false
        };
      }
      return null;
    }

    // ---------------- 错题两步闭环 ----------------

    /**
     * 答错 → 登记当天重测（第 1 步）
     */
    registerWrong(topic, questionInfo) {
      const q = this.pickQuestion(topic, 0);
      if (!q) return null;
      this.retests[topic.id] = {
        topicId: topic.id,
        question: questionInfo ? questionInfo.question : q.question,
        options: q.options,
        answer: q.answer,
        explanation: q.explanation,
        aiGenerated: q.aiGenerated,
        wrongAt: Date.now(),
        dueAt: Date.now() + RETEST_DELAY_MS
      };
      // 清掉可能存在的旧盲测（先重做第 1 步）
      delete this.blindTests[topic.id];
      this.save();
      return this.retests[topic.id];
    }

    /** 到期的第 1 步重测 */
    getDueRetests(topicMap) {
      const now = Date.now();
      return Object.keys(this.retests)
        .filter(id => (this.retests[id].dueAt || 0) <= now)
        .map(id => Object.assign({ topic: (topicMap || new Map()).get(id) || null }, this.retests[id]))
        .filter(r => r.topic);
    }

    /**
     * 第 1 步重测作答
     * 对 → 进入次日盲测（第 2 步）；错 → 20 分钟后重排
     */
    answerRetest(topicId, correct) {
      const item = this.retests[topicId];
      if (!item) return null;
      if (correct) {
        delete this.retests[topicId];
        const tomorrow = window.CNPT.utils.localDateKey(new Date(Date.now() + DAY_MS));
        this.blindTests[topicId] = {
          topicId,
          question: item.question,
          options: item.options,
          answer: item.answer,
          explanation: item.explanation,
          aiGenerated: item.aiGenerated,
          dueDate: tomorrow,
          passedAt: Date.now()
        };
        // 重测通过也算一次独立答对，推进 FSRS 卡片
        this.fsrs.recordAnswer({
          topicId, isCorrect: true, isIndependent: true, confidence: 75,
          questionInfo: { questionId: `${topicId}-retest`, question: item.question }
        });
      } else {
        item.wrongAt = Date.now();
        item.dueAt = Date.now() + RETEST_DELAY_MS;
      }
      this.save();
      return item;
    }

    // ---------------- 次日盲测 ----------------

    /** 今日到期的盲测（次日队列中 dueDate <= 今天） */
    getDueBlindTests(topicMap) {
      const today = window.CNPT.utils.localDateKey();
      return Object.keys(this.blindTests)
        .filter(id => (this.blindTests[id].dueDate || '') <= today)
        .map(id => Object.assign({ topic: (topicMap || new Map()).get(id) || null }, this.blindTests[id]))
        .filter(b => b.topic);
    }

    /**
     * 盲测作答（不给提示，独立作答）
     * 对 → 闭环完成，标记掌握；错 → 重新进入当天重测（第 1 步）
     */
    answerBlindTest(topicId, correct) {
      const item = this.blindTests[topicId];
      if (!item) return null;
      if (correct) {
        delete this.blindTests[topicId];
        this.storage.setTopicStatus(topicId, 'mastered');
        this.fsrs.recordAnswer({
          topicId, isCorrect: true, isIndependent: true, confidence: 75,
          questionInfo: { questionId: `${topicId}-blind`, question: item.question }
        });
      } else {
        delete this.blindTests[topicId];
        this.retests[topicId] = {
          topicId,
          question: item.question,
          options: item.options,
          answer: item.answer,
          explanation: item.explanation,
          aiGenerated: item.aiGenerated,
          wrongAt: Date.now(),
          dueAt: Date.now() + RETEST_DELAY_MS
        };
      }
      this.save();
      return item;
    }

    // ---------------- 预检跳课 ----------------

    /**
     * 预检：3 题全对 → 直接标记已掌握（跳课）
     */
    startPrecheck(topicId) {
      const cur = this.prechecks[topicId] || { correct: 0, total: 0, updatedAt: 0 };
      this.prechecks[topicId] = { correct: 0, total: 0, updatedAt: Date.now() };
      this.save();
      return this.prechecks[topicId];
    }

    answerPrecheck(topicId, correct) {
      const cur = this.prechecks[topicId];
      if (!cur) return { done: false };
      cur.total = (cur.total || 0) + 1;
      if (correct) cur.correct = (cur.correct || 0) + 1;
      cur.updatedAt = Date.now();
      const done = cur.total >= PRECHECK_COUNT;
      const passed = done && cur.correct >= PRECHECK_COUNT;
      if (passed) {
        this.storage.setTopicStatus(topicId, 'mastered');
        // 跳课等同已掌握：FSRS 卡片直接给 2 次连续独立答对
        const card = this.fsrs.getCard(topicId);
        card.consecutiveCorrect = Math.max(card.consecutiveCorrect, 2);
        card.totalReviews += cur.total;
        card.totalCorrect += cur.correct;
        card.lastReview = Date.now();
        card.nextReview = Date.now() + 7 * DAY_MS;
        this.fsrs.save();
      }
      if (done) {
        // 保留记录 1 天后清理由外部负责，这里直接删除避免堆积
        delete this.prechecks[topicId];
      }
      this.save();
      return { done, passed, correct: cur.correct, total: cur.total };
    }

    // ---------------- 概览 ----------------

    getOverview() {
      const now = Date.now();
      const today = window.CNPT.utils.localDateKey();
      let dueRetest = 0;
      for (const id in this.retests) if ((this.retests[id].dueAt || 0) <= now) dueRetest++;
      let dueBlind = 0;
      for (const id in this.blindTests) if ((this.blindTests[id].dueDate || '') <= today) dueBlind++;
      return {
        pendingRetests: Object.keys(this.retests).length,
        dueRetests: dueRetest,
        pendingBlindTests: Object.keys(this.blindTests).length,
        dueBlindTests: dueBlind
      };
    }

    export() {
      return Object.assign({ exportedAt: new Date().toISOString() }, this.state);
    }

    clear() {
      this.retests = {};
      this.blindTests = {};
      this.prechecks = {};
      this.save();
    }
  }

  window.CNPT = window.CNPT || {};
  window.CNPT.diagnostic = {
    create(role) {
      const key = role || 'student';
      if (!_instances[key]) _instances[key] = new DiagnosticLoop(key);
      return _instances[key];
    },
    PRECHECK_COUNT
  };
})();
