#!/usr/bin/env node
/**
 * calibrate-fsrs.mjs
 * FSRS 参数校准（数据驱动）
 *
 * 用途：用真实/导出的复习日志（reviewLog）拟合 FSRS-4 的 17 个权重，
 *       生成 data/fsrs-params.json（构建时注入为 window.__CNPT_FSRS_PARAMS__）。
 *
 * 用法：
 *   node scripts/calibrate-fsrs.mjs <input.json> [--out data/fsrs-params.json] [--iters 1500]
 *
 * 输入格式（二选一）：
 *   1) fsrs-engine.export() 的结果：{ version, cards, reviewLog: [...], ... }
 *   2) 直接的 reviewLog 数组：[{ topicId, isCorrect, isIndependent, confidence, timestamp }, ...]
 *
 * 评分映射与 fsrs-engine.js 保持一致：
 *   答错=1(Again) / 提示后答对=2(Hard) / 独立答对(信心≥75)=4(Easy) / 独立答对=3(Good)
 *
 * 目标函数：对每次「非首次」复习，用当前稳定性 S 计算可提取性 R 作为答对概率，
 *           最小化交叉熵（log loss）。优化方式为随机扰动 + 逐步收缩。
 *
 * 样本要求：≥ 50 条非首次复习、覆盖 ≥ 5 个知识点；不足则拒绝并提示先积累数据。
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// 加载调度内核（IIFE，挂到 globalThis.CNPT）
await import('../shared/js/components/fsrs-scheduler.js');
const SCHED_LIB = globalThis.CNPT.fsrsScheduler;
const { createScheduler, DAY_MS } = SCHED_LIB;

const args = process.argv.slice(2);
const inputPath = args.find(a => !a.startsWith('--'));
const outArg = args.find(a => a.startsWith('--out='));
const itersArg = args.find(a => a.startsWith('--iters='));
const OUT = outArg ? resolve(process.cwd(), outArg.split('=')[1]) : resolve(ROOT, 'data', 'fsrs-params.json');
const ITERS = itersArg ? Math.max(200, parseInt(itersArg.split('=')[1], 10) || 1500) : 1500;

function fail(msg, code = 1) {
  console.error(`✗ ${msg}`);
  process.exit(code);
}

if (!inputPath) fail('缺少输入文件。用法: node scripts/calibrate-fsrs.mjs <input.json> [--out=...]');
if (!existsSync(inputPath)) fail(`输入文件不存在: ${inputPath}`);

let raw;
try {
  raw = JSON.parse(readFileSync(inputPath, 'utf8'));
} catch (e) {
  fail(`输入 JSON 解析失败: ${e.message}`);
}
const reviewLog = Array.isArray(raw) ? raw : (Array.isArray(raw.reviewLog) ? raw.reviewLog : null);
if (!reviewLog) fail('未找到 reviewLog 数组（支持 export() 结果或直接数组）');

// ---------- 评分映射（与 fsrs-engine.js 一致） ----------
function toRating(r) {
  const correct = !!r.isCorrect;
  const independent = r.isIndependent !== false;
  const confidence = typeof r.confidence === 'number' ? r.confidence : 50;
  if (!correct) return 1;
  if (!independent) return 2;
  return confidence >= 75 ? 4 : 3;
}

// ---------- 重建每个知识点的复习序列 ----------
const byTopic = new Map();
let skipped = 0;
for (const r of reviewLog) {
  if (!r || typeof r.topicId !== 'string' || typeof r.timestamp !== 'number') { skipped++; continue; }
  if (!byTopic.has(r.topicId)) byTopic.set(r.topicId, []);
  byTopic.get(r.topicId).push({
    ts: r.timestamp,
    rating: toRating(r),
    correct: !!r.isCorrect
  });
}
const sequences = [];
for (const [, arr] of byTopic) {
  arr.sort((a, b) => a.ts - b.ts);
  sequences.push(arr);
}
const nonFirst = sequences.reduce((n, s) => n + Math.max(0, s.length - 1), 0);
console.log(`\n输入: ${reviewLog.length} 条记录（跳过 ${skipped} 条无效）`);
console.log(`覆盖知识点: ${sequences.length} 个 · 非首次复习: ${nonFirst} 条`);

if (nonFirst < 50 || sequences.length < 5) {
  fail(`样本不足（需 ≥50 条非首次复习且 ≥5 个知识点，当前 ${nonFirst} 条 / ${sequences.length} 个）。\n` +
    `  说明：FSRS 参数校准需要真实作答数据；样本不足时继续使用 data/fsrs-params.json 中的默认参数。`, 2);
}

// ---------- 目标函数 ----------
function makeSimulator() {
  let sched = null;
  let wKey = null;
  return function loss(w) {
    const key = w.join(',');
    if (key !== wKey) { sched = createScheduler({ w, desiredRetention: 0.9 }); wKey = key; }
    let lossSum = 0, count = 0;
    for (const seq of sequences) {
      let card = null;
      for (const r of seq) {
        if (card && card.lastReview != null) {
          const elapsed = Math.max(0, (r.ts - card.lastReview) / DAY_MS);
          const R = sched.retrievability(elapsed, card.stability);
          const p = Math.min(0.999, Math.max(0.001, R));
          lossSum += -(r.correct ? Math.log(p) : Math.log(1 - p));
          count++;
        }
        const step = sched.step(card || {}, r.rating, r.ts);
        card = { stability: step.stability, difficulty: step.difficulty, lastReview: r.ts };
      }
    }
    return count ? lossSum / count : Infinity;
  };
}
const lossOf = makeSimulator();

// ---------- 参数边界 ----------
const BOUNDS = [
  [0.01, 30], [0.01, 30], [0.01, 30], [0.01, 30],     // w0..w3 初始稳定性
  [0.1, 10], [0.1, 10], [0.1, 10], [0.1, 10],          // w4..w7 初始难度
  [0.01, 5], [0.01, 1],                                 // w8 难度步长, w9 均值回归
  [0.01, 10], [0.01, 5], [0.01, 5], [0.01, 5],          // w10..w13 Again 稳定性
  [0.01, 5],                                            // w14 保留
  [0.1, 5], [0.1, 5]                                    // w15 Hard 惩罚, w16 Easy 加成
];

// ---------- 读取当前参数作为起点 ----------
let startW = SCHED_LIB.DEFAULT_W.slice();
let prevCalibrated = false;
if (existsSync(OUT)) {
  try {
    const cur = JSON.parse(readFileSync(OUT, 'utf8'));
    if (Array.isArray(cur.w) && cur.w.length === 17 && cur.w.every(x => typeof x === 'number' && isFinite(x))) {
      startW = cur.w.slice();
      prevCalibrated = !!cur.calibrated;
    }
  } catch { /* 忽略，用默认 */ }
}

