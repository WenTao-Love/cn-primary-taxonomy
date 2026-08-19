/**
 * build-standalone.mjs
 * 将数据嵌入HTML生成一个可直接双击打开的独立HTML文件
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const topics = JSON.parse(readFileSync(resolve(ROOT,'data/topics.json'),'utf8'));
const deps = JSON.parse(readFileSync(resolve(ROOT,'data/dependencies.json'),'utf8'));
const clusters = JSON.parse(readFileSync(resolve(ROOT,'data/clusters.json'),'utf8'));

const tpl = readFileSync(resolve(ROOT,'web/index.html'),'utf8');

// Replace fetch calls with embedded data
const embedded = tpl
  .replace("fetch('../data/topics.json').then(r=>r.json())", `Promise.resolve(${JSON.stringify(topics)})`)
  .replace("fetch('../data/dependencies.json').then(r=>r.json())", `Promise.resolve(${JSON.stringify(deps)})`)
  .replace("fetch('../data/clusters.json').then(r=>r.json())", `Promise.resolve(${JSON.stringify(clusters)})`);

const outPath = resolve(ROOT,'cn-primary-taxonomy.html');
writeFileSync(outPath, embedded, 'utf8');
console.log(`✅ 独立HTML写入: ${outPath} (${(embedded.length/1024).toFixed(0)} KB)`);
