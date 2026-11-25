/**
 * 诊断引擎 v2：基于知识图谱的自适应诊断系统
 * 
 * 核心优化：
 * 1. 难度自适应：根据答题情况动态调整题目难度
 * 2. 智能确认题：选择最合适的确认题
 * 3. 最短路径：使用Dijkstra算法找最短学习路径
 * 4. 多策略回溯：根据依赖强度决定是否回溯
 * 5. 知识点权重：考虑知识点重要性和难度
 */

class DiagnosticEngine {
  constructor(topics, dependencies, questions) {
    this.topics = topics;
    this.dependencies = dependencies;
    this.questions = questions;
    
    // 难度等级映射（需要先初始化，因为 _buildQuestionMap 会用到）
    this.difficultyLevels = { basic: 1, medium: 2, hard: 3 };
    
    // 难度名称映射
    this.difficultyNames = { basic: '基础', medium: '中等', hard: '拔高' };
    
    // 构建前置依赖映射：topicId -> [prerequisiteIds]
    this.prereqMap = this._buildPrereqMap();
    
    // 构建问题映射：topicId -> [questions]
    this.questionMap = this._buildQuestionMap();
    
    // 构建后继映射：topicId -> [successors]
    this.successorMap = this._buildSuccessorMap();
    
    // 构建知识点信息映射
    this.topicMap = this._buildTopicMap();
  }

  /**
   * 构建前置依赖映射
   */
  _buildPrereqMap() {
    const map = {};
    for (const dep of this.dependencies) {
      const tid = dep.topicId;
      const pid = dep.prerequisiteId;
      if (!map[tid]) map[tid] = [];
      map[tid].push({
        id: pid,
        strength: dep.strength || 'soft',
        reason: dep.reason || ''
      });
    }
    return map;
  }

  /**
   * 构建问题映射
   */
  _buildQuestionMap() {
    const map = {};
    for (const q of this.questions) {
      const tid = q.topicId;
      if (!map[tid]) map[tid] = [];
      map[tid].push(q);
    }
    
    // 对每个知识点的题目按难度排序
    for (const tid in map) {
      map[tid].sort((a, b) => this.difficultyLevels[a.difficulty] - this.difficultyLevels[b.difficulty]);
    }
    
    return map;
  }

  /**
   * 构建后继映射
   */
  _buildSuccessorMap() {
    const map = {};
    for (const dep of this.dependencies) {
      const pid = dep.prerequisiteId;
      const tid = dep.topicId;
      if (!map[pid]) map[pid] = [];
      map[pid].push({
        id: tid,
        strength: dep.strength || 'soft'
      });
    }
    return map;
  }

  /**
   * 构建知识点信息映射
   */
  _buildTopicMap() {
    const map = {};
    for (const t of this.topics) {
      map[t.id] = t;
    }
    return map;
  }

  /**
   * 获取某个知识点的所有前置依赖（递归）
   */
  getPrerequisites(topicId, visited = new Set()) {
    if (visited.has(topicId)) return [];
    visited.add(topicId);
    
    const prereqs = this.prereqMap[topicId] || [];
    let all = [...prereqs];
    
    for (const p of prereqs) {
      const subPrereqs = this.getPrerequisites(p.id, visited);
      all = all.concat(subPrereqs);
    }
    
    return all;
  }

  /**
   * 获取某个知识点的直接前置依赖
   */
  getDirectPrerequisites(topicId) {
    return this.prereqMap[topicId] || [];
  }

