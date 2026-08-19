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

function jsonScript(id, data) {
  return `<script id="${id}" type="application/json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

const payload = [
  jsonScript('embedded-topics', topics),
  jsonScript('embedded-dependencies', deps),
  jsonScript('embedded-clusters', clusters)
].join('\n');

const embedded = tpl.replace('<script>', `${payload}\n<script>`);

const outPath = resolve(ROOT,'cn-primary-taxonomy.html');
writeFileSync(outPath, embedded, 'utf8');
console.log(`✅ 独立HTML写入: ${outPath} (${(embedded.length/1024).toFixed(0)} KB)`);
