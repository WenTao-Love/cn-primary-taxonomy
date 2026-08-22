/*!
 * CN-Primary-Taxonomy · 搜索引擎
 * 支持关键词搜索、多维度筛选、智能排序
 */
(function() {
  'use strict';

  window.CNPT = window.CNPT || {};

  /**
   * 对单个知识点进行搜索评分
   * @param {object} topic - 知识点对象
   * @param {string} query - 搜索关键词
   * @returns {number} 匹配分数 (0 = 不匹配)
   */
  function scoreTopic(topic, query) {
    if (!query || !topic) return 0;
    const q = query.toLowerCase().trim();
    if (!q) return 0;

    const searchText = window.CNPT.indices.getSearchText(topic.id) || '';
    let score = 0;

    // 名称完全/部分匹配 (权重最高)
    const nameLC = (topic.name || '').toLowerCase();
    if (nameLC === q) score += 20;
    else if (nameLC.startsWith(q)) score += 12;
    else if (nameLC.includes(q)) score += 8;

    // 搜索文本匹配
    if (searchText.includes(q)) score += 4;

    // 分词匹配
    const tokens = q.split(/[，。；、,;\s]+/).filter(t => t.length >= 2);
    tokens.forEach(token => {
      if (searchText.includes(token)) score += 2;
      if (nameLC.includes(token)) score += 3;
    });

    // ID匹配
    if ((topic.id || '').toLowerCase().includes(q)) score += 6;

    return score;
  }

  /**
   * 搜索知识点
   * @param {string} query - 搜索关键词
   * @param {object} options - { limit, filterFn }
   * @returns {Array<{topic, score}>}
   */
  function search(query, options = {}) {
    const { limit = 30, filterFn = null } = options;
    const topicMap = window.CNPT.indices.getTopicMap();
    const results = [];

    topicMap.forEach(topic => {
      if (filterFn && !filterFn(topic)) return;
      const score = scoreTopic(topic, query);
      if (score > 0) {
        results.push({ topic, score });
      }
    });

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }

  /**
   * 多维度筛选知识点
   * @param {object} filters - { grades, subjects, textbooks, layer }
   * @param {Array} fullTopics - 全量话题数组
   * @returns {Array} 筛选后的知识点
   */
  function filterTopics(filters, fullTopics) {
    const { grades, subjects, textbooks, layer } = filters;
    return fullTopics.filter(topic => {
      if (grades && grades.size > 0 && !grades.has(String(topic.grade))) return false;
      if (subjects && subjects.size > 0 && !subjects.has(topic.subject)) return false;
      if (textbooks && textbooks.size > 0 && !textbooks.has(topic.textbook || '未标注版本')) return false;
      if (layer === 'core' && topic.parentTopicId) return false;
      return true;
    });
  }

  /**
   * 获取筛选结果的缓存键
   */
  function getFilterCacheKey(filters) {
    const g = [...(filters.grades || [])].sort().join(',');
    const s = [...(filters.subjects || [])].sort().join(',');
    const t = [...(filters.textbooks || [])].sort().join(',');
    const l = filters.layer || 'core';
    return `${g}|${s}|${t}|${l}`;
  }

  /**
   * 构建知识点搜索结果摘要文本
   * 包含教材版本信息以消歧同名知识点
   */
  function buildResultMeta(topic) {
    const parts = [];
    parts.push(`${topic.grade}年级${topic.term || ''}`);
    if (topic.subject) parts.push(topic.subject);
    if (topic.textbook) parts.push(topic.textbook);
    if (topic.subnodeType) parts.push(topic.subnodeType);
    return parts.join(' · ');
  }

  /**
   * 检测同名知识点（跨教材版本）
   * @param {Array} results - 搜索结果数组
   * @returns {Map<string, number>} 同名计数
   */
  function detectDuplicateNames(results) {
    const nameCount = new Map();
    results.forEach(({ topic }) => {
      const name = topic.name || '';
      nameCount.set(name, (nameCount.get(name) || 0) + 1);
    });
    return nameCount;
  }

  /**
   * 构建带版本标签的搜索结果HTML
   * 同名知识点会显示教材版本标签以便区分
   * @param {Array} results - 搜索结果
   * @param {string} query - 搜索关键词
   * @param {object} options - { contentRenderer }
   *   contentRenderer: (topic, ctx) => string - 自定义整个内容区域（包含名称+标签+元信息）
   */
  function buildSearchResultHTML(results, query, options = {}) {
    if (!results.length) {
      return '<div class="cnpt-search-result-item"><span class="srn">无匹配结果</span></div>';
    }

    const { contentRenderer = null } = options;
    const nameCount = detectDuplicateNames(results);

    return results.map(({ topic, score }) => {
      const ctx = {
        isDuplicate: nameCount.get(topic.name) > 1,
        versionTag: nameCount.get(topic.name) > 1 && topic.textbook
          ? `<span class="cnpt-version-tag">${topic.textbook}</span>`
          : '',
        name: window.CNPT.utils.escapeHtml(topic.name),
        meta: buildResultMeta(topic)
      };

      const inner = contentRenderer
        ? contentRenderer(topic, ctx)
        : `<div>${ctx.name}${ctx.versionTag ? ' ' + ctx.versionTag : ''}</div><div class="srd">${ctx.meta}</div>`;

      return `<div class="cnpt-search-result-item" data-id="${topic.id}">${inner}</div>`;
    }).join('');
  }

  window.CNPT.search = {
    scoreTopic,
    search,
    filterTopics,
    getFilterCacheKey,
    buildResultMeta,
    detectDuplicateNames,
    buildSearchResultHTML
  };
})();
