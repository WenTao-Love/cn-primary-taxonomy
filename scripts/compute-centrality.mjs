/**
 * compute-centrality.mjs
 * 基于 dependencies.json 计算每个知识点的「枢纽度」并写回 topics.json 的 centrality 字段。
 *
 * 口径（可解释、可复算）：
 *   - 边 topicId -> prerequisiteId 表示「topicId 依赖 prerequisiteId」
 *   - hard 边权重 1.0，soft 边权重 0.5
 *   - score(v) = 1.0 * 入度加权(v) + 0.5 * 出度加权(v)
 *       入度 = 有多少后续主题依赖 v（前置枢纽性，主项）
 *       出度 = v 依赖多少前置（学习成本，次项）
 *   - centrality = score(v) / max(score)，保留 4 位小数；无图时 null
 *
 * 用法：
 *   node scripts/compute-centrality.mjs            # 计算并写回 data/topics.json
 *   node scripts/compute-centrality.mjs --dry-run  # 只打印统计不写回
 *
 * 注意：本脚本应在 merge.mjs 之后运行（merge 会重建 topics.json）。
 *       重跑 merge 后 centrality 会回到 null，需重新执行本脚本。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(__dirname, '..', 'data');
const TOPICS_FILE = resolve(DATA, 'topics.json');
const DEPS_FILE = resolve(DATA, 'dependencies.json');

const DRY_RUN = process.argv.includes('--dry-run');

const HARD_WEIGHT = 1.0;
const SOFT_WEIGHT = 0.5;
const IN_WEIGHT = 1.0;   // 入度（被依赖）权重
const OUT_WEIGHT = 0.5;  // 出度（依赖别人）权重

function main() {
  const topicsJson = JSON.parse(readFileSync(TOPICS_FILE, 'utf8'));
  const depsJson = JSON.parse(readFileSync(DEPS_FILE, 'utf8'));
  const topics = topicsJson.topics || [];
  const deps = depsJson.dependencies || [];

  const ids = new Set(topics.map(t => t.id));

  // 入度 / 出度（加权）
  const inScore = new Map();
  const outScore = new Map();
  for (const id of ids) { inScore.set(id, 0); outScore.set(id, 0); }

  let hardCount = 0;
  let softCount = 0;
  let dangling = 0;
  for (const d of deps) {
    const from = d.topicId;       // 依赖方
    const to = d.prerequisiteId;  // 被依赖方
    if (!ids.has(from) || !ids.has(to)) { dangling++; continue; }
    const w = d.strength === 'soft' ? SOFT_WEIGHT : HARD_WEIGHT;
    if (d.strength === 'soft') softCount++; else hardCount++;
    // 入度：to 被 from 依赖
    inScore.set(to, inScore.get(to) + w);
    // 出度：from 依赖 to
    outScore.set(from, outScore.get(from) + w);
  }

  // 综合得分
  const score = new Map();
  let maxScore = 0;
  for (const id of ids) {
    const s = IN_WEIGHT * inScore.get(id) + OUT_WEIGHT * outScore.get(id);
    score.set(id, s);
    if (s > maxScore) maxScore = s;
  }

  // 写回
  let filled = 0;
  for (const t of topics) {
    const s = score.get(t.id) || 0;
    const c = maxScore > 0 ? Math.round((s / maxScore) * 10000) / 10000 : null;
    if (c != null && c > 0) filled++;
    t.centrality = c;
  }

  // 统计
  const top = topics
    .filter(t => t.centrality != null)
    .sort((a, b) => b.centrality - a.centrality)
    .slice(0, 10);

  console.log('=== centrality 计算 ===');
  console.log('知识点总数:', topics.length);
  console.log('依赖边总数:', deps.length, `(hard ${hardCount} / soft ${softCount})`);
  if (dangling) console.log('⚠️ 悬空边（端点不在 topics 中）:', dangling);
  console.log('已填充 centrality:', filled);
  console.log('最高分:', maxScore.toFixed(2));
  console.log('\nTOP 10 枢纽主题:');
  top.forEach((t, i) => {
    console.log(`  ${String(i + 1).padStart(2)}. ${t.id}  ${t.name}  [${t.subject}/${t.grade}年级]  centrality=${t.centrality}`);
  });

  if (DRY_RUN) {
    console.log('\n--dry-run：未写回文件');
    return;
  }

  topicsJson.generatedAt = new Date().toISOString();
  const out = JSON.stringify(topicsJson, null, 2);
  writeFileSync(TOPICS_FILE, out, 'utf8');
  console.log('\n✅ 已写回 data/topics.json');
  console.log('   提示：随后请运行 node scripts/generate-manifest.mjs 更新 manifest 的 SHA-256');
}

main();
