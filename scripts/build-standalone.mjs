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

// FSRS 调度参数（可由 scripts/calibrate-fsrs.mjs 校准；缺失时引擎降级为内置默认）
let fsrsParams = null;
try {
  fsrsParams = JSON.parse(readFileSync(resolve(ROOT,'data/fsrs-params.json'),'utf8'));
} catch { /* 忽略，使用内置默认 */ }

const tpl = readFileSync(resolve(ROOT,'web/index.html'),'utf8');

function jsonScript(id, data) {
  return `<script id="${id}" type="application/json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

const fsrsScript = `<script>window.__CNPT_FSRS_PARAMS__ = ${JSON.stringify(fsrsParams || {}).replace(/</g, '\\u003c')};</script>`;
const payload = [
  jsonScript('embedded-topics', topics),
  jsonScript('embedded-dependencies', deps),
  jsonScript('embedded-clusters', clusters),
  fsrsScript
].join('\n');

// 注入到 <head> 内、charset 声明之后（避免浏览器 prescan 回退 Windows-1252 导致中文乱码）
let embedded = tpl;
const headRe = /<head[^>]*>/i;
if (headRe.test(embedded)) {
  // 1) 保证 head 内有 charset 声明
  const headEnd0 = embedded.search(/<\/head>/i);
  const headChunk0 = embedded.slice(0, headEnd0 > 0 ? headEnd0 : 4096);
  if (!/<meta[^>]+charset[^>]+>/i.test(headChunk0)) {
    embedded = embedded.replace(headRe, (m) => `${m}\n<meta charset="utf-8">`);
  }
  // 2) 数据插到 charset meta 之后
  const withPayload = embedded.replace(/(<meta[^>]+charset[^>]+>)/i, (m) => `${m}\n${payload}`);
  embedded = withPayload === embedded
    ? embedded.replace(headRe, (m) => `${m}\n${payload}`)
    : withPayload;
} else {
  embedded = embedded.replace('<script>', `${payload}\n<script>`);
}

const outPath = resolve(ROOT,'cn-primary-taxonomy.html');
// 带 UTF-8 BOM 写入，任何浏览器均按 UTF-8 解码
writeFileSync(outPath, '\uFEFF' + embedded, 'utf8');
console.log(`✅ 独立HTML写入: ${outPath} (${(embedded.length/1024).toFixed(0)} KB)`);
