/*!
 * CN-Primary-Taxonomy · 分享卡片组件
 * 使用 Canvas 生成知识点分享卡片图片
 * 使用方式：CNPT.components.shareTopic(topic, options)
 */
(function() {
  'use strict';

  window.CNPT = window.CNPT || {};
  window.CNPT.components = window.CNPT.components || {};

  const CARD_WIDTH = 600;
  const CARD_HEIGHT = 400;
  const PADDING = 32;

  /**
   * 生成分享卡片
   * @param {Object} topic - 知识点数据
   * @param {Object} options - 配置选项
   */
  function shareTopic(topic, options = {}) {
    if (!topic) return;

    const {
      filename = `cnpt_share_${topic.id}.png`,
      onSuccess = null,
      onError = null
    } = options;

    try {
      const canvas = generateCard(topic);
      downloadCanvas(canvas, filename);
      if (onSuccess) onSuccess();
    } catch (e) {
      console.error('分享卡片生成失败:', e);
      if (onError) onError(e);
      window.CNPT.utils.showToast('卡片生成失败');
    }
  }

  /**
   * 生成卡片Canvas
   */
  function generateCard(topic) {
    const canvas = document.createElement('canvas');
    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;
    const ctx = canvas.getContext('2d');

    const subjectColor = (window.CNPT?.constants?.COLORS) ?
      (CNPT.constants.COLORS[topic.subject] || '#3b82f6') : '#3b82f6';

    // 背景渐变
    const bgGrad = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
    bgGrad.addColorStop(0, '#ffffff');
    bgGrad.addColorStop(1, '#f8fafc');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    // 顶部色条
    const topBarGrad = ctx.createLinearGradient(0, 0, CARD_WIDTH, 0);
    topBarGrad.addColorStop(0, subjectColor);
    topBarGrad.addColorStop(1, adjustColor(subjectColor, 30));
    ctx.fillStyle = topBarGrad;
    ctx.fillRect(0, 0, CARD_WIDTH, 6);

    // 学科标签
    ctx.fillStyle = subjectColor;
    ctx.font = 'bold 14px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.textBaseline = 'top';
    const tagX = PADDING;
    const tagY = PADDING;
    const tagText = topic.subject || '';
    const tagMetrics = ctx.measureText(tagText);
    const tagPadding = 8;
    const tagHeight = 24;
    roundRect(ctx, tagX, tagY, tagMetrics.width + tagPadding * 2, tagHeight, 4);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(tagText, tagX + tagPadding, tagY + 4);

    // 年级信息
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
    const gradeText = `${topic.grade || ''}年级${topic.term || ''}`;
    ctx.fillText(gradeText, tagX + tagMetrics.width + tagPadding * 2 + 12, tagY + 5);

    // 知识点名称
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 28px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.textBaseline = 'top';
    const nameY = tagY + tagHeight + 20;
    wrapText(ctx, topic.name || '', PADDING, nameY, CARD_WIDTH - PADDING * 2, 36);

    // 描述文字
    ctx.fillStyle = '#475569';
    ctx.font = '14px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
    const descY = nameY + 50;
    const desc = topic.description || '暂无描述';
    wrapText(ctx, desc.slice(0, 80) + (desc.length > 80 ? '...' : ''), PADDING, descY, CARD_WIDTH - PADDING * 2, 22);

    // 分隔线
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PADDING, CARD_HEIGHT - 80);
    ctx.lineTo(CARD_WIDTH - PADDING, CARD_HEIGHT - 80);
    ctx.stroke();

    // 底部信息
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText('CN-Primary-Taxonomy · 中国小学教育知识图谱', PADDING, CARD_HEIGHT - 55);

    // 知识点ID
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '10px monospace';
    ctx.fillText(topic.id || '', PADDING, CARD_HEIGHT - 35);

    // 右侧二维码区域（简化为文字）
    ctx.fillStyle = subjectColor;
    ctx.font = 'bold 12px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('扫码查看知识图谱', CARD_WIDTH - PADDING, CARD_HEIGHT - 40);
    ctx.textAlign = 'left';

    // 右下角装饰圆
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = subjectColor;
    ctx.beginPath();
    ctx.arc(CARD_WIDTH - 60, CARD_HEIGHT - 60, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    return canvas;
  }

  /**
   * 圆角矩形
   */
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /**
   * 自动换行文本
   */
  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const chars = text.split('');
    let line = '';
    let currentY = y;

    for (let i = 0; i < chars.length; i++) {
      const testLine = line + chars[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, x, currentY);
        line = chars[i];
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }

  /**
   * 调整颜色亮度
   */
  function adjustColor(hex, amount) {
    let color = hex.replace('#', '');
    if (color.length === 3) color = color[0]+color[0]+color[1]+color[1]+color[2]+color[2];
    const num = parseInt(color, 16);
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
  }

  /**
   * 下载Canvas为图片
   */
  function downloadCanvas(canvas, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
    window.CNPT.utils.showToast('✅ 分享卡片已生成');
  }

  /**
   * 创建分享按钮
   */
  function createShareButton(topic, options = {}) {
    const btn = document.createElement('button');
    btn.className = 'cnpt-share-btn';
    btn.setAttribute('aria-label', '分享知识点');
    btn.title = '生成分享卡片';
    btn.innerHTML = '📤 分享';

    btn.addEventListener('click', () => {
      shareTopic(topic, options);
    });

    return btn;
  }

  /**
   * 注入样式
   */
  function injectStyles() {
    if (document.getElementById('cnpt-share-card-styles')) return;
    const style = document.createElement('style');
    style.id = 'cnpt-share-card-styles';
    style.textContent = `
      .cnpt-share-btn {
        padding: 4px 10px;
        border-radius: 6px;
        border: 1px solid var(--cnpt-border, #e2e8f0);
        background: var(--cnpt-bg-card, #fff);
        color: var(--cnpt-text-main, #1e293b);
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .cnpt-share-btn:hover {
        border-color: var(--cnpt-primary, #3b82f6);
        background: rgba(59,130,246,0.05);
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 初始化
   */
  function initShareCard() {
    injectStyles();
  }

  // 暴露API
  window.CNPT.components.initShareCard = initShareCard;
  window.CNPT.components.shareTopic = shareTopic;
  window.CNPT.components.createShareButton = createShareButton;
  window.CNPT.components.generateCard = generateCard;

})();
