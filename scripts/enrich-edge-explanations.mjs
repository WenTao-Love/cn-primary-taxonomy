#!/usr/bin/env node
/**
 * enrich-edge-explanations.mjs
 * 为依赖边补充「可解释」字段：category（教学前提类型）+ explain（结构化解释）
 *
 * 借鉴：
 *   - Graphify-Labs/graphify：知识图谱的每条边都附自然语言解释（edge explanation）
 *   - 本项目规则：可解释信息必须可溯源，不做无依据的编造
 *
 * 口径与诚实声明：
 *   - category 由 reason 文本的**规则化关键词分类**得到，不是人工逐条标注；
 *   - explain 由「前置知识点 + 目标知识点 + category + 原 reason」拼装，
 *     不引入原 reason 之外的新事实；
 *   - 因此两个字段默认标记 explainSource = 'rule-derived'；
 *   - 人工精修的边从 data/edge-explanations-curated.json 加载，标记 explainSource = 'curated'，
 *     优先级高于规则派生。
 *
 * 幂等：可重复运行；已存在的 category/explain 以本表为准（覆盖）。
 * 运行时机：generate-dependencies.mjs 之后（会重写 dependencies.json）。
 *
 * 用法：
 *   node scripts/enrich-edge-explanations.mjs
 *   node scripts/enrich-edge-explanations.mjs --dry-run
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(__dirname, '..', 'data');
const DRY_RUN = process.argv.includes('--dry-run');

// 教学前提类型（按优先级匹配，先命中先归类）
const CATEGORY_RULES = [
  ['计算能力', /计算|口算|笔算|竖式|进位|退位|验算|简便|运算|算式|列式|加减乘除|凑整|估算/],
  ['空间观念', /图形|位置|方向|面积|体积|周长|对称|平移|旋转|展开|长方体|正方体|圆柱|圆锥|观察物体/],
  ['量感与单位', /单位|换算|时间|人民币|重量|质量|长度|分数|小数|百分数|比例|测量|度量|刻度/],
  ['阅读表达', /朗读|背诵|概括|复述|表达|写作|口语|倾听|阅读理解|课文|阅读|分段|归纳/],
  ['工具使用', /字典|量角器|圆规|直尺|计算器|表格|计数器|算盘|学具|教具|实验/],
  ['常识经验', /生活|经验|常识|安全|健康|规则|习惯|合作|劳动|购物|日常/],
  ['概念理解', /意义|概念|认识|理解|含义|定义|表示|性质|特征|规律|关系|读写|数的认识|认读|辨义/],
  ['技能操作', /画|折|剪|拼|操作|作图|制作|观察|记录|动手|数位|笔顺|字形|会认|会写|识字|写字|积累|使用|查|写|测量|量/]
];

const LABELS = { ...Object.fromEntries(CATEGORY_RULES.map(([k]) => [k, k])), '其他': '其他' };

function classify(reason, prereqName, topicName) {
  const text = `${reason || ''} ${prereqName || ''} ${topicName || ''}`;
  for (const [cat, re] of CATEGORY_RULES) {
    if (re.test(text)) return cat;
  }
  return '其他';
}

function main() {
  const depsPath = resolve(DATA, 'dependencies.json');
  const topicsPath = resolve(DATA, 'topics.json');
  const depsJson = JSON.parse(readFileSync(depsPath, 'utf8'));
  const topicsJson = JSON.parse(readFileSync(topicsPath, 'utf8'));
  const byId = new Map((topicsJson.topics || []).map(t => [t.id, t]));

  const dist = {};
  let missingReason = 0;
  let curatedHits = 0;
  const curatedMiss = [];
  const samples = {};

  // 人工精修覆盖表（可选）
  const curatedPath = resolve(DATA, 'edge-explanations-curated.json');
  let overrides = {};
  if (existsSync(curatedPath)) {
    try {
      overrides = JSON.parse(readFileSync(curatedPath, 'utf8')).overrides || {};
    } catch { overrides = {}; }
  }

  for (const d of depsJson.dependencies) {
    const reason = typeof d.reason === 'string' ? d.reason.trim() : '';
    if (!reason) missingReason++;
    const prereq = byId.get(d.prerequisiteId);
    const topic = byId.get(d.topicId);
    const key = `${d.prerequisiteId}->${d.topicId}`;
    const curated = overrides[key];
    if (curated) {
      d.category = curated.category;
      d.explain = curated.explain;
      d.explainSource = 'curated';
      curatedHits++;
    } else {
      const category = classify(reason, prereq?.name, topic?.name);
      d.category = category;
      d.explain = `「${topic?.name || d.topicId}」依赖「${prereq?.name || d.prerequisiteId}」：${LABELS[category]}前提。${reason || '（原因待补）'}`;
      d.explainSource = 'rule-derived';
    }
    dist[d.category] = (dist[d.category] || 0) + 1;
    if (!samples[d.category]) samples[d.category] = d.explain;
  }

  // 校验 curated 覆盖表中的 key 是否都能命中（避免精修了已不存在的边）
  const edgeKeys = new Set(depsJson.dependencies.map(d => `${d.prerequisiteId}->${d.topicId}`));
  for (const k of Object.keys(overrides)) {
    if (!edgeKeys.has(k)) curatedMiss.push(k);
  }

  console.log('=== enrich-edge-explanations ===');
  console.log(`边数: ${depsJson.dependencies.length} · 缺 reason: ${missingReason} · curated 精修命中: ${curatedHits}`);
  if (curatedMiss.length) {
    console.log(`⚠ curated 覆盖表中未命中的 key: ${curatedMiss.length} 个（边可能已不存在）`);
    curatedMiss.slice(0, 5).forEach(k => console.log(`   - ${k}`));
  }
  console.log('category 分布:');
  Object.entries(dist).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
    console.log(`  ${k.padEnd(6, '　')} ${String(v).padStart(4)}  ${samples[k]}`);
  });

  if (DRY_RUN) { console.log('--dry-run：未写回'); return; }

  depsJson.generatedAt = new Date().toISOString();
  depsJson.note = (depsJson.note ? depsJson.note + '；' : '') + `category/explain 由规则化分类生成（rule-derived ${depsJson.dependencies.length - curatedHits} / curated ${curatedHits}）`;
  writeFileSync(depsPath, JSON.stringify(depsJson, null, 2), 'utf8');
  console.log('✅ 已写回 data/dependencies.json');
}

main();
