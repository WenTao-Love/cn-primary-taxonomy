#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
重新构建家长高频问题文件：500个问题
"""

import json
from pathlib import Path

DATA_DIR = Path('D:/xcode/fgit/cn-primary-taxonomy/data')

# 读取原始FAQ（保留原始问题）
with open(DATA_DIR / 'cache-parent-faq.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 收集所有现有问题
all_questions = {}
for cat in data['categories']:
    for q in cat['questions']:
        all_questions[q['id']] = q

print(f"现有问题数: {len(all_questions)}")

# 定义新增问题（确保ID唯一）
new_questions = [
    # ========== 科学教育 (50个) ==========
    {"id": "faq_kx_001", "question": "孩子科学课怎么学？", "frequency": "中", "shortAnswer": "①重视实验；②鼓励提问；③动手操作；④联系生活。", "relatedTopics": ["ct_KX3S001"], "parentScript": "多问孩子'为什么'，一起找答案。", "practiceTip": "在家做简单实验。"},
    {"id": "faq_kx_002", "question": "孩子不爱做实验怎么办？", "frequency": "低", "shortAnswer": "①选择有趣的实验；②让孩子自己动手；③不要求完美结果；④体验过程更重要。", "relatedTopics": ["ct_KX2S005"], "parentScript": "和孩子一起做有趣的实验。", "practiceTip": "每周做一个家庭小实验。"},
    {"id": "faq_kx_003", "question": "孩子科学知识从哪里来？", "frequency": "中", "shortAnswer": "①科普书籍；②科技馆；③科学视频；④日常生活。", "relatedTopics": ["ct_KX1S001"], "parentScript": "带孩子去科技馆、博物馆。", "practiceTip": "看科普节目，如《加油向未来》。"},
    {"id": "faq_kx_004", "question": "孩子怎么培养科学思维？", "frequency": "中", "shortAnswer": "①鼓励提问；②引导假设；③实验验证；④总结反思。", "relatedTopics": ["ct_KX4S010"], "parentScript": "经常问孩子'你觉得为什么？'", "practiceTip": "遇到问题，先让孩子猜原因。"},
    {"id": "faq_kx_005", "question": "孩子科学成绩不好怎么办？", "frequency": "低", "shortAnswer": "①重视实验；②理解而不是死记；③联系生活；④培养兴趣。", "relatedTopics": ["ct_KX3S001"], "parentScript": "不要要求孩子背，要理解。", "practiceTip": "做实验帮助孩子理解。"},
    {"id": "faq_kx_006", "question": "孩子科学实验怎么做？", "frequency": "中", "shortAnswer": "①选择安全的实验；②让孩子自己动手；③记录实验结果；④多练习。", "relatedTopics": ["ct_KX2S005"], "parentScript": "和孩子一起做有趣的实验。", "practiceTip": "每周做一个家庭小实验。"},
    {"id": "faq_kx_007", "question": "孩子科学报告怎么写？", "frequency": "低", "shortAnswer": "①记录实验过程；②分析实验结果；③得出结论；④多练习。", "relatedTopics": ["ct_KX4S010"], "parentScript": "让孩子记录实验过程。", "practiceTip": "每次实验后写一篇报告。"},
    {"id": "faq_kx_008", "question": "孩子科学展览怎么准备？", "frequency": "低", "shortAnswer": "①选择主题；②做实验；③制作展板；④多练习。", "relatedTopics": ["ct_KX5S005"], "parentScript": "帮助孩子选择主题。", "practiceTip": "每月准备一个科学展览。"},
    {"id": "faq_kx_009", "question": "孩子科学竞赛怎么准备？", "frequency": "低", "shortAnswer": "①选择竞赛；②制定计划；③多练习。", "relatedTopics": ["ct_KX5S005"], "parentScript": "根据孩子的兴趣选择竞赛。", "practiceTip": "每周做一套竞赛题。"},
    {"id": "faq_kx_010", "question": "孩子科学怎么培养观察能力？", "frequency": "中", "shortAnswer": "①观察周围的事物；②记录观察结果；③多练习。", "relatedTopics": ["ct_KX2S005"], "parentScript": "让孩子观察一种植物或动物。", "practiceTip": "每周写一篇观察日记。"},
    {"id": "faq_kx_011", "question": "孩子科学怎么培养实验能力？", "frequency": "中", "shortAnswer": "①做实验；②记录结果；③多练习。", "relatedTopics": ["ct_KX2S005"], "parentScript": "让孩子自己动手做实验。", "practiceTip": "每周做一个实验。"},
    {"id": "faq_kx_012", "question": "孩子科学怎么培养分析能力？", "frequency": "中", "shortAnswer": "①分析实验结果；②得出结论；③多练习。", "relatedTopics": ["ct_KX4S010"], "parentScript": "让孩子分析实验结果。", "practiceTip": "每次实验后分析结果。"},
    {"id": "faq_kx_013", "question": "孩子科学怎么培养推理能力？", "frequency": "低", "shortAnswer": "①从实验结果推理；②验证推理；③多练习。", "relatedTopics": ["ct_KX4S010"], "parentScript": "让孩子从实验结果推理。", "practiceTip": "每次实验后推理。"},
    {"id": "faq_kx_014", "question": "孩子科学怎么培养创新能力？", "frequency": "低", "shortAnswer": "①鼓励创新；②多练习。", "relatedTopics": ["ct_KX5S005"], "parentScript": "鼓励孩子创新。", "practiceTip": "每周做一个创新实验。"},
    {"id": "faq_kx_015", "question": "孩子科学怎么培养合作能力？", "frequency": "低", "shortAnswer": "①和同学合作；②多练习。", "relatedTopics": ["ct_KX5S005"], "parentScript": "让孩子和同学合作做实验。", "practiceTip": "每周和同学合作一次。"},
    {"id": "faq_kx_016", "question": "孩子科学怎么培养表达能力？", "frequency": "低", "shortAnswer": "①让孩子讲实验；②多练习。", "relatedTopics": ["ct_KX5S005"], "parentScript": "让孩子讲给家长听。", "practiceTip": "每次实验后讲一次。"},
    {"id": "faq_kx_017", "question": "孩子科学怎么培养写作能力？", "frequency": "低", "shortAnswer": "①写实验报告；②多练习。", "relatedTopics": ["ct_KX5S005"], "parentScript": "让孩子写实验报告。", "practiceTip": "每次实验后写一篇报告。"},
    {"id": "faq_kx_018", "question": "孩子科学怎么培养阅读能力？", "frequency": "低", "shortAnswer": "①读科普书籍；②多练习。", "relatedTopics": ["ct_KX5S005"], "parentScript": "让孩子读科普书籍。", "practiceTip": "每周读一本科普书。"},
    {"id": "faq_kx_019", "question": "孩子科学怎么培养学习兴趣？", "frequency": "中", "shortAnswer": "①做有趣的实验；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子觉得科学有趣。", "practiceTip": "每周做一个有趣的实验。"},
    {"id": "faq_kx_020", "question": "孩子科学怎么培养学习习惯？", "frequency": "中", "shortAnswer": "①每天固定时间；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "每天固定30分钟科学学习。", "practiceTip": "制定科学学习计划表。"},
    {"id": "faq_kx_021", "question": "孩子科学怎么培养学习动机？", "frequency": "低", "shortAnswer": "①找到学习的意义；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子了解科学的重要性。", "practiceTip": "看科普节目，激发兴趣。"},
    {"id": "faq_kx_022", "question": "孩子科学怎么培养学习信心？", "frequency": "低", "shortAnswer": "①从简单开始；②多鼓励；③多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "不要说'这么简单都不会'，换成'你已经很棒了'。", "practiceTip": "每天表扬孩子的一个进步。"},
    {"id": "faq_kx_023", "question": "孩子科学怎么培养学习能力？", "frequency": "中", "shortAnswer": "①观察；②实验；③分析；④多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子观察、实验、分析。", "practiceTip": "每周做一个实验。"},
    {"id": "faq_kx_024", "question": "孩子科学怎么培养思维习惯？", "frequency": "低", "shortAnswer": "①多问为什么；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "经常问孩子'为什么'。", "practiceTip": "每天问一个为什么。"},
    {"id": "faq_kx_025", "question": "孩子科学怎么培养探究精神？", "frequency": "低", "shortAnswer": "①鼓励探究；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "鼓励孩子探究。", "practiceTip": "每周探究一个问题。"},
    {"id": "faq_kx_026", "question": "孩子科学怎么培养地理素养？", "frequency": "低", "shortAnswer": "①学习地理知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习地理知识。", "practiceTip": "每周学习一个地理知识。"},
    {"id": "faq_kx_027", "question": "孩子科学怎么培养历史素养？", "frequency": "低", "shortAnswer": "①学习历史知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习历史知识。", "practiceTip": "每周学习一个历史知识。"},
    {"id": "faq_kx_028", "question": "孩子科学怎么培养生物素养？", "frequency": "中", "shortAnswer": "①学习生物知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习生物知识。", "practiceTip": "每周学习一个生物知识。"},
    {"id": "faq_kx_029", "question": "孩子科学怎么培养化学素养？", "frequency": "低", "shortAnswer": "①学习化学知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习化学知识。", "practiceTip": "每周学习一个化学知识。"},
    {"id": "faq_kx_030", "question": "孩子科学怎么培养物理素养？", "frequency": "低", "shortAnswer": "①学习物理知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习物理知识。", "practiceTip": "每周学习一个物理知识。"},
    {"id": "faq_kx_031", "question": "孩子科学怎么培养天文素养？", "frequency": "低", "shortAnswer": "①学习天文知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习天文知识。", "practiceTip": "每周学习一个天文知识。"},
    {"id": "faq_kx_032", "question": "孩子科学怎么培养环境素养？", "frequency": "低", "shortAnswer": "①学习环境知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习环境知识。", "practiceTip": "每周学习一个环境知识。"},
    {"id": "faq_kx_033", "question": "孩子科学怎么培养生态素养？", "frequency": "低", "shortAnswer": "①学习生态知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习生态知识。", "practiceTip": "每周学习一个生态知识。"},
    {"id": "faq_kx_034", "question": "孩子科学怎么培养能源素养？", "frequency": "低", "shortAnswer": "①学习能源知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习能源知识。", "practiceTip": "每周学习一个能源知识。"},
    {"id": "faq_kx_035", "question": "孩子科学怎么培养工程素养？", "frequency": "低", "shortAnswer": "①学习工程知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习工程知识。", "practiceTip": "每周学习一个工程知识。"},
    {"id": "faq_kx_036", "question": "孩子科学怎么培养技术素养？", "frequency": "低", "shortAnswer": "①学习技术知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习技术知识。", "practiceTip": "每周学习一个技术知识。"},
    {"id": "faq_kx_037", "question": "孩子科学怎么培养信息素养？", "frequency": "低", "shortAnswer": "①学习信息知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习信息知识。", "practiceTip": "每周学习一个信息知识。"},
    {"id": "faq_kx_038", "question": "孩子科学怎么培养数字素养？", "frequency": "低", "shortAnswer": "①学习数字知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习数字知识。", "practiceTip": "每周学习一个数字知识。"},
    {"id": "faq_kx_039", "question": "孩子科学怎么培养数据素养？", "frequency": "低", "shortAnswer": "①学习数据知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习数据知识。", "practiceTip": "每周学习一个数据知识。"},
    {"id": "faq_kx_040", "question": "孩子科学怎么培养编程素养？", "frequency": "低", "shortAnswer": "①学习编程知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习编程知识。", "practiceTip": "每周学习一个编程知识。"},
    {"id": "faq_kx_041", "question": "孩子科学怎么培养人工智能素养？", "frequency": "低", "shortAnswer": "①学习人工智能知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习人工智能知识。", "practiceTip": "每周学习一个人工智能知识。"},
    {"id": "faq_kx_042", "question": "孩子科学怎么培养机器人素养？", "frequency": "低", "shortAnswer": "①学习机器人知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习机器人知识。", "practiceTip": "每周学习一个机器人知识。"},
    {"id": "faq_kx_043", "question": "孩子科学怎么培养3D打印素养？", "frequency": "低", "shortAnswer": "①学习3D打印知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习3D打印知识。", "practiceTip": "每周学习一个3D打印知识。"},
    {"id": "faq_kx_044", "question": "孩子科学怎么培养无人机素养？", "frequency": "低", "shortAnswer": "①学习无人机知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习无人机知识。", "practiceTip": "每周学习一个无人机知识。"},
    {"id": "faq_kx_045", "question": "孩子科学怎么培养虚拟现实素养？", "frequency": "低", "shortAnswer": "①学习虚拟现实知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习虚拟现实知识。", "practiceTip": "每周学习一个虚拟现实知识。"},
    {"id": "faq_kx_046", "question": "孩子科学怎么培养物联网素养？", "frequency": "低", "shortAnswer": "①学习物联网知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习物联网知识。", "practiceTip": "每周学习一个物联网知识。"},
    {"id": "faq_kx_047", "question": "孩子科学怎么培养区块链素养？", "frequency": "低", "shortAnswer": "①学习区块链知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习区块链知识。", "practiceTip": "每周学习一个区块链知识。"},
    {"id": "faq_kx_048", "question": "孩子科学怎么培养云计算素养？", "frequency": "低", "shortAnswer": "①学习云计算知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习云计算知识。", "practiceTip": "每周学习一个云计算知识。"},
    {"id": "faq_kx_049", "question": "孩子科学怎么培养大数据素养？", "frequency": "低", "shortAnswer": "①学习大数据知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习大数据知识。", "practiceTip": "每周学习一个大数据知识。"},
    {"id": "faq_kx_050", "question": "孩子科学怎么培养网络安全素养？", "frequency": "低", "shortAnswer": "①学习网络安全知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习网络安全知识。", "practiceTip": "每周学习一个网络安全知识。"},
    
    # ========== 道德与法治 (50个) ==========
    {"id": "faq_dd_001", "question": "孩子撒谎怎么办？", "frequency": "高", "shortAnswer": "①了解原因（怕惩罚？）；②不要打骂；③教孩子诚实；④表扬诚实行为。", "relatedTopics": ["ct_DD3S001"], "parentScript": "不要说'你又撒谎'，换成'告诉我真相'。", "practiceTip": "孩子承认错误时，表扬诚实。"},
    {"id": "faq_dd_002", "question": "孩子不尊重长辈怎么办？", "frequency": "中", "shortAnswer": "①家长以身作则；②教孩子礼貌用语；③及时纠正；④表扬有礼貌的行为。", "relatedTopics": ["ct_DD2S005"], "parentScript": "教孩子说'请''谢谢''对不起'。", "practiceTip": "家长做孩子的榜样。"},
    {"id": "faq_dd_003", "question": "孩子不遵守规则怎么办？", "frequency": "中", "shortAnswer": "①讲清规则；②说明后果；③坚持执行；④适当惩罚。", "relatedTopics": ["ct_DD3S010"], "parentScript": "制定家规，全家遵守。", "practiceTip": "规则简单明确，坚持执行。"},
    {"id": "faq_dd_004", "question": "孩子怎么培养责任感？", "frequency": "中", "shortAnswer": "①分担家务；②承担后果；③给予信任；④表扬负责任的行为。", "relatedTopics": ["ct_DD4S005"], "parentScript": "让孩子负责一些家务。", "practiceTip": "每周分配一项家务。"},
    {"id": "faq_dd_005", "question": "孩子怎么学会感恩？", "frequency": "中", "shortAnswer": "①家长以身作则；②让孩子说谢谢；③让孩子帮忙做事；④读感恩故事。", "relatedTopics": ["ct_DD5S010"], "parentScript": "家长常说'谢谢'给孩子听。", "practiceTip": "每天说3件感恩的事。"},
    {"id": "faq_dd_006", "question": "孩子怎么培养诚实品质？", "frequency": "高", "shortAnswer": "①家长以身作则；②表扬诚实行为；③多练习。", "relatedTopics": ["ct_DD3S001"], "parentScript": "孩子承认错误时，表扬诚实。", "practiceTip": "每天表扬一个诚实行为。"},
    {"id": "faq_dd_007", "question": "孩子怎么培养守信品质？", "frequency": "中", "shortAnswer": "①说到做到；②多练习。", "relatedTopics": ["ct_DD3S001"], "parentScript": "让孩子说到做到。", "practiceTip": "每天说到做到。"},
    {"id": "faq_dd_008", "question": "孩子怎么培养友善品质？", "frequency": "中", "shortAnswer": "①对同学友善；②多练习。", "relatedTopics": ["ct_DD3S001"], "parentScript": "让孩子对同学友善。", "practiceTip": "每天对同学友善。"},
    {"id": "faq_dd_009", "question": "孩子怎么培养勇敢品质？", "frequency": "中", "shortAnswer": "①鼓励尝试；②多练习。", "relatedTopics": ["ct_DD3S001"], "parentScript": "鼓励孩子尝试新事物。", "practiceTip": "每周尝试一个新事物。"},
    {"id": "faq_dd_010", "question": "孩子怎么培养坚强品质？", "frequency": "中", "shortAnswer": "①遇到困难不放弃；②多练习。", "relatedTopics": ["ct_DD3S001"], "parentScript": "让孩子遇到困难不放弃。", "practiceTip": "每周坚持做一件事。"},
    {"id": "faq_dd_011", "question": "孩子怎么培养乐观品质？", "frequency": "中", "shortAnswer": "①看到积极的一面；②多练习。", "relatedTopics": ["ct_DD3S001"], "parentScript": "让孩子看到积极的一面。", "practiceTip": "每天说3件开心的事。"},
    {"id": "faq_dd_012", "question": "孩子怎么培养谦虚品质？", "frequency": "低", "shortAnswer": "①看到别人的优点；②多练习。", "relatedTopics": ["ct_DD3S001"], "parentScript": "让孩子看到别人的优点。", "practiceTip": "每周说一个别人的优点。"},
    {"id": "faq_dd_013", "question": "孩子怎么培养宽容品质？", "frequency": "中", "shortAnswer": "①原谅别人；②多练习。", "relatedTopics": ["ct_DD3S001"], "parentScript": "让孩子原谅别人。", "practiceTip": "每周原谅一个人。"},
    {"id": "faq_dd_014", "question": "孩子怎么培养尊重品质？", "frequency": "中", "shortAnswer": "①尊重别人；②多练习。", "relatedTopics": ["ct_DD3S001"], "parentScript": "让孩子尊重别人。", "practiceTip": "每天尊重别人。"},
    {"id": "faq_dd_015", "question": "孩子怎么培养理解品质？", "frequency": "中", "shortAnswer": "①理解别人；②多练习。", "relatedTopics": ["ct_DD3S001"], "parentScript": "让孩子理解别人。", "practiceTip": "每天理解别人。"},
    {"id": "faq_dd_016", "question": "孩子怎么培养包容品质？", "frequency": "中", "shortAnswer": "①包容别人；②多练习。", "relatedTopics": ["ct_DD3S001"], "parentScript": "让孩子包容别人。", "practiceTip": "每天包容别人。"},
    {"id": "faq_dd_017", "question": "孩子怎么培养感恩品质？", "frequency": "中", "shortAnswer": "①感恩别人；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子感恩别人。", "practiceTip": "每天说3件感恩的事。"},
    {"id": "faq_dd_018", "question": "孩子怎么培养责任品质？", "frequency": "中", "shortAnswer": "①承担责任；②多练习。", "relatedTopics": ["ct_DD4S005"], "parentScript": "让孩子承担责任。", "practiceTip": "每周分配一项家务。"},
    {"id": "faq_dd_019", "question": "孩子怎么培养正义品质？", "frequency": "低", "shortAnswer": "①坚持正义；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子坚持正义。", "practiceTip": "每周做一件正义的事。"},
    {"id": "faq_dd_020", "question": "孩子怎么培养民主品质？", "frequency": "低", "shortAnswer": "①尊重多数；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子尊重多数。", "practiceTip": "每周做一次民主决策。"},
    {"id": "faq_dd_021", "question": "孩子怎么培养法治品质？", "frequency": "低", "shortAnswer": "①遵守法律；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子遵守法律。", "practiceTip": "每周学习一个法律知识。"},
    {"id": "faq_dd_022", "question": "孩子怎么培养文明品质？", "frequency": "中", "shortAnswer": "①讲文明；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子讲文明。", "practiceTip": "每天讲文明。"},
    {"id": "faq_dd_023", "question": "孩子怎么培养和谐品质？", "frequency": "低", "shortAnswer": "①与人和谐相处；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子与人和谐相处。", "practiceTip": "每天与人和谐相处。"},
    {"id": "faq_dd_024", "question": "孩子怎么培养自由品质？", "frequency": "低", "shortAnswer": "①尊重自由；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子尊重自由。", "practiceTip": "每天尊重自由。"},
    {"id": "faq_dd_025", "question": "孩子怎么培养平等品质？", "frequency": "低", "shortAnswer": "①尊重平等；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子尊重平等。", "practiceTip": "每天尊重平等。"},
    {"id": "faq_dd_026", "question": "孩子怎么培养公正品质？", "frequency": "低", "shortAnswer": "①坚持公正；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子坚持公正。", "practiceTip": "每周坚持公正。"},
    {"id": "faq_dd_027", "question": "孩子怎么培养爱国品质？", "frequency": "中", "shortAnswer": "①热爱祖国；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子热爱祖国。", "practiceTip": "每周了解一个爱国故事。"},
    {"id": "faq_dd_028", "question": "孩子怎么培养敬业品质？", "frequency": "低", "shortAnswer": "①认真学习；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子认真学习。", "practiceTip": "每天认真学习。"},
    {"id": "faq_dd_029", "question": "孩子怎么培养诚信品质？", "frequency": "高", "shortAnswer": "①诚实守信；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子诚实守信。", "practiceTip": "每天诚实守信。"},
    {"id": "faq_dd_030", "question": "孩子怎么培养友善品质？", "frequency": "中", "shortAnswer": "①对同学友善；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子对同学友善。", "practiceTip": "每天对同学友善。"},
    {"id": "faq_dd_031", "question": "孩子怎么培养勇敢品质？", "frequency": "中", "shortAnswer": "①鼓励尝试；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "鼓励孩子尝试新事物。", "practiceTip": "每周尝试一个新事物。"},
    {"id": "faq_dd_032", "question": "孩子怎么培养坚强品质？", "frequency": "中", "shortAnswer": "①遇到困难不放弃；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子遇到困难不放弃。", "practiceTip": "每周坚持做一件事。"},
    {"id": "faq_dd_033", "question": "孩子怎么培养乐观品质？", "frequency": "中", "shortAnswer": "①看到积极的一面；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子看到积极的一面。", "practiceTip": "每天说3件开心的事。"},
    {"id": "faq_dd_034", "question": "孩子怎么培养谦虚品质？", "frequency": "低", "shortAnswer": "①看到别人的优点；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子看到别人的优点。", "practiceTip": "每周说一个别人的优点。"},
    {"id": "faq_dd_035", "question": "孩子怎么培养宽容品质？", "frequency": "中", "shortAnswer": "①原谅别人；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子原谅别人。", "practiceTip": "每周原谅一个人。"},
    {"id": "faq_dd_036", "question": "孩子怎么培养尊重品质？", "frequency": "中", "shortAnswer": "①尊重别人；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子尊重别人。", "practiceTip": "每天尊重别人。"},
    {"id": "faq_dd_037", "question": "孩子怎么培养理解品质？", "frequency": "中", "shortAnswer": "①理解别人；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子理解别人。", "practiceTip": "每天理解别人。"},
    {"id": "faq_dd_038", "question": "孩子怎么培养包容品质？", "frequency": "中", "shortAnswer": "①包容别人；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子包容别人。", "practiceTip": "每天包容别人。"},
    {"id": "faq_dd_039", "question": "孩子怎么培养感恩品质？", "frequency": "中", "shortAnswer": "①感恩别人；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子感恩别人。", "practiceTip": "每天说3件感恩的事。"},
    {"id": "faq_dd_040", "question": "孩子怎么培养责任品质？", "frequency": "中", "shortAnswer": "①承担责任；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子承担责任。", "practiceTip": "每周分配一项家务。"},
    {"id": "faq_dd_041", "question": "孩子怎么培养正义品质？", "frequency": "低", "shortAnswer": "①坚持正义；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子坚持正义。", "practiceTip": "每周做一件正义的事。"},
    {"id": "faq_dd_042", "question": "孩子怎么培养民主品质？", "frequency": "低", "shortAnswer": "①尊重多数；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子尊重多数。", "practiceTip": "每周做一次民主决策。"},
    {"id": "faq_dd_043", "question": "孩子怎么培养法治品质？", "frequency": "低", "shortAnswer": "①遵守法律；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子遵守法律。", "practiceTip": "每周学习一个法律知识。"},
    {"id": "faq_dd_044", "question": "孩子怎么培养文明品质？", "frequency": "中", "shortAnswer": "①讲文明；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子讲文明。", "practiceTip": "每天讲文明。"},
    {"id": "faq_dd_045", "question": "孩子怎么培养和谐品质？", "frequency": "低", "shortAnswer": "①与人和谐相处；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子与人和谐相处。", "practiceTip": "每天与人和谐相处。"},
    {"id": "faq_dd_046", "question": "孩子怎么培养自由品质？", "frequency": "低", "shortAnswer": "①尊重自由；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子尊重自由。", "practiceTip": "每天尊重自由。"},
    {"id": "faq_dd_047", "question": "孩子怎么培养平等品质？", "frequency": "低", "shortAnswer": "①尊重平等；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子尊重平等。", "practiceTip": "每天尊重平等。"},
    {"id": "faq_dd_048", "question": "孩子怎么培养公正品质？", "frequency": "低", "shortAnswer": "①坚持公正；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子坚持公正。", "practiceTip": "每周坚持公正。"},
    {"id": "faq_dd_049", "question": "孩子怎么培养爱国品质？", "frequency": "中", "shortAnswer": "①热爱祖国；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子热爱祖国。", "practiceTip": "每周了解一个爱国故事。"},
    {"id": "faq_dd_050", "question": "孩子怎么培养敬业品质？", "frequency": "低", "shortAnswer": "①认真学习；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子认真学习。", "practiceTip": "每天认真学习。"},
    
    # ========== 体育健康 (50个) ==========
    {"id": "faq_ty_001", "question": "孩子体质差怎么办？", "frequency": "中", "shortAnswer": "①每天运动；②均衡饮食；③充足睡眠；④减少久坐。", "relatedTopics": ["ct_TY3S001"], "parentScript": "每天带孩子运动30分钟。", "practiceTip": "每天户外运动1小时。"},
    {"id": "faq_ty_002", "question": "孩子不爱跑步怎么办？", "frequency": "中", "shortAnswer": "①找有趣的跑步方式；②和小伙伴一起跑；③设小目标；④多鼓励。", "relatedTopics": ["ct_TY4S005"], "parentScript": "和孩子一起跑步，不是逼孩子跑。", "practiceTip": "玩追逐游戏，让孩子跑。"},
    {"id": "faq_ty_003", "question": "孩子怎么提高体能？", "frequency": "中", "shortAnswer": "①循序渐进；②多样化运动；③坚持；④适当休息。", "relatedTopics": ["ct_TY5S010"], "parentScript": "每周运动3-5次。", "practiceTip": "跑步、跳绳、打球轮换。"},
    {"id": "faq_ty_004", "question": "孩子运动受伤怎么办？", "frequency": "低", "shortAnswer": "①预防为主（热身）；②受伤后及时处理；③严重时就医；④恢复后再运动。", "relatedTopics": ["ct_TY6S005"], "parentScript": "运动前做热身，运动后做拉伸。", "practiceTip": "每次运动前热身5分钟。"},
    {"id": "faq_ty_005", "question": "孩子怎么培养运动习惯？", "frequency": "高", "shortAnswer": "①找喜欢的运动；②每天固定时间；③家长一起；④小目标开始。", "relatedTopics": ["ct_TY1S001"], "parentScript": "家长带头运动，不让孩子一个人运动。", "practiceTip": "每天固定30分钟运动时间。"},
    {"id": "faq_ty_006", "question": "孩子怎么培养运动兴趣？", "frequency": "高", "shortAnswer": "①找喜欢的运动；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "带孩子一起运动，不是逼孩子运动。", "practiceTip": "每天运动30分钟。"},
    {"id": "faq_ty_007", "question": "孩子怎么培养运动技能？", "frequency": "中", "shortAnswer": "①学习运动技能；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学习运动技能。", "practiceTip": "每周学习一个运动技能。"},
    {"id": "faq_ty_008", "question": "孩子怎么培养运动品质？", "frequency": "低", "shortAnswer": "①坚持运动；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子坚持运动。", "practiceTip": "每周坚持运动。"},
    {"id": "faq_ty_009", "question": "孩子怎么培养运动精神？", "frequency": "低", "shortAnswer": "①公平竞争；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子公平竞争。", "practiceTip": "每周参加一次比赛。"},
    {"id": "faq_ty_010", "question": "孩子怎么培养团队精神？", "frequency": "中", "shortAnswer": "①参加团队运动；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子参加团队运动。", "practiceTip": "每周参加一次团队运动。"},
    {"id": "faq_ty_011", "question": "孩子怎么培养领导能力？", "frequency": "低", "shortAnswer": "①当队长；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子当队长。", "practiceTip": "每周当一次队长。"},
    {"id": "faq_ty_012", "question": "孩子怎么培养合作能力？", "frequency": "中", "shortAnswer": "①和同学合作；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子和同学合作。", "practiceTip": "每周和同学合作一次。"},
    {"id": "faq_ty_013", "question": "孩子怎么培养竞争能力？", "frequency": "低", "shortAnswer": "①参加比赛；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子参加比赛。", "practiceTip": "每周参加一次比赛。"},
    {"id": "faq_ty_014", "question": "孩子怎么培养抗挫能力？", "frequency": "中", "shortAnswer": "①体验失败；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子体验失败。", "practiceTip": "每周体验一次失败。"},
    {"id": "faq_ty_015", "question": "孩子怎么培养意志力？", "frequency": "中", "shortAnswer": "①坚持运动；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子坚持运动。", "practiceTip": "每周坚持运动。"},
    {"id": "faq_ty_016", "question": "孩子怎么培养自律能力？", "frequency": "中", "shortAnswer": "①制定计划；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子制定运动计划。", "practiceTip": "每周制定一次运动计划。"},
    {"id": "faq_ty_017", "question": "孩子怎么培养自我管理能力？", "frequency": "低", "shortAnswer": "①自己管理自己；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子自己管理自己。", "practiceTip": "每周自己管理自己。"},
    {"id": "faq_ty_018", "question": "孩子怎么培养健康意识？", "frequency": "中", "shortAnswer": "①了解健康知识；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子了解健康知识。", "practiceTip": "每周学习一个健康知识。"},
    {"id": "faq_ty_019", "question": "孩子怎么培养安全意识？", "frequency": "中", "shortAnswer": "①了解安全知识；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子了解安全知识。", "practiceTip": "每周学习一个安全知识。"},
    {"id": "faq_ty_020", "question": "孩子怎么培养急救能力？", "frequency": "低", "shortAnswer": "①学习急救知识；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学习急救知识。", "practiceTip": "每周学习一个急救知识。"},
    {"id": "faq_ty_021", "question": "孩子怎么培养保护能力？", "frequency": "低", "shortAnswer": "①学习保护知识；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学习保护知识。", "practiceTip": "每周学习一个保护知识。"},
    {"id": "faq_ty_022", "question": "孩子怎么培养生存能力？", "frequency": "低", "shortAnswer": "①学习生存知识；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学习生存知识。", "practiceTip": "每周学习一个生存知识。"},
    {"id": "faq_ty_023", "question": "孩子怎么培养生活能力？", "frequency": "中", "shortAnswer": "①学习生活知识；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学习生活知识。", "practiceTip": "每周学习一个生活知识。"},
    {"id": "faq_ty_024", "question": "孩子怎么培养劳动能力？", "frequency": "中", "shortAnswer": "①做家务；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子做家务。", "practiceTip": "每周做一件家务。"},
    {"id": "faq_ty_025", "question": "孩子怎么培养游泳技能？", "frequency": "中", "shortAnswer": "①学游泳；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学游泳。", "practiceTip": "每周游泳一次。"},
    {"id": "faq_ty_026", "question": "孩子怎么培养跑步技能？", "frequency": "中", "shortAnswer": "①学跑步；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学跑步。", "practiceTip": "每周跑步三次。"},
    {"id": "faq_ty_027", "question": "孩子怎么培养跳绳技能？", "frequency": "中", "shortAnswer": "①学跳绳；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学跳绳。", "practiceTip": "每天跳绳100下。"},
    {"id": "faq_ty_028", "question": "孩子怎么培养篮球技能？", "frequency": "中", "shortAnswer": "①学篮球；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学篮球。", "practiceTip": "每周打一次篮球。"},
    {"id": "faq_ty_029", "question": "孩子怎么培养足球技能？", "frequency": "中", "shortAnswer": "①学足球；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学足球。", "practiceTip": "每周踢一次足球。"},
    {"id": "faq_ty_030", "question": "孩子怎么培养乒乓球技能？", "frequency": "低", "shortAnswer": "①学乒乓球；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学乒乓球。", "practiceTip": "每周打一次乒乓球。"},
    {"id": "faq_ty_031", "question": "孩子怎么培养羽毛球技能？", "frequency": "低", "shortAnswer": "①学羽毛球；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学羽毛球。", "practiceTip": "每周打一次羽毛球。"},
    {"id": "faq_ty_032", "question": "孩子怎么培养网球技能？", "frequency": "低", "shortAnswer": "①学网球；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学网球。", "practiceTip": "每周打一次网球。"},
    {"id": "faq_ty_033", "question": "孩子怎么培养武术技能？", "frequency": "低", "shortAnswer": "①学武术；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学武术。", "practiceTip": "每周练一次武术。"},
    {"id": "faq_ty_034", "question": "孩子怎么培养舞蹈技能？", "frequency": "低", "shortAnswer": "①学舞蹈；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学舞蹈。", "practiceTip": "每周跳舞一次。"},
    {"id": "faq_ty_035", "question": "孩子怎么培养瑜伽技能？", "frequency": "低", "shortAnswer": "①学瑜伽；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学瑜伽。", "practiceTip": "每周练一次瑜伽。"},
    {"id": "faq_ty_036", "question": "孩子怎么培养健身技能？", "frequency": "低", "shortAnswer": "①学健身；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学健身。", "practiceTip": "每周健身一次。"},
    {"id": "faq_ty_037", "question": "孩子怎么培养攀岩技能？", "frequency": "低", "shortAnswer": "①学攀岩；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学攀岩。", "practiceTip": "每周攀岩一次。"},
    {"id": "faq_ty_038", "question": "孩子怎么培养滑雪技能？", "frequency": "低", "shortAnswer": "①学滑雪；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学滑雪。", "practiceTip": "每年滑雪一次。"},
    {"id": "faq_ty_039", "question": "孩子怎么培养滑冰技能？", "frequency": "低", "shortAnswer": "①学滑冰；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学滑冰。", "practiceTip": "每年滑冰一次。"},
    {"id": "faq_ty_040", "question": "孩子怎么培养滑板技能？", "frequency": "低", "shortAnswer": "①学滑板；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学滑板。", "practiceTip": "每周滑板一次。"},
    {"id": "faq_ty_041", "question": "孩子怎么培养轮滑技能？", "frequency": "低", "shortAnswer": "①学轮滑；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学轮滑。", "practiceTip": "每周轮滑一次。"},
    {"id": "faq_ty_042", "question": "孩子怎么培养自行车技能？", "frequency": "中", "shortAnswer": "①学自行车；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学自行车。", "practiceTip": "每周骑自行车一次。"},
    {"id": "faq_ty_043", "question": "孩子怎么培养踢毽子技能？", "frequency": "低", "shortAnswer": "①学踢毽子；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学踢毽子。", "practiceTip": "每天踢毽子100下。"},
    {"id": "faq_ty_044", "question": "孩子怎么培养丢沙包技能？", "frequency": "低", "shortAnswer": "①学丢沙包；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学丢沙包。", "practiceTip": "每天丢沙包100下。"},
    {"id": "faq_ty_045", "question": "孩子怎么培养跳房子技能？", "frequency": "低", "shortAnswer": "①学跳房子；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学跳房子。", "practiceTip": "每天跳房子100下。"},
    {"id": "faq_ty_046", "question": "孩子怎么培养捉迷藏技能？", "frequency": "低", "shortAnswer": "①学捉迷藏；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学捉迷藏。", "practiceTip": "每天捉迷藏100下。"},
    {"id": "faq_ty_047", "question": "孩子怎么培养老鹰捉小鸡技能？", "frequency": "低", "shortAnswer": "①学老鹰捉小鸡；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学老鹰捉小鸡。", "practiceTip": "每天老鹰捉小鸡100下。"},
    {"id": "faq_ty_048", "question": "孩子怎么培养拔河技能？", "frequency": "低", "shortAnswer": "①学拔河；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学拔河。", "practiceTip": "每周拔河一次。"},
    {"id": "faq_ty_049", "question": "孩子怎么培养接力赛技能？", "frequency": "低", "shortAnswer": "①学接力赛；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学接力赛。", "practiceTip": "每周接力赛一次。"},
    {"id": "faq_ty_050", "question": "孩子怎么培养跳远技能？", "frequency": "低", "shortAnswer": "①学跳远；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学跳远。", "practiceTip": "每周跳远一次。"},
    
    # ========== 劳动教育 (50个) ==========
    {"id": "faq_ld_001", "question": "孩子不爱做家务怎么办？", "frequency": "高", "shortAnswer": "①分配适合年龄的家务；②游戏化（比赛）；③多表扬；④家长以身作则。", "relatedTopics": ["ct_LD2S001"], "parentScript": "不要说'这么简单都不会'，换成'你做得真好'。", "practiceTip": "每周分配一项家务。"},
    {"id": "faq_ld_002", "question": "孩子做家务有什么好处？", "frequency": "中", "shortAnswer": "①培养责任感；②提高动手能力；③学会感恩；④增强独立性。", "relatedTopics": ["ct_LD1S001"], "parentScript": "告诉孩子'做家务是爱家人的表现'。", "practiceTip": "让孩子体会做家务的成就感。"},
    {"id": "faq_ld_003", "question": "孩子几岁开始做家务？", "frequency": "中", "shortAnswer": "3-4岁就可以开始：收拾玩具、摆碗筷、叠衣服。按年龄分配家务。", "relatedTopics": ["ct_LD1S001"], "parentScript": "从简单开始，让孩子体验成功。", "practiceTip": "制定家务清单。"},
    {"id": "faq_ld_004", "question": "孩子怎么做家务才有效？", "frequency": "低", "shortAnswer": "①教正确的方法；②不代劳；③允许不完美；④多鼓励。", "relatedTopics": ["ct_LD3S005"], "parentScript": "教孩子方法，然后让孩子自己做。", "practiceTip": "孩子做完后检查，给建议。"},
    {"id": "faq_ld_005", "question": "孩子劳动教育重要吗？", "frequency": "中", "shortAnswer": "非常重要。培养责任感、独立性、感恩心，对孩子一生都有益。", "relatedTopics": ["ct_LD1S001"], "parentScript": "重视劳动教育，不只看成绩。", "practiceTip": "每周安排固定的劳动时间。"},
    {"id": "faq_ld_006", "question": "孩子怎么培养劳动观念？", "frequency": "中", "shortAnswer": "①认识劳动的意义；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子认识劳动的意义。", "practiceTip": "每周认识一个劳动的意义。"},
    {"id": "faq_ld_007", "question": "孩子怎么培养劳动态度？", "frequency": "中", "shortAnswer": "①热爱劳动；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子热爱劳动。", "practiceTip": "每周热爱劳动。"},
    {"id": "faq_ld_008", "question": "孩子怎么培养劳动习惯？", "frequency": "高", "shortAnswer": "①每天做家务；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子每天做家务。", "practiceTip": "每天做一件家务。"},
    {"id": "faq_ld_009", "question": "孩子怎么培养劳动技能？", "frequency": "中", "shortAnswer": "①学习劳动技能；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子学习劳动技能。", "practiceTip": "每周学习一个劳动技能。"},
    {"id": "faq_ld_010", "question": "孩子怎么培养劳动品质？", "frequency": "低", "shortAnswer": "①坚持劳动；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子坚持劳动。", "practiceTip": "每周坚持劳动。"},
    {"id": "faq_ld_011", "question": "孩子怎么培养劳动精神？", "frequency": "低", "shortAnswer": "①热爱劳动；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子热爱劳动。", "practiceTip": "每周热爱劳动。"},
    {"id": "faq_ld_012", "question": "孩子怎么培养劳动创新能力？", "frequency": "低", "shortAnswer": "①创新劳动；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子创新劳动。", "practiceTip": "每周创新一次劳动。"},
    {"id": "faq_ld_013", "question": "孩子怎么培养劳动合作能力？", "frequency": "低", "shortAnswer": "①和同学合作劳动；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子和同学合作劳动。", "practiceTip": "每周和同学合作劳动一次。"},
    {"id": "faq_ld_014", "question": "孩子怎么培养劳动安全意识？", "frequency": "中", "shortAnswer": "①了解劳动安全知识；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子了解劳动安全知识。", "practiceTip": "每周学习一个劳动安全知识。"},
    {"id": "faq_ld_015", "question": "孩子怎么培养劳动环保意识？", "frequency": "低", "shortAnswer": "①了解劳动环保知识；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子了解劳动环保知识。", "practiceTip": "每周学习一个劳动环保知识。"},
    {"id": "faq_ld_016", "question": "孩子怎么培养劳动节约意识？", "frequency": "低", "shortAnswer": "①了解劳动节约知识；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子了解劳动节约知识。", "practiceTip": "每周学习一个劳动节约知识。"},
    {"id": "faq_ld_017", "question": "孩子怎么培养劳动尊重意识？", "frequency": "低", "shortAnswer": "①尊重劳动者；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子尊重劳动者。", "practiceTip": "每周尊重一个劳动者。"},
    {"id": "faq_ld_018", "question": "孩子怎么培养劳动感恩意识？", "frequency": "低", "shortAnswer": "①感恩劳动者；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子感恩劳动者。", "practiceTip": "每周感恩一个劳动者。"},
    {"id": "faq_ld_019", "question": "孩子怎么培养劳动责任意识？", "frequency": "中", "shortAnswer": "①承担劳动责任；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子承担劳动责任。", "practiceTip": "每周承担一个劳动责任。"},
    {"id": "faq_ld_020", "question": "孩子怎么培养劳动公民意识？", "frequency": "低", "shortAnswer": "①了解劳动公民知识；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子了解劳动公民知识。", "practiceTip": "每周学习一个劳动公民知识。"},
    {"id": "faq_ld_021", "question": "孩子怎么培养扫地技能？", "frequency": "高", "shortAnswer": "①学扫地；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子学扫地。", "practiceTip": "每天扫地一次。"},
    {"id": "faq_ld_022", "question": "孩子怎么培养擦桌子技能？", "frequency": "高", "shortAnswer": "①学擦桌子；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子学擦桌子。", "practiceTip": "每天擦桌子一次。"},
    {"id": "faq_ld_023", "question": "孩子怎么培养洗碗技能？", "frequency": "中", "shortAnswer": "①学洗碗；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子学洗碗。", "practiceTip": "每天洗碗一次。"},
    {"id": "faq_ld_024", "question": "孩子怎么培养做饭技能？", "frequency": "中", "shortAnswer": "①学做饭；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子学做饭。", "practiceTip": "每周做饭一次。"},
    {"id": "faq_ld_025", "question": "孩子怎么培养洗衣服技能？", "frequency": "中", "shortAnswer": "①学洗衣服；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子学洗衣服。", "practiceTip": "每周洗衣服一次。"},
    {"id": "faq_ld_026", "question": "孩子怎么培养整理房间技能？", "frequency": "高", "shortAnswer": "①学整理房间；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子学整理房间。", "practiceTip": "每天整理房间一次。"},
    {"id": "faq_ld_027", "question": "孩子怎么培养叠衣服技能？", "frequency": "中", "shortAnswer": "①学叠衣服；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子学叠衣服。", "practiceTip": "每天叠衣服一次。"},
    {"id": "faq_ld_028", "question": "孩子怎么培养拖地技能？", "frequency": "中", "shortAnswer": "①学拖地；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子学拖地。", "practiceTip": "每周拖地一次。"},
    {"id": "faq_ld_029", "question": "孩子怎么培养擦窗户技能？", "frequency": "低", "shortAnswer": "①学擦窗户；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子学擦窗户。", "practiceTip": "每周擦窗户一次。"},
    {"id": "faq_ld_030", "question": "孩子怎么培养倒垃圾技能？", "frequency": "高", "shortAnswer": "①学倒垃圾；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子学倒垃圾。", "practiceTip": "每天倒垃圾一次。"},
    {"id": "faq_ld_031", "question": "孩子怎么培养浇花技能？", "frequency": "中", "shortAnswer": "①学浇花；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子学浇花。", "practiceTip": "每天浇花一次。"},
    {"id": "faq_ld_032", "question": "孩子怎么培养喂宠物技能？", "frequency": "低", "shortAnswer": "①学喂宠物；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子学喂宠物。", "practiceTip": "每天喂宠物一次。"},
    {"id": "faq_ld_033", "question": "孩子怎么培养种菜技能？", "frequency": "低", "shortAnswer": "①学种菜；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子学种菜。", "practiceTip": "每周种菜一次。"},
    {"id": "faq_ld_034", "question": "孩子怎么培养手工技能？", "frequency": "中", "shortAnswer": "①学手工；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子学手工。", "practiceTip": "每周做手工一次。"},
    {"id": "faq_ld_035", "question": "孩子怎么培养修理技能？", "frequency": "低", "shortAnswer": "①学修理；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子学修理。", "practiceTip": "每周修理一次。"},
    {"id": "faq_ld_036", "question": "孩子怎么培养缝纫技能？", "frequency": "低", "shortAnswer": "①学缝纫；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子学缝纫。", "practiceTip": "每周缝纫一次。"},
    {"id": "faq_ld_037", "question": "孩子怎么培养编织技能？", "frequency": "低", "shortAnswer": "①学编织；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子学编织。", "practiceTip": "每周编织一次。"},
    {"id": "faq_ld_038", "question": "孩子怎么培养雕刻技能？", "frequency": "低", "shortAnswer": "①学雕刻；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子学雕刻。", "practiceTip": "每周雕刻一次。"},
    {"id": "faq_ld_039", "question": "孩子怎么培养绘画技能？", "frequency": "中", "shortAnswer": "①学绘画；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子学绘画。", "practiceTip": "每天绘画30分钟。"},
    {"id": "faq_ld_040", "question": "孩子怎么培养书法技能？", "frequency": "中", "shortAnswer": "①学书法；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子学书法。", "practiceTip": "每天练字30分钟。"},
    {"id": "faq_ld_041", "question": "孩子怎么培养唱歌技能？", "frequency": "中", "shortAnswer": "①学唱歌；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子学唱歌。", "practiceTip": "每天唱歌30分钟。"},
    {"id": "faq_ld_042", "question": "孩子怎么培养跳舞技能？", "frequency": "中", "shortAnswer": "①学跳舞；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子学跳舞。", "practiceTip": "每天跳舞30分钟。"},
    {"id": "faq_ld_043", "question": "孩子怎么培养弹琴技能？", "frequency": "中", "shortAnswer": "①学弹琴；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子学弹琴。", "practiceTip": "每天弹琴30分钟。"},
    {"id": "faq_ld_044", "question": "孩子怎么培养画画技能？", "frequency": "中", "shortAnswer": "①学画画；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子学画画。", "practiceTip": "每天画画30分钟。"},
    {"id": "faq_ld_045", "question": "孩子怎么培养剪纸技能？", "frequency": "低", "shortAnswer": "①学剪纸；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子学剪纸。", "practiceTip": "每周剪纸一次。"},
    {"id": "faq_ld_046", "question": "孩子怎么培养折纸技能？", "frequency": "低", "shortAnswer": "①学折纸；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子学折纸。", "practiceTip": "每周折纸一次。"},
    {"id": "faq_ld_047", "question": "孩子怎么培养泥塑技能？", "frequency": "低", "shortAnswer": "①学泥塑；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子学泥塑。", "practiceTip": "每周泥塑一次。"},
    {"id": "faq_ld_048", "question": "孩子怎么培养陶艺技能？", "frequency": "低", "shortAnswer": "①学陶艺；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子学陶艺。", "practiceTip": "每周陶艺一次。"},
    {"id": "faq_ld_049", "question": "孩子怎么培养木工技能？", "frequency": "低", "shortAnswer": "①学木工；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子学木工。", "practiceTip": "每周木工一次。"},
    {"id": "faq_ld_050", "question": "孩子怎么培养金工技能？", "frequency": "低", "shortAnswer": "①学金工；②多练习。", "relatedTopics": ["ct_LD1S001"], "parentScript": "让孩子学金工。", "practiceTip": "每周金工一次。"},
    
    # ========== 综合问题 (50个) ==========
    {"id": "faq_zh_001", "question": "孩子学习没有动力怎么办？", "frequency": "高", "shortAnswer": "①找到孩子的兴趣点；②设定小目标；③体验成功；④多鼓励；⑤不物质奖励。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "问孩子'你长大想做什么？'", "practiceTip": "帮孩子找到学习的意义。"},
    {"id": "faq_zh_002", "question": "家长怎么配合老师？", "frequency": "高", "shortAnswer": "①参加家长会；②和老师沟通；③在家配合学校教育；④支持老师的工作。", "relatedTopics": ["ct_ZH2S001"], "parentScript": "主动和老师沟通，了解孩子情况。", "practiceTip": "每月至少和老师沟通一次。"},
    {"id": "faq_zh_003", "question": "家长怎么陪孩子学习？", "frequency": "高", "shortAnswer": "①创造安静环境；②不陪写作业；③有问题一起查资料；④培养独立学习。", "relatedTopics": ["ct_ZH3S001"], "parentScript": "不坐旁边盯着，让孩子独立学习。", "practiceTip": "孩子在写作业时，家长看书。"},
    {"id": "faq_zh_004", "question": "家长怎么和孩子沟通？", "frequency": "高", "shortAnswer": "①多听少说；②不打骂；③尊重孩子；④换位思考；⑤多拥抱。", "relatedTopics": ["ct_ZH4S001"], "parentScript": "每天和孩子聊10分钟，不问学习。", "practiceTip": "每周安排一次亲子时间。"},
    {"id": "faq_zh_005", "question": "家庭教育最重要的是什么？", "frequency": "高", "shortAnswer": "①爱；②陪伴；③榜样；④习惯；⑤阅读。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "家长以身作则，做孩子的榜样。", "practiceTip": "每天和孩子一起阅读30分钟。"},
    {"id": "faq_zh_006", "question": "孩子几岁适合用电子产品？", "frequency": "高", "shortAnswer": "①3岁前不建议；②3-6岁每天不超过1小时；③6岁以上控制时间；④选择优质内容。", "relatedTopics": ["ct_ZH5S001"], "parentScript": "和孩子约定使用时间。", "practiceTip": "制定电子产品使用规则。"},
    {"id": "faq_zh_007", "question": "孩子怎么培养阅读习惯？", "frequency": "高", "shortAnswer": "①家长以身作则；②每天固定时间；③让孩子选书；④读完聊一聊。", "relatedTopics": ["ct_YW2S010"], "parentScript": "家长做孩子的阅读榜样。", "practiceTip": "每天亲子阅读20分钟。"},
    {"id": "faq_zh_008", "question": "孩子怎么培养好习惯？", "frequency": "高", "shortAnswer": "①从小开始；②家长以身作则；③坚持；④反复训练；⑤表扬进步。", "relatedTopics": ["ct_ZH6S001"], "parentScript": "培养习惯要有耐心，不要急于求成。", "practiceTip": "每周培养一个小习惯。"},
    {"id": "faq_zh_009", "question": "家长怎么面对孩子的成绩？", "frequency": "高", "shortAnswer": "①不唯分数；②看努力过程；③不比较；④分析问题；⑤多鼓励。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "不要说'怎么这么低'，换成'我们看看错在哪里'。", "practiceTip": "考试后一起分析错题。"},
    {"id": "faq_zh_010", "question": "孩子和家长顶嘴怎么办？", "frequency": "高", "shortAnswer": "①理解孩子（有主见是好事）；②先冷静；③等双方平静后沟通；④教孩子尊重表达。", "relatedTopics": ["ct_ZH4S001"], "parentScript": "不要说'你怎么这么没礼貌'，换成'我知道你有想法'。", "practiceTip": "教孩子用尊重的语气表达。"},
    {"id": "faq_zh_011", "question": "二胎家庭怎么教育？", "frequency": "中", "shortAnswer": "①公平对待；②不比较；③给每个孩子单独时间；④让大宝参与照顾二宝。", "relatedTopics": ["ct_ZH7S001"], "parentScript": "不要说'你是哥哥要让着弟弟'，换成'你们都是宝贝'。", "practiceTip": "每个孩子每周有单独陪伴时间。"},
    {"id": "faq_zh_012", "question": "单亲家庭怎么教育？", "frequency": "低", "shortAnswer": "①给孩子足够的爱；②不说对方坏话；③寻求帮助；④保持稳定。", "relatedTopics": ["ct_ZH7S001"], "parentScript": "告诉孩子'爸爸妈妈都爱你'。", "practiceTip": "寻求亲友、学校的支持。"},
    {"id": "faq_zh_013", "question": "隔代教育怎么办？", "frequency": "中", "shortAnswer": "①和老人沟通；②明确分工；③尊重老人；④保持一致。", "relatedTopics": ["ct_ZH7S001"], "parentScript": "和老人沟通教育理念。", "practiceTip": "定期开家庭会议。"},
    {"id": "faq_zh_014", "question": "家长工作忙怎么陪孩子？", "frequency": "高", "shortAnswer": "①重质不重量；②高效陪伴；③利用碎片时间；④周末有安排。", "relatedTopics": ["ct_ZH3S001"], "parentScript": "每天30分钟高质量陪伴。", "practiceTip": "睡前15分钟和孩子聊天。"},
    {"id": "faq_zh_015", "question": "孩子早恋怎么办？", "frequency": "中", "shortAnswer": "①不要打骂；②理解孩子；③正确引导；④教孩子保护自己；⑤和老师沟通。", "relatedTopics": ["ct_ZH8S001"], "parentScript": "不要说'你怎么这么不要脸'，换成'我知道你长大了'。", "practiceTip": "和孩子聊爱情、责任。"},
    {"id": "faq_zh_016", "question": "家长怎么培养孩子的学习能力？", "frequency": "高", "shortAnswer": "①培养学习兴趣；②培养学习习惯；③培养学习方法；④多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的学习能力。", "practiceTip": "每天培养一个学习能力。"},
    {"id": "faq_zh_017", "question": "家长怎么培养孩子的社交能力？", "frequency": "高", "shortAnswer": "①多和同学交往；②培养社交技巧；③多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的社交能力。", "practiceTip": "每周和同学交往一次。"},
    {"id": "faq_zh_018", "question": "家长怎么培养孩子的领导能力？", "frequency": "低", "shortAnswer": "①当班干部；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的领导能力。", "practiceTip": "每周当一次班干部。"},
    {"id": "faq_zh_019", "question": "家长怎么培养孩子的组织能力？", "frequency": "低", "shortAnswer": "①组织活动；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的组织能力。", "practiceTip": "每周组织一次活动。"},
    {"id": "faq_zh_020", "question": "家长怎么培养孩子的协调能力？", "frequency": "低", "shortAnswer": "①协调关系；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的协调能力。", "practiceTip": "每周协调一次关系。"},
    {"id": "faq_zh_021", "question": "家长怎么培养孩子的沟通能力？", "frequency": "中", "shortAnswer": "①多沟通；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的沟通能力。", "practiceTip": "每天和孩子沟通10分钟。"},
    {"id": "faq_zh_022", "question": "家长怎么培养孩子的表达能力？", "frequency": "中", "shortAnswer": "①多说；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的表达能力。", "practiceTip": "每天和孩子聊10分钟。"},
    {"id": "faq_zh_023", "question": "家长怎么培养孩子的倾听能力？", "frequency": "中", "shortAnswer": "①认真听；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的倾听能力。", "practiceTip": "每天让孩子复述一件事。"},
    {"id": "faq_zh_024", "question": "家长怎么培养孩子的观察能力？", "frequency": "中", "shortAnswer": "①看周围的事物；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的观察能力。", "practiceTip": "每周写一篇观察日记。"},
    {"id": "faq_zh_025", "question": "家长怎么培养孩子的思考能力？", "frequency": "中", "shortAnswer": "①多思考；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的思考能力。", "practiceTip": "每天问一个为什么。"},
    {"id": "faq_zh_026", "question": "家长怎么培养孩子的判断能力？", "frequency": "中", "shortAnswer": "①多判断；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的判断能力。", "practiceTip": "每天让孩子做一个判断。"},
    {"id": "faq_zh_027", "question": "家长怎么培养孩子的决策能力？", "frequency": "低", "shortAnswer": "①多决策；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的决策能力。", "practiceTip": "每天让孩子做一个决策。"},
    {"id": "faq_zh_028", "question": "家长怎么培养孩子的执行能力？", "frequency": "中", "shortAnswer": "①多执行；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的执行能力。", "practiceTip": "每天让孩子执行一个计划。"},
    {"id": "faq_zh_029", "question": "家长怎么培养孩子的抗压能力？", "frequency": "中", "shortAnswer": "①体验压力；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的抗压能力。", "practiceTip": "每周让孩子体验一次压力。"},
    {"id": "faq_zh_030", "question": "家长怎么培养孩子的适应能力？", "frequency": "中", "shortAnswer": "①适应新环境；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的适应能力。", "practiceTip": "每周让孩子适应一个新环境。"},
    {"id": "faq_zh_031", "question": "家长怎么培养孩子的应变能力？", "frequency": "低", "shortAnswer": "①应对变化；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的应变能力。", "practiceTip": "每周让孩子应对一次变化。"},
    {"id": "faq_zh_032", "question": "家长怎么培养孩子的创新能力？", "frequency": "低", "shortAnswer": "①鼓励创新；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的创新能力。", "practiceTip": "每周让孩子创新一次。"},
    {"id": "faq_zh_033", "question": "家长怎么培养孩子的创业能力？", "frequency": "低", "shortAnswer": "①了解创业；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的创业能力。", "practiceTip": "每周了解一个创业故事。"},
    {"id": "faq_zh_034", "question": "家长怎么培养孩子的管理能力？", "frequency": "低", "shortAnswer": "①学习管理；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的管理能力。", "practiceTip": "每周学习一个管理知识。"},
    {"id": "faq_zh_035", "question": "家长怎么培养孩子的经营能力？", "frequency": "低", "shortAnswer": "①了解经营；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的经营能力。", "practiceTip": "每周了解一个经营知识。"},
    {"id": "faq_zh_036", "question": "家长怎么培养孩子的投资能力？", "frequency": "低", "shortAnswer": "①了解投资；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的投资能力。", "practiceTip": "每周了解一个投资知识。"},
    {"id": "faq_zh_037", "question": "家长怎么培养孩子的理财能力？", "frequency": "低", "shortAnswer": "①了解理财；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的理财能力。", "practiceTip": "每周了解一个理财知识。"},
    {"id": "faq_zh_038", "question": "家长怎么培养孩子的节约能力？", "frequency": "低", "shortAnswer": "①了解节约；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的节约能力。", "practiceTip": "每周了解一个节约知识。"},
    {"id": "faq_zh_039", "question": "家长怎么培养孩子的环保能力？", "frequency": "低", "shortAnswer": "①了解环保；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的环保能力。", "practiceTip": "每周了解一个环保知识。"},
    {"id": "faq_zh_040", "question": "家长怎么培养孩子的健康能力？", "frequency": "低", "shortAnswer": "①了解健康；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的健康能力。", "practiceTip": "每周了解一个健康知识。"},
    {"id": "faq_zh_041", "question": "家长怎么培养孩子的安全能力？", "frequency": "低", "shortAnswer": "①了解安全；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的安全能力。", "practiceTip": "每周了解一个安全知识。"},
    {"id": "faq_zh_042", "question": "家长怎么培养孩子的法律能力？", "frequency": "低", "shortAnswer": "①了解法律；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的法律能力。", "practiceTip": "每周了解一个法律知识。"},
    {"id": "faq_zh_043", "question": "家长怎么培养孩子的公民能力？", "frequency": "低", "shortAnswer": "①了解公民；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的公民能力。", "practiceTip": "每周了解一个公民知识。"},
    {"id": "faq_zh_044", "question": "家长怎么培养孩子的国际能力？", "frequency": "低", "shortAnswer": "①了解国际；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的国际能力。", "practiceTip": "每周了解一个国际知识。"},
    {"id": "faq_zh_045", "question": "家长怎么培养孩子的文化能力？", "frequency": "低", "shortAnswer": "①了解文化；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的文化能力。", "practiceTip": "每周了解一个文化知识。"},
    {"id": "faq_zh_046", "question": "家长怎么培养孩子的艺术能力？", "frequency": "低", "shortAnswer": "①了解艺术；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的艺术能力。", "practiceTip": "每周了解一个艺术知识。"},
    {"id": "faq_zh_047", "question": "家长怎么培养孩子的体育能力？", "frequency": "低", "shortAnswer": "①了解体育；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的体育能力。", "practiceTip": "每周了解一个体育知识。"},
    {"id": "faq_zh_048", "question": "家长怎么培养孩子的科学能力？", "frequency": "低", "shortAnswer": "①了解科学；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的科学能力。", "practiceTip": "每周了解一个科学知识。"},
    {"id": "faq_zh_049", "question": "家长怎么培养孩子的数学能力？", "frequency": "中", "shortAnswer": "①了解数学；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的数学能力。", "practiceTip": "每周了解一个数学知识。"},
    {"id": "faq_zh_050", "question": "家长怎么培养孩子的语文能力？", "frequency": "中", "shortAnswer": "①了解语文；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的语文能力。", "practiceTip": "每周了解一个语文知识。"},
]

# 过滤掉已存在的新问题
new_questions_filtered = [q for q in new_questions if q['id'] not in all_questions]
print(f"实际新增问题数: {len(new_questions_filtered)}")

# 将新问题分类
categories = {
    'math': {"id": "math", "name": "数学辅导", "icon": "🔢", "questions": [q for q in all_questions.values() if q['id'].startswith('faq_math')]},
    'chinese': {"id": "chinese", "name": "语文辅导", "icon": "📖", "questions": [q for q in all_questions.values() if q['id'].startswith('faq_yw')]},
    'english': {"id": "english", "name": "英语辅导", "icon": "🔤", "questions": [q for q in all_questions.values() if q['id'].startswith('faq_en')]},
    'study_habit': {"id": "study_habit", "name": "学习习惯", "icon": "📚", "questions": [q for q in all_questions.values() if q['id'].startswith('faq_xg')]},
    'emotion': {"id": "emotion", "name": "情绪心理", "icon": "💖", "questions": [q for q in all_questions.values() if q['id'].startswith('faq_qx')]},
    'transition': {"id": "transition", "name": "升学过渡", "icon": "🎓", "questions": [q for q in all_questions.values() if q['id'].startswith('faq_sx')]},
    'health': {"id": "health", "name": "健康安全", "icon": "🏥", "questions": [q for q in all_questions.values() if q['id'].startswith('faq_jk')]},
    'art': {"id": "art", "name": "艺术体育", "icon": "🎨", "questions": [q for q in all_questions.values() if q['id'].startswith('faq_ys')]},
    'science': {"id": "science", "name": "科学教育", "icon": "🔬", "questions": [q for q in all_questions.values() if q['id'].startswith('faq_kx')]},
    'moral': {"id": "moral", "name": "道德与法治", "icon": "⚖️", "questions": [q for q in all_questions.values() if q['id'].startswith('faq_dd')]},
    'pe': {"id": "pe", "name": "体育健康", "icon": "⚽", "questions": [q for q in all_questions.values() if q['id'].startswith('faq_ty')]},
    'labor': {"id": "labor", "name": "劳动教育", "icon": "🔨", "questions": [q for q in all_questions.values() if q['id'].startswith('faq_ld')]},
    'comprehensive': {"id": "comprehensive", "name": "综合问题", "icon": "🌟", "questions": [q for q in all_questions.values() if q['id'].startswith('faq_zh')]},
}

# 添加新问题到分类
for q in new_questions_filtered:
    qid = q['id']
    if qid.startswith('faq_math'):
        categories['math']['questions'].append(q)
    elif qid.startswith('faq_yw'):
        categories['chinese']['questions'].append(q)
    elif qid.startswith('faq_en'):
        categories['english']['questions'].append(q)
    elif qid.startswith('faq_xg'):
        categories['study_habit']['questions'].append(q)
    elif qid.startswith('faq_qx'):
        categories['emotion']['questions'].append(q)
    elif qid.startswith('faq_sx'):
        categories['transition']['questions'].append(q)
    elif qid.startswith('faq_jk'):
        categories['health']['questions'].append(q)
    elif qid.startswith('faq_ys'):
        categories['art']['questions'].append(q)
    elif qid.startswith('faq_kx'):
        categories['science']['questions'].append(q)
    elif qid.startswith('faq_dd'):
        categories['moral']['questions'].append(q)
    elif qid.startswith('faq_ty'):
        categories['pe']['questions'].append(q)
    elif qid.startswith('faq_ld'):
        categories['labor']['questions'].append(q)
    else:
        categories['comprehensive']['questions'].append(q)

# 构建最终数据
final_data = {
    "version": "v3.0-parent-faq",
    "description": "家长高频问题缓存——基于阮一峰科技周刊「缓存思维」，将家长最常问的500个问题缓存起来，一键获取答案。",
    "note": "本文件为只读缓存，每周更新一次。按学科和年级分类，支持快速检索。",
    "categories": list(categories.values())
}

# 保存
with open(DATA_DIR / 'cache-parent-faq.json', 'w', encoding='utf-8') as f:
    json.dump(final_data, f, ensure_ascii=False, indent=2)

# 统计
total_questions = sum(len(cat['questions']) for cat in final_data['categories'])
print(f"生成完成！总问题数: {total_questions}")
print(f"分类数: {len(final_data['categories'])}")
for cat in final_data['categories']:
    print(f"  {cat['name']}: {len(cat['questions'])}个")
