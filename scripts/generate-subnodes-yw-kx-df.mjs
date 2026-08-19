import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(__dirname, '..', 'data');
const OUT = resolve(DATA, 'topics-subnodes-yw-kx-df.json');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function cloneTopic(parent, id, subnodeType, nameSuffix, description, evidence, commonMistakes, practiceChain, assessmentTasks, evaluationRubric) {
  return {
    ...parent,
    id,
    parentTopicId: parent.id,
    subnodeType,
    chapter: parent.chapter || parent.domain || null,
    lesson: `子节点任务：${nameSuffix}`,
    name: `${parent.name}·${nameSuffix}`,
    description,
    evidence,
    commonMistakes,
    practiceChain,
    assessmentTasks,
    evaluationRubric,
    resources: undefined
  };
}

function rubricFor(subject, subnodeType, topicName) {
  if (subject === '语文') {
    if (subnodeType === '基础积累') {
      return [
        { dimension: '积累准确性', indicators: ['起步：能在提示下认读或回忆相关字词句', '达标：能较准确完成字词、句式或朗读任务', '提升：能把积累材料迁移到新语境中使用'] },
        { dimension: '文本回连', indicators: ['起步：知道该知识点来自哪个文本或语境', '达标：能回到文本中指出对应例子', '提升：能解释它在文本表达中的作用'] },
        { dimension: '迁移应用', indicators: [`起步：在模仿条件下使用“${topicName}”相关材料`, '达标：能在相近情境中主动调用', '提升：能在陌生语境中灵活迁移'] }
      ];
    }
    if (subnodeType === '阅读表达') {
      return [
        { dimension: '信息提取', indicators: ['起步：能找到表层信息', '达标：能定位关键语句和表达重点', '提升：能结合上下文整合信息并归纳'] },
        { dimension: '理解表达', indicators: ['起步：能用自己的话复述部分意思', '达标：能较完整表达理解', '提升：能结合文本证据展开说明'] },
        { dimension: '书面迁移', indicators: ['起步：能完成一句式表达', '达标：能完成一段简短表达', '提升：能结合主题组织更完整表达'] }
      ];
    }
    return [
      { dimension: '错因识别', indicators: ['起步：知道哪里错了', '达标：能指出错误类型和原因', '提升：能归纳同类错误规律'] },
      { dimension: '订正质量', indicators: ['起步：能在提示下订正', '达标：能独立完成订正并说明依据', '提升：能举一反三避免再犯'] },
      { dimension: '复盘能力', indicators: ['起步：能复述老师给出的提醒', '达标：能总结自己的防错提醒', '提升：能形成稳定的自我检查清单'] }
    ];
  }

  if (subject === '科学') {
    if (subnodeType === '观察实验') {
      return [
        { dimension: '观察记录', indicators: ['起步：能按要求完成基本观察', '达标：能较完整记录现象和数据', '提升：能主动关注关键变量和变化'] },
        { dimension: '实验规范', indicators: ['起步：能在提醒下按步骤操作', '达标：能较规范完成实验流程', '提升：能解释关键步骤为什么这样设计'] },
        { dimension: '证据使用', indicators: ['起步：能说出观察到的现象', '达标：能用记录支持结论', '提升：能比较不同证据并判断可靠性'] }
      ];
    }
    if (subnodeType === '结论表达') {
      return [
        { dimension: '现象描述', indicators: ['起步：能描述单一现象', '达标：能完整描述主要观察结果', '提升：能区分主要现象与次要现象'] },
        { dimension: '科学解释', indicators: ['起步：能说出简单结论', '达标：能用“现象-证据-结论”结构解释', '提升：能结合条件说明结论适用范围'] },
        { dimension: '表达清晰度', indicators: ['起步：表达零散', '达标：表达基本清晰完整', '提升：表达有条理且能使用科学词汇'] }
      ];
    }
    return [
      { dimension: '误判识别', indicators: ['起步：能发现明显错误说法', '达标：能解释错误与证据不符之处', '提升：能归纳常见误判模式'] },
      { dimension: '概念辨析', indicators: ['起步：能区分部分相近概念', '达标：能说明关键差异', '提升：能在新情境中正确辨析'] },
      { dimension: '修正能力', indicators: ['起步：能在提示下修正', '达标：能独立改正并说明理由', '提升：能提出更合理的科学解释'] }
    ];
  }

  return [
    { dimension: '规则理解', indicators: ['起步：能说出相关规则或责任', '达标：能结合情境解释规则含义', '提升：能比较不同规则之间的关系'] },
    { dimension: '价值判断', indicators: ['起步：能作出基本对错判断', '达标：能说明判断理由', '提升：能从公平、责任、尊重等角度综合分析'] },
    { dimension: '行动落实', indicators: ['起步：能提出一条行动', '达标：能执行并记录行动结果', '提升：能复盘并持续改进自己的做法'] }
  ];
}

