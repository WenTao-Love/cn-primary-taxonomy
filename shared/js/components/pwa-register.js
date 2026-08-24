/*!
 * CN-Primary-Taxonomy · PWA 注册组件
 * 注册 Service Worker 和 Manifest
 * 使用方式：CNPT.components.initPWA()
 */
(function() {
  'use strict';

  window.CNPT = window.CNPT || {};
  window.CNPT.components = window.CNPT.components || {};

  /**
   * 注册 Service Worker
   */
  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.log('[CNPT] 浏览器不支持 Service Worker');
      return;
    }

    // 只在 https / localhost 环境下注册
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      console.log('[CNPT] PWA 需要 HTTPS 或 localhost 环境');
      return;
    }

    window.addEventListener('load', () => {
      navigator.serviceWorker.register('../sw.js', { scope: '../' })
        .then(registration => {
          console.log('[CNPT] SW 注册成功:', registration.scope);

          // 监听更新
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                // 可以在这里提示用户刷新
                console.log('[CNPT] SW 已更新');
              }
            });
          });
        })
        .catch(error => {
          console.warn('[CNPT] SW 注册失败:', error);
        });
    });
  }

  /**
   * 添加 manifest 链接
   */
  function addManifestLink() {
    if (document.querySelector('link[rel="manifest"]')) return;

    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '../manifest.webmanifest';
    document.head.appendChild(link);
  }

  /**
   * 添加 Apple touch icon
   */
  function addAppleTouchIcon() {
    if (document.querySelector('link[rel="apple-touch-icon"]')) return;
    const link = document.createElement('link');
    link.rel = 'apple-touch-icon';
    link.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%233b82f6"/><text x="50" y="68" font-size="50" text-anchor="middle" fill="white">📚</text></svg>';
    document.head.appendChild(link);
  }

  /**
   * 添加 meta 标签
   */
  function addMetaTags() {
    const metas = [
      { name: 'theme-color', content: '#3b82f6' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      { name: 'apple-mobile-web-app-title', content: '知识图谱' }
    ];

    metas.forEach(meta => {
      if (!document.querySelector(`meta[name="${meta.name}"]`)) {
        const el = document.createElement('meta');
        el.name = meta.name;
        el.content = meta.content;
        document.head.appendChild(el);
      }
    });
  }

  /**
   * 初始化 PWA
   */
  function initPWA() {
    addManifestLink();
    addAppleTouchIcon();
    addMetaTags();
    registerServiceWorker();
  }

  // 暴露API
  window.CNPT.components.initPWA = initPWA;
  window.CNPT.components.registerServiceWorker = registerServiceWorker;

})();
