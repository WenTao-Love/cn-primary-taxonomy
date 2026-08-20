import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(__dirname, '..', 'data');
const OUT = resolve(DATA, 'topics-subnodes-others.json');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function seqOf(id) {
  const m = id.match(/(\d{3})$/);
  return m ? Number(m[1]) : 0;
}

const baseTopics = readJson(resolve(DATA, 'topics-others-g1-g6.json')).topics;
const targetCodes = new Set(['LD', 'TY', 'MS', 'YYP', 'XX']);
const parents = baseTopics.filter(topic => targetCodes.has(topic.subjectCode));

const nextSeqMap = new Map();
for (const topic of parents) {
  const key = `${topic.subjectCode}|${topic.grade}|${topic.term}`;
  const current = nextSeqMap.get(key) || 0;
  nextSeqMap.set(key, Math.max(current, seqOf(topic.id)));
}

function nextId(parent) {
  const key = `${parent.subjectCode}|${parent.grade}|${parent.term}`;
  const seq = (nextSeqMap.get(key) || 0) + 1;
  nextSeqMap.set(key, seq);
  return `ct_${parent.subjectCode}${parent.grade}${parent.term === '上' ? 'S' : parent.term === '下' ? 'X' : 'Q'}${String(seq).padStart(3, '0')}`;
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
  if (subject === '劳动') {
    return [
      { dimension: '任务执行', indicators: ['起步：能在提醒下完成部分劳动步骤', '达标：能按顺序较独立完成劳动任务', '提升：能根据任务需要主动调整步骤和分工'] },
      { dimension: '工具与安全', indicators: ['起步：知道基本工具和安全提醒', '达标：能规范使用工具并注意安全卫生', '提升：能主动检查环境、工具和过程中的安全隐患'] },
      { dimension: '复盘改进', indicators: ['起步：能说出自己做了什么', '达标：能总结完成情况和改进点', `提升：能结合“${topicName}”形成稳定的劳动清单或改进方案`] }
    ];
  }
  if (subject === '体育与健康') {
    return [
      { dimension: '动作质量', indicators: ['起步：能模仿完成基本动作', '达标：能较规范完成动作并保持节奏', '提升：能在活动或比赛情境中稳定运用动作'] },
      { dimension: '规则与合作', indicators: ['起步：知道基本规则', '达标：能遵守规则并与同伴配合', '提升：能在合作中主动提醒、支持同伴并维持公平'] },
      { dimension: '健康反思', indicators: ['起步：知道运动前后要注意什么', '达标：能根据身体状态进行简单调整', '提升：能结合表现主动做训练复盘和自我调节'] }
    ];
  }
  if (subject === '美术') {
    return [
      { dimension: '造型表现', indicators: ['起步：能完成基础线条、色彩或形状表现', '达标：能围绕主题较完整地组织画面或作品', '提升：能主动调整构图、色彩和材料表达主题'] },
      { dimension: '审美表达', indicators: ['起步：能说出喜欢或不喜欢的地方', '达标：能结合作品元素说明感受', '提升：能联系主题、文化或表现方法进行更具体评述'] },
      { dimension: '创作改进', indicators: ['起步：能在提示下修改作品', '达标：能根据反馈调整局部表现', '提升：能主动比较不同方案并优化自己的创作'] }
    ];
  }
  if (subject === '音乐') {
    return [
      { dimension: '节奏音准', indicators: ['起步：能基本跟上节奏或旋律', '达标：能较稳定表现节奏、音高和速度', '提升：能在完整表演中保持较好稳定性和表现力'] },
      { dimension: '表现与合作', indicators: ['起步：能在带领下参与演唱/演奏', '达标：能配合同伴完成集体表现', '提升：能主动根据作品情绪和合作需要调整表现'] },
      { dimension: '欣赏表达', indicators: ['起步：能说出听到的明显变化', '达标：能结合情绪、速度、力度表达感受', '提升：能联系作品背景和表现方法进行说明'] }
    ];
  }
  return [
    { dimension: '工具操作', indicators: ['起步：能在提示下完成基础操作', '达标：能较独立地按步骤使用数字工具', '提升：能根据任务主动选择更合适的操作路径'] },
    { dimension: '信息组织', indicators: ['起步：能识别主要信息', '达标：能围绕任务整理、表达或处理信息', '提升：能把信息进一步结构化并服务于问题解决'] },
    { dimension: '安全与规范', indicators: ['起步：知道基本规范', '达标：能在数字任务中注意文明、安全与隐私', '提升：能识别常见风险并主动规避不当操作'] }
  ];
}

