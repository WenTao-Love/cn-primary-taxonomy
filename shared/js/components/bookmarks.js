/*!
 * CN-Primary-Taxonomy · 收藏书签组件
 * 知识点收藏管理，支持添加/移除/查看/导出
 * 使用方式：CNPT.components.initBookmarks()
 */
(function() {
  'use strict';

  window.CNPT = window.CNPT || {};
  window.CNPT.components = window.CNPT.components || {};

  const STORAGE_KEY = 'cnpt_bookmarks';
  const MAX_BOOKMARKS = 100;

  /**
   * 获取收藏列表
   */
  function getBookmarks() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  /**
   * 保存收藏列表
   */
  function saveBookmarks(bookmarks) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    } catch (e) { /* ignore */ }
  }

  /**
   * 添加收藏
   */
  function addBookmark(topic) {
    if (!topic || !topic.id) return false;
    const bookmarks = getBookmarks();
    if (bookmarks.some(b => b.id === topic.id)) return false;
    bookmarks.unshift({
      id: topic.id,
      name: topic.name,
      subject: topic.subject,
      grade: topic.grade,
      textbook: topic.textbook,
      domain: topic.domain,
      addedAt: new Date().toISOString()
    });
    if (bookmarks.length > MAX_BOOKMARKS) bookmarks.length = MAX_BOOKMARKS;
    saveBookmarks(bookmarks);
    return true;
  }

  /**
   * 移除收藏
   */
  function removeBookmark(topicId) {
    const bookmarks = getBookmarks().filter(b => b.id !== topicId);
    saveBookmarks(bookmarks);
  }

  /**
   * 检查是否已收藏
   */
  function isBookmarked(topicId) {
    return getBookmarks().some(b => b.id === topicId);
  }

  /**
   * 切换收藏状态
   */
  function toggleBookmark(topic) {
    if (isBookmarked(topic.id)) {
      removeBookmark(topic.id);
      window.CNPT.utils.showToast('已取消收藏');
      return false;
    } else {
      addBookmark(topic);
      window.CNPT.utils.showToast('⭐ 已收藏');
      return true;
    }
  }

  /**
   * 清除所有收藏
   */
  function clearBookmarks() {
    saveBookmarks([]);
  }

  /**
   * 创建收藏按钮
   */
  function createBookmarkButton(topic, options = {}) {
    const btn = document.createElement('button');
    btn.className = 'cnpt-bookmark-btn';
    btn.setAttribute('aria-label', '收藏/取消收藏');
    btn.setAttribute('title', '收藏此知识点');

    function updateBtn() {
      const bookmarked = isBookmarked(topic.id);
      btn.innerHTML = bookmarked ? '⭐ 已收藏' : '☆ 收藏';
      btn.classList.toggle('bookmarked', bookmarked);
    }

    btn.addEventListener('click', () => {
      toggleBookmark(topic);
      updateBtn();
      if (options.onToggle) options.onToggle(isBookmarked(topic.id));
    });

    updateBtn();
    return btn;
  }

  /**
   * 显示收藏面板
   */
  function showBookmarksPanel() {
    const bookmarks = getBookmarks();
    const modal = document.createElement('div');
    modal.className = 'cnpt-bookmarks-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', '我的收藏');

    const listHtml = bookmarks.length === 0
      ? '<div class="cnpt-bm-empty">还没有收藏任何知识点<br><span style="font-size:12px;color:#94a3b8;">在知识点详情页点击"☆ 收藏"添加</span></div>'
      : bookmarks.map(b => `
        <div class="cnpt-bm-item" data-id="${b.id}">
          <div class="cnpt-bm-info">
            <div class="cnpt-bm-name">${window.CNPT.utils.escapeHtml(b.name)}</div>
            <div class="cnpt-bm-meta">${b.subject || ''} · ${b.grade || ''}年级 · ${b.textbook || ''}</div>
          </div>
          <button class="cnpt-bm-remove" title="移除">×</button>
        </div>
      `).join('');

    modal.innerHTML = `
      <div class="cnpt-bm-overlay"></div>
      <div class="cnpt-bm-content">
        <div class="cnpt-bm-header">
          <h3>⭐ 我的收藏 (${bookmarks.length})</h3>
          <button class="cnpt-bm-close" aria-label="关闭">×</button>
        </div>
        <div class="cnpt-bm-body">
          ${listHtml}
        </div>
        ${bookmarks.length > 0 ? `
          <div class="cnpt-bm-footer">
            <button class="cnpt-bm-clear" id="cnpt-bm-clear">清除全部</button>
            <button class="cnpt-bm-export" id="cnpt-bm-export">导出</button>
          </div>
        ` : ''}
      </div>
    `;

    document.body.appendChild(modal);

    // 事件绑定
    const closeModal = () => modal.remove();
    modal.querySelector('.cnpt-bm-close').addEventListener('click', closeModal);
    modal.querySelector('.cnpt-bm-overlay').addEventListener('click', closeModal);

    modal.querySelectorAll('.cnpt-bm-item').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.classList.contains('cnpt-bm-remove')) return;
        const id = el.dataset.id;
        // 尝试在当前图谱中定位该节点
        if (window.CNPT?.graph?.data?.nodes) {
          const node = window.CNPT.graph.data.nodes.find(n => n.id === id);
          if (node && window.CNPT?.graph?.focusNode) {
            window.CNPT.graph.focusNode(id);
          }
        }
        closeModal();
      });
    });

    modal.querySelectorAll('.cnpt-bm-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.closest('.cnpt-bm-item').dataset.id;
        removeBookmark(id);
        closeModal();
        showBookmarksPanel(); // 重新渲染
        window.CNPT.utils.showToast('已移除收藏');
      });
    });

    const clearBtn = modal.querySelector('#cnpt-bm-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('确定要清除所有收藏吗？')) {
          clearBookmarks();
          closeModal();
          showBookmarksPanel();
          window.CNPT.utils.showToast('收藏已清空');
        }
      });
    }

    const exportBtn = modal.querySelector('#cnpt-bm-export');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const data = {
          type: 'bookmarks',
          exportedAt: new Date().toISOString(),
          count: bookmarks.length,
          items: bookmarks
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cnpt_bookmarks_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        window.CNPT.utils.showToast('✅ 收藏已导出');
      });
    }
  }

  /**
   * 创建收藏入口按钮
   */
  function createBookmarksEntryButton() {
    const btn = document.createElement('button');
    btn.id = 'cnpt-bookmarks-entry';
    btn.className = 'cnpt-bookmarks-entry-btn';
    btn.setAttribute('aria-label', '查看我的收藏');
    btn.title = '查看收藏的知识点';

    function updateLabel() {
      const count = getBookmarks().length;
      btn.innerHTML = `⭐ 收藏${count > 0 ? ` (${count})` : ''}`;
    }

    btn.addEventListener('click', showBookmarksPanel);
    updateLabel();

    // 定期更新计数
    setInterval(updateLabel, 5000);
    return btn;
  }

  /**
   * 注入样式
   */
  function injectStyles() {
    if (document.getElementById('cnpt-bookmarks-styles')) return;
    const style = document.createElement('style');
    style.id = 'cnpt-bookmarks-styles';
    style.textContent = `
      .cnpt-bookmark-btn {
        padding: 4px 10px;
        border-radius: 6px;
        border: 1px solid var(--cnpt-border, #e2e8f0);
        background: var(--cnpt-bg-card, #fff);
        color: var(--cnpt-text-main, #1e293b);
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .cnpt-bookmark-btn:hover { border-color: #f59e0b; background: rgba(245,158,11,0.05); }
      .cnpt-bookmark-btn.bookmarked { background: rgba(245,158,11,0.1); border-color: #f59e0b; color: #d97706; }
      .cnpt-bookmarks-entry-btn {
        padding: 6px 12px;
        border-radius: 8px;
        border: 1px solid var(--cnpt-border, #e2e8f0);
        background: var(--cnpt-bg-card, #fff);
        color: var(--cnpt-text-main, #1e293b);
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
      }
      .cnpt-bookmarks-entry-btn:hover { border-color: #f59e0b; background: rgba(245,158,11,0.05); }
      .cnpt-bookmarks-modal {
        position: fixed;
        inset: 0;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .cnpt-bm-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); }
      .cnpt-bm-content {
        position: relative;
        background: var(--cnpt-bg-card, #fff);
        color: var(--cnpt-text-main, #1e293b);
        border-radius: 16px;
        width: 90%;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        z-index: 1;
      }
      .cnpt-bm-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid var(--cnpt-border, #e2e8f0);
      }
      .cnpt-bm-header h3 { margin: 0; font-size: 16px; }
      .cnpt-bm-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #94a3b8; padding: 4px 8px; }
      .cnpt-bm-body { padding: 8px 0; min-height: 100px; }
      .cnpt-bm-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 20px;
        cursor: pointer;
        transition: background 0.15s;
        border-bottom: 1px solid var(--cnpt-border, #f1f5f9);
      }
      .cnpt-bm-item:hover { background: var(--cnpt-bg-hover, rgba(59,130,246,0.06)); }
      .cnpt-bm-name { font-size: 14px; font-weight: 500; }
      .cnpt-bm-meta { font-size: 11px; color: var(--cnpt-text-muted, #94a3b8); margin-top: 2px; }
      .cnpt-bm-remove { background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer; padding: 2px 8px; opacity: 0.6; }
      .cnpt-bm-remove:hover { opacity: 1; color: #ef4444; }
      .cnpt-bm-empty { padding: 32px 20px; text-align: center; color: var(--cnpt-text-muted, #94a3b8); font-size: 14px; }
      .cnpt-bm-footer { display: flex; gap: 10px; padding: 12px 20px; border-top: 1px solid var(--cnpt-border, #e2e8f0); justify-content: flex-end; }
      .cnpt-bm-footer button { padding: 8px 16px; border-radius: 6px; border: 1px solid var(--cnpt-border, #e2e8f0); background: var(--cnpt-bg-card, #fff); font-size: 13px; cursor: pointer; }
      .cnpt-bm-clear { color: #ef4444; }
      .cnpt-bm-export { color: var(--cnpt-primary, #3b82f6); }
    `;
    document.head.appendChild(style);
  }

  /**
   * 初始化收藏功能
   */
  function initBookmarks() {
    injectStyles();

    // 在header添加收藏入口
    const topBar = document.querySelector('.cnpt-top-right') || document.querySelector('.header-right');
    if (topBar && !document.getElementById('cnpt-bookmarks-entry')) {
      const btn = createBookmarksEntryButton();
      topBar.appendChild(btn);
    }
  }

  // 暴露API
  window.CNPT.components.initBookmarks = initBookmarks;
  window.CNPT.components.getBookmarks = getBookmarks;
  window.CNPT.components.addBookmark = addBookmark;
  window.CNPT.components.removeBookmark = removeBookmark;
  window.CNPT.components.isBookmarked = isBookmarked;
  window.CNPT.components.toggleBookmark = toggleBookmark;
  window.CNPT.components.createBookmarkButton = createBookmarkButton;
  window.CNPT.components.showBookmarksPanel = showBookmarksPanel;

})();
