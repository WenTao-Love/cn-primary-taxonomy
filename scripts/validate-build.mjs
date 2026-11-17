/**
 * validate-build.mjs
 * 构建产物验证脚本
 * 检查所有独立HTML版本引用的文件是否存在
 * 
 * 使用方法:
 *   node scripts/validate-build.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

console.log('🔍 构建产物验证\n');

const standaloneFiles = [
  'cn-primary-taxonomy-h5.html',
  'cn-primary-taxonomy-parent.html',
  'cn-primary-taxonomy-student.html',
  'cn-primary-taxonomy-teacher.html',
  'cn-primary-taxonomy-split.html',
  'cn-primary-taxonomy.html',
];

let totalIssues = 0;
let totalChecked = 0;

for (const file of standaloneFiles) {
  const filePath = resolve(ROOT, file);
  if (!existsSync(filePath)) {
    console.log(`⚠️  ${file} - 文件不存在，跳过`);
    continue;
  }

  const html = readFileSync(filePath, 'utf8');
  console.log(`\n📄 ${file}`);

  // 提取所有 script src
  const scriptRegex = /<script[^>]+src=["']([^"']+)["']/g;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    totalChecked++;
    const src = match[1];
    // 跳过CDN链接
    if (src.startsWith('http://') || src.startsWith('https://')) {
      console.log(`   🌐 ${src} (外部CDN，跳过)`);
      continue;
    }
    const resolved = resolve(ROOT, src.split('?')[0]); // 忽略构建版本戳
    if (!existsSync(resolved)) {
      totalIssues++;
      console.log(`   ❌ ${src} - 文件不存在!`);
    }
  }

  // 提取所有 link href (CSS)
  const linkRegex = /<link[^>]+href=["']([^"']+)["']/g;
  while ((match = linkRegex.exec(html)) !== null) {
    totalChecked++;
    const href = match[1];
    if (href.startsWith('http://') || href.startsWith('https://')) {
      console.log(`   🌐 ${href} (外部CDN，跳过)`);
      continue;
    }
    const resolved = resolve(ROOT, href.split('?')[0]); // 忽略构建版本戳
    if (!existsSync(resolved)) {
      totalIssues++;
      console.log(`   ❌ ${href} - 文件不存在!`);
    }
  }
}

console.log(`\n${'='.repeat(50)}`);
console.log(`总计检查: ${totalChecked} 个引用`);
console.log(`问题数量: ${totalIssues} 个`);
if (totalIssues === 0) {
  console.log('✅ 所有构建产物路径验证通过！');
} else {
  console.log(`❌ 发现 ${totalIssues} 个断链，请修复后再部署`);
  process.exit(1);
}
