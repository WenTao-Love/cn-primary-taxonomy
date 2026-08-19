import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', 'data', 'topics-english-versions.json');

const TYPE_LABELS = { CONCEPTUAL: '概念', PROCEDURAL: '技能', REPRESENTATIONAL: '表征', LANGUAGE: '语言', META: '元认知' };
const AGE = { 1:[6,7],2:[7,8],3:[8,9],4:[9,10],5:[10,11],6:[11,12] };
const BAND = g => g <= 2 ? 'L' : g <= 4 ? 'M' : 'H';

function volumeLabel(grade, term) {
  return `${grade}年级${term === '上' ? '上册' : term === '下' ? '下册' : '全册'}`;
}

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
    parentTopicId: null,
    subnodeType: spec.subnodeType || null,
    volume: volumeLabel(grade, spec.term),
    chapter: spec.module,
    lesson: spec.lesson,
    module: spec.module,
    pageRange: spec.pageRange || null,
    ageRangeStart,
    ageRangeEnd,
    difficulty: spec.difficulty ?? 2,
    centrality: null,
    evidence: spec.evidence ?? [`能完成“${spec.name}”对应的模块课时任务`, `能在${spec.module}情境中较稳定地表现出来`],
    commonMistakes: spec.commonMistakes ?? [],
    examTips: spec.examTips ?? null,
    assessmentPrompt: spec.assessmentPrompt ?? null,
    standards: spec.standards ?? [],
    practiceChain: spec.practiceChain ?? [],
    assessmentTasks: spec.assessmentTasks ?? [],
    skillRubric: spec.skillRubric ?? null
  };
}

const topics = [];
function pushTopics(meta, grade, specs) {
  specs.forEach((spec, idx) => topics.push(makeTopic(meta, grade, idx + 1, spec)));
}

function buildRubric(theme, focus, lowGrade = false) {
  const writingCore = lowGrade ? '能规范抄写字母、单词或短语' : '能围绕主题完成句子或简短书面表达';
  return {
    listening: [
      `起步：听到与“${theme}”相关的关键词后，能在提示下做出反应`,
      `达标：能听懂${focus}中的关键信息，并完成基础指认或匹配任务`,
      `提升：能在连续语流中抓取主题和细节信息，判断说话意图`
    ],
    speaking: [
      `起步：能跟读并模仿“${theme}”相关核心表达`,
      `达标：能在问答中较准确使用${focus}进行表达`,
      `提升：能结合情境主动补充信息，表达更连贯自然`
    ],
    reading: [
      `起步：能借助图片和关键词识别“${theme}”相关信息`,
      `达标：能读懂与“${theme}”相关的短句或短文主干意思`,
      `提升：能结合上下文推断词义并概括语篇主要内容`
    ],
    writing: [
      `起步：${writingCore}，格式基本正确`,
      `达标：能围绕“${theme}”写出结构完整、信息基本准确的表达`,
      `提升：能根据任务需要补充细节，使表达更完整、更贴近语境`
    ]
  };
}

