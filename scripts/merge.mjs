/**
 * merge.mjs
 * 自动发现并合并所有 topics-*.json，生成最终 topics.json，并统计数据
 */
import { writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(__dirname, '..', 'data');

const SUBJECT_SEARCH_LABELS = {
  '语文': '语文',
  '数学': '数学',
  '英语': '英语',
  '科学': '科学',
  '道德与法治': '道德与法治',
  '劳动': '劳动',
  '体育与健康': '体育',
  '美术': '美术',
  '音乐': '音乐',
  '信息科技': '信息科技',
  'AI素养': '人工智能'
};

function buildSearchUrl(query) {
  return `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
}

function buildResources(topic) {
  const grade = `${topic.grade}年级`;
  const subject = SUBJECT_SEARCH_LABELS[topic.subject] || topic.subject;
  return [
    {
      title: `${topic.name}典型例题`,
      type: 'example',
      url: buildSearchUrl(`${grade} ${subject} ${topic.name} 典型例题 讲解`),
      source: 'Bing',
      note: '聚合检索入口，可快速定位同主题典型例题'
    },
    {
      title: `${topic.name}练习题`,
      type: 'exercise',
      url: buildSearchUrl(`${grade} ${subject} ${topic.name} 练习题 下载`),
      source: 'Bing',
      note: '聚合检索入口，可快速定位同步练习与题单'
    }
  ];
}

const topicFiles = readdirSync(DATA)
  .filter(name => /^topics-.*\.json$/i.test(name) && name !== 'topics.json')
  .filter(name => {
    if (name === 'topics-others-g2.json' && readdirSync(DATA).includes('topics-others-g1-g6.json')) return false;
    return true;
  })
  .sort();

if (!topicFiles.length) {
  console.error('❌ 未找到可合并的 topics-*.json 文件');
  process.exit(1);
}

const datasets = topicFiles.map(name => ({
  file: name,
  data: JSON.parse(readFileSync(resolve(DATA, name), 'utf8'))
}));

const all = datasets.flatMap(item => item.data.topics).map(topic => ({
  ...topic,
  resources: Array.isArray(topic.resources) && topic.resources.length ? topic.resources : buildResources(topic)
}));

// 检查ID唯一性
const ids = new Set();
const dup = [];
for (const t of all) {
  if (ids.has(t.id)) dup.push(t.id);
  ids.add(t.id);
}
if (dup.length) { console.error('❌ 重复ID:', dup); process.exit(1); }

// 统计
const bySubject = {};
const byDomain = {};
const byTerm = {};
const byType = {};
const byGrade = {};
all.forEach(t => {
  bySubject[t.subject] = (bySubject[t.subject]||0) + 1;
  byDomain[t.domain] = (byDomain[t.domain]||0) + 1;
  if (t.term) byTerm[t.subject+'/'+t.term] = (byTerm[t.subject+'/'+t.term]||0)+1;
  byType[t.typeLabel] = (byType[t.typeLabel]||0) + 1;
  byGrade[t.grade] = (byGrade[t.grade]||0) + 1;
});

console.log('=== 知识点统计 ===');
console.log('总知识点:', all.length);
console.log('\n按学科:');
Object.entries(bySubject).sort((a,b)=>b[1]-a[1]).forEach(([s,c])=>console.log(' ', s+':', c));
console.log('\n按类型:');
Object.entries(byType).forEach(([t,c])=>console.log(' ', t+':', c));
console.log('\n按年级:');
Object.entries(byGrade).sort((a,b)=>Number(a[0])-Number(b[0])).forEach(([g,c])=>console.log(' ', `${g}年级:`, c));
console.log('\n来源文件:');
topicFiles.forEach(name => console.log(' ', name));

// 写 topics.json
const topicsJson = {
  version: 'v0.6-expanded',
  generatedAt: new Date().toISOString(),
  grades: [...new Set(all.map(t => t.grade))].sort((a,b)=>a-b),
  note: '扩展版本：1-6年级主干 + 其他学科全年级主干 + 数学真实题链来源 + 英语分技能rubric + 语文/科学/道法父子节点扩展',
  topicCount: all.length,
  topics: all
};

const topicsStr = JSON.stringify(topicsJson, null, 2);
writeFileSync(resolve(DATA, 'topics.json'), topicsStr, 'utf8');

// 计算 SHA-256 (用于 manifest)
const topicsHash = createHash('sha256').update(topicsStr).digest('hex');
console.log('\ntopics.json SHA256:', topicsHash);
console.log('topics.json 大小:', (topicsStr.length/1024).toFixed(1), 'KB');

export { all as topics, ids as topicIds };
