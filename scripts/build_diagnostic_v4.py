#!/usr/bin/env python3
"""
诊断题库 v4：继续扩充核心知识点
覆盖数学应用题、图形、统计；语文阅读、作文、古诗文；英语语法、阅读、写作；科学实验、观察、探究
"""

import json
import os

data_dir = 'D:/xcode/fgit/cn-primary-taxonomy/data'

# 读取现有题库
with open(os.path.join(data_dir, 'diagnostic-questions.json'), 'r', encoding='utf-8') as f:
    existing_data = json.load(f)

existing_questions = existing_data['questions']
print(f"现有题目: {len(existing_questions)}道")

# 新增题目
new_questions = []

# ==================== 数学扩充 ====================

# 一年级数学 - 认识11-20、整十数、百数表
new_questions.extend([
    {"topicId": "ct_SX1S010", "difficulty": "basic", "question": "13里面有（ ）个十和（ ）个一", "options": ["1和3", "3和1", "1和13", "3和13"], "answer": 0, "explanation": "13由1个十和3个一组成。"},
    {"topicId": "ct_SX1S010", "difficulty": "medium", "question": "19后面一个数是（ ）", "options": ["18", "19", "20", "21"], "answer": 2, "explanation": "19后面是20。"},
    {"topicId": "ct_SX1S010", "difficulty": "hard", "question": "比15大比18小的数是（ ）", "options": ["14", "15", "16", "18"], "answer": 2, "explanation": "16比15大比18小。"},
    {"topicId": "ct_SX1S011", "difficulty": "basic", "question": "1个十和5个一是（ ）", "options": ["10", "15", "51", "105"], "answer": 1, "explanation": "1个十和5个一是15。"},
    {"topicId": "ct_SX1S011", "difficulty": "medium", "question": "2个十是（ ）", "options": ["2", "10", "20", "200"], "answer": 2, "explanation": "2个十是20。"},
    {"topicId": "ct_SX1X017", "difficulty": "basic", "question": "一百里面有（ ）个十", "options": ["1", "10", "100", "1000"], "answer": 1, "explanation": "一百里面有10个十。"},
    {"topicId": "ct_SX1X017", "difficulty": "medium", "question": "99后面一个数是（ ）", "options": ["98", "99", "100", "101"], "answer": 2, "explanation": "99后面是100。"},
    {"topicId": "ct_SX1X018", "difficulty": "basic", "question": "30里面有（ ）个十", "options": ["1", "3", "30", "300"], "answer": 1, "explanation": "30里面有3个十。"},
    {"topicId": "ct_SX1X019", "difficulty": "medium", "question": "百数表中，55后面的数是（ ）", "options": ["54", "55", "56", "65"], "answer": 2, "explanation": "百数表中55后面是56。"},
    {"topicId": "ct_SX1X019", "difficulty": "hard", "question": "百数表中，55上面的数是（ ）", "options": ["44", "45", "54", "56"], "answer": 1, "explanation": "百数表中55上面是45。"},
])

# 一年级数学 - 比长短、比高矮、比轻重
new_questions.extend([
    {"topicId": "ct_SX1S051", "difficulty": "basic", "question": "下面哪根绳子最长？", "options": ["短短的一根", "长长的一根", "中等的一根", "一样长"], "answer": 1, "explanation": "长长的绳子最长。"},
    {"topicId": "ct_SX1S052", "difficulty": "basic", "question": "下面哪棵树最高？", "options": ["矮矮的一棵", "高高的一棵", "中等的一棵", "一样高"], "answer": 1, "explanation": "高高的树最高。"},
    {"topicId": "ct_SX1S053", "difficulty": "basic", "question": "下面哪个最重？", "options": ["气球", "羽毛", "石头", "棉花"], "answer": 2, "explanation": "石头最重。"},
    {"topicId": "ct_SX1S053", "difficulty": "medium", "question": "比较物体轻重，可以用（ ）", "options": ["眼睛看", "手掂一掂", "耳朵听", "鼻子闻"], "answer": 1, "explanation": "用手掂一掂可以比较轻重。"},
])

# 一年级数学 - 认识钟面、时间
new_questions.extend([
    {"topicId": "ct_SX1X055", "difficulty": "basic", "question": "钟面上有（ ）个数字", "options": ["6", "9", "12", "24"], "answer": 2, "explanation": "钟面上有12个数字。"},
    {"topicId": "ct_SX1X055", "difficulty": "basic", "question": "分针指向12，时针指向3，是（ ）时", "options": ["3时", "12时", "6时", "9时"], "answer": 0, "explanation": "时针指向3是3时。"},
    {"topicId": "ct_SX1X056", "difficulty": "medium", "question": "分针指向6，时针在3和4中间，是（ ）", "options": ["3时", "3时半", "4时", "6时半"], "answer": 1, "explanation": "时针在3和4中间是3时半。"},
    {"topicId": "ct_SX1X057", "difficulty": "basic", "question": "早上太阳在（ ）边升起", "options": ["东", "西", "南", "北"], "answer": 0, "explanation": "太阳从东边升起。"},
    {"topicId": "ct_SX1X057", "difficulty": "medium", "question": "下午放学，太阳在（ ）边", "options": ["东", "西", "南", "北"], "answer": 1, "explanation": "下午太阳在西边。"},
])

