#!/usr/bin/env node
/**
 * validate.mjs
 * 数据完整性校验（参考 Marble validate.mjs 设计）
 */
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(__dirname, '..', 'data');
const load = name => JSON.parse(readFileSync(resolve(DATA, name), 'utf8'));

const errors = [];
const warn = [];
const check = (cond, msg) => { if (!cond) errors.push(msg); };

const topics = load('topics.json');
const deps = load('dependencies.json');
const stds = load('curriculum-standards.json');
const clusters = load('clusters.json');

// 计数一致性
check(topics.topicCount === topics.topics.length, `topicCount 不匹配: 声明${topics.topicCount} 实际${topics.topics.length}`);
check(deps.edgeCount === deps.dependencies.length, `edgeCount 不匹配: 声明${deps.edgeCount} 实际${deps.dependencies.length}`);
check(stds.curriculumCount === stds.curricula.length, `curriculumCount 不匹配`);
check(clusters.clusterCount === clusters.clusters.length, `clusterCount 不匹配`);

// 类型枚举
const TYPES = new Set(['CONCEPTUAL','PROCEDURAL','REPRESENTATIONAL','LANGUAGE','META']);
const TYPE_LABELS = {CONCEPTUAL:'概念',PROCEDURAL:'技能',REPRESENTATIONAL:'表征',LANGUAGE:'语言',META:'元认知'};
const SUBJECTS = new Set(['语文','数学','英语','科学','道德与法治','劳动','体育与健康','美术','音乐','信息科技','AI素养','综合实践']);
const SUB_CODES = {YW:'语文',SX:'数学',SXB:'数学',SXS:'数学',YY:'英语',YRP:'英语',YWF:'英语',YYL:'英语',KX:'科学',DF:'道德与法治',LD:'劳动',TY:'体育与健康',MS:'美术',YYP:'音乐',XX:'信息科技',AI:'AI素养',ZH:'综合实践'};
const GRADES = new Set([1,2,3,4,5,6]);
const TERMS = new Set(['上','下','全']);
const GRADE_BANDS = new Set(['L','M','H']);
const STRENGTHS = new Set(['hard','soft']);
const RESOURCE_TYPES = new Set(['example','exercise','worksheet','video','article']);
const EDGE_CATEGORIES = new Set(['概念理解','技能操作','计算能力','空间观念','量感与单位','阅读表达','工具使用','常识经验','其他']);
const EDGE_EXPLAIN_SOURCES = new Set(['rule-derived','curated']);

