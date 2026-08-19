import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(__dirname, '..', 'data');
const OUT = resolve(DATA, 'topics-shuxue-versions.json');

const versions = [
  { code: 'SXB', textbook: '北师大版' },
  { code: 'SXS', textbook: '苏教版' }
];

const baseFiles = readdirSync(DATA)
  .filter(name => /^topics-shuxue-g[1-6]\.json$/i.test(name))
  .sort();

const baseTopics = baseFiles.flatMap(name => JSON.parse(readFileSync(resolve(DATA, name), 'utf8')).topics);

const topics = [];
for (const version of versions) {
  for (const topic of baseTopics) {
    topics.push({
      ...topic,
      id: topic.id.replace(/^ct_SX/, `ct_${version.code}`),
      subjectCode: version.code,
      textbook: version.textbook,
      description: `${topic.description}（按${version.textbook}小学数学核心内容口径映射）`
    });
  }
}

const data = {
  version: 'v0.3-math-versions',
  note: '数学多版本扩展：在现有人教版主干基础上补充北师大版、苏教版版本映射知识点',
  topicCount: topics.length,
  topics
};

writeFileSync(OUT, JSON.stringify(data, null, 2), 'utf8');
console.log(`✅ 数学多版本：${topics.length} 个知识点写入 ${OUT}`);
