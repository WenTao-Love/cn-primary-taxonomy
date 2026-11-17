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

// 构建版本戳：附加到分包数据脚本引用上，杜绝浏览器复用旧缓存
const ASSET_VER = String(Date.now());

/**
 * 给 HTML 中指向本地文件的 js/css 引用附加 ?v=<ver>（CDN/data: 链接跳过）
 */
function stampLocalAssets(html, ver) {
  return html.replace(/((?:src|href)\s*=\s*["'])([^"']+?\.)(js|css)(["'])/g,
    (m, pre, path, ext, q) => {
      if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:') || path.includes('?')) return m;
      return `${pre}${path}${ext}?v=${ver}${q}`;
    });
}

mkdirSync(OUT_DIR, { recursive: true });

const topics = JSON.parse(readFileSync(resolve(ROOT, 'data/topics.json'), 'utf8'));
const deps = JSON.parse(readFileSync(resolve(ROOT, 'data/dependencies.json'), 'utf8'));
const clusters = JSON.parse(readFileSync(resolve(ROOT, 'data/clusters.json'), 'utf8'));

// FSRS 调度参数（可由 scripts/calibrate-fsrs.mjs 校准；缺失时引擎降级为内置默认）
let fsrsParams = null;
try {
  fsrsParams = JSON.parse(readFileSync(resolve(ROOT, 'data/fsrs-params.json'), 'utf8'));
} catch { /* 忽略，使用内置默认 */ }

// 诊断题（根因回溯诊断；缺失时为空数组，组件回退 quizQuestions/commonMistakes）
let diagnosticQuestions = [];
try {
  const dq = JSON.parse(readFileSync(resolve(ROOT, 'data/diagnostic-questions.json'), 'utf8'));
  diagnosticQuestions = Array.isArray(dq.questions) ? dq.questions : [];
} catch { /* 忽略，回退 quizQuestions */ }

// 跨学科主题研修（缺失时为空，主题模块降级）
let themesData = { themes: [] };
try {
  themesData = JSON.parse(readFileSync(resolve(ROOT, 'data/themes.json'), 'utf8'));
} catch { /* 忽略，主题模块降级 */ }
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
writeFileSync(resolve(OUT_DIR, 'diagnostic-questions.js'),
  `window.__CNPT_DIAGNOSTIC_QUESTIONS__ = ${JSON.stringify(diagnosticQuestions).replace(/</g, '\\u003c')};\n`, 'utf8');
writeFileSync(resolve(OUT_DIR, 'themes.js'),
  `window.__CNPT_THEMES__ = ${JSON.stringify(themesData).replace(/</g, '\\u003c')};\n`, 'utf8');

// 注入到 <head> 内、charset 声明之后（避免浏览器 prescan 回退 Windows-1252 导致中文乱码）
const headRe = /<head[^>]*>/i;
let injected = tpl;
if (headRe.test(injected)) {
  // 1) 保证 head 内有 charset 声明
  const headEnd0 = injected.search(/<\/head>/i);
  const headChunk0 = injected.slice(0, headEnd0 > 0 ? headEnd0 : 4096);
  if (!/<meta[^>]+charset[^>]+>/i.test(headChunk0)) {
    injected = injected.replace(headRe, (m) => `${m}\n<meta charset="utf-8">`);
  }
  // 2) 数据脚本插到 charset meta 之后
  const fsrsTag = `<script>window.__CNPT_FSRS_PARAMS__ = ${JSON.stringify(fsrsParams || {}).replace(/</g, '\\u003c')};</script>`;
  const tags = '<script src="./standalone-data/topics.js"></script>\n<script src="./standalone-data/dependencies.js"></script>\n<script src="./standalone-data/clusters.js"></script>\n<script src="./standalone-data/diagnostic-questions.js"></script>\n<script src="./standalone-data/themes.js"></script>\n' + fsrsTag;
  const withTags = injected.replace(/(<meta[^>]+charset[^>]+>)/i, (m) => `${m}\n${tags}`);
  injected = withTags === injected
    ? injected.replace(headRe, (m) => `${m}\n${tags}`)
    : withTags;
} else {
  injected = injected.replace('<script>', `<script src="./standalone-data/topics.js"></script>\n<script src="./standalone-data/dependencies.js"></script>\n<script src="./standalone-data/clusters.js"></script>\n<script src="./standalone-data/diagnostic-questions.js"></script>\n<script src="./standalone-data/themes.js"></script>\n<script>`);
}
// 本地 JS/CSS 引用附加构建版本戳，避免浏览器复用旧缓存
injected = stampLocalAssets(injected, ASSET_VER);
const finalHtml = injected;

const outPath = resolve(ROOT, 'cn-primary-taxonomy-split.html');
// 带 UTF-8 BOM 写入，任何浏览器均按 UTF-8 解码
writeFileSync(outPath, '\uFEFF' + finalHtml, 'utf8');
console.log(`✅ 拆分版HTML写入: ${outPath}`);
console.log(`✅ 拆分数据目录写入: ${OUT_DIR}`);
