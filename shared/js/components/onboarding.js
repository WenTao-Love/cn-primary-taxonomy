/*!
 * CN-Primary-Taxonomy · 入门引导组件
 * 首次使用时的蒙层教程，3-5步引导用户了解核心功能
 * 使用方式：CNPT.components.initOnboarding()
 */
(function() {
  'use strict';

  window.CNPT = window.CNPT || {};
  window.CNPT.components = window.CNPT.components || {};

  const STORAGE_KEY = 'cnpt_onboarding_done';
  const STEPS_KEY = 'cnpt_onboarding_step';

  /**
   * 获取角色专属引导步骤
   */
  function getSteps() {
    const url = window.location.pathname;
    let role = 'default';
    if (url.includes('teacher')) role = 'teacher';
    else if (url.includes('parent')) role = 'parent';
    else if (url.includes('student')) role = 'student';
    else if (url.includes('h5')) role = 'h5';
    else if (url.includes('training')) role = 'training';
    else if (url.includes('admin')) role = 'admin';

    // 通用步骤
    const commonSteps = [
      {
        title: '👋 欢迎使用知识图谱',
        desc: '这是一个覆盖11学科、4275个知识点的学习工具。让我们用30秒了解核心功能。',
        target: null,
        position: 'center'
      },
      {
        title: '🔍 搜索知识点',
        desc: '在搜索框中输入关键词（如"乘法"、"部首"），快速找到相关知识点。',
        target: '#main-search, #search-input, input[aria-label*="搜索"]',
        position: 'bottom'
      },
      {
        title: '🗺️ 查看知识图谱',
        desc: '点击"知识图谱"标签，可视化查看知识点之间的依赖关系。点击节点查看详情。',
        target: '[data-view="graph"], #view-graph',
        position: 'bottom'
      },
      {
        title: '📋 课标对照与路径',
        desc: '查看知识点对应的课标编码，或使用学习路径生成器获取推荐学习序列。',
        target: '[data-view="standards"], [data-view="path"]',
        position: 'bottom'
      },
      {
        title: '🚩 反馈与主题',
        desc: '发现内容错误？点击右下角"🚩 报错"按钮反馈。点击右上角可切换主题和字号。',
        target: '#cnpt-theme-toggle',
        position: 'left'
      },
      {
        title: '🎉 开始探索',
        desc: '现在你已经了解了核心功能，开始你的知识图谱之旅吧！',
        target: null,
        position: 'center'
      }
    ];

    // 角色专属步骤
    const roleSteps = {
      teacher: [
        { title: '👨‍🏫 教师版功能', desc: '教师版提供课标对照、学习路径生成、知识点库等专业功能。', target: null, position: 'center' },
        { title: '📊 教学概览', desc: '查看年级×学科覆盖统计表，了解知识点分布。', target: '[data-view="dashboard"]', position: 'bottom' }
      ],
      parent: [
        { title: '👨‍👩‍家长版功能', desc: '家长版提供学习助手、教练式引导、小伙伴模式等功能。', target: null, position: 'center' },
        { title: '🧒 小伙伴模式', desc: '点击"小伙伴模式"切换到孩子视角，体验游戏化学习。', target: '#kid-mode-toggle', position: 'bottom' }
      ],
      student: [
        { title: '🧒 学生版功能', desc: '通过答题获得星星奖励，让学习更有趣！', target: null, position: 'center' },
        { title: '⭐ 收集星星', desc: '答对题目获得星星，积累星星解锁成就。', target: '#star-count', position: 'bottom' }
      ],
      h5: [
        { title: '📱 H5移动版', desc: '支持触摸手势：双指缩放、拖拽平移、点击选择节点。', target: null, position: 'center' },
        { title: '🗺️ 底部导航', desc: '图谱、搜索、学习、错题、我的 — 五大功能一键切换。', target: '#bottom-nav', position: 'top' }
      ]
    };

    // 合并通用步骤和角色专属步骤
    const specific = roleSteps[role] || [];
    return [...commonSteps.slice(0, 1), ...specific, ...commonSteps.slice(1)];
  }

  /**
   * 检查是否已完成引导
   */
  function isDone() {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch (e) {
      return false;
    }
  }

  /**
   * 标记引导已完成
   */
  function markDone() {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch (e) { /* ignore */ }
  }

  /**
   * 注入样式
   */
  function injectStyles() {
    if (document.getElementById('cnpt-onboarding-styles')) return;
    const style = document.createElement('style');
    style.id = 'cnpt-onboarding-styles';
    style.textContent = `
      .cnpt-onboarding-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.6);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: cnpt-fade-in 0.3s ease;
      }
      @keyframes cnpt-fade-in { from { opacity: 0; } to { opacity: 1; } }
      .cnpt-onboarding-card {
        background: #fff;
        color: #1e293b;
        border-radius: 16px;
        padding: 28px 24px;
        max-width: 400px;
        width: 90%;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        animation: cnpt-slide-up 0.3s ease;
      }
      @keyframes cnpt-slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      .cnpt-onboarding-icon { font-size: 40px; margin-bottom: 12px; }
      .cnpt-onboarding-title { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
      .cnpt-onboarding-desc { font-size: 14px; color: #64748b; margin-bottom: 20px; line-height: 1.6; }
      .cnpt-onboarding-progress { display: flex; justify-content: center; gap: 6px; margin-bottom: 16px; }
      .cnpt-onboarding-dot { width: 8px; height: 8px; border-radius: 50%; background: #e2e8f0; transition: all 0.2s; }
      .cnpt-onboarding-dot.active { background: #3b82f6; width: 20px; border-radius: 4px; }
      .cnpt-onboarding-btns { display: flex; gap: 10px; justify-content: center; }
      .cnpt-onboarding-btn {
        padding: 10px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        border: none;
        transition: all 0.2s;
      }
      .cnpt-onboarding-next { background: #3b82f6; color: #fff; }
      .cnpt-onboarding-next:hover { background: #2563eb; }
      .cnpt-onboarding-skip { background: #f1f5f9; color: #64748b; }
      .cnpt-onboarding-skip:hover { background: #e2e8f0; }
      .cnpt-onboarding-step { font-size: 12px; color: #94a3b8; margin-bottom: 8px; }
    `;
    document.head.appendChild(style);
  }

  /**
   * 显示引导
   */
  function showOnboarding() {
    if (isDone()) return;

    const steps = getSteps();
    let currentStep = 0;

    injectStyles();

    const overlay = document.createElement('div');
    overlay.className = 'cnpt-onboarding-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', '入门引导');

    function renderStep() {
      const step = steps[currentStep];
      overlay.innerHTML = `
        <div class="cnpt-onboarding-card">
          <div class="cnpt-onboarding-step">第 ${currentStep + 1} / ${steps.length} 步</div>
          <div class="cnpt-onboarding-icon">${step.title.split(' ')[0]}</div>
          <div class="cnpt-onboarding-title">${step.title.substring(step.title.indexOf(' ') + 1)}</div>
          <div class="cnpt-onboarding-desc">${step.desc}</div>
          <div class="cnpt-onboarding-progress">
            ${steps.map((_, i) => `<div class="cnpt-onboarding-dot ${i === currentStep ? 'active' : ''}"></div>`).join('')}
          </div>
          <div class="cnpt-onboarding-btns">
            <button class="cnpt-onboarding-btn cnpt-onboarding-skip" id="ob-skip">跳过</button>
            <button class="cnpt-onboarding-btn cnpt-onboarding-next" id="ob-next">
              ${currentStep === steps.length - 1 ? '开始使用' : '下一步'}
            </button>
          </div>
        </div>
      `;

      document.getElementById('ob-skip').addEventListener('click', closeOnboarding);
      document.getElementById('ob-next').addEventListener('click', () => {
        currentStep++;
        if (currentStep >= steps.length) {
          closeOnboarding();
        } else {
          renderStep();
        }
      });
    }

    function closeOnboarding() {
      overlay.remove();
      markDone();
    }

    document.body.appendChild(overlay);
    renderStep();
  }

  /**
   * 初始化入门引导
   */
  function initOnboarding() {
    // 延迟显示，确保页面已渲染
    setTimeout(showOnboarding, 1500);
  }

  // 暴露API
  window.CNPT.components.initOnboarding = initOnboarding;
  window.CNPT.components.isOnboardingDone = isDone;

})();
