#!/usr/bin/env node
/*!
 * FSRS-6 升级评估：项目现有 FSRS-4（17 参数） vs 官方 FSRS-6（21 参数）
 *
 * 目的：在不动线上数据（nextReview 保持不变）的前提下，回答"要不要升级到 FSRS-6"。
 *
 * 公式来源（均已核实，非二手转述）：
 *   - FSRS-6 官方实现 open-spaced-repetition/fsrs-rs（src/model_v6.rs、src/inference_v6.rs、src/simulation.rs）
 *     · R(t) = (1 + FACTOR·t/S)^DECAY，DECAY = -w[20]，FACTOR = 0.9^(1/DECAY) - 1
 *     · I(S,R) = S/FACTOR·(R^(1/DECAY) - 1)
 *     · initStability = w[rating-1]；initDifficulty = w4 - exp(w5·(rating-1)) + 1
 *     · nextDifficulty = meanReversion(w7, initD(4), D + (10-D)/9·(-w6·(rating-3)))
 *     · 成功 S' = S·(exp(w8)·(11-D)·S^(-w9)·(exp((1-R)·w10)-1)·hardPenalty·easyBonus + 1)
 *     · 失败 S' = min(S/exp(w17·w18), w11·D^(-w12)·((S+1)^w13-1)·exp((1-R)·w14))
 *     · 短期（当天复习）S' = S·(rating≥2 ? max(1,sinc) : sinc)，sinc = exp(w17·(rating-3+w18))·S^(-w19)
 *     · 常量 S_MIN=0.0001, S_MAX=36500, D_MIN=1, D_MAX=10
 *   - FSRS-4（项目实现）见 shared/js/components/fsrs-scheduler.js
 *   - 17 → 21 参数迁移规则（官方 check_and_fill_parameters_fsrs6）：
 *       p[4] += 2·p[5]; p[5] = ln(3·p[5]+1)/3; p[6] += 0.5; p[17..19]=0; p[20]=0.5
 *
 * 用法：
 *   node scripts/evaluate-fsrs-v6.mjs            # 打印报告，并写 reports/fsrs-v6-evaluation.json
 *   node scripts/evaluate-fsrs-v6.mjs --json     # 只输出 JSON
 *   node scripts/evaluate-fsrs-v6.mjs --no-write # 不写文件
 * 退出码：0 正常
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PARAMS_FILE = resolve(ROOT, 'data', 'fsrs-params.json');
const OUT_FILE = resolve(ROOT, 'reports', 'fsrs-v6-evaluation.json');

const args = process.argv.slice(2);
const JSON_ONLY = args.includes('--json');
const NO_WRITE = args.includes('--no-write');

// ---------------- 常量 ----------------
const S_MIN = 0.0001, S_MAX = 36500, D_MIN = 1, D_MAX = 10;
const F4_DECAY = -0.5;
const F4_FACTOR = 19 / 81;               // ≈ 0.2346
const FSRS6_DEFAULT_W = [
  0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666,
  0.796, 1.4835, 0.0614, 0.2629, 1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658,
  0.1542                              // FSRS6_DEFAULT_DECAY
];
const FSRS5_DEFAULT_DECAY = 0.5;
const DESIRED_RETENTION = 0.9;

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

// ---------------- 参数装载 ----------------
function loadProjectW17() {
  if (!existsSync(PARAMS_FILE)) return null;
  try {
    const j = JSON.parse(readFileSync(PARAMS_FILE, 'utf8'));
    if (Array.isArray(j.w) && j.w.length === 17 && j.w.every(x => typeof x === 'number' && isFinite(x))) {
      return { w: j.w.slice(), calibrated: !!j.calibrated, desiredRetention: j.desiredRetention || DESIRED_RETENTION, note: j.note || null };
    }
  } catch { /* ignore */ }
  return null;
}

/** 官方 17 → 21 参数迁移 */
function migrate17to21(w17) {
  const p = w17.slice();
  p[4] = p[5] * 2 + p[4];
  p[5] = Math.log(p[5] * 3 + 1) / 3;
  p[6] = p[6] + 0.5;
  p.push(0, 0, 0, FSRS5_DEFAULT_DECAY);
  return p;
}