const topicIds = new Set();
const idDup = new Set();
const subjects = {};
const typeCounts = {};
for (const t of topics.topics) {
  if (topicIds.has(t.id)) idDup.add(t.id);
  topicIds.add(t.id);
  check(typeof t.id === 'string' && /^ct_[A-Z]{2,4}[0-6][SXQ][0-9]{3}$/.test(t.id), `ID格式错: ${t.id}`);
  check(TYPES.has(t.type), `type错: ${t.id} -> ${t.type}`);
  check(TYPE_LABELS[t.type] === t.typeLabel, `typeLabel不匹配: ${t.id} type=${t.type} label=${t.typeLabel}`);
  check(SUBJECTS.has(t.subject), `subject错: ${t.id} -> ${t.subject}`);
  check(SUB_CODES[t.subjectCode] === t.subject, `subjectCode错: ${t.id} code=${t.subjectCode} subject=${t.subject}`);
  check(GRADES.has(t.grade), `grade错: ${t.id} -> ${t.grade}`);
  check(TERMS.has(t.term) || !t.term, `term错: ${t.id} -> ${t.term}`);
  check(GRADE_BANDS.has(t.gradeBand), `gradeBand错: ${t.id} -> ${t.gradeBand}`);
  check(typeof t.description === 'string' && t.description.length >= 5, `description过短: ${t.id}`);
  check(Array.isArray(t.evidence) && t.evidence.length >= 1, `evidence为空: ${t.id}`);
  check(t.difficulty >=1 && t.difficulty <=5, `difficulty超范围: ${t.id}`);
  if (t.parentTopicId !== undefined && t.parentTopicId !== null) {
    check(typeof t.parentTopicId === 'string', `parentTopicId类型错误: ${t.id}`);
  }
  if (t.subnodeType !== undefined && t.subnodeType !== null) {
    check(typeof t.subnodeType === 'string' && t.subnodeType.length >= 1, `subnodeType非法: ${t.id}`);
  }
  if (t.pageRange !== undefined && t.pageRange !== null) {
    check(typeof t.pageRange === 'string' && t.pageRange.length >= 2, `pageRange非法: ${t.id}`);
  }
  if (t.practiceChain !== undefined) {
    check(Array.isArray(t.practiceChain), `practiceChain不是数组: ${t.id}`);
  }
  if (t.assessmentTasks !== undefined) {
    check(Array.isArray(t.assessmentTasks), `assessmentTasks不是数组: ${t.id}`);
  }
  if (t.skillRubric !== undefined && t.skillRubric !== null) {
    check(typeof t.skillRubric === 'object' && !Array.isArray(t.skillRubric), `skillRubric不是对象: ${t.id}`);
    for (const key of ['listening','speaking','reading','writing']) {
      if (t.skillRubric[key] !== undefined) {
        check(Array.isArray(t.skillRubric[key]), `skillRubric.${key}不是数组: ${t.id}`);
      }
    }
  }
  if (t.evaluationRubric !== undefined) {
    check(Array.isArray(t.evaluationRubric), `evaluationRubric不是数组: ${t.id}`);
    for (const item of t.evaluationRubric) {
      check(item && typeof item.dimension === 'string', `evaluationRubric.dimension非法: ${t.id}`);
      check(Array.isArray(item.indicators), `evaluationRubric.indicators不是数组: ${t.id}`);
    }
  }
  if (t.resources !== undefined) {
    check(Array.isArray(t.resources), `resources不是数组: ${t.id}`);
    for (const r of t.resources || []) {
      if (r.resourceId !== undefined && r.resourceId !== null) {
        check(typeof r.resourceId === 'string' && r.resourceId.length >= 6, `resource.resourceId非法: ${t.id}`);
      }
      if (r.resourceGroupKey !== undefined && r.resourceGroupKey !== null) {
        check(typeof r.resourceGroupKey === 'string' && r.resourceGroupKey.length >= 4, `resource.resourceGroupKey非法: ${t.id}`);
      }
      if (r.resourceUnitKey !== undefined && r.resourceUnitKey !== null) {
        check(typeof r.resourceUnitKey === 'string' && r.resourceUnitKey.length >= 4, `resource.resourceUnitKey非法: ${t.id}`);
      }
      if (r.externalWorkId !== undefined && r.externalWorkId !== null) {
        check(typeof r.externalWorkId === 'string' && /^[0-9]{6,}$/.test(r.externalWorkId), `resource.externalWorkId非法: ${t.id}`);
      }
      check(typeof r.title === 'string' && r.title.length >= 1, `resource.title缺失: ${t.id}`);
      check(RESOURCE_TYPES.has(r.type), `resource.type非法: ${t.id} -> ${r.type}`);
      check(typeof r.url === 'string' && /^https?:\/\//.test(r.url), `resource.url非法: ${t.id}`);
    }
  }
  subjects[t.subject] = (subjects[t.subject]||0)+1;
  typeCounts[t.typeLabel] = (typeCounts[t.typeLabel]||0)+1;
}
check(idDup.size === 0, `重复ID: ${[...idDup].join(',')}`);
for (const t of topics.topics) {
  if (t.parentTopicId) check(topicIds.has(t.parentTopicId), `parentTopicId不存在: ${t.id} -> ${t.parentTopicId}`);
}

// 引用完整性
const stdKeys = new Set();
for (const c of stds.curricula) {
  check(c.topicCount === c.topics.length, `课标 ${c.slug} topicCount错`);
  for (const s of c.topics) {
    check(s.key === `${c.slug}:${s.code}` && /^[\w.-]+:[\w.-]+$/.test(s.key), `课标key格式错: ${s.key}`);
    if (stdKeys.has(s.key)) errors.push(`重复课标key: ${s.key}`);
    stdKeys.add(s.key);
  }
}

let dangling = 0;
const edgeKeys = new Set();
const dupEdges = [];
const REL_TYPES = new Set(['prerequisite', 'related', 'visual', 'experiment', 'assessment']);
for (const d of deps.dependencies) {
  check(topicIds.has(d.topicId), `dep topicId不存在: ${d.topicId}`);
  check(topicIds.has(d.prerequisiteId), `dep prereq不存在: ${d.prerequisiteId}`);
  check(d.topicId !== d.prerequisiteId, `自依赖: ${d.topicId}`);
  check(STRENGTHS.has(d.strength), `strength错: ${d.strength}`);
  if (d.relationType !== undefined) {
    check(REL_TYPES.has(d.relationType), `relationType错: ${d.relationType}`);
  }
  // 可解释边（category / explain / explainSource）
  check(EDGE_CATEGORIES.has(d.category), `category错或缺失: ${d.topicId} <- ${d.prerequisiteId} -> ${d.category}`);
  check(typeof d.explain === 'string' && d.explain.length >= 8, `explain过短: ${d.topicId} <- ${d.prerequisiteId}`);
  check(EDGE_EXPLAIN_SOURCES.has(d.explainSource), `explainSource错: ${d.explainSource}`);
  const ek = `${d.prerequisiteId} ${d.topicId}`;
  if (edgeKeys.has(ek)) dupEdges.push(ek);
  edgeKeys.add(ek);
}
if (dupEdges.length) errors.push(`重复边 ${dupEdges.length} 条: ${[...new Set(dupEdges)].slice(0, 3).join(' | ')}`);
const symPairs = [];
for (const d of deps.dependencies) {
  if (edgeKeys.has(`${d.topicId} ${d.prerequisiteId}`) && d.prerequisiteId < d.topicId) {
    symPairs.push(`${d.prerequisiteId} ⇄ ${d.topicId}`);
  }
}
if (symPairs.length) warn.push(`对称边对 ${symPairs.length} 组（A→B 且 B→A）: ${symPairs.slice(0, 3).join(' | ')}`);

// 可解释边覆盖率（rule-derived 由 enrich-edge-explanations.mjs 派生，curated 为人工精修）
const explainedEdges = deps.dependencies.filter(d => typeof d.explain === 'string' && d.explain.length >= 8);
const curatedEdges = deps.dependencies.filter(d => d.explainSource === 'curated');
if (explainedEdges.length < deps.dependencies.length) {
  warn.push(`可解释边覆盖不足: ${explainedEdges.length}/${deps.dependencies.length}`);
}
const categoryDist = {};
for (const d of deps.dependencies) categoryDist[d.category || '缺失'] = (categoryDist[d.category || '缺失'] || 0) + 1;

// curated 精修表校验（可选文件，人工精修的边必须可溯源且命中真实边）
const curatedPath = resolve(DATA, 'edge-explanations-curated.json');
if (existsSync(curatedPath)) {
  try {
    const curated = JSON.parse(readFileSync(curatedPath, 'utf8'));
    const overrides = curated.overrides || {};
    const edgeKeys = new Set(deps.dependencies.map(d => `${d.prerequisiteId}->${d.topicId}`));
    let curatedBad = 0;
    for (const [k, v] of Object.entries(overrides)) {
      if (!edgeKeys.has(k)) { warn.push(`curated 覆盖表 key 无对应边: ${k}`); curatedBad++; continue; }
      if (!EDGE_CATEGORIES.has(v.category)) { errors.push(`curated category 非法: ${k} -> ${v.category}`); curatedBad++; }
      if (typeof v.explain !== 'string' || v.explain.length < 8) { errors.push(`curated explain 过短: ${k}`); curatedBad++; }
    }
    if (curatedBad === 0) console.log(`curated 精修表: ${Object.keys(overrides).length} 条，全部命中且合法`);
  } catch (e) {
    warn.push(`curated 覆盖表解析失败: ${e.message}`);
  }
}
for (const t of topics.topics) {
  for (const key of t.standards) {
    if (!stdKeys.has(key)) {
      dangling++;
      if (dangling <= 5) errors.push(`topic ${t.id} 引用未知标准: ${key}`);
    }
  }
}
if (dangling > 5) errors.push(`...还有${dangling-5}个标准引用未找到`);

// DAG 环检测
const inDeg = {}; const g = {};
for (const t of topics.topics) { inDeg[t.id] = 0; g[t.id] = []; }
for (const d of deps.dependencies) { g[d.prerequisiteId].push(d.topicId); inDeg[d.topicId]++; }
const q = Object.entries(inDeg).filter(([,v])=>v===0).map(([k])=>k);
const roots = q.length;
let done = 0;
const qi = [...q];
while (qi.length) {
  const c = qi.shift(); done++;
  for (const n of g[c]) { inDeg[n]--; if (inDeg[n]===0) qi.push(n); }
}
check(done === topics.topics.length, `DAG存在环! 只拓扑排序${done}/${topics.topics.length}`);

// ========== 增强字段校验 (enhanced fields) ==========
// 数据源：data/topics-enhanced-fields-full.json（AI 生成初稿，覆盖率须 100%）
let enhanced = null;
try {
  enhanced = load('topics-enhanced-fields-full.json');
} catch (e) {
  warn.push(`增强字段文件缺失或无法解析: ${e.message}`);
}

let enhancedCount = 0;
let enhancedQuizCount = 0;
if (enhanced && Array.isArray(enhanced.enhancedTopics)) {
  const enhIds = new Set();
  const dupEnh = new Set();
  for (const e of enhanced.enhancedTopics) {
    enhancedCount++;
    if (enhIds.has(e.id)) dupEnh.add(e.id);
    enhIds.add(e.id);
    check(typeof e.id === 'string' && topicIds.has(e.id), `增强字段ID不存在于topics: ${e.id}`);
    check(typeof e.oneLiner === 'string' && e.oneLiner.length >= 4 && e.oneLiner.length <= 120,
      `oneLiner长度非法: ${e.id} (${e.oneLiner?.length ?? '缺失'})`);

    const pg = e.parentGuide;
    check(pg && typeof pg === 'object', `parentGuide缺失: ${e.id}`);
    if (pg) {
      for (const k of ['quickExplanation', 'dailyExample', 'commonParentMistake', 'encouragement']) {
        check(typeof pg[k] === 'string' && pg[k].length >= (k === 'encouragement' ? 2 : 4),
          `parentGuide.${k}非法: ${e.id}`);
      }
    }

    const tg = e.teacherGuide;
    check(tg && typeof tg === 'object', `teacherGuide缺失: ${e.id}`);
    if (tg) {
      for (const k of ['classroomActivity', 'keyQuestion', 'visualAid', 'transition']) {
        check(typeof tg[k] === 'string' && tg[k].length >= (k === 'visualAid' ? 2 : 4),
          `teacherGuide.${k}非法: ${e.id}`);
      }
    }

    check(Array.isArray(e.quizQuestions) && e.quizQuestions.length >= 1, `quizQuestions为空: ${e.id}`);
    (e.quizQuestions || []).forEach((q, qi) => {
      enhancedQuizCount++;
      const where = `${e.id}.quizQuestions[${qi}]`;
      check(typeof q.question === 'string' && q.question.length >= 4, `题目过短: ${where}`);
      check(['choice', 'judge', 'fill'].includes(q.type), `题型非法: ${where} -> ${q.type}`);
      check(typeof q.explanation === 'string' && q.explanation.length >= 2, `解析过短: ${where}`);
      if (q.type === 'choice') {
        check(Array.isArray(q.options) && q.options.length >= 2 && q.options.length <= 6,
          `选项数量非法: ${where}`);
        check(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < (q.options?.length ?? 0),
          `正确项下标越界: ${where} answer=${q.answer}`);
      } else if (q.type === 'judge') {
        check(typeof q.answer === 'boolean', `判断题答案须为布尔: ${where}`);
      } else if (q.type === 'fill') {
        check(typeof q.answer === 'string' && q.answer.length >= 1, `填空题答案非法: ${where}`);
      }
    });
  }
  check(dupEnh.size === 0, `增强字段重复ID: ${[...dupEnh].slice(0, 5).join(',')}`);
  check(enhIds.size === topics.topics.length,
    `增强字段覆盖率不足: ${enhIds.size}/${topics.topics.length}（要求 100%）`);
}

// 报告
console.log('╔══════════════════════════════════════════╗');
console.log('║  CN-Primary-Taxonomy 数据校验报告        ║');
console.log('╚══════════════════════════════════════════╝');
console.log(`版本: ${topics.version}`);
console.log(`知识点: ${topics.topicCount}`);
console.log(`依赖边: ${deps.edgeCount}（强依赖${deps.dependencies.filter(d=>d.strength==='hard').length}/弱依赖${deps.dependencies.filter(d=>d.strength==='soft').length}）`);
console.log(`课标: ${stds.curriculumCount}个文件, ${stds.curricula.reduce((s,c)=>s+c.topics.length,0)}个条目`);
console.log(`领域概览: ${clusters.clusterCount}个`);
console.log(`起始知识点(无前置): ${roots}个 · 重复边: ${dupEdges.length} · 对称边对: ${symPairs.length}`);
console.log(`可解释边: ${explainedEdges.length}/${deps.edgeCount}（规则派生 ${explainedEdges.length - curatedEdges.length} / 人工 curated ${curatedEdges.length}）`);
console.log(`边类型分布: ${Object.entries(categoryDist).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k} ${v}`).join(' · ')}`);
console.log(`增强字段: ${enhancedCount}条覆盖 / ${enhancedQuizCount}道随堂小题${enhancedCount ? `（覆盖率 ${enhancedCount}/${topics.topics.length}）` : '（未加载）'}`);
if (warn.length) {
  console.log(`\n⚠ ${warn.length} 条告警:`);
  warn.slice(0, 10).forEach(w => console.log('  -', w));
}
console.log('');
console.log('按学科分布:');
Object.entries(subjects).sort((a,b)=>b[1]-a[1]).forEach(([s,c])=>console.log(`  ${s.padEnd(8)}: ${c}`));
console.log('按类型分布:');
Object.entries(typeCounts).forEach(([t,c])=>console.log(`  ${t.padEnd(4)}: ${c}`));

if (errors.length) {
  console.error(`\n✗ 发现 ${errors.length} 个问题:`);
  errors.slice(0,20).forEach(e => console.error('  -', e));
  process.exit(1);
} else {
  console.log(`\n✓ 校验通过! 所有引用有效,DAG无环。`);
}
