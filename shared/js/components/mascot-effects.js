/*!
 * CN-Primary-Taxonomy · 共享组件：吉祥物特效
 * 包括：提示气泡、鼓励条、星星爆发动画
 * 供parent/student/h5角色使用
 */
(function() {
  'use strict';

  // ==================== 提示气泡 ====================

  /**
   * 显示吉祥物提示气泡
   * @param {string} text - 提示文字
   * @param {Object} [options] - 配置选项
   * @param {string} [options.bubbleId] - 气泡元素ID，默认 'mascot-bubble'
   * @param {number} [options.duration] - 显示时长(ms)，默认 4000
   */
  function showMascotTip(text, options = {}) {
    const { bubbleId = 'mascot-bubble', duration = 4000 } = options;
    const bubble = document.getElementById(bubbleId);
    if (!bubble) return;

    bubble.textContent = text;
    bubble.classList.add('show');

    // 清除之前的定时器（如果存在）
    if (bubble._hideTimer) {
      clearTimeout(bubble._hideTimer);
    }
    bubble._hideTimer = setTimeout(() => {
      bubble.classList.remove('show');
    }, duration);
  }

  // ==================== 鼓励条 ====================

  /**
   * 显示鼓励条
   * @param {string} text - 鼓励文字
   * @param {Object} [options] - 配置选项
   * @param {string} [options.barId] - 鼓励条元素ID，默认 'encourage-bar'
   * @param {number} [options.duration] - 显示时长(ms)，默认 3000
   */
  function showEncourage(text, options = {}) {
    const { barId = 'encourage-bar', duration = 3000 } = options;
    const bar = document.getElementById(barId);
    if (!bar) return;

    bar.textContent = text;
    bar.classList.add('show');

    if (bar._hideTimer) {
      clearTimeout(bar._hideTimer);
    }
    bar._hideTimer = setTimeout(() => {
      bar.classList.remove('show');
    }, duration);
  }

  // ==================== 星星爆发动画 ====================

  /**
   * 显示星星爆发动画效果
   * @param {Object} [options] - 配置选项
   * @param {string} [options.emoji] - 使用的emoji，默认 '⭐'
   * @param {number} [options.count] - 星星数量，默认 6
   * @param {number} [options.duration] - 动画时长(ms)，默认 800
   */
  function showStarBurst(options = {}) {
    const { emoji = '⭐', count = 6, duration = 800 } = options;

    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.className = 'cnpt-star-burst';
      star.textContent = emoji;
      star.style.cssText = `
        position: fixed;
        left: ${50 + (Math.random() - 0.5) * 40}%;
        top: ${50 + (Math.random() - 0.5) * 40}%;
        font-size: ${20 + Math.random() * 16}px;
        pointer-events: none;
        z-index: 9999;
        animation: cnpt-star-fly ${duration}ms ease-out forwards;
        --angle: ${Math.random() * 360}deg;
        --distance: ${60 + Math.random() * 80}px;
      `;
      document.body.appendChild(star);
      setTimeout(() => star.remove(), duration);
    }
  }

  // ==================== 注入动画样式 ====================

  function injectStyles() {
    if (document.getElementById('cnpt-mascot-effects-styles')) return;
    const style = document.createElement('style');
    style.id = 'cnpt-mascot-effects-styles';
    style.textContent = `
      @keyframes cnpt-star-fly {
        0% { opacity: 1; transform: translate(0, 0) scale(1); }
        100% { opacity: 0; transform: translate(
          calc(cos(var(--angle)) * var(--distance)),
          calc(sin(var(--angle)) * var(--distance))
        ) scale(0.3); }
      }
      .cnpt-star-burst {
        position: fixed;
        pointer-events: none;
        z-index: 9999;
      }
    `;
    document.head.appendChild(style);
  }

  // 自动注入样式
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectStyles);
  } else {
    injectStyles();
  }

  // 注册到CNPT命名空间
  window.CNPT = window.CNPT || {};
  window.CNPT.components = window.CNPT.components || {};
  window.CNPT.components.showMascotTip = showMascotTip;
  window.CNPT.components.showEncourage = showEncourage;
  window.CNPT.components.showStarBurst = showStarBurst;

})();
