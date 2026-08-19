/**
 * generate-dependencies.mjs
 * 生成知识点之间的前置依赖关系 (DAG)
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(__dirname, '..', 'data');

// 辅助: 快速建立依赖
const D = (topic, prereq, strength, reason) => ({ topicId: topic, prerequisiteId: prereq, strength, reason });

const deps = [];
// ===== 语文字词基础（跨学期通用基础） =====
// 部首查字法依赖：认识偏旁 + 字典基本结构
deps.push(D('ct_YW2S001','ct_YW2S004','hard','要会部首查字法，必须先理解偏旁能表意、知道部首是什么'));
deps.push(D('ct_YW2S001','ct_YW2S003','hard','查字典前必须认识字典的结构（部首目录/检字表/正文）'));
// 音序查字法依赖：字典结构 + 拼音（一年级基础，不在本图谱中显性标注）
deps.push(D('ct_YW2S002','ct_YW2S003','hard','要会音序查字法，必须先认识字典的音节表结构'));
// 形声字依赖：偏旁表意规律
deps.push(D('ct_YW2S005','ct_YW2S004','hard','要理解形声字，必须先理解偏旁（形旁）的表意规律'));
deps.push(D('ct_YW2X010','ct_YW2S005','hard','二年级下册的形旁表义是上册形声字初步的深化'));
// 会意字依赖：已认识基本汉字
deps.push(D('ct_YW2X011','ct_YW2S006','soft','有一定识字量后更容易理解会意字的组合规律'));
// 形近字辨析依赖：上册识字+写字
deps.push(D('ct_YW2X014','ct_YW2S007','hard','要辨析形近字，必须先有上册250个会写字的基础'));
deps.push(D('ct_YW2X012','ct_YW2S006','hard','下册会认字以上册会认字为基础'));
deps.push(D('ct_YW2X013','ct_YW2S007','hard','下册会写字以上册会写字为基础'));
// 词语体系
deps.push(D('ct_YW2S022','ct_YW2S021','hard','ABB/AABB/ABAB式词语以基础数量词、形容词积累为前提'));
deps.push(D('ct_YW2S023','ct_YW2S020','hard','词语搭配以近反义词积累、词义理解为基础'));
deps.push(D('ct_YW2X025','ct_YW2S023','hard','系统学习"的地得"要以上册词语搭配初步感知为基础'));
deps.push(D('ct_YW2X025','ct_YW2X010','soft','会用"的地得"需要形声字/形旁语感辅助（但不是强依赖）'));
deps.push(D('ct_YW2S024','ct_YW2S020','hard','四字成语积累要在近反义词、词语搭配等基础词汇能力之上'));
deps.push(D('ct_YW2X026','ct_YW2S020','soft','学习关联词需要一定的词汇积累和句子理解能力'));
deps.push(D('ct_YW2X027','ct_YW2S020','hard','词语归类需要一定词汇量和词义理解'));
// 句子
deps.push(D('ct_YW2S030','ct_YW2S032','soft','把被字句互换需要正确使用标点和理解句子成分'));
deps.push(D('ct_YW2S031','ct_YW2S033','soft','仿写比喻句前有仿写句子的基础更容易上手'));
deps.push(D('ct_YW2S033','ct_YW2S032','hard','仿写句子先要能正确使用标点、写出完整句子'));
deps.push(D('ct_YW2S034','ct_YW2S033','hard','扩写句子要在会仿写句子的基础上'));
deps.push(D('ct_YW2S034','ct_YW2S023','hard','扩写句子需要"的/地"修饰搭配能力'));
deps.push(D('ct_YW2X035','ct_YW2S031','soft','认识拟人句之前先认识比喻句，修辞学习循序渐进'));
deps.push(D('ct_YW2X036','ct_YW2S032','hard','学习冒号引号先要掌握基础标点（句号/问号/感叹号/逗号）'));
// 阅读
deps.push(D('ct_YW2S041','ct_YW2S040','hard','分角色朗读先要能识别自然段、读懂人物对话'));
deps.push(D('ct_YW2S042','ct_YW2S041','soft','默读能力建立在出声朗读熟练的基础上'));
deps.push(D('ct_YW2S043','ct_YW2S042','soft','带着问题读以默读能力为前提'));
deps.push(D('ct_YW2S044','ct_YW2S040','hard','借助图画阅读先要能分清段落、理解图文对应'));
deps.push(D('ct_YW2S046','ct_YW2S043','hard','提取文章明显信息需要带着问题读的能力'));
deps.push(D('ct_YW2X047','ct_YW2S046','hard','联系上下文理解词语要先能提取明显信息'));
deps.push(D('ct_YW2X048','ct_YW2S046','soft','读懂寓言要先有基本阅读理解能力'));
deps.push(D('ct_YW2S045','ct_YW2S042','soft','课外阅读习惯以课堂默读/朗读能力为基础'));
// 古诗文（基本按年级难度递进，依赖识字量）
deps.push(D('ct_YW2S051','ct_YW2S050','soft','第二首古诗以第一首的古诗阅读经验为基础'));
deps.push(D('ct_YW2S052','ct_YW2S050','soft','夜宿山寺以登鹳雀楼的古诗学习经验为基础'));
deps.push(D('ct_YW2S053','ct_YW2S050','soft','敕勒歌作为北朝民歌，以基本古诗朗读能力为前提'));
deps.push(D('ct_YW2X054','ct_YW2S053','hard','下册古诗以上册古诗学习经验和识字量为基础'));
deps.push(D('ct_YW2X055','ct_YW2X054','soft','古诗学习循序渐进'));
deps.push(D('ct_YW2X056','ct_YW2X054','soft','杜甫绝句以白居易诗的理解能力为基础'));
// 写话
deps.push(D('ct_YW2S061','ct_YW2S032','hard','看图写话先要能写完整句子、正确使用标点'));
deps.push(D('ct_YW2S061','ct_YW2S044','hard','看图写话以借助图画阅读、看懂图意为前提'));
deps.push(D('ct_YW2S060','ct_YW2S032','hard','写留言条以会写完整句子、使用正确标点为基础'));
deps.push(D('ct_YW2X062','ct_YW2S061','hard','多幅图看图写话以单幅图看图写话能力为基础'));
deps.push(D('ct_YW2X063','ct_YW2S061','soft','写清楚四要素以单幅图写话经验为基础'));
deps.push(D('ct_YW2X064','ct_YW2S061','hard','写日记以基本写话能力为基础'));
// 口语交际（互相支持，弱依赖）
deps.push(D('ct_YW2S072','ct_YW2S071','soft','看图讲故事以介绍动物的表达经验为基础'));
deps.push(D('ct_YW2X073','ct_YW2S070','hard','注意说话语气以上册"商量"的礼貌用语经验为基础'));

// ===== 数学依赖链 =====
// 长度单位
deps.push(D('ct_SX2S002','ct_SX2S001','hard','认识厘米前要先理解统一长度单位的必要性'));
deps.push(D('ct_SX2S003','ct_SX2S002','hard','认识米以认识厘米为基础，1米=100厘米是换算关系'));
deps.push(D('ct_SX2S004','ct_SX2S002','hard','用尺子量物体要先认识厘米和尺子刻度'));
deps.push(D('ct_SX2S005','ct_SX2S004','soft','画线段以测量长度能力为基础'));
// 100以内加减法
deps.push(D('ct_SX2S011','ct_SX2S010','hard','进位加法以不进位加法竖式对齐能力为基础'));
deps.push(D('ct_SX2S012','ct_SX2S011','soft','不退位减法在加法竖式计算熟练后更容易学习'));
deps.push(D('ct_SX2S013','ct_SX2S012','hard','退位减法以不退位减法竖式能力为基础'));
deps.push(D('ct_SX2S014','ct_SX2S013','hard','比多少应用题需要加减法计算能力支撑'));
deps.push(D('ct_SX2S015','ct_SX2S011','hard','连加连减以进退位加减法为基础'));
deps.push(D('ct_SX2S015','ct_SX2S013','hard','连加连减加减混合包含退位减法'));
deps.push(D('ct_SX2S016','ct_SX2S015','soft','估算以精确计算能力为基础'));
// 角的认识
deps.push(D('ct_SX2S021','ct_SX2S020','hard','认识直角先要知道什么是角'));
deps.push(D('ct_SX2S022','ct_SX2S021','hard','认识锐角钝角以直角为标准'));
deps.push(D('ct_SX2S023','ct_SX2S020','hard','画角以认识角的构成为基础'));
// 表内乘法
deps.push(D('ct_SX2S031','ct_SX2S030','hard','学习2-6乘法口诀前要先理解乘法的意义（几个几）'));
deps.push(D('ct_SX2S032','ct_SX2S031','hard','7-9乘法口诀在2-6口诀熟记后扩展'));
deps.push(D('ct_SX2S033','ct_SX2S030','soft','乘加乘减以乘法意义理解为基础'));
deps.push(D('ct_SX2S033','ct_SX2S031','hard','乘加乘减计算需要熟记2-6乘法口诀'));
deps.push(D('ct_SX2S034','ct_SX2S030','hard','求几倍是多少要先理解乘法的意义'));
deps.push(D('ct_SX2S034','ct_SX2S032','hard','倍数问题的计算需要熟记乘法口诀'));
// 观察物体（相对独立）
// 认识时间
deps.push(D('ct_SX2S046','ct_SX2S045','hard','读几时几分以认识钟面、知道大格小格为基础'));
deps.push(D('ct_SX2S046','ct_SX2S032','soft','看分针计算几分要用到5的乘法口诀（每大格5分）'));
deps.push(D('ct_SX2S047','ct_SX2S046','soft','合理安排时间以认识时间、会读钟面为基础'));
// 搭配（相对独立，但需要有序思考）
deps.push(D('ct_SX2S051','ct_SX2S050','hard','组合问题与排列对比学习，先学排列再学组合更清晰'));
// 下册：数据收集
deps.push(D('ct_SX2X060','ct_SX2S031','soft','数据整理统计中"正"字记录涉及5的计数，与5的乘法口诀相关'));
// 除法
deps.push(D('ct_SX2X065','ct_SX2S031','hard','理解平均分是除法的基础'));
deps.push(D('ct_SX2X066','ct_SX2X065','hard','认识除法以理解平均分为前提'));
deps.push(D('ct_SX2X067','ct_SX2X066','hard','用乘法口诀求商需要先认识除法，也需要熟记乘法口诀'));
deps.push(D('ct_SX2X067','ct_SX2S032','hard','用口诀求商要以熟记乘法口诀（含7-9）为基础'));
deps.push(D('ct_SX2X068','ct_SX2X067','hard','除法应用题以会用口诀求商为基础'));
// 图形的运动
deps.push(D('ct_SX2X076','ct_SX2X075','hard','认识平移前先认识轴对称图形，图形运动从对称开始'));
deps.push(D('ct_SX2X077','ct_SX2X076','soft','旋转与平移是一对对比概念，先学平移再学旋转更清晰'));
// 混合运算
deps.push(D('ct_SX2X081','ct_SX2X080','hard','两级运算顺序要在同级运算顺序熟练后再学'));
deps.push(D('ct_SX2X082','ct_SX2X081','hard','有小括号的混合运算以无括号的两级运算为对比基础'));
deps.push(D('ct_SX2X083','ct_SX2X082','hard','两步应用题需要会列含小括号的综合算式'));
deps.push(D('ct_SX2X083','ct_SX2X068','soft','两步应用题常涉及乘除法'));
// 有余数除法
deps.push(D('ct_SX2X090','ct_SX2X066','hard','有余数除法以整除除法为基础'));
deps.push(D('ct_SX2X091','ct_SX2X090','hard','余数比除数小的规律在理解有余数除法意义后学习'));
deps.push(D('ct_SX2X092','ct_SX2X090','hard','有余数除法竖式以有余数除法意义为基础'));
deps.push(D('ct_SX2X092','ct_SX2X091','hard','竖式计算时要用到余数比除数小来检验'));
deps.push(D('ct_SX2X093','ct_SX2X092','hard','有余数除法应用题以会竖式计算为基础'));
// 万以内数的认识
deps.push(D('ct_SX2X101','ct_SX2X100','hard','万以内数的读写以千以内数的认识为基础'));
deps.push(D('ct_SX2X102','ct_SX2X101','hard','比较大小要以会读写万以内数为基础'));
deps.push(D('ct_SX2X103','ct_SX2X102','soft','认识近似数以数的大小比较为基础'));
deps.push(D('ct_SX2X104','ct_SX2X101','hard','整百整千加减要以万以内数的组成和读写为基础'));
deps.push(D('ct_SX2X104','ct_SX2S011','soft','整百整千加减需要进退位加减法基础'));
// 克和千克
deps.push(D('ct_SX2X111','ct_SX2X110','hard','认识千克以认识克为基础（由轻到重）'));
deps.push(D('ct_SX2X112','ct_SX2X111','hard','质量计算以认识克和千克、知道换算为基础'));
// 推理（相对独立，需要基本逻辑思维）
deps.push(D('ct_SX2X120','ct_SX2S050','soft','逻辑推理与搭配问题的有序思考方法相通'));

// ===== 科学依赖 =====
deps.push(D('ct_KX2S002','ct_KX2S001','hard','理解土壤是动植物乐园，要先知道地球家园里有什么'));
deps.push(D('ct_KX2S004','ct_KX2S003','soft','认识四季以认识天气变化为基础'));
deps.push(D('ct_KX2S005','ct_KX2S003','soft','太阳位置与方向以观察天气、天空为基础'));
deps.push(D('ct_KX2S007','ct_KX2S006','hard','比较材料特点需要先认识常见材料'));
deps.push(D('ct_KX2S008','ct_KX2S007','soft','书的历史以材料特点认识为基础'));
deps.push(D('ct_KX2X010','ct_KX2X009','hard','磁铁两极要在知道磁铁能吸铁的基础上学习'));
deps.push(D('ct_KX2X011','ct_KX2X010','hard','指南针原理依赖磁极和磁极相互作用'));
deps.push(D('ct_KX2X013','ct_KX2X012','hard','用多种感官观察比较，要先知道五感分别是什么'));

// ===== 劳动技能依赖 =====
deps.push(D('ct_LD2S002','ct_LD2S001','soft','系鞋带和整理书包同属自我服务劳动，手部精细动作要求递进'));
deps.push(D('ct_LD2X004','ct_LD2S003','hard','洗碗比扫地擦桌子更复杂（涉及水、清洁剂、安全），以上学期家务为基础'));
deps.push(D('ct_LD2X006','ct_LD2S001','soft','叠衣服以上学期整理能力（整理书包）为基础'));

// ===== 英语依赖（按学习顺序） =====
deps.push(D('ct_YY2S002','ct_YY2S001','soft','数字词汇以简单问候和课堂习惯建立为基础'));
deps.push(D('ct_YY2S003','ct_YY2S001','soft','颜色词以基础听说习惯为基础'));
deps.push(D('ct_YY2X004','ct_YY2S001','hard','动物词汇以下册学习进度和上册听说基础为前提'));
deps.push(D('ct_YY2X005','ct_YY2X004','soft','家庭成员词汇与动物词汇同属名词扩展'));
deps.push(D('ct_YY2X006','ct_YY2S002','hard','学字母要在积累了一定听说词汇后，从听说过渡到读写'));

// ===== 信息科技/AI素养 =====
deps.push(D('ct_XX2Q002','ct_XX2Q001','hard','计算机操作以了解信息和信息技术为基础'));
deps.push(D('ct_XX2Q003','ct_XX2Q002','hard','键盘指法以认识计算机、会开机鼠标操作为基础'));
deps.push(D('ct_AI2Q005','ct_AI2Q004','hard','理解AI会犯错要先认识AI在生活中的应用'));
deps.push(D('ct_AI2Q006','ct_AI2Q005','soft','知道AI犯错后更容易理解AI的局限'));

// ===== 体育 =====
deps.push(D('ct_TY2Q004','ct_TY2Q002','soft','跳绳以基本跑动、协调能力为基础'));

// ===== 美术 =====
deps.push(D('ct_MS2Q003','ct_MS2Q002','hard','折纸以基本线条控制、手部精细动作为基础'));

const topicsData = JSON.parse(readFileSync(resolve(DATA, 'topics.json'), 'utf8'));
const existingTopicIds = new Set(topicsData.topics.map(t => t.id));
const seededDeps = deps.filter(dep => existingTopicIds.has(dep.topicId) && existingTopicIds.has(dep.prerequisiteId));
const skippedManualEdges = deps.length - seededDeps.length;

function seqOf(id) {
  const match = id.match(/(\d{3})$/);
  return match ? Number(match[1]) : 0;
}

const termOrder = { '上': 0, '下': 1, '全': 2 };

function addAutoDependencies(topics, edges) {
  const topicById = new Map(topics.map(topic => [topic.id, topic]));
  const topLevelTopics = topics.filter(topic => !topic.parentTopicId);

  for (const topic of topics) {
    if (!topic.parentTopicId) continue;
    if (!topicById.has(topic.parentTopicId)) continue;
    const strength = topic.subnodeType === '易错型' ? 'soft' : 'hard';
    const reason = topic.subnodeType
      ? `${topic.name}是“${topicById.get(topic.parentTopicId).name}”下的${topic.subnodeType}子节点，通常建立在父知识点理解之后`
      : `${topic.name}是“${topicById.get(topic.parentTopicId).name}”下的子节点，通常建立在父知识点理解之后`;
    edges.push(D(topic.id, topic.parentTopicId, strength, reason));
  }

  const manualGroupKeys = new Set();
  for (const edge of edges) {
    const target = topicById.get(edge.topicId);
    const prereq = topicById.get(edge.prerequisiteId);
    if (!target || !prereq) continue;
    if (target.parentTopicId || prereq.parentTopicId) continue;
    if (target.subject === prereq.subject && target.grade === prereq.grade && target.domain === prereq.domain && (target.textbook || '') === (prereq.textbook || '')) {
      manualGroupKeys.add(`${target.subject}|${target.grade}|${target.domain}|${target.textbook || ''}`);
    }
  }

  const byGroup = new Map();
  for (const topic of topLevelTopics) {
    const key = `${topic.subject}|${topic.grade}|${topic.domain}|${topic.textbook || ''}`;
    if (!byGroup.has(key)) byGroup.set(key, []);
    byGroup.get(key).push(topic);
  }

  for (const [key, group] of byGroup.entries()) {
    if (manualGroupKeys.has(key)) continue;
    group.sort((a, b) => (termOrder[a.term] - termOrder[b.term]) || (seqOf(a.id) - seqOf(b.id)));
    for (let i = 1; i < group.length; i++) {
      const prev = group[i - 1];
      const curr = group[i];
      const strength = (curr.type === 'PROCEDURAL' || curr.type === 'REPRESENTATIONAL') ? 'hard' : 'soft';
      const reason = `${curr.subject}${curr.grade}年级“${curr.domain}”领域按知识与能力递进组织，学习${curr.name}前通常会先掌握${prev.name}`;
      edges.push(D(curr.id, prev.id, strength, reason));
    }
  }

  const byDomainAcrossGrades = new Map();
  for (const topic of topLevelTopics) {
    const key = `${topic.subject}|${topic.domain}|${topic.textbook || ''}`;
    if (!byDomainAcrossGrades.has(key)) byDomainAcrossGrades.set(key, []);
    byDomainAcrossGrades.get(key).push(topic);
  }

  for (const group of byDomainAcrossGrades.values()) {
    const byGrade = new Map();
    for (const topic of group) {
      if (!byGrade.has(topic.grade)) byGrade.set(topic.grade, []);
      byGrade.get(topic.grade).push(topic);
    }
    const grades = [...byGrade.keys()].sort((a, b) => a - b);
    for (let i = 1; i < grades.length; i++) {
      const lower = byGrade.get(grades[i - 1]).sort((a, b) => (termOrder[a.term] - termOrder[b.term]) || (seqOf(a.id) - seqOf(b.id)));
      const higher = byGrade.get(grades[i]).sort((a, b) => (termOrder[a.term] - termOrder[b.term]) || (seqOf(a.id) - seqOf(b.id)));
      if (lower.length && higher.length) {
        edges.push(D(
          higher[0].id,
          lower[lower.length - 1].id,
          'soft',
          `${higher[0].subject}${grades[i]}年级该领域学习建立在${grades[i - 1]}年级同领域基础之上`
        ));
      }
    }
  }
}

addAutoDependencies(topicsData.topics, seededDeps);

const uniqueDeps = [];
const depSeen = new Set();
for (const dep of seededDeps) {
  const key = `${dep.topicId}|${dep.prerequisiteId}`;
  if (!depSeen.has(key)) {
    depSeen.add(key);
    uniqueDeps.push(dep);
  }
}

// 写 dependencies.json
const depJson = {
  version: 'v0.6-expanded',
  note: 'DAG 依赖方向：topicId 依赖 prerequisiteId（先学prerequisite，再学topic）',
  edgeCount: uniqueDeps.length,
  dependencies: uniqueDeps
};

const depStr = JSON.stringify(depJson, null, 2);
writeFileSync(resolve(DATA, 'dependencies.json'), depStr, 'utf8');

// 校验：每条边的两个端点必须存在
const topicIdSet = new Set(topicsData.topics.map(t => t.id));
let errors = 0;
for (const d of uniqueDeps) {
  if (!topicIdSet.has(d.topicId)) { console.error('❌ 未知 topicId:', d.topicId); errors++; }
  if (!topicIdSet.has(d.prerequisiteId)) { console.error('❌ 未知 prerequisiteId:', d.prerequisiteId); errors++; }
  if (d.topicId === d.prerequisiteId) { console.error('❌ 自依赖:', d.topicId); errors++; }
}

// DAG 检测 (拓扑排序)
const inDeg = {};
const graph = {};
for (const t of topicsData.topics) { inDeg[t.id] = 0; graph[t.id] = []; }
for (const d of uniqueDeps) {
  graph[d.prerequisiteId].push(d.topicId);
  inDeg[d.topicId]++;
}
const queue = [];
for (const [id, deg] of Object.entries(inDeg)) if (deg === 0) queue.push(id);
const rootCount = queue.length;
let processed = 0;
while (queue.length) {
  const cur = queue.shift();
  processed++;
  for (const nxt of graph[cur]) {
    inDeg[nxt]--;
    if (inDeg[nxt] === 0) queue.push(nxt);
  }
}
if (processed !== topicsData.topics.length) {
  console.error(`❌ 存在循环依赖！处理了${processed}/${topicsData.topics.length}个节点`);
  errors++;
}

if (errors === 0) {
  console.log(`✅ 依赖关系 ${uniqueDeps.length} 条写入成功，DAG无环，所有引用有效`);
  console.log(`   入度为0的根节点: ${rootCount} 个（起始知识点）`);
  if (skippedManualEdges > 0) console.log(`   已跳过 ${skippedManualEdges} 条不再存在的旧手工依赖`);
  // 统计hard/soft
  const hardN = uniqueDeps.filter(d=>d.strength==='hard').length;
  const softN = uniqueDeps.filter(d=>d.strength==='soft').length;
  console.log(`   强依赖(hard): ${hardN}, 弱依赖(soft): ${softN}`);
} else {
  process.exit(1);
}
