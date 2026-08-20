/**
 * merge.mjs
 * 自动发现并合并所有 topics-*.json，生成最终 topics.json，并统计数据
 */
import { writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(__dirname, '..', 'data');

const SUBJECT_SEARCH_LABELS = {
  '语文': '语文',
  '数学': '数学',
  '英语': '英语',
  '科学': '科学',
  '道德与法治': '道德与法治',
  '劳动': '劳动',
  '体育与健康': '体育',
  '美术': '美术',
  '音乐': '音乐',
  '信息科技': '信息科技',
  'AI素养': '人工智能'
};

const CURATED_TOPIC_RESOURCE_CATALOG = {
  '数学|人教版|6|百分数的意义': [
    { slot: 'unit-note-51213600', externalWorkId: '51213600', title: '百分数的意义·复习讲义直链', type: 'article', url: 'https://www.zxxk.com/soft/51213600.html', source: '学科网', note: '作品ID 51213600，覆盖百分数（二）知识清单、折扣成数税率利率与意义辨析' },
    { slot: 'unit-paper-56297027', externalWorkId: '56297027', title: '百分数的意义·单元测试直链', type: 'exercise', url: 'https://www.zxxk.com/soft/56297027.html', source: '学科网', note: '作品ID 56297027，适合回练百分数意义、折扣与成数基础辨析' },
    { slot: 'life-courseware-51798818', externalWorkId: '51798818', title: '百分数的意义·生活与百分数课件直链', type: 'article', url: 'https://www.zxxk.com/soft/51798818.html', source: '学科网', note: '作品ID 51798818，适合把百分数意义迁移到储蓄、利率、合格率等生活情境' }
  ],
  '数学|人教版|6|百分数和分数小数互化': [
    { slot: 'calc-pack-50064857', externalWorkId: '50064857', title: '百分数和分数小数互化·计算专题直链', type: 'example', url: 'https://www.zxxk.com/soft/50064857.html', source: '学科网', note: '作品ID 50064857，聚焦百分数、分数、小数、比之间的互化与计算题型' },
    { slot: 'guide-52233174', externalWorkId: '52233174', title: '百分数和分数小数互化·专题讲义直链', type: 'article', url: 'https://www.zxxk.com/soft/52233174.html', source: '学科网', note: '作品ID 52233174，适合梳理百分数概念、互化规则和常见易错点' }
  ],
  '数学|人教版|6|百分数应用题': [
    { slot: 'sync-work-56493130', externalWorkId: '56493130', title: '百分数应用题·同步练直链', type: 'example', url: 'https://www.zxxk.com/soft/56493130.html', source: '学科网', note: '作品ID 56493130，覆盖折扣、成数、税率、利率等百分数（二）核心应用题' },
    { slot: 'error-pack-49968341', externalWorkId: '49968341', title: '百分数应用题·高频易错讲义直链', type: 'exercise', url: 'https://www.zxxk.com/soft/49968341.html', source: '学科网', note: '作品ID 49968341，适合补单位1判断、利润税率和折扣问题的常见错因' },
    { slot: 'unit-paper-56093464', externalWorkId: '56093464', title: '百分数应用题·单元闯关卷直链', type: 'exercise', url: 'https://www.zxxk.com/soft/56093464.html', source: '学科网', note: '作品ID 56093464，适合承接百分数（二）整单元的分层自测与回练' },
    { slot: 'life-homework-56026914', externalWorkId: '56026914', title: '百分数应用题·生活与百分数分层作业直链', type: 'exercise', url: 'https://www.zxxk.com/soft/56026914.html', source: '学科网', note: '作品ID 56026914，聚焦购物促销、税率、利率等生活与百分数高频题型' },
    { slot: 'life-unit-test-56440421', externalWorkId: '56440421', title: '百分数应用题·生活与百分数单元测试直链', type: 'exercise', url: 'https://www.zxxk.com/soft/56440421.html', source: '学科网', note: '作品ID 56440421，适合对生活与百分数专题做整块闭环检测' }
  ],
  '数学|人教版|5|长方体和正方体特征': [
    { slot: 'lecture-51270589', externalWorkId: '51270589', title: '长方体和正方体特征·复习讲义直链', type: 'example', url: 'https://www.zxxk.com/soft/51270589.html', source: '学科网', note: '作品ID 51270589，覆盖长方体与正方体特征、展开图、棱长关系等核心考点' },
    { slot: 'test-56451772', externalWorkId: '56451772', title: '长方体和正方体特征·单元测试直链', type: 'exercise', url: 'https://www.zxxk.com/soft/56451772.html', source: '学科网', note: '作品ID 56451772，适合回练面、棱、顶点、展开图等高频题' }
  ],
  '数学|人教版|5|长方体和正方体表面积': [
    { slot: 'courseware-51386292', externalWorkId: '51386292', title: '长方体和正方体表面积·课件直链', type: 'article', url: 'https://www.zxxk.com/soft/51386292.html', source: '学科网', note: '作品ID 51386292，适合梳理表面积概念、展开图和求法' },
    { slot: 'drill-50885813', externalWorkId: '50885813', title: '长方体和正方体表面积·分层精练直链', type: 'exercise', url: 'https://www.zxxk.com/soft/50885813.html', source: '学科网', note: '作品ID 50885813，聚焦表面积综合计算、切拼与包装类题型' }
  ],
  '数学|人教版|5|长方体和正方体体积': [
    { slot: 'worksheet-50548802', externalWorkId: '50548802', title: '长方体和正方体体积·同步作业直链', type: 'example', url: 'https://www.zxxk.com/soft/50548802.html', source: '学科网', note: '作品ID 50548802，覆盖体积公式、体积单位、底面积乘高和实际应用' },
    { slot: 'unit-test-56451772', externalWorkId: '56451772', title: '长方体和正方体体积·单元卷直链', type: 'exercise', url: 'https://www.zxxk.com/soft/56451772.html', source: '学科网', note: '作品ID 56451772，适合承接体积、容积、排水法和综合应用训练' }
  ],
  '数学|人教版|6|按比例分配': [
    { slot: 'ratio-53981627', externalWorkId: '53981627', title: '按比例分配·比专题讲义直链', type: 'example', url: 'https://www.zxxk.com/soft/53981627.html', source: '学科网', note: '作品ID 53981627，覆盖比的意义、化简比与按比分配的核心题型' },
    { slot: 'proportion-50577805', externalWorkId: '50577805', title: '按比例分配·比例考点题集直链', type: 'exercise', url: 'https://www.zxxk.com/soft/50577805.html', source: '学科网', note: '作品ID 50577805，含按比例分配与比例实际应用类高频考点' }
  ],
  '数学|人教版|6|比例尺的意义': [
    { slot: 'lesson-50350358', externalWorkId: '50350358', title: '比例尺的意义·教案直链', type: 'article', url: 'https://www.zxxk.com/soft/50350358.html', source: '学科网', note: '作品ID 50350358，适合梳理图上距离、实际距离和比例尺的关系' },
    { slot: 'examples-50577805', externalWorkId: '50577805', title: '比例尺的意义·十三考点题集直链', type: 'example', url: 'https://www.zxxk.com/soft/50577805.html', source: '学科网', note: '作品ID 50577805，覆盖比例尺认识、改写、求图上距离和求实际距离' }
  ],
  '数学|人教版|6|按比例尺求实际距离和图上距离': [
    { slot: 'review-50787758', externalWorkId: '50787758', title: '比例尺应用·考点突破直链', type: 'example', url: 'https://www.zxxk.com/soft/50787758.html', source: '学科网', note: '作品ID 50787758，适合补比例尺三类基本关系式和应用题' },
    { slot: 'workbook-51763041', externalWorkId: '51763041', title: '比例尺应用·作业本直链', type: 'exercise', url: 'https://www.zxxk.com/soft/51763041.html', source: '学科网', note: '作品ID 51763041，适合回练比例尺求实际距离、图上距离与图形放缩' }
  ],
  '数学|人教版|6|圆柱和圆锥初步认识': [
    { slot: 'unit-paper-57393213', externalWorkId: '57393213', title: '圆柱与圆锥·单元自测直链', type: 'exercise', url: 'https://www.zxxk.com/soft/57393213.html', source: '学科网', note: '作品ID 57393213，覆盖圆柱圆锥特征、辨析和单元综合检测' },
    { slot: 'cone-56012738', externalWorkId: '56012738', title: '圆柱和圆锥·圆锥讲义直链', type: 'article', url: 'https://www.zxxk.com/soft/56012738.html', source: '学科网', note: '作品ID 56012738，适合补圆锥特征、各部分名称和与圆柱对比认知' }
  ],
  '数学|人教版|6|圆柱表面积和体积': [
    { slot: 'unit-review-50549129', externalWorkId: '50549129', title: '圆柱表面积和体积·单元梳理直链', type: 'example', url: 'https://www.zxxk.com/soft/50549129.html', source: '学科网', note: '作品ID 50549129，覆盖圆柱表面积、体积和圆锥综合运用' },
    { slot: 'drill-51270586', externalWorkId: '51270586', title: '圆柱表面积和体积·专项训练直链', type: 'exercise', url: 'https://www.zxxk.com/soft/51270586.html', source: '学科网', note: '作品ID 51270586，适合做圆柱圆锥期中复习讲练测' },
    { slot: 'application-56589825', externalWorkId: '56589825', title: '圆柱表面积和体积·应用题专项直链', type: 'exercise', url: 'https://www.zxxk.com/soft/56589825.html', source: '学科网', note: '作品ID 56589825，聚焦无盖容器、排水法、包装等圆柱实际应用题' }
  ],
  '数学|人教版|6|圆锥体积公式理解': [
    { slot: 'cone-56012738', externalWorkId: '56012738', title: '圆锥体积公式理解·讲义直链', type: 'article', url: 'https://www.zxxk.com/soft/56012738.html', source: '学科网', note: '作品ID 56012738，聚焦圆锥体积公式推导、等底等高关系与变形应用' },
    { slot: 'unit-review-50549129', externalWorkId: '50549129', title: '圆锥体积公式理解·单元作业直链', type: 'exercise', url: 'https://www.zxxk.com/soft/50549129.html', source: '学科网', note: '作品ID 50549129，适合回练圆锥体积和等底等高圆柱对比问题' },
    { slot: 'application-57665491', externalWorkId: '57665491', title: '圆锥体积公式理解·综合应用直链', type: 'exercise', url: 'https://www.zxxk.com/soft/57665491.html', source: '学科网', note: '作品ID 57665491，适合承接圆柱圆锥综合应用和跨情境建模题' }
  ],
  '数学|人教版|6|综合运用比例和方程解决问题': [
    { slot: 'ratio-sheet-50787758', externalWorkId: '50787758', title: '综合运用比例和方程·考点突破直链', type: 'example', url: 'https://www.zxxk.com/soft/50787758.html', source: '学科网', note: '作品ID 50787758，适合连接比例、解比例、按比例分配与应用题建模' },
    { slot: 'unit-review-56370339', externalWorkId: '56370339', title: '综合运用比例和方程·单元复习课件直链', type: 'article', url: 'https://www.zxxk.com/soft/56370339.html', source: '学科网', note: '作品ID 56370339，适合做比例单元综合方法复盘和错因回顾' },
    { slot: 'unit-sheet-50806222', externalWorkId: '50806222', title: '综合运用比例和方程·单元总结讲义直链', type: 'article', url: 'https://www.zxxk.com/soft/50806222.html', source: '学科网', note: '作品ID 50806222，适合补比例意义、解比例、正反比例和比例尺的综合复盘' },
    { slot: 'unit-test-57223845', externalWorkId: '57223845', title: '综合运用比例和方程·单元自测直链', type: 'exercise', url: 'https://www.zxxk.com/soft/57223845.html', source: '学科网', note: '作品ID 57223845，适合承接比例综合复习后的闭环检测' }
  ],
  '数学|人教版|6|毕业总复习中的知识关联': [
    { slot: 'review-selftest-58945270', externalWorkId: '58945270', title: '毕业总复习中的知识关联·毕业学业水平自测直链', type: 'exercise', url: 'https://www.zxxk.com/soft/58945270.html', source: '学科网', note: '作品ID 58945270，适合做毕业总复习综合串联和整册知识迁移检测' },
    { slot: 'review-paper-57845571', externalWorkId: '57845571', title: '毕业总复习中的知识关联·期末质量检测直链', type: 'exercise', url: 'https://www.zxxk.com/soft/57845571.html', source: '学科网', note: '作品ID 57845571，覆盖比例尺、百分数、圆柱圆锥等跨模块综合问题' },
    { slot: 'review-thinking-58412380', externalWorkId: '58412380', title: '毕业总复习中的知识关联·数学思想方法专项直链', type: 'article', url: 'https://www.zxxk.com/soft/58412380.html', source: '学科网', note: '作品ID 58412380，适合沉淀总复习阶段的知识联结、方法迁移和综合实践策略' }
  ]
};

function buildSearchUrl(query) {
  return `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
}

function buildResources(topic) {
  const grade = `${topic.grade}年级`;
  const subject = SUBJECT_SEARCH_LABELS[topic.subject] || topic.subject;
  return [
    {
      resourceId: `res_${topic.id}_fallback_example`,
      resourceGroupKey: `fallback-${topic.subjectCode || topic.subject}-${topic.grade}`,
      resourceUnitKey: null,
      title: `${topic.name}典型例题`,
      type: 'example',
      url: buildSearchUrl(`${grade} ${subject} ${topic.name} 典型例题 讲解`),
      source: 'Bing',
      note: '聚合检索入口，可快速定位同主题典型例题'
    },
    {
      resourceId: `res_${topic.id}_fallback_exercise`,
      resourceGroupKey: `fallback-${topic.subjectCode || topic.subject}-${topic.grade}`,
      resourceUnitKey: null,
      title: `${topic.name}练习题`,
      type: 'exercise',
      url: buildSearchUrl(`${grade} ${subject} ${topic.name} 练习题 下载`),
      source: 'Bing',
      note: '聚合检索入口，可快速定位同步练习与题单'
    }
  ];
}

function buildCuratedTopicResources(topic) {
  const key = `${topic.subject}|${topic.textbook || '统编通用'}|${topic.grade}|${topic.name}`;
  const items = CURATED_TOPIC_RESOURCE_CATALOG[key];
  if (!items) return null;
  return items.map((item, index) => ({
    resourceId: `res_${topic.id}_curated_${index + 1}_${item.slot}`,
    resourceGroupKey: `curated-${topic.subjectCode || topic.subject}-${topic.grade}`,
    resourceUnitKey: `${topic.textbook || '统编通用'}-${topic.grade}年级-${topic.term || '全年'}-${topic.name}`,
    externalWorkId: item.externalWorkId,
    title: `${topic.name}·${item.title}`,
    type: item.type,
    url: item.url,
    source: item.source,
    note: item.note
  }));
}

function normalizeResources(topic) {
  const seen = new Set();
  const curated = buildCuratedTopicResources(topic);
  const resources = curated || (Array.isArray(topic.resources) && topic.resources.length ? topic.resources : buildResources(topic));
  const normalized = [];
  for (const resource of resources) {
    const resourceId = resource.resourceId || `res_${topic.id}_${normalized.length + 1}`;
    const dedupeKey = `${resourceId}|${resource.url}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    normalized.push({
      ...resource,
      resourceId,
      resourceGroupKey: resource.resourceGroupKey || null,
      resourceUnitKey: resource.resourceUnitKey || null,
      externalWorkId: resource.externalWorkId || null
    });
  }
  return normalized;
}

