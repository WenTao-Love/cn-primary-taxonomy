import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', 'data', 'topics-others-g1-g6.json');

const SUBJECTS = {
  KX: { subject: '科学', textbook: '教科版' },
  DF: { subject: '道德与法治', textbook: '统编版' },
  LD: { subject: '劳动', textbook: '人教版' },
  TY: { subject: '体育与健康', textbook: '人教版' },
  MS: { subject: '美术', textbook: '人教版' },
  YYP: { subject: '音乐', textbook: '人教版' },
  XX: { subject: '信息科技', textbook: '教科版（参考）' },
  AI: { subject: 'AI素养', textbook: '自编内容' }
};

const TYPE_LABELS = { CONCEPTUAL: '概念', PROCEDURAL: '技能', REPRESENTATIONAL: '表征', LANGUAGE: '语言', META: '元认知' };
const AGE = { 1:[6,7],2:[7,8],3:[8,9],4:[9,10],5:[10,11],6:[11,12] };
const BAND = g => g <= 2 ? 'L' : g <= 4 ? 'M' : 'H';

function makeTopic(code, grade, index, spec) {
  const meta = SUBJECTS[code];
  const [ageRangeStart, ageRangeEnd] = AGE[grade];
  return {
    id: `ct_${code}${grade}${spec.term === '上' ? 'S' : spec.term === '下' ? 'X' : 'Q'}${String(index).padStart(3, '0')}`,
    type: spec.type,
    typeLabel: TYPE_LABELS[spec.type],
    subject: meta.subject,
    subjectCode: code,
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
    evidence: spec.evidence ?? [`能完成“${spec.name}”对应的基础学习任务`, `能在相关情境中较稳定地表现出该能力`],
    commonMistakes: spec.commonMistakes ?? [],
    examTips: spec.examTips ?? null,
    assessmentPrompt: spec.assessmentPrompt ?? null,
    standards: spec.standards ?? []
  };
}

const topics = [];
function pushTopics(code, grade, specs) {
  specs.forEach((spec, idx) => topics.push(makeTopic(code, grade, idx + 1, spec)));
}

