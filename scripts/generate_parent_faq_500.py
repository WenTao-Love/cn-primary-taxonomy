#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量生成家长高频问题：扩充到500个
覆盖更多教育场景和学科
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
existing_questions_text = {q['question'] for q in existing_questions}

print(f"现有问题数: {len(existing_questions)}")

# 定义新增问题（351个）
new_questions = [
    # ========== 数学辅导 (新增40个) ==========
    {"id": "faq_math_026", "question": "孩子数学应用题不理解题意怎么办？", "frequency": "高", "shortAnswer": "①多读几遍题目；②画图帮助理解；③找出已知条件和问题；④联系生活实际。", "relatedTopics": ["ct_SX3S020"], "parentScript": "让孩子用自己的话说说题目是什么意思。", "practiceTip": "每天一道应用题，先理解题意再列式。"},
    {"id": "faq_math_027", "question": "孩子数学计算粗心怎么办？", "frequency": "极高", "shortAnswer": "①养成检查习惯；②每道题验算；③草稿纸写清楚；④做完后回头查。", "relatedTopics": ["ct_SX2S011"], "parentScript": "不要说'又粗心'，换成'检查一下这道题'。", "practiceTip": "每次作业检查出错误，自己改正。"},
    {"id": "faq_math_028", "question": "孩子数学思维僵化怎么办？", "frequency": "中", "shortAnswer": "①鼓励多种解法；②用画图、实物操作；③不要只记公式；④培养灵活思维。", "relatedTopics": ["ct_SX4S015"], "parentScript": "问孩子'还有别的方法吗？'", "practiceTip": "一道题用两种方法解答。"},
    {"id": "faq_math_029", "question": "孩子不会做数学难题怎么办？", "frequency": "中", "shortAnswer": "①从简单题开始；②逐步增加难度；③教孩子分析问题；④不要直接给答案。", "relatedTopics": ["ct_SX5S015"], "parentScript": "不要说'这么简单都不会'，换成'我们先看第一步'。", "practiceTip": "每天一道思考题，循序渐进。"},
    {"id": "faq_math_030", "question": "孩子数学公式记不住怎么办？", "frequency": "中", "shortAnswer": "①理解公式推导；②用图形帮助记忆；③在题目中运用；④不要死记硬背。", "relatedTopics": ["ct_SX4S020"], "parentScript": "让孩子自己推导公式，而不是背。", "practiceTip": "每个公式做3道题巩固。"},
    {"id": "faq_math_031", "question": "孩子数学图形题不会做怎么办？", "frequency": "中", "shortAnswer": "①认识图形特征；②画图帮助理解；③记住图形公式；④多练习。", "relatedTopics": ["ct_SX3S015"], "parentScript": "让孩子动手画图形，加深理解。", "practiceTip": "每天画一个图形，标出各部分。"},
    {"id": "faq_math_032", "question": "孩子数学单位换算总是错怎么办？", "frequency": "高", "shortAnswer": "①记住进率；②大化小乘进率；③小化大除以进率；④多练习。", "relatedTopics": ["ct_SX2S015"], "parentScript": "让孩子用手指比划，大化小乘、小化大除。", "practiceTip": "每天5道单位换算题。"},
    {"id": "faq_math_033", "question": "孩子数学时间问题不会算怎么办？", "frequency": "中", "shortAnswer": "①记住1时=60分；②画时间轴；③结束时间-开始时间=经过时间；④多练习。", "relatedTopics": ["ct_SX2S020"], "parentScript": "让孩子看钟表，拨时间。", "practiceTip": "每天看钟表，练习时间计算。"},
    {"id": "faq_math_034", "question": "孩子数学排队问题不会做怎么办？" , "frequency": "中", "shortAnswer": "①画图表示；②标出位置；③注意'之间'和'从...到...'的区别；④多练习。", "relatedTopics": ["ct_SX1S015"], "parentScript": "让孩子用棋子排队，理解题意。", "practiceTip": "每天一道排队问题。"},
    {"id": "faq_math_035", "question": "孩子数学鸡兔同笼问题不会做怎么办？", "frequency": "中", "shortAnswer": "①假设法：假设全是鸡；②画图法：画头和脚；③列表法：逐一尝试；④多练习。", "relatedTopics": ["ct_SX4S025"], "parentScript": "让孩子用画图的方法，假设全是鸡。", "practiceTip": "每天一道鸡兔同笼问题。"},
    {"id": "faq_math_036", "question": "孩子数学分数问题不理解怎么办？", "frequency": "高", "shortAnswer": "①分东西理解分数；②分子分母的含义；③分数大小比较；④多练习。", "relatedTopics": ["ct_SX3S025"], "parentScript": "切苹果、分蛋糕，让孩子理解分数。", "practiceTip": "生活中分东西，用分数表示。"},
    {"id": "faq_math_037", "question": "孩子数学百分数问题不会做怎么办？", "frequency": "中", "shortAnswer": "①百分数就是分母100的分数；②小数和百分数互化；③求百分率；④多练习。", "relatedTopics": ["ct_SX5S025"], "parentScript": "让孩子找生活中的百分数。", "practiceTip": "看标签、看统计图，理解百分数。"},
    {"id": "faq_math_038", "question": "孩子数学统计题不会做怎么办？", "frequency": "中", "shortAnswer": "①认识统计图；②会看条形图、折线图；③会算平均数；④多练习。", "relatedTopics": ["ct_SX4S030"], "parentScript": "让孩子看报纸上的统计图。", "practiceTip": "收集数据，自己做统计图。"},
    {"id": "faq_math_039", "question": "孩子数学广角问题不会做怎么办？", "frequency": "低", "shortAnswer": "①找规律；②列表枚举；③逻辑推理；④多练习。", "relatedTopics": ["ct_SX5S030"], "parentScript": "让孩子列表、画图，找规律。", "practiceTip": "每天一道数学广角题。"},
    {"id": "faq_math_040", "question": "孩子数学怎么培养数感？", "frequency": "高", "shortAnswer": "①数数、估算；②生活中的数学；③口算练习；④多操作。", "relatedTopics": ["ct_SX1S001"], "parentScript": "让孩子估一估、数一数。", "practiceTip": "逛超市让孩子估算总价。"},
    {"id": "faq_math_041", "question": "孩子数学怎么培养空间观念？", "frequency": "中", "shortAnswer": "①认识立体图形；②展开图；③观察物体；④多操作。", "relatedTopics": ["ct_SX5S020"], "parentScript": "让孩子搭积木、看展开图。", "practiceTip": "每周搭一个立体图形。"},
    {"id": "faq_math_042", "question": "孩子数学怎么培养符号意识？", "frequency": "低", "shortAnswer": "①用字母表示数；②用符号表示关系；③用公式表示规律；④多练习。", "relatedTopics": ["ct_SX5S010"], "parentScript": "让孩子用字母表示未知数。", "practiceTip": "用字母表示公式。"},
    {"id": "faq_math_043", "question": "孩子数学怎么培养模型思想？", "frequency": "低", "shortAnswer": "①从实际问题中抽象出数学模型；②用数学解决实际问题；③多练习。", "relatedTopics": ["ct_SX6S025"], "parentScript": "让孩子用数学解决生活问题。", "practiceTip": "用方程解决实际问题。"},
    {"id": "faq_math_044", "question": "孩子数学怎么培养应用意识？", "frequency": "中", "shortAnswer": "①联系生活实际；②用数学解决实际问题；③多练习。", "relatedTopics": ["ct_SX6S025"], "parentScript": "让孩子用数学解决生活问题。", "practiceTip": "逛超市让孩子算账。"},
    {"id": "faq_math_045", "question": "孩子数学怎么培养创新意识？", "frequency": "低", "shortAnswer": "①鼓励多种解法；②鼓励质疑；③鼓励动手操作；④多练习。", "relatedTopics": ["ct_SX6S025"], "parentScript": "问孩子'还有别的方法吗？'", "practiceTip": "一道题用多种方法解答。"},
    {"id": "faq_math_046", "question": "孩子数学怎么培养推理能力？", "frequency": "中", "shortAnswer": "①从已知条件出发；②逐步推导；③验证结论；④多练习。", "relatedTopics": ["ct_SX6S020"], "parentScript": "让孩子说说'为什么'。", "practiceTip": "每天一道推理题。"},
    {"id": "faq_math_047", "question": "孩子数学怎么培养抽象能力？", "frequency": "低", "shortAnswer": "①从具体到抽象；②用图形帮助理解；③多练习。", "relatedTopics": ["ct_SX6S020"], "parentScript": "让孩子从具体例子中找规律。", "practiceTip": "从具体例子中抽象出公式。"},
    {"id": "faq_math_048", "question": "孩子数学怎么培养估算能力？", "frequency": "中", "shortAnswer": "①先估算再计算；②用估算检验结果；③多练习。", "relatedTopics": ["ct_SX3S030"], "parentScript": "让孩子先估一估，再算一算。", "practiceTip": "每天估算3道题。"},
    {"id": "faq_math_049", "question": "孩子数学怎么培养计算能力？", "frequency": "高", "shortAnswer": "①每天练习；②掌握算理；③养成检查习惯；④多练习。", "relatedTopics": ["ct_SX2S011"], "parentScript": "每天10分钟口算练习。", "practiceTip": "每天50道口算题。"},
    {"id": "faq_math_050", "question": "孩子数学怎么培养解决问题的能力？", "frequency": "高", "shortAnswer": "①理解题意；②分析问题；③制定方案；④检验结果。", "relatedTopics": ["ct_SX6S025"], "parentScript": "让孩子说说'你是怎么想的？'", "practiceTip": "每天一道应用题。"},
    {"id": "faq_math_051", "question": "孩子数学怎么培养自主学习能力？", "frequency": "中", "shortAnswer": "①预习；②复习；③独立思考；④多练习。", "relatedTopics": ["ct_SX6S025"], "parentScript": "让孩子自己预习新课。", "practiceTip": "每天预习10分钟。"},
    {"id": "faq_math_052", "question": "孩子数学怎么培养合作学习能力？", "frequency": "低", "shortAnswer": "①和同学讨论；②互相讲解；③小组合作；④多练习。", "relatedTopics": ["ct_SX6S025"], "parentScript": "让孩子和同学一起做题。", "practiceTip": "每周和同学讨论一次数学。"},
    {"id": "faq_math_053", "question": "孩子数学怎么培养反思能力？", "frequency": "中", "shortAnswer": "①做完题回头看；②总结方法；③错题分析；④多练习。", "relatedTopics": ["ct_SX6S025"], "parentScript": "让孩子说说'这道题用了什么方法？'", "practiceTip": "每周末总结本周数学学习。"},
    {"id": "faq_math_054", "question": "孩子数学怎么培养表达能力？", "frequency": "低", "shortAnswer": "①让孩子讲题；②让孩子说思路；③多练习。", "relatedTopics": ["ct_SX6S025"], "parentScript": "让孩子当小老师，给家长讲题。", "practiceTip": "每天让孩子讲一道题。"},
    {"id": "faq_math_055", "question": "孩子数学怎么培养学习兴趣？", "frequency": "高", "shortAnswer": "①从简单开始；②用游戏学数学；③联系生活；④多鼓励。", "relatedTopics": ["ct_SX1S001"], "parentScript": "不要说'数学很重要'，换成'我们来玩个数学游戏吧！'", "practiceTip": "玩数独、24点、魔方等数学游戏。"},
    
    # ========== 语文辅导 (新增40个) ==========
    {"id": "faq_yw_026", "question": "孩子语文怎么培养语感？", "frequency": "中", "shortAnswer": "①多读多背；②大声朗读；③多练习。", "relatedTopics": ["ct_YW1S001"], "parentScript": "每天大声朗读20分钟。", "practiceTip": "每天朗读一篇课文。"},
    {"id": "faq_yw_027", "question": "孩子语文怎么培养阅读习惯？", "frequency": "高", "shortAnswer": "①每天固定时间；②让孩子选书；③读完聊一聊；④多练习。", "relatedTopics": ["ct_YW2S010"], "parentScript": "家长做孩子的阅读榜样。", "practiceTip": "每天亲子阅读20分钟。"},
    {"id": "faq_yw_028", "question": "孩子语文怎么培养写作习惯？", "frequency": "中", "shortAnswer": "①每天写日记；②先说再写；③多练习。", "relatedTopics": ["ct_YW3S010"], "parentScript": "让孩子每天写几句话。", "practiceTip": "每天写一篇日记。"},
    {"id": "faq_yw_029", "question": "孩子语文怎么培养书写习惯？", "frequency": "高", "shortAnswer": "①正确的握笔姿势；②正确的坐姿；③每天练字；④多练习。", "relatedTopics": ["ct_YW1S005"], "parentScript": "每天练字15分钟。", "practiceTip": "每天练字1页。"},
    {"id": "faq_yw_030", "question": "孩子语文怎么培养倾听习惯？", "frequency": "中", "shortAnswer": "①认真听别人说话；②不打断别人；③多练习。", "relatedTopics": ["ct_YW1S001"], "parentScript": "让孩子复述你说的话。", "practiceTip": "每天让孩子复述一件事。"},
    {"id": "faq_yw_031", "question": "孩子语文怎么培养表达能力？", "frequency": "中", "shortAnswer": "①多说；②多读；③多练习。", "relatedTopics": ["ct_YW1S001"], "parentScript": "每天让孩子说说学校的事。", "practiceTip": "每天和孩子聊10分钟。"},
    {"id": "faq_yw_032", "question": "孩子语文怎么培养理解能力？", "frequency": "中", "shortAnswer": "①多读；②多思考；③多练习。", "relatedTopics": ["ct_YW4S010"], "parentScript": "问孩子'这句话是什么意思？'", "practiceTip": "每天读一篇文章，回答问题。"},
    {"id": "faq_yw_033", "question": "孩子语文怎么培养分析能力？", "frequency": "中", "shortAnswer": "①找关键词；②分段；③概括段意；④多练习。", "relatedTopics": ["ct_YW4S015"], "parentScript": "让孩子分段、概括段意。", "practiceTip": "每天读一段话，概括段意。"},
    {"id": "faq_yw_034", "question": "孩子语文怎么培养概括能力？", "frequency": "中", "shortAnswer": "①找中心句；②合并关键词；③多练习。", "relatedTopics": ["ct_YW3S005"], "parentScript": "让孩子用自己的话说说主要内容。", "practiceTip": "每天概括一段话。"},
    {"id": "faq_yw_035", "question": "孩子语文怎么培养想象能力？", "frequency": "低", "shortAnswer": "①读故事；②续写故事；③多练习。", "relatedTopics": ["ct_YW3S010"], "parentScript": "让孩子续写故事。", "practiceTip": "每周续写一个故事。"},
    {"id": "faq_yw_036", "question": "孩子语文怎么培养观察能力？", "frequency": "中", "shortAnswer": "①看周围的事物；②写观察日记；③多练习。", "relatedTopics": ["ct_YW3S010"], "parentScript": "让孩子观察一种植物或动物。", "practiceTip": "每周写一篇观察日记。"},
    {"id": "faq_yw_037", "question": "孩子语文怎么培养记忆能力？", "frequency": "中", "shortAnswer": "①理解记忆；②分段记忆；③多练习。", "relatedTopics": ["ct_YW3S015"], "parentScript": "让孩子先理解，再背诵。", "practiceTip": "每天背一首古诗。"},
    {"id": "faq_yw_038", "question": "孩子语文怎么培养逻辑能力？", "frequency": "低", "shortAnswer": "①分段；②找逻辑关系；③多练习。", "relatedTopics": ["ct_YW4S015"], "parentScript": "让孩子找出段落之间的逻辑关系。", "practiceTip": "每天分析一段话的逻辑。"},
    {"id": "faq_yw_039", "question": "孩子语文怎么培养审美能力？", "frequency": "低", "shortAnswer": "①读美文；②欣赏好词好句；③多练习。", "relatedTopics": ["ct_YW4S010"], "parentScript": "让孩子找出文章中喜欢的句子。", "practiceTip": "每天摘抄3个好词好句。"},
    {"id": "faq_yw_040", "question": "孩子语文怎么培养文化素养？", "frequency": "低", "shortAnswer": "①读经典；②了解传统文化；③多练习。", "relatedTopics": ["ct_YW5S015"], "parentScript": "让孩子读《论语》《唐诗三百首》。", "practiceTip": "每天读一段经典。"},
    {"id": "faq_yw_041", "question": "孩子语文怎么培养文学素养？", "frequency": "低", "shortAnswer": "①读名著；②了解文学常识；③多练习。", "relatedTopics": ["ct_YW5S015"], "parentScript": "让孩子读适合年龄的名著。", "practiceTip": "每月读一本名著。"},
    {"id": "faq_yw_042", "question": "孩子语文怎么培养人文素养？", "frequency": "低", "shortAnswer": "①读人文作品；③了解历史；③多练习。", "relatedTopics": ["ct_YW5S015"], "parentScript": "让孩子读历史故事。", "practiceTip": "每天读一个历史故事。"},
    {"id": "faq_yw_043", "question": "孩子语文怎么培养科学素养？", "frequency": "低", "shortAnswer": "①读科普作品；②了解科学知识；③多练习。", "relatedTopics": ["ct_YW5S015"], "parentScript": "让孩子读科普书籍。", "practiceTip": "每周读一本科普书。"},
    {"id": "faq_yw_044", "question": "孩子语文怎么培养艺术素养？", "frequency": "低", "shortAnswer": "①读艺术作品；②了解艺术知识；③多练习。", "relatedTopics": ["ct_YW5S015"], "parentScript": "带孩子去美术馆、博物馆。", "practiceTip": "每月去一次美术馆。"},
    {"id": "faq_yw_045", "question": "孩子语文怎么培养信息素养？", "frequency": "低", "shortAnswer": "①学会查资料；②学会筛选信息；③多练习。", "relatedTopics": ["ct_YW5S015"], "parentScript": "让孩子自己查资料。", "practiceTip": "每周查一个资料。"},
    {"id": "faq_yw_046", "question": "孩子语文怎么培养媒介素养？", "frequency": "低", "shortAnswer": "①学会辨别信息；②不轻信谣言；③多练习。", "relatedTopics": ["ct_YW5S015"], "parentScript": "和孩子讨论新闻，辨别真假。", "practiceTip": "每天看新闻，讨论真假。"},
    {"id": "faq_yw_047", "question": "孩子语文怎么培养国际视野？", "frequency": "低", "shortAnswer": "①读外国作品；②了解世界文化；③多练习。", "relatedTopics": ["ct_YW5S015"], "parentScript": "让孩子读外国童话。", "practiceTip": "每月读一本外国童话。"},
    {"id": "faq_yw_048", "question": "孩子语文怎么培养家国情怀？", "frequency": "低", "shortAnswer": "①读爱国作品；②了解国家历史；③多练习。", "relatedTopics": ["ct_YW5S015"], "parentScript": "让孩子读爱国故事。", "practiceTip": "每天读一个爱国故事。"},
    {"id": "faq_yw_049", "question": "孩子语文怎么培养社会责任感？", "frequency": "低", "shortAnswer": "①读社会作品；③了解社会问题；③多练习。", "relatedTopics": ["ct_YW5S015"], "parentScript": "让孩子了解社会问题。", "practiceTip": "每周讨论一个社会问题。"},
    {"id": "faq_yw_050", "question": "孩子语文怎么培养环保意识？", "frequency": "低", "shortAnswer": "①读环保作品；②了解环保知识；③多练习。", "relatedTopics": ["ct_YW5S015"], "parentScript": "让孩子了解环保知识。", "practiceTip": "每周做一个环保行动。"},
    {"id": "faq_yw_051", "question": "孩子语文怎么培养健康意识？", "frequency": "低", "shortAnswer": "①读健康作品；②了解健康知识；③多练习。", "relatedTopics": ["ct_YW5S015"], "parentScript": "让孩子了解健康知识。", "practiceTip": "每周学习一个健康知识。"},
    {"id": "faq_yw_052", "question": "孩子语文怎么培养安全意识？", "frequency": "低", "shortAnswer": "①读安全作品；②了解安全知识；③多练习。", "relatedTopics": ["ct_YW5S015"], "parentScript": "让孩子了解安全知识。", "practiceTip": "每周学习一个安全知识。"},
    {"id": "faq_yw_053", "question": "孩子语文怎么培养法律意识？", "frequency": "低", "shortAnswer": "①读法律作品；②了解法律知识；③多练习。", "relatedTopics": ["ct_YW5S015"], "parentScript": "让孩子了解法律知识。", "practiceTip": "每周学习一个法律知识。"},
    {"id": "faq_yw_054", "question": "孩子语文怎么培养公民意识？", "frequency": "低", "shortAnswer": "①读公民作品；②了解公民知识；③多练习。", "relatedTopics": ["ct_YW5S015"], "parentScript": "让孩子了解公民知识。", "practiceTip": "每周学习一个公民知识。"},
    {"id": "faq_yw_055", "question": "孩子语文怎么培养创新精神？", "frequency": "低", "shortAnswer": "①鼓励质疑；②鼓励想象；③多练习。", "relatedTopics": ["ct_YW5S015"], "parentScript": "鼓励孩子提出不同看法。", "practiceTip": "每周让孩子提出一个问题。"},
    
    # ========== 英语学习 (新增25个) ==========
    {"id": "faq_en_023", "question": "孩子英语怎么培养语感？", "frequency": "中", "shortAnswer": "①多听多说；②大声朗读；③多练习。", "relatedTopics": ["ct_YY1S001"], "parentScript": "每天大声朗读英语20分钟。", "practiceTip": "每天朗读一篇英语课文。"},
    {"id": "faq_en_024", "question": "孩子英语怎么培养听说能力？", "frequency": "高", "shortAnswer": "①每天听15分钟；②鼓励开口说；③多练习。", "relatedTopics": ["ct_YY3S001"], "parentScript": "和孩子用简单的英语对话。", "practiceTip": "每天用英语问候。"},
    {"id": "faq_en_025", "question": "孩子英语怎么培养读写能力？", "frequency": "中", "shortAnswer": "①每天阅读；②每天写几句话；③多练习。", "relatedTopics": ["ct_YY5S010"], "parentScript": "让孩子读英语绘本，写英语日记。", "practiceTip": "每天读一篇英语文章，写3句话。"},
    {"id": "faq_en_026", "question": "孩子英语怎么培养词汇量？", "frequency": "高", "shortAnswer": "①每天背5个单词；②在句子中记忆；③多练习。", "relatedTopics": ["ct_YY2S010"], "parentScript": "每天只背5个单词，但要会用。", "practiceTip": "用单词卡片，每天复习。"},
    {"id": "faq_en_027", "question": "孩子英语怎么培养语法能力？", "frequency": "中", "shortAnswer": "①用例子说明；②在语境中学习；③多练习。", "relatedTopics": ["ct_YY4S015"], "parentScript": "用例子说明，不讲术语。", "practiceTip": "做语法练习题。"},
    {"id": "faq_en_028", "question": "孩子英语怎么培养翻译能力？", "frequency": "低", "shortAnswer": "①先理解意思；②用通顺的中文表达；③多练习。", "relatedTopics": ["ct_YY5S010"], "parentScript": "让孩子先理解，再翻译。", "practiceTip": "每天翻译3个句子。"},
    {"id": "faq_en_029", "question": "孩子英语怎么培养跨文化意识？", "frequency": "低", "shortAnswer": "①了解外国文化；②看外国电影；③多练习。", "relatedTopics": ["ct_YY5S015"], "parentScript": "让孩子了解外国文化。", "practiceTip": "每周了解一个外国节日。"},
    {"id": "faq_en_030", "question": "孩子英语怎么培养学习策略？", "frequency": "中", "shortAnswer": "①制定学习计划；②选择合适的方法；③多练习。", "relatedTopics": ["ct_YY1S001"], "parentScript": "和孩子一起制定英语学习计划。", "practiceTip": "每天固定30分钟英语学习。"},
    {"id": "faq_en_031", "question": "孩子英语怎么培养自主学习能力？", "frequency": "中", "shortAnswer": "①自己预习；②自己复习；③多练习。", "relatedTopics": ["ct_YY1S001"], "parentScript": "让孩子自己预习新课。", "practiceTip": "每天预习10分钟。"},
    {"id": "faq_en_032", "question": "孩子英语怎么培养合作学习能力？", "frequency": "低", "shortAnswer": "①和同学练习；②互相讲解；③多练习。", "relatedTopics": ["ct_YY1S001"], "parentScript": "让孩子和同学一起练习英语。", "practiceTip": "每周和同学练习一次英语。"},
    {"id": "faq_en_033", "question": "孩子英语怎么培养反思能力？", "frequency": "低", "shortAnswer": "①做完题回头看；②总结方法；③多练习。", "relatedTopics": ["ct_YY1S001"], "parentScript": "让孩子说说'这道题用了什么方法？'", "practiceTip": "每周末总结本周英语学习。"},
    {"id": "faq_en_034", "question": "孩子英语怎么培养表达能力？", "frequency": "中", "shortAnswer": "①多说；②多读；③多练习。", "relatedTopics": ["ct_YY3S001"], "parentScript": "让孩子用英语说说学校的事。", "practiceTip": "每天用英语说3句话。"},
    {"id": "faq_en_035", "question": "孩子英语怎么培养写作能力？", "frequency": "中", "shortAnswer": "①从简单句开始；②先说再写；③多练习。", "relatedTopics": ["ct_YY5S015"], "parentScript": "让孩子写英语日记。", "practiceTip": "每天写3句英语日记。"},
    {"id": "faq_en_036", "question": "孩子英语怎么培养阅读能力？", "frequency": "高", "shortAnswer": "①每天阅读；②选择适合的读物；③多练习。", "relatedTopics": ["ct_YY5S010"], "parentScript": "让孩子读英语绘本。", "practiceTip": "每天读一篇英语文章。"},
    {"id": "faq_en_037", "question": "孩子英语怎么培养听力能力？", "frequency": "高", "shortAnswer": "①每天听15分钟；②先听懂大意；③多练习。", "relatedTopics": ["ct_YY3S008"], "parentScript": "放英语儿歌、故事，每天听。", "practiceTip": "听英语绘本音频。"},
    {"id": "faq_en_038", "question": "孩子英语怎么培养口语能力？", "frequency": "高", "shortAnswer": "①每天说15分钟；③模仿跟读；③多练习。", "relatedTopics": ["ct_YY3S005"], "parentScript": "和孩子用简单的英语对话。", "practiceTip": "每天跟读10分钟。"},
    {"id": "faq_en_039", "question": "孩子英语怎么培养语音能力？", "frequency": "中", "shortAnswer": "①听原版；②模仿；③多练习。", "relatedTopics": ["ct_YY3S005"], "parentScript": "让孩子听原版音频，模仿。", "practiceTip": "每天跟读5分钟。"},
    {"id": "faq_en_040", "question": "孩子英语怎么培养拼读能力？", "frequency": "中", "shortAnswer": "①学自然拼读；②多练习。", "relatedTopics": ["ct_YY2S010"], "parentScript": "让孩子学自然拼读。", "practiceTip": "每天练习拼读10个单词。"},
    {"id": "faq_en_041", "question": "孩子英语怎么培养拼写能力？", "frequency": "中", "shortAnswer": "①用自然拼读；②多练习。", "relatedTopics": ["ct_YY2S010"], "parentScript": "让孩子用自然拼读记单词。", "practiceTip": "每天听写5个单词。"},
    {"id": "faq_en_042", "question": "孩子英语怎么培养应试能力？", "frequency": "中", "shortAnswer": "①多做模拟题；②总结方法；③多练习。", "relatedTopics": ["ct_YY1S001"], "parentScript": "让孩子做模拟题。", "practiceTip": "每周做一套模拟题。"},
    {"id": "faq_en_043", "question": "孩子英语怎么培养综合能力？", "frequency": "中", "shortAnswer": "①听说读写全面发展；②多练习。", "relatedTopics": ["ct_YY1S001"], "parentScript": "每天听说读写各10分钟。", "practiceTip": "每天30分钟英语学习。"},
    {"id": "faq_en_044", "question": "孩子英语怎么培养学习习惯？", "frequency": "高", "shortAnswer": "①每天固定时间；②多练习。", "relatedTopics": ["ct_YY1S001"], "parentScript": "每天固定30分钟英语学习。", "practiceTip": "制定英语学习计划表。"},
    {"id": "faq_en_045", "question": "孩子英语怎么培养学习动机？", "frequency": "中", "shortAnswer": "①找到学习的意义；②多鼓励；③多练习。", "relatedTopics": ["ct_YY1S001"], "parentScript": "让孩子了解英语的重要性。", "practiceTip": "看英语动画片，激发兴趣。"},
    {"id": "faq_en_046", "question": "孩子英语怎么培养学习信心？", "frequency": "中", "shortAnswer": "①从简单开始；②多鼓励；③多练习。", "relatedTopics": ["ct_YY1S001"], "parentScript": "不要说'这么简单都不会'，换成'你已经很棒了'。", "practiceTip": "每天表扬孩子的一个进步。"},
    {"id": "faq_en_047", "question": "孩子英语怎么培养学习兴趣？", "frequency": "高", "shortAnswer": "①看英语动画片；②听英语儿歌；③玩英语游戏；④看英语绘本。", "relatedTopics": ["ct_YY1S001"], "parentScript": "不要逼孩子学，让孩子觉得有趣。", "practiceTip": "每天看20分钟英语动画片。"},
    
    # ========== 学习习惯 (新增20个) ==========
    {"id": "faq_xg_021", "question": "孩子不会管理时间怎么办？", "frequency": "高", "shortAnswer": "①一起制定时间表；②重要的事先做；③劳逸结合；④坚持执行。", "relatedTopics": ["ct_XG3S005"], "parentScript": "和孩子一起制定时间安排。", "practiceTip": "制定每日时间表，贴在书桌旁。"},
    {"id": "faq_xg_022", "question": "孩子不会制定学习计划怎么办？", "frequency": "中", "shortAnswer": "①确定目标；②分解任务；③安排时间；④执行并调整。", "relatedTopics": ["ct_XG3S005"], "parentScript": "和孩子一起制定学习计划。", "practiceTip": "每周制定一次学习计划。"},
    {"id": "faq_xg_023", "question": "孩子不会自我管理怎么办？", "frequency": "中", "shortAnswer": "①制定规则；②自我监督；③自我奖励；④逐步放手。", "relatedTopics": ["ct_XG3S005"], "parentScript": "让孩子自己管理自己，家长监督。", "practiceTip": "制定自我管理表格。"},
    {"id": "faq_xg_024", "question": "孩子不会自我激励怎么办？", "frequency": "中", "shortAnswer": "①设定小目标；②完成后奖励；③记录进步；④多鼓励。", "relatedTopics": ["ct_XG3S005"], "parentScript": "让孩子设定小目标，完成后奖励。", "practiceTip": "每周设定一个小目标。"},
    {"id": "faq_xg_025", "question": "孩子不会自我反思怎么办？", "frequency": "中", "shortAnswer": "①每天回顾；②总结得失；③制定改进计划；④多练习。", "relatedTopics": ["ct_XG3S005"], "parentScript": "让孩子每天回顾今天的学习。", "practiceTip": "每天写反思日记。"},
    {"id": "faq_xg_026", "question": "孩子不会自我调节怎么办？", "frequency": "中", "shortAnswer": "①认识情绪；②调节情绪；③保持积极；④多练习。", "relatedTopics": ["ct_XG3S005"], "parentScript": "教孩子调节情绪的方法。", "practiceTip": "每天做深呼吸练习。"},
    {"id": "faq_xg_027", "question": "孩子不会自我控制怎么办？", "frequency": "中", "shortAnswer": "①制定规则；②自我监督；③延迟满足；④多练习。", "relatedTopics": ["ct_XG3S005"], "parentScript": "让孩子学会等待，延迟满足。", "practiceTip": "练习延迟满足。"},
    {"id": "faq_xg_028", "question": "孩子不会自我约束怎么办？", "frequency": "中", "shortAnswer": "①制定规则；②严格执行；③适当惩罚；④多练习。", "relatedTopics": ["ct_XG3S005"], "parentScript": "制定家规，严格执行。", "practiceTip": "制定家规，全家遵守。"},
    {"id": "faq_xg_029", "question": "孩子不会自我监督怎么办？", "frequency": "中", "shortAnswer": "①制定计划；②记录完成情况；③自我评价；④多练习。", "relatedTopics": ["ct_XG3S005"], "parentScript": "让孩子记录每天的学习情况。", "practiceTip": "每天记录学习情况。"},
    {"id": "faq_xg_030", "question": "孩子不会自我评价怎么办？", "frequency": "中", "shortAnswer": "①制定标准；②对照标准；③客观评价；④多练习。", "relatedTopics": ["ct_XG3S005"], "parentScript": "让孩子对照标准评价自己。", "practiceTip": "每周自我评价一次。"},
    {"id": "faq_xg_031", "question": "孩子不会自我改进怎么办？", "frequency": "中", "shortAnswer": "①找出问题；②制定改进计划；③执行计划；④多练习。", "relatedTopics": ["ct_XG3S005"], "parentScript": "让孩子找出问题，制定改进计划。", "practiceTip": "每周制定一个改进计划。"},
    {"id": "faq_xg_032", "question": "孩子不会自我完善怎么办？", "frequency": "低", "shortAnswer": "①认识不足；②制定计划；③持续改进；④多练习。", "relatedTopics": ["ct_XG3S005"], "parentScript": "让孩子认识自己的不足。", "practiceTip": "每周总结一次。"},
    {"id": "faq_xg_033", "question": "孩子不会自我发展怎么办？", "frequency": "低", "shortAnswer": "①发现兴趣；②制定目标；③持续努力；④多练习。", "relatedTopics": ["ct_XG3S005"], "parentScript": "让孩子发现自己的兴趣。", "practiceTip": "每周尝试一个新事物。"},
    {"id": "faq_xg_034", "question": "孩子不会自我实现怎么办？", "frequency": "低", "shortAnswer": "①设定目标；②持续努力；③体验成功；④多练习。", "relatedTopics": ["ct_XG3S005"], "parentScript": "让孩子设定目标，体验成功。", "practiceTip": "每周设定一个小目标。"},
    {"id": "faq_xg_035", "question": "孩子不会自我超越怎么办？", "frequency": "低", "shortAnswer": "①挑战自己；②突破极限；③体验成功；④多练习。", "relatedTopics": ["ct_XG3S005"], "parentScript": "让孩子挑战自己。", "practiceTip": "每周挑战一个新事物。"},
    {"id": "faq_xg_036", "question": "孩子不会自我认知怎么办？", "frequency": "中", "shortAnswer": "①认识自己的优点；②认识自己的不足；③多练习。", "relatedTopics": ["ct_XG3S005"], "parentScript": "让孩子说说自己的优点和不足。", "practiceTip": "每周说一个优点和一个不足。"},
    {"id": "faq_xg_037", "question": "孩子不会自我定位怎么办？", "frequency": "低", "shortAnswer": "①认识自己；②了解环境；③确定位置；④多练习。", "relatedTopics": ["ct_XG3S005"], "parentScript": "让孩子了解自己在班级的位置。", "practiceTip": "每周了解一次。"},
    {"id": "faq_xg_038", "question": "孩子不会自我规划怎么办？", "frequency": "中", "shortAnswer": "①确定目标；②制定计划；③执行计划；④多练习。", "relatedTopics": ["ct_XG3S005"], "parentScript": "让孩子制定学习计划。", "practiceTip": "每周制定一次学习计划。"},
    {"id": "faq_xg_039", "question": "孩子不会自我执行怎么办？", "frequency": "中", "shortAnswer": "①制定计划；②立即行动；③坚持执行；④多练习。", "relatedTopics": ["ct_XG3S005"], "parentScript": "让孩子立即行动，不要拖延。", "practiceTip": "每天立即行动。"},
    {"id": "faq_xg_040", "question": "孩子不会自我检查怎么办？", "frequency": "中", "shortAnswer": "①做完题回头看；②检查错误；③改正错误；④多练习。", "relatedTopics": ["ct_XG3S005"], "parentScript": "让孩子做完题检查。", "practiceTip": "每次作业检查一次。"},
    
    # ========== 情绪心理 (新增20个) ==========
    {"id": "faq_qx_021", "question": "孩子自卑怎么办？", "frequency": "高", "shortAnswer": "①多表扬具体行为；②让孩子做力所能及的事；③不和其他孩子比；④接纳孩子的不完美。", "relatedTopics": ["ct_QX2S005"], "parentScript": "表扬'你这次做得很好'，不说'你不行'。", "practiceTip": "每天说3个孩子的优点。"},
    {"id": "faq_qx_022", "question": "孩子自负怎么办？", "frequency": "低", "shortAnswer": "①让孩子认识自己的不足；②让孩子向别人学习；③多练习。", "relatedTopics": ["ct_QX2S005"], "parentScript": "让孩子认识自己的不足。", "practiceTip": "每周让孩子认识一个不足。"},
    {"id": "faq_qx_023", "question": "孩子自私怎么办？", "frequency": "中", "shortAnswer": "①教孩子分享；②让孩子参与家务；③多练习。", "relatedTopics": ["ct_QX3S015"], "parentScript": "让孩子分享自己的东西。", "practiceTip": "每周让孩子分享一次。"},
    {"id": "faq_qx_024", "question": "孩子任性怎么办？", "frequency": "中", "shortAnswer": "①制定规则；②坚持执行；③不妥协；④多练习。", "relatedTopics": ["ct_QX3S015"], "parentScript": "制定规则，坚持执行。", "practiceTip": "制定家规，全家遵守。"},
    {"id": "faq_qx_025", "question": "孩子叛逆怎么办？", "frequency": "高", "shortAnswer": "①理解孩子；②尊重孩子；③多沟通；④多练习。", "relatedTopics": ["ct_QX4S015"], "parentScript": "不要说'你怎么这么叛逆'，换成'我知道你有想法'。", "practiceTip": "每天和孩子聊10分钟。"},
    {"id": "faq_qx_026", "question": "孩子依赖性强怎么办？", "frequency": "中", "shortAnswer": "①让孩子自己做；②给予信任；③多练习。", "relatedTopics": ["ct_QX3S015"], "parentScript": "让孩子自己做，不要代劳。", "practiceTip": "每周让孩子自己做一件事。"},
    {"id": "faq_qx_027", "question": "孩子缺乏安全感怎么办？", "frequency": "中", "shortAnswer": "①给孩子足够的爱；②多陪伴；③多练习。", "relatedTopics": ["ct_QX2S005"], "parentScript": "多陪伴孩子，给孩子安全感。", "practiceTip": "每天陪伴孩子30分钟。"},
    {"id": "faq_qx_028", "question": "孩子缺乏归属感怎么办？", "frequency": "低", "shortAnswer": "①让孩子参与家庭活动；②让孩子参与班级活动；③多练习。", "relatedTopics": ["ct_QX3S015"], "parentScript": "让孩子参与家庭活动。", "practiceTip": "每周参与一次家庭活动。"},
    {"id": "faq_qx_029", "question": "孩子缺乏成就感怎么办？", "frequency": "中", "shortAnswer": "①设定小目标；②体验成功；③多练习。", "relatedTopics": ["ct_QX3S015"], "parentScript": "让孩子设定小目标，体验成功。", "practiceTip": "每周设定一个小目标。"},
    {"id": "faq_qx_030", "question": "孩子缺乏价值感怎么办？", "frequency": "低", "shortAnswer": "①让孩子做有意义的事；②多表扬；③多练习。", "relatedTopics": ["ct_QX3S015"], "parentScript": "让孩子做有意义的事。", "practiceTip": "每周做一件有意义的事。"},
    {"id": "faq_qx_031", "question": "孩子缺乏目标感怎么办？", "frequency": "中", "shortAnswer": "①帮助孩子设定目标；②分解目标；③多练习。", "relatedTopics": ["ct_QX3S015"], "parentScript": "帮助孩子设定目标。", "practiceTip": "每周设定一个小目标。"},
    {"id": "faq_qx_032", "question": "孩子缺乏方向感怎么办？", "frequency": "低", "shortAnswer": "①帮助孩子了解自己；②了解职业；③多练习。", "relatedTopics": ["ct_QX3S015"], "parentScript": "帮助孩子了解不同的职业。", "practiceTip": "每周了解一个职业。"},
    {"id": "faq_qx_033", "question": "孩子缺乏动力感怎么办？", "frequency": "中", "shortAnswer": "①找到孩子的兴趣点；②设定小目标；③多练习。", "relatedTopics": ["ct_QX3S015"], "parentScript": "找到孩子的兴趣点。", "practiceTip": "每周尝试一个新事物。"},
    {"id": "faq_qx_034", "question": "孩子缺乏信心怎么办？", "frequency": "高", "shortAnswer": "①多表扬；②从简单开始；③多练习。", "relatedTopics": ["ct_QX2S005"], "parentScript": "不要说'你不行'，换成'你已经很棒了'。", "practiceTip": "每天表扬孩子的一个进步。"},
    {"id": "faq_qx_035", "question": "孩子缺乏勇气怎么办？", "frequency": "中", "shortAnswer": "①鼓励孩子尝试；②多练习。", "relatedTopics": ["ct_QX3S015"], "parentScript": "鼓励孩子尝试新事物。", "practiceTip": "每周尝试一个新事物。"},
    {"id": "faq_qx_036", "question": "孩子缺乏耐心怎么办？", "frequency": "中", "shortAnswer": "①教孩子等待；②多练习。", "relatedTopics": ["ct_QX3S015"], "parentScript": "教孩子等待，延迟满足。", "practiceTip": "练习延迟满足。"},
    {"id": "faq_qx_037", "question": "孩子缺乏毅力怎么办？", "frequency": "中", "shortAnswer": "①设定小目标；②坚持到底；③多练习。", "relatedTopics": ["ct_QX3S015"], "parentScript": "让孩子坚持到底。", "practiceTip": "每周坚持做一件事。"},
    {"id": "faq_qx_038", "question": "孩子缺乏自制力怎么办？", "frequency": "中", "shortAnswer": "①制定规则；②自我监督；③多练习。", "relatedTopics": ["ct_QX3S015"], "parentScript": "制定规则，自我监督。", "practiceTip": "制定家规，全家遵守。"},
    {"id": "faq_qx_039", "question": "孩子缺乏同理心怎么办？", "frequency": "中", "shortAnswer": "①教孩子换位思考；②多练习。", "relatedTopics": ["ct_QX3S015"], "parentScript": "让孩子想想'如果我是他'。", "practiceTip": "每周做一次换位思考。"},
    {"id": "faq_qx_040", "question": "孩子缺乏责任感怎么办？", "frequency": "中", "shortAnswer": "①分担家务；②承担后果；③多练习。", "relatedTopics": ["ct_QX4S005"], "parentScript": "让孩子负责一些家务。", "practiceTip": "每周分配一项家务。"},
    
    # ========== 升学过渡 (新增15个) ==========
    {"id": "faq_sx_011", "question": "孩子幼小衔接不适应怎么办？", "frequency": "高", "shortAnswer": "①理解孩子；②多鼓励；③和老师沟通；④多练习。", "relatedTopics": ["ct_SX1S001"], "parentScript": "不要说'怎么这么简单都不会'，换成'你已经很棒了'。", "practiceTip": "每天和孩子聊学校的事。"},
    {"id": "faq_sx_012", "question": "孩子小学毕业怎么准备初中？", "frequency": "高", "shortAnswer": "①了解初中课程特点；②培养自主学习能力；③适当预习初中内容；④多练习。", "relatedTopics": ["ct_SX6S001"], "parentScript": "和孩子聊初中生活，消除未知恐惧。", "practiceTip": "暑假适当预习初中内容。"},
    {"id": "faq_sx_013", "question": "孩子初中怎么适应？", "frequency": "中", "shortAnswer": "①了解初中课程特点；②培养自主学习能力；③多练习。", "relatedTopics": ["ct_SX6S001"], "parentScript": "和孩子聊初中生活。", "practiceTip": "每天和孩子聊学校的事。"},
    {"id": "faq_sx_014", "question": "孩子初中成绩下降怎么办？", "frequency": "中", "shortAnswer": "①找原因；②针对性解决；③多练习。", "relatedTopics": ["ct_SX6S001"], "parentScript": "和孩子一起找原因。", "practiceTip": "分析试卷，找到薄弱环节。"},
    {"id": "faq_sx_015", "question": "孩子初中怎么选科？", "frequency": "低", "shortAnswer": "①看兴趣；②看能力；③看未来；④多练习。", "relatedTopics": ["ct_SX6S001"], "parentScript": "根据孩子的兴趣和能力选科。", "practiceTip": "了解不同科目的特点。"},
    {"id": "faq_sx_016", "question": "孩子初中怎么规划？", "frequency": "低", "shortAnswer": "①确定目标；②制定计划；③执行计划；④多练习。", "relatedTopics": ["ct_SX6S001"], "parentScript": "帮助孩子制定初中规划。", "practiceTip": "每周制定一次学习计划。"},
    {"id": "faq_sx_017", "question": "孩子初中怎么培养兴趣？", "frequency": "中", "shortAnswer": "①发现兴趣；②培养兴趣；③多练习。", "relatedTopics": ["ct_SX6S001"], "parentScript": "发现孩子的兴趣。", "practiceTip": "每周尝试一个新事物。"},
    {"id": "faq_sx_018", "question": "孩子初中怎么培养特长？", "frequency": "低", "shortAnswer": "①发现特长；②培养特长；③多练习。", "relatedTopics": ["ct_SX6S001"], "parentScript": "发现孩子的特长。", "practiceTip": "每周培养一个特长。"},
    {"id": "faq_sx_019", "question": "孩子初中怎么培养综合素质？", "frequency": "低", "shortAnswer": "①全面发展；②多练习。", "relatedTopics": ["ct_SX6S001"], "parentScript": "让孩子全面发展。", "practiceTip": "每周参加一个活动。"},
    {"id": "faq_sx_020", "question": "孩子初中怎么准备中考？", "frequency": "中", "shortAnswer": "①制定计划；②全面复习；③多练习。", "relatedTopics": ["ct_SX6S001"], "parentScript": "帮助孩子制定中考计划。", "practiceTip": "每周做一套模拟题。"},
    {"id": "faq_sx_021", "question": "孩子中考紧张怎么办？", "frequency": "中", "shortAnswer": "①考前不给孩子压力；②正常复习；③深呼吸放松；④多练习。", "relatedTopics": ["ct_SX6S001"], "parentScript": "考前说'尽力就好'，不说'一定要考好'。", "practiceTip": "考前不复习新内容。"},
    {"id": "faq_sx_022", "question": "孩子中考成绩不好怎么办？", "frequency": "中", "shortAnswer": "①不要责怪孩子；②找原因；③制定计划；④多练习。", "relatedTopics": ["ct_SX6S001"], "parentScript": "不要说'怎么考这么差'，换成'我们找找原因'。", "practiceTip": "分析试卷，找到薄弱环节。"},
    {"id": "faq_sx_023", "question": "孩子中考后怎么选择高中？", "frequency": "中", "shortAnswer": "①看兴趣；②看能力；③看未来；④多练习。", "relatedTopics": ["ct_SX6S001"], "parentScript": "根据孩子的兴趣和能力选择高中。", "practiceTip": "了解不同高中的特点。"},
    {"id": "faq_sx_024", "question": "孩子怎么准备自主招生？", "frequency": "低", "shortAnswer": "①了解政策；②准备材料；③多练习。", "relatedTopics": ["ct_SX6S001"], "parentScript": "了解自主招生政策。", "practiceTip": "每周了解一个自主招生政策。"},
    {"id": "faq_sx_025", "question": "孩子怎么准备竞赛？", "frequency": "低", "shortAnswer": "①选择竞赛；②制定计划；③多练习。", "relatedTopics": ["ct_SX6S001"], "parentScript": "根据孩子的兴趣选择竞赛。", "practiceTip": "每周做一套竞赛题。"},
    
    # ========== 健康安全 (新增15个) ==========
    {"id": "faq_jk_011", "question": "孩子肥胖怎么办？", "frequency": "中", "shortAnswer": "①控制饮食；②增加运动；③多练习。", "relatedTopics": ["ct_JK3S001"], "parentScript": "控制饮食，增加运动。", "practiceTip": "每天运动1小时。"},
    {"id": "faq_jk_012", "question": "孩子营养不良怎么办？", "frequency": "低", "shortAnswer": "①均衡饮食；②多练习。", "relatedTopics": ["ct_JK3S001"], "parentScript": "均衡饮食，不挑食。", "practiceTip": "每天吃蔬菜水果。"},
    {"id": "faq_jk_013", "question": "孩子长不高怎么办？", "frequency": "中", "shortAnswer": "①充足睡眠；②适量运动；③均衡饮食；④多练习。", "relatedTopics": ["ct_JK3S001"], "parentScript": "保证充足睡眠，适量运动。", "practiceTip": "每天睡眠9小时。"},
    {"id": "faq_jk_014", "question": "孩子性早熟怎么办？", "frequency": "低", "shortAnswer": "①及时就医；②了解原因；③多练习。", "relatedTopics": ["ct_JK3S001"], "parentScript": "及时就医，了解原因。", "practiceTip": "定期检查。"},
    {"id": "faq_jk_015", "question": "孩子脊柱侧弯怎么办？", "frequency": "低", "shortAnswer": "①及时就医；②矫正训练；③多练习。", "relatedTopics": ["ct_JK3S001"], "parentScript": "及时就医，做矫正训练。", "practiceTip": "每天做矫正训练。"},
    {"id": "faq_jk_016", "question": "孩子多动症怎么办？", "frequency": "低", "shortAnswer": "①及时就医；②行为训练；③多练习。", "relatedTopics": ["ct_JK3S001"], "parentScript": "及时就医，做行为训练。", "practiceTip": "每天做行为训练。"},
    {"id": "faq_jk_017", "question": "孩子自闭症怎么办？", "frequency": "低", "shortAnswer": "①及时就医；②行为训练；③多练习。", "relatedTopics": ["ct_JK3S001"], "parentScript": "及时就医，做行为训练。", "practiceTip": "每天做行为训练。"},
    {"id": "faq_jk_018", "question": "孩子抑郁症怎么办？", "frequency": "低", "shortAnswer": "①及时就医；②心理治疗；③多练习。", "relatedTopics": ["ct_JK3S001"], "parentScript": "及时就医，做心理治疗。", "practiceTip": "每天做心理治疗。"},
    {"id": "faq_jk_019", "question": "孩子焦虑症怎么办？", "frequency": "低", "shortAnswer": "①及时就医；②心理治疗；③多练习。", "relatedTopics": ["ct_JK3S001"], "parentScript": "及时就医，做心理治疗。", "practiceTip": "每天做心理治疗。"},
    {"id": "faq_jk_020", "question": "孩子厌食症怎么办？", "frequency": "低", "shortAnswer": "①及时就医；②心理治疗；③多练习。", "relatedTopics": ["ct_JK3S001"], "parentScript": "及时就医，做心理治疗。", "practiceTip": "每天做心理治疗。"},
    {"id": "faq_jk_021", "question": "孩子失眠怎么办？", "frequency": "低", "shortAnswer": "①固定作息；②睡前不看电子屏幕；③多练习。", "relatedTopics": ["ct_JK4S005"], "parentScript": "固定作息，睡前不看电子屏幕。", "practiceTip": "制定作息时间表。"},
    {"id": "faq_jk_022", "question": "孩子做噩梦怎么办？", "frequency": "低", "shortAnswer": "①安慰孩子；②了解原因；③多练习。", "relatedTopics": ["ct_JK4S005"], "parentScript": "安慰孩子，了解原因。", "practiceTip": "每天和孩子聊一聊。"},
    {"id": "faq_jk_023", "question": "孩子尿床怎么办？", "frequency": "低", "shortAnswer": "①不要责怪；②了解原因；③多练习。", "relatedTopics": ["ct_JK4S005"], "parentScript": "不要责怪孩子，了解原因。", "practiceTip": "睡前少喝水。"},
    {"id": "faq_jk_024", "question": "孩子受伤怎么办？", "frequency": "低", "shortAnswer": "①及时处理；②严重时就医；③多练习。", "relatedTopics": ["ct_JK5S005"], "parentScript": "及时处理，严重时就医。", "practiceTip": "学习急救知识。"},
    {"id": "faq_jk_025", "question": "孩子被欺负怎么办？", "frequency": "中", "shortAnswer": "①安慰孩子；②了解情况；③教孩子自我保护；④和老师沟通。", "relatedTopics": ["ct_JK5S005"], "parentScript": "不要说'你怎么这么笨'，换成'告诉我发生了什么'。", "practiceTip": "教孩子说'不可以'，寻求帮助。"},
    
    # ========== 科学教育 (新增20个) ==========
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
    
    # ========== 道德与法治 (新增20个) ==========
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
    
    # ========== 体育健康 (新增20个) ==========
    {"id": "faq_ty_006", "question": "孩子怎么培养运动兴趣？", "frequency": "高", "shortAnswer": "①找喜欢的运动；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "带孩子一起运动，不是逼孩子运动。", "practiceTip": "每天运动30分钟。"},
    {"id": "faq_ty_007", "question": "孩子怎么培养运动习惯？", "frequency": "高", "shortAnswer": "①每天固定时间；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "每天固定30分钟运动时间。", "practiceTip": "制定运动计划表。"},
    {"id": "faq_ty_008", "question": "孩子怎么培养运动技能？", "frequency": "中", "shortAnswer": "①学习运动技能；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学习运动技能。", "practiceTip": "每周学习一个运动技能。"},
    {"id": "faq_ty_009", "question": "孩子怎么培养运动品质？", "frequency": "低", "shortAnswer": "①坚持运动；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子坚持运动。", "practiceTip": "每周坚持运动。"},
    {"id": "faq_ty_010", "question": "孩子怎么培养运动精神？", "frequency": "低", "shortAnswer": "①公平竞争；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子公平竞争。", "practiceTip": "每周参加一次比赛。"},
    {"id": "faq_ty_011", "question": "孩子怎么培养团队精神？", "frequency": "中", "shortAnswer": "①参加团队运动；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子参加团队运动。", "practiceTip": "每周参加一次团队运动。"},
    {"id": "faq_ty_012", "question": "孩子怎么培养领导能力？", "frequency": "低", "shortAnswer": "①当队长；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子当队长。", "practiceTip": "每周当一次队长。"},
    {"id": "faq_ty_013", "question": "孩子怎么培养合作能力？", "frequency": "中", "shortAnswer": "①和同学合作；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子和同学合作。", "practiceTip": "每周和同学合作一次。"},
    {"id": "faq_ty_014", "question": "孩子怎么培养竞争能力？", "frequency": "低", "shortAnswer": "①参加比赛；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子参加比赛。", "practiceTip": "每周参加一次比赛。"},
    {"id": "faq_ty_015", "question": "孩子怎么培养抗挫能力？", "frequency": "中", "shortAnswer": "①体验失败；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子体验失败。", "practiceTip": "每周体验一次失败。"},
    {"id": "faq_ty_016", "question": "孩子怎么培养意志力？", "frequency": "中", "shortAnswer": "①坚持运动；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子坚持运动。", "practiceTip": "每周坚持运动。"},
    {"id": "faq_ty_017", "question": "孩子怎么培养自律能力？", "frequency": "中", "shortAnswer": "①制定计划；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子制定运动计划。", "practiceTip": "每周制定一次运动计划。"},
    {"id": "faq_ty_018", "question": "孩子怎么培养自我管理能力？", "frequency": "低", "shortAnswer": "①自己管理自己；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子自己管理自己。", "practiceTip": "每周自己管理自己。"},
    {"id": "faq_ty_019", "question": "孩子怎么培养健康意识？", "frequency": "中", "shortAnswer": "①了解健康知识；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子了解健康知识。", "practiceTip": "每周学习一个健康知识。"},
    {"id": "faq_ty_020", "question": "孩子怎么培养安全意识？", "frequency": "中", "shortAnswer": "①了解安全知识；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子了解安全知识。", "practiceTip": "每周学习一个安全知识。"},
    {"id": "faq_ty_021", "question": "孩子怎么培养急救能力？", "frequency": "低", "shortAnswer": "①学习急救知识；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学习急救知识。", "practiceTip": "每周学习一个急救知识。"},
    {"id": "faq_ty_022", "question": "孩子怎么培养保护能力？", "frequency": "低", "shortAnswer": "①学习保护知识；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学习保护知识。", "practiceTip": "每周学习一个保护知识。"},
    {"id": "faq_ty_023", "question": "孩子怎么培养生存能力？", "frequency": "低", "shortAnswer": "①学习生存知识；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学习生存知识。", "practiceTip": "每周学习一个生存知识。"},
    {"id": "faq_ty_024", "question": "孩子怎么培养生活能力？", "frequency": "中", "shortAnswer": "①学习生活知识；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子学习生活知识。", "practiceTip": "每周学习一个生活知识。"},
    {"id": "faq_ty_025", "question": "孩子怎么培养劳动能力？", "frequency": "中", "shortAnswer": "①做家务；②多练习。", "relatedTopics": ["ct_TY1S001"], "parentScript": "让孩子做家务。", "practiceTip": "每周做一件家务。"},
    
    # ========== 艺术素养 (新增20个) ==========
    {"id": "faq_ys_007", "question": "孩子怎么培养音乐素养？", "frequency": "中", "shortAnswer": "①听音乐；②学乐器；③多练习。", "relatedTopics": ["ct_YS3S001"], "parentScript": "让孩子听音乐、学乐器。", "practiceTip": "每天听音乐30分钟。"},
    {"id": "faq_ys_008", "question": "孩子怎么培养美术素养？", "frequency": "中", "shortAnswer": "①看美术作品；②学画画；③多练习。", "relatedTopics": ["ct_YS1S001"], "parentScript": "让孩子看美术作品、学画画。", "practiceTip": "每天画画30分钟。"},
    {"id": "faq_ys_009", "question": "孩子怎么培养舞蹈素养？", "frequency": "低", "shortAnswer": "①看舞蹈；②学跳舞；③多练习。", "relatedTopics": ["ct_YS3S001"], "parentScript": "让孩子看舞蹈、学跳舞。", "practiceTip": "每天跳舞30分钟。"},
    {"id": "faq_ys_010", "question": "孩子怎么培养戏剧素养？", "frequency": "低", "shortAnswer": "①看戏剧；②学表演；③多练习。", "relatedTopics": ["ct_YS3S001"], "parentScript": "让孩子看戏剧、学表演。", "practiceTip": "每周看一次戏剧。"},
    {"id": "faq_ys_011", "question": "孩子怎么培养书法素养？", "frequency": "中", "shortAnswer": "①看书法作品；②学书法；③多练习。", "relatedTopics": ["ct_YS2S005"], "parentScript": "让孩子看书法作品、学书法。", "practiceTip": "每天练字30分钟。"},
    {"id": "faq_ys_012", "question": "孩子怎么培养摄影素养？", "frequency": "低", "shortAnswer": "①看摄影作品；②学摄影；③多练习。", "relatedTopics": ["ct_YS3S001"], "parentScript": "让孩子看摄影作品、学摄影。", "practiceTip": "每周拍一张照片。"},
    {"id": "faq_ys_013", "question": "孩子怎么培养电影素养？", "frequency": "低", "shortAnswer": "①看电影；②学影评；③多练习。", "relatedTopics": ["ct_YS3S001"], "parentScript": "让孩子看电影、学影评。", "practiceTip": "每周看一部电影。"},
    {"id": "faq_ys_014", "question": "孩子怎么培养文学素养？", "frequency": "中", "shortAnswer": "①读文学作品；②学写作；③多练习。", "relatedTopics": ["ct_YS3S001"], "parentScript": "让孩子读文学作品、学写作。", "practiceTip": "每天读30分钟文学作品。"},
    {"id": "faq_ys_015", "question": "孩子怎么培养艺术兴趣？", "frequency": "中", "shortAnswer": "①接触艺术；②多练习。", "relatedTopics": ["ct_YS1S001"], "parentScript": "让孩子接触艺术。", "practiceTip": "每周接触一个艺术形式。"},
    {"id": "faq_ys_016", "question": "孩子怎么培养艺术习惯？", "frequency": "中", "shortAnswer": "①每天固定时间；②多练习。", "relatedTopics": ["ct_YS1S001"], "parentScript": "每天固定30分钟艺术学习。", "practiceTip": "制定艺术学习计划表。"},
    {"id": "faq_ys_017", "question": "孩子怎么培养艺术技能？", "frequency": "中", "shortAnswer": "①学习艺术技能；②多练习。", "relatedTopics": ["ct_YS1S001"], "parentScript": "让孩子学习艺术技能。", "practiceTip": "每周学习一个艺术技能。"},
    {"id": "faq_ys_018", "question": "孩子怎么培养艺术品质？", "frequency": "低", "shortAnswer": "①坚持艺术学习；②多练习。", "relatedTopics": ["ct_YS1S001"], "parentScript": "让孩子坚持艺术学习。", "practiceTip": "每周坚持艺术学习。"},
    {"id": "faq_ys_019", "question": "孩子怎么培养艺术精神？", "frequency": "低", "shortAnswer": "①追求艺术；②多练习。", "relatedTopics": ["ct_YS1S001"], "parentScript": "让孩子追求艺术。", "practiceTip": "每周追求艺术。"},
    {"id": "faq_ys_020", "question": "孩子怎么培养艺术鉴赏能力？", "frequency": "低", "shortAnswer": "①欣赏艺术作品；②多练习。", "relatedTopics": ["ct_YS1S001"], "parentScript": "让孩子欣赏艺术作品。", "practiceTip": "每周欣赏一个艺术作品。"},
    {"id": "faq_ys_021", "question": "孩子怎么培养艺术创作能力？", "frequency": "低", "shortAnswer": "①创作艺术作品；②多练习。", "relatedTopics": ["ct_YS1S001"], "parentScript": "让孩子创作艺术作品。", "practiceTip": "每周创作一个艺术作品。"},
    {"id": "faq_ys_022", "question": "孩子怎么培养艺术表达能力？", "frequency": "低", "shortAnswer": "①表达艺术感受；②多练习。", "relatedTopics": ["ct_YS1S001"], "parentScript": "让孩子表达艺术感受。", "practiceTip": "每周表达一次艺术感受。"},
    {"id": "faq_ys_023", "question": "孩子怎么培养艺术批评能力？", "frequency": "低", "shortAnswer": "①批评艺术作品；②多练习。", "relatedTopics": ["ct_YS1S001"], "parentScript": "让孩子批评艺术作品。", "practiceTip": "每周批评一个艺术作品。"},
    {"id": "faq_ys_024", "question": "孩子怎么培养艺术史知识？", "frequency": "低", "shortAnswer": "①学习艺术史；②多练习。", "relatedTopics": ["ct_YS1S001"], "parentScript": "让孩子学习艺术史。", "practiceTip": "每周学习一个艺术史知识。"},
    {"id": "faq_ys_025", "question": "孩子怎么培养艺术理论？", "frequency": "低", "shortAnswer": "①学习艺术理论；②多练习。", "relatedTopics": ["ct_YS1S001"], "parentScript": "让孩子学习艺术理论。", "practiceTip": "每周学习一个艺术理论。"},
    
    # ========== 劳动教育 (新增15个) ==========
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
    
    # ========== 综合问题 (新增25个) ==========
    {"id": "faq_zh_016", "question": "家长怎么培养孩子的阅读习惯？", "frequency": "高", "shortAnswer": "①家长以身作则；②每天固定时间；③让孩子选书；④读完聊一聊。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "家长做孩子的阅读榜样。", "practiceTip": "每天亲子阅读20分钟。"},
    {"id": "faq_zh_017", "question": "家长怎么培养孩子的写作习惯？", "frequency": "中", "shortAnswer": "①每天写日记；②先说再写；③多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "让孩子每天写几句话。", "practiceTip": "每天写一篇日记。"},
    {"id": "faq_zh_018", "question": "家长怎么培养孩子的书写习惯？", "frequency": "高", "shortAnswer": "①正确的握笔姿势；②正确的坐姿；③每天练字；④多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "每天练字15分钟。", "practiceTip": "每天练字1页。"},
    {"id": "faq_zh_019", "question": "家长怎么培养孩子的倾听习惯？", "frequency": "中", "shortAnswer": "①认真听别人说话；②不打断别人；③多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "让孩子复述你说的话。", "practiceTip": "每天让孩子复述一件事。"},
    {"id": "faq_zh_020", "question": "家长怎么培养孩子的表达能力？", "frequency": "中", "shortAnswer": "①多说；②多读；③多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "每天让孩子说说学校的事。", "practiceTip": "每天和孩子聊10分钟。"},
    {"id": "faq_zh_021", "question": "家长怎么培养孩子的理解能力？", "frequency": "中", "shortAnswer": "①多读；②多思考；③多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "问孩子'这句话是什么意思？'", "practiceTip": "每天读一篇文章，回答问题。"},
    {"id": "faq_zh_022", "question": "家长怎么培养孩子的分析能力？", "frequency": "中", "shortAnswer": "①找关键词；②分段；③概括段意；④多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "让孩子分段、概括段意。", "practiceTip": "每天读一段话，概括段意。"},
    {"id": "faq_zh_023", "question": "家长怎么培养孩子的概括能力？", "frequency": "中", "shortAnswer": "①找中心句；②合并关键词；③多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "让孩子用自己的话说说主要内容。", "practiceTip": "每天概括一段话。"},
    {"id": "faq_zh_024", "question": "家长怎么培养孩子的想象能力？", "frequency": "低", "shortAnswer": "①读故事；②续写故事；③多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "让孩子续写故事。", "practiceTip": "每周续写一个故事。"},
    {"id": "faq_zh_025", "question": "家长怎么培养孩子的观察能力？", "frequency": "中", "shortAnswer": "①看周围的事物；②写观察日记；③多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "让孩子观察一种植物或动物。", "practiceTip": "每周写一篇观察日记。"},
    {"id": "faq_zh_026", "question": "家长怎么培养孩子的记忆能力？", "frequency": "中", "shortAnswer": "①理解记忆；②分段记忆；③多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "让孩子先理解，再背诵。", "practiceTip": "每天背一首古诗。"},
    {"id": "faq_zh_027", "question": "家长怎么培养孩子的逻辑能力？", "frequency": "低", "shortAnswer": "①分段；②找逻辑关系；③多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "让孩子找出段落之间的逻辑关系。", "practiceTip": "每天分析一段话的逻辑。"},
    {"id": "faq_zh_028", "question": "家长怎么培养孩子的审美能力？", "frequency": "低", "shortAnswer": "①读美文；②欣赏好词好句；③多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "让孩子找出文章中喜欢的句子。", "practiceTip": "每天摘抄3个好词好句。"},
    {"id": "faq_zh_029", "question": "家长怎么培养孩子的文化素养？", "frequency": "低", "shortAnswer": "①读经典；②了解传统文化；③多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "让孩子读《论语》《唐诗三百首》。", "practiceTip": "每天读一段经典。"},
    {"id": "faq_zh_030", "question": "家长怎么培养孩子的文学素养？", "frequency": "低", "shortAnswer": "①读名著；②了解文学常识；③多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "让孩子读适合年龄的名著。", "practiceTip": "每月读一本名著。"},
    {"id": "faq_zh_031", "question": "家长怎么培养孩子的科学素养？", "frequency": "低", "shortAnswer": "①读科普作品；②了解科学知识；③多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "让孩子读科普书籍。", "practiceTip": "每周读一本科普书。"},
    {"id": "faq_zh_032", "question": "家长怎么培养孩子的艺术素养？", "frequency": "低", "shortAnswer": "①读艺术作品；②了解艺术知识；③多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "带孩子去美术馆、博物馆。", "practiceTip": "每月去一次美术馆。"},
    {"id": "faq_zh_033", "question": "家长怎么培养孩子的信息素养？", "frequency": "低", "shortAnswer": "①学会查资料；②学会筛选信息；③多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "让孩子自己查资料。", "practiceTip": "每周查一个资料。"},
    {"id": "faq_zh_034", "question": "家长怎么培养孩子的媒介素养？", "frequency": "低", "shortAnswer": "①学会辨别信息；②不轻信谣言；③多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "和孩子讨论新闻，辨别真假。", "practiceTip": "每天看新闻，讨论真假。"},
    {"id": "faq_zh_035", "question": "家长怎么培养孩子的国际视野？", "frequency": "低", "shortAnswer": "①读外国作品；②了解世界文化；③多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "让孩子读外国童话。", "practiceTip": "每月读一本外国童话。"},
    {"id": "faq_zh_036", "question": "家长怎么培养孩子的家国情怀？", "frequency": "低", "shortAnswer": "①读爱国作品；②了解国家历史；③多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "让孩子读爱国故事。", "practiceTip": "每天读一个爱国故事。"},
    {"id": "faq_zh_037", "question": "家长怎么培养孩子的社会责任感？", "frequency": "低", "shortAnswer": "①读社会作品；③了解社会问题；③多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "让孩子了解社会问题。", "practiceTip": "每周讨论一个社会问题。"},
    {"id": "faq_zh_038", "question": "家长怎么培养孩子的环保意识？", "frequency": "低", "shortAnswer": "①读环保作品；②了解环保知识；③多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "让孩子了解环保知识。", "practiceTip": "每周做一个环保行动。"},
    {"id": "faq_zh_039", "question": "家长怎么培养孩子的健康意识？", "frequency": "低", "shortAnswer": "①读健康作品；②了解健康知识；③多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "让孩子了解健康知识。", "practiceTip": "每周学习一个健康知识。"},
    {"id": "faq_zh_040", "question": "家长怎么培养孩子的安全意识？", "frequency": "低", "shortAnswer": "①读安全作品；②了解安全知识；③多练习。", "relatedTopics": ["ct_ZH1S001"], "parentScript": "让孩子了解安全知识。", "practiceTip": "每周学习一个安全知识。"},
]

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
for q in new_questions:
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