# 一年级数学 - 人民币、找规律
new_questions.extend([
    {"topicId": "ct_SX1X072", "difficulty": "basic", "question": "1元 = （ ）角", "options": ["1", "10", "100", "1000"], "answer": 1, "explanation": "1元=10角。"},
    {"topicId": "ct_SX1X072", "difficulty": "medium", "question": "5角 = （ ）分", "options": ["5", "50", "500", "5000"], "answer": 1, "explanation": "5角=50分。"},
    {"topicId": "ct_SX1X072", "difficulty": "hard", "question": "一个练习本5角，付1元，应找回（ ）", "options": ["4角", "5角", "6角", "1元5角"], "answer": 1, "explanation": "1元-5角=5角。"},
    {"topicId": "ct_SX1S067", "difficulty": "basic", "question": "找规律：2, 4, 6, 8, ( )", "options": ["9", "10", "11", "12"], "answer": 1, "explanation": "规律是每次加2，所以是10。"},
    {"topicId": "ct_SX1S067", "difficulty": "medium", "question": "找规律：1, 3, 5, 7, ( )", "options": ["8", "9", "10", "11"], "answer": 1, "explanation": "规律是每次加2，所以是9。"},
    {"topicId": "ct_SX1S067", "difficulty": "hard", "question": "找规律：5, 10, 15, 20, ( )", "options": ["22", "24", "25", "30"], "answer": 2, "explanation": "规律是每次加5，所以是25。"},
])

# 二年级数学 - 有余数的除法、混合运算
new_questions.extend([
    {"topicId": "ct_SX2S023", "difficulty": "basic", "question": "13 ÷ 4 = ( )......( )", "options": ["3余1", "4余1", "3余2", "2余5"], "answer": 0, "explanation": "13÷4=3余1。"},
    {"topicId": "ct_SX2S023", "difficulty": "medium", "question": "25 ÷ 6 = ( )......( )", "options": ["4余1", "5余1", "4余2", "3余7"], "answer": 0, "explanation": "25÷6=4余1。"},
    {"topicId": "ct_SX2S023", "difficulty": "hard", "question": "一道有余数的除法，余数最大是5，除数最小是（ ）", "options": ["5", "6", "7", "8"], "answer": 1, "explanation": "余数必须小于除数，除数最小是6。"},
    {"topicId": "ct_SX2S024", "difficulty": "basic", "question": "计算：45 ÷ 5 + 20 = ?", "options": ["25", "27", "29", "31"], "answer": 2, "explanation": "45÷5=9，9+20=29。"},
    {"topicId": "ct_SX2S024", "difficulty": "medium", "question": "计算：80 - 25 ÷ 5 = ?", "options": ["70", "75", "79", "85"], "answer": 1, "explanation": "25÷5=5，80-5=75。"},
    {"topicId": "ct_SX2S024", "difficulty": "hard", "question": "计算：(45 + 15) ÷ 6 = ?", "options": ["8", "9", "10", "11"], "answer": 2, "explanation": "45+15=60，60÷6=10。"},
])

# 二年级数学 - 图形运动、轴对称
new_questions.extend([
    {"topicId": "ct_SX2S046", "difficulty": "basic", "question": "下面哪种现象是平移？", "options": ["电风扇转动", "电梯升降", "风车转动", "荡秋千"], "answer": 1, "explanation": "电梯升降是平移。"},
    {"topicId": "ct_SX2S046", "difficulty": "medium", "question": "下面哪种现象是旋转？", "options": ["电梯升降", "推拉窗户", "钟表指针转动", "滑梯"], "answer": 2, "explanation": "钟表指针转动是旋转。"},
    {"topicId": "ct_SX2S047", "difficulty": "basic", "question": "下面哪个图形是轴对称图形？", "options": ["长方形", "平行四边形", "任意三角形", "不规则图形"], "answer": 0, "explanation": "长方形是轴对称图形。"},
    {"topicId": "ct_SX2S047", "difficulty": "medium", "question": "正方形有几条对称轴？", "options": ["1条", "2条", "3条", "4条"], "answer": 3, "explanation": "正方形有4条对称轴。"},
    {"topicId": "ct_SX2S047", "difficulty": "hard", "question": "圆有几条对称轴？", "options": ["1条", "2条", "4条", "无数条"], "answer": 3, "explanation": "圆有无数条对称轴。"},
])

# 三年级数学 - 位置与方向、年月日
new_questions.extend([
    {"topicId": "ct_SX3S028", "difficulty": "basic", "question": "地图通常是按（ ）方向绘制的", "options": ["上北下南，左西右东", "上南下北，左东右西", "上东下西，左北右南", "上西下东，左南右北"], "answer": 0, "explanation": "地图通常上北下南，左西右东。"},
    {"topicId": "ct_SX3S028", "difficulty": "medium", "question": "小明面向东，他的后面是（ ）", "options": ["东", "南", "西", "北"], "answer": 2, "explanation": "面向东，后面是西。"},
    {"topicId": "ct_SX3S029", "difficulty": "basic", "question": "一年有（ ）个月", "options": ["6", "10", "12", "24"], "answer": 2, "explanation": "一年有12个月。"},
    {"topicId": "ct_SX3S029", "difficulty": "medium", "question": "下面哪个是大月？", "options": ["4月", "6月", "9月", "7月"], "answer": 3, "explanation": "7月是大月，有31天。"},
    {"topicId": "ct_SX3S029", "difficulty": "hard", "question": "2024年是（ ）年", "options": ["平年", "闰年", "平年或闰年", "无法确定"], "answer": 1, "explanation": "2024能被4整除，是闰年。"},
    {"topicId": "ct_SX3S029", "difficulty": "hard", "question": "闰年全年有（ ）天", "options": ["364", "365", "366", "367"], "answer": 2, "explanation": "闰年全年366天。"},
])

