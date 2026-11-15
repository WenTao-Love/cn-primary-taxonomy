#!/usr/bin/env python3
"""
诊断题库 v3：扩充更多核心知识点
覆盖数学、语文、英语、科学的重要概念
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

# ==================== 数学新增 ====================

# 一年级数学 - 比较、第几、分与合
new_questions.extend([
    {"topicId": "ct_SX1S003", "difficulty": "basic", "question": "下面哪个数最大？", "options": ["5", "3", "7", "2"], "answer": 2, "explanation": "7是最大的。"},
    {"topicId": "ct_SX1S003", "difficulty": "medium", "question": "比较：8 ○ 5，○里应该填什么？", "options": [">", "<", "=", "+"], "answer": 0, "explanation": "8大于5，填>。"},
    {"topicId": "ct_SX1S004", "difficulty": "basic", "question": "从前往后数，小红排第2，她前面有几个人？", "options": ["0人", "1人", "2人", "3人"], "answer": 1, "explanation": "排第2，前面有1人。"},
    {"topicId": "ct_SX1S004", "difficulty": "medium", "question": "从后往前数，小明排第3，从前往后数，小明排第5，一共有几个人？", "options": ["6人", "7人", "8人", "9人"], "answer": 1, "explanation": "3+5-1=7人。"},
    {"topicId": "ct_SX1S005", "difficulty": "basic", "question": "5可以分成2和几？", "options": ["1", "2", "3", "4"], "answer": 2, "explanation": "5可以分成2和3。"},
    {"topicId": "ct_SX1S005", "difficulty": "medium", "question": "7可以分成几和几？", "options": ["1和6", "2和5", "3和4", "以上都可以"], "answer": 3, "explanation": "7可以分成1和6、2和5、3和4。"},
    {"topicId": "ct_SX1S006", "difficulty": "basic", "question": "小明原来有3个苹果，妈妈又给了2个，现在有几个？", "options": ["4个", "5个", "6个", "7个"], "answer": 1, "explanation": "3+2=5个。"},
    {"topicId": "ct_SX1S006", "difficulty": "medium", "question": "树上有6只鸟，飞来了3只，现在有几只？", "options": ["8只", "9只", "10只", "11只"], "answer": 1, "explanation": "6+3=9只。"},
    {"topicId": "ct_SX1S007", "difficulty": "basic", "question": "小明有8块糖，吃了3块，还剩几块？", "options": ["4块", "5块", "6块", "7块"], "answer": 1, "explanation": "8-3=5块。"},
    {"topicId": "ct_SX1S007", "difficulty": "medium", "question": "盘子里有10个苹果，拿走4个，还剩几个？", "options": ["5个", "6个", "7个", "8个"], "answer": 1, "explanation": "10-4=6个。"},
    {"topicId": "ct_SX1S008", "difficulty": "basic", "question": "计算：5 + 2 - 3 = ?", "options": ["3", "4", "5", "6"], "answer": 1, "explanation": "5+2-3=4。"},
    {"topicId": "ct_SX1S008", "difficulty": "medium", "question": "计算：10 - 4 + 2 = ?", "options": ["6", "7", "8", "9"], "answer": 2, "explanation": "10-4+2=8。"},
])

# 二年级数学 - 100以内数的认识
new_questions.extend([
    {"topicId": "ct_SX2S001", "difficulty": "basic", "question": "一个数由3个十和5个一组成，这个数是（ ）", "options": ["35", "53", "305", "503"], "answer": 0, "explanation": "3个十和5个一是35。"},
    {"topicId": "ct_SX2S001", "difficulty": "medium", "question": "最大的两位数是（ ）", "options": ["99", "100", "90", "10"], "answer": 0, "explanation": "最大的两位数是99。"},
    {"topicId": "ct_SX2S001", "difficulty": "hard", "question": "用2、5、8三个数字组成最大的两位数是（ ）", "options": ["25", "28", "52", "85"], "answer": 3, "explanation": "把数字从大到小排列：85。"},
    {"topicId": "ct_SX2S002", "difficulty": "basic", "question": "85比70大多少？", "options": ["5", "10", "15", "20"], "answer": 2, "explanation": "85-70=15。"},
    {"topicId": "ct_SX2S002", "difficulty": "medium", "question": "比45大10的数是（ ）", "options": ["35", "45", "55", "65"], "answer": 2, "explanation": "45+10=55。"},
    {"topicId": "ct_SX2S003", "difficulty": "basic", "question": "90 - 30 = ?", "options": ["50", "60", "70", "80"], "answer": 1, "explanation": "90-30=60。"},
    {"topicId": "ct_SX2S003", "difficulty": "medium", "question": "计算：56 + 28 = ?", "options": ["74", "84", "94", "104"], "answer": 1, "explanation": "56+28=84。"},
    {"topicId": "ct_SX2S004", "difficulty": "basic", "question": "计算：47 + 26 = ?", "options": ["63", "73", "83", "93"], "answer": 1, "explanation": "47+26=73。"},
    {"topicId": "ct_SX2S004", "difficulty": "medium", "question": "计算：68 - 39 = ?", "options": ["19", "29", "39", "49"], "answer": 1, "explanation": "68-39=29。"},
    {"topicId": "ct_SX2S005", "difficulty": "basic", "question": "计算：23 + 45 + 12 = ?", "options": ["70", "80", "90", "100"], "answer": 1, "explanation": "23+45+12=80。"},
    {"topicId": "ct_SX2S006", "difficulty": "basic", "question": "计算：85 - 32 - 18 = ?", "options": ["25", "35", "45", "55"], "answer": 1, "explanation": "85-32-18=35。"},
    {"topicId": "ct_SX2S007", "difficulty": "basic", "question": "计算：45 + 23 - 18 = ?", "options": ["40", "50", "60", "70"], "answer": 1, "explanation": "45+23-18=50。"},
    {"topicId": "ct_SX2S008", "difficulty": "medium", "question": "小明有50元，买书花了28元，还剩多少元？", "options": ["12元", "22元", "32元", "42元"], "answer": 1, "explanation": "50-28=22元。"},
])

# 三年级数学 - 万以内加减法、除法
new_questions.extend([
    {"topicId": "ct_SX3S002", "difficulty": "basic", "question": "计算：3456 + 1789 = ?", "options": ["5145", "5245", "5345", "5445"], "answer": 1, "explanation": "3456+1789=5245。"},
    {"topicId": "ct_SX3S002", "difficulty": "medium", "question": "计算：5000 - 1876 = ?", "options": ["3024", "3124", "3224", "3324"], "answer": 1, "explanation": "5000-1876=3124。"},
    {"topicId": "ct_SX3S003", "difficulty": "basic", "question": "计算：4567 + 2389 = ?", "options": ["6856", "6956", "7056", "7156"], "answer": 1, "explanation": "4567+2389=6956。"},
    {"topicId": "ct_SX3S017", "difficulty": "basic", "question": "计算：432 ÷ 6 = ?", "options": ["70", "72", "74", "76"], "answer": 1, "explanation": "432÷6=72。"},
    {"topicId": "ct_SX3S017", "difficulty": "medium", "question": "计算：567 ÷ 9 = ?", "options": ["61", "62", "63", "64"], "answer": 2, "explanation": "567÷9=63。"},
    {"topicId": "ct_SX3S018", "difficulty": "basic", "question": "计算：856 ÷ 4 = ?", "options": ["212", "214", "216", "218"], "answer": 1, "explanation": "856÷4=214。"},
    {"topicId": "ct_SX3S018", "difficulty": "medium", "question": "计算：735 ÷ 7 = ?", "options": ["103", "105", "107", "109"], "answer": 1, "explanation": "735÷7=105。"},
])

# 四年级数学 - 大数读写、角的度量
new_questions.extend([
    {"topicId": "ct_SX4S002", "difficulty": "basic", "question": "12345678读作（ ）", "options": ["一千二百三十四万五千六百七十八", "一千二百三十四万五千六七八", "一千二百三十四万五千六百八十七", "一千二百三十四万五千七百六十八"], "answer": 0, "explanation": "12345678读作一千二百三十四万五千六百七十八。"},
    {"topicId": "ct_SX4S002", "difficulty": "medium", "question": "三千万零五百写作（ ）", "options": ["30000500", "30005000", "30050000", "30500000"], "answer": 0, "explanation": "三千万零五百写作30000500。"},
    {"topicId": "ct_SX4S003", "difficulty": "basic", "question": "100000000 = （ ）亿", "options": ["1", "10", "100", "1000"], "answer": 0, "explanation": "100000000=1亿。"},
    {"topicId": "ct_SX4S012", "difficulty": "basic", "question": "一条直线有几个端点？", "options": ["0个", "1个", "2个", "无数个"], "answer": 0, "explanation": "直线没有端点。"},
    {"topicId": "ct_SX4S012", "difficulty": "medium", "question": "用量角器量角时，要把量角器的中心与角的（ ）重合", "options": ["顶点", "边", "端点", "任意位置"], "answer": 0, "explanation": "量角器中心要与角的顶点重合。"},
    {"topicId": "ct_SX4S013", "difficulty": "basic", "question": "计算：234 × 56 = ?", "options": ["13004", "13104", "13204", "13304"], "answer": 1, "explanation": "234×56=13104。"},
])

# 五年级数学 - 小数加减法、解方程
new_questions.extend([
    {"topicId": "ct_SX5S003", "difficulty": "basic", "question": "计算：3.5 + 2.7 = ?", "options": ["5.2", "6.2", "7.2", "8.2"], "answer": 1, "explanation": "3.5+2.7=6.2。"},
    {"topicId": "ct_SX5S003", "difficulty": "medium", "question": "计算：8.6 - 3.9 = ?", "options": ["4.5", "4.7", "5.3", "5.7"], "answer": 1, "explanation": "8.6-3.9=4.7。"},
    {"topicId": "ct_SX5S004", "difficulty": "basic", "question": "计算：1.25 + 2.75 = ?", "options": ["3.0", "4.0", "3.5", "4.5"], "answer": 1, "explanation": "1.25+2.75=4.0。"},
    {"topicId": "ct_SX5S006", "difficulty": "basic", "question": "解方程：x + 8 = 15", "options": ["x = 5", "x = 6", "x = 7", "x = 8"], "answer": 2, "explanation": "15-8=7，x=7。"},
    {"topicId": "ct_SX5S006", "difficulty": "medium", "question": "解方程：2x = 18", "options": ["x = 6", "x = 7", "x = 8", "x = 9"], "answer": 3, "explanation": "18÷2=9，x=9。"},
    {"topicId": "ct_SX5S007", "difficulty": "medium", "question": "列方程：小明有x本书，小红有3倍，两人一共20本", "options": ["x + 3 = 20", "x + 3x = 20", "3x = 20", "x - 3 = 20"], "answer": 1, "explanation": "x + 3x = 20。"},
])

# 六年级数学 - 分数加减法、圆柱圆锥、比例
new_questions.extend([
    {"topicId": "ct_SX6S003", "difficulty": "basic", "question": "计算：1/4 + 2/4 = ?", "options": ["3/8", "3/4", "1/2", "2/4"], "answer": 1, "explanation": "同分母分数相加：1/4+2/4=3/4。"},
    {"topicId": "ct_SX6S003", "difficulty": "medium", "question": "计算：2/3 - 1/6 = ?", "options": ["1/3", "1/2", "1/6", "2/3"], "answer": 1, "explanation": "2/3-1/6=4/6-1/6=3/6=1/2。"},
    {"topicId": "ct_SX6S004", "difficulty": "basic", "question": "计算：3/5 + 1/5 = ?", "options": ["2/5", "3/5", "4/5", "5/5"], "answer": 2, "explanation": "3/5+1/5=4/5。"},
    {"topicId": "ct_SX6S006", "difficulty": "basic", "question": "圆柱的侧面展开是什么形状？", "options": ["长方形", "圆形", "三角形", "扇形"], "answer": 0, "explanation": "圆柱侧面展开是长方形。"},
    {"topicId": "ct_SX6S006", "difficulty": "medium", "question": "圆柱的表面积 = 侧面积 + （ ）", "options": ["底面积", "2个底面积", "体积", "高"], "answer": 1, "explanation": "圆柱表面积=侧面积+2个底面积。"},
    {"topicId": "ct_SX6S007", "difficulty": "basic", "question": "圆锥的体积是等底等高圆柱体积的（ ）", "options": ["1/2", "1/3", "2/3", "3/4"], "answer": 1, "explanation": "圆锥体积是等底等高圆柱体积的1/3。"},
    {"topicId": "ct_SX6S007", "difficulty": "medium", "question": "圆锥体积公式是（ ）", "options": ["V=πr²h", "V=1/3πr²h", "V=2πr²h", "V=πr²"], "answer": 1, "explanation": "圆锥体积V=1/3πr²h。"},
    {"topicId": "ct_SX6S008", "difficulty": "basic", "question": "2:3 = 4:（ ）", "options": ["5", "6", "7", "8"], "answer": 1, "explanation": "2:3=4:6，内项积等于外项积。"},
    {"topicId": "ct_SX6S008", "difficulty": "medium", "question": "如果a:b = 3:4，那么b:a = （ ）", "options": ["3:4", "4:3", "3:7", "4:7"], "answer": 1, "explanation": "b:a = 4:3。"},
    {"topicId": "ct_SX6S009", "difficulty": "basic", "question": "比例尺1:10000表示图上1厘米代表实际（ ）米", "options": ["10", "100", "1000", "10000"], "answer": 1, "explanation": "1:10000表示图上1cm=实际10000cm=100m。"},
])

# ==================== 语文新增 ====================

# 一年级语文 - 韵母、整体认读、生字
new_questions.extend([
    {"topicId": "ct_YW1S002", "difficulty": "basic", "question": "下面哪个是单韵母？", "options": ["ai", "a", "ou", "iu"], "answer": 1, "explanation": "a是单韵母。"},
    {"topicId": "ct_YW1S002", "difficulty": "medium", "question": "下面哪个是复韵母？", "options": ["a", "o", "ai", "e"], "answer": 2, "explanation": "ai是复韵母。"},
    {"topicId": "ct_YW1S003", "difficulty": "basic", "question": "下面哪个是声母？", "options": ["a", "o", "b", "i"], "answer": 2, "explanation": "b是声母。"},
    {"topicId": "ct_YW1S003", "difficulty": "medium", "question": "下面哪个是整体认读音节？", "options": ["ba", "ma", "zhi", "pa"], "answer": 2, "explanation": "zhi是整体认读音节。"},
    {"topicId": "ct_YW1S004", "difficulty": "basic", "question": "下面哪个是后鼻韵母？", "options": ["an", "ang", "en", "in"], "answer": 1, "explanation": "ang是后鼻韵母。"},
    {"topicId": "ct_YW1S006", "difficulty": "basic", "question": "下面哪个字是'口'字？", "options": ["日", "口", "目", "田"], "answer": 1, "explanation": "口字像嘴巴。"},
    {"topicId": "ct_YW1S007", "difficulty": "basic", "question": "'木'字的偏旁是（ ）", "options": ["木", "水", "火", "土"], "answer": 0, "explanation": "木字本身就是偏旁。"},
    {"topicId": "ct_YW1S007", "difficulty": "medium", "question": "'河'字的偏旁是（ ）", "options": ["氵", "木", "火", "土"], "answer": 0, "explanation": "河字是三点水旁。"},
    {"topicId": "ct_YW1S008", "difficulty": "basic", "question": "'大'字加一横变成（ ）", "options": ["天", "太", "夫", "木"], "answer": 0, "explanation": "大字加一横变成天。"},
])

# 二年级语文 - 字音字形、近义词反义词
new_questions.extend([
    {"topicId": "ct_YW2S001", "difficulty": "basic", "question": "'苹'字的拼音是（ ）", "options": ["píng", "pín", "pīng", "pìng"], "answer": 0, "explanation": "苹的拼音是píng。"},
    {"topicId": "ct_YW2S001", "difficulty": "medium", "question": "'重'字在'重要'中读（ ）", "options": ["zhòng", "chóng", "zhōng", "chōng"], "answer": 0, "explanation": "重要的重读zhòng。"},
    {"topicId": "ct_YW2S002", "difficulty": "basic", "question": "'明'字的笔顺是（ ）", "options": ["先写日，再写月", "先写月，再写日", "先写目，再写月", "先写月，再写目"], "answer": 0, "explanation": "明字先写日，再写月。"},
    {"topicId": "ct_YW2S003", "difficulty": "basic", "question": "'温暖'的'暖'意思是（ ）", "options": ["暖和", "寒冷", "明亮", "黑暗"], "answer": 0, "explanation": "暖的意思是暖和。"},
    {"topicId": "ct_YW2S006", "difficulty": "basic", "question": "'高兴'的近义词是（ ）", "options": ["快乐", "难过", "生气", "悲伤"], "answer": 0, "explanation": "高兴的近义词是快乐。"},
    {"topicId": "ct_YW2S006", "difficulty": "medium", "question": "'美丽'的近义词是（ ）", "options": ["漂亮", "丑陋", "难看", "普通"], "answer": 0, "explanation": "美丽的近义词是漂亮。"},
    {"topicId": "ct_YW2S007", "difficulty": "basic", "question": "'大'的反义词是（ ）", "options": ["小", "多", "高", "长"], "answer": 0, "explanation": "大的反义词是小。"},
    {"topicId": "ct_YW2S007", "difficulty": "medium", "question": "'黑暗'的反义词是（ ）", "options": ["光明", "明亮", "黑暗", "昏暗"], "answer": 0, "explanation": "黑暗的反义词是光明。"},
])

# 三年级语文 - 生字词语、标点符号
new_questions.extend([
    {"topicId": "ct_YW3S001", "difficulty": "basic", "question": "'落'字的拼音是（ ）", "options": ["luò", "là", "luō", "lào"], "answer": 0, "explanation": "落的拼音是luò。"},
    {"topicId": "ct_YW3S002", "difficulty": "basic", "question": "'翩翩起舞'中'翩翩'的意思是（ ）", "options": ["轻快地跳舞", "慢慢走", "快速跑", "安静坐"], "answer": 0, "explanation": "翩翩形容轻快跳舞。"},
    {"topicId": "ct_YW3S003", "difficulty": "basic", "question": "'村居'的作者是（ ）", "options": ["高鼎", "李白", "杜甫", "白居易"], "answer": 0, "explanation": "村居作者是高鼎。"},
    {"topicId": "ct_YW3S006", "difficulty": "basic", "question": "下面哪个标点符号表示疑问？", "options": ["。", "？", "！", "，"], "answer": 1, "explanation": "问号表示疑问。"},
    {"topicId": "ct_YW3S006", "difficulty": "medium", "question": "下面哪个标点符号表示感叹？", "options": ["。", "？", "！", "，"], "answer": 2, "explanation": "感叹号表示感叹。"},
    {"topicId": "ct_YW3S007", "difficulty": "basic", "question": "修改病句：'我非常喜欢苹果、香蕉、西瓜等水果。'", "options": ["我非常喜欢水果", "我非常喜欢苹果、香蕉、西瓜", "我非常喜欢苹果、香蕉、西瓜等水果", "我非常喜欢苹果、香蕉、西瓜等"], "answer": 2, "explanation": "原句没有语病。"},
    {"topicId": "ct_YW3S007", "difficulty": "medium", "question": "修改病句：'小明和小红是好朋友，他经常帮助他。'", "options": ["小明和小红是好朋友，小明经常帮助小红", "小明和小红是好朋友，小红经常帮助小明", "小明和小红是好朋友，他们经常互相帮助", "以上都对"], "answer": 2, "explanation": "用'他们互相'更清楚。"},
])

# 四年级语文 - 生字词语、句子修辞
new_questions.extend([
    {"topicId": "ct_YW4S001", "difficulty": "basic", "question": "'缘'字的拼音是（ ）", "options": ["yuán", "yán", "yǎn", "yàn"], "answer": 0, "explanation": "缘的拼音是yuán。"},
    {"topicId": "ct_YW4S002", "difficulty": "basic", "question": "'应接不暇'的'暇'意思是（ ）", "options": ["空闲", "时间", "眼睛", "颜色"], "answer": 0, "explanation": "暇指空闲。"},
    {"topicId": "ct_YW4S003", "difficulty": "basic", "question": "'题西林壁'的作者是（ ）", "options": ["苏轼", "李白", "杜甫", "白居易"], "answer": 0, "explanation": "题西林壁作者是苏轼。"},
    {"topicId": "ct_YW4S006", "difficulty": "basic", "question": "'小鸟在树上唱歌'用了什么修辞？", "options": ["比喻", "拟人", "排比", "夸张"], "answer": 1, "explanation": "把小鸟当人来写，是拟人。"},
    {"topicId": "ct_YW4S006", "difficulty": "medium", "question": "'弯弯的月亮像小船'用了什么修辞？", "options": ["拟人", "比喻", "排比", "夸张"], "answer": 1, "explanation": "把月亮比作小船，是比喻。"},
    {"topicId": "ct_YW4S007", "difficulty": "basic", "question": "'飞流直下三千尺'用了什么修辞？", "options": ["比喻", "拟人", "排比", "夸张"], "answer": 3, "explanation": "三千尺是夸张。"},
])

# 五年级语文 - 生字词语、句子标点
new_questions.extend([
    {"topicId": "ct_YW5S001", "difficulty": "basic", "question": "'陷'字的拼音是（ ）", "options": ["xiàn", "xuàn", "xián", "xuán"], "answer": 0, "explanation": "陷的拼音是xiàn。"},
    {"topicId": "ct_YW5S002", "difficulty": "basic", "question": "'同归于尽'的'尽'意思是（ ）", "options": ["完", "全部", "结束", "死亡"], "answer": 0, "explanation": "尽指完、结束。"},
    {"topicId": "ct_YW5S003", "difficulty": "basic", "question": "'白杨礼赞'的作者是（ ）", "options": ["茅盾", "鲁迅", "老舍", "巴金"], "answer": 0, "explanation": "白杨礼赞作者是茅盾。"},
    {"topicId": "ct_YW5S006", "difficulty": "basic", "question": "'把'字句变成'被'字句：'小明打碎了花瓶。'", "options": ["花瓶被小明打碎了", "小明被花瓶打碎了", "花瓶打碎了小明", "小明打碎花瓶了"], "answer": 0, "explanation": "被字句：花瓶被小明打碎了。"},
    {"topicId": "ct_YW5S007", "difficulty": "basic", "question": "给句子加标点：'你今天去公园吗______'", "options": ["。", "？", "！", "，"], "answer": 1, "explanation": "疑问句用问号。"},
])

# 六年级语文 - 生字词语、句子修辞
new_questions.extend([
    {"topicId": "ct_YW6S001", "difficulty": "basic", "question": "'汤'字的拼音是（ ）", "options": ["tāng", "dāng", "táng", "dáng"], "answer": 0, "explanation": "汤的拼音是tāng。"},
    {"topicId": "ct_YW6S002", "difficulty": "basic", "question": "'万象更新'的'更'意思是（ ）", "options": ["改变", "更加", "再", "时间"], "answer": 0, "explanation": "更指改变。"},
    {"topicId": "ct_YW6S003", "difficulty": "basic", "question": "'北京的春节'的作者是（ ）", "options": ["老舍", "鲁迅", "茅盾", "巴金"], "answer": 0, "explanation": "北京的春节作者是老舍。"},
    {"topicId": "ct_YW6S006", "difficulty": "basic", "question": "'大漠沙如雪'用了什么修辞？", "options": ["比喻", "拟人", "排比", "夸张"], "answer": 0, "explanation": "把沙比作雪，是比喻。"},
    {"topicId": "ct_YW6S007", "difficulty": "medium", "question": "'燕山月似钩'用了什么修辞？", "options": ["比喻", "拟人", "排比", "夸张"], "answer": 0, "explanation": "把月比作钩，是比喻。"},
])

# ==================== 英语新增 ====================

# 三年级英语 - 数字、颜色、动物、食物
new_questions.extend([
    {"topicId": "ct_YY3S003", "difficulty": "basic", "question": "选出'five'的中文意思", "options": ["三", "四", "五", "六"], "answer": 2, "explanation": "five是五。"},
    {"topicId": "ct_YY3S003", "difficulty": "medium", "question": "选出'nine'的中文意思", "options": ["七", "八", "九", "十"], "answer": 2, "explanation": "nine是九。"},
    {"topicId": "ct_YY3S004", "difficulty": "basic", "question": "选出'blue'的中文意思", "options": ["红色", "蓝色", "绿色", "黄色"], "answer": 1, "explanation": "blue是蓝色。"},
    {"topicId": "ct_YY3S004", "difficulty": "medium", "question": "选出'green'的中文意思", "options": ["红色", "蓝色", "绿色", "黄色"], "answer": 2, "explanation": "green是绿色。"},
    {"topicId": "ct_YY3S006", "difficulty": "basic", "question": "选出'dog'的中文意思", "options": ["猫", "狗", "鸟", "鱼"], "answer": 1, "explanation": "dog是狗。"},
    {"topicId": "ct_YY3S006", "difficulty": "medium", "question": "选出'bird'的中文意思", "options": ["猫", "狗", "鸟", "鱼"], "answer": 2, "explanation": "bird是鸟。"},
    {"topicId": "ct_YY3S007", "difficulty": "basic", "question": "选出'bread'的中文意思", "options": ["米饭", "面条", "面包", "鸡蛋"], "answer": 2, "explanation": "bread是面包。"},
    {"topicId": "ct_YY3S007", "difficulty": "medium", "question": "选出'milk'的中文意思", "options": ["水", "牛奶", "果汁", "茶"], "answer": 1, "explanation": "milk是牛奶。"},
])

# 四年级英语 - 学校、家庭、时间
new_questions.extend([
    {"topicId": "ct_YY4S002", "difficulty": "basic", "question": "选出'classroom'的中文意思", "options": ["教室", "操场", "图书馆", "食堂"], "answer": 0, "explanation": "classroom是教室。"},
    {"topicId": "ct_YY4S002", "difficulty": "medium", "question": "选出'library'的中文意思", "options": ["教室", "操场", "图书馆", "食堂"], "answer": 2, "explanation": "library是图书馆。"},
    {"topicId": "ct_YY4S003", "difficulty": "basic", "question": "选出'father'的中文意思", "options": ["爸爸", "妈妈", "哥哥", "姐姐"], "answer": 0, "explanation": "father是爸爸。"},
    {"topicId": "ct_YY4S003", "difficulty": "medium", "question": "选出'mother'的中文意思", "options": ["爸爸", "妈妈", "哥哥", "姐姐"], "answer": 1, "explanation": "mother是妈妈。"},
    {"topicId": "ct_YY4S004", "difficulty": "basic", "question": "选出'Monday'的中文意思", "options": ["星期一", "星期二", "星期三", "星期四"], "answer": 0, "explanation": "Monday是星期一。"},
    {"topicId": "ct_YY4S004", "difficulty": "medium", "question": "选出'Sunday'的中文意思", "options": ["星期五", "星期六", "星期日", "星期一"], "answer": 2, "explanation": "Sunday是星期日。"},
])

# 五年级英语 - 日常活动、爱好、交通
new_questions.extend([
    {"topicId": "ct_YY5S002", "difficulty": "basic", "question": "选出'get up'的中文意思", "options": ["起床", "睡觉", "吃饭", "上学"], "answer": 0, "explanation": "get up是起床。"},
    {"topicId": "ct_YY5S002", "difficulty": "medium", "question": "选出'go to bed'的中文意思", "options": ["起床", "睡觉", "吃饭", "上学"], "answer": 1, "explanation": "go to bed是睡觉。"},
    {"topicId": "ct_YY5S003", "difficulty": "basic", "question": "选出'play football'的中文意思", "options": ["打篮球", "踢足球", "打排球", "打乒乓球"], "answer": 1, "explanation": "play football是踢足球。"},
    {"topicId": "ct_YY5S003", "difficulty": "medium", "question": "选出'swim'的中文意思", "options": ["跑步", "游泳", "跳高", "跳远"], "answer": 1, "explanation": "swim是游泳。"},
    {"topicId": "ct_YY5S004", "difficulty": "basic", "question": "选出'by bike'的中文意思", "options": ["乘公交车", "骑自行车", "步行", "开车"], "answer": 1, "explanation": "by bike是骑自行车。"},
    {"topicId": "ct_YY5S004", "difficulty": "medium", "question": "选出'on foot'的中文意思", "options": ["乘公交车", "骑自行车", "步行", "开车"], "answer": 2, "explanation": "on foot是步行。"},
    {"topicId": "ct_YY5S005", "difficulty": "basic", "question": "选出'shop'的中文意思", "options": ["学校", "商店", "医院", "公园"], "answer": 1, "explanation": "shop是商店。"},
])

# 六年级英语 - 旅行、计划、节日
new_questions.extend([
    {"topicId": "ct_YY6S002", "difficulty": "basic", "question": "选出'travel'的中文意思", "options": ["学习", "工作", "旅行", "休息"], "answer": 2, "explanation": "travel是旅行。"},
    {"topicId": "ct_YY6S002", "difficulty": "medium", "question": "选出'summer holiday'的中文意思", "options": ["寒假", "暑假", "春假", "秋假"], "answer": 1, "explanation": "summer holiday是暑假。"},
    {"topicId": "ct_YY6S003", "difficulty": "basic", "question": "选出'plan'的中文意思", "options": ["计划", "结果", "过程", "目标"], "answer": 0, "explanation": "plan是计划。"},
    {"topicId": "ct_YY6S003", "difficulty": "medium", "question": "选出'goal'的中文意思", "options": ["计划", "结果", "过程", "目标"], "answer": 3, "explanation": "goal是目标。"},
    {"topicId": "ct_YY6S004", "difficulty": "basic", "question": "选出'Spring Festival'的中文意思", "options": ["春节", "中秋节", "端午节", "元宵节"], "answer": 0, "explanation": "Spring Festival是春节。"},
    {"topicId": "ct_YY6S004", "difficulty": "medium", "question": "选出'Mid-Autumn Festival'的中文意思", "options": ["春节", "中秋节", "端午节", "元宵节"], "answer": 1, "explanation": "Mid-Autumn Festival是中秋节。"},
    {"topicId": "ct_YY6S005", "difficulty": "basic", "question": "选出'present'的中文意思", "options": ["礼物", "卡片", "信件", "照片"], "answer": 0, "explanation": "present是礼物。"},
])

# ==================== 科学新增 ====================

# 三年级科学 - 磁铁、电、岩石、土壤
new_questions.extend([
    {"topicId": "ct_KX3S006", "difficulty": "basic", "question": "磁铁能吸住下面哪种物体？", "options": ["塑料", "铁", "木头", "纸"], "answer": 1, "explanation": "磁铁能吸住铁。"},
    {"topicId": "ct_KX3S006", "difficulty": "medium", "question": "磁铁有几个磁极？", "options": ["1个", "2个", "3个", "4个"], "answer": 1, "explanation": "磁铁有2个磁极。"},
    {"topicId": "ct_KX3S007", "difficulty": "basic", "question": "下面哪种物体能导电？", "options": ["塑料", "橡胶", "铜线", "木头"], "answer": 2, "explanation": "铜线能导电。"},
    {"topicId": "ct_KX3S008", "difficulty": "basic", "question": "下面哪种是岩石？", "options": ["沙子", "石头", "泥土", "水"], "answer": 1, "explanation": "石头是岩石。"},
    {"topicId": "ct_KX3S009", "difficulty": "basic", "question": "土壤中含有哪些成分？", "options": ["只有矿物质", "矿物质、水、空气、有机质", "只有水", "只有空气"], "answer": 1, "explanation": "土壤包含多种成分。"},
])

# 四年级科学 - 天气、植物生长、动物生命周期
new_questions.extend([
    {"topicId": "ct_KX4S006", "difficulty": "basic", "question": "测量气温用什么工具？", "options": ["尺子", "温度计", "天平", "量筒"], "answer": 1, "explanation": "测量气温用温度计。"},
    {"topicId": "ct_KX4S007", "difficulty": "basic", "question": "云是由什么组成的？", "options": ["烟雾", "小水滴或冰晶", "灰尘", "水蒸气"], "answer": 1, "explanation": "云由小水滴或冰晶组成。"},
    {"topicId": "ct_KX4S008", "difficulty": "basic", "question": "植物生长需要什么？", "options": ["阳光、水、空气", "只有阳光", "只有水", "只有空气"], "answer": 0, "explanation": "植物生长需要阳光、水和空气。"},
    {"topicId": "ct_KX4S009", "difficulty": "basic", "question": "蝴蝶的生命周期是（ ）", "options": ["卵→幼虫→蛹→成虫", "卵→幼虫→成虫", "卵→蛹→成虫", "幼虫→蛹→成虫"], "answer": 0, "explanation": "蝴蝶完全变态发育。"},
])

# 五年级科学 - 光、影子、热传递、水循环
new_questions.extend([
    {"topicId": "ct_KX5S006", "difficulty": "basic", "question": "光是沿什么传播的？", "options": ["直线", "曲线", "波浪线", "螺旋线"], "answer": 0, "explanation": "光沿直线传播。"},
    {"topicId": "ct_KX5S007", "difficulty": "basic", "question": "影子是怎么形成的？", "options": ["光被挡住", "光照射", "光反射", "光折射"], "answer": 0, "explanation": "影子是光被挡住形成的。"},
    {"topicId": "ct_KX5S008", "difficulty": "basic", "question": "热传递的方式不包括（ ）", "options": ["传导", "对流", "辐射", "蒸发"], "answer": 3, "explanation": "热传递方式有传导、对流、辐射。"},
    {"topicId": "ct_KX5S009", "difficulty": "basic", "question": "水循环包括哪些过程？", "options": ["蒸发、降水、径流", "只有蒸发", "只有降水", "只有径流"], "answer": 0, "explanation": "水循环包括蒸发、降水、径流。"},
])

# 六年级科学 - 能量、能源、环境保护
new_questions.extend([
    {"topicId": "ct_KX6S006", "difficulty": "basic", "question": "下面哪种是可再生能源？", "options": ["煤", "石油", "太阳能", "天然气"], "answer": 2, "explanation": "太阳能是可再生能源。"},
    {"topicId": "ct_KX6S007", "difficulty": "basic", "question": "能量可以（ ）", "options": ["凭空产生", "凭空消失", "转化", "以上都不对"], "answer": 2, "explanation": "能量可以转化。"},
    {"topicId": "ct_KX6S008", "difficulty": "basic", "question": "保护环境应该（ ）", "options": ["乱扔垃圾", "节约用水用电", "砍伐森林", "污染河流"], "answer": 1, "explanation": "保护环境要节约资源。"},
    {"topicId": "ct_KX6S009", "difficulty": "basic", "question": "可持续发展的含义是（ ）", "options": ["满足当代需求，不损害后代", "只满足当代需求", "只考虑后代", "不考虑环境"], "answer": 0, "explanation": "可持续发展要兼顾当代和后代。"},
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
    "version": "v1.4-diagnostic",
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
