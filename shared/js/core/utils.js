/*!
 * CN-Primary-Taxonomy · 通用工具函数
 */
(function() {
  'use strict';

  window.CNPT = window.CNPT || {};

  /**
   * 防抖函数
   */
  function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /**
   * HTML转义（防XSS）
   */
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * 显示Toast提示
   */
  function showToast(message, duration = 2000) {
    let toast = document.getElementById('cnpt-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cnpt-toast';
      toast.className = 'cnpt-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
  }

  /**
   * 构建教练式引导文案
   */
  function buildCoachText(topic, hardPrereqs, successors) {
    const firstName = hardPrereqs[0]?.topic?.name;
    const evidence = topic.evidence?.[0];
    const mistake = topic.commonMistakes?.[0];
    const action = topic.practiceChain?.[0] || topic.assessmentTasks?.[0] || evidence;

    let text = `如果孩子在"${topic.name}"这里卡住，先别急。`;
    if (firstName) text += `优先先补"${firstName}"，这是基础。`;
    if (action) text += `可以带孩子做"${action}"。`;
    if (mistake) text += `注意常见问题："${mistake}"。`;
    if (successors[0]) text += `稳住后往"${successors[0].topic.name}"推进。`;
    return text;
  }

  /**
   * 构建可渲染的图谱数据
   */
  function buildGraphData(filteredTopics, allDeps) {
    const limit = window.CNPT.constants.MAX_RENDER_NODES.core;
    const nodes = filteredTopics.slice(0, limit);
    const nodeIds = new Set(nodes.map(n => n.id));
    const links = allDeps.filter(d => nodeIds.has(d.topicId) && nodeIds.has(d.prerequisiteId));
    return { nodes, links, truncated: filteredTopics.length > limit };
  }

  /**
   * 本地时区的日期键（YYYY-MM-DD），用于每日预算/复习日志
   */
  function localDateKey(date) {
    const d = date || new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  /**
   * 隐藏加载指示器
   */
  function hideLoadingScreen() {
    const loader = document.getElementById('cnpt-loading');
    if (loader) {
      loader.classList.add('cnpt-loading-hidden');
      setTimeout(() => loader.remove(), 400);
    }
  }

  /**
   * 更新加载进度文本
   */
  function updateLoadingProgress(text) {
    const el = document.querySelector('#cnpt-loading .cnpt-loading-progress');
    if (el) el.textContent = text;
  }

  window.CNPT.utils = {
    debounce,
    escapeHtml,
    showToast,
    buildCoachText,
    buildGraphData,
    localDateKey,
    hideLoadingScreen,
    updateLoadingProgress
  };
})();
