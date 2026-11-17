/*!
 * CN-Primary-Taxonomy · 会动的模型（交互演示）共享组件
 * 借鉴《一张导图 + 52 个会动的模型》与 edulab：把「想不出来」的知识变成「拖一拖就看得见」的画面。
 * 使用方式：
 *   CNPT.components.visualModels.render(container, 'fraction-bar');   // 渲染到容器
 *   CNPT.components.initVisualModels();                               // 注入样式（render 内部已自动调用）
 * 模型清单：fraction-bar（分数条）/ number-line（数轴）/ triangle-angle（三角形内角和）/ cube-net（正方体展开图）
 *         angle-protractor（角的度量）/ decimal-grid（小数的意义）
 * 带动画的模型均返回 anim 句柄，render() 会在重渲染前统一 stop，避免 rAF/定时器泄漏。
 */
(function() {
  'use strict';

  window.CNPT = window.CNPT || {};
  window.CNPT.components = window.CNPT.components || {};

  const SVG_NS = 'http://www.w3.org/2000/svg';

  function esc(s) {
    if (window.CNPT?.utils?.escapeHtml) return CNPT.utils.escapeHtml(s);
    return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function el(tag, attrs = {}, parent = null) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    if (parent) parent.appendChild(node);
    return node;
  }

  // ---------------- 动画基础设施 ----------------
  // 约束：切换知识点 / 重渲染时必须销毁旧动画（rAF + 定时器），否则会泄漏。
  let activeAnim = null;

  function stopActiveAnim() {
    if (activeAnim) {
      try { activeAnim.stop(); } catch { /* noop */ }
      activeAnim = null;
    }
  }

  /**
   * 动画宿主：登记 rAF 与定时器，stop() 一次全部销毁。
   * raf(loop)：loop(t) 返回 false 时自行停止；every(ms, fn)：周期任务。
   */
  function createAnimHost() {
    let rafId = 0;
    let timers = [];
    let stopped = false;
    return {
      raf(loop) {
        if (stopped) return;
        const step = (t) => {
          if (stopped) return;
          if (loop(t) === false) return;
          rafId = requestAnimationFrame(step);
        };
        rafId = requestAnimationFrame(step);
      },
      every(ms, fn) {
        if (stopped) return 0;
        const id = setInterval(() => { if (!stopped) fn(); }, ms);
        timers.push(id);
        return id;
      },
      stop() {
        stopped = true;
        if (rafId) cancelAnimationFrame(rafId);
        timers.forEach(clearInterval);
        rafId = 0;
        timers = [];
      }
    };
  }

  /** 可重复指向新宿主的句柄（模型内多次启动/停止动画时用） */
  function createAnimRef() {
    const ref = { current: null };
    ref.api = { stop() { try { ref.current?.stop(); } catch { /* noop */ } ref.current = null; } };
    return ref;
  }

  // ---------------- 模型 1：分数条 ----------------
  function renderFractionBar(host) {
    const state = { n: 1, d: 4 };
    host.innerHTML = '';

    const ctls = document.createElement('div');
    ctls.className = 'vm-ctls';
    ctls.innerHTML = `
      <label>分子 <input type="range" class="vm-frac-n" min="1" max="12" step="1" value="${state.n}"><b class="vm-frac-nv">${state.n}</b></label>
      <label>分母 <input type="range" class="vm-frac-d" min="2" max="12" step="1" value="${state.d}"><b class="vm-frac-dv">${state.d}</b></label>
      <div class="vm-frac-btns">
        <button class="vm-btn" data-act="double">×2 等值放大</button>
        <button class="vm-btn" data-act="halve">÷2 约分</button>
        <button class="vm-btn" data-act="reset">重置</button>
      </div>
    `;
    host.appendChild(ctls);

    const svg = el('svg', { viewBox: '0 0 320 150', class: 'vm-svg', 'aria-label': '分数条' });
    host.appendChild(svg);
    const barBg = el('rect', { x: 20, y: 40, width: 280, height: 56, rx: 6, fill: 'rgba(148,163,184,0.18)', stroke: '#cbd5e1' }, svg);
    const barFill = el('rect', { x: 20, y: 40, width: 70, height: 56, rx: 6, fill: '#3b82f6' }, svg);
    const ticksG = el('g', {}, svg);
    const read = el('div', { class: 'vm-read' }, host);
    const tip = el('div', { class: 'vm-tip' }, host);

    function draw() {
      if (state.n > state.d) state.n = state.d;
      const w = 280 / state.d;
      barFill.setAttribute('width', String(w * state.n));
      ticksG.innerHTML = '';
      for (let i = 1; i < state.d; i++) {
        el('line', { x1: 20 + w * i, y1: 40, x2: 20 + w * i, y2: 96, stroke: '#fff', 'stroke-width': 2 }, ticksG);
      }
      const val = state.n / state.d;
      const vsHalf = Math.abs(val - 0.5) < 1e-9 ? '正好是一半' : (val > 0.5 ? '比一半多' : '比一半少');
      read.innerHTML = `<b>${state.n}</b> / <b>${state.d}</b> ＝ <b class="vm-num">${val.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')}</b>
        <span class="vm-chip">${vsHalf}</span> <span class="vm-chip">＝ ${state.n} 个 1/${state.d}</span>`;
      ctls.querySelector('.vm-frac-nv').textContent = state.n;
      ctls.querySelector('.vm-frac-dv').textContent = state.d;
      ctls.querySelector('.vm-frac-n').value = state.n;
      ctls.querySelector('.vm-frac-d').value = state.d;
    }

    ctls.querySelector('.vm-frac-n').addEventListener('input', e => { state.n = Number(e.target.value); draw(); });
    ctls.querySelector('.vm-frac-d').addEventListener('input', e => { state.d = Number(e.target.value); draw(); });
    ctls.addEventListener('click', e => {
      const act = e.target.dataset?.act;
      if (act === 'double') { state.n *= 2; state.d *= 2; }
      else if (act === 'halve') { if (state.n % 2 === 0 && state.d % 2 === 0) { state.n /= 2; state.d /= 2; } else { tip.textContent = '分子分母不都是偶数，没法直接 ÷2 约分'; return; } }
      else if (act === 'reset') { state.n = 1; state.d = 4; }
      tip.textContent = '';
      draw();
    });

    tip.className = 'vm-tip';
    draw();
    return { hint: '拖一拖分子/分母，看看分数条怎么变长变短；再点「×2」看等值分数。' };
  }

  // ---------------- 模型 2：数轴 ----------------
  function renderNumberLine(host) {
    const state = { min: 0, max: 10, value: 3, step: 1 };
    host.innerHTML = '';

    const ctls = document.createElement('div');
    ctls.className = 'vm-ctls';
    ctls.innerHTML = `
      <label>范围
        <select class="vm-nl-range">
          <option value="0,10" selected>0 ~ 10</option>
          <option value="0,100">0 ~ 100</option>
          <option value="-5,5">-5 ~ 5</option>
          <option value="-10,10">-10 ~ 10</option>
        </select>
      </label>
      <label>刻度
        <select class="vm-nl-step">
          <option value="1" selected>整数</option>
          <option value="0.5">0.5</option>
        </select>
      </label>
    `;
    host.appendChild(ctls);

    const svg = el('svg', { viewBox: '0 0 340 130', class: 'vm-svg', 'aria-label': '数轴' });
    host.appendChild(svg);
    const read = el('div', { class: 'vm-read' }, host);

    const X0 = 20, X1 = 320, Y = 60;

    function xOf(v) { return X0 + (v - state.min) / (state.max - state.min) * (X1 - X0); }
    function vOf(x) { return state.min + (x - X0) / (X1 - X0) * (state.max - state.min); }

    function draw() {
      svg.innerHTML = '';
      el('line', { x1: X0, y1: Y, x2: X1, y2: Y, stroke: '#64748b', 'stroke-width': 2 }, svg);
      // 箭头
      el('path', { d: `M ${X1} ${Y} l -8 -4 v 8 z`, fill: '#64748b' }, svg);
      const ticks = Math.min(20, Math.round((state.max - state.min) / (state.step || 1)));
      const step = (state.max - state.min) / ticks;
      for (let i = 0; i <= ticks; i++) {
        const v = state.min + step * i;
        const x = xOf(v);
        el('line', { x1: x, y1: Y - 5, x2: x, y2: Y + 5, stroke: '#94a3b8', 'stroke-width': 1.5 }, svg);
        const label = el('text', { x, y: Y + 20, 'text-anchor': 'middle', 'font-size': 10, fill: '#64748b' }, svg);
        label.textContent = (Math.round(v * 100) / 100).toString();
      }
      // 零点强调
      if (state.min < 0 && state.max > 0) {
        el('line', { x1: xOf(0), y1: Y - 12, x2: xOf(0), y2: Y + 12, stroke: '#e11d48', 'stroke-width': 2 }, svg);
      }
      // 拖拽点
      const px = xOf(state.value);
      el('line', { x1: px, y1: Y - 26, x2: px, y2: Y + 26, stroke: '#3b82f6', 'stroke-width': 2, 'stroke-dasharray': '3 3' }, svg);
      const handle = el('circle', { cx: px, cy: Y, r: 11, fill: '#3b82f6', stroke: '#fff', 'stroke-width': 2, style: 'cursor:grab' }, svg);
      const valText = el('text', { x: px, y: Y - 34, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#1d4ed8' }, svg);
      valText.textContent = String(Math.round(state.value * 100) / 100);
      handle.dataset.role = 'handle';

      const dist = Math.abs(state.value);
      const side = state.value > 0 ? '在 0 的右边（正数）' : state.value < 0 ? '在 0 的左边（负数）' : '正好在 0 上';
      read.innerHTML = `读数：<b class="vm-num">${Math.round(state.value * 100) / 100}</b> <span class="vm-chip">${side}</span> <span class="vm-chip">到 0 的距离是 ${dist}</span>`;
    }

    let dragging = false;
    svg.addEventListener('pointerdown', e => {
      if (e.target.dataset?.role === 'handle' || e.target.tagName === 'circle') { dragging = true; svg.setPointerCapture(e.pointerId); }
    });
    svg.addEventListener('pointermove', e => {
      if (!dragging) return;
      const rect = svg.getBoundingClientRect();
      const sx = (e.clientX - rect.left) / rect.width * 340;
      let v = vOf(sx);
      v = Math.max(state.min, Math.min(state.max, v));
      v = Math.round(v / state.step) * state.step;
      state.value = Math.round(v * 100) / 100;
      draw();
    });
    svg.addEventListener('pointerup', () => { dragging = false; });
    svg.addEventListener('pointerleave', () => { dragging = false; });

    ctls.querySelector('.vm-nl-range').addEventListener('change', e => {
      const [a, b] = e.target.value.split(',').map(Number);
      state.min = a; state.max = b;
      state.value = Math.max(a, Math.min(b, 0));
      state.step = b - a > 20 ? 1 : 1;
      ctls.querySelector('.vm-nl-step').value = '1';
      draw();
    });
    ctls.querySelector('.vm-nl-step').addEventListener('change', e => { state.step = Number(e.target.value); draw(); });

    draw();
    return { hint: '拖动蓝点：数轴上越往右数越大；负数住在 0 的左边。' };
  }

  // ---------------- 模型 3：三角形内角和 ----------------
  function renderTriangleAngle(host) {
    const W = 320, H = 220;
    const state = { A: { x: 60, y: 170 }, B: { x: 260, y: 170 }, C: { x: 160, y: 50 } };
    host.innerHTML = '';

    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'vm-svg', 'aria-label': '三角形内角和' });
    host.appendChild(svg);
    const read = el('div', { class: 'vm-read' }, host);

    const poly = el('polygon', { fill: 'rgba(59,130,246,0.12)', stroke: '#3b82f6', 'stroke-width': 2.5, join: 'round' }, svg);
    const arcsG = el('g', {}, svg);
    const handles = {};
    for (const k of ['A', 'B', 'C']) {
      handles[k] = el('circle', { cx: state[k].x, cy: state[k].y, r: 9, fill: '#f59e0b', stroke: '#fff', 'stroke-width': 2, style: 'cursor:grab', 'data-k': k }, svg);
    }
    const labels = {};
    for (const k of ['A', 'B', 'C']) {
      labels[k] = el('text', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#b45309' }, svg);
    }

    function angleAt(p, q, r) { // ∠pqr（顶点在 q）
      const v1 = { x: p.x - q.x, y: p.y - q.y };
      const v2 = { x: r.x - q.x, y: r.y - q.y };
      const dot = v1.x * v2.x + v1.y * v2.y;
      const m1 = Math.hypot(v1.x, v1.y), m2 = Math.hypot(v2.x, v2.y);
      if (m1 === 0 || m2 === 0) return 0;
      return Math.acos(Math.max(-1, Math.min(1, dot / (m1 * m2)))) * 180 / Math.PI;
    }

    function draw() {
      poly.setAttribute('points', `${state.A.x},${state.A.y} ${state.B.x},${state.B.y} ${state.C.x},${state.C.y}`);
      const angles = {
        A: angleAt(state.B, state.A, state.C),
        B: angleAt(state.A, state.B, state.C),
        C: angleAt(state.A, state.C, state.B)
      };
      for (const k of ['A', 'B', 'C']) {
        handles[k].setAttribute('cx', state[k].x);
        handles[k].setAttribute('cy', state[k].y);
        const off = 16;
        const dx = state[k].x - 160, dy = state[k].y - 120;
        const len = Math.hypot(dx, dy) || 1;
        labels[k].setAttribute('x', state[k].x + dx / len * off);
        labels[k].setAttribute('y', state[k].y + dy / len * off + 4);
        labels[k].textContent = `${k} ${angles[k].toFixed(1)}°`;
      }
      const sum = angles.A + angles.B + angles.C;
      const right = Object.entries(angles).find(([, v]) => Math.abs(v - 90) < 0.6);
      read.innerHTML = `三个内角相加：<b class="vm-num">${sum.toFixed(1)}°</b>
        <span class="vm-chip">任意三角形内角和都是 180°</span>
        ${right ? `<span class="vm-chip">∠${right[0]} 是直角 90°</span>` : ''}`;
    }

    let dragK = null;
    svg.addEventListener('pointerdown', e => {
      const k = e.target.dataset?.k;
      if (k) { dragK = k; svg.setPointerCapture(e.pointerId); }
    });
    svg.addEventListener('pointermove', e => {
      if (!dragK) return;
      const rect = svg.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width * W;
      const y = (e.clientY - rect.top) / rect.height * H;
      state[dragK].x = Math.max(8, Math.min(W - 8, Math.round(x)));
      state[dragK].y = Math.max(8, Math.min(H - 8, Math.round(y)));
      draw();
    });
    svg.addEventListener('pointerup', () => { dragK = null; });
    svg.addEventListener('pointerleave', () => { dragK = null; });

    draw();
    return { hint: '拖动三个顶点，把三角形拉成任意形状——三个内角相加永远等于 180°。' };
  }

  // ---------------- 模型 4：正方体展开图（找相对面） ----------------
  const NET = {
    // 经典 1-4-1 展开图：A 在 C 上，F 在 C 下
    cells: [
      { id: 'A', x: 1, y: 0 }, { id: 'B', x: 0, y: 1 }, { id: 'C', x: 1, y: 1 },
      { id: 'D', x: 2, y: 1 }, { id: 'E', x: 3, y: 1 }, { id: 'F', x: 1, y: 2 }
    ],
    pairs: { A: 'F', F: 'A', B: 'D', D: 'B', C: 'E', E: 'C' }
  };

  function renderCubeNet(host) {
    host.innerHTML = '';
    const svg = el('svg', { viewBox: '0 0 240 180', class: 'vm-svg', 'aria-label': '正方体展开图' });
    host.appendChild(svg);
    const read = el('div', { class: 'vm-read' }, host);
    const cells = {};
    const S = 44, OX = 34, OY = 12;
    for (const c of NET.cells) {
      const r = el('rect', {
        x: OX + c.x * S, y: OY + c.y * S, width: S - 4, height: S - 4, rx: 6,
        fill: 'rgba(59,130,246,0.12)', stroke: '#3b82f6', 'stroke-width': 2, style: 'cursor:pointer'
      }, svg);
      r.dataset.id = c.id;
      const t = el('text', { x: OX + c.x * S + (S - 4) / 2, y: OY + c.y * S + (S - 4) / 2 + 6, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: '#1d4ed8' }, svg);
      t.textContent = c.id;
      cells[c.id] = r;
    }

    let selected = null;
    function select(id) {
      selected = id;
      for (const [k, r] of Object.entries(cells)) {
        if (k === id) { r.setAttribute('fill', 'rgba(245,158,11,0.35)'); r.setAttribute('stroke', '#d97706'); }
        else if (k === NET.pairs[id]) { r.setAttribute('fill', 'rgba(46,204,113,0.25)'); r.setAttribute('stroke', '#27ae60'); }
        else { r.setAttribute('fill', 'rgba(59,130,246,0.12)'); r.setAttribute('stroke', '#3b82f6'); }
      }
      read.innerHTML = id
        ? `面 <b class="vm-num">${id}</b> 的相对面是 <b class="vm-num">${NET.pairs[id]}</b> <span class="vm-chip">折成立方体后，相对的面不相邻</span>`
        : '点一个面，看看它和哪个面相对。';
    }

    svg.addEventListener('click', e => {
      const id = e.target.dataset?.id;
      if (id) select(selected === id ? null : id);
    });
    select(null);
    return { hint: '点任意一个面：绿色就是它在立方体中的相对面（相对面一定不相邻）。' };
  }

  // ---------------- 模型 5：角的度量 ----------------
  function renderAngleProtractor(host) {
    const W = 340, H = 210;
    const O = { x: 64, y: 168 };
    const L = 140;
    const state = { deg: 45 };
    const anims = createAnimRef();
    host.innerHTML = '';

    const ctls = document.createElement('div');
    ctls.className = 'vm-ctls';
    ctls.innerHTML = `<div class="vm-frac-btns"><button class="vm-btn vm-ap-play">▶ 自动演示 0°→180°</button></div>`;
    host.appendChild(ctls);

    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'vm-svg', 'aria-label': '角的度量' });
    host.appendChild(svg);
    const read = el('div', { class: 'vm-read' }, host);

    const gStatic = el('g', {}, svg);
    const gDyn = el('g', {}, svg);

    function polar(cx, cy, r, deg) {
      const rad = -deg * Math.PI / 180;
      return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
    }
    function arcPath(cx, cy, r, a0, a1) {
      const [x0, y0] = polar(cx, cy, r, a0);
      const [x1, y1] = polar(cx, cy, r, a1);
      const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
      return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
    }

    // 静态：0° 射线、顶点、刻度（每 10°）
    const [rx1, ry1] = polar(O.x, O.y, L + 16, 0);
    el('line', { x1: O.x, y1: O.y, x2: rx1, y2: ry1, stroke: '#64748b', 'stroke-width': 3 }, gStatic);
    for (let d = 0; d <= 180; d += 10) {
      const [tx1, ty1] = polar(O.x, O.y, 46, d);
      const [tx2, ty2] = polar(O.x, O.y, d % 30 === 0 ? 38 : 42, d);
      el('line', { x1: tx1, y1: ty1, x2: tx2, y2: ty2, stroke: '#94a3b8', 'stroke-width': d % 30 === 0 ? 2 : 1 }, gStatic);
      if (d % 30 === 0) {
        const [lx, ly] = polar(O.x, O.y, 30, d);
        const t = el('text', { x: lx, y: ly + 3, 'text-anchor': 'middle', 'font-size': 9, fill: '#64748b' }, gStatic);
        t.textContent = String(d);
      }
    }
    el('circle', { cx: O.x, cy: O.y, r: 5, fill: '#1e293b' }, gStatic);

    const arcEl = el('path', { fill: 'rgba(59,130,246,0.18)', stroke: '#3b82f6', 'stroke-width': 2 }, gDyn);
    const ray2 = el('line', { x1: O.x, y1: O.y, x2: 0, y2: 0, stroke: '#3b82f6', 'stroke-width': 3 }, gDyn);
    const handle = el('circle', { cx: 0, cy: 0, r: 10, fill: '#f59e0b', stroke: '#fff', 'stroke-width': 2, style: 'cursor:grab' }, gDyn);
    handle.dataset.role = 'handle';
    const degText = el('text', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#1d4ed8' }, gDyn);

    function typeOf(deg) {
      if (deg <= 0.5) return '零角';
      if (deg < 89.5) return '锐角（小于 90°）';
      if (deg < 90.5) return '直角（正好 90°）';
      if (deg < 179.5) return '钝角（大于 90°）';
      return '平角（正好 180°）';
    }

    function draw() {
      const [px, py] = polar(O.x, O.y, L, state.deg);
      ray2.setAttribute('x2', px.toFixed(1));
      ray2.setAttribute('y2', py.toFixed(1));
      handle.setAttribute('cx', px.toFixed(1));
      handle.setAttribute('cy', py.toFixed(1));
      const [tx, ty] = polar(O.x, O.y, L * 0.66, state.deg / 2);
      degText.setAttribute('x', tx.toFixed(1));
      degText.setAttribute('y', (ty - 6).toFixed(1));
      degText.textContent = `${Math.round(state.deg)}°`;
      if (state.deg > 0.5) {
        arcEl.setAttribute('d', arcPath(O.x, O.y, 50, 0, state.deg));
        arcEl.style.display = '';
      } else {
        arcEl.style.display = 'none';
      }
      const dInt = Math.round(state.deg);
      read.innerHTML = `这个角是 <b class="vm-num">${dInt}°</b> <span class="vm-chip">${typeOf(state.deg)}</span>
        <span class="vm-chip">由 ${dInt} 个 1° 组成</span>
        <span class="vm-chip">它的补角是 ${180 - dInt}°</span>`;
    }

    let dragging = false;
    svg.addEventListener('pointerdown', e => {
      if (e.target.dataset?.role === 'handle' || e.target.tagName === 'circle') { dragging = true; svg.setPointerCapture(e.pointerId); }
    });
    svg.addEventListener('pointermove', e => {
      if (!dragging) return;
      const rect = svg.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width * W;
      const y = (e.clientY - rect.top) / rect.height * H;
      const deg = -Math.atan2(y - O.y, x - O.x) * 180 / Math.PI;
      state.deg = Math.max(0, Math.min(180, Math.round(deg)));
      draw();
    });
    svg.addEventListener('pointerup', () => { dragging = false; });
    svg.addEventListener('pointerleave', () => { dragging = false; });

    const playBtn = ctls.querySelector('.vm-ap-play');
    let playing = false;
    function stopPlay() {
      anims.api.stop();
      playing = false;
      playBtn.textContent = '▶ 自动演示 0°→180°';
    }
    playBtn.addEventListener('click', () => {
      if (playing) { stopPlay(); return; }
      playing = true;
      playBtn.textContent = '⏸ 停止演示';
      anims.current = createAnimHost();
      const t0 = performance.now();
      anims.current.raf((now) => {
        if (!playing) return false;
        const t = (now - t0) / 1000;
        const cycle = (t % 8) / 8;                 // 8 秒一个来回
        const deg = cycle < 0.5 ? cycle * 2 * 180 : (1 - cycle) * 2 * 180;
        state.deg = Math.round(deg);
        draw();
        return true;
      });
    });

    draw();
    return { hint: '拖动橙色端点改变角的大小，或点「自动演示」看 0° 到 180° 的变化；转到 180° 就是平角。', anim: anims.api };
  }

  // ---------------- 模型 6：小数的意义（十乘十方格） ----------------
  function renderDecimalGrid(host) {
    const state = { tenths: 2, hundredths: 5 };
    const anims = createAnimRef();
    host.innerHTML = '';

    const ctls = document.createElement('div');
    ctls.className = 'vm-ctls';
    ctls.innerHTML = `
      <label>十分位 <input type="range" class="vm-dg-t" min="0" max="9" step="1" value="${state.tenths}"><b class="vm-dg-tv">${state.tenths}</b></label>
      <label>百分位 <input type="range" class="vm-dg-h" min="0" max="9" step="1" value="${state.hundredths}"><b class="vm-dg-hv">${state.hundredths}</b></label>
      <div class="vm-frac-btns"><button class="vm-btn vm-dg-play">▶ 演示：0 → 0.99</button></div>
    `;
    host.appendChild(ctls);

    const svg = el('svg', { viewBox: '0 0 240 245', class: 'vm-svg', 'aria-label': '小数的意义' });
    host.appendChild(svg);
    const read = el('div', { class: 'vm-read' }, host);

    const N = 10, CELL = 20, OX = 20, OY = 8;
    const cells = [];
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const rect = el('rect', {
          x: OX + c * CELL, y: OY + r * CELL, width: CELL - 1.5, height: CELL - 1.5, rx: 2,
          fill: '#f1f5f9', stroke: '#e2e8f0', 'stroke-width': 0.75
        }, svg);
        cells.push({ rect, r, c });
      }
    }
    const cap = el('text', { x: OX, y: OY + N * CELL + 22, 'font-size': 11, fill: '#64748b' }, svg);
    cap.textContent = '整个方格 = 1，平均分成 100 个小格';

    function draw() {
      const lit = state.tenths * 10 + state.hundredths;
      const fullCols = Math.floor(lit / 10);
      const rem = lit % 10;
      for (const { rect, r, c } of cells) {
        let fill = '#f1f5f9';
        if (c < fullCols) fill = '#3b82f6';
        else if (c === fullCols && r < rem) fill = '#93c5fd';
        rect.setAttribute('fill', fill);
      }
      ctls.querySelector('.vm-dg-tv').textContent = state.tenths;
      ctls.querySelector('.vm-dg-hv').textContent = state.hundredths;
      ctls.querySelector('.vm-dg-t').value = state.tenths;
      ctls.querySelector('.vm-dg-h').value = state.hundredths;
      read.innerHTML = `小数 <b class="vm-num">${(lit / 100).toFixed(2)}</b> ＝ 分数 <b class="vm-num">${lit}/100</b> ＝ 百分数 <b class="vm-num">${lit}%</b>
        <span class="vm-chip">${state.tenths} 个 0.1 ＋ ${state.hundredths} 个 0.01</span>
        <span class="vm-chip">${lit === 99 ? '再添 1 个小格就是 1' : `占 100 格中的 ${lit} 格`}</span>`;
    }

    ctls.querySelector('.vm-dg-t').addEventListener('input', e => { state.tenths = Number(e.target.value); draw(); });
    ctls.querySelector('.vm-dg-h').addEventListener('input', e => { state.hundredths = Number(e.target.value); draw(); });

    const playBtn = ctls.querySelector('.vm-dg-play');
    let playing = false;
    function stopPlay() {
      anims.api.stop();
      playing = false;
      playBtn.textContent = '▶ 演示：0 → 0.99';
    }
    playBtn.addEventListener('click', () => {
      if (playing) { stopPlay(); return; }
      playing = true;
      playBtn.textContent = '⏸ 停止演示';
      state.tenths = 0; state.hundredths = 0; draw();
      anims.current = createAnimHost();
      let n = 0;
      anims.current.every(45, () => {
        n += 1;
        if (n > 99) { stopPlay(); return; }
        state.tenths = Math.floor(n / 10);
        state.hundredths = n % 10;
        draw();
      });
    });

    draw();
    return { hint: '拖「十分位 / 百分位」，看小数一格一格变大：0.1 是一列（10 小格），0.01 是一小格。', anim: anims.api };
  }

  // ---------------- 模型注册与渲染 ----------------
  const MODELS = {
    'fraction-bar': { title: '🎚️ 分数条', sub: '拖分子分母，看分数怎么变', render: renderFractionBar },
    'number-line': { title: '📏 数轴', sub: '拖一拖，越往右越大', render: renderNumberLine },
    'triangle-angle': { title: '📐 三角形内角和', sub: '拉动顶点，三个角永远凑成 180°', render: renderTriangleAngle },
    'cube-net': { title: '🧊 正方体展开图', sub: '点一个面，找它的相对面', render: renderCubeNet },
    'angle-protractor': { title: '📐 角的度量', sub: '拖一拖，一度一度看角变大', render: renderAngleProtractor },
    'decimal-grid': { title: '🔲 小数的意义', sub: '1 张方格 = 100 个小格', render: renderDecimalGrid }
  };

  function injectStyles() {
    if (document.getElementById('cnpt-visual-models-styles')) return;
    const style = document.createElement('style');
    style.id = 'cnpt-visual-models-styles';
    style.textContent = `
      .cnpt-vm { border: 1px solid var(--cnpt-border, #e2e8f0); border-radius: 10px; padding: 12px; margin-top: 12px; background: var(--cnpt-bg-card, #fff); }
      .cnpt-vm-head { display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px; }
      .cnpt-vm-title { font-size: 14px; font-weight: 700; color: var(--cnpt-text-main, #1e293b); }
      .cnpt-vm-sub { font-size: 11px; color: var(--cnpt-text-muted, #94a3b8); }
      .cnpt-vm-body .vm-ctls { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 8px; font-size: 12px; color: var(--cnpt-text-sub, #475569); }
      .cnpt-vm-body .vm-ctls label { display: inline-flex; align-items: center; gap: 6px; }
      .cnpt-vm-body .vm-ctls input[type="range"] { width: 110px; }
      .cnpt-vm-body .vm-ctls select { padding: 3px 6px; border-radius: 6px; border: 1px solid var(--cnpt-border, #e2e8f0); font-size: 12px; background: var(--cnpt-bg-card, #fff); }
      .cnpt-vm-body .vm-btn { padding: 4px 10px; border-radius: 6px; border: 1px solid var(--cnpt-border, #e2e8f0); background: var(--cnpt-bg-hover, rgba(59,130,246,0.05)); font-size: 12px; cursor: pointer; }
      .cnpt-vm-body .vm-btn:hover { border-color: var(--cnpt-primary, #3b82f6); }
      .cnpt-vm-body .vm-svg { width: 100%; height: auto; display: block; touch-action: none; user-select: none; }
      .cnpt-vm-body .vm-read { font-size: 13px; color: var(--cnpt-text-main, #1e293b); margin-top: 8px; line-height: 1.8; }
      .cnpt-vm-body .vm-num { color: var(--cnpt-primary, #3b82f6); font-size: 15px; }
      .cnpt-vm-body .vm-chip { display: inline-block; padding: 1px 8px; margin-left: 6px; border-radius: 10px; background: rgba(59,130,246,0.1); color: #1d4ed8; font-size: 11px; }
      .cnpt-vm-body .vm-tip { font-size: 12px; color: #b45309; min-height: 16px; margin-top: 4px; }
      .cnpt-vm-hint { font-size: 11px; color: var(--cnpt-text-muted, #94a3b8); margin-top: 6px; }
    `;
    document.head.appendChild(style);
  }

  function render(container, modelId) {
    stopActiveAnim();   // 重渲染前销毁旧动画（rAF / 定时器）
    injectStyles();
    const model = MODELS[modelId];
    if (!container || !model) return;
    container.innerHTML = '';
    const box = document.createElement('div');
    box.className = 'cnpt-vm';
    box.innerHTML = `<div class="cnpt-vm-head"><span class="cnpt-vm-title">${esc(model.title)}</span><span class="cnpt-vm-sub">${esc(model.sub)}</span></div>`;
    const body = document.createElement('div');
    body.className = 'cnpt-vm-body';
    box.appendChild(body);
    container.appendChild(box);
    const res = model.render(body) || {};
    const { hint } = res;
    if (hint) {
      const h = document.createElement('div');
      h.className = 'cnpt-vm-hint';
      h.textContent = '💡 ' + hint;
      box.appendChild(h);
    }
    if (res.anim) activeAnim = res.anim;
  }

  window.CNPT.components.visualModels = { MODELS, render, injectStyles, stop: stopActiveAnim };
  window.CNPT.components.initVisualModels = injectStyles;
})();
