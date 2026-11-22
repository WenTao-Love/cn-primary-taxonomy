/*!
 * CN-Primary-Taxonomy · 共享组件：根因回溯诊断（Root-Cause Diagnosis）
 *
 * 借鉴 cn-math-taxonomy（github.com/xiaoyang111222/cn-math-taxonomy）的「顺藤摸瓜」诊断：
 *   1. 从指定目标考点开始测（而非从最基础开始盲测）
 *   2. 答错 → 先出确认题：确认题也错 → 薄弱；确认题对 → 不稳（不继续回溯）
 *   3. 薄弱 → 沿先修边（默认仅 hard）往回找根因，直到揪出「根因盲区」
 *   4. 生成「按顺序补回来」的补学路线（拓扑序 + 排除已掌握）
 *   5. 答对 → 沿后继边出「进阶综合题」（更狠的下游应用，限量向上挑战）
 *   6. 结论标注「缺陷画像」（概念理解/记忆背诵/语言规则/技能熟练/方法策略…）与「跨年级回溯」
 *
 * 与既有脚本 scripts/diagnostic-engine-v2.js 的关系：
 *   v2 面向 docs/diagnostic-center.html，依赖 data/diagnostic-questions.json 的 735 道题；
 *   本组件是其共享化增强版，题目三级回退（诊断题 → quizQuestions → commonMistakes 判断题），
 *   覆盖全部 4275 个知识点，供学生端 / H5 standalone 使用。
 *
 * 数据只保存在 localStorage，不上传任何服务器。
 * 诊断题为 AI 生成初稿，未经学科教师逐条审核，仅供学习参考。
 */
