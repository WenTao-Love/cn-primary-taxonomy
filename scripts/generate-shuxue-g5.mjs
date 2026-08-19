import { createTopicFactory } from './lib/topic-factory.mjs';

const { writeTopics } = createTopicFactory({
  subject: '数学',
  subjectCode: 'SX',
  grade: 5,
  textbook: '人教版',
  outputFile: 'topics-shuxue-g5.json'
});

const specs = [
  { type: 'CONCEPTUAL', term: '上', domain: '数与代数', name: '小数的数位和计数单位提升', description: '理解十分位、百分位、千分位的意义和计数单位关系。', difficulty: 3, commonMistakes: ['位值和计数单位混淆', '数位顺序不熟'], examTips: '常考：小数读写、数位意义。', standards: ['cn-shuxue-2022:5-6-syds-1'] },
  { type: 'PROCEDURAL', term: '上', domain: '数与代数', name: '小数乘整数', description: '掌握小数乘整数的算理和笔算方法。', difficulty: 3, commonMistakes: ['先点小数点再乘', '小数点位置错误'], examTips: '常考：小数乘整数笔算。', standards: ['cn-shuxue-2022:5-6-syds-1'] },
  { type: 'PROCEDURAL', term: '上', domain: '数与代数', name: '小数乘小数', description: '掌握小数乘小数的笔算，理解积的小数位数确定方法。', difficulty: 4, commonMistakes: ['小数位数点错', '末尾0处理不当'], examTips: '常考：笔算、改错。', standards: ['cn-shuxue-2022:5-6-syds-1'] },
  { type: 'PROCEDURAL', term: '上', domain: '数与代数', name: '积的近似值', description: '能根据需要保留小数位数，求积的近似值。', difficulty: 3, commonMistakes: ['四舍五入位置不准', '保留位和结果单位不一致'], examTips: '常考：按要求保留小数。', standards: ['cn-shuxue-2022:5-6-syds-3'] },
  { type: 'PROCEDURAL', term: '上', domain: '数与代数', name: '小数除以整数', description: '掌握小数除以整数的笔算方法。', difficulty: 4, commonMistakes: ['商的小数点位置错', '整数部分不够除时处理不当'], examTips: '常考：竖式计算。', standards: ['cn-shuxue-2022:5-6-syds-1'] },
  { type: 'PROCEDURAL', term: '上', domain: '数与代数', name: '一个数除以小数', description: '理解把除数变成整数再计算的算理。', difficulty: 4, commonMistakes: ['被除数和除数移动位数不一致', '商不变规律应用错误'], examTips: '常考：小数除法。', standards: ['cn-shuxue-2022:5-6-syds-1'] },
  { type: 'PROCEDURAL', term: '上', domain: '数与代数', name: '商的近似值', description: '能根据需要保留指定位数求商的近似值。', difficulty: 3, commonMistakes: ['除尽和保留位概念混淆', '四舍五入位置不准'], examTips: '常考：求商的近似值。', standards: ['cn-shuxue-2022:5-6-syds-3'] },
  { type: 'PROCEDURAL', term: '上', domain: '数与代数', name: '循环小数初步认识', description: '初步认识循环小数，能辨认简单循环节。', difficulty: 3, commonMistakes: ['无限小数和循环小数不分', '循环节判断错误'], examTips: '常考：判断和表示循环小数。', standards: ['cn-shuxue-2022:5-6-syds-1'] },
  { type: 'CONCEPTUAL', term: '下', domain: '数与代数', name: '分数的意义和单位1', description: '理解单位“1”和分数表示部分与整体关系。', difficulty: 4, commonMistakes: ['单位1变化后分数意义跟不上', '分子分母机械记忆'], examTips: '常考：看图写分数、解释单位1。', standards: ['cn-shuxue-2022:5-6-syds-1'] },
  { type: 'CONCEPTUAL', term: '下', domain: '数与代数', name: '真分数假分数带分数', description: '能辨认真分数、假分数和带分数，并理解它们关系。', difficulty: 3, commonMistakes: ['假分数和带分数互化不稳', '大于1的分数理解不清'], examTips: '常考：分类、互化。', standards: ['cn-shuxue-2022:5-6-syds-1'] },
  { type: 'PROCEDURAL', term: '下', domain: '数与代数', name: '分数与除法关系', description: '理解分数和除法的联系，会用分数表示除法结果。', difficulty: 4, commonMistakes: ['被除数除数位置颠倒', '除法意义和分数意义不能贯通'], examTips: '常考：分数与除法互化。', standards: ['cn-shuxue-2022:5-6-syds-1'] },
  { type: 'PROCEDURAL', term: '下', domain: '数与代数', name: '分数基本性质', description: '理解分数的分子分母同时乘或除以相同数分数值不变。', difficulty: 4, commonMistakes: ['只记形式不理解值不变', '乘除0情况混淆'], examTips: '常考：填空、约分通分基础。', standards: ['cn-shuxue-2022:5-6-syds-1'] },
  { type: 'PROCEDURAL', term: '下', domain: '数与代数', name: '约分和通分', description: '掌握分数约分和通分，为分数比较及运算打基础。', difficulty: 4, commonMistakes: ['最大公因数和最小公倍数不会用', '只会机械算'], examTips: '常考：约分、通分、比较大小。', standards: ['cn-shuxue-2022:5-6-syds-1'] },
  { type: 'PROCEDURAL', term: '下', domain: '数与代数', name: '异分母分数大小比较', description: '能借助通分等方法比较异分母分数大小。', difficulty: 4, commonMistakes: ['直接比数字大小', '通分目标不合理'], examTips: '常考：比较大小、排序。', standards: ['cn-shuxue-2022:5-6-syds-1'] },
  { type: 'PROCEDURAL', term: '下', domain: '数与代数', name: '分数加减法', description: '掌握同分母和异分母分数加减法。', difficulty: 4, commonMistakes: ['分母也加减', '结果不化简'], examTips: '常考：分数计算。', standards: ['cn-shuxue-2022:5-6-syds-1'] },

  { type: 'CONCEPTUAL', term: '上', domain: '图形与几何', name: '平行四边形面积', description: '理解平行四边形面积公式的推导过程。', difficulty: 4, commonMistakes: ['底和高不对应', '把斜边当高'], examTips: '常考：面积计算和公式理解。', standards: ['cn-shuxue-2022:5-6-tx-1'] },
  { type: 'CONCEPTUAL', term: '上', domain: '图形与几何', name: '三角形面积', description: '理解三角形面积与平行四边形面积的关系。', difficulty: 4, commonMistakes: ['忘记除以2', '底高不对应'], examTips: '常考：面积计算。', standards: ['cn-shuxue-2022:5-6-tx-1'] },
  { type: 'CONCEPTUAL', term: '上', domain: '图形与几何', name: '梯形面积', description: '理解梯形面积公式的推导和应用。', difficulty: 4, commonMistakes: ['上下底相加后忘记乘高或除以2', '单位漏写'], examTips: '常考：面积公式应用。', standards: ['cn-shuxue-2022:5-6-tx-1'] },
  { type: 'PROCEDURAL', term: '上', domain: '图形与几何', name: '组合图形面积', description: '能把组合图形分割或拼补成基本图形求面积。', difficulty: 4, commonMistakes: ['分割思路单一', '面积重复算或漏算'], examTips: '常考：组合图形面积。', standards: ['cn-shuxue-2022:5-6-tx-1'] },
  { type: 'CONCEPTUAL', term: '下', domain: '图形与几何', name: '长方体和正方体特征', description: '理解长方体、正方体的面、棱、顶点特征。', difficulty: 3, commonMistakes: ['棱长关系记混', '平面图和立体图联系弱'], examTips: '常考：图形特征、展开图。', standards: ['cn-shuxue-2022:5-6-tx-1'] },
  { type: 'PROCEDURAL', term: '下', domain: '图形与几何', name: '长方体和正方体表面积', description: '掌握表面积计算并理解生活中的包装含义。', difficulty: 4, commonMistakes: ['多面少面', '表面积和体积混淆'], examTips: '常考：表面积应用题。', standards: ['cn-shuxue-2022:5-6-tx-1'] },
  { type: 'CONCEPTUAL', term: '下', domain: '图形与几何', name: '体积和容积初步认识', description: '理解体积和容积的含义及区别。', difficulty: 3, commonMistakes: ['体积和表面积混淆', '容积和体积不区分'], examTips: '常考：概念辨析。', standards: ['cn-shuxue-2022:5-6-tx-1'] },
  { type: 'PROCEDURAL', term: '下', domain: '图形与几何', name: '长方体和正方体体积', description: '掌握体积公式并解决简单实际问题。', difficulty: 4, commonMistakes: ['长宽高对应错误', '立方单位漏写'], examTips: '常考：体积计算。', standards: ['cn-shuxue-2022:5-6-tx-1'] },

  { type: 'CONCEPTUAL', term: '下', domain: '量与计量', name: '体积单位和容积单位', description: '认识立方厘米、立方分米、立方米及升、毫升。', difficulty: 3, commonMistakes: ['面积单位和体积单位混淆', '升与立方分米关系不清'], examTips: '常考：单位选择和换算。', standards: ['cn-shuxue-2022:5-6-cl-1'] },

  { type: 'PROCEDURAL', term: '下', domain: '统计与概率', name: '折线统计图', description: '能读懂并绘制简单折线统计图，体会数据变化趋势。', difficulty: 3, commonMistakes: ['只看点值不看趋势', '连接顺序错误'], examTips: '常考：读图分析、画图。', standards: ['cn-shuxue-2022:5-6-sjtj-1'] },

  { type: 'META', term: '下', domain: '综合与实践', name: '从现实问题中建立数学模型', description: '能从生活问题中抽象出数量关系或图形模型。', difficulty: 4, commonMistakes: ['只会列算式不会建模', '现实条件转化不到位'], examTips: '常见任务：综合实践活动。', standards: ['cn-shuxue-2022:5-6-zonghe-1'] }
];

writeTopics('数学（人教版五年级上+下）知识点', specs);
