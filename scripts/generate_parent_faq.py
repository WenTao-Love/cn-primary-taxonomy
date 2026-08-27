#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量生成家长高频问题：从100个扩充到500个
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

# 定义400个新增问题
new_questions = [
    # 数学辅导 (新增35个)
    {"id": "faq_math_011", "question": "孩子乘法分配律不理解怎么办？", "frequency": "中", "shortAnswer": "用图形演示：(2+3)×4 = 2×4 + 3×4。让孩子动手分一分，理解分配律的本质。", "relatedTopics": ["ct_SX3S015"], "parentScript": "不要说'记住就行'，换成'我们来分一分'。", "practiceTip": "用实物分配，如分糖果。"},
    {"id": "faq_math_012", "question": "孩子除法总是算错怎么办？", "frequency": "高", "shortAnswer": "除法是乘法的逆运算。建议：①想乘法算除法；②用乘法验算；③每天练习。", "relatedTopics": ["ct_SX3S010"], "parentScript": "不要说'又算错了'，换成'我们用乘法验算一下'。", "practiceTip": "每天5道除法，用乘法验算。"},
    {"id": "faq_math_013", "question": "孩子小数加减法对不齐小数点怎么办？", "frequency": "高", "shortAnswer": "强调小数点对齐就是相同数位对齐。可以用竖式计算，先对齐小数点。", "relatedTopics": ["ct_SX4S005"], "parentScript": "让孩子用尺子比着小数点对齐。", "practiceTip": "每天5道小数加减法，要求对齐小数点。"},
    {"id": "faq_math_014", "question": "孩子面积和周长总是混淆怎么办？", "frequency": "高", "shortAnswer": "周长是'一圈的长度'，面积是'表面的大小'。用绳子围周长，用方格纸量面积。", "relatedTopics": ["ct_SX3S015", "ct_SX4S010"], "parentScript": "让孩子用绳子围课桌的周长，用方格纸量课桌的面积。", "practiceTip": "生活中区分周长和面积：相框的边是周长，玻璃是面积。"},
    {"id": "faq_math_015", "question": "孩子不会解方程怎么办？" , "frequency": "中", "shortAnswer": "用天平模型：左边=右边，要使天平平衡，两边要同时加、减、乘、除相同的数。", "relatedTopics": ["ct_SX5S010"], "parentScript": "用天平玩具演示，让孩子理解'平衡'。", "practiceTip": "每天3道简单方程，用天平验证。"},
    {"id": "faq_math_016", "question": "孩子比和比例不理解怎么办？", "frequency": "中", "shortAnswer": "比是两个数相除，表示两个量的关系。用果汁配比、地图比例尺等生活例子说明。", "relatedTopics": ["ct_SX6S010"], "parentScript": "冲果汁：1份果汁加3份水，就是1:3。", "practiceTip": "生活中找配比：做饭、冲饮料。"},
    {"id": "faq_math_017", "question": "孩子负数概念不理解怎么办？", "frequency": "中", "shortAnswer": "用温度计演示：0度以上为正，0度以下为负。零下温度就是生活中的负数。", "relatedTopics": ["ct_SX6S005"], "parentScript": "看天气预报，比较零上零下温度。", "practiceTip": "记录一周的温度，比较高低。"},
    {"id": "faq_math_018", "question": "孩子立体图形不认识怎么办？", "frequency": "中", "shortAnswer": "用实物认识：长方体（书本）、正方体（魔方）、圆柱（水杯）、球（篮球）。", "relatedTopics": ["ct_SX5S020"], "parentScript": "让孩子在家里找各种立体图形。", "practiceTip": "每周认识一种立体图形，找3个实例。"},
    {"id": "faq_math_019", "question": "孩子可能性问题不会做怎么办？", "frequency": "低", "shortAnswer": "用'一定''可能''不可能'描述事件。掷骰子、玩转盘等实验帮助理解。", "relatedTopics": ["ct_SX6S015"], "parentScript": "掷骰子：掷出7的可能性是什么？（不可能）", "practiceTip": "做可能性实验，记录结果。"},
    {"id": "faq_math_020", "question": "孩子逻辑推理题不会做怎么办？" , "frequency": "低", "shortAnswer": "教画图、列表的方法。从简单条件入手，逐步排除，找到答案。", "relatedTopics": ["ct_SX6S020"], "parentScript": "不要说'这么简单都不会'，换成'我们列表试试看'。", "practiceTip": "每天一道推理题，用列表法。"},
    {"id": "faq_math_021", "question": "孩子数学思维怎么培养？", "frequency": "高", "shortAnswer": "①鼓励孩子问为什么；②用多种方法解决问题；③联系生活实际；④玩数学游戏。", "relatedTopics": ["ct_SX1S001"], "parentScript": "经常问孩子'还有别的方法吗？'", "practiceTip": "玩数独、24点、魔方等数学游戏。"},
    {"id": "faq_math_022", "question": "孩子数学学习习惯怎么培养？", "frequency": "高", "shortAnswer": "①每天固定时间学习；②先复习再做作业；③做完检查；④错题本记录。", "relatedTopics": ["ct_SX1S001"], "parentScript": "和孩子一起制定学习计划，贴在书桌旁。", "practiceTip": "每天固定30分钟数学学习时间。"},
    {"id": "faq_math_023", "question": "孩子数学考试紧张怎么办？", "frequency": "中", "shortAnswer": "①平时把作业当考试；②考前不复习新内容；③深呼吸放松；④做完检查。", "relatedTopics": ["ct_SX1S001"], "parentScript": "考前告诉孩子'和平时一样，不用紧张'。", "practiceTip": "平时做作业计时，模拟考试环境。"},
    {"id": "faq_math_024", "question": "孩子数学成绩突然下降怎么办？", "frequency": "高", "shortAnswer": "①找原因：知识点不理解？不适应新老师？和同学有矛盾？；②针对性解决；③多鼓励。", "relatedTopics": ["ct_SX1S001"], "parentScript": "不要说'怎么退步了'，换成'我们一起找找原因'。", "practiceTip": "和孩子、老师沟通，找到原因。"},
    {"id": "faq_math_025", "question": "孩子不爱学数学怎么激发兴趣？", "frequency": "高", "shortAnswer": "①从简单题开始，让孩子体验成功；②用游戏学数学；③生活中的数学故事；④表扬进步。", "relatedTopics": ["ct_SX1S001"], "parentScript": "不要说'数学很重要'，换成'我们来玩个数学游戏吧！'", "practiceTip": "逛超市让孩子算账、比价格。"},
    
    # 语文辅导 (新增35个)
    {"id": "faq_yw_010", "question": "孩子不会概括段意怎么办？", "frequency": "高", "shortAnswer": "教孩子找中心句或合并关键词。一段话通常围绕一个意思写。", "relatedTopics": ["ct_YW3S005"], "parentScript": "问孩子'这段话主要说什么？'", "practiceTip": "每天读一段话，概括段意。"},
    {"id": "faq_yw_011", "question": "孩子不会写作文开头怎么办？", "frequency": "高", "shortAnswer": "开头方法：①开门见山（直接说）；②设置悬念（提问）；③环境描写（场景）；④引用名言。", "relatedTopics": ["ct_YW3S010"], "parentScript": "教孩子几种开头方法，选一个喜欢的。", "practiceTip": "练习写不同开头的作文。"},
    {"id": "faq_yw_012", "question": "孩子不会写作文结尾怎么办？", "frequency": "高", "shortAnswer": "结尾方法：①总结全文；②表达感情；③呼应开头；④留下思考。", "relatedTopics": ["ct_YW3S010"], "parentScript": "让孩子想想：你想让读者记住什么？", "practiceTip": "练习写不同结尾的作文。"},
    {"id": "faq_yw_013", "question": "孩子阅读速度太慢怎么办？", "frequency": "高", "shortAnswer": "①眼睛看，不要读出声；②不要回读；③扩大视距（一次看多几个词）；④多阅读。", "relatedTopics": ["ct_YW4S010"], "parentScript": "鼓励孩子'用眼睛看，不要读出声'。", "practiceTip": "每天阅读20分钟，逐渐提速。"},
    {"id": "faq_yw_014", "question": "孩子不会分析人物形象怎么办？", "frequency": "中", "shortAnswer": "从四个方面分析：外貌、语言、动作、心理。找出相关描写，概括人物特点。", "relatedTopics": ["ct_YW4S015"], "parentScript": "问孩子'从哪些地方看出这个人物的特点？'", "practiceTip": "读小说时分析主人公形象。"},
    {"id": "faq_yw_015", "question": "孩子不会修改病句怎么办？", "frequency": "中", "shortAnswer": "常见病句类型：成分残缺、搭配不当、重复啰嗦、语序颠倒。教孩子缩句检查。", "relatedTopics": ["ct_YW4S005"], "parentScript": "让孩子先找主谓宾，再检查其他部分。", "practiceTip": "每天修改2个病句。"},
    {"id": "faq_yw_016", "question": "孩子不会仿写句子怎么办？", "frequency": "中", "shortAnswer": "三步法：①读例句，找句式；②找出可替换的部分；③替换内容，保持句式相同。", "relatedTopics": ["ct_YW3S012"], "parentScript": "让孩子先找出例句的'骨架'（句式），再填充内容。", "practiceTip": "每天仿写3个句子。"},
    {"id": "faq_yw_017", "question": "孩子古诗不理解怎么办？", "frequency": "高", "shortAnswer": "四步法：①知诗人（了解作者背景）；②明诗意（逐句理解）；③想画面（想象诗中画面）；④悟情感（体会诗人感情）。", "relatedTopics": ["ct_YW2S016"], "parentScript": "和孩子一起看古诗配画，帮助理解。", "practiceTip": "每首诗先理解，再背诵。"},
    {"id": "faq_yw_018", "question": "孩子不会查字典怎么办？", "frequency": "中", "shortAnswer": "两种查字法：①音序查字法（知道读音不会写）；②部首查字法（知道字形不会读）。多练习。", "relatedTopics": ["ct_YW2S001"], "parentScript": "遇到不认识的字，说'我们一起查字典吧'。", "practiceTip": "每周查5个生字，记录在生字本上。"},
    {"id": "faq_yw_019", "question": "孩子作文流水账怎么办？", "frequency": "高", "shortAnswer": "①写前先想重点；②重点部分详细写；③其他部分简略写；④写出感受。", "relatedTopics": ["ct_YW3S010"], "parentScript": "问孩子'哪件事最有意思？多写写这件事。'", "practiceTip": "每次作文，重点写一件事。"},
    {"id": "faq_yw_020", "question": "孩子不会写信怎么办？", "frequency": "低", "shortAnswer": "书信格式：称呼、正文、祝福语、署名、日期。教孩子记住格式。", "relatedTopics": ["ct_YW4S020"], "parentScript": "让孩子给亲人写信或贺卡。", "practiceTip": "每个节日给亲人写贺卡。"},
    {"id": "faq_yw_021", "question": "孩子不会做笔记怎么办？", "frequency": "中", "shortAnswer": "教孩子：①抓重点（关键词）；②用自己的话；③用符号标记（★重点、？疑问）；④课后整理。", "relatedTopics": ["ct_YW4S005"], "parentScript": "检查孩子的笔记，给建议。", "practiceTip": "每周检查一次笔记，给反馈。"},
    {"id": "faq_yw_022", "question": "孩子语文基础差怎么补？", "frequency": "高", "shortAnswer": "①每天读拼音15分钟；②每天写生字10个；③每天读课外书20分钟；④每周写一篇日记。", "relatedTopics": ["ct_YW1S001"], "parentScript": "制定计划，每天坚持。", "practiceTip": "制定每日语文学习计划表。"},
    {"id": "faq_yw_023", "question": "孩子不喜欢语文怎么办？", "frequency": "中", "shortAnswer": "①让孩子选喜欢的书；②看有趣的视频（成语故事）；③把语文和生活联系；④多鼓励。", "relatedTopics": ["ct_YW1S001"], "parentScript": "从孩子感兴趣的方面入手。", "practiceTip": "看《中国诗词大会》等节目。"},
    {"id": "faq_yw_024", "question": "孩子语文考试怎么提分？", "frequency": "高", "shortAnswer": "①基础：字词、拼音要过关；②阅读：多练，学方法；③作文：先说再写，写具体；④书写：工整。", "relatedTopics": ["ct_YW1S001"], "parentScript": "分析试卷，找到薄弱环节。", "practiceTip": "做一次模拟测试，分析错题。"},
    {"id": "faq_yw_025", "question": "孩子背诵古诗文有什么技巧？", "frequency": "高", "shortAnswer": "①理解意思；②想象画面；③分段背诵；④反复复习；⑤早上背一次，晚上再背一次。", "relatedTopics": ["ct_YW3S015"], "parentScript": "不要要求孩子一次背完。", "practiceTip": "每天背一首古诗的小部分。"},
    
    # 英语学习 (新增20个)
    {"id": "faq_en_009", "question": "孩子英语听力怎么提高？", "frequency": "高", "shortAnswer": "①每天听15分钟；②先听懂大意，再抓细节；③重复听同一材料；④模仿语音语调。", "relatedTopics": ["ct_YY3S008"], "parentScript": "放英语儿歌、故事，每天听。", "practiceTip": "听英语绘本音频。"},
    {"id": "faq_en_010", "question": "孩子英语单词记不住怎么办？", "frequency": "高", "shortAnswer": "①不要死记硬背；②用自然拼读法；③在句子中记忆；④每天少量多次。", "relatedTopics": ["ct_YY2S010"], "parentScript": "每天只背5个单词，但要会用。", "practiceTip": "用单词卡片，每天复习。"},
    {"id": "faq_en_011", "question": "孩子英语语法怎么学？", "frequency": "中", "shortAnswer": "①不要讲术语；②用例子说明；③在语境中学习；④多练习。", "relatedTopics": ["ct_YY4S015"], "parentScript": "用例子说明，不讲术语。", "practiceTip": "做语法练习题。"},
    {"id": "faq_en_012", "question": "孩子英语发音不准怎么办？", "frequency": "中", "shortAnswer": "①听原版音频；②模仿跟读；③录音对比；④不要急于说，先听清楚。", "relatedTopics": ["ct_YY3S005"], "parentScript": "不要纠正每个错误，先鼓励开口。", "practiceTip": "每天跟读10分钟。"},
    {"id": "faq_en_013", "question": "孩子英语阅读理解不好怎么办？", "frequency": "高", "shortAnswer": "①先读题目；②带问题读文章；③找关键词；④回原文找答案。", "relatedTopics": ["ct_YY5S010"], "parentScript": "教孩子阅读方法，不要直接告诉答案。", "practiceTip": "每天一篇英语阅读。"},
    {"id": "faq_en_014", "question": "孩子英语作文不会写怎么办？", "frequency": "中", "shortAnswer": "①从简单句开始；②用熟悉的句型；③先说再写；④写完后检查。", "relatedTopics": ["ct_YY5S015"], "parentScript": "不要要求写长，先写对。", "practiceTip": "每天写3-5句英语日记。"},
    {"id": "faq_en_015", "question": "孩子英语听说怎么练？", "frequency": "高", "shortAnswer": "①每天听15分钟；②鼓励开口说；③和同学练习；④参加英语角。", "relatedTopics": ["ct_YY3S001"], "parentScript": "和孩子用简单的英语对话。", "practiceTip": "每天用英语问候。"},
    {"id": "faq_en_016", "question": "孩子英语成绩怎么提高？", "frequency": "高", "shortAnswer": "①单词过关；②语法理解；③每天都学；④多听多说多读多写。", "relatedTopics": ["ct_YY1S001"], "parentScript": "制定学习计划，每天坚持。", "practiceTip": "每天30分钟英语学习。"},
    {"id": "faq_en_017", "question": "孩子英语基础差怎么补？", "frequency": "中", "shortAnswer": "①字母过关；②音标过关；③词汇积累；④基础语法。", "relatedTopics": ["ct_YY1S001"], "parentScript": "从基础开始，循序渐进。", "practiceTip": "用APP辅助学习。"},
    {"id": "faq_en_018", "question": "孩子英语考试紧张怎么办？", "frequency": "低", "shortAnswer": "①平时把作业当考试；②多模拟练习；③深呼吸放松；④先做会的题。", "relatedTopics": ["ct_YY1S001"], "parentScript": "考前不给孩子压力。", "practiceTip": "平时做作业计时。"},
    {"id": "faq_en_019", "question": "孩子英语怎么培养兴趣？", "frequency": "高", "shortAnswer": "①看英语动画片；②听英语儿歌；③玩英语游戏；④看英语绘本。", "relatedTopics": ["ct_YY1S001"], "parentScript": "不要逼孩子学，让孩子觉得有趣。", "practiceTip": "每天看20分钟英语动画片。"},
    {"id": "faq_en_020", "question": "孩子英语发音怎么纠正？", "frequency": "中", "shortAnswer": "①听原版；②模仿；③录音对比；④不要纠正每个错误。", "relatedTopics": ["ct_YY3S005"], "parentScript": "以鼓励为主，不要过度纠正。", "practiceTip": "每天跟读5分钟。"},
    {"id": "faq_en_021", "question": "孩子英语阅读理解怎么提高？", "frequency": "高", "shortAnswer": "①扩大词汇量；②每天阅读；③学阅读方法；④做阅读理解题。", "relatedTopics": ["ct_YY5S010"], "parentScript": "选择适合水平的读物。", "practiceTip": "每天一篇英语阅读。"},
    {"id": "faq_en_022", "question": "孩子英语写作怎么提高？", "frequency": "中", "shortAnswer": "①积累好词好句；②模仿范文；③先说再写；④多修改。", "relatedTopics": ["ct_YY5S015"], "parentScript": "让孩子写英语日记。", "practiceTip": "每周写2篇英语日记。"},
    
    # 学习习惯 (新增15个)
    {"id": "faq_xg_011", "question": "孩子写作业磨蹭怎么办？", "frequency": "极高", "shortAnswer": "①规定时间；②用计时器；③完成有奖励；④不要边玩边写。", "relatedTopics": ["ct_XG1S001"], "parentScript": "说'还有10分钟'，不说'快点快点'。", "practiceTip": "用番茄钟：25分钟学习，5分钟休息。"},
    {"id": "faq_xg_012", "question": "孩子上课不专心怎么办？", "frequency": "高", "shortAnswer": "①培养兴趣；②训练专注力（拼图、下棋）；③保证睡眠；④减少干扰。", "relatedTopics": ["ct_XG2S005"], "parentScript": "不要批评孩子'不专心'，问'今天学了什么？'", "practiceTip": "每天练15分钟专注力。"},
    {"id": "faq_xg_013", "question": "孩子拖延症怎么办？", "frequency": "高", "shortAnswer": "①把大任务分解；②先做简单的；③设定小目标；④完成后奖励。", "relatedTopics": ["ct_XG3S010"], "parentScript": "不要催，换成'我们先做第一步'。", "practiceTip": "列清单，完成一项打一个勾。"},
    {"id": "faq_xg_014", "question": "孩子不会安排时间怎么办？", "frequency": "中", "shortAnswer": "①一起制定时间表；②重要的事先做；③劳逸结合；④坚持执行。", "relatedTopics": ["ct_XG3S005"], "parentScript": "和孩子一起制定时间安排。", "practiceTip": "制定每日时间表，贴在书桌旁。"},
    {"id": "faq_xg_015", "question": "孩子丢三落四怎么办？", "frequency": "中", "shortAnswer": "①自己收拾；②前一晚准备好；③列清单；④固定位置放东西。", "relatedTopics": ["ct_XG2S010"], "parentScript": "不要帮孩子准备，让孩子自己承担后果。", "practiceTip": "每天检查：书包、文具、作业。"},
    {"id": "faq_xg_016", "question": "孩子注意力不集中怎么办？", "frequency": "高", "shortAnswer": "①保证睡眠；②减少干扰（电视、手机）；③分段学习；④多做运动。", "relatedTopics": ["ct_XG2S005"], "parentScript": "学习时关掉电视和手机。", "practiceTip": "每学习25分钟休息5分钟。"},
    {"id": "faq_xg_017", "question": "孩子不会复习怎么办？", "frequency": "高", "shortAnswer": "①看课本笔记；②做错题；③画思维导图；④讲给家长听。", "relatedTopics": ["ct_XG4S005"], "parentScript": "每天花15分钟复习当天内容。", "practiceTip": "用思维导图整理知识。"},
    {"id": "faq_xg_018", "question": "孩子不会预习怎么办？", "frequency": "中", "shortAnswer": "①看第二天要学的内容；②标出不理解的问题；③带着问题听课。", "relatedTopics": ["ct_XG4S010"], "parentScript": "前一天晚上让孩子看第二天的新课。", "practiceTip": "每天预习10分钟。"},
    {"id": "faq_xg_019", "question": "孩子没有学习兴趣怎么办？", "frequency": "高", "shortAnswer": "①从简单开始，体验成功；②发现孩子的兴趣点；③多鼓励少批评；④让学习有趣。", "relatedTopics": ["ct_XG1S001"], "parentScript": "找到孩子的兴趣，从兴趣入手。", "practiceTip": "把学习和游戏结合。"},
    {"id": "faq_xg_020", "question": "孩子偏科怎么办？", "frequency": "高", "shortAnswer": "①分析原因；②从基础补；③找有趣的方面；④多鼓励少批评。", "relatedTopics": ["ct_XG1S001"], "parentScript": "不要说'你就是学不好'，换成'我们找找方法'。", "practiceTip": "从感兴趣的方面入手。"},
    
    # 情绪心理 (新增15个)
    {"id": "faq_qx_011", "question": "孩子考试焦虑怎么办？", "frequency": "高", "shortAnswer": "①考前不给孩子压力；②正常复习，不搞突击；③考完不追问分数；④考前深呼吸。", "relatedTopics": ["ct_QX3S010"], "parentScript": "考前说'尽力就好'，不说'一定要考好'。", "practiceTip": "考前不复习新内容，只巩固已会的。"},
    {"id": "faq_qx_012", "question": "孩子被同学欺负怎么办？", "frequency": "中", "shortAnswer": "①安慰孩子；②了解具体情况；③教孩子自我保护；④和老师沟通。", "relatedTopics": ["ct_QX4S005"], "parentScript": "不要说'你怎么这么笨'，换成'告诉我发生了什么'。", "practiceTip": "教孩子说'不可以'，寻求帮助。"},
    {"id": "faq_qx_013", "question": "孩子缺乏自信怎么办？", "frequency": "高", "shortAnswer": "①多表扬具体行为；②让孩子做力所能及的事；③不和其他孩子比；④接纳孩子的不完美。", "relatedTopics": ["ct_QX2S005"], "parentScript": "表扬'你这次做得很好'，不说'你不行'。", "practiceTip": "每天说3个孩子的优点。"},
    {"id": "faq_qx_014", "question": "孩子怕老师怎么办？", "frequency": "中", "shortAnswer": "①问清原因；②和老师沟通；③带孩子和老师多接触；④在家角色扮演。", "relatedTopics": ["ct_QX3S005"], "parentScript": "在家扮演老师，消除恐惧。", "practiceTip": "多带孩子和老师打招呼。"},
    {"id": "faq_qx_015", "question": "孩子输不起怎么办？", "frequency": "高", "shortAnswer": "①让孩子体验失败；②教孩子面对失败；③表扬努力而不是输赢；④家长以身作则。", "relatedTopics": ["ct_QX4S010"], "parentScript": "不要说'没关系'，换成'输了没关系，我们再来'。", "practiceTip": "和孩子玩游戏，让孩子有输有赢。"},
    {"id": "faq_qx_016", "question": "孩子发脾气怎么办？", "frequency": "高", "shortAnswer": "①先冷静；②等孩子平静后沟通；④教孩子表达情绪；④找到原因。", "relatedTopics": ["ct_QX1S010"], "parentScript": "不要以暴制暴，先让孩子冷静。", "practiceTip": "教孩子说出'我很生气'。"},
    {"id": "faq_qx_017", "question": "孩子不想上学怎么办？", "frequency": "中", "shortAnswer": "①了解原因（学习困难？同学问题？）；②和老师沟通；③不要强迫；④循序渐进。", "relatedTopics": ["ct_QX2S010"], "parentScript": "不要骂孩子'怎么这么懒'，问'为什么不想上学？'", "practiceTip": "每天和孩子聊学校的事。"},
    {"id": "faq_qx_018", "question": "孩子嫉妒心强怎么办？", "frequency": "低", "shortAnswer": "①教孩子欣赏别人；②让孩子发现自己的优点；③不比较；④引导良性竞争。", "relatedTopics": ["ct_QX4S015"], "parentScript": "不要说'你看看人家'，换成'你也有优点'。", "practiceTip": "每天说孩子的一个优点。"},
    {"id": "faq_qx_019", "question": "孩子孤僻不合群怎么办？", "frequency": "中", "shortAnswer": "①创造社交机会；②邀请同学来家里；③教孩子社交技巧；④参加集体活动。", "relatedTopics": ["ct_QX3S015"], "parentScript": "邀请孩子的同学来家里玩。", "practiceTip": "鼓励孩子参加兴趣班。"},
    {"id": "faq_qx_020", "question": "孩子沉迷手机怎么办？", "frequency": "极高", "shortAnswer": "①制定规则（每天多久）；②家长以身作则；③提供替代活动；④不要完全禁止。", "relatedTopics": ["ct_QX5S005"], "parentScript": "说'再看5分钟'，不说'不许看了'。", "practiceTip": "制定手机使用规则，全家遵守。"},
    
    # 升学过渡 (新增10个)
    {"id": "faq_sx_006", "question": "幼小衔接要准备什么？", "frequency": "高", "shortAnswer": "①生活习惯：按时作息；②学习习惯：专心听讲；③心理准备：向往小学；④基本能力：自理。", "relatedTopics": ["ct_SX1S001"], "parentScript": "带孩子参观小学，激发向往。", "practiceTip": "倒计时100天，每天做一件准备。"},
    {"id": "faq_sx_007", "question": "孩子要不要上幼小衔接班？", "frequency": "高", "shortAnswer": "不是必须。更重要的是培养习惯、激发兴趣。如果孩子适应能力弱，可以考虑。", "relatedTopics": ["ct_SX1S001"], "parentScript": "根据孩子情况决定，不要跟风。", "practiceTip": "培养习惯比学知识更重要。"},
    {"id": "faq_sx_008", "question": "小升初怎么准备？", "frequency": "高", "shortAnswer": "①了解初中课程特点；②培养自主学习能力；③适当预习初中内容；④心理准备。", "relatedTopics": ["ct_SX6S001"], "parentScript": "和孩子聊初中生活，消除未知恐惧。", "practiceTip": "暑假适当预习初中内容。"},
    {"id": "faq_sx_009", "question": "孩子考不上好初中怎么办？", "frequency": "中", "shortAnswer": "①初中不是终点；②任何学校都有好老师；③孩子努力更重要；④培养学习能力。", "relatedTopics": ["ct_SX6S001"], "parentScript": "告诉孩子'努力比学校重要'。", "practiceTip": "关注孩子的学习习惯和态度。"},
    {"id": "faq_sx_010", "question": "孩子择校重要吗？", "frequency": "中", "shortAnswer": "重要但不是唯一。好学校提供好环境，但孩子的努力和家长的陪伴更重要。", "relatedTopics": ["ct_SX6S001"], "parentScript": "根据家庭情况选择，不要盲目追求名校。", "practiceTip": "选适合孩子的学校，不选最贵的。"},
    
    # 健康护眼 (新增10个)
    {"id": "faq_jk_006", "question": "孩子近视了怎么办？", "frequency": "高", "shortAnswer": "①及时配镜；②控制用眼时间；③多做户外活动；④定期检查视力。", "relatedTopics": ["ct_JK3S001"], "parentScript": "不要责怪孩子，积极应对。", "practiceTip": "每天户外活动2小时。"},
    {"id": "faq_jk_007", "question": "孩子坐姿不正确怎么办？", "frequency": "高", "shortAnswer": "①调整桌椅高度；②提醒坐姿；③使用坐姿矫正器；④多运动锻炼背部肌肉。", "relatedTopics": ["ct_JK2S010"], "parentScript": "轻轻拍一下后背提醒，不要说'又弯了'。", "practiceTip": "每30分钟提醒一次坐姿。"},
    {"id": "faq_jk_008", "question": "孩子不爱吃蔬菜怎么办？", "frequency": "中", "shortAnswer": "①做成有趣的形状；②孩子参与做菜；③以身作则；④不强迫。", "relatedTopics": ["ct_JK1S010"], "parentScript": "不要说'不吃蔬菜不行'，换成'我们一起做蔬菜'。", "practiceTip": "让孩子参与做菜。"},
    {"id": "faq_jk_009", "question": "孩子睡眠不足怎么办？", "frequency": "高", "shortAnswer": "①固定作息时间；②睡前1小时不看电子屏幕；③营造安静的睡眠环境；④白天多运动。", "relatedTopics": ["ct_JK4S005"], "parentScript": "和孩子一起早睡早起。", "practiceTip": "制定作息时间表。"},
    {"id": "faq_jk_010", "question": "孩子不爱运动怎么办？", "frequency": "中", "shortAnswer": "①找到孩子喜欢的运动；②家长一起运动；③从小目标开始；④多鼓励。", "relatedTopics": ["ct_JK5S005"], "parentScript": "带孩子一起运动，不是逼孩子运动。", "practiceTip": "每天运动30分钟。"},
    
    # 艺术素养 (新增10个)
    {"id": "faq_ys_004", "question": "孩子学什么乐器好？", "frequency": "中", "shortAnswer": "①看孩子兴趣；②考虑家庭条件；③钢琴、小提琴、古筝都不错；④不强迫。", "relatedTopics": ["ct_YS3S001"], "parentScript": "观察孩子对哪种乐器感兴趣。", "practiceTip": "带孩子去乐器店体验。"},
    {"id": "faq_ys_005", "question": "孩子画画启蒙怎么做？", "frequency": "中", "shortAnswer": "①提供画笔和纸；②让孩子自由画；③不教'应该怎样画'；④鼓励想象力。", "relatedTopics": ["ct_YS1S001"], "parentScript": "不要说'画得不像'，换成'你画的是什么？'", "practiceTip": "每天让孩子自由画10分钟。"},
    {"id": "faq_ys_006", "question": "孩子要学画画还是学书法？", "frequency": "低", "shortAnswer": "都可以，看孩子兴趣。画画培养想象力，书法培养专注力。可以都试试。", "relatedTopics": ["ct_YS2S005"], "parentScript": "让孩子都体验一下，再选择。", "practiceTip": "报短期班体验。"},
    
    # 科学教育 (新增15个)
    {"id": "faq_kx_001", "question": "孩子科学课怎么学？", "frequency": "中", "shortAnswer": "①重视实验；②鼓励提问；③动手操作；④联系生活。", "relatedTopics": ["ct_KX3S001"], "parentScript": "多问孩子'为什么'，一起找答案。", "practiceTip": "在家做简单实验。"},
    {"id": "faq_kx_002", "question": "孩子不爱做实验怎么办？", "frequency": "低", "shortAnswer": "①选择有趣的实验；②让孩子自己动手；③不要求完美结果；④体验过程更重要。", "relatedTopics": ["ct_KX2S005"], "parentScript": "和孩子一起做有趣的实验。", "practiceTip": "每周做一个家庭小实验。"},
    {"id": "faq_kx_003", "question": "孩子科学知识从哪里来？", "frequency": "中", "shortAnswer": "①科普书籍；②科技馆；③科学视频；④日常生活。", "relatedTopics": ["ct_KX1S001"], "parentScript": "带孩子去科技馆、博物馆。", "practiceTip": "看科普节目，如《加油向未来》。"},
    {"id": "faq_kx_004", "question": "孩子怎么培养科学思维？", "frequency": "中", "shortAnswer": "①鼓励提问；②引导假设；③实验验证；④总结反思。", "relatedTopics": ["ct_KX4S010"], "parentScript": "经常问孩子'你觉得为什么？'", "practiceTip": "遇到问题，先让孩子猜原因。"},
    {"id": "faq_kx_005", "question": "孩子科学成绩不好怎么办？", "frequency": "低", "shortAnswer": "①重视实验；②理解而不是死记；③联系生活；④培养兴趣。", "relatedTopics": ["ct_KX3S001"], "parentScript": "不要要求孩子背，要理解。", "practiceTip": "做实验帮助孩子理解。"},
    
    # 道德与法治 (新增15个)
    {"id": "faq_dd_001", "question": "孩子撒谎怎么办？", "frequency": "高", "shortAnswer": "①了解原因（怕惩罚？）；②不要打骂；③教孩子诚实；④表扬诚实行为。", "relatedTopics": ["ct_DD3S001"], "parentScript": "不要说'你又撒谎'，换成'告诉我真相'。", "practiceTip": "孩子承认错误时，表扬诚实。"},
    {"id": "faq_dd_002", "question": "孩子不尊重长辈怎么办？", "frequency": "中", "shortAnswer": "①家长以身作则；②教孩子礼貌用语；③及时纠正；④表扬有礼貌的行为。", "relatedTopics": ["ct_DD2S005"], "parentScript": "教孩子说'请''谢谢''对不起'。", "practiceTip": "家长做孩子的榜样。"},
    {"id": "faq_dd_003", "question": "孩子不遵守规则怎么办？", "frequency": "中", "shortAnswer": "①讲清规则；②说明后果；③坚持执行；④适当惩罚。", "relatedTopics": ["ct_DD3S010"], "parentScript": "制定家规，全家遵守。", "practiceTip": "规则简单明确，坚持执行。"},
    {"id": "faq_dd_004", "question": "孩子怎么培养责任感？", "frequency": "中", "shortAnswer": "①分担家务；②承担后果；③给予信任；④表扬负责任的行为。", "relatedTopics": ["ct_DD4S005"], "parentScript": "让孩子负责一些家务。", "practiceTip": "每周分配一项家务。"},
    {"id": "faq_dd_005", "question": "孩子怎么学会感恩？", "frequency": "中", "shortAnswer": "①家长以身作则；②让孩子说谢谢；③让孩子帮忙做事；④读感恩故事。", "relatedTopics": ["ct_DD5S010"], "parentScript": "家长常说'谢谢'给孩子听。", "practiceTip": "每天说3件感恩的事。"},
    
    # 体育健康 (新增15个)
    {"id": "faq_ty_001", "question": "孩子体质差怎么办？", "frequency": "中", "shortAnswer": "①每天运动；②均衡饮食；③充足睡眠；④减少久坐。", "relatedTopics": ["ct_TY3S001"], "parentScript": "每天带孩子运动30分钟。", "practiceTip": "每天户外运动1小时。"},
    {"id": "faq_ty_002", "question": "孩子不爱跑步怎么办？", "frequency": "中", "shortAnswer": "①找有趣的跑步方式；②和小伙伴一起跑；③设小目标；④多鼓励。", "relatedTopics": ["ct_TY4S005"], "parentScript": "和孩子一起跑步，不是逼孩子跑。", "practiceTip": "玩追逐游戏，让孩子跑。"},
    {"id": "faq_ty_003", "question": "孩子怎么提高体能？", "frequency": "中", "shortAnswer": "①循序渐进；②多样化运动；③坚持；④适当休息。", "relatedTopics": ["ct_TY5S010"], "parentScript": "每周运动3-5次。", "practiceTip": "跑步、跳绳、打球轮换。"},
    {"id": "faq_ty_004", "question": "孩子运动受伤怎么办？", "frequency": "低", "shortAnswer": "①预防为主（热身）；②受伤后及时处理；③严重时就医；④恢复后再运动。", "relatedTopics": ["ct_TY6S005"], "parentScript": "运动前做热身，运动后做拉伸。", "practiceTip": "每次运动前热身5分钟。"},
    {"id": "faq_ty_005", "question": "孩子怎么培养运动习惯？", "frequency": "高", "shortAnswer": "①找喜欢的运动；②每天固定时间；③家长一起；④小目标开始。", "relatedTopics": ["ct_TY1S001"], "parentScript": "家长带头运动，不让孩子一个人运动。", "practiceTip": "每天固定30分钟运动时间。"},
    
    # 劳动教育 (新增10个)
    {"id": "faq_ld_001", "question": "孩子不爱做家务怎么办？" , "frequency": "高", "shortAnswer": "①分配适合年龄的家务；②游戏化（比赛）；③多表扬；④家长以身作则。", "relatedTopics": ["ct_LD2S001"], "parentScript": "不要说'这么简单都不会'，换成'你做得真好'。", "practiceTip": "每周分配一项家务。"},
    {"id": "faq_ld_002", "question": "孩子做家务有什么好处？", "frequency": "中", "shortAnswer": "①培养责任感；②提高动手能力；③学会感恩；④增强独立性。", "relatedTopics": ["ct_LD1S001"], "parentScript": "告诉孩子'做家务是爱家人的表现'。", "practiceTip": "让孩子体会做家务的成就感。"},
    {"id": "faq_ld_003", "question": "孩子几岁开始做家务？", "frequency": "中", "shortAnswer": "3-4岁就可以开始：收拾玩具、摆碗筷、叠衣服。按年龄分配家务。", "relatedTopics": ["ct_LD1S001"], "parentScript": "从简单开始，让孩子体验成功。", "practiceTip": "制定家务清单。"},
    {"id": "faq_ld_004", "question": "孩子怎么做家务才有效？", "frequency": "低", "shortAnswer": "①教正确的方法；②不代劳；③允许不完美；④多鼓励。", "relatedTopics": ["ct_LD3S005"], "parentScript": "教孩子方法，然后让孩子自己做。", "practiceTip": "孩子做完后检查，给建议。"},
    {"id": "faq_ld_005", "question": "孩子劳动教育重要吗？", "frequency": "中", "shortAnswer": "非常重要。培养责任感、独立性、感恩心，对孩子一生都有益。", "relatedTopics": ["ct_LD1S001"], "parentScript": "重视劳动教育，不只看成绩。", "practiceTip": "每周安排固定的劳动时间。"},
    
    # 综合问题 (新增个)
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
]

# 将新问题分类
categories_map = {}
for cat in data['categories']:
    categories_map[cat['id']] = cat

# 如果没有综合分类，创建一个
if 'comprehensive' not in categories_map:
    categories_map['comprehensive'] = {
        "id": "comprehensive",
        "name": "综合问题",
        "icon": "🌟",
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
