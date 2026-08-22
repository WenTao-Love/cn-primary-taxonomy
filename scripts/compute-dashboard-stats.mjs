/**
 * compute-dashboard-stats.mjs
 * 从真实数据计算管理驾驶舱需要的所有统计指标
 * 输出: docs/dashboard-data.js (可被HTML直接引用)
 * 使用方法: node scripts/compute-dashboard-stats.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATA_DIR = resolve(ROOT, 'data');

// 读取数据
const topics = JSON.parse(readFileSync(resolve(DATA_DIR, 'topics.json'), 'utf8'));
const deps = JSON.parse(readFileSync(resolve(DATA_DIR, 'dependencies.json'), 'utf8'));

const allTopics = topics.topics;
const allDeps = deps.dependencies;

// ========== 核心统计 ==========
const stats = {
  generatedAt: new Date().toISOString(),
  version: topics.version || 'unknown',
  totalTopics: allTopics.length,
  totalDeps: allDeps.length,
  hardDeps: allDeps.filter(d => d.strength === 'hard').length,
  softDeps: allDeps.filter(d => d.strength === 'soft').length,
};

// ========== 学科分布 ==========
const subjectDist = {};
allTopics.forEach(t => {
  if (!subjectDist[t.subject]) subjectDist[t.subject] = 0;
  subjectDist[t.subject]++;
});
stats.subjectDistribution = subjectDist;
stats.subjectCount = Object.keys(subjectDist).length;

// ========== 年级分布 ==========
const gradeDist = {};
allTopics.forEach(t => {
  const g = `${t.grade}年级`;
  if (!gradeDist[g]) gradeDist[g] = 0;
  gradeDist[g]++;
});
stats.gradeDistribution = gradeDist;

// ========== 教材版本分布 ==========
const textbookDist = {};
allTopics.forEach(t => {
  const tb = t.textbook || '未标注';
  if (!textbookDist[tb]) textbookDist[tb] = 0;
  textbookDist[tb]++;
});
stats.textbookDistribution = textbookDist;
stats.textbookCount = Object.keys(textbookDist).length;

// ========== 依赖强度分布 ==========
stats.depStrengthDist = {
  hard: stats.hardDeps,
  soft: stats.softDeps,
  hardRatio: (stats.hardDeps / stats.totalDeps * 100).toFixed(1)
};

// ========== 难度分布 ==========
const diffDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
allTopics.forEach(t => {
  const d = t.difficulty || 3;
  diffDist[d] = (diffDist[d] || 0) + 1;
});
stats.difficultyDistribution = diffDist;

// ========== 子节点类型分布 ==========
const subnodeTypeDist = {};
allTopics.forEach(t => {
  const st = subnodeTypeDist[t.subnodeType || '主干节点'];
  subnodeTypeDist[t.subnodeType || '主干节点'] = (subnodeTypeDist[t.subnodeType || '主干节点'] || 0) + 1;
});
stats.subnodeTypeDistribution = subnodeTypeDist;

// ========== 跨年级依赖统计 ==========
let crossGradeDeps = 0;
const topicMap = new Map(allTopics.map(t => [t.id, t]));
allDeps.forEach(d => {
  const source = topicMap.get(d.prerequisiteId);
  const target = topicMap.get(d.topicId);
  if (source && target && source.grade !== target.grade) {
    crossGradeDeps++;
  }
});
stats.crossGradeDeps = crossGradeDeps;
stats.crossGradeRatio = (crossGradeDeps / stats.totalDeps * 100).toFixed(1);

// ========== 学科间依赖统计 ==========
let crossSubjectDeps = 0;
allDeps.forEach(d => {
  const source = topicMap.get(d.prerequisiteId);
  const target = topicMap.get(d.topicId);
  if (source && target && source.subject !== target.subject) {
    crossSubjectDeps++;
  }
});
stats.crossSubjectDeps = crossSubjectDeps;
stats.crossSubjectRatio = (crossSubjectDeps / stats.totalDeps * 100).toFixed(1);

// ========== 知识点掌握率模拟（基于字段完整度） ==========
// 用字段完整度作为"数据质量"指标，间接反映可用性
let totalScore = 0;
let maxScore = 0;
allTopics.forEach(t => {
  let score = 0;
  if (t.practiceChain && t.practiceChain.length > 0) score++;
  if (t.assessmentTasks && t.assessmentTasks.length > 0) score++;
  if (t.commonMistakes && t.commonMistakes.length > 0) score++;
  if (t.evidence && t.evidence.length > 0) score++;
  if (t.standards && t.standards.length > 0) score++;
  if (t.skillRubric) score++;
  totalScore += score;
  maxScore += 6;
});
stats.dataQualityScore = (totalScore / maxScore * 100).toFixed(1);

// ========== 各学科数据质量 ==========
const subjectQuality = {};
const subjectTopics = {};
allTopics.forEach(t => {
  if (!subjectTopics[t.subject]) subjectTopics[t.subject] = [];
  subjectTopics[t.subject].push(t);
});
Object.entries(subjectTopics).forEach(([subj, tpcs]) => {
  let s = 0, m = 0;
  tpcs.forEach(t => {
    let score = 0;
    if (t.practiceChain && t.practiceChain.length > 0) score++;
    if (t.assessmentTasks && t.assessmentTasks.length > 0) score++;
    if (t.commonMistakes && t.commonMistakes.length > 0) score++;
    if (t.evidence && t.evidence.length > 0) score++;
    if (t.standards && t.standards.length > 0) score++;
    if (t.skillRubric) score++;
    s += score; m += 6;
  });
  subjectQuality[subj] = (s / m * 100).toFixed(1);
});
stats.subjectQuality = subjectQuality;

// ========== 生成JS文件 ==========
const jsContent = `// CN-Primary-Taxonomy · 管理驾驶舱数据 (自动生成，请勿手动修改)
// 数据来源: data/topics.json + data/dependencies.json
window.__DASHBOARD_STATS__ = ${JSON.stringify(stats, null, 2)};
`;

const outPath = resolve(ROOT, 'docs', 'dashboard-data.js');
writeFileSync(outPath, jsContent, 'utf8');

console.log('📊 管理驾驶舱统计数据已生成\n');
console.log(`   知识点总数: ${stats.totalTopics}`);
console.log(`   依赖关系: ${stats.totalDeps} (强依赖${stats.hardDeps}, 弱依赖${stats.softDeps})`);
console.log(`   学科数: ${stats.subjectCount}`);
console.log(`   教材版本: ${stats.textbookCount}`);
console.log(`   跨年级依赖: ${stats.crossGradeDeps} (${stats.crossGradeRatio}%)`);
console.log(`   跨学科依赖: ${stats.crossSubjectDeps} (${stats.crossSubjectRatio}%)`);
console.log(`   数据质量分: ${stats.dataQualityScore}%`);
console.log(`\n📁 输出: ${outPath}`);
console.log(`\n💡 驾驶舱HTML将引用此数据文件显示真实统计`);