# 三年级数学 - 复式统计表、搭配
new_questions.extend([
    {"topicId": "ct_SX3S033", "difficulty": "basic", "question": "复式统计表的优点是什么？", "options": ["能同时比较两组数据", "更简单", "更漂亮", "更省纸"], "answer": 0, "explanation": "复式统计表能同时比较两组数据。"},
    {"topicId": "ct_SX3S033", "difficulty": "medium", "question": "如果统计表有两行数据，每行3格，一共有多少格数据？", "options": ["3格", "5格", "6格", "9格"], "answer": 2, "explanation": "2行×3格=6格。"},
    {"topicId": "ct_SX3S034", "difficulty": "basic", "question": "3件上衣和2条裤子，一共有多少种搭配方法？", "options": ["3种", "4种", "5种", "6种"], "answer": 3, "explanation": "3×2=6种搭配。"},
    {"topicId": "ct_SX3S034", "difficulty": "medium", "question": "4个同学互相握手，一共握多少次？", "options": ["4次", "6次", "8次", "12次"], "answer": 1, "explanation": "4×3÷2=6次。"},
])

# 四年级数学 - 运算定律、三角形
new_questions.extend([
    {"topicId": "ct_SX4S014", "difficulty": "basic", "question": "加法交换律的公式是（ ）", "options": ["a+b=b+a", "a×b=b×a", "(a+b)+c=a+(b+c)", "a×(b+c)=a×b+a×c"], "answer": 0, "explanation": "加法交换律：a+b=b+a。"},
    {"topicId": "ct_SX4S014", "difficulty": "medium", "question": "乘法结合律的公式是（ ）", "options": ["a+b=b+a", "(a×b)×c=a×(b×c)", "a×b=b×a", "a×(b+c)=a×b+a×c"], "answer": 1, "explanation": "乘法结合律：(a×b)×c=a×(b×c)。"},
    {"topicId": "ct_SX4S014", "difficulty": "hard", "question": "用简便方法计算：25×32×125 = ?", "options": ["10000", "100000", "1000000", "10000000"], "answer": 2, "explanation": "25×4×8×125=100×1000=100000。"},
    {"topicId": "ct_SX4S006", "difficulty": "basic", "question": "三角形的内角和是（ ）", "options": ["90°", "180°", "270°", "360°"], "answer": 1, "explanation": "三角形内角和是180°。"},
    {"topicId": "ct_SX4S006", "difficulty": "medium", "question": "一个三角形，两个角分别是60°和70°，第三个角是（ ）", "options": ["40°", "50°", "60°", "70°"], "answer": 1, "explanation": "180-60-70=50°。"},
    {"topicId": "ct_SX4S006", "difficulty": "hard", "question": "等腰三角形的两个底角（ ）", "options": ["相等", "不相等", "和是90°", "和是180°"], "answer": 0, "explanation": "等腰三角形两底角相等。"},
    {"topicId": "ct_SX4S006", "difficulty": "hard", "question": "三角形按角分类，不包括（ ）", "options": ["锐角三角形", "直角三角形", "钝角三角形", "等边三角形"], "answer": 3, "explanation": "等边三角形是按边分类。"},
])

# 四年级数学 - 观察物体、图形的运动
new_questions.extend([
    {"topicId": "ct_SX4S007", "difficulty": "basic", "question": "从正面看一个正方体，看到的是（ ）", "options": ["正方形", "长方形", "圆形", "三角形"], "answer": 0, "explanation": "从正面看正方体是正方形。"},
    {"topicId": "ct_SX4S007", "difficulty": "medium", "question": "从上面看一个圆柱，看到的是（ ）", "options": ["圆形", "长方形", "正方形", "三角形"], "answer": 0, "explanation": "从上面看圆柱是圆形。"},
    {"topicId": "ct_SX4S007", "difficulty": "hard", "question": "一个长方体，从不同方向看，最多能看到（ ）个面", "options": ["1个", "2个", "3个", "4个"], "answer": 2, "explanation": "从斜上方看，最多能看到3个面。"},
    {"topicId": "ct_SX4S008", "difficulty": "basic", "question": "下面哪种现象是平移？", "options": ["电风扇转动", "电梯升降", "风车转动", "荡秋千"], "answer": 1, "explanation": "电梯升降是平移。"},
    {"topicId": "ct_SX4S008", "difficulty": "medium", "question": "下面哪种现象是旋转？", "options": ["电梯升降", "推拉窗户", "钟表指针转动", "滑梯"], "answer": 2, "explanation": "钟表指针转动是旋转。"},
])

# 四年级数学 - 平均数、条形统计图
new_questions.extend([
    {"topicId": "ct_SX4S021", "difficulty": "basic", "question": "平均数的含义是（ ）", "options": ["总数除以个数", "最大的数", "最小的数", "中间的数"], "answer": 0, "explanation": "平均数=总数÷个数。"},
    {"topicId": "ct_SX4S021", "difficulty": "medium", "question": "5、8、10的平均数是（ ）", "options": ["7", "7.5", "8", "8.5"], "answer": 1, "explanation": "(5+8+10)÷3=7.5。"},
    {"topicId": "ct_SX4S021", "difficulty": "hard", "question": "小明三次考试分别得85、90、95分，平均分是（ ）", "options": ["88", "90", "92", "95"], "answer": 1, "explanation": "(85+90+95)÷3=90。"},
    {"topicId": "ct_SX4S022", "difficulty": "basic", "question": "条形统计图的优点是什么？", "options": ["能看出数量多少", "能看出变化趋势", "能看出部分与整体", "能看出比例"], "answer": 0, "explanation": "条形统计图能直观看出数量多少。"},
    {"topicId": "ct_SX4S022", "difficulty": "medium", "question": "如果条形统计图1格表示5人，3格表示多少人？", "options": ["8人", "10人", "15人", "20人"], "answer": 2, "explanation": "3×5=15人。"},
])

