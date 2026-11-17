/**
 * 根因回溯诊断组件回归测试
 * 运行：node scripts/test-root-cause-diagnosis.mjs
 *
 * 覆盖：目标优先队列、答错回溯、确认题机制、薄弱/不稳/掌握三态、
 *       根因识别（最深处薄弱点）、补学路线、历史持久化。
 */
import { readFileSync } from 'node:fs';

globalThis.window = { CNPT: {}, __CNPT_DIAGNOSTIC_QUESTIONS__: [] };
const _store = {};
globalThis.localStorage = {
  getItem: (k) => (k in _store ? _store[k] : null),
  setItem: (k, v) => { _store[k] = String(v); },
  removeItem: (k) => { delete _store[k]; }
};

// ---- 最小图谱 mock：A → B → C（C 依赖 B、B 依赖 A，均 hard）----
const topics = [
  { id: 'A', name: '用字母表示数', subject: '数学', grade: 7, difficulty: 1, description: '' },
  { id: 'B', name: '一元一次方程', subject: '数学', grade: 7, difficulty: 2, description: '' },
  { id: 'C', name: '二次函数', subject: '数学', grade: 9, difficulty: 4, description: '' }
];
const deps = [
  { topicId: 'B', prerequisiteId: 'A', strength: 'hard', reason: '需要先会字母表示数' },
  { topicId: 'C', prerequisiteId: 'B', strength: 'hard', reason: '需要先会方程' }
];
const incoming = {}, outgoing = {};
for (const d of deps) {
  const edge = { source: d.prerequisiteId, target: d.topicId, strength: d.strength, reason: d.reason };
  (incoming[d.topicId] = incoming[d.topicId] || []).push(edge);
  (outgoing[d.prerequisiteId] = outgoing[d.prerequisiteId] || []).push(edge);
}
window.CNPT.indices = {
  getTopicMap: () => new Map(topics.map(t => [t.id, t])),
  getIncoming: (id) => incoming[id] || [],
  getOutgoing: (id) => outgoing[id] || []
};
window.CNPT.storage = { create: () => ({ getTopicStatus: () => 'not-started' }) };
window.CNPT.path = {
  getSubgraphIds: () => new Set(['A', 'B', 'C']),
  topologicalSort: (ids) => ['A', 'B', 'C'].filter(x => ids.includes(x))
};

// C 有 2 道 quiz（可触发确认题）、A 有 quiz；B 无 quiz，走 commonMistakes 回退题
topics[2].quizQuestions = [
  { type: 'choice', question: 'C题1', options: ['x', 'y'], answer: 0, explanation: '' },
  { type: 'choice', question: 'C题2', options: ['x', 'y'], answer: 1, explanation: '' }
];
topics[0].quizQuestions = [{ type: 'choice', question: 'A题', options: ['x', 'y'], answer: 1, explanation: '' }];
topics[1].commonMistakes = ['B易错'];
topics[1].evidence = ['B要点'];

const src = readFileSync(new URL('../shared/js/components/root-cause-diagnosis.js', import.meta.url), 'utf8');
eval(src);

const engine = window.CNPT.rootCause.create('student');
let pass = 0, fail = 0;
const assert = (cond, msg) => {
  if (cond) { pass++; console.log('  ✓', msg); }
  else { fail++; console.error('  ✗', msg); }
};

console.log('\n根因回溯诊断测试\n');

// 1) 目标优先队列
const session = engine.start('C', { maxQuestions: 10 });
assert(session.queue[0].topicId === 'C' && session.queue[0].priority === 0, '队列目标优先');
assert(session.queue.some(q => q.topicId === 'B'), '队列含直接前置 B');

// 2) 答题流程：C 错 → B 错 → A 对
let step = 0;
while (step++ < 20) {
  const item = engine.next(session);
  if (!item) break;
  if (item.type === 'confirm') {
    // 确认题也答错 → C 薄弱，继续回溯
    engine.answerConfirm(session, item.question.id, (item.question.answer + 1) % item.question.options.length);
  } else {
    const ans = item.question.topicId === 'A' ? item.question.answer : (item.question.answer + 1) % item.question.options.length;
    engine.answer(session, item.question.id, ans);
  }
}
const report = engine.finish(session);

assert(report.statistics.weakCount === 2, 'C 与 B 判定为薄弱');
assert(report.statistics.masteredCount === 1, 'A 判定为掌握');
assert(report.rootCauses.length === 1 && report.rootCauses[0].topicId === 'B', '根因识别为最薄弱前置 B');
assert(report.remedialPath.length >= 2 && report.remedialPath[0].topicId === 'B', '补学路线从根因 B 开始');
assert(engine.getHistory().length === 1, '诊断历史已保存');

// 3) 确认题机制：C 错 → 确认题对 → 不稳（不回溯）
const s2 = engine.start('C', { maxQuestions: 10 });
const q1 = engine.next(s2);
const r1 = engine.answer(s2, q1.question.id, (q1.question.answer + 1) % q1.question.options.length);
assert(r1.needConfirm === true, '答错后需要确认题');
const cq = engine.next(s2);
assert(cq && cq.type === 'confirm', '进入确认题');
const r2 = engine.answerConfirm(s2, cq.question.id, cq.question.answer);
assert(r2.markedAs === 'unstable', '确认题答对 → 不稳');
const rep2 = engine.finish(s2);
assert(rep2.statistics.unstableCount === 1 && rep2.statistics.weakCount === 0, '不稳不计入薄弱、不回溯');

// 4) 盲区再测：题量上限产生未测 → expandUntested 重新入队继续
const s3 = engine.start('C', { maxQuestions: 2 });
while (true) {
  const it = engine.next(s3);
  if (!it) break;
  // C 答对、B 答错 → B 薄弱并回溯 A；上限 2 题时 A 未测
  const correct = it.question.topicId === 'C';
  const ans = correct ? it.question.answer : (it.question.answer + 1) % it.question.options.length;
  engine.answer(s3, it.question.id, ans);
}
const rep3 = engine.finish(s3);
assert(rep3.statistics.untestedCount > 0, '题量上限产生未测');
const added = engine.expandUntested(s3);
assert(added === rep3.statistics.untestedCount, '盲区再测把未测点重新入队');
const it3 = engine.next(s3);
assert(it3 && it3.type === 'diagnostic', '续测能继续出题');
const rep3b = engine.finish(s3);
assert(rep3b.id.indexOf('-r1') !== -1, '续测报告 id 带续测后缀');
assert(rep3b.statistics.untestedCount < rep3.statistics.untestedCount, '续测后未测减少');

// 5) 根因路径图数据与 SVG
const gd = engine.getPathGraphData(report);
assert(gd.nodes.length >= 2 && gd.edges.length >= 1, '路径图含节点与边');
assert(gd.targetId === 'C' && gd.depth['C'] === 0 && gd.depth['B'] === 1, '路径图层级：目标 0、前置递增');
const svg = engine.renderPathGraphSVG(report);
assert(svg.indexOf('<svg') === 0 && svg.indexOf('<rect') !== -1 && svg.indexOf('<line') !== -1, '路径图 SVG 渲染含节点与边');
assert(engine.renderPathGraphSVG({ remedialPath: [] }) === '', '无路线时路径图返回空串');

console.log(`\n共 ${pass + fail} 项 · 通过 ${pass} · 失败 ${fail}`);
if (fail) process.exitCode = 1;
else console.log('✓ 根因回溯诊断测试全部通过');
