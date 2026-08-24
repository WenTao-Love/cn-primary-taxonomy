/**
 * school-entity.js
 * 学校本体版 - 知识资产、招生卖点、师资配置、校本课程
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
    DOM.assetTopics = document.getElementById('asset-topics');
    DOM.assetDomains = document.getElementById('asset-domains');
    DOM.assetDeps = document.getElementById('asset-deps');
    DOM.assetDistribution = document.getElementById('asset-distribution');
    DOM.enrollmentAdvantages = document.getElementById('enrollment-advantages');
    DOM.facultyGap = document.getElementById('faculty-gap');
    DOM.btnDesignCurriculum = document.getElementById('btn-design-curriculum');
    DOM.curriculumOutput = document.getElementById('curriculum-output');
  }

  async function init() {
    cacheDom();
    try {
      const data = await dataLoader.loadAllData();
      state.fullData = data;
      state.indices = indicesBuilder.buildIndices(data);
      state.storage = Storage.create('school-entity');
      DOM.loading.classList.add('cnpt-loading-hidden');

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
      initNavigation();
      initAssets();
      initEnrollment();
      initFaculty();
      initCurriculum();
      showView('assets');
    } catch (err) {
      CNPT.components.showLoadError('数据加载失败', { onRetry: () => location.reload() });
    }
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

  function initAssets() {
    const topics = state.fullData.topics;
    const domains = [...new Set(topics.map(t => t.domain))];
    DOM.assetTopics.textContent = topics.length;
    DOM.assetDomains.textContent = domains.length;
    DOM.assetDeps.textContent = state.fullData.dependencies.length;

    // 分布图
    const subjectCounts = {};
    topics.forEach(t => { subjectCounts[t.subject] = (subjectCounts[t.subject] || 0) + 1; });
    const entries = Object.entries(subjectCounts).sort((a, b) => b[1] - a[1]);
    DOM.assetDistribution.innerHTML = entries.map(([s, c]) => {
      const pct = Math.round((c / topics.length) * 100);
      return `<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span>${s}</span><span>${c}个 (${pct}%)</span></div>
        <div style="height:16px;background:#eee;border-radius:8px;overflow:hidden"><div style="width:${pct}%;height:100%;background:var(--cnpt-gradient);border-radius:8px"></div></div></div>`;
    }).join('');
  }

  function initEnrollment() {
    const domains = [...new Set(state.fullData.topics.map(t => t.domain))].slice(0, 6);
    DOM.enrollmentAdvantages.innerHTML = domains.map((d, i) => `
      <div class="cnpt-advantage-card"><div class="cnpt-advantage-title">${i+1}. ${d}</div>
      <p style="font-size:13px;color:#666">本学科在该领域知识点覆盖完整，建议作为招生宣传亮点。</p></div>`).join('');
  }

  function initFaculty() {
    const subjects = [...new Set(state.fullData.topics.map(t => t.subject))];
    DOM.facultyGap.innerHTML = subjects.map(s => {
      const count = state.fullData.topics.filter(t => t.subject === s).length;
      const needTeachers = Math.ceil(count / 100);
      return `<div class="cnpt-faculty-item"><span>${s}（${count}个知识点）</span><span>建议配置 ${needTeaches} 名教师</span></div>`;
    }).join('');
  }

  function initCurriculum() {
    DOM.btnDesignCurriculum.addEventListener('click', () => {
      const domains = [...new Set(state.fullData.topics.map(t => t.domain))].slice(0, 5);
      DOM.curriculumOutput.innerHTML = `<h4 style="margin-bottom:12px">校本课程建议</h4>
        ${domains.map((d, i) => `<div class="cnpt-curriculum-card"><strong>课程${i+1}：${d}特色课程</strong><p style="font-size:13px;color:#666;margin-top:8px">基于"${d}"领域知识点体系设计，建议16-20课时，适合3-5年级选修。</p></div>`).join('')}`;
      DOM.curriculumOutput.classList.remove('cnpt-hidden');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();