function buildSpecs(parent) {
  if (parent.subject === '劳动') {
    return [
      ['劳动准备', '准备与分工任务', `围绕“${parent.name}”，补充工具准备、步骤拆分和分工安排任务，帮助学生在动手前把劳动流程理顺。`, ['能列出劳动所需工具和关键步骤', '能根据任务需要进行简单分工或顺序安排'], ['拿到任务就直接做，忽略准备和安全检查', '步骤混乱导致返工'], ['先列工具与材料', '再排序步骤', '最后进行安全检查'], ['口头说明劳动步骤顺序', '完成一张劳动准备清单']],
      ['操作实践', '操作实践任务', `围绕“${parent.name}”，设计可执行的劳动实践任务，强调动手过程中的规范、耐心和完成质量。`, ['能按顺序较完整完成劳动任务', '能在操作中注意工具使用和卫生安全'], ['只完成表面步骤，质量不稳定', '中途遇到问题就放弃'], ['先模仿示范', '再独立完成', '最后检查完成效果'], ['完成一次劳动实践并展示结果', '说明自己在操作中如何保证安全与质量']],
      ['复盘改进', '复盘改进任务', `围绕“${parent.name}”，让学生在完成劳动后回顾问题、总结经验并提出下一次的改进计划。`, ['能说出本次劳动中做得好的地方和需要改进的地方', '能形成下一次更高效完成任务的提醒'], ['做完就结束，不复盘过程', '只说辛苦，不会分析方法'], ['先回顾过程', '再定位问题', '最后写出改进提醒'], ['完成一次劳动复盘卡', '提出一条下次可执行的改进措施']]
    ];
  }
  if (parent.subject === '体育与健康') {
    return [
      ['动作训练', '动作训练任务', `围绕“${parent.name}”，补充关键动作的分解练习和节奏控制任务，帮助学生把动作做规范。`, ['能按要点完成关键动作', '能在重复练习中保持基本节奏与姿态'], ['动作只求快，不顾规范', '练习中姿态走样却没觉察'], ['先分解动作', '再连贯练习', '最后在游戏或小比赛中使用'], ['完成指定次数的规范动作', '口头说出动作要点']],
      ['规则合作', '规则合作任务', `围绕“${parent.name}”，将规则理解、合作配合和公平意识放进具体运动情境。`, ['能说出活动中的基本规则', '能与同伴配合完成任务或比赛'], ['只顾自己表现，忽视团队配合', '规则意识弱，容易抢先或漏判'], ['先理解规则', '再配对练习', '最后进入合作情境'], ['根据情境判断是否合规', '完成一次合作练习并做简短复盘']],
      ['健康反思', '健康反思任务', `围绕“${parent.name}”，引导学生关注热身、强度、自我感受和运动后的恢复。`, ['能说出运动前后需要注意的健康事项', '能根据自身状态做简单调整'], ['忽视热身和放松', '不舒服时不会主动调整'], ['先记录运动感受', '再判断是否需要调整', '最后形成个人提醒'], ['填写一次运动状态记录', '说出一条保护自己身体的做法']]
    ];
  }
  if (parent.subject === '美术') {
    return [
      ['造型表现', '造型表现任务', `围绕“${parent.name}”，补充线条、色彩、构图或材料运用的具体表现任务。`, ['能用合适的线条、色彩或材料表现主题', '能较完整地完成作品基础画面'], ['画面元素杂乱，主题不突出', '只会照着画，不会调整构图'], ['先观察对象或主题', '再构思画面', '最后完善细节与色彩'], ['完成一幅围绕主题的作品草稿', '说明自己选择的主要表现方法']],
      ['欣赏评述', '欣赏评述任务', `围绕“${parent.name}”，训练学生从主题、色彩、构图或文化背景等角度表达审美感受。`, ['能说出作品的主要内容和感受', '能结合一个以上美术要素表达理由'], ['只会说“好看”，说不出依据', '忽略作品与主题的关系'], ['先观察作品', '再说出感受', '最后联系表现方法说明理由'], ['比较两件作品并说出差异', '用2-3句话说明自己更喜欢哪一种表达']],
      ['创作改进', '创作改进任务', `围绕“${parent.name}”，让学生依据反馈优化作品，提升审美判断和创作完成度。`, ['能发现作品中需要调整的地方', '能根据建议改进局部表达'], ['改作品只重涂颜色，不看整体效果', '收到建议后不知道怎么改'], ['先找问题', '再尝试改法', '最后对比修改前后效果'], ['展示修改前后作品差异', '说明自己为什么这样调整']]
    ];
  }
  if (parent.subject === '音乐') {
    return [
      ['节奏演唱', '节奏演唱任务', `围绕“${parent.name}”，补充节奏、音高和呼吸控制的分步练习任务。`, ['能较稳定跟随节奏完成演唱或演奏', '能注意音准、速度和基本表现力'], ['只顾记歌词，不顾节奏音准', '越到后面越跟不上集体'], ['先节奏模仿', '再加入旋律', '最后完整表现'], ['完成一段节奏模仿', '独立演唱或演奏一个片段']],
      ['欣赏表达', '欣赏表达任务', `围绕“${parent.name}”，训练学生听辨音乐中的情绪、节奏、力度和形象变化。`, ['能说出作品带来的主要感受', '能听出明显的强弱、快慢或情绪变化'], ['只说喜欢不喜欢，缺少具体描述', '听完后无法说出音乐特点'], ['先听辨变化', '再联系情绪', '最后用语言表达感受'], ['听后选择更贴合的情绪词', '用完整句子表达对作品的理解']],
      ['合作展示', '合作展示任务', `围绕“${parent.name}”，把演唱、演奏、律动或创编放进合作展示情境。`, ['能在集体任务中与同伴保持基本配合', '能根据整体效果调整自己的表现'], ['只关注自己，不听同伴节奏', '合作时容易抢拍或掉拍'], ['先小组练习', '再整体合练', '最后展示并复盘'], ['完成一次小组合作展示', '复盘自己在合作中的优势和问题']]
    ];
  }
  return [
    ['工具操作', '工具操作任务', `围绕“${parent.name}”，补充数字工具使用、输入整理或步骤执行等基础操作任务。`, ['能按要求完成基础数字操作', '能较清楚地复述关键步骤'], ['操作顺序混乱，容易漏步', '遇到界面变化就不会继续'], ['先看任务目标', '再按步骤操作', '最后检查结果'], ['完成一次指定工具操作', '用自己的话复述关键步骤']],
    ['信息表达', '信息表达任务', `围绕“${parent.name}”，把信息整理、数字表达或作品产出放进真实任务。`, ['能围绕任务整理信息并生成简单作品', '能判断哪些信息需要保留或突出'], ['堆砌信息，缺少结构', '作品内容和任务目标偏离'], ['先筛选信息', '再组织结构', '最后输出作品并检查'], ['完成一份简短数字作品', '解释自己怎样组织信息']],
    ['安全规范', '安全规范任务', `围绕“${parent.name}”，训练学生识别数字活动中的文明、隐私与设备安全要求。`, ['能说出数字活动中的基本安全规范', '能在操作中避免常见不当行为'], ['图省事而忽视账号、隐私和设备保护', '复制粘贴时不注意来源和规范'], ['先识别风险点', '再判断正确做法', '最后形成操作提醒'], ['判断若干数字情境是否安全合规', '写出一条自己的用机提醒']]
  ];
}

const topics = [];
for (const parent of parents) {
  for (const [subnodeType, suffix, description, evidence, commonMistakes, practiceChain, assessmentTasks] of buildSpecs(parent)) {
    topics.push(
      cloneTopic(
        parent,
        nextId(parent),
        subnodeType,
        suffix,
        description,
        evidence,
        commonMistakes,
        practiceChain,
        assessmentTasks,
        rubricFor(parent.subject, subnodeType, parent.name)
      )
    );
  }
}

const data = {
  version: 'v0.8-subnodes-others',
  note: '劳动/体育与健康/美术/音乐/信息科技子节点扩展，补充练习链、测评任务与结构化评价框架',
  topicCount: topics.length,
  topics
};

writeFileSync(OUT, JSON.stringify(data, null, 2), 'utf8');
console.log(`✅ 其他学科子节点扩展：${topics.length} 个知识点写入 ${OUT}`);
