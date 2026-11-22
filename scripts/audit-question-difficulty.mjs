#!/usr/bin/env node
/**
 * audit-question-difficulty.mjs
 * 题目难易程度标注覆盖审计
 *
 * 检查 data/diagnostic-questions.json 中每题是否标注 difficulty，
 * 并输出分布报告到 reports/question-difficulty-audit.json。
 *
 * 运行：node scripts/audit-question-difficulty.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const KNOWN = ['basic', 'medium', 'hard'];
const NAMES = { basic: '基础', medium: '中等', hard: '拔高' };

function auditQuestions(list, source) {
  const dist = { basic: 0, medium: 0, hard: 0 };
  const unknown = {};
  let missing = 0;
  let empty = 0;

  list.forEach((q, i) => {
    const d = q && q.difficulty;
    if (d == null || d === '') {
      missing++;
    } else if (!KNOWN.includes(d)) {
      unknown[d] = (unknown[d] || 0) + 1;
    } else {
      dist[d]++;
    }
    if (!q || !q.question) empty++;
  });

  const labeled = dist.basic + dist.medium + dist.hard;
  return {
    source,
    total: list.length,
    labeled,
    missing,
    emptyQuestion: empty,
    distribution: dist,
    coverageRate: list.length ? labeled / list.length : 1,
    unknownValues: unknown
  };
}

function main() {
  const diagRaw = JSON.parse(readFileSync(join(root, 'data/diagnostic-questions.json'), 'utf8'));
  const diag = Array.isArray(diagRaw) ? diagRaw : (diagRaw.questions || []);

  const topicsRaw = JSON.parse(readFileSync(join(root, 'data/topics.json'), 'utf8'));
  const topics = Array.isArray(topicsRaw) ? topicsRaw : (topicsRaw.topics || []);
  const quiz = [];
  topics.forEach(t => {
    (t.quizQuestions || []).forEach(q => quiz.push(q));
  });

  const diagnostic = auditQuestions(diag, 'data/diagnostic-questions.json');
  const quizAudit = auditQuestions(quiz, 'data/topics.json#quizQuestions');

  const report = {
    generatedAt: new Date().toISOString(),
    difficultyNames: NAMES,
    diagnostic,
    quiz: quizAudit,
    verdict: diagnostic.missing === 0 && Object.keys(diagnostic.unknownValues).length === 0
      ? 'PASS'
      : 'WARN'
  };

  mkdirSync(join(root, 'reports'), { recursive: true });
  const outPath = join(root, 'reports/question-difficulty-audit.json');
  writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');

  console.log('■ 题目难易程度覆盖审计');
  console.log(`  诊断题：${diagnostic.total} 题，已标注 ${diagnostic.labeled}（覆盖率 ${(diagnostic.coverageRate * 100).toFixed(1)}%）`);
  console.log(`    基础 ${diagnostic.distribution.basic} · 中等 ${diagnostic.distribution.medium} · 拔高 ${diagnostic.distribution.hard}`);
  if (diagnostic.missing) console.log(`    ⚠️ 未标注 ${diagnostic.missing} 题`);
  if (Object.keys(diagnostic.unknownValues).length) console.log(`    ⚠️ 未知难度值：${JSON.stringify(diagnostic.unknownValues)}`);
  console.log(`  随堂题：${quizAudit.total} 题，已标注 ${quizAudit.labeled}`);
  console.log(`  结论：${report.verdict}`);
  console.log(`  报告：${outPath}`);

  process.exit(report.verdict === 'PASS' ? 0 : 1);
}

main();