# 五年级数学 - 折线统计图、找次品
new_questions.extend([
    {"topicId": "ct_SX5S025", "difficulty": "basic", "question": "折线统计图的优点是什么？", "options": ["能看出数量多少", "能看出变化趋势", "能看出部分与整体", "能看出比例"], "answer": 1, "explanation": "折线统计图能看出变化趋势。"},
    {"topicId": "ct_SX5S025", "difficulty": "medium", "question": "如果折线向上，表示数量（ ）", "options": ["增加", "减少", "不变", "无法确定"], "answer": 0, "explanation": "折线向上表示数量增加。"},
    {"topicId": "ct_SX5S025", "difficulty": "hard", "question": "如果折线向下，表示数量（ ）", "options": ["增加", "减少", "不变", "无法确定"], "answer": 1, "explanation": "折线向下表示数量减少。"},
    {"topicId": "ct_SX5S026", "difficulty": "basic", "question": "找次品时，最好把物品分成（ ）份", "options": ["2", "3", "4", "5"], "answer": 1, "explanation": "分成3份最好。"},
    {"topicId": "ct_SX5S026", "difficulty": "medium", "question": "有9个球，其中1个是次品，至少称几次能找出次品？", "options": ["1次", "2次", "3次", "4次"], "answer": 1, "explanation": "9个球分成3、3、3，至少称2次。"},
])

# 六年级数学 - 鸽巢问题、绿色出行
new_questions.extend([
    {"topicId": "ct_SX6S025", "difficulty": "basic", "question": "鸽巢问题的基本原理是（ ）", "options": ["如果有n+1个物体放进n个抽屉，至少有一个抽屉有2个物体", "每个抽屉只能放一个物体", "物体可以随便放", "没有规律"], "answer": 0, "explanation": "鸽巢原理：n+1个物体放进n个抽屉，至少有一个抽屉有2个。"},
    {"topicId": "ct_SX6S025", "difficulty": "medium", "question": "把10个苹果放进3个抽屉，至少有一个抽屉有（ ）个苹果", "options": ["3", "4", "5", "6"], "answer": 1, "explanation": "10÷3=3余1，至少有一个抽屉有4个。"},
    {"topicId": "ct_SX6S025", "difficulty": "hard", "question": "把7本书放进2个抽屉，至少有一个抽屉有（ ）本书", "options": ["2", "3", "4", "5"], "answer": 2, "explanation": "7÷2=3余1，至少有一个抽屉有4本。"},
    {"topicId": "ct_SX6S026", "difficulty": "basic", "question": "绿色出行的方式不包括（ ）", "options": ["步行", "骑自行车", "乘公交车", "开私家车"], "answer": 3, "explanation": "开私家车不是绿色出行。"},
])

# ==================== 语文扩充 ====================

# 一年级语文 - 复韵母、整体认读、基本笔画
new_questions.extend([
    {"topicId": "ct_YW1S009", "difficulty": "basic", "question": "下面哪个是复韵母？", "options": ["a", "ai", "o", "e"], "answer": 1, "explanation": "ai是复韵母。"},
    {"topicId": "ct_YW1S009", "difficulty": "medium", "question": "下面哪个是后鼻韵母？", "options": ["an", "ang", "en", "in"], "answer": 1, "explanation": "ang是后鼻韵母。"},
    {"topicId": "ct_YW1S010", "difficulty": "basic", "question": "下面哪个是整体认读音节？", "options": ["ba", "ma", "zhi", "pa"], "answer": 2, "explanation": "zhi是整体认读音节。"},
    {"topicId": "ct_YW1S011", "difficulty": "basic", "question": "下面哪个是前鼻韵母？", "options": ["an", "ang", "en", "eng"], "answer": 0, "explanation": "an是前鼻韵母。"},
    {"topicId": "ct_YW1S017", "difficulty": "basic", "question": "下面哪个是基本笔画？", "options": ["横", "日", "口", "人"], "answer": 0, "explanation": "横是基本笔画。"},
    {"topicId": "ct_YW1S018", "difficulty": "basic", "question": "笔顺规则'先横后竖'，下面哪个字符合？", "options": ["十", "人", "八", "入"], "answer": 0, "explanation": "十字先写横，再写竖。"},
    {"topicId": "ct_YW1S019", "difficulty": "basic", "question": "田字格的作用是（ ）", "options": ["帮助把字写规范", "让字更漂亮", "让字更大", "让字更小"], "answer": 0, "explanation": "田字格帮助把字写规范。"},
])

# 一年级语文 - 反义词、数量词、叠词
new_questions.extend([
    {"topicId": "ct_YW1S032", "difficulty": "basic", "question": "'大'的反义词是（ ）", "options": ["小", "多", "高", "长"], "answer": 0, "explanation": "大的反义词是小。"},
    {"topicId": "ct_YW1S032", "difficulty": "medium", "question": "'上'的反义词是（ ）", "options": ["下", "左", "右", "中"], "answer": 0, "explanation": "上的反义词是下。"},
    {"topicId": "ct_YW1S033", "difficulty": "basic", "question": "下面哪个是数量词？", "options": ["一个", "红色的", "跑", "美丽"], "answer": 0, "explanation": "一个是数量词。"},
    {"topicId": "ct_YW1S034", "difficulty": "basic", "question": "下面哪个是叠词？", "options": ["红红的", "红色的", "红", "非常红"], "answer": 0, "explanation": "红红的是叠词。"},
])

