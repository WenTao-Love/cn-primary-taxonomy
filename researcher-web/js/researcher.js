/*!
 * CN-Primary-Taxonomy · 教研员版主应用
 * 角色：researcher - 知识图谱分析+路径推演+教研标注
 * 特征：结构分析、版本对比、标注共创、研究报告
 */
(function() {
  'use strict';

  const state = {
    role: 'researcher',
    fullData: null,
    indices: null,
    graph: null,
    annotations: {}  // 本地标注存储
  };

  const DOM = {};

  function cacheDom() {
    DOM.topInfo = document.getElementById('top-info');
    DOM.statNodeCount = document.getElementById('stat-node-count');
    DOM.statEdgeCount = document.getElementById('stat-edge-count');
    DOM.statAvgDegree = document.getElementById('stat-avg-degree');
    DOM.statMaxDepth = document.getElementById('stat-max-depth');
    DOM.hubTableBody = document.getElementById('hub-table-body');
    DOM.pathSearchInput = document.getElementById('path-search-input');
    DOM.pathSearchResults = document.getElementById('path-search-results');
    DOM.pathAnalysisResult = document.getElementById('path-analysis-result');
    DOM.textbookCompareResult = document.getElementById('textbook-compare-result');
    DOM.annotateSearchInput = document.getElementById('annotate-search-input');
    DOM.annotateSearchResults = document.getElementById('annotate-search-results');
    DOM.annotationPanel = document.getElementById('annotation-panel');
    DOM.analysisReportResult = document.getElementById('analysis-report-result');
  }

  // ========== 初始化 ==========
  async function init() {
    cacheDom();

    try {
      state.fullData = await CNPT.dataLoader.loadAllData();
    } catch (err) {
      console.error('数据加载失败:', err);
      CNPT.components.showLoadError('数据加载失败，请检查网络连接后重试');
      return;
    }

    state.indices = CNPT.indices.buildIndices(state.fullData);
    loadAnnotations();

    DOM.topInfo.textContent = `${state.fullData.topics.topicCount}知识点 · ${state.fullData.deps.edgeCount}依赖 · ${new Set(state.fullData.topics.topics.map(t => t.subject)).size}学科`;

    initNavigation();
    initStructureAnalysis();
    initPathAnalysis();
    initTextbookCompare();
    initAnnotation();
    initReport();

    // 隐藏加载指示器
    CNPT.utils.hideLoadingScreen();
  }

  // ========== 导航 ==========
  function initNavigation() {
    document.querySelectorAll('.cnpt-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        document.querySelectorAll('.cnpt-nav-btn').forEach(b => b.classList.toggle('active', b === btn));
        document.querySelectorAll('.cnpt-view').forEach(v => {
          v.classList.toggle('active', v.id === `view-${view}`);
        });
      });
    });
  }

  // ========== 图谱结构分析 ==========
  function initStructureAnalysis() {
    const topics = state.fullData.topics.topics;
    const deps = state.fullData.deps.dependencies;

    DOM.statNodeCount.textContent = topics.length;
    DOM.statEdgeCount.textContent = deps.length;

    // 计算每个节点的连接度
    const inDegree = {};
    const outDegree = {};
    topics.forEach(t => { inDegree[t.id] = 0; outDegree[t.id] = 0; });
    deps.forEach(d => {
      inDegree[d.topicId] = (inDegree[d.topicId] || 0) + 1;
      outDegree[d.prerequisiteId] = (outDegree[d.prerequisiteId] || 0) + 1;
    });

    const degree = {};
    topics.forEach(t => { degree[t.id] = (inDegree[t.id] || 0) + (outDegree[t.id] || 0); });

    const avgDegree = deps.length * 2 / topics.length;
    DOM.statAvgDegree.textContent = avgDegree.toFixed(1);

    // 估算最大依赖深度（简化：最长链长度估算）
    const depthMap = {};
    function getDepth(topicId, visited = new Set()) {
      if (depthMap[topicId]) return depthMap[topicId];
      if (visited.has(topicId)) return 0;
      visited.add(topicId);
      const prereqs = deps.filter(d => d.topicId === topicId).map(d => d.prerequisiteId);
      if (prereqs.length === 0) { depthMap[topicId] = 0; return 0; }
      const maxPrereq = Math.max(...prereqs.map(p => getDepth(p, visited)));
      depthMap[topicId] = maxPrereq + 1;
      return depthMap[topicId];
    }

    let maxDepth = 0;
    topics.slice(0, 500).forEach(t => {
      const d = getDepth(t.id);
      if (d > maxDepth) maxDepth = d;
    });
    DOM.statMaxDepth.textContent = maxDepth + '层';

    // TOP20高度连接节点
    const sorted = topics
      .map(t => ({ ...t, degree: degree[t.id] || 0, inDeg: inDegree[t.id] || 0, outDeg: outDegree[t.id] || 0 }))
      .sort((a, b) => b.degree - a.degree)
      .slice(0, 20);

    DOM.hubTableBody.innerHTML = sorted.map((t, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${CNPT.utils.escapeHtml(t.name)}</strong></td>
        <td>${CNPT.utils.escapeHtml(t.subject)}</td>
        <td>${t.grade}年级</td>
        <td><strong style="color:#8e44ad">${t.degree}</strong></td>
        <td>${t.inDeg}</td>
        <td>${t.outDeg}</td>
      </tr>
    `).join('');
  }

  // ========== 路径分析 ==========
  function initPathAnalysis() {
    let debounceTimer;
    DOM.pathSearchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => performPathSearch(DOM.pathSearchInput.value), 300);
    });
  }

  function performPathSearch(query) {
    if (!query || query.length < 2) {
      DOM.pathSearchResults.classList.remove('show');
      return;
    }
    const results = CNPT.search.search(query, { limit: 8 });
    if (results.length === 0) {
      DOM.pathSearchResults.innerHTML = '<div class="cnpt-search-result-item">无匹配结果</div>';
    } else {
      DOM.pathSearchResults.innerHTML = results.map(r => `
        <div class="cnpt-search-result-item" data-id="${r.topic.id}">
          ${CNPT.utils.escapeHtml(r.topic.name)}
          <span style="color:#999;font-size:11px"> · ${r.topic.subject} · ${r.topic.grade}年级</span>
        </div>
      `).join('');
    }
    DOM.pathSearchResults.classList.add('show');

    // 绑定点击事件
    DOM.pathSearchResults.querySelectorAll('.cnpt-search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const topicId = item.dataset.id;
        if (topicId) {
          DOM.pathSearchInput.value = item.textContent.trim();
          DOM.pathSearchResults.classList.remove('show');
          showPathAnalysis(topicId);
        }
      });
    });
  }

  function showPathAnalysis(topicId) {
    const topic = state.indices.topicMap.get(topicId);
    if (!topic) return;

    const hardPrereqs = CNPT.path.getHardPrerequisites(topicId);
    const softPrereqs = CNPT.path.getSoftPrerequisites(topicId);
    const successors = CNPT.path.getSuccessors(topicId, 5);
    const learningPath = CNPT.path.buildLearningPath(topicId, { maxNodes: 15 });

    DOM.pathAnalysisResult.innerHTML = `
      <div class="cnpt-analysis-section">
        <h3>🎯 ${CNPT.utils.escapeHtml(topic.name)} 路径分析</h3>
        <p>学科: ${CNPT.utils.escapeHtml(topic.subject)} · 年级: ${topic.grade}年级 · 难度: ${'⭐'.repeat(topic.difficulty)}</p>
      </div>
      <div class="cnpt-analysis-section">
        <h3>⬆️ 前置依赖 (${hardPrereqs.length}硬 + ${softPrereqs.length}软)</h3>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${[...hardPrereqs, ...softPrereqs].slice(0, 10).map(id => {
            const t = state.indices.topicMap.get(id);
            return t ? `<span class="cnpt-annotation-tag cnpt-tag-key">${CNPT.utils.escapeHtml(t.name)}</span>` : '';
          }).join('')}
        </div>
      </div>
      <div class="cnpt-analysis-section">
        <h3>⬇️ 后续知识点 (${successors.length}个)</h3>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${successors.slice(0, 10).map(id => {
            const t = state.indices.topicMap.get(id);
            return t ? `<span class="cnpt-annotation-tag cnpt-tag-tip">${CNPT.utils.escapeHtml(t.name)}</span>` : '';
          }).join('')}
        </div>
      </div>
      <div class="cnpt-analysis-section">
        <h3>🛤️ 推荐学习路径 (前15步)</h3>
        <ol style="padding-left:20px;font-size:13px">
          ${learningPath.map(id => {
            const t = state.indices.topicMap.get(id);
            return t ? `<li style="margin-bottom:4px">${CNPT.utils.escapeHtml(t.name)} <span style="color:#999;font-size:11px">(${t.subject}·${t.grade}年级)</span></li>` : '';
          }).join('')}
        </ol>
      </div>
    `;
  }

  // ========== 版本对比 ==========
  function initTextbookCompare() {
    const topics = state.fullData.topics.topics;
    const textbooks = [...new Set(topics.map(t => t.textbook || '未标注'))].sort();

    const textbookData = {};
    textbooks.forEach(tb => {
      textbookData[tb] = {
        count: 0,
        subjects: {},
        grades: {}
      };
    });
    topics.forEach(t => {
      const tb = t.textbook || '未标注';
      textbookData[tb].count++;
      textbookData[tb].subjects[t.subject] = (textbookData[tb].subjects[t.subject] || 0) + 1;
      textbookData[tb].grades[t.grade] = (textbookData[tb].grades[t.grade] || 0) + 1;
    });

    DOM.textbookCompareResult.innerHTML = `
      <div class="cnpt-compare-grid">
        ${Object.entries(textbookData).sort((a, b) => b[1].count - a[1].count).map(([tb, data]) => `
          <div class="cnpt-compare-card">
            <h4>${CNPT.utils.escapeHtml(tb)}</h4>
            <p style="font-size:20px;font-weight:700;color:#8e44ad;margin:4px 0">${data.count}个知识点</p>
            <p style="font-size:12px;color:#666">
              学科: ${Object.entries(data.subjects).sort((a,b) => b[1]-a[1]).slice(0,3).map(([s,c]) => `${s}(${c})`).join('、')}
            </p>
            <p style="font-size:12px;color:#666">
              年级分布: ${Object.entries(data.grades).sort((a,b) => a[0]-b[0]).map(([g,c]) => `${g}年(${c})`).join(' ')}
            </p>
          </div>
        `).join('')}
      </div>
    `;
  }

  // ========== 图谱标注 ==========
  function initAnnotation() {
    let debounceTimer;
    DOM.annotateSearchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => performAnnotateSearch(DOM.annotateSearchInput.value), 300);
    });
  }

  function performAnnotateSearch(query) {
    if (!query || query.length < 2) {
      DOM.annotateSearchResults.classList.remove('show');
      return;
    }
    const results = CNPT.search.search(query, { limit: 8 });
    if (results.length === 0) {
      DOM.annotateSearchResults.innerHTML = '<div class="cnpt-search-result-item">无匹配结果</div>';
    } else {
      DOM.annotateSearchResults.innerHTML = results.map(r => `
        <div class="cnpt-search-result-item" data-id="${r.topic.id}">
          ${CNPT.utils.escapeHtml(r.topic.name)}
          <span style="color:#999;font-size:11px"> · ${r.topic.subject} · ${r.topic.grade}年级</span>
        </div>
      `).join('');
    }
    DOM.annotateSearchResults.classList.add('show');

    DOM.annotateSearchResults.querySelectorAll('.cnpt-search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const topicId = item.dataset.id;
        if (topicId) {
          DOM.annotateSearchInput.value = item.textContent.trim();
          DOM.annotateSearchResults.classList.remove('show');
          showAnnotationEditor(topicId);
        }
      });
    });
  }

  function showAnnotationEditor(topicId) {
    const topic = state.indices.topicMap.get(topicId);
    if (!topic) return;

    const ann = state.annotations[topicId] || { key: '', error: '', tip: '' };
    const subjectColor = CNPT.constants.COLORS[topic.subject] || '#95a5a6';

    DOM.annotationPanel.innerHTML = `
      <div class="cnpt-annotation-card">
        <div class="cnpt-annotation-header">
          <div>
            <h3 style="margin:0">${CNPT.utils.escapeHtml(topic.name)}</h3>
            <span style="display:inline-block;margin-top:4px;padding:2px 8px;border-radius:4px;color:#fff;font-size:11px;background:${subjectColor}">${CNPT.utils.escapeHtml(topic.subject)} · ${topic.grade}年级</span>
          </div>
        </div>
        <div style="display:grid;gap:12px">
          <div class="cnpt-form-group">
            <label>教学重点：</label>
            <textarea id="ann-key" class="cnpt-input" rows="2" placeholder="该知识点的教学重点...">${CNPT.utils.escapeHtml(ann.key || '')}</textarea>
          </div>
          <div class="cnpt-form-group">
            <label>易错点：</label>
            <textarea id="ann-error" class="cnpt-input" rows="2" placeholder="学生容易出错的地方...">${CNPT.utils.escapeHtml(ann.error || '')}</textarea>
          </div>
          <div class="cnpt-form-group">
            <label>教学建议：</label>
            <textarea id="ann-tip" class="cnpt-input" rows="2" placeholder="教学方法建议...">${CNPT.utils.escapeHtml(ann.tip || '')}</textarea>
          </div>
        </div>
        <div style="margin-top:12px;display:flex;gap:8px">
          <button class="cnpt-btn cnpt-btn-primary" id="btn-save-annotation">💾 保存标注</button>
          <button class="cnpt-btn cnpt-btn-secondary" id="btn-clear-annotation">🗑️ 清除标注</button>
        </div>
      </div>
    `;

    document.getElementById('btn-save-annotation').addEventListener('click', () => {
      state.annotations[topicId] = {
        key: document.getElementById('ann-key').value,
        error: document.getElementById('ann-error').value,
        tip: document.getElementById('ann-tip').value
      };
      saveAnnotations();
      CNPT.utils.showToast('标注已保存');
    });

    document.getElementById('btn-clear-annotation').addEventListener('click', () => {
      delete state.annotations[topicId];
      saveAnnotations();
      showAnnotationEditor(topicId);
      CNPT.utils.showToast('标注已清除');
    });
  }

  function saveAnnotations() {
    try {
      localStorage.setItem('cnpt-researcher-annotations', JSON.stringify(state.annotations));
    } catch (e) { /* ignore */ }
  }

  function loadAnnotations() {
    try {
      const data = localStorage.getItem('cnpt-researcher-annotations');
      if (data) state.annotations = JSON.parse(data);
    } catch (e) { /* ignore */ }
  }

  // ========== 分析报告 ==========
  function initReport() {
    document.getElementById('btn-generate-analysis').addEventListener('click', generateAnalysisReport);
  }

  function generateAnalysisReport() {
    const topics = state.fullData.topics.topics;
    const deps = state.fullData.deps.dependencies;

    // 图谱结构统计
    const degree = {};
    topics.forEach(t => degree[t.id] = 0);
    deps.forEach(d => {
      degree[d.topicId] = (degree[d.topicId] || 0) + 1;
      degree[d.prerequisiteId] = (degree[d.prerequisiteId] || 0) + 1;
    });

    const degrees = Object.values(degree);
    const avgDeg = (degrees.reduce((a, b) => a + b, 0) / degrees.length).toFixed(1);
    const maxDeg = Math.max(...degrees);

    // 标注统计
    const annCount = Object.keys(state.annotations).length;

    DOM.analysisReportResult.innerHTML = `
      <div class="cnpt-analysis-section">
        <h3>📊 知识图谱结构概况</h3>
        <ul style="font-size:13px;line-height:1.8">
          <li>节点总数: <strong>${topics.length}</strong></li>
          <li>依赖边数: <strong>${deps.length}</strong></li>
          <li>平均连接度: <strong>${avgDeg}</strong></li>
          <li>最大连接度: <strong>${maxDeg}</strong></li>
          <li>依赖密度: <strong>${(deps.length / topics.length).toFixed(2)}</strong> (边/节点)</li>
        </ul>
      </div>
      <div class="cnpt-analysis-section">
        <h3>📝 教研标注统计</h3>
        <ul style="font-size:13px;line-height:1.8">
          <li>已标注知识点: <strong>${annCount}</strong></li>
          <li>标注覆盖率: <strong>${((annCount/topics.length)*100).toFixed(2)}%</strong></li>
        </ul>
      </div>
      <div style="padding:12px;background:#f8f9fa;border-top:1px solid #eee">
        <button class="cnpt-btn cnpt-btn-primary" id="btn-download-analysis">⬇️ 下载分析报告</button>
        <button class="cnpt-btn cnpt-btn-secondary" id="btn-export-annotations">📤 导出标注数据</button>
      </div>
    `;

    document.getElementById('btn-download-analysis').addEventListener('click', () => {
      const reportGen = new CNPT.ReportGenerator(state.fullData, state.indices);
      const html = DOM.analysisReportResult.innerHTML;
      reportGen.downloadHTML(`<div style="padding:20px">${html}</div>`, '图谱分析报告.html');
    });

    document.getElementById('btn-export-annotations').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(state.annotations, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `annotations-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // ========== 启动 ==========
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
