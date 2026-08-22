/*!
 * CN-Primary-Taxonomy · 共享组件：知识点标签构建
 * 构建学科/领域/年级/难度彩色标签
 * 供parent/teacher/h5角色使用
 */
(function() {
  'use strict';

  /**
   * 构建知识点彩色标签HTML
   * @param {Object} topic - 知识点数据对象
   * @param {Object} [options] - 配置选项
   * @param {boolean} [options.showSubject=true] - 显示学科标签
   * @param {boolean} [options.showDomain=true] - 显示领域标签
   * @param {boolean} [options.showGrade=true] - 显示年级标签
   * @param {boolean} [options.showDifficulty=true] - 显示难度标签
   * @param {string} [options.size='md'] - 标签尺寸: sm/md/lg
   * @returns {string} HTML字符串
   */
  function buildTopicTags(topic, options = {}) {
    const {
      showSubject = true,
      showDomain = true,
      showGrade = true,
      showDifficulty = true,
      size = 'md'
    } = options;

    const COLORS = window.CNPT.constants.COLORS;
    const DIFFICULTY = window.CNPT.constants.DIFFICULTY || ['', '一', '二', '三', '四', '五'];
    const utils = window.CNPT.utils;

    const sizeClass = size === 'sm' ? 'cnpt-tag-sm' : size === 'lg' ? 'cnpt-tag-lg' : '';
    const tags = [];

    // 学科标签（彩色）
    if (showSubject && topic.subject) {
      const color = COLORS[topic.subject] || '#95a5a6';
      tags.push(`<span class="cnpt-tag ${sizeClass}" style="background:${color}">${utils.escapeHtml(topic.subject)}</span>`);
    }

    // 领域标签（灰色）
    if (showDomain && topic.domain) {
      tags.push(`<span class="cnpt-tag cnpt-tag-gray ${sizeClass}">${utils.escapeHtml(topic.domain)}</span>`);
    }

    // 年级标签（蓝色）
    if (showGrade && topic.grade) {
      tags.push(`<span class="cnpt-tag cnpt-tag-blue ${sizeClass}">${utils.escapeHtml(String(topic.grade))}年级</span>`);
    }

    // 难度标签（渐变色）
    if (showDifficulty && topic.difficulty) {
      const diffColor = getDifficultyColor(topic.difficulty);
      const diffLabel = DIFFICULTY[topic.difficulty] || topic.difficulty;
      tags.push(`<span class="cnpt-tag ${sizeClass}" style="background:${diffColor}">难度${utils.escapeHtml(String(diffLabel))}</span>`);
    }

    return tags.join('');
  }

  /**
   * 获取难度对应颜色
   * @param {number} level - 难度等级 1-5
   * @returns {string} 颜色hex
   */
  function getDifficultyColor(level) {
    const colors = {
      1: '#27ae60',  // 绿 - 简单
      2: '#2ecc71',
      3: '#f39c12',  // 黄 - 中等
      4: '#e67e22',
      5: '#e74c3c'   // 红 - 困难
    };
    return colors[level] || '#95a5a6';
  }

  /**
   * 构建教材版本标签
   * @param {string} textbook - 教材版本名称
   * @returns {string} HTML字符串
   */
  function buildTextbookTag(textbook) {
    if (!textbook) return '';
    return `<span class="cnpt-tag cnpt-tag-purple">${window.CNPT.utils.escapeHtml(textbook)}</span>`;
  }

  /**
   * 构建掌握度状态标签
   * @param {string} status - 状态: mastered/learning/not-started
   * @returns {string} HTML字符串
   */
  function buildMasteryTag(status) {
    const statusMap = {
      'mastered': { text: '已掌握', cls: 'cnpt-tag-green' },
      'learning': { text: '学习中', cls: 'cnpt-tag-orange' },
      'not-started': { text: '未开始', cls: 'cnpt-tag-gray' }
    };
    const info = statusMap[status];
    if (!info) return '';
    return `<span class="cnpt-tag ${info.cls}">${info.text}</span>`;
  }

  // 注册到CNPT命名空间
  window.CNPT = window.CNPT || {};
  window.CNPT.components = window.CNPT.components || {};
  window.CNPT.components.buildTopicTags = buildTopicTags;
  window.CNPT.components.buildTextbookTag = buildTextbookTag;
  window.CNPT.components.buildMasteryTag = buildMasteryTag;
  window.CNPT.components.getDifficultyColor = getDifficultyColor;

})();