// ---------------- 模型实现 ----------------
function makeFsrs4(w) {
  const initS = rating => Math.max(w[rating - 1], 0.1);
  const initD = rating => clamp(w[4 + rating - 1], D_MIN, D_MAX);
  const nextD = (d, rating) => clamp(w[9] * initD(3) + (1 - w[9]) * (d - w[8] * (rating - 3)), D_MIN, D_MAX);
  const R = (t, S) => {
    if (!(S > 0)) return 0;
    if (!(t > 0)) return 1;
    return Math.pow(1 + F4_FACTOR * t / S, F4_DECAY);
  };
  const nextS = (S, D, rating, r) => {
    if (rating === 1) return Math.max(w[10] * Math.pow(D, -w[11]) * (Math.pow(S + 1, w[12]) - 1), 0.1);
    const hardPenalty = rating === 2 ? w[15] : 1;
    const easyBonus = rating === 4 ? w[16] : 1;
    const inc = 1 + Math.exp(w[8]) * (11 - D) * Math.pow(S, -w[9]) *
      (Math.exp(w[10] * (1 - r)) - 1) * hardPenalty * easyBonus;
    return Math.max(S * inc, 0.1);
  };
  const step = (S, D, rating, dt, isNew) => {
    if (isNew || !(S > 0)) return { S: initS(rating), D: initD(rating) };
    const r = R(dt, S);
    return { S: nextS(S, D, rating, r), D: nextD(D, rating) };
  };
  const interval = S => Math.max(1, Math.round(S / F4_FACTOR * (Math.pow(DESIRED_RETENTION, 1 / F4_DECAY) - 1)));
  return { name: 'FSRS-4(项目)', w, initS, initD, R, step, interval, params: { decay: F4_DECAY, factor: F4_FACTOR } };
}

function makeFsrs6(w) {
  const decay = -w[20];
  const factor = Math.pow(0.9, 1 / decay) - 1;
  const initS = rating => Math.max(w[rating - 1], S_MIN);
  const initD = rating => w[4] - Math.exp(w[5] * (rating - 1)) + 1;
  const R = (t, S) => {
    const s = Math.max(S, S_MIN);
    const tt = Math.max(0, Math.round(t));
    return Math.pow(tt / s * factor + 1, decay);
  };
  const succS = (S, r, D, rating) => {
    const hardPenalty = rating === 2 ? w[15] : 1;
    const easyBonus = rating === 4 ? w[16] : 1;
    const v = S * (Math.exp(w[8]) * (11 - D) * Math.pow(S, -w[9]) *
      (Math.exp((1 - r) * w[10]) - 1) * hardPenalty * easyBonus + 1);
    return clamp(v, S_MIN, S_MAX);
  };
  const failS = (S, r, D) => {
    const newSMin = S / Math.exp(w[17] * w[18]);
    const newS = w[11] * Math.pow(D, -w[12]) * (Math.pow(S + 1, w[13]) - 1) * Math.exp((1 - r) * w[14]);
    return clamp(Math.min(newS, newSMin), S_MIN, S_MAX);
  };
  const shortTermS = (S, rating) => {
    const sinc = Math.exp(w[17] * (rating - 3 + w[18])) * Math.pow(S, -w[19]);
    return clamp(S * (rating >= 2 ? Math.max(1, sinc) : sinc), S_MIN, S_MAX);
  };
  const nextD = (d, rating) => {
    const deltaD = -w[6] * (rating - 3);
    const newD = d + (10 - d) / 9 * deltaD;
    return clamp(w[7] * initD(4) + (1 - w[7]) * newD, D_MIN, D_MAX);
  };
  const step = (S, D, rating, dt, isNew) => {
    if (isNew || !(S > 0)) return { S: initS(rating), D: clamp(initD(rating), D_MIN, D_MAX) };
    const d = clamp(D, D_MIN, D_MAX);
    // 官方：delta_t 四舍五入后为 0 才走当天短期分支
    const dtRounded = Math.max(0, Math.round(dt));
    let s;
    if (dtRounded === 0) s = shortTermS(S, rating);
    else if (rating === 1) s = failS(S, R(dtRounded, S), d);
    else s = succS(S, R(dtRounded, S), d, rating);
    return { S: s, D: nextD(d, rating) };
  };
  const interval = S => clamp(S / factor * (Math.pow(DESIRED_RETENTION, 1 / decay) - 1), 0, S_MAX);
  return { name: 'FSRS-6(官方默认)', w, initS, initD, R, step, interval, params: { decay, factor } };
}