const topicFiles = readdirSync(DATA)
  .filter(name => /^topics-.*\.json$/i.test(name) && name !== 'topics.json')
  .filter(name => {
    if (name === 'topics-others-g2.json' && readdirSync(DATA).includes('topics-others-g1-g6.json')) return false;
    return true;
  })
  .sort();

if (!topicFiles.length) {
  console.error('❌ 未找到可合并的 topics-*.json 文件');
  process.exit(1);
}

const datasets = topicFiles.map(name => ({
  file: name,
  data: JSON.parse(readFileSync(resolve(DATA, name), 'utf8'))
}));

const all = datasets.flatMap(item => item.data.topics).map(topic => ({
  ...topic,
  resources: normalizeResources(topic)
}));

// 检查ID唯一性
const ids = new Set();
const dup = [];
for (const t of all) {
  if (ids.has(t.id)) dup.push(t.id);
  ids.add(t.id);
}
if (dup.length) { console.error('❌ 重复ID:', dup); process.exit(1); }

// 统计
const bySubject = {};
const byDomain = {};
const byTerm = {};
const byType = {};
const byGrade = {};
all.forEach(t => {
  bySubject[t.subject] = (bySubject[t.subject]||0) + 1;
  byDomain[t.domain] = (byDomain[t.domain]||0) + 1;
  if (t.term) byTerm[t.subject+'/'+t.term] = (byTerm[t.subject+'/'+t.term]||0)+1;
  byType[t.typeLabel] = (byType[t.typeLabel]||0) + 1;
  byGrade[t.grade] = (byGrade[t.grade]||0) + 1;
});

