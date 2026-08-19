/**
 * merge.mjs
 * 合并所有学科知识点，生成最终 topics.json，并统计数据
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(__dirname, '..', 'data');

// 读三个分文件
const yw = JSON.parse(readFileSync(resolve(DATA, 'topics-yuwen-g2.json'), 'utf8'));
const sx = JSON.parse(readFileSync(resolve(DATA, 'topics-shuxue-g2.json'), 'utf8'));
const oth = JSON.parse(readFileSync(resolve(DATA, 'topics-others-g2.json'), 'utf8'));

const all = [...yw.topics, ...sx.topics, ...oth.topics];

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
all.forEach(t => {
  bySubject[t.subject] = (bySubject[t.subject]||0) + 1;
  byDomain[t.domain] = (byDomain[t.domain]||0) + 1;
  if (t.term) byTerm[t.subject+'/'+t.term] = (byTerm[t.subject+'/'+t.term]||0)+1;
  byType[t.typeLabel] = (byType[t.typeLabel]||0) + 1;
});

console.log('=== 知识点统计 ===');
console.log('总知识点:', all.length);
console.log('\n按学科:');
Object.entries(bySubject).sort((a,b)=>b[1]-a[1]).forEach(([s,c])=>console.log(' ', s+':', c));
console.log('\n按类型:');
Object.entries(byType).forEach(([t,c])=>console.log(' ', t+':', c));

// 写 topics.json
const topicsJson = {
  version: 'v0.1-mvp',
  generatedAt: new Date().toISOString(),
  grade: 2,
  note: 'MVP版本：二年级全学科代表性知识点',
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
