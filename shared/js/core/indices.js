/*!
 * CN-Primary-Taxonomy · 索引构建器
 * 构建搜索、依赖关系、反向索引等核心数据结构
 */
(function() {
  'use strict';

  window.CNPT = window.CNPT || {};

  /**
   * 索引容器
   */
  const indices = {
    topicMap: new Map(),
    incomingMap: new Map(),
    outgoingMap: new Map(),
    searchTextMap: new Map(),
    initialized: false
  };

  /**
   * 构建所有索引
   * @param {object} fullData - {topics, dependencies, clusters}
   */
  function buildIndices(fullData) {
    if (!fullData || !fullData.topics) return;

    const topics = fullData.topics.topics;
    const deps = fullData.dependencies ? fullData.dependencies.dependencies : [];

    // 重置
    indices.topicMap = new Map();
    indices.incomingMap = new Map();
    indices.outgoingMap = new Map();
    indices.searchTextMap = new Map();

    // 构建topicMap和搜索文本
    topics.forEach(topic => {
      indices.topicMap.set(topic.id, topic);
      indices.incomingMap.set(topic.id, []);
      indices.outgoingMap.set(topic.id, []);
      indices.searchTextMap.set(topic.id, buildSearchText(topic));
    });

    // 构建依赖关系图
    deps.forEach(dep => {
      const edge = {
        source: dep.prerequisiteId,
        target: dep.topicId,
        strength: dep.strength,
        reason: dep.reason
      };
      if (indices.incomingMap.has(dep.topicId)) {
        indices.incomingMap.get(dep.topicId).push(edge);
      }
      if (indices.outgoingMap.has(dep.prerequisiteId)) {
        indices.outgoingMap.get(dep.prerequisiteId).push(edge);
      }
    });

    indices.initialized = true;
  }

  /**
   * 构建单个知识点的全文搜索文本
   */
  function buildSearchText(topic) {
    const rubricText = topic.skillRubric ?
      Object.values(topic.skillRubric).flat().join(' ') : '';
    const evalText = Array.isArray(topic.evaluationRubric) ?
      topic.evaluationRubric.flatMap(item =>
        [item.dimension, ...(item.indicators || [])]
      ).join(' ') : '';
    const resourceText = (topic.resources || [])
      .flatMap(r => [r.title, r.note, r.externalWorkId, r.resourceUnitKey])
      .filter(Boolean).join(' ');

    return [
      topic.name,
      topic.domain || '',
      topic.description || '',
      topic.subject,
      topic.textbook || '',
      topic.volume || '',
      topic.unit || '',
      topic.chapter || '',
      topic.lesson || '',
      topic.module || '',
      topic.subnodeType || '',
      topic.pageRange || '',
      (topic.practiceChain || []).join(' '),
      (topic.assessmentTasks || []).join(' '),
      rubricText,
      evalText,
      resourceText
    ].join(' ').toLowerCase();
  }

  /**
   * 获取topicMap
   */
  function getTopicMap() { return indices.topicMap; }

  /**
   * 获取知识点的入边（前置依赖）
   */
  function getIncoming(id) { return indices.incomingMap.get(id) || []; }

  /**
   * 获取知识点的出边（后续知识）
   */
  function getOutgoing(id) { return indices.outgoingMap.get(id) || []; }

  /**
   * 获取搜索文本
   */
  function getSearchText(id) { return indices.searchTextMap.get(id) || ''; }

  /**
   * 判断索引是否已初始化
   */
  function isInitialized() { return indices.initialized; }

  /**
   * 获取统计信息
   */
  function getStats() {
    return {
      topicCount: indices.topicMap.size,
      withIncoming: [...indices.incomingMap.values()].filter(v => v.length > 0).length,
      withOutgoing: [...indices.outgoingMap.values()].filter(v => v.length > 0).length
    };
  }

  window.CNPT.indices = {
    buildIndices,
    buildSearchText,
    getTopicMap,
    getIncoming,
    getOutgoing,
    getSearchText,
    isInitialized,
    getStats
  };
})();