// ---------------- 确定性伪随机 ----------------
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * 生成合成复习序列（环境模型决定间隔与作答概率）
 * 每张卡 6~10 次复习，首日 delta_t=0（新卡），之后 delta_t = 间隔 × U(0.7,1.3)
 */
function genCards(env, count, seed) {
  const rand = mulberry32(seed);
  const cards = [];
  for (let i = 0; i < count; i++) {
    const reviews = [];
    let S = null, D = null;
    const nRev = 6 + Math.floor(rand() * 5);
    for (let k = 0; k < nRev; k++) {
      let dt;
      if (k === 0) dt = 0;
      else dt = Math.max(0.05, Math.round(env.interval(S) * (0.7 + rand() * 0.6) * 10) / 10);
      const r = k === 0 ? 1 : env.R(dt, S);
      let rating;
      if (rand() < r) rating = rand() < 0.2 ? 4 : 3;
      else rating = rand() < 0.7 ? 1 : 2;
      reviews.push({ delta_t: dt, rating });
      const st = env.step(S, D, rating, dt, k === 0);
      S = st.S; D = st.D;
    }
    cards.push(reviews);
  }
  return cards;
}

// ---------------- 评估 ----------------
function auc(scores, labels) {
  const pairs = scores.map((s, i) => [s, labels[i]]);
  pairs.sort((a, b) => a[0] - b[0]);            // 升序：分数越低秩越小
  const nPos = labels.reduce((a, b) => a + b, 0);
  const nNeg = labels.length - nPos;
  if (!nPos || !nNeg) return null;
  // 平均秩处理并列
  let rankSum = 0;
  let i = 0;
  while (i < pairs.length) {
    let j = i;
    while (j + 1 < pairs.length && pairs[j + 1][0] === pairs[i][0]) j++;
    const avgRank = (i + 1 + j + 1) / 2;
    for (let k = i; k <= j; k++) if (pairs[k][1] === 1) rankSum += avgRank;
    i = j + 1;
  }
  return (rankSum - nPos * (nPos + 1) / 2) / (nPos * nNeg);
}

function evaluateModel(model, cards) {
  let logLoss = 0, n = 0;
  const binPred = new Array(10).fill(0), binAct = new Array(10).fill(0), binCnt = new Array(10).fill(0);
  const scores = [], labels = [];
  for (const rev of cards) {
    let S = null, D = null;
    for (let k = 0; k < rev.length; k++) {
      const { delta_t, rating } = rev[k];
      if (k === rev.length - 1) {
        const p = (S == null || delta_t <= 0) ? 1 : clamp(model.R(delta_t, S), 1e-6, 1 - 1e-6);
        const y = rating > 1 ? 1 : 0;
        logLoss += -(y * Math.log(p) + (1 - y) * Math.log(1 - p));
        const b = Math.min(9, Math.floor(p * 10));
        binPred[b] += p; binAct[b] += y; binCnt[b] += 1;
        scores.push(p); labels.push(y);
        n++;
        break;
      }
      const st = model.step(S, D, rating, delta_t, k === 0);
      S = st.S; D = st.D;
    }
  }
  let se = 0, cnt = 0;
  for (let b = 0; b < 10; b++) {
    if (!binCnt[b]) continue;
    const pred = binPred[b] / binCnt[b], act = binAct[b] / binCnt[b];
    se += Math.pow(pred - act, 2) * binCnt[b]; cnt += binCnt[b];
  }
  return {
    samples: n,
    logLoss: +(logLoss / n).toFixed(4),
    rmseBins: +Math.sqrt(se / cnt).toFixed(4),
    auc: auc(scores, labels) == null ? null : +auc(scores, labels).toFixed(4)
  };
}

