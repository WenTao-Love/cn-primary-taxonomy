#!/usr/bin/env node
/**
 * validate.mjs
 * 数据完整性校验（参考 Marble validate.mjs 设计）
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
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
const SUB_CODES = {YW:'语文',SX:'数学',YY:'英语',KX:'科学',DF:'道德与法治',LD:'劳动',TY:'体育与健康',MS:'美术',YYP:'音乐',XX:'信息科技',AI:'AI素养',ZH:'综合实践'};
const GRADES = new Set([1,2,3,4,5,6]);
const TERMS = new Set(['上','下','全']);
const GRADE_BANDS = new Set(['L','M','H']);
const STRENGTHS = new Set(['hard','soft']);
const RESOURCE_TYPES = new Set(['example','exercise','worksheet','video','article']);

const topicIds = new Set();
const idDup = new Set();
const subjects = {};
const typeCounts = {};
for (const t of topics.topics) {
  if (topicIds.has(t.id)) idDup.add(t.id);
  topicIds.add(t.id);
  check(typeof t.id === 'string' && /^ct_[A-Z]{2,3}[0-6][SXQ][0-9]{3}$/.test(t.id), `ID格式错: ${t.id}`);
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
  if (t.resources !== undefined) {
    check(Array.isArray(t.resources), `resources不是数组: ${t.id}`);
    for (const r of t.resources || []) {
      check(typeof r.title === 'string' && r.title.length >= 1, `resource.title缺失: ${t.id}`);
      check(RESOURCE_TYPES.has(r.type), `resource.type非法: ${t.id} -> ${r.type}`);
      check(typeof r.url === 'string' && /^https?:\/\//.test(r.url), `resource.url非法: ${t.id}`);
    }
  }
  subjects[t.subject] = (subjects[t.subject]||0)+1;
  typeCounts[t.typeLabel] = (typeCounts[t.typeLabel]||0)+1;
}
check(idDup.size === 0, `重复ID: ${[...idDup].join(',')}`);

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
for (const d of deps.dependencies) {
  check(topicIds.has(d.topicId), `dep topicId不存在: ${d.topicId}`);
  check(topicIds.has(d.prerequisiteId), `dep prereq不存在: ${d.prerequisiteId}`);
  check(d.topicId !== d.prerequisiteId, `自依赖: ${d.topicId}`);
  check(STRENGTHS.has(d.strength), `strength错: ${d.strength}`);
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

// 报告
console.log('╔══════════════════════════════════════════╗');
console.log('║  CN-Primary-Taxonomy 数据校验报告        ║');
console.log('╚══════════════════════════════════════════╝');
console.log(`版本: ${topics.version}`);
console.log(`知识点: ${topics.topicCount}`);
console.log(`依赖边: ${deps.edgeCount}（强依赖${deps.dependencies.filter(d=>d.strength==='hard').length}/弱依赖${deps.dependencies.filter(d=>d.strength==='soft').length}）`);
console.log(`课标: ${stds.curriculumCount}个文件, ${stds.curricula.reduce((s,c)=>s+c.topics.length,0)}个条目`);
console.log(`领域概览: ${clusters.clusterCount}个`);
console.log(`起始知识点(无前置): ${roots}个`);
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
