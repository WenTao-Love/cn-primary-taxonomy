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
      { end: 5, unit: '一上 第1单元 生活中的数与比较' },
      { end: 10, unit: '一上 第2单元 10以内加减法初步' },
      { end: 16, unit: '一上 第3单元 20以内数与口算准备' },
      { end: 23, unit: '一下 第1单元 100以内数的认识' },
      { end: 31, unit: '一下 第2单元 100以内加减法' },
      { end: 34, unit: '一下 第3单元 人民币和规律初步' },
      { end: 44, unit: '一下 第4单元 图形与位置' },
      { end: 60, unit: '一下 第5单元 长短轻重与认识时间' },
      { end: 66, unit: '一下 第6单元 统计活动' },
      { end: 76, unit: '一下 第7单元 综合实践活动' }
    ],
    2: [
      { end: 9, unit: '二上 第1单元 长度测量' },
      { end: 19, unit: '二上 第2单元 100以内加减法' },
      { end: 29, unit: '二上 第3单元 角与平面图形' },
      { end: 39, unit: '二上 第4单元 表内乘法' },
      { end: 44, unit: '二上 第5单元 观察物体与空间感知' },
      { end: 49, unit: '二上 第6单元 认识时间' },
      { end: 52, unit: '二下 第1单元 排列组合与逻辑实践' }
    ],
    3: [
      { end: 10, unit: '三上 第1单元 万以内数与加减法' },
      { end: 18, unit: '三上 第2单元 倍与运算顺序' },
      { end: 28, unit: '三下 第3单元 分数和乘除法初步' },
      { end: 36, unit: '三下 第4单元 数量关系与规律' },
      { end: 50, unit: '三上 第5单元 周长面积与图形测量' },
      { end: 60, unit: '三下 第6单元 吨秒和24时记时法' },
      { end: 66, unit: '三下 第7单元 条形统计与调查' },
      { end: 74, unit: '三下 第8单元 综合实践与推理' }
    ],
    4: [
      { end: 6, unit: '四上 第1单元 认识更大的数与乘除法' },
      { end: 11, unit: '四下 第2单元 小数的意义与计算' },
      { end: 17, unit: '四上 第3单元 线与角及四边形' },
      { end: 19, unit: '四下 第4单元 面积单位' },
      { end: 21, unit: '四下 第5单元 统计图' },
      { end: 23, unit: '四下 第6单元 数学好玩与实践' }
    ],
    5: [
      { end: 8, unit: '五上 第1单元 小数乘除法' },
      { end: 15, unit: '五下 第2单元 分数的意义与运算' },
      { end: 19, unit: '五上 第3单元 多边形面积' },
      { end: 23, unit: '五下 第4单元 长方体和正方体' },
      { end: 24, unit: '五下 第5单元 体积与容积单位' },
      { end: 25, unit: '五下 第6单元 折线统计图' },
      { end: 26, unit: '五下 第7单元 综合实践建模' }
    ],
    6: [
      { end: 8, unit: '六上 第1单元 分数乘除法和比' },
      { end: 15, unit: '六下 第2单元 百分数与方程' },
      { end: 19, unit: '六上 第3单元 圆' },
      { end: 24, unit: '六下 第4单元 比例尺与圆柱圆锥' },
      { end: 26, unit: '六下 第5单元 统计与平均数' },
      { end: 28, unit: '六下 第6单元 总复习与综合应用' }
    ]
  },
  '苏教版': {
    1: [
      { end: 5, unit: '一上 第1单元 数一数和比较' },
      { end: 10, unit: '一上 第2单元 10以内数与加减法' },
      { end: 16, unit: '一上 第3单元 20以内数和准备活动' },
      { end: 23, unit: '一下 第1单元 100以内数' },
      { end: 31, unit: '一下 第2单元 100以内加减法' },
      { end: 34, unit: '一下 第3单元 元角分和找规律' },
      { end: 44, unit: '一下 第4单元 认识图形和位置' },
      { end: 60, unit: '一下 第5单元 长短轻重与钟表' },
      { end: 66, unit: '一下 第6单元 数据整理' },
      { end: 76, unit: '一下 第7单元 实践活动' }
    ],
    2: [
      { end: 9, unit: '二上 第1单元 认识厘米和米' },
      { end: 19, unit: '二上 第2单元 100以内加减法' },
      { end: 29, unit: '二上 第3单元 角和简单图形' },
      { end: 39, unit: '二上 第4单元 表内乘法' },
      { end: 44, unit: '二上 第5单元 观察物体' },
      { end: 49, unit: '二上 第6单元 时分认识' },
      { end: 52, unit: '二下 第1单元 实践与推理' }
    ],
    3: [
      { end: 10, unit: '三上 第1单元 万以内数和加减法' },
      { end: 18, unit: '三上 第2单元 倍与混合运算' },
      { end: 28, unit: '三下 第3单元 分数和乘除法' },
      { end: 36, unit: '三下 第4单元 数量关系与规律探索' },
      { end: 50, unit: '三上 第5单元 周长面积与图形' },
      { end: 60, unit: '三下 第6单元 质量时间与测量' },
      { end: 66, unit: '三下 第7单元 统计调查' },
      { end: 74, unit: '三下 第8单元 综合实践' }
    ],
    4: [
      { end: 6, unit: '四上 第1单元 大数与计算' },
      { end: 11, unit: '四下 第2单元 小数和运算' },
      { end: 17, unit: '四上 第3单元 直线角和平行四边形' },
      { end: 19, unit: '四下 第4单元 面积单位与应用' },
      { end: 21, unit: '四下 第5单元 统计图' },
      { end: 23, unit: '四下 第6单元 实践活动' }
    ],
    5: [
      { end: 8, unit: '五上 第1单元 小数乘除法' },
      { end: 15, unit: '五下 第2单元 分数基础和加减法' },
      { end: 19, unit: '五上 第3单元 多边形面积' },
      { end: 23, unit: '五下 第4单元 长方体和正方体' },
      { end: 24, unit: '五下 第5单元 体积单位' },
      { end: 25, unit: '五下 第6单元 折线统计图' },
      { end: 26, unit: '五下 第7单元 数学实践' }
    ],
    6: [
      { end: 8, unit: '六上 第1单元 分数运算与比' },
      { end: 15, unit: '六下 第2单元 百分数和方程' },
      { end: 19, unit: '六上 第3单元 圆' },
      { end: 24, unit: '六下 第4单元 比例尺与立体图形' },
      { end: 26, unit: '六下 第5单元 统计' },
      { end: 28, unit: '六下 第6单元 总复习' }
    ]
  }
};

function resolveUnit(textbook, grade, orderIndex, topic) {
  const rules = unitMaps[textbook][grade];
  const hit = rules.find(rule => orderIndex <= rule.end);
  return hit ? hit.unit : `${grade}年级${topic.term} ${topic.domain}`;
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
  for (const grade of [1,2,3,4,5,6]) {
    const baseTopics = baseByGrade.get(grade) || [];
    baseTopics.forEach((topic, idx) => {
      const unit = resolveUnit(version.textbook, grade, idx + 1, topic);
      topics.push({
        ...topic,
        id: topic.id.replace(/^ct_SX/, `ct_${version.code}`),
        subjectCode: version.code,
        textbook: version.textbook,
        unit,
        description: `${topic.description}（按${version.textbook}${unit}口径映射）`
      });
    });
  }
}

const data = {
  version: 'v0.3-math-units',
  note: '数学多版本扩展：在现有人教版主干基础上补充北师大版、苏教版的单元级映射知识点',
  topicCount: topics.length,
  topics
};

writeFileSync(OUT, JSON.stringify(data, null, 2), 'utf8');
console.log(`✅ 数学多版本单元化：${topics.length} 个知识点写入 ${OUT}`);
