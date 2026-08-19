import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', 'data', 'topics-english-versions.json');

const TYPE_LABELS = { CONCEPTUAL: '概念', PROCEDURAL: '技能', REPRESENTATIONAL: '表征', LANGUAGE: '语言', META: '元认知' };
const AGE = { 1:[6,7],2:[7,8],3:[8,9],4:[9,10],5:[10,11],6:[11,12] };
const BAND = g => g <= 2 ? 'L' : g <= 4 ? 'M' : 'H';

function makeTopic(meta, grade, index, spec) {
  const [ageRangeStart, ageRangeEnd] = AGE[grade];
  return {
    id: `ct_${meta.code}${grade}${spec.term === '上' ? 'S' : spec.term === '下' ? 'X' : 'Q'}${String(index).padStart(3, '0')}`,
    type: spec.type,
    typeLabel: TYPE_LABELS[spec.type],
    subject: '英语',
    subjectCode: meta.code,
    domain: spec.domain,
    name: spec.name,
    description: spec.description,
    grade,
    term: spec.term,
    gradeBand: BAND(grade),
    textbook: meta.textbook,
    module: spec.module,
    ageRangeStart,
    ageRangeEnd,
    difficulty: spec.difficulty ?? 2,
    centrality: null,
    evidence: spec.evidence ?? [`能完成“${spec.name}”所在模块的基础英语任务`, `能在对应模块情境中较稳定地理解或表达`],
    commonMistakes: spec.commonMistakes ?? [],
    examTips: spec.examTips ?? null,
    assessmentPrompt: spec.assessmentPrompt ?? null,
    standards: spec.standards ?? []
  };
}

const topics = [];
function pushTopics(meta, grade, specs) {
  specs.forEach((spec, idx) => topics.push(makeTopic(meta, grade, idx + 1, spec)));
}

function starterModule(module, term, theme, vocab, skill) {
  return [
    {
      type: 'LANGUAGE',
      term,
      module,
      domain: '听说',
      name: `${theme}基础表达`,
      description: `围绕“${theme}”模块，能听懂并说出基础课堂交流和情境表达。`,
      standards: ['cn-yingyu-2022:1-2-ts-1']
    },
    {
      type: 'LANGUAGE',
      term,
      module,
      domain: '词汇与字母',
      name: `${vocab}词汇与认读`,
      description: `能认读并使用与“${theme}”模块相关的${vocab}，并配合${skill}开展学习。`,
      standards: ['cn-yingyu-2022:1-2-ci-1', 'cn-yingyu-2022:1-2-zms-1']
    }
  ];
}

const starterMeta = { code: 'YY', textbook: '外研版（一起点）' };
const starterModules = {
  1: [
    ...starterModule('一年级上 Module 1 Hello', '上', '问候与礼貌表达', '问候语和姓名表达', '字母初识'),
    ...starterModule('一年级上 Module 2 Colours and Numbers', '上', '颜色和数字', '颜色词与1-10数字', '听指令认词'),
    ...starterModule('一年级下 Module 1 Family and Animals', '下', '家庭和动物', '家庭成员与动物词汇', '看图说词'),
    ...starterModule('一年级下 Module 2 Classroom English', '下', '课堂指令', '课堂常用语', '字母跟读')
  ],
  2: [
    ...starterModule('二年级上 Module 1 Self-introduction', '上', '自我介绍', '姓名年龄相关表达', '字母规范书写'),
    ...starterModule('二年级上 Module 2 School Things', '上', '学习用品与学校生活', '学习用品词汇', '看图问答'),
    ...starterModule('二年级下 Module 1 Family and Friends', '下', '家庭和朋友', '人物称谓词汇', '简单对话'),
    ...starterModule('二年级下 Module 2 Daily Life', '下', '日常生活', '动作与物品词汇', '听说配对')
  ]
};

for (const grade of [1,2]) pushTopics(starterMeta, grade, starterModules[grade]);

function buildVersionModules(meta, grade, items) {
  const specs = [];
  for (const item of items) {
    specs.push({
      type: 'LANGUAGE',
      term: item.term,
      module: item.module,
      domain: '听说与词汇',
      name: `${item.theme}核心表达`,
      description: `围绕${meta.textbook}${item.module}，能就“${item.theme}”进行基础问答和词汇表达。`,
      standards: grade <= 4 ? ['cn-yingyu-2022:3-4-ts-1', 'cn-yingyu-2022:3-4-ci-1'] : ['cn-yingyu-2022:5-6-ts-1', 'cn-yingyu-2022:5-6-yy-1']
    });
    specs.push({
      type: 'LANGUAGE',
      term: item.term,
      module: item.module,
      domain: item.readingDomain,
      name: `${item.theme}${item.skillLabel}`,
      description: `围绕${meta.textbook}${item.module}，能完成与“${item.theme}”相关的${item.skillLabel}任务。`,
      standards: item.skillStandards
    });
  }
  return specs;
}