const science = {
  1: [
    { type:'CONCEPTUAL', term:'上', domain:'生命科学', name:'认识身边常见动物植物', description:'能观察校园、家庭附近常见动物植物，知道它们有不同的外形和生活环境。', standards:['cn-kexue-2022:1-2-sm-1'] },
    { type:'CONCEPTUAL', term:'上', domain:'地球与宇宙科学', name:'天气和季节初步观察', description:'能辨认晴雨阴风等常见天气，知道季节变化会影响生活和自然界。', standards:['cn-kexue-2022:1-2-dq-2'] },
    { type:'PROCEDURAL', term:'下', domain:'物质科学', name:'用感官观察材料', description:'能用看、摸、听等方式观察纸、木头、金属、塑料等材料的明显特征。', standards:['cn-kexue-2022:1-2-wz-1'] }
  ],
  2: [
    { type:'CONCEPTUAL', term:'上', domain:'地球与宇宙科学', name:'地球家园中的动植物与环境', description:'知道地球家园中有空气、水、土壤、动植物和人，它们彼此联系。', standards:['cn-kexue-2022:1-2-dq-1'] },
    { type:'CONCEPTUAL', term:'下', domain:'物质科学', name:'磁铁的基本性质', description:'认识磁铁能吸铁、有磁极、能指示方向等基本性质。', standards:['cn-kexue-2022:1-2-wz-2'] },
    { type:'CONCEPTUAL', term:'下', domain:'生命科学', name:'人体感官和基本结构', description:'知道眼耳鼻舌皮肤的功能，认识身体主要部位和感觉器官。', standards:['cn-kexue-2022:1-2-sm-1'] }
  ],
  3: [
    { type:'CONCEPTUAL', term:'上', domain:'生命科学', name:'植物生长条件', description:'理解植物生长需要水、空气、阳光和适宜环境，并能进行简单观察。', standards:['cn-kexue-2022:3-4-sm-1'] },
    { type:'CONCEPTUAL', term:'上', domain:'物质科学', name:'水和空气占据空间', description:'知道空气和水都占据空间，能借助简单实验观察相关现象。', standards:['cn-kexue-2022:3-4-wz-1'] },
    { type:'PROCEDURAL', term:'下', domain:'工程与技术实践', name:'提出问题并做简单实验记录', description:'能围绕科学问题进行简单实验，记录现象并说出初步结论。', standards:['cn-kexue-2022:3-4-js-1'] }
  ],
  4: [
    { type:'CONCEPTUAL', term:'上', domain:'地球与宇宙科学', name:'太阳月亮和一天一年变化', description:'知道地球运动与昼夜、季节等现象相关，能建立初步联系。', standards:['cn-kexue-2022:3-4-dq-1'] },
    { type:'CONCEPTUAL', term:'上', domain:'物质科学', name:'声音和热现象初步', description:'能观察声音传播和热传递的常见现象，并进行简单解释。', standards:['cn-kexue-2022:3-4-wz-1'] },
    { type:'PROCEDURAL', term:'下', domain:'生命科学', name:'食物链和生物生存关系初步', description:'知道简单生物之间存在依存关系，能用实例说明。', standards:['cn-kexue-2022:3-4-sm-1'] }
  ],
  5: [
    { type:'CONCEPTUAL', term:'上', domain:'生命科学', name:'生物结构与功能联系', description:'知道生物体结构和功能相适应，能用常见动植物实例说明。', standards:['cn-kexue-2022:5-6-sm-1'] },
    { type:'CONCEPTUAL', term:'上', domain:'物质科学', name:'光电力现象初步联系', description:'能认识常见光、电现象及其在生活中的应用。', standards:['cn-kexue-2022:5-6-wz-1'] },
    { type:'PROCEDURAL', term:'下', domain:'工程与技术实践', name:'基于证据解释实验现象', description:'能根据实验记录提炼证据，对现象作较有条理的解释。', standards:['cn-kexue-2022:5-6-js-1'] }
  ],
  6: [
    { type:'CONCEPTUAL', term:'上', domain:'地球与宇宙科学', name:'生态环境和资源保护意识', description:'理解资源、环境、生态之间的联系，认识保护环境的重要性。', standards:['cn-kexue-2022:5-6-dq-1'] },
    { type:'CONCEPTUAL', term:'上', domain:'物质科学', name:'常见能量形式和转化初步', description:'知道热、光、电、机械等能量形式及简单转化现象。', standards:['cn-kexue-2022:5-6-wz-1'] },
    { type:'META', term:'下', domain:'科学探究', name:'基于问题设计并改进探究方案', description:'能围绕问题提出假设、设计探究方案并根据结果改进。', standards:['cn-kexue-2022:5-6-js-1'] }
  ]
};

