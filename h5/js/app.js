/*!
 * 中国小学教育知识图谱 · H5 主应用
 * CN-Primary-Taxonomy · Mobile H5 Edition
 * Canvas高性能渲染 + 触摸手势 + 移动端原生体验
 */
(function() {
  'use strict';

  // ==================== Constants ====================
  const COLORS = {
    '语文':'#e74c3c','数学':'#3498db','英语':'#1abc9c','科学':'#2ecc71',
    '道德与法治':'#f39c12','劳动':'#9b59b6','体育与健康':'#e67e22','美术':'#fd79a8',
    '音乐':'#a29bfe','信息科技':'#00cec9','AI素养':'#00cec9'
  };
  const STORAGE_KEY = 'cnpt-h5-mastery';
  const WRONG_BOOK_KEY = 'cnpt-h5-wrong-book';
  const STARS_KEY = 'cnpt-h5-stars';
  const LAST_VISIT_KEY = 'cnpt-h5-last-visit';
  const KID_MODE_KEY = 'cnpt-h5-kid-mode';

  // ==================== State ====================
  let fullData = { topics: null, deps: null, clusters: null };
  let topicMap = new Map();
  let incomingMap = new Map();
  let outgoingMap = new Map();
  let topicSearchTextMap = new Map();
  
  let currentGrade = 'all';
  let currentSubject = 'all';
  let currentTextbook = 'all';
  let currentLayer = 'core';
  
  let masteryData = {};
  let wrongBook = [];
  let stars = 0;
  let kidMode = false;
  
  // Graph rendering state
  let canvasW = 0, canvasH = 0;
  let dpr = 1;
  let transform = { x: 0, y: 0, k: 1 };
  let visibleNodes = [];
  let visibleLinks = [];
  let hoveredNode = null;
  let animationFrameId = null;
  
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

  // ==================== Initialization ====================
  async function init() {
    canvas = document.getElementById('graph-canvas');
    ctx = canvas.getContext('2d');
    container = document.getElementById('graph-container');
    sheet = document.getElementById('node-detail-sheet');
    sheetContent = document.getElementById('node-detail-content');
    toast = document.getElementById('toast');

    loadStorage();
    setupCanvas();
    setupGestures();
    setupUI();
    setupBottomNav();
    setupSearch();
    setupFilter();
    setupSheet();
    setupModals();
    setupSubjectQuickGrid();

    try {
      await loadData();
      buildIndices();
      updateSubjectFilter();
      applyFilters();
      updateStats();
      updateLearningPath();
      updateWrongBook();
      
      // Show hint then hide
      setTimeout(() => {
        document.getElementById('graph-hint')?.classList.add('hint-hidden');
      }, 4000);
    } catch (err) {
      console.error('加载数据失败:', err);
      showToast('数据加载失败，请刷新重试');
    }

    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibilityChange);
  }

  // ==================== Data Loading ====================
  async function loadData() {
    const embedded = window.__CNPT_EMBEDDED;
    
    if (embedded && embedded.topics && embedded.dependencies) {
      fullData.topics = embedded.topics;
      fullData.deps = embedded.dependencies;
      fullData.clusters = embedded.clusters || { clusters: [] };
      return;
    }

    // Fallback: fetch from data directory
    const [topics, deps, clusters] = await Promise.all([
      fetch('../data/topics.json').then(r => r.json()),
      fetch('../data/dependencies.json').then(r => r.json()),
      fetch('../data/clusters.json').then(r => r.json()).catch(() => ({ clusters: [] }))
    ]);
    fullData = { topics, deps, clusters };
  }

  // ==================== Index Building ====================
  function buildIndices() {
    const topics = fullData.topics.topics;
    topicMap = new Map(topics.map(t => [t.id, t]));
    incomingMap = new Map();
    outgoingMap = new Map();
    topicSearchTextMap = new Map();

    topics.forEach(t => {
      incomingMap.set(t.id, []);
      outgoingMap.set(t.id, []);
      const searchText = [
        t.name, t.domain || '', t.description || '', t.subject, t.textbook || '',
        t.volume || '', t.unit || '', t.chapter || '', t.lesson || '', t.module || '',
        t.subnodeType || '', t.pageRange || '',
        ...(t.practiceChain || []), ...(t.assessmentTasks || [])
      ].join(' ').toLowerCase();
      topicSearchTextMap.set(t.id, searchText);
    });

    fullData.deps.dependencies.forEach(dep => {
      const edge = { source: dep.prerequisiteId, target: dep.topicId, strength: dep.strength, reason: dep.reason };
      if (incomingMap.has(dep.topicId)) incomingMap.get(dep.topicId).push(edge);
      if (outgoingMap.has(dep.prerequisiteId)) outgoingMap.get(dep.prerequisiteId).push(edge);
    });
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

  // ==================== Storage ====================
  function loadStorage() {
    try {
      masteryData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      wrongBook = JSON.parse(localStorage.getItem(WRONG_BOOK_KEY) || '[]');
      stars = parseInt(localStorage.getItem(STARS_KEY) || '0');
      kidMode = localStorage.getItem(KID_MODE_KEY) === 'true';
    } catch(e) { 
      masteryData = {}; wrongBook = []; stars = 0;
    }
    
    if (kidMode) document.body.classList.add('kid-mode');
    
    // Update consecutive days
    updateConsecutiveDays();
  }

  function updateConsecutiveDays() {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
    let days = parseInt(localStorage.getItem('cnpt-h5-days') || '0');
    
    if (lastVisit !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (lastVisit === yesterday) {
        days++;
      } else if (lastVisit !== today) {
        days = 1;
      }
      localStorage.setItem(LAST_VISIT_KEY, today);
      localStorage.setItem('cnpt-h5-days', days.toString());
    }
  }

  function saveMastery() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(masteryData));
  }

  function saveWrongBook() {
    localStorage.setItem(WRONG_BOOK_KEY, JSON.stringify(wrongBook));
  }

  // ==================== Filtering ====================
  function getFilteredTopics() {
    const topics = fullData.topics.topics;
    return topics.filter(t => {
      if (currentGrade !== 'all' && t.grade !== parseInt(currentGrade)) return false;
      if (currentSubject !== 'all' && t.subject !== currentSubject) return false;
      if (currentTextbook !== 'all' && (t.textbook || '未标注版本') !== currentTextbook) return false;
      if (currentLayer === 'core' && t.parentTopicId) return false;
      return true;
    });
  }

  function applyFilters() {
    if (!fullData.topics) return;
    
    const filtered = getFilteredTopics();
    const limit = 500;
    
    if (filtered.length > limit) {
      visibleNodes = filtered.slice(0, limit);
    } else {
      visibleNodes = filtered;
    }

    const visibleIds = new Set(visibleNodes.map(n => n.id));
    visibleLinks = fullData.deps.dependencies.filter(
      d => visibleIds.has(d.topicId) && visibleIds.has(d.prerequisiteId)
    ).map(d => ({ source: d.prerequisiteId, target: d.topicId, strength: d.strength, reason: d.reason }));

    updateFilterCount(filtered.length);
    initSimulation();
    renderGraph();
    updateGraphStatus();
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
    
    // Run simulation for a limited time
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
      // Apply velocity
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

  // ==================== Graph Rendering ====================
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
    simulationNodes.forEach(node => {
      const topic = topicMap.get(node.id);
      if (!topic) return;
      
      const status = masteryData[node.id];
      const fillColor = status === 'mastered' ? '#2ecc71' : 
                       status === 'learning' ? '#f39c12' : 
                       (COLORS[topic.subject] || '#888');
      
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

  // ==================== Touch Gestures ====================
  let touches = [];
  let lastTap = 0;
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
    canvas.addEventListener('click', onCanvasClick);
  }

  function onTouchStart(e) {
    e.preventDefault();
    touches = Array.from(e.touches);
    
    if (touches.length === 1) {
      isDragging = true;
      dragStartPos = { x: touches[0].clientX, y: touches[0].clientY };
      startTransform = { ...transform };
      
      // Check if touching a node
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
        // Move node
        const idx = simulationNodes.findIndex(n => n.id === dragNode);
        if (idx >= 0) {
          simulationNodes[idx].x = (touches[0].clientX - transform.x) / transform.k;
          simulationNodes[idx].y = (touches[0].clientY - transform.y) / transform.k;
        }
      } else {
        // Pan
        transform.x = startTransform.x + dx;
        transform.y = startTransform.y + dy;
      }
      renderGraph();
      
      // Update hovered node
      const pos = screenToWorld(touches[0].clientX, touches[0].clientY);
      hoveredNode = findNodeAt(pos.x, pos.y);
    } else if (touches.length === 2) {
      // Pinch zoom
      const dist = getTouchDist(touches[0], touches[1]);
      const midpoint = getTouchMidpoint(touches[0], touches[1]);
      
      if (lastPanDist > 0) {
        const scale = dist / lastPanDist;
        const newK = Math.max(0.3, Math.min(4, transform.k * scale));
        
        // Zoom around midpoint
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
    const now = Date.now();
    
    if (dragNode && isDragging) {
      // Single tap on node -> show detail
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

  // Mouse events for desktop testing
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

  function onCanvasClick(e) {
    // Handled in mouseup/touchend
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

  function showNodeDetail(nodeId) {
    selectedNodeId = nodeId;
    const topic = topicMap.get(nodeId);
    if (!topic) return;

    const status = masteryData[nodeId] || 'not-started';
    const prereqs = (incomingMap.get(nodeId) || []).map(e => ({ topic: topicMap.get(e.source), link: e })).filter(i => i.topic);
    const succs = (outgoingMap.get(nodeId) || []).map(e => ({ topic: topicMap.get(e.target), link: e })).filter(i => i.topic);
    const hardPrereqs = prereqs.filter(i => i.link.strength === 'hard');
    const softPrereqs = prereqs.filter(i => i.link.strength === 'soft');

    const tags = [
      `<span class="bs-tag" style="background:${COLORS[topic.subject]}20;color:${COLORS[topic.subject]}">${topic.subject}</span>`,
      `<span class="bs-tag" style="background:rgba(0,0,0,0.05);color:#666">${topic.domain || ''}</span>`,
      `<span class="bs-tag" style="background:rgba(0,0,0,0.05);color:#666">${topic.grade}年级${topic.term}</span>`,
      `<span class="bs-tag" style="background:rgba(255,200,0,0.15);color:#f39c12">难度 ${'★'.repeat(topic.difficulty || 3)}</span>`
    ].join('');

    const coachText = buildCoachText(topic, hardPrereqs, succs);

    sheetContent.innerHTML = `
      <h2>${topic.name}</h2>
      <div class="bs-meta">${topic.id} · ${topic.textbook || ''}${topic.unit ? ' · ' + topic.unit : ''}</div>
      <div class="bs-tags">${tags}</div>
      <div class="bs-desc">${topic.description || '暂无描述'}</div>
      
      <div class="bs-mastery-row">
        <button class="bs-mastery-btn ${status === 'mastered' ? 'm-active' : ''}" data-mastery="mastered">✅ 已掌握</button>
        <button class="bs-mastery-btn ${status === 'learning' ? 'm-active' : ''}" data-mastery="learning">📖 学习中</button>
        <button class="bs-mastery-btn ${status === 'not-started' ? 'm-active' : ''}" data-mastery="not-started">⏳ 未开始</button>
      </div>

      <div class="bs-coach-box">${coachText}</div>

      <h3>✓ 掌握标准</h3>
      <ul class="bs-list">${(topic.evidence || []).map(e => `<li>${e}</li>`).join('') || '<li style="color:#999">暂无</li>'}</ul>

      ${(topic.commonMistakes && topic.commonMistakes.length) ? `
        <h3>⚠️ 易错点</h3>
        <ul class="bs-list">${topic.commonMistakes.map(e => `<li>${e}</li>`).join('')}</ul>
      ` : ''}

      ${hardPrereqs.length ? `
        <h3>🔴 必须先补</h3>
        ${hardPrereqs.map(i => `<div class="bs-chain-item hard" onclick="window._h5SelectNode('${i.topic.id}')"><span class="chain-arrow">🔴</span><b>${i.topic.name}</b><br><span style="color:#999;font-size:11px">${i.link.reason || ''}</span></div>`).join('')}
      ` : ''}

      ${softPrereqs.length ? `
        <h3>🟡 建议先补</h3>
        ${softPrereqs.map(i => `<div class="bs-chain-item soft" onclick="window._h5SelectNode('${i.topic.id}')"><span class="chain-arrow">🟡</span><b>${i.topic.name}</b><br><span style="color:#999;font-size:11px">${i.link.reason || ''}</span></div>`).join('')}
      ` : ''}

      <div class="bs-actions">
        <button class="bs-action-btn primary" onclick="window._h5StartPractice('${topic.id}')">📝 练习题</button>
        <button class="bs-action-btn secondary" onclick="window._h5ViewPath('${topic.id}')">🛤️ 学习路径</button>
      </div>
    `;

    // Setup mastery buttons
    sheetContent.querySelectorAll('.bs-mastery-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const newStatus = btn.dataset.mastery;
        if (newStatus === 'not-started') {
          delete masteryData[nodeId];
        } else {
          masteryData[nodeId] = newStatus;
        }
        saveMastery();
        updateStats();
        showNodeDetail(nodeId); // Refresh
        renderGraph();
      });
    });

    sheet.classList.add('bs-open');
  }

  function buildCoachText(topic, prereqs, succs) {
    const firstName = prereqs[0]?.topic?.name;
    const evidence = topic.evidence?.[0];
    const mistake = topic.commonMistakes?.[0];
    const action = topic.practiceChain?.[0] || topic.assessmentTasks?.[0] || evidence;
    
    let text = `如果孩子在"${topic.name}"这里卡住，先别急。`;
    if (firstName) text += `优先先补"${firstName}"，这是基础。`;
    if (action) text += `可以带孩子做"${action}"。`;
    if (mistake) text += `注意常见问题："${mistake}"。`;
    if (succs[0]) text += `稳住后往"${succs[0].topic.name}"推进。`;
    return text;
  }

  function setupSheet() {
    // Handle bar click to close
    document.querySelector('.bs-handle-bar')?.addEventListener('click', () => {
      sheet.classList.remove('bs-open');
      selectedNodeId = null;
    });

    // Close on swipe down
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

  // ==================== Practice System ====================
  function startPractice(topicId) {
    const topic = topicMap.get(topicId);
    if (!topic) return;
    
    closeSheet();
    
    const modal = document.getElementById('practice-modal');
    const body = document.getElementById('practice-body');
    const title = document.getElementById('practice-title');
    
    title.textContent = `${topic.name} · 练习`;
    
    // Generate questions
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
    
    // Multiple choice from commonMistakes
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
    
    // True/false from description
    if (topic.description) {
      questions.push({
        type: 'judge',
        question: `${topic.description.slice(0, 30)}... 这个说法对吗？`,
        answer: true
      });
    }
    
    // Fill in blank from evidence
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
      if (kidMode) showStarBurst();
      return;
    }

    const q = questions[idx];
    let html = `<div class="practice-question">${idx + 1}. ${q.question}</div>`;

    if (q.type === 'choice') {
      html += '<div class="practice-options">';
      q.options.forEach((opt, i) => {
        html += `<button class="practice-option" data-idx="${i}">${String.fromCharCode(65+i)}. ${opt}</button>`;
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

    // Setup handlers
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
            showToast(kidMode ? '🎉 太棒了！' : '✅ 正确！');
            if (kidMode) showStarBurst();
            addStar();
            setTimeout(() => showQuestion(container, questions, idx + 1, topic), 800);
          } else {
            opt.classList.add('po-wrong');
            showToast(kidMode ? '💡 差一点哦~' : '❌ 再想想');
            // Record wrong answer
            recordWrong(topic, q.question, q.options?.[selected] || '', q.options?.[q.answer] || '正确说法');
            setTimeout(() => {
              showQuestion(container, questions, idx + 1, topic), 1200);
            });
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
          showToast(kidMode ? '🎉 答对啦！' : '✅ 回答正确！');
          if (kidMode) showStarBurst();
          addStar();
          setTimeout(() => showQuestion(container, questions, idx + 1, topic), 800);
        } else {
          showToast('💡 再仔细想想');
        }
      });
    }
  }

  function recordWrong(topic, question, userAnswer, correctAnswer) {
    wrongBook.unshift({
      topicId: topic.id,
      topicName: topic.name,
      question,
      userAnswer,
      correctAnswer,
      timestamp: Date.now()
    });
    if (wrongBook.length > 100) wrongBook = wrongBook.slice(0, 100);
    saveWrongBook();
    updateWrongBook();
    updateStats();
  }

  // ==================== Learning Path ====================
  function topoPathTo(topicId) {
    const visited = new Set();
    const collectAncestors = (id) => {
      (incomingMap.get(id) || []).forEach(e => {
        if (!visited.has(e.source)) {
          visited.add(e.source);
          collectAncestors(e.source);
        }
      });
    };
    collectAncestors(topicId);
    visited.add(topicId);
    
    const ids = Array.from(visited);
    const inDegree = new Map();
    const graph = new Map();
    ids.forEach(id => { inDegree.set(id, 0); graph.set(id, []); });
    
    fullData.deps.dependencies.forEach(dep => {
      if (visited.has(dep.prerequisiteId) && visited.has(dep.topicId)) {
        graph.get(dep.prerequisiteId).push(dep.topicId);
        inDegree.set(dep.topicId, inDegree.get(dep.topicId) + 1);
      }
    });
    
    const queue = ids.filter(id => inDegree.get(id) === 0);
    const ordered = [];
    while (queue.length) {
      const cur = queue.shift();
      ordered.push(cur);
      (graph.get(cur) || []).forEach(next => {
        inDegree.set(next, inDegree.get(next) - 1);
        if (inDegree.get(next) === 0) queue.push(next);
      });
    }
    return ordered.map(id => topicMap.get(id)).filter(Boolean);
  }

  function viewPath(topicId) {
    const path = topoPathTo(topicId);
    const container = document.getElementById('learning-path-list');
    if (!container) return;
    
    closeSheet();
    switchView('learn');
    
    if (!path.length) {
      container.innerHTML = '<div class="empty-state">暂无推荐路径</div>';
      return;
    }

    container.innerHTML = path.slice(0, 20).map((t, i) => {
      const status = masteryData[t.id];
      const icon = status === 'mastered' ? '✅' : status === 'learning' ? '📖' : '⏳';
      return `
        <div class="lp-item" onclick="window._h5FocusNode('${t.id}')">
          <div class="lp-num">${i + 1}</div>
          <div class="lp-info">
            <div class="lp-name">${t.name}</div>
            <div class="lp-meta">${t.subject} · ${t.grade}年级${t.term}</div>
          </div>
          <div class="lp-status">${icon}</div>
        </div>
      `;
    }).join('');
  }

  function updateLearningPath() {
    const container = document.getElementById('learning-path-list');
    if (!container) return;
    
    if (currentSubject === 'all') {
      container.innerHTML = '<div class="empty-state">请先选择学科和年级，系统会为你生成学习路径</div>';
      return;
    }

    let topics = fullData.topics.topics.filter(t => {
      if (currentGrade !== 'all' && t.grade !== parseInt(currentGrade)) return false;
      if (currentSubject !== 'all' && t.subject !== currentSubject) return false;
      return true;
    });

    // Topo sort all
    const inDegree = new Map();
    const graph = new Map();
    const ids = topics.map(t => t.id);
    ids.forEach(id => { inDegree.set(id, 0); graph.set(id, []); });
    
    fullData.deps.dependencies.forEach(dep => {
      if (inDegree.has(dep.prerequisiteId) && inDegree.has(dep.topicId)) {
        graph.get(dep.prerequisiteId).push(dep.topicId);
        inDegree.set(dep.topicId, inDegree.get(dep.topicId) + 1);
      }
    });
    
    const queue = ids.filter(id => inDegree.get(id) === 0);
    const ordered = [];
    while (queue.length) {
      const cur = queue.shift();
      ordered.push(cur);
      (graph.get(cur) || []).forEach(next => {
        inDegree.set(next, inDegree.get(next) - 1);
        if (inDegree.get(next) === 0) queue.push(next);
      });
    }

    const path = ordered.map(id => topicMap.get(id)).filter(Boolean)
      .filter(t => masteryData[t.id] !== 'mastered')
      .sort((a, b) => (a.difficulty || 3) - (b.difficulty || 3))
      .slice(0, 15);

    if (!path.length) {
      container.innerHTML = '<div class="empty-state">🎉 太棒了！所有知识点都已掌握！</div>';
      return;
    }

    container.innerHTML = path.map((t, i) => {
      const status = masteryData[t.id];
      const icon = status === 'mastered' ? '✅' : status === 'learning' ? '📖' : '⏳';
      return `
        <div class="lp-item" onclick="window._h5FocusNode('${t.id}')">
          <div class="lp-num">${i + 1}</div>
          <div class="lp-info">
            <div class="lp-name">${t.name}</div>
            <div class="lp-meta">${t.subject} · ${t.grade}年级${t.term} · ${'★'.repeat(t.difficulty || 3)}</div>
          </div>
          <div class="lp-status">${icon}</div>
        </div>
      `;
    }).join('');
  }

  // ==================== Wrong Book ====================
  function updateWrongBook() {
    const container = document.getElementById('wrong-book-list');
    if (!container) return;
    
    if (!wrongBook.length) {
      container.innerHTML = '<div class="empty-state">还没有错题记录，去练习吧！</div>';
      return;
    }

    container.innerHTML = wrongBook.slice(0, 20).map(w => `
      <div class="wb-item" onclick="window._h5FocusNode('${w.topicId}')">
        <div class="wb-q">📝 ${w.question}</div>
        <div class="wb-a">❌ ${w.userAnswer} → ✅ ${w.correctAnswer}</div>
        <div class="wb-topic">${w.topicName}</div>
      </div>
    `).join('');
  }

  // ==================== Search ====================
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
      
      const matches = fullData.topics.topics
        .map(t => ({ t, s: scoreTopic(t, q) }))
        .filter(x => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 30)
        .map(x => x.t);
      
      results.innerHTML = matches.map(t => `
        <div class="sr-item" onclick="window._h5FocusNode('${t.id}'); document.getElementById('search-cancel').click();">
          <div class="sr-dot" style="background:${COLORS[t.subject] || '#888'}"></div>
          <div class="sr-info">
            <div class="sr-name">${t.name}</div>
            <div class="sr-meta">${t.subject} · ${t.grade}年级${t.term}${t.subnodeType ? ' · ' + t.subnodeType : ''}</div>
          </div>
        </div>
      `).join('');
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

    // Hot chips
    document.querySelectorAll('.sh-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const q = chip.dataset.q;
        input.value = q;
        input.dispatchEvent(new Event('input'));
      });
    });
  }

  function scoreTopic(topic, q) {
    const text = topicSearchTextMap.get(topic.id) || '';
    let score = 0;
    if (topic.name.toLowerCase().includes(q)) score += 8;
    if (text.includes(q)) score += 4;
    q.split(/[，。；、,\s]+/).filter(Boolean).forEach(token => {
      if (token.length >= 2 && text.includes(token)) score += 2;
    });
    return score;
  }

  // ==================== Filter Panel ====================
  function setupFilter() {
    const panel = document.getElementById('filter-panel');
    const close = document.getElementById('filter-close');
    const reset = document.getElementById('filter-reset');
    const apply = document.getElementById('filter-apply');
    const btnFilter = document.getElementById('btn-filter');

    btnFilter?.addEventListener('click', () => {
      panel.classList.add('fp-open');
      renderFilterOptions();
    });

    close?.addEventListener('click', () => panel.classList.remove('fp-open'));
    reset?.addEventListener('click', () => {
      currentGrade = 'all';
      currentSubject = 'all';
      currentTextbook = 'all';
      currentLayer = 'core';
      updateFilterUI();
      applyFilters();
    });
    apply?.addEventListener('click', () => {
      panel.classList.remove('fp-open');
      applyFilters();
      updateLearningPath();
    });

    // Layer buttons
    document.querySelectorAll('#filter-layers .fp-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#filter-layers .fp-opt-btn').forEach(b => b.classList.remove('fp-active'));
        btn.classList.add('fp-active');
        currentLayer = btn.dataset.value;
      });
    });
  }

  function renderFilterOptions() {
    // Grades
    const gradeContainer = document.getElementById('filter-grades');
    const grades = [...new Set(fullData.topics.topics.map(t => t.grade))].sort((a, b) => a - b);
    gradeContainer.innerHTML = `
      <button class="fp-opt-btn ${currentGrade === 'all' ? 'fp-active' : ''}" data-type="grade" data-value="all">全部</button>
      ${grades.map(g => `<button class="fp-opt-btn ${currentGrade === String(g) ? 'fp-active' : ''}" data-type="grade" data-value="${g}">${g}年级</button>`).join('')}
    `;

    // Subjects
    const subjContainer = document.getElementById('filter-subjects');
    const subjects = [...new Set(fullData.topics.topics.map(t => t.subject))];
    subjContainer.innerHTML = `
      <button class="fp-opt-btn ${currentSubject === 'all' ? 'fp-active' : ''}" data-type="subject" data-value="all">全部</button>
      ${subjects.map(s => `<button class="fp-opt-btn ${currentSubject === s ? 'fp-active' : ''}" data-type="subject" data-value="${s}">${s}</button>`).join('')}
    `;

    // Textbooks
    const tbContainer = document.getElementById('filter-textbooks');
    const textbooks = [...new Set(fullData.topics.topics.map(t => t.textbook || '未标注版本'))];
    tbContainer.innerHTML = `
      <button class="fp-opt-btn ${currentTextbook === 'all' ? 'fp-active' : ''}" data-type="textbook" data-value="all">全部</button>
      ${textbooks.map(t => `<button class="fp-opt-btn ${currentTextbook === t ? 'fp-active' : ''}" data-type="textbook" data-value="${t}">${t}</button>`).join('')}
    `;

    // Setup click handlers
    document.querySelectorAll('.fp-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        const val = btn.dataset.value;
        if (type === 'grade') currentGrade = val;
        else if (type === 'subject') currentSubject = val;
        else if (type === 'textbook') currentTextbook = val;
        renderFilterOptions(); // Re-render to update active state
      });
    });

    updateFilterCount(getFilteredTopics().length);
  }

  function updateFilterUI() {
    // Update active states after reset
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
    container.innerHTML = subjects.map(s => `
      <div class="sqg-item" onclick="window._h5SelectSubject('${s}')" style="border-left:3px solid ${COLORS[s]}">
        <div class="sqg-dot" style="background:${COLORS[s]}"></div>
        <span>${s}</span>
      </div>
    `).join('');
  }

  // ==================== Top Navigation ====================
  function setupUI() {
    // Quick filter bar
    document.querySelectorAll('#quick-filter-bar .qf-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#quick-filter-bar .qf-chip').forEach(b => b.classList.remove('qf-active'));
        btn.classList.add('qf-active');
        currentGrade = btn.dataset.grade;
        applyFilters();
        updateLearningPath();
      });
    });

    // Subject chips in quick bar
    document.querySelectorAll('#qf-subjects .qf-chip-sub').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#qf-subjects .qf-chip-sub').forEach(b => b.classList.remove('qf-active'));
        btn.classList.add('qf-active');
        currentSubject = btn.dataset.subject;
        applyFilters();
        updateLearningPath();
      });
    });

    // Search button
    document.getElementById('btn-search')?.addEventListener('click', () => switchView('search'));

    // Assistant FAB
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
      ${subjects.map(s => `<button class="qf-chip-sub" data-subject="${s}" style="border:1px solid ${COLORS[s]}40">${s}</button>`).join('')}
    `;

    // Add handlers
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
    } else if (viewName === 'mine') {
      document.getElementById('view-mine').classList.add('view-active');
      document.querySelector('[data-view="mine"]')?.classList.add('nav-active');
      document.getElementById('app-header').style.display = 'none';
      updateMineView();
    }
  }

  // ==================== Mine View ====================
  function updateMineView() {
    const mastered = Object.values(masteryData).filter(v => v === 'mastered').length;
    const learning = Object.values(masteryData).filter(v => v === 'learning').length;
    const days = parseInt(localStorage.getItem('cnpt-h5-days') || '1');
    
    document.getElementById('ms-total-mastered').textContent = mastered;
    document.getElementById('ms-total-stars').textContent = stars;
    document.getElementById('ms-total-days').textContent = days;

    // Menu handlers
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
    localStorage.setItem(KID_MODE_KEY, kidMode.toString());
    document.body.classList.toggle('kid-mode', kidMode);
    showToast(kidMode ? '🧒 小伙伴模式已开启！' : '👨‍👧 已切换回家长模式');
  }

  function resetProgress() {
    if (confirm('确定要重置所有学习进度吗？此操作不可撤销。')) {
      masteryData = {};
      wrongBook = [];
      stars = 0;
      saveMastery();
      saveWrongBook();
      localStorage.setItem(STARS_KEY, '0');
      updateStats();
      updateLearningPath();
      updateWrongBook();
      renderGraph();
      showToast('已重置学习进度');
    }
  }

  function showAbout() {
    showToast('CN-Primary-Taxonomy v0.9 · 4275个知识点');
  }

  // ==================== Stats ====================
  function updateStats() {
    const mastered = Object.values(masteryData).filter(v => v === 'mastered').length;
    const learning = Object.values(masteryData).filter(v => v === 'learning').length;
    const total = fullData.topics?.topics.length || 4275;
    
    const elM = document.getElementById('ls-mastered');
    const elL = document.getElementById('ls-learning');
    const elR = document.getElementById('ls-remaining');
    const elW = document.getElementById('ls-wrong');
    
    if (elM) elM.textContent = mastered;
    if (elL) elL.textContent = learning;
    if (elR) elR.textContent = total - mastered;
    if (elW) elW.textContent = wrongBook.length;
  }

  // ==================== Modals ====================
  function setupModals() {
    document.getElementById('practice-close')?.addEventListener('click', () => {
      document.getElementById('practice-modal')?.classList.remove('mo-open');
    });
    document.getElementById('assistant-close')?.addEventListener('click', () => {
      document.getElementById('assistant-modal')?.classList.remove('mo-open');
    });
    
    // Close on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('mo-open');
      });
    });

    // Assistant
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
    const ranked = fullData.topics.topics
      .map(t => ({ t, s: scoreTopic(t, q) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 5);

    if (!ranked.length) {
      resultContainer.innerHTML = '<div class="ar-muted">没有匹配到相关知识点，试试更具体的关键词</div>';
      return;
    }

    const target = ranked[0].t;
    const path = topoPathTo(target.id).slice(-6);
    const direct = (incomingMap.get(target.id) || []).map(e => topicMap.get(e.source)).filter(Boolean);
    const actions = [...(target.practiceChain || []), ...(target.assessmentTasks || []), ...(target.evidence || [])].filter(Boolean).slice(0, 3);
    const evidence = target.evidence?.[0] || '能独立完成相关题目';
    const mistake = target.commonMistakes?.[0];

    resultContainer.innerHTML = `
      <div class="ar-card"><strong>定位知识点：</strong>${target.subject} · ${target.name}</div>
      <div class="ar-card"><strong>为什么先看这里：</strong>${direct.length ? `连着 ${direct.slice(0,2).map(t=>'「'+t.name+'」').join('、')}等基础点` : '没有明显前置门槛，可直接开始'}</div>
      <div class="ar-card"><strong>优先先补：</strong>${direct.length ? direct.map(t => t.name).join('、') : '可直接从当前点开始'}</div>
      <div class="ar-card"><strong>这周可以先做：</strong><br>${actions.map(a => `• ${a}`).join('<br>')}</div>
      <div class="ar-card"><strong>补到什么程度算有起色：</strong>${evidence}</div>
      ${mistake ? `<div class="ar-card"><strong>注意:</strong>${mistake}</div>` : ''}
      <div style="margin-top:8px"><strong>建议学习顺序：</strong></div>
      ${path.map((t, i) => `<a class="ar-path" href="javascript:void(0)" onclick="window._h5FocusNode('${t.id}'); document.getElementById('assistant-close').click();">${i+1}. ${t.name} · ${t.subject} · ${t.grade}年级</a>`).join('')}
    `;
  }

  // ==================== Utilities ====================
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }

  function addStar() {
    stars++;
    localStorage.setItem(STARS_KEY, stars.toString());
    updateStats();
    updateMineView();
  }

  function showStarBurst() {
    const el = document.createElement('div');
    el.className = 'star-burst';
    el.textContent = '⭐';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 800);
  }

  // ==================== Global Exports (for inline handlers) ====================
  window._h5SelectNode = function(id) { showNodeDetail(id); };
  window._h5FocusNode = function(id) {
    const topic = topicMap.get(id);
    if (!topic) return;
    currentGrade = String(topic.grade);
    currentSubject = topic.subject;
    
    // Update quick filter UI
    document.querySelectorAll('#quick-filter-bar .qf-chip').forEach(b => {
      b.classList.toggle('qf-active', b.dataset.grade === currentGrade);
    });
    document.querySelectorAll('#qf-subjects .qf-chip-sub').forEach(b => {
      b.classList.toggle('qf-active', b.dataset.subject === currentSubject);
    });
    
    switchView('graph');
    applyFilters();
    
    // Select node after render
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
  window._h5ViewPath = function(id) { viewPath(id); };

  // ==================== Start ====================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
