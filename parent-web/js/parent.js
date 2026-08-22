/*!
 * CN-Primary-Taxonomy · 家长版主应用
 * 角色：parent - 完整的家长辅导功能
 * 依赖：shared/js/core/* + shared/js/graph/pc-graph.js
 */
(function() {
  'use strict';

  // ========== 状态管理 ==========
  const state = {
    role: 'parent',
    fullData: null,
    graph: null,
    storage: null,
    currentLayer: 'core',
    currentGrades: new Set(),
    currentSubjects: new Set(),
    currentTextbooks: new Set(),
    selectedNodeId: null,
    kidMode: false,
    kidStars: 0,
    filterCache: new Map()
  };

  // ========== DOM引用 ==========
  const DOM = {};

  function cacheDom() {
    DOM.app = document.getElementById('app');
    DOM.graphPanel = document.getElementById('graph-panel');
    DOM.graphCanvas = document.getElementById('graph-canvas');
    DOM.sidebar = document.getElementById('sidebar');
    DOM.sidebarToggle = document.getElementById('sidebar-toggle');
    DOM.sidebarContent = document.querySelector('.cnpt-sidebar-content');
    DOM.overviewPanel = document.getElementById('overview-panel');
    DOM.subtitle = document.getElementById('subtitle');
    DOM.overviewStats = document.getElementById('overview-stats');
    DOM.searchInput = document.getElementById('search-input');
    DOM.searchResults = document.getElementById('search-results');
    DOM.filterPanel = document.getElementById('filter-panel');
    DOM.layerSelect = document.getElementById('layer-select');
    DOM.gradeSelect = document.getElementById('grade-select');
    DOM.subjectSelect = document.getElementById('subject-select');
    DOM.textbookSelect = document.getElementById('textbook-select');
    DOM.graphStatus = document.getElementById('graph-status');
    DOM.assistantPanel = document.getElementById('assistant-panel');
    DOM.detailPanel = document.getElementById('detail-panel');
    DOM.kidToggle = document.getElementById('kid-mode-toggle');
    DOM.kidWelcome = document.getElementById('kid-welcome');
    DOM.mascot = document.getElementById('mascot');
    DOM.mascotBubble = document.getElementById('mascot-bubble');
    DOM.encourageBar = document.getElementById('encourage-bar');
    DOM.legendColors = document.getElementById('legend-colors');
  }

  // ========== 初始化 ==========
  // showLoadError 已移至共享组件 CNPT.components.showLoadError

  async function init() {
    cacheDom();
    state.storage = CNPT.storage.create('parent');
    state.kidStars = state.storage.getStars();

    // 加载数据
    try {
      state.fullData = await CNPT.dataLoader.loadAllData();
    } catch (err) {
      console.error('数据加载失败:', err);
      CNPT.components.showLoadError('数据加载失败，请检查网络连接后重试');
      return;
    }

    // 构建索引
    CNPT.indices.buildIndices(state.fullData);

    // 初始化UI
    initLegend();
    initOverview();
    initFilters();
    initSearch();
    initAssistant();
    initKidMode();
    initSidebarToggle();

    // 初始化图谱
    state.graph = new CNPT.graph.PCGraph('graph-canvas', {
      onNodeClick: showNodeDetail,
      onNodeHover: (node) => state.graph.highlightNode(node?.id)
    });
    state.graph.initCanvas();

    // 应用默认筛选
    applyFilters();

    // 隐藏加载指示器
    CNPT.utils.hideLoadingScreen();

    // 事件
    window.addEventListener('resize', CNPT.utils.debounce(handleResize, 150));
    document.addEventListener('visibilitychange', handleVisibility);
  }

  // ========== 图例 ==========
  function initLegend() {
    const colors = CNPT.constants.COLORS;
    DOM.legendColors.innerHTML = Object.entries(colors).map(([subject, color]) =>
      `<div class="cnpt-legend-item"><span class="cnpt-legend-dot" style="background:${color}"></span>${subject}</div>`
    ).join('');
  }

  // ========== 概览 ==========
  function initOverview() {
    const topics = state.fullData.topics;
    const deps = state.fullData.dependencies;
    DOM.subtitle.textContent = `${topics.version || 'CN-Primary-Taxonomy'} · ${topics.topicCount} 知识点 · ${deps.edgeCount} 依赖关系`;
    renderOverviewStats();
  }

  function renderOverviewStats() {
    const stats = state.storage.getStats();
    const total = state.fullData.topics.topicCount;
    DOM.overviewStats.innerHTML = `
      <div><b>${stats.mastered}</b>已掌握</div>
      <div><b>${stats.learning}</b>学习中</div>
      <div><b>${total - stats.mastered}</b>待学习</div>
    `;
  }

  // ========== 筛选器 ==========
  function initFilters() {
    const topics = state.fullData.topics.topics;

    // 年级
    const gradeCounts = {};
    topics.forEach(t => { gradeCounts[t.grade] = (gradeCounts[t.grade] || 0) + 1; });
    const grades = Object.entries(gradeCounts).sort((a, b) => a[0] - b[0]);
    state.currentGrades = new Set(grades.length ? [grades[0][0].toString()] : []);
    renderMultiSelect(DOM.gradeSelect, grades, state.currentGrades, 'grade');

    // 学科
    const subjCounts = {};
    topics.forEach(t => { subjCounts[t.subject] = (subjCounts[t.subject] || 0) + 1; });
    const subjects = Object.entries(subjCounts).sort((a, b) => b[1] - a[1]);
    state.currentSubjects = new Set(subjects.map(s => s[0]));
    renderMultiSelect(DOM.subjectSelect, subjects, state.currentSubjects, 'subject');

    // 教材
    const tbCounts = {};
    topics.forEach(t => { const k = t.textbook || '未标注版本'; tbCounts[k] = (tbCounts[k] || 0) + 1; });
    const textbooks = Object.entries(tbCounts).sort((a, b) => b[1] - a[1]);
    state.currentTextbooks = new Set(textbooks.map(t => t[0]));
    renderMultiSelect(DOM.textbookSelect, textbooks, state.currentTextbooks, 'textbook');

    // 层级选择
    DOM.layerSelect.value = state.currentLayer;
    DOM.layerSelect.addEventListener('change', (e) => {
      state.currentLayer = e.target.value;
      applyFilters();
    });

    // 筛选操作按钮
    document.querySelectorAll('.cnpt-filter-action').forEach(btn => {
      btn.addEventListener('click', () => handleFilterAction(btn.dataset.target, btn.dataset.action));
    });
  }

  function renderMultiSelect(container, items, selectedSet, type) {
    container.innerHTML = '';
    items.forEach(([value, count]) => {
      const label = document.createElement('label');
      label.className = 'cnpt-multi-select-option';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = selectedSet.has(value.toString());
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) selectedSet.add(value.toString());
        else selectedSet.delete(value.toString());
        applyFilters();
      });
      const text = document.createElement('span');
      text.textContent = `${type === 'grade' ? value + '年级' : value} (${count})`;
      label.appendChild(checkbox);
      label.appendChild(text);
      container.appendChild(label);
    });
  }

  function handleFilterAction(target, action) {
    const set = target === 'grade' ? state.currentGrades :
                target === 'subject' ? state.currentSubjects : state.currentTextbooks;
    const allValues = target === 'grade' ?
      [...new Set(state.fullData.topics.topics.map(t => t.grade.toString()))] :
      target === 'subject' ?
      [...new Set(state.fullData.topics.topics.map(t => t.subject))] :
      [...new Set(state.fullData.topics.topics.map(t => t.textbook || '未标注版本'))];

    if (action === 'selectAll') {
      allValues.forEach(v => set.add(v));
    } else if (action === 'invert') {
      allValues.forEach(v => set.has(v) ? set.delete(v) : set.add(v));
    } else if (action === 'clear') {
      set.clear();
    }

    // 重新渲染
    if (target === 'grade') {
      const counts = {};
      state.fullData.topics.topics.forEach(t => { counts[t.grade] = (counts[t.grade] || 0) + 1; });
      renderMultiSelect(DOM.gradeSelect, Object.entries(counts).sort((a, b) => a[0] - b[0]), state.currentGrades, 'grade');
    } else if (target === 'subject') {
      const counts = {};
      state.fullData.topics.topics.forEach(t => { counts[t.subject] = (counts[t.subject] || 0) + 1; });
      renderMultiSelect(DOM.subjectSelect, Object.entries(counts).sort((a, b) => b[1] - a[1]), state.currentSubjects, 'subject');
    } else {
      const counts = {};
      state.fullData.topics.topics.forEach(t => { const k = t.textbook || '未标注版本'; counts[k] = (counts[k] || 0) + 1; });
      renderMultiSelect(DOM.textbookSelect, Object.entries(counts).sort((a, b) => b[1] - a[1]), state.currentTextbooks, 'textbook');
    }

    applyFilters();
  }

  // ========== 搜索 ==========
  function initSearch() {
    DOM.searchInput.addEventListener('input', CNPT.utils.debounce((e) => {
      const query = e.target.value.trim();
      if (!query) {
        DOM.searchResults.classList.remove('show');
        return;
      }
      const results = CNPT.search.search(query, { limit: 20 });
      if (results.length === 0) {
        DOM.searchResults.innerHTML = '<div class="cnpt-search-result-item"><span class="srn">无匹配结果</span></div>';
      } else {
        DOM.searchResults.innerHTML = CNPT.search.buildSearchResultHTML(results, query);
        DOM.searchResults.querySelectorAll('.cnpt-search-result-item').forEach(item => {
          item.addEventListener('click', () => {
            const id = item.dataset.id;
            DOM.searchResults.classList.remove('show');
            DOM.searchInput.value = '';
            focusNode(id);
          });
        });
      }
      DOM.searchResults.classList.add('show');
    }, 200));

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.cnpt-search-box')) {
        DOM.searchResults.classList.remove('show');
      }
    });
  }

  // ========== 筛选应用 ==========
  function applyFilters() {
    const filtered = CNPT.search.filterTopics({
      grades: state.currentGrades,
      subjects: state.currentSubjects,
      textbooks: state.currentTextbooks,
      layer: state.currentLayer
    }, state.fullData.topics.topics);

    const { nodes, links } = CNPT.utils.buildGraphData(filtered, state.fullData.dependencies.dependencies);
    state.graph.render(nodes, links);

    DOM.graphStatus.innerHTML = `显示 <strong>${nodes.length}</strong> / ${state.fullData.topics.topics.length} 个节点 · <strong>${links.length}</strong> 条关系`;
  }

  // ========== 节点详情 ==========
  function showNodeDetail(node) {
    const topic = CNPT.indices.getTopicMap().get(node.id);
    if (!topic) return;

    state.selectedNodeId = node.id;
    state.graph.highlightNode(node.id);

    const status = state.storage.getTopicStatus(topic.id);
    const hardPrereqs = CNPT.path.getHardPrerequisites(topic.id);
    const softPrereqs = CNPT.path.getSoftPrerequisites(topic.id);
    const successors = CNPT.path.getSuccessors(topic.id);
    const coachText = CNPT.utils.buildCoachText(topic, hardPrereqs, successors);

    const tags = [
      `<span class="cnpt-tag" style="background:${CNPT.constants.COLORS[topic.subject]}20;color:${CNPT.constants.COLORS[topic.subject]}">${topic.subject}</span>`,
      `<span class="cnpt-tag" style="background:rgba(0,0,0,0.1);color:#999">${topic.domain || ''}</span>`,
      `<span class="cnpt-tag" style="background:rgba(0,0,0,0.1);color:#999">${topic.grade}年级${topic.term || ''}</span>`,
      `<span class="cnpt-tag" style="background:rgba(255,200,0,0.15);color:#f39c12">难度 ${CNPT.constants.DIFFICULTY(topic.difficulty || 3)}</span>`
    ].join('');

    DOM.detailPanel.classList.remove('cnpt-hidden');
    DOM.detailPanel.innerHTML = `
      <div class="cnpt-detail-name">${CNPT.utils.escapeHtml(topic.name)}</div>
      <div class="cnpt-detail-meta">${topic.id} · ${topic.textbook || ''}${topic.unit ? ' · ' + topic.unit : ''}</div>
      <div class="cnpt-detail-tags">${tags}</div>
      <div class="cnpt-detail-desc">${CNPT.utils.escapeHtml(topic.description || '暂无描述')}</div>

      <div class="cnpt-mastery-row">
        <button class="cnpt-mastery-btn ${status === 'mastered' ? 'active' : ''}" data-mastery="mastered">✅ 已掌握</button>
        <button class="cnpt-mastery-btn ${status === 'learning' ? 'active' : ''}" data-mastery="learning">📖 学习中</button>
        <button class="cnpt-mastery-btn ${status === 'not-started' ? 'active' : ''}" data-mastery="not-started">⏳ 未开始</button>
      </div>

      <div class="cnpt-coach-box">${CNPT.utils.escapeHtml(coachText)}</div>

      <div class="cnpt-detail-section">
        <h4>✓ 掌握标准</h4>
        <ul>${(topic.evidence || []).map(e => `<li>${CNPT.utils.escapeHtml(e)}</li>`).join('') || '<li style="color:#999">暂无</li>'}</ul>
      </div>

      ${topic.commonMistakes && topic.commonMistakes.length ? `
        <div class="cnpt-detail-section">
          <h4>⚠️ 易错点</h4>
          <ul>${topic.commonMistakes.map(e => `<li>${CNPT.utils.escapeHtml(e)}</li>`).join('')}</ul>
        </div>
      ` : ''}

      ${topic.examTips ? `
        <div class="cnpt-detail-section">
          <h4>📝 考法提示</h4>
          <p style="font-size:12px;color:#a8b4c0;margin-top:4px">${CNPT.utils.escapeHtml(topic.examTips)}</p>
        </div>
      ` : ''}

      ${hardPrereqs.length ? `
        <div class="cnpt-detail-section">
          <h4>🔴 必须先补</h4>
          ${hardPrereqs.map(i => `<div class="cnpt-chain-item hard" data-id="${i.topic.id}"><span>🔴</span><b>${CNPT.utils.escapeHtml(i.topic.name)}</b><br><span style="color:#999;font-size:11px">${CNPT.utils.escapeHtml(i.edge.reason || '')}</span></div>`).join('')}
        </div>
      ` : ''}

      ${softPrereqs.length ? `
        <div class="cnpt-detail-section">
          <h4>🟡 建议先补</h4>
          ${softPrereqs.map(i => `<div class="cnpt-chain-item soft" data-id="${i.topic.id}"><span>🟡</span><b>${CNPT.utils.escapeHtml(i.topic.name)}</b><br><span style="color:#999;font-size:11px">${CNPT.utils.escapeHtml(i.edge.reason || '')}</span></div>`).join('')}
        </div>
      ` : ''}

      ${topic.standards && topic.standards.length ? `
        <div class="cnpt-detail-section">
          <h4>📋 课标编码</h4>
          <ul>${topic.standards.map(s => `<li style="font-family:monospace;font-size:11px">${CNPT.utils.escapeHtml(s)}</li>`).join('')}</ul>
        </div>
      ` : ''}
    `;

    // 掌握状态按钮
    DOM.detailPanel.querySelectorAll('.cnpt-mastery-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const newStatus = btn.dataset.mastery;
        state.storage.setTopicStatus(topic.id, newStatus);
        renderOverviewStats();
        showNodeDetail(node);
      });
    });

    // 链式跳转
    DOM.detailPanel.querySelectorAll('.cnpt-chain-item').forEach(item => {
      item.addEventListener('click', () => focusNode(item.dataset.id));
    });
  }

  // ========== 聚焦节点 ==========
  function focusNode(topicId) {
    const topic = CNPT.indices.getTopicMap().get(topicId);
    if (!topic) return;
    state.currentGrades = new Set([topic.grade.toString()]);
    state.currentSubjects = new Set([topic.subject]);
    applyFilters();
    setTimeout(() => {
      const node = state.graph.data.nodes.find(n => n.id === topicId);
      if (node) showNodeDetail(node);
    }, 300);
  }

  // ========== 学习助手 ==========
  function initAssistant() {
    DOM.assistantPanel.innerHTML = `
      <h3>🤖 学习助手</h3>
      <input type="text" class="cnpt-assistant-input" id="assistant-input" placeholder="输入孩子当前卡住的问题...">
      <button class="cnpt-assistant-btn" id="assistant-send">获取辅导建议</button>
      <div class="cnpt-assistant-chips">
        <span class="cnpt-assistant-chip" data-q="乘法口诀不熟，应该先补什么">乘法口诀不熟</span>
        <span class="cnpt-assistant-chip" data-q="看图写话总写不长">看图写话写不长</span>
        <span class="cnpt-assistant-chip" data-q="有余数除法总做错">有余数除法总错</span>
      </div>
      <div class="cnpt-assistant-result" id="assistant-result"></div>
    `;

    document.getElementById('assistant-send').addEventListener('click', () => {
      const query = document.getElementById('assistant-input').value;
      runAssistant(query);
    });

    DOM.assistantPanel.querySelectorAll('.cnpt-assistant-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.getElementById('assistant-input').value = chip.dataset.q;
        runAssistant(chip.dataset.q);
      });
    });
  }

  function runAssistant(query) {
    const resultContainer = document.getElementById('assistant-result');
    if (!query || !query.trim()) {
      resultContainer.innerHTML = '<span class="ar-muted">请输入孩子当前遇到的问题</span>';
      return;
    }

    const results = CNPT.search.search(query, { limit: 5 });
    if (!results.length) {
      resultContainer.innerHTML = '<span class="ar-muted">没有匹配到相关知识点，试试更具体的关键词</span>';
      return;
    }

    const target = results[0].topic;
    const path = CNPT.path.buildLearningPath(target.id, { maxNodes: 6, masteryData: state.storage.getMastery() });
    const direct = CNPT.path.getHardPrerequisites(target.id).map(p => p.topic);
    const actions = [...(target.practiceChain || []), ...(target.assessmentTasks || [])].filter(Boolean).slice(0, 3);

    resultContainer.innerHTML = `
      <div class="ar-card"><strong>定位知识点：</strong>${CNPT.utils.escapeHtml(target.subject)} · ${CNPT.utils.escapeHtml(target.name)}</div>
      <div class="ar-card"><strong>为什么先看这里：</strong>${direct.length ? `连着 ${direct.slice(0, 2).map(t => '「' + t.name + '」').join('、')}等基础点` : '没有明显前置门槛，可直接开始'}</div>
      <div class="ar-card"><strong>这周可以先做：</strong><br>${actions.map(a => `• ${CNPT.utils.escapeHtml(a)}`).join('<br>')}</div>
      <div class="ar-card"><strong>补到什么程度算有起色：</strong>${CNPT.utils.escapeHtml(target.evidence?.[0] || '能独立完成相关题目')}</div>
      ${target.commonMistakes?.[0] ? `<div class="ar-card"><strong>注意：</strong>${CNPT.utils.escapeHtml(target.commonMistakes[0])}</div>` : ''}
      <div style="margin-top:8px"><strong>建议学习顺序：</strong></div>
      ${path.map((t, i) => `<a class="ar-path-step" href="javascript:void(0)" data-id="${t.id}">${i + 1}. ${CNPT.utils.escapeHtml(t.name)} · ${t.subject} · ${t.grade}年级</a>`).join('')}
    `;

    resultContainer.querySelectorAll('.ar-path-step').forEach(link => {
      link.addEventListener('click', () => focusNode(link.dataset.id));
    });
  }

  // ========== 小伙伴模式 ==========
  function initKidMode() {
    DOM.kidToggle.addEventListener('click', toggleKidMode);
    DOM.mascot.addEventListener('click', () => CNPT.components.showMascotTip(getRandomKidTip()));
  }

  function toggleKidMode() {
    state.kidMode = !state.kidMode;
    document.body.classList.toggle('cnpt-kid-mode', state.kidMode);
    DOM.kidToggle.textContent = state.kidMode ? '👨‍👩‍家长模式' : '🧒 小伙伴模式';
    DOM.kidToggle.classList.toggle('active', state.kidMode);

    if (state.kidMode) {
      DOM.kidWelcome.classList.add('show');
      CNPT.components.showMascotTip('你好呀！👋 我是小知，你的学习小伙伴！');
      CNPT.components.showEncourage('🌟 欢迎欢迎！和小知一起探索知识的海洋吧！');
    } else {
      DOM.kidWelcome.classList.remove('show');
    }
  }

  // showMascotTip/showEncourage 已移至共享组件 CNPT.components

  function getRandomKidTip() {
    const tips = [
      "你可以点任意彩色的圆球看看里面有什么秘密哦！",
      "不会做没关系，点一点'学习路径'，它会告诉你从哪儿开始",
      "每次答对题目都能获得小星星哦！加油！",
      "如果觉得难，可以从1年级的知识开始学起",
      "你今天已经很棒了！休息一下也没关系",
      "学知识就像爬楼梯，一步一步来，不用着急",
      "做错了没关系~这说明我们找到一个需要加油的地方！"
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }

  // ========== 侧边栏折叠 ==========
  function initSidebarToggle() {
    DOM.sidebarToggle.addEventListener('click', () => {
      const collapsed = DOM.app.classList.toggle('sidebar-collapsed');
      DOM.sidebarToggle.textContent = collapsed ? '←' : '→';
      DOM.sidebarToggle.title = collapsed ? '展开面板' : '折叠面板';
      setTimeout(handleResize, 150);
    });
  }

  // ========== 窗口调整 ==========
  function handleResize() {
    if (state.graph) {
      state.graph.destroy();
      state.graph.initCanvas();
      applyFilters();
    }
  }

  function handleVisibility() {
    if (document.hidden) {
      if (state.graph) state.graph.destroy();
    } else {
      if (state.graph) {
        state.graph.initCanvas();
        applyFilters();
      }
    }
  }

  // ========== 启动 ==========
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