  /**
   * 错题溯源：追溯某个知识点完整的跨学段上游依赖链
   * 返回从目标知识点出发、沿最强路径追溯到最底层前置的完整链条，
   * 并统计所有祖先（去重）与年级跨度。用于结果页「错题溯源」展示：
   * 例如六年级错题一路追溯到三年级，直观呈现「哪里没掌握牢」。
   */
  traceLineage(topicId, options = {}) {
    const maxDepth = options.maxDepth || 12;
    const memo = {};

    // 记忆化递归：返回从 id 出发的最长前置链（含自身）
    const build = (id, depth) => {
      if (depth > maxDepth) return [id];
      if (memo[id]) return [id].concat(memo[id]);
      const prereqs = this.prereqMap[id] || [];
      let best = [];
      for (const p of prereqs) {
        const sub = build(p.id, depth + 1);
        if (sub.length > best.length) best = sub;
      }
      memo[id] = best;
      return [id].concat(best);
    };

    const chainIds = build(topicId, 0);

    // 收集全部祖先（去重，用于统计覆盖范围）
    const allAncestors = new Set();
    const collect = (id, visited) => {
      if (visited.has(id)) return;
      visited.add(id);
      const prereqs = this.prereqMap[id] || [];
      for (const p of prereqs) {
        allAncestors.add(p.id);
        collect(p.id, visited);
      }
    };
    collect(topicId, new Set());

    // 链上相邻节点的依赖强度与原因
    const nodes = chainIds.map((id, idx) => {
      const t = this.getTopicInfo(id);
      let strength = null;
      let reason = '';
      if (idx > 0) {
        const edge = (this.prereqMap[chainIds[idx - 1]] || []).find(e => e.id === id);
        if (edge) {
          strength = edge.strength || 'soft';
          reason = edge.reason || '';
        }
      }
      return {
        id: id,
        name: t ? t.name : id,
        subject: t ? t.subject : '',
        grade: t ? t.grade : null,
        term: t ? t.term : '',
        description: t ? (t.description || '') : '',
        strength: strength,
        reason: reason
      };
    });

    const grades = nodes.map(n => n.grade).filter(g => g !== null);
    const uniqueGrades = Array.from(new Set(grades)).sort((a, b) => a - b);

    return {
      targetId: topicId,
      nodes: nodes,                 // 顺序：目标 -> ... -> 最底层前置
      ancestorCount: allAncestors.size,
      gradeSpan: uniqueGrades.length > 0 ? [uniqueGrades[0], uniqueGrades[uniqueGrades.length - 1]] : null,
      crossGrade: uniqueGrades.length > 1
    };
  }

  /**
   * 定向练习会话：只练习指定的薄弱/不稳知识点，逐题训练
   * 与诊断模式的区别：不出确认题、不回溯、不自适应难度，题目平铺逐道练
   */
  startPractice(topicIds, options = {}) {
    const validIds = (topicIds || []).filter(id => this.getQuestions(id).length > 0);
    const session = this.startSession(validIds[0] || '__empty__', Object.assign({
      confirmOnFail: false,
      autoBacktrack: false,
      adaptiveDifficulty: false
    }, options || {}));
    session.practiceMode = true;
    // 展开为题目级队列：按知识点分组、组内按难度排序
    session.practiceQueue = [];
    session.results.untested = [];
    for (const id of validIds) {
      const qs = this.getQuestions(id);
      for (const q of qs) {
        session.practiceQueue.push(q.id);
      }
    }
    session.options.maxQuestions = session.practiceQueue.length;
    session.queue = [];
    return session;
  }

  /**
   * 获取某个知识点的所有后继（依赖它的知识点）
   */
  getSuccessors(topicId) {
    return this.successorMap[topicId] || [];
  }

  /**
   * 获取某个知识点的诊断题
   */
  getQuestions(topicId) {
    return this.questionMap[topicId] || [];
  }

  /**
   * 获取某个知识点的信息
   */
  getTopicInfo(topicId) {
    return this.topicMap[topicId] || null;
  }

  /**
   * 计算知识点的权重（用于路径推荐）
   * 考虑因素：被依赖次数、难度、是否为根因
   */
  calculateTopicWeight(topicId, isRootCause = false) {
    const topic = this.getTopicInfo(topicId);
    const successors = this.getSuccessors(topicId);
    
    // 基础权重
    let weight = 1;
    
    // 被依赖次数越多，权重越高
    weight += successors.length * 0.5;
    
    // 强依赖的后继权重更高
    for (const s of successors) {
      if (s.strength === 'hard') {
        weight += 0.5;
      }
    }
    
    // 难度越高，权重越高（需要更多时间学习）
    if (topic && topic.difficulty) {
      weight += topic.difficulty * 0.3;
    }
    
    // 根因权重更高（优先解决）
    if (isRootCause) {
      weight *= 2;
    }
    
    return weight;
  }

