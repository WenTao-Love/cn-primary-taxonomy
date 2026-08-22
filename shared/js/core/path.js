/*!
 * CN-Primary-Taxonomy · 学习路径算法
 * 拓扑排序、依赖链追溯、学习路径推荐
 */
(function() {
  'use strict';

  window.CNPT = window.CNPT || {};

  /**
   * 获取某个知识点的所有前置依赖（递归）
   * @param {string} topicId - 目标知识点ID
   * @returns {Set<string>} 所有前置知识点ID集合
   */
  function getAncestorIds(topicId) {
    const visited = new Set();
    const queue = [topicId];

    while (queue.length > 0) {
      const current = queue.shift();
      const incoming = window.CNPT.indices.getIncoming(current);
      incoming.forEach(edge => {
        if (!visited.has(edge.source)) {
          visited.add(edge.source);
          queue.push(edge.source);
        }
      });
    }

    return visited;
  }

  /**
   * 获取以目标知识点为根的子图（包含其所有前置）
   * @param {string} topicId - 目标知识点ID
   * @returns {Set<string>} 子图知识点ID集合（含目标自身）
   */
  function getSubgraphIds(topicId) {
    const ancestors = getAncestorIds(topicId);
    ancestors.add(topicId);
    return ancestors;
  }

  /**
   * 对知识点集合进行拓扑排序（Kahn算法 + 难度感知）
   * 保证：所有前置依赖排在前面，同一层级内按难度由易到难排列
   * @param {Array<string>} ids - 知识点ID数组
   * @returns {Array<string>} 排序后的ID数组
   */
  function topologicalSort(ids) {
    const idSet = new Set(ids);
    const inDegree = new Map();
    const graph = new Map();
    const topicMap = window.CNPT.indices.getTopicMap();

    // 初始化
    ids.forEach(id => {
      inDegree.set(id, 0);
      graph.set(id, []);
    });

    // 构建子图内的入边统计
    ids.forEach(id => {
      const incoming = window.CNPT.indices.getIncoming(id);
      incoming.forEach(edge => {
        if (idSet.has(edge.source)) {
          graph.get(edge.source).push(id);
          inDegree.set(id, inDegree.get(id) + 1);
        }
      });
    });

    // Kahn算法 + 难度感知优先队列
    // 入度为0的节点中，优先选择难度最低的（由易到难）
    const queue = ids.filter(id => inDegree.get(id) === 0);
    queue.sort((a, b) => {
      const diffA = (topicMap.get(a)?.difficulty || 3);
      const diffB = (topicMap.get(b)?.difficulty || 3);
      return diffA - diffB; // 难度低的优先
    });
    const result = [];

    while (queue.length > 0) {
      const current = queue.shift();
      result.push(current);
      const neighbors = graph.get(current) || [];
      neighbors.forEach(neighbor => {
        const newDegree = inDegree.get(neighbor) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) queue.push(neighbor);
      });
      // 每次有新的节点入队时，重新按难度排序
      if (queue.length > 1) {
        queue.sort((a, b) => {
          const diffA = (topicMap.get(a)?.difficulty || 3);
          const diffB = (topicMap.get(b)?.difficulty || 3);
          return diffA - diffB;
        });
      }
    }

    return result;
  }

  /**
   * 生成到目标知识点的推荐学习路径
   * @param {string} topicId - 目标知识点ID
   * @param {object} options - { maxNodes, excludeMastered, masteryData }
   * @returns {Array<object>} 排序后的学习路径
   */
  function buildLearningPath(topicId, options = {}) {
    const { maxNodes = 20, excludeMastered = false, masteryData = {} } = options;

    const subgraphIds = getSubgraphIds(topicId);
    const sortedIds = topologicalSort([...subgraphIds]);

    let path = sortedIds.map(id => window.CNPT.indices.getTopicMap().get(id)).filter(Boolean);

    // 排除已掌握的
    if (excludeMastered) {
      path = path.filter(t => masteryData[t.id] !== 'mastered');
    }

    // 不再做全局难度排序，topologicalSort已经保证：
    // 1. 所有前置依赖排在前面
    // 2. 同一层级内按难度由易到难

    return path.slice(0, maxNodes);
  }

  /**
   * 生成某年级某学科的推荐学习路径（未掌握优先）
   * @param {number} grade - 年级
   * @param {string} subject - 学科
   * @param {object} options - { maxNodes, excludeMastered, masteryData }
   * @returns {Array<object>}
   */
  function buildSubjectPath(grade, subject, options = {}) {
    const { maxNodes = 15, excludeMastered = true, masteryData = {} } = options;
    const topicMap = window.CNPT.indices.getTopicMap();

    // 获取年级学科下的所有知识点 (grade=undefined 表示全部年级)
    const relatedTopics = [];
    topicMap.forEach(topic => {
      if ((grade === undefined || topic.grade === grade) && topic.subject === subject) {
        relatedTopics.push(topic);
      }
    });

    const ids = relatedTopics.map(t => t.id);
    const sortedIds = topologicalSort(ids);

    let path = sortedIds.map(id => topicMap.get(id)).filter(Boolean);
    if (excludeMastered) {
      path = path.filter(t => masteryData[t.id] !== 'mastered');
    }
    // 不再做全局难度排序，topologicalSort已经保证依赖顺序和难度优先级

    return path.slice(0, maxNodes);
  }

  /**
   * 获取知识点的"熟练前置"链（仅强依赖）
   * @param {string} topicId
   * @returns {Array<{topic, edge}>}
   */
  function getHardPrerequisites(topicId) {
    const incoming = window.CNPT.indices.getIncoming(topicId);
    return incoming
      .filter(e => e.strength === 'hard')
      .map(e => ({
        topic: window.CNPT.indices.getTopicMap().get(e.source),
        edge: e
      }))
      .filter(item => item.topic);
  }

  /**
   * 获取知识点的"建议前置"链（仅弱依赖）
   * @param {string} topicId
   * @returns {Array<{topic, edge}>}
   */
  function getSoftPrerequisites(topicId) {
    const incoming = window.CNPT.indices.getIncoming(topicId);
    return incoming
      .filter(e => e.strength === 'soft')
      .map(e => ({
        topic: window.CNPT.indices.getTopicMap().get(e.source),
        edge: e
      }))
      .filter(item => item.topic);
  }

  /**
   * 获取知识点的后续知识点
   * @param {string} topicId
   * @returns {Array<{topic, edge}>}
   */
  function getSuccessors(topicId) {
    const outgoing = window.CNPT.indices.getOutgoing(topicId);
    return outgoing.map(e => ({
      topic: window.CNPT.indices.getTopicMap().get(e.target),
      edge: e
    })).filter(item => item.topic);
  }

  window.CNPT.path = {
    getAncestorIds,
    getSubgraphIds,
    topologicalSort,
    buildLearningPath,
    buildSubjectPath,
    getHardPrerequisites,
    getSoftPrerequisites,
    getSuccessors
  };
})();
