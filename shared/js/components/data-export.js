/*!
 * CN-Primary-Taxonomy · 数据导出组件
 * 全面导出用户数据：掌握状态、错题本、收藏、搜索历史、设置等
 * 使用方式：CNPT.components.initDataExport()
 */
(function() {
  'use strict';

  window.CNPT = window.CNPT || {};
  window.CNPT.components = window.CNPT.components || {};

  /**
   * 收集所有用户数据
   */
  function collectAllData() {
    const data = {
      exportInfo: {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        appName: 'CN-Primary-Taxonomy',
        appVersion: '1.6.0'
      },
      userData: {
        mastery: collectMasteryData(),
        wrongBook: collectWrongBookData(),
        bookmarks: collectBookmarkData(),
        searchHistory: collectSearchHistoryData(),
        stats: collectStatsData()
      },
      settings: collectSettingsData(),
      compliance: collectComplianceData()
    };

    return data;
  }

  /**
   * 收集掌握状态数据
   */
  function collectMasteryData() {
    try {
      const mastery = localStorage.getItem('cnpt_mastery');
      return mastery ? JSON.parse(mastery) : {};
    } catch (e) {
      return {};
    }
  }

  /**
   * 收集错题本数据
   */
  function collectWrongBookData() {
    try {
      const wrongBook = localStorage.getItem('cnpt_wrong_book');
      return wrongBook ? JSON.parse(wrongBook) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * 收集收藏数据
   */
  function collectBookmarkData() {
    try {
      const bookmarks = localStorage.getItem('cnpt_bookmarks');
      return bookmarks ? JSON.parse(bookmarks) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * 收集搜索历史
   */
  function collectSearchHistoryData() {
    try {
      const history = localStorage.getItem('cnpt_search_history');
      return history ? JSON.parse(history) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * 收集统计数据
   */
  function collectStatsData() {
    try {
      const stats = localStorage.getItem('cnpt_stats');
      return stats ? JSON.parse(stats) : {};
    } catch (e) {
      return {};
    }
  }

  /**
   * 收集设置数据
   */
  function collectSettingsData() {
    return {
      theme: localStorage.getItem('cnpt_theme') || 'auto',
      fontSize: localStorage.getItem('cnpt_font_size') || 'standard',
      onboardingDone: localStorage.getItem('cnpt_onboarding_done') === 'true'
    };
  }

  /**
   * 收集合规日志
   */
  function collectComplianceData() {
    try {
      const logs = localStorage.getItem('cnpt_compliance_logs');
      return logs ? JSON.parse(logs) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * 导出为JSON文件
   */
  function exportToJSON() {
    const data = collectAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cnpt_user_data_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    window.CNPT.utils.showToast('✅ 数据已导出为 JSON');
    return data;
  }

  /**
   * 导出为CSV（仅掌握状态）
   */
  function exportMasteryToCSV() {
    const mastery = collectMasteryData();
    const rows = [['知识点ID', '掌握状态', '更新时间']];

    Object.entries(mastery).forEach(([id, info]) => {
      rows.push([id, info.status || '', info.updatedAt || '']);
    ]);

    const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cnpt_mastery_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    window.CNPT.utils.showToast('✅ 掌握状态已导出为 CSV');
  }

  /**
   * 导出错题本为CSV
   */
  function exportWrongBookToCSV() {
    const wrongBook = collectWrongBookData();
    const rows = [['知识点ID', '知识点名称', '错误次数', '最后错误时间', '备注']];

    wrongBook.forEach(item => {
      rows.push([
        item.id || '',
        item.name || '',
        item.count || 1,
        item.lastWrongAt || '',
        item.note || ''
      ]);
    });

    const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cnpt_wrong_book_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    window.CNPT.utils.showToast('✅ 错题本已导出为 CSV');
  }

  /**
   * 显示数据导出面板
   */
  function showExportPanel() {
    const modal = document.createElement('div');
    modal.className = 'cnpt-export-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', '数据导出');

    const data = collectAllData();
    const masteryCount = Object.keys(data.userData.mastery).length;
    const wrongCount = data.userData.wrongBook.length;
    const bookmarkCount = data.userData.bookmarks.length;
    const historyCount = data.userData.searchHistory.length;

    modal.innerHTML = `
      <div class="cnpt-export-overlay"></div>
      <div class="cnpt-export-content">
        <div class="cnpt-export-header">
          <h3>📦 数据导出</h3>
          <button class="cnpt-export-close" aria-label="关闭">×</button>
        </div>
        <div class="cnpt-export-body">
          <p style="font-size:12px;color:#64748b;margin-bottom:16px">导出您的所有本地数据，支持 JSON（完整备份）和 CSV（表格分析）格式。</p>

          <div class="cnpt-export-stats">
            <div class="cnpt-export-stat">
              <div class="cnpt-export-stat-num">${masteryCount}</div>
              <div class="cnpt-export-stat-label">掌握记录</div>
            </div>
            <div class="cnpt-export-stat">
              <div class="cnpt-export-stat-num">${wrongCount}</div>
              <div class="cnpt-export-stat-label">错题记录</div>
            </div>
            <div class="cnpt-export-stat">
              <div class="cnpt-export-stat-num">${bookmarkCount}</div>
              <div class="cnpt-export-stat-label">收藏知识点</div>
            </div>
            <div class="cnpt-export-stat">
              <div class="cnpt-export-stat-num">${historyCount}</div>
              <div class="cnpt-export-stat-label">搜索历史</div>
            </div>
          </div>

          <div class="cnpt-export-section">
            <h4>完整备份</h4>
            <button class="cnpt-export-btn" id="cnpt-export-json">
              📄 导出全部数据 (JSON)
              <small>包含所有用户数据，可用于完整恢复</small>
            </button>
          </div>

          <div class="cnpt-export-section">
            <h4>分类导出 (CSV)</h4>
            <button class="cnpt-export-btn" id="cnpt-export-mastery">
              📊 掌握状态
              <small>${masteryCount} 条记录</small>
            </button>
            <button class="cnpt-export-btn" id="cnpt-export-wrong">
              ❌ 错题本
              <small>${wrongCount} 条记录</small>
            </button>
          </div>

          <div class="cnpt-export-section">
            <h4>危险操作</h4>
            <button class="cnpt-export-btn danger" id="cnpt-export-clear">
              🗑️ 清除所有本地数据
              <small>不可恢复，请先导出备份</small>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => modal.remove();
    modal.querySelector('.cnpt-export-close').addEventListener('click', closeModal);
    modal.querySelector('.cnpt-export-overlay').addEventListener('click', closeModal);

    modal.querySelector('#cnpt-export-json').addEventListener('click', () => {
      exportToJSON();
      closeModal();
    });

    modal.querySelector('#cnpt-export-mastery').addEventListener('click', () => {
      exportMasteryToCSV();
      closeModal();
    });

    modal.querySelector('#cnpt-export-wrong').addEventListener('click', () => {
      exportWrongBookToCSV();
      closeModal();
    });

    modal.querySelector('#cnpt-export-clear').addEventListener('click', () => {
      if (confirm('⚠️ 确定要清除所有本地数据吗？此操作不可恢复！\n\n建议先导出备份。')) {
        if (confirm('再次确认：您确定要清除所有数据吗？')) {
          clearAllData();
          closeModal();
          window.CNPT.utils.showToast('所有本地数据已清除');
        }
      }
    });
  }

  /**
   * 清除所有本地数据
   */
  function clearAllData() {
    const keys = [
      'cnpt_mastery', 'cnpt_wrong_book', 'cnpt_bookmarks',
      'cnpt_search_history', 'cnpt_stats', 'cnpt_theme',
      'cnpt_font_size', 'cnpt_onboarding_done', 'cnpt_compliance_logs',
      'cnpt_error_feedback'
    ];
    keys.forEach(key => localStorage.removeItem(key));
  }

  /**
   * 创建导出入口按钮
   */
  function createExportButton() {
    const btn = document.createElement('button');
    btn.id = 'cnpt-data-export-btn';
    btn.className = 'cnpt-data-export-btn';
    btn.innerHTML = '📦 数据导出';
    btn.setAttribute('aria-label', '导出用户数据');
    btn.title = '导出/备份您的数据';
    btn.addEventListener('click', showExportPanel);
    return btn;
  }

  /**
   * 注入样式
   */
  function injectStyles() {
    if (document.getElementById('cnpt-data-export-styles')) return;
    const style = document.createElement('style');
    style.id = 'cnpt-data-export-styles';
    style.textContent = `
      .cnpt-data-export-btn {
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
      .cnpt-data-export-btn:hover { border-color: var(--cnpt-primary, #3b82f6); background: rgba(59,130,246,0.05); }
      .cnpt-export-modal {
        position: fixed;
        inset: 0;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .cnpt-export-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); }
      .cnpt-export-content {
        position: relative;
        background: var(--cnpt-bg-card, #fff);
        color: var(--cnpt-text-main, #1e293b);
        border-radius: 16px;
        width: 90%;
        max-width: 440px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        z-index: 1;
      }
      .cnpt-export-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid var(--cnpt-border, #e2e8f0);
      }
      .cnpt-export-header h3 { margin: 0; font-size: 16px; }
      .cnpt-export-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #94a3b8; padding: 4px 8px; }
      .cnpt-export-body { padding: 16px 20px; }
      .cnpt-export-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; }
      .cnpt-export-stat { text-align: center; padding: 8px 4px; background: var(--cnpt-bg-hover, rgba(59,130,246,0.04)); border-radius: 8px; }
      .cnpt-export-stat-num { font-size: 18px; font-weight: 600; color: var(--cnpt-primary, #3b82f6); }
      .cnpt-export-stat-label { font-size: 10px; color: var(--cnpt-text-muted, #94a3b8); margin-top: 2px; }
      .cnpt-export-section { margin-bottom: 16px; }
      .cnpt-export-section h4 { font-size: 12px; color: var(--cnpt-text-muted, #94a3b8); margin-bottom: 8px; }
      .cnpt-export-btn {
        display: block;
        width: 100%;
        padding: 10px 12px;
        margin-bottom: 6px;
        border-radius: 8px;
        border: 1px solid var(--cnpt-border, #e2e8f0);
        background: var(--cnpt-bg-card, #fff);
        color: var(--cnpt-text-main, #1e293b);
        font-size: 13px;
        cursor: pointer;
        text-align: left;
        transition: all 0.2s;
      }
      .cnpt-export-btn small { display: block; font-size: 11px; color: var(--cnpt-text-muted, #94a3b8); margin-top: 2px; }
      .cnpt-export-btn:hover { border-color: var(--cnpt-primary, #3b82f6); background: rgba(59,130,246,0.04); }
      .cnpt-export-btn.danger { color: #ef4444; border-color: rgba(239,68,68,0.2); }
      .cnpt-export-btn.danger:hover { background: rgba(239,68,68,0.05); border-color: #ef4444; }
    `;
    document.head.appendChild(style);
  }

  /**
   * 初始化
   */
  function initDataExport() {
    injectStyles();

    // 在header添加导出入口
    const topBar = document.querySelector('.cnpt-top-right') || document.querySelector('.header-right');
    if (topBar && !document.getElementById('cnpt-data-export-btn')) {
      const btn = createExportButton();
      topBar.appendChild(btn);
    }
  }

  // 暴露API
  window.CNPT.components.initDataExport = initDataExport;
  window.CNPT.components.exportToJSON = exportToJSON;
  window.CNPT.components.exportMasteryToCSV = exportMasteryToCSV;
  window.CNPT.components.exportWrongBookToCSV = exportWrongBookToCSV;
  window.CNPT.components.collectAllData = collectAllData;
  window.CNPT.components.showExportPanel = showExportPanel;

})();
