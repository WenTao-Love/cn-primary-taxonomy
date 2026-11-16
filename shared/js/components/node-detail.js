/*!
 * CN-Primary-Taxonomy · 节点详情共享组件
 * 统一的知识点详情渲染，支持角色差异化配置
 * 使用方式：
 *   CNPT.components.renderNodeDetail(topic, {
 *     container: document.getElementById('detail-panel'),
 *     showMastery: true,
 *     showCoach: true,
 *     onMasteryChange: (id, status) => {},
 *     onNodeClick: (id) => {}
 *   });
 */
(function() {
  'use strict';

  window.CNPT = window.CNPT || {};
  window.CNPT.components = window.CNPT.components || {};

  /**
   * 渲染知识点详情
   * @param {Object} topic - 知识点数据
   * @param {Object} options - 配置选项
   */
  function renderNodeDetail(topic, options = {}) {
    if (!topic) return;

    const {
      container,
      showMastery = false,
      showCoach = false,
      showStandards = false,
      showExamTips = false,
      showResources = false,
      showBookmark = false,
      showEnhanced = true,
      showModels = true,
      enhancedVariant = 'parent',
      storage = null,
      onMasteryChange = null,
      onNodeClick = null,
      onBookmarkToggle = null
    } = options;

    if (!container) return;

    // 获取路径信息
    const hardPrereqs = (window.CNPT?.path?.getHardPrerequisites) ? CNPT.path.getHardPrerequisites(topic.id) : [];
    const softPrereqs = (window.CNPT?.path?.getSoftPrerequisites) ? CNPT.path.getSoftPrerequisites(topic.id) : [];
    const successors = (window.CNPT?.path?.getSuccessors) ? CNPT.path.getSuccessors(topic.id) : [];
    const coachText = (window.CNPT?.utils?.buildCoachText) ? CNPT.utils.buildCoachText(topic, hardPrereqs, successors) : '';

    // 获取掌握状态（storage 为 CNPT.storage.create(role) 的实例；
    // CNPT.storage 本身只是 { StorageManager, create } 命名空间，需兜底创建）
    let masteryStatus = 'not-started';
    if (showMastery && topic) {
      const st = storage || (window.CNPT?.storage?.create ? CNPT.storage.create('parent') : null);
      if (st && typeof st.getTopicStatus === 'function') {
        masteryStatus = st.getTopicStatus(topic.id) || 'not-started';
      }
    }

    // 标签
    const subjectColor = (window.CNPT?.constants?.COLORS) ? (CNPT.constants.COLORS[topic.subject] || '#888') : '#888';
    const tags = [
      `<span class="cnpt-tag" style="background:${subjectColor}20;color:${subjectColor}">${topic.subject}</span>`,
      `<span class="cnpt-tag" style="background:rgba(0,0,0,0.06);color:#666">${topic.domain || ''}</span>`,
      `<span class="cnpt-tag" style="background:rgba(0,0,0,0.06);color:#666">${topic.grade}年级${topic.term || ''}</span>`
    ];
    if (topic.difficulty) {
      const diffStr = '★'.repeat(topic.difficulty) + '☆'.repeat(5 - topic.difficulty);
      tags.push(`<span class="cnpt-tag" style="background:rgba(255,200,0,0.15);color:#f39c12">难度 ${diffStr}</span>`);
    }
    // 枢纽度（由 scripts/compute-centrality.mjs 计算）
    if (typeof topic.centrality === 'number' && topic.centrality > 0) {
      const pct = Math.round(topic.centrality * 100);
      const hub = topic.centrality >= 0.5;
      tags.push(`<span class="cnpt-tag" title="枢纽度 ${pct}%：被 ${hub ? '大量后续主题依赖，是打通多个内容的关键节点' : '部分后续主题依赖'}" style="background:rgba(155,89,182,0.14);color:#8e44ad">${hub ? '⭐ 枢纽知识点' : '🔗 枢纽度 ' + pct + '%'}</span>`);
    }

    // 收藏按钮
    let bookmarkBtn = '';
    if (showBookmark && window.CNPT?.components?.createBookmarkButton) {
      // 异步创建收藏按钮，先占位
      bookmarkBtn = '<button class="cnpt-bookmark-btn-placeholder" data-topic-id="' + topic.id + '" style="display:none"></button>';
    }

    // 掌握状态按钮
    let masteryHtml = '';
    if (showMastery) {
      masteryHtml = `
        <div class="cnpt-mastery-row">
          <button class="cnpt-mastery-btn ${masteryStatus === 'mastered' ? 'active' : ''}" data-mastery="mastered">✅ 已掌握</button>
          <button class="cnpt-mastery-btn ${masteryStatus === 'learning' ? 'active' : ''}" data-mastery="learning">📖 学习中</button>
          <button class="cnpt-mastery-btn ${masteryStatus === 'not-started' ? 'active' : ''}" data-mastery="not-started">⏳ 未开始</button>
        </div>
      `;
    }

    // 辅导建议
    let coachHtml = '';
    if (showCoach && coachText) {
      coachHtml = `<div class="cnpt-coach-box">${escapeHtml(coachText)}</div>`;
    }

    // 费曼讲解入口（家长版）：让孩子把知识讲给家长听
    let feynmanHtml = '';
    if (enhancedVariant === 'parent') {
      feynmanHtml = `
        <div class="cnpt-feynman">
          <div class="cnpt-feynman-title">🗣️ 让孩子讲给你听</div>
          <div class="cnpt-feynman-q">「宝贝，你能给我讲讲 <b>${escapeHtml(topic.name)}</b> 为什么是这样吗？」</div>
          <div class="cnpt-feynman-note">孩子能用自己的话讲出来，才是真的懂了（费曼学习法）。讲不顺的地方，就是还没通的地方。</div>
        </div>
      `;
    }

    // 课标编码
    let standardsHtml = '';
    if (showStandards && topic.standards && topic.standards.length) {
      standardsHtml = `
        <div class="cnpt-detail-section">
          <h4>📋 课标编码</h4>
          <ul>${topic.standards.map(s => `<li style="font-family:monospace;font-size:11px">${escapeHtml(s)}</li>`).join('')}</ul>
        </div>
      `;
    }

    // 考法提示
    let examHtml = '';
    if (showExamTips && topic.examTips) {
      examHtml = `
        <div class="cnpt-detail-section">
          <h4>📝 考法提示</h4>
          <p style="font-size:12px;color:#a8b4c0;margin-top:4px">${escapeHtml(topic.examTips)}</p>
        </div>
      `;
    }

    // 资源链接
    let resourcesHtml = '';
    if (showResources && topic.resources && topic.resources.length) {
      resourcesHtml = `
        <div class="cnpt-detail-section">
          <h4>🧩 典型例题 / 练习题</h4>
          ${topic.resources.map(r => `
            <a class="cnpt-resource-link" href="${r.url}" target="_blank" rel="noopener noreferrer">
              ${escapeHtml(r.title)}
              <small>${r.type} · ${r.source || '外部资源'}${r.note ? ' · ' + escapeHtml(r.note) : ''}</small>
            </a>
          `).join('')}
        </div>
      `;
    }

    // 前置依赖
    let hardPrereqsHtml = '';
    if (hardPrereqs.length) {
      hardPrereqsHtml = `
        <div class="cnpt-detail-section">
          <h4>🔴 必须先补</h4>
          ${hardPrereqs.map(i => `<div class="cnpt-chain-item hard" data-id="${i.topic.id}"><span>🔴</span><b>${escapeHtml(i.topic.name)}</b><br><span style="color:#999;font-size:11px">${escapeHtml(i.edge.reason || '')}</span></div>`).join('')}
        </div>
      `;
    }

    let softPrereqsHtml = '';
    if (softPrereqs.length) {
      softPrereqsHtml = `
        <div class="cnpt-detail-section">
          <h4>🟡 建议先补</h4>
          ${softPrereqs.map(i => `<div class="cnpt-chain-item soft" data-id="${i.topic.id}"><span>🟡</span><b>${escapeHtml(i.topic.name)}</b><br><span style="color:#999;font-size:11px">${escapeHtml(i.edge.reason || '')}</span></div>`).join('')}
        </div>
      `;
    }

    // 后续解锁
    let successorsHtml = '';
    if (successors.length) {
      successorsHtml = `
        <div class="cnpt-detail-section">
          <h4>🚀 后续解锁</h4>
          ${successors.slice(0, 5).map(i => `<div class="cnpt-chain-item" data-id="${i.topic.id}"><span>→</span><b>${escapeHtml(i.topic.name)}</b><br><span style="color:#999;font-size:11px">${escapeHtml(i.edge.reason || '')}</span></div>`).join('')}
        </div>
      `;
    }

    // 会动的模型（交互演示，仅当知识点声明 modelRef 且组件已加载时渲染）
    let modelHtml = '';
    if (showModels && topic.modelRef && window.CNPT?.components?.visualModels?.MODELS?.[topic.modelRef]) {
      modelHtml = `
        <div class="cnpt-detail-section">
          <h4>🎥 会动的模型</h4>
          <div class="cnpt-vm-slot" data-model="${escapeHtml(topic.modelRef)}"></div>
        </div>
      `;
    }

    // 组装HTML
    container.innerHTML = `
      <div class="cnpt-detail-name">${escapeHtml(topic.name)}</div>
      <div class="cnpt-detail-meta">${topic.id} · ${topic.textbook || ''}${topic.unit ? ' · ' + topic.unit : ''}</div>
      <div class="cnpt-detail-tags">${tags.join('')}</div>
      ${bookmarkBtn}
      <div class="cnpt-detail-desc">${escapeHtml(topic.description || '暂无描述')}</div>

      ${masteryHtml}
      ${coachHtml}
      ${feynmanHtml}

      ${modelHtml}

      <div class="cnpt-detail-section">
        <h4>✓ 掌握标准</h4>
        <ul>${(topic.evidence || []).map(e => `<li>${escapeHtml(e)}</li>`).join('') || '<li style="color:#999">暂无</li>'}</ul>
      </div>

      ${topic.commonMistakes && topic.commonMistakes.length ? `
        <div class="cnpt-detail-section">
          <h4>⚠️ 易错点</h4>
          <ul>${topic.commonMistakes.map(e => `<li>${escapeHtml(e)}</li>`).join('')}</ul>
        </div>
      ` : ''}

      ${examHtml}
      ${standardsHtml}
      ${resourcesHtml}

      ${showEnhanced ? buildEnhancedHtml(topic, enhancedVariant) : ''}

      ${hardPrereqsHtml}
      ${softPrereqsHtml}
      ${successorsHtml}
    `;

    container.classList.remove('cnpt-hidden');

    // 绑定掌握状态事件
    if (showMastery && onMasteryChange) {
      container.querySelectorAll('.cnpt-mastery-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const newStatus = btn.dataset.mastery;
          onMasteryChange(topic.id, newStatus);
          // 更新按钮状态
          container.querySelectorAll('.cnpt-mastery-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
    }

    // 绑定链式跳转事件
    if (onNodeClick) {
      container.querySelectorAll('.cnpt-chain-item').forEach(item => {
        item.addEventListener('click', () => {
          onNodeClick(item.dataset.id);
        });
      });
    }

    // 绑定收藏按钮
    if (showBookmark && window.CNPT?.components?.createBookmarkButton) {
      const placeholder = container.querySelector('.cnpt-bookmark-btn-placeholder');
      if (placeholder) {
        const btn = CNPT.components.createBookmarkButton(topic, {
          onToggle: onBookmarkToggle
        });
        placeholder.replaceWith(btn);
      }
    }

    // 绑定增强字段交互（三级折叠提示 + 随堂小题）
    if (showEnhanced) bindEnhancedEvents(container, topic);

    // 渲染会动的模型
    if (modelHtml && window.CNPT?.components?.visualModels?.render) {
      const slot = container.querySelector('.cnpt-vm-slot');
      if (slot) CNPT.components.visualModels.render(slot, slot.dataset.model);
    }
  }

  /**
   * 构造增强字段 HTML（一句话说明 / 家长指南 / 教师指南 / 随堂小题三级提示）
   * 数据来自 AI 生成初稿，页面需明确标注未审核。
   * @param {Object} topic
   * @param {'parent'|'student'|'teacher'} variant - 决定默认展开哪一视角
   * @returns {string} HTML
   */
  function buildEnhancedHtml(topic, variant = 'parent') {
    if (!topic) return '';
    const parts = [];

    // 一句话说明
    if (topic.oneLiner) {
      parts.push(`
        <div class="cnpt-oneliner">
          <span class="cnpt-oneliner-label">一句话</span>
          <span class="cnpt-oneliner-text">${escapeHtml(topic.oneLiner)}</span>
        </div>
      `);
    }

    // 家长指南
    const pg = topic.parentGuide;
    if (pg) {
      parts.push(`
        <details class="cnpt-guide" ${variant === 'parent' ? 'open' : ''}>
          <summary>👨‍👩‍👧 家长怎么看（${escapeHtml(topic.name)}）</summary>
          <div class="cnpt-guide-body">
            <div class="cnpt-guide-item"><b>30 秒讲明白</b><p>${escapeHtml(pg.quickExplanation)}</p></div>
            <div class="cnpt-guide-item"><b>生活里可以这样带</b><p>${escapeHtml(pg.dailyExample)}</p></div>
            <div class="cnpt-guide-item warn"><b>家长最容易带偏</b><p>${escapeHtml(pg.commonParentMistake)}</p></div>
            <div class="cnpt-guide-item"><b>可以这样鼓励孩子</b><p>${escapeHtml(pg.encouragement)}</p></div>
          </div>
        </details>
      `);
    }

    // 教师指南
    const tg = topic.teacherGuide;
    if (tg) {
      parts.push(`
        <details class="cnpt-guide" ${variant === 'teacher' ? 'open' : ''}>
          <summary>🏫 教师怎么用（课堂活动 / 关键提问 / 教具 / 衔接）</summary>
          <div class="cnpt-guide-body">
            <div class="cnpt-guide-item"><b>课堂活动</b><p>${escapeHtml(tg.classroomActivity)}</p></div>
            <div class="cnpt-guide-item"><b>关键提问</b><p>${escapeHtml(tg.keyQuestion)}</p></div>
            <div class="cnpt-guide-item"><b>直观教具 / 板书</b><p>${escapeHtml(tg.visualAid)}</p></div>
            <div class="cnpt-guide-item"><b>前后衔接</b><p>${escapeHtml(tg.transition)}</p></div>
          </div>
        </details>
      `);
    }

    // 随堂小题（三级折叠提示）
    if (Array.isArray(topic.quizQuestions) && topic.quizQuestions.length) {
      const items = topic.quizQuestions.map((q, i) => {
        const opts = Array.isArray(q.options)
          ? q.options.map((o, oi) => `<button class="cnpt-quiz-opt" data-q="${i}" data-opt="${oi}">${escapeHtml(String.fromCharCode(65 + oi))}. ${escapeHtml(o)}</button>`).join('')
          : '';
        const typeLabel = q.type === 'choice' ? '选择题' : q.type === 'judge' ? '判断题' : '填空题';
        return `
          <div class="cnpt-quiz" data-quiz-index="${i}">
            <div class="cnpt-quiz-head">
              <span class="cnpt-quiz-badge">随堂小题 ${i + 1}</span>
              <span class="cnpt-quiz-type">${typeLabel}</span>
            </div>
            <div class="cnpt-quiz-q">${escapeHtml(q.question)}</div>
            ${opts ? `<div class="cnpt-quiz-opts">${opts}</div>` : '<div class="cnpt-quiz-opts"><input type="text" class="cnpt-quiz-input" placeholder="把你的答案写在草稿纸上，再对答案"></div>'}
            <div class="cnpt-quiz-feedback" hidden></div>
            <div class="cnpt-quiz-hints">
              <details class="cnpt-hint"><summary>提示 1 · 先想方向</summary><p>${escapeHtml(buildHint(q, 1))}</p></details>
              <details class="cnpt-hint"><summary>提示 2 · 再看步骤</summary><p>${escapeHtml(buildHint(q, 2))}</p></details>
              <details class="cnpt-hint"><summary>提示 3 · 对答案</summary><p>${escapeHtml(buildHint(q, 3))}</p></details>
            </div>
          </div>
        `;
      }).join('');
      parts.push(`<div class="cnpt-quiz-block">${items}</div>`);
    }

    if (!parts.length) return '';
    return `
      <div class="cnpt-enhanced">
        <div class="cnpt-enhanced-note">🤖 以下内容由 AI 生成初稿，未经学科教师逐条审核，仅供启发，不可直接作为教学依据。</div>
        ${parts.join('')}
      </div>
    `;
  }

  /**
   * 生成三级折叠提示文案（不直接剧透最终答案，逐级加码）
   */
  function buildHint(q, level) {
    const exp = q.explanation || '';
    if (level === 1) {
      if (q.type === 'choice') return `先别急着选项：这道题在考哪个概念？把题干里的关键词圈出来。`;
      if (q.type === 'judge') return `先别急着判对错：这句话里哪一半是条件、哪一半是结论？`;
      return `先别急着填：这道题在问什么？已知条件有哪些？`;
    }
    if (level === 2) {
      const head = exp.slice(0, Math.max(10, Math.min(40, exp.length)));
      return `${head}${exp.length > head.length ? '…' : ''}（先自己动手做，再展开第三条提示）`;
    }
    const ans = q.type === 'choice'
      ? `正确答案：${String.fromCharCode(65 + Number(q.answer))}．${q.options?.[q.answer] || ''}`
      : q.type === 'judge'
        ? `正确答案：${q.answer ? '正确' : '错误'}`
        : `参考答案：${q.answer}`;
    return `${ans}\n解析：${exp}`;
  }

  /**
   * 绑定增强字段交互：选项判分、提示折叠、填空自评
   */
  function bindEnhancedEvents(container, topic) {
    container.querySelectorAll('.cnpt-quiz-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const quizEl = btn.closest('.cnpt-quiz');
        if (!quizEl) return;
        const q = topic.quizQuestions?.[Number(quizEl.dataset.quizIndex)];
        if (!q) return;
        const picked = Number(btn.dataset.opt);
        const correct = picked === Number(q.answer);
        quizEl.querySelectorAll('.cnpt-quiz-opt').forEach(b => {
          b.classList.remove('is-correct', 'is-wrong');
          if (Number(b.dataset.opt) === Number(q.answer)) b.classList.add('is-correct');
        });
        if (!correct) btn.classList.add('is-wrong');
        const fb = quizEl.querySelector('.cnpt-quiz-feedback');
        if (fb) {
          fb.hidden = false;
          fb.className = 'cnpt-quiz-feedback ' + (correct ? 'ok' : 'no');
          fb.textContent = correct ? '✅ 答对了！' : `❌ 还没对，看看解析：${q.explanation || ''}`;
        }
      });
    });

    container.querySelectorAll('.cnpt-quiz-input').forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        const quizEl = input.closest('.cnpt-quiz');
        const q = topic.quizQuestions?.[Number(quizEl?.dataset.quizIndex)];
        if (!q) return;
        const fb = quizEl.querySelector('.cnpt-quiz-feedback');
        if (fb) {
          fb.hidden = false;
          fb.className = 'cnpt-quiz-feedback ok';
          fb.textContent = `参考答案：${q.answer}\n解析：${q.explanation || ''}`;
        }
      });
    });
  }

  /**
   * HTML转义
   */
  function escapeHtml(str) {
    if (!str) return '';
    if (window.CNPT?.utils?.escapeHtml) return CNPT.utils.escapeHtml(str);
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * 注入样式
   */
  function injectStyles() {
    if (document.getElementById('cnpt-node-detail-styles')) return;
    const style = document.createElement('style');
    style.id = 'cnpt-node-detail-styles';
    style.textContent = `
      .cnpt-detail-name { font-size: 18px; font-weight: 600; color: var(--cnpt-text-main, #1e293b); margin-bottom: 4px; }
      .cnpt-detail-meta { font-size: 11px; color: var(--cnpt-text-muted, #94a3b8); margin-bottom: 8px; }
      .cnpt-detail-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
      .cnpt-tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; }
      .cnpt-detail-desc { font-size: 13px; line-height: 1.7; color: var(--cnpt-text-sub, #475569); margin-bottom: 12px; padding: 10px; background: var(--cnpt-bg-hover, rgba(59,130,246,0.04)); border-radius: 6px; border-left: 3px solid var(--cnpt-primary, #3b82f6); }
      .cnpt-mastery-row { display: flex; gap: 8px; margin-bottom: 12px; }
      .cnpt-mastery-btn { flex: 1; padding: 8px 4px; border-radius: 6px; border: 1px solid var(--cnpt-border, #e2e8f0); background: var(--cnpt-bg-card, #fff); font-size: 12px; cursor: pointer; transition: all 0.2s; }
      .cnpt-mastery-btn:hover { border-color: var(--cnpt-primary, #3b82f6); }
      .cnpt-mastery-btn.active { background: var(--cnpt-primary, #3b82f6); color: #fff; border-color: var(--cnpt-primary, #3b82f6); }
      .cnpt-coach-box { padding: 12px; border-radius: 8px; background: rgba(93,173,226,0.08); border: 1px solid rgba(93,173,226,0.22); font-size: 12px; line-height: 1.8; color: var(--cnpt-text-sub, #475569); margin-bottom: 12px; }
      .cnpt-detail-section { margin-top: 14px; }
      .cnpt-detail-section h4 { font-size: 13px; color: var(--cnpt-text-main, #1e293b); margin-bottom: 6px; }
      .cnpt-detail-section ul { margin: 0; padding-left: 18px; }
      .cnpt-detail-section li { font-size: 12px; line-height: 1.7; color: var(--cnpt-text-sub, #475569); }
      .cnpt-chain-item { display: flex; align-items: flex-start; gap: 8px; padding: 8px 10px; background: var(--cnpt-bg-hover, rgba(59,130,246,0.04)); border-radius: 6px; margin: 4px 0; font-size: 12px; cursor: pointer; transition: background 0.2s; }
      .cnpt-chain-item:hover { background: rgba(59,130,246,0.1); }
      .cnpt-chain-item.hard { border-left: 2px solid #e74c3c; }
      .cnpt-chain-item.soft { border-left: 2px solid #f39c12; }
      .cnpt-resource-link { display: block; margin: 6px 0; padding: 8px 10px; background: var(--cnpt-bg-hover, rgba(59,130,246,0.04)); border-radius: 6px; color: var(--cnpt-primary, #3b82f6); text-decoration: none; font-size: 12px; }
      .cnpt-resource-link:hover { background: rgba(59,130,246,0.1); }
      .cnpt-resource-link small { color: var(--cnpt-text-muted, #94a3b8); display: block; margin-top: 2px; }
      .cnpt-enhanced { margin-top: 14px; }
      .cnpt-enhanced-note { font-size: 11px; color: #b45309; background: rgba(245,158,11,0.08); border: 1px dashed rgba(245,158,11,0.4); border-radius: 6px; padding: 6px 10px; margin-bottom: 10px; line-height: 1.6; }
      .cnpt-oneliner { display: flex; gap: 8px; align-items: baseline; padding: 10px 12px; border-radius: 8px; background: rgba(59,130,246,0.08); border-left: 3px solid var(--cnpt-primary, #3b82f6); margin-bottom: 10px; }
      .cnpt-oneliner-label { flex: none; font-size: 11px; color: var(--cnpt-primary, #3b82f6); font-weight: 600; }
      .cnpt-oneliner-text { font-size: 13px; line-height: 1.7; color: var(--cnpt-text-main, #1e293b); }
      .cnpt-guide { border: 1px solid var(--cnpt-border, #e2e8f0); border-radius: 8px; margin-bottom: 10px; overflow: hidden; }
      .cnpt-guide summary { cursor: pointer; padding: 10px 12px; font-size: 12px; font-weight: 600; color: var(--cnpt-text-sub, #475569); background: var(--cnpt-bg-hover, rgba(59,130,246,0.04)); list-style: none; }
      .cnpt-guide summary::-webkit-details-marker { display: none; }
      .cnpt-guide summary::before { content: '▸ '; }
      .cnpt-guide[open] summary::before { content: '▾ '; }
      .cnpt-guide-body { padding: 10px 12px; }
      .cnpt-guide-item { margin-bottom: 8px; }
      .cnpt-guide-item:last-child { margin-bottom: 0; }
      .cnpt-guide-item b { display: block; font-size: 12px; color: var(--cnpt-text-main, #1e293b); margin-bottom: 2px; }
      .cnpt-guide-item p { margin: 0; font-size: 12px; line-height: 1.7; color: var(--cnpt-text-sub, #475569); }
      .cnpt-guide-item.warn b { color: #b45309; }
      .cnpt-quiz-block { display: flex; flex-direction: column; gap: 10px; }
      .cnpt-quiz { border: 1px solid var(--cnpt-border, #e2e8f0); border-radius: 8px; padding: 10px 12px; }
      .cnpt-quiz-head { display: flex; gap: 8px; align-items: center; margin-bottom: 6px; }
      .cnpt-quiz-badge { font-size: 11px; font-weight: 600; color: #fff; background: var(--cnpt-primary, #3b82f6); border-radius: 4px; padding: 1px 6px; }
      .cnpt-quiz-type { font-size: 11px; color: var(--cnpt-text-muted, #94a3b8); }
      .cnpt-quiz-q { font-size: 13px; line-height: 1.7; color: var(--cnpt-text-main, #1e293b); margin-bottom: 8px; }
      .cnpt-quiz-opts { display: flex; flex-direction: column; gap: 6px; }
      .cnpt-quiz-opt { text-align: left; padding: 7px 10px; border-radius: 6px; border: 1px solid var(--cnpt-border, #e2e8f0); background: var(--cnpt-bg-card, #fff); font-size: 12px; cursor: pointer; transition: all 0.15s; }
      .cnpt-quiz-opt:hover { border-color: var(--cnpt-primary, #3b82f6); }
      .cnpt-quiz-opt.is-correct { background: rgba(46,204,113,0.14); border-color: #2ecc71; color: #1e8449; }
      .cnpt-quiz-opt.is-wrong { background: rgba(231,76,60,0.12); border-color: #e74c3c; color: #c0392b; }
      .cnpt-quiz-input { width: 100%; box-sizing: border-box; padding: 7px 10px; border-radius: 6px; border: 1px solid var(--cnpt-border, #e2e8f0); font-size: 12px; }
      .cnpt-quiz-feedback { margin-top: 8px; font-size: 12px; line-height: 1.7; padding: 8px 10px; border-radius: 6px; white-space: pre-line; }
      .cnpt-quiz-feedback.ok { background: rgba(46,204,113,0.1); color: #1e8449; }
      .cnpt-quiz-feedback.no { background: rgba(231,76,60,0.08); color: #c0392b; }
      .cnpt-quiz-hints { margin-top: 8px; display: flex; flex-direction: column; gap: 4px; }
      .cnpt-hint { border-top: 1px dashed var(--cnpt-border, #e2e8f0); padding-top: 4px; }
      .cnpt-hint summary { cursor: pointer; font-size: 11px; color: var(--cnpt-text-muted, #94a3b8); list-style: none; }
      .cnpt-hint summary::-webkit-details-marker { display: none; }
      .cnpt-hint p { margin: 4px 0 4px; font-size: 12px; line-height: 1.7; color: var(--cnpt-text-sub, #475569); white-space: pre-line; }
      .cnpt-feynman { margin-top: 12px; padding: 12px 14px; border-radius: 10px; background: rgba(34,197,94,0.07); border: 1px solid rgba(34,197,94,0.25); }
      .cnpt-feynman-title { font-size: 13px; font-weight: 700; color: #15803d; margin-bottom: 6px; }
      .cnpt-feynman-q { font-size: 13px; line-height: 1.7; color: var(--cnpt-text-main, #1e293b); }
      .cnpt-feynman-note { font-size: 11px; color: var(--cnpt-text-muted, #94a3b8); margin-top: 4px; line-height: 1.6; }
    `;
    document.head.appendChild(style);
  }

  /**
   * 初始化（注入样式）
   */
  function initNodeDetail() {
    injectStyles();
  }

  // 暴露API
  window.CNPT.components.initNodeDetail = initNodeDetail;
  window.CNPT.components.renderNodeDetail = renderNodeDetail;
  window.CNPT.components.buildEnhancedHtml = buildEnhancedHtml;
  window.CNPT.components.bindEnhancedEvents = bindEnhancedEvents;

})();