const daofa = {
  1: [
    { type:'CONCEPTUAL', term:'上', domain:'生活适应', name:'认识学校生活和规则', description:'知道在学校里要遵守上课、排队、卫生等基本规则。', standards:['cn-daofa-2022:1-2-sh-1'] },
    { type:'CONCEPTUAL', term:'下', domain:'自我成长', name:'学会自己的事情自己做', description:'愿意整理书包、穿衣、收拾物品，逐步形成独立意识。', standards:['cn-daofa-2022:1-2-zt-1'] }
  ],
  2: [
    { type:'CONCEPTUAL', term:'上', domain:'集体生活', name:'班级生活有规则', description:'知道班级规则有助于共同学习生活，并愿意遵守和维护。', standards:['cn-daofa-2022:1-2-ji-1'] },
    { type:'CONCEPTUAL', term:'下', domain:'环境与生活', name:'节约资源与绿色生活', description:'懂得节约水、纸、电等资源，愿意做绿色生活的小行动者。', standards:['cn-daofa-2022:1-2-hj-1'] }
  ],
  3: [
    { type:'CONCEPTUAL', term:'上', domain:'社会生活', name:'理解家庭学校和社区中的责任', description:'知道自己在家庭、学校和社区中的角色与责任。', standards:['cn-daofa-2022:3-4-sh-1'] },
    { type:'CONCEPTUAL', term:'下', domain:'法治启蒙', name:'规则意识和公共文明', description:'知道公共生活离不开规则，懂得守秩序、讲文明。', standards:['cn-daofa-2022:3-4-fz-1'] }
  ],
  4: [
    { type:'CONCEPTUAL', term:'上', domain:'家国与文化', name:'了解家乡和中华传统文化', description:'了解家乡文化和中华优秀传统文化，增强认同感。', standards:['cn-daofa-2022:3-4-wh-1'] },
    { type:'CONCEPTUAL', term:'下', domain:'社会参与', name:'合作和服务意识', description:'在集体活动中学会合作，愿意参与力所能及的服务。', standards:['cn-daofa-2022:3-4-sh-1'] }
  ],
  5: [
    { type:'CONCEPTUAL', term:'上', domain:'公民意识', name:'权利义务和规则意识提升', description:'初步理解个人权利与义务统一，知道遵守规则和承担责任的重要性。', standards:['cn-daofa-2022:5-6-gm-1'] },
    { type:'CONCEPTUAL', term:'下', domain:'国家认同', name:'认识国家发展与个人成长关系', description:'知道个人成长与国家发展密切相关，增强家国情怀。', standards:['cn-daofa-2022:5-6-gj-1'] }
  ],
  6: [
    { type:'CONCEPTUAL', term:'上', domain:'法治观念', name:'生活中的法律和自我保护', description:'知道法律和生活密切相关，学会在常见情境中保护自己。', standards:['cn-daofa-2022:5-6-fz-1'] },
    { type:'CONCEPTUAL', term:'下', domain:'社会责任', name:'公共参与和责任担当', description:'愿意在集体和社会生活中表达意见、参与协作并承担责任。', standards:['cn-daofa-2022:5-6-gm-1'] }
  ]
};

const labor = {
  1: [
    { type:'PROCEDURAL', term:'上', domain:'日常生活劳动', name:'整理个人物品', description:'会整理书包、文具和衣物，保持个人物品整洁有序。', standards:['cn-laodong-2022:1-2-sh-1'] },
    { type:'PROCEDURAL', term:'下', domain:'日常生活劳动', name:'餐前餐后简单整理', description:'会摆放餐具、收拾桌面，养成基本劳动习惯。', standards:['cn-laodong-2022:1-2-sh-1'] }
  ],
  2: [
    { type:'PROCEDURAL', term:'上', domain:'日常生活劳动', name:'扫地擦桌和叠衣服', description:'能完成扫地、擦桌、叠衣服等基础家务。', standards:['cn-laodong-2022:1-2-sh-1'] },
    { type:'PROCEDURAL', term:'下', domain:'生产劳动', name:'种植和照料小植物', description:'会种植并照料一种小植物，观察其成长过程。', standards:['cn-laodong-2022:1-2-sc-1'] }
  ],
  3: [
    { type:'PROCEDURAL', term:'上', domain:'日常生活劳动', name:'整理学习与生活空间', description:'能较有计划地整理书桌、抽屉和个人空间。', standards:['cn-laodong-2022:3-4-sh-1'] },
    { type:'PROCEDURAL', term:'下', domain:'服务性劳动', name:'参与班级值日和协作劳动', description:'能在值日、整理、分工中完成明确任务。', standards:['cn-laodong-2022:3-4-fw-1'] }
  ],
  4: [
    { type:'PROCEDURAL', term:'上', domain:'日常生活劳动', name:'制作简单营养早餐或点心', description:'在成人指导下完成简单食品准备，注意卫生和安全。', standards:['cn-laodong-2022:3-4-sh-1'] },
    { type:'PROCEDURAL', term:'下', domain:'生产劳动', name:'参与种植或养护劳动记录', description:'能参与校园或家庭种植、养护活动并记录过程。', standards:['cn-laodong-2022:3-4-sc-1'] }
  ],
  5: [
    { type:'PROCEDURAL', term:'上', domain:'日常生活劳动', name:'计划和分工完成家务任务', description:'能根据任务需要安排顺序、准备工具并较独立完成家务。', standards:['cn-laodong-2022:5-6-sh-1'] },
    { type:'PROCEDURAL', term:'下', domain:'服务性劳动', name:'面向集体开展服务劳动', description:'能围绕班级、学校或社区需要参与服务性劳动。', standards:['cn-laodong-2022:5-6-fw-1'] }
  ],
  6: [
    { type:'META', term:'上', domain:'劳动素养', name:'劳动计划与过程改进', description:'能根据劳动任务制定计划，并在实践后总结改进。', standards:['cn-laodong-2022:5-6-sh-1'] },
    { type:'PROCEDURAL', term:'下', domain:'生产劳动', name:'完成较完整项目化劳动任务', description:'能在指导下完成较完整的种植、制作或维护类劳动项目。', standards:['cn-laodong-2022:5-6-sc-1'] }
  ]
};