# 一年级语文 - 完整句子、标点符号
new_questions.extend([
    {"topicId": "ct_YW1S035", "difficulty": "basic", "question": "下面哪个句子最完整？", "options": ["小明跑步", "小明在公园跑步", "跑步", "在公园"], "answer": 1, "explanation": "完整的句子需要主语、地点、动作。"},
    {"topicId": "ct_YW1S036", "difficulty": "basic", "question": "下面哪个标点表示疑问？", "options": ["。", "？", "！", "，"], "answer": 1, "explanation": "问号表示疑问。"},
    {"topicId": "ct_YW1S036", "difficulty": "medium", "question": "下面哪个标点表示感叹？", "options": ["。", "？", "！", "，"], "answer": 2, "explanation": "感叹号表示感叹。"},
])

# 二年级语文 - 查字典、词语搭配、句子仿写
new_questions.extend([
    {"topicId": "ct_YW2S004", "difficulty": "basic", "question": "用音序查字法查'学'字，先查（ ）", "options": ["xue", "X", "学", "x"], "answer": 1, "explanation": "音序查字法先查音序X。"},
    {"topicId": "ct_YW2S004", "difficulty": "medium", "question": "用部首查字法查'河'字，先查（ ）部", "options": ["氵", "可", "口", "亅"], "answer": 0, "explanation": "河字是三点水旁，先查氵部。"},
    {"topicId": "ct_YW2S009", "difficulty": "basic", "question": "词语搭配：'（ ）的草地'", "options": ["绿油油", "红红", "蓝蓝", "黄黄"], "answer": 0, "explanation": "草地是绿色的。"},
    {"topicId": "ct_YW2S009", "difficulty": "medium", "question": "词语搭配：'（ ）的天空'", "options": ["蓝蓝", "绿油油", "红红", "黄黄"], "answer": 0, "explanation": "天空是蓝色的。"},
    {"topicId": "ct_YW2S011", "difficulty": "basic", "question": "照样子写句子：'小鸟飞上了天空。' → '小鸟（ ）飞上了天空。'", "options": ["快活地", "很快地", "慢慢地", "轻轻地"], "answer": 0, "explanation": "快活地修饰飞。"},
    {"topicId": "ct_YW2S011", "difficulty": "medium", "question": "照样子写句子：'太阳升起来了。' → '（ ）太阳升起来了。'", "options": ["红红的", "快快的", "慢慢的", "轻轻的"], "answer": 0, "explanation": "红红的修饰太阳。"},
])

# 二年级语文 - 比喻句、拟人句、排比句
new_questions.extend([
    {"topicId": "ct_YW2S012", "difficulty": "basic", "question": "'弯弯的月亮像小船'用了什么修辞？", "options": ["比喻", "拟人", "排比", "夸张"], "answer": 0, "explanation": "把月亮比作小船，是比喻。"},
    {"topicId": "ct_YW2S012", "difficulty": "medium", "question": "'小鸟在树上唱歌'用了什么修辞？", "options": ["比喻", "拟人", "排比", "夸张"], "answer": 1, "explanation": "把小鸟当人来写，是拟人。"},
    {"topicId": "ct_YW2S012", "difficulty": "hard", "question": "下面哪句是排比句？", "options": ["春天来了，花儿开了，草儿绿了，鸟儿叫了", "花儿像笑脸", "花儿真美", "我喜欢花儿"], "answer": 0, "explanation": "三个以上结构相似的句子构成排比。"},
])

# 三年级语文 - 古诗、阅读理解、作文
new_questions.extend([
    {"topicId": "ct_YW3S021", "difficulty": "basic", "question": "'咏柳'的作者是（ ）", "options": ["贺知章", "李白", "杜甫", "白居易"], "answer": 0, "explanation": "咏柳作者是贺知章。"},
    {"topicId": "ct_YW3S021", "difficulty": "medium", "question": "'碧玉妆成一树高'的下一句是（ ）", "options": ["万条垂下绿丝绦", "不知细叶谁裁出", "二月春风似剪刀", "草长莺飞二月天"], "answer": 0, "explanation": "下一句是万条垂下绿丝绦。"},
    {"topicId": "ct_YW3S022", "difficulty": "basic", "question": "阅读理解时，首先要（ ）", "options": ["读题目", "看文章", "查字典", "做笔记"], "answer": 1, "explanation": "阅读理解要先看文章。"},
    {"topicId": "ct_YW3S022", "difficulty": "medium", "question": "文章的中心思想通常在（ ）", "options": ["开头或结尾", "中间", "题目", "注释"], "answer": 0, "explanation": "中心思想通常在开头或结尾。"},
    {"topicId": "ct_YW3S023", "difficulty": "basic", "question": "写记叙文的三要素是（ ）", "options": ["时间、地点、人物", "开头、中间、结尾", "原因、经过、结果", "总起、分述、总结"], "answer": 0, "explanation": "记叙文三要素是时间、地点、人物。"},
    {"topicId": "ct_YW3S023", "difficulty": "medium", "question": "作文中间部分应该写什么？", "options": ["时间地点", "事情的经过", "心情感受", "收获体会"], "answer": 1, "explanation": "中间部分写事情的经过。"},
])

