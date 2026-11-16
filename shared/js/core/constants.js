/*!
 * CN-Primary-Taxonomy · 共享常量
 * 所有用户角色共享的颜色、配置、存储键
 */
(function() {
  'use strict';
  
  window.CNPT = window.CNPT || {};
  
  // 学科颜色映射
  const COLORS = {
    '语文': '#e74c3c',
    '数学': '#3498db',
    '英语': '#1abc9c',
    '科学': '#2ecc71',
    '道德与法治': '#f39c12',
    '劳动': '#9b59b6',
    '体育与健康': '#e67e22',
    '美术': '#fd79a8',
    '音乐': '#a29bfe',
    '信息科技': '#00cec9',
    'AI素养': '#00cec9'
  };

  // 学科简写映射
  const SUBJECT_SHORT = {
    '语文': '语', '数学': '数', '英语': '英', '科学': '科',
    '道德与法治': '道', '劳动': '劳', '体育与健康': '体',
    '美术': '美', '音乐': '音', '信息科技': '信', 'AI素养': 'AI'
  };

  // 英语技能标签
  const RUBRIC_LABELS = {
    listening: '听力',
    speaking: '口语',
    reading: '阅读',
    writing: '写作'
  };

  // 年级段标签
const GRADEBAND_LABELS = {
    L: '低年级(1-2)',
    M: '中年级(3-4)',
    H: '高年级(5-6)'
  };

  // 渲染节点上限
  //   core: buildGraphData 截断上限（筛选后最多渲染的知识点数）
  //   detail: 详情页/小图上限
  //   aggregate: 超过该值时 PCGraph 自动按学科聚合为超级节点（点击下钻）
  const MAX_RENDER_NODES = { core: 1300, detail: 900, aggregate: 900 };

  // 学习预算（借鉴《AI 自学数学账本》的 75 分钟日预算与"复习封顶一半"）
  const LEARNING_BUDGET = {
    DAILY_MINUTES: 75,      // 每日总预算
    REVIEW_RATIO: 0.5,     // 复习最多占用一半预算
    MIN_REVIEW_MINUTES: 10 // 低于此时长不单独计时
  };

  // 错因分类（P01-P11 探针 + 低级失误，见 shared/js/components/fsrs-engine.js）
  const ERROR_REASONS = {
    P01: '概念不清',
    P02: '公式/法则记错',
    P03: '前提条件漏用',
    P04: '数量关系看错',
    P05: '计算跳步出错',
    P06: '审题偏差',
    P07: '单位/符号遗漏',
    P08: '图形与算式不对应',
    P09: '步骤顺序颠倒',
    P10: '旧知识迁移失败',
    P11: '题型识别错误',
    LOW: '低级失误（抄错/漏写/口算错）'
  };

  // 难度星级转换
  const DIFFICULTY = n => '★'.repeat(Math.max(0, n)) + '☆'.repeat(Math.max(0, 5 - n));

  // 默认存储键前缀
  const STORAGE_PREFIX = 'cnpt';

  // 用户角色标识
  const ROLES = {
    PARENT: 'parent',
    STUDENT: 'student',
    TEACHER: 'teacher'
  };

  // 资源链接类型图标
  const RESOURCE_ICONS = {
    example: '📖',
    exercise: '✏️',
    worksheet: '📋',
    article: '📄'
  };

  // 各角色存储键
  const STORAGE_KEYS = {
    parent: {
      mastery: 'cnpt-parent-mastery',
      wrongBook: 'cnpt-parent-wrong-book',
      fsrs: 'cnpt-parent-fsrs',
      mistakeLedger: 'cnpt-parent-mistake-ledger',
      dailyLog: 'cnpt-parent-daily-log',
      diagnostic: 'cnpt-parent-diagnostic',
      lastVisit: 'cnpt-parent-last-visit',
      days: 'cnpt-parent-days'
    },
    student: {
      mastery: 'cnpt-student-mastery',
      wrongBook: 'cnpt-student-wrong-book',
      fsrs: 'cnpt-student-fsrs',
      mistakeLedger: 'cnpt-student-mistake-ledger',
      dailyLog: 'cnpt-student-daily-log',
      diagnostic: 'cnpt-student-diagnostic',
      stars: 'cnpt-student-stars',
      lastVisit: 'cnpt-student-last-visit',
      days: 'cnpt-student-days'
    },
    teacher: {
      mastery: 'cnpt-teacher-mastery',
      wrongBook: 'cnpt-teacher-wrong-book',
      fsrs: 'cnpt-teacher-fsrs',
      mistakeLedger: 'cnpt-teacher-mistake-ledger',
      dailyLog: 'cnpt-teacher-daily-log',
      diagnostic: 'cnpt-teacher-diagnostic',
      lastVisit: 'cnpt-teacher-last-visit',
      days: 'cnpt-teacher-days'
    }
  };

  window.CNPT.constants = {
    COLORS,
    SUBJECT_SHORT,
    RUBRIC_LABELS,
    GRADEBAND_LABELS,
    MAX_RENDER_NODES,
    DIFFICULTY,
    STORAGE_PREFIX,
    ROLES,
    RESOURCE_ICONS,
    STORAGE_KEYS,
    LEARNING_BUDGET,
    ERROR_REASONS
  };
})();
