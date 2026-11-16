/*!
 * CN-Primary-Taxonomy · 学生版主应用
 * 角色：student - 游戏化学习体验
 * 特征：星星奖励、正向激励、简洁界面
 */
(function() {
  'use strict';

  const state = {
    role: 'student',
    fullData: null,
    storage: null,
    fsrs: null,
    diag: null,
    stars: 0,
    currentSubject: null,
    currentGrade: null,
    currentTopic: null
  };

  const DOM = {};

  /**
   * 增强字段 HTML（AI 生成初稿：一句话/家长指南/随堂小题三级提示）
   */
  function buildEnhancedHtml(topic, variant) {
    if (window.CNPT?.components?.buildEnhancedHtml) {
      return CNPT.components.buildEnhancedHtml(topic, variant);
    }
    return '';
  }

  function cacheDom() {
    DOM.app = document.getElementById('app');
    DOM.starCount = document.getElementById('star-count');
    DOM.statMastered = document.getElementById('stat-mastered');
    DOM.statLearning = document.getElementById('stat-learning');
    DOM.statStars = document.getElementById('stat-stars');
    DOM.subjectGrid = document.getElementById('subject-grid');
    DOM.topicSection = document.getElementById('topic-section');
    DOM.topicFilters = document.getElementById('topic-filters');
    DOM.topicList = document.getElementById('topic-list');
    DOM.detailCard = document.getElementById('detail-card');
    DOM.detailName = document.getElementById('detail-name');
    DOM.detailBody = document.getElementById('detail-body');
    DOM.detailClose = document.getElementById('detail-close');
    DOM.backToSubjects = document.getElementById('back-to-subjects');
    DOM.currentSubjectTitle = document.getElementById('current-subject-title');
    DOM.practiceModal = document.getElementById('practice-modal');
    DOM.practiceTitle = document.getElementById('practice-title');
    DOM.practiceBody = document.getElementById('practice-body');
    DOM.practiceClose = document.getElementById('practice-close');
    DOM.encourageBar = document.getElementById('encourage-bar');
    DOM.mascot = document.getElementById('mascot');
    DOM.mascotBubble = document.getElementById('mascot-bubble');
    DOM.modeSwitch = document.getElementById('mode-switch');
  }

  // showLoadError 已移至共享组件 CNPT.components.showLoadError

  async function init() {
    cacheDom();
    state.storage = CNPT.storage.create('student');
    state.stars = state.storage.getStars();
    state.storage.updateConsecutiveDays();

    try {
      state.fullData = await CNPT.dataLoader.loadAllData();
    } catch (err) {
      console.error('数据加载失败:', err);
      CNPT.components.showLoadError('加载失败啦，点击按钮再试一次吧', { role: 'student' });
      return;
    }

    CNPT.indices.buildIndices(state.fullData);
    if (CNPT.components.initNodeDetail) CNPT.components.initNodeDetail();
    initFsrsAndDailyPlan();
    updateStats();
    renderSubjectGrid();
    initEvents();
    CNPT.components.showMascotTip('你好呀！👋 选择一个学科开始吧~');

    // 初始化错误反馈组件（P0 合规要求）
    if (CNPT.components.initErrorFeedback) {
  if (CNPT.components.initBookmarks) { CNPT.components.initBookmarks(); }
  if (CNPT.components.initVoiceSearch) { CNPT.components.initVoiceSearch(); }
  if (CNPT.components.initShareCard) { CNPT.components.initShareCard(); }
  if (CNPT.components.initPWA) { CNPT.components.initPWA(); }
  if (CNPT.components.initDataExport) { CNPT.components.initDataExport(); }

    // 初始化主题管理器（主题切换+字号控制）
    if (CNPT.components.initThemeManager) {

    // 初始化入门引导（首次使用显示）
    if (CNPT.components.initOnboarding) {

    // 初始化搜索历史
    if (CNPT.components.initSearchHistoryAuto) {
      CNPT.components.initSearchHistoryAuto();
    }
      CNPT.components.initOnboarding();
    }
      CNPT.components.initThemeManager();
    }
      CNPT.components.initErrorFeedback();
    }

    // 隐藏加载指示器
    CNPT.utils.hideLoadingScreen();
  }

  function updateStats() {
    const stats = state.storage.getStats();
    DOM.starCount.textContent = state.stars;
    DOM.statMastered.textContent = stats.mastered;
    DOM.statLearning.textContent = stats.learning;
    DOM.statStars.textContent = state.stars;
  }

  function renderSubjectGrid() {
    const subjects = {};
    state.fullData.topics.topics.forEach(t => {
      if (!subjects[t.subject]) subjects[t.subject] = 0;
      subjects[t.subject]++;
    });

    DOM.subjectGrid.innerHTML = Object.entries(subjects).map(([name, count]) => {
      const color = CNPT.constants.COLORS[name] || '#888';
      const icon = getSubjectIcon(name);
      return `
        <div class="cnpt-subject-card" data-subject="${name}">
          <div class="cnpt-subject-icon">${icon}</div>
          <div class="cnpt-subject-name">${name}</div>
          <div class="cnpt-subject-count">${count} 个知识点</div>
          <div class="cnpt-subject-dot" style="background:${color}"></div>
        </div>
      `;
    }).join('');

    DOM.subjectGrid.querySelectorAll('.cnpt-subject-card').forEach(card => {
      card.addEventListener('click', () => {
        const subject = card.dataset.subject;
        state.currentSubject = subject;
        showTopicsForSubject(subject);
      });
    });
  }

  function showTopicsForSubject(subject) {
    const topics = state.fullData.topics.topics.filter(t => t.subject === subject);
    const grades = [...new Set(topics.map(t => t.grade))].sort((a, b) => a - b);
    state.currentGrade = grades[0];

    DOM.currentSubjectTitle.textContent = subject;
    DOM.topicSection.classList.remove('cnpt-hidden');

    // 渲染年级筛选
    DOM.topicFilters.innerHTML = grades.map(g =>
      `<button class="cnpt-topic-filter ${g === state.currentGrade ? 'active' : ''}" data-grade="${g}">${g}年级</button>`
    ).join('');

    DOM.topicFilters.querySelectorAll('.cnpt-topic-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        DOM.topicFilters.querySelectorAll('.cnpt-topic-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.currentGrade = parseInt(btn.dataset.grade);
        renderTopicList();
      });
    });

    renderTopicList();
  }

  function renderTopicList() {
    const topics = state.fullData.topics.topics.filter(t =>
      t.subject === state.currentSubject && t.grade === state.currentGrade
    );

    if (topics.length === 0) {
      DOM.topicList.innerHTML = '<div class="cnpt-empty">这个年级还没有知识点哦</div>';
      return;
    }

    const mastery = state.storage.getMastery();
    DOM.topicList.innerHTML = topics.map(t => {
      const status = mastery[t.id];
      const icon = status === 'mastered' ? '✅' : status === 'learning' ? '📖' : '⏳';
      const color = CNPT.constants.COLORS[t.subject] || '#888';
      return `
        <div class="cnpt-topic-item" data-id="${t.id}">
          <div class="cnpt-topic-dot" style="background:${color}"></div>
          <div class="cnpt-topic-info">
            <div class="cnpt-topic-name">${CNPT.utils.escapeHtml(t.name)}</div>
            <div class="cnpt-topic-meta">${t.term || ''} · ${CNPT.constants.DIFFICULTY(t.difficulty || 3)}</div>
          </div>
          <div class="cnpt-topic-status">${icon}</div>
        </div>
      `;
    }).join('');

    DOM.topicList.querySelectorAll('.cnpt-topic-item').forEach(item => {
      item.addEventListener('click', () => showTopicDetail(item.dataset.id));
    });
  }

  function showTopicDetail(topicId) {
    const topic = CNPT.indices.getTopicMap().get(topicId);
    if (!topic) return;

    state.currentTopic = topic;
    const status = state.storage.getTopicStatus(topicId);
    const color = CNPT.constants.COLORS[topic.subject] || '#888';

    DOM.detailName.textContent = topic.name;
    DOM.detailBody.innerHTML = `
      <div class="cnpt-detail-desc">${CNPT.utils.escapeHtml(topic.description || '暂无描述')}</div>

      ${buildEnhancedHtml(topic, 'student')}

      <div class="cnpt-mastery-row">
        <button class="cnpt-mastery-btn ${status === 'mastered' ? 'active' : ''}" data-mastery="mastered">✅ 我学会啦</button>
        <button class="cnpt-mastery-btn ${status === 'learning' ? 'active' : ''}" data-mastery="learning">📖 正在学</button>
        <button class="cnpt-mastery-btn ${status === 'not-started' ? 'active' : ''}" data-mastery="not-started">⏳ 还没学</button>
      </div>

      <div class="cnpt-detail-section">
        <h4>🎯 要学会什么</h4>
        <ul>${(topic.evidence || []).map(e => `<li>${CNPT.utils.escapeHtml(e)}</li>`).join('') || '<li>跟着课本学习就好~</li>'}</ul>
      </div>

      ${topic.commonMistakes && topic.commonMistakes.length ? `
        <div class="cnpt-detail-section">
          <h4>💡 小提示</h4>
          <ul>${topic.commonMistakes.map(e => `<li>${CNPT.utils.escapeHtml(e)}</li>`).join('')}</ul>
        </div>
      ` : ''}

      ${topic.modelRef && window.CNPT?.components?.visualModels?.MODELS?.[topic.modelRef] ? `
        <div class="cnpt-detail-section">
          <h4>🎥 拖一拖，看变化</h4>
          <div class="cnpt-vm-slot" data-model="${CNPT.utils.escapeHtml(topic.modelRef)}"></div>
        </div>
      ` : ''}

      <div class="cnpt-detail-actions">
        <button class="cnpt-detail-btn primary" id="btn-practice">✏️ 做练习</button>
        <button class="cnpt-detail-btn secondary" id="btn-path">🗺️ 学习路线</button>
        ${Array.isArray(topic.wordList) && topic.wordList.length ? '<button class="cnpt-detail-btn secondary" id="btn-spelling">🔤 拼写闯关</button>' : ''}
      </div>
    `;

    // 会动的模型
    if (topic.modelRef && window.CNPT?.components?.visualModels?.render) {
      const slot = DOM.detailBody.querySelector('.cnpt-vm-slot');
      if (slot) CNPT.components.visualModels.render(slot, slot.dataset.model);
    }

    // 增强字段交互（三级折叠提示 + 随堂小题）
    if (window.CNPT?.components?.bindEnhancedEvents) {
      CNPT.components.bindEnhancedEvents(DOM.detailBody, topic);
    }

    // 掌握状态
    DOM.detailBody.querySelectorAll('.cnpt-mastery-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.storage.setTopicStatus(topicId, btn.dataset.mastery);
        updateStats();
        renderTopicList();
        showTopicDetail(topicId);
      });
    });

    // 练习
    document.getElementById('btn-practice').addEventListener('click', () => {
      startPractice(topic);
    });

    // 学习路线
    document.getElementById('btn-path').addEventListener('click', () => {
      showLearningPath(topic);
    });

    // 拼写闯关（四轮记忆法）
    const btnSpelling = document.getElementById('btn-spelling');
    if (btnSpelling) {
      btnSpelling.addEventListener('click', () => startSpelling(topic));
    }

    DOM.detailCard.classList.remove('cnpt-hidden');
  }

  function startSpelling(topic) {
    if (!Array.isArray(topic.wordList) || !topic.wordList.length) {
      CNPT.utils.showToast('这个词还没有词表，请老师导入后再来闯关~');
      return;
    }
    if (window.CNPT.components.dailyPlan) {
      window.CNPT.components.dailyPlan.setSessionKind('new');
    }
    DOM.practiceModal.classList.remove('cnpt-hidden');
    setTimeout(() => DOM.practiceModal.classList.add('show'), 10);
    DOM.practiceTitle.textContent = `${topic.name} · 拼写闯关`;
    CNPT.components.spellingQuest.render(DOM.practiceBody, topic.wordList, {
      topicId: topic.id,
      onResult: (result) => {
        if (state.fsrs) {
          state.fsrs.recordAnswer({
            topicId: topic.id,
            isCorrect: result.passed,
            isIndependent: true,
            confidence: result.passed ? 100 : 25,
            questionInfo: {
              questionId: `${topic.id}-spelling`,
              question: `拼写闯关（${result.records.length} 词）`,
              answer: 'passed',
              selected: result.passed ? 'passed' : 'failed'
            }
          });
        }
        if (result.passed) {
          addStar();
          CNPT.components.showEncourage('🌟 单词闯关成功！');
        } else {
          CNPT.utils.showToast('💪 练完一组，明天再来一轮会更牢！');
        }
        updateStats();
        renderTopicList();
      }
    });
  }

  function startPractice(topic) {
    const questions = generateQuestions(topic);
    if (!questions.length) {
      CNPT.utils.showToast('这个知识点的练习题还在准备中~');
      return;
    }

    if (window.CNPT.components.dailyPlan) {
      const st = state.fsrs && state.fsrs.getStatus(topic.id);
      window.CNPT.components.dailyPlan.setSessionKind(st && st.isDue ? 'review' : 'new');
    }

    DOM.practiceModal.classList.remove('cnpt-hidden');
    setTimeout(() => DOM.practiceModal.classList.add('show'), 10);
    DOM.practiceTitle.textContent = `${topic.name} · 练习`;
    showPracticeQuestion(questions, 0, topic);
  }

  function generateQuestions(topic) {
    const questions = [];
    if (topic.commonMistakes && topic.commonMistakes.length) {
      questions.push({
        type: 'choice',
        question: `关于"${topic.name}"，下面哪个说法是对的？`,
        options: [topic.commonMistakes[0], topic.evidence?.[0] || '认真思考', '随便猜一个', '放弃不做'],
        answer: 1
      });
    }
    if (topic.description) {
      questions.push({
        type: 'judge',
        question: `${topic.description.slice(0, 25)}...... 这个说法对吗？`,
        answer: true
      });
    }
    return questions.slice(0, 2);
  }

  function showPracticeQuestion(questions, idx, topic) {
    if (idx >= questions.length) {
      DOM.practiceBody.innerHTML = `
        <div class="cnpt-practice-result">
          <div class="icon">🎉</div>
          <div class="text" style="color:#4CAF50">练习完成！</div>
          <div class="sub">获得一颗小星星 ⭐</div>
        </div>
      `;
      addStar();
      return;
    }

    const q = questions[idx];
    let html = `<div class="cnpt-practice-question">${idx + 1}. ${CNPT.utils.escapeHtml(q.question)}</div>`;

    // 作答前信心（FSRS 信心校准）
    html += `
      <div class="pq-confidence">
        <span class="pq-conf-label">作答前信心</span>
        <button class="pq-conf" data-c="25">😕 没把握</button>
        <button class="pq-conf pq-conf-on" data-c="50">🤔 有点虚</button>
        <button class="pq-conf" data-c="75">🙂 有把握</button>
        <button class="pq-conf" data-c="100">🤩 很有把握</button>
      </div>`;

    html += '<div class="cnpt-practice-options">';

    if (q.type === 'choice') {
      q.options.forEach((opt, i) => {
        html += `<button class="cnpt-practice-option" data-idx="${i}">${String.fromCharCode(65 + i)}. ${CNPT.utils.escapeHtml(opt)}</button>`;
      });
    } else if (q.type === 'judge') {
      html += `<button class="cnpt-practice-option" data-idx="0">✓ 对的</button>`;
      html += `<button class="cnpt-practice-option" data-idx="1">✗ 不对</button>`;
    }

    html += '</div>';
    DOM.practiceBody.innerHTML = html;

    let confidence = 50;
    DOM.practiceBody.querySelectorAll('.pq-conf').forEach(btn => {
      btn.addEventListener('click', () => {
        DOM.practiceBody.querySelectorAll('.pq-conf').forEach(b => b.classList.remove('pq-conf-on'));
        btn.classList.add('pq-conf-on');
        confidence = parseInt(btn.dataset.c, 10);
      });
    });

    DOM.practiceBody.querySelectorAll('.cnpt-practice-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const selected = parseInt(opt.dataset.idx);
        const correct = q.type === 'judge' ? (selected === 0) : (selected === q.answer);

        /** 统一记录：FSRS（首做/复习分离 + 信心 + 错因）+ 错题两步闭环 */
        const finish = (extra) => {
          const payload = Object.assign({
            topicId: topic.id,
            isCorrect: correct,
            isIndependent: true,
            confidence,
            questionInfo: {
              questionId: `${topic.id}-${idx}`,
              question: q.question,
              options: q.options || null,
              answer: q.answer,
              selected
            }
          }, extra || {});
          if (state.fsrs) state.fsrs.recordAnswer(payload);
          if (!correct && state.diag) {
            state.diag.registerWrong(topic, {
              questionId: `${topic.id}-${idx}`,
              question: q.question,
              options: q.options || null,
              answer: q.answer,
              selected
            });
          }
        };

        setTimeout(() => {
          if (correct) {
            opt.classList.add('correct');
            CNPT.components.showEncourage(['⭐ 太棒了！', '🌟 你真聪明！', '✨ 继续加油！'][Math.floor(Math.random() * 3)]);
            addStar();
            finish();
            setTimeout(() => showPracticeQuestion(questions, idx + 1, topic), 800);
          } else {
            opt.classList.add('wrong');
            CNPT.utils.showToast('💡 差一点哦~再想想');
            // 错因探针：先选错因（可跳过），再进入下一题
            showReasonPicker(DOM.practiceBody, (reason, lowType) => {
              finish({
                reason: reason || null,
                isLowLevel: reason === 'LOW',
                lowLevelType: lowType || null
              });
              setTimeout(() => showPracticeQuestion(questions, idx + 1, topic), 600);
            });
          }
        }, 400);
      });
    });
  }

  function showLearningPath(topic) {
    const path = CNPT.path.buildLearningPath(topic.id, { maxNodes: 5, masteryData: state.storage.getMastery() });
    DOM.detailBody.innerHTML = `
      <div class="cnpt-detail-desc">
        <b>🗺️ 推荐学习顺序</b><br><br>
        ${path.map((t, i) => {
          const status = state.storage.getTopicStatus(t.id);
          const icon = status === 'mastered' ? '✅' : status === 'learning' ? '📖' : '⏳';
          return `<div style="padding:6px 0;border-bottom:1px solid #eee">${icon} ${i + 1}. ${CNPT.utils.escapeHtml(t.name)}</div>`;
        }).join('')}
        <br><button class="cnpt-detail-btn primary" id="btn-back-detail" style="margin-top:8px">← 返回详情</button>
      </div>
    `;
    document.getElementById('btn-back-detail').addEventListener('click', () => showTopicDetail(topic.id));
  }

  function addStar() {
    state.stars = state.storage.addStar();
    updateStats();
    CNPT.components.showStarBurst();
  }

    // showStarBurst/showMascotTip/showEncourage 已移至共享组件 CNPT.components

  function initEvents() {
    DOM.detailClose.addEventListener('click', () => DOM.detailCard.classList.add('cnpt-hidden'));
    DOM.backToSubjects.addEventListener('click', () => DOM.topicSection.classList.add('cnpt-hidden'));
    DOM.practiceClose.addEventListener('click', () => {
      DOM.practiceModal.classList.remove('show');
      setTimeout(() => DOM.practiceModal.classList.add('cnpt-hidden'), 250);
    });
    DOM.practiceModal.addEventListener('click', (e) => {
      if (e.target === DOM.practiceModal) {
        DOM.practiceModal.classList.remove('show');
        setTimeout(() => DOM.practiceModal.classList.add('cnpt-hidden'), 250);
      }
    });
    DOM.mascot.addEventListener('click', () => {
      const tips = [
        "你可以选择一个学科，看看有哪些知识圆球！",
        "做对练习可以获得小星星哦！加油！",
        "如果觉得难，可以先看看前面的知识",
        "你已经很棒了！休息一下也没关系~",
        "学知识就像爬楼梯，一步一步来"
      ];
      CNPT.components.showMascotTip(tips[Math.floor(Math.random() * tips.length)]);
    });
    DOM.modeSwitch.addEventListener('click', () => {
      window.location.href = '../parent-web/index.html';
    });
  }

  /**
   * 错因探针（P01-P11 + 低级失误）：答错后先定位错因，再进入下一题
   * 选“低级失误”会写入独立的低级失误台账
   */
  function showReasonPicker(container, done) {
    const reasons = window.CNPT.fsrs && CNPT.fsrs.buildReasonOptions
      ? CNPT.fsrs.buildReasonOptions()
      : [];
    if (!reasons.length) { done(); return; }

    const picker = document.createElement('div');
    picker.className = 'pq-reason';
    picker.innerHTML = `
      <div class="pq-reason-title">🤔 这一步卡在哪？（选错因能帮你下次避坑）</div>
      <div class="pq-reason-grid">
        ${reasons.map(r => `<button class="pq-reason-btn" data-reason="${r.value}">${r.label}</button>`).join('')}
      </div>
      <button class="pq-reason-skip">跳过，直接看下一题 →</button>
    `;
    container.appendChild(picker);

    picker.querySelectorAll('[data-reason]').forEach(btn => {
      btn.addEventListener('click', () => {
        const reason = btn.dataset.reason;
        if (reason === 'LOW') {
          const types = (window.CNPT.fsrs && CNPT.fsrs.LOW_LEVEL_TYPES) || ['未分类'];
          picker.innerHTML = `
            <div class="pq-reason-title">🤔 哪一类低级失误？（单独记账，先改习惯再谈正确率）</div>
            <div class="pq-reason-grid">
              ${types.map(t => `<button class="pq-reason-btn" data-low="${t}">${t}</button>`).join('')}
            </div>
            <button class="pq-reason-skip">跳过，直接看下一题 →</button>
          `;
          picker.querySelectorAll('[data-low]').forEach(b => {
            b.addEventListener('click', () => {
              const lowType = b.dataset.low;
              picker.remove();
              done('LOW', lowType);
            });
          });
          picker.querySelector('.pq-reason-skip').addEventListener('click', () => {
            picker.remove();
            done('LOW', null);
          });
          return;
        }
        picker.remove();
        done(reason, null);
      });
    });
    picker.querySelector('.pq-reason-skip').addEventListener('click', () => {
      picker.remove();
      done(null, null);
    });
  }

  function closePractice() {
    DOM.practiceModal.classList.remove('show');
    setTimeout(() => DOM.practiceModal.classList.add('cnpt-hidden'), 250);
  }

  /**
   * 重测 / 次日盲测：单题窗口（不看解析，独立作答）
   * kind = 'retest'（第 1 步）| 'blind'（第 2 步）
   */
  function openRetest(item, kind) {
    if (!state.diag) return;
    const isBlind = kind === 'blind';
    DOM.practiceModal.classList.remove('cnpt-hidden');
    setTimeout(() => DOM.practiceModal.classList.add('show'), 10);
    DOM.practiceTitle.textContent = isBlind ? '🌅 次日盲测 · 不看提示' : '🔬 错题重测 · 第 1 步';
    const opts = (item.options || []).map((o, i) =>
      `<button class="cnpt-practice-option" data-idx="${i}">${String.fromCharCode(65 + i)}. ${CNPT.utils.escapeHtml(o)}</button>`
    ).join('');
    DOM.practiceBody.innerHTML = `
      ${item.aiGenerated ? '<div class="pq-ai-note">🤖 本题由 AI 生成初稿，未经学科教师审核。</div>' : ''}
      <div class="cnpt-practice-question">${CNPT.utils.escapeHtml(item.question)}</div>
      <div class="cnpt-practice-options">${opts}</div>
    `;
    DOM.practiceBody.querySelectorAll('.cnpt-practice-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const selected = parseInt(btn.dataset.idx, 10);
        const correct = selected === item.answer;
        btn.classList.add(correct ? 'correct' : 'wrong');
        setTimeout(() => {
          if (isBlind) state.diag.answerBlindTest(item.topicId, correct);
          else state.diag.answerRetest(item.topicId, correct);
          CNPT.utils.showToast(correct
            ? (isBlind ? '🎉 盲测通过，这个知识点闭环啦！' : '✅ 重测通过，明天再来一次盲测')
            : '💡 还没过，20 分钟后重测');
          setTimeout(closePractice, 900);
        }, 500);
      });
    });
  }

  /**
   * 预检跳课：3 题全对 → 直接标记掌握
   */
  function openPrecheck(topic) {
    if (!state.diag) { startPractice(topic); return; }
    const questions = [0, 1, 2].map(i => state.diag.pickQuestion(topic, i)).filter(Boolean);
    if (!questions.length) {
      CNPT.utils.showToast('这个知识点暂时没有预检题，直接开始学习吧');
      startPractice(topic);
      return;
    }

    state.diag.startPrecheck(topic.id);
    DOM.practiceModal.classList.remove('cnpt-hidden');
    setTimeout(() => DOM.practiceModal.classList.add('show'), 10);
    DOM.practiceTitle.textContent = `⚡ 预检 · ${topic.name}`;
    let idx = 0;

    const showPrecheckQuestion = () => {
      const q = questions[idx];
      DOM.practiceBody.innerHTML = `
        <div class="pq-ai-note">🤖 预检题由 AI 生成初稿，未经学科教师审核，仅供分流参考。</div>
        <div class="cnpt-practice-question">${idx + 1}/${questions.length}. ${CNPT.utils.escapeHtml(q.question)}</div>
        <div class="cnpt-practice-options">
          ${q.options.map((opt, i) => `<button class="cnpt-practice-option" data-idx="${i}">${String.fromCharCode(65 + i)}. ${CNPT.utils.escapeHtml(opt)}</button>`).join('')}
        </div>
      `;
      DOM.practiceBody.querySelectorAll('.cnpt-practice-option').forEach(btn => {
        btn.addEventListener('click', () => {
          const selected = parseInt(btn.dataset.idx, 10);
          const correct = selected === q.answer;
          btn.classList.add(correct ? 'correct' : 'wrong');
          state.diag.answerPrecheck(topic.id, correct);
          setTimeout(() => {
            if (correct) {
              idx++;
              if (idx < questions.length) { showPrecheckQuestion(); return; }
              CNPT.utils.showToast('🎉 预检全对，已标记掌握，跳过正式学习！');
            } else {
              CNPT.utils.showToast('💡 预检未过，直接从练习开始学吧');
            }
            setTimeout(closePractice, 900);
          }, 500);
        });
      });
    };

    showPrecheckQuestion();
  }

  /**
   * FSRS 间隔复习 + 今日学习台（75 分钟预算 / 先复习后新学 / 知识边界硬约束）
   */
  function initFsrsAndDailyPlan() {
    if (!window.CNPT.fsrs || !window.CNPT.components.initDailyPlan) return;
    state.fsrs = CNPT.fsrs.create('student');
    state.diag = window.CNPT.diagnostic ? CNPT.diagnostic.create('student') : null;
    CNPT.components.initDailyPlan({
      role: 'student',
      topicMap: CNPT.indices.getTopicMap(),
      getIncoming: (id) => CNPT.indices.getIncoming(id),
      isMastered: (id) => isTopicMastered(id),
      diagnostic: state.diag,
      mount: 'daily-plan',
      onStartTopic: (topic) => {
        showTopicDetail(topic.id);
        setTimeout(() => startPractice(topic), 250);
      },
      onStartRetest: (item) => openRetest(item, 'retest'),
      onStartBlindTest: (item) => openRetest(item, 'blind'),
      onStartPrecheck: (topic) => openPrecheck(topic)
    });
  }

  function isTopicMastered(topicId) {
    if (state.storage.getTopicStatus(topicId) === 'mastered') return true;
    const card = state.fsrs && state.fsrs.getStatus(topicId);
    if (!card) return false;
    return card.dormant || card.consecutiveCorrect >= 2;
  }

  function getSubjectIcon(subject) {
    const icons = {
      '语文': '📚', '数学': '🔢', '英语': '🌍', '科学': '🔬',
      '道德与法治': '⚖️', '劳动': '🛠️', '体育与健康': '⚽',
      '美术': '🎨', '音乐': '🎵', '信息科技': '💻', 'AI素养': '🤖'
    };
    return icons[subject] || '📖';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();