function buildModuleChildren(item, standardGroup, lowGrade = false) {
  const writingName = lowGrade ? `${item.theme}字母抄写与表达任务` : `${item.theme}写作任务`;
  const writingDesc = lowGrade
    ? `围绕${item.module}，能完成与“${item.theme}”相关的字母、单词或短语抄写表达。`
    : `围绕${item.module}，能完成与“${item.theme}”相关的看图写句、补全短文或简短书面表达。`;
  const pageBase = item.pageBase;

  return [
    {
      type: 'LANGUAGE',
      term: item.term,
      module: item.module,
      lesson: 'Lesson 1 主题词汇',
      subnodeType: '词汇',
      pageRange: `参考P${pageBase}-${pageBase + 1}`,
      domain: '词汇',
      name: `${item.theme}词汇识记`,
      description: `围绕${item.module}，能认读并使用${item.vocabFocus}等核心词汇。`,
      standards: standardGroup.vocab,
      commonMistakes: ['只会跟读不会辨义', '词汇和情境搭配不稳定'],
      practiceChain: ['跟读并指认本课词汇', '看图认词并分类', '在句子中替换使用词汇'],
      assessmentTasks: ['给出图片或实物，让学生说出对应单词', '听到词汇后能快速指出或圈选对应图片'],
      skillRubric: buildRubric(item.theme, item.vocabFocus, lowGrade)
    },
    {
      type: 'LANGUAGE',
      term: item.term,
      module: item.module,
      lesson: 'Lesson 2 核心句型',
      subnodeType: '句型',
      pageRange: `参考P${pageBase + 2}-${pageBase + 3}`,
      domain: '句型',
      name: `${item.theme}核心句型`,
      description: `围绕${item.module}，能运用${item.patternFocus}等核心句型开展问答或替换表达。`,
      standards: standardGroup.pattern,
      commonMistakes: ['单词会说但句型套用不完整', '问句和答句对应不上'],
      practiceChain: ['先做替换操练', '再做问答配对', '最后完成情境对话'],
      assessmentTasks: ['根据提示词口头完成问答', '把散乱词卡组成正确句型并朗读'],
      skillRubric: buildRubric(item.theme, item.patternFocus, lowGrade)
    },
    {
      type: 'LANGUAGE',
      term: item.term,
      module: item.module,
      lesson: 'Lesson 3 语篇理解',
      subnodeType: '语篇',
      pageRange: `参考P${pageBase + 4}-${pageBase + 5}`,
      domain: '语篇',
      name: `${item.theme}语篇理解`,
      description: `围绕${item.module}，能借助图片、关键词或上下文理解${item.discourseFocus}。`,
      standards: standardGroup.discourse,
      commonMistakes: ['只认单词不看整段意思', '抓不住人物、时间、地点等关键信息'],
      practiceChain: ['读前预测主题', '圈画关键词句', '复述或回答关键信息问题'],
      assessmentTasks: ['阅读短文后回答人物、时间、地点问题', '按顺序复述语篇主要内容'],
      skillRubric: buildRubric(item.theme, item.discourseFocus, lowGrade)
    },
    {
      type: 'LANGUAGE',
      term: item.term,
      module: item.module,
      lesson: 'Lesson 4 写作任务',
      subnodeType: '写作任务',
      pageRange: `参考P${pageBase + 6}-${pageBase + 7}`,
      domain: '写作任务',
      name: writingName,
      description: writingDesc,
      standards: standardGroup.writing,
      commonMistakes: lowGrade ? ['抄写字母顺序不稳', '单词间距和大小写不规范'] : ['句子能写出来但结构不完整', '表达和模块主题脱节'],
      practiceChain: lowGrade ? ['字母描红', '看图抄写单词', '根据提示补全短语'] : ['先补全句子', '再看图写句', '最后完成简短书面表达'],
      assessmentTasks: lowGrade ? ['检查字母大小写和顺序', '根据图片写出1-2个关键词'] : ['根据图片或表格写出完整句子', '围绕主题完成3-5句简短表达'],
      skillRubric: buildRubric(item.theme, item.patternFocus, lowGrade)
    }
  ];
}

