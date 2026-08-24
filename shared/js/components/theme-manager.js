/*!
 * CN-Primary-Taxonomy · 主题与字号管理器
 * 提供暗色/浅色主题切换 + 字号控制（标准/大/超大）
 * 使用方式：CNPT.components.initThemeManager()
 */
(function() {
  'use strict';

  window.CNPT = window.CNPT || {};
  window.CNPT.components = window.CNPT.components || {};

  const STORAGE_KEY = 'cnpt_theme_prefs';
  const THEME_KEY = 'cnpt_theme';
  const FONT_KEY = 'cnpt_font_size';

  // 默认配置
  const DEFAULTS = {
    theme: 'auto', // auto | light | dark
    fontSize: 'standard' // standard | large | xlarge
  };

  // 字号缩放比例
  const FONT_SCALES = {
    standard: 1,
    large: 1.2,
    xlarge: 1.4
  };

  /**
   * 获取当前偏好设置
   */
  function getPrefs() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return Object.assign({}, DEFAULTS, stored);
    } catch (e) {
      return Object.assign({}, DEFAULTS);
    }
  }

  /**
   * 保存偏好设置
   */
  function savePrefs(prefs) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) { /* ignore */ }
  }

  /**
   * 检测系统主题偏好
   */
  function getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * 应用主题
   */
  function applyTheme(theme) {
    const root = document.documentElement;
    const effectiveTheme = theme === 'auto' ? getSystemTheme() : theme;

    // 设置data-theme属性
    root.setAttribute('data-theme', effectiveTheme);

    // 更新meta theme-color（移动端浏览器地址栏颜色）
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', effectiveTheme === 'dark' ? '#0f172a' : '#ffffff');
    }

    // 保存
    const prefs = getPrefs();
    prefs.theme = theme;
    savePrefs(prefs);

    // 更新按钮状态
    updateToggleButton();
  }

  /**
   * 应用字号
   */
  function applyFontSize(size) {
    const root = document.documentElement;
    const scale = FONT_SCALES[size] || 1;

    root.setAttribute('data-font-size', size);
    root.style.setProperty('--cnpt-font-scale', scale.toString());

    // 保存
    const prefs = getPrefs();
    prefs.fontSize = size;
    savePrefs(prefs);

    // 更新按钮状态
    updateFontButtons();
  }

  /**
   * 切换主题
   */
  function toggleTheme() {
    const prefs = getPrefs();
    const order = ['auto', 'light', 'dark'];
    const idx = order.indexOf(prefs.theme);
    const next = order[(idx + 1) % order.length];
    applyTheme(next);
    const labels = { auto: '跟随系统', light: '浅色', dark: '深色' };
    window.CNPT.utils.showToast(`🎨 主题：${labels[next]}`);
  }

  /**
   * 切换字号
   */
  function toggleFontSize() {
    const prefs = getPrefs();
    const order = ['standard', 'large', 'xlarge'];
    const idx = order.indexOf(prefs.fontSize);
    const next = order[(idx + 1) % order.length];
    applyFontSize(next);
    const labels = { standard: '标准', large: '大', xlarge: '特大' };
    window.CNPT.utils.showToast(`🔤 字号：${labels[next]}`);
  }

  /**
   * 更新主题切换按钮状态
   */
  function updateToggleButton() {
    const btn = document.getElementById('cnpt-theme-toggle');
    if (!btn) return;
    const prefs = getPrefs();
    const icons = { auto: '🌓', light: '☀️', dark: '🌙' };
    btn.textContent = `${icons[prefs.theme] || '🌓'} 主题`;
    btn.setAttribute('aria-label', `当前主题：${prefs.theme}，点击切换`);
  }

  /**
   * 更新字号按钮状态
   */
  function updateFontButtons() {
    const btn = document.getElementById('cnpt-font-toggle');
    if (!btn) return;
    const prefs = getPrefs();
    const icons = { standard: 'A', large: 'A+', xlarge: 'A++' };
    btn.textContent = `${icons[prefs.fontSize] || 'A'} 字号`;
    btn.setAttribute('aria-label', `当前字号：${prefs.fontSize}，点击切换`);
  }

  /**
   * 注入必要CSS变量
   */
  function injectStyles() {
    if (document.getElementById('cnpt-theme-styles')) return;
    const style = document.createElement('style');
    style.id = 'cnpt-theme-styles';
    style.textContent = `
      /* 字号缩放变量 */
      :root {
        --cnpt-font-scale: 1;
      }
      /* 大号字号 */
      [data-font-size="large"] {
        --cnpt-font-xs: 13px;
        --cnpt-font-sm: 14px;
        --cnpt-font-md: 16px;
        --cnpt-font-base: 17px;
        --cnpt-font-lg: 19px;
        --cnpt-font-xl: 22px;
        --cnpt-font-2xl: 24px;
        --cnpt-font-3xl: 29px;
      }
      [data-font-size="xlarge"] {
        --cnpt-font-xs: 15px;
        --cnpt-font-sm: 17px;
        --cnpt-font-md: 18px;
        --cnpt-font-base: 20px;
        --cnpt-font-lg: 22px;
        --cnpt-font-xl: 25px;
        --cnpt-font-2xl: 28px;
        --cnpt-font-3xl: 34px;
      }
      /* 主题切换按钮 */
      .cnpt-theme-toggle-btn,
      .cnpt-font-toggle-btn {
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
      .cnpt-theme-toggle-btn:hover,
      .cnpt-font-toggle-btn:hover {
        background: var(--cnpt-bg-hover, rgba(59,130,246,0.06));
        border-color: var(--cnpt-primary, #3b82f6);
      }
      /* 暗色主题适配（当系统为暗色且theme=auto时） */
      @media (prefers-color-scheme: dark) {
        :root[data-theme="auto"] .cnpt-theme-toggle-btn,
        :root[data-theme="dark"] .cnpt-theme-toggle-btn,
        :root[data-theme="auto"] .cnpt-font-toggle-btn,
        :root[data-theme="dark"] .cnpt-font-toggle-btn {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.2);
          color: #e2e8f0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 创建主题切换按钮
   */
  function createToggleButtons() {
    // 查找header中的按钮容器
    const topBar = document.querySelector('.cnpt-top-right') || document.querySelector('.header-right');
    if (!topBar) return;

    // 避免重复创建
    if (document.getElementById('cnpt-theme-toggle')) return;

    // 主题切换按钮
    const themeBtn = document.createElement('button');
    themeBtn.id = 'cnpt-theme-toggle';
    themeBtn.className = 'cnpt-theme-toggle-btn';
    themeBtn.addEventListener('click', toggleTheme);
    topBar.appendChild(themeBtn);

    // 字号切换按钮
    const fontBtn = document.createElement('button');
    fontBtn.id = 'cnpt-font-toggle';
    fontBtn.className = 'cnpt-font-toggle-btn';
    fontBtn.style.marginLeft = '8px';
    fontBtn.addEventListener('click', toggleFontSize);
    topBar.appendChild(fontBtn);

    // 更新按钮状态
    updateToggleButton();
    updateFontButtons();
  }

  /**
   * 初始化主题管理器
   */
  function initThemeManager() {
    injectStyles();

    // 应用保存的主题和字号
    const prefs = getPrefs();
    applyTheme(prefs.theme);
    applyFontSize(prefs.fontSize);

    // 创建切换按钮（等待DOM就绪）
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createToggleButtons);
    } else {
      // 延迟确保header已渲染
      setTimeout(createToggleButtons, 100);
    }

    // 监听系统主题变化
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const p = getPrefs();
        if (p.theme === 'auto') {
          applyTheme('auto');
        }
      });
    }
  }

  // 暴露API
  window.CNPT.components.initThemeManager = initThemeManager;
  window.CNPT.components.getPrefs = getPrefs;
  window.CNPT.components.applyTheme = applyTheme;
  window.CNPT.components.applyFontSize = applyFontSize;

})();