const loss0 = lossOf(startW);
console.log(`\n起始参数: ${prevCalibrated ? '已校准参数' : '默认参数'} · log loss = ${loss0.toFixed(4)}`);

// ---------- 随机扰动 + 逐步收缩 ----------
let gaussSpare = null;
function gauss() {
  if (gaussSpare != null) { const v = gaussSpare; gaussSpare = null; return v; }
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const r = Math.sqrt(-2 * Math.log(u)), t = 2 * Math.PI * v;
  gaussSpare = r * Math.sin(t);
  return r * Math.cos(t);
}

let best = startW.slice();
let bestLoss = loss0;
let w = startW.slice();
let sigma = 0.15;
for (let iter = 0; iter < ITERS; iter++) {
  const i = Math.floor(Math.random() * 17);
  const old = w[i];
  const scale = Math.max(Math.abs(old), 0.1);
  const [lo, hi] = BOUNDS[i];
  w[i] = Math.min(hi, Math.max(lo, old + gauss() * scale * sigma));
  const l = lossOf(w);
  if (l < bestLoss) { bestLoss = l; best = w.slice(); }
  else { w[i] = old; }
  if (iter % 300 === 299) sigma *= 0.8;
}

console.log(`优化完成: log loss ${loss0.toFixed(4)} → ${bestLoss.toFixed(4)}（迭代 ${ITERS} 次）`);

// ---------- 写回 ----------
const out = {
  version: 1,
  algorithm: 'FSRS-4 (17 weights) hybrid with learning steps',
  calibrated: true,
  calibratedAt: new Date().toISOString(),
  sampleSize: nonFirst,
  topics: sequences.length,
  desiredRetention: 0.9,
  logLoss: Math.round(bestLoss * 10000) / 10000,
  w: best.map(x => Math.round(x * 10000) / 10000),
  note: '由 scripts/calibrate-fsrs.mjs 基于真实作答日志拟合；构建时注入为 window.__CNPT_FSRS_PARAMS__。'
};
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n', 'utf8');

// 建议初始间隔（天）
const sched = createScheduler({ w: best, desiredRetention: 0.9 });
const names = ['Again', 'Hard', 'Good', 'Easy'];
console.log('\n拟合后初始稳定性（≈首次间隔天数）:');
names.forEach((n, i) => console.log(`  ${n.padEnd(5)}: S=${sched.initStability(i + 1).toFixed(2)} 天  D=${sched.initDifficulty(i + 1).toFixed(2)}`));
console.log(`\n✓ 已写入 ${OUT}`);
console.log('  下一步: node build.mjs --standalone 重新构建（参数会注入独立产物）');
