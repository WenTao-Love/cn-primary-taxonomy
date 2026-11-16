#!/usr/bin/env node
/**
 * test-fsrs-engine.mjs
 * FSRS 引擎（v3 混合调度 + 迁移）Node 测试
 *
 * 运行：node scripts/test-fsrs-engine.mjs
 * 无需浏览器：在 Node 中用最小桩替代 window / localStorage / CNPT.storage。
 */
import assert from 'node:assert/strict';

// ---------- 最小浏览器桩 ----------
const store = {};
globalThis.window = globalThis;
globalThis.localStorage = {
  getItem: k => (Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; }
};
globalThis.CNPT = {};
globalThis.CNPT.constants = {
  COLORS: {},
  LEARNING_BUDGET: { DAILY_MINUTES: 75, REVIEW_RATIO: 0.5, MIN_REVIEW_MINUTES: 10 },
  ERROR_REASONS: { P01: '概念不清' }
};
globalThis.CNPT.utils = {
  localDateKey: () => '2026-11-16',
  escapeHtml: s => String(s == null ? '' : s)
};
function createMockStorage(role) {
  const key = `cnpt-${role}-fsrs`;
  const ledgerKey = `cnpt-${role}-mistake-ledger`;
  return {
    role,
    getFsrsState() { try { return JSON.parse(store[key] || 'null'); } catch { return null; } },
    setFsrsState(s) { store[key] = JSON.stringify(s || {}); },
    getTodaySeconds() { try { return JSON.parse(store['cnpt-today'] || '{}'); } catch { return {}; } },
    getLowLevelMistakes() { try { return JSON.parse(store[ledgerKey] || '[]'); } catch { return []; } },
    addLowLevelMistake(m) { const l = this.getLowLevelMistakes(); l.unshift(m); store[ledgerKey] = JSON.stringify(l); },
    clearLowLevelMistakes() { store[ledgerKey] = '[]'; }
  };
}
globalThis.CNPT.storage = { create: createMockStorage };

// ---------- 加载被测模块 ----------
await import('../shared/js/components/fsrs-scheduler.js');
await import('../shared/js/components/fsrs-engine.js');

const DAY_MS = 24 * 3600 * 1000;
const MIN_MS = 60 * 1000;
const fsrs = globalThis.CNPT.fsrs;
const results = [];
function resetRole(role) {
  delete store[`cnpt-${role}-fsrs`];
  delete store[`cnpt-${role}-mistake-ledger`];
  delete store['cnpt-today'];
}
function test(name, fn) {
  try { fn(); results.push(['PASS', name]); console.log(`  ✓ ${name}`); }
  catch (e) { results.push(['FAIL', `${name}: ${e.message}`]); console.error(`  ✗ ${name}\n    ${e.message}`); }
}

console.log('\nFSRS 引擎测试\n');

test('调度器已加载且参数可注入', () => {
  assert.equal(typeof globalThis.CNPT.fsrsScheduler.createScheduler, 'function');
  const e = fsrs.create('student');
  const info = fsrs.getSchedulerInfo(e);
  assert.equal(info.mode, 'fsrs-v4-hybrid');
  assert.equal(info.storageVersion, 3);
  assert.ok(Array.isArray(info.w) && info.w.length === 17);
});

test('首次独立答对 → 进入学习第 1 步（20 分钟）', () => {
  resetRole('student');
  fsrs._clearCache();
  const e = fsrs.create('student');
  const now = Date.now();
  const c = e.recordAnswer({ topicId: 'ct_SX2S011', isCorrect: true, isIndependent: true, confidence: 50 });
  assert.equal(c.consecutiveCorrect, 1);
  assert.equal(c.dormant, false);
  const delta = c.nextReview - now;
  assert.ok(Math.abs(delta - 20 * MIN_MS) <= 2000, `间隔应为 20 分钟，实际 ${delta}ms`);
});

test('连续 3 次独立答对 → 休眠，60 天后抽检', () => {
  resetRole('student');
  fsrs._clearCache();
  const e = fsrs.create('student');
  const now = Date.now();
  let c;
  for (let i = 0; i < 3; i++) c = e.recordAnswer({ topicId: 'ct_SX2S011', isCorrect: true, isIndependent: true, confidence: 50 });
  assert.equal(c.consecutiveCorrect, 3);
  assert.equal(c.dormant, true);
  assert.ok(Math.abs((c.nextReview - now) - 60 * DAY_MS) <= 2000, '休眠抽检应为 60 天');
});

test('休眠抽检答对 → 保持休眠并顺延', () => {
  resetRole('student');
  fsrs._clearCache();
  const e = fsrs.create('student');
  let c;
  for (let i = 0; i < 3; i++) c = e.recordAnswer({ topicId: 'ct_SX2S011', isCorrect: true, isIndependent: true, confidence: 50 });
  const before = c.nextReview;
  const c2 = e.recordAnswer({ topicId: 'ct_SX2S011', isCorrect: true, isIndependent: true, confidence: 100 });
  assert.equal(c2.dormant, true);
  assert.ok(c2.nextReview >= before, '抽检通过后应顺延');
});

test('休眠抽检答错 → 唤醒并回到学习第 1 步', () => {
  resetRole('student');
  fsrs._clearCache();
  const e = fsrs.create('student');
  let c;
  for (let i = 0; i < 3; i++) c = e.recordAnswer({ topicId: 'ct_SX2S011', isCorrect: true, isIndependent: true, confidence: 50 });
  const now = Date.now();
  const c2 = e.recordAnswer({ topicId: 'ct_SX2S011', isCorrect: false, isIndependent: true, confidence: 25 });
  assert.equal(c2.dormant, false);
  assert.equal(c2.consecutiveCorrect, 0);
  assert.equal(c2.consecutiveWrong, 1);
  assert.ok(Math.abs((c2.nextReview - now) - 20 * MIN_MS) <= 2000, '唤醒后应回到 20 分钟');
  assert.equal(e.getErrorStats()['ct_SX2S011'].count, 1);
});

