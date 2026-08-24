/*!
 * CN-Primary-Taxonomy · 教师版主应用
 * 角色：teacher - 教学工具、课标对齐、路径生成
 */
(function() {
  'use strict';

  const state = {
    role: 'teacher',
    fullData: null,
    graph: null,
    storage: null,
    currentView: 'dashboard',
    currentLayer: 'core',
    currentGrades: new Set(),
    currentSubjects: new Set(),
    currentTextbooks: new Set()
  };

  const DOM = {};

  function cacheDom() {
    DOM.topInfo = document.getElementById('top-info');
    DOM.dashTopics = document.getElementById('dash-total-topics');
    DOM.dashDeps = document.getElementById('dash-total-deps');
    DOM.dashSubjects = document.getElementById('dash-total-subjects');
    DOM.dashStandards = document.getElementById('dash-total-standards');
    DOM.coverageTable = document.getElementById('coverage-table');
    DOM.textbookList = document.getElementById('textbook-list');
    DOM.graphCanvas = document.getElementById('graph-canvas');
    DOM.graphLayer = document.getElementById('graph-layer');
    DOM.graphGrade = document.getElementById('graph-grade');
    DOM.graphSubject = document.getElementById('graph-subject');
    DOM.graphReset = document.getElementById('graph-reset');
    DOM.graphStatus = document.getElementById('graph-status');
    DOM.nodeDetailPanel = document.getElementById('node-detail-panel');
    DOM.standardsList = document.getElementById('standards-list');
    DOM.standardsSubject = document.getElementById('standards-subject');
    DOM.standardsSearch = document.getElementById('standards-search');
    DOM.pathSearch = document.getElementById('path-search');
    DOM.pathSearchResults = document.getElementById('path-search-results');
    DOM.pathResult = document.getElementById('path-result');
    DOM.mainSearch = document.getElementById('main-search');
    DOM.mainSearchResults = document.getElementById('main-search-results');
    DOM.searchGrade = document.getElementById('search-grade');
    DOM.searchSubject = document.getElementById('search-subject');
    DOM.searchTextbook = document.getElementById('search-textbook');
    DOM.btnClearData = document.getElementById('btn-clear-data');
    DOM.modeSwitch = document.getElementById('mode-switch');
  }

  // showLoadError 已移至共享组件 CNPT.components.showLoadError

  async function init() {
    cacheDom();
    state.storage = CNPT.storage.create('teacher');

    try {
      state.fullData = await CNPT.dataLoader.loadAllData();
    } catch (err) {
      console.error('数据加载失败:', err);
      CNPT.components.showLoadError('数据加载失败，请检查网络连接后重试');
      return;
    }

    CNPT.indices.buildIndices(state.fullData);
    DOM.topInfo.textContent = `${state.fullData.topics.topicCount}知识点 · ${state.fullData.dependencies.edgeCount}依赖 · ${new Set(state.fullData.topics.topics.map(t => t.subject)).size}学科`;

    initNavigation();
    initDashboard();
    initGraphView();
    initStandardsView();
    initPathView();
    initSearchView();
    initSettings();

    // 初始化错误反馈组件（P0 合规要求）
    if (CNPT.components.initErrorFeedback) {
  if (CNPT.components.initBookmarks) { CNPT.components.initBookmarks(); }
  if (CNPT.components.initVoiceSearch) { CNPT.components.initVoiceSearch(); }
  if (CNPT.components.initShareCard) { CNPT.components.initShareCard(); }
  if (CNPT.components.initPWA) { CNPT.components.initPWA(); }
  if (CNPT.components.initDataExport) { CNPT.components.initDataExport(); }
  if (CNPT.components.initNodeDetail) { CNPT.components.initNodeDetail(); }

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

  // ========== 导航 ==========
  function initNavigation() {
    document.querySelectorAll('.cnpt-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const view = item.dataset.view;
        document.querySelectorAll('.cnpt-nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        document.querySelectorAll('.cnpt-view').forEach(v => v.classList.remove('active'));
        document.getElementById(`view-${view}`).classList.add('active');
        state.currentView = view;

        if (view === 'graph' && !state.graph) {
          setTimeout(initGraphRendering, 100);
        }
      });
    });

    DOM.modeSwitch.addEventListener('click', () => {
      window.location.href = '../parent-web/index.html';
    });
  }

  // ========== 教学概览 ==========
  function initDashboard() {
    const topics = state.fullData.topics;
    const deps = state.fullData.dependencies;
    const allStandards = new Set();
    topics.topics.forEach(t => (t.standards || []).forEach(s => allStandards.add(s)));

    DOM.dashTopics.textContent = topics.topicCount;
    DOM.dashDeps.textContent = deps.edgeCount;
    DOM.dashSubjects.textContent = new Set(topics.topics.map(t => t.subject)).size;
    DOM.dashStandards.textContent = allStandards.size;

    renderCoverageTable();
    renderTextbookList();
  }

  function renderCoverageTable() {
    const subjects = [...new Set(state.fullData.topics.topics.map(t => t.subject))];
    const grades = [1, 2, 3, 4, 5, 6];

    let html = '<table><thead><tr><th>年级 \\ 学科</th>';
    subjects.forEach(s => { html += `<th>${s}</th>`; });
    html += '</tr></thead><tbody>';

    grades.forEach(g => {
      html += `<tr><td><b>${g}年级</b></td>`;
      subjects.forEach(s => {
        const count = state.fullData.topics.topics.filter(t => t.grade === g && t.subject === s).length;
        html += `<td class="${count > 0 ? 'has-data' : ''}">${count || '-'}</td>`;
      });
      html += '</tr>';
    });

    html += '</tbody></table>';
    DOM.coverageTable.innerHTML = html;
  }

  function renderTextbookList() {
    const tbCounts = {};
    state.fullData.topics.topics.forEach(t => {
      const k = t.textbook || '未标注版本';
      tbCounts[k] = (tbCounts[k] || 0) + 1;
    });

    DOM.textbookList.innerHTML = Object.entries(tbCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => `<span class="cnpt-textbook-tag">${name} <span class="count">${count}</span></span>`)
      .join('');
  }

  // ========== 图谱视图 ==========
  function initGraphView() {
    // 填充筛选器
    const grades = [...new Set(state.fullData.topics.topics.map(t => t.grade))].sort((a, b) => a - b);
    DOM.graphGrade.innerHTML = '<option value="all">全部年级</option>' +
      grades.map(g => `<option value="${g}">${g}年级</option>`).join('');

    const subjects = [...new Set(state.fullData.topics.topics.map(t => t.subject))];
    DOM.graphSubject.innerHTML = '<option value="all">全部学科</option>' +
      subjects.map(s => `<option value="${s}">${s}</option>`).join('');

    // 事件
    DOM.graphLayer.addEventListener('change', () => { state.currentLayer = DOM.graphLayer.value; applyGraphFilter(); });
    DOM.graphGrade.addEventListener('change', () => {
      state.currentGrades = DOM.graphGrade.value === 'all' ? new Set() : new Set([DOM.graphGrade.value]);
      applyGraphFilter();
    });
    DOM.graphSubject.addEventListener('change', () => {
      state.currentSubjects = DOM.graphSubject.value === 'all' ? new Set() : new Set([DOM.graphSubject.value]);
      applyGraphFilter();
    });
    DOM.graphReset.addEventListener('click', () => {
      DOM.graphLayer.value = 'core';
      DOM.graphGrade.value = 'all';
      DOM.graphSubject.value = 'all';
      state.currentLayer = 'core';
      state.currentGrades = new Set();
      state.currentSubjects = new Set();
      applyGraphFilter();
    });
  }

  function initGraphRendering() {
    state.graph = new CNPT.graph.PCGraph('graph-canvas', {
      onNodeClick: showNodeDetail,
      onNodeHover: (node) => state.graph.highlightNode(node?.id)
    });
    state.graph.initCanvas();
    applyGraphFilter();
  }

  function applyGraphFilter() {
    if (!state.graph) return;
    let topics = state.fullData.topics.topics;

    if (state.currentGrades.size > 0) {
      topics = topics.filter(t => state.currentGrades.has(String(t.grade)));
    }
    if (state.currentSubjects.size > 0) {
      topics = topics.filter(t => state.currentSubjects.has(t.subject));
    }
    if (state.currentLayer === 'core') {
      topics = topics.filter(t => !t.parentTopicId);
    }

    const graphData = CNPT.utils.buildGraphData(topics, state.fullData.dependencies.dependencies);
    state.graph.render(graphData.nodes, graphData.links);
    DOM.graphStatus.innerHTML = `显示 <strong>${graphData.nodes.length}</strong> / ${topics.length} 个节点 · <strong>${graphData.links.length}</strong> 条关系`;
  }

  // ========== 节点详情（教师版：使用共享组件 + 教师专属字段）==========
  function showNodeDetail(node) {
    const topic = CNPT.indices.getTopicMap().get(node.id);
    if (!topic) return;

    state.graph.highlightNode(node.id);

    if (window.CNPT?.components?.renderNodeDetail) {
      CNPT.components.renderNodeDetail(topic, {
        container: DOM.nodeDetailPanel,
        showStandards: true,
        showExamTips: true,
        onNodeClick: (id) => {
          const n = state.graph.data.nodes.find(nd => nd.id === id);
          if (n) showNodeDetail(n);
        }
      });

      // 教师专属：添加关闭按钮
      const header = DOM.nodeDetailPanel.querySelector('.cnpt-detail-name');
      if (header && !DOM.nodeDetailPanel.querySelector('#cnpt-detail-close')) {
        const headerRow = document.createElement('div');
        headerRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px';
        headerRow.innerHTML = `<div class="cnpt-detail-name" style="margin:0">${CNPT.utils.escapeHtml(topic.name)}</div>
          <button id="cnpt-detail-close" style="background:none;border:none;font-size:18px;cursor:pointer;color:#999">×</button>`;
        header.replaceWith(headerRow);
        DOM.nodeDetailPanel.querySelector('#cnpt-detail-close').addEventListener('click', () => {
          DOM.nodeDetailPanel.classList.add('cnpt-hidden');
        });
      }

      // 教师专属：添加技能量表
      if (topic.skillRubric) {
        const rubricSection = document.createElement('div');
        rubricSection.className = 'cnpt-detail-section';
        rubricSection.innerHTML = `
          <h4>📊 技能量表</h4>
          ${Object.entries(topic.skillRubric).map(([skill, levels]) => `
            <div style="margin-bottom:8px">
              <b style="font-size:11px;color:#1976D2">${CNPT.constants.RUBRIC_LABELS[skill] || skill}</b>
              <ul style="margin:4px 0 0 16px">
                ${levels.map((l, i) => `<li style="font-size:11px;color:#666">${['起步', '达标', '提升'][i] || ''}：${CNPT.utils.escapeHtml(l)}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        `;
        DOM.nodeDetailPanel.appendChild(rubricSection);
      }
    }
  }

  // ========== 课标对照 ==========
  function initStandardsView() {
    const subjects = [...new Set(state.fullData.topics.topics.map(t => t.subject))];
    DOM.standardsSubject.innerHTML = '<option value="all">全部学科</option>' +
      subjects.map(s => `<option value="${s}">${s}</option>`).join('');

    DOM.standardsSubject.addEventListener('change', renderStandards);
    DOM.standardsSearch.addEventListener('input', CNPT.utils.debounce(() => renderStandards(), 200));
    renderStandards();
  }

  function renderStandards() {
    const subject = DOM.standardsSubject.value;
    const query = (DOM.standardsSearch.value || '').toLowerCase().trim();

    let topics = state.fullData.topics.topics.filter(t => (t.standards || []).length > 0);
    if (subject !== 'all') topics = topics.filter(t => t.subject === subject);
    if (query) topics = topics.filter(t =>
      (t.standards || []).some(s => s.toLowerCase().includes(query)) ||
      (t.name || '').toLowerCase().includes(query)
    );

    if (!topics.length) {
      DOM.standardsList.innerHTML = '<div class="cnpt-empty">没有匹配的课标记录</div>';
      return;
    }

    DOM.standardsList.innerHTML = topics.slice(0, 100).map(t => {
      const color = CNPT.constants.COLORS[t.subject] || '#888';
      return `
        <div class="cnpt-standard-item" data-id="${t.id}">
          <div>
            ${(t.standards || []).map(s => `<span class="cnpt-standard-code">${CNPT.utils.escapeHtml(s)}</span>`).join(' ')}
          </div>
          <div class="cnpt-standard-topic">${CNPT.utils.escapeHtml(t.name)}</div>
          <div class="cnpt-standard-meta" style="color:${color}">${t.subject} · ${t.grade}年级${t.term || ''} · ${t.textbook || ''}</div>
        </div>
      `;
    }).join('');

    DOM.standardsList.querySelectorAll('.cnpt-standard-item').forEach(item => {
      item.addEventListener('click', () => {
        if (state.currentView !== 'graph') {
          document.querySelector('[data-view="graph"]').click();
        }
        setTimeout(() => {
          const n = state.graph.data.nodes.find(nd => nd.id === item.dataset.id);
          if (n) showNodeDetail(n);
        }, 300);
      });
    });
  }

  // ========== 学习路径生成器 ==========
  function initPathView() {
    DOM.pathSearch.addEventListener('input', CNPT.utils.debounce((e) => {
      const query = e.target.value.trim();
      if (!query) { DOM.pathSearchResults.classList.remove('show'); return; }
      const results = CNPT.search.search(query, { limit: 8 });
      if (!results.length) {
        DOM.pathSearchResults.innerHTML = '<div class="cnpt-search-result-item">无匹配结果</div>';
      } else {
        DOM.pathSearchResults.innerHTML = results.map(({ topic }) => `
          <div class="cnpt-search-result-item" data-id="${topic.id}">
            <div>${CNPT.utils.escapeHtml(topic.name)}</div>
            <div style="font-size:10px;color:#999">${topic.subject} · ${topic.grade}年级</div>
          </div>
        `).join('');
        DOM.pathSearchResults.querySelectorAll('.cnpt-search-result-item').forEach(item => {
          item.addEventListener('click', () => {
            DOM.pathSearch.value = '';
            DOM.pathSearchResults.classList.remove('show');
            generatePath(item.dataset.id);
          });
        });
      }
      DOM.pathSearchResults.classList.add('show');
    }, 200));

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.cnpt-path-generator')) DOM.pathSearchResults.classList.remove('show');
    });
  }

  function generatePath(topicId) {
    const topic = CNPT.indices.getTopicMap().get(topicId);
    if (!topic) return;

    const path = CNPT.path.buildLearningPath(topicId, { maxNodes: 10 });
    if (!path.length) {
      DOM.pathResult.innerHTML = '<div class="cnpt-empty">暂无推荐路径</div>';
      return;
    }

    DOM.pathResult.innerHTML = `
      <div style="font-size:13px;color:#1976D2;margin-bottom:12px">
        <b>目标：</b>${CNPT.utils.escapeHtml(topic.name)} (${topic.subject} · ${topic.grade}年级)
        <span style="color:#999;margin-left:8px">共 ${path.length} 步</span>
      </div>
      ${path.map((t, i) => `
        <div class="cnpt-path-step" data-id="${t.id}">
          <div class="cnpt-path-num">${i + 1}</div>
          <div class="cnpt-path-info">
            <div class="cnpt-path-name">${CNPT.utils.escapeHtml(t.name)}</div>
            <div class="cnpt-path-meta">${t.subject} · ${t.grade}年级${t.term || ''} · ${CNPT.constants.DIFFICULTY(t.difficulty || 3)}</div>
          </div>
        </div>
      `).join('')}
    `;

    DOM.pathResult.querySelectorAll('.cnpt-path-step').forEach(step => {
      step.addEventListener('click', () => {
        if (state.currentView !== 'graph') {
          document.querySelector('[data-view="graph"]').click();
        }
        setTimeout(() => {
          const n = state.graph.data.nodes.find(nd => nd.id === step.dataset.id);
          if (n) showNodeDetail(n);
        }, 300);
      });
    });
  }

  // ========== 知识点库搜索 ==========
  function initSearchView() {
    const grades = [...new Set(state.fullData.topics.topics.map(t => t.grade))].sort((a, b) => a - b);
    const subjects = [...new Set(state.fullData.topics.topics.map(t => t.subject))];
    const textbooks = [...new Set(state.fullData.topics.topics.map(t => t.textbook || '未标注版本'))];

    DOM.searchGrade.innerHTML = '<option value="all">全部年级</option>' + grades.map(g => `<option value="${g}">${g}年级</option>`).join('');
    DOM.searchSubject.innerHTML = '<option value="all">全部学科</option>' + subjects.map(s => `<option value="${s}">${s}</option>`).join('');
    DOM.searchTextbook.innerHTML = '<option value="all">全部版本</option>' + textbooks.map(t => `<option value="${t}">${t}</option>`).join('');

    [DOM.searchGrade, DOM.searchSubject, DOM.searchTextbook].forEach(sel => {
      sel.addEventListener('change', doMainSearch);
    });

    DOM.mainSearch.addEventListener('input', CNPT.utils.debounce(() => doMainSearch(), 250));
  }

  function doMainSearch() {
    const query = (DOM.mainSearch.value || '').trim().toLowerCase();
    const grade = DOM.searchGrade.value;
    const subject = DOM.searchSubject.value;
    const textbook = DOM.searchTextbook.value;

    let topics = state.fullData.topics.topics;
    if (grade !== 'all') topics = topics.filter(t => t.grade === parseInt(grade));
    if (subject !== 'all') topics = topics.filter(t => t.subject === subject);
    if (textbook !== 'all') topics = topics.filter(t => (t.textbook || '未标注版本') === textbook);

    let results;
    if (query) {
      results = topics.map(t => ({ topic: t, score: CNPT.search.scoreTopic(t, query) }))
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 50);
    } else {
      results = topics.slice(0, 50).map(t => ({ topic: t, score: 0 }));
    }

    if (!results.length) {
      DOM.mainSearchResults.innerHTML = '<div class="cnpt-empty">没有匹配的知识点</div>';
      return;
    }

    // 使用共享搜索结果渲染器（带版本标签消歧）
    DOM.mainSearchResults.innerHTML = CNPT.search.buildSearchResultHTML(results, query, {
      contentRenderer: (topic, ctx) => {
        const color = CNPT.constants.COLORS[topic.subject] || '#888';
        return `
          <div style="display:flex;align-items:center;gap:10px;padding:10px 16px;border-bottom:1px solid #E0E4E8">
            <div class="cnpt-topic-dot" style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0"></div>
            <div style="flex:1;min-width:0">
              <div style="font-size:13px;color:#1A2332">${ctx.name} ${ctx.versionTag}</div>
              <div style="font-size:11px;color:#90A4AE">${topic.subject} · ${topic.grade}年级${topic.term || ''} · ${topic.textbook || ''}</div>
            </div>
          </div>
        `;
      }
    });

    DOM.mainSearchResults.querySelectorAll('.cnpt-search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelector('[data-view="graph"]').click();
        setTimeout(initGraphRendering, 50);
        setTimeout(() => {
          const n = state.graph.data.nodes.find(nd => nd.id === item.dataset.id);
          if (n) showNodeDetail(n);
        }, 400);
      });
    });
  }

  // ========== 设置 ==========
  function initSettings() {
    DOM.btnClearData.addEventListener('click', () => {
      if (confirm('确定要清除所有教学数据吗？此操作不可撤销。')) {
        state.storage.resetAll();
        CNPT.utils.showToast('数据已清除');
      }
    });

    // 绑定隐私政策、用户协议链接
    const privacyLink = document.getElementById('link-privacy');
    const agreementLink = document.getElementById('link-agreement');
    const exportBtn = document.getElementById('btn-export-data');

    if (privacyLink) {
      privacyLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.open('../shared/privacy-policy.html', '_blank');
      });
    }
    if (agreementLink) {
      agreementLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.open('../shared/user-agreement.html', '_blank');
      });
    }
    if (exportBtn) {
      exportBtn.addEventListener('click', exportUserData);
    }
  }

  /**
   * 导出用户数据（数据可携带权）
   */
  function exportUserData() {
    const data = {
      role: state.role,
      exportedAt: new Date().toISOString(),
      mastery: state.storage.getMastery(),
      stats: state.storage.getStats(),
      consecutiveDays: state.storage.getConsecutiveDays()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cnpt_teacher_data_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    CNPT.utils.showToast('✅ 数据已导出');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();