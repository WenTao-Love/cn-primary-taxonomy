/**
 * afterschool.js
 * 课后服务版 - 活动推荐、混龄分组、趣味学习、家长通报
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
    DOM.activitySubject = document.getElementById('activity-subject');
    DOM.activityType = document.getElementById('activity-type');
    DOM.activityGrid = document.getElementById('activity-grid');
    DOM.groupingStrategy = document.getElementById('grouping-strategy');
    DOM.gamifyGrid = document.getElementById('gamify-grid');
    DOM.btnGenerateReport = document.getElementById('btn-generate-report');
    DOM.reportOutput = document.getElementById('report-output');
  }

  async function init() {
    cacheDom();
    try {
      const data = await dataLoader.loadAllData();
      state.fullData = data;
      state.indices = indicesBuilder.buildIndices(data);
      state.storage = Storage.create('afterschool');
      DOM.loading.classList.add('cnpt-loading-hidden');
      fillSubjects();
      initNavigation();
      initActivities();
      initGrouping();
      initGamify();
      initReport();
      showView('activities');
    } catch (err) {
      CNPT.components.showLoadError('数据加载失败', { onRetry: () => location.reload() });
    }
  }

  function fillSubjects() {
    const subjects = [...new Set(state.fullData.topics.map(t => t.subject))];
    DOM.activitySubject.innerHTML = subjects.map(s => `<option value="${s}">${s}</option>`).join('');
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

  function initActivities() {
    renderActivities();
    DOM.activitySubject.addEventListener('change', renderActivities);
    DOM.activityType.addEventListener('change', renderActivities);
  }

  function renderActivities() {
    const subject = DOM.activitySubject.value;
    const topics = state.fullData.topics.filter(t => t.subject === subject).slice(0, 8);
    const icons = ['🎯', '🧩', '🎲', '📐', '🧪', '📖', '🎨', '🎵'];
    DOM.activityGrid.innerHTML = topics.map((t, i) => `
      <div class="cnpt-activity-card"><div class="cnpt-activity-icon">${icons[i % icons.length]}</div>
      <div class="cnpt-activity-title">${utils.escapeHtml(t.name)}</div>
      <div class="cnpt-activity-meta">${t.domain || '通用'} · ${t.grade}年级 · 难度${t.difficulty || 3}</div></div>`).join('');
  }

  function initGrouping() {
    const groups = [
      { name: '启蒙组', color: '#3498db', desc: '1-2年级，以游戏化方式为主', count: 15 },
      { name: '成长组', color: '#2ecc71', desc: '3-4年级，巩固与拓展并重', count: 20 },
      { name: '飞跃组', color: '#e67e22', desc: '5-6年级，深度探究与挑战', count: 18 }
    ];
    DOM.groupingStrategy.innerHTML = groups.map(g => `
      <div class="cnpt-grouping-item"><span class="cnpt-grouping-badge" style="background:${g.color}">${g.name}</span>
      <span style="flex:1">${g.desc}</span><span style="font-weight:bold">${g.count}人</span></div>`).join('');
  }

  function initGamify() {
    const games = [
      { icon: '🏰', title: '知识城堡', desc: '逐层通关，解锁知识点' },
      { icon: '🎪', title: '马戏团挑战', desc: '限时答题，赢取星星' },
      { icon: '🗺️', title: '知识探险', desc: '地图探索，收集宝藏' },
      { icon: '⚔️', title: '对战PK', desc: '小组对抗，知识竞赛' }
    ];
    DOM.gamifyGrid.innerHTML = games.map(g => `
      <div class="cnpt-activity-card"><div class="cnpt-activity-icon">${g.icon}</div>
      <div class="cnpt-activity-title">${g.title}</div>
      <div class="cnpt-activity-meta">${g.desc}</div></div>`).join('');
  }

  function initReport() {
    DOM.btnGenerateReport.addEventListener('click', () => {
      const subject = DOM.activitySubject.value;
      DOM.reportOutput.innerHTML = `<div class="cnpt-report-preview">
        <h3>课后服务通报</h3><hr style="margin:12px 0"/>
        <p>尊敬的家长：</p>
        <p>本周课后延时服务已顺利完成，以下是${subject}学科的活动内容：</p>
        <ul style="padding-left:20px;line-height:2">
          <li>复习巩固：已学知识点回顾与练习</li>
          <li>拓展探究：知识图谱延伸内容体验</li>
          <li>趣味游戏：知识解谜、小组竞赛活动</li>
        </ul>
        <p>感谢家长的支持与配合！</p>
      </div>`;
      DOM.reportOutput.classList.remove('cnpt-hidden');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
