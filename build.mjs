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

// FSRS 调度参数（可由 scripts/calibrate-fsrs.mjs 校准；缺失时引擎降级为内置默认）
let fsrsParams = null;
try {
  fsrsParams = JSON.parse(readFileSync(resolve(DATA_DIR, 'fsrs-params.json'), 'utf8'));
} catch (err) {
  console.warn(`   ⚠️ FSRS 参数加载失败，将使用引擎内置默认: ${err.message}`);
}

// 增强字段（AI 生成初稿：oneLiner / parentGuide / teacherGuide / quizQuestions）
// 文件缺失或损坏时降级为 null，不影响主数据构建
let enhanced = null;
try {
  enhanced = JSON.parse(readFileSync(resolve(DATA_DIR, 'topics-enhanced-fields-full.json'), 'utf8'));
} catch (err) {
  console.warn(`   ⚠️ 增强字段加载失败，构建将不含增强内容: ${err.message}`);
}

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

// 生成 enhanced.js（增强字段独立数据集，按需加载，避免主数据膨胀）
if (enhanced) {
  const enhancedJs = `// CN-Primary-Taxonomy · 知识点增强字段 (自动生成，请勿手动修改)
// 内容为 AI 生成初稿，未经学科教师逐条审核，仅供启发，不可直接作为教学依据。
window.__CNPT_EMBEDDED = window.__CNPT_EMBEDDED || {};
window.__CNPT_EMBEDDED.enhanced = ${JSON.stringify(enhanced).replace(/</g, '\\u003c')};\n`;
  writeFileSync(resolve(SHARED_DATA_DIR, 'enhanced.js'), enhancedJs, 'utf8');
  console.log(`   ✓ shared/data/enhanced.js (${(enhancedJs.length / 1024 / 1024).toFixed(2)} MB)`);
} else {
  // 保持旧产物不残留：写入空壳，避免 data-loader 读到过期数据
  const emptyJs = `// CN-Primary-Taxonomy · 知识点增强字段 (自动生成，请勿手动修改)\nwindow.__CNPT_EMBEDDED = window.__CNPT_EMBEDDED || {};\nwindow.__CNPT_EMBEDDED.enhanced = null;\n`;
  writeFileSync(resolve(SHARED_DATA_DIR, 'enhanced.js'), emptyJs, 'utf8');
  console.log(`   ✓ shared/data/enhanced.js (0.00 MB, 空壳)`);
}

// 生成 fsrs-params.js（开发模式；standalone 也会内嵌同一份参数）
const fsrsParamsJs = `// CN-Primary-Taxonomy · FSRS 调度参数 (自动生成，请勿手动修改)\nwindow.__CNPT_FSRS_PARAMS__ = ${JSON.stringify(fsrsParams || {}).replace(/</g, '\\u003c')};\n`;
writeFileSync(resolve(SHARED_DATA_DIR, 'fsrs-params.js'), fsrsParamsJs, 'utf8');
console.log(`   ✓ shared/data/fsrs-params.js (${((fsrsParams && fsrsParams.w) ? '已校准/默认 17 参数' : '降级空对象')})`);

