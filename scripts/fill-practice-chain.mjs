/**
 * fill-practice-chain.mjs
 * 补全缺失的practiceChain和assessmentTasks字段
 * 根据知识点类型(subnodeType)和学科(subject)生成合理的默认练习链
 * 使用方法: node scripts/fill-practice-chain.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TOPICS_PATH = resolve(ROOT, 'data/topics.json');

// 按学科和子节点类型生成练习链模板
function generatePracticeChain(subject, subnodeType, topicName) {
  const templates = {
    '数学': {
      '例题型': [
        '阅读课本例题，理解解题思路',
        '独立完成课本"做一做"',
        '尝试变式练习，改变题目条件',
        '挑战综合应用题',
        '总结本题型的关键步骤'
      ],
      '易错型': [
        '识别本题常见的错误类型',
        '分析错因，判断自己是否容易犯同类错误',
        '完成基础练习夯实概念',
        '练习易混淆的对比题目',
        '归纳避错要点'
      ],
      '方法型': [
        '理解本方法的核心思想',
        '通过简单例子感受方法的适用条件',
        '按照步骤完成一次完整练习',
        '尝试用方法解决变式问题',
        '比较不同方法的优劣'
      ],
      '基础积累': [
        '回顾相关概念和定义',
        '完成基础填空和判断',
        '在具体情境中辨识概念',
        '练习概念的简单应用',
        '用自己的话总结关键要点'
      ],
      'default': [
        '回顾本节课的核心概念',
        '完成课本对应练习',
        '尝试独立解决一道变式题',
        '检查解题过程是否规范',
        '总结本知识点与前置内容的联系'
      ]
    },
    '语文': {
      '词汇': [
        '朗读词语，读准字音',
        '理解词语意思，用词语造句',
        '在语境中填写合适的词语',
        '辨析近义词或反义词',
        '在写作中尝试使用新学的词语'
      ],
      '句型': [
        '朗读例句，感受句式特点',
        '仿写句子，保持句式一致',
        '变换句式（陈述/疑问/感叹/反问）',
        '在具体语境中运用该句型',
        '检查句子是否通顺、表意是否清楚'
      ],
      '阅读表达': [
        '默读课文，把握主要内容',
        '找出关键句并做批注',
        '回答课后思考题',
        '与同学交流阅读感受',
        '尝试仿写或续写'
      ],
      '基础积累': [
        '朗读课文或古诗，做到字音准确',
        '背诵重点段落或诗句',
        '解释重点字词的意思',
        '用自己的话说说课文大意',
        '完成相关填空练习'
      ],
      'default': [
        '熟读课文，把握主要内容',
        '完成课后基础练习',
        '思考文章表达的思想感情',
        '积累好词好句',
        '尝试用自己的话复述内容'
      ]
    },
    '英语': {
      '词汇': [
        '跟读单词，读准发音',
        '看图识词，建立音形义联系',
        '用单词完成句子填空',
        '在对话情境中运用词汇',
        '尝试用新词写一句话'
      ],
      '句型': [
        '听读例句，理解句意',
        '替换关键词进行句型操练',
        '在给定情境中使用该句型',
        '尝试自主造句',
        '与同学进行对话练习'
      ],
      '语篇': [
        '通读语篇，了解大意',
        '细读语篇，标注关键信息',
        '回答理解性问题',
        '尝试复述或概述内容',
        '完成相关书面练习'
      ],
      '写作任务': [
        '分析写作任务的要求和要点',
        '列出写作提纲（开头/中间/结尾）',
        '根据范文学习表达方式',
        '独立完成初稿',
        '自检并修改'
      ],
      'default': [
        '跟读音频，模仿语音语调',
        '完成课本上的练习活动',
        '在情境中运用所学内容',
        '与同伴进行对话或表演',
        '完成课后巩固练习'
      ]
    },
    '科学': {
      '观察实验': [
        '明确实验目的和材料',
        '观察实验现象并记录',
        '分析现象背后的科学原理',
        '尝试设计简单对比实验',
        '总结实验注意事项'
      ],
      '结论表达': [
        '复习相关科学概念',
        '用科学语言描述现象',
        '尝试用自己的话解释原理',
        '完成课后判断和选择',
        '举例说明生活中的相关现象'
      ],
      'default': [
        '阅读教材，了解本节核心概念',
        '观察图片或实物，建立直观认识',
        '完成思考与讨论',
        '做课后练习题',
        '尝试解释生活中的相关现象'
      ]
    },
    'default': {
      'default': [
        '阅读教材相关内容',
        '完成课本/活动手册上的练习',
        '与同伴交流讨论所学内容',
        '尝试运用所学解决简单问题',
        '自我检测学习效果'
      ]
    }
  };

  const subjectTemplates = templates[subject] || templates['default'];
  const subnodeKey = subnodeType && subjectTemplates[subnodeType] ? subnodeType : 'default';
  return subjectTemplates[subnodeKey] || subjectTemplates['default'];
}

function generateAssessmentTasks(subject, subnodeType) {
  const templates = {
    '数学': {
      '例题型': [
        '能独立完成一道典型例题，过程完整',
        '能识别题型并选择正确的解题策略',
        '能在变式题中灵活运用该方法'
      ],
      '易错型': [
        '能识别题目中的易错点',
        '能正确完成易混淆的对比练习',
        '能归纳并说出避错要点'
      ],
      '方法型': [
        '能说出使用该方法的前提条件',
        '能按步骤正确解题',
        '能判断何时应选择该方法'
      ],
      'default': [
        '能正确完成基础练习（正确率≥80%）',
        '能用自己的话说出解题思路',
        '能检查出作业中的计算/概念错误'
      ]
    },
    '语文': {
      'default': [
        '能正确朗读/背诵相关篇目',
        '能理解文章的主要内容',
        '能运用所学知识完成书面表达'
      ]
    },
    '英语': {
      'default': [
        '能听懂课堂常用指令',
        '能进行简单的口头表达',
        '能读懂包含所学词汇/句型的语篇'
      ]
    },
    'default': {
      'default': [
        '能用自己的话说出核心概念',
        '能运用所学完成相关练习',
        '能在实际情境中识别和应用所学内容'
      ]
    }
  };

  const subjectTemplates = templates[subject] || templates['default'];
  const subnodeKey = subnodeType && subjectTemplates[subnodeType] ? subnodeType : 'default';
  return subjectTemplates[subnodeKey] || subjectTemplates['default'];
}

console.log('📝 开始补全 practiceChain 和 assessmentTasks...\n');

// 读取数据
const data = JSON.parse(readFileSync(TOPICS_PATH, 'utf8'));
const topics = data.topics;

let filled = 0;
let skipped = 0;

topics.forEach(topic => {
  const needsPractice = !topic.practiceChain || topic.practiceChain.length === 0;
  const needsAssessment = !topic.assessmentTasks || topic.assessmentTasks.length === 0;

  if (needsPractice || needsAssessment) {
    const subnodeType = topic.subnodeType || null;
    const subject = topic.subject;

    if (needsPractice) {
      topic.practiceChain = generatePracticeChain(subject, subnodeType, topic.name);
    }
    if (needsAssessment) {
      topic.assessmentTasks = generateAssessmentTasks(subject, subnodeType);
    }
    filled++;
  } else {
    skipped++;
  }
});

// 更新时间戳
data.generatedAt = new Date().toISOString();
data.note = (data.note || '') + ' · 已补全practiceChain和assessmentTasks缺失字段';

// 写回文件
writeFileSync(TOPICS_PATH, JSON.stringify(data, null, 2), 'utf8');

console.log(`✅ 补全完成！`);
console.log(`   - 已填充: ${filled} 个知识点`);
console.log(`   - 已跳过(无需补全): ${skipped} 个知识点`);
console.log(`   - 总计: ${topics.length} 个知识点`);
console.log(`\n📁 输出: ${TOPICS_PATH}`);
console.log(`\n💡 practiceChain和assessmentTasks现已100%覆盖`);
