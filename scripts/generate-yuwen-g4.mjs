import { createTopicFactory } from './lib/topic-factory.mjs';

const { writeTopics } = createTopicFactory({
  subject: '语文',
  subjectCode: 'YW',
  grade: 4,
  textbook: '统编版',
  outputFile: 'topics-yuwen-g4.json'
});

const specs = [
  { type: 'CONCEPTUAL', term: '上', domain: '识字与写字', name: '多音字和词义对应', description: '能根据具体语境判断多音字的读音，并结合词义解释为什么这样读。', difficulty: 3, commonMistakes: ['只按熟悉读音读', '读音和词义脱节'], examTips: '常考：给加点字选择正确读音并结合词语解释。', standards: ['cn-yuwen-2022:3-4-sz-2'] },
  { type: 'PROCEDURAL', term: '上', domain: '识字与写字', name: '借助工具书理解词语义项', description: '能熟练使用字典词典查字查词，并根据上下文选择合适义项。', difficulty: 3, commonMistakes: ['只查不选义项', '不能把词典解释带回原句'], examTips: '常考：查字典、联系语境选义项。', standards: ['cn-yuwen-2022:3-4-sz-3'] },
  { type: 'REPRESENTATIONAL', term: '上', domain: '识字与写字', name: '硬笔书写行款规范', description: '能用硬笔规范书写段落，注意标题、分段、标点和整体版面整洁。', difficulty: 2, commonMistakes: ['字写得清楚但行款凌乱', '标题和正文位置不协调'], examTips: '常见评价：抄写、习作誊写与书写等级。', standards: ['cn-yuwen-2022:3-4-sz-4'] },
  { type: 'CONCEPTUAL', term: '下', domain: '识字与写字', name: '同音字形近字语境辨析', description: '能综合字形、字义和语境辨析较复杂的同音字、形近字。', difficulty: 3, commonMistakes: ['只看读音不看搭配', '字形相近就误判'], examTips: '常考：选字填空、辨字组词、改错别字。', standards: ['cn-yuwen-2022:3-4-sz-2'] },

  { type: 'LANGUAGE', term: '上', domain: '词句段运用', name: '体会关键动词形容词的表达效果', description: '能比较不同词语的表达差异，体会作者为什么选用某个词。', difficulty: 3, commonMistakes: ['只会说“更生动”但说不出原因', '替换后语境不通顺'], examTips: '常考：词语替换、品词析句。', standards: ['cn-yuwen-2022:3-4-yysy-2'] },
  { type: 'LANGUAGE', term: '上', domain: '词句段运用', name: '扩句和缩句综合运用', description: '能根据表达需要扩句或缩句，既保留主干意思，又让句子准确完整。', difficulty: 3, commonMistakes: ['扩句堆砌修饰语', '缩句后主干残缺'], examTips: '常考：扩句、缩句、改写句子。', standards: ['cn-yuwen-2022:3-4-jz-2'] },
  { type: 'LANGUAGE', term: '上', domain: '词句段运用', name: '比喻拟人排比综合辨识', description: '能在语段中辨识常见修辞，并说出表达效果。', difficulty: 3, commonMistakes: ['见到“像”就判断成比喻', '排比和并列混淆'], examTips: '常考：修辞判断、仿写。', standards: ['cn-yuwen-2022:3-4-yysy-5'] },
  { type: 'LANGUAGE', term: '上', domain: '词句段运用', name: '用关联词组织复句', description: '能用因果、转折、条件、递进等关联词组织较复杂的复句。', difficulty: 3, commonMistakes: ['搭配不成对', '关系判断不准确'], examTips: '常考：选关联词、合并句子。', standards: ['cn-yuwen-2022:3-4-yysy-4'] },
  { type: 'LANGUAGE', term: '下', domain: '词句段运用', name: '标点符号在语境中的作用', description: '能结合具体语段理解引号、冒号、分号、省略号、破折号的表达作用。', difficulty: 3, commonMistakes: ['只会机械填标点', '说不清标点作用'], examTips: '常考：加标点、分析标点作用。', standards: ['cn-yuwen-2022:3-4-bd-1'] },
  { type: 'LANGUAGE', term: '下', domain: '词句段运用', name: '修改常见病句', description: '能修改成分残缺、搭配不当、重复啰嗦、语序不当等常见病句。', difficulty: 4, commonMistakes: ['能发现问题但改不到位', '改一处又引出新问题'], examTips: '常考：病句辨析与修改。', standards: ['cn-yuwen-2022:3-4-jz-1'] },
  { type: 'LANGUAGE', term: '下', domain: '词句段运用', name: '围绕中心句组织语段', description: '能围绕中心句安排材料，做到语段前后连贯、详略得当。', difficulty: 3, commonMistakes: ['材料分散不围绕中心', '中心句和内容脱节'], examTips: '常考：补写中心句、围绕中心写段。', standards: ['cn-yuwen-2022:3-4-jz-2'] },
  { type: 'LANGUAGE', term: '下', domain: '词句段运用', name: '句子排序与段落衔接提升', description: '能依据时间、空间、总分、事情发展等线索给句段排序。', difficulty: 3, commonMistakes: ['只抓关键词不看整体逻辑', '首尾句判断不准'], examTips: '常考：排序题、连句成段。', standards: ['cn-yuwen-2022:3-4-jz-2'] },

  { type: 'PROCEDURAL', term: '上', domain: '阅读', name: '概括自然段和全文主要内容', description: '能抓住关键词句概括段意和全文主要内容。', difficulty: 3, commonMistakes: ['概括成流水账', '漏掉主要人物或事件'], examTips: '常考：概括段意、主要内容。', standards: ['cn-yuwen-2022:3-4-yd-3'] },
  { type: 'PROCEDURAL', term: '上', domain: '阅读', name: '联系上下文理解词句', description: '遇到难懂词句时，能联系上下文和生活经验推测意思。', difficulty: 3, commonMistakes: ['只看字面', '解释后放回原文不通'], examTips: '常考：词句理解。', standards: ['cn-yuwen-2022:3-4-yd-3'] },
  { type: 'CONCEPTUAL', term: '上', domain: '阅读', name: '体会人物语言动作神态描写', description: '能从人物描写中体会人物特点和情感变化。', difficulty: 3, commonMistakes: ['只摘句不分析', '人物特点空泛'], examTips: '常考：人物形象分析。', standards: ['cn-yuwen-2022:3-4-yd-4'] },
  { type: 'PROCEDURAL', term: '上', domain: '阅读', name: '边读边想象画面和情境', description: '能在阅读中形成画面感，帮助理解景物、人物和氛围。', difficulty: 2, commonMistakes: ['想象脱离文本', '只关注插图不关注语言'], examTips: '常考：读后谈画面、情境体验。', standards: ['cn-yuwen-2022:3-4-yd-2'] },
  { type: 'PROCEDURAL', term: '下', domain: '阅读', name: '体会关键词句的表达效果', description: '能从重点词句入手，说出作者表达了什么、为什么写得好。', difficulty: 4, commonMistakes: ['只会泛泛说“很生动”', '不能结合上下文'], examTips: '常考：品词析句。', standards: ['cn-yuwen-2022:3-4-yd-4'] },
  { type: 'PROCEDURAL', term: '下', domain: '阅读', name: '比较阅读材料的异同', description: '能从内容、写法、情感等角度比较两则材料的异同。', difficulty: 4, commonMistakes: ['只找相同不找不同', '比较点不一致'], examTips: '常考：对比阅读。', standards: ['cn-yuwen-2022:3-4-yd-4'] },
  { type: 'META', term: '下', domain: '阅读', name: '批注和提问促进阅读', description: '能用批注、圈画和提问的方式记录阅读思考。', difficulty: 3, commonMistakes: ['只画不想', '问题过于表面'], examTips: '常见任务：阅读批注、提出问题。', standards: ['cn-yuwen-2022:3-4-yd-3'] },
  { type: 'META', term: '下', domain: '阅读', name: '整本书阅读记录与分享', description: '能记录整本书阅读过程，提炼主要人物、情节和感受。', difficulty: 2, commonMistakes: ['只记书名', '不会提炼阅读感受'], examTips: '常见任务：读书卡、阅读分享。', standards: ['cn-yuwen-2022:3-4-kwdy-1'] },

  { type: 'LANGUAGE', term: '上', domain: '古诗文', name: '借助想象理解写景古诗', description: '能借助注释和画面想象理解写景古诗的内容和情感。', difficulty: 3, commonMistakes: ['逐字硬翻', '画面和情感割裂'], examTips: '常考：诗句理解、景象分析。', standards: ['cn-yuwen-2022:3-4-gsw-1'] },
  { type: 'LANGUAGE', term: '上', domain: '古诗文', name: '《题西林壁》', description: '能背诵《题西林壁》，理解“横看成岭侧成峰”体现的观察角度变化。', difficulty: 3, commonMistakes: ['只会背诵不会联系观察角度', '哲理理解空泛'], examTips: '常考：背诵、诗句理解。', standards: ['cn-yuwen-2022:3-4-gsw-1'] },
  { type: 'LANGUAGE', term: '下', domain: '古诗文', name: '《清平乐·村居》', description: '能背诵《清平乐·村居》，初步体会词的节奏特点和田园生活情趣。', difficulty: 3, commonMistakes: ['把词当诗处理', '人物活动和画面不清'], examTips: '常考：背诵、词意理解。', standards: ['cn-yuwen-2022:3-4-gsw-1'] },
  { type: 'CONCEPTUAL', term: '下', domain: '古诗文', name: '浅近文言语句停顿和释义', description: '能借助注释和停顿理解浅近文言语句的基本意思。', difficulty: 4, commonMistakes: ['按现代白话断句', '古今义混淆'], examTips: '常考：停顿、词语解释。', standards: ['cn-yuwen-2022:3-4-gsw-2'] },

  { type: 'PROCEDURAL', term: '上', domain: '习作', name: '写观察习作', description: '能围绕植物、动物或自然现象连续观察，写出变化和发现。', difficulty: 3, commonMistakes: ['只有结论没有观察过程', '细节描写不足'], examTips: '常考：观察类习作。', standards: ['cn-yuwen-2022:3-4-xz-2'] },
  { type: 'PROCEDURAL', term: '上', domain: '习作', name: '写清一件事的起因经过结果', description: '能按事情发展顺序把一件事写完整，突出主要经过。', difficulty: 3, commonMistakes: ['经过写得太少', '详略失衡'], examTips: '常考：记事习作。', standards: ['cn-yuwen-2022:3-4-xz-2'] },
  { type: 'PROCEDURAL', term: '下', domain: '习作', name: '围绕中心选择材料', description: '知道习作材料要服务中心，能删去与中心关系不大的内容。', difficulty: 4, commonMistakes: ['什么都想写', '例子和中心不匹配'], examTips: '常见任务：习作选材与修改。', standards: ['cn-yuwen-2022:3-4-xz-3'] },
  { type: 'PROCEDURAL', term: '下', domain: '习作', name: '修改习作中的错别字和病句', description: '写完习作后能自主检查明显的错别字、病句和不通顺处。', difficulty: 3, commonMistakes: ['只检查字不检查句', '问题发现不全'], examTips: '常见任务：习作修改。', standards: ['cn-yuwen-2022:3-4-xz-3'] },

  { type: 'LANGUAGE', term: '下', domain: '口语交际', name: '转述和表达观点', description: '能准确转述别人交代的内容，并围绕话题表达自己的看法和理由。', difficulty: 3, commonMistakes: ['转述内容缺漏', '有观点没理由'], examTips: '常考：口语交际、情境表达。', standards: ['cn-yuwen-2022:3-4-kj-1'] },
  { type: 'META', term: '下', domain: '综合性学习', name: '搜集整理主题资料', description: '能围绕主题搜集资料并进行筛选、整理和展示。', difficulty: 3, commonMistakes: ['资料堆砌无重点', '展示顺序混乱'], examTips: '常见任务：综合性学习展示。', standards: ['cn-yuwen-2022:3-4-zh-1'] }
];

writeTopics('语文（统编版四年级上+下）知识点', specs);
