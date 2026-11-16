/**
 * enrich-topics.mjs
 * 向 data/topics.json 注入「增强引用字段」：modelRef（会动的模型）、wordList（拼写闯关词表）。
 *
 * 设计原则：
 *   - 只注入有明确依据的内容：modelRef 依据知识点的教学内容匹配已有模型；
 *     wordList 的单词全部来自主题 description 中明确出现的词（不编造词表）。
 *   - 幂等：可重复运行；已存在的字段以本表为准（覆盖）。
 *   - 本脚本在 merge.mjs / compute-centrality.mjs 之后运行。
 *
 * 用法：
 *   node scripts/enrich-topics.mjs            # 注入并写回
 *   node scripts/enrich-topics.mjs --dry-run  # 只打印统计
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(__dirname, '..', 'data');
const TOPICS_FILE = resolve(DATA, 'topics.json');
const DRY_RUN = process.argv.includes('--dry-run');

// 会动的模型引用（模型实现见 shared/js/components/visual-models.js）
const MODEL_REFS = {
  // 分数条
  'ct_SX3X019': 'fraction-bar',   // 分数的初步认识
  'ct_SX3X020': 'fraction-bar',   // 几分之一的意义
  'ct_SX5X009': 'fraction-bar',   // 分数的意义和单位1
  'ct_SX6X010': 'fraction-bar',   // 百分数和分数小数互化
  // 数轴
  'ct_SX3X035': 'number-line',    // 数轴上的数感提升
  'ct_SX6X012': 'number-line',    // 负数初步认识
  'ct_SX4X007': 'number-line',    // 小数的意义
  'ct_SX4X008': 'number-line',    // 小数大小比较
  // 三角形内角和
  'ct_SX1S038': 'triangle-angle', // 认识平面图形圆三角形正方形长方形
  'ct_SX5S017': 'triangle-angle', // 三角形面积
  'ct_SX2S020': 'triangle-angle', // 角的初步认识
  'ct_SX4S013': 'triangle-angle', // 角的意义和角的度量
  // 正方体展开图
  'ct_SX1S035': 'cube-net',       // 认识长方体正方体圆柱球
  'ct_SX5X020': 'cube-net'        // 长方体和正方体特征
};

// 拼写闯关词表（单词均来自主题 description 明确出现的词）
const WORD_LISTS = {
  'ct_YY1S001': [
    { word: 'hello', meaning: '你好' },
    { word: 'hi', meaning: '嗨' },
    { word: 'good morning', meaning: '早上好' }
  ],
  'ct_YY1X013': [
    { word: 'sit down', meaning: '坐下' },
    { word: 'stand up', meaning: '起立' },
    { word: 'open your book', meaning: '打开你的书' }
  ],
  'ct_YY2S001': [
    { word: 'name', meaning: '名字' },
    { word: 'age', meaning: '年龄' },
    { word: 'class', meaning: '班级' }
  ],
  'ct_YY2S005': [
    { word: 'book', meaning: '书' },
    { word: 'pen', meaning: '钢笔' },
    { word: 'bag', meaning: '书包' }
  ],
  'ct_YY2X009': [
    { word: 'father', meaning: '父亲' },
    { word: 'mother', meaning: '母亲' },
    { word: 'friend', meaning: '朋友' }
  ],
  'ct_YY2X013': [
    { word: 'eat', meaning: '吃' },
    { word: 'play', meaning: '玩' },
    { word: 'sleep', meaning: '睡觉' }
  ]
};

function main() {
  const topicsJson = JSON.parse(readFileSync(TOPICS_FILE, 'utf8'));
  const topics = topicsJson.topics || [];
  const byId = new Map(topics.map(t => [t.id, t]));

  let modelCount = 0;
  let wordCount = 0;
  let missing = [];

  for (const [id, ref] of Object.entries(MODEL_REFS)) {
    const t = byId.get(id);
    if (!t) { missing.push(`modelRef:${id}`); continue; }
    t.modelRef = ref;
    modelCount++;
  }

  for (const [id, words] of Object.entries(WORD_LISTS)) {
    const t = byId.get(id);
    if (!t) { missing.push(`wordList:${id}`); continue; }
    t.wordList = words.map(w => ({ word: w.word, meaning: w.meaning, phonetic: w.phonetic || null }));
    wordCount += words.length;
  }

  console.log('=== enrich-topics ===');
  console.log('注入 modelRef:', modelCount, '个主题');
  console.log('注入 wordList:', Object.keys(WORD_LISTS).length, '个主题 /', wordCount, '个词');
  if (missing.length) console.log('⚠️ 未找到的主题:', missing.join(', '));

  if (DRY_RUN) { console.log('--dry-run：未写回'); return; }

  topicsJson.generatedAt = new Date().toISOString();
  writeFileSync(TOPICS_FILE, JSON.stringify(topicsJson, null, 2), 'utf8');
  console.log('✅ 已写回 data/topics.json');
}

main();
