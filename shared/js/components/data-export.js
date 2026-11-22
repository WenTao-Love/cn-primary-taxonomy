/*!
 * CN-Primary-Taxonomy · 数据备份 / 导出 / 恢复组件
 * 基于分角色存储（CNPT.storage）收集：掌握状态、错题本、FSRS 卡片、
 * 低级失误台账、每日计时、诊断闭环、根因诊断历史、设置等。
 * 支持导出 JSON（v2.0，含 role）与从本应用导出的 JSON 恢复（兼容 v1.0）。
 * 使用方式：CNPT.components.initDataExport({ role: 'student' })
 */
(function() {
  'use strict';

  window.CNPT = window.CNPT || {};
  window.CNPT.components = window.CNPT.components || {};

  const EXPORT_VERSION = '2.0';
  const APP_VERSION = '2.5.0';

  // 当前角色（由 initDataExport 显式指定，未指定则自动推断）
  let currentRole = null;

  /**
   * 推断当前页面角色
   */
  function detectRole() {
    if (window.CNPT && window.CNPT.role) return window.CNPT.role;
    const p = (typeof location !== 'undefined' && location.pathname || '').toLowerCase();
    if (p.indexOf('teacher') >= 0) return 'teacher';
    if (p.indexOf('parent') >= 0) return 'parent';
    return 'student';
  }

  /**
   * 安全读取 JSON（键不存在返回 fallback）
   */
  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      const value = JSON.parse(raw);
      return value == null ? fallback : value;
    } catch (e) {
      return fallback;
    }
  }

  /**
   * 收集所有用户数据（v2.0 结构，按角色存储键）
   * @param {string} [role] - parent/student/teacher
   */
  function collectAllData(role) {
    role = role || currentRole || detectRole();
    const st = window.CNPT.storage.create(role);
    const k = st.keys || {};

    const storage = {
      mastery: readJSON(k.mastery, {}),
      wrongBook: readJSON(k.wrongBook, []),
      fsrs: readJSON(k.fsrs, {}),
      mistakeLedger: readJSON(k.mistakeLedger, []),
      dailyLog: readJSON(k.dailyLog, {}),
      diagnostic: readJSON(k.diagnostic, {}),
      lastVisit: localStorage.getItem(k.lastVisit) || '',
      days: parseInt(localStorage.getItem(k.days) || '0', 10) || 0
    };
    if (role === 'student') {
      storage.stars = parseInt(localStorage.getItem(k.stars) || '0', 10) || 0;
    }

    const rcdHistory = readJSON(`cnpt-${role}-rcd-history`, []);

    // 旧版（v1.0 下划线键）残留数据，仅在存在时随备份带走
    const legacy = {
      mastery: readJSON('cnpt_mastery', null),
      wrongBook: readJSON('cnpt_wrong_book', null),
      bookmarks: readJSON('cnpt_bookmarks', null),
      searchHistory: readJSON('cnpt_search_history', null),
      stats: readJSON('cnpt_stats', null),
      compliance: readJSON('cnpt_compliance_logs', null),
      errorFeedback: readJSON('cnpt_error_feedback', null)
    };
    Object.keys(legacy).forEach(key => { if (legacy[key] == null) delete legacy[key]; });

    const fsrsCards = (storage.fsrs && typeof storage.fsrs === 'object' && storage.fsrs.cards) || {};
    const counts = {
      mastery: Object.keys(storage.mastery || {}).length,
      wrongBook: Array.isArray(storage.wrongBook) ? storage.wrongBook.length : 0,
      fsrsCards: Object.keys(fsrsCards).length,
      mistakeLedger: Array.isArray(storage.mistakeLedger) ? storage.mistakeLedger.length : 0,
      diagnostic: Object.keys(storage.diagnostic || {}).length,
      rcdHistory: Array.isArray(rcdHistory) ? rcdHistory.length : 0
    };

    const data = {
      exportInfo: {
        version: EXPORT_VERSION,
        exportedAt: new Date().toISOString(),
        appName: 'CN-Primary-Taxonomy',
        appVersion: APP_VERSION,
        role
      },
      storage,
      settings: collectSettingsData(),
      rcdHistory,
      counts
    };
    if (Object.keys(legacy).length) data.legacy = legacy;
    return data;
  }

  /**
   * 收集掌握状态数据（兼容旧调用）
   */
  function collectMasteryData(role) {
    return collectAllData(role).storage.mastery;
  }

  /**
   * 收集错题本数据（兼容旧调用）
   */
  function collectWrongBookData(role) {
    return collectAllData(role).storage.wrongBook;
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
   * 导出为 JSON 文件（完整备份）
   */
  function exportToJSON(role) {
    const data = collectAllData(role);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cnpt_backup_${data.exportInfo.role}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    window.CNPT.utils.showToast('✅ 备份已导出为 JSON');
    return data;
  }

  /**
   * 导出为CSV（仅掌握状态）
   */
  function exportMasteryToCSV(role) {
    const mastery = collectMasteryData(role);
    const rows = [['知识点ID', '掌握状态']];

    Object.entries(mastery).forEach(([id, info]) => {
      rows.push([id, (info && info.status) || info || '']);
    });

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
  function exportWrongBookToCSV(role) {
    const wrongBook = collectWrongBookData(role);
    const rows = [['知识点ID', '错误次数', '最后错误时间', '备注']];

    wrongBook.forEach(item => {
      rows.push([
        item.topicId || item.id || '',
        item.count || 1,
        item.lastWrongAt || item.timestamp || '',
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
   * 从 JSON 数据恢复（写回当前角色存储）
   * 兼容 v2.0（storage/legacy）与 v1.0（userData/compliance）结构。
   * 仅当备份中存在对应字段时才写回，避免误清空现有数据。
   * @param {object} parsed - 解析后的备份对象
   * @param {string} [role] - 目标角色，缺省取备份内 role 或自动推断
   * @returns {{ok: boolean, role?: string, restored?: string[], counts?: object, error?: string}}
   */
  function importFromJSON(parsed, role) {
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ok: false, error: '文件不是有效的备份 JSON 对象' };
    }
    role = role || (parsed.exportInfo && parsed.exportInfo.role) || currentRole || detectRole();
    const st = window.CNPT.storage.create(role);
    const k = st.keys || {};

    const src = parsed.storage || {};
    const legacy = parsed.legacy || {};
    const v1 = parsed.userData || {};

    const restored = [];
    function write(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        restored.push(key);
        return true;
      } catch (e) {
        return false;
      }
    }
    function pick() {
      for (let i = 0; i < arguments.length; i++) {
        if (arguments[i] != null) return arguments[i];
      }
      return null;
    }

    const mastery = pick(src.mastery, legacy.mastery, v1.mastery);
    if (mastery != null) write(k.mastery, mastery);

    const wrongBook = pick(src.wrongBook, legacy.wrongBook, v1.wrongBook);
    if (wrongBook != null) write(k.wrongBook, wrongBook);

    ['fsrs', 'mistakeLedger', 'dailyLog', 'diagnostic'].forEach(field => {
      if (src[field] != null) write(k[field], src[field]);
    });

    if (src.lastVisit != null) {
      try { localStorage.setItem(k.lastVisit, String(src.lastVisit)); restored.push(k.lastVisit); } catch (e) { /* ignore */ }
    }
    if (src.days != null) {
      try { localStorage.setItem(k.days, String(src.days)); restored.push(k.days); } catch (e) { /* ignore */ }
    }
    if (src.stars != null && role === 'student') {
      try { localStorage.setItem(k.stars, String(src.stars)); restored.push(k.stars); } catch (e) { /* ignore */ }
    }

    // v1.0 遗留键（写回同名旧键，保持与旧版一致；兼容 v1.userData 与 v2.legacy）
    if (legacy.mastery != null) { try { localStorage.setItem('cnpt_mastery', JSON.stringify(legacy.mastery)); } catch (e) { /* ignore */ } }
    if (legacy.wrongBook != null) { try { localStorage.setItem('cnpt_wrong_book', JSON.stringify(legacy.wrongBook)); } catch (e) { /* ignore */ } }
    const bookmarks = pick(legacy.bookmarks, v1.bookmarks);
    const searchHistory = pick(legacy.searchHistory, v1.searchHistory);
    const stats = pick(legacy.stats, v1.stats);
    if (bookmarks != null) { try { localStorage.setItem('cnpt_bookmarks', JSON.stringify(bookmarks)); } catch (e) { /* ignore */ } }
    if (searchHistory != null) { try { localStorage.setItem('cnpt_search_history', JSON.stringify(searchHistory)); } catch (e) { /* ignore */ } }
    if (stats != null) { try { localStorage.setItem('cnpt_stats', JSON.stringify(stats)); } catch (e) { /* ignore */ } }
    const compliance = pick(parsed.compliance, legacy.compliance, v1.compliance);
    if (compliance != null) {
      try { localStorage.setItem('cnpt_compliance_logs', JSON.stringify(compliance)); } catch (e) { /* ignore */ }
    }
    if (legacy.errorFeedback != null) { try { localStorage.setItem('cnpt_error_feedback', JSON.stringify(legacy.errorFeedback)); } catch (e) { /* ignore */ } }

    if (parsed.rcdHistory != null) {
      write(`cnpt-${role}-rcd-history`, parsed.rcdHistory);
    }

    if (parsed.settings && typeof parsed.settings === 'object') {
      if (parsed.settings.theme != null) { try { localStorage.setItem('cnpt_theme', String(parsed.settings.theme)); } catch (e) { /* ignore */ } }
      if (parsed.settings.fontSize != null) { try { localStorage.setItem('cnpt_font_size', String(parsed.settings.fontSize)); } catch (e) { /* ignore */ } }
      if (parsed.settings.onboardingDone != null) { try { localStorage.setItem('cnpt_onboarding_done', String(!!parsed.settings.onboardingDone)); } catch (e) { /* ignore */ } }
    }

    return {
      ok: true,
      role,
      restored,
      counts: {
        mastery: Object.keys(mastery && typeof mastery === 'object' ? mastery : {}).length,
        wrongBook: Array.isArray(wrongBook) ? wrongBook.length : 0,
        fsrsCards: Object.keys((src.fsrs && src.fsrs.cards) || {}).length,
        rcdHistory: Array.isArray(parsed.rcdHistory) ? parsed.rcdHistory.length : 0
      }
    };
  }

  /**
   * 读取备份文件并恢复
   * @param {File} file
   * @param {string} [role]
   */
  function importFromFile(file, role) {
    return new Promise((resolve) => {
      if (!file) { resolve({ ok: false, error: '未选择文件' }); return; }
      const reader = new FileReader();
      reader.onload = () => {
        let parsed;
        try {
          parsed = JSON.parse(reader.result);
        } catch (e) {
          resolve({ ok: false, error: 'JSON 解析失败：' + e.message });
          return;
        }
        resolve(importFromJSON(parsed, role));
      };
      reader.onerror = () => resolve({ ok: false, error: '文件读取失败' });
      reader.readAsText(file);
    });
  }

  /**
   * 显示数据导出 / 备份面板
   */
  function showExportPanel(role) {
    const data = collectAllData(role);
    const c = data.counts;
    const r = data.exportInfo.role;

    const modal = document.createElement('div');
    modal.className = 'cnpt-export-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', '数据备份与导出');

    modal.innerHTML = `
      <div class="cnpt-export-overlay"></div>
      <div class="cnpt-export-content">
        <div class="cnpt-export-header">
          <h3>📦 数据备份 / 导出</h3>
          <button class="cnpt-export-close" aria-label="关闭">×</button>
        </div>
        <div class="cnpt-export-body">
          <p style="font-size:12px;color:#64748b;margin-bottom:16px">当前角色：<b>${r}</b>。导出完整备份（JSON），或从备份文件恢复；另支持掌握状态 / 错题本 CSV 分类导出。</p>

          <div class="cnpt-export-stats">
            <div class="cnpt-export-stat">
              <div class="cnpt-export-stat-num">${c.mastery}</div>
              <div class="cnpt-export-stat-label">掌握记录</div>
            </div>
            <div class="cnpt-export-stat">
              <div class="cnpt-export-stat-num">${c.wrongBook}</div>
              <div class="cnpt-export-stat-label">错题记录</div>
            </div>
            <div class="cnpt-export-stat">
              <div class="cnpt-export-stat-num">${c.fsrsCards}</div>
              <div class="cnpt-export-stat-label">FSRS 卡片</div>
            </div>
            <div class="cnpt-export-stat">
              <div class="cnpt-export-stat-num">${c.rcdHistory}</div>
              <div class="cnpt-export-stat-label">诊断历史</div>
            </div>
          </div>

          <div class="cnpt-export-section">
            <h4>完整备份 / 恢复</h4>
            <button class="cnpt-export-btn" id="cnpt-export-json">
              📄 导出全部数据 (JSON)
              <small>包含掌握、错题、FSRS、诊断等全部数据</small>
            </button>
            <button class="cnpt-export-btn restore" id="cnpt-export-import">
              ♻️ 恢复备份 (JSON)
              <small>从本应用导出的备份恢复，会覆盖当前同角色数据</small>
            </button>
            <input type="file" id="cnpt-export-file" accept="application/json,.json" style="display:none">
          </div>

          <div class="cnpt-export-section">
            <h4>分类导出 (CSV)</h4>
            <button class="cnpt-export-btn" id="cnpt-export-mastery">
              📊 掌握状态
              <small>${c.mastery} 条记录</small>
            </button>
            <button class="cnpt-export-btn" id="cnpt-export-wrong">
              ❌ 错题本
              <small>${c.wrongBook} 条记录</small>
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
      exportToJSON(r);
      closeModal();
    });

    const fileInput = modal.querySelector('#cnpt-export-file');
    modal.querySelector('#cnpt-export-import').addEventListener('click', () => {
      fileInput.click();
    });
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      if (!confirm('⚠️ 恢复备份会覆盖当前「' + r + '」角色的同名数据，确定继续吗？')) {
        fileInput.value = '';
        return;
      }
      const result = await importFromFile(file, r);
      fileInput.value = '';
      if (result.ok) {
        window.CNPT.utils.showToast(`✅ 恢复成功：掌握 ${result.counts.mastery} · 错题 ${result.counts.wrongBook} · FSRS ${result.counts.fsrsCards}`);
        closeModal();
      } else {
        window.CNPT.utils.showToast('❌ 恢复失败：' + (result.error || '未知错误'));
      }
    });

    modal.querySelector('#cnpt-export-mastery').addEventListener('click', () => {
      exportMasteryToCSV(r);
      closeModal();
    });

    modal.querySelector('#cnpt-export-wrong').addEventListener('click', () => {
      exportWrongBookToCSV(r);
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
   * 清除所有本地数据（新键 + 旧键 + 设置）
   */
  function clearAllData() {
    const role = currentRole || detectRole();
    const st = window.CNPT.storage.create(role);
    Object.values(st.keys || {}).forEach(key => {
      if (key) localStorage.removeItem(key);
    });
    localStorage.removeItem(`cnpt-${role}-rcd-history`);

    const legacyKeys = [
      'cnpt_mastery', 'cnpt_wrong_book', 'cnpt_bookmarks',
      'cnpt_search_history', 'cnpt_stats', 'cnpt_theme',
      'cnpt_font_size', 'cnpt_onboarding_done', 'cnpt_compliance_logs',
      'cnpt_error_feedback'
    ];
    legacyKeys.forEach(key => localStorage.removeItem(key));
  }

  /**
   * 创建导出入口按钮
   */
  function createExportButton() {
    const btn = document.createElement('button');
    btn.id = 'cnpt-data-export-btn';
    btn.className = 'cnpt-data-export-btn';
    btn.innerHTML = '📦 数据备份';
    btn.setAttribute('aria-label', '备份与导出用户数据');
    btn.title = '备份 / 导出 / 恢复您的数据';
    btn.addEventListener('click', () => showExportPanel());
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
      .cnpt-export-btn.restore { color: #059669; border-color: rgba(5,150,105,0.25); }
      .cnpt-export-btn.restore:hover { background: rgba(5,150,105,0.06); border-color: #059669; }
      .cnpt-export-btn.danger { color: #ef4444; border-color: rgba(239,68,68,0.2); }
      .cnpt-export-btn.danger:hover { background: rgba(239,68,68,0.05); border-color: #ef4444; }
    `;
    document.head.appendChild(style);
  }

  /**
   * 初始化
   * @param {object} [options]
   * @param {string} [options.role] - parent/student/teacher，缺省自动推断
   */
  function initDataExport(options) {
    options = options || {};
    currentRole = options.role || detectRole();
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
  window.CNPT.components.collectMasteryData = collectMasteryData;
  window.CNPT.components.collectWrongBookData = collectWrongBookData;
  window.CNPT.components.importFromJSON = importFromJSON;
  window.CNPT.components.importFromFile = importFromFile;
  window.CNPT.components.detectRole = detectRole;
  window.CNPT.components.showExportPanel = showExportPanel;
  window.CNPT.components.clearAllData = clearAllData;

})();
