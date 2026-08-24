/*!
 * CN-Primary-Taxonomy · 语音搜索组件
 * 基于 Web Speech API (SpeechRecognition)
 * 使用方式：CNPT.components.initVoiceSearch()
 */
(function() {
  'use strict';

  window.CNPT = window.CNPT || {};
  window.CNPT.components = window.CNPT.components || {};

  /**
   * 检查浏览器是否支持语音识别
   */
  function isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  /**
   * 创建语音识别实例
   */
  function createRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    return recognition;
  }

  /**
   * 为搜索输入框添加语音按钮
   */
  function addVoiceButton(inputEl, options = {}) {
    if (!inputEl || !isSupported()) return null;

    // 检查是否已有语音按钮
    if (inputEl.parentElement.querySelector('.cnpt-voice-btn')) {
      return inputEl.parentElement.querySelector('.cnpt-voice-btn');
    }

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cnpt-voice-btn';
    btn.setAttribute('aria-label', '语音搜索');
    btn.title = '点击开始语音搜索';
    btn.innerHTML = '🎤';

    // 插入到输入框后面
    inputEl.parentElement.style.position = 'relative';
    inputEl.parentElement.appendChild(btn);

    // 实时转录显示
    let interimDiv = null;
    const recognition = createRecognition();
    if (!recognition) return btn;

    let isListening = false;

    btn.addEventListener('click', () => {
      if (isListening) {
        recognition.stop();
        return;
      }

      try {
        recognition.start();
        isListening = true;
        btn.classList.add('listening');
        btn.innerHTML = '🔴';
        btn.title = '点击停止录音';

        // 显示实时转录
        if (!interimDiv) {
          interimDiv = document.createElement('div');
          interimDiv.className = 'cnpt-voice-interim';
          inputEl.parentElement.appendChild(interimDiv);
        }
        interimDiv.textContent = '正在聆听...';
        interimDiv.classList.add('show');

      } catch (e) {
        console.warn('语音识别启动失败:', e);
        window.CNPT.utils.showToast('语音识别启动失败，请检查麦克风权限');
        btn.classList.remove('listening');
        btn.innerHTML = '🎤';
        isListening = false;
      }
    });

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        inputEl.value = finalTranscript;
        if (options.onResult) options.onResult(finalTranscript);
        // 触发input事件以兼容现有搜索逻辑
        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      }

      if (interimDiv && interimTranscript) {
        interimDiv.textContent = interimTranscript;
      }
    };

    recognition.onerror = (event) => {
      console.warn('语音识别错误:', event.error);
      if (event.error === 'no-speech') {
        window.CNPT.utils.showToast('没有检测到语音，请重试');
      } else if (event.error === 'audio-capture') {
        window.CNPT.utils.showToast('无法访问麦克风');
      } else if (event.error === 'not-allowed') {
        window.CNPT.utils.showToast('麦克风权限被拒绝');
      }
    };

    recognition.onend = () => {
      isListening = false;
      btn.classList.remove('listening');
      btn.innerHTML = '🎤';
      btn.title = '点击开始语音搜索';
      if (interimDiv) {
        interimDiv.classList.remove('show');
      }
    };

    return btn;
  }

  /**
   * 注入样式
   */
  function injectStyles() {
    if (document.getElementById('cnpt-voice-search-styles')) return;
    const style = document.createElement('style');
    style.id = 'cnpt-voice-search-styles';
    style.textContent = `
      .cnpt-voice-btn {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 1px solid var(--cnpt-border, #e2e8f0);
        background: var(--cnpt-bg-card, #fff);
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        z-index: 5;
      }
      .cnpt-voice-btn:hover {
        background: rgba(59,130,246,0.1);
        border-color: var(--cnpt-primary, #3b82f6);
      }
      .cnpt-voice-btn.listening {
        background: rgba(239,68,68,0.15);
        border-color: #ef4444;
        animation: cnpt-voice-pulse 1.2s infinite;
      }
      @keyframes cnpt-voice-pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.3); }
        50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
      }
      .cnpt-voice-interim {
        position: absolute;
        bottom: -24px;
        left: 0;
        right: 0;
        font-size: 11px;
        color: var(--cnpt-text-muted, #94a3b8);
        background: var(--cnpt-bg-card, #fff);
        padding: 2px 8px;
        border-radius: 4px;
        opacity: 0;
        transition: opacity 0.2s;
        pointer-events: none;
        z-index: 5;
      }
      .cnpt-voice-interim.show { opacity: 1; }
      /* 有语音按钮时给输入框加padding */
      input[aria-label*="搜索"] { padding-right: 44px !important; }
    `;
    document.head.appendChild(style);
  }

  /**
   * 初始化语音搜索
   */
  function initVoiceSearch() {
    if (!isSupported()) {
      console.log('[CNPT] 当前浏览器不支持语音识别');
      return;
    }

    injectStyles();

    // 为所有搜索输入框添加语音按钮
    const searchInputs = document.querySelectorAll('input[aria-label*="搜索"], input[placeholder*="搜索"], input[id="search"], .cnpt-search-input');
    searchInputs.forEach(input => {
      addVoiceButton(input);
    });
  }

  // 暴露API
  window.CNPT.components.initVoiceSearch = initVoiceSearch;
  window.CNPT.components.isVoiceSupported = isSupported;
  window.CNPT.components.addVoiceButton = addVoiceButton;

})();
