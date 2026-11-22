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
    rcd: null,
    rcdSession: null,
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
    DOM.rcdModal = document.getElementById('rcd-modal');
    DOM.rcdTitle = document.getElementById('rcd-title');
    DOM.rcdBody = document.getElementById('rcd-body');
    DOM.rcdClose = document.getElementById('rcd-close');
    DOM.btnRcd = document.getElementById('btn-rcd');
    DOM.themeModal = document.getElementById('theme-modal');
    DOM.themeTitle = document.getElementById('theme-title');
    DOM.themeBody = document.getElementById('theme-body');
    DOM.themeClose = document.getElementById('theme-close');
    DOM.btnTheme = document.getElementById('btn-theme');
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
    initRootCauseDiagnosis();
    initThemeLearning();
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
  if (CNPT.components.initDataExport) { CNPT.components.initDataExport({ role: 'student' }); }

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
        <button class="cnpt-detail-btn secondary" id="btn-rcd">🔍 根因诊断</button>
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

    // 根因诊断（从目标考点回溯找“病根”）
    const btnRcd = document.getElementById('btn-rcd');
    if (btnRcd) {
      btnRcd.addEventListener('click', () => openRcdPicker(topic.id));
    }

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

  /**
   * 根因回溯诊断（借鉴 cn-math-taxonomy）：
   * 从目标考点开始测 → 答错先出确认题 → 确认也错判薄弱 → 沿 hard 前置回溯 → 生成补学路线
   */
  function initRootCauseDiagnosis() {
    if (!window.CNPT.rootCause) return;
    state.rcd = CNPT.rootCause.create('student');
    DOM.rcdClose.addEventListener('click', closeRcd);
    DOM.rcdModal.addEventListener('click', (e) => { if (e.target === DOM.rcdModal) closeRcd(); });
    if (DOM.btnRcd) DOM.btnRcd.addEventListener('click', () => openRcdPicker());
  }

  function openRcdModal() {
    DOM.rcdModal.classList.remove('cnpt-hidden');
    setTimeout(() => DOM.rcdModal.classList.add('show'), 10);
  }

  function closeRcd() {
    DOM.rcdModal.classList.remove('show');
    setTimeout(() => DOM.rcdModal.classList.add('cnpt-hidden'), 250);
  }

  function openRcdPicker(presetId) {
    state.rcdSession = null;
    DOM.rcdTitle.textContent = '🔍 根因诊断';
    renderRcdPicker(presetId);
    openRcdModal();
  }

  function renderRcdPicker(presetId) {
    const history = state.rcd.getHistory();
    const candidates = [...CNPT.indices.getTopicMap().values()]
      .filter(t => !isTopicMastered(t.id))
      .slice(0, 12);
    DOM.rcdBody.innerHTML = `
      <div class="rcd-ai-note">🤖 诊断题多为 AI 生成初稿，未经学科教师逐条审核，结果仅供学习参考。</div>
      <div class="rcd-picker-tip">选一个你觉得“好像会了”的知识点测一测，找出真正卡住的“病根”。</div>
      <input class="rcd-search" id="rcd-search" type="text" placeholder="搜索知识点…" />
      <div class="rcd-cand-list" id="rcd-cand-list">
        ${candidates.map(t => `<button class="rcd-cand" data-id="${t.id}">${CNPT.utils.escapeHtml(t.name)}<span>${t.subject} · ${t.grade}年级</span></button>`).join('')}
      </div>
      ${history.length ? `<div class="rcd-history"><div class="rcd-history-title">最近诊断</div>${history.slice(0, 3).map(h => `<div class="rcd-history-item">🎯 ${CNPT.utils.escapeHtml((h.target && h.target.name) || h.target.topicId || '')} · 薄弱 ${h.statistics.weakCount} · 不稳 ${h.statistics.unstableCount}</div>`).join('')}</div>` : ''}
    `;
    const search = document.getElementById('rcd-search');
    const list = document.getElementById('rcd-cand-list');
    const renderList = (items) => {
      list.innerHTML = items.length
        ? items.map(t => `<button class="rcd-cand" data-id="${t.id}">${CNPT.utils.escapeHtml(t.name)}<span>${t.subject} · ${t.grade}年级</span></button>`).join('')
        : '<div class="rcd-empty">没有找到这个知识点</div>';
      list.querySelectorAll('.rcd-cand').forEach(btn => {
        btn.addEventListener('click', () => startRcdSession(btn.dataset.id));
      });
    };
    search.addEventListener('input', () => {
      const k = search.value.trim();
      const items = k
        ? [...CNPT.indices.getTopicMap().values()].filter(t => t.name && t.name.includes(k)).slice(0, 12)
        : candidates;
      renderList(items);
    });
    renderList(candidates);

    if (presetId) {
      const t = CNPT.indices.getTopicMap().get(presetId);
      if (t) {
        list.innerHTML = `<div class="rcd-preset">目标考点：<b>${CNPT.utils.escapeHtml(t.name)}</b>（${t.subject} · ${t.grade}年级）</div><button class="cnpt-detail-btn primary" id="rcd-go">开始诊断 →</button>`;
        document.getElementById('rcd-go').addEventListener('click', () => startRcdSession(presetId));
      }
    }
  }

  function startRcdSession(targetId) {
    state.rcdSession = state.rcd.start(targetId, {
      maxQuestions: 15,
      isMastered: (id) => isTopicMastered(id)
    });
    DOM.rcdTitle.textContent = '🔍 根因诊断';
    renderRcdQuestion();
  }

  function renderRcdQuestion() {
    const item = state.rcd.next(state.rcdSession);
    if (!item) {
      renderRcdReport(state.rcd.finish(state.rcdSession));
      return;
    }
    const q = item.question;
    const p = item.progress;
    DOM.rcdBody.innerHTML = `
      <div class="rcd-progress">第 ${p.answered + 1} 题 / 上限 ${p.limit} · 薄弱 ${p.weak} · 不稳 ${p.unstable}${p.advance ? ` · 进阶 ${p.advance}` : ''}</div>
      ${item.type === 'confirm' ? '<div class="rcd-confirm-tag">确认题 · 再确认一次</div>' : ''}
      ${item.isAdvance ? '<div class="rcd-advance-tag">⬆️ 进阶综合题 · 已掌握前置，挑战更综合的下游应用</div>' : ''}
      ${q.difficulty ? `<div class="rcd-diff-tag diff-${q.difficulty}">难度 · ${(CNPT.rootCause.DIFFICULTY_NAMES || {})[q.difficulty] || q.difficulty}</div>` : ''}
      <div class="rcd-topic">${CNPT.utils.escapeHtml((item.topic && item.topic.name) || '')}<span>${(item.topic && item.topic.subject) || ''} · ${(item.topic && item.topic.grade) || ''}年级</span></div>
      <div class="cnpt-practice-question">${CNPT.utils.escapeHtml(q.question)}</div>
      <div class="cnpt-practice-options">
        ${q.options.map((opt, i) => `<button class="cnpt-practice-option" data-idx="${i}">${String.fromCharCode(65 + i)}. ${CNPT.utils.escapeHtml(opt)}</button>`).join('')}
      </div>
      <div class="rcd-msg">${CNPT.utils.escapeHtml(item.message || '')}</div>
    `;
    DOM.rcdBody.querySelectorAll('.cnpt-practice-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        const res = item.type === 'confirm'
          ? state.rcd.answerConfirm(state.rcdSession, q.id, idx)
          : state.rcd.answer(state.rcdSession, q.id, idx);
        btn.classList.add(res.correct ? 'correct' : 'wrong');
        DOM.rcdBody.querySelector('.rcd-msg').textContent = res.message || '';
        setTimeout(renderRcdQuestion, 650);
      });
    });
  }

  function renderRcdReport(report) {
    const s = report.statistics;
    const route = report.remedialPath || [];
    DOM.rcdTitle.textContent = '📋 诊断报告';
    DOM.rcdBody.innerHTML = `
      <div class="rcd-report">
        <div class="rcd-stats">
          <div><b>${s.totalQuestions}</b><span>已答</span></div>
          <div><b>${s.weakCount}</b><span>薄弱</span></div>
          <div><b>${s.unstableCount}</b><span>不稳</span></div>
          <div><b>${s.untestedCount}</b><span>未测</span></div>
        </div>
        ${report.defectSummary && report.defectSummary.length ? `<div class="rcd-block"><h4>🧬 缺陷画像</h4>${report.defectSummary.map(d => `<div class="rcd-defect-row"><span class="rcd-defect-tag defect-${d.defectType}">${CNPT.utils.escapeHtml(d.defectLabel)}</span><span class="rcd-defect-count">${d.count} 个知识点</span></div>`).join('')}<div class="rcd-defect-tip">记忆背诵靠间隔重复，语言规则靠对比运用，概念理解回到定义，技能熟练靠限时规范练习。</div></div>` : ''}
        <div class="rcd-block">
          <h4>🎯 根因盲区（优先补）</h4>
          ${report.rootCauses.length
            ? report.rootCauses.map(r => `<div class="rcd-item weak">🔴 ${CNPT.utils.escapeHtml(r.name)}<span>${r.subject} · ${r.grade}年级${r.crossGrade ? ' · ⏪跨年级' : ''} · ${CNPT.utils.escapeHtml(r.defectLabel)}</span></div><div class="rcd-suggestion">💡 ${CNPT.utils.escapeHtml(r.suggestion)}</div>`).join('')
            : '<div class="rcd-item">✅ 没发现薄弱根因，基础扎实！</div>'}
        </div>
        ${report.unstable.length ? `<div class="rcd-block"><h4>🟠 不稳（先巩固，不用回溯）</h4>${report.unstable.map(u => `<div class="rcd-item unstable">${CNPT.utils.escapeHtml(u.name)}<span>${u.subject} · ${u.grade}年级${u.crossGrade ? ' · ⏪跨年级' : ''} · ${CNPT.utils.escapeHtml(u.defectLabel)}</span></div>`).join('')}</div>` : ''}
        ${route.length ? `<div class="rcd-block"><h4>🧩 根因路径图</h4><div class="rcd-graph">${state.rcd.renderPathGraphSVG(report)}</div></div>` : ''}
        ${route.length ? `<div class="rcd-block"><h4>🗺️ 补学路线（按顺序）</h4>${route.map((p, i) => `<div class="rcd-item ${p.status}">${i + 1}. ${p.status === 'weak' ? '🔴' : '🟠'} ${CNPT.utils.escapeHtml(p.name)}<span>${p.subject} · ${p.grade}年级 · ${CNPT.utils.escapeHtml(p.defectLabel)}</span></div>`).join('')}</div>` : ''}
        <div class="rcd-actions">
          <button class="cnpt-detail-btn primary" id="rcd-start-learn">开始补学第一个</button>
          ${s.untestedCount > 0 ? '<button class="cnpt-detail-btn secondary" id="rcd-retest">🧪 盲区再测</button>' : ''}
          <button class="cnpt-detail-btn secondary" id="rcd-retry">🔁 重新诊断</button>
          <button class="cnpt-detail-btn secondary" id="rcd-export">📤 导出 JSON</button>
          <button class="cnpt-detail-btn secondary" id="rcd-back">← 换目标</button>
        </div>
      </div>
    `;
    document.getElementById('rcd-start-learn').addEventListener('click', () => {
      const first = route[0] || report.rootCauses[0];
      if (!first) { closeRcd(); return; }
      closeRcd();
      showTopicDetail(first.topicId);
      setTimeout(() => startPractice(CNPT.indices.getTopicMap().get(first.topicId)), 250);
    });
    document.getElementById('rcd-retry').addEventListener('click', () => startRcdSession(report.target.topicId));
    const retestBtn = document.getElementById('rcd-retest');
    if (retestBtn) retestBtn.addEventListener('click', () => {
      const n = state.rcd.expandUntested(state.rcdSession);
      if (!n) return;
      DOM.rcdTitle.textContent = '🔍 根因诊断';
      renderRcdQuestion();
    });
    document.getElementById('rcd-export').addEventListener('click', () => {
      const blob = new Blob([state.rcd.exportReport(report)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `根因诊断-${report.target.name || report.target.topicId}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    document.getElementById('rcd-back').addEventListener('click', () => renderRcdPicker());
  }

  // =========================================================
  // 主题研修（国防教育 / 国家安全 / 挫折与意志）
  // =========================================================
  function initThemeLearning() {
    if (!window.CNPT || !CNPT.themeLearning) return;
    state.theme = CNPT.themeLearning.create(state.role);
    DOM.btnTheme?.addEventListener('click', openThemePicker);
    DOM.themeClose?.addEventListener('click', closeTheme);
    DOM.themeModal?.addEventListener('click', (e) => { if (e.target === DOM.themeModal) closeTheme(); });
  }

  function openThemePicker() {
    renderThemeList();
    DOM.themeTitle.textContent = '🎯 主题研修';
    DOM.themeModal.classList.remove('cnpt-hidden');
    setTimeout(() => DOM.themeModal.classList.add('show'), 10);
  }

  function closeTheme() {
    DOM.themeModal.classList.remove('show');
    setTimeout(() => DOM.themeModal.classList.add('cnpt-hidden'), 250);
  }

  function themeStatusIcon(s) {
    return s === 'mastered' ? '✅' : s === 'learning' ? '📖' : '⚪';
  }

  function renderThemeList() {
    const body = DOM.themeBody;
    const themes = state.theme.list();
    body.innerHTML = `<div class="rcd-picker-tip">跨学科主题，把散落各科的知识点串成一条线（数据来自现有图谱挂接）。</div>` +
      themes.map(t => `<div class="rcd-cand" data-id="${t.id}">${t.icon} ${CNPT.utils.escapeHtml(t.name)}<span>${t.total} 个知识点 · 已掌握 ${t.mastered}/${t.total}</span></div>`).join('');
    body.querySelectorAll('[data-id]').forEach(el =>
      el.addEventListener('click', () => renderThemeDetail(el.dataset.id)));
  }

  function renderThemeDetail(id) {
    const theme = state.theme.getTheme(id);
    if (!theme) return;
    DOM.themeTitle.textContent = `${theme.icon} ${theme.name}`;
    const path = state.theme.buildThemePath(id);
    const stats = state.theme.stats(id);
    const body = DOM.themeBody;
    body.innerHTML = `
      <div class="rcd-ai-note">${CNPT.utils.escapeHtml(theme.intro)}</div>
      <div class="rcd-block"><h4>🎯 学习目标</h4>${(theme.objectives || []).map(o => `<div class="rcd-item">${CNPT.utils.escapeHtml(o)}</div>`).join('')}</div>
      <div class="rcd-block"><h4>🧩 学习路线（${path.length} 个知识点 · 已掌握 ${stats.mastered}）</h4>
        ${path.map((p, i) => `<div class="rcd-item ${p.status}">${i + 1}. ${themeStatusIcon(p.status)} ${CNPT.utils.escapeHtml(p.name)}<span>${p.subject} · ${p.grade}年级</span></div>`).join('')}</div>
      <div class="rcd-block"><h4>🧪 建议活动</h4>${(theme.activities || []).map(a => `<div class="rcd-item">${CNPT.utils.escapeHtml(a)}</div>`).join('')}</div>
      <div class="rcd-block"><h4>⚠️ 内容缺口（待补）</h4>${(theme.gaps || []).map(g => `<div class="rcd-item unstable">${CNPT.utils.escapeHtml(g)}</div>`).join('')}</div>
      <div class="rcd-actions">
        <button class="cnpt-detail-btn primary" id="theme-start">开始主题学习</button>
        <button class="cnpt-detail-btn secondary" id="theme-back">← 返回</button>
      </div>`;
    document.getElementById('theme-back').addEventListener('click', renderThemeList);
    document.getElementById('theme-start').addEventListener('click', () => {
      const first = path.find(p => p.status !== 'mastered') || path[0];
      closeTheme();
      // 主题挂接点（多为道法/信息科技母点）常无随堂题，打开详情页查看内容与标记掌握
      if (first) setTimeout(() => showTopicDetail(first.id), 250);
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