const pe = {
  1: [
    { type:'PROCEDURAL', term:'全', domain:'基本运动技能', name:'正确坐立行姿和队列意识', description:'能保持基本正确体态，听口令完成简单队列动作。', standards:['cn-tiyu-2022:1-2-zs-1'] },
    { type:'PROCEDURAL', term:'全', domain:'移动性技能', name:'跑跳投基础动作', description:'能做出跑、跳、投的基本动作并参与简单游戏。', standards:['cn-tiyu-2022:1-2-pao-1'] }
  ],
  2: [
    { type:'PROCEDURAL', term:'全', domain:'基本运动技能', name:'广播体操和跳绳入门', description:'能较规范完成广播体操和并脚跳绳等基础练习。', standards:['cn-tiyu-2022:1-2-tc-1','cn-tiyu-2022:1-2-tiaosheng-1'] },
    { type:'META', term:'全', domain:'健康行为', name:'运动中的安全和合作意识', description:'知道运动前后基本要求，愿意在活动中与同伴合作。', standards:['cn-tiyu-2022:1-2-zs-1'] }
  ],
  3: [
    { type:'PROCEDURAL', term:'全', domain:'基本运动技能', name:'灵敏协调与球类入门', description:'能完成转、移、接、拍等基础协调和球类入门动作。', standards:['cn-tiyu-2022:3-4-jn-1'] },
    { type:'META', term:'全', domain:'健康行为', name:'理解锻炼习惯的重要性', description:'知道坚持锻炼有利于体能和健康，逐步形成习惯。', standards:['cn-tiyu-2022:3-4-jk-1'] }
  ],
  4: [
    { type:'PROCEDURAL', term:'全', domain:'专项运动技能', name:'跑跳投和游戏规则运用', description:'能在跑跳投和集体游戏中较熟练运用规则与动作。', standards:['cn-tiyu-2022:3-4-jn-1'] },
    { type:'META', term:'全', domain:'体育品德', name:'比赛中的规则意识和团队合作', description:'懂得遵守规则、公平竞争并与团队协作。', standards:['cn-tiyu-2022:3-4-pd-1'] }
  ],
  5: [
    { type:'PROCEDURAL', term:'全', domain:'专项运动技能', name:'发展耐力速度和球类基础', description:'能在速度、耐力和基础球类活动中保持较稳定表现。', standards:['cn-tiyu-2022:5-6-jn-1'] },
    { type:'META', term:'全', domain:'健康行为', name:'理解运动负荷和自我调节', description:'知道运动强度、休息和安全之间的关系，能简单自我调节。', standards:['cn-tiyu-2022:5-6-jk-1'] }
  ],
  6: [
    { type:'PROCEDURAL', term:'全', domain:'专项运动技能', name:'在竞赛活动中综合运用运动技能', description:'能在规则明确的竞赛活动中综合运用所学运动技能。', standards:['cn-tiyu-2022:5-6-jn-1'] },
    { type:'META', term:'全', domain:'体育品德', name:'公平竞争与责任担当', description:'能在体育活动中表现出公平竞争、坚持和责任担当。', standards:['cn-tiyu-2022:5-6-pd-1'] }
  ]
};

