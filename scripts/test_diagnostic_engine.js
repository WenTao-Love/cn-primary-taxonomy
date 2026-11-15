/**
 * 诊断引擎测试脚本
 * 验证v2引擎的核心功能
 */

const fs = require('fs');
const path = require('path');

// 加载数据
const dataDir = path.join(__dirname, '..', 'data');

const topicsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'topics.json'), 'utf-8'));
const depsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'dependencies.json'), 'utf-8'));
const questionsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'diagnostic-questions.json'), 'utf-8'));

const topics = topicsData.topics || topicsData;
const dependencies = depsData.dependencies || depsData;
const questions = questionsData.questions || questionsData;

console.log('=== 数据加载 ===');
console.log(`知识点: ${topics.length}`);
console.log(`依赖关系: ${dependencies.length}`);
console.log(`诊断题: ${questions.length}`);

// 加载引擎
const DiagnosticEngine = require('./diagnostic-engine-v2.js');
const engine = new DiagnosticEngine(topics, dependencies, questions);

console.log('\n=== 引擎初始化 ===');
console.log(`前置依赖映射: ${Object.keys(engine.prereqMap).length} 个知识点`);
console.log(`问题映射: ${Object.keys(engine.questionMap).length} 个知识点`);
console.log(`后继映射: ${Object.keys(engine.successorMap).length} 个知识点`);

// 测试1：获取知识点的诊断题
console.log('\n=== 测试1：获取诊断题 ===');
const testTopicId = 'ct_SX2S020'; // 乘法口诀
const testQuestions = engine.getQuestions(testTopicId);
console.log(`知识点 ${testTopicId} 的诊断题: ${testQuestions.length} 道`);
testQuestions.forEach((q, i) => {
  console.log(`  ${i+1}. [${q.difficulty}] ${q.question.substring(0, 30)}...`);
});

// 测试2：获取前置依赖
console.log('\n=== 测试2：获取前置依赖 ===');
const prereqs = engine.getDirectPrerequisites(testTopicId);
console.log(`知识点 ${testTopicId} 的直接前置依赖: ${prereqs.length} 个`);
prereqs.forEach(p => {
  console.log(`  - ${p.id} (强度: ${p.strength})`);
});

const allPrereqs = engine.getPrerequisites(testTopicId);
console.log(`所有前置依赖（递归）: ${allPrereqs.length} 个`);

// 测试3：开始诊断会话
console.log('\n=== 测试3：开始诊断会话 ===');
const session = engine.startSession(testTopicId, {
  maxQuestions: 10,
  confirmOnFail: true,
  autoBacktrack: true,
  adaptiveDifficulty: true
});
console.log(`会话ID: ${session.id}`);
console.log(`初始队列: ${session.queue.length} 个知识点`);
console.log(`当前难度: ${session.currentDifficulty}`);

// 测试4：获取下一道题
console.log('\n=== 测试4：获取下一道题 ===');
const nextQ = engine.getNextQuestion(session);
if (nextQ) {
  console.log(`题目类型: ${nextQ.type}`);
  console.log(`知识点: ${nextQ.topicId}`);
  console.log(`难度: ${nextQ.question.difficulty}`);
  console.log(`题目: ${nextQ.question.question}`);
}

// 测试5：提交答案（答对）
console.log('\n=== 测试5：提交答案（答对）===');
const result1 = engine.submitAnswer(session, nextQ.question.id, nextQ.question.answer);
console.log(`结果: ${JSON.stringify(result1)}`);
console.log(`当前难度: ${session.currentDifficulty}`);
console.log(`已答对: ${session.results.mastered.length} 个`);

// 测试6：提交答案（答错）
console.log('\n=== 测试6：提交答案（答错）===');
const nextQ2 = engine.getNextQuestion(session);
if (nextQ2) {
  const wrongAnswer = (nextQ2.question.answer + 1) % nextQ2.question.options.length;
  const result2 = engine.submitAnswer(session, nextQ2.question.id, wrongAnswer);
  console.log(`结果: ${JSON.stringify(result2)}`);
  console.log(`当前难度: ${session.currentDifficulty}`);
  console.log(`待确认: ${session.pendingConfirm ? '有' : '无'}`);
}

// 测试7：完成会话
console.log('\n=== 测试7：完成会话 ===');
const report = engine.finishSession(session);
console.log(`会话ID: ${report.sessionId}`);
console.log(`统计: ${JSON.stringify(report.statistics)}`);
console.log(`薄弱: ${report.results.weak.length} 个`);
console.log(`不稳: ${report.results.unstable.length} 个`);
console.log(`未测: ${report.results.untested.length} 个`);
console.log(`已掌握: ${report.results.mastered.length} 个`);
console.log(`学习路径: ${report.learningPath.length} 个知识点`);

// 测试8：获取学习建议
console.log('\n=== 测试8：获取学习建议 ===');
if (report.results.weak.length > 0) {
  const advice = engine.getStudyAdvice(report.results.weak[0].topicId);
  console.log(`知识点: ${advice.topic}`);
  console.log(`前置知识: ${advice.prerequisites.length} 个`);
  console.log(`后续应用: ${advice.successors.length} 个`);
  console.log(`建议: ${advice.tips.join('; ')}`);
}

// 测试9：知识点权重计算
console.log('\n=== 测试9：知识点权重计算 ===');
const weight = engine.calculateTopicWeight(testTopicId, true);
console.log(`知识点 ${testTopicId} 的权重: ${weight.toFixed(2)}`);

// 测试10：拓扑排序
console.log('\n=== 测试10：拓扑排序 ===');
const topicIds = ['ct_SX2S020', 'ct_SX2S021', 'ct_SX2S022'];
const sorted = engine._topologicalSort(topicIds);
console.log(`排序结果: ${sorted.join(' -> ')}`);

console.log('\n=== 所有测试完成 ===');
