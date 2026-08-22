/*!
 * CN-Primary-Taxonomy · 共享组件：加载失败错误提示
 * 提供统一的加载失败UI，支持重试按钮
 * 所有角色(parent/student/teacher/h5)均可使用
 */
(function() {
  'use strict';

  /**
   * 显示加载失败提示
   * @param {string} message - 错误消息
   * @param {Object} [options] - 配置选项
   * @param {string} [options.icon] - 图标emoji，默认 '⚠️'
   * @param {string} [options.title] - 标题，默认 '加载失败'
   * @param {string} [options.buttonText] - 按钮文字，默认 '🔄 重新加载'
   * @param {Function} [options.onRetry] - 自定义重试回调，默认 location.reload()
   * @param {string} [options.role] - 角色类型，影响配色风格
   */
  function showLoadError(message, options = {}) {
    const {
      icon = '⚠️',
      title = '加载失败',
      buttonText = '🔄 重新加载',
      onRetry = null,
      role = 'default'
    } = options;

    const loadingEl = document.getElementById('cnpt-loading');
    if (loadingEl) {
      const btnStyle = role === 'student'
        ? 'padding:10px 24px;background:#f39c12;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px'
        : 'padding:10px 24px;background:#5dade2;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px';

      loadingEl.innerHTML = `
        <div style="text-align:center;padding:20px">
          <div style="font-size:32px;margin-bottom:12px">${icon}</div>
          <div class="cnpt-loading-text" style="margin-bottom:8px;font-weight:600">${window.CNPT.utils.escapeHtml(title)}</div>
          <div class="cnpt-loading-text" style="margin-bottom:16px;color:#666;font-size:13px">${window.CNPT.utils.escapeHtml(message)}</div>
          <button id="cnpt-retry-btn" style="${btnStyle}">
            ${buttonText}
          </button>
        </div>
      `;
      loadingEl.classList.remove('cnpt-loading-hidden');

      // 绑定重试事件
      const retryBtn = document.getElementById('cnpt-retry-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          if (onRetry) {
            onRetry();
          } else {
            location.reload();
          }
        });
      }
    } else {
      // 降级：使用toast
      window.CNPT.utils.showToast(message);
    }
  }

  // 注册到CNPT命名空间
  window.CNPT = window.CNPT || {};
  window.CNPT.components = window.CNPT.components || {};
  window.CNPT.components.showLoadError = showLoadError;

})();