const pep = { code: 'YRP', textbook: '人教PEP版（三年级起点）' };
const waiyan = { code: 'YWF', textbook: '外研版（三年级起点）' };
const yilin = { code: 'YYL', textbook: '译林版（三年级起点）' };

const versionModules = {
  3: [
    { term:'上', module:'三上 Unit 1 Hello', theme:'问候与结交朋友', readingDomain:'字母与语音', skillLabel:'字母音认读', skillStandards:['cn-yingyu-2022:3-4-yy-1'] },
    { term:'上', module:'三上 Unit 2 Colours and Numbers', theme:'颜色数字与课堂物品', readingDomain:'阅读', skillLabel:'图文对应阅读', skillStandards:['cn-yingyu-2022:3-4-yd-1'] },
    { term:'下', module:'三下 Unit 3 Family and Animals', theme:'家庭成员与动物', readingDomain:'写作', skillLabel:'句型仿写', skillStandards:['cn-yingyu-2022:3-4-xz-1'] },
    { term:'下', module:'三下 Unit 4 Food and Hobbies', theme:'食物和兴趣爱好', readingDomain:'阅读', skillLabel:'关键词理解', skillStandards:['cn-yingyu-2022:3-4-yd-1'] }
  ],
  4: [
    { term:'上', module:'四上 Unit 1 School Life', theme:'学校生活与课程', readingDomain:'阅读', skillLabel:'短文理解', skillStandards:['cn-yingyu-2022:3-4-yd-1'] },
    { term:'上', module:'四上 Unit 2 Time and Weather', theme:'时间和天气', readingDomain:'写作', skillLabel:'句子书写', skillStandards:['cn-yingyu-2022:3-4-xz-1'] },
    { term:'下', module:'四下 Unit 3 Home and City', theme:'家和城市生活', readingDomain:'阅读', skillLabel:'信息提取', skillStandards:['cn-yingyu-2022:3-4-yd-1'] },
    { term:'下', module:'四下 Unit 4 Daily Routines', theme:'日常作息与行为', readingDomain:'写作', skillLabel:'看图写句', skillStandards:['cn-yingyu-2022:3-4-xz-1'] }
  ],
  5: [
    { term:'上', module:'五上 Unit 1 Personal Information', theme:'个人信息与人物介绍', readingDomain:'阅读', skillLabel:'语篇理解', skillStandards:['cn-yingyu-2022:5-6-yd-1'] },
    { term:'上', module:'五上 Unit 2 Weekend and Travel', theme:'周末和出行计划', readingDomain:'写作', skillLabel:'书面表达', skillStandards:['cn-yingyu-2022:5-6-xz-1'] },
    { term:'下', module:'五下 Unit 3 Health and Food', theme:'健康与饮食', readingDomain:'阅读', skillLabel:'关键信息提取', skillStandards:['cn-yingyu-2022:5-6-yd-1'] },
    { term:'下', module:'五下 Unit 4 Festivals and Culture', theme:'节日与文化', readingDomain:'学习策略', skillLabel:'拼读与猜词', skillStandards:['cn-yingyu-2022:5-6-cl-1'] }
  ],
  6: [
    { term:'上', module:'六上 Unit 1 Past Experiences', theme:'过去经历和事件', readingDomain:'阅读', skillLabel:'语篇概括', skillStandards:['cn-yingyu-2022:5-6-yd-1'] },
    { term:'上', module:'六上 Unit 2 Plans and Dreams', theme:'计划与理想', readingDomain:'写作', skillLabel:'主题写作', skillStandards:['cn-yingyu-2022:5-6-xz-1'] },
    { term:'下', module:'六下 Unit 3 Environment and Technology', theme:'环境与科技', readingDomain:'学习策略', skillLabel:'上下文推断', skillStandards:['cn-yingyu-2022:5-6-cl-1'] },
    { term:'下', module:'六下 Unit 4 Graduation and Communication', theme:'毕业表达与交流', readingDomain:'阅读', skillLabel:'综合理解', skillStandards:['cn-yingyu-2022:5-6-yd-1'] }
  ]
};

for (const meta of [pep, waiyan, yilin]) {
  for (const grade of [3,4,5,6]) {
    pushTopics(meta, grade, buildVersionModules(meta, grade, versionModules[grade]));
  }
}

const data = {
  version: 'v0.3-english-modules',
  note: '英语扩展：外研版（一起点）1-2年级启蒙模块；人教PEP版/外研版/译林版（三年级起点）3-6年级按教材模块组织',
  topicCount: topics.length,
  topics
};

writeFileSync(OUT, JSON.stringify(data, null, 2), 'utf8');
console.log(`✅ 英语扩展与多版本模块化：${topics.length} 个知识点写入 ${OUT}`);
