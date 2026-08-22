/*!
 * CN-Primary-Taxonomy · 报告导出组件
 * 生成学习进度报告、诊断报告、家校沟通卡片
 * 为培训机构/家长/教师提供可视化报告
 */
(function() {
  'use strict';

  /**
   * 报告生成器
   */
  class ReportGenerator {
    constructor(fullData, indices) {
      this.data = fullData;
      this.indices = indices;
      this.topicMap = indices.topicMap || new Map();
    }

    /**
     * 生成学生学习进度报告
     * @param {Object} params - 报告参数
     * @param {string} params.studentName - 学生姓名
     * @param {string} params.subject - 学科
     * @param {Object} params.stats - 掌握度统计 {mastered, learning, not-started, total}
     * @param {number} params.stars - 星星数
     * @param {number} params.days - 学习天数
     * @param {Array} params.wrongBook - 错题本
     * @param {Array} params.recentMastered - 最近掌握的知识点
     * @returns {string} HTML格式的报告
     */
    generateProgressReport(params) {
      const {
        studentName, subject, stats, stars, days,
        wrongBook = [], recentMastered = []
      } = params;

      const masteryRate = stats.total > 0
        ? Math.round((stats.mastered / stats.total) * 100)
        : 0;

      const date = new Date().toLocaleDateString('zh-CN', {
        year: 'numeric', month: 'long', day: 'numeric'
      });

      return `
        <div class="cnpt-report" style="max-width:600px;margin:0 auto;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#333;">
          <!-- 报告头部 -->
          <div class="cnpt-report-header" style="text-align:center;border-bottom:2px solid #5dade2;padding-bottom:16px;margin-bottom:20px;">
            <h1 style="margin:0;font-size:22px;color:#2c3e50;">📚 学习进度报告</h1>
            <p style="margin:8px 0 0;color:#666;font-size:14px;">${date} · ${this._esc(subject || '综合')}</p>
          </div>

          <!-- 学生信息 -->
          <div class="cnpt-report-student" style="background:#f8f9fa;border-radius:8px;padding:16px;margin-bottom:20px;">
            <h2 style="margin:0 0 8px;font-size:16px;">👤 ${this._esc(studentName || '学生')}</h2>
            <div style="display:flex;gap:20px;font-size:14px;color:#666;">
              <span>🌟 ${stars || 0} 颗星</span>
              <span>📅 连续 ${days || 0} 天</span>
              <span>📊 掌握率 ${masteryRate}%</span>
            </div>
          </div>

          <!-- 掌握度概览 -->
          <div class="cnpt-report-stats" style="margin-bottom:20px;">
            <h3 style="font-size:15px;color:#2c3e50;margin:0 0 12px;">📈 掌握度概览</h3>
            <div style="display:flex;gap:12px;">
              <div style="flex:1;background:#d4edda;border-radius:8px;padding:12px;text-align:center;">
                <div style="font-size:24px;font-weight:bold;color:#155724;">${stats.mastered || 0}</div>
                <div style="font-size:12px;color:#155724;">已掌握</div>
              </div>
              <div style="flex:1;background:#fff3cd;border-radius:8px;padding:12px;text-align:center;">
                <div style="font-size:24px;font-weight:bold;color:#856404;">${stats.learning || 0}</div>
                <div style="font-size:12px;color:#856404;">学习中</div>
              </div>
              <div style="flex:1;background:#f8d7da;border-radius:8px;padding:12px;text-align:center;">
                <div style="font-size:24px;font-weight:bold;color:#721c24;">${stats['not-started'] || 0}</div>
                <div style="font-size:12px;color:#721c24;">待学习</div>
              </div>
            </div>
          </div>

          <!-- 掌握度进度条 -->
          <div class="cnpt-report-progress" style="margin-bottom:20px;">
            <div style="background:#e9ecef;border-radius:10px;height:20px;overflow:hidden;">
              <div style="background:linear-gradient(90deg,#28a745,#20c997);height:100%;width:${masteryRate}%;border-radius:10px;transition:width 0.3s;"></div>
            </div>
            <p style="text-align:center;font-size:13px;color:#666;margin:4px 0 0;">总体掌握进度 ${masteryRate}%</p>
          </div>

          <!-- 最近掌握 -->
          ${recentMastered.length > 0 ? `
          <div class="cnpt-report-recent" style="margin-bottom:20px;">
            <h3 style="font-size:15px;color:#2c3e50;margin:0 0 12px;">✅ 最近掌握</h3>
            <ul style="list-style:none;padding:0;margin:0;">
              ${recentMastered.slice(0, 5).map(t => `
                <li style="padding:6px 0;border-bottom:1px solid #eee;font-size:13px;">
                  ✓ ${this._esc(t.name || t)}
                </li>
              `).join('')}
            </ul>
          </div>
          ` : ''}

          <!-- 需要加强 -->
          ${wrongBook.length > 0 ? `
          <div class="cnpt-report-weak" style="margin-bottom:20px;">
            <h3 style="font-size:15px;color:#2c3e50;margin:0 0 12px;">⚠️ 需要加强</h3>
            <ul style="list-style:none;padding:0;margin:0;">
              ${wrongBook.slice(0, 5).map(w => `
                <li style="padding:6px 0;border-bottom:1px solid #eee;font-size:13px;">
                  • ${this._esc(w.topicName || w.topicId || '未知知识点')}
                </li>
              `).join('')}
            </ul>
          </div>
          ` : ''}

          <!-- 报告尾部 -->
          <div class="cnpt-report-footer" style="text-align:center;border-top:1px solid #eee;padding-top:16px;margin-top:20px;font-size:12px;color:#999;">
            <p>本报告由 CN-Primary-Taxonomy 知识图谱系统自动生成</p>
            <p>知识点总数: ${this.data.topics.topicCount || this.data.topics.topics.length} | 依赖关系: ${this.data.deps.edgeCount || this.data.deps.dependencies.length}</p>
          </div>
        </div>
      `;
    }

    /**
     * 生成诊断报告
     * @param {Object} diagnosticReport - 诊断引擎返回的报告
     * @returns {string} HTML格式的报告
     */
    generateDiagnosticReport(diagnosticReport) {
      const { target, gaps, recommendations, estimatedHours, difficulty, masteredCount } = diagnosticReport;

      const diffLabel = { easy: '较轻松', medium: '中等', hard: '有挑战' };
      const diffColor = { easy: '#28a745', medium: '#ffc107', hard: '#dc3545' };

      return `
        <div class="cnpt-report cnpt-diagnostic-report" style="max-width:600px;margin:0 auto;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#333;">
          <div class="cnpt-report-header" style="text-align:center;border-bottom:2px solid #6f42c1;padding-bottom:16px;margin-bottom:20px;">
            <h1 style="margin:0;font-size:22px;color:#2c3e50;">🔍 学情诊断报告</h1>
            <p style="margin:8px 0 0;color:#666;font-size:14px;">${new Date().toLocaleDateString('zh-CN')}</p>
          </div>

          ${target ? `
          <div class="cnpt-diagnostic-target" style="background:#f3e5f5;border-radius:8px;padding:16px;margin-bottom:20px;">
            <h3 style="margin:0 0 8px;font-size:15px;">🎯 诊断目标</h3>
            <p style="margin:0;font-size:14px;">${this._esc(target.name || `${target.subject} ${target.grade}年级`)}</p>
            ${target.difficulty ? `<p style="margin:4px 0 0;font-size:12px;color:#666;">难度等级: ${'⭐'.repeat(target.difficulty)}</p>` : ''}
          </div>
          ` : ''}

          <div class="cnpt-diagnostic-summary" style="display:flex;gap:12px;margin-bottom:20px;">
            <div style="flex:1;background:#e3f2fd;border-radius:8px;padding:12px;text-align:center;">
              <div style="font-size:20px;font-weight:bold;color:#1565c0;">${gaps.length}</div>
              <div style="font-size:12px;color:#1565c0;">知识缺口</div>
            </div>
            <div style="flex:1;background:#fff3e0;border-radius:8px;padding:12px;text-align:center;">
              <div style="font-size:20px;font-weight:bold;color:#e65100;">${estimatedHours.toFixed(1)}h</div>
              <div style="font-size:12px;color:#e65100;">预估学时</div>
            </div>
            <div style="flex:1;background:${diffColor[difficulty] || '#f5f5f5'};border-radius:8px;padding:12px;text-align:center;">
              <div style="font-size:20px;font-weight:bold;color:#fff;">${diffLabel[difficulty] || '未知'}</div>
              <div style="font-size:12px;color:#fff;">整体难度</div>
            </div>
          </div>

          ${recommendations.length > 0 ? `
          <div class="cnpt-diagnostic-recs" style="margin-bottom:20px;">
            <h3 style="font-size:15px;margin:0 0 12px;">💡 学习建议</h3>
            <ul style="padding-left:20px;margin:0;">
              ${recommendations.map(r => `<li style="font-size:13px;margin-bottom:6px;">${this._esc(r)}</li>`).join('')}
            </ul>
          </div>
          ` : ''}

          ${gaps.length > 0 ? `
          <div class="cnpt-diagnostic-gaps" style="margin-bottom:20px;">
            <h3 style="font-size:15px;margin:0 0 12px;">📋 需补强知识点</h3>
            <div style="display:flex;flex-wrap:wrap;gap:6px;">
              ${gaps.slice(0, 15).map(g => `
                <span style="background:#f8f9fa;border:1px solid #dee2e6;border-radius:4px;padding:3px 8px;font-size:12px;">
                  ${this._esc(g.name)}
                </span>
              `).join('')}
              ${gaps.length > 15 ? `<span style="font-size:12px;color:#666;">+${gaps.length - 15}个</span>` : ''}
            </div>
          </div>
          ` : ''}
        </div>
      `;
    }

    /**
     * 生成家校沟通卡片（简化版，适合微信分享）
     * @param {Object} params - 卡片参数
     * @returns {string} HTML
     */
    generateParentCard(params) {
      const { studentName, subject, stats, highlights = [] } = params;
      const masteryRate = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;

      return `
        <div class="cnpt-parent-card" style="max-width:360px;margin:0 auto;padding:20px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:16px;color:#fff;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
          <div style="text-align:center;margin-bottom:16px;">
            <div style="font-size:32px;margin-bottom:4px;">📚</div>
            <h2 style="margin:0;font-size:18px;">${this._esc(studentName || '孩子')}的学习周报</h2>
            <p style="margin:4px 0 0;font-size:12px;opacity:0.8;">${this._esc(subject || '综合')} · ${new Date().toLocaleDateString('zh-CN')}</p>
          </div>
          <div style="background:rgba(255,255,255,0.15);border-radius:12px;padding:16px;margin-bottom:12px;">
            <div style="display:flex;justify-content:space-around;text-align:center;">
              <div>
                <div style="font-size:24px;font-weight:bold;">${stats.mastered || 0}</div>
                <div style="font-size:11px;opacity:0.8;">已掌握</div>
              </div>
              <div>
                <div style="font-size:24px;font-weight:bold;">${masteryRate}%</div>
                <div style="font-size:11px;opacity:0.8;">掌握率</div>
              </div>
              <div>
                <div style="font-size:24px;font-weight:bold;">${stats.stars || 0}</div>
                <div style="font-size:11px;opacity:0.8;">星星</div>
              </div>
            </div>
          </div>
          ${highlights.length > 0 ? `
          <div style="background:rgba(255,255,255,0.1);border-radius:8px;padding:12px;">
            <p style="margin:0 0 6px;font-size:12px;opacity:0.8;">本周亮点：</p>
            ${highlights.slice(0, 3).map(h => `<p style="margin:2px 0;font-size:12px;">✓ ${this._esc(h)}</p>`).join('')}
          </div>
          ` : ''}
          <p style="text-align:center;margin:12px 0 0;font-size:10px;opacity:0.6;">来自 CN-Primary-Taxonomy 知识图谱</p>
        </div>
      `;
    }

    /**
     * 将HTML报告导出为文件下载
     * @param {string} html - 报告HTML
     * @param {string} filename - 文件名
     */
    downloadHTML(html, filename = 'report.html') {
      const fullHTML = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>学习报告</title></head><body>${html}</body></html>`;
      const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    /**
     * 复制报告为纯文本（适合粘贴到微信）
     * @param {Object} params - 报告参数
     * @returns {string} 纯文本
     */
    generatePlainText(params) {
      const { studentName, subject, stats, stars, days } = params;
      const masteryRate = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;

      return [
        `📚 ${studentName || '学生'}的学习进度报告`,
        `📅 ${new Date().toLocaleDateString('zh-CN')} · ${subject || '综合'}`,
        `━━━━━━━━━━━━━━━━━━`,
        `📊 掌握率: ${masteryRate}%`,
        `✅ 已掌握: ${stats.mastered || 0} 个知识点`,
        `📖 学习中: ${stats.learning || 0} 个知识点`,
        `○ 待学习: ${stats['not-started'] || 0} 个知识点`,
        `🌟 星星: ${stars || 0} 颗`,
        `📅 连续学习: ${days || 0} 天`,
        `━━━━━━━━━━━━━━━━━━`,
        `来自 CN-Primary-Taxonomy 知识图谱`
      ].join('\n');
    }

    _esc(str) {
      return window.CNPT.utils.escapeHtml(String(str || ''));
    }
  }

  // 注册到CNPT命名空间
  window.CNPT = window.CNPT || {};
  window.CNPT.ReportGenerator = ReportGenerator;

})();
