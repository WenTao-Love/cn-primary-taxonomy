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

    // 获取掌握状态
    let masteryStatus = 'not-started';
    if (showMastery && window.CNPT?.storage) {
      masteryStatus = CNPT.storage.getTopicStatus(topic.id) || 'not-started';
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

    // 组装HTML
    container.innerHTML = `
      <div class="cnpt-detail-name">${escapeHtml(topic.name)}</div>
      <div class="cnpt-detail-meta">${topic.id} · ${topic.textbook || ''}${topic.unit ? ' · ' + topic.unit : ''}</div>
      <div class="cnpt-detail-tags">${tags.join('')}</div>
      ${bookmarkBtn}
      <div class="cnpt-detail-desc">${escapeHtml(topic.description || '暂无描述')}</div>

      ${masteryHtml}
      ${coachHtml}

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

})();