# 四年级语文 - 古诗、阅读、作文
new_questions.extend([
    {"topicId": "ct_YW4S008", "difficulty": "basic", "question": "'望庐山瀑布'的作者是（ ）", "options": ["李白", "杜甫", "白居易", "王维"], "answer": 0, "explanation": "望庐山瀑布作者是李白。"},
    {"topicId": "ct_YW4S008", "difficulty": "medium", "question": "'飞流直下三千尺'的下一句是（ ）", "options": ["疑是银河落九天", "遥看瀑布挂前川", "日照香炉生紫烟", "不及汪伦送我情"], "answer": 0, "explanation": "下一句是疑是银河落九天。"},
    {"topicId": "ct_YW4S015", "difficulty": "basic", "question": "阅读理解时，遇到不理解的词语应该（ ）", "options": ["跳过", "查字典", "问同学", "猜意思"], "answer": 1, "explanation": "遇到不理解的词语查字典。"},
    {"topicId": "ct_YW4S015", "difficulty": "medium", "question": "文章的细节描写作用是（ ）", "options": ["使文章更生动", "使文章更短", "使文章更简单", "使文章更抽象"], "answer": 0, "explanation": "细节描写使文章更生动。"},
    {"topicId": "ct_YW4S016", "difficulty": "basic", "question": "写'我的妈妈'，下列哪个开头最吸引人？", "options": ["我的妈妈很漂亮", "我的妈妈有一双会说话的眼睛", "我的妈妈今年35岁", "我的妈妈很爱我"], "answer": 1, "explanation": "具体的细节描写更吸引人。"},
    {"topicId": "ct_YW4S016", "difficulty": "medium", "question": "作文结尾的作用是（ ）", "options": ["总结全文", "引出下文", "设置悬念", "描写环境"], "answer": 0, "explanation": "结尾总结全文。"},
])

# 五年级语文 - 说明文、阅读理解、作文
new_questions.extend([
    {"topicId": "ct_YW5S008", "difficulty": "basic", "question": "'鲸是哺乳动物'用了什么说明方法？", "options": ["举例子", "下定义", "打比方", "列数字"], "answer": 1, "explanation": "下定义是说明事物的本质特征。"},
    {"topicId": "ct_YW5S008", "difficulty": "medium", "question": "'赵州桥非常长，大约50多米'用了什么说明方法？", "options": ["作比较", "列数字", "打比方", "举例子"], "answer": 1, "explanation": "用数字说明，是列数字。"},
    {"topicId": "ct_YW5S018", "difficulty": "basic", "question": "说明文的语言特点是（ ）", "options": ["准确、严谨", "生动、形象", "抒情、优美", "幽默、风趣"], "answer": 0, "explanation": "说明文语言准确、严谨。"},
    {"topicId": "ct_YW5S018", "difficulty": "medium", "question": "说明文的顺序不包括（ ）", "options": ["时间顺序", "空间顺序", "逻辑顺序", "情感顺序"], "answer": 3, "explanation": "说明文没有情感顺序。"},
    {"topicId": "ct_YW5S019", "difficulty": "basic", "question": "缩写故事时，应该（ ）", "options": ["保留主要情节", "保留所有细节", "改变故事内容", "增加新情节"], "answer": 0, "explanation": "缩写要保留主要情节。"},
    {"topicId": "ct_YW5S019", "difficulty": "medium", "question": "缩写时，下列哪种句子应该删除？", "options": ["主要人物的对话", "次要人物的描写", "故事的起因", "故事的结果"], "answer": 1, "explanation": "次要人物的描写可以删减。"},
])

# 六年级语文 - 古诗、阅读、作文
new_questions.extend([
    {"topicId": "ct_YW6S008", "difficulty": "basic", "question": "'马诗'的作者是（ ）", "options": ["李贺", "李白", "杜甫", "白居易"], "answer": 0, "explanation": "马诗作者是李贺。"},
    {"topicId": "ct_YW6S008", "difficulty": "medium", "question": "'大漠沙如雪'的下一句是（ ）", "options": ["燕山月似钩", "何当金络脑", "快走踏清秋", "瑟瑟谷中风"], "answer": 0, "explanation": "下一句是燕山月似钩。"},
    {"topicId": "ct_YW6S018", "difficulty": "basic", "question": "阅读理解时，要关注文章的（ ）", "options": ["中心思想", "字数", "标点", "字体"], "answer": 0, "explanation": "阅读理解要关注中心思想。"},
    {"topicId": "ct_YW6S018", "difficulty": "medium", "question": "文章的表达方式不包括（ ）", "options": ["记叙", "描写", "说明", "书写"], "answer": 3, "explanation": "表达方式包括记叙、描写、说明、议论、抒情。"},
    {"topicId": "ct_YW6S019", "difficulty": "basic", "question": "倡议书的格式不包括（ ）", "options": ["标题", "称呼", "正文", "摘要"], "answer": 3, "explanation": "倡议书格式：标题、称呼、正文、结尾、署名、日期。"},
    {"topicId": "ct_YW6S019", "difficulty": "medium", "question": "倡议书正文应该写（ ）", "options": ["倡议的原因和内容", "个人感想", "故事", "诗歌"], "answer": 0, "explanation": "正文要写清倡议的原因和具体内容。"},
])

# ==================== 英语扩充 ====================

