#!/usr/bin/env node
/**
 * audit-diagnostic-questions.mjs
 * 诊断题引用完整性审计：找出引用了不存在 topicId 的「孤儿题」，并给出保守处置建议。
 *
 * 背景：diagnostic-questions.json 中部分题目引用的 topicId 不在 topics.json（历史编号差异）。
 *       这些题无法参与诊断闭环（evaluate-diagnostic 只统计，不自动修）。
 *
 * 设计原则（保守）：
 *   - **不自动改题**：只产出可审计报告与「高置信候选映射建议」，供人工确认；
 *   - 确认后可用 `--apply=<map.json>` 应用映射（map: { "旧topicId": "新topicId" }），
 *     应用前自动备份 diagnostic-questions.json；
 *   - 无法可靠映射的孤儿题保持原样（不删除、不伪造）。
 *
 * 用法：
 *   node scripts/audit-diagnostic-questions.mjs                 # 审计并写 reports/diagnostic-question-audit.json
 *   node scripts/audit-diagnostic-questions.mjs --no-write
 *   node scripts/audit-diagnostic-questions.mjs --apply=map.json # 应用人工确认的映射
 */
import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATA = resolve(ROOT, 'data');
const QUESTIONS = resolve(DATA, 'diagnostic-questions.json');
const TOPICS = resolve(DATA, 'topics.json');
const OUT = resolve(ROOT, 'reports', 'diagnostic-question-audit.json');

const args = process.argv.slice(2);
const NO_WRITE = args.includes('--no-write');
const applyArg = args.find(a => a.startsWith('--apply='));

function bigrams(s) {
  const t = String(s || '').replace(/\s+/g, '');
  const out = new Set();
  for (let i = 0; i < t.length - 1; i++) out.add(t.slice(i, i + 2));
  return out;
}

function parseId(id) {
  const m = /^ct_([A-Z]+)(\d)([SX])(\d+)$/.exec(id);
  if (!m) return null;
  return { subj: m[1], grade: Number(m[2]), band: m[3] };
}

function main() {
  const questionsJson = JSON.parse(readFileSync(QUESTIONS, 'utf8'));
  const topicsJson = JSON.parse(readFileSync(TOPICS, 'utf8'));
  const topics = topicsJson.topics || [];
  const ids = new Set(topics.map(t => t.id));
  const byId = new Map(topics.map(t => [t.id, t]));

  // 应用人工映射
  if (applyArg) {
    const mapFile = applyArg.slice('--apply='.length);
    const rawMap = JSON.parse(readFileSync(resolve(ROOT, mapFile), 'utf8'));
    const map = rawMap.map || rawMap;
    const keys = Object.keys(map || {});
    if (!keys.length) { console.error('✗ 映射文件为空'); process.exit(2); }
    for (const [from, to] of Object.entries(map)) {
      if (!ids.has(to)) { console.error(`✗ 映射目标不存在: ${from} -> ${to}`); process.exit(2); }
    }
    mkdirSync(dirname(OUT), { recursive: true });
    const backup = resolve(dirname(OUT), `diagnostic-questions.backup-${Date.now()}.json`);
    copyFileSync(QUESTIONS, backup);
    let applied = 0, skipped = 0;
    for (const q of questionsJson.questions) {
      if (map[q.topicId]) { q.topicId = map[q.topicId]; applied++; }
      else skipped++;
    }
    questionsJson.note = (questionsJson.note ? questionsJson.note + '；' : '') + `已应用人工映射 ${applied} 题（备份 ${backup}）`;
    writeFileSync(QUESTIONS, JSON.stringify(questionsJson, null, 2), 'utf8');
    console.log(`✅ 已应用映射: ${applied} 题改写，${skipped} 题未命中（保持原样）；备份 ${backup}`);
    return;
  }

  // 审计
  const byOrphan = new Map();
  for (const q of questionsJson.questions) {
    if (!ids.has(q.topicId)) {
      if (!byOrphan.has(q.topicId)) byOrphan.set(q.topicId, []);
      byOrphan.get(q.topicId).push(q);
    }
  }

  // 同学科同学段候选池
  const pool = new Map();
  for (const t of topics) {
    const p = parseId(t.id);
    if (!p) continue;
    const key = p.subj + '|' + p.grade;
    if (!pool.has(key)) pool.set(key, []);
    pool.get(key).push(t);
  }

  function score(qs, t) {
    const text = qs.map(q => q.question + ' ' + (q.explanation || '')).join(' ');
    const tb = bigrams(text);
    const nameB = bigrams(t.name);
    const descB = bigrams(t.description || '');
    let inter = 0;
    for (const b of nameB) if (tb.has(b)) inter++;
    let dinter = 0;
    for (const b of descB) if (tb.has(b)) dinter++;
    const nameCov = nameB.size ? inter / nameB.size : 0;
    const descCov = descB.size ? dinter / descB.size : 0;
    return +(nameCov * 1.6 + descCov * 0.6).toFixed(3);
  }

  const orphans = [];
  const conf = { high: 0, mid: 0, low: 0 };
  for (const [oid, qs] of byOrphan) {
    const p = parseId(oid);
    const list = p ? (pool.get(p.subj + '|' + p.grade) || []) : [];
    const scored = list.map(t => ({ id: t.id, name: t.name, score: score(qs, t) }))
      .sort((a, b) => b.score - a.score);
    const top = scored[0] || null;
    const second = scored[1] || null;
    const margin = top && second ? +(top.score - second.score).toFixed(3) : 0;
    let level = 'low';
    if (top && top.score > 0.5 && margin > 0.1) level = 'high';
    else if (top && top.score > 0.25) level = 'mid';
    conf[level]++;
    orphans.push({
      topicId: oid,
      subject: p ? p.subj : null,
      grade: p ? p.grade : null,
      questionCount: qs.length,
      confidence: level,
      suggest: top ? { id: top.id, name: top.name, score: top.score, margin } : null
    });
  }
  orphans.sort((a, b) => (b.questionCount - a.questionCount) || a.topicId.localeCompare(b.topicId));

  const report = {
    generatedAt: new Date().toISOString(),
    questions: questionsJson.questions.length,
    orphanTopics: orphans.length,
    orphanQuestions: orphans.reduce((s, o) => s + o.questionCount, 0),
    confidence: conf,
    note: '保守处置：不自动改题。high 候选建议人工确认后通过 --apply=map.json 应用；mid/low 建议补题或保留。',
    orphans
  };

  console.log('=== 诊断题引用审计 ===');
  console.log(`题目总数: ${report.questions} · 孤儿 topicId: ${report.orphanTopics} 个 · 孤儿题: ${report.orphanQuestions}`);
  console.log(`候选置信度: high ${conf.high} · mid ${conf.mid} · low ${conf.low}`);
  console.log('high 候选（建议人工确认）:');
  orphans.filter(o => o.confidence === 'high').slice(0, 20).forEach(o => {
    console.log(`  ${o.topicId} (${o.questionCount}题) → ${o.suggest.id} ${o.suggest.name} [${o.suggest.score}]`);
  });

  if (NO_WRITE) { console.log('--no-write：未写报告'); return; }
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\n✅ 已写入 ${OUT}`);
  console.log('提示：确认 high 候选后，构造 { "旧id": "新id" } 映射文件并用 --apply=map.json 应用。');
}

main();