// ---------------- 对照表 ----------------
function forgettingCurveTable(models) {
  const SList = [0.5, 1, 3, 10, 30, 100, 365];
  const days = [1, 3, 7, 14, 30, 60, 90];
  return SList.map(S => ({
    stability: S,
    rows: days.map(t => ({ t, values: models.map(m => +m.R(t, S).toFixed(4)) }))
  }));
}

function intervalTable(models) {
  const SList = [0.1, 0.5, 1, 3, 10, 30, 100, 365, 1000];
  return SList.map(S => ({ stability: S, intervals: models.map(m => +m.interval(S).toFixed(3)) }));
}

// ---------------- 影子日志消费 ----------------
/**
 * 读取真实 reviewLog（fsrs-engine 影子运行产出），统计 FSRS-4 实际间隔 vs FSRS-6 影子间隔。
 * 输入可以是导出的 fsrs state JSON（含 reviewLog）或直接 reviewLog 数组。
 */
function consumeShadowLogs(file) {
  const SHADOW_OUT = resolve(ROOT, 'reports', 'fsrs6-shadow-stats.json');
  let j;
  try {
    j = JSON.parse(readFileSync(resolve(ROOT, file), 'utf8'));
  } catch (e) {
    console.error(`✗ 读取影子日志失败: ${file}（${e.message}）`);
    process.exit(2);
  }
  const rows = Array.isArray(j) ? j : (Array.isArray(j.reviewLog) ? j.reviewLog : []);
  const shadow = rows.filter(l => typeof l.shadow6IntervalDays === 'number' && typeof l.fsrs4IntervalDays === 'number');
  const n = shadow.length;
  if (!n) {
    console.log('未找到影子记录（reviewLog 需含 shadow6IntervalDays 与 fsrs4IntervalDays 字段）');
    console.log('请用加载了 shared/js/components/fsrs6-scheduler.js 的页面产生作答后再导出。');
    return;
  }
  const diffs = shadow.map(l => l.shadow6IntervalDays - l.fsrs4IntervalDays);
  const sum = diffs.reduce((a, b) => a + b, 0);
  const absSum = diffs.reduce((a, b) => a + Math.abs(b), 0);
  const byTopic = {};
  for (const l of shadow) {
    if (!byTopic[l.topicId]) byTopic[l.topicId] = { count: 0, diffSum: 0 };
    byTopic[l.topicId].count++;
    byTopic[l.topicId].diffSum += l.shadow6IntervalDays - l.fsrs4IntervalDays;
  }
  const report = {
    generatedAt: new Date().toISOString(),
    source: file,
    count: n,
    meanDiff: +(sum / n).toFixed(2),
    meanAbsDiff: +(absSum / n).toFixed(2),
    larger: diffs.filter(d => d > 0).length,
    smaller: diffs.filter(d => d < 0).length,
    same: diffs.filter(d => d === 0).length,
    byTopic: Object.fromEntries(Object.entries(byTopic).map(([k, v]) => [k, { count: v.count, meanDiff: +(v.diffSum / v.count).toFixed(2) }])),
    latest: shadow.slice(-20),
    note: n < 50
      ? '样本不足 50 条：仅作观察，尚不具备校准条件（校准需 ≥50 条真实 reviewLog）。'
      : '样本 ≥50 条：可用 calibrate-fsrs.mjs 对 21 参数做正式校准。'
  };
  if (!NO_WRITE) {
    mkdirSync(dirname(SHADOW_OUT), { recursive: true });
    writeFileSync(SHADOW_OUT, JSON.stringify(report, null, 2), 'utf8');
  }
  if (JSON_ONLY) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log('\n【FSRS-6 影子运行统计】');
    console.log(`  来源: ${file}`);
    console.log(`  影子记录: ${n} 条`);
    console.log(`  平均差（FSRS-6 − FSRS-4）: ${report.meanDiff} 天 · 平均绝对差: ${report.meanAbsDiff} 天`);
    console.log(`  FSRS-6 更长: ${report.larger} · 更短: ${report.smaller} · 相同: ${report.same}`);
    console.log(`  ${report.note}`);
    if (!NO_WRITE) console.log(`\n✅ 已写入 ${SHADOW_OUT}`);
  }
}