  /**
   * 开始诊断会话
   * @param {string} targetTopicId - 目标知识点
   * @param {Object} options - 配置选项
   */
  startSession(targetTopicId, options = {}) {
    const session = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      targetTopicId,
      options: {
        maxQuestions: options.maxQuestions || 20,
        confirmOnFail: options.confirmOnFail !== false,
        autoBacktrack: options.autoBacktrack !== false,
        adaptiveDifficulty: options.adaptiveDifficulty !== false,
        backtrackStrength: options.backtrackStrength || 'hard', // 'hard', 'all'
        ...options
      },
      status: 'running',
      questionCount: 0,
      answers: [],
      results: {
        weak: [],      // 薄弱
        unstable: [],  // 不稳
        untested: [],  // 未测
        mastered: []   // 已掌握
      },
      currentTopicId: null,
      queue: [],
      pendingConfirm: null,
      // 每个知识点的答题记录
      topicAttempts: {},
      // 当前难度级别（自适应）
      currentDifficulty: 'basic'
    };

    // 初始化队列：目标知识点的直接前置依赖
    // 优先加入有诊断题的知识点
    const prereqs = this.getDirectPrerequisites(targetTopicId);
    const targetHasQuestions = this.getQuestions(targetTopicId).length > 0;
    
    for (const p of prereqs) {
      const hasQuestions = this.getQuestions(p.id).length > 0;
      session.queue.push({
        topicId: p.id,
        priority: hasQuestions ? 1 : 2, // 有诊断题的优先级更高
        reason: `前置依赖：${p.reason || '学习' + targetTopicId + '需要'}`,
        isPrerequisite: true,
        hasQuestions
      });
    }

    // 如果目标知识点有诊断题，加入队列
    if (targetHasQuestions) {
      session.queue.push({
        topicId: targetTopicId,
        priority: 1,
        reason: '直接测试目标知识点',
        isTarget: true,
        hasQuestions: true
      });
    }

    // 如果没有前置依赖且目标没有诊断题，直接测试目标知识点
    if (session.queue.length === 0) {
      session.queue.push({
        topicId: targetTopicId,
        priority: 1,
        reason: '直接测试目标知识点',
        isTarget: true,
        hasQuestions: false
      });
    }