# 三年级英语 - 问候、介绍、课堂指令
new_questions.extend([
    {"topicId": "ct_YY3S008", "difficulty": "basic", "question": "选出'Goodbye'的中文意思", "options": ["你好", "再见", "谢谢", "对不起"], "answer": 1, "explanation": "Goodbye是再见。"},
    {"topicId": "ct_YY3S008", "difficulty": "medium", "question": "选出'Thank you'的中文意思", "options": ["你好", "再见", "谢谢", "对不起"], "answer": 2, "explanation": "Thank you是谢谢。"},
    {"topicId": "ct_YY3S009", "difficulty": "basic", "question": "选出'Hello'的中文意思", "options": ["你好", "再见", "谢谢", "对不起"], "answer": 0, "explanation": "Hello是你好。"},
    {"topicId": "ct_YY3S009", "difficulty": "medium", "question": "选出'I'm sorry'的中文意思", "options": ["你好", "再见", "谢谢", "对不起"], "answer": 3, "explanation": "I'm sorry是对不起。"},
])

# 四年级英语 - 学校、家庭、时间
new_questions.extend([
    {"topicId": "ct_YY4S006", "difficulty": "basic", "question": "选出'teacher'的中文意思", "options": ["学生", "老师", "医生", "工人"], "answer": 1, "explanation": "teacher是老师。"},
    {"topicId": "ct_YY4S006", "difficulty": "medium", "question": "选出'student'的中文意思", "options": ["学生", "老师", "医生", "工人"], "answer": 0, "explanation": "student是学生。"},
    {"topicId": "ct_YY4S007", "difficulty": "basic", "question": "选出'sister'的中文意思", "options": ["哥哥", "姐姐", "弟弟", "妹妹"], "answer": 1, "explanation": "sister是姐姐。"},
    {"topicId": "ct_YY4S007", "difficulty": "medium", "question": "选出'brother'的中文意思", "options": ["哥哥", "姐姐", "弟弟", "哥哥或弟弟"], "answer": 3, "explanation": "brother是哥哥或弟弟。"},
])

# 五年级英语 - 日常活动、爱好、交通
new_questions.extend([
    {"topicId": "ct_YY5S006", "difficulty": "basic", "question": "选出'breakfast'的中文意思", "options": ["早餐", "午餐", "晚餐", "夜宵"], "answer": 0, "explanation": "breakfast是早餐。"},
    {"topicId": "ct_YY5S006", "difficulty": "medium", "question": "选出'lunch'的中文意思", "options": ["早餐", "午餐", "晚餐", "夜宵"], "answer": 1, "explanation": "lunch是午餐。"},
    {"topicId": "ct_YY5S007", "difficulty": "basic", "question": "选出'read'的中文意思", "options": ["读", "写", "听", "说"], "answer": 0, "explanation": "read是读。"},
    {"topicId": "ct_YY5S007", "difficulty": "medium", "question": "选出'write'的中文意思", "options": ["读", "写", "听", "说"], "answer": 1, "explanation": "write是写。"},
])

# 六年级英语 - 旅行、计划、节日
new_questions.extend([
    {"topicId": "ct_YY6S006", "difficulty": "basic", "question": "选出'airport'的中文意思", "options": ["机场", "火车站", "汽车站", "码头"], "answer": 0, "explanation": "airport是机场。"},
    {"topicId": "ct_YY6S006", "difficulty": "medium", "question": "选出'train station'的中文意思", "options": ["机场", "火车站", "汽车站", "码头"], "answer": 1, "explanation": "train station是火车站。"},
    {"topicId": "ct_YY6S007", "difficulty": "basic", "question": "选出'holiday'的中文意思", "options": ["假日", "工作", "学习", "休息"], "answer": 0, "explanation": "holiday是假日。"},
    {"topicId": "ct_YY6S007", "difficulty": "medium", "question": "选出'weekend'的中文意思", "options": ["周末", "工作日", "假日", "假期"], "answer": 0, "explanation": "weekend是周末。"},
])

# ==================== 科学扩充 ====================

# 三年级科学 - 磁铁、电、岩石、土壤
new_questions.extend([
    {"topicId": "ct_KX3S030", "difficulty": "basic", "question": "磁铁的同极（ ）", "options": ["相吸", "相斥", "无作用", "无法确定"], "answer": 1, "explanation": "同极相斥。"},
    {"topicId": "ct_KX3S030", "difficulty": "medium", "question": "磁铁的异极（ ）", "options": ["相吸", "相斥", "无作用", "无法确定"], "answer": 0, "explanation": "异极相吸。"},
    {"topicId": "ct_KX3S031", "difficulty": "basic", "question": "下面哪种物体是导体？", "options": ["塑料", "橡胶", "铜线", "木头"], "answer": 2, "explanation": "铜线是导体。"},
    {"topicId": "ct_KX3S031", "difficulty": "medium", "question": "一个简单电路至少需要什么？", "options": ["电池、灯泡", "电池、导线、灯泡", "导线、开关", "电池、开关"], "answer": 1, "explanation": "简单电路需要电源、导线和用电器。"},
])

