/**
 * testdesigner.js
 * 出题人版 - 双向细目表生成、智能组卷、难度预测、覆盖度分析
 * 复用共享组件: showLoadError, reportGenerator
 */
(function () {
  'use strict';

  const CNPT = window.CNPT;
  const { utils, dataLoader, indices: indicesBuilder, search, storage: Storage } = CNPT;

  // ========== 状态管理 ==========
  const state = {
    fullData: null,
    indices: null,
    storage: null,
    papers: [],
    currentView: 'blueprint'
  };

  // ========== DOM缓存 ==========
  let DOM = {};

  function cacheDom() {
    DOM.loading = document.getElementById('cnpt-loading');
    DOM.navBtns = document.querySelectorAll('.cnpt-nav-btn');
    DOM.views = document.querySelectorAll('.cnpt-view');

    // 双向细目表
    DOM.bpSubject = document.getElementById('bp-subject');
    DOM.bpGrade = document.getElementById('bp-grade');
    DOM.bpType = document.getElementById('bp-type');
    DOM.bpDifficulty = document.getElementById('bp-difficulty');
    DOM.btnGenerateBlueprint = document.getElementById('btn-generate-blueprint');
    DOM.blueprintOutput = document.getElementById('blueprint-output');

    // 智能组卷
    DOM.asmSubject = document.getElementById('asm-subject');
    DOM.asmGrade = document.getElementById('asm-grade');
    DOM.asmCount = document.getElementById('asm-count');
    DOM.asmScore = document.getElementById('asm-score');
    DOM.asmDuration = document.getElementById('asm-duration');
    DOM.asmChoice = document.getElementById('asm-choice');
    DOM.asmFill = document.getElementById('asm-fill');
    DOM.asmCalc = document.getElementById('asm-calc');
    DOM.asmAnswer = document.getElementById('asm-answer');
    DOM.btnAssemble = document.getElementById('btn-assemble');
    DOM.assemblyOutput = document.getElementById('assembly-output');

    // 难度预测
    DOM.diffTotal = document.getElementById('diff-total');
    DOM.diffAvg = document.getElementById('diff-avg');
    DOM.diffHighOrder = document.getElementById('diff-high-order');
    DOM.btnPredict = document.getElementById('btn-predict');
    DOM.difficultyOutput = document.getElementById('difficulty-output');

    // 覆盖度分析
    DOM.covSubject = document.getElementById('cov-subject');
    DOM.covGrade = document.getElementById('cov-grade');
    DOM.btnAnalyzeCoverage = document.getElementById('btn-analyze-coverage');
    DOM.coverageOutput = document.getElementById('coverage-output');

    // 试卷库
    DOM.papersList = document.getElementById('papers-list');
  }

  // ========== 初始化 ==========
  async function init() {
    cacheDom();

    try {
      const data = await dataLoader.loadAllData();
      state.fullData = data;
      state.indices = indicesBuilder.buildIndices(data);
      state.storage = Storage.create('testdesigner');

      // 加载保存的试卷
      loadPapers();

      // 隐藏加载状态
      DOM.loading.classList.add('cnpt-loading-hidden');

      // 填充学科选择
      fillSubjects();

      // 初始化视图
      initNavigation();
      initBlueprintView();
      initAssemblyView();
      initDifficultyView();
      initCoverageView();
      initPapersView();

      // 显示默认视图
      showView('blueprint');

    } catch (err) {
      console.error('初始化失败:', err);
      CNPT.components.showLoadError('数据加载失败，请刷新页面重试', {
        onRetry: () => location.reload()
      });
    }
  }

  function fillSubjects() {
    const subjects = [...new Set(state.fullData.topics.map(t => t.subject))];
    [DOM.bpSubject, DOM.asmSubject, DOM.covSubject].forEach(select => {
      select.innerHTML = subjects.map(s => `<option value="${s}">${s}</option>`).join('');
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

  // ========== 双向细目表 ==========
  function initBlueprintView() {
    DOM.btnGenerateBlueprint.addEventListener('click', generateBlueprint);
  }

  function generateBlueprint() {
    const subject = DOM.bpSubject.value;
    const grade = parseInt(DOM.bpGrade.value);
    const examType = DOM.bpType.value;
    const targetDifficulty = parseFloat(DOM.bpDifficulty.value);

    if (!subject || !grade) {
      CNPT.utils.showToast('请选择学科和年级');
      return;
    }

    // 筛选知识点
    const topics = state.fullData.topics.filter(t =>
      t.subject === subject && t.grade === grade
    );

    if (topics.length === 0) {
      CNPT.utils.showToast('该年级/学科暂无数据');
      return;
    }

    // 认知维度
    const cogDims = ['识记', '理解', '应用', '分析', '综合', '评价'];

    // 按领域分组
    const domains = {};
    topics.forEach(t => {
      const dom = t.domain || '其他';
      if (!domains[dom]) domains[dom] = [];
      domains[dom].push(t);
    });

    // 生成细目表矩阵
    const examTypes = {
      unit: '单元测试',
      midterm: '期中考试',
      final: '期末考试',
      simulation: '模拟考试'
    };

    let html = `<div class="cnpt-card">
      <h3>${subject} · ${grade}年级 · ${examTypes[examType]}</h3>
      <p style="color:#666;margin:8px 0">目标难度系数：${targetDifficulty} | 知识点数：${topics.length}</p>
      <div style="overflow-x:auto">
      <table class="cnpt-blueprint-table">
        <thead><tr>
          <th>知识领域</th>
          ${cogDims.map(d => `<th>${d}</th>`).join('')}
          <th>合计</th><th>分值</th>
        </tr></thead><tbody>`;

    let totalScore = 0;
    Object.entries(domains).forEach(([domain, dTopics]) => {
      const rowScore = Math.round(dTopics.length / topics.length * 100);
      totalScore += rowScore;
      html += `<tr>
        <td>${domain} <small>(${dTopics.length}个)</small></td>`;
      cogDims.forEach((dim, i) => {
        // 根据难度和维度分配题数
        const count = Math.max(0, Math.round(dTopics.length / 6 * (1 - i * 0.1)));
        html += `<td class="cog-${i}">${count}</td>`;
      });
      html += `<td class="row-total">${dTopics.length}</td>
        <td class="row-total">${rowScore}</td>
      </tr>`;
    });

    html += `<tr class="col-total">
      <td>合计</td>
      ${cogDims.map(() => '<td>--</td>').join('')}
      <td>${topics.length}</td>
      <td>${totalScore}</td>
    </tr>`;

    html += '</tbody></table></div>';

    // 课标覆盖标注
    const withStandards = topics.filter(t => t.standards && t.standards.length > 0);
    html += `<div style="margin-top:16px">
      <h4>课标覆盖情况</h4>
      <p>覆盖课标编码：${withStandards.length}/${topics.length} (${Math.round(withStandards.length/topics.length*100)}%)</p>
    </div>`;

    // 操作按钮
    html += `<div class="cnpt-action-bar">
      <button class="cnpt-btn cnpt-btn-primary" id="btn-export-blueprint">导出HTML</button>
      <button class="cnpt-btn" id="btn-save-paper">保存到试卷库</button>
    </div>`;

    DOM.blueprintOutput.innerHTML = html;
    DOM.blueprintOutput.classList.remove('cnpt-hidden');

    // 导出事件
    document.getElementById('btn-export-blueprint')?.addEventListener('click', () => {
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `双向细目表_${subject}_${grade}年级.html`;
      a.click();
      URL.revokeObjectURL(url);
    });

    document.getElementById('btn-save-paper')?.addEventListener('click', () => {
      savePaper({
        type: 'blueprint',
        subject,
        grade,
        examType,
        content: html,
        createdAt: new Date().toISOString()
      });
    });
  }

  // ========== 智能组卷 ==========
  function initAssemblyView() {
    DOM.btnAssemble.addEventListener('click', assembleTest);
  }

  function assembleTest() {
    const subject = DOM.asmSubject.value;
    const grade = parseInt(DOM.asmGrade.value);
    const totalCount = parseInt(DOM.asmCount.value) || 30;
    const totalScore = parseInt(DOM.asmScore.value) || 100;
    const duration = parseInt(DOM.asmDuration.value) || 60;

    const choiceCount = parseInt(DOM.asmChoice.value) || 0;
    const fillCount = parseInt(DOM.asmFill.value) || 0;
    const calcCount = parseInt(DOM.asmCalc.value) || 0;
    const answerCount = parseInt(DOM.asmAnswer.value) || 0;

    // 筛选知识点
    const topics = state.fullData.topics.filter(t =>
      t.subject === subject && t.grade === grade
    );

    if (topics.length === 0) {
      CNPT.utils.showToast('该年级/学科暂无数据');
      return;
    }

    // 获取题目
    const allQuestions = [];
    topics.forEach(t => {
      if (t.assessmentTasks && Array.isArray(t.assessmentTasks)) {
        t.assessmentTasks.forEach(q => {
          allQuestions.push({ ...q, topicId: t.id, topicName: t.name });
        });
      }
      if (t.practiceChain && Array.isArray(t.practiceChain)) {
        t.practiceChain.forEach(q => {
          if (!allQuestions.find(e => e.id === q.id)) {
            allQuestions.push({ ...q, topicId: t.id, topicName: t.name });
          }
        });
      }
    });

    // 生成试卷结构
    const typeConfig = [
      { name: '选择题', count: choiceCount, score: Math.round(totalScore * 0.2 / choiceCount) || 2, type: 'choice' },
      { name: '填空题', count: fillCount, score: Math.round(totalScore * 0.2 / fillCount) || 2, type: 'fill' },
      { name: '计算题', count: calcCount, score: Math.round(totalScore * 0.3 / calcCount) || 5, type: 'calculation' },
      { name: '解答题', count: answerCount, score: Math.round(totalScore * 0.3 / answerCount) || 10, type: 'answer' }
    ].filter(t => t.count > 0);

    let html = `<div class="cnpt-paper-preview">
      <div class="cnpt-paper-header">
        <div class="cnpt-paper-title">${subject}${grade}年级${{unit:'单元',midterm:'期中',final:'期末',simulation:'模拟'}[DOM.bpType.value] || ''}试卷</div>
        <div class="cnpt-paper-info">考试时间：${duration}分钟 | 总分：${totalScore}分 | 命题日期：${new Date().toLocaleDateString()}</div>
      </div>`;

    let qNum = 1;
    typeConfig.forEach(section => {
      html += `<div class="cnpt-paper-section">
        <h4>${section.name}（共${section.count}题，每题${section.score}分）</h4>`;

      for (let i = 0; i < section.count; i++) {
        // 随机选取题目或生成占位
        const topic = topics[(qNum + i) % topics.length];
        html += `<div class="cnpt-paper-question">
          <span class="cnpt-question-num">${qNum++}.</span>
          <span>【${topic.domain || '知识点'}】关于"${topic.name}"相关题目（${section.score}分）</span>
          <span class="cnpt-question-meta">难度：${'★'.repeat(topic.difficulty || 3)}</span>
        </div>`;
      }
      html += '</div>';
    });

    html += '</div>';

    // 操作按钮
    html += `<div class="cnpt-action-bar" style="justify-content:center;margin-top:20px">
      <button class="cnpt-btn cnpt-btn-primary" id="btn-print">打印试卷</button>
      <button class="cnpt-btn" id="btn-export-paper">导出HTML</button>
      <button class="cnpt-btn" id="btn-save-assembly">保存到试卷库</button>
    </div>`;

    DOM.assemblyOutput.innerHTML = html;
    DOM.assemblyOutput.classList.remove('cnpt-hidden');

    // 事件绑定
    document.getElementById('btn-print')?.addEventListener('click', () => window.print());
    document.getElementById('btn-export-paper')?.addEventListener('click', () => {
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `试卷_${subject}_${grade}年级.html`;
      a.click();
      URL.revokeObjectURL(url);
    });
    document.getElementById('btn-save-assembly')?.addEventListener('click', () => {
      savePaper({
        type: 'paper',
        subject,
        grade,
        totalScore,
        duration,
        content: html,
        createdAt: new Date().toISOString()
      });
    });
  }

  // ========== 难度预测 ==========
  function initDifficultyView() {
    DOM.btnPredict.addEventListener('click', predictDifficulty);
  }

  function predictDifficulty() {
    const total = parseInt(DOM.diffTotal.value) || 30;
    const avgDiff = parseFloat(DOM.diffAvg.value) || 3;
    const highOrderPct = parseInt(DOM.diffHighOrder.value) || 30;

    // 难度预测算法
    // P = 1 - (平均难度/5) * (1 - 高阶题占比 * 0.3)
    const baseP = 1 - (avgDiff / 5);
    const adjustedP = baseP * (1 - (highOrderPct / 100) * 0.3);
    const predictedP = Math.max(0.1, Math.min(0.95, adjustedP));

    // 难度等级
    let level, levelColor, suggestion;
    if (predictedP >= 0.8) {
      level = '较易'; levelColor = '#27ae60';
      suggestion = '试卷偏容易，建议增加中高难度题目比例。';
    } else if (predictedP >= 0.6) {
      level = '适中'; levelColor = '#f39c12';
      suggestion = '试卷难度适中，适合大多数学生。';
    } else if (predictedP >= 0.4) {
      level = '较难'; levelColor = '#e67e22';
      suggestion = '试卷偏难，适合选拔性考试或资优班使用。';
    } else {
      level = '很难'; levelColor = '#e74c3c';
      suggestion = '试卷难度过高，建议降低高难度题目比例。';
    }

    // 各难度题数建议
    const easyCount = Math.round(total * (1 - predictedP) * 0.6);
    const mediumCount = Math.round(total * 0.4);
    const hardCount = total - easyCount - mediumCount;

    DOM.difficultyOutput.innerHTML = `
      <div class="cnpt-card">
        <h3>难度预测结果</h3>
        <div class="cnpt-difficulty-result">
          <div class="cnpt-difficulty-gauge">
            <div class="cnpt-difficulty-value">
              <div class="num" style="color:${levelColor}">${predictedP.toFixed(2)}</div>
              <div class="label">预测难度系数</div>
            </div>
          </div>
          <div class="cnpt-difficulty-detail">
            <div class="cnpt-difficulty-item">
              <span>难度等级</span>
              <strong style="color:${levelColor}">${level}</strong>
            </div>
            <div class="cnpt-difficulty-item">
              <span>题目总数</span>
              <strong>${total}题</strong>
            </div>
            <div class="cnpt-difficulty-item">
              <span>平均节点难度</span>
              <strong>${avgDiff}/5</strong>
            </div>
            <div class="cnpt-difficulty-item">
              <span>高阶思维题占比</span>
              <strong>${highOrderPct}%</strong>
            </div>
            <hr style="margin:12px 0;border:none;border-top:1px solid #eee"/>
            <h4 style="margin-bottom:8px">建议题目分布</h4>
            <div class="cnpt-difficulty-item">
              <span>容易题（P≥0.8）</span>
              <strong>${easyCount}题</strong>
            </div>
            <div class="cnpt-difficulty-item">
              <span>中等题（0.5≤P&lt;0.8）</span>
              <strong>${mediumCount}题</strong>
            </div>
            <div class="cnpt-difficulty-item">
              <span>较难题（P&lt;0.5）</span>
              <strong>${hardCount}题</strong>
            </div>
            <hr style="margin:12px 0;border:none;border-top:1px solid #eee"/>
            <p style="color:#666;font-size:13px">${suggestion}</p>
          </div>
        </div>
      </div>
    `;
    DOM.difficultyOutput.classList.remove('cnpt-hidden');
  }

  // ========== 覆盖度分析 ==========
  function initCoverageView() {
    DOM.btnAnalyzeCoverage.addEventListener('click', analyzeCoverage);
  }

  function analyzeCoverage() {
    const subject = DOM.covSubject.value;
    const grade = parseInt(DOM.covGrade.value);

    const topics = state.fullData.topics.filter(t =>
      t.subject === subject && t.grade === grade
    );

    if (topics.length === 0) {
      CNPT.utils.showToast('该年级/学科暂无数据');
      return;
    }

    // 按领域分析覆盖度
    const domains = {};
    topics.forEach(t => {
      const dom = t.domain || '其他';
      if (!domains[dom]) domains[dom] = { total: 0, withQuestions: 0, withStandards: 0 };
      domains[dom].total++;
      if ((t.assessmentTasks && t.assessmentTasks.length > 0) ||
          (t.practiceChain && t.practiceChain.length > 0)) {
        domains[dom].withQuestions++;
      }
      if (t.standards && t.standards.length > 0) {
        domains[dom].withStandards++;
      }
    });

    let html = `<div class="cnpt-card">
      <h3>${subject} · ${grade}年级 覆盖度分析</h3>
      <p style="color:#666;margin:8px 0">知识点总数：${topics.length} | 知识领域数：${Object.keys(domains).length}</p>
      <div class="cnpt-coverage-grid">`;

    Object.entries(domains).forEach(([domain, data]) => {
      const qPct = Math.round((data.withQuestions / data.total) * 100);
      const sPct = Math.round((data.withStandards / data.total) * 100);
      const avgPct = Math.round((qPct + sPct) / 2);

      let status = 'covered';
      if (avgPct < 40) status = 'missing';
      else if (avgPct < 70) status = 'partial';

      html += `<div class="cnpt-coverage-item ${status}">
        <div class="cnpt-coverage-domain">${domain}</div>
        <div class="cnpt-coverage-pct">${avgPct}%</div>
        <div style="font-size:12px;color:#666">
          题目覆盖：${qPct}% | 课标覆盖：${sPct}%
        </div>
        <div class="cnpt-coverage-bar">
          <div class="cnpt-coverage-bar-fill" style="width:${avgPct}%;background:${avgPct >= 70 ? '#27ae60' : avgPct >= 40 ? '#f39c12' : '#e74c3c'}"></div>
        </div>
      </div>`;
    });

    html += '</div></div>';

    // 盲区提示
    const missingDomains = Object.entries(domains)
      .filter(([, d]) => (d.withQuestions / d.total) < 0.5)
      .map(([name]) => name);

    if (missingDomains.length > 0) {
      html += `<div class="cnpt-card" style="margin-top:16px;border-left:4px solid #e74c3c">
        <h4>⚠️ 覆盖盲区</h4>
        <p>以下知识领域题目覆盖不足50%，建议补充：</p>
        <ul style="padding-left:20px;line-height:2">
          ${missingDomains.map(d => `<li>${d}</li>`).join('')}
        </ul>
      </div>`;
    }

    DOM.coverageOutput.innerHTML = html;
    DOM.coverageOutput.classList.remove('cnpt-hidden');
  }

  // ========== 试卷库 ==========
  function initPapersView() {
    renderPapersList();
  }

  function renderPapersList() {
    if (state.papers.length === 0) {
      DOM.papersList.innerHTML = '<p style="color:#999;text-align:center;padding:40px">暂无保存的试卷，请先使用智能组卷功能生成试卷。</p>';
      return;
    }

    DOM.papersList.innerHTML = state.papers.map((p, i) => `
      <div class="cnpt-paper-card" data-index="${i}">
        <div class="cnpt-paper-card-title">${p.subject || '未命名'} - ${p.grade || ''}年级</div>
        <div class="cnpt-paper-card-meta">
          <span>总分：${p.totalScore || 100}</span>
          <span>时长：${p.duration || 60}分钟</span>
          <span>${new Date(p.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    `).join('');

    DOM.papersList.querySelectorAll('.cnpt-paper-card').forEach(card => {
      card.addEventListener('click', () => {
        const paper = state.papers[parseInt(card.dataset.index)];
        if (paper) {
          const win = window.open('', '_blank');
          win.document.write(paper.content);
        }
      });
    });
  }

  function savePaper(paper) {
    state.papers.unshift(paper);
    localStorage.setItem('cnpt-testdesigner-papers', JSON.stringify(state.papers));
    CNPT.utils.showToast('已保存到试卷库');
    renderPapersList();
  }

  function loadPapers() {
    const saved = localStorage.getItem('cnpt-testdesigner-papers');
    if (saved) {
      state.papers = JSON.parse(saved);
    }
  }

  // ========== 启动 ==========
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