test('提示后答对 → 不算通过，回到第 1 轮', () => {
  resetRole('student');
  fsrs._clearCache();
  const e = fsrs.create('student');
  e.recordAnswer({ topicId: 'ct_SX2S011', isCorrect: true, isIndependent: true, confidence: 50 });
  const now = Date.now();
  const c = e.recordAnswer({ topicId: 'ct_SX2S011', isCorrect: true, isIndependent: false, confidence: 50 });
  assert.equal(c.consecutiveCorrect, 0);
  assert.ok(Math.abs((c.nextReview - now) - 20 * MIN_MS) <= 2000, '提示后答对应回到 20 分钟');
});

test('答错 → 归零并记错题', () => {
  resetRole('student');
  fsrs._clearCache();
  const e = fsrs.create('student');
  const now = Date.now();
  const c = e.recordAnswer({ topicId: 'ct_SX2S011', isCorrect: false, isIndependent: true, confidence: 25, reason: 'P01' });
  assert.equal(c.consecutiveCorrect, 0);
  assert.equal(c.consecutiveWrong, 1);
  assert.ok(Math.abs((c.nextReview - now) - 20 * MIN_MS) <= 2000);
  assert.equal(e.getReasonDistribution()['P01'], 1);
});

test('FSRS 复习阶段：间隔随有效复习递增（S 增长）', () => {
  resetRole('student');
  fsrs._clearCache();
  const e = fsrs.create('student');
  const id = 'ct_SX2S011';
  let c = null;
  // 先完成 6 轮学习阶段（每轮间隔 3 天，模拟真实间隔）
  for (let i = 0; i < 6; i++) {
    if (c) c.lastReview = Date.now() - 3 * DAY_MS; // 模拟 3 天前的复习
    c = e.recordAnswer({ topicId: id, isCorrect: true, isIndependent: true, confidence: 50 });
  }
  const s1 = c.stability;
  // 第 7 次起进入 FSRS 复习阶段
  c.lastReview = Date.now() - 3 * DAY_MS;
  const c7 = e.recordAnswer({ topicId: id, isCorrect: true, isIndependent: true, confidence: 50 });
  assert.ok(c7.consecutiveCorrect > 6, '应进入 FSRS 复习阶段');
  const intervalDays = (c7.nextReview - Date.now()) / DAY_MS;
  assert.ok(intervalDays > 3, `FSRS 间隔应大于学习阶段（实际 ${intervalDays.toFixed(1)} 天）`);
  assert.ok(c7.stability >= s1, '稳定性不应下降');
});

test('v2 → v3 迁移：补 S/D/reps，nextReview 不变', () => {
  resetRole('student');
  fsrs._clearCache();
  const role = 'student';
  const key = `cnpt-${role}-fsrs`;
  const future = Date.now() + 123456;
  store[key] = JSON.stringify({
    version: 2,
    cards: {
      ct_SX2S011: { round: 3, consecutiveCorrect: 2, consecutiveWrong: 0, lastReview: Date.now() - DAY_MS, nextReview: future, dormant: false, totalReviews: 5, totalCorrect: 4 }
    },
    reviewLog: [], errorLog: [], firstAttempts: {}, dailySeconds: {}
  });
  const e = fsrs.create(role);
  const c = e.cards['ct_SX2S011'];
  assert.equal(typeof c.stability, 'number');
  assert.equal(c.difficulty, 5);
  assert.equal(c.reps, 5);
  assert.equal(c.migratedFrom, 2);
  assert.equal(c.nextReview, future, '迁移不得改变既有排期');
  const saved = JSON.parse(store[key]);
  assert.equal(saved.version, 3);
});

test('getStatus 暴露记忆状态字段', () => {
  resetRole('student');
  fsrs._clearCache();
  const e = fsrs.create('student');
  e.recordAnswer({ topicId: 'ct_SX2S011', isCorrect: true, isIndependent: true, confidence: 50 });
  const st = e.getStatus('ct_SX2S011');
  assert.equal(typeof st.stability, 'number');
  assert.equal(typeof st.difficulty, 'number');
  assert.equal(st.reps, 1);
  assert.equal(st.migratedFrom, null);
});

test('export/import 版本为 v3 且幂等', () => {
  resetRole('student');
  fsrs._clearCache();
  const e = fsrs.create('student');
  e.recordAnswer({ topicId: 'ct_SX2S011', isCorrect: true, isIndependent: true, confidence: 50 });
  const dump = e.export();
  assert.equal(dump.version, 3);
  resetRole('student');
  fsrs._clearCache();
  const e2 = fsrs.create('student');
  assert.equal(e2.import(dump), true);
  assert.ok(e2.cards['ct_SX2S011']);
  assert.notEqual(e2.cards['ct_SX2S011'].migratedFrom, 2, 'v3 数据导入不应误标迁移');
});

// ---------- 汇总 ----------
const failed = results.filter(r => r[0] === 'FAIL');
console.log(`\n${'='.repeat(48)}`);
console.log(`共 ${results.length} 项 · 通过 ${results.length - failed.length} · 失败 ${failed.length}`);
if (failed.length) {
  console.error('\n失败项:');
  failed.forEach(([, m]) => console.error(`  - ${m}`));
  process.exit(1);
}
console.log('✓ FSRS 引擎测试全部通过');
