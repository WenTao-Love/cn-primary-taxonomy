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

console.log(`   ✓ 知识点: ${topics.topicCount} 个`);
console.log(`   ✓ 依赖关系: ${deps.edgeCount} 条`);
console.log(`   ✓ 领域概览: ${clusters.clusters?.length || 0} 个`);

// 读取H5模板
console.log('\n📄 读取H5模板...');
const html = readFileSync(resolve(H5_DIR, 'index.html'), 'utf8');

// 生成数据注入脚本
console.log('🔧 生成数据注入脚本...');
const dataScript = `<script>
window.__CNPT_EMBEDDED = {
  topics: ${JSON.stringify(topics).replace(/</g, '\\u003c')},
  dependencies: ${JSON.stringify(deps).replace(/</g, '\\u003c')},
  clusters: ${JSON.stringify(clusters).replace(/</g, '\\u003c')}
};
</script>`;

// 替换数据注入点
const output = html.replace(
  '<!--DATA_INJECTION_POINT-->',
  dataScript
);

// 写入输出文件
const outPath = resolve(ROOT, 'cn-primary-taxonomy-h5.html');
writeFileSync(outPath, output, 'utf8');

const fileSize = (output.length / 1024 / 1024).toFixed(2);
console.log(`\n✅ H5独立版本构建成功！`);
console.log(`   输出路径: ${outPath}`);
console.log(`   文件大小: ${fileSize} MB`);
console.log(`\n💡 使用方式：双击打开即可在浏览器中运行，无需服务器`);
console.log(`📱 支持手机浏览器、微信内置浏览器、移动端Chrome等`);