const starterMeta = { code: 'YY', textbook: '外研版（一起点）' };
const starterModules = {
  1: [
    { term:'上', pageBase:4, module:'一年级上 Module 1 Hello', theme:'问候与礼貌表达', vocabFocus:'Hello、Hi、Good morning', patternFocus:'Hello! / I am ...', discourseFocus:'课堂问候对话' },
    { term:'上', pageBase:12, module:'一年级上 Module 2 Colours and Numbers', theme:'颜色和数字', vocabFocus:'颜色词与1-10数字', patternFocus:'What colour is it? / It is ...', discourseFocus:'颜色数字指认' },
    { term:'下', pageBase:20, module:'一年级下 Module 1 Family and Animals', theme:'家庭和动物', vocabFocus:'家庭成员和动物词汇', patternFocus:'This is my ... / It is a ...', discourseFocus:'看图介绍家庭与动物' },
    { term:'下', pageBase:28, module:'一年级下 Module 2 Classroom English', theme:'课堂指令', vocabFocus:'sit down、stand up、open your book', patternFocus:'Please ... / Can you ...?', discourseFocus:'课堂听指令任务' }
  ],
  2: [
    { term:'上', pageBase:4, module:'二年级上 Module 1 Self-introduction', theme:'自我介绍', vocabFocus:'name、age、class 等表达', patternFocus:'My name is ... / I am ...', discourseFocus:'自我介绍对话' },
    { term:'上', pageBase:12, module:'二年级上 Module 2 School Things', theme:'学习用品与学校生活', vocabFocus:'book、pen、bag 等词汇', patternFocus:'What is this? / It is ...', discourseFocus:'课堂用品识别' },
    { term:'下', pageBase:20, module:'二年级下 Module 1 Family and Friends', theme:'家庭和朋友', vocabFocus:'father、mother、friend 等词汇', patternFocus:'He is ... / She is ...', discourseFocus:'介绍人物的小对话' },
    { term:'下', pageBase:28, module:'二年级下 Module 2 Daily Life', theme:'日常生活', vocabFocus:'eat、play、sleep 等动作词', patternFocus:'I ... every day.', discourseFocus:'日常生活小短文' }
  ]
};

for (const grade of [1, 2]) {
  const specs = starterModules[grade].flatMap(item => buildModuleChildren(item, {
    vocab: ['cn-yingyu-2022:1-2-ci-1'],
    pattern: ['cn-yingyu-2022:1-2-ts-1'],
    discourse: ['cn-yingyu-2022:1-2-ts-1'],
    writing: ['cn-yingyu-2022:1-2-zms-1', 'cn-yingyu-2022:1-2-ci-1']
  }, true));
  pushTopics(starterMeta, grade, specs);
}

const pep = { code: 'YRP', textbook: '人教PEP版（三年级起点）' };
const waiyan = { code: 'YWF', textbook: '外研版（三年级起点）' };
const yilin = { code: 'YYL', textbook: '译林版（三年级起点）' };

