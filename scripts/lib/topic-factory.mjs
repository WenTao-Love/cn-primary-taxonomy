import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(__dirname, '..', '..', 'data');

export const TYPE_LABELS = {
  CONCEPTUAL: '概念',
  PROCEDURAL: '技能',
  REPRESENTATIONAL: '表征',
  LANGUAGE: '语言',
  META: '元认知'
};

const GRADE_BANDS = {
  1: 'L',
  2: 'L',
  3: 'M',
  4: 'M',
  5: 'H',
  6: 'H'
};

const AGE_RANGES = {
  1: [6, 7],
  2: [7, 8],
  3: [8, 9],
  4: [9, 10],
  5: [10, 11],
  6: [11, 12]
};

const TYPE_EVIDENCE = {
  CONCEPTUAL: name => [
    `能用自己的话说明“${name}”的核心意思`,
    `遇到相关问题时能判断是否理解到位`
  ],
  PROCEDURAL: name => [
    `能按步骤独立完成“${name}”相关任务`,
    `遇到同类练习时能较稳定地做对`
  ],
  REPRESENTATIONAL: name => [
    `能用图示、符号或表格正确表示“${name}”`,
    `能在不同表征之间进行简单转换`
  ],
  LANGUAGE: name => [
    `能在口头表达或书面表达中正确运用“${name}”`,
    `能在题目或语境中识别“${name}”的用法`
  ],
  META: name => [
    `能主动使用“${name}”相关策略完成学习任务`,
    `能在提醒减少后保持较稳定的学习习惯`
  ]
};

function defaultAssessmentPrompt(name, type) {
  if (type === 'PROCEDURAL') {
    return `请让{{name}}现场做一道和“${name}”同类型的小题，边做边说出步骤，观察是否真正掌握。`;
  }
  if (type === 'LANGUAGE') {
    return `请让{{name}}读一句或说一句和“${name}”相关的话，看看能不能用得自然、准确。`;
  }
  return `请让{{name}}用自己的话解释“${name}”，再举一个简单例子，看看理解是否到位。`;
}

export function createTopicFactory({ subject, subjectCode, grade, textbook, outputFile, version = 'v0.2-expanded' }) {
  const [ageRangeStart, ageRangeEnd] = AGE_RANGES[grade];
  const gradeBand = GRADE_BANDS[grade];

  const T = (num, spec) => ({
    id: `ct_${subjectCode}${grade}${spec.term === '上' ? 'S' : spec.term === '下' ? 'X' : 'Q'}${String(num).padStart(3, '0')}`,
    type: spec.type,
    typeLabel: TYPE_LABELS[spec.type],
    subject,
    subjectCode,
    domain: spec.domain,
    name: spec.name,
    description: spec.description,
    grade,
    term: spec.term,
    gradeBand,
    textbook,
    ageRangeStart: spec.ageRangeStart ?? ageRangeStart,
    ageRangeEnd: spec.ageRangeEnd ?? ageRangeEnd,
    difficulty: spec.difficulty ?? 3,
    centrality: null,
    evidence: spec.evidence ?? TYPE_EVIDENCE[spec.type](spec.name),
    commonMistakes: spec.commonMistakes ?? [],
    examTips: spec.examTips ?? `常见考法：围绕“${spec.name}”进行基础判断、应用或综合练习。`,
    assessmentPrompt: spec.assessmentPrompt ?? defaultAssessmentPrompt(spec.name, spec.type),
    standards: spec.standards ?? []
  });

  function writeTopics(note, specs) {
    const topics = specs.map((spec, idx) => T(idx + 1, spec));
    const data = {
      version,
      note,
      topicCount: topics.length,
      topics
    };
    writeFileSync(resolve(DATA, outputFile), JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ ${subject}${grade}年级：${topics.length} 个知识点写入 ${outputFile}`);
  }

  return { T, writeTopics };
}
