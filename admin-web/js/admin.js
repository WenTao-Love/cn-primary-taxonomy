/*!
 * CN-Primary-Taxonomy · 教育管理版主应用
 * 角色：admin - 全校教学质量监控+覆盖度分析+学业预警
 * 特征：数据驱动决策、识别教学盲区、预警学习断层
 */
(function() {
  'use strict';

  const state = {
    role: 'admin',
    fullData: null,
    indices: null
  };

  const DOM = {};

  function cacheDom() {
    DOM.topInfo = document.getElementById('top-info');
    DOM.statTotalTopics = document.getElementById('stat-total-topics');
    DOM.statTotalSubjects = document.getElementById('stat-total-subjects');
    DOM.statTotalGrades = document.getElementById('stat-total-grades');
    DOM.statTotalDeps = document.getElementById('stat-total-deps');
    DOM.gradeDistribution = document.getElementById('grade-distribution');
    DOM.subjectDistribution = document.getElementById('subject-distribution');
    DOM.difficultyDistribution = document.getElementById('difficulty-distribution');
    DOM.coverageMatrixBody = document.getElementById('coverage-matrix-body');
    DOM.statStandardsCovered = document.getElementById('stat-standards-covered');
    DOM.statStandardsUncovered = document.getElementById('stat-standards-uncovered');
    DOM.statStandardsRate = document.getElementById('stat-standards-rate');
    DOM.uncoveredTopics = document.getElementById('uncovered-topics');
    DOM.criticalTopics = document.getElementById('critical-topics');
    DOM.crossGradeDeps = document.getElementById('cross-grade-deps');
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

    // 更新顶部信息
    const subjects = new Set(state.fullData.topics.topics.map(t => t.subject));
    const grades = new Set(state.fullData.topics.topics.map(t => t.grade));
    DOM.topInfo.textContent = `${state.fullData.topics.topicCount}知识点 · ${subjects.size}学科 · ${grades.size}个年级`;

    initNavigation();
    initOverview();
    initCoverageMatrix();
    initStandardsCheck();
    initQualityAlerts();
    initSettings();

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

  // ========== 全校概览 ==========
  function initOverview() {
    const topics = state.fullData.topics.topics;
    const subjects = [...new Set(topics.map(t => t.subject))];
    const grades = [...new Set(topics.map(t => t.grade))].sort();

    DOM.statTotalTopics.textContent = topics.length;
    DOM.statTotalSubjects.textContent = subjects.length;
    DOM.statTotalGrades.textContent = grades.length;
    DOM.statTotalDeps.textContent = state.fullData.deps.dependencies.length;

    // 年级分布柱状图
    const gradeCounts = {};
    topics.forEach(t => { gradeCounts[t.grade] = (gradeCounts[t.grade] || 0) + 1; });
    const maxGrade = Math.max(...Object.values(gradeCounts));
    DOM.gradeDistribution.innerHTML = Object.entries(gradeCounts)
      .sort((a, b) => a[0] - b[0])
      .map(([grade, count]) => createBarRow(`${grade}年级`, count, maxGrade, '#11998e')).join('');

    // 学科分布柱状图
    const subjectCounts = {};
    topics.forEach(t => { subjectCounts[t.subject] = (subjectCounts[t.subject] || 0) + 1; });
    const maxSubject = Math.max(...Object.values(subjectCounts));
    DOM.subjectDistribution.innerHTML = Object.entries(subjectCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([subj, count]) => createBarRow(subj, count, maxSubject, '#38ef7d')).join('');

    // 难度分布柱状图
    const diffCounts = {};
    topics.forEach(t => { diffCounts[t.difficulty] = (diffCounts[t.difficulty] || 0) + 1; });
    const maxDiff = Math.max(...Object.values(diffCounts));
    const diffColors = { 1: '#27ae60', 2: '#2ecc71', 3: '#f39c12', 4: '#e67e22', 5: '#e74c3c' };
    DOM.difficultyDistribution.innerHTML = Object.entries(diffCounts)
      .sort((a, b) => a[0] - b[0])
      .map(([diff, count]) => createBarRow(`难度${diff}`, count, maxDiff, diffColors[diff] || '#95a5a6')).join('');
  }

  function createBarRow(label, count, max, color) {
    const pct = max > 0 ? (count / max) * 100 : 0;
    return `
      <div class="cnpt-bar-row">
        <span class="cnpt-bar-label">${label}</span>
        <div class="cnpt-bar-track">
          <div class="cnpt-bar-fill" style="background:${color};width:${pct}%"></div>
          <span class="cnpt-bar-value">${count}</span>
        </div>
      </div>
    `;
  }

  // ========== 覆盖度矩阵 ==========
  function initCoverageMatrix() {
    const topics = state.fullData.topics.topics;
    const subjects = [...new Set(topics.map(t => t.subject))].sort();
    const grades = [1, 2, 3, 4, 5, 6];

    const matrix = {};
    subjects.forEach(s => { matrix[s] = {}; grades.forEach(g => { matrix[s][g] = 0; }); });
    topics.forEach(t => {
      if (matrix[t.subject] && matrix[t.subject][t.grade] !== undefined) {
        matrix[t.subject][t.grade]++;
      }
    });

    DOM.coverageMatrixBody.innerHTML = subjects.map(s => {
      const total = grades.reduce((sum, g) => sum + matrix[s][g], 0);
      return `<tr>
        <td><strong>${CNPT.utils.escapeHtml(s)}</strong></td>
        ${grades.map(g => `<td>${matrix[s][g] || 0}</td>`).join('')}
        <td><strong>${total}</strong></td>
      </tr>`;
    }).join('');
  }

  // ========== 课标落实检查 ==========
  function initStandardsCheck() {
    const topics = state.fullData.topics.topics;
    let covered = 0;
    let uncovered = 0;
    const uncoveredList = [];

    topics.forEach(t => {
      if (t.standards && t.standards.length > 0) {
        covered++;
      } else {
        uncovered++;
        uncoveredList.push(t);
      }
    });

    DOM.statStandardsCovered.textContent = covered;
    DOM.statStandardsUncovered.textContent = uncovered;
    DOM.statStandardsRate.textContent = Math.round((covered / topics.length) * 100) + '%';

    // 显示未覆盖的知识点
    DOM.uncoveredTopics.innerHTML = `
      <table class="cnpt-table">
        <thead><tr><th>知识点</th><th>学科</th><th>年级</th><th>领域</th></tr></thead>
        <tbody>
          ${uncoveredList.slice(0, 50).map(t => `
            <tr>
              <td>${CNPT.utils.escapeHtml(t.name)}</td>
              <td>${CNPT.utils.escapeHtml(t.subject)}</td>
              <td>${t.grade}年级</td>
              <td>${CNPT.utils.escapeHtml(t.domain || '-')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ${uncoveredList.length > 50 ? `<p style="padding:12px;color:#666">仅显示前50个，共${uncoveredList.length}个知识点未关联课标</p>` : ''}
    `;
  }

  // ========== 学业预警 ==========
  function initQualityAlerts() {
    const topics = state.fullData.topics.topics;
    const deps = state.fullData.deps.dependencies;

    // 1. 高难度+高依赖的关键节点
    const incomingCount = {};
    deps.forEach(d => { incomingCount[d.topicId] = (incomingCount[d.topicId] || 0) + 1; });

    const criticalNodes = topics
      .filter(t => (incomingCount[t.id] || 0) >= 5 && t.difficulty >= 4)
      .sort((a, b) => (incomingCount[b.id] || 0) - (incomingCount[a.id] || 0))
      .slice(0, 20);

    DOM.criticalTopics.innerHTML = criticalNodes.length > 0 ? `
      <table class="cnpt-table">
        <thead><tr><th>知识点</th><th>学科</th><th>年级</th><th>难度</th><th>被依赖次数</th><th>预警</th></tr></thead>
        <tbody>
          ${criticalNodes.map(t => {
            const count = incomingCount[t.id] || 0;
            const warningClass = count >= 10 ? 'cnpt-warning-high' : count >= 7 ? 'cnpt-warning-medium' : 'cnpt-warning-low';
            const warningText = count >= 10 ? '高' : count >= 7 ? '中' : '低';
            return `<tr>
              <td>${CNPT.utils.escapeHtml(t.name)}</td>
              <td>${CNPT.utils.escapeHtml(t.subject)}</td>
              <td>${t.grade}年级</td>
              <td>难度${t.difficulty}</td>
              <td>${count}</td>
              <td><span class="cnpt-warning-badge ${warningClass}">${warningText}</span></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    ` : '<p style="color:#28a745">暂无高风险关键节点</p>';

    // 2. 跨年级依赖
    const crossGradeDeps = deps.filter(d => {
      const source = state.indices.topicMap.get(d.prerequisiteId);
      const target = state.indices.topicMap.get(d.topicId);
      return source && target && source.grade !== target.grade;
    });

    // 统计跨年级依赖
    const crossGradeSummary = {};
    crossGradeDeps.forEach(d => {
      const source = state.indices.topicMap.get(d.prerequisiteId);
      const target = state.indices.topicMap.get(d.topicId);
      if (source && target) {
        const key = `${source.grade}→${target.grade}`;
        crossGradeSummary[key] = (crossGradeSummary[key] || 0) + 1;
      }
    });

    const sortedCrossGrade = Object.entries(crossGradeSummary)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);

    DOM.crossGradeDeps.innerHTML = sortedCrossGrade.length > 0 ? `
      <table class="cnpt-table">
        <thead><tr><th>跨年级依赖方向</th><th>依赖数量</th><th>说明</th></tr></thead>
        <tbody>
          ${sortedCrossGrade.map(([key, count]) => {
            const [from, to] = key.split('→');
            return `<tr>
              <td>${from}年级 → ${to}年级</td>
              <td><strong>${count}</strong></td>
              <td style="font-size:12px;color:#666">${to}年级有${count}个知识点依赖${from}年级内容</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
      <p style="padding:12px;color:#666;font-size:12px">总跨年级依赖数: ${crossGradeDeps.length}</p>
    ` : '<p style="color:#999">暂无跨年级依赖数据</p>';
  }

  // ========== 设置 ==========
  function initSettings() {
    document.getElementById('btn-clear-cache').addEventListener('click', () => {
      if (confirm('确定要清除所有缓存数据吗？')) {
        // 清除所有cnpt-开头的localStorage
        Object.keys(localStorage)
          .filter(k => k.startsWith('cnpt-'))
          .forEach(k => localStorage.removeItem(k));
        CNPT.utils.showToast('缓存已清除');
      }
    });
  }

  // ========== 启动 ==========
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
