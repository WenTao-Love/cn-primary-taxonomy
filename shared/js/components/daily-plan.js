/*!
 * CN-Primary-Taxonomy · 共享组件：今日学习台（每日任务）
 *
 * 借鉴《AI 自学数学账本》：
 *   - 75 分钟日预算，复习最多占用一半预算（37 分钟），超出后不再排复习
 *   - 先复习（FSRS 到期）后新学
 *   - 知识边界硬约束：硬前置未掌握的知识点进入"待解锁"，不排进新学
 *   - 低级失误台账摘要 + 错因分布（P01-P11）
 *
 * 数据只保存在 localStorage，不上传任何服务器。
 */
(function() {
  'use strict';

  let engine = null;
  let cfg = null;
  let session = { kind: null, startedAt: null, timer: null, flushed: 0 };

  function ensureEngine(role) {
    if (!engine || (role && engine.role !== role)) engine = window.CNPT.fsrs.create(role || 'student');
    return engine;
  }

  /**
   * 初始化今日学习台
   * @param {object} options
   * @param {string} options.role - student | parent | teacher
   * @param {Map} options.topicMap
   * @param {function} options.getIncoming - (id) => 入边数组
   * @param {function} options.isMastered - (id) => boolean
   * @param {HTMLElement|string} [options.mount] - 挂载容器
   * @param {function} [options.onStartTopic] - 点击知识点时回调 (topic, kind) => void
   */
  function initDailyPlan(options) {
    options = options || {};
    cfg = options;
    ensureEngine(options.role);

    if (options.mount) {
      const el = typeof options.mount === 'string' ? document.getElementById(options.mount) : options.mount;
      if (el) renderDailyPlan(el);
    }

    startSessionTimer();
    return api;
  }

  function api() { return publicApi; }
  const publicApi = { render: renderDailyPlan, refresh: refresh, startSessionTimer, stopSessionTimer, setSessionKind, getPlan };

  function getPlan() {
    if (!cfg || !cfg.topicMap) return null;
    return engine.buildTodayPlan({
      topicMap: cfg.topicMap,
      getIncoming: cfg.getIncoming,
      isMastered: cfg.isMastered
    });
  }

  function refresh() {
    if (cfg && cfg.mount) {
      const el = typeof cfg.mount === 'string' ? document.getElementById(cfg.mount) : cfg.mount;
      if (el) renderDailyPlan(el);
    }
  }

  // ---------------- 计时（75 分钟预算） ----------------

  function startSessionTimer() {
    stopSessionTimer();
    session.kind = null;
    session.startedAt = Date.now();
    session.timer = setInterval(() => {
      if (document.hidden) return;
      const elapsed = Math.round((Date.now() - session.startedAt) / 1000);
      if (session.kind && elapsed >= 30) {
        flushSeconds(session.kind, elapsed);
        session.startedAt = Date.now();
      }
    }, 10000);
    if (window.CNPT && CNPT.utils) {
      window.addEventListener('pagehide', () => flushOnLeave());
    }
  }

  function stopSessionTimer() {
    if (session.timer) { clearInterval(session.timer); session.timer = null; }
    flushOnLeave();
  }

  function flushOnLeave() {
    if (!session.kind || !session.startedAt) return;
    const elapsed = Math.round((Date.now() - session.startedAt) / 1000);
    if (elapsed > 0) flushSeconds(session.kind, elapsed);
    session.startedAt = null;
  }

  function flushSeconds(kind, seconds) {
    if (!engine || !kind) return;
    engine.dailySeconds[window.CNPT.utils.localDateKey()] = engine.dailySeconds[window.CNPT.utils.localDateKey()] || {};
    const rec = engine.dailySeconds[window.CNPT.utils.localDateKey()];
    rec[kind === 'new' ? 'newSeconds' : 'reviewSeconds'] = (rec[kind === 'new' ? 'newSeconds' : 'reviewSeconds'] || 0) + seconds;
    engine.save();
    refresh();
  }

  /**
   * 进入某类学习时调用（kind = 'review' | 'new'）
   */
  function setSessionKind(kind) {
    flushOnLeave();
    session.kind = kind;
    session.startedAt = Date.now();
  }

  // ---------------- 渲染 ----------------

  function progressColor(ratio) {
    if (ratio < 0.6) return '#2ecc71';
    if (ratio < 0.9) return '#f39c12';
    return '#e74c3c';
  }

  function topicRow(t, kind) {
    const color = (window.CNPT.constants.COLORS[t.subject]) || '#888';
    return `
      <div class="dp-item" data-topic="${t.id}" data-kind="${kind}">
        <span class="dp-dot" style="background:${color}"></span>
        <div class="dp-info">
          <div class="dp-name">${window.CNPT.utils.escapeHtml(t.name)}</div>
          <div class="dp-meta">${window.CNPT.utils.escapeHtml(t.subject)} · ${t.grade}年级${t.term || ''}</div>
        </div>
        <span class="dp-badge dp-badge-${kind}">${kind === 'review' ? '复习' : '新学'}</span>
      </div>`;
  }

  function renderDailyPlan(container) {
    if (!container) return;
    const plan = getPlan();
    if (!plan) {
      container.innerHTML = '<div class="empty-state">数据尚未就绪</div>';
      return;
    }
    const diag = (cfg && cfg.diagnostic) || null;
    const dueRetests = diag ? diag.getDueRetests(cfg.topicMap) : [];
    const dueBlind = diag ? diag.getDueBlindTests(cfg.topicMap) : [];
    const precheckTopics = (plan.newLearn || []).slice(0, 3);
    const usedTotal = plan.usedReviewMinutes + plan.usedNewMinutes;
    const ratio = Math.min(1, usedTotal / plan.budgetMinutes);
    const first = engine.getFirstAttemptAccuracy();
    const reasons = engine.getReasonDistribution();
    const lowLevel = engine.storage.getLowLevelMistakes();
    const reasonKeys = Object.keys(reasons).sort((a, b) => reasons[b] - reasons[a]);
    const reasonsLabel = (window.CNPT.constants && window.CNPT.constants.ERROR_REASONS) || {};

    container.innerHTML = `
      <div class="dp-card">
        <div class="dp-head">
          <div>
            <div class="dp-title">📅 今日学习台</div>
            <div class="dp-sub">${plan.dateKey} · 预算 ${plan.budgetMinutes} 分钟</div>
          </div>
          <div class="dp-clock">${usedTotal}<span>/${plan.budgetMinutes} 分</span></div>
        </div>
        <div class="dp-bar"><div class="dp-bar-fill" style="width:${Math.round(ratio * 100)}%;background:${progressColor(ratio)}"></div></div>
        <div class="dp-budget-row">
          <span>🔁 复习 ${plan.usedReviewMinutes}/${plan.reviewMinutes} 分（封顶一半预算）</span>
          <span>📘 新学 ${plan.usedNewMinutes}/${plan.newMinutes} 分</span>
        </div>
        ${plan.reviewBudgetCapped ? '<div class="dp-warn">⚠️ 复习已达预算上限，今天以少量回顾 + 新学为主。</div>' : ''}
      </div>

      <div class="dp-section">
        <h4 class="dp-h">🔁 先复习（到期 ${plan.review.length}）</h4>
        ${plan.review.length ? plan.review.map(t => topicRow(t, 'review')).join('') :
          '<div class="dp-empty">今天没有到期的复习任务，可以直接学新知识点 👏</div>'}
      </div>

      ${dueRetests.length ? `
        <div class="dp-section">
          <h4 class="dp-h">🔬 待重测（错题第 1 步 · 到期 ${dueRetests.length}）</h4>
          ${dueRetests.map(r => `
            <div class="dp-item" data-kind="retest" data-topic="${r.topicId}">
              <span class="dp-dot" style="background:#f39c12"></span>
              <div class="dp-info">
                <div class="dp-name">${window.CNPT.utils.escapeHtml(r.topic.name)}</div>
                <div class="dp-meta">20 分钟前答错 · 重测通过才能进次日盲测</div>
              </div>
              <span class="dp-badge dp-badge-retest">重测</span>
            </div>`).join('')}
        </div>` : ''}

      ${dueBlind.length ? `
        <div class="dp-section">
          <h4 class="dp-h">🌅 次日盲测（错题第 2 步 · 今日 ${dueBlind.length}）</h4>
          ${dueBlind.map(b => `
            <div class="dp-item" data-kind="blind" data-topic="${b.topicId}">
              <span class="dp-dot" style="background:#e74c3c"></span>
              <div class="dp-info">
                <div class="dp-name">${window.CNPT.utils.escapeHtml(b.topic.name)}</div>
                <div class="dp-meta">不看提示独立作答，通过即闭环</div>
              </div>
              <span class="dp-badge dp-badge-blind">盲测</span>
            </div>`).join('')}
        </div>` : ''}

      <div class="dp-section">
        <h4 class="dp-h">📘 再学新（可学 ${plan.newLearn.length}）</h4>
        ${plan.newLearn.length ? plan.newLearn.map(t => topicRow(t, 'new')).join('') : '<div class="dp-empty">暂无可学的新知识点</div>'}
      </div>

      ${precheckTopics.length ? `
        <div class="dp-section">
          <h4 class="dp-h">⚡ 预检跳课（3 题全对可直接标记掌握）</h4>
          ${precheckTopics.map(t => `
            <div class="dp-item" data-kind="precheck" data-topic="${t.id}">
              <span class="dp-dot" style="background:#9b59b6"></span>
              <div class="dp-info">
                <div class="dp-name">${window.CNPT.utils.escapeHtml(t.name)}</div>
                <div class="dp-meta">已经会了？先预检，跳过正式学习</div>
              </div>
              <span class="dp-badge dp-badge-precheck">预检</span>
            </div>`).join('')}
        </div>` : ''}

      ${plan.blocked.length ? `
        <div class="dp-section">
          <h4 class="dp-h">🔒 待解锁（知识边界：先补硬前置）</h4>
          ${plan.blocked.slice(0, 8).map(b => `
            <div class="dp-blocked">
              <div class="dp-name">${window.CNPT.utils.escapeHtml(b.topic.name)}</div>
              <div class="dp-meta">需先掌握：${b.missing.map(m => window.CNPT.utils.escapeHtml(m.name || m.id)).join('、')}</div>
            </div>`).join('')}
        </div>` : ''}

      <div class="dp-section">
        <h4 class="dp-h">📊 我的学习数据</h4>
        <div class="dp-stats">
          <div class="dp-stat"><b>${engine.getOverview().total}</b><span>在学卡片</span></div>
          <div class="dp-stat"><b>${first ? first.rate + '%' : '—'}</b><span>首做正确率</span></div>
          <div class="dp-stat"><b>${lowLevel.length}</b><span>低级失误</span></div>
        </div>
        ${reasonKeys.length ? `
          <div class="dp-reasons">
            <div class="dp-meta" style="margin-bottom:6px">错因分布（点错题时选错因可细化）</div>
            ${reasonKeys.slice(0, 5).map(k => `<span class="dp-reason">${k} ${window.CNPT.utils.escapeHtml(reasonsLabel[k] || '未分类')} · ${reasons[k]}</span>`).join('')}
          </div>` : '<div class="dp-empty">还没有错题记录</div>'}
        ${lowLevel.length ? `<div class="dp-warn">⚠️ 低级失误 ${lowLevel.length} 次，多来自"${window.CNPT.utils.escapeHtml(lowLevel[0].type || '未分类')}"，先改习惯再谈正确率。</div>` : ''}
      </div>
    `;

    container.querySelectorAll('.dp-item').forEach(el => {
      el.addEventListener('click', () => {
        const kind = el.dataset.kind;
        if (kind === 'retest' && cfg && cfg.onStartRetest) {
          const item = (diag.getDueRetests(cfg.topicMap) || []).find(r => r.topicId === el.dataset.topic);
          if (item) { setSessionKind('review'); cfg.onStartRetest(item); return; }
        }
        if (kind === 'blind' && cfg && cfg.onStartBlindTest) {
          const item = (diag.getDueBlindTests(cfg.topicMap) || []).find(b => b.topicId === el.dataset.topic);
          if (item) { setSessionKind('review'); cfg.onStartBlindTest(item); return; }
        }
        if (kind === 'precheck' && cfg && cfg.onStartPrecheck) {
          const t = (cfg.topicMap || new Map()).get(el.dataset.topic);
          if (t) { cfg.onStartPrecheck(t); return; }
        }
        setSessionKind(kind);
        if (cfg && cfg.onStartTopic) {
          const t = (cfg.topicMap || new Map()).get(el.dataset.topic);
          if (t) cfg.onStartTopic(t, kind);
        }
      });
    });
  }

  window.CNPT = window.CNPT || {};
  window.CNPT.components = window.CNPT.components || {};
  window.CNPT.components.initDailyPlan = initDailyPlan;
  window.CNPT.components.dailyPlan = publicApi;
})();
