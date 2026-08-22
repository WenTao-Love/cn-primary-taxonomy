/**
 * embed-d3.mjs
 * 将所有HTML文件中的D3.js CDN引用替换为本地引用
 * -  standalone版本：直接内嵌D3.js（确保完全离线）
 * - 开发版本：使用相对路径引用shared/vendor/d3.min.js
 * 使用方法: node scripts/embed-d3.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, relative, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const D3_LOCAL = resolve(ROOT, 'shared', 'vendor', 'd3.min.js');
const D3_PATTERN = /<script\s+src="https:\/\/cdn\.jsdelivr\.net\/npm\/d3@7\/dist\/d3\.min\.js"><\/script>/g;

// 读取本地D3.js内容
const d3Content = readFileSync(D3_LOCAL, 'utf8');
const d3Inlined = `<script>\n/* D3.js v7 (local offline copy) */\n${d3Content}\n</script>`;

console.log(`📦 D3.js本地文件: ${D3_LOCAL}`);
console.log(`   大小: ${(d3Content.length / 1024).toFixed(1)} KB\n`);

function findHtmlFiles(dir) {
  const files = [];
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      // Skip node_modules, .git, standalone-data
      if (['node_modules', '.git', 'standalone-data'].includes(entry)) continue;
      files.push(...findHtmlFiles(fullPath));
    } else if (entry.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

const allHtmlFiles = findHtmlFiles(ROOT);
let updated = 0;
let skipped = 0;

for (const filePath of allHtmlFiles) {
  const content = readFileSync(filePath, 'utf8');
  
  if (!D3_PATTERN.test(content)) {
    skipped++;
    continue;
  }
  
  // Reset regex lastIndex
  D3_PATTERN.lastIndex = 0;
  
  const isStandalone = filePath.includes('cn-primary-taxonomy-') && 
    (filePath.endsWith('-parent.html') || filePath.endsWith('-student.html') || 
     filePath.endsWith('-teacher.html') || filePath.endsWith('-h5.html') ||
     filePath === resolve(ROOT, 'cn-primary-taxonomy.html'));
  
  let output;
  if (isStandalone) {
    // 独立版本：直接内嵌D3.js
    output = content.replace(D3_PATTERN, d3Inlined);
  } else {
    // 开发版本：使用相对路径
    const fileDir = dirname(filePath);
    const relPath = relative(fileDir, D3_LOCAL).replace(/\\/g, '/');
    output = content.replace(D3_PATTERN, `<script src="${relPath}"></script>`);
  }
  
  writeFileSync(filePath, output, 'utf8');
  updated++;
  const relPath = relative(ROOT, filePath);
  console.log(`   ✓ ${relPath} ${isStandalone ? '(内嵌D3)' : '(本地路径)'}`);
}

console.log(`\n✅ 更新完成: ${updated} 个文件已更新, ${skipped} 个文件跳过`);
console.log(`\n💡 现在所有页面都可以在无网络环境下加载D3.js`);
