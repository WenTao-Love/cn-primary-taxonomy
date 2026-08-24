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
    stars: 0,
    currentSubject: null,
    currentGrade: null,
    currentTopic: null
  };

  const DOM = {};

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

      <div class="cnpt-detail-actions">
        <button class="cnpt-detail-btn primary" id="btn-practice">✏️ 做练习</button>
        <button class="cnpt-detail-btn secondary" id="btn-path">🗺️ 学习路线</button>
      </div>
    `;

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

    DOM.detailCard.classList.remove('cnpt-hidden');
  }

  function startPractice(topic) {
    const questions = generateQuestions(topic);
    if (!questions.length) {
      CNPT.utils.showToast('这个知识点的练习题还在准备中~');
      return;
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
    let html = `<div class="cnpt-practice-question">${idx + 1}. ${CNPT.utils.escapeHtml(q.question)}</div><div class="cnpt-practice-options">`;

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

    DOM.practiceBody.querySelectorAll('.cnpt-practice-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const selected = parseInt(opt.dataset.idx);
        const correct = q.type === 'judge' ? (selected === 0) : (selected === q.answer);
        setTimeout(() => {
          if (correct) {
            opt.classList.add('correct');
            CNPT.components.showEncourage(['⭐ 太棒了！', '🌟 你真聪明！', '✨ 继续加油！'][Math.floor(Math.random() * 3)]);
            addStar();
            setTimeout(() => showPracticeQuestion(questions, idx + 1, topic), 800);
          } else {
            opt.classList.add('wrong');
            CNPT.utils.showToast('💡 差一点哦~再想想');
            setTimeout(() => showPracticeQuestion(questions, idx + 1, topic), 1200);
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