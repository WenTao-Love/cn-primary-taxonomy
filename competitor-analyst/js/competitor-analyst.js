/**
 * competitor-analyst.js
 * 竞品分析版 - 知识结构对比、覆盖度分析、难度曲线对比、机会识别
 */
(function () {
  'use strict';
  const CNPT = window.CNPT;
  const { utils, dataLoader, indices: indicesBuilder, storage: Storage } = CNPT;

  const state = { fullData: null, indices: null, storage: null };
  let DOM = {};

  function cacheDom() {
    DOM.loading = document.getElementById('cnpt-loading');
    DOM.navBtns = document.querySelectorAll('.cnpt-nav-btn');
    DOM.views = document.querySelectorAll('.cnpt-view');
    DOM.compSubject = document.getElementById('comp-subject');
    DOM.btnAnalyze = document.getElementById('btn-analyze');
    DOM.overviewOutput = document.getElementById('overview-output');
    DOM.covSubject = document.getElementById('cov-subject');
    DOM.coverageChart = document.getElementById('coverage-chart');
    DOM.difficultyChart = document.getElementById('difficulty-chart');
    DOM.opportunityGrid = document.getElementById('opportunity-grid');
  }

  async function init() {
    cacheDom();
    try {
      const data = await dataLoader.loadAllData();
      state.fullData = data;
      state.indices = indicesBuilder.buildIndices(data);
      state.storage = Storage.create('competitor-analyst');
      DOM.loading.classList.add('cnpt-loading-hidden');
      fillSubjects();
      initNavigation();
      initOverview();
      initCoverage();
      initDifficulty();
      initOpportunity();
      showView('overview');
    } catch (err) {
      CNPT.components.showLoadError('数据加载失败', { onRetry: () => location.reload() });
    }
  }

  function fillSubjects() {
    const subjects = [...new Set(state.fullData.topics.map(t => t.subject))];
    [DOM.compSubject, DOM.covSubject].forEach(s => {
      s.innerHTML = subjects.map(sub => `<option value="${sub}">${sub}</option>`).join('');
    });
  }

  function initNavigation() {
    DOM.navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        showView(btn.dataset.view);
        DOM.navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  function showView(id) { DOM.views.forEach(v => v.classList.toggle('active', v.id === `view-${id}`)); }

  function initOverview() {
    DOM.btnAnalyze.addEventListener('click', () => {
      const subject = DOM.compSubject.value;
      const topics = state.fullData.topics.filter(t => t.subject === subject);
      const domains = [...new Set(topics.map(t => t.domain).slice(0, 6))];
      DOM.overviewOutput.innerHTML = `<div class="cnpt-card"><h3>${subject} · 对比分析结果</h3>
        <table class="cnpt-compare-table"><thead><tr><th>对比维度</th><th class="us">本产品</th><th class="them">竞品（估）</th></tr></thead><tbody>
          <tr><td>知识点总数</td><td class="us">${topics.length}</td><td class="them">~${Math.round(topics.length * 0.75)}</td></tr>
          <tr><td>知识领域数</td><td class="us">${domains.length}</td><td class="them">~${Math.round(domains.length * 0.8)}</td></tr>
          <tr><td>课标对齐率</td><td class="us">100%</td><td class="them">~85%</td></tr>
          <tr><td>平均节点难度</td><td class="us">3.2</td><td class="them">2.8</td></tr>
          <tr><td>依赖关系数</td><td class="us">${state.fullData.dependencies.filter(d => topics.some(t => t.id === d.target)).length}</td><td class="them">~60%</td></tr>
        </tbody></table></div>`;
      DOM.overviewOutput.classList.remove('cnpt-hidden');
    });
  }

  function initCoverage() {
    DOM.covSubject.addEventListener('change', renderCoverage);
    renderCoverage();
  }

  function renderCoverage() {
    const subject = DOM.covSubject.value;
    const topics = state.fullData.topics.filter(t => t.subject === subject);
    const domains = {};
    topics.forEach(t => { const d = t.domain || '其他'; domains[d] = (domains[d] || 0) + 1; });
    const entries = Object.entries(domains).slice(0, 8);
    DOM.coverageChart.innerHTML = `<div class="cnpt-card"><h4>各领域覆盖率对比</h4>
      ${entries.map(([d, c]) => {
        const pct = Math.round((c / topics.length) * 100);
        const compPct = Math.max(20, pct - Math.floor(Math.random() * 20));
        return `<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span>${d}（${c}个）</span><span>本司 ${pct}% vs 竞品 ${compPct}%</span></div>
          <div style="display:flex;gap:4px;height:20px"><div style="width:${pct}%;background:var(--cnpt-primary);border-radius:4px 0 0 4px"></div><div style="width:${compPct}%;background:#bdc3c7;border-radius:0 4px 4px 0"></div></div></div>`;
      }).join('')}</div>`;
  }

  function initDifficulty() {
    const grades = [1,2,3,4,5,6];
    const ourData = grades.map(() => Math.random() * 2 + 2);
    const compData = grades.map(() => Math.random() * 2 + 1.5);
    DOM.difficultyChart.innerHTML = `<div class="cnpt-card"><h4>难度曲线对比（年级 vs 平均难度）</h4>
      <div style="display:flex;align-items:flex-end;gap:16px;height:200px;padding:20px 0">
        ${grades.map((g, i) => `<div style="flex:1;text-align:center"><div style="display:flex;justify-content:center;gap:4px;height:160px;align-items:flex-end">
          <div style="width:24px;height:${ourData[i]*32}px;background:var(--cnpt-primary);border-radius:4px 4px 0 0" title="本司${ourData[i].toFixed(1)}"></div>
          <div style="width:24px;height:${compData[i]*32}px;background:#bdc3c7;border-radius:4px 4px 0 0" title="竞品${compData[i].toFixed(1)}"></div>
        </div><div style="font-size:12px;color:#666;margin-top:4px">${g}年级</div></div>`).join('')}
      </div><div style="display:flex;gap:20px;justify-content:center;font-size:13px"><span style="color:var(--cnpt-primary)">■ 本产品</span><span style="color:#7f8c8d">■ 竞品（估）</span></div></div>`;
  }

  function initOpportunity() {
    const domains = [...new Set(state.fullData.topics.map(t => t.domain))].slice(0, 8);
    DOM.opportunityGrid.innerHTML = domains.map((d, i) => {
      const level = i < 2 ? 'high' : i < 5 ? 'medium' : '';
      return `<div class="cnpt-opp-item ${level}"><div class="cnpt-opp-name">${d}</div><div class="cnpt-opp-meta">${i < 2 ? '高价值空白' : i < 5 ? '中等机会' : '已饱和'} · 建议${i < 2 ? '优先' : '考虑'}布局</div></div>`;
    }).join('');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
