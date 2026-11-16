/*!
 * CN-Primary-Taxonomy · PC端知识图谱渲染 (D3.js)
 * 所有PC版用户角色共享的图谱渲染引擎
 *
 * v2 改进（2026-11-16，借鉴开源图谱可视化实践）：
 *   1. 规模保护：节点数超过 maxNodes（默认 constants.MAX_RENDER_NODES.aggregate=900）时，
 *      自动按学科聚合为「超级节点」，点击学科下钻到子图，并可返回总览。
 *      —— 解决全量 4275 节点 / 筛选后 1300 节点的 SVG 渲染压力与可读性问题。
 *   2. 大图降级：边数 > 500 时只绘制硬依赖（soft 边隐藏），节点标签阈值提高到 300。
 *   3. 布局参数自适应：碰撞半径随规模调整，力导向模拟停止时间可配置（默认 8 秒）。
 *   4. 销毁路径完整：simulation / zoom / 事件引用统一回收，避免长挂页面泄漏。
 */
(function() {
  'use strict';

  window.CNPT = window.CNPT || {};

  class PCGraph {
    constructor(containerId, options = {}) {
      this.containerId = containerId;
      this.svg = null;
      this.graphGroup = null;
      this.zoomBehavior = null;
      this.simulation = null;
      this.gLinks = null;
      this.gNodes = null;
      this.gLabels = null;
      this.data = { nodes: [], links: [], nodeMap: new Map() };
      this.transform = { x: 0, y: 0, k: 1 };
      this.onNodeClick = options.onNodeClick || (() => {});
      this.onNodeHover = options.onNodeHover || (() => {});
      this.emptyMessage = options.emptyMessage || '没有匹配的节点';
      // 规模保护阈值（聚合触发点）
      const C = (window.CNPT && window.CNPT.constants && window.CNPT.constants.MAX_RENDER_NODES) || {};
      this.maxNodes = options.maxNodes || C.aggregate || 900;
      this.onAggregateClick = options.onAggregateClick || null;   // (subject) => boolean 返回 true 阻止默认下钻
      this.simStopMs = options.simStopMs || 8000;
      this._drilldown = null;        // 当前下钻学科（null = 总览）
      this._lastTopics = null;
      this._lastDeps = null;
      this._aggInfo = null;
    }

    /**
     * 初始化画布
     */
    initCanvas() {
      const container = document.getElementById(this.containerId);
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;

      this.svg = d3.select(`#${this.containerId} svg, #${this.containerId}-svg`);
      if (this.svg.empty()) {
        this.svg = d3.select(`#${this.containerId}`).append('svg')
          .attr('width', '100%')
          .attr('height', '100%')
          .attr('viewBox', `0 0 ${width} ${height}`);
      } else {
        this.svg.attr('viewBox', `0 0 ${width} ${height}`);
      }

      this.svg.on('.zoom', null);
      this.svg.interrupt();
      this.svg.selectAll('*').remove();

      this.graphGroup = this.svg.append('g');

      this.zoomBehavior = d3.zoom()
        .scaleExtent([0.2, 4])
        .on('zoom', (event) => {
          this.transform = event.transform;
          this.graphGroup.attr('transform', event.transform);
        });

      this.svg.call(this.zoomBehavior);
      this.svg.call(this.zoomBehavior.transform, d3.zoomIdentity);
    }

    /**
     * 渲染图谱（自动聚合 / 下钻）
     */
    render(topics, deps) {
      if (!this.svg) this.initCanvas();

      // 停止旧 simulation，防止多次渲染时模拟泄漏
      if (this.simulation) {
        this.simulation.stop();
        this.simulation = null;
      }
      // 仅总览态保存快照：下钻态 render 的是过滤子集，
      // 若覆盖 _lastTopics，backToOverview 将无法恢复全量数据
      if (!this._drilldown) {
        this._lastTopics = topics;
        this._lastDeps = deps;
      }

      const container = document.getElementById(this.containerId);
      const width = container.clientWidth;
      const height = container.clientHeight;

      // 规模保护：超阈值且非下钻态 → 学科聚合总览
      if (topics.length > this.maxNodes && !this._drilldown) {
        this._renderAggregate(topics, deps, width, height);
        return;
      }
      this._aggInfo = this._drilldown ? { drilldown: this._drilldown } : null;

      // 清空旧内容
      this.graphGroup.selectAll('*').remove();

      // 构建渲染数据
      const nodeIds = new Set(topics.map(t => t.id));
      const links = deps
        .filter(d => nodeIds.has(d.topicId) && nodeIds.has(d.prerequisiteId))
        .map(d => ({ source: d.prerequisiteId, target: d.topicId, strength: d.strength }));

      this.data.nodes = topics.map(t => ({
        id: t.id,
        name: t.name,
        subject: t.subject,
        grade: t.grade,
        difficulty: t.difficulty || 3,
        color: window.CNPT.constants.COLORS[t.subject] || '#888'
      }));
      this.data.links = links;
      this.data.nodeMap = new Map(this.data.nodes.map(n => [n.id, n]));

      // 无数据时显示空状态
      if (this.data.nodes.length === 0) {
        this.graphGroup.append('text')
          .attr('x', width / 2)
          .attr('y', height / 2)
          .attr('text-anchor', 'middle')
          .attr('fill', '#7f8c9a')
          .attr('font-size', '14')
          .text(this.emptyMessage);
        return;
      }

      this._drawGraph(this.data.nodes, links, width, height);
    }

    /**
     * 下钻到指定学科
     */
    drillDown(subject) {
      if (!this._lastTopics) return;
      const filtered = this._lastTopics.filter(t => t.subject === subject);
      this._drilldown = subject;
      this.render(filtered, this._lastDeps || []);
    }

    /**
     * 返回学科聚合总览
     */
    backToOverview() {
      this._drilldown = null;
      this.render(this._lastTopics || [], this._lastDeps || []);
    }

    /** 当前视图信息（供外部状态栏展示） */
    getViewInfo() {
      return this._aggInfo || { drilldown: null, aggregated: false };
    }

    // ---------------- 内部渲染 ----------------

    _renderAggregate(topics, deps, width, height) {
      this.graphGroup.selectAll('*').remove();

      const bySubject = new Map();
      for (const t of topics) {
        if (!bySubject.has(t.subject)) bySubject.set(t.subject, []);
        bySubject.get(t.subject).push(t);
      }
      const nodes = [...bySubject.entries()].map(([subject, arr]) => ({
        id: `__agg__${subject}`,
        name: subject,
        subject,
        count: arr.length,
        color: window.CNPT.constants.COLORS[subject] || '#888',
        aggregate: true
      }));

      const id2subj = new Map(topics.map(t => [t.id, t.subject]));
      const linkCount = new Map();
      for (const d of deps) {
        const a = id2subj.get(d.prerequisiteId);
        const b = id2subj.get(d.topicId);
        if (!a || !b || a === b) continue;
        const key = `${a}__${b}`;
        linkCount.set(key, (linkCount.get(key) || 0) + 1);
      }
      const links = [...linkCount.entries()].map(([k, n]) => {
        const idx = k.indexOf('__');
        return { source: `__agg__${k.slice(0, idx)}`, target: `__agg__${k.slice(idx + 2)}`, strength: 'hard', weight: n };
      });

      this.data = { nodes, links, nodeMap: new Map(nodes.map(n => [n.id, n])), aggregated: true };
      this._aggInfo = { aggregated: true, subjects: nodes.length, totalTopics: topics.length };
      this._drawGraph(nodes, links, width, height);
    }

    /**
     * 通用绘制：力导向 + SVG
     * @param {Array} nodes 节点数组（含 aggregate 标记时为聚合节点）
     * @param {Array} links 边数组（source/target 为节点 id）
     */
    _drawGraph(nodes, links, width, height) {
      const isAggregate = !!(nodes[0] && nodes[0].aggregate);
      // 大图降级：边数 > 500 只画硬依赖
      const showSoft = links.length <= 500;
      const visibleLinks = showSoft ? links : links.filter(l => l.strength === 'hard');

      // 创建力导向模拟
      const collisionRadius = nodes.length > 500 ? 6 : (nodes.length > 150 ? 9 : 12);
      this.simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(visibleLinks).id(d => d.id).distance(l => (l.strength === 'hard' ? 60 : 100)))
        .force('charge', d3.forceManyBody().strength(nodes.length > 500 ? -80 : -120))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(collisionRadius));

      // 绘制连线
      this.gLinks = this.graphGroup.append('g')
        .selectAll('line')
        .data(visibleLinks)
        .enter().append('line')
        .attr('stroke', l => l.strength === 'hard' ? '#e74c3c' : '#f39c12')
        .attr('stroke-opacity', l => l.strength === 'hard' ? 0.4 : 0.2)
        .attr('stroke-width', l => isAggregate ? Math.min(6, 1 + (l.weight || 1) / 2) : (l.strength === 'hard' ? 1.5 : 0.8))
        .attr('stroke-dasharray', l => l.strength === 'soft' ? '4,3' : null);

      // 绘制节点
      const nodeRadius = isAggregate
        ? (d => 14 + Math.min(26, Math.sqrt(d.count || 1) / 3))
        : this._calcNodeRadius(nodes.length);
      this.gNodes = this.graphGroup.append('g')
        .selectAll('circle')
        .data(nodes)
        .enter().append('circle')
        .attr('r', nodeRadius)
        .attr('fill', d => d.color)
        .attr('stroke', 'rgba(255,255,255,0.2)')
        .attr('stroke-width', 1)
        .attr('cursor', 'pointer')
        .on('click', (event, d) => {
          if (d.aggregate) {
            // 聚合节点：优先外部回调，否则默认下钻
            if (this.onAggregateClick) {
              const handled = this.onAggregateClick(d.subject);
              if (handled) return;
            }
            this.drillDown(d.subject);
            return;
          }
          this.onNodeClick(d);
        })
        .on('mouseover', (event, d) => this.onNodeHover(d))
        .on('mouseout', () => this.onNodeHover(null))
        .call(d3.drag()
          .on('start', (event, d) => {
            if (!event.active) this.simulation.alphaTarget(0.3).restart();
            d.fx = d.x; d.fy = d.y;
          })
          .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
          .on('end', (event, d) => {
            if (!event.active) this.simulation.alphaTarget(0);
            d.fx = null; d.fy = null;
          })
        );

      // 标签：聚合模式必显示；普通模式节点数 ≤ 500 时显示
      // （300 的原阈值在 337 节点等临界规模会整图无标签，故放宽到 500）
      const showLabels = isAggregate || nodes.length <= 500;
      if (showLabels) {
        this.gLabels = this.graphGroup.append('g')
          .selectAll('text')
          .data(nodes)
          .enter().append('text')
          .attr('class', 'cnpt-node-label')
          .attr('text-anchor', 'middle')
          .attr('dy', d => -(nodeRadius + 4))
          .attr('fill', '#c5cdd6')
          .attr('font-size', isAggregate ? '12px' : '10px')
          .attr('pointer-events', 'none')
          .text(d => isAggregate
            ? `${d.name} (${d.count})`
            : (d.name.length > 8 ? d.name.slice(0, 7) + '…' : d.name));
      } else {
        this.gLabels = null;
      }

      // 视图提示：聚合总览 / 下钻返回
      if (isAggregate) {
        this.graphGroup.append('text')
          .attr('x', 12).attr('y', 22)
          .attr('fill', '#8a97a6').attr('font-size', '12')
          .text(`已按学科聚合：${nodes.length} 个学科 · 共 ${this._aggInfo.totalTopics} 个知识点（点击学科下钻）`);
      } else if (this._drilldown) {
        const back = this.graphGroup.append('text')
          .attr('x', 12).attr('y', 22)
          .attr('fill', '#4a90d9').attr('font-size', '13')
          .attr('cursor', 'pointer')
          .text('← 返回学科总览')
          .on('click', () => this.backToOverview());
        back.append('title').text('返回学科聚合总览');
        this.graphGroup.append('text')
          .attr('x', 12).attr('y', 42)
          .attr('fill', '#8a97a6').attr('font-size', '12')
          .text(`当前学科：${this._drilldown} · ${nodes.length} 个知识点`);
      }

      // 力导向 tick
      this.simulation.on('tick', () => {
        this.gLinks
          .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
        this.gNodes
          .attr('cx', d => d.x).attr('cy', d => d.y);
        if (this.gLabels) {
          this.gLabels
            .attr('x', d => d.x).attr('y', d => d.y);
        }
      });

      // 模拟停止（可配置，默认 8 秒）
      setTimeout(() => {
        if (this.simulation) this.simulation.stop();
      }, this.simStopMs);
    }

    /**
     * 高亮节点
     */
    highlightNode(nodeId) {
      if (!this.gNodes) return;
      this.gNodes.attr('opacity', d => nodeId && d.id !== nodeId ? 0.2 : 1);
      if (this.gLinks) {
        this.gLinks.attr('stroke-opacity', d => {
          if (!nodeId) return d.strength === 'hard' ? 0.4 : 0.2;
          return (d.source.id === nodeId || d.target.id === nodeId) ? 0.6 : 0.05;
        });
      }
    }

    /**
     * 销毁图谱
     */
    destroy() {
      if (this.simulation) {
        this.simulation.on('tick', null);
        this.simulation.stop();
        this.simulation = null;
      }
      if (this.svg) this.svg.on('.zoom', null);
      this.svg = null;
      this.graphGroup = null;
      this.zoomBehavior = null;
      this.gLinks = null;
      this.gNodes = null;
      this.gLabels = null;
      this.data = { nodes: [], links: [], nodeMap: new Map() };
      this._drilldown = null;
      this._aggInfo = null;
    }

    _calcNodeRadius(count) {
      if (count <= 50) return 8;
      if (count <= 150) return 6;
      if (count <= 500) return 4.5;
      return 3;
    }
  }

  window.CNPT.graph = window.CNPT.graph || {};
  window.CNPT.graph.PCGraph = PCGraph;
})();
