/*!
 * CN-Primary-Taxonomy · 共享组件：掌握度追踪行
 * 提供统一的掌握度(已掌握/学习中/未开始)三态按钮
 * 供parent/student/h5角色使用
 */
(function() {
  'use strict';

  /**
   * 渲染掌握度按钮行
   * @param {HTMLElement} container - 容器元素
   * @param {string} topicId - 知识点ID
   * @param {Object} storage - CNPT.storage实例
   * @param {Object} [callbacks] - 回调函数
   * @param {Function} [callbacks.onStatusChange] - 状态变更回调
   * @param {Function} [callbacks.onStatsUpdate] - 统计更新回调
   */
  function renderMasteryRow(container, topicId, storage, callbacks = {}) {
    if (!container) return;

    const currentStatus = storage.getTopicStatus(topicId);
    const btns = [
      { status: 'mastered', label: '✓ 已掌握', cls: 'cnpt-mastery-btn-mastered' },
      { status: 'learning', label: '📖 学习中', cls: 'cnpt-mastery-btn-learning' },
      { status: 'not-started', label: '○ 未开始', cls: 'cnpt-mastery-btn-not-started' }
    ];

    container.innerHTML = `
      <div class="cnpt-mastery-row">
        <span class="cnpt-mastery-label">掌握状态：</span>
        <div class="cnpt-mastery-btns">
          ${btns.map(b => `
            <button class="cnpt-mastery-btn ${b.cls} ${currentStatus === b.status ? 'active' : ''}"
                    data-status="${b.status}"
                    data-topic-id="${topicId}">
              ${b.label}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    // 事件委托
    const btnsContainer = container.querySelector('.cnpt-mastery-btns');
    if (btnsContainer) {
      btnsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.cnpt-mastery-btn');
        if (!btn) return;

        const newStatus = btn.dataset.status;
        storage.setTopicStatus(topicId, newStatus);

        // 更新按钮视觉状态
        btnsContainer.querySelectorAll('.cnpt-mastery-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // 触发回调
        if (callbacks.onStatusChange) callbacks.onStatusChange(topicId, newStatus);
        if (callbacks.onStatsUpdate) callbacks.onStatsUpdate();
      });
    }
  }

  /**
   * 更新掌握度统计显示
   * @param {HTMLElement} container - 统计容器
   * @param {Object} storage - CNPT.storage实例
   * @param {number} totalTopics - 知识点总数
   */
  function updateStatsDisplay(container, storage, totalTopics) {
    if (!container) return;

    const stats = storage.getStats();
    container.innerHTML = `
      <div class="cnpt-stats-row">
        <span class="cnpt-stat cnpt-stat-mastered">✓ 已掌握 ${stats.mastered}</span>
        <span class="cnpt-stat cnpt-stat-learning">📖 学习中 ${stats.learning}</span>
        <span class="cnpt-stat cnpt-stat-remaining">○ 待学习 ${totalTopics - stats.mastered - stats.learning}</span>
      </div>
    `;
  }

  // 注入所需CSS（如果尚未存在）
  function injectStyles() {
    if (document.getElementById('cnpt-mastery-styles')) return;
    const style = document.createElement('style');
    style.id = 'cnpt-mastery-styles';
    style.textContent = `
      .cnpt-mastery-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 12px 0;
      }
      .cnpt-mastery-label {
        font-size: 13px;
        color: #666;
        white-space: nowrap;
      }
      .cnpt-mastery-btns {
        display: flex;
        gap: 4px;
      }
      .cnpt-mastery-btn {
        padding: 4px 10px;
        font-size: 12px;
        border: 1px solid #ddd;
        background: #fff;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .cnpt-mastery-btn:hover { border-color: #bbb; background: #f8f9fa; }
      .cnpt-mastery-btn-mastered.active { background: #d4edda; border-color: #28a745; color: #155724; }
      .cnpt-mastery-btn-learning.active { background: #fff3cd; border-color: #ffc107; color: #856404; }
      .cnpt-mastery-btn-not-started.active { background: #f8f9fa; border-color: #6c757d; color: #495057; }
      .cnpt-stats-row {
        display: flex;
        gap: 16px;
        font-size: 13px;
        padding: 8px 0;
      }
      .cnpt-stat { white-space: nowrap; }
      .cnpt-stat-mastered { color: #28a745; }
      .cnpt-stat-learning { color: #ffc107; }
      .cnpt-stat-remaining { color: #6c757d; }
    `;
    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectStyles);
  } else {
    injectStyles();
  }

  // 注册到CNPT命名空间
  window.CNPT = window.CNPT || {};
  window.CNPT.components = window.CNPT.components || {};
  window.CNPT.components.renderMasteryRow = renderMasteryRow;
  window.CNPT.components.updateStatsDisplay = updateStatsDisplay;

})();
