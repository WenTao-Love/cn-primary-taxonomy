import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(__dirname, '..', 'data');
const OUT = resolve(DATA, 'topics-subnodes-yw-kx-df.json');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function cloneTopic(parent, id, subnodeType, nameSuffix, description, evidence, commonMistakes, practiceChain, assessmentTasks) {
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
    resources: undefined
  };
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
      ['抽取关键词句进行口头解释', '完成1-2个迁移应用小任务']
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
      ['结合文本回答“为什么”类问题', '完成一句到一段的表达练习']
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
      ['改写或订正典型错例', '解释为什么该表达不准确']
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
      ['按要求完成一次观察或实验记录', '根据记录说出至少一条有效发现']
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
      ['口头复述一次“现象-证据-结论”链条', '根据图表或记录写出简短结论']
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
      ['判断常见说法正误并说明理由', '修改一条错误解释']
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
      ['阅读情境后选择更合适做法', '用一句话说明自己的判断依据']
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
      ['对比两个案例并说明哪种做法更合适', '补充一个更合理的行动建议']
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
      ['写出一条可以当天执行的行动计划', '结合行动结果做1次自我反思']
    )
  );
}

const data = {
  version: 'v0.6-subnodes-yw-kx-df',
  note: '语文/科学/道德与法治的父节点+子节点扩展，补充练习链和测评任务',
  topicCount: topics.length,
  topics
};

writeFileSync(OUT, JSON.stringify(data, null, 2), 'utf8');
console.log(`✅ 语文/科学/道法子节点扩展：${topics.length} 个知识点写入 ${OUT}`);
