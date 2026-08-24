/*!
 * CN-Primary-Taxonomy · 培训机构版主应用
 * 角色：training - 学员管理+入学诊断+学习报告
 * 特征：多学生管理、数据驱动决策、家校沟通
 */
(function() {
  'use strict';

  const state = {
    role: 'training',
    fullData: null,
    storage: null,       // MultiUserStorage
    indices: null,
    diagnosticEngine: null,
    reportGenerator: null,
    currentStudentId: null,
    currentView: 'dashboard'
  };

  const DOM = {};

  function cacheDom() {
    DOM.topInfo = document.getElementById('top-info');
    DOM.statTotalStudents = document.getElementById('stat-total-students');
    DOM.statTotalMastered = document.getElementById('stat-total-mastered');
    DOM.statAvgMastery = document.getElementById('stat-avg-mastery');
    DOM.statTotalStars = document.getElementById('stat-total-stars');
    DOM.studentRankingBody = document.getElementById('student-ranking-body');
    DOM.studentList = document.getElementById('student-list');
    DOM.diagnoseStudent = document.getElementById('diagnose-student');
    DOM.diagnoseSubject = document.getElementById('diagnose-subject');
    DOM.diagnoseGrade = document.getElementById('diagnose-grade');
    DOM.diagnoseResult = document.getElementById('diagnose-result');
    DOM.reportStudent = document.getElementById('report-student');
    DOM.reportPreview = document.getElementById('report-preview');
    DOM.newStudentName = document.getElementById('new-student-name');
    DOM.newStudentGrade = document.getElementById('new-student-grade');
    DOM.newStudentSubject = document.getElementById('new-student-subject');
    DOM.studentDetailBody = document.getElementById('student-detail-body');
  }

  // ========== 初始化 ==========
  async function init() {
    cacheDom();

    // 使用多用户存储引擎
    state.storage = new CNPT.MultiUserStorage('training');

    try {
      state.fullData = await CNPT.dataLoader.loadAllData();
    } catch (err) {
      console.error('数据加载失败:', err);
      CNPT.components.showLoadError('数据加载失败，请检查网络连接后重试');
      return;
    }

    state.indices = CNPT.indices.buildIndices(state.fullData);
    state.diagnosticEngine = new CNPT.DiagnosticEngine(state.fullData, state.indices);
    state.reportGenerator = new CNPT.ReportGenerator(state.fullData, state.indices);

    // 更新顶部信息
    DOM.topInfo.textContent = `${state.fullData.topics.topicCount}知识点 · ${state.fullData.deps.edgeCount}依赖 · ${state.storage.getStudents().length}名学员`;

    initNavigation();
    initDashboard();
    initStudentManagement();
    initDiagnose();
    initReports();
    initSettings();
    initModals();
    initSubjectOptions();

    // 隐藏加载指示器
    CNPT.utils.hideLoadingScreen();

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
  }

  // ========== 导航 ==========
  function initNavigation() {
    document.querySelectorAll('.cnpt-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        switchView(view);
      });
    });
  }

  function switchView(viewName) {
    state.currentView = viewName;

    // 更新导航状态
    document.querySelectorAll('.cnpt-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // 切换视图
    document.querySelectorAll('.cnpt-view').forEach(view => {
      view.classList.toggle('active', view.id === `view-${viewName}`);
    });

    // 刷新视图数据
    if (viewName === 'dashboard') updateDashboard();
    if (viewName === 'students') renderStudentList();
    if (viewName === 'reports') updateReportStudentSelect();
  }

  // ========== 概览仪表盘 ==========
  function initDashboard() {
    updateDashboard();
  }

  function updateDashboard() {
    const students = state.storage.getStudents();
    const comparison = state.storage.getClassComparison();

    // 更新统计卡片
    DOM.statTotalStudents.textContent = students.length;

    let totalMastered = 0;
    let totalStars = 0;
    let totalTopics = state.fullData.topics.topics.length;
    let masterySum = 0;

    comparison.forEach(s => {
      totalMastered += s.mastered || 0;
      totalStars += s.stars || 0;
      masterySum += s.total > 0 ? (s.mastered / s.total) * 100 : 0;
    });

    DOM.statTotalMastered.textContent = totalMastered;
    DOM.statAvgMastery.textContent = students.length > 0
      ? Math.round(masterySum / students.length) + '%'
      : '0%';
    DOM.statTotalStars.textContent = totalStars;

    // 更新排行表格
    if (comparison.length === 0) {
      DOM.studentRankingBody.innerHTML = '<tr><td colspan="8" class="cnpt-empty-state">暂无学员数据，请先在"学员"页面添加学员</td></tr>';
      return;
    }

    // 按掌握率排序
    const ranked = comparison
      .map(s => ({
        ...s,
        masteryRate: s.total > 0 ? Math.round((s.mastered / s.total) * 100) : 0
      }))
      .sort((a, b) => b.masteryRate - a.masteryRate);

    DOM.studentRankingBody.innerHTML = ranked.map((s, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${CNPT.utils.escapeHtml(s.name)}</strong></td>
        <td>${s.grade ? s.grade + '年级' : '-'}</td>
        <td>${s.mastered || 0}</td>
        <td>${s.learning || 0}</td>
        <td>
          <div style="display:flex;align-items:center;gap:6px">
            <div style="flex:1;background:#e9ecef;border-radius:4px;height:6px;overflow:hidden">
              <div style="background:#667eea;height:100%;width:${s.masteryRate}%"></div>
            </div>
            <span style="font-size:12px;color:#666">${s.masteryRate}%</span>
          </div>
        </td>
        <td>${s.stars || 0}</td>
        <td>${s.days || 0}</td>
      </tr>
    `).join('');
  }

  // ========== 学员管理 ==========
  function initStudentManagement() {
    document.getElementById('btn-add-student').addEventListener('click', () => {
      document.getElementById('modal-add-student').classList.add('show');
    });

    document.getElementById('btn-export-data').addEventListener('click', exportAllData);

    document.getElementById('btn-confirm-add').addEventListener('click', () => {
      const name = DOM.newStudentName.value.trim();
      const grade = parseInt(DOM.newStudentGrade.value) || null;
      const subject = DOM.newStudentSubject.value || '';

      if (!name) {
        CNPT.utils.showToast('请输入学员姓名');
        return;
      }

      state.storage.addStudent({ name, grade, subject });
      document.getElementById('modal-add-student').classList.remove('show');
      DOM.newStudentName.value = '';
      DOM.newStudentGrade.value = '';
      DOM.newStudentSubject.value = '';

      renderStudentList();
      updateDashboard();
      CNPT.components.showMascotTip(`🎉 成功添加学员"${name}"`);
    });

    renderStudentList();
  }

  function renderStudentList() {
    const students = state.storage.getStudents();

    if (students.length === 0) {
      DOM.studentList.innerHTML = '<div class="cnpt-empty-state" style="grid-column:1/-1;padding:40px;text-align:center;color:#999">暂无学员，点击"添加学员"开始</div>';
      return;
    }

    DOM.studentList.innerHTML = students.map(s => {
      const stats = state.storage.getStats(s.id);
      const masteryRate = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;
      return `
        <div class="cnpt-student-card" data-id="${s.id}">
          <div class="cnpt-student-name">${CNPT.utils.escapeHtml(s.name)}</div>
          <div class="cnpt-student-meta">${s.grade ? s.grade + '年级' : '未设置年级'} · ${CNPT.utils.escapeHtml(s.subject || '未设置学科')}</div>
          <div class="cnpt-student-stats">
            <span>✓ ${stats.mastered || 0}掌握</span>
            <span>🌟 ${state.storage.getStars(s.id)}星</span>
            <span>📅 ${state.storage.getDays(s.id)}天</span>
          </div>
          <div style="margin-top:8px;background:#e9ecef;border-radius:4px;height:4px;overflow:hidden">
            <div style="background:#667eea;height:100%;width:${masteryRate}%"></div>
          </div>
          <div class="cnpt-student-actions">
            <button class="cnpt-btn cnpt-btn-sm cnpt-btn-secondary" data-action="view" data-id="${s.id}">详情</button>
            <button class="cnpt-btn cnpt-btn-sm cnpt-btn-danger" data-action="delete" data-id="${s.id}">删除</button>
          </div>
        </div>
      `;
    }).join('');

    // 事件委托
    DOM.studentList.querySelectorAll('[data-action="view"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        showStudentDetail(btn.dataset.id);
      });
    });

    DOM.studentList.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const student = state.storage.getStudents().find(s => s.id === btn.dataset.id);
        if (confirm(`确定要删除学员"${student?.name}"及其所有学习数据吗？`)) {
          state.storage.removeStudent(btn.dataset.id);
          renderStudentList();
          updateDashboard();
          CNPT.utils.showToast('学员已删除');
        }
      });
    });
  }

  function showStudentDetail(studentId) {
    const student = state.storage.getStudents().find(s => s.id === studentId);
    if (!student) return;

    const stats = state.storage.getStats(studentId);
    const masteryRate = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;
    const wrongBook = state.storage.getWrongBook(studentId);
    const stars = state.storage.getStars(studentId);
    const days = state.storage.getDays(studentId);

    document.getElementById('student-detail-title').textContent = `${student.name} - 学习详情`;

    DOM.studentDetailBody.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin-bottom:20px">
        <div style="background:#f8f9fa;border-radius:8px;padding:12px;text-align:center">
          <div style="font-size:20px;font-weight:700;color:#667eea">${stats.mastered || 0}</div>
          <div style="font-size:12px;color:#666">已掌握</div>
        </div>
        <div style="background:#f8f9fa;border-radius:8px;padding:12px;text-align:center">
          <div style="font-size:20px;font-weight:700;color:#ffc107">${stats.learning || 0}</div>
          <div style="font-size:12px;color:#666">学习中</div>
        </div>
        <div style="background:#f8f9fa;border-radius:8px;padding:12px;text-align:center">
          <div style="font-size:20px;font-weight:700;color:${masteryRate >= 60 ? '#28a745' : '#dc3545'}">${masteryRate}%</div>
          <div style="font-size:12px;color:#666">掌握率</div>
        </div>
        <div style="background:#f8f9fa;border-radius:8px;padding:12px;text-align:center">
          <div style="font-size:20px;font-weight:700;color:#667eea">${stars}</div>
          <div style="font-size:12px;color:#666">星星</div>
        </div>
      </div>
      ${wrongBook.length > 0 ? `
        <h4 style="margin:0 0 8px">最近错题 (${wrongBook.length}题)</h4>
        <div style="max-height:200px;overflow-y:auto">
          ${wrongBook.slice(0, 10).map(w => `
            <div style="padding:6px 0;border-bottom:1px solid #eee;font-size:13px">
              <div>${CNPT.utils.escapeHtml(w.question || '题目')}</div>
              <div style="color:#dc3545;font-size:12px">我的答案: ${CNPT.utils.escapeHtml(String(w.userAnswer))}</div>
              <div style="color:#28a745;font-size:12px">正确答案: ${CNPT.utils.escapeHtml(String(w.correctAnswer))}</div>
            </div>
          `).join('')}
        </div>
      ` : '<p style="color:#999">暂无错题记录</p>'}
      <div style="margin-top:16px;display:flex;gap:8px">
        <button class="cnpt-btn cnpt-btn-primary" id="btn-view-student-report">📄 生成报告</button>
        <button class="cnpt-btn cnpt-btn-secondary" id="btn-export-student">📤 导出数据</button>
      </div>
    `;

    document.getElementById('btn-view-student-report').addEventListener('click', () => {
      switchView('reports');
      DOM.reportStudent.value = studentId;
      document.getElementById('modal-student-detail').classList.remove('show');
    });

    document.getElementById('btn-export-student').addEventListener('click', () => {
      const data = state.storage.exportStudentData(studentId);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `student-${student.name}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    document.getElementById('modal-student-detail').classList.add('show');
  }

  // ========== 诊断功能 ==========
  function initDiagnose() {
    updateDiagnoseStudentSelect();

    document.getElementById('btn-run-diagnose').addEventListener('click', runDiagnose);
  }

  function updateDiagnoseStudentSelect() {
    const students = state.storage.getStudents();
    DOM.diagnoseStudent.innerHTML = '<option value="">请选择学员</option>' +
      students.map(s => `<option value="${s.id}">${CNPT.utils.escapeHtml(s.name)}</option>`).join('');
  }

  function initSubjectOptions() {
    const subjects = [...new Set(state.fullData.topics.topics.map(t => t.subject))].sort();
    DOM.diagnoseSubject.innerHTML = '<option value="">请选择学科</option>' +
      subjects.map(s => `<option value="${s}">${s}</option>`).join('');
  }

  function runDiagnose() {
    const studentId = DOM.diagnoseStudent.value;
    const subject = DOM.diagnoseSubject.value;
    const grade = parseInt(DOM.diagnoseGrade.value);

    if (!studentId) { CNPT.utils.showToast('请选择学员'); return; }
    if (!subject) { CNPT.utils.showToast('请选择学科'); return; }
    if (!grade) { CNPT.utils.showToast('请选择年级'); return; }

    const students = state.storage.getStudents();
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    // 获取学员已掌握知识点作为已知
    const masteredTopics = [];
    const masteryData = JSON.parse(localStorage.getItem(`cnpt-training-${studentId}-mastery`) || '{}');
    Object.entries(masteryData).forEach(([topicId, status]) => {
      if (status === 'mastered') masteredTopics.push(topicId);
    });

    const report = state.diagnosticEngine.diagnose({
      subject,
      grade,
      knownMastered: masteredTopics
    });

    // 渲染诊断报告
    DOM.diagnoseResult.innerHTML = `
      <h3 style="margin:0 0 12px">🔍 ${CNPT.utils.escapeHtml(student.name)} · ${subject}${grade}年级诊断报告</h3>
      <div class="cnpt-diagnostic-summary">
        <div class="cnpt-diagnostic-item">
          <div class="cnpt-diagnostic-item-value">${report.gaps.length}</div>
          <div class="cnpt-diagnostic-item-label">知识缺口</div>
        </div>
        <div class="cnpt-diagnostic-item">
          <div class="cnpt-diagnostic-item-value">${report.estimatedHours.toFixed(1)}h</div>
          <div class="cnpt-diagnostic-item-label">预估学时</div>
        </div>
        <div class="cnpt-diagnostic-item">
          <div class="cnpt-diagnostic-item-value">${report.difficulty === 'easy' ? '较轻松' : report.difficulty === 'hard' ? '有挑战' : '中等'}</div>
          <div class="cnpt-diagnostic-item-label">整体难度</div>
        </div>
      </div>
      ${report.recommendations.length > 0 ? `
        <div style="margin-bottom:16px">
          <h4 style="margin:0 0 8px;font-size:14px">💡 学习建议</h4>
          <ul style="padding-left:20px;margin:0;font-size:13px">
            ${report.recommendations.map(r => `<li style="margin-bottom:4px">${CNPT.utils.escapeHtml(r)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      ${report.gaps.length > 0 ? `
        <div>
          <h4 style="margin:0 0 8px;font-size:14px">📋 需补强知识点 (前15个)</h4>
          <div class="cnpt-gap-list">
            ${report.gaps.slice(0, 15).map(g => `
              <span class="cnpt-gap-tag">${CNPT.utils.escapeHtml(g.name)} (难度${g.difficulty})</span>
            `).join('')}
            ${report.gaps.length > 15 ? `<span style="font-size:12px;color:#666">+${report.gaps.length - 15}个</span>` : ''}
          </div>
        </div>
      ` : '<p style="color:#28a745">🎉 基础扎实，可直接进入进阶学习</p>'}
    `;
  }

  // ========== 报告生成 ==========
  function initReports() {
    document.getElementById('btn-generate-report').addEventListener('click', generateProgressReport);
    document.getElementById('btn-generate-diagnostic').addEventListener('click', generateDiagnosticReport);
    document.getElementById('btn-generate-parent-card').addEventListener('click', generateParentCard);

    updateReportStudentSelect();
  }

  function updateReportStudentSelect() {
    const students = state.storage.getStudents();
    DOM.reportStudent.innerHTML = '<option value="">请选择学员</option>' +
      students.map(s => `<option value="${s.id}">${CNPT.utils.escapeHtml(s.name)}</option>`).join('');
  }

  function generateProgressReport() {
    const studentId = DOM.reportStudent.value;
    if (!studentId) { CNPT.utils.showToast('请选择学员'); return; }

    const student = state.storage.getStudents().find(s => s.id === studentId);
    if (!student) return;

    const stats = state.storage.getStats(studentId);
    const wrongBook = state.storage.getWrongBook(studentId);
    const stars = state.storage.getStars(studentId);
    const days = state.storage.getDays(studentId);

    const totalTopics = state.fullData.topics.topics.filter(
      t => !student.grade || t.grade === student.grade
    ).length || state.fullData.topics.topics.length;

    const html = state.reportGenerator.generateProgressReport({
      studentName: student.name,
      subject: student.subject || '',
      stats: { ...stats, total: totalTopics },
      stars,
      days,
      wrongBook: wrongBook.map(w => ({ topicName: w.question || '题目' }))
    });

    DOM.reportPreview.innerHTML = html;
    DOM.reportPreview.innerHTML += `<div style="padding:16px;background:#f8f9fa;border-top:1px solid #eee"><button class="cnpt-btn cnpt-btn-primary" id="btn-download-report">⬇️ 下载HTML报告</button> <button class="cnpt-btn cnpt-btn-secondary" id="btn-copy-text">📋 复制文字版</button></div>`;

    document.getElementById('btn-download-report').addEventListener('click', () => {
      state.reportGenerator.downloadHTML(html, `学习报告-${student.name}.html`);
    });

    document.getElementById('btn-copy-text').addEventListener('click', () => {
      const text = state.reportGenerator.generatePlainText({
        studentName: student.name, subject: student.subject || '', stats: { ...stats, total: totalTopics }, stars, days
      });
      navigator.clipboard.writeText(text).then(() => CNPT.utils.showToast('已复制到剪贴板'));
    });
  }

  function generateDiagnosticReport() {
    const studentId = DOM.reportStudent.value;
    if (!studentId) { CNPT.utils.showToast('请选择学员'); return; }

    const student = state.storage.getStudents().find(s => s.id === studentId);
    if (!student) return;

    const masteredTopics = [];
    const masteryData = JSON.parse(localStorage.getItem(`cnpt-training-${studentId}-mastery`) || '{}');
    Object.entries(masteryData).forEach(([topicId, status]) => {
      if (status === 'mastered') masteredTopics.push(topicId);
    });

    const report = state.diagnosticEngine.diagnose({
      subject: student.subject || '数学',
      grade: student.grade || 3,
      knownMastered: masteredTopics
    });

    const html = state.reportGenerator.generateDiagnosticReport(report);
    DOM.reportPreview.innerHTML = html;
    DOM.reportPreview.innerHTML += `<div style="padding:16px;background:#f8f9fa;border-top:1px solid #eee"><button class="cnpt-btn cnpt-btn-primary" id="btn-download-diag">⬇️ 下载诊断报告</button></div>`;
    document.getElementById('btn-download-diag').addEventListener('click', () => {
      state.reportGenerator.downloadHTML(html, `诊断报告-${student.name}.html`);
    });
  }

  function generateParentCard() {
    const studentId = DOM.reportStudent.value;
    if (!studentId) { CNPT.utils.showToast('请选择学员'); return; }

    const student = state.storage.getStudents().find(s => s.id === studentId);
    if (!student) return;

    const stats = state.storage.getStats(studentId);
    const stars = state.storage.getStars(studentId);

    const html = state.reportGenerator.generateParentCard({
      studentName: student.name,
      subject: student.subject || '',
      stats: { ...stats, stars },
      highlights: ['坚持学习', '积极答题', '持续进步']
    });

    DOM.reportPreview.innerHTML = html;
    DOM.reportPreview.innerHTML += `<div style="padding:16px;background:#f8f9fa;border-top:1px solid #eee"><button class="cnpt-btn cnpt-btn-primary" id="btn-download-card">⬇️ 下载卡片</button></div>`;
    document.getElementById('btn-download-card').addEventListener('click', () => {
      state.reportGenerator.downloadHTML(html, `家校卡片-${student.name}.html`);
    });
  }

  // ========== 设置 ==========
  function initSettings() {
    document.getElementById('btn-clear-all').addEventListener('click', () => {
      if (confirm('确定要清除所有学员数据吗？此操作不可恢复！')) {
        const students = state.storage.getStudents();
        students.forEach(s => state.storage.removeStudent(s.id));
        renderStudentList();
        updateDashboard();
        CNPT.utils.showToast('所有数据已清除');
      }
    });
  }

  // ========== 模态框 ==========
  function initModals() {
    // 关闭按钮
    document.querySelectorAll('.cnpt-modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById(btn.dataset.modal).classList.remove('show');
      });
    });

    // 取消按钮
    document.querySelectorAll('[data-modal]').forEach(btn => {
      if (btn.classList.contains('cnpt-modal-close')) return;
      btn.addEventListener('click', () => {
        document.getElementById(btn.dataset.modal).classList.remove('show');
      });
    });

    // 点击背景关闭
    document.querySelectorAll('.cnpt-modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('show');
      });
    });
  }

  // ========== 数据导出 ==========
  function exportAllData() {
    const students = state.storage.getStudents();
    if (students.length === 0) {
      CNPT.utils.showToast('暂无数据可导出');
      return;
    }

    const allData = {
      exportTime: Date.now(),
      students: students.map(s => ({
        ...s,
        stats: state.storage.getStats(s.id),
        stars: state.storage.getStars(s.id),
        days: state.storage.getDays(s.id)
      }))
    };

    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `training-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    CNPT.utils.showToast('数据已导出');
  }

  // ========== 启动 ==========
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();