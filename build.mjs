/**
 * build.mjs
 * CN-Primary-Taxonomy 统一构建脚本
 * 
 * 功能：
 * 1. 生成 shared/data/*.js 数据文件（IIFE格式，支持data-loader自动加载）
 * 2. 可选构建独立HTML版本（嵌入数据，供离线使用）
 *
 * 使用方法:
 *   node build.mjs                  # 生成shared/data/数据文件
 *   node build.mjs --standalone     # 额外生成独立HTML版本
 *   node build.mjs --target=h5      # 仅生成指定入口的独立版本
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const DATA_DIR = resolve(ROOT, 'data');
const SHARED_DATA_DIR = resolve(ROOT, 'shared', 'data');

// 解析命令行参数
const args = process.argv.slice(2);
const BUILD_STANDALONE = args.includes('--standalone');
const targetArg = args.find(a => a.startsWith('--target='));
const TARGET = targetArg ? targetArg.split('=')[1] : null;

console.log('🏗️  CN-Primary-Taxonomy 构建系统\n');

// ========== 步骤1: 生成共享数据文件 ==========
console.log('📦 步骤1: 生成 shared/data/ 数据文件...');

if (!existsSync(SHARED_DATA_DIR)) {
  mkdirSync(SHARED_DATA_DIR, { recursive: true });
  console.log(`   ✓ 创建目录: shared/data/`);
}

// 读取原始JSON数据
const topics = JSON.parse(readFileSync(resolve(DATA_DIR, 'topics.json'), 'utf8'));
const deps = JSON.parse(readFileSync(resolve(DATA_DIR, 'dependencies.json'), 'utf8'));

// 生成 topics.js
const topicsJs = `// CN-Primary-Taxonomy · 知识点数据 (自动生成，请勿手动修改)
window.__CNPT_EMBEDDED = window.__CNPT_EMBEDDED || {};
window.__CNPT_EMBEDDED.topics = ${JSON.stringify(topics).replace(/</g, '\\u003c')};\n`;
writeFileSync(resolve(SHARED_DATA_DIR, 'topics.js'), topicsJs, 'utf8');
console.log(`   ✓ shared/data/topics.js (${(topicsJs.length / 1024 / 1024).toFixed(2)} MB)`);

// 生成 dependencies.js
const depsJs = `// CN-Primary-Taxonomy · 依赖关系数据 (自动生成，请勿手动修改)
window.__CNPT_EMBEDDED = window.__CNPT_EMBEDDED || {};
window.__CNPT_EMBEDDED.dependencies = ${JSON.stringify(deps).replace(/</g, '\\u003c')};\n`;
writeFileSync(resolve(SHARED_DATA_DIR, 'dependencies.js'), depsJs, 'utf8');
console.log(`   ✓ shared/data/dependencies.js (${(depsJs.length / 1024 / 1024).toFixed(2)} MB)`);

// ========== 步骤2: 构建独立版本(可选) ==========
if (BUILD_STANDALONE || TARGET) {
  console.log('\n📦 步骤2: 构建独立HTML版本...');

  const dataScript = `<!-- 内嵌数据 -->
<script>
window.__CNPT_EMBEDDED = {
  topics: ${JSON.stringify(topics).replace(/</g, '\\u003c')},
  dependencies: ${JSON.stringify(deps).replace(/</g, '\\u003c')}
};
</script>`;

  // 定义所有入口
  const entries = [
    { id: 'h5', name: 'H5移动版', dir: 'h5', file: 'index.html' },
    { id: 'parent', name: '家长版', dir: 'parent-web', file: 'index.html' },
    { id: 'student', name: '学生版', dir: 'student-web', file: 'index.html' },
    { id: 'teacher', name: '教师版', dir: 'teacher-web', file: 'index.html' },
  ];

  for (const entry of entries) {
    // 如果指定了target，只构建指定入口
    if (TARGET && entry.id !== TARGET) continue;

    const entryDir = resolve(ROOT, entry.dir);
    const htmlPath = resolve(entryDir, entry.file);

    try {
      const html = readFileSync(htmlPath, 'utf8');

      // 注入数据到head之前
      let output = html.replace(
        /(<title>|<head>)/,
        `${dataScript}\n$1`
      );

      // 路径修正：从子目录移到根目录后，相对路径需要调整
      // 1. ../shared/ → shared/ (向上两级变一级)
      output = output.replace(/\.\.\/shared\//g, 'shared/');
      // 2. css/xxx.css → {dir}/css/xxx.css
      output = output.replace(/(["'])css\//g, `$1${entry.dir}/css/`);
      // 3. js/xxx.js → {dir}/js/xxx.js (针对角色JS文件)
      output = output.replace(/(["'])js\//g, `$1${entry.dir}/js/`);

      const outFileName = `cn-primary-taxonomy-${entry.id}.html`;
      const outPath = resolve(ROOT, outFileName);
      writeFileSync(outPath, output, 'utf8');

      const fileSize = (output.length / 1024 / 1024).toFixed(2);
      console.log(`   ✓ ${entry.name}: ${outFileName} (${fileSize} MB)`);
    } catch (err) {
      console.log(`   ✗ ${entry.name}: 构建失败 (${err.message})`);
    }
  }
}

console.log('\n✅ 构建完成！');

// 步骤3: 构建产物路径验证
console.log('\n📦 步骤3: 验证构建产物路径...');
const standaloneOutputs = [
  'cn-primary-taxonomy-h5.html',
  'cn-primary-taxonomy-parent.html',
  'cn-primary-taxonomy-student.html',
  'cn-primary-taxonomy-teacher.html',
];
let validationIssues = 0;
let validationChecked = 0;

for (const outFile of standaloneOutputs) {
  const outPath = resolve(ROOT, outFile);
  try {
    const html = readFileSync(outPath, 'utf8');
    // 提取所有本地引用
    const refRegex = /(?:src|href)=["']([^"']+)["']/g;
    let m;
    while ((m = refRegex.exec(html)) !== null) {
      const ref = m[1];
      if (ref.startsWith('http')) continue;
      validationChecked++;
      if (!existsSync(resolve(ROOT, ref))) {
        console.log(`   ⚠️ ${outFile}: 断链 ${ref}`);
        validationIssues++;
      }
    }
  } catch {
    // 文件可能不存在，跳过
  }
}

if (validationIssues === 0) {
  console.log(`   ✓ 所有路径验证通过（${validationChecked} 个引用）`);
} else {
  console.log(`   ✗ 发现 ${validationIssues} 个断链`);
}

console.log('\n📖 使用方式:');
console.log('   · 开发模式: 直接用浏览器打开各入口HTML文件（需保持shared/结构）');
console.log('   · 独立版本: cn-primary-taxonomy-*.html（双击即可离线使用）');
console.log('\n🔗 入口页面:');
console.log('   · H5移动版: h5/index.html');
console.log('   · 家长版:   parent-web/index.html');
console.log('   · 学生版:   student-web/index.html');
console.log('   · 教师版:   teacher-web/index.html');
