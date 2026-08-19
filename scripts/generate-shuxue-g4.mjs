import { createTopicFactory } from './lib/topic-factory.mjs';

const { writeTopics } = createTopicFactory({
  subject: '数学',
  subjectCode: 'SX',
  grade: 4,
  textbook: '人教版',
  outputFile: 'topics-shuxue-g4.json'
});

const specs = [
  { type: 'CONCEPTUAL', term: '上', domain: '数与代数', name: '亿以内数的认识', description: '理解万级、个级及数位顺序，认识更大的自然数。', difficulty: 3, commonMistakes: ['数位和计数单位混淆', '中间有0的数读写不稳'], examTips: '常考：读数、写数、数位和组成。', standards: ['cn-shuxue-2022:3-4-syds-1'] },
  { type: 'CONCEPTUAL', term: '上', domain: '数与代数', name: '亿以内数的读写和大小比较', description: '能正确读写亿以内数，并按数位和高位大小规律比较大小。', difficulty: 3, commonMistakes: ['缺0占位', '高位比较不熟练'], examTips: '常考：读写数、比较大小、改写近似数。', standards: ['cn-shuxue-2022:3-4-syds-1'] },
  { type: 'PROCEDURAL', term: '上', domain: '数与代数', name: '三位数乘两位数笔算', description: '会列竖式计算三位数乘两位数，理解分步乘与进位。', difficulty: 4, commonMistakes: ['第二层积错位', '进位遗漏'], examTips: '常考：竖式计算、判断改错。', standards: ['cn-shuxue-2022:3-4-syds-4'] },
  { type: 'PROCEDURAL', term: '上', domain: '数与代数', name: '积的变化规律', description: '能观察因数变化引起积变化的规律，并用于简便思考。', difficulty: 3, commonMistakes: ['只记结论不会解释', '两个因数同时变化时易错'], examTips: '常考：规律填空、推理判断。', standards: ['cn-shuxue-2022:3-4-syds-3'] },
  { type: 'PROCEDURAL', term: '上', domain: '数与代数', name: '除数是两位数的除法', description: '掌握除数是两位数的笔算除法，理解试商、调商过程。', difficulty: 4, commonMistakes: ['试商偏大偏小不会调整', '商的位置不准'], examTips: '常考：笔算除法、试商改错。', standards: ['cn-shuxue-2022:3-4-syds-5'] },
  { type: 'PROCEDURAL', term: '上', domain: '数与代数', name: '商不变规律', description: '理解被除数和除数同时乘或除以相同数时商不变。', difficulty: 3, commonMistakes: ['只会背规律', '0和整除条件理解不清'], examTips: '常考：规律填空、简便计算。', standards: ['cn-shuxue-2022:3-4-syds-3'] },
  { type: 'CONCEPTUAL', term: '下', domain: '数与代数', name: '小数的意义', description: '理解十分之几、百分之几可以用一位、两位小数表示。', difficulty: 3, commonMistakes: ['小数和整数读法混淆', '位值意义不清'], examTips: '常考：读写小数、把分数改写成小数。', standards: ['cn-shuxue-2022:5-6-syds-1'] },
  { type: 'CONCEPTUAL', term: '下', domain: '数与代数', name: '小数大小比较', description: '会比较小数大小，理解整数部分和小数部分的位值关系。', difficulty: 3, commonMistakes: ['位数多就认为大', '末尾0影响判断'], examTips: '常考：比较大小、排序。', standards: ['cn-shuxue-2022:5-6-syds-1'] },
  { type: 'PROCEDURAL', term: '下', domain: '数与代数', name: '小数加减法', description: '掌握小数点对齐的小数加减法笔算。', difficulty: 3, commonMistakes: ['末位对齐而非小数点对齐', '借位进位混乱'], examTips: '常考：竖式计算、改错。', standards: ['cn-shuxue-2022:5-6-syds-1'] },
  { type: 'PROCEDURAL', term: '下', domain: '数与代数', name: '四则混合运算和运算律应用', description: '能在四则混合运算中正确运用运算顺序和交换律、结合律、分配律。', difficulty: 4, commonMistakes: ['顺序错', '运算律套用不当'], examTips: '常考：脱式计算、简便计算。', standards: ['cn-shuxue-2022:3-4-syds-6'] },
  { type: 'PROCEDURAL', term: '下', domain: '数与代数', name: '解决较复杂两三步应用题', description: '能提炼条件关系，列分步或综合算式解决两三步问题。', difficulty: 4, commonMistakes: ['中间量找错', '条件筛选不准'], examTips: '常考：应用题、综合题。', standards: ['cn-shuxue-2022:3-4-syds-2'] },

  { type: 'CONCEPTUAL', term: '上', domain: '图形与几何', name: '直线射线线段的区别', description: '理解直线、射线、线段的特征及相互区别。', difficulty: 2, commonMistakes: ['端点个数记混', '图形表示不规范'], examTips: '常考：判断、作图。', standards: ['cn-shuxue-2022:3-4-tx-1'] },
  { type: 'CONCEPTUAL', term: '上', domain: '图形与几何', name: '角的意义和角的度量', description: '理解角的大小与两边张开程度有关，会用量角器量角。', difficulty: 3, commonMistakes: ['角的边长影响大小判断', '量角器零刻度看错'], examTips: '常考：量角、比较角大小。', standards: ['cn-shuxue-2022:3-4-tx-1'] },
  { type: 'PROCEDURAL', term: '上', domain: '图形与几何', name: '用量角器画指定度数的角', description: '能用量角器准确画出给定度数的角。', difficulty: 3, commonMistakes: ['起始边放置不准', '刻度方向看错'], examTips: '常考：画角。', standards: ['cn-shuxue-2022:3-4-tx-1'] },
  { type: 'CONCEPTUAL', term: '上', domain: '图形与几何', name: '平行和垂直', description: '理解同一平面内两条直线的平行和垂直关系。', difficulty: 3, commonMistakes: ['仅凭图形感觉判断', '垂直和平行概念混淆'], examTips: '常考：判断、作图。', standards: ['cn-shuxue-2022:3-4-tx-1'] },
  { type: 'PROCEDURAL', term: '下', domain: '图形与几何', name: '平行四边形和梯形认识', description: '能辨认平行四边形和梯形，理解其基本特征。', difficulty: 3, commonMistakes: ['梯形和平行四边形混淆', '只看摆放方向'], examTips: '常考：图形分类、性质判断。', standards: ['cn-shuxue-2022:3-4-tx-1'] },
  { type: 'CONCEPTUAL', term: '下', domain: '图形与几何', name: '从不同方向观察立体图形提升', description: '能根据立体图形判断不同方向观察到的形状。', difficulty: 3, commonMistakes: ['侧视图和俯视图混淆', '遮挡关系判断错误'], examTips: '常考：观察物体。', standards: ['cn-shuxue-2022:3-4-tx-2'] },

  { type: 'CONCEPTUAL', term: '上', domain: '量与计量', name: '公顷和平方千米初步认识', description: '认识较大的面积单位，建立公顷和平方千米的量感。', difficulty: 3, commonMistakes: ['长度单位和面积单位混淆', '大小量感不足'], examTips: '常考：填合适单位、换算。', standards: ['cn-shuxue-2022:5-6-cl-1'] },
  { type: 'PROCEDURAL', term: '下', domain: '量与计量', name: '用面积单位解决实际问题', description: '能根据实际情境选择合适面积单位并进行简单换算。', difficulty: 3, commonMistakes: ['单位选得过大或过小', '换算进率错'], examTips: '常考：面积单位应用。', standards: ['cn-shuxue-2022:5-6-cl-1'] },

  { type: 'PROCEDURAL', term: '下', domain: '统计与概率', name: '条形统计图进一步应用', description: '能读懂较复杂条形统计图，并根据数据回答问题。', difficulty: 3, commonMistakes: ['刻度读取不准', '不会综合比较'], examTips: '常考：统计图读图分析。', standards: ['cn-shuxue-2022:3-4-sjtj-1'] },
  { type: 'REPRESENTATIONAL', term: '下', domain: '统计与概率', name: '根据数据绘制统计图', description: '能根据统计表数据绘制规范的条形统计图。', difficulty: 3, commonMistakes: ['坐标刻度不统一', '类别与数据对应错'], examTips: '常考：画统计图。', standards: ['cn-shuxue-2022:3-4-sjtj-1'] },

  { type: 'META', term: '下', domain: '综合与实践', name: '列表画图分析数量关系', description: '能用列表法、线段图等表示复杂数量关系。', difficulty: 4, commonMistakes: ['图表建得不对应条件', '画了图但不会用'], examTips: '常见任务：画图解题。', standards: ['cn-shuxue-2022:3-4-zonghe-1'] },
  { type: 'META', term: '下', domain: '综合与实践', name: '估算检验结果合理性提升', description: '能结合数量级和生活经验判断计算结果是否合理。', difficulty: 3, commonMistakes: ['精算对但结果不合理没意识', '估算过粗'], examTips: '常考：估算与判断。', standards: ['cn-shuxue-2022:3-4-syds-3'] }
];

writeTopics('数学（人教版四年级上+下）知识点', specs);