# 四年级科学 - 天气、植物生长、动物生命周期
new_questions.extend([
    {"topicId": "ct_KX4S010", "difficulty": "basic", "question": "测量气温用什么工具？", "options": ["尺子", "温度计", "天平", "量筒"], "answer": 1, "explanation": "测量气温用温度计。"},
    {"topicId": "ct_KX4S010", "difficulty": "medium", "question": "气温的单位是（ ）", "options": ["米", "摄氏度", "千克", "秒"], "answer": 1, "explanation": "气温单位是摄氏度。"},
    {"topicId": "ct_KX4S011", "difficulty": "basic", "question": "云是由什么组成的？", "options": ["烟雾", "小水滴或冰晶", "灰尘", "水蒸气"], "answer": 1, "explanation": "云由小水滴或冰晶组成。"},
    {"topicId": "ct_KX4S012", "difficulty": "basic", "question": "植物生长需要什么？", "options": ["阳光、水、空气", "只有阳光", "只有水", "只有空气"], "answer": 0, "explanation": "植物生长需要阳光、水和空气。"},
    {"topicId": "ct_KX4S013", "difficulty": "basic", "question": "蝴蝶的生命周期是（ ）", "options": ["卵→幼虫→蛹→成虫", "卵→幼虫→成虫", "卵→蛹→成虫", "幼虫→蛹→成虫"], "answer": 0, "explanation": "蝴蝶完全变态发育。"},
])

# 五年级科学 - 光、影子、热传递、水循环
new_questions.extend([
    {"topicId": "ct_KX5S015", "difficulty": "basic", "question": "光是沿什么传播的？", "options": ["直线", "曲线", "波浪线", "螺旋线"], "answer": 0, "explanation": "光沿直线传播。"},
    {"topicId": "ct_KX5S015", "difficulty": "medium", "question": "影子是怎么形成的？", "options": ["光被挡住", "光照射", "光反射", "光折射"], "answer": 0, "explanation": "影子是光被挡住形成的。"},
    {"topicId": "ct_KX5S016", "difficulty": "basic", "question": "热传递的方式不包括（ ）", "options": ["传导", "对流", "辐射", "蒸发"], "answer": 3, "explanation": "热传递方式有传导、对流、辐射。"},
    {"topicId": "ct_KX5S017", "difficulty": "basic", "question": "水循环包括哪些过程？", "options": ["蒸发、降水、径流", "只有蒸发", "只有降水", "只有径流"], "answer": 0, "explanation": "水循环包括蒸发、降水、径流。"},
])

# 六年级科学 - 能量、能源、环境保护
new_questions.extend([
    {"topicId": "ct_KX6S020", "difficulty": "basic", "question": "下面哪种是可再生能源？", "options": ["煤", "石油", "太阳能", "天然气"], "answer": 2, "explanation": "太阳能是可再生能源。"},
    {"topicId": "ct_KX6S020", "difficulty": "medium", "question": "能量可以（ ）", "options": ["凭空产生", "凭空消失", "转化", "以上都不对"], "answer": 2, "explanation": "能量可以转化。"},
    {"topicId": "ct_KX6S021", "difficulty": "basic", "question": "保护环境应该（ ）", "options": ["乱扔垃圾", "节约用水用电", "砍伐森林", "污染河流"], "answer": 1, "explanation": "保护环境要节约资源。"},
    {"topicId": "ct_KX6S022", "difficulty": "basic", "question": "可持续发展的含义是（ ）", "options": ["满足当代需求，不损害后代", "只满足当代需求", "只考虑后代", "不考虑环境"], "answer": 0, "explanation": "可持续发展要兼顾当代和后代。"},
])

# 合并题目
all_questions = existing_questions + new_questions

# 去重：相同topicId + 相同question只保留一道
seen = set()
unique_questions = []
for q in all_questions:
    key = (q['topicId'], q['question'])
    if key not in seen:
        seen.add(key)
        unique_questions.append(q)

print(f"\n合并前: {len(all_questions)}道")
print(f"去重后: {len(unique_questions)}道")

# 生成最终题库
output = {
    "version": "v1.5-diagnostic",
    "description": "知识点诊断题库：覆盖数学、语文、英语、科学核心知识点",
    "generatedAt": "2026-08-27T00:00:00Z",
    "totalQuestions": len(unique_questions),
    "questions": []
}

# 为每个知识点生成题目，添加id
topic_counter = {}
for q in unique_questions:
    tid = q["topicId"]
    if tid not in topic_counter:
        topic_counter[tid] = 0
    topic_counter[tid] += 1
    
    topic_suffix = tid.replace("ct_", "")
    q["id"] = f"dq_{topic_suffix}_{topic_counter[tid]:02d}"
    output["questions"].append(q)

# 统计
print(f"\n生成诊断题总数: {len(unique_questions)}")
print(f"覆盖知识点数: {len(topic_counter)}")

# 按学科统计
subject_stats = {}
for tid in topic_counter:
    if "SX" in tid:
        subject = "数学"
    elif "YW" in tid:
        subject = "语文"
    elif "YY" in tid:
        subject = "英语"
    elif "KX" in tid:
        subject = "科学"
    else:
        subject = "其他"
    
    if subject not in subject_stats:
        subject_stats[subject] = {"topics": 0, "questions": 0}
    subject_stats[subject]["topics"] += 1
    subject_stats[subject]["questions"] += topic_counter[tid]

print("\n按学科统计:")
for s, stats in sorted(subject_stats.items()):
    print(f"  {s}: {stats['topics']}个知识点, {stats['questions']}道题")

# 按难度统计
diff_stats = {"basic": 0, "medium": 0, "hard": 0}
for q in unique_questions:
    diff_stats[q["difficulty"]] += 1

print("\n按难度统计:")
for d, count in diff_stats.items():
    print(f"  {d}: {count}道")

# 保存
with open(os.path.join(data_dir, 'diagnostic-questions.json'), 'w', encoding='utf-8') as fp:
    json.dump(output, fp, ensure_ascii=False, indent=2)

print(f"\n题库已保存到: {os.path.join(data_dir, 'diagnostic-questions.json')}")
