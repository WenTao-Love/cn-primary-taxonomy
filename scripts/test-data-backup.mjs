#!/usr/bin/env node
/**
 * test-data-backup.mjs
 * 数据备份 / 导出 / 恢复 组件 Node 测试
 *
 * 运行：node scripts/test-data-backup.mjs
 * 无需浏览器：用最小 localStorage 桩 + 真实 constants/storage/data-export 组件。
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// ---------- 最小浏览器桩 ----------
const store = {};
globalThis.window = globalThis;
globalThis.localStorage = {
  getItem: k => (Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};
globalThis.location = { pathname: '/h5.html' };

function loadScript(rel) {
  const code = readFileSync(join(root, rel), 'utf8');
  // 全局 eval：IIFE 内的 window 指向 globalThis
  (0, eval)(code);
}

loadScript('shared/js/core/constants.js');
loadScript('shared/js/core/storage.js');
loadScript('shared/js/components/data-export.js');

const { storage, components } = globalThis.CNPT;
const DE = components;

let passed = 0;
function ok(name) { passed++; console.log(`  ✓ ${name}`); }
function group(name) { console.log(`\n■ ${name}`); }

// ================= 1. 空存储导出结构 =================
group('1. 空存储导出结构（v2.0）');
{
  const data = DE.collectAllData('student');
  assert.equal(data.exportInfo.version, '2.0');
  assert.equal(data.exportInfo.role, 'student');
  assert.equal(data.exportInfo.appName, 'CN-Primary-Taxonomy');
  assert.ok(data.exportInfo.exportedAt);
  ['mastery', 'wrongBook', 'fsrs', 'mistakeLedger', 'dailyLog', 'diagnostic', 'lastVisit', 'days', 'stars'].forEach(k => {
    assert.ok(k in data.storage, `storage.${k} 缺失`);
  });
  assert.equal(data.storage.stars, 0);
  assert.equal(data.counts.mastery, 0);
  assert.equal(data.counts.wrongBook, 0);
  assert.equal(data.counts.fsrsCards, 0);
  assert.equal(data.counts.rcdHistory, 0);
  assert.equal(data.legacy, undefined, '无旧键时不应出现 legacy 段');
  ok('版本/角色/字段/计数均正确');
}

// ================= 2. 有数据导出 =================
group('2. 有数据导出（按角色存储键收集）');
{
  const st = storage.create('student');
  st.setMastery({ T1: 'mastered', T2: 'learning' });
  st.addWrongItem({ topicId: 'T1', count: 2 });
  st.setFsrsState({ cards: { T1: { stability: 3 } }, reviewLog: [{ cardId: 'T1' }] });
  st.addLowLevelMistake({ topicId: 'T1', type: '抄写错误' });
  st.setDiagnosticState({ lastSessionId: 's1' });
  st.addStar();
  st.updateConsecutiveDays();
  localStorage.setItem('cnpt-student-rcd-history', JSON.stringify([{ target: { name: '分数' } }]));

  const data = DE.collectAllData('student');
  assert.deepEqual(data.storage.mastery, { T1: 'mastered', T2: 'learning' });
  assert.equal(data.storage.wrongBook.length, 1);
  assert.equal(data.storage.wrongBook[0].topicId, 'T1');
  assert.equal(Object.keys(data.storage.fsrs.cards).length, 1);
  assert.equal(data.storage.mistakeLedger.length, 1);
  assert.equal(data.storage.diagnostic.lastSessionId, 's1');
  assert.equal(data.storage.stars, 1);
  assert.equal(data.storage.days >= 1, true);
  assert.equal(data.rcdHistory.length, 1);
  assert.equal(data.counts.mastery, 2);
  assert.equal(data.counts.wrongBook, 1);
  assert.equal(data.counts.fsrsCards, 1);
  assert.equal(data.counts.mistakeLedger, 1);
  assert.equal(data.counts.rcdHistory, 1);
  ok('掌握/错题/FSRS/台账/诊断/星星/天数/诊断历史全部收集');
}

// ================= 3. 导出→导入往返 =================
group('3. 导出 → 清空 → 导入（往返一致）');
{
  const before = DE.collectAllData('student');
  const snapshot = JSON.parse(JSON.stringify({
    mastery: before.storage.mastery,
    wrongBook: before.storage.wrongBook,
    fsrs: before.storage.fsrs,
    mistakeLedger: before.storage.mistakeLedger,
    diagnostic: before.storage.diagnostic,
    stars: before.storage.stars,
    days: before.storage.days,
    rcdHistory: before.rcdHistory
  }));

  localStorage.clear();
  const result = DE.importFromJSON(JSON.parse(JSON.stringify(before)), 'student');
  assert.equal(result.ok, true);
  assert.equal(result.role, 'student');

  const st = storage.create('student');
  assert.deepEqual(st.getMastery(), snapshot.mastery);
  assert.deepEqual(st.getWrongBook(), snapshot.wrongBook);
  assert.deepEqual(st.getFsrsState(), snapshot.fsrs);
  assert.deepEqual(st.getLowLevelMistakes(), snapshot.mistakeLedger);
  assert.deepEqual(st.getDiagnosticState(), snapshot.diagnostic);
  assert.equal(st.getStars(), snapshot.stars);
  assert.equal(st.getConsecutiveDays(), snapshot.days);
  assert.deepEqual(JSON.parse(localStorage.getItem('cnpt-student-rcd-history')), snapshot.rcdHistory);
  ok('全部键往返一致');
}

// ================= 4. 兼容 v1.0 备份导入 =================
group('4. 兼容 v1.0 备份（userData / compliance / settings）');
{
  const v1 = {
    exportInfo: { version: '1.0', exportedAt: '2026-01-01T00:00:00.000Z', role: 'student' },
    userData: {
      mastery: { T9: 'mastered' },
      wrongBook: [{ id: 'T9', name: '旧键错题', count: 1 }],
      bookmarks: ['T9'],
      searchHistory: ['方程'],
      stats: { mastered: 1 }
    },
    settings: { theme: 'dark', fontSize: 'large', onboardingDone: true },
    compliance: [{ at: 1, action: 'export' }]
  };
  const result = DE.importFromJSON(v1, 'student');
  assert.equal(result.ok, true);
  assert.deepEqual(storage.create('student').getMastery(), { T9: 'mastered' });
  assert.equal(storage.create('student').getWrongBook().length, 1);
  assert.deepEqual(JSON.parse(localStorage.getItem('cnpt_bookmarks')), ['T9']);
  assert.deepEqual(JSON.parse(localStorage.getItem('cnpt_search_history')), ['方程']);
  assert.deepEqual(JSON.parse(localStorage.getItem('cnpt_stats')), { mastered: 1 });
  assert.deepEqual(JSON.parse(localStorage.getItem('cnpt_compliance_logs')), [{ at: 1, action: 'export' }]);
  assert.equal(localStorage.getItem('cnpt_theme'), 'dark');
  assert.equal(localStorage.getItem('cnpt_font_size'), 'large');
  assert.equal(localStorage.getItem('cnpt_onboarding_done'), 'true');
  ok('v1.0 字段全部落到新键/旧键/设置');
}

// ================= 5. 非法输入 =================
group('5. 非法与空备份处理');
{
  assert.equal(DE.importFromJSON(null).ok, false);
  assert.equal(DE.importFromJSON([]).ok, false);
  assert.equal(DE.importFromJSON('x').ok, false);
  const empty = DE.importFromJSON({}, 'student');
  assert.equal(empty.ok, true);
  assert.equal(empty.restored.length, 0, '空备份不应写任何键');
  ok('null/数组/字符串被拒绝；空对象安全通过');
}

// ================= 6. 角色隔离 =================
group('6. 恢复角色隔离');
{
  const backup = DE.collectAllData('student');
  backup.exportInfo.role = 'student';
  localStorage.clear(); // 隔离：确保断言的是本次导入行为
  const result = DE.importFromJSON(backup, 'teacher');
  assert.equal(result.ok, true);
  assert.equal(result.role, 'teacher');
  assert.ok(localStorage.getItem('cnpt-teacher-mastery'));
  assert.ok(!localStorage.getItem('cnpt-student-mastery'), '不应写到学生键');
  ok('显式 role 写入目标角色，不串号');
}

// ================= 7. 旧键 legacy 导出与回写 =================
group('7. 旧键（v1.0 下划线）残留导出');
{
  localStorage.setItem('cnpt_mastery', JSON.stringify({ OLD: 'mastered' }));
  const data = DE.collectAllData('student');
  assert.ok(data.legacy, '应包含 legacy 段');
  assert.deepEqual(data.legacy.mastery, { OLD: 'mastered' });

  localStorage.removeItem('cnpt_mastery');
  const result = DE.importFromJSON(data, 'student');
  assert.equal(result.ok, true);
  assert.deepEqual(JSON.parse(localStorage.getItem('cnpt_mastery')), { OLD: 'mastered' });
  ok('legacy 段随备份导出并可回写');
}

// ================= 8. 缺失字段不覆盖现有数据 =================
group('8. 备份缺失字段时保留现有数据');
{
  const st = storage.create('student');
  st.setFsrsState({ cards: { KEEP: { stability: 9 } } });
  const backup = DE.collectAllData('student');
  delete backup.storage.fsrs;
  const result = DE.importFromJSON(backup, 'student');
  assert.equal(result.ok, true);
  assert.deepEqual(storage.create('student').getFsrsState(), { cards: { KEEP: { stability: 9 } } });
  ok('备份不含 fsrs 时现有 FSRS 状态不被清空');
}

console.log(`\n✅ test-data-backup.mjs 全部通过：${passed} 项`);
