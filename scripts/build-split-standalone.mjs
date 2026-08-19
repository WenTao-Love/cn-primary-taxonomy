/**
 * build-split-standalone.mjs
 * 生成拆分版离线页面与分包数据脚本，降低单文件 HTML 体积和首屏压力
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_DIR = resolve(ROOT, 'standalone-data');

mkdirSync(OUT_DIR, { recursive: true });

const topics = JSON.parse(readFileSync(resolve(ROOT, 'data/topics.json'), 'utf8'));
const deps = JSON.parse(readFileSync(resolve(ROOT, 'data/dependencies.json'), 'utf8'));
const clusters = JSON.parse(readFileSync(resolve(ROOT, 'data/clusters.json'), 'utf8'));
const tpl = readFileSync(resolve(ROOT, 'web/index.html'), 'utf8');

function writeChunk(name, data) {
  const filePath = resolve(OUT_DIR, `${name}.js`);
  const content = `window.__CNPT_EMBEDDED = window.__CNPT_EMBEDDED || {};\nwindow.__CNPT_EMBEDDED.${name} = ${JSON.stringify(data)};\n`;
  writeFileSync(filePath, content, 'utf8');
  return filePath;
}

writeChunk('topics', topics);
writeChunk('dependencies', deps);
writeChunk('clusters', clusters);

const injected = tpl.replace(
  '<script>',
  `<script src="./standalone-data/topics.js"></script>\n<script src="./standalone-data/dependencies.js"></script>\n<script src="./standalone-data/clusters.js"></script>\n<script>`
);

const outPath = resolve(ROOT, 'cn-primary-taxonomy-split.html');
writeFileSync(outPath, injected, 'utf8');
console.log(`✅ 拆分版HTML写入: ${outPath}`);
console.log(`✅ 拆分数据目录写入: ${OUT_DIR}`);