const art = {
  1: [
    { type:'PROCEDURAL', term:'全', domain:'造型表现', name:'色彩和线条基础表现', description:'会用基本颜色和简单线条表现熟悉事物。', standards:['cn-meishu-2022:1-2-ys-1','cn-meishu-2022:1-2-xian-1'] },
    { type:'PROCEDURAL', term:'全', domain:'设计应用', name:'简单折剪和手工制作', description:'能完成简单折纸、剪贴和手工制作。', standards:['cn-meishu-2022:1-2-zs-1'] }
  ],
  2: [
    { type:'PROCEDURAL', term:'全', domain:'造型表现', name:'观察后进行简单造型表现', description:'能观察常见对象并用线条、色块进行表现。', standards:['cn-meishu-2022:1-2-xian-1'] },
    { type:'CONCEPTUAL', term:'全', domain:'审美感知', name:'感受色彩和图形带来的美感', description:'能说出自己喜欢的颜色、图形和简单美术作品感受。', standards:['cn-meishu-2022:1-2-ys-1'] }
  ],
  3: [
    { type:'PROCEDURAL', term:'全', domain:'造型表现', name:'运用构图和综合色彩表现主题', description:'能围绕主题进行较完整的画面安排和色彩表达。', standards:['cn-meishu-2022:3-4-zx-1'] },
    { type:'PROCEDURAL', term:'全', domain:'设计应用', name:'生活物品美化与简单设计', description:'能围绕生活用品进行简单装饰或设计。', standards:['cn-meishu-2022:3-4-sj-1'] }
  ],
  4: [
    { type:'CONCEPTUAL', term:'全', domain:'欣赏评述', name:'初步理解作品内容和表现方法', description:'能从主题、色彩、构图等角度说出作品的特点。', standards:['cn-meishu-2022:3-4-xs-1'] },
    { type:'PROCEDURAL', term:'全', domain:'综合探索', name:'在主题活动中综合运用材料创作', description:'能结合多种材料完成主题创作。', standards:['cn-meishu-2022:3-4-zh-1'] }
  ],
  5: [
    { type:'PROCEDURAL', term:'全', domain:'造型表现', name:'较深入地表现人物景物和想象内容', description:'能围绕主题选择合适材料与表现方法进行创作。', standards:['cn-meishu-2022:5-6-zx-1'] },
    { type:'CONCEPTUAL', term:'全', domain:'欣赏评述', name:'联系文化背景欣赏作品', description:'能结合文化背景和表现形式谈作品感受。', standards:['cn-meishu-2022:5-6-xs-1'] }
  ],
  6: [
    { type:'PROCEDURAL', term:'全', domain:'设计应用', name:'围绕需求完成简单设计表达', description:'能围绕校园、生活场景中的需求进行简单设计。', standards:['cn-meishu-2022:5-6-sj-1'] },
    { type:'META', term:'全', domain:'综合探索', name:'说明自己的创作思路和改进', description:'能介绍作品创意、材料选择和改进想法。', standards:['cn-meishu-2022:5-6-zh-1'] }
  ]
};

const music = {
  1: [
    { type:'CONCEPTUAL', term:'全', domain:'音乐基础', name:'唱名节拍和简单节奏感知', description:'能识别简单节奏和基础唱名，感受音乐快慢强弱。', standards:['cn-yinyue-2022:1-2-yl-1'] },
    { type:'PROCEDURAL', term:'全', domain:'演唱', name:'自然声音歌唱和简单律动', description:'能用自然声音歌唱，并配合简单律动或节奏动作。', standards:['cn-yinyue-2022:1-2-ys-1'] }
  ],
  2: [
    { type:'PROCEDURAL', term:'全', domain:'演奏与表现', name:'使用简单打击乐器伴奏', description:'能跟随歌曲使用简单打击乐器进行节奏伴奏。', standards:['cn-yinyue-2022:1-2-yq-1'] },
    { type:'CONCEPTUAL', term:'全', domain:'音乐基础', name:'辨别音高和节奏变化', description:'能初步辨别高低、长短、快慢等音乐变化。', standards:['cn-yinyue-2022:1-2-yl-1'] }
  ],
  3: [
    { type:'PROCEDURAL', term:'全', domain:'演唱', name:'较完整地演唱歌曲并表达情绪', description:'能较完整地演唱歌曲，注意音准、节奏和情绪。', standards:['cn-yinyue-2022:3-4-ys-1'] },
    { type:'CONCEPTUAL', term:'全', domain:'欣赏', name:'感受不同音乐形象和情绪', description:'能听辨音乐带来的不同情绪和形象。', standards:['cn-yinyue-2022:3-4-xs-1'] }
  ],
  4: [
    { type:'PROCEDURAL', term:'全', domain:'演奏与创编', name:'进行简单节奏创编或器乐表现', description:'能围绕节奏型进行简单创编或基础器乐表现。', standards:['cn-yinyue-2022:3-4-cb-1'] },
    { type:'CONCEPTUAL', term:'全', domain:'音乐基础', name:'识读更丰富的节奏和力度记号', description:'能认识较常见的节奏、力度和速度记号。', standards:['cn-yinyue-2022:3-4-yl-1'] }
  ],
  5: [
    { type:'PROCEDURAL', term:'全', domain:'演唱', name:'较有表现力地歌唱', description:'能在音准、节奏较稳定的基础上进行有表现力的歌唱。', standards:['cn-yinyue-2022:5-6-ys-1'] },
    { type:'CONCEPTUAL', term:'全', domain:'欣赏', name:'联系文化和情境欣赏音乐', description:'能结合文化背景和内容初步理解音乐作品。', standards:['cn-yinyue-2022:5-6-xs-1'] }
  ],
  6: [
    { type:'PROCEDURAL', term:'全', domain:'创编与表现', name:'围绕主题进行简单音乐创编', description:'能围绕主题进行简单节奏、旋律或表演创编。', standards:['cn-yinyue-2022:5-6-cb-1'] },
    { type:'META', term:'全', domain:'综合艺术实践', name:'说明音乐表现思路和合作过程', description:'能在音乐实践后反思表现效果和合作过程。', standards:['cn-yinyue-2022:5-6-zh-1'] }
  ]
};

