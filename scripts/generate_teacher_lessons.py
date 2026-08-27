#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量生成教师高频课程：从20节扩充到50节
覆盖更多年级和学科
"""

import json
from pathlib import Path

DATA_DIR = Path('D:/xcode/fgit/cn-primary-taxonomy/data')

# 读取现有课程
with open(DATA_DIR / 'cache-teacher-lessons.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

existing_lessons = []
for cat in data['categories']:
    for lesson in cat['lessons']:
        existing_lessons.append(lesson)

existing_ids = {l['id'] for l in existing_lessons}
existing_titles = {l['title'] for l in existing_lessons}

print(f"现有课程数: {len(existing_lessons)}")

# 定义30节新增课程
new_lessons = [
    # 数学低年级 (新增2节)
    {
        "id": "lesson_sx_005",
        "title": "认识米",
        "grade": 2,
        "term": "下",
        "topicId": "ct_SX2S004",
        "difficulty": 2,
        "duration": "40分钟",
        "objectives": ["认识米，建立1米的长度观念", "学会用米尺量较长物体的长度"],
        "keyPoints": ["1米=100厘米", "米尺的使用", "选择合适的长度单位"],
        "difficultPoints": ["1米的实际长度观念", "米和厘米的换算"],
        "teachingProcess": [
            {"step": 1, "activity": "复习导入", "duration": "5分钟", "detail": "复习厘米，出示1米长的绳子，引出'米'。"},
            {"step": 2, "activity": "认识米", "duration": "10分钟", "detail": "观察米尺，认识1米，用双臂比划1米，找教室里1米长的物品。"},
            {"step": 3, "activity": "米和厘米的关系", "duration": "10分钟", "detail": "用米尺量1米长的绳子，数一数有多少厘米。得出1米=100厘米。"},
            {"step": 4, "activity": "巩固练习", "duration": "10分钟", "detail": "选择合适的长度单位填空，量教室的长度。"},
            {"step": 5, "activity": "总结拓展", "duration": "5分钟", "detail": "总结什么时候用米，什么时候用厘米。"}
        ],
        "blackboard设计": "左边：米尺放大图，标注1米=100厘米。右边：什么时候用米（较长物体），什么时候用厘米（较短物体）。",
        "commonStudentErrors": ["单位选错", "1米和100厘米混淆"],
        "differentiation": {
            "advanced": "估测教室的长度，再测量验证。",
            "support": "用米尺量课桌的长度，说出是几米几厘米。"
        }
    },
    {
        "id": "lesson_sx_006",
        "title": "不退位减法",
        "grade": 2,
        "term": "上",
        "topicId": "ct_SX2S012",
        "difficulty": 2,
        "duration": "40分钟",
        "objectives": ["理解不退位减法的算理", "掌握不退位减法的竖式计算方法"],
        "keyPoints": ["相同数位对齐", "从个位减起", "不够减时向前一位借1"],
        "difficultPoints": ["借位的处理", "连续退位"],
        "teachingProcess": [
            {"step": 1, "activity": "复习导入", "duration": "5分钟", "detail": "口算不退位减法：58-23=？复习计算方法。"},
            {"step": 2, "activity": "情境引入", "duration": "5分钟", "detail": "出示情境：有56个苹果，吃了24个，还剩多少个？"},
            {"step": 3, "activity": "探究算法", "duration": "10分钟", "detail": "用小棒摆56-24，先摆5捆6根，拿走2捆4根，剩3捆2根，所以是32。"},
            {"step": 4, "activity": "竖式教学", "duration": "10分钟", "detail": "结合小棒操作，教学竖式：6-4=2，5-2=3。强调相同数位对齐。"},
            {"step": 5, "activity": "巩固练习", "duration": "10分钟", "detail": "完成课本练习，判断竖式计算是否正误。"}
        ],
        "blackboard设计": "左边：小棒图（56-24）。右边：竖式计算过程。",
        "commonStudentErrors": ["数位没对齐", "减法算成加法"],
        "differentiation": {
            "advanced": "尝试被减数中间有0的退位减法。",
            "support": "先操作小棒，再列竖式。"
        }
    },
    # 数学中年级 (新增3节)
    {
        "id": "lesson_sx_007",
        "title": "三位数乘一位数",
        "grade": 3,
        "term": "上",
        "topicId": "ct_SX3S005",
        "difficulty": 3,
        "duration": "40分钟",
        "objectives": ["掌握三位数乘一位数的计算方法", "理解进位的处理"],
        "keyPoints": ["从个位乘起", "哪一位满几十向前一位进几", "进位要加上"],
        "difficultPoints": ["连续进位", "中间有0的乘法"],
        "teachingProcess": [
            {"step": 1, "activity": "复习导入", "duration": "5分钟", "detail": "口算两位数乘一位数：23×4=？复习计算方法。"},
            {"step": 2, "activity": "情境引入", "duration": "5分钟", "detail": "出示：一本书256元，买3本一共多少钱？"},
            {"step": 3, "activity": "探究算法", "duration": "10分钟", "detail": "引导学生用分步乘：200×3=600，50×3=150，6×3=18，600+150+18=768。"},
            {"step": 4, "activity": "竖式教学", "duration": "10分钟", "detail": "教学竖式：6×3=18，写8进1；5×3+1=16，写6进1；2×3+1=7。"},
            {"step": 5, "activity": "巩固练习", "duration": "10分钟", "detail": "完成课本练习，重点练习连续进位。"}
        ],
        "blackboard设计": "左边：256×3的竖式计算过程。右边：计算步骤。",
        "commonStudentErrors": ["进位忘记加", "数位对错"],
        "differentiation": {
            "advanced": "尝试因数中间有0的乘法。",
            "support": "先分步乘，再列竖式。"
        }
    },
    {
        "id": "lesson_sx_008",
        "title": "除法初步认识",
        "grade": 3,
        "term": "上",
        "topicId": "ct_SX3S010",
        "difficulty": 3,
        "duration": "40分钟",
        "objectives": ["理解除法的意义", "认识除法算式，会读会写"],
        "keyPoints": ["除法的意义：平均分", "除法算式的读写", "各部分名称"],
        "difficultPoints": ["理解平均分", "除法算式各部分名称"],
        "teachingProcess": [
            {"step": 1, "activity": "情境导入", "duration": "5分钟", "detail": "出示：12个苹果，平均分给3个小朋友，每人分几个？"},
            {"step": 2, "activity": "操作探究", "duration": "10分钟", "detail": "学生用小棒代替苹果，动手分一分，得出每人分4个。"},
            {"step": 3, "activity": "认识除法", "duration": "10分钟", "detail": "介绍除法：12÷3=4，读作12除以3等于4。介绍被除数、除数、商。"},
            {"step": 4, "activity": "巩固练习", "duration": "10分钟", "detail": "看图写除法算式，根据除法算式摆小棒。"},
            {"step": 5, "activity": "总结拓展", "duration": "5分钟", "detail": "总结：什么样的情境用除法？"}
        ],
        "blackboard设计": "左边：12个苹果平均分给3人。右边：12÷3=4，被除数÷除数=商。",
        "commonStudentErrors": ["除法算式读法错误", "各部分名称混淆"],
        "differentiation": {
            "advanced": "思考：12÷0可以吗？为什么？",
            "support": "先操作，再写算式。"
        }
    },
    {
        "id": "lesson_sx_009",
        "title": "长方形和正方形的周长",
        "grade": 3,
        "term": "下",
        "topicId": "ct_SX3S015",
        "difficulty": 3,
        "duration": "40分钟",
        "objectives": ["理解周长的意义", "掌握长方形和正方形周长的计算方法"],
        "keyPoints": ["周长的意义：一周的长度", "长方形周长=(长+宽)×2", "正方形周长=边长×4"],
        "difficultPoints": ["理解周长的意义", "周长公式的推导"],
        "teachingProcess": [
            {"step": 1, "activity": "情境导入", "duration": "5分钟", "detail": "出示：给相框围一圈彩带，需要多长的彩带？"},
            {"step": 2, "activity": "认识周长", "duration": "10分钟", "detail": "摸一摸课本的周长，描一描图形的周长。理解周长的意义。"},
            {"step": 3, "activity": "探究周长", "duration": "10分钟", "detail": "测量长方形卡片的周长，交流不同的测量方法。"},
            {"step": 4, "activity": "公式教学", "duration": "10分钟", "detail": "引导学生发现：长方形周长=(长+宽)×2，正方形周长=边长×4。"},
            {"step": 5, "activity": "巩固练习", "duration": "5分钟", "detail": "计算长方形和正方形的周长。"}
        ],
        "blackboard设计": "左边：长方形和正方形图。右边：周长公式。",
        "commonStudentErrors": ["周长和面积混淆", "公式记错"],
        "differentiation": {
            "advanced": "计算组合图形的周长。",
            "support": "先用绳子围一圈，再量长度。"
        }
    },
    # 数学高年级 (新增3节)
    {
        "id": "lesson_sx_010",
        "title": "小数乘法",
        "grade": 5,
        "term": "上",
        "topicId": "ct_SX5S005",
        "difficulty": 4,
        "duration": "40分钟",
        "objectives": ["掌握小数乘法的计算方法", "理解小数点位置的确定"],
        "keyPoints": ["先按整数乘法计算", "数因数中小数位数之和", "从积的末尾起数出小数位数"],
        "difficultPoints": ["小数点位置的确定", "积末尾有0的处理"],
        "teachingProcess": [
            {"step": 1, "activity": "复习导入", "duration": "5分钟", "detail": "复习整数乘法和小数的意义。"},
            {"step": 2, "activity": "情境引入", "duration": "5分钟", "detail": "出示：每千克苹果3.5元，买2.4千克需要多少钱？"},
            {"step": 3, "activity": "探究算法", "duration": "10分钟", "detail": "引导学生把3.5×2.4转化为35×24，计算后再点小数点。"},
            {"step": 4, "activity": "总结方法", "duration": "10分钟", "detail": "总结：一算（按整数乘）、二数（数小数位数）、三点（点小数点）。"},
            {"step": 5, "activity": "巩固练习", "duration": "10分钟", "detail": "完成课本练习，重点练习小数点位置的确定。"}
        ],
        "blackboard设计": "左边：3.5×2.4的计算过程。右边：小数乘法三步法。",
        "commonStudentErrors": ["小数点位置点错", "积末尾有0时出错"],
        "differentiation": {
            "advanced": "探索：一个数乘大于1的数，积会怎样？",
            "support": "先估算，再计算。"
        }
    },
    {
        "id": "lesson_sx_011",
        "title": "分数除法",
        "grade": 6,
        "term": "上",
        "topicId": "ct_SX6S005",
        "difficulty": 4,
        "duration": "40分钟",
        "objectives": ["掌握分数除法的计算方法", "理解除以分数等于乘倒数"],
        "keyPoints": ["除以分数等于乘倒数", "除以一个数等于乘这个数的倒数"],
        "difficultPoints": ["理解为什么除以分数等于乘倒数", "带分数的除法"],
        "teachingProcess": [
            {"step": 1, "activity": "复习导入", "duration": "5分钟", "detail": "复习分数乘法和倒数。"},
            {"step": 2, "activity": "情境引入", "duration": "5分钟", "detail": "出示：2升果汁，每瓶装1/2升，可以装几瓶？"},
            {"step": 3, "activity": "探究算法", "duration": "10分钟", "detail": "引导学生发现：2÷1/2=2×2=4。"},
            {"step": 4, "activity": "总结方法", "duration": "10分钟", "detail": "总结：除以一个分数等于乘这个分数的倒数。"},
            {"step": 5, "activity": "巩固练习", "duration": "10分钟", "detail": "完成课本练习，重点练习带分数的除法。"}
        ],
        "blackboard设计": "左边：2÷1/2=2×2=4。右边：分数除法法则。",
        "commonStudentErrors": ["忘记乘倒数", "带分数没化成假分数"],
        "differentiation": {
            "advanced": "探索：除以一个大于1的数，商会怎样？",
            "support": "用线段图帮助理解。"
        }
    },
    {
        "id": "lesson_sx_012",
        "title": "圆的周长",
        "grade": 6,
        "term": "上",
        "topicId": "ct_SX6S010",
        "difficulty": 3,
        "duration": "40分钟",
        "objectives": ["理解圆周率的意义", "掌握圆的周长计算公式"],
        "keyPoints": ["圆周率π的意义", "C=πd=2πr"],
        "difficultPoints": ["理解圆周率", "测量圆的周长"],
        "teachingProcess": [
            {"step": 1, "activity": "情境导入", "duration": "5分钟", "detail": "出示：自行车车轮滚动一圈能走多远？"},
            {"step": 2, "activity": "测量周长", "duration": "10分钟", "detail": "学生分组测量圆形物体的周长和直径，计算周长÷直径。"},
            {"step": 3, "activity": "认识圆周率", "duration": "10分钟", "detail": "介绍圆周率π，发现周长÷直径≈3.14。"},
            {"step": 4, "activity": "公式教学", "duration": "10分钟", "detail": "总结：C=πd=2πr。"},
            {"step": 5, "activity": "巩固练习", "duration": "5分钟", "detail": "计算圆的周长。"}
        ],
        "blackboard设计": "左边：圆形物体和周长测量。右边：C=πd=2πr。",
        "commonStudentErrors": ["π取3.14还是3", "直径和半径混淆"],
        "differentiation": {
            "advanced": "计算半圆的周长。",
            "support": "先测量，再计算。"
        }
    },
    # 语文低年级 (新增2节)
    {
        "id": "lesson_yw_004",
        "title": "拼音：声母韵母拼读",
        "grade": 1,
        "term": "上",
        "topicId": "ct_YW1S015",
        "difficulty": 2,
        "duration": "40分钟",
        "objectives": ["学会声母和韵母的拼读", "能拼读音节"],
        "keyPoints": ["声母轻短韵母响", "两音相连猛一碰"],
        "difficultPoints": ["拼读方法的掌握", "三拼音节"],
        "teachingProcess": [
            {"step": 1, "activity": "复习导入", "duration": "5分钟", "detail": "复习声母b、p、m、f和韵母a、o、e。"},
            {"step": 2, "activity": "拼读教学", "duration": "10分钟", "detail": "教师示范：b-a→ba，强调'声母轻短韵母响，两音相连猛一碰'。"},
            {"step": 3, "activity": "练习拼读", "duration": "15分钟", "detail": "学生练习拼读，开火车读，小组比赛。"},
            {"step": 4, "activity": "三拼音节", "duration": "5分钟", "detail": "教学三拼音节：g-u-a→gua。"},
            {"step": 5, "activity": "总结拓展", "duration": "5分钟", "detail": "总结拼读方法，布置练习。"}
        ],
        "blackboard设计": "左边：声母和韵母卡片。右边：拼读示范b-a→ba。",
        "commonStudentErrors": ["拼读时声母读得太重", "三拼音节漏读中间的韵母"],
        "differentiation": {
            "advanced": "练习拼读三拼音节。",
            "support": "先分开读，再连起来读。"
        }
    },
    {
        "id": "lesson_yw_005",
        "title": "汉字基本笔画",
        "grade": 1,
        "term": "上",
        "topicId": "ct_YW1S005",
        "difficulty": 1,
        "duration": "40分钟",
        "objectives": ["认识汉字基本笔画", "能正确书写基本笔画"],
        "keyPoints": ["横、竖、撇、捺、点", "笔画的书写方法"],
        "difficultPoints": ["笔画的起笔和收笔", "笔画的书写顺序"],
        "teachingProcess": [
            {"step": 1, "activity": "情境导入", "duration": "5分钟", "detail": "出示汉字，让学生观察汉字由什么组成。"},
            {"step": 2, "activity": "认识笔画", "duration": "10分钟", "detail": "介绍横、竖、撇、捺、点，教师示范书写。"},
            {"step": 3, "activity": "练习书写", "duration": "15分钟", "detail": "学生练习书写基本笔画，教师巡视指导。"},
            {"step": 4, "activity": "组字游戏", "duration": "5分钟", "detail": "用基本笔画拼出简单汉字。"},
            {"step": 5, "activity": "总结拓展", "duration": "5分钟", "detail": "总结基本笔画，布置练习。"}
        ],
        "blackboard设计": "左边：基本笔画示范。右边：笔画名称。",
        "commonStudentErrors": ["笔画书写不规范", "笔顺错误"],
        "differentiation": {
            "advanced": "练习写含有多个笔画的汉字。",
            "support": "先书空，再书写。"
        }
    },
    # 语文中年级 (新增2节)
    {
        "id": "lesson_yw_006",
        "title": "作文：我的好朋友",
        "grade": 3,
        "term": "上",
        "topicId": "ct_YW3S010",
        "difficulty": 3,
        "duration": "80分钟",
        "objectives": ["学会写人物作文", "能写出人物的特点"],
        "keyPoints": ["人物的外貌描写", "通过一件事写人物特点"],
        "difficultPoints": ["写出人物的特点", "把事情写具体"],
        "teachingProcess": [
            {"step": 1, "activity": "谈话导入", "duration": "5分钟", "detail": "说说你的好朋友是谁？他有什么特点？"},
            {"step": 2, "activity": "范文引路", "duration": "15分钟", "detail": "出示范文《我的好朋友》，分析作者是怎么写的。"},
            {"step": 3, "activity": "指导写作", "duration": "15分钟", "detail": "引导学生思考：写谁？他有什么特点？通过什么事来写？"},
            {"step": 4, "activity": "学生习作", "duration": "35分钟", "detail": "学生写作，教师巡视指导。"},
            {"step": 5, "activity": "讲评修改", "duration": "10分钟", "detail": "选取典型作文讲评，学生修改。"}
        ],
        "blackboard设计": "左边：作文结构（开头、中间、结尾）。右边：写作要点。",
        "commonStudentErrors": ["人物特点不突出", "事情写不具体"],
        "differentiation": {
            "advanced": "运用比喻、夸张等修辞手法。",
            "support": "先说再写，先写提纲。"
        }
    },
    {
        "id": "lesson_yw_007",
        "title": "古诗：《望庐山瀑布》",
        "grade": 3,
        "term": "上",
        "topicId": "ct_YW3S015",
        "difficulty": 2,
        "duration": "40分钟",
        "objectives": ["背诵古诗", "理解诗意，想象画面"],
        "keyPoints": ["背诵古诗", "理解诗意", "想象画面"],
        "difficultPoints": ["理解诗意", "想象画面"],
        "teachingProcess": [
            {"step": 1, "activity": "图片导入", "duration": "5分钟", "detail": "出示庐山瀑布图片，激发兴趣。"},
            {"step": 2, "activity": "朗读古诗", "duration": "10分钟", "detail": "教师范读，学生跟读，注意节奏。"},
            {"step": 3, "activity": "理解诗意", "duration": "10分钟", "detail": "逐句讲解，理解关键词：香炉、紫烟、挂、飞流、直下。"},
            {"step": 4, "activity": "想象画面", "duration": "10分钟", "detail": "听老师读，说说你看到了什么画面。"},
            {"step": 5, "activity": "背诵古诗", "duration": "5分钟", "detail": "学生背诵，同桌互背。"}
        ],
        "blackboard设计": "左边：古诗原文。右边：关键词解释。",
        "commonStudentErrors": ["读不出感情", "诗意理解错误"],
        "differentiation": {
            "advanced": "仿写一首描写景物的诗。",
            "support": "先理解，再背诵。"
        }
    },
    # 语文高年级 (新增2节)
    {
        "id": "lesson_yw_008",
        "title": "说明文阅读",
        "grade": 5,
        "term": "上",
        "topicId": "ct_YW5S010",
        "difficulty": 3,
        "duration": "40分钟",
        "objectives": ["了解说明文的特点", "掌握说明方法"],
        "keyPoints": ["说明文的特点", "常见的说明方法：列数字、举例子、作比较"],
        "difficultPoints": ["识别说明方法", "理解说明方法的作用"],
        "teachingProcess": [
            {"step": 1, "activity": "复习导入", "duration": "5分钟", "detail": "复习记叙文的特点，引出说明文。"},
            {"step": 2, "activity": "认识说明文", "duration": "10分钟", "detail": "出示范文，让学生发现说明文的特点。"},
            {"step": 3, "activity": "说明方法", "duration": "10分钟", "detail": "教学常见的说明方法：列数字、举例子、作比较、打比方。"},
            {"step": 4, "activity": "练习巩固", "duration": "10分钟", "detail": "阅读短文，找出使用的说明方法。"},
            {"step": 5, "activity": "总结拓展", "duration": "5分钟", "detail": "总结说明文的特点和说明方法。"}
        ],
        "blackboard设计": "左边：说明文特点。右边：常见说明方法。",
        "commonStudentErrors": ["说明方法判断错误", "说明方法作用说不清"],
        "differentiation": {
            "advanced": "分析说明方法的好处。",
            "support": "先找关键词，再判断说明方法。"
        }
    },
    {
        "id": "lesson_yw_009",
        "title": "作文：读后感",
        "grade": 5,
        "term": "下",
        "topicId": "ct_YW5S015",
        "difficulty": 4,
        "duration": "80分钟",
        "objectives": ["学会写读后感", "能写出自己的感受"],
        "keyPoints": ["读后感的结构：引、议、联、结", "写出自己的真实感受"],
        "difficultPoints": ["写出真实感受", "联系生活实际"],
        "teachingProcess": [
            {"step": 1, "activity": "谈话导入", "duration": "5分钟", "detail": "说说最近读了什么书？有什么感受？"},
            {"step": 2, "activity": "范文引路", "duration": "15分钟", "detail": "出示范文，分析读后感的结构。"},
            {"step": 3, "activity": "指导写作", "duration": "15分钟", "detail": "引导学生思考：读的什么书？有什么感受？联系了什么？"},
            {"step": 4, "activity": "学生习作", "duration": "35分钟", "detail": "学生写作，教师巡视指导。"},
            {"step": 5, "activity": "讲评修改", "duration": "10分钟", "detail": "选取典型作文讲评，学生修改。"}
        ],
        "blackboard设计": "左边：读后感结构（引、议、联、结）。右边：写作要点。",
        "commonStudentErrors": ["感受写不具体", "联系生活实际不够"],
        "differentiation": {
            "advanced": "运用多种表达方式。",
            "support": "先写提纲，再写作文。"
        }
    },
    # 英语低年级 (新增2节)
    {
        "id": "lesson_en_003",
        "title": "英语：认识字母",
        "grade": 1,
        "term": "上",
        "topicId": "ct_YY1S001",
        "difficulty": 1,
        "duration": "40分钟",
        "objectives": ["认识26个英文字母", "能正确书写字母"],
        "keyPoints": ["字母的认读", "字母的书写"],
        "difficultPoints": ["字母的发音", "字母的占格"],
        "teachingProcess": [
            {"step": 1, "activity": "歌曲导入", "duration": "5分钟", "detail": "播放ABC歌曲，激发兴趣。"},
            {"step": 2, "activity": "认识字母", "duration": "10分钟", "detail": "出示字母卡片，教师示范发音，学生跟读。"},
            {"step": 3, "activity": "书写教学", "duration": "10分钟", "detail": "教师示范书写，学生书空练习。"},
            {"step": 4, "activity": "游戏巩固", "duration": "10分钟", "detail": "字母游戏：找邻居、字母接龙。"},
            {"step": 5, "activity": "总结拓展", "duration": "5分钟", "detail": "总结字母发音，布置练习。"}
        ],
        "blackboard设计": "左边：字母表。右边：字母书写示范。",
        "commonStudentErrors": ["字母发音不准", "书写占格错误"],
        "differentiation": {
            "advanced": "学习字母在单词中的发音。",
            "support": "先认读，再书写。"
        }
    },
    {
        "id": "lesson_en_004",
        "title": "英语：数字1-10",
        "grade": 1,
        "term": "上",
        "topicId": "ct_YY1S005",
        "difficulty": 1,
        "duration": "40分钟",
        "objectives": ["学会用英语说1-10", "能听懂数字"],
        "keyPoints": ["数字1-10的认读", "数字的运用"],
        "difficultPoints": ["数字的发音", "数字的顺序"],
        "teachingProcess": [
            {"step": 1, "activity": "歌曲导入", "duration": "5分钟", "detail": "播放数字歌曲，激发兴趣。"},
            {"step": 2, "activity": "认识数字", "duration": "10分钟", "detail": "出示数字卡片，教师示范发音，学生跟读。"},
            {"step": 3, "activity": "游戏练习", "duration": "15分钟", "detail": "数字游戏：拍手报数、找朋友。"},
            {"step": 4, "activity": "运用数字", "duration": "5分钟", "detail": "数物品：How many? Ten."},
            {"step": 5, "activity": "总结拓展", "duration": "5分钟", "detail": "总结数字，布置练习。"}
        ],
        "blackboard设计": "左边：数字1-10。右边：How many? 句型。",
        "commonStudentErrors": ["数字发音不准", "数字顺序混乱"],
        "differentiation": {
            "advanced": "学习数字11-20。",
            "support": "先听，再说。"
        }
    },
    # 英语中年级 (新增2节)
    {
        "id": "lesson_en_005",
        "title": "英语：My Family",
        "grade": 3,
        "term": "上",
        "topicId": "ct_YY3S005",
        "difficulty": 2,
        "duration": "40分钟",
        "objectives": ["学会介绍家庭成员", "能用This is my...介绍家人"],
        "keyPoints": ["家庭成员词汇", "This is my...句型"],
        "difficultPoints": ["家庭成员词汇的记忆", "句型的运用"],
        "teachingProcess": [
            {"step": 1, "activity": "歌曲导入", "duration": "5分钟", "detail": "播放Family歌曲，激发兴趣。"},
            {"step": 2, "activity": "词汇教学", "duration": "10分钟", "detail": "教学家庭成员词汇：father, mother, brother, sister, grandpa, grandma。"},
            {"step": 3, "activity": "句型教学", "duration": "10分钟", "detail": "教学This is my...句型，学生练习。"},
            {"step": 4, "activity": "对话练习", "duration": "10分钟", "detail": "学生拿出全家福，用英语介绍家人。"},
            {"step": 5, "activity": "总结拓展", "duration": "5分钟", "detail": "总结词汇和句型，布置练习。"}
        ],
        "blackboard设计": "左边：家庭成员词汇。右边：This is my...句型。",
        "commonStudentErrors": ["词汇记忆错误", "句型运用不熟练"],
        "differentiation": {
            "advanced": "用He/She is...描述家人。",
            "support": "先看图说，再自由说。"
        }
    },
    {
        "id": "lesson_en_006",
        "title": "英语：What's your name?",
        "grade": 3,
        "term": "上",
        "topicId": "ct_YY3S001",
        "difficulty": 1,
        "duration": "40分钟",
        "objectives": ["学会询问名字", "能回答What's your name? My name is..."],
        "keyPoints": ["What's your name?", "My name is..."],
        "difficultPoints": ["name的发音", "句型的运用"],
        "teachingProcess": [
            {"step": 1, "activity": "歌曲导入", "duration": "5分钟", "detail": "播放Hello歌曲，激发兴趣。"},
            {"step": 2, "activity": "句型教学", "duration": "10分钟", "detail": "教学What's your name? My name is...，教师示范。"},
            {"step": 3, "activity": "对话练习", "duration": "15分钟", "detail": "学生两人一组，练习对话。"},
            {"step": 4, "activity": "角色扮演", "duration": "5分钟", "detail": "创设情境，学生表演对话。"},
            {"step": 5, "activity": "总结拓展", "duration": "5分钟", "detail": "总结句型，布置练习。"}
        ],
        "blackboard设计": "左边：What's your name? 右边：My name is...",
        "commonStudentErrors": ["name发音不准", "句型运用不熟练"],
        "differentiation": {
            "advanced": "学习How old are you?",
            "support": "先跟读，再自由说。"
        }
    },
    # 科学 (新增2节)
    {
        "id": "lesson_kx_002",
        "title": "科学：植物的结构",
        "grade": 3,
        "term": "上",
        "topicId": "ct_KX3S001",
        "difficulty": 2,
        "duration": "40分钟",
        "objectives": ["认识植物的结构", "了解各部分的功能"],
        "keyPoints": ["根、茎、叶、花、果实、种子", "各部分的功能"],
        "difficultPoints": ["各部分功能的理解", "植物结构的观察"],
        "teachingProcess": [
            {"step": 1, "activity": "情境导入", "duration": "5分钟", "detail": "出示植物图片，让学生观察。"},
            {"step": 2, "activity": "认识结构", "duration": "10分钟", "detail": "教学植物的结构：根、茎、叶、花、果实、种子。"},
            {"step": 3, "activity": "观察实验", "duration": "15分钟", "detail": "学生分组观察植物，记录各部分。"},
            {"step": 4, "activity": "讨论交流", "duration": "5分钟", "detail": "讨论各部分的功能。"},
            {"step": 5, "activity": "总结拓展", "duration": "5分钟", "detail": "总结植物结构和功能。"}
        ],
        "blackboard设计": "左边：植物结构图。右边：各部分功能。",
        "commonStudentErrors": ["各部分功能混淆", "观察不仔细"],
        "differentiation": {
            "advanced": "了解不同植物的结构差异。",
            "support": "先观察实物，再记录。"
        }
    },
    {
        "id": "lesson_kx_003",
        "title": "科学：动物的分类",
        "grade": 4,
        "term": "上",
        "topicId": "ct_KX4S001",
        "difficulty": 2,
        "duration": "40分钟",
        "objectives": ["了解动物的分类方法", "能根据特征分类"],
        "keyPoints": ["脊椎动物和无脊椎动物", "分类方法"],
        "difficultPoints": ["分类标准的确定", "脊椎动物的特征"],
        "teachingProcess": [
            {"step": 1, "activity": "情境导入", "duration": "5分钟", "detail": "出示各种动物图片，让学生分类。"},
            {"step": 2, "activity": "认识分类", "duration": "10分钟", "detail": "教学脊椎动物和无脊椎动物的概念。"},
            {"step": 3, "activity": "分类活动", "duration": "15分钟", "detail": "学生分组，给动物分类。"},
            {"step": 4, "activity": "讨论交流", "duration": "5分钟", "detail": "交流分类结果和理由。"},
            {"step": 5, "activity": "总结拓展", "duration": "5分钟", "detail": "总结分类方法。"}
        ],
        "blackboard设计": "左边：动物分类图。右边：分类标准。",
        "commonStudentErrors": ["分类标准不统一", "脊椎动物特征理解错误"],
        "differentiation": {
            "advanced": "了解更细的分类：哺乳动物、鸟类等。",
            "support": "先观察特征，再分类。"
        }
    },
    # 道法 (新增1节)
    {
        "id": "lesson_dd_002",
        "title": "道法：我爱我家",
        "grade": 2,
        "term": "上",
        "topicId": "ct_DD2S001",
        "difficulty": 1,
        "duration": "40分钟",
        "objectives": ["感受家庭的温暖", "学会爱家人"],
        "keyPoints": ["家庭的温暖", "爱家人的表现"],
        "difficultPoints": ["理解家人的爱", "表达爱的方式"],
        "teachingProcess": [
            {"step": 1, "activity": "故事导入", "duration": "5分钟", "detail": "讲述一个关于家庭温暖的故事。"},
            {"step": 2, "activity": "分享交流", "duration": "10分钟", "detail": "学生分享家人关爱自己的故事。"},
            {"step": 3, "activity": "讨论感悟", "duration": "10分钟", "detail": "讨论：家人是怎么爱我们的？"},
            {"step": 4, "activity": "学会表达", "duration": "10分钟", "detail": "讨论：我们可以为家人做什么？"},
            {"step": 5, "activity": "总结拓展", "duration": "5分钟", "detail": "总结：爱家人，从点滴做起。"}
        ],
        "blackboard设计": "左边：家庭的温暖。右边：爱家人的表现。",
        "commonStudentErrors": ["不理解家人的爱", "不会表达爱"],
        "differentiation": {
            "advanced": "制作感恩卡送给家人。",
            "support": "先说，再做。"
        }
    },
    # 体育 (新增1节)
    {
        "id": "lesson_ty_001",
        "title": "体育：跳绳",
        "grade": 3,
        "term": "上",
        "topicId": "ct_TY3S001",
        "difficulty": 2,
        "duration": "40分钟",
        "objectives": ["学会跳绳", "掌握跳绳技巧"],
        "keyPoints": ["跳绳的姿势", "跳绳的节奏"],
        "difficultPoints": ["手脚协调", "连续跳绳"],
        "teachingProcess": [
            {"step": 1, "activity": "准备活动", "duration": "5分钟", "detail": "慢跑、热身操。"},
            {"step": 2, "activity": "示范教学", "duration": "10分钟", "detail": "教师示范跳绳，讲解动作要领。"},
            {"step": 3, "activity": "分组练习", "duration": "15分钟", "detail": "学生分组练习，教师指导。"},
            {"step": 4, "activity": "比赛巩固", "duration": "5分钟", "detail": "跳绳比赛，激发兴趣。"},
            {"step": 5, "activity": "放松总结", "duration": "5分钟", "detail": "放松操，总结学习情况。"}
        ],
        "blackboard设计": "左边：跳绳动作要领。右边：注意事项。",
        "commonStudentErrors": ["手脚不协调", "节奏不稳"],
        "differentiation": {
            "advanced": "学习花样跳绳。",
            "support": "先空手练习，再拿绳练习。"
        }
    },
    # 美术 (新增1节)
    {
        "id": "lesson_ms_001",
        "title": "美术：简笔画",
        "grade": 2,
        "term": "上",
        "topicId": "ct_MS2S001",
        "difficulty": 1,
        "duration": "40分钟",
        "objectives": ["学会画简笔画", "能用简单图形表现物体"],
        "keyPoints": ["圆形、三角形、方形", "组合图形表现物体"],
        "difficultPoints": ["图形的组合", "物体的简化"],
        "teachingProcess": [
            {"step": 1, "activity": "欣赏导入", "duration": "5分钟", "detail": "展示简笔画作品，激发兴趣。"},
            {"step": 2, "activity": "认识图形", "duration": "10分钟", "detail": "认识圆形、三角形、方形，练习画基本图形。"},
            {"step": 3, "activity": "示范教学", "duration": "10分钟", "detail": "教师示范用基本图形画小动物。"},
            {"step": 4, "activity": "学生创作", "duration": "10分钟", "detail": "学生创作简笔画，教师指导。"},
            {"step": 5, "activity": "展示评价", "duration": "5分钟", "detail": "展示作品，互相评价。"}
        ],
        "blackboard设计": "左边：基本图形。右边：简笔画示范。",
        "commonStudentErrors": ["图形画不标准", "组合不协调"],
        "differentiation": {
            "advanced": "创作有情节的简笔画。",
            "support": "先临摹，再创作。"
        }
    },
    # 音乐 (新增1节)
    {
        "id": "lesson_yy_001",
        "title": "音乐：唱歌《小星星》",
        "grade": 1,
        "term": "上",
        "topicId": "ct_YY1S001",
        "difficulty": 1,
        "duration": "40分钟",
        "objectives": ["学会唱《小星星》", "能有表情地演唱"],
        "keyPoints": ["歌词记忆", "旋律掌握"],
        "difficultPoints": ["音准", "节奏"],
        "teachingProcess": [
            {"step": 1, "activity": "律动导入", "duration": "5分钟", "detail": "播放《小星星》旋律，学生律动。"},
            {"step": 2, "activity": "学唱歌曲", "duration": "15分钟", "detail": "教师范唱，学生跟唱，分句教唱。"},
            {"step": 3, "activity": "歌词记忆", "duration": "10分钟", "detail": "出示歌词，学生记忆歌词。"},
            {"step": 4, "activity": "表演唱", "duration": "5分钟", "detail": "学生有表情地演唱，加上动作。"},
            {"step": 5, "activity": "总结拓展", "duration": "5分钟", "detail": "总结学习情况，布置练习。"}
        ],
        "blackboard设计": "左边：《小星星》歌词。右边：旋律线。",
        "commonStudentErrors": ["歌词记错", "音准不准"],
        "differentiation": {
            "advanced": "学习用乐器伴奏。",
            "support": "先听，再唱。"
        }
    },
    # 信息科技 (新增1节)
    {
        "id": "lesson_xx_001",
        "title": "信息科技：认识计算机",
        "grade": 3,
        "term": "上",
        "topicId": "ct_XX3S001",
        "difficulty": 1,
        "duration": "40分钟",
        "objectives": ["认识计算机的组成部分", "了解计算机的基本操作"],
        "keyPoints": ["显示器、主机、键盘、鼠标", "开机、关机操作"],
        "difficultPoints": ["各部分的功能", "鼠标的操作"],
        "teachingProcess": [
            {"step": 1, "activity": "情境导入", "duration": "5分钟", "detail": "展示计算机，激发兴趣。"},
            {"step": 2, "activity": "认识组成", "duration": "10分钟", "detail": "教学计算机的组成部分：显示器、主机、键盘、鼠标。"},
            {"step": 3, "activity": "基本操作", "duration": "10分钟", "detail": "教学开机、关机，鼠标的操作。"},
            {"step": 4, "activity": "实践操作", "duration": "10分钟", "detail": "学生练习开机、关机、鼠标操作。"},
            {"step": 5, "activity": "总结拓展", "duration": "5分钟", "detail": "总结学习情况，布置练习。"}
        ],
        "blackboard设计": "左边：计算机组成图。右边：基本操作。",
        "commonStudentErrors": ["鼠标操作不熟练", "各部分功能混淆"],
        "differentiation": {
            "advanced": "学习使用画图软件。",
            "support": "先观察，再操作。"
        }
    },
    # AI素养 (新增1节)
    {
        "id": "lesson_ai_001",
        "title": "AI素养：认识AI",
        "grade": 5,
        "term": "上",
        "topicId": "ct_AI5S001",
        "difficulty": 1,
        "duration": "40分钟",
        "objectives": ["了解AI的概念", "知道AI的应用"],
        "keyPoints": ["AI的概念", "AI的应用"],
        "difficultPoints": ["理解AI的概念", "AI与人类的区别"],
        "teachingProcess": [
            {"step": 1, "activity": "视频导入", "duration": "5分钟", "detail": "播放AI应用视频，激发兴趣。"},
            {"step": 2, "activity": "认识AI", "duration": "10分钟", "detail": "讲解AI的概念，让学生理解什么是AI。"},
            {"step": 3, "activity": "AI应用", "duration": "10分钟", "detail": "展示AI在生活中的应用：语音助手、自动驾驶等。"},
            {"step": 4, "activity": "讨论交流", "duration": "10分钟", "detail": "讨论：AI会取代人类吗？"},
            {"step": 5, "activity": "总结拓展", "duration": "5分钟", "detail": "总结AI的概念和应用。"}
        ],
        "blackboard设计": "左边：AI的概念。右边：AI的应用。",
        "commonStudentErrors": ["AI概念理解错误", "AI与人类混淆"],
        "differentiation": {
            "advanced": "了解AI的原理。",
            "support": "先看视频，再讨论。"
        }
    }
]

# 将新课程添加到现有数据中
# 按学科分类
categories_map = {}
for cat in data['categories']:
    categories_map[cat['id']] = cat

# 为没有找到分类的课程创建新分类
new_categories = {
    "math_upper": {"id": "math_upper", "name": "数学（高年级5-6年级）", "icon": "🔢", "lessons": []},
    "chinese_upper": {"id": "chinese_upper", "name": "语文（高年级5-6年级）", "icon": "📖", "lessons": []},
    "english_lower": {"id": "english_lower", "name": "英语（低年级1-2年级）", "icon": "🔤", "lessons": []},
    "english_middle": {"id": "english_middle", "name": "英语（中年级3-4年级）", "icon": "🔤", "lessons": []},
    "science": {"id": "science", "name": "科学", "icon": "🔬", "lessons": []},
    "moral": {"id": "moral", "name": "道德与法治", "icon": "⚖️", "lessons": []},
    "pe": {"id": "pe", "name": "体育与健康", "icon": "🏃", "lessons": []},
    "art": {"id": "art", "name": "美术", "icon": "🎨", "lessons": []},
    "music": {"id": "music", "name": "音乐", "icon": "🎵", "lessons": []},
    "it": {"id": "it", "name": "信息科技", "icon": "💻", "lessons": []},
    "ai": {"id": "ai", "name": "AI素养", "icon": "🤖", "lessons": []}
}

# 将新课程分类
for lesson in new_lessons:
    lesson_id = lesson['id']
    if lesson_id.startswith('lesson_sx'):
        if lesson['grade'] <= 2:
            cat_id = 'math_lower'
        elif lesson['grade'] <= 4:
            cat_id = 'math_middle'
        else:
            cat_id = 'math_upper'
    elif lesson_id.startswith('lesson_yw'):
        if lesson['grade'] <= 2:
            cat_id = 'chinese_lower'
        elif lesson['grade'] <= 4:
            cat_id = 'chinese_middle'
        else:
            cat_id = 'chinese_upper'
    elif lesson_id.startswith('lesson_en'):
        if lesson['grade'] <= 2:
            cat_id = 'english_lower'
        else:
            cat_id = 'english_middle'
    elif lesson_id.startswith('lesson_kx'):
        cat_id = 'science'
    elif lesson_id.startswith('lesson_dd'):
        cat_id = 'moral'
    elif lesson_id.startswith('lesson_ty'):
        cat_id = 'pe'
    elif lesson_id.startswith('lesson_ms'):
        cat_id = 'art'
    elif lesson_id.startswith('lesson_yy'):
        cat_id = 'music'
    elif lesson_id.startswith('lesson_xx'):
        cat_id = 'it'
    elif lesson_id.startswith('lesson_ai'):
        cat_id = 'ai'
    else:
        cat_id = 'math_lower'
    
    if cat_id in categories_map:
        categories_map[cat_id]['lessons'].append(lesson)
    elif cat_id in new_categories:
        new_categories[cat_id]['lessons'].append(lesson)

# 将新分类添加到数据中（只添加有课程的）
for cat_id, cat in new_categories.items():
    if cat['lessons']:
        data['categories'].append(cat)

# 更新版本信息
data['version'] = 'v3.0-teacher-lessons'
data['description'] = '教师高频课程缓存——基于阮一峰科技周刊「缓存思维」，将教师最常备的50节课缓存起来，一键获取教学设计。'

# 保存
with open(DATA_DIR / 'cache-teacher-lessons.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# 统计
total_lessons = sum(len(cat['lessons']) for cat in data['categories'])
print(f"生成完成！总课程数: {total_lessons}")

# 如果不够50节，补充一些通用课程
if total_lessons < 50:
    needed = 50 - total_lessons
    print(f"需要补充 {needed} 节课程")
    
    # 补充课程
    extra_lessons = [
        {
            "id": "lesson_sx_013",
            "title": "统计与概率",
            "grade": 4,
            "term": "下",
            "topicId": "ct_SX4S020",
            "difficulty": 3,
            "duration": "40分钟",
            "objectives": ["学会收集数据", "能用统计图表示数据"],
            "keyPoints": ["数据收集", "条形统计图"],
            "difficultPoints": ["数据的分析和解读"],
            "teachingProcess": [
                {"step": 1, "activity": "情境导入", "duration": "5分钟", "detail": "出示班级同学最喜欢的水果，怎么知道哪种最受欢迎？"},
                {"step": 2, "activity": "收集数据", "duration": "10分钟", "detail": "学生分组收集数据。"},
                {"step": 3, "activity": "制作统计图", "duration": "15分钟", "detail": "教学条形统计图的制作方法。"},
                {"step": 4, "activity": "分析数据", "duration": "5分钟", "detail": "从统计图中你能发现什么？"},
                {"step": 5, "activity": "总结拓展", "duration": "5分钟", "detail": "总结统计图的作用。"}
            ],
            "blackboard设计": "左边：统计表。右边：条形统计图。",
            "commonStudentErrors": ["统计图画不规范", "数据分析不准确"],
            "differentiation": {
                "advanced": "制作复式条形统计图。",
                "support": "先填统计表，再画图。"
            }
        },
        {
            "id": "lesson_yw_010",
            "title": "作文：写日记",
            "grade": 2,
            "term": "下",
            "topicId": "ct_YW2S010",
            "difficulty": 2,
            "duration": "40分钟",
            "objectives": ["学会写日记", "能写出自己的感受"],
            "keyPoints": ["日记的格式", "写出自己的感受"],
            "difficultPoints": ["把感受写具体"],
            "teachingProcess": [
                {"step": 1, "activity": "谈话导入", "duration": "5分钟", "detail": "你们有写日记的习惯吗？"},
                {"step": 2, "activity": "认识日记", "duration": "10分钟", "detail": "教学日记的格式：日期、天气、正文。"},
                {"step": 3, "activity": "范文引路", "duration": "10分钟", "detail": "出示范文，分析怎么写。"},
                {"step": 4, "activity": "学生习作", "duration": "10分钟", "detail": "学生写一篇日记。"},
                {"step": 5, "activity": "讲评修改", "duration": "5分钟", "detail": "选取典型日记讲评。"}
            ],
            "blackboard设计": "左边：日记格式。右边：范文。",
            "commonStudentErrors": ["格式错误", "内容不具体"],
            "differentiation": {
                "advanced": "写出自己的感想。",
                "support": "先说再写。"
            }
        },
        {
            "id": "lesson_en_007",
            "title": "英语：Colours",
            "grade": 2,
            "term": "上",
            "topicId": "ct_YY2S001",
            "difficulty": 1,
            "duration": "40分钟",
            "objectives": ["学会颜色的英语表达", "能说出物品的颜色"],
            "keyPoints": ["颜色词汇", "What colour is it? It's..."],
            "difficultPoints": ["颜色词汇的记忆"],
            "teachingProcess": [
                {"step": 1, "activity": "歌曲导入", "duration": "5分钟", "detail": "播放颜色歌曲。"},
                {"step": 2, "activity": "词汇教学", "duration": "10分钟", "detail": "教学颜色词汇：red, blue, yellow, green。"},
                {"step": 3, "activity": "句型教学", "duration": "10分钟", "detail": "教学What colour is it? It's..."},
                {"step": 4, "activity": "游戏练习", "duration": "10分钟", "detail": "颜色游戏：猜颜色。"},
                {"step": 5, "activity": "总结拓展", "duration": "5分钟", "detail": "总结颜色词汇。"}
            ],
            "blackboard设计": "左边：颜色词汇。右边：句型。",
            "commonStudentErrors": ["颜色词汇混淆"],
            "differentiation": {
                "advanced": "学习更多颜色词汇。",
                "support": "先看颜色，再说。"
            }
        },
        {
            "id": "lesson_kx_004",
            "title": "科学：水的三态变化",
            "grade": 3,
            "term": "下",
            "topicId": "ct_KX3S005",
            "difficulty": 2,
            "duration": "40分钟",
            "objectives": ["了解水的三态变化", "知道三态变化的条件"],
            "keyPoints": ["固态、液态、气态", "三态变化的条件"],
            "difficultPoints": ["理解三态变化的条件"],
            "teachingProcess": [
                {"step": 1, "activity": "实验导入", "duration": "5分钟", "detail": "观察冰融化成水。"},
                {"step": 2, "activity": "认识三态", "duration": "10分钟", "detail": "教学固态、液态、气态。"},
                {"step": 3, "activity": "实验探究", "duration": "15分钟", "detail": "学生分组实验，观察水的三态变化。"},
                {"step": 4, "activity": "讨论交流", "duration": "5分钟", "detail": "讨论三态变化的条件。"},
                {"step": 5, "activity": "总结拓展", "duration": "5分钟", "detail": "总结水的三态变化。"}
            ],
            "blackboard设计": "左边：水的三态图。右边：变化条件。",
            "commonStudentErrors": ["三态变化条件理解错误"],
            "differentiation": {
                "advanced": "了解生活中的三态变化。",
                "support": "先观察，再记录。"
            }
        },
        {
            "id": "lesson_dd_003",
            "title": "道法：我爱学校",
            "grade": 3,
            "term": "上",
            "topicId": "ct_DD3S001",
            "difficulty": 1,
            "duration": "40分钟",
            "objectives": ["了解学校", "学会爱学校"],
            "keyPoints": ["学校的环境", "爱学校的表现"],
            "difficultPoints": ["理解爱学校的表现"],
            "teachingProcess": [
                {"step": 1, "activity": "图片导入", "duration": "5分钟", "detail": "展示学校图片。"},
                {"step": 2, "activity": "认识学校", "duration": "10分钟", "detail": "学生介绍自己的学校。"},
                {"step": 3, "activity": "讨论交流", "duration": "10分钟", "detail": "讨论：怎么爱学校？"},
                {"step": 4, "activity": "制定计划", "duration": "10分钟", "detail": "学生制定爱学校计划。"},
                {"step": 5, "activity": "总结拓展", "duration": "5分钟", "detail": "总结爱学校的表现。"}
            ],
            "blackboard设计": "左边：学校图片。右边：爱学校的表现。",
            "commonStudentErrors": ["不理解爱学校的表现"],
            "differentiation": {
                "advanced": "制作爱学校海报。",
                "support": "先说再做。"
            }
        },
        {
            "id": "lesson_ty_002",
            "title": "体育：立定跳远",
            "grade": 2,
            "term": "上",
            "topicId": "ct_TY2S001",
            "difficulty": 2,
            "duration": "40分钟",
            "objectives": ["学会立定跳远", "掌握跳远技巧"],
            "keyPoints": ["起跳姿势", "落地技巧"],
            "difficultPoints": ["起跳和落地的协调"],
            "teachingProcess": [
                {"step": 1, "activity": "准备活动", "duration": "5分钟", "detail": "慢跑、热身操。"},
                {"step": 2, "activity": "示范教学", "duration": "10分钟", "detail": "教师示范立定跳远。"},
                {"step": 3, "activity": "分组练习", "duration": "15分钟", "detail": "学生分组练习。"},
                {"step": 4, "activity": "比赛巩固", "duration": "5分钟", "detail": "跳远比赛。"},
                {"step": 5, "activity": "放松总结", "duration": "5分钟", "detail": "放松操，总结。"}
            ],
            "blackboard设计": "左边：跳远动作要领。右边：注意事项。",
            "commonStudentErrors": ["起跳姿势不正确", "落地不稳"],
            "differentiation": {
                "advanced": "挑战更远的目标。",
                "support": "先分解动作，再完整练习。"
            }
        },
        {
            "id": "lesson_ms_002",
            "title": "美术：折纸",
            "grade": 1,
            "term": "下",
            "topicId": "ct_MS1S001",
            "difficulty": 1,
            "duration": "40分钟",
            "objectives": ["学会折纸", "能折出简单作品"],
            "keyPoints": ["折纸的基本方法", "折纸的步骤"],
            "difficultPoints": ["折纸的准确性"],
            "teachingProcess": [
                {"step": 1, "activity": "作品展示", "duration": "5分钟", "detail": "展示折纸作品。"},
                {"step": 2, "activity": "示范教学", "duration": "10分钟", "detail": "教师示范折纸。"},
                {"step": 3, "activity": "学生练习", "duration": "15分钟", "detail": "学生练习折纸。"},
                {"step": 4, "activity": "作品展示", "duration": "5分钟", "detail": "展示学生作品。"},
                {"step": 5, "activity": "总结拓展", "duration": "5分钟", "detail": "总结折纸方法。"}
            ],
            "blackboard设计": "左边：折纸步骤。右边：作品展示。",
            "commonStudentErrors": ["折纸不准确"],
            "differentiation": {
                "advanced": "创作复杂的折纸作品。",
                "support": "先跟着老师折，再自己折。"
            }
        }
    ]
    
    # 添加补充课程
    for lesson in extra_lessons[:needed]:
        lesson_id = lesson['id']
        if lesson_id.startswith('lesson_sx'):
            if lesson['grade'] <= 2:
                cat_id = 'math_lower'
            elif lesson['grade'] <= 4:
                cat_id = 'math_middle'
            else:
                cat_id = 'math_upper'
        elif lesson_id.startswith('lesson_yw'):
            if lesson['grade'] <= 2:
                cat_id = 'chinese_lower'
            elif lesson['grade'] <= 4:
                cat_id = 'chinese_middle'
            else:
                cat_id = 'chinese_upper'
        elif lesson_id.startswith('lesson_en'):
            if lesson['grade'] <= 2:
                cat_id = 'english_lower'
            else:
                cat_id = 'english_middle'
        elif lesson_id.startswith('lesson_kx'):
            cat_id = 'science'
        elif lesson_id.startswith('lesson_dd'):
            cat_id = 'moral'
        elif lesson_id.startswith('lesson_ty'):
            cat_id = 'pe'
        elif lesson_id.startswith('lesson_ms'):
            cat_id = 'art'
        elif lesson_id.startswith('lesson_yy'):
            cat_id = 'music'
        elif lesson_id.startswith('lesson_xx'):
            cat_id = 'it'
        elif lesson_id.startswith('lesson_ai'):
            cat_id = 'ai'
        else:
            cat_id = 'math_lower'
        
        if cat_id in categories_map:
            categories_map[cat_id]['lessons'].append(lesson)
        elif cat_id in new_categories:
            new_categories[cat_id]['lessons'].append(lesson)
    
    # 重新保存
    with open(DATA_DIR / 'cache-teacher-lessons.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    total_lessons = sum(len(cat['lessons']) for cat in data['categories'])
    print(f"补充完成！总课程数: {total_lessons}")
print(f"分类数: {len(data['categories'])}")
for cat in data['categories']:
    print(f"  {cat['name']}: {len(cat['lessons'])}节")
