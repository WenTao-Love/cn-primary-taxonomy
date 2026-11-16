/*!
 * CN-Primary-Taxonomy · 四轮拼写闯关共享组件
 * 借鉴《英语单词抄十遍还是记不住？我把它拆成了四轮「闯关」》：
 *   同一轮词过四关，遮挡一轮比一轮多——认形 → 元音 → 骨架 → 默写，不劝退；
 *   答错不直接甩答案，先定位「第 N 个字母不对，还有 2 次机会」；
 *   三次失败或主动看答案才揭示完整单词与释义。
 * 使用方式：
 *   CNPT.components.spellingQuest.render(container, words, {
 *     topicId: 'ct_YY1S001',
 *     onResult: (result) => {}   // result: { topicId, passed, words: [{word, passed, rounds}] }
 *   });
 * words 项：{ word: 'hello', meaning: '你好', phonetic: null }
 */
(function() {
  'use strict';

  window.CNPT = window.CNPT || {};
  window.CNPT.components = window.CNPT.components || {};

  const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);
  const MAX_ATTEMPTS = 3; // 每轮最多尝试次数

  function esc(s) {
    if (window.CNPT?.utils?.escapeHtml) return CNPT.utils.escapeHtml(s);
    return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  // 把单词/短语转成字符槽位：空格为固定槽（不遮挡）
  function toSlots(word) {
    const slots = [];
    const tokens = String(word).split(' ');
    tokens.forEach((tok, ti) => {
      if (ti > 0) slots.push({ ch: ' ', fixed: true });
      for (const ch of tok) slots.push({ ch, fixed: false });
    });
    return slots;
  }

  // 生成某一轮的遮挡掩码：mask[i]=true 表示该字母被遮住
  function maskFor(round, slots) {
    const letters = slots.map((s, i) => (s.fixed ? -1 : i)).filter(i => i >= 0);
    const first = letters[0];
    const last = letters[letters.length - 1];
    return slots.map((s, i) => {
      if (s.fixed) return false;
      if (round === 1) return !(i === first || i === last);        // 认形：留首尾
      if (round === 2) return VOWELS.has(s.ch.toLowerCase());       // 元音：露辅音，遮元音（专练元音组合）
      if (round === 3) return i !== first;                          // 骨架：只留首字母
      return true;                                                  // 默写：全遮
    });
  }

  const ROUND_NAMES = ['① 认形（留首尾）', '② 元音（专练元音组合）', '③ 骨架（只留首字母）', '④ 默写（全遮）'];

  function injectStyles() {
    if (document.getElementById('cnpt-spelling-styles')) return;
    const style = document.createElement('style');
    style.id = 'cnpt-spelling-styles';
    style.textContent = `
      .cnpt-sp { font-size: 13px; color: var(--cnpt-text-main, #1e293b); }
      .cnpt-sp-progress { display: flex; gap: 6px; align-items: center; margin-bottom: 10px; font-size: 12px; color: var(--cnpt-text-sub, #475569); flex-wrap: wrap; }
      .cnpt-sp-pill { padding: 2px 10px; border-radius: 12px; background: rgba(59,130,246,0.1); color: #1d4ed8; font-weight: 600; }
      .cnpt-sp-pill.done { background: rgba(46,204,113,0.16); color: #1e8449; }
      .cnpt-sp-pill.cur { background: var(--cnpt-primary, #3b82f6); color: #fff; }
      .cnpt-sp-meaning { font-size: 15px; margin: 8px 0 12px; color: var(--cnpt-text-main, #1e293b); }
      .cnpt-sp-meaning b { color: var(--cnpt-primary, #3b82f6); }
      .cnpt-sp-round { font-size: 11px; color: #b45309; margin-bottom: 8px; font-weight: 600; }
      .cnpt-sp-slots { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
      .cnpt-sp-slot { min-width: 26px; height: 34px; padding: 0 4px; border-radius: 6px; border: 1px solid var(--cnpt-border, #e2e8f0); background: var(--cnpt-bg-card, #fff);
        display: inline-flex; align-items: center; justify-content: center; font-size: 17px; font-weight: 700; font-family: inherit; text-transform: lowercase; }
      .cnpt-sp-slot.fixed { border: none; background: transparent; min-width: 8px; color: var(--cnpt-text-muted, #94a3b8); }
      .cnpt-sp-slot.mask { background: rgba(59,130,246,0.1); border-style: dashed; color: transparent; }
      .cnpt-sp-slot input { width: 26px; height: 30px; border: none; outline: none; text-align: center; font-size: 16px; font-weight: 700; background: transparent; font-family: inherit; text-transform: lowercase; caret-color: var(--cnpt-primary, #3b82f6); }
      .cnpt-sp-slot.ok { border-color: #2ecc71; background: rgba(46,204,113,0.12); }
      .cnpt-sp-slot.bad { border-color: #e74c3c; background: rgba(231,76,60,0.1); }
      .cnpt-sp-msg { min-height: 22px; font-size: 13px; margin-bottom: 8px; line-height: 1.6; }
      .cnpt-sp-msg.warn { color: #b45309; }
      .cnpt-sp-msg.err { color: #c0392b; }
      .cnpt-sp-msg.ok { color: #1e8449; }
      .cnpt-sp-actions { display: flex; gap: 8px; }
      .cnpt-sp-btn { padding: 7px 16px; border-radius: 8px; border: 1px solid var(--cnpt-border, #e2e8f0); background: var(--cnpt-bg-card, #fff); font-size: 13px; cursor: pointer; }
      .cnpt-sp-btn.primary { background: var(--cnpt-primary, #3b82f6); color: #fff; border-color: var(--cnpt-primary, #3b82f6); }
      .cnpt-sp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      .cnpt-sp-result { text-align: center; padding: 18px 8px; }
      .cnpt-sp-result .icon { font-size: 40px; }
      .cnpt-sp-result .t { font-size: 16px; font-weight: 700; margin: 8px 0; }
      .cnpt-sp-result .s { font-size: 12px; color: var(--cnpt-text-muted, #94a3b8); }
    `;
    document.head.appendChild(style);
  }

  /**
   * 渲染拼写闯关
   * @param {HTMLElement} container
   * @param {Array<{word:string, meaning:string, phonetic?:string}>} words
   * @param {{topicId?:string, onResult?:Function}} options
   */
  function render(container, words, options = {}) {
    if (!container) return;
    injectStyles();
    if (!Array.isArray(words) || !words.length) {
      container.innerHTML = '<div class="cnpt-sp"><div class="cnpt-sp-result"><div class="icon">📭</div><div class="t">这个词还没有词表</div><div class="s">老师导入词表后才能开始拼写闯关</div></div></div>';
      return;
    }

    const state = {
      wordIdx: 0,
      round: 0,            // 0..3
      attempts: 0,
      records: [],         // {word, passed, rounds}
      slots: [],
      mask: [],
      inputs: [],
      done: false
    };

    container.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'cnpt-sp';
    container.appendChild(root);

    const progress = document.createElement('div');
    progress.className = 'cnpt-sp-progress';
    root.appendChild(progress);

    const meaning = document.createElement('div');
    meaning.className = 'cnpt-sp-meaning';
    root.appendChild(meaning);

    const roundLabel = document.createElement('div');
    roundLabel.className = 'cnpt-sp-round';
    root.appendChild(roundLabel);

    const slotsBox = document.createElement('div');
    slotsBox.className = 'cnpt-sp-slots';
    root.appendChild(slotsBox);

    const msg = document.createElement('div');
    msg.className = 'cnpt-sp-msg';
    root.appendChild(msg);

    const actions = document.createElement('div');
    actions.className = 'cnpt-sp-actions';
    actions.innerHTML = `<button class="cnpt-sp-btn primary" data-act="check">✓ 检查</button><button class="cnpt-sp-btn" data-act="answer">看答案</button>`;
    root.appendChild(actions);

    function currentWord() { return words[state.wordIdx]; }

    function drawProgress() {
      const pills = [];
      pills.push(`<span class="cnpt-sp-pill">第 ${state.wordIdx + 1}/${words.length} 词</span>`);
      ROUND_NAMES.forEach((n, i) => {
        const cls = i < state.round ? 'done' : i === state.round ? 'cur' : '';
        pills.push(`<span class="cnpt-sp-pill ${cls}">${n}</span>`);
      });
      progress.innerHTML = pills.join('');
    }

    function drawWord() {
      const w = currentWord();
      state.slots = toSlots(w.word);
      state.mask = maskFor(state.round + 1, state.slots);
      state.inputs = state.slots.map(() => '');
      state.attempts = 0;

      meaning.innerHTML = `中文意思：<b>${esc(w.meaning)}</b>${w.phonetic ? ` <span style="color:#94a3b8;font-size:12px">${esc(w.phonetic)}</span>` : ''}`;
      roundLabel.textContent = `第 ${state.round + 1} 关 · ${ROUND_NAMES[state.round]}`;

      slotsBox.innerHTML = '';
      state.slots.forEach((s, i) => {
        const div = document.createElement('div');
        if (s.fixed) {
          div.className = 'cnpt-sp-slot fixed';
          div.textContent = ' ';
          slotsBox.appendChild(div);
          return;
        }
        div.className = 'cnpt-sp-slot' + (state.mask[i] ? ' mask' : '');
        if (state.mask[i]) {
          const inp = document.createElement('input');
          inp.maxLength = 1;
          inp.dataset.idx = i;
          inp.setAttribute('aria-label', `第 ${i + 1} 个字母`);
          div.appendChild(inp);
        } else {
          div.textContent = s.ch;
        }
        slotsBox.appendChild(div);
      });

      msg.textContent = '';
      msg.className = 'cnpt-sp-msg';
      actions.querySelector('[data-act="check"]').disabled = false;
      focusFirstMasked();
      drawProgress();
    }

    function focusFirstMasked() {
      const first = slotsBox.querySelector('input');
      if (first) first.focus();
    }

    // 输入自动前进 / 退格回退
    slotsBox.addEventListener('input', e => {
      const inp = e.target;
      if (inp.tagName !== 'INPUT') return;
      inp.value = inp.value.replace(/[^a-zA-Z]/g, '').slice(-1);
      const idx = Number(inp.dataset.idx);
      state.inputs[idx] = inp.value.toLowerCase();
      if (inp.value) {
        const next = slotsBox.querySelector(`input[data-idx="${idx + 1}"]`);
        if (next) next.focus();
      }
      inp.closest('.cnpt-sp-slot').classList.remove('bad');
    });
    slotsBox.addEventListener('keydown', e => {
      const inp = e.target;
      if (inp.tagName !== 'INPUT') return;
      const idx = Number(inp.dataset.idx);
      if (e.key === 'Backspace' && !inp.value) {
        const prev = slotsBox.querySelector(`input[data-idx="${idx - 1}"]`);
        if (prev) { prev.focus(); e.preventDefault(); }
      }
      if (e.key === 'Enter') { e.preventDefault(); check(); }
    });

    function collect() {
      // 把所有输入框的值同步进 state.inputs
      slotsBox.querySelectorAll('input').forEach(inp => {
        state.inputs[Number(inp.dataset.idx)] = inp.value.toLowerCase();
      });
    }

    function check() {
      collect();
      const w = currentWord();
      let firstBad = -1;
      for (let i = 0; i < state.slots.length; i++) {
        const s = state.slots[i];
        // 固定槽（空格）与未遮挡槽（本轮直接显示的字母）不参与校验
        if (s.fixed || !state.mask[i]) continue;
        const got = state.inputs[i];
        const want = s.ch.toLowerCase();
        if (got !== want && firstBad < 0) firstBad = i;
      }
      if (firstBad < 0) { onRoundPass(); return; }

      state.attempts++;
      // 标红错误槽位
      const slotEls = slotsBox.querySelectorAll('.cnpt-sp-slot');
      for (let i = 0; i < state.slots.length; i++) {
        if (state.slots[i].fixed || !state.mask[i]) continue;
        const got = state.inputs[i];
        if (got !== state.slots[i].ch.toLowerCase()) slotEls[i].classList.add('bad');
      }

      if (state.attempts >= MAX_ATTEMPTS) {
        msg.className = 'cnpt-sp-msg err';
        msg.textContent = `三次机会用完啦，完整单词是「${w.word}」。记住它，我们继续下一关。`;
        revealAnswer();
        actions.querySelector('[data-act="check"]').disabled = true;
        setTimeout(nextRound, 1400);
      } else {
        msg.className = 'cnpt-sp-msg warn';
        msg.textContent = `第 ${firstBad + 1} 个字母不对，还有 ${MAX_ATTEMPTS - state.attempts} 次机会。`;
      }
    }

    function revealAnswer() {
      // 显示完整单词
      slotsBox.querySelectorAll('.cnpt-sp-slot').forEach((div, i) => {
        if (state.slots[i].fixed || !state.mask[i]) return;
        div.classList.remove('mask');
        const inp = div.querySelector('input');
        if (inp) { inp.replaceWith(document.createTextNode(state.slots[i].ch)); }
        div.classList.add(state.inputs[i] === state.slots[i].ch.toLowerCase() ? 'ok' : 'bad');
      });
    }

    function onRoundPass() {
      msg.className = 'cnpt-sp-msg ok';
      msg.textContent = '✅ 这一关过了！';
      slotsBox.querySelectorAll('.cnpt-sp-slot').forEach((div, i) => {
        if (state.slots[i].fixed || !state.mask[i]) return;
        div.classList.add('ok');
        const inp = div.querySelector('input');
        if (inp) inp.replaceWith(document.createTextNode(state.slots[i].ch));
      });
      actions.querySelector('[data-act="check"]').disabled = true;
      setTimeout(nextRound, 650);
    }

    function nextRound() {
      state.round++;
      if (state.round >= 4) {
        // 完成一词
        const w = currentWord();
        const passed = true; // 到达默写关即视为掌握（失败也会揭示答案后继续）
        state.records.push({ word: w.word, meaning: w.meaning, passed, rounds: state.round });
        state.wordIdx++;
        state.round = 0;
        if (state.wordIdx >= words.length) { finish(); return; }
      }
      drawWord();
    }

    function finish() {
      state.done = true;
      const passed = state.records.every(r => r.passed);
      root.innerHTML = `
        <div class="cnpt-sp-result">
          <div class="icon">${passed ? '🎉' : '💪'}</div>
          <div class="t">${passed ? '全部闯过！' : '练完了一组'}</div>
          <div class="s">${state.records.map(r => `${esc(r.word)} ${r.passed ? '✅' : '❌'}`).join(' · ')}</div>
          <div class="s" style="margin-top:6px">同一个词过四关：从「看着眼熟」到「能默出来」。</div>
        </div>`;
      if (typeof options.onResult === 'function') {
        options.onResult({ topicId: options.topicId || null, passed, records: state.records });
      }
    }

    actions.addEventListener('click', e => {
      const act = e.target.dataset?.act;
      if (state.done) return;
      if (act === 'check') check();
      if (act === 'answer') {
        collect();
        const w = currentWord();
        msg.className = 'cnpt-sp-msg warn';
        msg.textContent = `完整单词：${w.word}（${w.meaning}）。看完就试着默写一次！`;
        revealAnswer();
        state.attempts = MAX_ATTEMPTS; // 看答案后不再提示机会
        actions.querySelector('[data-act="check"]').disabled = true;
        setTimeout(nextRound, 1600);
      }
    });

    drawWord();
  }

  window.CNPT.components.spellingQuest = { render, ROUND_NAMES };
})();