const infotech = {
  1: [
    { type:'CONCEPTUAL', term:'全', domain:'信息意识', name:'信息来自多种渠道', description:'知道书本、广播、电视、电脑和身边交流都能提供信息。', standards:['cn-xxkj-2022:1-2-xx-1'] },
    { type:'PROCEDURAL', term:'全', domain:'数字设备', name:'认识电脑和平板基本操作', description:'能认识显示器、键盘、鼠标等部件并进行基本操作。', standards:['cn-xxkj-2022:1-2-sb-1'] }
  ],
  2: [
    { type:'PROCEDURAL', term:'全', domain:'数字设备', name:'键盘鼠标基础操作', description:'能进行点击、拖动、输入等基础操作，养成规范用机习惯。', standards:['cn-xxkj-2022:1-2-sb-1'] },
    { type:'META', term:'全', domain:'数字安全', name:'爱护设备和文明用机', description:'知道文明用机、保护眼睛和爱护设备的重要性。', standards:['cn-xxkj-2022:1-2-aq-1'] }
  ],
  3: [
    { type:'PROCEDURAL', term:'全', domain:'信息表达', name:'输入和整理简单数字作品', description:'能输入文字、整理图片并完成简单数字作品。', standards:['cn-xxkj-2022:3-4-bd-1'] },
    { type:'CONCEPTUAL', term:'全', domain:'信息意识', name:'辨别有用信息和无关信息', description:'能在任务情境中初步筛选有用信息。', standards:['cn-xxkj-2022:3-4-xx-1'] }
  ],
  4: [
    { type:'PROCEDURAL', term:'全', domain:'信息表达', name:'制作简单演示或图文作品', description:'能围绕主题组织信息并制作简单演示或图文作品。', standards:['cn-xxkj-2022:3-4-bd-1'] },
    { type:'META', term:'全', domain:'计算思维', name:'按步骤解决数字任务', description:'能把较复杂的数字任务拆成步骤来完成。', standards:['cn-xxkj-2022:3-4-jsw-1'] }
  ],
  5: [
    { type:'PROCEDURAL', term:'全', domain:'数据与编码', name:'表格整理和简单数据分析', description:'能用表格记录、整理并初步分析数据。', standards:['cn-xxkj-2022:5-6-sj-1'] },
    { type:'META', term:'全', domain:'数字安全', name:'网络信息辨别和安全意识', description:'能识别常见网络风险，保护个人信息与数字身份。', standards:['cn-xxkj-2022:5-6-aq-1'] }
  ],
  6: [
    { type:'PROCEDURAL', term:'全', domain:'计算思维', name:'用流程和规则描述数字问题', description:'能用流程、规则和步骤表达解决数字问题的思路。', standards:['cn-xxkj-2022:5-6-jsw-1'] },
    { type:'META', term:'全', domain:'数字创新', name:'围绕真实任务完成综合数字作品', description:'能围绕真实问题综合运用工具完成数字表达。', standards:['cn-xxkj-2022:5-6-bd-1'] }
  ]
};