function seqOf(id) {
  const m = id.match(/(\d{3})$/);
  return m ? Number(m[1]) : 0;
}

const nextSeqMap = new Map();
function initSeq(topics) {
  for (const topic of topics) {
    const key = `${topic.subjectCode}|${topic.grade}|${topic.term}`;
    const current = nextSeqMap.get(key) || 0;
    nextSeqMap.set(key, Math.max(current, seqOf(topic.id)));
  }
}

function nextId(parent) {
  const key = `${parent.subjectCode}|${parent.grade}|${parent.term}`;
  const seq = (nextSeqMap.get(key) || 0) + 1;
  nextSeqMap.set(key, seq);
  return `ct_${parent.subjectCode}${parent.grade}${parent.term === '上' ? 'S' : parent.term === '下' ? 'X' : 'Q'}${String(seq).padStart(3, '0')}`;
}

const yuwenFiles = readdirSync(DATA)
  .filter(name => /^topics-yuwen-g[1-6]\.json$/i.test(name))
  .sort();
const yuwenTopics = yuwenFiles.flatMap(name => readJson(resolve(DATA, name)).topics);
const othersTopics = readJson(resolve(DATA, 'topics-others-g1-g6.json')).topics;
const scienceTopics = othersTopics.filter(t => t.subjectCode === 'KX');
const daofaTopics = othersTopics.filter(t => t.subjectCode === 'DF');

initSeq([...yuwenTopics, ...scienceTopics, ...daofaTopics]);

const topics = [];

for (const parent of yuwenTopics) {
  topics.push(
    cloneTopic(
      parent,
      nextId(parent),
      '基础积累',
      '基础积累任务',
      `围绕“${parent.name}”，补充字词积累、句式迁移或背诵朗读等基础训练任务，帮助学生把知识点转化成稳定语感。`,
      ['能完成与该知识点对应的字词、句式或朗读基础任务', '能在新语境中迁移使用相关语言材料'],
      ['只会单点记忆，迁移到新语境时不会用', '基础积累和具体文本理解脱节'],
      ['先完成字词或句式识记', '再做朗读或仿写迁移', '最后回到文本中验证理解'],
      ['抽取关键词句进行口头解释', '完成1-2个迁移应用小任务'],
      rubricFor(parent.subject, '基础积累', parent.name)
    ),
    cloneTopic(
      parent,
      nextId(parent),
      '阅读表达',
      '阅读表达任务',
      `围绕“${parent.name}”，设计阅读理解、口头表达或书面表达任务，帮助学生把知识点用于真实文本和表达情境。`,
      ['能结合文本说出该知识点在文中的作用', '能完成相应的口头或书面表达任务'],
      ['只会背概念，不会回到文本中解释', '表达任务里不会主动调用这个知识点'],
      ['先定位文本证据', '再口头复述理解', '最后完成简短表达任务'],
      ['结合文本回答“为什么”类问题', '完成一句到一段的表达练习'],
      rubricFor(parent.subject, '阅读表达', parent.name)
    ),
    cloneTopic(
      parent,
      nextId(parent),
      '易错辨析',
      '易错辨析任务',
      `围绕“${parent.name}”，整理常见混淆点、误读点或表达错误，形成可直接用于订正和复盘的辨析任务。`,
      ['能指出典型错例的问题所在', '能说出避免同类错误的方法'],
      ['只知道答案错了，但说不出错因', '同类误读、误写、误用反复出现'],
      ['先识别典型错例', '再比较正误差异', '最后总结辨析口诀或提醒'],
      ['改写或订正典型错例', '解释为什么该表达不准确'],
      rubricFor(parent.subject, '易错辨析', parent.name)
    )
  );
}

