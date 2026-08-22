/**
 * headteacher.js
 * 班主任版 - 班级学情全景、学生画像、家校沟通、学业预警、升学推荐
 * 复用共享组件: showLoadError, mascotEffects, masteryRow, multiUserStorage
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
    students: [],
    currentView: 'dashboard',
    warningRules: {
      dropThreshold: 15,
      prereqThreshold: 3,
      daysThreshold: 7
    }
  };

  // ========== DOM缓存 ==========
  let DOM = {};

  function cacheDom() {
    DOM.loading = document.getElementById('cnpt-loading');
    DOM.navBtns = document.querySelectorAll('.cnpt-nav-btn');
    DOM.views = document.querySelectorAll('.cnpt-view');
    DOM.classMasteryRing = document.getElementById('class-mastery-ring');
    DOM.masteryValue = document.querySelector('.cnpt-mastery-value');
    DOM.warningCount = document.getElementById('warning-count');
    DOM.balanceScore = document.getElementById('balance-score');
    DOM.classRank = document.getElementById('class-rank');
    DOM.subjectRadar = document.getElementById('subject-radar');
    DOM.masteryHeatmap = document.getElementById('mastery-heatmap');
    DOM.studentSearch = document.getElementById('student-search');
    DOM.studentFilter = document.getElementById('student-filter');
    DOM.studentSort = document.getElementById('student-sort');
    DOM.studentGrid = document.getElementById('student-grid');
    DOM.warningList = document.getElementById('warning-list');
    DOM.commentStudent = document.getElementById('comment-student');
    DOM.commentPeriod = document.getElementById('comment-period');
    DOM.commentPreview = document.getElementById('comment-preview');
    DOM.btnGenerateComment = document.getElementById('btn-generate-comment');
    DOM.btnCopyComment = document.getElementById('btn-copy-comment');
    DOM.meetingOutline = document.getElementById('meeting-outline');
    DOM.btnGenerateOutline = document.getElementById('btn-generate-outline');
    DOM.reportOutput = document.getElementById('report-output');
    DOM.studentModal = document.getElementById('student-modal');
    DOM.studentModalBody = document.getElementById('student-modal-body');
    DOM.studentModalClose = document.querySelector('.cnpt-modal-close');
  }

  // ========== 初始化 ==========
  async function init() {
    cacheDom();

    try {
      const data = await dataLoader.loadAllData();
      state.fullData = data;
      state.indices = indicesBuilder.buildIndices(data);
      state.storage = Storage.create('headteacher');

      // 加载或初始化学生数据
      loadStudents();

      // 隐藏加载状态
      DOM.loading.classList.add('cnpt-loading-hidden');

      // 初始化各视图
      initNavigation();
      initDashboard();
      initStudentsView();
      initWarningsView();
      initCommunicationView();
      initReportsView();

      // 隐藏所有视图，显示默认视图
      showView('dashboard');

    } catch (err) {
      console.error('初始化失败:', err);
      CNPT.components.showLoadError('数据加载失败，请刷新页面重试', {
        onRetry: () => location.reload()
      });
    }
  }

  // ========== 学生数据管理 ==========
  function loadStudents() {
    const saved = localStorage.getItem('cnpt-headteacher-students');
    if (saved) {
      state.students = JSON.parse(saved);
    } else {
      // 初始化示例学生数据
      state.students = generateSampleStudents();
      saveStudents();
    }
  }

  function saveStudents() {
    localStorage.setItem('cnpt-headteacher-students', JSON.stringify(state.students));
  }

  function generateSampleStudents() {
    const names = ['张明', '李华', '王芳', '赵强', '刘洋', '陈静', '杨帆', '周杰',
      '吴昊', '孙悦', '朱婷', '马超', '胡蝶', '林峰', '何欣', '罗宇'];
    return names.map((name, i) => ({
      id: 'stu_' + (i + 1),
      name,
      mastery: {}, // topicId -> status
      overallMastery: Math.floor(Math.random() * 40) + 50, // 50-90%
      warningLevel: 'none', // none, low, medium, high
      strengths: [],
      weaknesses: []
    }));
  }

  // ========== 导航 ==========
  function initNavigation() {
    DOM.navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        showView(view);
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

  // ========== 班级概览 ==========
  function initDashboard() {
    // 计算班级整体掌握度
    const avgMastery = state.students.reduce((sum, s) => sum + s.overallMastery, 0) / state.students.length;
    updateMasteryRing(avgMastery);

    // 预警学生数
    const warnings = state.students.filter(s => s.warningLevel === 'high' || s.warningLevel === 'medium').length;
    DOM.warningCount.textContent = warnings;

    // 学科均衡度（模拟计算）
    const balance = calculateBalanceScore();
    DOM.balanceScore.textContent = balance;

    // 班级排名
    DOM.classRank.textContent = Math.floor(Math.random() * 3) + 1;

    // 雷达图
    renderSubjectRadar();

    // 热力图
    renderHeatmap();
  }

  function updateMasteryRing(value) {
    const pct = Math.round(value);
    DOM.masteryValue.textContent = pct;
    DOM.classMasteryRing.style.background = `conic-gradient(var(--cnpt-primary) ${pct}%, #eee 0%)`;
  }

  function calculateBalanceScore() {
    // 简化的均衡度计算
    const subjects = ['语文', '数学', '英语', '科学'];
    const scores = subjects.map(() => Math.random() * 30 + 60);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length;
    return Math.max(0, Math.round(100 - Math.sqrt(variance) * 2));
  }

  function renderSubjectRadar() {
    const subjects = ['语文', '数学', '英语', '科学', '道德与法治', '体育'];
    const values = subjects.map(() => Math.floor(Math.random() * 30) + 60);

    const size = 300;
    const cx = size / 2;
    const cy = size / 2;
    const radius = 120;
    const n = subjects.length;

    // 生成多边形点
    const getPoint = (i, r) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    };

    // 网格线
    let gridLines = '';
    for (let level = 1; level <= 5; level++) {
      const points = Array.from({ length: n }, (_, i) => getPoint(i, (radius * level) / 5)).join(' ');
      gridLines += `<polygon points="${points}" fill="none" stroke="#ddd" stroke-width="1"/>`;
    }

    // 轴线
    let axes = '';
    for (let i = 0; i < n; i++) {
      const point = getPoint(i, radius);
      axes += `<line x1="${cx}" y1="${cy}" x2="${point}" stroke="#ddd" stroke-width="1"/>`;
    }

    // 数据区域
    const dataPoints = values.map((v, i) => getPoint(i, (radius * v) / 100)).join(' ');

    // 标签
    let labels = '';
    subjects.forEach((s, i) => {
      const point = getPoint(i, radius + 20);
      const [x, y] = point.split(',');
      labels += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="#666">${s}</text>`;
    });

    DOM.subjectRadar.innerHTML = `
      <svg viewBox="0 0 ${size} ${size}" width="100%" style="max-width:${size}px">
        ${gridLines}
        ${axes}
        <polygon points="${dataPoints}" fill="rgba(230,126,34,0.2)" stroke="var(--cnpt-primary)" stroke-width="2"/>
        ${values.map((v, i) => `<circle cx="${getPoint(i, (radius * v) / 100)}" cy="" r="4" fill="var(--cnpt-primary)"/>`).join('')}
        ${labels}
      </svg>
    `;
  }

  function renderHeatmap() {
    const subjects = ['语文', '数学', '英语', '科学'];
    const topics = state.fullData.topics.slice(0, 15); // 取前15个知识点

    let html = '<thead><tr><th>学生</th>';
    topics.forEach(t => {
      const shortName = t.name.length > 6 ? t.name.slice(0, 6) + '..' : t.name;
      html += `<th title="${utils.escapeHtml(t.name)}">${utils.escapeHtml(shortName)}</th>`;
    });
    html += '</tr></thead><tbody>';

    state.students.slice(0, 12).forEach(stu => {
      html += `<tr><td>${utils.escapeHtml(stu.name)}</td>`;
      topics.forEach(t => {
        const mastery = stu.mastery[t.id];
        let cellClass = 'heat-none';
        if (mastery === 'mastered') cellClass = 'heat-high';
        else if (mastery === 'learning') cellClass = 'heat-medium';
        else if (mastery === 'not-started') cellClass = 'heat-none';

        // 随机生成一些数据用于展示
        const rand = Math.random();
        if (!mastery) {
          if (rand > 0.7) cellClass = 'heat-high';
          else if (rand > 0.4) cellClass = 'heat-medium';
          else if (rand > 0.2) cellClass = 'heat-low';
        }
        html += `<td class="${cellClass}"></td>`;
      });
      html += '</tr>';
    });

    html += '</tbody>';
    DOM.masteryHeatmap.innerHTML = html;
  }

  // ========== 学生管理 ==========
  function initStudentsView() {
    // 填充学科筛选
    const subjects = [...new Set(state.fullData.topics.map(t => t.subject))];
    subjects.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = s;
      DOM.studentFilter.appendChild(opt);
    });

    renderStudentGrid();

    // 搜索事件
    let searchTimer;
    DOM.studentSearch.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(renderStudentGrid, 300);
    });

    DOM.studentFilter.addEventListener('change', renderStudentGrid);
    DOM.studentSort.addEventListener('change', renderStudentGrid);
  }

  function renderStudentGrid() {
    const searchTerm = DOM.studentSearch.value.toLowerCase();
    const sortBy = DOM.studentSort.value;

    let students = [...state.students];

    // 搜索过滤
    if (searchTerm) {
      students = students.filter(s => s.name.toLowerCase().includes(searchTerm));
    }

    // 排序
    if (sortBy === 'name') {
      students.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'mastery') {
      students.sort((a, b) => b.overallMastery - a.overallMastery);
    } else if (sortBy === 'warning') {
      const levelOrder = { high: 0, medium: 1, low: 2, none: 3 };
      students.sort((a, b) => levelOrder[a.warningLevel] - levelOrder[b.warningLevel]);
    }

    DOM.studentGrid.innerHTML = students.map(stu => `
      <div class="cnpt-student-card ${stu.warningLevel}" data-id="${stu.id}">
        <div class="cnpt-student-name">${utils.escapeHtml(stu.name)}</div>
        <div class="cnpt-student-stats">
          <span>掌握度: ${stu.overallMastery}%</span>
          <span>${getWarningLabel(stu.warningLevel)}</span>
        </div>
        <div class="cnpt-student-bar">
          <div class="cnpt-student-bar-fill" style="width:${stu.overallMastery}%"></div>
        </div>
      </div>
    `).join('');

    // 点击查看详情
    DOM.studentGrid.querySelectorAll('.cnpt-student-card').forEach(card => {
      card.addEventListener('click', () => {
        const stu = state.students.find(s => s.id === card.dataset.id);
        if (stu) showStudentDetail(stu);
      });
    });
  }

  function getWarningLabel(level) {
    const labels = { high: '⚠️ 高危', medium: '⚡ 关注', low: '📋 提醒', none: '✅ 正常' };
    return labels[level] || '✅ 正常';
  }

  function showStudentDetail(stu) {
    // 生成学生画像
    const subjectMastery = {};
    Object.values(CNPT.SUBJECT_COLORS || {}).forEach(() => {});

    // 按学科统计
    const subjects = [...new Set(state.fullData.topics.map(t => t.subject))];
    subjects.forEach(sub => {
      const subTopics = state.fullData.topics.filter(t => t.subject === sub);
      const mastered = subTopics.filter(t => stu.mastery[t.id] === 'mastered').length;
      subjectMastery[sub] = Math.round((mastered / subTopics.length) * 100) || Math.floor(Math.random() * 40) + 40;
    });

    DOM.studentModalBody.innerHTML = `
      <h2>${utils.escapeHtml(stu.name)} 的学习画像</h2>
      <div style="margin:16px 0">
        <p><strong>综合掌握度：</strong>${stu.overallMastery}%</p>
        <p><strong>预警等级：</strong>${getWarningLabel(stu.warningLevel)}</p>
      </div>
      <h3>各学科掌握度</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin:12px 0">
        ${Object.entries(subjectMastery).slice(0, 6).map(([sub, val]) => `
          <div style="background:#f8f8f8;padding:12px;border-radius:8px;text-align:center">
            <div style="font-size:24px;font-weight:bold;color:var(--cnpt-primary)">${val}%</div>
            <div style="font-size:13px;color:#666">${sub}</div>
          </div>
        `).join('')}
      </div>
      <h3>建议行动</h3>
      <ul style="padding-left:20px;line-height:2">
        <li>关注薄弱学科，建议每天额外练习15分钟</li>
        <li>与家长沟通，建议家庭辅导重点</li>
        <li>安排学科助教进行一对一辅导</li>
      </ul>
    `;

    DOM.studentModal.classList.remove('cnpt-hidden');

    // 关闭事件
    DOM.studentModalClose.onclick = () => DOM.studentModal.classList.add('cnpt-hidden');
    DOM.studentModal.onclick = (e) => {
      if (e.target === DOM.studentModal) DOM.studentModal.classList.add('cnpt-hidden');
    };
  }

  // ========== 学业预警 ==========
  function initWarningsView() {
    renderWarnings();

    // 阈值变化
    ['threshold-drop', 'threshold-prereq', 'threshold-days'].forEach(id => {
      document.getElementById(id).addEventListener('change', renderWarnings);
    });
  }

  function renderWarnings() {
    const dropThreshold = parseInt(document.getElementById('threshold-drop').value) || 15;
    const prereqThreshold = parseInt(document.getElementById('threshold-prereq').value) || 3;

    // 生成预警数据
    const warnings = [];

    state.students.forEach(stu => {
      // 模拟预警检测
      if (stu.warningLevel === 'high') {
        warnings.push({
          student: stu,
          level: 'high',
          icon: '🚨',
          detail: `掌握度骤降${dropThreshold + Math.floor(Math.random() * 10)}%，建议立即干预`
        });
      } else if (stu.warningLevel === 'medium') {
        warnings.push({
          student: stu,
          level: 'medium',
          icon: '⚡',
          detail: `前置知识缺失${prereqThreshold + 1}个，影响后续学习`
        });
      } else if (Math.random() > 0.7) {
        warnings.push({
          student: stu,
          level: 'low',
          icon: '📋',
          detail: '连续多日未更新学习状态，建议关注'
        });
      }
    });

    if (warnings.length === 0) {
      DOM.warningList.innerHTML = '<div class="cnpt-card" style="text-align:center;padding:40px;color:#999">✅ 暂无预警学生</div>';
      return;
    }

    DOM.warningList.innerHTML = warnings.map(w => `
      <div class="cnpt-warning-item ${w.level}">
        <div class="cnpt-warning-icon">${w.icon}</div>
        <div class="cnpt-warning-info">
          <div class="cnpt-warning-student">${utils.escapeHtml(w.student.name)}</div>
          <div class="cnpt-warning-detail">${w.detail}</div>
        </div>
        <button class="cnpt-btn" data-id="${w.student.id}">处理</button>
      </div>
    `).join('');
  }

  // ========== 家校沟通 ==========
  function initCommunicationView() {
    // 填充学生选择
    DOM.commentStudent.innerHTML = state.students.map(s =>
      `<option value="${s.id}">${utils.escapeHtml(s.name)}</option>`
    ).join('');

    DOM.btnGenerateComment.addEventListener('click', generateComment);
    DOM.btnCopyComment.addEventListener('click', copyComment);
    DOM.btnGenerateOutline.addEventListener('click', generateMeetingOutline);
  }

  function generateComment() {
    const stuId = DOM.commentStudent.value;
    const period = DOM.commentPeriod.value;
    const stu = state.students.find(s => s.id === stuId);
    if (!stu) return;

    const periodText = { weekly: '本周', monthly: '本月', semester: '本学期' }[period];

    const templates = [
      `${stu.name}同学${periodText}学习态度认真，整体掌握度${stu.overallMastery}%。在已学习的知识点中表现良好，建议在家继续保持每日练习的习惯。期待下一次的进步！`,
      `${periodText}，${stu.name}同学在课堂上积极参与，对知识点的理解较为扎实。掌握度达到${stu.overallMastery}%，建议家长在家适当引导拓展练习，巩固薄弱环节。`,
      `${stu.name}同学${periodText}表现稳定，整体掌握度${stu.overallMastery}%。该生学习主动性较强，建议家长鼓励保持，同时关注薄弱学科的均衡发展。`
    ];

    const comment = templates[Math.floor(Math.random() * templates.length)];
    DOM.commentPreview.textContent = comment;
  }

  function copyComment() {
    const text = DOM.commentPreview.textContent;
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      CNPT.utils.showToast('评语已复制到剪贴板');
    }).catch(() => {
      CNPT.utils.showToast('复制失败，请手动复制');
    });
  }

  function generateMeetingOutline() {
    const avgMastery = Math.round(state.students.reduce((sum, s) => sum + s.overallMastery, 0) / state.students.length);
    const topStudents = [...state.students].sort((a, b) => b.overallMastery - a.overallMastery).slice(0, 3);
    const warningStudents = state.students.filter(s => s.warningLevel === 'high' || s.warningLevel === 'medium');

    DOM.meetingOutline.innerHTML = `
      <h4>📋 家长会发言提纲</h4>
      <ol style="padding-left:20px;line-height:2.2">
        <li><strong>班级整体情况</strong>
          <ul>
            <li>班级平均掌握度：${avgMastery}%</li>
            <li>整体学习状态良好，大部分学生能跟上进度</li>
          </ul>
        </li>
        <li><strong>表扬与激励</strong>
          <ul>
            <li>表现突出的同学：${topStudents.map(s => s.name).join('、')}</li>
            <li>进步明显的同学（请家长给予鼓励）</li>
          </ul>
        </li>
        <li><strong>需要关注的问题</strong>
          <ul>
            <li>目前${warningStudents.length}位同学需要重点关注</li>
            <li>建议家长配合监督每日学习任务</li>
          </ul>
        </li>
        <li><strong>后续计划</strong>
          <ul>
            <li>下阶段重点知识点预告</li>
            <li>家庭辅导建议</li>
            <li>家校配合事项</li>
          </ul>
        </li>
      </ol>
    `;
  }

  // ========== 报告中心 ==========
  function initReportsView() {
    document.querySelectorAll('.cnpt-report-card').forEach(card => {
      card.addEventListener('click', () => {
        const type = card.dataset.report;
        generateReport(type);
      });
    });
  }

  function generateReport(type) {
    const avgMastery = Math.round(state.students.reduce((sum, s) => sum + s.overallMastery, 0) / state.students.length);

    let content = '';
    switch (type) {
      case 'class-summary':
        content = generateClassSummary(avgMastery);
        break;
      case 'student-growth':
        content = generateStudentGrowth();
        break;
      case 'teaching-suggestion':
        content = generateTeachingSuggestion(avgMastery);
        break;
      case 'entrance-recommend':
        content = generateEntranceRecommend();
        break;
    }

    DOM.reportOutput.innerHTML = content;
    DOM.reportOutput.classList.remove('cnpt-hidden');
  }

  function generateClassSummary(avgMastery) {
    return `
      <h3>📊 班级学情总结报告</h3>
      <hr/>
      <p><strong>班级人数：</strong>${state.students.length}人</p>
      <p><strong>平均掌握度：</strong>${avgMastery}%</p>
      <p><strong>预警学生数：</strong>${state.students.filter(s => s.warningLevel === 'high').length}人</p>
      <h4>学科均衡情况</h4>
      <p>各学科掌握度分布均匀，无明显偏科现象。</p>
      <h4>主要发现</h4>
      <ul style="padding-left:20px;line-height:2">
        <li>班级整体学习氛围良好</li>
        <li>大部分学生能按时完成学习任务</li>
        <li>需要关注少数学生的学习状态波动</li>
      </ul>
    `;
  }

  function generateStudentGrowth() {
    const rows = state.students.slice(0, 8).map(s => `
      <tr>
        <td>${utils.escapeHtml(s.name)}</td>
        <td>${s.overallMastery}%</td>
        <td>${s.warningLevel === 'none' ? '稳定' : '需关注'}</td>
        <td>继续保持</td>
      </tr>
    `).join('');

    return `
      <h3>📈 学生成长档案</h3>
      <hr/>
      <table style="width:100%;border-collapse:collapse;margin-top:12px">
        <thead>
          <tr style="background:#f8f8f8">
            <th style="padding:8px;border:1px solid #ddd">姓名</th>
            <th style="padding:8px;border:1px solid #ddd">掌握度</th>
            <th style="padding:8px;border:1px solid #ddd">状态</th>
            <th style="padding:8px;border:1px solid #ddd">建议</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function generateTeachingSuggestion(avgMastery) {
    return `
      <h3>💡 教学改进建议</h3>
      <hr/>
      <h4>基于数据分析的建议</h4>
      <ol style="padding-left:20px;line-height:2.2">
        <li><strong>分层教学</strong>：班级掌握度差异较大，建议实施分层教学，为不同水平学生设计不同难度的练习。</li>
        <li><strong>重点突破</strong>：针对班级普遍薄弱的知识点，安排专项复习课。</li>
        <li><strong>同伴互助</strong>：建立学习小组，让掌握度高的学生帮助薄弱学生。</li>
        <li><strong>家校协同</strong>：定期向家长发送学习报告，争取家庭辅导的配合。</li>
      </ol>
    `;
  }

  function generateEntranceRecommend() {
    const topStudents = [...state.students].sort((a, b) => b.overallMastery - a.overallMastery).slice(0, 5);
    return `
      <h3>🎓 升学推荐建议</h3>
      <hr/>
      <h4>推荐关注学生（学业优秀）</h4>
      <ul style="padding-left:20px;line-height:2">
        ${topStudents.map(s => `<li>${utils.escapeHtml(s.name)} - 综合掌握度${s.overallMastery}%，建议关注优质初中</li>`).join('')}
      </ul>
      <h4>建议措施</h4>
      <ul style="padding-left:20px;line-height:2">
        <li>与家长沟通升学规划</li>
        <li>提供目标学校信息</li>
        <li>制定冲刺计划</li>
      </ul>
    `;
  }

  // ========== 启动 ==========
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
