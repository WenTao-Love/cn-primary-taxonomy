/*!
 * CN-Primary-Taxonomy · 知识点错误反馈组件
 * 为所有角色版本提供统一的内容错误报告入口
 * 使用方式：在角色JS中调用 CNPT.components.initErrorFeedback()
 */
(function() {
  'use strict';

  window.CNPT = window.CNPT || {};
  window.CNPT.components = window.CNPT.components || {};

  // 反馈数据键
  const FEEDBACK_KEY = 'cnpt_error_feedback';
  const FEEDBACK_DISMISS_KEY = 'cnpt_feedback_dismissed';

  /**
   * 获取已提交的反馈列表
   */
  function getFeedbackList() {
    try {
      return JSON.parse(localStorage.getItem(FEEDBACK_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  /**
   * 保存反馈
   */
  function saveFeedback(feedback) {
    const list = getFeedbackList();
    feedback.id = 'fb_' + Date.now();
    feedback.createdAt = new Date().toISOString();
    feedback.status = 'pending'; // pending | reviewed | resolved
    list.unshift(feedback);
    // 最多保留50条
    if (list.length > 50) list.length = 50;
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(list));
    return feedback;
  }

  /**
   * 获取当前页面上下文信息
   */
  function getPageContext() {
    const url = window.location.pathname;
    let role = 'unknown';
    if (url.includes('teacher')) role = 'teacher';
    else if (url.includes('parent')) role = 'parent';
    else if (url.includes('student')) role = 'student';
    else if (url.includes('h5')) role = 'h5';
    else if (url.includes('training')) role = 'training';
    else if (url.includes('admin')) role = 'admin';
    else if (url.includes('researcher')) role = 'researcher';
    else if (url.includes('headteacher')) role = 'headteacher';
    else if (url.includes('testdesigner')) role = 'testdesigner';
    else if (url.includes('transition')) role = 'transition';
    else if (url.includes('edu-sales')) role = 'edu-sales';
    else if (url.includes('competitor')) role = 'competitor-analyst';
    else if (url.includes('school-entity')) role = 'school-entity';
    else if (url.includes('admissions')) role = 'admissions';
    else if (url.includes('afterschool')) role = 'afterschool';
    return { url, role };
  }

  /**
   * 创建反馈按钮
   */
  function createFeedbackButton() {
    const btn = document.createElement('button');
    btn.id = 'cnpt-feedback-btn';
    btn.className = 'cnpt-feedback-btn';
    btn.setAttribute('aria-label', '反馈内容错误');
    btn.innerHTML = '🚩 报错';
    btn.title = '发现内容错误？点击反馈';
    btn.addEventListener('click', openFeedbackModal);
    document.body.appendChild(btn);
    return btn;
  }

  /**
   * 打开反馈弹窗
   */
  function openFeedbackModal() {
    // 防止重复打开
    if (document.getElementById('cnpt-feedback-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'cnpt-feedback-modal';
    modal.className = 'cnpt-feedback-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', '内容错误反馈');
    modal.setAttribute('aria-modal', 'true');

    // 获取当前选中的知识点（如果有）
    const currentTopic = window.CNPT?.currentTopic || null;

    modal.innerHTML = `
      <div class="cnpt-feedback-overlay"></div>
      <div class="cnpt-feedback-content">
        <div class="cnpt-feedback-header">
          <h3>🚩 内容错误反馈</h3>
          <button class="cnpt-feedback-close" aria-label="关闭">×</button>
        </div>
        <div class="cnpt-feedback-body">
          <p class="cnpt-feedback-help">发现知识点内容有误？请告诉我们，我们会尽快核实修正。</p>
          
          <div class="cnpt-feedback-field">
            <label for="fb-topic">涉及知识点</label>
            <input type="text" id="fb-topic" placeholder="例如：进位乘法（如不确定可留空）" value="${currentTopic ? window.CNPT.utils.escapeHtml(currentTopic.name) : ''}">
          </div>

          <div class="cnpt-feedback-field">
            <label for="fb-type">问题类型</label>
            <select id="fb-type">
              <option value="content">📝 内容错误（描述/编码不准确）</option>
              <option value="dependency">🔗 依赖关系错误</option>
              <option value="missing">➕ 缺少知识点</option>
              <option value="difficulty">📊 难度标注不当</option>
              <option value="other">💬 其他问题或建议</option>
            </select>
          </div>

          <div class="cnpt-feedback-field">
            <label for="fb-desc">问题描述</label>
            <textarea id="fb-desc" rows="4" placeholder="请描述具体问题，例如：xxx知识点描述中的公式有误，应为..."></textarea>
          </div>

          <div class="cnpt-feedback-field">
            <label for="fb-expected">正确的应该是（选填）</label>
            <input type="text" id="fb-expected" placeholder="如果您知道正确答案，请填写">
          </div>

          <div class="cnpt-feedback-actions">
            <button class="cnpt-feedback-submit" id="fb-submit">提交反馈</button>
            <button class="cnpt-feedback-cancel" id="fb-cancel">取消</button>
          </div>

          <p class="cnpt-feedback-note">💡 您的反馈将匿名保存在本地，同时可通过GitHub提交给开发团队。处理时限：7个工作日。</p>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // 事件绑定
    const closeModal = () => modal.remove();
    modal.querySelector('.cnpt-feedback-close').addEventListener('click', closeModal);
    modal.querySelector('.cnpt-feedback-overlay').addEventListener('click', closeModal);
    modal.querySelector('#fb-cancel').addEventListener('click', closeModal);

    modal.querySelector('#fb-submit').addEventListener('click', () => {
      const topic = document.getElementById('fb-topic').value.trim();
      const type = document.getElementById('fb-type').value;
      const desc = document.getElementById('fb-desc').value.trim();
      const expected = document.getElementById('fb-expected').value.trim();

      if (!desc) {
        window.CNPT.utils.showToast('请填写问题描述');
        return;
      }

      const feedback = {
        topic,
        type,
        description: desc,
        expected,
        context: getPageContext(),
        userAgent: navigator.userAgent.substring(0, 100)
      };

      saveFeedback(feedback);
      closeModal;
      window.CNPT.utils.showToast('✅ 感谢反馈！我们会尽快核实处理');
      
      // 标记今天已提交过反馈
      localStorage.setItem(FEEDBACK_DISMISS_KEY, new Date().toDateString());
    });

    // 自动聚焦
    setTimeout(() => document.getElementById('fb-desc')?.focus(), 100);
  }

  /**
   * 注入反馈按钮样式
   */
  function injectStyles() {
    if (document.getElementById('cnpt-feedback-styles')) return;
    const style = document.createElement('style');
    style.id = 'cnpt-feedback-styles';
    style.textContent = `
      .cnpt-feedback-btn {
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 10px 18px;
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: #fff;
        border: none;
        border-radius: 24px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .cnpt-feedback-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
      }
      .cnpt-feedback-modal {
        position: fixed;
        inset: 0;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .cnpt-feedback-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0.5);
      }
      .cnpt-feedback-content {
        position: relative;
        background: var(--cnpt-bg, #fff);
        color: var(--cnpt-text, #1e293b);
        border-radius: 16px;
        width: 90%;
        max-width: 480px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        z-index: 1;
      }
      .cnpt-feedback-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid var(--cnpt-border, #e2e8f0);
      }
      .cnpt-feedback-header h3 { margin: 0; font-size: 16px; }
      .cnpt-feedback-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: var(--cnpt-text-secondary, #94a3b8);
        padding: 4px 8px;
      }
      .cnpt-feedback-body { padding: 20px; }
      .cnpt-feedback-help { font-size: 13px; color: var(--cnpt-text-secondary, #64748b); margin-bottom: 16px; }
      .cnpt-feedback-field { margin-bottom: 14px; }
      .cnpt-feedback-field label {
        display: block;
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 4px;
        color: var(--cnpt-text, #1e293b);
      }
      .cnpt-feedback-field input,
      .cnpt-feedback-field select,
      .cnpt-feedback-field textarea {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--cnpt-border, #e2e8f0);
        border-radius: 8px;
        font-size: 13px;
        font-family: inherit;
        background: var(--cnpt-bg, #fff);
        color: var(--cnpt-text, #1e293b);
      }
      .cnpt-feedback-field textarea { resize: vertical; }
      .cnpt-feedback-actions {
        display: flex;
        gap: 10px;
        margin-top: 16px;
      }
      .cnpt-feedback-submit {
        flex: 1;
        padding: 10px;
        background: #f59e0b;
        color: #fff;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
      }
      .cnpt-feedback-cancel {
        padding: 10px 20px;
        background: var(--cnpt-bg-secondary, #f1f5f9);
        color: var(--cnpt-text, #1e293b);
        border: 1px solid var(--cnpt-border, #e2e8f0);
        border-radius: 8px;
        font-size: 14px;
        cursor: pointer;
      }
      .cnpt-feedback-note {
        font-size: 11px;
        color: var(--cnpt-text-secondary, #94a3b8);
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid var(--cnpt-border, #e2e8f0);
      }
      @media (max-width: 600px) {
        .cnpt-feedback-btn { bottom: 16px; right: 16px; padding: 8px 14px; font-size: 12px; }
        .cnpt-feedback-content { width: 95%; }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 初始化错误反馈组件
   */
  function initErrorFeedback() {
    injectStyles();
    createFeedbackButton();
  }

  // 暴露API
  window.CNPT.components.initErrorFeedback = initErrorFeedback;
  window.CNPT.components.getFeedbackList = getFeedbackList;
  window.CNPT.components.getPageContext = getPageContext;

})();
