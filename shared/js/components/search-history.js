/*!
 * CN-Primary-Taxonomy · 搜索历史组件
 * 记录最近搜索关键词，支持点击复用和清除
 * 使用方式：CNPT.components.initSearchHistory(inputSelector, onSelect)
 */
(function() {
  'use strict';

  window.CNPT = window.CNPT || {};
  window.CNPT.components = window.CNPT.components || {};

  const STORAGE_KEY = 'cnpt_search_history';
  const MAX_HISTORY = 10;

  /**
   * 获取搜索历史
   */
  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  /**
   * 添加搜索记录
   */
  function addHistory(query) {
    if (!query || query.trim().length < 1) return;
    const q = query.trim();
    let history = getHistory();
    // 去重
    history = history.filter(item => item !== q);
    // 添加到头部
    history.unshift(q);
    // 限制数量
    if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) { /* ignore */ }
  }

  /**
   * 清除搜索历史
   */
  function clearHistory() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) { /* ignore */ }
  }

  /**
   * 移除单条记录
   */
  function removeHistoryItem(query) {
    let history = getHistory().filter(item => item !== query);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) { /* ignore */ }
  }

  /**
   * 初始化搜索历史UI
   * @param {string} inputSelector - 搜索输入框选择器
   * @param {function} onSelect - 点击历史记录时的回调
   */
  function initSearchHistory(inputSelector, onSelect) {
    const input = document.querySelector(inputSelector);
    if (!input) return;

    // 创建历史面板
    const panel = document.createElement('div');
    panel.className = 'cnpt-search-history-panel';
    panel.id = 'cnpt-search-history-panel';
    panel.style.display = 'none';

    // 插入到input之后
    input.parentNode.style.position = 'relative';
    input.parentNode.appendChild(panel);

    // 点击input时显示历史
    input.addEventListener('focus', updateHistoryPanel);
    input.addEventListener('input', () => {
      const history = getHistory();
      if (input.value.trim().length === 0 && history.length > 0) {
        panel.style.display = 'block';
        updateHistoryPanel();
      }
    });

    // 点击外部关闭
    document.addEventListener('click', (e) => {
      if (!e.target.closest(`#${panel.id}`) && e.target !== input) {
        panel.style.display = 'none';
      }
    });

    function updateHistoryPanel() {
      const history = getHistory();
      if (history.length === 0) {
        panel.innerHTML = '<div class="cnpt-sh-empty">暂无搜索记录</div>';
        return;
      }

      panel.innerHTML = `
        <div class="cnpt-sh-header">
          <span>🕐 搜索历史</span>
          <button class="cnpt-sh-clear" id="cnpt-sh-clear">清除</button>
        </div>
        <div class="cnpt-sh-list">
          ${history.map(item => `
            <div class="cnpt-sh-item" data-query="${window.CNPT.utils.escapeHtml(item)}">
              <span class="cnpt-sh-query">🕐 ${window.CNPT.utils.escapeHtml(item)}</span>
              <button class="cnpt-sh-remove" title="移除">×</button>
            </div>
          `).join('')}
        </div>
      `;

      // 绑定事件
      panel.querySelectorAll('.cnpt-sh-item').forEach(el => {
        el.addEventListener('click', (e) => {
          if (e.target.classList.contains('cnpt-sh-remove')) return;
          const query = el.dataset.query;
          input.value = query;
          panel.style.display = 'none';
          addHistory(query);
          if (onSelect) onSelect(query);
        });
      });

      panel.querySelectorAll('.cnpt-sh-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const query = btn.closest('.cnpt-sh-item').dataset.query;
          removeHistoryItem(query);
          updateHistoryPanel();
        });
      });

      const clearBtn = panel.querySelector('#cnpt-sh-clear');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          clearHistory();
          panel.style.display = 'none';
          window.CNPT.utils.showToast('搜索历史已清除');
        });
      }
    }
  }

  /**
   * 注入样式
   */
  function injectStyles() {
    if (document.getElementById('cnpt-search-history-styles')) return;
    const style = document.createElement('style');
    style.id = 'cnpt-search-history-styles';
    style.textContent = `
      .cnpt-search-history-panel {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--cnpt-bg-card, #fff);
        border: 1px solid var(--cnpt-border, #e2e8f0);
        border-radius: 0 0 12px 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        z-index: 100;
        max-height: 280px;
        overflow-y: auto;
        margin-top: -1px;
      }
      .cnpt-sh-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 14px;
        border-bottom: 1px solid var(--cnpt-border, #e2e8f0);
        font-size: 12px;
        color: var(--cnpt-text-muted, #94a3b8);
      }
      .cnpt-sh-clear {
        background: none;
        border: none;
        color: var(--cnpt-primary, #3b82f6);
        font-size: 12px;
        cursor: pointer;
        padding: 2px 6px;
      }
      .cnpt-sh-clear:hover { text-decoration: underline; }
      .cnpt-sh-list { padding: 4px 0; }
      .cnpt-sh-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 14px;
        cursor: pointer;
        transition: background 0.15s;
      }
      .cnpt-sh-item:hover { background: var(--cnpt-bg-hover, rgba(59,130,246,0.06)); }
      .cnpt-sh-query { font-size: 13px; color: var(--cnpt-text-main, #1e293b); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .cnpt-sh-remove { background: none; border: none; color: #94a3b8; font-size: 16px; cursor: pointer; padding: 2px 6px; opacity: 0.6; }
      .cnpt-sh-remove:hover { opacity: 1; color: #ef4444; }
      .cnpt-sh-empty { padding: 12px 14px; font-size: 12px; color: var(--cnpt-text-muted, #94a3b8); text-align: center; }
    `;
    document.head.appendChild(style);
  }

  /**
   * 初始化搜索历史（自动检测搜索框）
   */
  function init() {
    injectStyles();
    // 等待DOM就绪后自动初始化
    setTimeout(() => {
      // 尝试多种可能的选择器
      const selectors = [
        '#main-search',
        '#search-input',
        'input[aria-label*="搜索"]',
        '.cnpt-input[placeholder*="搜索"]'
      ];
      for (const sel of selectors) {
        if (document.querySelector(sel)) {
          initSearchHistory(sel, null);
          break;
        }
      }
    }, 500);
  }

  // 暴露API
  window.CNPT.components.initSearchHistory = initSearchHistory;
  window.CNPT.components.getSearchHistory = getHistory;
  window.CNPT.components.addSearchHistory = addHistory;
  window.CNPT.components.clearSearchHistory = clearHistory;
  window.CNPT.components.initSearchHistoryAuto = init;

})();