const versionModules = {
  3: [
    { term:'上', pageBase:4, module:'三上 Unit 1 Hello', theme:'问候与结交朋友', vocabFocus:'问候语、姓名表达、课堂常用语', patternFocus:'Hello! / What is your name?', discourseFocus:'打招呼和结交朋友对话' },
    { term:'上', pageBase:12, module:'三上 Unit 2 Colours and Numbers', theme:'颜色数字与课堂物品', vocabFocus:'颜色词、数字和课堂物品词汇', patternFocus:'What colour is it? / How many ...?', discourseFocus:'图文对应和指认任务' },
    { term:'下', pageBase:20, module:'三下 Unit 3 Family and Animals', theme:'家庭成员与动物', vocabFocus:'家庭成员和动物词汇', patternFocus:'This is my ... / I like ...', discourseFocus:'家庭与动物主题短文' },
    { term:'下', pageBase:28, module:'三下 Unit 4 Food and Hobbies', theme:'食物和兴趣爱好', vocabFocus:'食物词汇与兴趣爱好表达', patternFocus:'Do you like ...? / I like ...', discourseFocus:'喜好调查与对话' }
  ],
  4: [
    { term:'上', pageBase:4, module:'四上 Unit 1 School Life', theme:'学校生活与课程', vocabFocus:'课程、教室、校园生活词汇', patternFocus:'We have ... / What do you have ...?', discourseFocus:'校园生活短文' },
    { term:'上', pageBase:12, module:'四上 Unit 2 Time and Weather', theme:'时间和天气', vocabFocus:'时间表达和天气词汇', patternFocus:'What time is it? / How is the weather?', discourseFocus:'天气和时间信息表述' },
    { term:'下', pageBase:20, module:'四下 Unit 3 Home and City', theme:'家和城市生活', vocabFocus:'家居、方位和城市地点词汇', patternFocus:'There is ... / Where is ...?', discourseFocus:'地点描述短文' },
    { term:'下', pageBase:28, module:'四下 Unit 4 Daily Routines', theme:'日常作息与行为', vocabFocus:'日常动作和作息时间词汇', patternFocus:'I get up at ... / He usually ...', discourseFocus:'作息安排语篇' }
  ],
  5: [
    { term:'上', pageBase:4, module:'五上 Unit 1 Personal Information', theme:'个人信息与人物介绍', vocabFocus:'人物特征、爱好、身份词汇', patternFocus:'She is ... / He likes ...', discourseFocus:'人物介绍短文' },
    { term:'上', pageBase:12, module:'五上 Unit 2 Weekend and Travel', theme:'周末和出行计划', vocabFocus:'活动安排和出行词汇', patternFocus:'What are you going to ...? / We will ...', discourseFocus:'旅行计划语篇' },
    { term:'下', pageBase:20, module:'五下 Unit 3 Health and Food', theme:'健康与饮食', vocabFocus:'食物、身体和健康建议词汇', patternFocus:'You should ... / I want to ...', discourseFocus:'饮食建议和健康文本' },
    { term:'下', pageBase:28, module:'五下 Unit 4 Festivals and Culture', theme:'节日与文化', vocabFocus:'节日活动和文化词汇', patternFocus:'We usually ... on ...', discourseFocus:'节日介绍短文' }
  ],
  6: [
    { term:'上', pageBase:4, module:'六上 Unit 1 Past Experiences', theme:'过去经历和事件', vocabFocus:'过去事件和经历相关词汇', patternFocus:'I visited ... / We went ...', discourseFocus:'过去经历叙述语篇' },
    { term:'上', pageBase:12, module:'六上 Unit 2 Plans and Dreams', theme:'计划与理想', vocabFocus:'理想职业与未来计划词汇', patternFocus:'I am going to ... / I want to be ...', discourseFocus:'梦想和计划表达' },
    { term:'下', pageBase:20, module:'六下 Unit 3 Environment and Technology', theme:'环境与科技', vocabFocus:'环保与科技主题词汇', patternFocus:'We should ... / It can ...', discourseFocus:'说明类语篇' },
    { term:'下', pageBase:28, module:'六下 Unit 4 Graduation and Communication', theme:'毕业表达与交流', vocabFocus:'毕业祝福和沟通词汇', patternFocus:'I want to say ... / Thank you for ...', discourseFocus:'毕业主题阅读' }
  ]
};

function standardsForGrade(grade) {
  if (grade <= 4) {
    return {
      vocab: ['cn-yingyu-2022:3-4-ci-1'],
      pattern: ['cn-yingyu-2022:3-4-ts-1'],
      discourse: ['cn-yingyu-2022:3-4-yd-1'],
      writing: ['cn-yingyu-2022:3-4-xz-1']
    };
  }
  return {
    vocab: ['cn-yingyu-2022:5-6-yy-1'],
    pattern: ['cn-yingyu-2022:5-6-ts-1', 'cn-yingyu-2022:5-6-yy-1'],
    discourse: ['cn-yingyu-2022:5-6-yd-1'],
    writing: ['cn-yingyu-2022:5-6-xz-1', 'cn-yingyu-2022:5-6-cl-1']
  };
}

for (const meta of [pep, waiyan, yilin]) {
  for (const grade of [3, 4, 5, 6]) {
    const specs = versionModules[grade].flatMap(item => buildModuleChildren(item, standardsForGrade(grade), false));
    pushTopics(meta, grade, specs);
  }
}

const data = {
  version: 'v0.6-english-rubric',
  note: '英语扩展：外研版（一起点）1-2年级启蒙模块；人教PEP版/外研版/译林版（三年级起点）3-6年级按模块拆成词汇、句型、语篇、写作任务子节点，并补充页码、练习链、测评任务与分技能rubric',
  topicCount: topics.length,
  topics
};

writeFileSync(OUT, JSON.stringify(data, null, 2), 'utf8');
console.log(`✅ 英语扩展与多版本课时化：${topics.length} 个知识点写入 ${OUT}`);
