/**
 * generate-manifest.mjs
 * 生成 manifest.json（含文件校验和、版本、统计信息）
 */
import { writeFileSync, readFileSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(__dirname, '..', 'data');
const files = ['topics.json','dependencies.json','curriculum-standards.json','clusters.json'];

const manifest = {
  dataset: 'CN-Primary-Taxonomy',
  datasetNameCn: '中国小学教育知识图谱',
  taxonomyVersion: 'v0.6-expanded',
  generatedAt: new Date().toISOString(),
  basedOn: 'Marble Skill Taxonomy v1 (https://github.com/withmarbleapp/os-taxonomy)',
  country: 'CN',
  grades: [],
  gradeBands: [],
  textbooks: {},
  counts: {},
  files: {}
};

for (const f of files) {
  const p = resolve(DATA, f);
  const buf = readFileSync(p);
  const sha = createHash('sha256').update(buf).digest('hex');
  const j = JSON.parse(buf);
  manifest.files[f] = { bytes: buf.length, sha256: sha };
  if ('topicCount' in j) manifest.counts.topics = j.topicCount;
  if ('edgeCount' in j) manifest.counts.dependencies = j.edgeCount;
  if ('curriculumCount' in j) manifest.counts.curricula = j.curriculumCount;
  if ('clusterCount' in j) manifest.counts.clusters = j.clusterCount;
  if (f === 'topics.json' && Array.isArray(j.topics)) {
    manifest.grades = [...new Set(j.topics.map(t => t.grade))].sort((a, b) => a - b);
    manifest.gradeBands = [...new Set(j.topics.map(t => t.gradeBand))]
      .sort()
      .map(code => ({ L: 'L（低年级1-2年级）', M: 'M（中年级3-4年级）', H: 'H（高年级5-6年级）' }[code]));
    manifest.textbooks = Object.fromEntries(
      [...j.topics.reduce((map, topic) => {
        const key = topic.textbook || '未标注版本';
        map.set(key, (map.get(key) || 0) + 1);
        return map;
      }, new Map()).entries()].sort((a, b) => b[1] - a[1])
    );
  }
}

writeFileSync(resolve(DATA,'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
console.log('✅ manifest.json 写入');
console.log(JSON.stringify(manifest.counts, null, 2));