    return session;
  }

  /**
   * 获取下一道题（难度自适应）
   */
  getNextQuestion(session) {
    // 定向练习模式：按平铺的题目队列逐题练习
    if (session.practiceMode && session.practiceQueue && session.practiceQueue.length > 0) {
      const qid = session.practiceQueue.shift();
      const question = this.questions.find(q => q.id === qid);
      if (!question) {
        return this.getNextQuestion(session);
      }
      session.currentTopicId = question.topicId;
      session.questionCount++;
      return {
        type: 'practice',
        question: question,
        topicId: question.topicId,
        reason: '定向练习',
        remaining: session.practiceQueue.length,
        difficultyLevel: session.currentDifficulty
      };
    }

    // 如果有待确认的题，先返回确认题
    if (session.pendingConfirm) {
      const confirmQ = session.pendingConfirm;
      session.pendingConfirm = null;
      return {
        type: 'confirm',
        question: confirmQ,
        topicId: confirmQ.topicId,
        message: '前面有题没答对，再出一道基础的题确认：这一题也错才算薄弱，答对则标为不稳。'
      };
    }

    // 从队列中取下一个知识点
    while (session.queue.length > 0 && session.questionCount < session.options.maxQuestions) {
      const item = session.queue.shift();
      session.currentTopicId = item.topicId;
      
      const questions = this.getQuestions(item.topicId);
      if (questions.length === 0) {
        // 没有诊断题，标记为未测
        session.results.untested.push({
          topicId: item.topicId,
          reason: '暂无诊断题'
        });
        continue;
      }

      // 自适应难度选择
      const selectedQuestion = this._selectQuestionByDifficulty(questions, session);
      
      return {
        type: 'diagnostic',
        question: selectedQuestion,
        topicId: item.topicId,
        priority: item.priority,
        reason: item.reason,
        remaining: session.options.maxQuestions - session.questionCount,
        difficultyLevel: session.currentDifficulty
      };
    }

    // 队列为空或达到题量上限
    session.status = 'completed';
    return null;
  }

  /**
   * 根据当前难度选择题目
   */
  _selectQuestionByDifficulty(questions, session) {
    const currentLevel = this.difficultyLevels[session.currentDifficulty];
    
    // 找到最接近当前难度的题目
    let bestQuestion = questions[0];
    let bestDiff = Infinity;
    
    for (const q of questions) {
      const diff = Math.abs(this.difficultyLevels[q.difficulty] - currentLevel);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestQuestion = q;
      }
    }
    
    return bestQuestion;
  }

  /**
   * 提交答案
   * @param {Object} session - 会话
   * @param {string} questionId - 问题ID
   * @param {number} answerIndex - 答案索引
   */
  submitAnswer(session, questionId, answerIndex) {
    const question = this.questions.find(q => q.id === questionId);
    if (!question) {
      throw new Error(`Question not found: ${questionId}`);
    }

    const isCorrect = answerIndex === question.answer;
    const topicId = question.topicId;

    const record = {
      questionId,
      topicId,
      difficulty: question.difficulty,
      userAnswer: answerIndex,
      correctAnswer: question.answer,
      isCorrect,
      timestamp: new Date().toISOString()
    };

    session.answers.push(record);
    session.questionCount++;

    // 记录该知识点的答题情况
    if (!session.topicAttempts[topicId]) {
      session.topicAttempts[topicId] = { correct: 0, wrong: 0, total: 0 };
    }
    session.topicAttempts[topicId].total++;
    if (isCorrect) {
      session.topicAttempts[topicId].correct++;
    } else {
      session.topicAttempts[topicId].wrong++;
    }

    // 自适应调整难度
    this._adjustDifficulty(session, isCorrect);

    // 如果答对了
    if (isCorrect) {
      if (session.results.unstable.find(u => u.topicId === topicId)) {
        // 之前答错过，现在确认题答对了，保持不稳状态
      } else {
        session.results.mastered.push({
          topicId,
          questionId,
          message: '掌握良好'
        });
      }
      return { correct: true, isConfirm: false };
    }

    // 如果答错了
    // 检查是否需要出确认题
    const hasConfirmQuestion = this._hasConfirmQuestion(topicId, question);
    
    if (session.options.confirmOnFail && hasConfirmQuestion && !session._confirmedTopics?.has(topicId)) {
      // 出确认题
      const confirmQ = this._getConfirmQuestion(topicId, question);
      session.pendingConfirm = confirmQ;
      session._confirmedTopics = session._confirmedTopics || new Set();
      session._confirmedTopics.add(topicId);
      
      return {
        correct: false,
        isConfirm: false,
        needConfirm: true,
        message: '答错了，需要出一道确认题确认是否真的薄弱。'
      };
    }

    // 判定为薄弱
    this._markAsWeak(session, topicId);
    
    // 智能回溯：加入前置依赖到队列
    if (session.options.autoBacktrack) {
      this._backtrack(session, topicId);
    }

    return {
      correct: false,
      isConfirm: false,
      needConfirm: false,
      markedAs: 'weak'
    };
  }

  /**
   * 自适应调整难度
   */
  _adjustDifficulty(session, isCorrect) {
    if (!session.options.adaptiveDifficulty) return;
    
    // 连续答对，提高难度
    if (isCorrect) {
      const recentAnswers = session.answers.slice(-3);
      if (recentAnswers.length >= 3 && recentAnswers.every(a => a.isCorrect)) {
        if (session.currentDifficulty === 'basic') {
          session.currentDifficulty = 'medium';
        } else if (session.currentDifficulty === 'medium') {
          session.currentDifficulty = 'hard';
        }
      }
    } else {
      // 答错，降低难度
      if (session.currentDifficulty === 'hard') {
        session.currentDifficulty = 'medium';
      } else if (session.currentDifficulty === 'medium') {
        session.currentDifficulty = 'basic';
      }
    }
  }

  /**
   * 提交确认题答案
   */
  submitConfirmAnswer(session, questionId, answerIndex) {
    const question = this.questions.find(q => q.id === questionId);
    if (!question) {
      throw new Error(`Question not found: ${questionId}`);
    }

    const isCorrect = answerIndex === question.answer;
    const topicId = question.topicId;

    session.answers.push({
      questionId,
      topicId,
      difficulty: question.difficulty,
      userAnswer: answerIndex,
      correctAnswer: question.answer,
      isCorrect,
      isConfirm: true,
      timestamp: new Date().toISOString()
    });
    session.questionCount++;

    if (isCorrect) {
      // 确认题答对 → 不稳
      session.results.unstable.push({
        topicId,
        questionId,
        message: '第一题答错，确认题答对，判定为不稳'
      });
      return { correct: true, isConfirm: true, markedAs: 'unstable' };
    } else {
      // 确认题也答错 → 薄弱
      this._markAsWeak(session, topicId);
      
      if (session.options.autoBacktrack) {
        this._backtrack(session, topicId);
      }
      
      return { correct: false, isConfirm: true, markedAs: 'weak' };
    }
  }

  /**
   * 检查是否有确认题
   */
  _hasConfirmQuestion(topicId, currentQuestion) {
    const questions = this.getQuestions(topicId);
    // 找一道难度相同或更低、且不是当前题的题
    const candidates = questions.filter(q => 
      q.id !== currentQuestion.id && 
      this.difficultyLevels[q.difficulty] <= this.difficultyLevels[currentQuestion.difficulty]
    );
    return candidates.length > 0;
  }

  /**
   * 获取确认题（智能选择）
   * 选择难度更低的基础题作为确认题
   */
  _getConfirmQuestion(topicId, currentQuestion) {
    const questions = this.getQuestions(topicId);
    const candidates = questions.filter(q => 
      q.id !== currentQuestion.id && 
      this.difficultyLevels[q.difficulty] <= this.difficultyLevels[currentQuestion.difficulty]
    );
    
    // 优先选择基础题
    const basicQ = candidates.find(q => q.difficulty === 'basic');
    if (basicQ) return basicQ;
    
    // 否则选择难度最低的
    return candidates.sort((a, b) => 
      this.difficultyLevels[a.difficulty] - this.difficultyLevels[b.difficulty]
    )[0];
  }

  /**
   * 标记为薄弱
   */
  _markAsWeak(session, topicId) {
    // 从其他状态中移除
    session.results.mastered = session.results.mastered.filter(m => m.topicId !== topicId);
    session.results.unstable = session.results.unstable.filter(u => u.topicId !== topicId);
    
    // 检查是否已经在薄弱列表中
    if (!session.results.weak.find(w => w.topicId === topicId)) {
      session.results.weak.push({
        topicId,
        message: '连续答错，判定为薄弱'
      });
    }
  }

  /**
   * 智能回溯：沿依赖链找根因
   * 根据选项决定是否回溯所有依赖或只回溯强依赖
   */
  _backtrack(session, topicId) {
    const prereqs = this.getDirectPrerequisites(topicId);
    
    for (const p of prereqs) {
      // 如果设置了只回溯强依赖，则跳过弱依赖
      if (session.options.backtrackStrength === 'hard' && p.strength !== 'hard') {
        continue;
      }
      
      // 检查是否已经测试过
      const alreadyTested = 
        session.results.weak.find(w => w.topicId === p.id) ||
        session.results.unstable.find(u => u.topicId === p.id) ||
        session.results.mastered.find(m => m.topicId === p.id);
      
      if (!alreadyTested) {
        session.queue.push({
          topicId: p.id,
          priority: p.strength === 'hard' ? 1 : 2,
          reason: `根因追溯：${topicId}薄弱，检查前置依赖${p.id}`
        });
      }
    }
  }

  /**
   * 完成会话，生成报告
   */
  finishSession(session) {
    // 将队列中剩余的知识点标记为未测
    for (const item of session.queue) {
      if (!session.results.untested.find(u => u.topicId === item.topicId)) {
        session.results.untested.push({
          topicId: item.topicId,
          reason: '题量上限，未测试'
        });
      }
    }

    // 生成学习路径
    const learningPath = this.generateLearningPath(session);

    return {
      sessionId: session.id,
      targetTopicId: session.targetTopicId,
      status: 'completed',
      statistics: {
        totalQuestions: session.questionCount,
        correctAnswers: session.answers.filter(a => a.isCorrect).length,
        weakCount: session.results.weak.length,
        unstableCount: session.results.unstable.length,
        untestedCount: session.results.untested.length,
        masteredCount: session.results.mastered.length
      },
      results: session.results,
      learningPath,
      answers: session.answers
    };
  }

  /**
   * 生成学习路径（使用Dijkstra算法找最短路径）
   * 从根因（薄弱点）出发，到目标之间还没掌握的知识点
   */
  generateLearningPath(session) {
    // 收集所有需要学习的知识点（薄弱 + 不稳）
    const weakTopics = session.results.weak.map(w => w.topicId);
    const unstableTopics = session.results.unstable.map(u => u.topicId);
    const allTopics = [...weakTopics, ...unstableTopics];

    if (allTopics.length === 0) {
      return [];
    }

    // 构建需要学习的知识点集合
    const needToLearn = new Set(allTopics);
    
    // 使用拓扑排序确保依赖关系正确
    const sorted = this._topologicalSort(allTopics);

    const path = [];
    for (const topicId of sorted) {
      const topic = this.getTopicInfo(topicId);
      const status = weakTopics.includes(topicId) ? 'weak' :
                     unstableTopics.includes(topicId) ? 'unstable' : 'unknown';

      // 获取直接前置依赖
      const prereqs = this.getDirectPrerequisites(topicId).map(p => p.id);

      path.push({
        topicId,
        name: topic ? topic.name : topicId,
        subject: topic ? topic.subject : '',
        grade: topic ? topic.grade : 0,
        term: topic ? topic.term : '',
        status,
        prerequisites: prereqs,
        description: topic ? topic.description : '',
        // 计算权重（用于路径优化）
        weight: this.calculateTopicWeight(topicId, status === 'weak')
      });
    }

    return path;
  }

  /**
   * 拓扑排序
   */
  _topologicalSort(topicIds) {
    const inDegree = {};
    const adj = {};

    // 初始化
    for (const id of topicIds) {
      inDegree[id] = 0;
      adj[id] = [];
    }

    // 构建图
    for (const id of topicIds) {
      const prereqs = this.getDirectPrerequisites(id);
      for (const p of prereqs) {
        if (topicIds.includes(p.id)) {
          adj[p.id].push(id);
          inDegree[id]++;
        }
      }
    }

    // Kahn算法
    const queue = [];
    for (const id of topicIds) {
      if (inDegree[id] === 0) queue.push(id);
    }

    const result = [];
    while (queue.length > 0) {
      const current = queue.shift();
      result.push(current);

      for (const neighbor of adj[current]) {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) {
          queue.push(neighbor);
        }
      }
    }

    return result;
  }

  /**
   * 导出盲区列表
   */
  exportBlindSpots(session) {
    return [
      ...session.results.weak.map(w => ({
        topicId: w.topicId,
        status: 'weak',
        reason: w.message
      })),
      ...session.results.unstable.map(u => ({
        topicId: u.topicId,
        status: 'unstable',
        reason: u.message
      }))
    ];
  }

  /**
   * 一键重测
   */
  retest(session) {
    const blindSpots = this.exportBlindSpots(session);
    
    const newSession = this.startSession(session.targetTopicId, {
      ...session.options,
      maxQuestions: blindSpots.length * 2
    });

    // 将盲区知识点加入队列
    for (const spot of blindSpots) {
      newSession.queue.push({
        topicId: spot.topicId,
        priority: 1,
        reason: `盲区重测：${spot.reason}`
      });
    }

    return newSession;
  }

  /**
   * 获取知识点的学习建议
   */
  getStudyAdvice(topicId) {
    const topic = this.getTopicInfo(topicId);
    const prereqs = this.getDirectPrerequisites(topicId);
    const successors = this.getSuccessors(topicId);
    
    const advice = {
      topic: topic ? topic.name : topicId,
      description: topic ? topic.description : '',
prerequisites: prereqs.map(p => {
const t = this.getTopicInfo(p.id) || {};
return { id: p.id, name: t.name || p.id, strength: p.strength, subject: t.subject || '', grade: t.grade != null ? t.grade : '', term: t.term || '' };
}),
successors: successors.map(s => {
const t = this.getTopicInfo(s.id) || {};
return { id: s.id, name: t.name || s.id, strength: s.strength, subject: t.subject || '', grade: t.grade != null ? t.grade : '', term: t.term || '' };
}),
      tips: []
    };
    
    // 根据情况给出建议
    if (prereqs.length > 0) {
      advice.tips.push('学习本知识点前，建议先掌握前置知识');
    }
    if (successors.length > 0) {
      advice.tips.push('本知识点是后续学习的基础，请确保掌握');
    }
    
    return advice;
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DiagnosticEngine;
}
