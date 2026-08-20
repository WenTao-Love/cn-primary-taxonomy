import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(__dirname, '..', 'data');
const OUT = resolve(DATA, 'topics-shuxue-versions.json');

const versions = [
  { code: 'SXB', textbook: '北师大版' },
  { code: 'SXS', textbook: '苏教版' }
];

const unitMaps = {
  '北师大版': {
    1: [
      { end: 5, unit: '一上 第1单元 生活中的数与比较', chapter: '数感启蒙', lessonPrefix: '数与比较' },
      { end: 10, unit: '一上 第2单元 10以内加减法初步', chapter: '10以内运算', lessonPrefix: '口算准备' },
      { end: 16, unit: '一上 第3单元 20以内数与口算准备', chapter: '20以内数的认识', lessonPrefix: '20以内数' },
      { end: 23, unit: '一下 第1单元 100以内数的认识', chapter: '百以内数', lessonPrefix: '数的认识' },
      { end: 31, unit: '一下 第2单元 100以内加减法', chapter: '加减法运算', lessonPrefix: '笔算与口算' },
      { end: 34, unit: '一下 第3单元 人民币和规律初步', chapter: '生活中的数学', lessonPrefix: '人民币与规律' },
      { end: 44, unit: '一下 第4单元 图形与位置', chapter: '图形与空间', lessonPrefix: '图形操作' },
      { end: 60, unit: '一下 第5单元 长短轻重与认识时间', chapter: '测量与时间', lessonPrefix: '量感训练' },
      { end: 66, unit: '一下 第6单元 统计活动', chapter: '统计初步', lessonPrefix: '数据整理' },
      { end: 76, unit: '一下 第7单元 综合实践活动', chapter: '综合实践', lessonPrefix: '实践主题' }
    ],
    2: [
      { end: 9, unit: '二上 第1单元 长度测量', chapter: '长度测量', lessonPrefix: '长度与线段' },
      { end: 19, unit: '二上 第2单元 100以内加减法', chapter: '加减法进阶', lessonPrefix: '进退位运算' },
      { end: 29, unit: '二上 第3单元 角与平面图形', chapter: '角与图形', lessonPrefix: '图形认识' },
      { end: 39, unit: '二上 第4单元 表内乘法', chapter: '乘法入门', lessonPrefix: '乘法口诀' },
      { end: 44, unit: '二上 第5单元 观察物体与空间感知', chapter: '观察物体', lessonPrefix: '空间观察' },
      { end: 49, unit: '二上 第6单元 认识时间', chapter: '时间认识', lessonPrefix: '时分秒' },
      { end: 52, unit: '二下 第1单元 排列组合与逻辑实践', chapter: '数学实践', lessonPrefix: '排列推理' }
    ],
    3: [
      { end: 10, unit: '三上 第1单元 万以内数与加减法', chapter: '大数与运算', lessonPrefix: '数与运算' },
      { end: 18, unit: '三上 第2单元 倍与运算顺序', chapter: '数量关系', lessonPrefix: '倍与顺序' },
      { end: 28, unit: '三下 第3单元 分数和乘除法初步', chapter: '分数与除法', lessonPrefix: '分数乘除' },
      { end: 36, unit: '三下 第4单元 数量关系与规律', chapter: '规律探索', lessonPrefix: '数量规律' },
      { end: 50, unit: '三上 第5单元 周长面积与图形测量', chapter: '图形测量', lessonPrefix: '周长面积' },
      { end: 60, unit: '三下 第6单元 吨秒和24时记时法', chapter: '量与计量', lessonPrefix: '单位换算' },
      { end: 66, unit: '三下 第7单元 条形统计与调查', chapter: '统计调查', lessonPrefix: '调查与统计' },
      { end: 74, unit: '三下 第8单元 综合实践与推理', chapter: '综合实践', lessonPrefix: '推理表达' }
    ],
    4: [
      { end: 6, unit: '四上 第1单元 认识更大的数与乘除法', chapter: '大数与四则运算', lessonPrefix: '大数乘除' },
      { end: 11, unit: '四下 第2单元 小数的意义与计算', chapter: '小数学习', lessonPrefix: '小数计算' },
      { end: 17, unit: '四上 第3单元 线与角及四边形', chapter: '图形与角', lessonPrefix: '线角图形' },
      { end: 19, unit: '四下 第4单元 面积单位', chapter: '面积单位', lessonPrefix: '面积应用' },
      { end: 21, unit: '四下 第5单元 统计图', chapter: '统计表示', lessonPrefix: '统计图表' },
      { end: 23, unit: '四下 第6单元 数学好玩与实践', chapter: '综合实践', lessonPrefix: '画图与估算' }
    ],
    5: [
      { end: 8, unit: '五上 第1单元 小数乘除法', chapter: '小数运算', lessonPrefix: '小数乘除' },
      { end: 15, unit: '五下 第2单元 分数的意义与运算', chapter: '分数基础', lessonPrefix: '分数意义' },
      { end: 19, unit: '五上 第3单元 多边形面积', chapter: '平面图形面积', lessonPrefix: '面积公式' },
      { end: 23, unit: '五下 第4单元 长方体和正方体', chapter: '立体图形', lessonPrefix: '长正方体' },
      { end: 24, unit: '五下 第5单元 体积与容积单位', chapter: '体积容积', lessonPrefix: '单位换算' },
      { end: 25, unit: '五下 第6单元 折线统计图', chapter: '统计变化', lessonPrefix: '折线统计' },
      { end: 26, unit: '五下 第7单元 综合实践建模', chapter: '综合建模', lessonPrefix: '生活建模' }
    ],
    6: [
      { end: 8, unit: '六上 第1单元 分数乘除法和比', chapter: '分数与比', lessonPrefix: '分数比应用' },
      { end: 15, unit: '六下 第2单元 百分数与方程', chapter: '百分数方程', lessonPrefix: '百分数方程' },
      { end: 19, unit: '六上 第3单元 圆', chapter: '圆的知识', lessonPrefix: '圆的特征' },
      { end: 24, unit: '六下 第4单元 比例尺与圆柱圆锥', chapter: '比例与立体图形', lessonPrefix: '比例立体' },
      { end: 26, unit: '六下 第5单元 统计与平均数', chapter: '统计分析', lessonPrefix: '统计平均数' },
      { end: 28, unit: '六下 第6单元 总复习与综合应用', chapter: '总复习', lessonPrefix: '综合应用' }
    ]
  },
  '苏教版': {
    1: [
      { end: 5, unit: '一上 第1单元 数一数和比较', chapter: '数感启蒙', lessonPrefix: '数一数' },
      { end: 10, unit: '一上 第2单元 10以内数与加减法', chapter: '10以内运算', lessonPrefix: '10以内运算' },
      { end: 16, unit: '一上 第3单元 20以内数和准备活动', chapter: '20以内数', lessonPrefix: '20以内数' },
      { end: 23, unit: '一下 第1单元 100以内数', chapter: '百以内数', lessonPrefix: '百以内数' },
      { end: 31, unit: '一下 第2单元 100以内加减法', chapter: '加减法', lessonPrefix: '百以内加减' },
      { end: 34, unit: '一下 第3单元 元角分和找规律', chapter: '生活数学', lessonPrefix: '元角分规律' },
      { end: 44, unit: '一下 第4单元 认识图形和位置', chapter: '图形位置', lessonPrefix: '图形位置' },
      { end: 60, unit: '一下 第5单元 长短轻重与钟表', chapter: '测量与时间', lessonPrefix: '钟表量感' },
      { end: 66, unit: '一下 第6单元 数据整理', chapter: '统计初步', lessonPrefix: '数据整理' },
      { end: 76, unit: '一下 第7单元 实践活动', chapter: '综合实践', lessonPrefix: '实践活动' }
    ],
    2: [
      { end: 9, unit: '二上 第1单元 认识厘米和米', chapter: '长度测量', lessonPrefix: '厘米米' },
      { end: 19, unit: '二上 第2单元 100以内加减法', chapter: '加减法进阶', lessonPrefix: '加减法' },
      { end: 29, unit: '二上 第3单元 角和简单图形', chapter: '角与图形', lessonPrefix: '角图形' },
      { end: 39, unit: '二上 第4单元 表内乘法', chapter: '乘法口诀', lessonPrefix: '表内乘法' },
      { end: 44, unit: '二上 第5单元 观察物体', chapter: '观察物体', lessonPrefix: '空间观察' },
      { end: 49, unit: '二上 第6单元 时分认识', chapter: '时分认识', lessonPrefix: '时分' },
      { end: 52, unit: '二下 第1单元 实践与推理', chapter: '实践推理', lessonPrefix: '排列推理' }
    ],
    3: [
      { end: 10, unit: '三上 第1单元 万以内数和加减法', chapter: '大数与运算', lessonPrefix: '数和加减' },
      { end: 18, unit: '三上 第2单元 倍与混合运算', chapter: '倍与顺序', lessonPrefix: '倍与混合' },
      { end: 28, unit: '三下 第3单元 分数和乘除法', chapter: '分数与除法', lessonPrefix: '分数除法' },
      { end: 36, unit: '三下 第4单元 数量关系与规律探索', chapter: '规律探索', lessonPrefix: '数量规律' },
      { end: 50, unit: '三上 第5单元 周长面积与图形', chapter: '图形测量', lessonPrefix: '周长面积' },
      { end: 60, unit: '三下 第6单元 质量时间与测量', chapter: '量与计量', lessonPrefix: '质量时间' },
      { end: 66, unit: '三下 第7单元 统计调查', chapter: '统计调查', lessonPrefix: '统计调查' },
      { end: 74, unit: '三下 第8单元 综合实践', chapter: '综合实践', lessonPrefix: '综合实践' }
    ],
    4: [
      { end: 6, unit: '四上 第1单元 大数与计算', chapter: '大数与运算', lessonPrefix: '大数计算' },
      { end: 11, unit: '四下 第2单元 小数和运算', chapter: '小数运算', lessonPrefix: '小数运算' },
      { end: 17, unit: '四上 第3单元 直线角和平行四边形', chapter: '图形与角', lessonPrefix: '线角四边形' },
      { end: 19, unit: '四下 第4单元 面积单位与应用', chapter: '面积单位', lessonPrefix: '面积应用' },
      { end: 21, unit: '四下 第5单元 统计图', chapter: '统计图', lessonPrefix: '统计图' },
      { end: 23, unit: '四下 第6单元 实践活动', chapter: '综合实践', lessonPrefix: '实践活动' }
    ],
    5: [
      { end: 8, unit: '五上 第1单元 小数乘除法', chapter: '小数运算', lessonPrefix: '小数乘除' },
      { end: 15, unit: '五下 第2单元 分数基础和加减法', chapter: '分数基础', lessonPrefix: '分数加减' },
      { end: 19, unit: '五上 第3单元 多边形面积', chapter: '面积公式', lessonPrefix: '多边形面积' },
      { end: 23, unit: '五下 第4单元 长方体和正方体', chapter: '立体图形', lessonPrefix: '长正方体' },
      { end: 24, unit: '五下 第5单元 体积单位', chapter: '体积单位', lessonPrefix: '体积单位' },
      { end: 25, unit: '五下 第6单元 折线统计图', chapter: '折线统计', lessonPrefix: '折线统计' },
      { end: 26, unit: '五下 第7单元 数学实践', chapter: '数学实践', lessonPrefix: '数学实践' }
    ],
    6: [
      { end: 8, unit: '六上 第1单元 分数运算与比', chapter: '分数与比', lessonPrefix: '分数和比' },
      { end: 15, unit: '六下 第2单元 百分数和方程', chapter: '百分数方程', lessonPrefix: '百分数方程' },
      { end: 19, unit: '六上 第3单元 圆', chapter: '圆的知识', lessonPrefix: '圆' },
      { end: 24, unit: '六下 第4单元 比例尺与立体图形', chapter: '比例与立体', lessonPrefix: '比例立体' },
      { end: 26, unit: '六下 第5单元 统计', chapter: '统计', lessonPrefix: '统计分析' },
      { end: 28, unit: '六下 第6单元 总复习', chapter: '总复习', lessonPrefix: '总复习' }
    ]
  }
};

