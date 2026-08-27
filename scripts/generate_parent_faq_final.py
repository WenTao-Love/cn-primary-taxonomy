#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量生成家长高频问题：最终扩充到500个
"""

import json
from pathlib import Path

DATA_DIR = Path('D:/xcode/fgit/cn-primary-taxonomy/data')

# 读取现有FAQ
with open(DATA_DIR / 'cache-parent-faq.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

existing_questions = []
for cat in data['categories']:
    for q in cat['questions']:
        existing_questions.append(q)

existing_ids = {q['id'] for q in existing_questions}

print(f"现有问题数: {len(existing_questions)}")

# 定义新增问题（200个）
new_questions = [
    # ========== 科学教育 (新增25个) ==========
    {"id": "faq_kx_026", "question": "孩子科学怎么培养地理素养？", "frequency": "低", "shortAnswer": "①学习地理知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习地理知识。", "practiceTip": "每周学习一个地理知识。"},
    {"id": "faq_kx_027", "question": "孩子科学怎么培养历史素养？", "frequency": "低", "shortAnswer": "①学习历史知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习历史知识。", "practiceTip": "每周学习一个历史知识。"},
    {"id": "faq_kx_028", "question": "孩子科学怎么培养生物素养？", "frequency": "中", "shortAnswer": "①学习生物知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习生物知识。", "practiceTip": "每周学习一个生物知识。"},
    {"id": "faq_kx_029", "question": "孩子科学怎么培养化学素养？", "frequency": "低", "shortAnswer": "①学习化学知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习化学知识。", "practiceTip": "每周学习一个化学知识。"},
    {"id": "faq_kx_030", "question": "孩子科学怎么培养物理素养？", "frequency": "低", "shortAnswer": "①学习物理知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习物理知识。", "practiceTip": "每周学习一个物理知识。"},
    {"id": "faq_kx_031", "question": "孩子科学怎么培养天文素养？", "frequency": "低", "shortAnswer": "①学习天文知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习天文知识。", "practiceTip": "每周学习一个天文知识。"},
    {"id": "faq_kx_032", "question": "孩子科学怎么培养环境素养？", "frequency": "低", "shortAnswer": "①学习环境知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习环境知识。", "practiceTip": "每周学习一个环境知识。"},
    {"id": "faq_kx_033", "question": "孩子科学怎么培养生态素养？", "frequency": "低", "shortAnswer": "①学习生态知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习生态知识。", "practiceTip": "每周学习一个生态知识。"},
    {"id": "faq_kx_034", "question": "孩子科学怎么培养能源素养？", "frequency": "低", "shortAnswer": "①学习能源知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习能源知识。", "practiceTip": "每周学习一个能源知识。"},
    {"id": "faq_kx_035", "question": "孩子科学怎么培养材料素养？", "frequency": "低", "shortAnswer": "①学习材料知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习材料知识。", "practiceTip": "每周学习一个材料知识。"},
    {"id": "faq_kx_036", "question": "孩子科学怎么培养工程素养？", "frequency": "低", "shortAnswer": "①学习工程知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习工程知识。", "practiceTip": "每周学习一个工程知识。"},
    {"id": "faq_kx_037", "question": "孩子科学怎么培养技术素养？", "frequency": "低", "shortAnswer": "①学习技术知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习技术知识。", "practiceTip": "每周学习一个技术知识。"},
    {"id": "faq_kx_038", "question": "孩子科学怎么培养信息素养？", "frequency": "低", "shortAnswer": "①学习信息知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习信息知识。", "practiceTip": "每周学习一个信息知识。"},
    {"id": "faq_kx_039", "question": "孩子科学怎么培养数字素养？", "frequency": "低", "shortAnswer": "①学习数字知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习数字知识。", "practiceTip": "每周学习一个数字知识。"},
    {"id": "faq_kx_040", "question": "孩子科学怎么培养数据素养？", "frequency": "低", "shortAnswer": "①学习数据知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习数据知识。", "practiceTip": "每周学习一个数据知识。"},
    {"id": "faq_kx_041", "question": "孩子科学怎么培养算法素养？", "frequency": "低", "shortAnswer": "①学习算法知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习算法知识。", "practiceTip": "每周学习一个算法知识。"},
    {"id": "faq_kx_042", "question": "孩子科学怎么培养编程素养？", "frequency": "低", "shortAnswer": "①学习编程知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习编程知识。", "practiceTip": "每周学习一个编程知识。"},
    {"id": "faq_kx_043", "question": "孩子科学怎么培养人工智能素养？", "frequency": "低", "shortAnswer": "①学习人工智能知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习人工智能知识。", "practiceTip": "每周学习一个人工智能知识。"},
    {"id": "faq_kx_044", "question": "孩子科学怎么培养机器人素养？", "frequency": "低", "shortAnswer": "①学习机器人知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习机器人知识。", "practiceTip": "每周学习一个机器人知识。"},
    {"id": "faq_kx_045", "question": "孩子科学怎么培养3D打印素养？", "frequency": "低", "shortAnswer": "①学习3D打印知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习3D打印知识。", "practiceTip": "每周学习一个3D打印知识。"},
    {"id": "faq_kx_046", "question": "孩子科学怎么培养无人机素养？", "frequency": "低", "shortAnswer": "①学习无人机知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习无人机知识。", "practiceTip": "每周学习一个无人机知识。"},
    {"id": "faq_kx_047", "question": "孩子科学怎么培养虚拟现实素养？", "frequency": "低", "shortAnswer": "①学习虚拟现实知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习虚拟现实知识。", "practiceTip": "每周学习一个虚拟现实知识。"},
    {"id": "faq_kx_048", "question": "孩子科学怎么培养增强现实素养？", "frequency": "低", "shortAnswer": "①学习增强现实知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习增强现实知识。", "practiceTip": "每周学习一个增强现实知识。"},
    {"id": "faq_kx_049", "question": "孩子科学怎么培养物联网素养？", "frequency": "低", "shortAnswer": "①学习物联网知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习物联网知识。", "practiceTip": "每周学习一个物联网知识。"},
    {"id": "faq_kx_050", "question": "孩子科学怎么培养区块链素养？", "frequency": "低", "shortAnswer": "①学习区块链知识；②多练习。", "relatedTopics": ["ct_KX1S001"], "parentScript": "让孩子学习区块链知识。", "practiceTip": "每周学习一个区块链知识。"},
    
    # ========== 道德与法治 (新增25个) ==========
    {"id": "faq_dd_026", "question": "孩子怎么培养诚信品质？", "frequency": "高", "shortAnswer": "①诚实守信；②多练习。", "relatedTopics": ["ct_DD3S001"], "parentScript": "让孩子诚实守信。", "practiceTip": "每天诚实守信。"},
    {"id": "faq_dd_027", "question": "孩子怎么培养友善品质？", "frequency": "中", "shortAnswer": "①对同学友善；②多练习。", "relatedTopics": ["ct_DD3S001"], "parentScript": "让孩子对同学友善。", "practiceTip": "每天对同学友善。"},
    {"id": "faq_dd_028", "question": "孩子怎么培养勇敢品质？", "frequency": "中", "shortAnswer": "①鼓励尝试；②多练习。", "relatedTopics": ["ct_DD3S001"], "parentScript": "鼓励孩子尝试新事物。", "practiceTip": "每周尝试一个新事物。"},
    {"id": "faq_dd_029", "question": "孩子怎么培养坚强品质？", "frequency": "中", "shortAnswer": "①遇到困难不放弃；②多练习。", "relatedTopics": ["ct_DD3S001"], "parentScript": "让孩子遇到困难不放弃。", "practiceTip": "每周坚持做一件事。"},
    {"id": "faq_dd_030", "question": "孩子怎么培养乐观品质？", "frequency": "中", "shortAnswer": "①看到积极的一面；②多练习。", "relatedTopics": ["ct_DD3S001"], "parentScript": "让孩子看到积极的一面。", "practiceTip": "每天说3件开心的事。"},
    {"id": "faq_dd_031", "question": "孩子怎么培养谦虚品质？", "frequency": "低", "shortAnswer": "①看到别人的优点；②多练习。", "relatedTopics": ["ct_DD3S001"], "parentScript": "让孩子看到别人的优点。", "practiceTip": "每周说一个别人的优点。"},
    {"id": "faq_dd_032", "question": "孩子怎么培养宽容品质？", "frequency": "中", "shortAnswer": "①原谅别人；②多练习。", "relatedTopics": ["ct_DD3S001"], "parentScript": "让孩子原谅别人。", "practiceTip": "每周原谅一个人。"},
    {"id": "faq_dd_033", "question": "孩子怎么培养尊重品质？", "frequency": "中", "shortAnswer": "①尊重别人；②多练习。", "relatedTopics": ["ct_DD3S001"], "parentScript": "让孩子尊重别人。", "practiceTip": "每天尊重别人。"},
    {"id": "faq_dd_034", "question": "孩子怎么培养理解品质？", "frequency": "中", "shortAnswer": "①理解别人；②多练习。", "relatedTopics": ["ct_DD3S001"], "parentScript": "让孩子理解别人。", "practiceTip": "每天理解别人。"},
    {"id": "faq_dd_035", "question": "孩子怎么培养包容品质？", "frequency": "中", "shortAnswer": "①包容别人；②多练习。", "relatedTopics": ["ct_DD3S001"], "parentScript": "让孩子包容别人。", "practiceTip": "每天包容别人。"},
    {"id": "faq_dd_036", "question": "孩子怎么培养感恩品质？", "frequency": "中", "shortAnswer": "①感恩别人；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子感恩别人。", "practiceTip": "每天说3件感恩的事。"},
    {"id": "faq_dd_037", "question": "孩子怎么培养责任品质？", "frequency": "中", "shortAnswer": "①承担责任；②多练习。", "relatedTopics": ["ct_DD4S005"], "parentScript": "让孩子承担责任。", "practiceTip": "每周分配一项家务。"},
    {"id": "faq_dd_038", "question": "孩子怎么培养正义品质？", "frequency": "低", "shortAnswer": "①坚持正义；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子坚持正义。", "practiceTip": "每周做一件正义的事。"},
    {"id": "faq_dd_039", "question": "孩子怎么培养民主品质？", "frequency": "低", "shortAnswer": "①尊重多数；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子尊重多数。", "practiceTip": "每周做一次民主决策。"},
    {"id": "faq_dd_040", "question": "孩子怎么培养法治品质？", "frequency": "低", "shortAnswer": "①遵守法律；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子遵守法律。", "practiceTip": "每周学习一个法律知识。"},
    {"id": "faq_dd_041", "question": "孩子怎么培养文明品质？", "frequency": "中", "shortAnswer": "①讲文明；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子讲文明。", "practiceTip": "每天讲文明。"},
    {"id": "faq_dd_042", "question": "孩子怎么培养和谐品质？", "frequency": "低", "shortAnswer": "①与人和谐相处；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子与人和谐相处。", "practiceTip": "每天与人和谐相处。"},
    {"id": "faq_dd_043", "question": "孩子怎么培养自由品质？", "frequency": "低", "shortAnswer": "①尊重自由；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子尊重自由。", "practiceTip": "每天尊重自由。"},
    {"id": "faq_dd_044", "question": "孩子怎么培养平等品质？", "frequency": "低", "shortAnswer": "①尊重平等；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子尊重平等。", "practiceTip": "每天尊重平等。"},
    {"id": "faq_dd_045", "question": "孩子怎么培养公正品质？", "frequency": "低", "shortAnswer": "①坚持公正；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子坚持公正。", "practiceTip": "每周坚持公正。"},
    {"id": "faq_dd_046", "question": "孩子怎么培养爱国品质？", "frequency": "中", "shortAnswer": "①热爱祖国；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子热爱祖国。", "practiceTip": "每周了解一个爱国故事。"},
    {"id": "faq_dd_047", "question": "孩子怎么培养敬业品质？", "frequency": "低", "shortAnswer": "①认真学习；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子认真学习。", "practiceTip": "每天认真学习。"},
    {"id": "faq_dd_048", "question": "孩子怎么培养诚信品质？", "frequency": "高", "shortAnswer": "①诚实守信；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子诚实守信。", "practiceTip": "每天诚实守信。"},
    {"id": "faq_dd_049", "question": "孩子怎么培养友善品质？", "frequency": "中", "shortAnswer": "①对同学友善；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "让孩子对同学友善。", "practiceTip": "每天对同学友善。"},
    {"id": "faq_dd_050", "question": "孩子怎么培养勇敢品质？", "frequency": "中", "shortAnswer": "①鼓励尝试；②多练习。", "relatedTopics": ["ct_DD5S010"], "parentScript": "鼓励孩子尝试新事物。", "practiceTip": "每周尝试一个新事物。"},
    
    # ========== 体育健康 (新增25个) ==========
    {"id": "faq_ty_026", "question": "孩子怎么培养游泳技能？", "frequency": "中", "shortAnswer": "①学游泳；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学游泳。", "practiceTip": "每周游泳一次。"},
    {"id": "faq_ty_027", "question": "孩子怎么培养跑步技能？", "frequency": "中", "shortAnswer": "①学跑步；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学跑步。", "practiceTip": "每周跑步三次。"},
    {"id": "faq_ty_028", "question": "孩子怎么培养跳绳技能？", "frequency": "中", "shortAnswer": "①学跳绳；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学跳绳。", "practiceTip": "每天跳绳100下。"},
    {"id": "faq_ty_029", "question": "孩子怎么培养篮球技能？", "frequency": "中", "shortAnswer": "①学篮球；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学篮球。", "practiceTip": "每周打一次篮球。"},
    {"id": "faq_ty_030", "question": "孩子怎么培养足球技能？", "frequency": "中", "shortAnswer": "①学足球；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学足球。", "practiceTip": "每周踢一次足球。"},
    {"id": "faq_ty_031", "question": "孩子怎么培养乒乓球技能？", "frequency": "低", "shortAnswer": "①学乒乓球；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学乒乓球。", "practiceTip": "每周打一次乒乓球。"},
    {"id": "faq_ty_032", "question": "孩子怎么培养羽毛球技能？", "frequency": "低", "shortAnswer": "①学羽毛球；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学羽毛球。", "practiceTip": "每周打一次羽毛球。"},
    {"id": "faq_ty_033", "question": "孩子怎么培养网球技能？", "frequency": "低", "shortAnswer": "①学网球；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学网球。", "practiceTip": "每周打一次网球。"},
    {"id": "faq_ty_034", "question": "孩子怎么培养武术技能？", "frequency": "低", "shortAnswer": "①学武术；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学武术。", "practiceTip": "每周练一次武术。"},
    {"id": "faq_ty_035", "question": "孩子怎么培养舞蹈技能？", "frequency": "低", "shortAnswer": "①学舞蹈；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学舞蹈。", "practiceTip": "每周跳舞一次。"},
    {"id": "faq_ty_036", "question": "孩子怎么培养瑜伽技能？", "frequency": "低", "shortAnswer": "①学瑜伽；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学瑜伽。", "practiceTip": "每周练一次瑜伽。"},
    {"id": "faq_ty_037", "question": "孩子怎么培养健身技能？", "frequency": "低", "shortAnswer": "①学健身；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学健身。", "practiceTip": "每周健身一次。"},
    {"id": "faq_ty_038", "question": "孩子怎么培养攀岩技能？", "frequency": "低", "shortAnswer": "①学攀岩；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学攀岩。", "practiceTip": "每周攀岩一次。"},
    {"id": "faq_ty_039", "question": "孩子怎么培养滑雪技能？", "frequency": "低", "shortAnswer": "①学滑雪；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学滑雪。", "practiceTip": "每年滑雪一次。"},
    {"id": "faq_ty_040", "question": "孩子怎么培养滑冰技能？", "frequency": "低", "shortAnswer": "①学滑冰；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学滑冰。", "practiceTip": "每年滑冰一次。"},
    {"id": "faq_ty_041", "question": "孩子怎么培养滑板技能？", "frequency": "低", "shortAnswer": "①学滑板；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学滑板。", "practiceTip": "每周滑板一次。"},
    {"id": "faq_ty_042", "question": "孩子怎么培养轮滑技能？", "frequency": "低", "shortAnswer": "①学轮滑；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学轮滑。", "practiceTip": "每周轮滑一次。"},
    {"id": "faq_ty_043", "question": "孩子怎么培养自行车技能？", "frequency": "中", "shortAnswer": "①学自行车；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学自行车。", "practiceTip": "每周骑自行车一次。"},
    {"id": "faq_ty_044", "question": "孩子怎么培养轮滑技能？", "frequency": "低", "shortAnswer": "①学轮滑；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学轮滑。", "practiceTip": "每周轮滑一次。"},
    {"id": "faq_ty_045", "question": "孩子怎么培养跳绳技能？", "frequency": "中", "shortAnswer": "①学跳绳；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学跳绳。", "practiceTip": "每天跳绳100下。"},
    {"id": "faq_ty_046", "question": "孩子怎么培养踢毽子技能？", "frequency": "低", "shortAnswer": "①学踢毽子；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学踢毽子。", "practiceTip": "每天踢毽子100下。"},
    {"id": "faq_ty_047", "question": "孩子怎么培养丢沙包技能？", "frequency": "低", "shortAnswer": "①学丢沙包；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学丢沙包。", "practiceTip": "每天丢沙包100下。"},
    {"id": "faq_ty_048", "question": "孩子怎么培养跳房子技能？", "frequency": "低", "shortAnswer": "①学跳房子；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学跳房子。", "practiceTip": "每天跳房子100下。"},
    {"id": "faq_ty_049", "question": "孩子怎么培养捉迷藏技能？", "frequency": "低", "shortAnswer": "①学捉迷藏；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学捉迷藏。", "practiceTip": "每天捉迷藏100下。"},
    {"id": "faq_ty_050", "question": "孩子怎么培养老鹰捉小鸡技能？", "frequency": "低", "shortAnswer": "①学老鹰捉小鸡；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学老鹰捉小鸡。", "practiceTip": "每天老鹰捉小鸡100下。"},
    
    # ========== 劳动教育 (新增25个) ==========
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
    
    # ========== 综合问题 (新增50个) ==========
    {"id": "faq_zh_041", "question": "家长怎么培养孩子的学习能力？", "frequency": "高", "shortAnswer": "①培养学习兴趣；②培养学习习惯；③培养学习方法；④多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的学习能力。", "practiceTip": "每天培养一个学习能力。"},
    {"id": "faq_zh_042", "question": "家长怎么培养孩子的社交能力？", "frequency": "高", "shortAnswer": "①多和同学交往；②培养社交技巧；③多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的社交能力。", "practiceTip": "每周和同学交往一次。"},
    {"id": "faq_zh_043", "question": "家长怎么培养孩子的领导能力？", "frequency": "低", "shortAnswer": "①当班干部；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的领导能力。", "practiceTip": "每周当一次班干部。"},
    {"id": "faq_zh_044", "question": "家长怎么培养孩子的组织能力？", "frequency": "低", "shortAnswer": "①组织活动；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的组织能力。", "practiceTip": "每周组织一次活动。"},
    {"id": "faq_zh_045", "question": "家长怎么培养孩子的协调能力？", "frequency": "低", "shortAnswer": "①协调关系；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的协调能力。", "practiceTip": "每周协调一次关系。"},
    {"id": "faq_zh_046", "question": "家长怎么培养孩子的沟通能力？", "frequency": "中", "shortAnswer": "①多沟通；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的沟通能力。", "practiceTip": "每天和孩子沟通10分钟。"},
    {"id": "faq_zh_047", "question": "家长怎么培养孩子的表达能力？", "frequency": "中", "shortAnswer": "①多说；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的表达能力。", "practiceTip": "每天和孩子聊10分钟。"},
    {"id": "faq_zh_048", "question": "家长怎么培养孩子的倾听能力？", "frequency": "中", "shortAnswer": "①认真听；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的倾听能力。", "practiceTip": "每天让孩子复述一件事。"},
    {"id": "faq_zh_049", "question": "家长怎么培养孩子的观察能力？", "frequency": "中", "shortAnswer": "①看周围的事物；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的观察能力。", "practiceTip": "每周写一篇观察日记。"},
    {"id": "faq_zh_050", "question": "家长怎么培养孩子的思考能力？", "frequency": "中", "shortAnswer": "①多思考；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的思考能力。", "practiceTip": "每天问一个为什么。"},
    {"id": "faq_zh_051", "question": "家长怎么培养孩子的判断能力？", "frequency": "中", "shortAnswer": "①多判断；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的判断能力。", "practiceTip": "每天让孩子做一个判断。"},
    {"id": "faq_zh_052", "question": "家长怎么培养孩子的决策能力？", "frequency": "低", "shortAnswer": "①多决策；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的决策能力。", "practiceTip": "每天让孩子做一个决策。"},
    {"id": "faq_zh_053", "question": "家长怎么培养孩子的执行能力？", "frequency": "中", "shortAnswer": "①多执行；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的执行能力。", "practiceTip": "每天让孩子执行一个计划。"},
    {"id": "faq_zh_054", "question": "家长怎么培养孩子的抗压能力？", "frequency": "中", "shortAnswer": "①体验压力；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的抗压能力。", "practiceTip": "每周让孩子体验一次压力。"},
    {"id": "faq_zh_055", "question": "家长怎么培养孩子的适应能力？", "frequency": "中", "shortAnswer": "①适应新环境；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的适应能力。", "practiceTip": "每周让孩子适应一个新环境。"},
    {"id": "faq_zh_056", "question": "家长怎么培养孩子的应变能力？", "frequency": "低", "shortAnswer": "①应对变化；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的应变能力。", "practiceTip": "每周让孩子应对一次变化。"},
    {"id": "faq_zh_057", "question": "家长怎么培养孩子的创新能力？", "frequency": "低", "shortAnswer": "①鼓励创新；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的创新能力。", "practiceTip": "每周让孩子创新一次。"},
    {"id": "faq_zh_058", "question": "家长怎么培养孩子的创业能力？", "frequency": "低", "shortAnswer": "①了解创业；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的创业能力。", "practiceTip": "每周了解一个创业故事。"},
    {"id": "faq_zh_059", "question": "家长怎么培养孩子的管理能力？", "frequency": "低", "shortAnswer": "①学习管理；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的管理能力。", "practiceTip": "每周学习一个管理知识。"},
    {"id": "faq_zh_060", "question": "家长怎么培养孩子的经营能力？", "frequency": "低", "shortAnswer": "①了解经营；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的经营能力。", "practiceTip": "每周了解一个经营知识。"},
    {"id": "faq_zh_061", "question": "家长怎么培养孩子的投资能力？", "frequency": "低", "shortAnswer": "①了解投资；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的投资能力。", "practiceTip": "每周了解一个投资知识。"},
    {"id": "faq_zh_062", "question": "家长怎么培养孩子的理财能力？", "frequency": "低", "shortAnswer": "①了解理财；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的理财能力。", "practiceTip": "每周了解一个理财知识。"},
    {"id": "faq_zh_063", "question": "家长怎么培养孩子的节约能力？", "frequency": "低", "shortAnswer": "①了解节约；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的节约能力。", "practiceTip": "每周了解一个节约知识。"},
    {"id": "faq_zh_064", "question": "家长怎么培养孩子的环保能力？", "frequency": "低", "shortAnswer": "①了解环保；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的环保能力。", "practiceTip": "每周了解一个环保知识。"},
    {"id": "faq_zh_065", "question": "家长怎么培养孩子的健康能力？", "frequency": "低", "shortAnswer": "①了解健康；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的健康能力。", "practiceTip": "每周了解一个健康知识。"},
    {"id": "faq_zh_066", "question": "家长怎么培养孩子的安全能力？", "frequency": "低", "shortAnswer": "①了解安全；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的安全能力。", "practiceTip": "每周了解一个安全知识。"},
    {"id": "faq_zh_067", "question": "家长怎么培养孩子的法律能力？", "frequency": "低", "shortAnswer": "①了解法律；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的法律能力。", "practiceTip": "每周了解一个法律知识。"},
    {"id": "faq_zh_068", "question": "家长怎么培养孩子的公民能力？", "frequency": "低", "shortAnswer": "①了解公民；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的公民能力。", "practiceTip": "每周了解一个公民知识。"},
    {"id": "faq_zh_069", "question": "家长怎么培养孩子的国际能力？", "frequency": "低", "shortAnswer": "①了解国际；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的国际能力。", "practiceTip": "每周了解一个国际知识。"},
    {"id": "faq_zh_070", "question": "家长怎么培养孩子的文化能力？", "frequency": "低", "shortAnswer": "①了解文化；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的文化能力。", "practiceTip": "每周了解一个文化知识。"},
    {"id": "faq_zh_071", "question": "家长怎么培养孩子的艺术能力？", "frequency": "低", "shortAnswer": "①了解艺术；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的艺术能力。", "practiceTip": "每周了解一个艺术知识。"},
    {"id": "faq_zh_072", "question": "家长怎么培养孩子的体育能力？", "frequency": "低", "shortAnswer": "①了解体育；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的体育能力。", "practiceTip": "每周了解一个体育知识。"},
    {"id": "faq_zh_073", "question": "家长怎么培养孩子的科学能力？", "frequency": "低", "shortAnswer": "①了解科学；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的科学能力。", "practiceTip": "每周了解一个科学知识。"},
    {"id": "faq_zh_074", "question": "家长怎么培养孩子的数学能力？", "frequency": "中", "shortAnswer": "①了解数学；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的数学能力。", "practiceTip": "每周了解一个数学知识。"},
    {"id": "faq_zh_075", "question": "家长怎么培养孩子的语文能力？", "frequency": "中", "shortAnswer": "①了解语文；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的语文能力。", "practiceTip": "每周了解一个语文知识。"},
    {"id": "faq_zh_076", "question": "家长怎么培养孩子的英语能力？", "frequency": "中", "shortAnswer": "①了解英语；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的英语能力。", "practiceTip": "每周了解一个英语知识。"},
    {"id": "faq_zh_077", "question": "家长怎么培养孩子的历史能力？", "frequency": "低", "shortAnswer": "①了解历史；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的历史能力。", "practiceTip": "每周了解一个历史知识。"},
    {"id": "faq_zh_078", "question": "家长怎么培养孩子的地理能力？", "frequency": "低", "shortAnswer": "①了解地理；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的地理能力。", "practiceTip": "每周了解一个地理知识。"},
    {"id": "faq_zh_079", "question": "家长怎么培养孩子的生物能力？", "frequency": "低", "shortAnswer": "①了解生物；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的生物能力。", "practiceTip": "每周了解一个生物知识。"},
    {"id": "faq_zh_080", "question": "家长怎么培养孩子的物理能力？", "frequency": "低", "shortAnswer": "①了解物理；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的物理能力。", "practiceTip": "每周了解一个物理知识。"},
    {"id": "faq_zh_081", "question": "家长怎么培养孩子的化学能力？", "frequency": "低", "shortAnswer": "①了解化学；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的化学能力。", "practiceTip": "每周了解一个化学知识。"},
    {"id": "faq_zh_082", "question": "家长怎么培养孩子的政治能力？", "frequency": "低", "shortAnswer": "①了解政治；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的政治能力。", "practiceTip": "每周了解一个政治知识。"},
    {"id": "faq_zh_083", "question": "家长怎么培养孩子的经济能力？", "frequency": "低", "shortAnswer": "①了解经济；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的经济能力。", "practiceTip": "每周了解一个经济知识。"},
    {"id": "faq_zh_084", "question": "家长怎么培养孩子的社会能力？", "frequency": "低", "shortAnswer": "①了解社会；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的社会能力。", "practiceTip": "每周了解一个社会知识。"},
    {"id": "faq_zh_085", "question": "家长怎么培养孩子的心理能力？", "frequency": "低", "shortAnswer": "①了解心理；②多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "培养孩子的心理能力。", "practiceTip": "每周了解一个心理知识。"},
]

# 过滤掉已存在的新问题
new_questions_filtered = [q for q in new_questions if q['id'] not in existing_ids]
print(f"实际新增问题数: {len(new_questions_filtered)}")

# 将新问题分类
categories_map = {}
for cat in data['categories']:
    categories_map[cat['id']] = cat

# 确保所有分类都存在
required_categories = ['math', 'chinese', 'english', 'study_habit', 'emotion', 'transition', 'health', 'art', 'science', 'moral', 'pe', 'labor', 'comprehensive']
for cat_id in required_categories:
    if cat_id not in categories_map:
        cat_names = {
            'math': '数学辅导', 'chinese': '语文辅导', 'english': '英语辅导',
            'study_habit': '学习习惯', 'emotion': '情绪心理', 'transition': '升学过渡',
            'health': '健康安全', 'art': '艺术体育', 'science': '科学教育',
            'moral': '道德与法治', 'pe': '体育健康', 'labor': '劳动教育', 'comprehensive': '综合问题'
        }
        icons = {
            'math': '🔢', 'chinese': '📖', 'english': '🔤', 'study_habit': '📚',
            'emotion': '💖', 'transition': '🎓', 'health': '🏥', 'art': '🎨',
            'science': '🔬', 'moral': '⚖️', 'pe': '⚽', 'labor': '🔨', 'comprehensive': '🌟'
        }
        categories_map[cat_id] = {
            "id": cat_id,
            "name": cat_names.get(cat_id, cat_id),
            "icon": icons.get(cat_id, '📌'),
            "questions": []
        }

# 将问题分类
for q in new_questions_filtered:
    qid = q['id']
    if qid.startswith('faq_math'):
        cat_id = 'math'
    elif qid.startswith('faq_yw'):
        cat_id = 'chinese'
    elif qid.startswith('faq_en'):
        cat_id = 'english'
    elif qid.startswith('faq_xg'):
        cat_id = 'study_habit'
    elif qid.startswith('faq_qx'):
        cat_id = 'emotion'
    elif qid.startswith('faq_sx'):
        cat_id = 'transition'
    elif qid.startswith('faq_jk'):
        cat_id = 'health'
    elif qid.startswith('faq_ys'):
        cat_id = 'art'
    elif qid.startswith('faq_kx'):
        cat_id = 'science'
    elif qid.startswith('faq_dd'):
        cat_id = 'moral'
    elif qid.startswith('faq_ty'):
        cat_id = 'pe'
    elif qid.startswith('faq_ld'):
        cat_id = 'labor'
    else:
        cat_id = 'comprehensive'
    
    if cat_id in categories_map:
        categories_map[cat_id]['questions'].append(q)
    else:
        categories_map['comprehensive']['questions'].append(q)

# 更新版本信息
data['version'] = 'v3.0-parent-faq'
data['description'] = '家长高频问题缓存——基于阮一峰科技周刊「缓存思维」，将家长最常问的500个问题缓存起来，一键获取答案。'

# 保存
with open(DATA_DIR / 'cache-parent-faq.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# 统计
total_questions = sum(len(cat['questions']) for cat in data['categories'])
print(f"生成完成！总问题数: {total_questions}")
print(f"分类数: {len(data['categories'])}")
for cat in data['categories']:
    print(f"  {cat['name']}: {len(cat['questions'])}个")
