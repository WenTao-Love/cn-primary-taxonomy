/**
 * edu-sales.js
 * 教育销售版 - 快速诊断、学习方案、提分预测、竞品对比、转化漏斗
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
    DOM.diagSubject = document.getElementById('diag-subject');
    DOM.btnDiagnose = document.getElementById('btn-diagnose');
    DOM.diagnoseOutput = document.getElementById('diagnose-output');
    DOM.btnGenerateProposal = document.getElementById('btn-generate-proposal');
    DOM.proposalOutput = document.getElementById('proposal-output');
    DOM.btnPredictScore = document.getElementById('btn-predict-score');
    DOM.predictionOutput = document.getElementById('prediction-output');
    DOM.btnCompare = document.getElementById('btn-compare');
    DOM.compareOutput = document.getElementById('compare-output');
  }

  async function init() {
    cacheDom();
    try {
      const data = await dataLoader.loadAllData();
      state.fullData = data;
      state.indices = indicesBuilder.buildIndices(data);
      state.storage = Storage.create('edu-sales');
      DOM.loading.classList.add('cnpt-loading-hidden');
      fillSubjects();
      initNavigation();
      initDiagnose();
      initProposal();
      initPrediction();
      initCompare();
      showView('diagnose');
    } catch (err) {
      CNPT.components.showLoadError('数据加载失败', { onRetry: () => location.reload() });
    }
  }

  function fillSubjects() {
    const subjects = [...new Set(state.fullData.topics.map(t => t.subject))];
    DOM.diagSubject.innerHTML = subjects.map(s => `<option value="${s}">${s}</option>`).join('');
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

  function showView(id) {
    DOM.views.forEach(v => v.classList.toggle('active', v.id === `view-${id}`));
  }

  function initDiagnose() {
    DOM.btnDiagnose.addEventListener('click', () => {
      const subject = DOM.diagSubject.value;
      const topics = state.fullData.topics.filter(t => t.subject === subject && t.grade >= 4);
      const weak = topics.filter(t => t.difficulty >= 4).slice(0, 8);
      DOM.diagnoseOutput.innerHTML = `
        <div class="cnpt-card"><h3>诊断结果</h3>
          <div class="cnpt-result-cards">
            <div class="cnpt-result-card"><div class="cnpt-result-value">${topics.length}</div><div class="cnpt-result-label">总知识点</div></div>
            <div class="cnpt-result-card"><div class="cnpt-result-value">${weak.length}</div><div class="cnpt-result-label">薄弱点</div></div>
            <div class="cnpt-result-card"><div class="cnpt-result-value">${Math.round(Math.random()*30+40)}%</div><div class="cnpt-result-label">预估掌握率</div></div>
          </div>
          <div class="cnpt-weak-topics"><h4 style="margin:16px 0 8px">主要薄弱知识点</h4>
            ${weak.map(t => `<div class="cnpt-weak-topic"><span class="name">${utils.escapeHtml(t.name)}</span><span class="badge">难度${t.difficulty}</span></div>`).join('')}
          </div>
        </div>`;
      DOM.diagnoseOutput.classList.remove('cnpt-hidden');
    });
  }

  function initProposal() {
    DOM.btnGenerateProposal.addEventListener('click', () => {
      const plans = [
        { title: '基础巩固方案', price: '¥2,990', features: ['12周系统学习', '每周2次课', '基础题库500道', '月度测评报告'] },
        { title: '稳健提升方案', price: '¥4,990', features: ['16周系统学习', '每周3次课', '进阶题库1000道', '双周测评报告', '免费重听'] },
        { title: '冲刺提分方案', price: '¥7,990', features: ['20周系统学习', '每周4次课', '真题题库2000道', '周测报告', '一对一答疑', '保分协议'] }
      ];
      DOM.proposalOutput.innerHTML = `<div class="cnpt-card"><h3>推荐学习方案</h3>
        ${plans.map(p => `<div class="cnpt-plan-card"><div class="cnpt-plan-header"><span class="cnpt-plan-title">${p.title}</span><span class="cnpt-plan-price">${p.price}</span></div><ul class="cnpt-plan-features">${p.features.map(f => `<li>✓ ${f}</li>`).join('')}</ul></div>`).join('')}
      </div>`;
      DOM.proposalOutput.classList.remove('cnpt-hidden');
    });
  }

  function initPrediction() {
    DOM.btnPredictScore.addEventListener('click', () => {
      const current = parseInt(document.getElementById('pred-current').value) || 75;
      const target = parseInt(document.getElementById('pred-target').value) || 90;
      const weeks = 12;
      const months = Array.from({ length: 4 }, (_, i) => {
        const val = Math.min(target, current + (target - current) * ((i + 1) / 4));
        return { label: `第${i+1}月`, val: Math.round(val) };
      });
      DOM.predictionOutput.innerHTML = `<div class="cnpt-card"><h3>提分预测曲线</h3><div class="cnpt-prediction-chart">
        ${months.map(m => `<div class="cnpt-prediction-bar" style="height:${m.val}%">${m.val}分</div>`).join('')}
      </div><div style="display:flex;justify-content:space-between;margin-top:8px">${months.map(m => `<span style="font-size:12px;color:#666">${m.label}</span>`).join('')}</div>
      <p style="margin-top:16px;color:#666">预计经过12周学习，可从<strong>${current}分</strong>提升至<strong>${target}分</strong>，提分空间约${target-current}分。</p></div>`;
      DOM.predictionOutput.classList.remove('cnpt-hidden');
    });
  }

  function initCompare() {
    DOM.btnCompare.addEventListener('click', () => {
      const name = document.getElementById('comp-name').value || '竞品机构';
      DOM.compareOutput.innerHTML = `<div class="cnpt-card"><h3>对比结果</h3><div class="cnpt-compare-grid">
        <div class="cnpt-compare-col us"><h4>🏆 本机构</h4><div class="cnpt-compare-stat">4275</div><p>知识点覆盖</p><div class="cnpt-compare-stat">100%</div><p>课标对齐</p></div>
        <div class="cnpt-compare-col them"><h4>${utils.escapeHtml(name)}</h4><div class="cnpt-compare-stat">~3000</div><p>知识点覆盖（估）</p><div class="cnpt-compare-stat">~75%</div><p>课标对齐（估）</p></div>
      </div></div>`;
      DOM.compareOutput.classList.remove('cnpt-hidden');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
