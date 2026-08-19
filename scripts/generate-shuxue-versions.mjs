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

function makeMathChild(baseTopic, parentId, seq, subnodeType, nameSuffix, description, evidence, commonMistakes, practiceChain, assessmentTasks) {
  const resourceKeyword = `${baseTopic.volume} ${baseTopic.unit} ${baseTopic.lesson} ${baseTopic.name}`;
  const resourcePack = subnodeType === '例题型'
    ? [
        {
          title: `${baseTopic.name}·学科网同步资源`,
          type: 'example',
          url: 'https://sx.zxxk.com/p/',
          source: '学科网',
          note: `进入小学数学同步教学后按“${resourceKeyword}”定位例题讲练资源`
        },
        {
          title: `${baseTopic.name}·智慧中小学课程资源`,
          type: 'video',
          url: 'https://basic.smartedu.cn/',
          source: '国家中小学智慧教育平台',
          note: `按学段/年级/学科检索“${resourceKeyword}”，可定位同步微课与基础作业`
        }
      ]
    : subnodeType === '易错型'
      ? [
          {
            title: `${baseTopic.name}·菁优网作业中心`,
            type: 'exercise',
            url: 'https://www.jyeoo.com/math/homework',
            source: '菁优网',
            note: `在数学作业中心按“${resourceKeyword} 易错”筛选同类纠错训练`
          },
          {
            title: `${baseTopic.name}·学科网专项训练`,
            type: 'worksheet',
            url: 'https://www.zxxk.com/student',
            source: '学科网',
            note: `在学生专区按年级/版本进入数学学科，定位“${resourceKeyword}”专项或错题训练`
          }
        ]
      : [
          {
            title: `${baseTopic.name}·菁优网试卷中心`,
            type: 'worksheet',
            url: 'https://www.jyeoo.com/math/report',
            source: '菁优网',
            note: `在试卷中心按“${resourceKeyword} 方法”筛选变式题与阶段测评卷`
          },
          {
            title: `${baseTopic.name}·智慧中小学拓展资源`,
            type: 'article',
            url: 'https://basic.smartedu.cn/',
            source: '国家中小学智慧教育平台',
            note: `检索“${resourceKeyword}”，优先调用同步课、作业活动和方法讲解资源`
          }
        ];
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
    resources: resourcePack
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
  version: 'v0.6-math-real-sources',
  note: '数学多版本扩展：在册次-单元-课时主题基础上，继续拆分为例题型/易错型/方法型子节点，并挂接真实题链来源站入口',
  topicCount: topics.length,
  topics
};

writeFileSync(OUT, JSON.stringify(data, null, 2), 'utf8');
console.log(`✅ 数学多版本子节点化：${topics.length} 个知识点写入 ${OUT}`);
