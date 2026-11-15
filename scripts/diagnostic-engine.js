/**
 * 诊断引擎：基于知识图谱的自适应诊断系统
 * 
 * 核心机制：
 * 1. 三态判定：薄弱/不稳/未测
 * 2. 确认题机制：答错后自动出确认题
 * 3. 智能回溯：沿依赖链找根因
 * 4. 路径推荐：从根因到目标的学习路径
 */

class DiagnosticEngine {
  constructor(topics, dependencies, questions) {
    this.topics = topics;
    this.dependencies = dependencies;
    this.questions = questions;
    
    // 构建前置依赖映射：topicId -> [prerequisiteIds]
    this.prereqMap = this._buildPrereqMap();
    
    // 构建问题映射：topicId -> [questions]
    this.questionMap = this._buildQuestionMap();
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
   * 获取某个知识点的所有后继（依赖它的知识点）
   */
  getSuccessors(topicId) {
    const successors = [];
    for (const dep of this.dependencies) {
      if (dep.prerequisiteId === topicId) {
        successors.push({
          id: dep.topicId,
          strength: dep.strength || 'soft'
        });
      }
    }
    return successors;
  }

  /**
   * 获取某个知识点的诊断题
   */
  getQuestions(topicId) {
    return this.questionMap[topicId] || [];
  }

  /**
   * 开始诊断会话
   * @param {string} targetTopicId - 目标知识点
   * @param {Object} options - 配置选项
   */
  startSession(targetTopicId, options = {}) {
    const session = {
      targetTopicId,
      options: {
        maxQuestions: options.maxQuestions || 20,
        confirmOnFail: options.confirmOnFail !== false,
        autoBacktrack: options.autoBacktrack !== false,
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
      pendingConfirm: null
    };

    // 初始化队列：目标知识点的直接前置依赖
    const prereqs = this.getDirectPrerequisites(targetTopicId);
    for (const p of prereqs) {
      session.queue.push({
        topicId: p.id,
        priority: p.strength === 'hard' ? 1 : 2,
        reason: `前置依赖：${p.reason || '学习' + targetTopicId + '需要'}`
      });
    }

    return session;
  }

  /**
   * 获取下一道题
   */
  getNextQuestion(session) {
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

      // 选择一道题（优先基础题）
      const basicQ = questions.find(q => q.difficulty === 'basic') || questions[0];
      
      return {
        type: 'diagnostic',
        question: basicQ,
        topicId: item.topicId,
        priority: item.priority,
        reason: item.reason,
        remaining: session.options.maxQuestions - session.questionCount
      };
    }

    // 队列为空或达到题量上限
    session.status = 'completed';
    return null;
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
      this._difficultyLevel(q.difficulty) <= this._difficultyLevel(currentQuestion.difficulty)
    );
    return candidates.length > 0;
  }

  /**
   * 获取确认题
   */
  _getConfirmQuestion(topicId, currentQuestion) {
    const questions = this.getQuestions(topicId);
    const candidates = questions.filter(q => 
      q.id !== currentQuestion.id && 
      this._difficultyLevel(q.difficulty) <= this._difficultyLevel(currentQuestion.difficulty)
    );
    // 优先选择基础题
    return candidates.find(q => q.difficulty === 'basic') || candidates[0];
  }

  /**
   * 难度等级
   */
  _difficultyLevel(difficulty) {
    const levels = { basic: 1, medium: 2, hard: 3 };
    return levels[difficulty] || 2;
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
   */
  _backtrack(session, topicId) {
    const prereqs = this.getDirectPrerequisites(topicId);
    
    for (const p of prereqs) {
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
      sessionId: session._id || `session_${Date.now()}`,
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
   * 生成学习路径
   * 从根因（薄弱点）出发，到目标之间还没掌握的知识点
   */
  generateLearningPath(session) {
    const path = [];
    const visited = new Set();

    // 收集所有需要学习的知识点（薄弱 + 不稳）
    const weakAndUnstable = [
      ...session.results.weak.map(w => ({ topicId: w.topicId, type: 'weak' })),
      ...session.results.unstable.map(u => ({ topicId: u.topicId, type: 'unstable' }))
    ];

    // 按依赖关系排序（拓扑排序）
    const sorted = this._topologicalSort(weakAndUnstable.map(w => w.topicId));

    for (const topicId of sorted) {
      if (visited.has(topicId)) continue;
      visited.add(topicId);

      const topic = this.topics.find(t => t.id === topicId);
      const status = session.results.weak.find(w => w.topicId === topicId) ? 'weak' :
                     session.results.unstable.find(u => u.topicId === topicId) ? 'unstable' : 'unknown';

      // 获取直接前置依赖
      const prereqs = this.getDirectPrerequisites(topicId).map(p => p.id);

      path.push({
        topicId,
        name: topic ? topic.name : topicId,
        subject: topic ? topic.subject : '',
        grade: topic ? topic.grade : 0,
        term: topic ? term : '',
        status,
        prerequisites: prereqs,
        description: topic ? topic.description : ''
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
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DiagnosticEngine;
}