(function() {
  'use strict';

  const VERSION = '1.0';
  const DAY_MS = 24 * 3600 * 1000;
  const DIFFICULTY_LEVELS = { basic: 1, medium: 2, hard: 3 };
  const DIFFICULTY_NAMES = { basic: '基础', medium: '中等', hard: '拔高' };
  const HISTORY_LIMIT = 20;

  const _instances = {};

  class RootCauseDiagnosis {
    constructor(role) {
      this.role = role || 'student';
      this.indices = window.CNPT.indices;
      this.topicMap = this.indices ? this.indices.getTopicMap() : new Map();
      this.storage = window.CNPT.storage ? window.CNPT.storage.create(this.role) : null;

      // 构建期注入的规范诊断题（data/diagnostic-questions.json）
      const injected = window.__CNPT_DIAGNOSTIC_QUESTIONS__ || [];
      this.diagnosticMap = {};
      for (const q of injected) {
        if (!q || !q.topicId) continue;
        (this.diagnosticMap[q.topicId] = this.diagnosticMap[q.topicId] || []).push(q);
      }
      for (const tid in this.diagnosticMap) {
        this.diagnosticMap[tid].sort((a, b) =>
          (DIFFICULTY_LEVELS[a.difficulty] || 2) - (DIFFICULTY_LEVELS[b.difficulty] || 2));
      }
    }

    // ---------------- 题目来源（三级回退） ----------------

    /**
     * 取某知识点的诊断题：规范诊断题 → quizQuestions → commonMistakes 判断题
     * @returns {Array<{id, topicId, difficulty, question, options, answer, explanation, aiGenerated, source}>}
     */
    getQuestions(topicId) {
      const topic = this.topicMap.get(topicId);
      if (!topic) return [];

      const diag = this.diagnosticMap[topicId];
      if (diag && diag.length) {
        return diag.map(q => ({
          id: q.id || `dq_${topicId}`,
          topicId,
          difficulty: q.difficulty || 'basic',
          question: q.question,
          options: q.options || [],
          answer: typeof q.answer === 'number' ? q.answer : 0,
          explanation: q.explanation || '',
          aiGenerated: true,
          source: 'diagnostic'
        }));
      }

      const quiz = Array.isArray(topic.quizQuestions) ? topic.quizQuestions : [];
      const quizQs = quiz
        .filter(q => q && q.type === 'choice' && Array.isArray(q.options) && q.options.length >= 2)
        .map((q, i) => ({
          id: `quiz_${topicId}_${i}`,
          topicId,
          difficulty: 'medium',
          question: q.question,
          options: q.options.slice(),
          answer: typeof q.answer === 'number' ? q.answer : 0,
          explanation: q.explanation || '',
          aiGenerated: true,
          source: 'quiz'
        }));
      if (quizQs.length) return quizQs;

      // 回退：用易错点/掌握标准构造判断题
      const mistake = (topic.commonMistakes && topic.commonMistakes[0]) || '';
      const evidence = (topic.evidence && topic.evidence[0]) || '';
      if (mistake && evidence) {
        return [{
          id: `fb_${topicId}`,
          topicId,
          difficulty: 'basic',
          question: `关于"${topic.name}"，下面哪个说法是正确的？`,
          options: [mistake, evidence, '没有固定方法', '只需要死记硬背'],
          answer: 1,
          explanation: '理解概念比死记硬背更重要。',
          aiGenerated: false,
          source: 'fallback'
        }];
      }
      return [];
    }

    getTopicInfo(topicId) {
      return this.topicMap.get(topicId) || null;
    }

    // ---------------- 会话 ----------------

    /**
     * 开始诊断会话
     * @param {string} targetTopicId - 目标考点
     * @param {object} options - { maxQuestions, confirmOnFail, autoBacktrack, backtrackStrength, isMastered }
     */
    start(targetTopicId, options = {}) {
      const session = {
        id: `rcd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        version: VERSION,
        targetTopicId,
        options: {
          maxQuestions: options.maxQuestions || 15,
          confirmOnFail: options.confirmOnFail !== false,
          autoBacktrack: options.autoBacktrack !== false,
          backtrackStrength: options.backtrackStrength || 'hard',
          advanceOnCorrect: options.advanceOnCorrect !== false,
          advanceLimit: options.advanceLimit != null ? options.advanceLimit : 2,
          advanceStrength: options.advanceStrength || 'hard',
          isMastered: options.isMastered || function() { return false; }
        },
        status: 'running',
        questionCount: 0,
        answers: [],
        results: { weak: [], unstable: [], untested: [], mastered: [] },
        currentTopicId: null,
        queue: [],
        pendingConfirm: null,
        confirmedTopics: new Set(),
        currentDifficulty: 'basic',
        advanceAdded: 0
      };

      const target = this.getTopicInfo(targetTopicId);
      if (!target) {
        session.status = 'error';
        session.error = '未找到目标知识点';
        return session;
      }

      // 目标优先（文章：从指定目标考点开始测），随后直接前置（hard 优先）
      session.queue.push({
        topicId: targetTopicId,
        priority: 0,
        reason: '从目标考点开始诊断',
        isTarget: true,
        hasQuestions: this.getQuestions(targetTopicId).length > 0
      });

      const prereqs = this.getDirectPrerequisites(targetTopicId);
      prereqs
        .sort((a, b) => (a.strength === 'hard' ? 0 : 1) - (b.strength === 'hard' ? 0 : 1))
        .forEach(p => {
          session.queue.push({
            topicId: p.id,
            priority: p.strength === 'hard' ? 1 : 2,
            reason: `前置依赖：${p.reason || '学习该目标需要先掌握'}`,
            isPrerequisite: true,
            hasQuestions: this.getQuestions(p.id).length > 0
          });
        });

      return session;
    }

    getDirectPrerequisites(topicId) {
      const incoming = this.indices.getIncoming(topicId) || [];
      return incoming.map(e => ({
        id: e.source,
        strength: e.strength || 'soft',
        reason: e.reason || ''
      }));
    }

    getSuccessors(topicId) {
      const outgoing = this.indices.getOutgoing(topicId) || [];
      return outgoing.map(e => ({ id: e.target, strength: e.strength || 'soft' }));
    }

    /**
     * 取下一题
     * @returns {object|null} {type:'diagnostic'|'confirm', question, topic, message, progress}
     */
    next(session) {
      if (session.status === 'error') return null;

      if (session.pendingConfirm) {
        const q = session.pendingConfirm;
        session.pendingConfirm = null;
        return {
          type: 'confirm',
          question: q,
          topic: this.getTopicInfo(q.topicId),
          message: '这题再确认一下：也答错才算薄弱，答对就只是「不稳」。',
          progress: this._progress(session)
        };
      }

      while (session.queue.length > 0 && session.questionCount < session.options.maxQuestions) {
        const item = session.queue.shift();
        session.currentTopicId = item.topicId;
        const questions = this.getQuestions(item.topicId);
        if (!questions.length) {
          this._pushUntested(session, item.topicId, '暂无诊断题');
          continue;
        }
        // 跳过已掌握（外部传入）
        if (typeof session.options.isMastered === 'function' && session.options.isMastered(item.topicId)) {
          this._pushMastered(session, item.topicId, '已掌握');
          continue;
        }
        const q = this._selectQuestionByDifficulty(questions, session);
        return {
          type: 'diagnostic',
          question: q,
          topic: this.getTopicInfo(item.topicId),
          message: item.reason || '',
          isAdvance: !!item.isAdvance,
          progress: this._progress(session)
        };
      }

      session.status = 'completed';
      return null;
    }

    _progress(session) {
      return {
        answered: session.questionCount,
        limit: session.options.maxQuestions,
        weak: session.results.weak.length,
        unstable: session.results.unstable.length,
        advance: session.advanceAdded
      };
    }

    _selectQuestionByDifficulty(questions, session) {
      const level = DIFFICULTY_LEVELS[session.currentDifficulty] || 2;
      let best = questions[0];
      let bestDiff = Infinity;
      for (const q of questions) {
        const d = Math.abs((DIFFICULTY_LEVELS[q.difficulty] || 2) - level);
        if (d < bestDiff) { bestDiff = d; best = q; }
      }
      return best;
    }

    /**
     * 提交作答（主诊断题）
     * @returns {object} {correct, needConfirm, markedAs, message}
     */
    answer(session, questionId, answerIndex) {
      const q = this._findQuestion(session, questionId);
      if (!q) return { correct: false, message: '题目不存在' };

      const isCorrect = answerIndex === q.answer;
      const topicId = q.topicId;
      this._record(session, q, answerIndex, isCorrect, false);
      this._adjustDifficulty(session, isCorrect);

      if (isCorrect) {
        this._pushMastered(session, topicId, '掌握良好');
        const advanced = session.options.advanceOnCorrect ? this._advance(session, topicId) : 0;
        return {
          correct: true,
          needConfirm: false,
          markedAs: 'mastered',
          advanced,
          message: advanced > 0
            ? `答对了，这个点掌握了 👍 再加 ${advanced} 道进阶综合题`
            : '答对了，这个点掌握了 👍'
        };
      }

      // 答错：尝试确认题
      const confirmQ = session.options.confirmOnFail && !session.confirmedTopics.has(topicId)
        ? this._getConfirmQuestion(topicId, q)
        : null;
      if (confirmQ) {
        session.pendingConfirm = confirmQ;
        session.confirmedTopics.add(topicId);
        return {
          correct: false,
          needConfirm: true,
          markedAs: null,
          message: '答错了，先做一道确认题。'
        };
      }

      this._markAsWeak(session, topicId);
      if (session.options.autoBacktrack) this._backtrack(session, topicId);
      return { correct: false, needConfirm: false, markedAs: 'weak', message: '判定为薄弱，继续往前找根因。' };
    }

    /**
     * 提交确认题作答
     * @returns {object} {correct, markedAs, message}
     */
    answerConfirm(session, questionId, answerIndex) {
      const q = this._findQuestion(session, questionId);
      if (!q) return { correct: false, message: '题目不存在' };
      const isCorrect = answerIndex === q.answer;
      const topicId = q.topicId;
      this._record(session, q, answerIndex, isCorrect, true);

      if (isCorrect) {
        this._pushUnstable(session, topicId, '第一题答错、确认题答对 → 不稳（不继续回溯）');
        return { correct: true, markedAs: 'unstable', message: '确认题对了，这个点标为「不稳」，先巩固。' };
      }
      this._markAsWeak(session, topicId);
      if (session.options.autoBacktrack) this._backtrack(session, topicId);
      return { correct: false, markedAs: 'weak', message: '确认题也错了，判定为薄弱，继续往前找根因。' };
    }

    _findQuestion(session, questionId) {
      const topicId = session.currentTopicId;
      const questions = this.getQuestions(topicId);
      return questions.find(q => q.id === questionId) || null;
    }

    _record(session, q, answerIndex, isCorrect, isConfirm) {
      session.answers.push({
        questionId: q.id,
        topicId: q.topicId,
        difficulty: q.difficulty,
        userAnswer: answerIndex,
        correctAnswer: q.answer,
        isCorrect,
        isConfirm: !!isConfirm,
        source: q.source,
        timestamp: new Date().toISOString()
      });
      session.questionCount++;
    }

    _adjustDifficulty(session, isCorrect) {
      const recent = session.answers.slice(-3);
      if (isCorrect) {
        if (recent.length >= 3 && recent.every(a => a.isCorrect)) {
          if (session.currentDifficulty === 'basic') session.currentDifficulty = 'medium';
          else if (session.currentDifficulty === 'medium') session.currentDifficulty = 'hard';
        }
      } else {
        if (session.currentDifficulty === 'hard') session.currentDifficulty = 'medium';
        else if (session.currentDifficulty === 'medium') session.currentDifficulty = 'basic';
      }
    }

    _getConfirmQuestion(topicId, currentQuestion) {
      const questions = this.getQuestions(topicId);
      const candidates = questions.filter(q =>
        q.id !== currentQuestion.id &&
        (DIFFICULTY_LEVELS[q.difficulty] || 2) <= (DIFFICULTY_LEVELS[currentQuestion.difficulty] || 2));
      if (!candidates.length) return null;
      return candidates.find(q => q.difficulty === 'basic') || candidates[0];
    }

    _pushMastered(session, topicId, message) {
      if (this._alreadyMarked(session, topicId)) return;
      session.results.mastered.push({ topicId, message });
    }

    _pushUnstable(session, topicId, message) {
      if (this._alreadyMarked(session, topicId)) return;
      session.results.unstable.push({ topicId, message });
    }

    _pushUntested(session, topicId, reason) {
      if (this._alreadyMarked(session, topicId)) return;
      session.results.untested.push({ topicId, reason });
    }

    _alreadyMarked(session, topicId) {
    return ['weak', 'unstable', 'mastered'].some(k =>
      session.results[k].some(r => r.topicId === topicId));
    }

    _markAsWeak(session, topicId) {
      session.results.mastered = session.results.mastered.filter(m => m.topicId !== topicId);
      session.results.unstable = session.results.unstable.filter(u => u.topicId !== topicId);
      if (!session.results.weak.some(w => w.topicId === topicId)) {
        session.results.weak.push({ topicId, message: '连续答错（或确认题也错），判定为薄弱' });
      }
    }

    /** 回溯：薄弱知识点 → 直接前置（默认仅 hard）加入队列 */
    _backtrack(session, topicId) {
      for (const p of this.getDirectPrerequisites(topicId)) {
        if (session.options.backtrackStrength === 'hard' && p.strength !== 'hard') continue;
        if (this._alreadyMarked(session, p.id)) continue;
        if (session.queue.some(i => i.topicId === p.id)) continue;
        session.queue.push({
          topicId: p.id,
          priority: p.strength === 'hard' ? 1 : 2,
          reason: `根因追溯：${this.getTopicInfo(topicId)?.name || topicId} 薄弱，检查前置`
        });
      }
    }

    /**
     * 进阶：答对后把该知识点的 hard 后继（未测/未标记/不在队列）插入队首，
     * 形成「更狠的综合题」向上挑战；受 advanceLimit 限量，默认 2 道。
     * 无 hard 后继时退而取 soft 后继（仍限量的综合应用）。
     */
    _advance(session, topicId) {
      const limit = session.options.advanceLimit || 0;
      if (session.advanceAdded >= limit) return 0;
      const want = session.options.advanceStrength || 'hard';
      let succs = this.getSuccessors(topicId).filter(s => s.strength === want);
      if (!succs.length) succs = this.getSuccessors(topicId);
      const fromName = this.getTopicInfo(topicId)?.name || topicId;
      let added = 0;
      for (const s of succs) {
        if (session.advanceAdded >= limit) break;
        if (this._alreadyMarked(session, s.id)) continue;
        if (session.queue.some(i => i.topicId === s.id)) continue;
        const t = this.getTopicInfo(s.id);
        if (!t) continue;
        if (typeof session.options.isMastered === 'function' && session.options.isMastered(s.id)) continue;
        session.queue.unshift({
          topicId: s.id,
          priority: 0,
          isAdvance: true,
          reason: `进阶挑战：已掌握「${fromName}」，试试更综合的「${t.name}」`
        });
        session.advanceAdded++;
        added++;
      }
      return added;
    }

    // ---------------- 结果与路线 ----------------

    /**
     * 完成会话，生成报告（含补学路线）
     */
    finish(session) {
      for (const item of session.queue) {
        this._pushUntested(session, item.topicId, '题量上限，未测试');
      }
      session.status = 'completed';

      const targetGrade = (this.getTopicInfo(session.targetTopicId) || {}).grade || 0;
      const weak = session.results.weak.map(w => this._withTopic(w, 'weak', targetGrade));
      const unstable = session.results.unstable.map(u => this._withTopic(u, 'unstable', targetGrade));
      const mastered = session.results.mastered.map(m => this._withTopic(m, 'mastered', targetGrade));
      const untested = session.results.untested.map(u => this._withTopic(u, 'untested', targetGrade));

      // 根因 = 薄弱点中「没有更薄弱前置」者（最深处）
      const weakIds = new Set(weak.map(w => w.topicId));
      const rootCauses = weak.filter(w => {
        const prereqs = this.getDirectPrerequisites(w.topicId);
        return !prereqs.some(p => weakIds.has(p.id));
      });

      const remedialPath = this.buildRemedialPath(session, weak, unstable);

      const report = {
        id: session.id + (session.expandCount ? `-r${session.expandCount}` : ''),
        version: VERSION,
        role: this.role,
        createdAt: new Date().toISOString(),
        target: this._withTopic({ topicId: session.targetTopicId }, 'target', targetGrade),
        statistics: {
          totalQuestions: session.questionCount,
          correctAnswers: session.answers.filter(a => a.isCorrect).length,
          weakCount: weak.length,
          unstableCount: unstable.length,
          untestedCount: untested.length,
          masteredCount: mastered.length,
          rootCauseCount: rootCauses.length,
          advanceCount: session.advanceAdded
        },
        rootCauses,
        weak,
        unstable,
        untested,
        mastered,
        remedialPath,
        defectSummary: this._summarizeDefects(weak, unstable),
        answers: session.answers
      };

      this._saveReport(report);
      return report;
    }

    /**
     * 缺陷画像：把知识点映射为「缺陷类型 + 针对性建议」。
     * 判据来自知识点自身的 type/domain/subnodeType/name（不依赖边、不编造）。
     * 例：英语「词汇识记」→ 记忆背诵；「现在完成时」→ 语言规则；数学「方程」→ 技能熟练。
     */
    classifyDefect(topic) {
      if (!topic) return { defectType: 'other', defectLabel: '综合', suggestion: '按补学路线顺序巩固。' };
      const text = `${topic.name || ''} ${topic.domain || ''} ${topic.subnodeType || ''}`;
      const type = topic.type || '';
      if (/词汇|单词|识字|写字|抄写|背|默写|字词|名称|术语|符号/.test(text)) {
        return { defectType: 'memory', defectLabel: '记忆背诵', suggestion: '用间隔复习与听写默写巩固，重在准确再现。' };
      }
      if (type === 'LANGUAGE' || /时态|语法|句型|语篇|阅读|表达|口语|写作|拼读|发音/.test(text)) {
        return { defectType: 'language', defectLabel: '语言规则', suggestion: '梳理规则并做对比练习，在语境中反复运用。' };
      }
      if (type === 'CONCEPTUAL' || /概念|意义|性质|特征|规律|关系|定义|原理|函数/.test(text)) {
        return { defectType: 'concept', defectLabel: '概念理解', suggestion: '回到定义与例子，先弄清“是什么/为什么”，再去做题。' };
      }
      if (type === 'PROCEDURAL' || /计算|运算|竖式|口算|笔算|解方程|方程|作图|操作|测量|实验|步骤/.test(text)) {
        return { defectType: 'skill', defectLabel: '技能熟练', suggestion: '按规范步骤限时练习，先求对再求快。' };
      }
      if (type === 'META') {
        return { defectType: 'meta', defectLabel: '方法策略', suggestion: '复盘解题思路，总结可迁移的方法。' };
      }
      if (type === 'REPRESENTATIONAL') {
        return { defectType: 'representation', defectLabel: '表征转换', suggestion: '在图形、符号、语言之间相互转换练习。' };
      }
      return { defectType: 'other', defectLabel: '综合', suggestion: '按补学路线顺序巩固。' };
    }

    /** 缺陷画像汇总（仅统计薄弱 + 不稳），按数量降序 */
    _summarizeDefects(weak, unstable) {
      const summary = {};
      for (const item of [...weak, ...unstable]) {
        const key = item.defectType || 'other';
        if (!summary[key]) summary[key] = { defectType: key, defectLabel: item.defectLabel || '综合', count: 0 };
        summary[key].count++;
      }
      return Object.values(summary).sort((a, b) => b.count - a.count);
    }

    _withTopic(ref, status, targetGrade) {
      const t = this.getTopicInfo(ref.topicId) || {};
      const defect = this.classifyDefect(t);
      const crossGrade = !!(targetGrade && t.grade && t.grade !== targetGrade);
      return {
        topicId: ref.topicId,
        name: t.name || ref.topicId,
        subject: t.subject || '',
        grade: t.grade || 0,
        term: t.term || '',
        difficulty: t.difficulty || 0,
        status,
        message: ref.message || '',
        description: t.description || '',
        defectType: defect.defectType,
        defectLabel: defect.defectLabel,
        suggestion: defect.suggestion,
        crossGrade
      };
    }

    /**
     * 生成「按顺序补回来」的补学路线：
     * 目标子图拓扑序（排除已掌握），标注 weak/unstable，根因优先。
     */
    buildRemedialPath(session, weak, unstable) {
      const focus = [...weak, ...unstable].map(x => x.topicId);
      if (!focus.length) return [];

      const statusOf = {};
      weak.forEach(w => { statusOf[w.topicId] = 'weak'; });
      unstable.forEach(u => { statusOf[u.topicId] = 'unstable'; });

      // 目标子图（含全部前置），拓扑排序后取 weak/unstable 及其之间的依赖
      let ids = focus;
      try {
        const sub = window.CNPT.path && window.CNPT.path.getSubgraphIds
          ? window.CNPT.path.getSubgraphIds(session.targetTopicId)
          : new Set(focus);
        const sorted = window.CNPT.path.topologicalSort
          ? window.CNPT.path.topologicalSort([...sub])
          : focus;
        // 保留 focus 集合中、且位于某个根因到目标路径上的节点
        const keep = new Set(focus);
        // 若目标有直接前置不在 focus 中，不强行加入（路线聚焦盲区）
        ids = sorted.filter(id => keep.has(id));
      } catch (e) {
        // 降级：直接按 focus
      }

      return ids.map(id => {
        const t = this.getTopicInfo(id) || {};
        const status = statusOf[id] || 'unknown';
        const prereqs = this.getDirectPrerequisites(id).map(p => p.id);
        const defect = this.classifyDefect(t);
        return {
          topicId: id,
          name: t.name || id,
          subject: t.subject || '',
          grade: t.grade || 0,
          term: t.term || '',
          status,
          prerequisites: prereqs,
          weight: this.calculateTopicWeight(id, status === 'weak'),
          defectType: defect.defectType,
          defectLabel: defect.defectLabel,
          suggestion: defect.suggestion
        };
      });
    }

    /**
     * 盲区再测（文章结果页「盲区再测」）：把「未测」知识点重新入队继续诊断
     * 提高本轮题量上限（原已答数 + 未测数 + 5），避免一续测就停。
     * @returns {number} 加入队列的知识点数
     */
    expandUntested(session, extraBudget) {
      if (session.status !== 'completed') return 0;
      const extras = session.results.untested.map(u => u.topicId);
      if (!extras.length) return 0;
      session.results.untested = [];
      session.queue = extras.map(id => ({
        topicId: id,
        priority: 3,
        reason: '盲区再测：上次题量上限未测到，这次补测',
        isRetest: true
      }));
      session.options.maxQuestions = session.questionCount + (extraBudget || extras.length + 5);
      session.status = 'running';
      session.expandCount = (session.expandCount || 0) + 1;
      return extras.length;
    }

    /** 路径权重：被依赖越多、难度越高、根因 → 越优先 */
    calculateTopicWeight(topicId, isRootCause) {
      const topic = this.getTopicInfo(topicId);
      const successors = this.getSuccessors(topicId);
      let weight = 1 + successors.length * 0.5;
      for (const s of successors) if (s.strength === 'hard') weight += 0.5;
      if (topic && topic.difficulty) weight += topic.difficulty * 0.3;
      if (isRootCause) weight *= 2;
      return Math.round(weight * 100) / 100;
    }

    // ---------------- 根因路径图 ----------------

    /**
     * 构建路径图数据（供端侧渲染 SVG）：节点 + 边 + 层级深度
     * 深度：目标 = 0，每往前置 +1（取最长链）
     */
    getPathGraphData(report) {
      const path = report.remedialPath || [];
      if (!path.length) return { nodes: [], edges: [], depth: {}, rows: 0, targetId: null };
      const ids = new Set(path.map(p => p.topicId));
      const rootIds = new Set((report.rootCauses || []).map(r => r.topicId));
      const targetId = report.target && report.target.topicId;
      const nodes = path.map(p => ({
        id: p.topicId,
        name: p.name,
        subject: p.subject || '',
        grade: p.grade || 0,
        status: p.status || 'unknown',
        isRoot: rootIds.has(p.topicId),
        isTarget: targetId === p.topicId,
        prereqIds: (p.prerequisites || []).filter(id => ids.has(id))
      }));

      // 边（仅两端都在路线内），强度从依赖图取
      const edges = [];
      for (const p of path) {
        for (const pre of this.getDirectPrerequisites(p.topicId)) {
          if (!ids.has(pre.id)) continue;
          edges.push({ source: pre.id, target: p.topicId, strength: pre.strength || 'soft' });
        }
      }

      // 深度（目标 0，前置递增，最长链；防御环）
      // 边方向为 前置→后继，故按出边（后继）反向递增
      const depth = {};
      const visiting = new Set();
      const calc = (id) => {
        if (depth[id] != null) return depth[id];
        if (visiting.has(id)) return 0;
        visiting.add(id);
        const succs = edges.filter(e => e.source === id).map(e => e.target);
        depth[id] = succs.length ? Math.max(...succs.map(calc)) + 1 : 0;
        visiting.delete(id);
        return depth[id];
      };
      nodes.forEach(n => calc(n.id));
      const rows = Math.max(...Object.values(depth)) + 1;
      return { nodes, edges, depth, rows, targetId };
    }

    /**
     * 渲染路径图 SVG：根因红框、目标橙框、薄弱红底、不稳黄底；hard 实线 / soft 虚线。
     * @returns {string} svg 字符串；无路线时返回空串
     */
    renderPathGraphSVG(report, options = {}) {
      const data = this.getPathGraphData(report);
      if (!data.nodes.length) return '';
      const nodeH = options.nodeHeight || 36;
      const rowH = options.rowHeight || 68;
      const pad = options.padding || 12;
      const rows = [];
      for (let d = 0; d < data.rows; d++) rows.push(data.nodes.filter(n => data.depth[n.id] === d));
      const maxCols = Math.max(...rows.map(r => r.length));
      const width = Math.max(options.minWidth || 320, pad * 2 + maxCols * 128);
      const height = pad * 2 + data.rows * rowH;
      const pos = {};
      rows.forEach((row, d) => {
        const colW = (width - pad * 2) / Math.max(row.length, 1);
        row.forEach((n, i) => {
          const w = Math.min(120, Math.max(72, (n.name || '').length * 13 + 16));
          pos[n.id] = { x: pad + colW * i + colW / 2, y: pad + d * rowH + rowH / 2, w };
        });
      });
      const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
      const strokeOf = (n) => n.isTarget ? '#e8590c' : (n.isRoot || n.status === 'weak') ? '#e03131' : n.status === 'unstable' ? '#f08c00' : '#868e96';
      const fillOf = (n) => n.isTarget ? '#fff4e6' : (n.isRoot || n.status === 'weak') ? '#ffe3e3' : n.status === 'unstable' ? '#fff3bf' : '#f1f3f5';
      let edgesSvg = '';
      for (const e of data.edges) {
        const a = pos[e.source], b = pos[e.target];
        if (!a || !b) continue;
        const hard = e.strength === 'hard';
        edgesSvg += `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${hard ? '#868e96' : '#ced4da'}" stroke-width="${hard ? 1.6 : 1.2}"${hard ? '' : ' stroke-dasharray="4 3"'} />`;
      }
      let nodesSvg = '';
      for (const n of data.nodes) {
        const p = pos[n.id];
        const label = (n.name || '').length > 7 ? n.name.slice(0, 6) + '…' : (n.name || n.id);
        const hot = n.isTarget || n.isRoot;
        nodesSvg += `<g><rect x="${(p.x - p.w / 2).toFixed(1)}" y="${(p.y - nodeH / 2).toFixed(1)}" width="${p.w}" height="${nodeH}" rx="8" fill="${fillOf(n)}" stroke="${strokeOf(n)}" stroke-width="${hot ? 2.2 : 1.4}"/>` +
          `<text x="${p.x.toFixed(1)}" y="${(p.y + 4).toFixed(1)}" text-anchor="middle" font-size="11" fill="#212529">${esc(label)}</text>` +
          `<title>${esc(n.name)}</title></g>`;
      }
      return `<svg viewBox="0 0 ${width} ${height}" width="100%" style="max-width:${width}px" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="根因路径图">${edgesSvg}${nodesSvg}</svg>`;
    }

    // ---------------- 历史与导出 ----------------

    _historyKey() {
      return `cnpt-${this.role}-rcd-history`;
    }

    _saveReport(report) {
      try {
        const key = this._historyKey();
        const list = JSON.parse(localStorage.getItem(key) || '[]');
        list.unshift({
          id: report.id,
          createdAt: report.createdAt,
          target: report.target,
          statistics: report.statistics,
          rootCauses: report.rootCauses,
          weak: report.weak,
          unstable: report.unstable
        });
        localStorage.setItem(key, JSON.stringify(list.slice(0, HISTORY_LIMIT)));
      } catch (e) { /* 隐私模式等场景忽略 */ }
    }

    getHistory() {
      try {
        return JSON.parse(localStorage.getItem(this._historyKey()) || '[]');
      } catch (e) { return []; }
    }

    clearHistory() {
      try { localStorage.removeItem(this._historyKey()); } catch (e) { /* 忽略 */ }
      return true;
    }

    exportReport(report) {
      return JSON.stringify(report, null, 2);
    }
  }

  window.CNPT = window.CNPT || {};
  window.CNPT.rootCause = {
    create(role) {
      const key = role || 'student';
      if (!_instances[key]) _instances[key] = new RootCauseDiagnosis(key);
      return _instances[key];
    },
    VERSION,
    DIFFICULTY_NAMES
  };
})();
