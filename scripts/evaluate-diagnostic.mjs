#!/usr/bin/env node
/**
 * evaluate-diagnostic.mjs
 * 诊断引擎离线基准：BKT 掌握度概率校准 + 三态差距检测评测
 *
 * 借鉴：
 *   - CAHLR/pyBKT：贝叶斯知识追踪（BKT）的 EM 参数学习与后验更新口径
 *     https://github.com/CAHLR/pyBKT
 *   - pyKT：知识追踪模型的统一基准与「序列 -> 掌握概率」评测口径
 *     https://github.com/pykt-team/pykt-toolkit
 *   - DeepTutor：把「掌握概率」与「形成性评估」放在同一闭环里校准
 *
 * 本项目现状：
 *   - diagnostic-engine.js 采用「已掌握/学习中/未开始」三态 + 全量先修回溯，
 *     输出确定性的 gap 列表，没有概率校准与离线评测。
 *   - 本脚本不改动运行时，只提供离线基准与校准报告。
 *
 * 数据来源与诚实声明：
 *   - 项目没有真实作答日志（学习数据只写 localStorage，规则禁止远端上报）。
 *   - 因此默认模式使用**确定性模拟队列**（种子可复现），用于检验引擎的
 *     结构推理能力与题目难度标定，**不能**代表真实学生表现。
 *   - 提供 --logs <file.json> 时，可对真实导出日志做 BKT 参数学习（仅参数，
 *     不评估准确率，因为真实日志没有 ground truth）。
 *
 * 日志格式（--logs）：
 *   [{ "topicId": "ct_SX3X019", "correct": 1, "difficulty": "basic", "ts": 1730000000000 }, ...]
 *
 * 用法：
 *   node scripts/evaluate-diagnostic.mjs                     # 模拟队列基准
 *   node scripts/evaluate-diagnostic.mjs --students=3000 --seed=42
 *   node scripts/evaluate-diagnostic.mjs --logs=path/to/logs.json
 *   node scripts/evaluate-diagnostic.mjs --json --out=reports/diagnostic-benchmark.json
 *
 * 退出码：0=通过；1=有告警（如题目引用缺失、标定偏差大）
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATA = resolve(ROOT, 'data');
const load = name => JSON.parse(readFileSync(resolve(DATA, name), 'utf8'));

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const outArg = args.find(a => a.startsWith('--out='));
const logsArg = args.find(a => a.startsWith('--logs='));
const studentsArg = args.find(a => a.startsWith('--students='));
const seedArg = args.find(a => a.startsWith('--seed='));
const STUDENTS = Number((studentsArg || '').split('=')[1]) || 3000;
const SEED = Number((seedArg || '').split('=')[1]) || 42;

// ---------- 可复现随机数 ----------
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(SEED);
function randn() { // Box-Muller
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
const sigmoid = x => 1 / (1 + Math.exp(-x));

// ---------- 数据 ----------
const topicsJson = load('topics.json');
const depsJson = load('dependencies.json');
const questionsJson = load('diagnostic-questions.json');

const topics = topicsJson.topics || [];
const topicById = new Map(topics.map(t => [t.id, t]));
const questions = questionsJson.questions || [];

// ---------- 引用完整性 ----------
const qTopicIds = [...new Set(questions.map(q => q.topicId))];
const orphanQuestionTopics = qTopicIds.filter(id => !topicById.has(id));

// ---------- 图索引 ----------
const incoming = new Map(); // topicId -> [{source, strength, reason}]
const outgoing = new Map();
for (const t of topics) { incoming.set(t.id, []); outgoing.set(t.id, []); }
for (const d of depsJson.dependencies || []) {
  if (!incoming.has(d.topicId)) incoming.set(d.topicId, []);
  if (!outgoing.has(d.prerequisiteId)) outgoing.set(d.prerequisiteId, []);
  incoming.get(d.topicId).push({ source: d.prerequisiteId, strength: d.strength, reason: d.reason || '' });
  outgoing.get(d.prerequisiteId).push({ target: d.topicId, strength: d.strength, reason: d.reason || '' });
}
// 拓扑序（Kahn）
const topo = [];
{
  const indeg = new Map(topics.map(t => [t.id, 0]));
  for (const d of depsJson.dependencies || []) indeg.set(d.topicId, (indeg.get(d.topicId) || 0) + 1);
  const q = topics.filter(t => indeg.get(t.id) === 0).map(t => t.id);
  while (q.length) {
    const cur = q.shift();
    topo.push(cur);
    for (const e of outgoing.get(cur) || []) {
      indeg.set(e.target, indeg.get(e.target) - 1);
      if (indeg.get(e.target) === 0) q.push(e.target);
    }
  }
}

function ancestorsOf(id) {
  const seen = new Set();
  const stack = [...(incoming.get(id) || []).map(e => e.source)];
  while (stack.length) {
    const cur = stack.pop();
    if (seen.has(cur)) continue;
    seen.add(cur);
    for (const e of incoming.get(cur) || []) stack.push(e.source);
  }
  return seen;
}

// ---------- 诊断引擎（复用运行时实现） ----------
globalThis.window = globalThis;
await import(pathToFileURL(resolve(ROOT, 'shared/js/components/diagnostic-engine.js')).href);
const DiagnosticEngine = globalThis.CNPT.DiagnosticEngine;
const indices = {
  topicMap: topicById,
  getIncoming: id => incoming.get(id) || [],
  getOutgoing: id => outgoing.get(id) || [],
  getTopicMap: () => topicById
};
const engine = new DiagnosticEngine({ topics: topicsJson, deps: depsJson }, indices);

// ---------- BKT（标准单知识点模型 + EM） ----------
// 状态: L ∈ {0,1}；参数 pInit, pLearn, pGuess, pSlip
function bktForwardBackward(seq, p) {
  const T = seq.length;
  const alpha = new Array(T + 1).fill(0).map(() => [0, 0]);
  const beta = new Array(T + 1).fill(0).map(() => [1, 1]);
  alpha[0][1] = p.pInit; alpha[0][0] = 1 - p.pInit;
  for (let t = 1; t <= T; t++) {
    const o = seq[t - 1];
    for (const l of [0, 1]) {
      const prev1 = alpha[t - 1][1] * (l === 1 ? (1 - p.pLearn) : p.pLearn);
      const prev0 = alpha[t - 1][0] * (l === 1 ? p.pLearn : (1 - p.pLearn));
      const emit = l === 1 ? (o ? 1 - p.pSlip : p.pSlip) : (o ? p.pGuess : 1 - p.pGuess);
      alpha[t][l] = (prev1 + prev0) * emit;
    }
  }
  for (let t = T - 1; t >= 0; t--) {
    const o = seq[t]; // observation at t+1
    for (const l of [0, 1]) {
      let s = 0;
      for (const nl of [0, 1]) {
        const trans = l === 1 ? (nl === 1 ? (1 - p.pLearn) : p.pLearn) : (nl === 1 ? p.pLearn : (1 - p.pLearn));
        const emit = nl === 1 ? (o ? 1 - p.pSlip : p.pSlip) : (o ? p.pGuess : 1 - p.pGuess);
        s += trans * emit * beta[t + 1][nl];
      }
      beta[t][l] = s;
    }
  }
  return { alpha, beta };
}

function bktPosterior(seq, p) {
  let l1 = p.pInit;
  for (const o of seq) {
    const emit = o ? (l1 * (1 - p.pSlip) + (1 - l1) * p.pGuess) : (l1 * p.pSlip + (1 - l1) * (1 - p.pGuess));
    const pred = l1 * (1 - p.pLearn) + (1 - l1) * p.pLearn;
    const like = o ? (pred * (1 - p.pSlip)) : (pred * p.pSlip);
    l1 = emit > 0 ? clamp(like / emit, 0, 1) : 0;
  }
  return l1;
}

function fitBKT(sequences, iters = 30) {
  // 初始值（社区常用初值）
  let p = { pInit: 0.3, pLearn: 0.1, pGuess: 0.2, pSlip: 0.1 };
  const eps = 1e-9;
  for (let it = 0; it < iters; it++) {
    let sInit = 0, nInit = 0;
    let sLearn = 0, nLearn = 0;
    let sGuess = 0, nGuess = 0;
    let sSlip = 0, nSlip = 0;
    for (const seq of sequences) {
      if (!seq.length) continue;
      const { alpha, beta } = bktForwardBackward(seq, p);
      const scale = alpha[seq.length][0] + alpha[seq.length][1] + eps;
      // gamma_t = P(L_t | obs)
      let prevGamma1 = alpha[0][1] / (alpha[0][0] + alpha[0][1] + eps);
      // t=0 初始状态统计
      sInit += prevGamma1; nInit += 1;
      for (let t = 1; t <= seq.length; t++) {
        const o = seq[t - 1];
        const g1 = alpha[t][1] * beta[t][1] / (scale + eps);
        const g0 = 1 - g1;
        // 转移统计：P(L_{t-1}=1, L_t=1)
        const trans11 = alpha[t - 1][1] * (1 - p.pLearn) * (o ? (1 - p.pSlip) : p.pSlip) * beta[t][1] / (scale + eps);
        sLearn += trans11; nLearn += 1;
        // 发射统计
        if (o) { sGuess += g0; nGuess += 1; }
        else { sSlip += g1; nSlip += 1; }
        prevGamma1 = g1;
      }
    }
    const next = {
      pInit: nInit ? clamp(sInit / nInit, 0.01, 0.99) : p.pInit,
      pLearn: nLearn ? clamp(sLearn / nLearn, 0.001, 0.5) : p.pLearn,
      pGuess: nGuess ? clamp(sGuess / nGuess, 0.01, 0.6) : p.pGuess,
      pSlip: nSlip ? clamp(sSlip / nSlip, 0.01, 0.6) : p.pSlip
    };
    const delta = Math.abs(next.pInit - p.pInit) + Math.abs(next.pLearn - p.pLearn) +
      Math.abs(next.pGuess - p.pGuess) + Math.abs(next.pSlip - p.pSlip);
    p = next;
    if (delta < 1e-6) break;
  }
  return p;
}
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

// ---------- AUC（Mann-Whitney） ----------
function auc(scores, labels) {
  // 升序排名：分越低秩越小，正例得分越高则 AUC 越接近 1
  const pairs = scores.map((s, i) => [s, labels[i]]).sort((a, b) => a[0] - b[0]);
  let pos = 0, neg = 0, rankSum = 0;
  let i = 0;
  const n = pairs.length;
  while (i < n) {
    let j = i;
    while (j < n && pairs[j][0] === pairs[i][0]) j++;
    const rank = (i + 1 + j) / 2; // 平均秩（1-based）
    for (let k = i; k < j; k++) if (pairs[k][1] === 1) { pos++; rankSum += rank; }
    i = j;
  }
  neg = n - pos;
  if (!pos || !neg) return 0.5;
  return (rankSum - pos * (pos + 1) / 2) / (pos * neg);
}

// ---------- 模拟队列 ----------
function simulateCohort(nStudents) {
  const subjectAbility = {};
  const students = [];
  for (let s = 0; s < nStudents; s++) {
    const ability = {};
    for (const t of topics) {
      if (!ability[t.subject]) ability[t.subject] = randn() * 1.0;
    }
    // 逐个知识点采样掌握状态（按拓扑序，前置影响后续）
    const mastered = new Set();
    for (const id of topo) {
      const t = topicById.get(id);
      if (!t) continue;
      const inc = incoming.get(id) || [];
      const parentMastered = inc.filter(e => mastered.has(e.source));
      const hardParents = inc.filter(e => e.strength === 'hard');
      const hardOk = hardParents.length ? hardParents.filter(e => mastered.has(e.source)).length / hardParents.length : 1;
      const base = -0.6 + 0.35 * (t.grade - 3.5) + 0.9 * hardOk + ability[t.subject] * 0.6;
      const p = sigmoid(base);
      if (rng() < p) mastered.add(id);
    }
    students.push({ id: s, ability, mastered });
  }
  return students;
}

// 生成某知识点下某学生的作答序列
const DIFF_BUCKET = {
  basic: { guess: 0.18, slip: 0.10 },
  medium: { guess: 0.24, slip: 0.16 },
  hard: { guess: 0.30, slip: 0.22 }
};
function respond(topicId, student) {
  const qs = questions.filter(q => q.topicId === topicId);
  if (!qs.length) return [];
  const mastery = student.mastered.has(topicId) ? 1 : 0;
  return qs.map(q => {
    const d = DIFF_BUCKET[q.difficulty] || DIFF_BUCKET.medium;
    const p = d.guess + (1 - d.guess - d.slip) * mastery;
    return rng() < p ? 1 : 0;
  });
}

// ---------- 评测 1：引擎 gap 检测 ----------
// 两个口径：
//   structural = 已知掌握列表完全准确时，引擎应 100% 还原「未掌握的前置闭包」
//   noisy      = 已知掌握列表带观测噪声（漏标/过标）时，引擎的鲁棒性
function evalEngine(students, noise) {
  const targets = [...new Set(questions.map(q => q.topicId))].filter(id => topicById.has(id) && (incoming.get(id) || []).length > 0);
  let tp = 0, fp = 0, fn = 0;
  const perSubject = {};
  const LIMIT = 40; // 每学科抽样目标，避免 O(学生×目标) 过大
  const bySubject = {};
  for (const id of targets) (bySubject[topicById.get(id).subject] ||= []).push(id);
  const picked = Object.values(bySubject).flatMap(arr => arr.slice(0, LIMIT));
  const sampledStudents = students.filter((_, i) => i % Math.max(1, Math.floor(students.length / 600)) === 0);

  for (const stu of sampledStudents) {
    // 观测到的掌握列表：漏标（已掌握但没勾）+ 过标（未掌握但勾了）
    const observed = new Set();
    if (noise > 0) {
      for (const id of stu.mastered) if (rng() >= noise) observed.add(id);
      const overRate = noise * 0.5;
      for (const t of topics) if (!stu.mastered.has(t.id) && rng() < overRate) observed.add(t.id);
    } else {
      for (const id of stu.mastered) observed.add(id);
    }

    for (const targetId of picked) {
      const truthSet = new Set([...ancestorsOf(targetId)].filter(id => !stu.mastered.has(id)));
      const report = engine.diagnose({ targetTopicId: targetId, knownMastered: [...observed] });
      const pred = new Set((report.gaps || []).map(g => g.id));
      const subj = topicById.get(targetId).subject;
      const stat = perSubject[subj] ||= { tp: 0, fp: 0, fn: 0 };
      for (const id of pred) { if (truthSet.has(id)) { tp++; stat.tp++; } else { fp++; stat.fp++; } }
      for (const id of truthSet) if (!pred.has(id)) { fn++; stat.fn++; }
    }
  }
  const pr = tp / Math.max(1, tp + fp), rc = tp / Math.max(1, tp + fn);
  return {
    noise,
    targets: picked.length,
    students: sampledStudents.length,
    precision: round4(pr), recall: round4(rc), f1: round4(2 * pr * rc / Math.max(1e-9, pr + rc)),
    tp, fp, fn,
    perSubject: Object.fromEntries(Object.entries(perSubject).map(([k, v]) => {
      const p = v.tp / Math.max(1, v.tp + v.fp), r = v.tp / Math.max(1, v.tp + v.fn);
      return [k, { precision: round4(p), recall: round4(r), f1: round4(2 * p * r / Math.max(1e-9, p + r)), n: v.tp + v.fn }];
    }))
  };
}

// ---------- 评测 2：BKT 掌握概率校准 ----------
function evalBKT(students) {
  const byTopic = new Map();
  for (const q of questions) {
    if (!byTopic.has(q.topicId)) byTopic.set(q.topicId, []);
    byTopic.get(q.topicId).push(q);
  }
  const usable = [...byTopic.keys()].filter(id => topicById.has(id));
  const sampled = usable.filter((_, i) => i % Math.max(1, Math.floor(usable.length / 60)) === 0);

  let aucSum = 0, maeSum = 0, n = 0;
  // 题目区分度：同一难度档下，已掌握 vs 未掌握学生的通过率差
  const perDifficulty = {
    basic: { n: 0, correct: 0, mN: 0, mCorrect: 0, uN: 0, uCorrect: 0 },
    medium: { n: 0, correct: 0, mN: 0, mCorrect: 0, uN: 0, uCorrect: 0 },
    hard: { n: 0, correct: 0, mN: 0, mCorrect: 0, uN: 0, uCorrect: 0 }
  };
  const fitted = [];
  for (const topicId of sampled) {
    const seqs = [];
    const truths = [];
    for (const stu of students) {
      const seq = respond(topicId, stu);
      if (!seq.length) continue;
      seqs.push(seq);
      truths.push(stu.mastered.has(topicId) ? 1 : 0);
    }
    if (seqs.length < 50) continue;
    const p = fitBKT(seqs);
    fitted.push({ topicId, name: topicById.get(topicId).name, ...p });
    const scores = [];
    for (let i = 0; i < seqs.length; i++) {
      scores.push(bktPosterior(seqs[i], p));
      maeSum += Math.abs(scores[i] - truths[i]);
    }
    aucSum += auc(scores, truths);
    n += seqs.length;
    for (const q of byTopic.get(topicId)) {
      const bucket = perDifficulty[q.difficulty] || perDifficulty.medium;
      const d = DIFF_BUCKET[q.difficulty] || DIFF_BUCKET.medium;
      for (const stu of students) {
        const mastery = stu.mastered.has(topicId) ? 1 : 0;
        const ok = rng() < d.guess + (1 - d.guess - d.slip) * mastery ? 1 : 0;
        bucket.n++; bucket.correct += ok;
        if (mastery) { bucket.mN++; bucket.mCorrect += ok; }
        else { bucket.uN++; bucket.uCorrect += ok; }
      }
    }
  }
  const k = Math.max(1, fitted.length);
  return {
    topics: fitted.length,
    observations: n,
    auc: round4(aucSum / k),
    mae: round4(maeSum / Math.max(1, n)),
    fittedParams: fitted.slice(0, 10),
    difficultyCalibration: Object.fromEntries(Object.entries(perDifficulty).map(([d, v]) => {
      const pr = x => x.n ? round4(x.correct / x.n) : null;
      const pm = v.mN ? round4(v.mCorrect / v.mN) : null;
      const pu = v.uN ? round4(v.uCorrect / v.uN) : null;
      return [d, {
        n: v.n,
        passRate: pr(v),
        passRateMastered: pm,
        passRateUnmastered: pu,
        discrimination: (pm != null && pu != null) ? round4(pm - pu) : null
      }];
    }))
  };
}

function round4(x) { return Math.round(x * 10000) / 10000; }

// ---------- 真实日志模式：仅做 BKT 参数学习 ----------
function runLogsMode(file) {
  const logs = JSON.parse(readFileSync(resolve(process.cwd(), file), 'utf8'));
  const arr = Array.isArray(logs) ? logs : (logs.logs || []);
  const byTopic = new Map();
  for (const l of arr) {
    if (!l || !l.topicId || typeof l.correct !== 'number') continue;
    if (!byTopic.has(l.topicId)) byTopic.set(l.topicId, []);
    byTopic.get(l.topicId).push(l.correct ? 1 : 0);
  }
  const fitted = [];
  for (const [topicId, seq] of byTopic) {
    if (seq.length < 10) continue;
    const p = fitBKT([seq]); // 单序列也能学出粗参数
    fitted.push({ topicId, name: (topicById.get(topicId) || {}).name || null, ...p, samples: seq.length });
  }
  return { mode: 'real-logs', file, logs: arr.length, topicsFitted: fitted.length, fittedParams: fitted };
}

// ---------- 主流程 ----------
const report = {
  generatedAt: new Date().toISOString(),
  mode: logsArg ? 'real-logs' : 'synthetic',
  seed: SEED,
  students: STUDENTS,
  inputs: {
    topics: topics.length,
    edges: (depsJson.dependencies || []).length,
    questions: questions.length,
    questionTopics: qTopicIds.length
  },
  referential: {
    orphanQuestionTopics: orphanQuestionTopics.length,
    orphanSamples: orphanQuestionTopics.slice(0, 12),
    note: '诊断题引用的 topicId 在 topics.json 中不存在，题目无法参与诊断闭环'
  },
  note: '默认模式为确定性模拟队列（种子可复现），仅用于结构完备性、观测噪声鲁棒性与题目区分度的离线自检，不代表真实学生表现。',
  engine: null,
  bkt: null
};

if (logsArg) {
  report.bkt = runLogsMode(logsArg.split('=')[1]);
} else {
  const students = simulateCohort(STUDENTS);
  report.engine = {
    structural: evalEngine(students, 0),
    noisy: evalEngine(students, 0.08)
  };
  report.bkt = evalBKT(students);
}

const warns = [];
if (report.referential.orphanQuestionTopics > 0) {
  warns.push(`诊断题引用缺失：${report.referential.orphanQuestionTopics} 个 topicId 不在 topics.json（${questions.length} 题中）`);
}
if (report.engine && report.engine.structural.f1 < 0.999) {
  warns.push(`引擎结构完备性 F1=${report.engine.structural.f1}（<0.999，说明先修闭包与引擎输出不一致）`);
}
if (report.engine && report.engine.noisy.f1 < 0.85) {
  warns.push(`引擎噪声鲁棒性 F1=${report.engine.noisy.f1}（<0.85，模拟口径）`);
}
report.warns = warns;

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  CN-Primary-Taxonomy 诊断引擎离线基准        ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log(`模式: ${report.mode}${report.mode === 'synthetic' ? `（种子 ${SEED}，${STUDENTS} 名学生，模拟口径）` : ''}`);
  console.log(`数据: 知识点 ${report.inputs.topics} · 依赖 ${report.inputs.edges} · 诊断题 ${report.inputs.questions}（覆盖 ${report.inputs.questionTopics} 个主题）`);
  console.log(`引用完整性: 缺失 topicId ${report.referential.orphanQuestionTopics} 个`);
  if (report.engine) {
    const e = report.engine;
    console.log(`\n【引擎 gap 检测】目标 ${e.structural.targets} · 学生 ${e.structural.students}`);
    console.log(`  结构完备性(无噪声): P ${e.structural.precision} · R ${e.structural.recall} · F1 ${e.structural.f1}`);
    console.log(`  噪声鲁棒性(8%漏标/4%过标): P ${e.noisy.precision} · R ${e.noisy.recall} · F1 ${e.noisy.f1}`);
    console.log(`  分学科(噪声口径): ` + Object.entries(e.noisy.perSubject).map(([k, v]) => `${k} F1=${v.f1}`).join(' / '));
  }
  if (report.bkt && report.bkt.auc !== undefined) {
    console.log(`\n【BKT 掌握概率校准】主题 ${report.bkt.topics} · 观测 ${report.bkt.observations}`);
    console.log(`  AUC ${report.bkt.auc} · MAE ${report.bkt.mae}`);
    console.log(`  题目区分度: ` + Object.entries(report.bkt.difficultyCalibration).map(([k, v]) =>
      `${k} 通过率=${v.passRate}（掌握 ${v.passRateMastered} / 未掌握 ${v.passRateUnmastered}，区分度 ${v.discrimination}）`).join(' / '));
  }
  if (warns.length) {
    console.log(`\n⚠ ${warns.length} 条告警:`);
    warns.forEach(w => console.log(`  - ${w}`));
  } else {
    console.log('\n✓ 无告警。');
  }
}

if (outArg) {
  const outPath = resolve(process.cwd(), outArg.split('=')[1]);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
  if (!asJson) console.log(`\n✓ 报告已写入 ${outPath}`);
}

const strict = args.includes('--strict');
const fatal = (report.engine && report.engine.structural.f1 < 0.999) ? 2 : 0;
process.exit(fatal || ((strict && warns.length) ? 1 : 0));
