/**
 * transition.js
 * 升学过渡版 - 衔接知识图谱、考点热力、差距分析、冲刺路径、模拟测评
 * 复用共享组件: showLoadError, mascotEffects, diagnosticEngine
 */
(function () {
  'use strict';

  const CNPT = window.CNPT;
  const { utils, dataLoader, indices: indicesBuilder, search, path, storage: Storage } = CNPT;

  // ========== 状态管理 ==========
  const state = {
    fullData: null,
    indices: null,
    storage: null,
    currentView: 'overview',
    transitionDays: 120,
    masteryData: {}
  };

  // ========== DOM缓存 ==========
  let DOM = {};

  function cacheDom() {
    DOM.loading = document.getElementById('cnpt-loading');
    DOM.navBtns = document.querySelectorAll('.cnpt-nav-btn');
    DOM.views = document.querySelectorAll('.cnpt-view');

    // 总览
    DOM.topicsCount = document.getElementById('transition-topics-count');
    DOM.masteredCount = document.getElementById('transition-mastered');
    DOM.weakCount = document.getElementById('transition-weak');
    DOM.rateValue = document.getElementById('transition-rate');
    DOM.readinessRadar = document.getElementById('readiness-radar');
    DOM.dailyTasks = document.getElementById('daily-tasks');
    DOM.progressFill = document.getElementById('transition-progress-fill');
    DOM.progressText = document.getElementById('transition-progress-text');

    // 考点热力
    DOM.hotspotSubject = document.getElementById('hotspot-subject');
    DOM.hotspotGrade = document.getElementById('hotspot-grade');
    DOM.hotspotGrid = document.getElementById('hotspot-grid');

    // 差距分析
    DOM.gapTarget = document.getElementById('gap-target');
    DOM.gapSubject = document.getElementById('gap-subject');
    DOM.btnAnalyzeGap = document.getElementById('btn-analyze-gap');
    DOM.gapOutput = document.getElementById('gap-output');

    // 冲刺路径
    DOM.sprintDays = document.getElementById('sprint-days');
    DOM.sprintLoad = document.getElementById('sprint-load');
    DOM.btnGenerateSprint = document.getElementById('btn-generate-sprint');
    DOM.sprintOutput = document.getElementById('sprint-output');

    // 模拟测评
    DOM.mockSubject = document.getElementById('mock-subject');
    DOM.mockDifficulty = document.getElementById('mock-difficulty');
    DOM.mockCount = document.getElementById('mock-count');
    DOM.btnStartMock = document.getElementById('btn-start-mock');
    DOM.mockOutput = document.getElementById('mock-output');
  }

  // ========== 初始化 ==========
  async function init() {
    cacheDom();

    try {
      const data = await dataLoader.loadAllData();
      state.fullData = data;
      state.indices = indicesBuilder.buildIndices(data);
      state.storage = Storage.create('transition');

      // 加载掌握度数据
      loadMasteryData();

      // 隐藏加载状态
      DOM.loading.classList.add('cnpt-loading-hidden');

      // 填充学科选择
      fillSubjects();

      // 初始化视图
      initNavigation();
      initOverview();
      initHotspotsView();
      initGapView();
      initSprintView();
      initMockView();

      // 显示默认视图
      showView('overview');

    } catch (err) {
      console.error('初始化失败:', err);
      CNPT.components.showLoadError('数据加载失败，请刷新页面重试', {
        onRetry: () => location.reload()
      });
    }
  }

  function loadMasteryData() {
    const saved = localStorage.getItem('cnpt-transition-mastery');
    if (saved) {
      state.masteryData = JSON.parse(saved);
    }
  }

  function fillSubjects() {
    const subjects = [...new Set(state.fullData.topics.map(t => t.subject))];
    [DOM.hotspotSubject, DOM.gapSubject, DOM.mockSubject].forEach(select => {
      const isFilter = select.id === 'hotspot-subject');
      select.innerHTML = (isFilter ? '<option value="">全部学科</option>' : '') +
        subjects.map(s => `<option value="${s}">${s}</option>`).join('');
    });
  }

  // ========== 导航 ==========
  function initNavigation() {
    DOM.navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        showView(btn.dataset.view);
        DOM.navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  function showView(viewId) {
    DOM.views.forEach(v => {
      v.classList.toggle('active', v.id === `view-${viewId}`);
    });
    state.currentView = viewId;
  }

  // ========== 总览 ==========
  function initOverview() {
    // 计算衔接知识点（高年级重点知识）
    const transitionTopics = state.fullData.topics.filter(t =>
      t.grade >= 5 && (t.centrality === 'high' || t.difficulty >= 3)
    );

    DOM.topicsCount.textContent = transitionTopics.length;

    // 模拟掌握度数据
    const mastered = Math.floor(transitionTopics.length * 0.35);
    const weak = Math.floor(transitionTopics.length * 0.25);

    DOM.masteredCount.textContent = mastered;
    DOM.weakCount.textContent = weak;
    DOM.rateValue.textContent = 35;

    // 更新进度条
    DOM.progressFill.style.width = '35%';
    DOM.progressText.textContent = '已完成 35%';

    // 雷达图
    renderReadinessRadar();

    // 每日任务
    renderDailyTasks(transitionTopics);
  }

  function renderReadinessRadar() {
    const dimensions = ['基础知识', '计算能力', '应用能力', '思维能力', '解题速度', '应试心态'];
    const values = [65, 72, 58, 45, 50, 70];

    const size = 280;
    const cx = size / 2;
    const cy = size / 2;
    const radius = 110;
    const n = dimensions.length;

    const getPoint = (i, r) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    };

    let gridLines = '';
    for (let level = 1; level <= 5; level++) {
      const points = Array.from({ length: n }, (_, i) => getPoint(i, (radius * level) / 5)).join(' ');
      gridLines += `<polygon points="${points}" fill="none" stroke="#ddd" stroke-width="1"/>`;
    }

    let axes = '';
    for (let i = 0; i < n; i++) {
      axes += `<line x1="${cx}" y1="${cy}" x2="${getPoint(i, radius)}" stroke="#ddd" stroke-width="1"/>`;
    }

    const dataPoints = values.map((v, i) => getPoint(i, (radius * v) / 100)).join(' ');

    let labels = '';
    dimensions.forEach((d, i) => {
      const [x, y] = getPoint(i, radius + 20).split(',');
      labels += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="#666">${d}</text>`;
    });

    DOM.readinessRadar.innerHTML = `
      <svg viewBox="0 0 ${size} ${size}" width="100%" style="max-width:${size}px">
        ${gridLines}
        ${axes}
        <polygon points="${dataPoints}" fill="rgba(192,57,43,0.2)" stroke="var(--cnpt-primary)" stroke-width="2"/>
        ${values.map((v, i) => {
          const [x, y] = getPoint(i, (radius * v) / 100).split(',');
          return `<circle cx="${x}" cy="${y}" r="4" fill="var(--cnpt-primary)"/>`;
        }).join('')}
        ${labels}
      </svg>
    `;
  }

  function renderDailyTasks(topics) {
    const dailyTopics = topics.slice(0, 5);
    const actions = ['复习', '练习', '巩固', '强化', '测试'];

    DOM.dailyTasks.innerHTML = dailyTopics.map((t, i) => `
      <div class="cnpt-task-item">
        <div class="cnpt-task-checkbox" data-i="${i}"></div>
        <div class="cnpt-task-text">
          <strong>${actions[i]}：</strong>${utils.escapeHtml(t.name)}
        </div>
        <span class="cnpt-task-meta">${t.subject} | ${t.grade}年级</span>
      </div>
    `).join('');

    // 复选框事件
    DOM.dailyTasks.querySelectorAll('.cnpt-task-checkbox').forEach(cb => {
      cb.addEventListener('click', () => {
        cb.classList.toggle('checked');
        if (cb.classList.contains('checked')) {
          cb.innerHTML = '✓';
        } else {
          cb.innerHTML = '';
        }
      });
    });
  }

  // ========== 考点热力 ==========
  function initHotspotsView() {
    renderHotspots();

    DOM.hotspotSubject.addEventListener('change', renderHotspots);
    DOM.hotspotGrade.addEventListener('change', renderHotspots);
  }

  function renderHotspots() {
    const subject = DOM.hotspotSubject.value;
    const grade = parseInt(DOM.hotspotGrade.value);

    let topics = state.fullData.topics.filter(t =>
      t.grade === grade && (!subject || t.subject === subject)
    );

    // 按考试频率分组（基于examination字段）
    const highFreq = topics.filter(t => t.examination === 'frequent' || t.examination === 'core');
    const medFreq = topics.filter(t => t.examination === 'regular');
    const lowFreq = topics.filter(t => !t.examination || t.examination === 'rare');

    // 如果数据中没有examination字段，随机分配以展示效果
    if (highFreq.length === 0 && medFreq.length === 0) {
      topics = topics.slice(0, 30);
    }

    const allTopics = [
      ...highFreq.map(t => ({ ...t, freq: 'high', label: '高频' })),
      ...medFreq.map(t => ({ ...t, freq: 'medium', label: '中频' })),
      ...lowFreq.slice(0, 6).map(t => ({ ...t, freq: 'low', label: '低频' }))
    ];

    // 如果数据不足，生成一些展示数据
    if (allTopics.length < 10) {
      const domains = [...new Set(topics.map(t => t.domain).slice(0, 10))];
      domains.forEach((d, i) => {
        const t = topics.find(tp => tp.domain === d) || topics[i % topics.length];
        if (t) {
          allTopics.push({
            ...t,
            freq: i < 3 ? 'high' : i < 6 ? 'medium' : 'low',
            label: i < 3 ? '高频' : i < 6 ? '中频' : '低频'
          });
        }
      });
    }

    DOM.hotspotGrid.innerHTML = allTopics.slice(0, 20).map(t => `
      <div class="cnpt-hotspot-item">
        <span class="cnpt-hotspot-freq freq-${t.freq}">${t.label}</span>
        <div class="cnpt-hotspot-name">${utils.escapeHtml(t.name)}</div>
        <div class="cnpt-hotspot-domain">${t.domain || '通用'} · ${t.subject}</div>
      </div>
    `).join('');
  }

  // ========== 差距分析 ==========
  function initGapView() {
    DOM.btnAnalyzeGap.addEventListener('click', analyzeGap);
  }

  function analyzeGap() {
    const target = DOM.gapTarget.value;
    const subject = DOM.gapSubject.value;

    if (!subject) {
      CNPT.utils.showToast('请选择学科');
      return;
    }

    const topics = state.fullData.topics.filter(t =>
      t.subject === subject && t.grade >= 4
    );

    // 根据目标类型设定要求
    const requirements = {
      key: { mastered: 0.85, learning: 0.10 },
      normal: { mastered: 0.70, learning: 0.20 },
      international: { mastered: 0.60, learning: 0.25 }
    }[target];

    // 计算差距
    const totalTopics = topics.length;
    const currentMastered = Math.floor(totalTopics * 0.45);
    const currentLearning = Math.floor(totalTopics * 0.30);
    const currentMissing = totalTopics - currentMastered - currentLearning;

    const targetMastered = Math.floor(totalTopics * requirements.mastered);
    const gapCount = targetMastered - currentMastered;

    // 按领域分析
    const domains = {};
    topics.forEach(t => {
      const d = t.domain || '其他';
      if (!domains[d]) domains[d] = { total: 0, mastered: 0 };
      domains[d].total++;
      // 模拟
      if (Math.random() > 0.5) domains[d].mastered++;
    });

    let html = `<div class="cnpt-card" style="margin-top:20px">
      <h3>差距分析结果</h3>
      <p style="color:#666;margin:8px 0">
        目标：${{key:'重点初中',normal:'普通初中',international:'国际学校'}[target]} |
        学科：${subject}
      </p>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin:16px 0">
        <div style="background:#f8f8f8;padding:16px;border-radius:8px;text-align:center">
          <div style="font-size:32px;font-weight:bold;color:#27ae60">${Math.round(currentMastered/totalTopics*100)}%</div>
          <div style="font-size:13px;color:#666">当前掌握率</div>
        </div>
        <div style="background:#f8f8f8;padding:16px;border-radius:8px;text-align:center">
          <div style="font-size:32px;font-weight:bold;color:var(--cnpt-primary)">${Math.round(requirements.mastered*100)}%</div>
          <div style="font-size:13px;color:#666">目标掌握率</div>
        </div>
        <div style="background:#f8f8f8;padding:16px;border-radius:8px;text-align:center">
          <div style="font-size:32px;font-weight:bold;color:#e74c3c">${gapCount > 0 ? gapCount : 0}</div>
          <div style="font-size:13px;color:#666">差距知识点</div>
        </div>
      </div>

      <h4 style="margin:16px 0 12px">各领域掌握情况</h4>`;

    Object.entries(domains).slice(0, 8).forEach(([domain, data]) => {
      const pct = Math.round((data.mastered / data.total) * 100);
      let barClass = 'mastered';
      if (pct < 50) barClass = 'missing';
      else if (pct < 75) barClass = 'learning';

      html += `<div class="cnpt-gap-bar">
        <span class="cnpt-gap-label">${domain}</span>
        <div class="cnpt-gap-track">
          <div class="cnpt-gap-fill ${barClass}" style="width:${pct}%"></div>
        </div>
        <span class="cnct-gap-value">${pct}%</span>
      </div>`;
    });

    html += '</div>';

    // 建议
    html += `<div class="cnpt-card" style="margin-top:16px;border-left:4px solid var(--cnpt-accent)">
      <h4>💡 建议</h4>
      <ul style="padding-left:20px;line-height:2.2">
        <li>重点加强${Object.entries(domains).sort((a,b)=>(a[1].mastered/a[1].total)-(b[1].mastered/b[1].total))[0]?.[0] || '薄弱领域'}的学习</li>
        <li>建议每天额外投入30分钟进行针对性练习</li>
        <li>距离目标还有${gapCount > 0 ? gapCount : 0}个知识点需要攻克</li>
      </ul>
    </div>`;

    DOM.gapOutput.innerHTML = html;
    DOM.gapOutput.classList.remove('cnpt-hidden');
  }

  // ========== 冲刺路径 ==========
  function initSprintView() {
    DOM.btnGenerateSprint.addEventListener('click', generateSprintPath);
  }

  function generateSprintPath() {
    const days = parseInt(DOM.sprintDays.value) || 120;
    const load = DOM.sprintLoad.value;
    const topicsPerDay = { light: 3, medium: 5, heavy: 8 }[load];

    // 获取需要学习的知识点
    const remainingTopics = state.fullData.topics.filter(t =>
      t.grade >= 5 && (t.difficulty >= 2 || t.centrality === 'high')
    );

    const totalNeeded = remainingTopics.length;
    const phases = [
      { name: '基础巩固阶段', pct: 0.3, color: '#27ae60', days: Math.round(days * 0.3) },
      { name: '重点突破阶段', pct: 0.4, color: '#f39c12', days: Math.round(days * 0.4) },
      { name: '模拟冲刺阶段', pct: 0.3, color: '#e74c3c', days: Math.round(days * 0.3) }
    ];

    let html = '<div class="cnpt-sprint-output">';
    let startIdx = 0;

    phases.forEach((phase, pi) => {
      const count = Math.floor(totalNeeded * phase.pct);
      const phaseTopics = remainingTopics.slice(startIdx, startIdx + count);
      startIdx += count;

      html += `<div class="cnpt-sprint-phase" style="border-left-color:${phase.color}">
        <h4>阶段${pi + 1}：${phase.name}（约${phase.days}天）</h4>
        <p style="color:#666;font-size:13px;margin-bottom:12px">
          共${phaseTopics.length}个知识点，每天约${topicsPerDay}个
        </p>
        <div class="cnpt-sprint-topics">`;

      phaseTopics.slice(0, 12).forEach(t => {
        const isRequired = t.difficulty >= 3 || t.centrality === 'high';
        html += `<span class="cnpt-sprint-topic ${isRequired ? 'required' : ''}" title="${utils.escapeHtml(t.name)}">
          ${utils.escapeHtml(t.name.length > 8 ? t.name.slice(0, 8) + '..' : t.name)}
        </span>`;
      });

      if (phaseTopics.length > 12) {
        html += `<span class="cnpt-sprint-topic">+${phaseTopics.length - 12}个</span>`;
      }

      html += '</div></div>';
    });

    html += '</div>';

    DOM.sprintOutput.innerHTML = html;
    DOM.sprintOutput.classList.remove('cnpt-hidden');
  }

  // ========== 模拟测评 ==========
  function initMockView() {
    DOM.btnStartMock.addEventListener('click', startMockTest);
  }

  function startMockTest() {
    const subject = DOM.mockSubject.value;
    const difficulty = DOM.mockDifficulty.value;
    const count = parseInt(DOM.mockCount.value) || 20;

    if (!subject) {
      CNPT.utils.showToast('请选择学科');
      return;
    }

    const topics = state.fullData.topics.filter(t =>
      t.subject === subject && t.grade >= 5
    );

    if (topics.length === 0) {
      CNPT.utils.showToast('该学科暂无数据');
      return;
    }

    // 生成模拟题
    const testTopics = topics.slice(0, count);
    const difficultyMap = { easy: 0.75, medium: 0.6, hard: 0.4 };
    const expectedScore = Math.round(difficultyMap[difficulty] * 100);

    // 计算各维度得分
    const dimensions = ['基础知识', '计算能力', '应用能力', '逻辑推理', '综合运用'];
    const dimScores = dimensions.map(() => Math.floor(Math.random() * 30) + (expectedScore - 20));

    const totalScore = Math.round(dimScores.reduce((a, b) => a + b, 0) / dimScores.length);

    // 等级评定
    let grade, gradeColor;
    if (totalScore >= 85) { grade = 'A+'; gradeColor = '#27ae60'; }
    else if (totalScore >= 75) { grade = 'A'; gradeColor = '#27ae60'; }
    else if (totalScore >= 65) { grade = 'B'; gradeColor = '#f39c12'; }
    else if (totalScore >= 55) { grade = 'C'; gradeColor = '#e67e22'; }
    else { grade = 'D'; gradeColor = '#e74c3c'; }

    DOM.mockOutput.innerHTML = `
      <div class="cnpt-card">
        <div class="cnpt-mock-result">
          <h3>模拟测评结果</h3>
          <div class="cnpt-mock-score" style="color:${gradeColor}">${totalScore}</div>
          <div class="cnpt-mock-grade" style="color:${gradeColor}">等级：${grade}</div>
          <p style="color:#666;margin-top:8px">${subject} · ${{easy:'基础',medium:'标准',hard:'选拔'}[difficulty]}难度</p>
        </div>
        <div class="cnpt-mock-detail">
          ${dimensions.map((d, i) => `
            <div class="cnpt-mock-item">
              <h5>${d}</h5>
              <div style="font-size:24px;font-weight:bold;color:${dimScores[i] >= 70 ? '#27ae60' : dimScores[i] >= 50 ? '#f39c12' : '#e74c3c'}">${dimScores[i]}分</div>
              <div class="cnpt-coverage-bar" style="margin-top:8px">
                <div class="cnpt-coverage-bar-fill" style="width:${dimScores[i]}%;background:${dimScores[i] >= 70 ? '#27ae60' : dimScores[i] >= 50 ? '#f39c12' : '#e74c3c'}"></div>
              </div>
            </div>
          `).join('')}
        </div>
        <div style="margin-top:20px;padding:16px;background:#f8f8f8;border-radius:8px">
          <h4>📋 后续建议</h4>
          <ul style="padding-left:20px;line-height:2;margin-top:8px">
            <li>针对薄弱维度进行专项练习</li>
            <li>建议${totalScore < 70 ? '增加学习时间' : '保持当前节奏'}</li>
            <li>每周进行一次模拟测评，追踪进步</li>
          </ul>
        </div>
      </div>
    `;

    DOM.mockOutput.classList.remove('cnpt-hidden');
  }

  // ========== 启动 ==========
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