// ========== 步骤2: 构建独立版本(可选) ==========
if (BUILD_STANDALONE || TARGET) {
  console.log('\n📦 步骤2: 构建独立HTML版本...');

  // 仅学习类角色内嵌增强字段（控制单文件体积），其余角色留空由 data-loader 降级
  const dataScriptFor = (withEnhanced) => {
    const enhancedPart = withEnhanced && enhanced
      ? `,\n  enhanced: ${JSON.stringify(enhanced).replace(/</g, '\\u003c')}`
      : '';
    return `<!-- 内嵌数据 -->
<script>
window.__CNPT_EMBEDDED = {
  topics: ${JSON.stringify(topics).replace(/</g, '\\u003c')},
  dependencies: ${JSON.stringify(deps).replace(/</g, '\\u003c')}${enhancedPart}
};
</script>
<script>
window.__CNPT_FSRS_PARAMS__ = ${JSON.stringify(fsrsParams || {}).replace(/</g, '\\u003c')};
</script>`;
  };

  // 定义所有入口
  const entries = [
    { id: 'h5', name: 'H5移动版', dir: 'h5', file: 'index.html', enhanced: true },
    { id: 'parent', name: '家长版', dir: 'parent-web', file: 'index.html', enhanced: true },
    { id: 'student', name: '学生版', dir: 'student-web', file: 'index.html', enhanced: true },
    { id: 'teacher', name: '教师版', dir: 'teacher-web', file: 'index.html', enhanced: true },
    { id: 'training', name: '培训机构版', dir: 'training-web', file: 'index.html', enhanced: true },
    { id: 'admin', name: '教育管理版', dir: 'admin-web', file: 'index.html', enhanced: false },
    { id: 'researcher', name: '教研员版', dir: 'researcher-web', file: 'index.html', enhanced: false },
    { id: 'headteacher', name: '班主任版', dir: 'headteacher-web', file: 'index.html', enhanced: false },
    { id: 'testdesigner', name: '出题人版', dir: 'testdesigner-web', file: 'index.html', enhanced: false },
    { id: 'transition', name: '升学过渡版', dir: 'transition-web', file: 'index.html', enhanced: true },
    { id: 'edu-sales', name: '教育销售版', dir: 'edu-sales', file: 'index.html', enhanced: false },
    { id: 'competitor-analyst', name: '竞品分析版', dir: 'competitor-analyst', file: 'index.html', enhanced: false },
    { id: 'school-entity', name: '学校本体版', dir: 'school-entity', file: 'index.html', enhanced: false },
    { id: 'admissions', name: '招生办版', dir: 'admissions', file: 'index.html', enhanced: false },
    { id: 'afterschool', name: '课后服务版', dir: 'afterschool', file: 'index.html', enhanced: true },
  ];

  for (const entry of entries) {
    // 如果指定了target，只构建指定入口
    if (TARGET && entry.id !== TARGET) continue;

    const entryDir = resolve(ROOT, entry.dir);
    const htmlPath = resolve(entryDir, entry.file);

    try {
      const html = readFileSync(htmlPath, 'utf8');

      // 注入数据：必须位于 <head> 内、charset 声明之后，否则浏览器 prescan 前 1024 字节
      // 找不到 charset 会回退 Windows-1252，导致内嵌中文全部乱码。
      const dataScript = dataScriptFor(entry.enhanced);
      let output = html;
      const headRe = /<head[^>]*>/i;
      if (headRe.test(output)) {
        // 1) 保证 head 内有 charset 声明（缺失则补在最前）
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

      // 路径修正：从子目录移到根目录后，相对路径需要调整
      // 1. ../shared/ → shared/ (向上两级变一级)
      output = output.replace(/\.\.\/shared\//g, 'shared/');
      // 2. css/xxx.css → {dir}/css/xxx.css
      output = output.replace(/(["'])css\//g, `$1${entry.dir}/css/`);
      // 3. js/xxx.js → {dir}/js/xxx.js (针对角色JS文件)
      output = output.replace(/(["'])js\//g, `$1${entry.dir}/js/`);

      const outFileName = `cn-primary-taxonomy-${entry.id}.html`;
      const outPath = resolve(ROOT, outFileName);
      // 写 UTF-8 BOM：任何浏览器/微信内置浏览器均按 UTF-8 解码，杜绝中文乱码
      writeFileSync(outPath, '\uFEFF' + output, 'utf8');

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
  'cn-primary-taxonomy-training.html',
  'cn-primary-taxonomy-admin.html',
  'cn-primary-taxonomy-researcher.html',
  'cn-primary-taxonomy-headteacher.html',
  'cn-primary-taxonomy-testdesigner.html',
  'cn-primary-taxonomy-transition.html',
  'cn-primary-taxonomy-edu-sales.html',
  'cn-primary-taxonomy-competitor-analyst.html',
  'cn-primary-taxonomy-school-entity.html',
  'cn-primary-taxonomy-admissions.html',
  'cn-primary-taxonomy-afterschool.html',
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
      if (ref.startsWith('http') || ref.startsWith('#')) continue;
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
console.log('   · 培训机构版: training-web/index.html');
console.log('   · 教育管理版: admin-web/index.html');
console.log('   · 教研员版: researcher-web/index.html');
console.log('   · 班主任版: headteacher-web/index.html');
console.log('   · 出题人版: testdesigner-web/index.html');
console.log('   · 升学过渡版: transition-web/index.html');
console.log('   · 教育销售版: edu-sales/index.html');
console.log('   · 竞品分析版: competitor-analyst/index.html');
console.log('   · 学校本体版: school-entity/index.html');
console.log('   · 招生办版: admissions/index.html');
console.log('   · 课后服务版: afterschool/index.html');
