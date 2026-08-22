/*!
 * CN-Primary-Taxonomy · PC端知识图谱渲染 (D3.js)
 * 所有PC版用户角色共享的图谱渲染引擎
 */
(function() {
  'use strict';

  window.CNPT = window.CNPT || {};

  /**
   * PC图谱渲染器
   */
  class PCGraph {
    constructor(containerId, options = {}) {
      this.containerId = containerId;
      this.svg = null;
      this.graphGroup = null;
      this.zoomBehavior = null;
      this.simulation = null;
      this.gLinks = null;
      this.gNodes = null;
      this.data = { nodes: [], links: [], nodeMap: new Map() };
      this.transform = { x: 0, y: 0, k: 1 };
      this.onNodeClick = options.onNodeClick || (() => {});
      this.onNodeHover = options.onNodeHover || (() => {});
      this.emptyMessage = options.emptyMessage || '没有匹配的节点';
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
     * 渲染图谱
     */
    render(topics, deps) {
      if (!this.svg) this.initCanvas();
      
      // 停止旧 simulation，防止多次渲染时模拟泄漏
      if (this.simulation) {
        this.simulation.stop();
        this.simulation = null;
      }

      const container = document.getElementById(this.containerId);
      const width = container.clientWidth;
      const height = container.clientHeight;

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

      // 创建力导向模拟
      this.simulation = d3.forceSimulation(this.data.nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(l => l.strength === 'hard' ? 60 : 100))
        .force('charge', d3.forceManyBody().strength(-120))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(12));

      // 绘制连线
      this.gLinks = this.graphGroup.append('g')
        .selectAll('line')
        .data(links)
        .enter().append('line')
        .attr('stroke', l => l.strength === 'hard' ? '#e74c3c' : '#f39c12')
        .attr('stroke-opacity', l => l.strength === 'hard' ? 0.4 : 0.2)
        .attr('stroke-width', l => l.strength === 'hard' ? 1.5 : 0.8)
        .attr('stroke-dasharray', l => l.strength === 'soft' ? '4,3' : null);

      // 绘制节点
      const nodeRadius = this._calcNodeRadius(this.data.nodes.length);
      this.gNodes = this.graphGroup.append('g')
        .selectAll('circle')
        .data(this.data.nodes)
        .enter().append('circle')
        .attr('r', nodeRadius)
        .attr('fill', d => d.color)
        .attr('stroke', 'rgba(255,255,255,0.2)')
        .attr('stroke-width', 1)
        .attr('cursor', 'pointer')
        .on('click', (event, d) => this.onNodeClick(d))
        .on('mouseover', (event, d) => this.onNodeHover(d, event))
        .on('mouseout', () => this.onNodeHover(null))
        .call(d3.drag()
          .on('start', (event, d) => {
            if (!event.active) this.simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) this.simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
        );

      // 绘制标签（仅当节点数较少时）
      if (this.data.nodes.length <= 200) {
        this.graphGroup.append('g')
          .selectAll('text')
          .data(this.data.nodes)
          .enter().append('text')
          .attr('class', 'cnpt-node-label')
          .attr('text-anchor', 'middle')
          .attr('dy', d => -(nodeRadius + 4))
          .attr('fill', '#c5cdd6')
          .attr('font-size', '10px')
          .attr('pointer-events', 'none')
          .text(d => d.name.length > 8 ? d.name.slice(0, 7) + '…' : d.name);
      }

      // 力导向tick
      this.simulation.on('tick', () => {
        this.gLinks
          .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
        this.gNodes
          .attr('cx', d => d.x).attr('cy', d => d.y);
      });

      // 10秒后停止模拟
      setTimeout(() => {
        if (this.simulation) this.simulation.stop();
      }, 10000);
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
      this.data = { nodes: [], links: [], nodeMap: new Map() };
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
