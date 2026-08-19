import { createTopicFactory } from './lib/topic-factory.mjs';

const { writeTopics } = createTopicFactory({
  subject: '数学',
  subjectCode: 'SX',
  grade: 6,
  textbook: '人教版',
  outputFile: 'topics-shuxue-g6.json'
});

const specs = [
  { type: 'CONCEPTUAL', term: '上', domain: '数与代数', name: '分数乘法的意义', description: '理解分数乘整数、整数乘分数和分数乘分数的意义。', difficulty: 4, commonMistakes: ['只会算不会解释意义', '单位1理解不清'], examTips: '常考：算理说明、图示理解。', standards: ['cn-shuxue-2022:5-6-syds-1'] },
  { type: 'PROCEDURAL', term: '上', domain: '数与代数', name: '分数乘法计算', description: '掌握分数乘法计算及约分技巧。', difficulty: 4, commonMistakes: ['约分时位置混乱', '乘完不化简'], examTips: '常考：分数乘法计算。', standards: ['cn-shuxue-2022:5-6-syds-1'] },
  { type: 'CONCEPTUAL', term: '上', domain: '数与代数', name: '倒数的意义', description: '理解两个数乘积是1时互为倒数。', difficulty: 3, commonMistakes: ['把相反数和倒数混淆', '0的倒数错误'], examTips: '常考：求倒数、判断。', standards: ['cn-shuxue-2022:5-6-syds-1'] },
  { type: 'PROCEDURAL', term: '上', domain: '数与代数', name: '分数除法计算', description: '掌握分数除法转化为乘倒数的计算方法。', difficulty: 4, commonMistakes: ['只把除数颠倒一部分', '带分数处理不熟'], examTips: '常考：分数除法、混合计算。', standards: ['cn-shuxue-2022:5-6-syds-1'] },
  { type: 'PROCEDURAL', term: '上', domain: '数与代数', name: '分数乘除法应用题', description: '能结合单位1和数量关系解决“求几分之几是多少”等问题。', difficulty: 5, commonMistakes: ['单位1找错', '乘除法选择错误'], examTips: '常考：分数应用题。', standards: ['cn-shuxue-2022:5-6-syds-2'] },
  { type: 'CONCEPTUAL', term: '上', domain: '数与代数', name: '比的意义', description: '理解比表示两个量之间的倍数关系，知道比与除法、分数的联系。', difficulty: 4, commonMistakes: ['比和差混淆', '前项后项顺序错'], examTips: '常考：写比、化简比、意义辨析。', standards: ['cn-shuxue-2022:5-6-syds-2'] },
  { type: 'PROCEDURAL', term: '上', domain: '数与代数', name: '比的基本性质与化简比', description: '掌握比的基本性质，会化简比。', difficulty: 4, commonMistakes: ['只约整数不顾小数分数', '化简结果不规范'], examTips: '常考：化简比。', standards: ['cn-shuxue-2022:5-6-syds-2'] },
  { type: 'PROCEDURAL', term: '上', domain: '数与代数', name: '按比例分配', description: '能根据比或份数关系进行按比例分配。', difficulty: 4, commonMistakes: ['总份数求错', '部分和总量对应关系错'], examTips: '常考：按比分配问题。', standards: ['cn-shuxue-2022:5-6-syds-2'] },
  { type: 'CONCEPTUAL', term: '下', domain: '数与代数', name: '百分数的意义', description: '理解百分数表示一个数是另一个数的百分之几。', difficulty: 4, commonMistakes: ['百分数和分数混用情境不分', '百分号使用不规范'], examTips: '常考：读写百分数、意义判断。', standards: ['cn-shuxue-2022:5-6-syds-1'] },
  { type: 'PROCEDURAL', term: '下', domain: '数与代数', name: '百分数和分数小数互化', description: '掌握百分数、分数和小数之间的互化。', difficulty: 4, commonMistakes: ['除以100和乘100混淆', '循环小数转百分数处理错误'], examTips: '常考：互化计算。', standards: ['cn-shuxue-2022:5-6-syds-1'] },
  { type: 'PROCEDURAL', term: '下', domain: '数与代数', name: '百分数应用题', description: '能解决求一个数的百分之几、增加百分之几、减少百分之几等问题。', difficulty: 5, commonMistakes: ['单位1找错', '百分率和具体量混淆'], examTips: '常考：打折、成数、增长率。', standards: ['cn-shuxue-2022:5-6-syds-2'] },
  { type: 'CONCEPTUAL', term: '下', domain: '数与代数', name: '负数初步认识', description: '在温度、海拔、收支等情境中认识负数。', difficulty: 3, commonMistakes: ['负号和减号混淆', '数轴方向不清'], examTips: '常考：读写负数、比较大小。', standards: ['cn-shuxue-2022:5-6-syds-1'] },
  { type: 'PROCEDURAL', term: '下', domain: '数与代数', name: '用方程表示数量关系', description: '能用含有未知数的等式表示简单数量关系。', difficulty: 4, commonMistakes: ['未知数设得不合理', '等量关系写错'], examTips: '常考：列方程。', standards: ['cn-shuxue-2022:5-6-syds-2'] },
  { type: 'PROCEDURAL', term: '下', domain: '数与代数', name: '解简易方程', description: '会解一元一次简易方程，并通过检验确认结果。', difficulty: 4, commonMistakes: ['移项感太强导致算理不清', '解完不检验'], examTips: '常考：解方程。', standards: ['cn-shuxue-2022:5-6-syds-2'] },
  { type: 'PROCEDURAL', term: '下', domain: '数与代数', name: '列方程解决应用题', description: '能根据等量关系列方程解决简单实际问题。', difficulty: 5, commonMistakes: ['等量关系找不准', '方程列对但解释不清'], examTips: '常考：列方程解应用题。', standards: ['cn-shuxue-2022:5-6-syds-2'] },

  { type: 'CONCEPTUAL', term: '上', domain: '图形与几何', name: '圆的认识', description: '理解圆心、半径、直径等基本概念及其关系。', difficulty: 3, commonMistakes: ['直径和半径关系不稳', '圆心位置判断错误'], examTips: '常考：概念辨析、画圆。', standards: ['cn-shuxue-2022:5-6-tx-1'] },
  { type: 'PROCEDURAL', term: '上', domain: '图形与几何', name: '圆的周长', description: '理解圆周率的意义，掌握圆周长公式。', difficulty: 4, commonMistakes: ['半径直径混用', '周长公式和面积公式混淆'], examTips: '常考：圆周长计算。', standards: ['cn-shuxue-2022:5-6-tx-1'] },
  { type: 'PROCEDURAL', term: '上', domain: '图形与几何', name: '圆的面积', description: '理解圆面积公式推导，并能进行计算。', difficulty: 4, commonMistakes: ['平方单位漏写', '周长和面积概念混淆'], examTips: '常考：圆面积、组合图形。', standards: ['cn-shuxue-2022:5-6-tx-1'] },
  { type: 'PROCEDURAL', term: '上', domain: '图形与几何', name: '扇形和组合图形面积', description: '能在较复杂图形中综合运用圆面积知识。', difficulty: 5, commonMistakes: ['图形拆分不合理', '面积重复计算'], examTips: '常考：阴影部分面积。', standards: ['cn-shuxue-2022:5-6-tx-1'] },
  { type: 'CONCEPTUAL', term: '下', domain: '图形与几何', name: '比例尺的意义', description: '理解图上距离、实际距离和比例尺的关系。', difficulty: 4, commonMistakes: ['方向搞反', '单位不统一'], examTips: '常考：比例尺应用。', standards: ['cn-shuxue-2022:5-6-tx-2'] },
  { type: 'PROCEDURAL', term: '下', domain: '图形与几何', name: '按比例尺求实际距离和图上距离', description: '能根据比例尺解决地图和示意图中的距离问题。', difficulty: 4, commonMistakes: ['单位不统一就计算', '比例尺写法不规范'], examTips: '常考：地图应用题。', standards: ['cn-shuxue-2022:5-6-tx-2'] },
  { type: 'CONCEPTUAL', term: '下', domain: '图形与几何', name: '圆柱和圆锥初步认识', description: '认识圆柱、圆锥的基本特征。', difficulty: 3, commonMistakes: ['底面侧面概念混淆', '和长方体特征混搭'], examTips: '常考：立体图形特征。', standards: ['cn-shuxue-2022:5-6-tx-1'] },
  { type: 'PROCEDURAL', term: '下', domain: '图形与几何', name: '圆柱表面积和体积', description: '掌握圆柱表面积和体积公式并解决实际问题。', difficulty: 5, commonMistakes: ['表面积漏底面', '体积公式套错'], examTips: '常考：圆柱计算。', standards: ['cn-shuxue-2022:5-6-tx-1'] },
  { type: 'CONCEPTUAL', term: '下', domain: '图形与几何', name: '圆锥体积公式理解', description: '理解圆锥体积和等底等高圆柱体积的关系。', difficulty: 5, commonMistakes: ['忘记除以3', '等底等高关系不清'], examTips: '常考：圆锥体积。', standards: ['cn-shuxue-2022:5-6-tx-1'] },

  { type: 'PROCEDURAL', term: '下', domain: '统计与概率', name: '扇形统计图', description: '能读懂扇形统计图，并把部分与整体关系联系起来分析。', difficulty: 4, commonMistakes: ['只看面积大小不看百分比', '类别和占比对应错'], examTips: '常考：扇形统计图分析。', standards: ['cn-shuxue-2022:5-6-sjtj-1'] },
  { type: 'CONCEPTUAL', term: '下', domain: '统计与概率', name: '平均数的意义和应用', description: '理解平均数表示总体水平，能用平均数分析数据。', difficulty: 4, commonMistakes: ['平均数和中间数混淆', '不会从总量角度理解'], examTips: '常考：平均数问题。', standards: ['cn-shuxue-2022:5-6-sjtj-1'] },

  { type: 'META', term: '下', domain: '综合与实践', name: '综合运用比例和方程解决问题', description: '能在综合问题中灵活选择比例、方程、算术方法。', difficulty: 5, commonMistakes: ['方法选择僵化', '等量和对应关系混乱'], examTips: '常见任务：综合应用题。', standards: ['cn-shuxue-2022:5-6-zonghe-1'] },
  { type: 'META', term: '下', domain: '综合与实践', name: '毕业总复习中的知识关联', description: '能主动把整数、小数、分数、比、比例、方程等知识联系起来。', difficulty: 4, commonMistakes: ['知识点孤立掌握', '迁移应用不足'], examTips: '常见任务：总复习综合题。', standards: ['cn-shuxue-2022:5-6-zonghe-1'] }
];

writeTopics('数学（人教版六年级上+下）知识点', specs);