function resolveStage(textbook, grade, orderIndex) {
  const rules = unitMaps[textbook][grade];
  return rules.find(rule => orderIndex <= rule.end) || null;
}

function volumeLabel(grade, term) {
  return `${grade}年级${term === '上' ? '上册' : term === '下' ? '下册' : '全册'}`;
}

function zxxkAlbumUrl(grade, typeCode) {
  return `https://www.zxxk.com/zj/p-channel2-type${typeCode}-g${grade}/s24615/?level=1203`;
}

function slugify(text) {
  return String(text || '')
    .replace(/\s+/g, '')
    .replace(/[·：:（）()]/g, '-')
    .replace(/[^\u4e00-\u9fa5A-Za-z0-9_-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function unitKeyOf(topic) {
  return slugify([topic.textbook, topic.volume, topic.unit].filter(Boolean).join('-'));
}

function resourceIdOf(topic, subnodeType, slot) {
  return `res_${topic.id}_${slugify(subnodeType)}_${slot}`;
}

const DIRECT_RESOURCE_CATALOG = [
  {
    textbook: '北师大版',
    grade: 6,
    unitIncludes: '第3单元 圆',
    subnodeType: '例题型',
    items: [
      { slot: 'direct-53996087', externalWorkId: '53996087', title: '圆·单元考点梳理直链', type: 'example', url: 'https://www.zxxk.com/soft/53996087.html', note: '学科网作品ID 53996087，直达北师大版六上“圆”单元考点梳理与典例讲练' },
      { slot: 'direct-54002141', externalWorkId: '54002141', title: '圆·周长与面积专项直链', type: 'exercise', url: 'https://www.zxxk.com/soft/54002141.html', note: '学科网作品ID 54002141，聚焦圆的周长、面积与典型题型训练' }
    ]
  },
  {
    textbook: '北师大版',
    grade: 6,
    unitIncludes: '第3单元 圆',
    subnodeType: '方法型',
    items: [
      { slot: 'direct-59084990', externalWorkId: '59084990', title: '圆·单元复习课件直链', type: 'article', url: 'https://www.zxxk.com/soft/59084990.html', note: '学科网作品ID 59084990，适合沉淀圆单元的知识框架与方法策略' }
    ]
  },
  {
    textbook: '北师大版',
    grade: 5,
    unitIncludes: '小数乘除法',
    subnodeType: '例题型',
    items: [
      { slot: 'direct-54021883', externalWorkId: '54021883', title: '小数乘除法·小数除法专项直链', type: 'example', url: 'https://www.zxxk.com/soft/54021883.html', note: '学科网作品ID 54021883，适合对接小数除法例题与专项训练' },
      { slot: 'direct-58904826', externalWorkId: '58904826', title: '小数乘除法·小数乘法专项直链', type: 'example', url: 'https://www.zxxk.com/soft/58904826.html', note: '学科网作品ID 58904826，适合补齐小数乘法基础例题与计算训练' }
    ]
  },
  {
    textbook: '北师大版',
    grade: 5,
    unitIncludes: '多边形面积',
    subnodeType: '易错型',
    items: [
      { slot: 'direct-53854068', externalWorkId: '53854068', title: '多边形面积·易错冲刺直链', type: 'exercise', url: 'https://www.zxxk.com/soft/53854068.html', note: '学科网作品ID 53854068，聚焦多边形面积易错真题与满分冲刺' },
      { slot: 'direct-49709311', externalWorkId: '49709311', title: '多边形面积·单元测试直链', type: 'exercise', url: 'https://www.zxxk.com/soft/49709311.html', note: '学科网作品ID 49709311，适合做单元纠错与检测回练' }
    ]
  },
  {
    textbook: '北师大版',
    grade: 5,
    unitIncludes: '多边形面积',
    subnodeType: '方法型',
    items: [
      { slot: 'direct-53641192', externalWorkId: '53641192', title: '多边形面积·复习课件直链', type: 'article', url: 'https://www.zxxk.com/soft/53641192.html', note: '学科网作品ID 53641192，适合梳理转化法、公式推导和组合图形方法' }
    ]
  },
  {
    textbook: '苏教版',
    grade: 5,
    unitIncludes: '多边形面积',
    subnodeType: '例题型',
    items: [
      { slot: 'direct-58803083', externalWorkId: '58803083', title: '多边形面积·典例专项直链', type: 'example', url: 'https://www.zxxk.com/soft/58803083.html', note: '学科网作品ID 58803083，直达苏教版五上多边形面积知识梳理、典型例题与综合训练' }
    ]
  },
  {
    textbook: '苏教版',
    grade: 6,
    unitIncludes: '分数运算与比',
    subnodeType: '例题型',
    items: [
      { slot: 'direct-53556851', externalWorkId: '53556851', title: '分数运算与比·单元复习讲义直链', type: 'example', url: 'https://www.zxxk.com/soft/53556851.html', note: '学科网作品ID 53556851，覆盖分数除法与比的核心考点讲解' }
    ]
  },
  {
    textbook: '苏教版',
    grade: 6,
    unitIncludes: '分数运算与比',
    subnodeType: '易错型',
    items: [
      { slot: 'direct-54478919', externalWorkId: '54478919', title: '分数运算与比·易错导航直链', type: 'exercise', url: 'https://www.zxxk.com/soft/54478919.html', note: '学科网作品ID 54478919，适合补错因、辨析与单元精练' },
      { slot: 'direct-54075646', externalWorkId: '54075646', title: '分数运算与比·比的计算专项直链', type: 'exercise', url: 'https://www.zxxk.com/soft/54075646.html', note: '学科网作品ID 54075646，适合对接“比”的计算与化简比专项回练' }
    ]
  },
  {
    textbook: '北师大版',
    grade: 5,
    unitIncludes: '长方体和正方体',
    subnodeType: '例题型',
    items: [
      { slot: 'direct-51098375', externalWorkId: '51098375', title: '长方体和正方体·体积篇直链', type: 'example', url: 'https://www.zxxk.com/soft/51098375.html', note: '学科网作品ID 51098375，覆盖体积、容积、切拼、排水法等高频例题' },
      { slot: 'direct-51098382', externalWorkId: '51098382', title: '长方体和正方体·体积容积问题直链', type: 'exercise', url: 'https://www.zxxk.com/soft/51098382.html', note: '学科网作品ID 51098382，适合承接单元典型应用题与分层回练' }
    ]
  },
  {
    textbook: '北师大版',
    grade: 5,
    unitIncludes: '长方体和正方体',
    subnodeType: '方法型',
    items: [
      { slot: 'direct-51801320', externalWorkId: '51801320', title: '长方体和正方体·作业本方法直链', type: 'article', url: 'https://www.zxxk.com/soft/51801320.html', note: '学科网作品ID 51801320，适合补体积、容积单位和公式应用的课时方法梳理' },
      { slot: 'direct-51098396', externalWorkId: '51098396', title: '长方体和正方体·思维素养直链', type: 'article', url: 'https://www.zxxk.com/soft/51098396.html', note: '学科网作品ID 51098396，适合沉淀切拼、等积变形、折叠与表面积最值方法' }
    ]
  },
  {
    textbook: '北师大版',
    grade: 6,
    unitIncludes: '第4单元 比例尺与圆柱圆锥',
    subnodeType: '例题型',
    items: [
      { slot: 'direct-56729249', externalWorkId: '56729249', title: '比例尺与圆柱圆锥·单元培优讲义直链', type: 'example', url: 'https://www.zxxk.com/soft/56729249.html', note: '学科网作品ID 56729249，覆盖圆柱圆锥核心知识与综合例题讲解' },
      { slot: 'direct-50410418', externalWorkId: '50410418', title: '比例尺与圆柱圆锥·比例知识梳理直链', type: 'example', url: 'https://www.zxxk.com/soft/50410418.html', note: '学科网作品ID 50410418，适合补比例、比例尺和图形缩放类高频题型' }
    ]
  },
  {
    textbook: '北师大版',
    grade: 6,
    unitIncludes: '第4单元 比例尺与圆柱圆锥',
    subnodeType: '易错型',
    items: [
      { slot: 'direct-50370297', externalWorkId: '50370297', title: '比例尺与圆柱圆锥·解比例易错直链', type: 'exercise', url: 'https://www.zxxk.com/soft/50370297.html', note: '学科网作品ID 50370297，适合补解比例或解方程类常见错因' },
      { slot: 'direct-57899785', externalWorkId: '57899785', title: '比例尺与圆柱圆锥·圆柱圆锥单元卷直链', type: 'exercise', url: 'https://www.zxxk.com/soft/57899785.html', note: '学科网作品ID 57899785，适合承接圆柱圆锥单元复习与错题回练' }
    ]
  },
  {
    textbook: '北师大版',
    grade: 6,
    unitIncludes: '第4单元 比例尺与圆柱圆锥',
    subnodeType: '方法型',
    items: [
      { slot: 'direct-56307100', externalWorkId: '56307100', title: '比例尺与圆柱圆锥·单元复习课件直链', type: 'article', url: 'https://www.zxxk.com/soft/56307100.html', note: '学科网作品ID 56307100，适合做圆柱圆锥与比例尺的知识框架整理' },
      { slot: 'direct-49429584', externalWorkId: '49429584', title: '比例尺与圆柱圆锥·比例尺教案直链', type: 'article', url: 'https://www.zxxk.com/soft/49429584.html', note: '学科网作品ID 49429584，适合沉淀比例尺应用步骤与作图方法' }
    ]
  },
  {
    textbook: '苏教版',
    grade: 5,
    unitIncludes: '长方体和正方体',
    subnodeType: '例题型',
    items: [
      { slot: 'direct-56314786', externalWorkId: '56314786', title: '长方体和正方体·知识梳理讲练直链', type: 'example', url: 'https://www.zxxk.com/soft/56314786.html', note: '学科网作品ID 56314786，适合承接表面积、体积、容积与单位进率的系统讲练' },
      { slot: 'direct-57849357', externalWorkId: '57849357', title: '长方体和正方体·应用题专项直链', type: 'exercise', url: 'https://www.zxxk.com/soft/57849357.html', note: '学科网作品ID 57849357，覆盖无盖表面积、排水法、切割增面积等高频应用题' }
    ]
  },
  {
    textbook: '苏教版',
    grade: 5,
    unitIncludes: '长方体和正方体',
    subnodeType: '易错型',
    items: [
      { slot: 'direct-57805918', externalWorkId: '57805918', title: '长方体和正方体·单元自测直链', type: 'exercise', url: 'https://www.zxxk.com/soft/57805918.html', note: '学科网作品ID 57805918，适合补面棱顶点、表面积、体积等基础错因' }
    ]
  },
  {
    textbook: '苏教版',
    grade: 6,
    unitIncludes: '第4单元 比例尺与立体图形',
    subnodeType: '例题型',
    items: [
      { slot: 'direct-56690864', externalWorkId: '56690864', title: '比例尺与立体图形·圆柱圆锥培优直链', type: 'example', url: 'https://www.zxxk.com/soft/56690864.html', note: '学科网作品ID 56690864，适合补圆柱圆锥知识框架与综合例题' },
      { slot: 'direct-50687617', externalWorkId: '50687617', title: '比例尺与立体图形·比例知识全梳理直链', type: 'example', url: 'https://www.zxxk.com/soft/50687617.html', note: '学科网作品ID 50687617，适合补比例、比例尺与图形放缩类核心题型' }
    ]
  },
  {
    textbook: '苏教版',
    grade: 6,
    unitIncludes: '第4单元 比例尺与立体图形',
    subnodeType: '易错型',
    items: [
      { slot: 'direct-50908281', externalWorkId: '50908281', title: '比例尺与立体图形·解方程或比例计算直链', type: 'exercise', url: 'https://www.zxxk.com/soft/50908281.html', note: '学科网作品ID 50908281，适合补比例计算、解比例与综合运算错因' },
      { slot: 'direct-56997057', externalWorkId: '56997057', title: '比例尺与立体图形·比例知识清单直链', type: 'exercise', url: 'https://www.zxxk.com/soft/56997057.html', note: '学科网作品ID 56997057，适合做比例尺与放缩题的错因回练' }
    ]
  },
  {
    textbook: '苏教版',
    grade: 6,
    unitIncludes: '第4单元 比例尺与立体图形',
    subnodeType: '方法型',
    items: [
      { slot: 'direct-51134920', externalWorkId: '51134920', title: '比例尺与立体图形·比例尺讲练测直链', type: 'article', url: 'https://www.zxxk.com/soft/51134920.html', note: '学科网作品ID 51134920，适合沉淀比例尺应用步骤、作图法和讲练测闭环' },
      { slot: 'direct-55414679', externalWorkId: '55414679', title: '比例尺与立体图形·圆柱圆锥操作题直链', type: 'article', url: 'https://www.zxxk.com/soft/55414679.html', note: '学科网作品ID 55414679，适合沉淀展开图、操作题和空间想象方法' }
    ]
  }
];

const directResourceMatchCache = new Map();

function unitMatches(unit, matcher) {
  const value = String(unit || '');
  if (!matcher) return false;
  if (Array.isArray(matcher)) return matcher.some(item => value.includes(item));
  return value.includes(matcher);
}

function matchedDirectItems(baseTopic, subnodeType) {
  const cacheKey = `${baseTopic.textbook}|${baseTopic.grade}|${baseTopic.unit}|${subnodeType}`;
  if (directResourceMatchCache.has(cacheKey)) return directResourceMatchCache.get(cacheKey);
  const matched = DIRECT_RESOURCE_CATALOG
    .filter(item =>
      item.textbook === baseTopic.textbook &&
      item.grade === baseTopic.grade &&
      item.subnodeType === subnodeType &&
      unitMatches(baseTopic.unit, item.unitIncludes)
    )
    .flatMap(item => item.items);
  directResourceMatchCache.set(cacheKey, matched);
  return matched;
}

function buildDirectResources(baseTopic, subnodeType, resourceGroupKey, resourceUnitKey) {
  const matched = matchedDirectItems(baseTopic, subnodeType);
  return matched.map(item => ({
    resourceId: resourceIdOf(baseTopic, subnodeType, item.slot),
    resourceGroupKey,
    resourceUnitKey,
    externalWorkId: item.externalWorkId,
    title: `${baseTopic.name}·${item.title}`,
    type: item.type,
    url: item.url,
    source: '学科网',
    note: item.note
  }));
}

function makeMathChild(baseTopic, parentId, seq, subnodeType, nameSuffix, description, evidence, commonMistakes, practiceChain, assessmentTasks) {
  const resourceKeyword = `${baseTopic.volume} ${baseTopic.unit} ${baseTopic.lesson} ${baseTopic.name}`;
  const resourceUnitKey = unitKeyOf(baseTopic);
  const resourceGroupKey = `${resourceUnitKey}-${slugify(subnodeType)}`;
  const directResources = buildDirectResources(baseTopic, subnodeType, resourceGroupKey, resourceUnitKey);
  const resourcePack = subnodeType === '例题型'
    ? [
        {
          resourceId: resourceIdOf(baseTopic, subnodeType, 'album-lecture'),
          resourceGroupKey,
          resourceUnitKey,
          title: `${baseTopic.name}·学科网同步讲义专辑`,
          type: 'example',
          url: zxxkAlbumUrl(baseTopic.grade, '3102'),
          source: '学科网',
          note: `已直达“小学数学 + ${baseTopic.grade}年级 + 教案/讲义 + 同步教学”专辑页，可按“${resourceKeyword}”继续定位典例讲练`
        },
        {
          resourceId: resourceIdOf(baseTopic, subnodeType, 'album-sheet'),
          resourceGroupKey,
          resourceUnitKey,
          title: `${baseTopic.name}·学科网同步题集专辑`,
          type: 'worksheet',
          url: zxxkAlbumUrl(baseTopic.grade, '3105'),
          source: '学科网',
          note: `已直达“小学数学 + ${baseTopic.grade}年级 + 学案/导学案 + 同步教学”页，适合找与“${resourceKeyword}”对应的逐单元精选题单`
        },
        {
          resourceId: resourceIdOf(baseTopic, subnodeType, 'unit-pack'),
          resourceGroupKey,
          resourceUnitKey,
          title: `${baseTopic.name}·单元精选题单映射`,
          type: 'worksheet',
          url: zxxkAlbumUrl(baseTopic.grade, '3105'),
          source: '学科网',
          note: `资源组键 ${resourceGroupKey}，用于承载“${baseTopic.unit}”下的精选题单映射；后续可继续补充具体作品ID直链`
        }
      ]
    : subnodeType === '易错型'
      ? [
          {
          resourceId: resourceIdOf(baseTopic, subnodeType, 'album-paper'),
          resourceGroupKey,
          resourceUnitKey,
          title: `${baseTopic.name}·学科网同步试题专辑`,
          type: 'exercise',
          url: zxxkAlbumUrl(baseTopic.grade, '3103'),
          source: '学科网',
          note: `已直达“小学数学 + ${baseTopic.grade}年级 + 试题试卷 + 同步教学”专辑页，可继续定位“${resourceKeyword} 易错”训练`
        },
        {
          resourceId: resourceIdOf(baseTopic, subnodeType, 'jyeoo-center'),
          resourceGroupKey,
          resourceUnitKey,
          title: `${baseTopic.name}·菁优网小学试卷中心`,
            type: 'exercise',
          url: 'https://www.jyeoo.com/math3/report/index?ai=0',
            source: '菁优网',
          note: `已直达小学数学试卷中心，建议用“${resourceKeyword} 易错”作为定位词筛同类纠错卷`
          },
          {
          resourceId: resourceIdOf(baseTopic, subnodeType, 'unit-pack'),
          resourceGroupKey,
          resourceUnitKey,
          title: `${baseTopic.name}·错因题单映射`,
          type: 'exercise',
          url: zxxkAlbumUrl(baseTopic.grade, '3103'),
          source: '学科网',
          note: `资源组键 ${resourceGroupKey}，用于沉淀“${baseTopic.unit}”的易错型精选题单和后续作品ID`
          }
        ]
      : [
          {
          resourceId: resourceIdOf(baseTopic, subnodeType, 'album-method'),
          resourceGroupKey,
          resourceUnitKey,
          title: `${baseTopic.name}·学科网备课综合专辑`,
            type: 'worksheet',
          url: zxxkAlbumUrl(baseTopic.grade, '3108'),
          source: '学科网',
          note: `已直达“小学数学 + ${baseTopic.grade}年级 + 备课综合 + 同步教学”专辑页，适合找“${resourceKeyword} 方法”类资料`
          },
          {
            resourceId: resourceIdOf(baseTopic, subnodeType, 'smartedu'),
            resourceGroupKey,
            resourceUnitKey,
            title: `${baseTopic.name}·智慧中小学拓展资源`,
            type: 'article',
            url: 'https://basic.smartedu.cn/',
            source: '国家中小学智慧教育平台',
            note: `检索“${resourceKeyword}”，优先调用同步课、作业活动和方法讲解资源`
          },
          {
            resourceId: resourceIdOf(baseTopic, subnodeType, 'unit-pack'),
            resourceGroupKey,
            resourceUnitKey,
            title: `${baseTopic.name}·方法策略题单映射`,
            type: 'worksheet',
            url: zxxkAlbumUrl(baseTopic.grade, '3108'),
            source: '学科网',
            note: `资源组键 ${resourceGroupKey}，用于沉淀“${baseTopic.unit}”的方法型精选题单和后续作品ID`
          }
        ];
  const finalResources = directResources.length
    ? [...directResources, ...resourcePack.filter(resource => !String(resource.resourceId).endsWith('unit-pack'))]
    : resourcePack;
  return {
    ...baseTopic,
    id: seq,
    parentTopicId: parentId,
    subnodeType,
    name: `${baseTopic.name}·${nameSuffix}`,
    description,
    evidence,
    commonMistakes,
    practiceChain,
    assessmentTasks,
    resources: finalResources
  };
}

function buildMathChildren(baseTopic, parentId, nextId) {
  const commonLead = `${baseTopic.textbook}${baseTopic.volume}${baseTopic.unit}中“${baseTopic.lesson}”`;
  const example = makeMathChild(
    baseTopic,
    parentId,
    nextId(1),
    '例题型',
    '典型例题',
    `围绕${commonLead}，通过一题一解的方式提炼${baseTopic.name}的典型解题路径和题型识别点。`,
    [`能独立完成“${baseTopic.name}”的基础例题`, '能说出题目条件、解题步骤和答案之间的关系'],
    ['只会照着算，不会说为什么这样列式', '条件变式后无法迁移'],
    ['先完成教材原例题', '再做同结构变式题', '最后尝试综合应用题'],
    ['口头复述例题思路', '独立列式并解释关键步骤']
  );
  const mistake = makeMathChild(
    baseTopic,
    parentId,
    nextId(1),
    '易错型',
    '易错诊断',
    `围绕${commonLead}，聚焦${baseTopic.name}中最容易混淆、漏算或误判的环节，形成错因诊断清单。`,
    ['能指出典型错题错在哪里', '能用自己的话说明避免同类错误的方法'],
    ['只看结果对错，不分析错因', '同一类错误反复出现'],
    ['先识别常见错法', '再改正并重做', '最后总结避免错误的提醒句'],
    ['对比正确解和错误解', '解释为什么该错法不成立']
  );
  const method = makeMathChild(
    baseTopic,
    parentId,
    nextId(1),
    '方法型',
    '方法策略',
    `围绕${commonLead}，沉淀${baseTopic.name}可迁移的解题方法、检验策略和思考顺序。`,
    ['能总结出解决该类问题的一般步骤', '能在新题中主动调用相同方法'],
    ['会做题但不会提炼方法', '换一个情境就不会迁移'],
    ['先归纳关键步骤', '再比较不同做法', '最后形成自己的解题提醒卡'],
    ['说出本课时的解题口诀或步骤', '在陌生情境中迁移使用方法']
  );
  return [example, mistake, method];
}

const baseFiles = readdirSync(DATA)
  .filter(name => /^topics-shuxue-g[1-6]\.json$/i.test(name))
  .sort();

const baseByGrade = new Map();
for (const name of baseFiles) {
  const topics = JSON.parse(readFileSync(resolve(DATA, name), 'utf8')).topics;
  if (topics.length) baseByGrade.set(topics[0].grade, topics);
}

const topics = [];
for (const version of versions) {
  for (const grade of [1, 2, 3, 4, 5, 6]) {
    const baseTopics = baseByGrade.get(grade) || [];
    let seq = 1;
    const buildId = term => `ct_${version.code}${grade}${term === '上' ? 'S' : term === '下' ? 'X' : 'Q'}${String(seq++).padStart(3, '0')}`;

    for (let idx = 0; idx < baseTopics.length; idx++) {
      const topic = baseTopics[idx];
      const stage = resolveStage(version.textbook, grade, idx + 1);
      const volume = volumeLabel(grade, topic.term);
      const unit = stage?.unit || `${volume} ${topic.domain}`;
      const chapter = stage?.chapter || topic.domain;
      const lesson = `${stage?.lessonPrefix || topic.domain} · 课时主题：${topic.name}`;
      const parentId = buildId(topic.term);
      const parentTopic = {
        ...topic,
        id: parentId,
        subjectCode: version.code,
        textbook: version.textbook,
        volume,
        unit,
        chapter,
        lesson,
        subnodeType: null,
        parentTopicId: null,
        description: `${topic.description}（按${version.textbook}${volume}${unit}中“${lesson}”口径映射）`
      };
      topics.push(parentTopic);

      const children = buildMathChildren(parentTopic, parentId, () => buildId(topic.term));
      topics.push(...children);
    }
  }
}

const data = {
  version: 'v0.8-math-direct-links',
  note: '数学多版本扩展：在册次-单元-课时主题基础上，继续拆分为例题型/易错型/方法型子节点，并补入逐单元精选题单的外部作品ID直链',
  topicCount: topics.length,
  topics
};

writeFileSync(OUT, JSON.stringify(data, null, 2), 'utf8');
console.log(`✅ 数学多版本子节点化：${topics.length} 个知识点写入 ${OUT}`);