// ---------------- 主流程 ----------------
function main() {
  const logsArg = args.find(a => a.startsWith('--logs='));
  if (logsArg) return consumeShadowLogs(logsArg.slice('--logs='.length));

  const project = loadProjectW17();
  const w17 = project ? project.w : [
    0.4872, 1.4003, 3.7, 13.8, 5.16, 1.23, 0.897, 0.031, 1.647, 0.1367,
    1.046, 1.986, 0.12, 0.299, 2.293, 0.2318, 0.2935
  ];
  const w21Migrated = migrate17to21(w17);

  const models = [
    makeFsrs4(w17),
    makeFsrs6(FSRS6_DEFAULT_W),
    makeFsrs6(w21Migrated)
  ];
  models[2].name = 'FSRS-6(项目17参数迁移)';

  const envA = makeFsrs4(w17);              // 环境 A：FSRS-4 动态
  const envB = makeFsrs6(FSRS6_DEFAULT_W);  // 环境 B：FSRS-6 动态

  const cardsA = genCards(envA, 3000, 42);
  const cardsB = genCards(envB, 3000, 43);

  const evaluation = {
    '环境A_FSRS4动态': models.map(m => ({ model: m.name, ...evaluateModel(m, cardsA) })),
    '环境B_FSRS6动态': models.map(m => ({ model: m.name, ...evaluateModel(m, cardsB) }))
  };

  const report = {
    generatedAt: new Date().toISOString(),
    seed: { envA: 42, envB: 43, cardsPerEnv: 3000 },
    projectParams: {
      source: existsSync(PARAMS_FILE) ? 'data/fsrs-params.json' : '内置 FSRS-4 默认近似值',
      calibrated: project ? project.calibrated : false,
      w17,
      note: project ? project.note : '未找到 data/fsrs-params.json，使用内置默认值'
    },
    models: models.map(m => ({ name: m.name, paramCount: m.w.length, params: m.params })),
    migration: {
      rule: '官方 check_and_fill_parameters_fsrs6：p4+=2·p5; p5=ln(3·p5+1)/3; p6+=0.5; p17..19=0; p20=0.5',
      w17,
      w21: w21Migrated,
      decayAfter: -w21Migrated[20],
      factorAfter: +(Math.pow(0.9, 1 / (-w21Migrated[20])) - 1).toFixed(6)
    },
    evaluation,
    forgettingCurve: forgettingCurveTable(models),
    interval: intervalTable(models),
    conclusion: ''
  };

  // 结论：取两个环境的平均 logLoss / RMSE / AUC
  const avg = {};
  for (const m of models) {
    const rows = [...evaluation['环境A_FSRS4动态'], ...evaluation['环境B_FSRS6动态']].filter(r => r.model === m.name);
    avg[m.name] = {
      logLoss: +(rows.reduce((s, r) => s + r.logLoss, 0) / rows.length).toFixed(4),
      rmseBins: +(rows.reduce((s, r) => s + r.rmseBins, 0) / rows.length).toFixed(4),
      auc: +(rows.reduce((s, r) => s + r.auc, 0) / rows.length).toFixed(4)
    };
  }
  report.average = avg;
  report.conclusion = buildConclusion(avg, project);

  if (!NO_WRITE) {
    mkdirSync(dirname(OUT_FILE), { recursive: true });
    writeFileSync(OUT_FILE, JSON.stringify(report, null, 2), 'utf8');
  }

  if (JSON_ONLY) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printReport(report);
    console.log(`\n✅ 已写入 ${OUT_FILE}`);
  }
}