const ai = {
  1: [
    { type:'CONCEPTUAL', term:'全', domain:'AI认知', name:'身边的智能设备', description:'认识语音助手、智能音箱等身边常见的智能设备。', standards:['cn-ai-2024:1-2-rz-1'] },
    { type:'CONCEPTUAL', term:'全', domain:'AI局限', name:'AI也会出错', description:'知道智能设备有时会识别错误，不能盲目信任。', standards:['cn-ai-2024:1-2-pl-1'] }
  ],
  2: [
    { type:'CONCEPTUAL', term:'全', domain:'AI认知', name:'区分智能和非智能设备', description:'能从感知、响应和辅助人类等角度区分智能设备与普通设备。', standards:['cn-ai-2024:1-2-rz-1'] },
    { type:'META', term:'全', domain:'AI应用', name:'在老师家长指导下体验AI工具', description:'能在指导下体验基础AI工具，并说出用途。', standards:['cn-ai-2024:1-2-rz-1'] }
  ],
  3: [
    { type:'CONCEPTUAL', term:'全', domain:'AI认知', name:'理解AI通过数据学习', description:'知道AI往往借助数据识别、分类和推荐。', standards:['cn-ai-2024:3-4-rz-1'] },
    { type:'META', term:'全', domain:'AI素养', name:'用清晰指令与智能工具交互', description:'能用清晰简短的指令和问题与智能工具交互。', standards:['cn-ai-2024:3-4-yy-1'] }
  ],
  4: [
    { type:'CONCEPTUAL', term:'全', domain:'AI局限', name:'认识AI偏差和误判现象', description:'知道AI的判断可能受数据和规则限制而出现偏差。', standards:['cn-ai-2024:3-4-pl-1'] },
    { type:'META', term:'全', domain:'AI应用', name:'比较AI建议与人的判断', description:'能比较AI给出的结果与人的判断，并做简单取舍。', standards:['cn-ai-2024:3-4-yy-1'] }
  ],
  5: [
    { type:'CONCEPTUAL', term:'全', domain:'AI伦理', name:'个人信息和AI使用边界', description:'理解在使用AI工具时要注意个人信息保护和使用边界。', standards:['cn-ai-2024:5-6-ll-1'] },
    { type:'META', term:'全', domain:'AI应用', name:'把AI作为学习辅助而非替代', description:'知道AI可以辅助学习，但不能代替思考和判断。', standards:['cn-ai-2024:5-6-yy-1'] }
  ],
  6: [
    { type:'META', term:'全', domain:'AI素养', name:'评估AI输出的可信度', description:'能从事实、逻辑和来源角度初步评估AI输出是否可信。', standards:['cn-ai-2024:5-6-pl-1'] },
    { type:'META', term:'全', domain:'AI伦理', name:'负责任地使用AI工具', description:'能在学习和创作中负责任地使用AI工具，避免抄袭与误导。', standards:['cn-ai-2024:5-6-ll-1'] }
  ]
};

for (const grade of [1,2,3,4,5,6]) {
  pushTopics('KX', grade, science[grade]);
  pushTopics('DF', grade, daofa[grade]);
  pushTopics('LD', grade, labor[grade]);
  pushTopics('TY', grade, pe[grade]);
  pushTopics('MS', grade, art[grade]);
  pushTopics('YYP', grade, music[grade]);
  pushTopics('XX', grade, infotech[grade]);
  pushTopics('AI', grade, ai[grade]);
}

const data = {
  version: 'v0.3-all-grades',
  note: '科学/道德与法治/劳动/体育与健康/美术/音乐/信息科技/AI素养 1-6年级知识点',
  topicCount: topics.length,
  topics
};

writeFileSync(OUT, JSON.stringify(data, null, 2), 'utf8');
console.log(`✅ 其他学科 1-6 年级：${topics.length} 个知识点写入 ${OUT}`);