console.log('=== 知识点统计 ===');
console.log('总知识点:', all.length);
console.log('\n按学科:');
Object.entries(bySubject).sort((a,b)=>b[1]-a[1]).forEach(([s,c])=>console.log(' ', s+':', c));
console.log('\n按类型:');
Object.entries(byType).forEach(([t,c])=>console.log(' ', t+':', c));
console.log('\n按年级:');
Object.entries(byGrade).sort((a,b)=>Number(a[0])-Number(b[0])).forEach(([g,c])=>console.log(' ', `${g}年级:`, c));
console.log('\n来源文件:');
topicFiles.forEach(name => console.log(' ', name));

// 写 topics.json
const topicsJson = {
  version: 'v0.8-expanded',
  generatedAt: new Date().toISOString(),
  grades: [...new Set(all.map(t => t.grade))].sort((a,b)=>a-b),
  note: '扩展版本：1-6年级主干 + 数学逐单元资源组键/资源ID/外部作品ID直链 + 英语分技能rubric + 多学科结构化评价 + 可视化性能优化',
  topicCount: all.length,
  topics: all
};

const topicsStr = JSON.stringify(topicsJson, null, 2);
writeFileSync(resolve(DATA, 'topics.json'), topicsStr, 'utf8');

// 计算 SHA-256 (用于 manifest)
const topicsHash = createHash('sha256').update(topicsStr).digest('hex');
console.log('\ntopics.json SHA256:', topicsHash);
console.log('topics.json 大小:', (topicsStr.length/1024).toFixed(1), 'KB');

export { all as topics, ids as topicIds };
