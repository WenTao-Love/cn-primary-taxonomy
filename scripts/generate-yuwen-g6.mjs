import { createTopicFactory } from './lib/topic-factory.mjs';

const { writeTopics } = createTopicFactory({
  subject: '语文',
  subjectCode: 'YW',
  grade: 6,
  textbook: '统编版',
  outputFile: 'topics-yuwen-g6.json'
});

const specs = [
  { type: 'CONCEPTUAL', term: '上', domain: '识字与写字', name: '在复杂语境中准确运用词语', description: '能在复杂语境中选择恰当词语，兼顾准确性、分寸感和语体色彩。', difficulty: 4, commonMistakes: ['意思接近就随意替换', '语体色彩不符'], examTips: '常考：选词填空、修改表达。', standards: ['cn-yuwen-2022:5-6-yysy-2'] },
  { type: 'PROCEDURAL', term: '上', domain: '识字与写字', name: '借助多源资料解决阅读障碍', description: '阅读较难文本时，能结合词典、注释、背景资料和上下文解决理解障碍。', difficulty: 4, commonMistakes: ['资料搜集过多但不会整合', '查到信息不会回扣文本'], examTips: '常见任务：资料辅助阅读。', standards: ['cn-yuwen-2022:5-6-sz-3'] },
  { type: 'REPRESENTATIONAL', term: '下', domain: '识字与写字', name: '规范书写毕业表达材料', description: '能规范书写较完整的发言稿、读书分享或毕业表达材料。', difficulty: 2, commonMistakes: ['内容完整但格式版面欠规范', '书写后期潦草'], examTips: '常见评价：毕业表达作品。', standards: ['cn-yuwen-2022:5-6-sz-4'] },

  { type: 'LANGUAGE', term: '上', domain: '词句段运用', name: '体会句式变化和表达语气', description: '能体会陈述、疑问、反问、设问等句式变化带来的表达效果。', difficulty: 4, commonMistakes: ['只会判断句式不会说作用', '设问反问混淆'], examTips: '常考：句式变换与表达效果。', standards: ['cn-yuwen-2022:5-6-yysy-5'] },
  { type: 'LANGUAGE', term: '上', domain: '词句段运用', name: '综合运用修辞服务中心表达', description: '能根据表达需要选择恰当修辞，而不是机械堆砌。', difficulty: 4, commonMistakes: ['修辞用得多但不贴切', '和中心表达脱节'], examTips: '常考：修辞辨析、仿写、赏析。', standards: ['cn-yuwen-2022:5-6-yysy-5'] },
  { type: 'LANGUAGE', term: '上', domain: '词句段运用', name: '优化语段层次和逻辑', description: '能从层次、照应、转折和承接角度优化语段逻辑。', difficulty: 4, commonMistakes: ['语句都通顺但逻辑松散', '层次不分明'], examTips: '常考：语段调整、排序、补写。', standards: ['cn-yuwen-2022:5-6-jz-2'] },
  { type: 'LANGUAGE', term: '下', domain: '词句段运用', name: '准确修改病句和语意问题', description: '能修改病句，并识别语意重复、指代不清、逻辑不严谨等问题。', difficulty: 4, commonMistakes: ['只改显眼错误', '逻辑问题看不出来'], examTips: '常考：病句辨析、语言表达应用。', standards: ['cn-yuwen-2022:5-6-jz-1'] },
  { type: 'LANGUAGE', term: '下', domain: '词句段运用', name: '围绕观点展开较完整论述', description: '能提出清晰观点，并使用理由、事例和分析展开较完整论述。', difficulty: 4, commonMistakes: ['观点清楚但论证薄弱', '事例堆砌没有分析'], examTips: '常考：表达观点、写一段议论性文字。', standards: ['cn-yuwen-2022:5-6-jz-2'] },
  { type: 'LANGUAGE', term: '下', domain: '词句段运用', name: '标点与人物语言层次', description: '能根据对话场景和语气变化灵活使用引号、冒号、破折号等标点。', difficulty: 3, commonMistakes: ['对话层次复杂时标点乱', '标点和语气脱节'], examTips: '常考：给对话加标点。', standards: ['cn-yuwen-2022:5-6-bd-1'] },

  { type: 'PROCEDURAL', term: '上', domain: '阅读', name: '概括文章内容和中心关系', description: '能区分文章内容、中心思想和作者情感三者关系。', difficulty: 4, commonMistakes: ['把中心思想概括得太空', '情感与内容关系说不清'], examTips: '常考：主要内容、中心思想。', standards: ['cn-yuwen-2022:5-6-yd-3'] },
  { type: 'CONCEPTUAL', term: '上', domain: '阅读', name: '分析文章结构和谋篇布局', description: '能识别总分、分总、首尾照应、过渡照应等常见文章结构。', difficulty: 4, commonMistakes: ['只会看内容不会看结构', '结构术语不会落到文本'], examTips: '常考：结构分析。', standards: ['cn-yuwen-2022:5-6-yd-4'] },
  { type: 'PROCEDURAL', term: '上', domain: '阅读', name: '分析人物形象的多维证据', description: '能从语言、动作、神态、心理和环境等多维证据分析人物形象。', difficulty: 4, commonMistakes: ['结论和证据脱节', '只抓单一描写'], examTips: '常考：人物形象综合分析。', standards: ['cn-yuwen-2022:5-6-yd-4'] },
  { type: 'PROCEDURAL', term: '上', domain: '阅读', name: '体会写法服务主题', description: '能分析对比、衬托、伏笔、照应等写法如何服务主题表达。', difficulty: 5, commonMistakes: ['只认写法不说主题作用', '作用分析停在表面'], examTips: '常考：写法作用分析。', standards: ['cn-yuwen-2022:5-6-yd-4'] },
  { type: 'PROCEDURAL', term: '下', domain: '阅读', name: '比较不同文本中的人物与主题', description: '能比较不同文本中人物塑造和主题表达的异同。', difficulty: 5, commonMistakes: ['比较点不统一', '只比情节不比表达'], examTips: '常考：综合阅读、对比阅读。', standards: ['cn-yuwen-2022:5-6-yd-4'] },
  { type: 'PROCEDURAL', term: '下', domain: '阅读', name: '整合多则材料提取信息', description: '能从多则材料中提取关键信息，并形成较完整判断。', difficulty: 4, commonMistakes: ['信息提取不全', '整合后结论片面'], examTips: '常考：非连续性文本阅读。', standards: ['cn-yuwen-2022:5-6-yd-3'] },
  { type: 'META', term: '下', domain: '阅读', name: '围绕主题开展整本书深度阅读', description: '能围绕主题、人物或写法开展整本书深度阅读，并整理阶段性成果。', difficulty: 4, commonMistakes: ['只关注情节推进', '主题提炼不稳定'], examTips: '常见任务：整本书阅读报告。', standards: ['cn-yuwen-2022:5-6-kwdy-1'] },
  { type: 'META', term: '下', domain: '阅读', name: '阅读策略迁移到新文本', description: '面对陌生文本时，能主动迁移批注、摘要、提问、比较等阅读策略。', difficulty: 4, commonMistakes: ['熟悉文本会用策略，陌生文本不会迁移', '策略使用碎片化'], examTips: '常见任务：阅读方法说明。', standards: ['cn-yuwen-2022:5-6-yd-3'] },

  { type: 'LANGUAGE', term: '上', domain: '古诗文', name: '结合背景理解古诗文情感', description: '能结合作者经历与时代背景理解古诗文中的情感和志向。', difficulty: 4, commonMistakes: ['只解释表面意思', '背景和诗文情感联系弱'], examTips: '常考：诗文情感分析。', standards: ['cn-yuwen-2022:5-6-gsw-1'] },
  { type: 'LANGUAGE', term: '上', domain: '古诗文', name: '《石灰吟》', description: '能背诵《石灰吟》，理解托物言志的表达方式。', difficulty: 4, commonMistakes: ['只会解释石灰过程', '志向理解不到位'], examTips: '常考：背诵、托物言志分析。', standards: ['cn-yuwen-2022:5-6-gsw-1'] },
  { type: 'LANGUAGE', term: '下', domain: '古诗文', name: '《竹石》', description: '能背诵《竹石》，体会诗人借竹子表现坚韧品格。', difficulty: 4, commonMistakes: ['把写竹只当写景', '“咬定”表达力量理解不足'], examTips: '常考：背诵、形象与情感分析。', standards: ['cn-yuwen-2022:5-6-gsw-1'] },
  { type: 'CONCEPTUAL', term: '下', domain: '古诗文', name: '浅近文言文实词和句式理解', description: '能借助注释理解常见文言实词、句式和语段大意。', difficulty: 5, commonMistakes: ['逐字硬译', '停顿和句式理解混乱'], examTips: '常考：词义、句意、翻译。', standards: ['cn-yuwen-2022:5-6-gsw-2'] },

  { type: 'PROCEDURAL', term: '上', domain: '习作', name: '写人记事突出主题和真情实感', description: '能围绕主题选择细节，表达真实具体的情感体验。', difficulty: 4, commonMistakes: ['细节多但主题弱', '情感表达套路化'], examTips: '常考：毕业前写人记事习作。', standards: ['cn-yuwen-2022:5-6-xz-2'] },
  { type: 'PROCEDURAL', term: '上', domain: '习作', name: '写活动和场面做到点面结合', description: '能写出活动场面的整体气氛，并突出重点人物和关键细节。', difficulty: 4, commonMistakes: ['只写热闹没重点', '场面和人物脱节'], examTips: '常考：活动类习作。', standards: ['cn-yuwen-2022:5-6-xz-2'] },
  { type: 'PROCEDURAL', term: '下', domain: '习作', name: '写简单演讲稿或毕业发言', description: '能围绕主题写结构清晰、层次分明的简单演讲稿或毕业发言。', difficulty: 4, commonMistakes: ['口语和书面语混杂', '开头结尾无呼应'], examTips: '常考：应用表达。', standards: ['cn-yuwen-2022:5-6-xz-1'] },
  { type: 'PROCEDURAL', term: '下', domain: '习作', name: '独立修改习作并说明修改理由', description: '能较独立地修改习作，并说明为什么这样改。', difficulty: 4, commonMistakes: ['只改表层问题', '修改理由说不清'], examTips: '常见任务：习作讲评、自评互评。', standards: ['cn-yuwen-2022:5-6-xz-3'] },

  { type: 'LANGUAGE', term: '下', domain: '口语交际', name: '围绕主题开展讨论和发言', description: '能在讨论中清楚表达观点、倾听别人意见并作适当回应。', difficulty: 3, commonMistakes: ['只表达自己不回应他人', '理由和观点不匹配'], examTips: '常考：讨论交流、毕业主题分享。', standards: ['cn-yuwen-2022:5-6-kj-1'] },
  { type: 'META', term: '下', domain: '综合性学习', name: '围绕专题搜集整理并表达成果', description: '能围绕专题搜集、筛选资料并形成较完整的口头或书面成果。', difficulty: 4, commonMistakes: ['资料堆积无中心', '成果表达缺结构'], examTips: '常见任务：专题学习成果汇报。', standards: ['cn-yuwen-2022:5-6-zh-1'] }
];

writeTopics('语文（统编版六年级上+下）知识点', specs);
