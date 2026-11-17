/*!
 * 中国小学教育知识图谱 · H5 主应用
 * CN-Primary-Taxonomy · Mobile H5 Edition
 * Canvas高性能渲染 + 触摸手势 + 移动端原生体验
 * 
 * 使用 shared/ 公共模块处理数据加载、索引、搜索、路径、存储
 */
(function() {
  'use strict';

  // ==================== 角色存储 (H5面向学生/孩子) ====================
  const storage = CNPT.storage.create('student');

  // FSRS 间隔复习引擎（今日任务 / 首做正确率 / 错因台账）
  let fsrsEngine = null;
  // 诊断闭环（错题两步闭环 / 次日盲测 / 预检跳课）
  let diagEngine = null;
  // 根因回溯诊断（共享组件，cn-math-taxonomy 借鉴）
  let rcdEngine = null;
  let themeEngine = null;
  let rcdSession = null;

  // ==================== State ====================
  let fullData = { topics: null, deps: null, clusters: null };

  let currentGrade = 'all';
  let currentSubject = 'all';
  let currentTextbook = 'all';
  let currentLayer = 'core';

  let kidMode = false;

  // Graph rendering state
  let canvasW = 0, canvasH = 0;
  let dpr = 1;
  let transform = { x: 0, y: 0, k: 1 };
  let visibleNodes = [];
  let visibleLinks = [];
  let hoveredNode = null;

  // Simplified force simulation
  let simulationNodes = [];
  let simulationLinks = [];
  let simRunning = false;
  let simTimer = null;

  // ==================== DOM References ====================
  let canvas, ctx;
  let container;
  let sheet, sheetContent;
  let toast;

  // ==================== FSRS + 今日学习台 ====================
  /**
   * 知识点是否已掌握（人工标记 或 FSRS 连续 2 次独立答对 / 已退役）
   * 用于「知识边界硬约束」：硬前置未掌握则不排进新学任务
   */
  function isTopicMastered(topicId) {
    if (storage.getTopicStatus(topicId) === 'mastered') return true;
    const card = fsrsEngine && fsrsEngine.getStatus(topicId);
    if (!card) return false;
    return card.dormant || card.consecutiveCorrect >= 2;
  }

  function initFsrsAndDailyPlan() {
    if (!window.CNPT.fsrs || !window.CNPT.components.initDailyPlan) return;
    fsrsEngine = CNPT.fsrs.create('student');
    if (window.CNPT.diagnostic) diagEngine = CNPT.diagnostic.create('student');

    CNPT.components.initDailyPlan({
      role: 'student',
      topicMap: CNPT.indices.getTopicMap(),
      getIncoming: (id) => CNPT.indices.getIncoming(id),
      isMastered: isTopicMastered,
      diagnostic: diagEngine,
      mount: 'daily-plan',
      onStartTopic: (topic, kind) => {
        window.CNPT.components.dailyPlan.startSessionTimer();
        startPractice(topic.id);
      },
      onStartRetest: (item) => openRetest(item, 'retest'),
      onStartBlindTest: (item) => openRetest(item, 'blind'),
      onStartPrecheck: (topic) => openPrecheck(topic)
    });

    // 根因回溯诊断（共享组件，cn-math-taxonomy 借鉴）
    initRootCauseDiagnosis();
    initThemeLearning();
  }

  /**
   * 重测 / 次日盲测：单题窗口（不看解析，独立作答）
   * kind = 'retest'（第 1 步）| 'blind'（第 2 步）
   */
  function openRetest(item, kind) {
    const modal = document.getElementById('practice-modal');
    const body = document.getElementById('practice-body');
    const title = document.getElementById('practice-title');

    title.textContent = kind === 'blind' ? '🌅 次日盲测 · 不看提示' : '🔬 错题重测 · 第 1 步';
    modal.classList.add('mo-open');

    body.innerHTML = `
      ${item.aiGenerated ? '<div class="pq-ai-note">🤖 本题由 AI 生成初稿，未经学科教师审核，仅供练习。</div>' : ''}
      <div class="practice-question">${CNPT.utils.escapeHtml(item.question)}</div>
      <div class="practice-options">
        ${(item.options || []).map((opt, i) => `<button class="practice-option" data-idx="${i}">${String.fromCharCode(65 + i)}. ${CNPT.utils.escapeHtml(opt)}</button>`).join('')}
      </div>
      <div class="pq-reason-title" style="margin-top:10px">作答后才知道对错；盲测通过即完成闭环。</div>
    `;

    body.querySelectorAll('.practice-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const selected = parseInt(opt.dataset.idx, 10);
        const correct = selected === item.answer;
        opt.classList.add(correct ? 'po-correct' : 'po-wrong');
        setTimeout(() => {
          if (kind === 'blind') {
            diagEngine && diagEngine.answerBlindTest(item.topicId, correct);
          } else {
            diagEngine && diagEngine.answerRetest(item.topicId, correct);
          }
          CNPT.utils.showToast(correct
            ? (kind === 'blind' ? '🎉 盲测通过，闭环完成！' : '✅ 重测通过，明天再盲测一次')
            : '💡 还没过，20 分钟后重测');
          setTimeout(() => { closeSheet(); refreshDailyPlan(); switchView('learn'); }, 900);
        }, 500);
      });
    });
  }

  /**
   * 预检跳课：3 题全对 → 直接标记掌握
   */
  function openPrecheck(topic) {
    if (!diagEngine) return;
    const questions = [0, 1, 2].map(i => diagEngine.pickQuestion(topic, i)).filter(Boolean);
    if (!questions.length) {
      CNPT.utils.showToast('这个知识点暂时没有预检题，直接开始学习吧');
      startPractice(topic.id);
      return;
    }

    diagEngine.startPrecheck(topic.id);
    const modal = document.getElementById('practice-modal');
    const body = document.getElementById('practice-body');
    const title = document.getElementById('practice-title');
    let idx = 0;

    title.textContent = `⚡ 预检 · ${topic.name}`;
    modal.classList.add('mo-open');

    const showPrecheckQuestion = () => {
      const q = questions[idx];
      body.innerHTML = `
        <div class="pq-ai-note">🤖 预检题由 AI 生成初稿，未经学科教师审核，仅供分流参考。</div>
        <div class="practice-question">${idx + 1}/${questions.length}. ${CNPT.utils.escapeHtml(q.question)}</div>
        <div class="practice-options">
          ${q.options.map((opt, i) => `<button class="practice-option" data-idx="${i}">${String.fromCharCode(65 + i)}. ${CNPT.utils.escapeHtml(opt)}</button>`).join('')}
        </div>
      `;
      body.querySelectorAll('.practice-option').forEach(opt => {
        opt.addEventListener('click', () => {
          const selected = parseInt(opt.dataset.idx, 10);
          const correct = selected === q.answer;
          opt.classList.add(correct ? 'po-correct' : 'po-wrong');
          diagEngine.answerPrecheck(topic.id, correct);
          setTimeout(() => {
            if (correct) {
              idx++;
              if (idx < questions.length) { showPrecheckQuestion(); return; }
              CNPT.utils.showToast('🎉 预检全对，已标记掌握，跳过正式学习！');
            } else {
              CNPT.utils.showToast('💡 预检未过，直接从练习开始学吧');
            }
            setTimeout(() => { closeSheet(); refreshDailyPlan(); switchView('learn'); }, 900);
          }, 500);
        });
      });
    };

    showPrecheckQuestion();
  }

  function refreshDailyPlan() {
    if (window.CNPT.components.dailyPlan) window.CNPT.components.dailyPlan.refresh();
  }

  /**
   * 记录一次 FSRS 作答（首做/复习分离、信心、错因、低级失误）
   */
  function recordFsrsAnswer(topic, payload) {
    if (!fsrsEngine) return;
    try {
      fsrsEngine.recordAnswer(Object.assign({ topicId: topic.id }, payload));
    } catch (e) {
      console.error('FSRS 记录失败:', e);
    }
  }

  // ==================== Initialization ====================
  async function init() {
    canvas = document.getElementById('graph-canvas');
    ctx = canvas.getContext('2d');
    container = document.getElementById('graph-container');
    sheet = document.getElementById('node-detail-sheet');
    sheetContent = document.getElementById('node-detail-content');
    toast = document.getElementById('toast');

    kidMode = localStorage.getItem('cnpt-h5-kid-mode') === 'true';
    if (kidMode) document.body.classList.add('kid-mode');

    setupCanvas();
    setupGestures();
    setupUI();
    setupBottomNav();
    setupSearch();
    setupFilter();
    setupSheet();
    setupModals();
    // 注意：setupSubjectQuickGrid() 依赖 fullData，必须在数据加载完成后调用

    try {
      fullData = await CNPT.dataLoader.loadAllData();
      CNPT.indices.buildIndices(fullData);
    if (CNPT.components.initNodeDetail) CNPT.components.initNodeDetail();
    setupSubjectQuickGrid();
    initFsrsAndDailyPlan();

      // 更新顶部信息
      document.getElementById('header-title').textContent =
        `知识图谱 · ${fullData.topics.topicCount}知识点`;

      updateSubjectFilter();
      applyFilters();
      updateStats();
      updateLearningPath();
      updateWrongBook();

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

      // Show hint then hide
      setTimeout(() => {
        document.getElementById('graph-hint')?.classList.add('hint-hidden');
      }, 4000);
    } catch (err) {
      console.error('加载数据失败:', err);
      CNPT.components.showLoadError('加载失败啦', { icon: '😢' });
    }

    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibilityChange);
  }

  // ==================== Canvas Setup ====================
  function setupCanvas() {
    const rect = container.getBoundingClientRect();
    dpr = window.devicePixelRatio || 1;
    canvasW = rect.width;
    canvasH = rect.height;
    canvas.width = canvasW * dpr;
    canvas.height = canvasH * dpr;
    canvas.style.width = canvasW + 'px';
    canvas.style.height = canvasH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function onResize() {
    setupCanvas();
    renderGraph();
  }

  function onVisibilityChange() {
    if (document.hidden) {
      stopSimulation();
    }
  }

  // ==================== Filtering (使用CNPT.search.filterTopics) ====================
  function getFilteredTopics() {
    const filters = {
      grades: currentGrade === 'all' ? null : new Set([currentGrade]),
      subjects: currentSubject === 'all' ? null : new Set([currentSubject]),
      textbooks: currentTextbook === 'all' ? null : new Set([currentTextbook]),
      layer: currentLayer
    };
    return CNPT.search.filterTopics(filters, fullData.topics.topics);
  }

  function applyFilters() {
    if (!fullData.topics) return;

    const filtered = getFilteredTopics();
    const limit = 500;

    visibleNodes = filtered.length > limit ? filtered.slice(0, limit) : filtered;

    const visibleIds = new Set(visibleNodes.map(n => n.id));
    visibleLinks = fullData.dependencies.dependencies.filter(
      d => visibleIds.has(d.topicId) && visibleIds.has(d.prerequisiteId)
    ).map(d => ({ source: d.prerequisiteId, target: d.topicId, strength: d.strength, reason: d.reason }));

    updateFilterCount(filtered.length);
    updateGraphStatus();

    // 空结果引导提示
    const graphHint = document.getElementById('graph-hint');
    if (filtered.length === 0 && graphHint) {
      graphHint.innerHTML = '<span>🔍 当前筛选条件下没有匹配的知识点</span><br><span style="font-size:12px;color:#999">请尝试调整筛选条件，如选择其他年级、学科或教材版本</span>';
      graphHint.classList.remove('hint-hidden');
    } else if (graphHint && filtered.length > 0) {
      graphHint.innerHTML = '<span>💡 拖拽/双指缩放可平移和缩放图谱</span>';
    }

    // 节点截断提示
    if (filtered.length > limit && graphHint) {
      graphHint.innerHTML = `<span>⚠️ 当前筛选结果共 ${filtered.length} 个节点，为保证性能仅显示前 ${limit} 个</span><br><span style="font-size:12px;color:#999">建议缩小筛选范围以获得更好的浏览体验</span>`;
      graphHint.classList.remove('hint-hidden');
    }

    initSimulation();
    renderGraph();
  }

  function updateGraphStatus() {
    const status = document.getElementById('graph-status');
    if (!status) return;
    status.innerHTML = `显示 <strong>${visibleNodes.length}</strong> / ${fullData.topics.topics.length} 个节点 · <strong>${visibleLinks.length}</strong> 条关系`;
  }

  // ==================== Simplified Force Simulation ====================
  function initSimulation() {
    stopSimulation();

    const nodes = visibleNodes.map(t => ({
      id: t.id, x: canvasW / 2 + (Math.random() - 0.5) * 200,
      y: canvasH / 2 + (Math.random() - 0.5) * 200,
      vx: 0, vy: 0, difficulty: t.difficulty || 3
    }));

    const nodeIds = new Set(nodes.map(n => n.id));
    const links = visibleLinks.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target));

    simulationNodes = nodes;
    simulationLinks = links;

    simRunning = true;
    let iterations = 0;
    const maxIterations = 120;

    function step() {
      if (!simRunning || iterations >= maxIterations) {
        simRunning = false;
        renderGraph();
        return;
      }

      runSimulationStep();
      renderGraph();
      iterations++;
      simTimer = requestAnimationFrame(step);
    }

    step();
  }

  function runSimulationStep() {
    const nodes = simulationNodes;
    const links = simulationLinks;
    const alpha = Math.max(0.01, 1 - (nodes.length > 300 ? 15 : 30) * 0.005);

    // Repulsion
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = -800 / (dist * dist);
        const fx = (dx / dist) * force * alpha;
        const fy = (dy / dist) * force * alpha;
        nodes[i].vx -= fx; nodes[i].vy -= fy;
        nodes[j].vx += fx; nodes[j].vy += fy;
      }
    }

    // Attraction (links)
    links.forEach(link => {
      const source = nodes.find(n => n.id === link.source);
      const target = nodes.find(n => n.id === link.target);
      if (!source || !target) return;
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const targetDist = link.strength === 'hard' ? 50 : 80;
      const force = (dist - targetDist) * 0.02 * alpha;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      source.vx += fx; source.vy += fy;
      target.vx -= fx; target.vy -= fy;
    });

    // Center gravity
    const cx = canvasW / 2, cy = canvasH / 2;
    nodes.forEach(n => {
      n.vx += (cx - n.x) * 0.003 * alpha;
      n.vy += (cy - n.y) * 0.003 * alpha;
      n.x += n.vx * alpha;
      n.y += n.vy * alpha;
      n.vx *= 0.85;
      n.vy *= 0.85;
    });
  }

  function stopSimulation() {
    simRunning = false;
    if (simTimer) { cancelAnimationFrame(simTimer); simTimer = null; }
  }

  // ==================== Graph Rendering (H5 Canvas独有) ====================
  function renderGraph() {
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.save();

    // Apply transform
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.k, transform.k);

    // Draw links
    simulationLinks.forEach(link => {
      const source = simulationNodes.find(n => n.id === link.source);
      const target = simulationNodes.find(n => n.id === link.target);
      if (!source || !target) return;

      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = link.strength === 'hard' ? 'rgba(231,76,60,0.25)' : 'rgba(243,156,18,0.15)';
      ctx.lineWidth = link.strength === 'hard' ? 1.2 : 0.8;
      if (link.strength === 'soft') ctx.setLineDash([4, 3]);
      else ctx.setLineDash([]);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Draw nodes
    const nodeRadius = Math.max(3, Math.min(8, 200 / simulationNodes.length));
    const topicMap = CNPT.indices.getTopicMap();
    simulationNodes.forEach(node => {
      const topic = topicMap.get(node.id);
      if (!topic) return;

      const status = storage.getTopicStatus(node.id);
      const fillColor = status === 'mastered' ? '#2ecc71' :
                       status === 'learning' ? '#f39c12' :
                       (CNPT.constants.COLORS[topic.subject] || '#888');

      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.fill();

      if (node.id === hoveredNode || node.id === selectedNodeId) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    ctx.restore();
  }

  // ==================== Touch Gestures (H5独有) ====================
  let touches = [];
  let lastPanDist = 0;
  let isDragging = false;
  let dragStartPos = { x: 0, y: 0 };
  let startTransform = { x: 0, y: 0, k: 1 };
  let dragNode = null;

  function setupGestures() {
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', onTouchEnd, { passive: false });

    // Mouse fallback for desktop testing
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
  }

  function onTouchStart(e) {
    e.preventDefault();
    touches = Array.from(e.touches);

    if (touches.length === 1) {
      isDragging = true;
      dragStartPos = { x: touches[0].clientX, y: touches[0].clientY };
      startTransform = { ...transform };

      const pos = screenToWorld(touches[0].clientX, touches[0].clientY);
      dragNode = findNodeAt(pos.x, pos.y);
    } else if (touches.length === 2) {
      isDragging = false;
      dragNode = null;
      lastPanDist = getTouchDist(touches[0], touches[1]);
    }
  }

  function onTouchMove(e) {
    e.preventDefault();
    touches = Array.from(e.touches);

    if (touches.length === 1 && isDragging) {
      const dx = touches[0].clientX - dragStartPos.x;
      const dy = touches[0].clientY - dragStartPos.y;

      if (dragNode) {
        const idx = simulationNodes.findIndex(n => n.id === dragNode);
        if (idx >= 0) {
          simulationNodes[idx].x = (touches[0].clientX - transform.x) / transform.k;
          simulationNodes[idx].y = (touches[0].clientY - transform.y) / transform.k;
        }
      } else {
        transform.x = startTransform.x + dx;
        transform.y = startTransform.y + dy;
      }
      renderGraph();

      const pos = screenToWorld(touches[0].clientX, touches[0].clientY);
      hoveredNode = findNodeAt(pos.x, pos.y);
    } else if (touches.length === 2) {
      const dist = getTouchDist(touches[0], touches[1]);
      const midpoint = getTouchMidpoint(touches[0], touches[1]);

      if (lastPanDist > 0) {
        const scale = dist / lastPanDist;
        const newK = Math.max(0.3, Math.min(4, transform.k * scale));

        const wx = (midpoint.x - transform.x) / transform.k;
        const wy = (midpoint.y - transform.y) / transform.k;
        transform.k = newK;
        transform.x = midpoint.x - wx * newK;
        transform.y = midpoint.y - wy * newK;
      }

      lastPanDist = dist;
      renderGraph();
    }
  }

  function onTouchEnd(e) {
    if (dragNode && isDragging) {
      const dx = Math.abs(touches[0]?.clientX - dragStartPos.x) || 0;
      const dy = Math.abs(touches[0]?.clientY - dragStartPos.y) || 0;
      if (dx < 8 && dy < 8) {
        showNodeDetail(dragNode);
      }
    }

    dragNode = null;
    isDragging = false;
    lastPanDist = 0;
  }

  let mouseDown = false;
  let mouseStart = { x: 0, y: 0 };

  function onMouseDown(e) {
    mouseDown = true;
    mouseStart = { x: e.clientX, y: e.clientY };
    dragStartPos = { x: e.clientX, y: e.clientY };
    startTransform = { ...transform };
    const pos = screenToWorld(e.clientX, e.clientY);
    dragNode = findNodeAt(pos.x, pos.y);
  }

  function onMouseMove(e) {
    if (mouseDown) {
      const dx = e.clientX - dragStartPos.x;
      const dy = e.clientY - dragStartPos.y;

      if (dragNode) {
        const idx = simulationNodes.findIndex(n => n.id === dragNode);
        if (idx >= 0) {
          simulationNodes[idx].x = (e.clientX - transform.x) / transform.k;
          simulationNodes[idx].y = (e.clientY - transform.y) / transform.k;
        }
      } else {
        transform.x = startTransform.x + dx;
        transform.y = startTransform.y + dy;
      }
      renderGraph();
    } else {
      const pos = screenToWorld(e.clientX, e.clientY);
      hoveredNode = findNodeAt(pos.x, pos.y);
      canvas.style.cursor = hoveredNode ? 'pointer' : 'grab';
    }
  }

  function onMouseUp(e) {
    if (dragNode) {
      const dx = Math.abs(e.clientX - dragStartPos.x);
      const dy = Math.abs(e.clientY - dragStartPos.y);
      if (dx < 5 && dy < 5) {
        showNodeDetail(dragNode);
      }
    }
    mouseDown = false;
    dragNode = null;
  }

  function onWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newK = Math.max(0.3, Math.min(4, transform.k * delta));

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const wx = (mx - transform.x) / transform.k;
    const wy = (my - transform.y) / transform.k;
    transform.k = newK;
    transform.x = mx - wx * newK;
    transform.y = my - wy * newK;

    renderGraph();
  }

  // ==================== Coordinate Helpers ====================
  function screenToWorld(sx, sy) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (sx - rect.left - transform.x) / transform.k,
      y: (sy - rect.top - transform.y) / transform.k
    };
  }

  function findNodeAt(x, y) {
    if (!simulationNodes.length) return null;
    const radius = 15;
    for (let i = simulationNodes.length - 1; i >= 0; i--) {
      const n = simulationNodes[i];
      const dx = n.x - x;
      const dy = n.y - y;
      if (dx * dx + dy * dy < radius * radius) return n.id;
    }
    return null;
  }

  function getTouchDist(t1, t2) {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function getTouchMidpoint(t1, t2) {
    return { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };
  }

  // ==================== Node Detail Sheet ====================
  let selectedNodeId = null;

  /**
   * 增强字段 HTML（AI 生成初稿：一句话/家长指南/随堂小题三级提示）
   * 未加载增强数据时返回空串，不影响原有详情面板。
   */
  function buildEnhancedHtml(topic, variant) {
    if (window.CNPT?.components?.buildEnhancedHtml) {
      return CNPT.components.buildEnhancedHtml(topic, variant);
    }
    return '';
  }

  function showNodeDetail(nodeId) {
    selectedNodeId = nodeId;
    const topicMap = CNPT.indices.getTopicMap();
    const topic = topicMap.get(nodeId);
    if (!topic) return;

    const status = storage.getTopicStatus(nodeId);
    const hardPrereqs = CNPT.path.getHardPrerequisites(nodeId);
    const softPrereqs = CNPT.path.getSoftPrerequisites(nodeId);
    const succs = CNPT.path.getSuccessors(nodeId);

    const color = CNPT.constants.COLORS[topic.subject] || '#888';
    const tags = [
      `<span class="bs-tag" style="background:${color}20;color:${color}">${topic.subject}</span>`,
      `<span class="bs-tag" style="background:rgba(0,0,0,0.05);color:#666">${topic.domain || ''}</span>`,
      `<span class="bs-tag" style="background:rgba(0,0,0,0.05);color:#666">${topic.grade}年级${topic.term || ''}</span>`,
      `<span class="bs-tag" style="background:rgba(255,200,0,0.15);color:#f39c12">难度 ${CNPT.constants.DIFFICULTY(topic.difficulty || 3)}</span>`
    ].join('');

    const coachText = CNPT.utils.buildCoachText(topic, hardPrereqs, succs);

    // 知识边界提示：硬前置未掌握时不禁止学习，但明确提醒（硬约束用于今日任务排课）
    const unmetHard = hardPrereqs.filter(i => !isTopicMastered(i.topic.id));
    const boundaryHint = unmetHard.length ? `
      <div class="bs-boundary">
        🔒 <b>知识边界</b>：建议先掌握 ${unmetHard.map(i => `<span class="bs-boundary-item" data-action="select-node" data-id="${i.topic.id}">${CNPT.utils.escapeHtml(i.topic.name)}</span>`).join('、')} 再开始练习，避免“夹生”。
      </div>` : '';

    sheetContent.innerHTML = `
      <h2>${CNPT.utils.escapeHtml(topic.name)}</h2>
      <div class="bs-meta">${topic.id} · ${CNPT.utils.escapeHtml(topic.textbook || '')}${topic.unit ? ' · ' + CNPT.utils.escapeHtml(topic.unit) : ''}</div>
      <div class="bs-tags">${tags}</div>
      <div class="bs-desc">${CNPT.utils.escapeHtml(topic.description || '暂无描述')}</div>

      <div class="bs-mastery-row">
        <button class="bs-mastery-btn ${status === 'mastered' ? 'm-active' : ''}" data-mastery="mastered">✅ 已掌握</button>
        <button class="bs-mastery-btn ${status === 'learning' ? 'm-active' : ''}" data-mastery="learning">📖 学习中</button>
        <button class="bs-mastery-btn ${status === 'not-started' ? 'm-active' : ''}" data-mastery="not-started">⏳ 未开始</button>
      </div>

      <div class="bs-coach-box">${coachText}</div>

      ${boundaryHint}

      <h3>✓ 掌握标准</h3>
      <ul class="bs-list">${(topic.evidence || []).map(e => `<li>${CNPT.utils.escapeHtml(e)}</li>`).join('') || '<li style="color:#999">暂无</li>'}</ul>

      ${(topic.commonMistakes && topic.commonMistakes.length) ? `
        <h3>⚠️ 易错点</h3>
        <ul class="bs-list">${topic.commonMistakes.map(e => `<li>${CNPT.utils.escapeHtml(e)}</li>`).join('')}</ul>
      ` : ''}

      ${hardPrereqs.length ? `
        <h3>🔴 必须先补</h3>
        ${hardPrereqs.map(i => `<div class="bs-chain-item hard" data-action="select-node" data-id="${i.topic.id}"><span class="chain-arrow">🔴</span><b>${CNPT.utils.escapeHtml(i.topic.name)}</b><br><span style="color:#999;font-size:11px">${CNPT.utils.escapeHtml(i.edge.reason || '')}</span></div>`).join('')}
      ` : ''}

      ${softPrereqs.length ? `
        <h3>🟡 建议先补</h3>
        ${softPrereqs.map(i => `<div class="bs-chain-item soft" data-action="select-node" data-id="${i.topic.id}"><span class="chain-arrow">🟡</span><b>${CNPT.utils.escapeHtml(i.topic.name)}</b><br><span style="color:#999;font-size:11px">${CNPT.utils.escapeHtml(i.edge.reason || '')}</span></div>`).join('')}
      ` : ''}

      <div class="bs-actions">
        <button class="bs-action-btn primary" data-action="start-practice" data-id="${topic.id}">📝 练习题</button>
        <button class="bs-action-btn secondary" data-action="start-rcd" data-id="${topic.id}">🔍 根因诊断</button>
        <button class="bs-action-btn secondary" data-action="view-path" data-id="${topic.id}">🛤️ 学习路径</button>
      </div>

      ${buildEnhancedHtml(topic, 'parent')}
    `;

    // Setup mastery buttons
    sheetContent.querySelectorAll('.bs-mastery-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        storage.setTopicStatus(nodeId, btn.dataset.mastery);
        updateStats();
        showNodeDetail(nodeId);
        renderGraph();
      });
    });

    // Setup data-action click handlers (替代 inline onclick，防止XSS)
    sheetContent.querySelectorAll('[data-action="select-node"]').forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => window._h5SelectNode(el.dataset.id));
    });
    sheetContent.querySelectorAll('[data-action="start-practice"]').forEach(el => {
      el.addEventListener('click', () => window._h5StartPractice(el.dataset.id));
    });
    sheetContent.querySelectorAll('[data-action="start-rcd"]').forEach(el => {
      el.addEventListener('click', () => window._h5StartRcd(el.dataset.id));
    });
    sheetContent.querySelectorAll('[data-action="view-path"]').forEach(el => {
      el.addEventListener('click', () => window._h5ViewPath(el.dataset.id));
    });

    // 增强字段交互（三级折叠提示 + 随堂小题）
    if (window.CNPT?.components?.bindEnhancedEvents) {
      CNPT.components.bindEnhancedEvents(sheetContent, topic);
    }

    sheet.classList.add('bs-open');
  }

  function setupSheet() {
    document.querySelector('.bs-handle-bar')?.addEventListener('click', () => {
      sheet.classList.remove('bs-open');
      selectedNodeId = null;
    });

    let startY = 0;
    sheet.addEventListener('touchstart', (e) => {
      if (e.target.closest('.bs-content')) return;
      startY = e.touches[0].clientY;
    }, { passive: true });

    sheet.addEventListener('touchmove', (e) => {
      if (e.target.closest('.bs-content')) return;
      const dy = e.touches[0].clientY - startY;
      if (dy > 80) sheet.classList.remove('bs-open');
    }, { passive: true });
  }

  // ==================== 根因回溯诊断（cn-math-taxonomy 借鉴） ====================
  function initRootCauseDiagnosis() {
    if (!window.CNPT.rootCause) return;
    rcdEngine = CNPT.rootCause.create('student');
    document.getElementById('btn-rcd')?.addEventListener('click', () => openRcdPicker());
    document.getElementById('rcd-close')?.addEventListener('click', closeRcd);
  }

  function openRcdPicker(presetId) {
    rcdSession = null;
    document.getElementById('rcd-title').textContent = '🔍 根因诊断';
    renderRcdPicker(presetId);
    document.getElementById('rcd-modal').classList.add('mo-open');
  }

  function closeRcd() {
    document.getElementById('rcd-modal').classList.remove('mo-open');
  }

  function renderRcdPicker(presetId) {
    const body = document.getElementById('rcd-body');
    const history = rcdEngine.getHistory();
    const candidates = [...CNPT.indices.getTopicMap().values()]
      .filter(t => !isTopicMastered(t.id))
      .slice(0, 12);
    body.innerHTML = `
      <div class="rcd-ai-note">🤖 诊断题多为 AI 生成初稿，未经学科教师逐条审核，结果仅供学习参考。</div>
      <div class="rcd-picker-tip">选一个你觉得“好像会了”的知识点测一测，找出真正卡住的“病根”。</div>
      <input class="rcd-search" id="rcd-search" type="text" placeholder="搜索知识点…" />
      <div class="rcd-cand-list" id="rcd-cand-list">
        ${candidates.map(t => `<button class="rcd-cand" data-id="${t.id}">${CNPT.utils.escapeHtml(t.name)}<span>${t.subject} · ${t.grade}年级</span></button>`).join('')}
      </div>
      ${history.length ? `<div class="rcd-history"><div class="rcd-history-title">最近诊断</div>${history.slice(0, 3).map(h => `<div class="rcd-history-item">🎯 ${CNPT.utils.escapeHtml((h.target && h.target.name) || '')} · 薄弱 ${h.statistics.weakCount} · 不稳 ${h.statistics.unstableCount}</div>`).join('')}</div>` : ''}
    `;
    const search = document.getElementById('rcd-search');
    const list = document.getElementById('rcd-cand-list');
    const renderList = (items) => {
      list.innerHTML = items.length
        ? items.map(t => `<button class="rcd-cand" data-id="${t.id}">${CNPT.utils.escapeHtml(t.name)}<span>${t.subject} · ${t.grade}年级</span></button>`).join('')
        : '<div class="rcd-empty">没有找到这个知识点</div>';
      list.querySelectorAll('.rcd-cand').forEach(btn => {
        btn.addEventListener('click', () => startRcdSession(btn.dataset.id));
      });
    };
    search.addEventListener('input', () => {
      const k = search.value.trim();
      const items = k
        ? [...CNPT.indices.getTopicMap().values()].filter(t => t.name && t.name.includes(k)).slice(0, 12)
        : candidates;
      renderList(items);
    });
    renderList(candidates);

    if (presetId) {
      const t = CNPT.indices.getTopicMap().get(presetId);
      if (t) {
        list.innerHTML = `<div class="rcd-preset">目标考点：<b>${CNPT.utils.escapeHtml(t.name)}</b>（${t.subject} · ${t.grade}年级）</div><button class="rcd-go" id="rcd-go">开始诊断 →</button>`;
        document.getElementById('rcd-go').addEventListener('click', () => startRcdSession(presetId));
      }
    }
  }

  function startRcdSession(targetId) {
    rcdSession = rcdEngine.start(targetId, {
      maxQuestions: 15,
      isMastered: (id) => isTopicMastered(id)
    });
    document.getElementById('rcd-title').textContent = '🔍 根因诊断';
    renderRcdQuestion();
  }

  function renderRcdQuestion() {
    const body = document.getElementById('rcd-body');
    const item = rcdEngine.next(rcdSession);
    if (!item) {
      renderRcdReport(rcdEngine.finish(rcdSession));
      return;
    }
    const q = item.question;
    const p = item.progress;
    body.innerHTML = `
      <div class="rcd-progress">第 ${p.answered + 1} 题 / 上限 ${p.limit} · 薄弱 ${p.weak} · 不稳 ${p.unstable}</div>
      ${item.type === 'confirm' ? '<div class="rcd-confirm-tag">确认题 · 再确认一次</div>' : ''}
      <div class="rcd-topic">${CNPT.utils.escapeHtml((item.topic && item.topic.name) || '')}<span>${(item.topic && item.topic.subject) || ''} · ${(item.topic && item.topic.grade) || ''}年级</span></div>
      <div class="practice-question">${CNPT.utils.escapeHtml(q.question)}</div>
      <div class="practice-options">
        ${q.options.map((opt, i) => `<button class="practice-option" data-idx="${i}">${String.fromCharCode(65 + i)}. ${CNPT.utils.escapeHtml(opt)}</button>`).join('')}
      </div>
      <div class="rcd-msg">${CNPT.utils.escapeHtml(item.message || '')}</div>
    `;
    body.querySelectorAll('.practice-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        const res = item.type === 'confirm'
          ? rcdEngine.answerConfirm(rcdSession, q.id, idx)
          : rcdEngine.answer(rcdSession, q.id, idx);
        btn.classList.add(res.correct ? 'po-correct' : 'po-wrong');
        body.querySelector('.rcd-msg').textContent = res.message || '';
        setTimeout(renderRcdQuestion, 650);
      });
    });
  }

  function renderRcdReport(report) {
    const body = document.getElementById('rcd-body');
    const s = report.statistics;
    const route = report.remedialPath || [];
    document.getElementById('rcd-title').textContent = '📋 诊断报告';
    body.innerHTML = `
      <div class="rcd-report">
        <div class="rcd-stats">
          <div><b>${s.totalQuestions}</b><span>已答</span></div>
          <div><b>${s.weakCount}</b><span>薄弱</span></div>
          <div><b>${s.unstableCount}</b><span>不稳</span></div>
          <div><b>${s.untestedCount}</b><span>未测</span></div>
        </div>
        <div class="rcd-block">
          <h4>🎯 根因盲区（优先补）</h4>
          ${report.rootCauses.length
            ? report.rootCauses.map(r => `<div class="rcd-item weak">🔴 ${CNPT.utils.escapeHtml(r.name)}<span>${r.subject} · ${r.grade}年级</span></div>`).join('')
            : '<div class="rcd-item">✅ 没发现薄弱根因，基础扎实！</div>'}
        </div>
        ${report.unstable.length ? `<div class="rcd-block"><h4>🟠 不稳（先巩固，不用回溯）</h4>${report.unstable.map(u => `<div class="rcd-item unstable">${CNPT.utils.escapeHtml(u.name)}<span>${u.subject} · ${u.grade}年级</span></div>`).join('')}</div>` : ''}
        ${route.length ? `<div class="rcd-block"><h4>🧩 根因路径图</h4><div class="rcd-graph">${rcdEngine.renderPathGraphSVG(report)}</div></div>` : ''}
        ${route.length ? `<div class="rcd-block"><h4>🗺️ 补学路线（按顺序）</h4>${route.map((p, i) => `<div class="rcd-item ${p.status}">${i + 1}. ${p.status === 'weak' ? '🔴' : '🟠'} ${CNPT.utils.escapeHtml(p.name)}<span>${p.subject} · ${p.grade}年级</span></div>`).join('')}</div>` : ''}
        <div class="rcd-actions">
          <button class="rcd-btn primary" id="rcd-start-learn">开始补学第一个</button>
          ${s.untestedCount > 0 ? '<button class="rcd-btn" id="rcd-retest">🧪 盲区再测</button>' : ''}
          <button class="rcd-btn" id="rcd-retry">🔁 重新诊断</button>
          <button class="rcd-btn" id="rcd-export">📤 导出 JSON</button>
          <button class="rcd-btn" id="rcd-back">← 换目标</button>
        </div>
      </div>
    `;
    document.getElementById('rcd-start-learn').addEventListener('click', () => {
      const first = route[0] || report.rootCauses[0];
      if (!first) { closeRcd(); return; }
      closeRcd();
      startPractice(first.topicId);
    });
    document.getElementById('rcd-retry').addEventListener('click', () => startRcdSession(report.target.topicId));
    const retestBtn = document.getElementById('rcd-retest');
    if (retestBtn) retestBtn.addEventListener('click', () => {
      const n = rcdEngine.expandUntested(rcdSession);
      if (!n) return;
      document.getElementById('rcd-title').textContent = '🔍 根因诊断';
      renderRcdQuestion();
    });
    document.getElementById('rcd-export').addEventListener('click', () => {
      const blob = new Blob([rcdEngine.exportReport(report)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `根因诊断-${report.target.name || report.target.topicId}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    document.getElementById('rcd-back').addEventListener('click', () => renderRcdPicker());
  }

  // ==================== 主题研修（国防/安全/意志） ====================
  function initThemeLearning() {
    if (!window.CNPT || !CNPT.themeLearning) return;
    themeEngine = CNPT.themeLearning.create('student');
    document.getElementById('btn-theme')?.addEventListener('click', openThemePicker);
    document.getElementById('theme-close')?.addEventListener('click', closeTheme);
  }

  function openThemePicker() {
    renderThemeList();
    document.getElementById('theme-title').textContent = '🎯 主题研修';
    document.getElementById('theme-modal').classList.add('mo-open');
  }

  function closeTheme() {
    document.getElementById('theme-modal').classList.remove('mo-open');
  }

  function themeStatusIcon(s) {
    return s === 'mastered' ? '✅' : s === 'learning' ? '📖' : '⚪';
  }

  function renderThemeList() {
    const body = document.getElementById('theme-body');
    const themes = themeEngine.list();
    body.innerHTML = '<div class="rcd-picker-tip">跨学科主题，把散落各科的知识点串成一条线（数据来自现有图谱挂接）。</div>' +
      themes.map(t => `<div class="rcd-cand" data-id="${t.id}">${t.icon} ${CNPT.utils.escapeHtml(t.name)}<span>${t.total} 个知识点 · 已掌握 ${t.mastered}/${t.total}</span></div>`).join('');
    body.querySelectorAll('[data-id]').forEach(el =>
      el.addEventListener('click', () => renderThemeDetail(el.dataset.id)));
  }

  function renderThemeDetail(id) {
    const theme = themeEngine.getTheme(id);
    if (!theme) return;
    document.getElementById('theme-title').textContent = `${theme.icon} ${theme.name}`;
    const path = themeEngine.buildThemePath(id);
    const stats = themeEngine.stats(id);
    const body = document.getElementById('theme-body');
    body.innerHTML = `
      <div class="rcd-ai-note">${CNPT.utils.escapeHtml(theme.intro)}</div>
      <div class="rcd-block"><h4>🎯 学习目标</h4>${(theme.objectives || []).map(o => `<div class="rcd-item">${CNPT.utils.escapeHtml(o)}</div>`).join('')}</div>
      <div class="rcd-block"><h4>🧩 学习路线（${path.length} 个知识点 · 已掌握 ${stats.mastered}）</h4>
        ${path.map((p, i) => `<div class="rcd-item ${p.status}">${i + 1}. ${themeStatusIcon(p.status)} ${CNPT.utils.escapeHtml(p.name)}<span>${p.subject} · ${p.grade}年级</span></div>`).join('')}</div>
      <div class="rcd-block"><h4>🧪 建议活动</h4>${(theme.activities || []).map(a => `<div class="rcd-item">${CNPT.utils.escapeHtml(a)}</div>`).join('')}</div>
      <div class="rcd-block"><h4>⚠️ 内容缺口（待补）</h4>${(theme.gaps || []).map(g => `<div class="rcd-item unstable">${CNPT.utils.escapeHtml(g)}</div>`).join('')}</div>
      <div class="rcd-actions">
        <button class="rcd-btn primary" id="theme-start">开始主题学习</button>
        <button class="rcd-btn" id="theme-back">← 返回</button>
      </div>`;
    document.getElementById('theme-back').addEventListener('click', renderThemeList);
    document.getElementById('theme-start').addEventListener('click', () => {
      const first = path.find(p => p.status !== 'mastered') || path[0];
      closeTheme();
      // 主题挂接点（多为道法/信息科技母点）常无随堂题，打开详情页查看内容与标记掌握
      if (first) setTimeout(() => showNodeDetail(first.id), 250);
    });
  }

  // ==================== Practice System ====================
    function startPractice(topicId) {
    const topicMap = CNPT.indices.getTopicMap();
    const topic = topicMap.get(topicId);
    if (!topic) return;

    closeSheet();

    // 标记本次学习类型（到期卡片 → 复习；否则 → 新学），用于 75 分钟预算统计
    if (window.CNPT.components.dailyPlan) {
      const st = fsrsEngine && fsrsEngine.getStatus(topicId);
      window.CNPT.components.dailyPlan.setSessionKind(st && st.isDue ? 'review' : 'new');
    }

    const modal = document.getElementById('practice-modal');
    const body = document.getElementById('practice-body');
    const title = document.getElementById('practice-title');

    title.textContent = `${topic.name} · 练习`;

    const questions = generateQuestions(topic);

    if (!questions.length) {
      body.innerHTML = '<div class="practice-result"><div class="pr-icon">😊</div><div class="pr-text">这个知识点暂时没有自动生成练习</div><div class="pr-sub">建议参考教材练习册</div></div>';
    } else {
      showQuestion(body, questions, 0, topic);
    }

    modal.classList.add('mo-open');
  }

  function generateQuestions(topic) {
    const questions = [];

    if (topic.commonMistakes && topic.commonMistakes.length) {
      topic.commonMistakes.forEach((mistake, i) => {
        if (i < 2) {
          questions.push({
            type: 'choice',
            question: `关于"${topic.name}"，下面哪个说法是正确的？`,
            options: [mistake, topic.evidence?.[0] || '以上都不对', '没有固定方法', '只需要死记硬背'],
            answer: 1
          });
        }
      });
    }

    if (topic.description) {
      questions.push({
        type: 'judge',
        question: `${topic.description.slice(0, 30)}... 这个说法对吗？`,
        answer: true
      });
    }

    if (topic.evidence && topic.evidence.length) {
      const ev = topic.evidence[0];
      if (ev.length > 5) {
        questions.push({
          type: 'fill',
          question: `请说出"${topic.name}"的掌握标准：`,
          keywords: ev.split('').filter((_, i) => i % 4 === 0).join('').slice(0, 4).split('')
        });
      }
    }

    return questions.slice(0, 3);
  }

  function showQuestion(container, questions, idx, topic) {
    if (idx >= questions.length) {
      container.innerHTML = `
        <div class="practice-result">
          <div class="pr-icon">🎉</div>
          <div class="pr-text pr-correct">练习完成！</div>
          <div class="pr-sub">已完成 ${questions.length} 道题目</div>
        </div>
      `;
      if (kidMode) CNPT.components.showStarBurst();
      return;
    }

    const q = questions[idx];
    let html = `<div class="practice-question">${idx + 1}. ${CNPT.utils.escapeHtml(q.question)}</div>`;

    // 作答前信心（用于 FSRS 信心校准；不选则默认 50）
    html += `
      <div class="pq-confidence">
        <span class="pq-conf-label">作答前信心</span>
        <button class="pq-conf" data-c="25">😕 没把握</button>
        <button class="pq-conf pq-conf-on" data-c="50">🤔 有点虚</button>
        <button class="pq-conf" data-c="75">🙂 有把握</button>
        <button class="pq-conf" data-c="100">🤩 很有把握</button>
      </div>`;

    if (q.type === 'choice') {
      html += '<div class="practice-options">';
      q.options.forEach((opt, i) => {
        html += `<button class="practice-option" data-idx="${i}">${String.fromCharCode(65+i)}. ${CNPT.utils.escapeHtml(opt)}</button>`;
      });
      html += '</div>';
    } else if (q.type === 'judge') {
      html += '<div class="practice-options">';
      html += '<button class="practice-option" data-idx="0">✓ 正确</button>';
      html += '<button class="practice-option" data-idx="1">✗ 错误</button>';
      html += '</div>';
    } else if (q.type === 'fill') {
      html += '<input type="text" class="practice-input" placeholder="输入答案...">';
      html += '<button class="practice-submit-btn">提交答案</button>';
    }

    container.innerHTML = html;
    container._cnptTopicId = topic.id;
    container._cnptReason = null;

    let confidence = 50;
    container.querySelectorAll('.pq-conf').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.pq-conf').forEach(b => b.classList.remove('pq-conf-on'));
        btn.classList.add('pq-conf-on');
        confidence = parseInt(btn.dataset.c, 10);
      });
    });

    /**
     * 作答后统一记录：FSRS（首做/复习分离 + 信心 + 错因）+ 错题本 + 统计
     */
    function answerOutcome(selected, correct, payload) {
      recordFsrsAnswer(topic, Object.assign({
        isCorrect: correct,
        isIndependent: true,          // 练习页未提供提示，均为独立作答
        confidence,
        questionInfo: {
          questionId: `${topic.id}-${idx}`,
          question: q.question,
          options: q.options || null,
          answer: q.answer,
          selected: selected
        }
      }, payload || {}));
      if (!correct) {
        recordWrong(topic, q.question, q.options?.[selected] || '', q.options?.[q.answer] || '正确说法');
        // 错题两步闭环第 1 步：登记当天重测
        if (diagEngine && !(payload && payload.skipRetest)) {
          diagEngine.registerWrong(topic, {
            questionId: `${topic.id}-${idx}`,
            question: q.question,
            options: q.options || null,
            answer: q.answer,
            selected
          });
        }
      }
      if (correct) {
        storage.addStar();
        if (kidMode) CNPT.components.showStarBurst();
      }
    }

    const opts = container.querySelectorAll('.practice-option');
    opts.forEach(opt => {
      opt.addEventListener('click', () => {
        const selected = parseInt(opt.dataset.idx);
        const correct = (q.type === 'judge') ? (selected === 0) : (selected === q.answer);

        opts.forEach(o => o.classList.remove('po-selected'));
        opt.classList.add('po-selected');

        setTimeout(() => {
          if (correct) {
            opt.classList.add('po-correct');
            answerOutcome(selected, true);
            CNPT.utils.showToast(kidMode ? '🎉 太棒了！' : '✅ 正确！');
            setTimeout(() => showQuestion(container, questions, idx + 1, topic), 800);
          } else {
            opt.classList.add('po-wrong');
            CNPT.utils.showToast(kidMode ? '💡 差一点哦~' : '❌ 再想想');
            // 错因探针：先选错因（可跳过），再进入下一题
            showReasonPicker(container, () => answerOutcome(selected, false, {
              reason: container._cnptReason || null,
              isLowLevel: container._cnptReason === 'LOW',
              lowLevelType: container._cnptLowType || null
            }));
          }
        }, 400);
      });
    });

    const submitBtn = container.querySelector('.practice-submit-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        const input = container.querySelector('.practice-input');
        const val = input.value.trim().toLowerCase();
        const keywords = q.keywords || [];
        const match = keywords.some(k => val.includes(k.toLowerCase()));

        if (match || val.length > 2) {
          answerOutcome(null, true, {
            questionInfo: {
              questionId: `${topic.id}-${idx}`,
              question: q.question,
              options: null,
              answer: q.keywords || null,
              selected: input.value.trim()
            }
          });
          CNPT.utils.showToast(kidMode ? '🎉 答对啦！' : '✅ 回答正确！');
          setTimeout(() => showQuestion(container, questions, idx + 1, topic), 800);
        } else {
          CNPT.utils.showToast('💡 再仔细想想');
        }
      });
    }
  }

  /**
   * 错因探针（P01-P11 + 低级失误）：答错后先定位错因，再进入下一题
   * 选“低级失误”会同时写入独立的低级失误台账
   */
  function showReasonPicker(container, done) {
    const reasons = window.CNPT.fsrs && CNPT.fsrs.buildReasonOptions
      ? CNPT.fsrs.buildReasonOptions()
      : [];
    if (!reasons.length) { done(); return; }

    const picker = document.createElement('div');
    picker.className = 'pq-reason';
    picker.innerHTML = `
      <div class="pq-reason-title">🤔 这一步卡在哪？（选错因能帮你下次避坑）</div>
      <div class="pq-reason-grid">
        ${reasons.map(r => `<button class="pq-reason-btn" data-reason="${r.value}">${r.label}</button>`).join('')}
      </div>
      <button class="pq-reason-skip">跳过，直接看下一题 →</button>
    `;
    container.appendChild(picker);

    picker.querySelectorAll('[data-reason]').forEach(btn => {
      btn.addEventListener('click', () => {
        const reason = btn.dataset.reason;
        if (reason === 'LOW') {
          // 低级失误二级选择：单独台账，便于针对性改习惯
          const types = (window.CNPT.fsrs && CNPT.fsrs.LOW_LEVEL_TYPES) || ['未分类'];
          picker.innerHTML = `
            <div class="pq-reason-title">🤔 哪一类低级失误？（单独记账，先改习惯再谈正确率）</div>
            <div class="pq-reason-grid">
              ${types.map(t => `<button class="pq-reason-btn" data-low="${t}">${t}</button>`).join('')}
            </div>
            <button class="pq-reason-skip">跳过，直接看下一题 →</button>
          `;
          picker.querySelectorAll('[data-low]').forEach(b => {
            b.addEventListener('click', () => {
              container._cnptReason = 'LOW';
              container._cnptLowType = b.dataset.low;
              picker.remove();
              done();
            });
          });
          picker.querySelector('.pq-reason-skip').addEventListener('click', () => {
            container._cnptReason = 'LOW';
            picker.remove();
            done();
          });
          return;
        }
        container._cnptReason = reason;
        picker.remove();
        done();
      });
    });
    picker.querySelector('.pq-reason-skip').addEventListener('click', () => {
      picker.remove();
      done();
    });
  }

  function recordWrong(topic, question, userAnswer, correctAnswer) {
    storage.addWrongItem({
      topicId: topic.id,
      topicName: topic.name,
      question,
      userAnswer,
      correctAnswer,
      timestamp: Date.now()
    });
    updateWrongBook();
    updateStats();
  }

  // ==================== Learning Path (使用CNPT.path) ====================
  function viewPath(topicId) {
    const path = CNPT.path.buildLearningPath(topicId, { maxNodes: 20 });
    const container = document.getElementById('learning-path-list');
    if (!container) return;

    closeSheet();
    switchView('learn');

    if (!path.length) {
      container.innerHTML = '<div class="empty-state">暂无推荐路径</div>';
      return;
    }

    const masteryData = storage.getMastery();
    container.innerHTML = path.map((t, i) => {
      const status = masteryData[t.id];
      const icon = status === 'mastered' ? '✅' : status === 'learning' ? '📖' : '⏳';
      return `
        <div class="lp-item" data-action="focus-node" data-id="${t.id}">
          <div class="lp-num">${i + 1}</div>
          <div class="lp-info">
            <div class="lp-name">${CNPT.utils.escapeHtml(t.name)}</div>
            <div class="lp-meta">${t.subject} · ${t.grade}年级${t.term || ''}</div>
          </div>
          <div class="lp-status">${icon}</div>
        </div>
      `;
    }).join('');
    container.querySelectorAll('[data-action="focus-node"]').forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => window._h5FocusNode(el.dataset.id));
    });
  }

  function updateLearningPath() {
    const container = document.getElementById('learning-path-list');
    if (!container) return;

    if (currentSubject === 'all') {
      container.innerHTML = '<div class="empty-state">请先选择学科和年级，系统会为你生成学习路径</div>';
      return;
    }

    const masteryData = storage.getMastery();
    const grade = currentGrade !== 'all' ? parseInt(currentGrade) : undefined;
    const path = CNPT.path.buildSubjectPath(grade, currentSubject, {
      maxNodes: 15, excludeMastered: true, masteryData
    });

    if (!path.length) {
      container.innerHTML = '<div class="empty-state">🎉 太棒了！所有知识点都已掌握！</div>';
      return;
    }

    container.innerHTML = path.map((t, i) => {
      const status = masteryData[t.id];
      const icon = status === 'mastered' ? '✅' : status === 'learning' ? '📖' : '⏳';
      return `
        <div class="lp-item" data-action="focus-node" data-id="${t.id}">
          <div class="lp-num">${i + 1}</div>
          <div class="lp-info">
            <div class="lp-name">${CNPT.utils.escapeHtml(t.name)}</div>
            <div class="lp-meta">${t.subject} · ${t.grade}年级${t.term || ''} · ${CNPT.constants.DIFFICULTY(t.difficulty || 3)}</div>
          </div>
          <div class="lp-status">${icon}</div>
        </div>
      `;
    }).join('');
    container.querySelectorAll('[data-action="focus-node"]').forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => window._h5FocusNode(el.dataset.id));
    });
  }

  // ==================== Wrong Book ====================
  function updateWrongBook() {
    const container = document.getElementById('wrong-book-list');
    if (!container) return;

    const wrongBook = storage.getWrongBook();

    if (!wrongBook.length) {
      container.innerHTML = '<div class="empty-state">还没有错题记录，去练习吧！</div>';
      return;
    }

    container.innerHTML = wrongBook.slice(0, 20).map(w => `
      <div class="wb-item" data-action="focus-node" data-id="${w.topicId}">
        <div class="wb-q">📝 ${CNPT.utils.escapeHtml(w.question)}</div>
        <div class="wb-a">❌ ${CNPT.utils.escapeHtml(w.userAnswer)} → ✅ ${CNPT.utils.escapeHtml(w.correctAnswer)}</div>
        <div class="wb-topic">${CNPT.utils.escapeHtml(w.topicName)}</div>
      </div>
    `).join('');
    container.querySelectorAll('[data-action="focus-node"]').forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => window._h5FocusNode(el.dataset.id));
    });
  }

  // ==================== Search (使用CNPT.search) ====================
  function setupSearch() {
    const input = document.getElementById('search-input');
    const clear = document.getElementById('search-clear');
    const cancel = document.getElementById('search-cancel');
    const results = document.getElementById('search-results');

    input?.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      clear.style.display = q ? 'block' : 'none';

      if (!q) {
        results.innerHTML = '';
        return;
      }

      const searchResults = CNPT.search.search(q, { limit: 30 });

      results.innerHTML = searchResults.map(({ topic }) => `
        <div class="sr-item" data-action="focus-node-and-close" data-id="${topic.id}">
          <div class="sr-dot" style="background:${CNPT.constants.COLORS[topic.subject] || '#888'}"></div>
          <div class="sr-info">
            <div class="sr-name">${CNPT.utils.escapeHtml(topic.name)}</div>
            <div class="sr-meta">${topic.subject} · ${topic.grade}年级${topic.term || ''}${topic.subnodeType ? ' · ' + CNPT.utils.escapeHtml(topic.subnodeType) : ''}</div>
          </div>
        </div>
      `).join('');
      results.querySelectorAll('[data-action="focus-node-and-close"]').forEach(el => {
        el.style.cursor = 'pointer';
        el.addEventListener('click', () => {
          window._h5FocusNode(el.dataset.id);
          document.getElementById('search-cancel')?.click();
        });
      });
    });

    clear?.addEventListener('click', () => {
      input.value = '';
      results.innerHTML = '';
      clear.style.display = 'none';
      input.focus();
    });

    cancel?.addEventListener('click', () => {
      switchView('graph');
    });

    document.querySelectorAll('.sh-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const q = chip.dataset.q;
        input.value = q;
        input.dispatchEvent(new Event('input'));
      });
    });
  }

  // ==================== Filter Panel ====================
  function setupFilter() {
    const panel = document.getElementById('filter-panel');
    const closeBtn = document.getElementById('filter-close');
    const reset = document.getElementById('filter-reset');
    const apply = document.getElementById('filter-apply');
    const btnFilter = document.getElementById('btn-filter');

    btnFilter?.addEventListener('click', () => {
      panel.classList.add('fp-open');
      renderFilterOptions();
    });

    closeBtn?.addEventListener('click', () => panel.classList.remove('fp-open'));
    reset?.addEventListener('click', () => {
      currentGrade = 'all';
      currentSubject = 'all';
      currentTextbook = 'all';
      currentLayer = 'core';
      applyFilters();
    });
    apply?.addEventListener('click', () => {
      panel.classList.remove('fp-open');
      applyFilters();
      updateLearningPath();
    });

    document.querySelectorAll('#filter-layers .fp-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#filter-layers .fp-opt-btn').forEach(b => b.classList.remove('fp-active'));
        btn.classList.add('fp-active');
        currentLayer = btn.dataset.value;
      });
    });
  }

  function renderFilterOptions() {
    const gradeContainer = document.getElementById('filter-grades');
    const grades = [...new Set(fullData.topics.topics.map(t => t.grade))].sort((a, b) => a - b);
    gradeContainer.innerHTML = `
      <button class="fp-opt-btn ${currentGrade === 'all' ? 'fp-active' : ''}" data-type="grade" data-value="all">全部</button>
      ${grades.map(g => `<button class="fp-opt-btn ${currentGrade === String(g) ? 'fp-active' : ''}" data-type="grade" data-value="${g}">${g}年级</button>`).join('')}
    `;

    const subjContainer = document.getElementById('filter-subjects');
    const subjects = [...new Set(fullData.topics.topics.map(t => t.subject))];
    subjContainer.innerHTML = `
      <button class="fp-opt-btn ${currentSubject === 'all' ? 'fp-active' : ''}" data-type="subject" data-value="all">全部</button>
      ${subjects.map(s => `<button class="fp-opt-btn ${currentSubject === s ? 'fp-active' : ''}" data-type="subject" data-value="${s}">${s}</button>`).join('')}
    `;

    const tbContainer = document.getElementById('filter-textbooks');
    const textbooks = [...new Set(fullData.topics.topics.map(t => t.textbook || '未标注版本'))];
    tbContainer.innerHTML = `
      <button class="fp-opt-btn ${currentTextbook === 'all' ? 'fp-active' : ''}" data-type="textbook" data-value="all">全部</button>
      ${textbooks.map(t => `<button class="fp-opt-btn ${currentTextbook === t ? 'fp-active' : ''}" data-type="textbook" data-value="${t}">${t}</button>`).join('')}
    `;

    document.querySelectorAll('.fp-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        const val = btn.dataset.value;
        if (type === 'grade') currentGrade = val;
        else if (type === 'subject') currentSubject = val;
        else if (type === 'textbook') currentTextbook = val;
        renderFilterOptions();
      });
    });

    updateFilterCount(getFilteredTopics().length);
  }

  function updateFilterCount(count) {
    const el = document.getElementById('filter-count');
    if (el) el.textContent = count;
  }

  // ==================== Subject Quick Grid ====================
  function setupSubjectQuickGrid() {
    const container = document.querySelector('.sqg-inner');
    if (!container) return;

    const subjects = [...new Set(fullData.topics.topics.map(t => t.subject))];
    container.innerHTML = subjects.map(s => {
      const color = CNPT.constants.COLORS[s] || '#888';
      return `
      <div class="sqg-item" data-action="select-subject" data-value="${s}" style="border-left:3px solid ${color}">
        <div class="sqg-dot" style="background:${color}"></div>
        <span>${s}</span>
      </div>
    `}).join('');
    container.querySelectorAll('[data-action="select-subject"]').forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => window._h5SelectSubject(el.dataset.value));
    });
  }

  // ==================== Top Navigation ====================
  function setupUI() {
    document.querySelectorAll('#quick-filter-bar .qf-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#quick-filter-bar .qf-chip').forEach(b => b.classList.remove('qf-active'));
        btn.classList.add('qf-active');
        currentGrade = btn.dataset.grade;
        applyFilters();
        updateLearningPath();
      });
    });

    document.querySelectorAll('#qf-subjects .qf-chip-sub').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#qf-subjects .qf-chip-sub').forEach(b => b.classList.remove('qf-active'));
        btn.classList.add('qf-active');
        currentSubject = btn.dataset.subject;
        applyFilters();
        updateLearningPath();
      });
    });

    document.getElementById('btn-search')?.addEventListener('click', () => switchView('search'));

    document.getElementById('btn-assistant-fab')?.addEventListener('click', () => {
      document.getElementById('assistant-modal')?.classList.add('mo-open');
    });
  }

  function updateSubjectFilter() {
    const container = document.getElementById('qf-subjects');
    if (!container || !fullData.topics) return;

    const subjects = [...new Set(fullData.topics.topics.map(t => t.subject))];
    container.innerHTML = `
      <button class="qf-chip-sub qf-active" data-subject="all">全部</button>
      ${subjects.map(s => `<button class="qf-chip-sub" data-subject="${s}" style="border:1px solid ${CNPT.constants.COLORS[s] || '#888'}40">${s}</button>`).join('')}
    `;

    container.querySelectorAll('.qf-chip-sub').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.qf-chip-sub').forEach(b => b.classList.remove('qf-active'));
        btn.classList.add('qf-active');
        currentSubject = btn.dataset.subject;
        applyFilters();
        updateLearningPath();
      });
    });
  }

  // ==================== Bottom Navigation ====================
  function setupBottomNav() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const view = item.dataset.view;
        switchView(view);
      });
    });
  }

  function switchView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('view-active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('nav-active'));

    if (viewName === 'graph') {
      document.getElementById('view-graph').classList.add('view-active');
      document.querySelector('[data-view="graph"]')?.classList.add('nav-active');
      document.getElementById('app-header').style.display = 'flex';
      renderGraph();
    } else if (viewName === 'search') {
      document.getElementById('view-search').classList.add('view-active');
      document.querySelector('[data-view="search"]')?.classList.add('nav-active');
      document.getElementById('app-header').style.display = 'none';
      setTimeout(() => document.getElementById('search-input')?.focus(), 100);
    } else if (viewName === 'learn') {
      document.getElementById('view-learn').classList.add('view-active');
      document.querySelector('[data-view="learn"]')?.classList.add('nav-active');
      document.getElementById('app-header').style.display = 'none';
      updateLearningPath();
      updateWrongBook();
      refreshDailyPlan();
    } else if (viewName === 'mine') {
      document.getElementById('view-mine').classList.add('view-active');
      document.querySelector('[data-view="mine"]')?.classList.add('nav-active');
      document.getElementById('app-header').style.display = 'none';
      updateMineView();
    }
  }

  // ==================== Mine View ====================
  function updateMineView() {
    const stats = storage.getStats();
    const days = storage.getConsecutiveDays();

    document.getElementById('ms-total-mastered').textContent = stats.mastered;
    document.getElementById('ms-total-stars').textContent = storage.getStars();
    document.getElementById('ms-total-days').textContent = days;

    document.querySelectorAll('.mm-item').forEach(item => {
      item.addEventListener('click', () => {
        const action = item.dataset.action;
        if (action === 'kid-mode') toggleKidMode();
        else if (action === 'reset') resetProgress();
        else if (action === 'about') showAbout();
      });
    });
  }

  function toggleKidMode() {
    kidMode = !kidMode;
    localStorage.setItem('cnpt-h5-kid-mode', kidMode.toString());
    document.body.classList.toggle('kid-mode', kidMode);
    CNPT.utils.showToast(kidMode ? '🧒 小伙伴模式已开启！' : '👨‍👧 已切换回家长模式');
  }

  function resetProgress() {
    if (confirm('确定要重置所有学习进度吗？此操作不可撤销。')) {
      storage.resetAll();
      updateStats();
      updateLearningPath();
      updateWrongBook();
      renderGraph();
      CNPT.utils.showToast('已重置学习进度');
    }
  }

  function showAbout() {
    CNPT.utils.showToast('CN-Primary-Taxonomy v0.9 · 4275个知识点');
  }

  // ==================== Stats ====================
  function updateStats() {
    const stats = storage.getStats();
    const total = fullData.topics?.topics.length || 4275;

    const elM = document.getElementById('ls-mastered');
    const elL = document.getElementById('ls-learning');
    const elR = document.getElementById('ls-remaining');
    const elW = document.getElementById('ls-wrong');

    if (elM) elM.textContent = stats.mastered;
    if (elL) elL.textContent = stats.learning;
    if (elR) elR.textContent = total - stats.mastered;
    if (elW) elW.textContent = stats.wrongCount;
  }

  // ==================== Modals ====================
  function setupModals() {
    document.getElementById('practice-close')?.addEventListener('click', () => {
      document.getElementById('practice-modal')?.classList.remove('mo-open');
    });
    document.getElementById('assistant-close')?.addEventListener('click', () => {
      document.getElementById('assistant-modal')?.classList.remove('mo-open');
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('mo-open');
      });
    });

    const sendBtn = document.getElementById('assistant-send');
    sendBtn?.addEventListener('click', () => {
      const query = document.getElementById('assistant-query').value;
      runAssistantH5(query);
    });

    document.querySelectorAll('.ac-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.getElementById('assistant-query').value = chip.dataset.q;
        runAssistantH5(chip.dataset.q);
      });
    });
  }

  function closeSheet() {
    sheet.classList.remove('bs-open');
  }

  // ==================== Assistant ====================
  function runAssistantH5(query) {
    const resultContainer = document.getElementById('assistant-result');
    if (!query || !query.trim()) {
      resultContainer.innerHTML = '<div class="ar-muted">请输入孩子当前遇到的问题</div>';
      return;
    }

    const q = query.toLowerCase();
    const ranked = CNPT.search.search(q, { limit: 5 });

    if (!ranked.length) {
      resultContainer.innerHTML = '<div class="ar-muted">没有匹配到相关知识点，试试更具体的关键词</div>';
      return;
    }

    const target = ranked[0].topic;
    const path = CNPT.path.buildLearningPath(target.id, { maxNodes: 6 });
    const direct = CNPT.path.getHardPrerequisites(target.id).map(i => i.topic);
    const actions = [...(target.practiceChain || []), ...(target.assessmentTasks || []), ...(target.evidence || [])].filter(Boolean).slice(0, 3);
    const evidence = target.evidence?.[0] || '能独立完成相关题目';
    const mistake = target.commonMistakes?.[0];

    resultContainer.innerHTML = `
      <div class="ar-card"><strong>定位知识点：</strong>${target.subject} · ${CNPT.utils.escapeHtml(target.name)}</div>
      <div class="ar-card"><strong>为什么先看这里：</strong>${direct.length ? `连着 ${direct.slice(0,2).map(t=>'「'+CNPT.utils.escapeHtml(t.name)+'」').join('、')}等基础点` : '没有明显前置门槛，可直接开始'}</div>
      <div class="ar-card"><strong>优先先补：</strong>${direct.length ? direct.map(t => CNPT.utils.escapeHtml(t.name)).join('、') : '可直接从当前点开始'}</div>
      <div class="ar-card"><strong>这周可以先做：</strong><br>${actions.map(a => `• ${CNPT.utils.escapeHtml(a)}`).join('<br>')}</div>
      <div class="ar-card"><strong>补到什么程度算有起色：</strong>${CNPT.utils.escapeHtml(evidence)}</div>
      ${mistake ? `<div class="ar-card"><strong>注意:</strong>${CNPT.utils.escapeHtml(mistake)}</div>` : ''}
      <div style="margin-top:8px"><strong>建议学习顺序：</strong></div>
      ${path.map((t, i) => `<a class="ar-path" href="javascript:void(0)" data-action="focus-node-and-close" data-id="${t.id}">${i+1}. ${CNPT.utils.escapeHtml(t.name)} · ${t.subject} · ${t.grade}年级</a>`).join('')}
    `;
    // Setup path click handlers
    resultContainer.querySelectorAll('[data-action="focus-node-and-close"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        window._h5FocusNode(el.dataset.id);
        document.getElementById('assistant-close')?.click();
      });
    });
  }

  // showStarBurst 已移至共享组件 CNPT.components.showStarBurst

  // ==================== Global Exports (for inline handlers) ====================
  window._h5SelectNode = function(id) { showNodeDetail(id); };
  window._h5FocusNode = function(id) {
    const topicMap = CNPT.indices.getTopicMap();
    const topic = topicMap.get(id);
    if (!topic) return;
    currentGrade = String(topic.grade);
    currentSubject = topic.subject;

    document.querySelectorAll('#quick-filter-bar .qf-chip').forEach(b => {
      b.classList.toggle('qf-active', b.dataset.grade === currentGrade);
    });
    document.querySelectorAll('#qf-subjects .qf-chip-sub').forEach(b => {
      b.classList.toggle('qf-active', b.dataset.subject === currentSubject);
    });

    switchView('graph');
    applyFilters();

    setTimeout(() => {
      selectedNodeId = id;
      showNodeDetail(id);
    }, 500);
  };
  window._h5SelectSubject = function(s) {
    currentSubject = s;
    document.querySelectorAll('#qf-subjects .qf-chip-sub').forEach(b => {
      b.classList.toggle('qf-active', b.dataset.subject === s);
    });
    applyFilters();
  };
  window._h5StartPractice = function(id) { startPractice(id); };
  window._h5StartRcd = function(id) { openRcdPicker(id); };
  window._h5ViewPath = function(id) { viewPath(id); };

  // ==================== Start ============