for (const parent of scienceTopics) {
  topics.push(
    cloneTopic(
      parent,
      nextId(parent),
      '观察实验',
      '观察实验任务',
      `围绕“${parent.name}”，补充观察、实验或记录任务，让学生通过可操作的探究活动形成证据。`,
      ['能按步骤完成观察或实验并记录结果', '能从记录中提取与知识点相关的关键现象'],
      ['只记结论，不关注观察过程', '实验记录不完整，无法支持结论'],
      ['先明确观察目标', '再完成记录表', '最后回到现象解释结论'],
      ['按要求完成一次观察或实验记录', '根据记录说出至少一条有效发现'],
      rubricFor(parent.subject, '观察实验', parent.name)
    ),
    cloneTopic(
      parent,
      nextId(parent),
      '结论表达',
      '结论表达任务',
      `围绕“${parent.name}”，训练学生用“现象-证据-结论”的结构表达科学理解。`,
      ['能用自己的话说清观察现象和结论之间的关系', '能使用基础科学词汇表达结论'],
      ['只会描述现象，不会提炼结论', '结论与证据脱节'],
      ['先描述现象', '再找关键证据', '最后用完整句式表达结论'],
      ['口头复述一次“现象-证据-结论”链条', '根据图表或记录写出简短结论'],
      rubricFor(parent.subject, '结论表达', parent.name)
    ),
    cloneTopic(
      parent,
      nextId(parent),
      '易错辨析',
      '易错辨析任务',
      `围绕“${parent.name}”，整理小学科学中常见的误判、经验性直觉错误和概念混淆点。`,
      ['能识别常见误判并解释原因', '能在新情境中避免重复犯错'],
      ['用生活经验代替科学判断', '只记结论，不知道适用条件'],
      ['先识别错误说法', '再对比证据', '最后修正自己的解释'],
      ['判断常见说法正误并说明理由', '修改一条错误解释'],
      rubricFor(parent.subject, '易错辨析', parent.name)
    )
  );
}

for (const parent of daofaTopics) {
  topics.push(
    cloneTopic(
      parent,
      nextId(parent),
      '情境判断',
      '情境判断任务',
      `围绕“${parent.name}”，设计贴近校园、家庭、社会生活的判断情境，帮助学生把道法知识放进真实场景中理解。`,
      ['能在具体情境中做出基本价值判断', '能说出判断依据与规则或责任之间的关系'],
      ['知道概念但遇到情境不会判断', '判断只停留在口号层面'],
      ['先识别情境中的人物和行为', '再联系规则或责任', '最后作出判断并说明理由'],
      ['阅读情境后选择更合适做法', '用一句话说明自己的判断依据'],
      rubricFor(parent.subject, '情境判断', parent.name)
    ),
    cloneTopic(
      parent,
      nextId(parent),
      '价值辨析',
      '价值辨析任务',
      `围绕“${parent.name}”，训练学生比较不同做法、不同立场之间的差异，形成更清晰的价值辨析能力。`,
      ['能比较两种做法的不同后果', '能从规则、公平、责任等角度说明更合适的选择'],
      ['只会简单说“对/错”，不会展开理由', '辨析时忽略具体情境条件'],
      ['先比较做法差异', '再分析后果', '最后给出价值判断'],
      ['对比两个案例并说明哪种做法更合适', '补充一个更合理的行动建议'],
      rubricFor(parent.subject, '价值辨析', parent.name)
    ),
    cloneTopic(
      parent,
      nextId(parent),
      '行动任务',
      '行动实践任务',
      `围绕“${parent.name}”，把知识点转化为可执行的小行动、小承诺或合作任务，促进知行合一。`,
      ['能把知识点转化成具体行动计划', '能在行动后复盘表现和改进方向'],
      ['会说不会做，行动计划过于空泛', '行动后缺少复盘和持续改进'],
      ['先制定一条具体行动', '再落实并记录', '最后做简短复盘'],
      ['写出一条可以当天执行的行动计划', '结合行动结果做1次自我反思'],
      rubricFor(parent.subject, '行动任务', parent.name)
    )
  );
}

const data = {
  version: 'v0.7-subnodes-yw-kx-df',
  note: '语文/科学/道德与法治的父节点+子节点扩展，补充练习链、测评任务与结构化评价框架',
  topicCount: topics.length,
  topics
};

writeFileSync(OUT, JSON.stringify(data, null, 2), 'utf8');
console.log(`✅ 语文/科学/道法子节点扩展：${topics.length} 个知识点写入 ${OUT}`);
