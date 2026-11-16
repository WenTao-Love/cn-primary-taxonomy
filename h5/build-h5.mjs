/**
 * build-h5.mjs
 * 构建H5独立版本 - 将数据内嵌到HTML中
 * 使用方法: node h5/build-h5.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const H5_DIR = resolve(__dirname);

console.log('🚀 开始构建 CN-Primary-Taxonomy H5 版本...\n');

// 读取数据
console.log('📦 读取数据文件...');
const topics = JSON.parse(readFileSync(resolve(ROOT, 'data/topics.json'), 'utf8'));
const deps = JSON.parse(readFileSync(resolve(ROOT, 'data/dependencies.json'), 'utf8'));
const clusters = JSON.parse(readFileSync(resolve(ROOT, 'data/clusters.json'), 'utf8'));

// 增强字段（AI 生成初稿：oneLiner / parentGuide / teacherGuide / quizQuestions）
// 与 build.mjs 保持一致：H5 为学习类角色，内嵌增强字段；缺失时降级为 null
let enhanced = null;
try {
  enhanced = JSON.parse(readFileSync(resolve(ROOT, 'data/topics-enhanced-fields-full.json'), 'utf8'));
} catch (err) {
  console.warn(`   ⚠️ 增强字段加载失败: ${err.message}`);
}

console.log(`   ✓ 知识点: ${topics.topicCount} 个`);
console.log(`   ✓ 依赖关系: ${deps.edgeCount} 条`);
console.log(`   ✓ 领域概览: ${clusters.clusters?.length || 0} 个`);
console.log(`   ✓ 增强字段: ${enhanced ? '已加载' : '缺失（降级）'}`);

// 读取H5模板
console.log('\n📄 读取H5模板...');
const html = readFileSync(resolve(H5_DIR, 'index.html'), 'utf8');

// 生成数据注入脚本
console.log('🔧 生成数据注入脚本...');
const enhancedPart = enhanced
  ? `,\n  enhanced: ${JSON.stringify(enhanced).replace(/</g, '\\u003c')}`
  : '';
const dataScript = `<script>
window.__CNPT_EMBEDDED = {
  topics: ${JSON.stringify(topics).replace(/</g, '\\u003c')},
  dependencies: ${JSON.stringify(deps).replace(/</g, '\\u003c')},
  clusters: ${JSON.stringify(clusters).replace(/</g, '\\u003c')}${enhancedPart}
};
</script>`;

// 注入数据到 <head> 内、charset 声明之后（避免 prescan 回退 Windows-1252 乱码）
let output = html;
if (html.includes('<!--DATA_INJECTION_POINT-->')) {
  output = html.replace('<!--DATA_INJECTION_POINT-->', dataScript);
} else {
  const headRe = /<head[^>]*>/i;
  if (headRe.test(output)) {
    // 1) 保证 head 内有 charset 声明
    const headEnd0 = output.search(/<\/head>/i);
    const headChunk0 = output.slice(0, headEnd0 > 0 ? headEnd0 : 4096);
    if (!/<meta[^>]+charset[^>]+>/i.test(headChunk0)) {
      output = output.replace(headRe, (m) => `${m}\n<meta charset="utf-8">`);
    }
    // 2) 数据插到 charset meta 之后
    const withPayload = output.replace(/(<meta[^>]+charset[^>]+>)/i, (m) => `${m}\n${dataScript}`);
    output = withPayload === output
      ? output.replace(headRe, (m) => `${m}\n${dataScript}`)
      : withPayload;
  } else {
    output = output.replace(/(<title>|<html[^>]*>)/i, (m) => `${m}\n${dataScript}`);
  }
}

// 写入输出文件（带 UTF-8 BOM，杜绝中文乱码）
const outPath = resolve(ROOT, 'cn-primary-taxonomy-h5.html');
writeFileSync(outPath, '\uFEFF' + output, 'utf8');

const fileSize = (output.length / 1024 / 1024).toFixed(2);
console.log(`\n✅ H5独立版本构建成功！`);
console.log(`   输出路径: ${outPath}`);
console.log(`   文件大小: ${fileSize} MB`);
console.log(`\n💡 使用方式：双击打开即可在浏览器中运行，无需服务器`);
console.log(`📱 支持手机浏览器、微信内置浏览器、移动端Chrome等`);