function buildConclusion(avg, project) {
  const names = Object.keys(avg);
  const best = names.slice().sort((a, b) => avg[a].logLoss - avg[b].logLoss)[0];
  const migrated = avg['FSRS-6(项目17参数迁移)'];
  const v4 = avg['FSRS-4(项目)'];
  const lines = [];
  lines.push(`两环境下平均 logLoss 最优：${best}（${avg[best].logLoss}）。`);
  if (migrated && v4) {
    const diff = migrated.logLoss - v4.logLoss;
    if (Math.abs(diff) < 0.005) {
      lines.push(`迁移版 FSRS-6 与现有 FSRS-4 基本持平（ΔlogLoss=${diff >= 0 ? '+' : ''}${diff.toFixed(4)}），说明 17→21 参数迁移是平滑的。`);
    } else if (diff > 0) {
      lines.push(`迁移版 FSRS-6 略逊于 FSRS-4（ΔlogLoss=+${diff.toFixed(4)}）：默认参数未针对中文小学场景校准，属预期。`);
    } else {
      lines.push(`迁移版 FSRS-6 略优（ΔlogLoss=${diff.toFixed(4)}）。`);
    }
  }
  lines.push('间隔公式上，两者在期望留存 0.9 下都退化为 I(S)=S（因为 FACTOR 正是按 0.9^(1/DECAY)-1 定义），差异集中在记忆状态更新：FSRS-6 增加当天短期稳定性 w17..w19、失败稳定性下界 min(S/exp(w17·w18), …)、以及难度的非线性更新与均值回归。');
  lines.push(project && !project.calibrated
    ? '注意：项目参数尚未用真实作答数据校准（calibrate-fsrs.mjs），以上结论用于选型而非最终参数。'
    : '项目参数已校准，结论可直接参考。');
  lines.push('建议：先采用「迁移版 FSRS-6」做影子运行（只记录不影响排期），累积 ≥50 条真实 reviewLog 后用 calibrate-fsrs.mjs 重新校准 21 参数，再切换。');
  return lines.join('\n');
}

function printReport(r) {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  FSRS-4 vs FSRS-6 升级评估                                ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`参数来源: ${r.projectParams.source}${r.projectParams.calibrated ? '（已校准）' : '（未校准）'}`);
  console.log('\n【模型参数概览】');
  for (const m of r.models) {
    console.log(`  ${m.name.padEnd(24)} 参数数=${m.paramCount}  DECAY=${m.params.decay.toFixed(4)}  FACTOR=${m.params.factor.toFixed(4)}`);
  }
  console.log('\n【17→21 迁移后参数】');
  console.log('  w21 =', r.migration.w21.map(x => +x.toFixed(4)).join(', '));
  console.log(`  迁移后 DECAY=${r.migration.decayAfter}  FACTOR=${r.migration.factorAfter}（与 FSRS-4 的 -0.5 / 0.2346 平滑衔接）`);

  console.log('\n【留出末次复习的预测表现】');
  for (const [env, rows] of Object.entries(r.evaluation)) {
    console.log(`  ${env}:`);
    for (const row of rows) {
      console.log(`    ${row.model.padEnd(24)} n=${row.samples}  logLoss=${row.logLoss}  RMSE(bins)=${row.rmseBins}  AUC=${row.auc}`);
    }
  }
  console.log('\n【两环境平均】');
  for (const [name, v] of Object.entries(r.average)) {
    console.log(`  ${name.padEnd(24)} logLoss=${v.logLoss}  RMSE=${v.rmseBins}  AUC=${v.auc}`);
  }

  console.log('\n【遗忘曲线对照 R(t)】（列：' + r.models.map(m => m.name).join(' / ') + '）');
  for (const row of r.forgettingCurve) {
    console.log(`  S=${String(row.stability).padEnd(6)}`);
    for (const d of row.rows) {
      console.log(`    t=${String(d.t).padEnd(4)}天  ${d.values.map(v => v.toFixed(4).padStart(8)).join('  ')}`);
    }
  }

  console.log('\n【间隔对照 I(S, 0.9)（天）】');
  for (const row of r.interval) {
    console.log(`  S=${String(row.stability).padEnd(6)} ${row.intervals.map(v => String(v).padStart(10)).join('  ')}`);
  }

  console.log('\n【结论】');
  r.conclusion.split('\n').forEach(l => console.log('  ' + l));
}

main();
