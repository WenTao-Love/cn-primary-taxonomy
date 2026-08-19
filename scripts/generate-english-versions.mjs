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
    ageRangeStart,
    ageRangeEnd,
    difficulty: spec.difficulty ?? 2,
    centrality: null,
    evidence: spec.evidence ?? [`能完成“${spec.name}”对应的基础英语学习任务`, `能在相应课堂情境中较稳定地表现出来`],
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

const starterMeta = { code: 'YY', textbook: '外研版（一起点）' };
const starterGrades = {
  1: [
    { type:'LANGUAGE', term:'上', domain:'听说', name:'问候和课堂礼貌用语', description:'能听懂并说出 Hello、Hi、Good morning、Thank you 等基础礼貌用语。', standards:['cn-yingyu-2022:1-2-ts-1'] },
    { type:'LANGUAGE', term:'下', domain:'词汇', name:'颜色和数字1-10', description:'能认读并口头表达基础颜色词和数字1-10。', standards:['cn-yingyu-2022:1-2-ci-1'] },
    { type:'LANGUAGE', term:'下', domain:'字母', name:'26个字母初步认读', description:'能认读26个字母大小写，跟唱字母歌。', standards:['cn-yingyu-2022:1-2-zms-1'] }
  ],
  2: [
    { type:'LANGUAGE', term:'上', domain:'听说', name:'自我介绍和简单问答', description:'能进行简单自我介绍，并回答姓名、年龄等基础问题。', standards:['cn-yingyu-2022:1-2-ts-1'] },
    { type:'LANGUAGE', term:'下', domain:'词汇', name:'家庭动物和日常物品词汇', description:'能认读并使用家庭成员、动物、学习用品等基础词汇。', standards:['cn-yingyu-2022:1-2-ci-1'] },
    { type:'LANGUAGE', term:'下', domain:'字母', name:'字母规范书写', description:'能较规范地书写26个字母大小写。', standards:['cn-yingyu-2022:1-2-zms-1'] }
  ]
};

for (const grade of [1,2]) pushTopics(starterMeta, grade, starterGrades[grade]);

const versionMetas = [
  { code: 'YRP', textbook: '人教PEP版（三年级起点）' },
  { code: 'YWF', textbook: '外研版（三年级起点）' },
  { code: 'YYL', textbook: '译林版（三年级起点）' }
];

const coreGrades = {
  3: [
    { type:'LANGUAGE', term:'上', domain:'听说', name:'基础课堂交流和日常问候', description:'能在课堂和生活中进行基础问候、介绍和简单应答。', standards:['cn-yingyu-2022:3-4-ts-1'] },
    { type:'LANGUAGE', term:'上', domain:'词汇', name:'颜色数字家庭学校词汇', description:'能认读并使用与颜色、数字、家庭、学校相关的核心词汇。', standards:['cn-yingyu-2022:3-4-ci-1'] },
    { type:'LANGUAGE', term:'下', domain:'字母与语音', name:'字母音和自然拼读启蒙', description:'能结合字母名称和基础字母音进行简单认读。', standards:['cn-yingyu-2022:3-4-yy-1'] }
  ],
  4: [
    { type:'LANGUAGE', term:'上', domain:'听说', name:'围绕日常话题进行简短对话', description:'能围绕时间、地点、喜好、天气等日常话题进行简短交流。', standards:['cn-yingyu-2022:3-4-ts-1'] },
    { type:'LANGUAGE', term:'下', domain:'阅读', name:'借助图片和关键词理解短文', description:'能借助插图和关键词理解简单英语短文大意。', standards:['cn-yingyu-2022:3-4-yd-1'] },
    { type:'LANGUAGE', term:'下', domain:'写作', name:'仿写简单句和小短文', description:'能模仿例句书写简单句子和非常短的小短文。', standards:['cn-yingyu-2022:3-4-xz-1'] }
  ],
  5: [
    { type:'LANGUAGE', term:'上', domain:'词汇与语法', name:'在句子中运用时态和核心句型', description:'能在熟悉语境中运用一般现在时等基础时态和核心句型。', standards:['cn-yingyu-2022:5-6-yy-1'] },
    { type:'LANGUAGE', term:'下', domain:'阅读', name:'提取语篇关键信息', description:'能从短文中提取人物、时间、地点、事件等关键信息。', standards:['cn-yingyu-2022:5-6-yd-1'] },
    { type:'LANGUAGE', term:'下', domain:'写作', name:'根据提示完成简短书面表达', description:'能根据图片、表格或提示完成简短英语书面表达。', standards:['cn-yingyu-2022:5-6-xz-1'] }
  ],
  6: [
    { type:'LANGUAGE', term:'上', domain:'听说', name:'围绕熟悉主题进行较完整表达', description:'能围绕自我、家庭、学校、旅行等主题进行较完整口头表达。', standards:['cn-yingyu-2022:5-6-ts-1'] },
    { type:'LANGUAGE', term:'下', domain:'阅读', name:'理解并概括短文大意', description:'能理解较完整语篇并概括主要内容或作者意图。', standards:['cn-yingyu-2022:5-6-yd-1'] },
    { type:'META', term:'下', domain:'学习策略', name:'使用拼读和上下文策略自主认读', description:'能结合自然拼读、上下文和已有词汇经验自主认读与猜测词义。', standards:['cn-yingyu-2022:5-6-cl-1'] }
  ]
};

for (const meta of versionMetas) {
  for (const grade of [3,4,5,6]) {
    const specs = coreGrades[grade].map(item => ({
      ...item,
      description: `${item.description}（按${meta.textbook}核心内容口径映射）`
    }));
    pushTopics(meta, grade, specs);
  }
}

const data = {
  version: 'v0.3-english-versions',
  note: '英语扩展：外研版（一起点）覆盖1-2年级；人教PEP版/外研版/译林版（三年级起点）覆盖3-6年级',
  topicCount: topics.length,
  topics
};

writeFileSync(OUT, JSON.stringify(data, null, 2), 'utf8');
console.log(`✅ 英语扩展与多版本：${topics.length} 个知识点写入 ${OUT}`);
