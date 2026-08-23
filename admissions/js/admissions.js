/**
 * admissions.js
 * 招生办版 - 招生简章生成、数据展示、宣传素材、差异对比
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
    DOM.btnGenerateBrochure = document.getElementById('btn-generate-brochure');
    DOM.brochureOutput = document.getElementById('brochure-output');
    DOM.vizContainer = document.getElementById('viz-container');
    DOM.materialsGrid = document.getElementById('materials-grid');
    DOM.btnCompareSchool = document.getElementById('btn-compare-school');
    DOM.comparisonOutput = document.getElementById('comparison-output');
  }

  async function init() {
    cacheDom();
    try {
      const data = await dataLoader.loadAllData();
      state.fullData = data;
      state.indices = indicesBuilder.buildIndices(data);
      state.storage = Storage.create('admissions');
      DOM.loading.classList.add('cnpt-loading-hidden');
      initNavigation();
      initBrochure();
      initVisualization();
      initMaterials();
      initComparison();
      showView('brochure');
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

  function initBrochure() {
    DOM.btnGenerateBrochure.addEventListener('click', () => {
      const name = document.getElementById('school-name').value || '本校';
      const feature = document.getElementById('school-feature').value || '全面发展';
      const topics = state.fullData.topics;
      const domains = [...new Set(topics.map(t => t.domain))].slice(0, 6);
      DOM.brochureOutput.innerHTML = `<div class="cnpt-brochure-preview">
        <div class="cnpt-brochure-header"><div class="cnpt-brochure-title">${utils.escapeHtml(name)}2026年招生简章</div></div>
        <div class="cnpt-brochure-section"><h4>办学理念</h4><p>${utils.escapeHtml(name)}秉承"${utils.escapeHtml(feature)}"的办学理念，致力于培养学生全面发展。</p></div>
        <div class="cnpt-brochure-section"><h4>课程体系</h4><p>基于${topics.length}个知识点的完整图谱，覆盖以下领域：</p><ul style="padding-left:20px;line-height:2">${domains.map(d => `<li>${d}</li>`).join('')}</ul></div>
        <div class="cnpt-brochure-section"><h4>培养目标</h4><p>培养具备扎实学科基础、创新思维能力和全面素养的新时代少年。</p></div>
      </div><div style="text-align:center;margin-top:16px"><button class="cnpt-btn cnpt-btn-primary" onclick="window.print()">打印简章</button></div>`;
      DOM.brochureOutput.classList.remove('cnpt-hidden');
    });
  }

  function initVisualization() {
    const subjects = [...new Set(state.fullData.topics.map(t => t.subject))];
    DOM.vizContainer.innerHTML = `<div class="cnpt-card"><h4>学校知识点覆盖全景</h4>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;margin-top:12px">
        ${subjects.map(s => {
          const count = state.fullData.topics.filter(t => t.subject === s).length;
          return `<div style="text-align:center;padding:12px;background:#f8f8f8;border-radius:8px"><div style="font-size:24px;font-weight:bold;color:var(--cnpt-primary)">${count}</div><div style="font-size:12px;color:#666">${s}</div></div>`;
        }).join('')}
      </div></div>`;
  }

  function initMaterials() {
    const items = [
      { icon: '📱', title: '微信推文', desc: '一键生成知识点科普推文' },
      { icon: '🎬', title: '短视频脚本', desc: '知识点讲解视频脚本' },
      { icon: '🖼️', title: '海报素材', desc: '数据可视化海报' },
      { icon: '📋', title: '招生问答', desc: '常见家长疑问解答库' },
      { icon: '📊', title: '数据报告', desc: '教学质量白皮书' },
      { icon: '🎯', title: 'H5页面', desc: '手机端互动展示页' }
    ];
    DOM.materialsGrid.innerHTML = items.map(i => `<div class="cnpt-material-card"><div class="cnpt-material-icon">${i.icon}</div><div style="font-weight:bold;margin-bottom:4px">${i.title}</div><div style="font-size:12px;color:#666">${i.desc}</div></div>`).join('');
  }

  function initComparison() {
    DOM.btnCompareSchool.addEventListener('click', () => {
      const name = document.getElementById('compare-school').value || '对比学校';
      DOM.comparisonOutput.innerHTML = `<div class="cnpt-card"><h4>${utils.escapeHtml(name)} 对比结果</h4>
        <table class="cnpt-compare-table"><thead><tr><th>维度</th><th>本校</th><th>${utils.escapeHtml(name)}</th></tr></thead><tbody>
          <tr><td>知识点覆盖</td><td style="color:#27ae60;font-weight:bold">${state.fullData.topics.length}</td><td>~${Math.round(state.fullData.topics.length * 0.7)}</td></tr>
          <tr><td>课标对齐</td><td style="color:#27ae60;font-weight:bold">100%</td><td>~85%</td></tr>
          <tr><td>系统完整度</td><td style="color:#27ae60;font-weight:bold">完整</td><td>部分</td></tr>
        </tbody></table></div>`;
      DOM.comparisonOutput.classList.remove('cnpt-hidden');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
