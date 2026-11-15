#!/usr/bin/env python3
"""
最终版诊断题库生成器
合并所有题目，去重，生成完整题库
"""

import json
import os

data_dir = 'D:/xcode/fgit/cn-primary-taxonomy/data'

# ==================== 所有诊断题数据 ====================

all_questions = []

# ==================== 数学 ====================

# 一年级数学
all_questions.extend([
    {"topicId": "ct_SX1S001", "difficulty": "basic", "question": "数一数：图中有几个苹果？🍎🍎🍎", "options": ["2个", "3个", "4个", "5个"], "answer": 1, "explanation": "图中有3个苹果。"},
    {"topicId": "ct_SX1S001", "difficulty": "basic", "question": "下面哪个数字最大？", "options": ["5", "3", "7", "2"], "answer": 2, "explanation": "7是最大的数字。"},
    {"topicId": "ct_SX1S001", "difficulty": "medium", "question": "从1数到10，第5个数是几？", "options": ["4", "5", "6", "7"], "answer": 1, "explanation": "1、2、3、4、5，第5个数是5。"},
    {"topicId": "ct_SX1S002", "difficulty": "basic", "question": "计算：3 + 4 = ?", "options": ["6", "7", "8", "9"], "answer": 1, "explanation": "3+4=7。"},
    {"topicId": "ct_SX1S002", "difficulty": "basic", "question": "计算：9 - 5 = ?", "options": ["3", "4", "5", "6"], "answer": 1, "explanation": "9-5=4。"},
    {"topicId": "ct_SX1S002", "difficulty": "medium", "question": "小明有5个苹果，吃了2个，还剩几个？", "options": ["2个", "3个", "4个", "5个"], "answer": 1, "explanation": "5-2=3，还剩3个。"},
    {"topicId": "ct_SX1S002", "difficulty": "hard", "question": "括号里填几？3 + ( ) = 8", "options": ["4", "5", "6", "7"], "answer": 1, "explanation": "8-3=5，所以括号里填5。"},
    {"topicId": "ct_SX1S038", "difficulty": "basic", "question": "下面哪个图形是圆形？", "options": ["□", "○", "△", "▭"], "answer": 1, "explanation": "○是圆形。"},
    {"topicId": "ct_SX1S038", "difficulty": "basic", "question": "下面哪个图形是三角形？", "options": ["□", "○", "△", "▭"], "answer": 2, "explanation": "△是三角形。"},
    {"topicId": "ct_SX1S038", "difficulty": "medium", "question": "长方形有几条边？", "options": ["3条", "4条", "5条", "6条"], "answer": 1, "explanation": "长方形有4条边。"},
    {"topicId": "ct_SX1S037", "difficulty": "basic", "question": "小猫在小狗的（ ）面。", "options": ["上", "下", "左", "右"], "answer": 0, "explanation": "小猫在小狗的上面。"},
    {"topicId": "ct_SX1S037", "difficulty": "medium", "question": "从前往后数，小明排第3，从后往前数，小明排第4，一共有几个人？", "options": ["5", "6", "7", "8"], "answer": 1, "explanation": "3+4-1=6人。"},
    {"topicId": "ct_SX1S035", "difficulty": "basic", "question": "下面哪个是长方体？", "options": ["魔方", "书本", "足球", "乒乓球"], "answer": 1, "explanation": "书本的长方体形状。"},
    {"topicId": "ct_SX1S035", "difficulty": "basic", "question": "下面哪个是球体？", "options": ["魔方", "书本", "足球", "砖块"], "answer": 2, "explanation": "足球是球体。"},
    {"topicId": "ct_SX1S035", "difficulty": "medium", "question": "圆柱有什么特点？", "options": ["有两个平平的圆面", "有6个面", "方方的", "有尖尖的角"], "answer": 0, "explanation": "圆柱有两个平平的圆形底面。"},
    {"topicId": "ct_SX1S036", "difficulty": "basic", "question": "把下面的物品按形状分类，苹果和西瓜可以分成一类，因为它们都是（ ）", "options": ["圆形", "红色", "水果", "甜的"], "answer": 0, "explanation": "苹果和西瓜都是圆形。"},
    {"topicId": "ct_SX1S036", "difficulty": "medium", "question": "分类的标准有（ ）", "options": ["形状", "颜色", "大小", "以上都可以"], "answer": 3, "explanation": "分类可以按形状、颜色、大小等多种标准。"},
])

# 二年级数学
all_questions.extend([
    {"topicId": "ct_SX2S020", "difficulty": "basic", "question": "计算：3 × 4 = ?", "options": ["9", "12", "15", "18"], "answer": 1, "explanation": "三四十二，3×4=12。"},
    {"topicId": "ct_SX2S020", "difficulty": "basic", "question": "计算：7 × 8 = ?", "options": ["54", "56", "63", "72"], "answer": 1, "explanation": "七八五十六，7×8=56。"},
    {"topicId": "ct_SX2S020", "difficulty": "medium", "question": "括号里最大能填几？( ) × 5 < 30", "options": ["4", "5", "6", "7"], "answer": 1, "explanation": "5×5=25<30，6×5=30，所以最大填5。"},
    {"topicId": "ct_SX2S020", "difficulty": "hard", "question": "有4排树，每排5棵，一共有多少棵树？", "options": ["15棵", "18棵", "20棵", "25棵"], "answer": 2, "explanation": "4×5=20棵。"},
    {"topicId": "ct_SX2S021", "difficulty": "basic", "question": "把12个苹果平均分成3份，每份几个？", "options": ["3个", "4个", "5个", "6个"], "answer": 1, "explanation": "12÷3=4，每份4个。"},
    {"topicId": "ct_SX2S021", "difficulty": "medium", "question": "18 ÷ 6 = ?", "options": ["2", "3", "4", "6"], "answer": 1, "explanation": "18÷6=3。"},
    {"topicId": "ct_SX2S021", "difficulty": "hard", "question": "小明有24颗糖，平均分给6个小朋友，每人几颗？", "options": ["3颗", "4颗", "6颗", "8颗"], "answer": 1, "explanation": "24÷6=4颗。"},
    {"topicId": "ct_SX2S040", "difficulty": "basic", "question": "下面哪个是角？", "options": ["直线", "曲线", "有顶点和两条边", "一个点"], "answer": 2, "explanation": "角有一个顶点和两条边。"},
    {"topicId": "ct_SX2S040", "difficulty": "basic", "question": "直角是（ ）度。", "options": ["45", "90", "180", "360"], "answer": 1, "explanation": "直角是90度。"},
    {"topicId": "ct_SX2S040", "difficulty": "medium", "question": "比直角小的角叫什么？", "options": ["锐角", "钝角", "平角", "周角"], "answer": 0, "explanation": "比直角小的角是锐角。"},
    {"topicId": "ct_SX2S040", "difficulty": "hard", "question": "一个三角形中最多有几个直角？", "options": ["0个", "1个", "2个", "3个"], "answer": 1, "explanation": "三角形内角和180度，最多有1个直角。"},
    {"topicId": "ct_SX2S050", "difficulty": "basic", "question": "1米 = （ ）厘米", "options": ["10", "100", "1000", "10000"], "answer": 1, "explanation": "1米=100厘米。"},
    {"topicId": "ct_SX2S050", "difficulty": "basic", "question": "一支铅笔大约长（ ）", "options": ["10厘米", "10米", "100厘米", "1米"], "answer": 0, "explanation": "一支铅笔大约长10厘米。"},
    {"topicId": "ct_SX2S050", "difficulty": "medium", "question": "3米 = （ ）厘米", "options": ["30", "300", "3000", "30000"], "answer": 1, "explanation": "3×100=300厘米。"},
    {"topicId": "ct_SX2S045", "difficulty": "basic", "question": "从正面看一个正方体，看到的是（ ）", "options": ["正方形", "长方形", "圆形", "三角形"], "answer": 0, "explanation": "从正面看正方体是正方形。"},
    {"topicId": "ct_SX2S045", "difficulty": "medium", "question": "从上面看一个圆柱，看到的是（ ）", "options": ["圆形", "长方形", "正方形", "三角形"], "answer": 0, "explanation": "从上面看圆柱是圆形。"},
    {"topicId": "ct_SX2S045", "difficulty": "hard", "question": "一个长方体，从不同方向看，最多能看到（ ）个面", "options": ["1个", "2个", "3个", "4个"], "answer": 2, "explanation": "从斜上方看，最多能看到3个面。"},
    {"topicId": "ct_SX2S022", "difficulty": "basic", "question": "每排有4棵树，3排一共有多少棵？", "options": ["7棵", "12棵", "16棵", "20棵"], "answer": 1, "explanation": "4×3=12棵。"},
    {"topicId": "ct_SX2S022", "difficulty": "medium", "question": "小明每天背5个单词，一个学期（按20周算）背多少个？", "options": ["100个", "500个", "700个", "1000个"], "answer": 2, "explanation": "5×5×20=500个（每周5天）。"},
    {"topicId": "ct_SX2S022", "difficulty": "hard", "question": "一盒巧克力有8块，买5盒一共有多少块？", "options": ["35块", "40块", "45块", "50块"], "answer": 1, "explanation": "8×5=40块。"},
])

# 三年级数学
all_questions.extend([
    {"topicId": "ct_SX3S001", "difficulty": "basic", "question": "一千里面有（ ）个一百", "options": ["1", "10", "100", "1000"], "answer": 1, "explanation": "一千里面有10个一百。"},
    {"topicId": "ct_SX3S001", "difficulty": "basic", "question": "最小的四位数是（ ）", "options": ["100", "1000", "9999", "10000"], "answer": 1, "explanation": "最小的四位数是1000。"},
    {"topicId": "ct_SX3S001", "difficulty": "medium", "question": "3456读作（ ）", "options": ["三千四百五十六", "三千四百六十五", "三千五百四十六", "三千零四百五十六"], "answer": 0, "explanation": "3456读作三千四百五十六。"},
    {"topicId": "ct_SX3S001", "difficulty": "hard", "question": "用3、0、5、8组成最大的四位数是（ ）", "options": ["3580", "5830", "8530", "8350"], "answer": 2, "explanation": "把数字从大到小排列：8530。"},
    {"topicId": "ct_SX3S015", "difficulty": "basic", "question": "计算：12 × 3 = ?", "options": ["26", "36", "46", "56"], "answer": 1, "explanation": "12×3=36。"},
    {"topicId": "ct_SX3S015", "difficulty": "medium", "question": "计算：123 × 4 = ?", "options": ["482", "492", "502", "512"], "answer": 1, "explanation": "123×4=492。"},
    {"topicId": "ct_SX3S015", "difficulty": "hard", "question": "每箱苹果23千克，5箱一共多少千克？", "options": ["105", "115", "125", "135"], "answer": 1, "explanation": "23×5=115千克。"},
    {"topicId": "ct_SX3S030", "difficulty": "basic", "question": "长方形的长是8厘米，宽是5厘米，周长是多少？", "options": ["13厘米", "26厘米", "40厘米", "45厘米"], "answer": 1, "explanation": "(8+5)×2=26厘米。"},
    {"topicId": "ct_SX3S030", "difficulty": "medium", "question": "正方形的边长是6厘米，周长是多少？", "options": ["12厘米", "18厘米", "24厘米", "36厘米"], "answer": 2, "explanation": "6×4=24厘米。"},
    {"topicId": "ct_SX3S030", "difficulty": "hard", "question": "一个长方形的周长是24厘米，长是8厘米，宽是多少？", "options": ["4厘米", "6厘米", "8厘米", "12厘米"], "answer": 0, "explanation": "24÷2-8=4厘米。"},
    {"topicId": "ct_SX3S025", "difficulty": "basic", "question": "把一个苹果平均分成2份，每份是它的（ ）", "options": ["1/2", "1/3", "2/1", "2/3"], "answer": 0, "explanation": "平均分成2份，每份是1/2。"},
    {"topicId": "ct_SX3S025", "difficulty": "medium", "question": "1/4读作（ ）", "options": ["一四", "四分之一", "四一", "十四分之一"], "answer": 1, "explanation": "1/4读作四分之一。"},
    {"topicId": "ct_SX3S025", "difficulty": "hard", "question": "同样大的圆，1/2和1/4哪个大？", "options": ["1/2大", "1/4大", "一样大", "无法比较"], "answer": 0, "explanation": "分的份数越多，每一份越小，所以1/2大。"},
    {"topicId": "ct_SX3S016", "difficulty": "basic", "question": "计算：12 × 11 = ?", "options": ["121", "132", "143", "154"], "answer": 1, "explanation": "12×11=132。"},
    {"topicId": "ct_SX3S016", "difficulty": "medium", "question": "计算：23 × 14 = ?", "options": ["312", "322", "332", "342"], "answer": 1, "explanation": "23×14=322。"},
    {"topicId": "ct_SX3S016", "difficulty": "hard", "question": "每箱有24瓶水，买了15箱，一共多少瓶？", "options": ["340瓶", "360瓶", "380瓶", "400瓶"], "answer": 1, "explanation": "24×15=360瓶。"},
    {"topicId": "ct_SX3S032", "difficulty": "basic", "question": "长方形的面积公式是（ ）", "options": ["长+宽", "长×宽", "（长+宽）×2", "长÷宽"], "answer": 1, "explanation": "长方形面积=长×宽。"},
    {"topicId": "ct_SX3S032", "difficulty": "medium", "question": "一个长方形长6厘米，宽4厘米，面积是多少？", "options": ["10平方厘米", "20平方厘米", "24平方厘米", "28平方厘米"], "answer": 2, "explanation": "6×4=24平方厘米。"},
    {"topicId": "ct_SX3S032", "difficulty": "hard", "question": "正方形的边长是5厘米，面积是多少？", "options": ["10平方厘米", "20平方厘米", "25平方厘米", "30平方厘米"], "answer": 2, "explanation": "5×5=25平方厘米。"},
])

# 四年级数学
all_questions.extend([
    {"topicId": "ct_SX4S001", "difficulty": "basic", "question": "一万一万地数，10个一万是（ ）", "options": ["十万", "一百万", "一千万", "一亿"], "answer": 0, "explanation": "10个一万是十万。"},
    {"topicId": "ct_SX4S001", "difficulty": "medium", "question": "100000000读作（ ）", "options": ["一千万", "一亿", "十亿", "一百亿"], "answer": 1, "explanation": "100000000读作一亿。"},
    {"topicId": "ct_SX4S001", "difficulty": "hard", "question": "一个九位数，最高位是（ ）位", "options": ["千万", "亿", "十亿", "百亿"], "answer": 1, "explanation": "九位数的最高位是亿位。"},
    {"topicId": "ct_SX4S010", "difficulty": "basic", "question": "计算：123 × 45 = ?", "options": ["5535", "5545", "5555", "5565"], "answer": 0, "explanation": "123×45=5535。"},
    {"topicId": "ct_SX4S010", "difficulty": "medium", "question": "每套书145元，买12套需要多少元？", "options": ["1740元", "1750元", "1760元", "1770元"], "answer": 0, "explanation": "145×12=1740元。"},
    {"topicId": "ct_SX4S011", "difficulty": "basic", "question": "计算：480 ÷ 12 = ?", "options": ["30", "40", "50", "60"], "answer": 1, "explanation": "480÷12=40。"},
    {"topicId": "ct_SX4S011", "difficulty": "medium", "question": "计算：864 ÷ 24 = ?", "options": ["34", "36", "38", "40"], "answer": 1, "explanation": "864÷24=36。"},
    {"topicId": "ct_SX4S011", "difficulty": "hard", "question": "一道除法算式，商是15，余数是12，除数最小是（ ）", "options": ["12", "13", "14", "15"], "answer": 1, "explanation": "余数必须小于除数，所以除数最小是13。"},
    {"topicId": "ct_SX4S005", "difficulty": "basic", "question": "平行四边形的对边（ ）", "options": ["相等", "不相等", "有时相等", "无法确定"], "answer": 0, "explanation": "平行四边形的对边平行且相等。"},
    {"topicId": "ct_SX4S005", "difficulty": "medium", "question": "梯形有几条边平行？", "options": ["0条", "1条", "2条", "3条"], "answer": 1, "explanation": "梯形只有一组对边平行。"},
    {"topicId": "ct_SX4S005", "difficulty": "hard", "question": "把一个平行四边形拉成一个长方形，面积会（ ）", "options": ["变大", "变小", "不变", "无法确定"], "answer": 0, "explanation": "拉成长方形后，高变大，面积变大。"},
    {"topicId": "ct_SX4S020", "difficulty": "basic", "question": "条形统计图的优点是什么？", "options": ["能看出数量多少", "能看出变化趋势", "能看出部分与整体", "能看出比例"], "answer": 0, "explanation": "条形统计图能直观看出数量多少。"},
    {"topicId": "ct_SX4S020", "difficulty": "medium", "question": "如果条形统计图1格表示5人，3格表示多少人？", "options": ["8人", "10人", "15人", "20人"], "answer": 2, "explanation": "3×5=15人。"},
])

# 五年级数学
all_questions.extend([
    {"topicId": "ct_SX5S001", "difficulty": "basic", "question": "计算：0.5 × 2 = ?", "options": ["0.5", "1.0", "1.5", "2.0"], "answer": 1, "explanation": "0.5×2=1.0。"},
    {"topicId": "ct_SX5S001", "difficulty": "medium", "question": "计算：1.2 × 3 = ?", "options": ["3.2", "3.6", "4.2", "4.6"], "answer": 1, "explanation": "1.2×3=3.6。"},
    {"topicId": "ct_SX5S001", "difficulty": "hard", "question": "苹果每千克3.5元，买2.4千克需要多少元？", "options": ["8.2元", "8.4元", "8.6元", "8.8元"], "answer": 1, "explanation": "3.5×2.4=8.4元。"},
    {"topicId": "ct_SX5S002", "difficulty": "basic", "question": "计算：1.2 ÷ 0.3 = ?", "options": ["3", "4", "5", "6"], "answer": 1, "explanation": "1.2÷0.3=4。"},
    {"topicId": "ct_SX5S002", "difficulty": "medium", "question": "计算：4.8 ÷ 0.6 = ?", "options": ["6", "7", "8", "9"], "answer": 2, "explanation": "4.8÷0.6=8。"},
    {"topicId": "ct_SX5S010", "difficulty": "basic", "question": "x + 5 = 12，x = ?", "options": ["5", "6", "7", "8"], "answer": 2, "explanation": "12-5=7，x=7。"},
    {"topicId": "ct_SX5S010", "difficulty": "medium", "question": "3x = 15，x = ?", "options": ["3", "4", "5", "6"], "answer": 2, "explanation": "15÷3=5，x=5。"},
    {"topicId": "ct_SX5S010", "difficulty": "hard", "question": "小明今年x岁，爸爸是他的3倍，爸爸36岁，x = ?", "options": ["10", "11", "12", "13"], "answer": 2, "explanation": "3x=36，x=12。"},
    {"topicId": "ct_SX5S005", "difficulty": "basic", "question": "12的因数有哪些？", "options": ["1, 2, 3, 4, 6, 12", "1, 2, 4, 8, 12", "2, 3, 4, 6", "1, 3, 5, 12"], "answer": 0, "explanation": "12的因数有1、2、3、4、6、12。"},
    {"topicId": "ct_SX5S005", "difficulty": "medium", "question": "5的倍数最小是几？", "options": ["0", "1", "5", "10"], "answer": 2, "explanation": "5的最小倍数是5本身。"},
    {"topicId": "ct_SX5S005", "difficulty": "hard", "question": "既是2的倍数又是3的倍数的最小两位数是（ ）", "options": ["6", "12", "18", "24"], "answer": 1, "explanation": "2和3的最小公倍数是6，最小两位数是12。"},
    {"topicId": "ct_SX5S020", "difficulty": "basic", "question": "长方体有（ ）个面", "options": ["4个", "6个", "8个", "12个"], "answer": 1, "explanation": "长方体有6个面。"},
    {"topicId": "ct_SX5S020", "difficulty": "medium", "question": "正方体的棱长总和是48厘米，一条棱长多少厘米？", "options": ["4厘米", "6厘米", "8厘米", "12厘米"], "answer": 0, "explanation": "正方体有12条棱，48÷12=4厘米。"},
    {"topicId": "ct_SX5S020", "difficulty": "hard", "question": "一个长方体长8厘米、宽6厘米、高4厘米，体积是多少？", "options": ["192立方厘米", "184立方厘米", "168立方厘米", "148立方厘米"], "answer": 0, "explanation": "8×6×4=192立方厘米。"},
])

# 六年级数学
all_questions.extend([
    {"topicId": "ct_SX6S001", "difficulty": "basic", "question": "计算：1/2 × 1/3 = ?", "options": ["1/5", "1/6", "2/5", "2/6"], "answer": 1, "explanation": "分子乘分子，分母乘分母：1/2×1/3=1/6。"},
    {"topicId": "ct_SX6S001", "difficulty": "medium", "question": "计算：2/3 × 3/4 = ?", "options": ["5/7", "6/12", "1/2", "5/12"], "answer": 2, "explanation": "2/3×3/4=6/12=1/2。"},
    {"topicId": "ct_SX6S002", "difficulty": "basic", "question": "计算：1/2 ÷ 1/4 = ?", "options": ["1/8", "2", "1/2", "4"], "answer": 1, "explanation": "除以一个数等于乘它的倒数：1/2×4=2。"},
    {"topicId": "ct_SX6S002", "difficulty": "medium", "question": "计算：3/4 ÷ 3/5 = ?", "options": ["5/4", "9/20", "4/5", "1/2"], "answer": 0, "explanation": "3/4×5/3=15/12=5/4。"},
    {"topicId": "ct_SX6S010", "difficulty": "basic", "question": "圆的周长公式是（ ）", "options": ["C=πd", "C=2πr", "C=πr²", "A和B都对"], "answer": 3, "explanation": "C=πd=2πr。"},
    {"topicId": "ct_SX6S010", "difficulty": "medium", "question": "半径3厘米的圆，周长是多少？（π取3.14）", "options": ["9.42厘米", "18.84厘米", "28.26厘米", "37.68厘米"], "answer": 1, "explanation": "2×3.14×3=18.84厘米。"},
    {"topicId": "ct_SX6S010", "difficulty": "hard", "question": "半径4厘米的圆，面积是多少？（π取3.14）", "options": ["12.56平方厘米", "25.12平方厘米", "50.24平方厘米", "100.48平方厘米"], "answer": 2, "explanation": "3.14×4²=50.24平方厘米。"},
    {"topicId": "ct_SX6S020", "difficulty": "basic", "question": "50% = （ ）", "options": ["0.5", "5", "0.05", "50"], "answer": 0, "explanation": "50%=0.5。"},
    {"topicId": "ct_SX6S020", "difficulty": "medium", "question": "一件衣服原价200元，打8折后多少元？", "options": ["160元", "180元", "190元", "170元"], "answer": 0, "explanation": "200×0.8=160元。"},
    {"topicId": "ct_SX6S005", "difficulty": "basic", "question": "3:5可以写成（ ）", "options": ["3/5", "5/3", "3÷5", "3×5"], "answer": 0, "explanation": "3:5可以写成分数3/5。"},
    {"topicId": "ct_SX6S005", "difficulty": "medium", "question": "如果3:5 = x:15，x = ?", "options": ["6", "9", "12", "15"], "answer": 1, "explanation": "3/5=x/15，x=9。"},
    {"topicId": "ct_SX6S005", "difficulty": "hard", "question": "男生和女生人数比是4:5，女生比男生多（ ）", "options": ["1/4", "1/5", "1/3", "1/2"], "answer": 0, "explanation": "(5-4)/4=1/4。"},
    {"topicId": "ct_SX6S015", "difficulty": "basic", "question": "-5℃和3℃哪个温度更高？", "options": ["-5℃", "3℃", "一样高", "无法比较"], "answer": 1, "explanation": "3℃高于-5℃。"},
    {"topicId": "ct_SX6S015", "difficulty": "medium", "question": "-3 + 8 = ?", "options": ["-11", "11", "5", "-5"], "answer": 2, "explanation": "-3+8=5。"},
    {"topicId": "ct_SX6S015", "difficulty": "hard", "question": "下列说法正确的是（ ）", "options": ["0是正数", "0是负数", "0既不是正数也不是负数", "0是最大的负数"], "answer": 2, "explanation": "0既不是正数也不是负数。"},
])

# ==================== 语文 ====================

# 一年级语文
all_questions.extend([
    {"topicId": "ct_YW1S001", "difficulty": "basic", "question": "下面哪个是声母？", "options": ["a", "b", "o", "i"], "answer": 1, "explanation": "b是声母，a、o、i是韵母。"},
    {"topicId": "ct_YW1S001", "difficulty": "basic", "question": "'b'的正确发音是（ ）", "options": ["波", "泼", "摸", "佛"], "answer": 0, "explanation": "b发音为'波'。"},
    {"topicId": "ct_YW1S001", "difficulty": "medium", "question": "下面哪个是整体认读音节？", "options": ["ba", "zhi", "pa", "ma"], "answer": 1, "explanation": "zhi是整体认读音节。"},
    {"topicId": "ct_YW1S001", "difficulty": "hard", "question": "'ü'和n相拼时，两点（ ）", "options": ["保留", "去掉", "变成u", "变成i"], "answer": 0, "explanation": "ü和n相拼时两点保留，如nü。"},
    {"topicId": "ct_YW1S005", "difficulty": "basic", "question": "下面哪个字是'日'字？", "options": ["目", "日", "田", "白"], "answer": 1, "explanation": "日字是太阳的意思。"},
    {"topicId": "ct_YW1S005", "difficulty": "basic", "question": "'木'字加一笔可以变成（ ）", "options": ["本", "林", "森", "术"], "answer": 0, "explanation": "木字加一横变成'本'。"},
    {"topicId": "ct_YW1S005", "difficulty": "medium", "question": "'人'字加两笔可以变成（ ）", "options": ["大", "天", "夫", "太"], "answer": 1, "explanation": "人字加两横变成'天'。"},
    {"topicId": "ct_YW1S010", "difficulty": "basic", "question": "《小蝌蚪找妈妈》中，小蝌蚪最后找到了谁？", "options": ["鸭子", "鱼", "青蛙", "乌龟"], "answer": 2, "explanation": "小蝌蚪最后找到了青蛙妈妈。"},
    {"topicId": "ct_YW1S010", "difficulty": "medium", "question": "'锄禾日当午'的下一句是（ ）", "options": ["汗滴禾下土", "粒粒皆辛苦", "谁知盘中餐", "春种一粒粟"], "answer": 0, "explanation": "下一句是'汗滴禾下土'。"},
    {"topicId": "ct_YW1S063", "difficulty": "basic", "question": "把句子补充完整：今天天气______", "options": ["很好", "跑步", "红色", "桌子"], "answer": 0, "explanation": "天气很好是完整的表达。"},
    {"topicId": "ct_YW1S063", "difficulty": "medium", "question": "下面哪个句子最完整？", "options": ["小明跑步", "小明在公园里跑步", "跑步", "在公园"], "answer": 1, "explanation": "完整的句子需要主语、地点、动作。"},
    {"topicId": "ct_YW1S065", "difficulty": "basic", "question": "看图写话时，首先应该（ ）", "options": ["直接写", "仔细观察图片", "问别人", "写很多字"], "answer": 1, "explanation": "看图写话要先仔细观察。"},
    {"topicId": "ct_YW1S065", "difficulty": "medium", "question": "看图写一句话，最重要的要素是（ ）", "options": ["用很多成语", "写出图中有什么", "写得很长", "用很多感叹号"], "answer": 1, "explanation": "看图写话要写出图中主要内容。"},
])

# 二年级语文
all_questions.extend([
    {"topicId": "ct_YW2S005", "difficulty": "basic", "question": "用音序查字法查'学'字，先查（ ）", "options": ["xue", "X", "学", "x"], "answer": 1, "explanation": "音序查字法先查音序X。"},
    {"topicId": "ct_YW2S005", "difficulty": "medium", "question": "用部首查字法查'河'字，先查（ ）部", "options": ["氵", "可", "口", "亅"], "answer": 0, "explanation": "河字是三点水旁，先查氵部。"},
    {"topicId": "ct_YW2S005", "difficulty": "hard", "question": "'夜'字的部首是（ ）", "options": ["亠", "亻", "夕", "丶"], "answer": 2, "explanation": "夜字是夕字旁。"},
    {"topicId": "ct_YW2S008", "difficulty": "basic", "question": "下面哪个句子是完整的？", "options": ["在公园玩", "小明在公园玩", "玩得很开心", "公园里"], "answer": 1, "explanation": "完整句子需要有主语和谓语。"},
    {"topicId": "ct_YW2S008", "difficulty": "medium", "question": "把'小鸟飞上了天空'改成比喻句", "options": ["小鸟像飞机一样飞上了天空", "小鸟飞得很高", "小鸟在天空中飞", "小鸟飞上了蓝蓝的天空"], "answer": 0, "explanation": "比喻句需要把小鸟比作其他事物。"},
    {"topicId": "ct_YW2S008", "difficulty": "basic", "question": "留言条应该包括哪些要素？", "options": ["称呼、正文、署名、日期", "标题、正文、结尾", "时间、地点、人物", "开头、中间、结尾"], "answer": 0, "explanation": "留言条四要素：称呼、正文、署名、日期。"},
    {"topicId": "ct_YW2S008", "difficulty": "medium", "question": "写留言条时，署名应该写（ ）", "options": ["对方的名字", "自己的名字", "老师的名字", "家长的名字"], "answer": 1, "explanation": "署名写留言人的名字。"},
    {"topicId": "ct_YW2S010", "difficulty": "basic", "question": "《坐井观天》中，青蛙认为天有多大？", "options": ["无边无际", "井口那么大", "很大很大", "比井大一点"], "answer": 1, "explanation": "青蛙坐在井里，认为天只有井口那么大。"},
    {"topicId": "ct_YW2S010", "difficulty": "medium", "question": "《狐假虎威》中，狐狸借了什么吓跑百兽？", "options": ["老虎的威风", "狮子的威风", "自己的威风", "大象的威风"], "answer": 0, "explanation": "狐狸借了老虎的威风。"},
    {"topicId": "ct_YW2S010", "difficulty": "hard", "question": "《亡羊补牢》告诉我们什么道理？", "options": ["做事要专心", "出了问题及时补救", "要团结合作", "要勤奋学习"], "answer": 1, "explanation": "亡羊补牢告诉我们出了问题及时补救还不算晚。"},
])

# 三年级语文
all_questions.extend([
    {"topicId": "ct_YW3S005", "difficulty": "basic", "question": "'画蛇添足'比喻什么？", "options": ["做事认真", "多此一举", "画得很好", "速度很快"], "answer": 1, "explanation": "画蛇添足比喻多此一举，反而坏事。"},
    {"topicId": "ct_YW3S005", "difficulty": "medium", "question": "'守株待兔'的'株'指什么？", "options": ["树桩", "兔子", "农夫", "田地"], "answer": 0, "explanation": "株指树桩。"},
    {"topicId": "ct_YW3S005", "difficulty": "hard", "question": "下面哪个成语与'勤奋学习'有关？", "options": ["三心二意", "悬梁刺股", "守株待兔", "画蛇添足"], "answer": 1, "explanation": "悬梁刺股形容勤奋学习。"},
    {"topicId": "ct_YW3S008", "difficulty": "basic", "question": "'小鸟在树上唱歌'用了什么修辞手法？", "options": ["比喻", "拟人", "排比", "夸张"], "answer": 1, "explanation": "把小鸟当作人来写，是拟人。"},
    {"topicId": "ct_YW3S008", "difficulty": "medium", "question": "'弯弯的月亮像小船'用了什么修辞手法？", "options": ["拟人", "比喻", "排比", "夸张"], "answer": 1, "explanation": "把月亮比作小船，是比喻。"},
    {"topicId": "ct_YW3S008", "difficulty": "hard", "question": "下面哪句是排比句？", "options": ["春天来了，花儿开了，草儿绿了，鸟儿叫了", "花儿像笑脸", "花儿真美", "我喜欢花儿"], "answer": 0, "explanation": "三个以上结构相似的句子构成排比。"},
    {"topicId": "ct_YW3S015", "difficulty": "basic", "question": "《秋天的雨》中，秋天的雨是什么颜色的？", "options": ["五彩缤纷的", "黄色的", "红色的", "蓝色的"], "answer": 0, "explanation": "秋天的雨是五彩缤纷的。"},
    {"topicId": "ct_YW3S015", "difficulty": "medium", "question": "《铺满金色巴掌的水泥道》中，'金色巴掌'指什么？", "options": ["树叶", "花朵", "小鸟", "星星"], "answer": 0, "explanation": "金色巴掌指梧桐树叶。"},
    {"topicId": "ct_YW3S015", "difficulty": "hard", "question": "《卖火柴的小女孩》中，小女孩擦了几根火柴？", "options": ["3根", "4根", "5根", "6根"], "answer": 2, "explanation": "小女孩擦了5根火柴。"},
    {"topicId": "ct_YW3S020", "difficulty": "basic", "question": "续写故事时，最重要的是（ ）", "options": ["写得越长越好", "承接上文，情节合理", "用很多好词", "写不同的故事"], "answer": 1, "explanation": "续写要承接上文，情节合理。"},
    {"topicId": "ct_YW3S020", "difficulty": "medium", "question": "续写故事时，人物应该（ ）", "options": ["突然改变性格", "保持原有性格", "全部换掉", "减少人物"], "answer": 1, "explanation": "续写要保持人物性格一致。"},
    {"topicId": "ct_YW3S020", "difficulty": "hard", "question": "续写《龟兔赛跑》，下列哪个情节最合理？", "options": ["兔子又睡觉了，乌龟又赢了", "乌龟和兔子成为了朋友，一起跑步", "兔子改掉了骄傲的毛病，和乌龟一起练习", "兔子学会开车，赢了乌龟"], "answer": 2, "explanation": "续写要符合故事逻辑，有教育意义。"},
])

# 四年级语文
all_questions.extend([
    {"topicId": "ct_YW4S005", "difficulty": "basic", "question": "'床前明月光'的下一句是（ ）", "options": ["疑是地上霜", "举头望明月", "低头思故乡", "明月松间照"], "answer": 0, "explanation": "下一句是'疑是地上霜'。"},
    {"topicId": "ct_YW4S005", "difficulty": "medium", "question": "'春眠不觉晓'的作者是（ ）", "options": ["李白", "杜甫", "孟浩然", "王维"], "answer": 2, "explanation": "作者是孟浩然。"},
    {"topicId": "ct_YW4S005", "difficulty": "hard", "question": "'停车坐爱枫林晚'的下一句是（ ）", "options": ["霜叶红于二月花", "白云生处有人家", "远上寒山石径斜", "不及汪伦送我情"], "answer": 0, "explanation": "下一句是'霜叶红于二月花'。"},
    {"topicId": "ct_YW4S010", "difficulty": "basic", "question": "写记叙文的三要素是（ ）", "options": ["时间、地点、人物", "开头、中间、结尾", "原因、经过、结果", "总起、分述、总结"], "answer": 0, "explanation": "记叙文三要素是时间、地点、人物。"},
    {"topicId": "ct_YW4S010", "difficulty": "medium", "question": "作文中间部分应该写什么？", "options": ["时间地点", "事情的经过", "心情感受", "收获体会"], "answer": 1, "explanation": "中间部分写事情的经过。"},
    {"topicId": "ct_YW4S010", "difficulty": "hard", "question": "写'我的妈妈'，下列哪个开头最吸引人？", "options": ["我的妈妈很漂亮", "我的妈妈有一双会说话的眼睛，每次我犯错，她不用开口，我就知道错了", "我的妈妈今年35岁", "我的妈妈很爱我"], "answer": 1, "explanation": "具体的细节描写比概括性陈述更吸引人。"},
    {"topicId": "ct_YW4S010", "difficulty": "basic", "question": "书信的格式不包括（ ）", "options": ["称呼", "正文", "署名", "标题"], "answer": 3, "explanation": "书信格式包括称呼、正文、结尾、署名、日期，不需要标题。"},
    {"topicId": "ct_YW4S010", "difficulty": "medium", "question": "书信开头的称呼应该（ ）", "options": ["空两格写", "顶格写", "写在中上方", "写在右下角"], "answer": 1, "explanation": "称呼要顶格写，表示尊敬。"},
    {"topicId": "ct_YW4S010", "difficulty": "hard", "question": "写信的结尾祝福语，下列哪个最合适？", "options": ["此致敬礼", "再见", "谢谢", "好的"], "answer": 0, "explanation": "书信结尾常用'此致敬礼'。"},
])

# 五年级语文
all_questions.extend([
    {"topicId": "ct_YW5S005", "difficulty": "basic", "question": "'鲸是哺乳动物'用了什么说明方法？", "options": ["举例子", "下定义", "打比方", "列数字"], "answer": 1, "explanation": "下定义是说明事物的本质特征。"},
    {"topicId": "ct_YW5S005", "difficulty": "medium", "question": "'赵州桥非常长，大约50多米'用了什么说明方法？", "options": ["作比较", "列数字", "打比方", "举例子"], "answer": 1, "explanation": "用数字说明，是列数字。"},
    {"topicId": "ct_YW5S005", "difficulty": "hard", "question": "'松鼠的叫声很响亮，比黄鼠狼的叫声还要尖些'用了什么说明方法？", "options": ["举例子", "列数字", "作比较", "打比方"], "answer": 2, "explanation": "把松鼠和黄鼠狼比较，是作比较。"},
    {"topicId": "ct_YW5S015", "difficulty": "basic", "question": "缩写故事时，应该（ ）", "options": ["保留主要情节", "保留所有细节", "改变故事内容", "增加新情节"], "answer": 0, "explanation": "缩写要保留主要情节。"},
    {"topicId": "ct_YW5S015", "difficulty": "medium", "question": "缩写时，下列哪种句子应该删除？", "options": ["主要人物的对话", "次要人物的描写", "故事的起因", "故事的结果"], "answer": 1, "explanation": "次要人物的描写可以删减。"},
    {"topicId": "ct_YW5S015", "difficulty": "hard", "question": "缩写《草船借箭》，下列哪个内容不能删？", "options": ["鲁肃的担心", "诸葛亮的计谋", "江上的大雾", "周瑜的佩服"], "answer": 1, "explanation": "诸葛亮的计谋是核心情节，不能删。"},
])

# 六年级语文
all_questions.extend([
    {"topicId": "ct_YW6S005", "difficulty": "basic", "question": "《少年闰土》的作者是（ ）", "options": ["鲁迅", "老舍", "巴金", "茅盾"], "answer": 0, "explanation": "作者是鲁迅。"},
    {"topicId": "ct_YW6S005", "difficulty": "medium", "question": "《匆匆》中，作者感叹什么匆匆？", "options": ["时间", "青春", "生命", "流水"], "answer": 0, "explanation": "朱自清感叹时间匆匆。"},
    {"topicId": "ct_YW6S005", "difficulty": "hard", "question": "《为人民服务》是（ ）写的", "options": ["毛泽东", "周恩来", "邓小平", "江泽民"], "answer": 0, "explanation": "《为人民服务》是毛泽东写的。"},
    {"topicId": "ct_YW6S010", "difficulty": "basic", "question": "倡议书的格式不包括（ ）", "options": ["标题", "称呼", "正文", "摘要"], "answer": 3, "explanation": "倡议书格式：标题、称呼、正文、结尾、署名、日期。"},
    {"topicId": "ct_YW6S010", "difficulty": "medium", "question": "倡议书正文应该写（ ）", "options": ["倡议的原因和内容", "个人感想", "故事", "诗歌"], "answer": 0, "explanation": "正文要写清倡议的原因和具体内容。"},
    {"topicId": "ct_YW6S010", "difficulty": "hard", "question": "写'节约用水'倡议书，下列哪个建议最具体？", "options": ["要节约用水", "洗手时关小水龙头", "水是宝贵的", "浪费水不好"], "answer": 1, "explanation": "具体建议比口号更有号召力。"},
])

# ==================== 英语 ====================

# 三年级英语
all_questions.extend([
    {"topicId": "ct_YY3S001", "difficulty": "basic", "question": "选出字母表中第5个字母", "options": ["D", "E", "F", "G"], "answer": 1, "explanation": "第5个字母是E。"},
    {"topicId": "ct_YY3S001", "difficulty": "medium", "question": "选出元音字母", "options": ["B", "C", "A", "D"], "answer": 2, "explanation": "A是元音字母。"},
    {"topicId": "ct_YY3S002", "difficulty": "basic", "question": "选出'school'的中文意思", "options": ["家", "学校", "公园", "商店"], "answer": 1, "explanation": "school是学校。"},
    {"topicId": "ct_YY3S002", "difficulty": "basic", "question": "选出'teacher'的中文意思", "options": ["学生", "老师", "医生", "工人"], "answer": 1, "explanation": "teacher是老师。"},
    {"topicId": "ct_YY3S002", "difficulty": "medium", "question": "选出'friend'的中文意思", "options": ["家人", "朋友", "同学", "邻居"], "answer": 1, "explanation": "friend是朋友。"},
    {"topicId": "ct_YY3S005", "difficulty": "basic", "question": "选出'How are you?'的正确回答", "options": ["I'm fine, thank you.", "My name is Tom.", "I am 9 years old.", "Goodbye!"], "answer": 0, "explanation": "How are you? 的正确回答是 I'm fine, thank you."},
    {"topicId": "ct_YY3S005", "difficulty": "medium", "question": "选出'What's your name?'的正确回答", "options": ["I'm fine.", "My name is Lily.", "I am happy.", "Goodbye."], "answer": 1, "explanation": "What's your name? 的正确回答是 My name is..."},
    {"topicId": "ct_YY3S005", "difficulty": "hard", "question": "选出'How old are you?'的正确回答", "options": ["I'm fine.", "I'm 9 years old.", "My name is Tom.", "Good morning."], "answer": 1, "explanation": "How old are you? 询问年龄，回答用 I'm ... years old."},
    {"topicId": "ct_YY3S005", "difficulty": "basic", "question": "选出'red'的中文意思", "options": ["蓝色", "红色", "绿色", "黄色"], "answer": 1, "explanation": "red是红色。"},
    {"topicId": "ct_YY3S005", "difficulty": "medium", "question": "选出'How many'的正确用法", "options": ["How many book?", "How many books?", "How many bookes?", "How many booking?"], "answer": 1, "explanation": "How many后接可数名词复数。"},
    {"topicId": "ct_YY3S005", "difficulty": "hard", "question": "'I have ten apples.'中，ten的意思是（ ）", "options": ["二", "五", "十", "十二"], "answer": 2, "explanation": "ten是十。"},
])

# 四年级英语
all_questions.extend([
    {"topicId": "ct_YY4S001", "difficulty": "basic", "question": "选出正确的be动词：I ___ a student.", "options": ["am", "is", "are", "be"], "answer": 0, "explanation": "I后面用am。"},
    {"topicId": "ct_YY4S001", "difficulty": "basic", "question": "选出正确的be动词：She ___ a teacher.", "options": ["am", "is", "are", "be"], "answer": 1, "explanation": "第三人称单数用is。"},
    {"topicId": "ct_YY4S001", "difficulty": "medium", "question": "选出正确的be动词：They ___ playing football.", "options": ["am", "is", "are", "be"], "answer": 2, "explanation": "复数用are。"},
    {"topicId": "ct_YY4S005", "difficulty": "basic", "question": "选出'book'的复数形式", "options": ["book", "books", "bookes", "bookies"], "answer": 1, "explanation": "book的复数是books。"},
    {"topicId": "ct_YY4S005", "difficulty": "medium", "question": "选出'box'的复数形式", "options": ["boxs", "boxes", "boxies", "box"], "answer": 1, "explanation": "以x结尾加es。"},
    {"topicId": "ct_YY4S005", "difficulty": "hard", "question": "选出'child'的复数形式", "options": ["childs", "childes", "children", "childrens"], "answer": 2, "explanation": "child的复数是children。"},
    {"topicId": "ct_YY4S010", "difficulty": "basic", "question": "选出'Good morning'的中文意思", "options": ["晚上好", "早上好", "下午好", "再见"], "answer": 1, "explanation": "Good morning是早上好。"},
    {"topicId": "ct_YY4S010", "difficulty": "medium", "question": "选出'Nice to meet you'的中文意思", "options": ["很高兴认识你", "很高兴见到你", "再见", "谢谢"], "answer": 0, "explanation": "Nice to meet you是很高兴认识你。"},
    {"topicId": "ct_YY4S008", "difficulty": "basic", "question": "选出'sunny'的中文意思", "options": ["下雨的", "晴朗的", "多云的", "下雪的"], "answer": 1, "explanation": "sunny是晴朗的。"},
    {"topicId": "ct_YY4S008", "difficulty": "medium", "question": "选出'What's the weather like today?'的正确回答", "options": ["It's sunny.", "It's Monday.", "It's 3 o'clock.", "It's January."], "answer": 0, "explanation": "问天气回答天气状况。"},
    {"topicId": "ct_YY4S008", "difficulty": "hard", "question": "选出'rainy'的反义词", "options": ["windy", "sunny", "cloudy", "snowy"], "answer": 1, "explanation": "rainy（下雨的）的反义词是sunny（晴朗的）。"},
])

# 五年级英语
all_questions.extend([
    {"topicId": "ct_YY5S001", "difficulty": "basic", "question": "选出正确的现在进行时：Look! The birds ___ in the sky.", "options": ["fly", "flies", "are flying", "flew"], "answer": 2, "explanation": "Look提示现在进行时，用are flying。"},
    {"topicId": "ct_YY5S001", "difficulty": "medium", "question": "选出正确的过去式：Yesterday, I ___ to the park.", "options": ["go", "goes", "went", "going"], "answer": 2, "explanation": "Yesterday提示过去式，go的过去式是went。"},
    {"topicId": "ct_YY5S001", "difficulty": "hard", "question": "选出正确的将来时：Tomorrow, I ___ visit my grandma.", "options": ["visit", "visits", "will visit", "visited"], "answer": 2, "explanation": "Tomorrow提示将来时，用will visit。"},
    {"topicId": "ct_YY5S005", "difficulty": "basic", "question": "选出正确的介词：The cat is ___ the table.", "options": ["in", "on", "at", "to"], "answer": 1, "explanation": "在桌子上用on。"},
    {"topicId": "ct_YY5S005", "difficulty": "medium", "question": "选出正确的介词：I go to school ___ bus.", "options": ["in", "on", "by", "at"], "answer": 2, "explanation": "by bus表示乘公交车。"},
    {"topicId": "ct_YY5S008", "difficulty": "basic", "question": "选出'spring'的中文意思", "options": ["夏天", "秋天", "春天", "冬天"], "answer": 2, "explanation": "spring是春天。"},
    {"topicId": "ct_YY5S008", "difficulty": "medium", "question": "选出'I like summer best.'的中文意思", "options": ["我喜欢夏天", "我喜欢夏天最好", "我最喜欢夏天", "我比较好喜欢夏天"], "answer": 2, "explanation": "like...best表示最喜欢。"},
    {"topicId": "ct_YY5S008", "difficulty": "hard", "question": "选出'winter'的季节特征", "options": ["hot", "warm", "cool", "cold"], "answer": 3, "explanation": "winter是冬天，特征是cold。"},
])

# 六年级英语
all_questions.extend([
    {"topicId": "ct_YY6S001", "difficulty": "basic", "question": "选出'big'的比较级", "options": ["big", "bigger", "biggest", "more big"], "answer": 1, "explanation": "单音节词加er。"},
    {"topicId": "ct_YY6S001", "difficulty": "medium", "question": "选出'beautiful'的比较级", "options": ["beautifuler", "more beautiful", "most beautiful", "beautifully"], "answer": 1, "explanation": "多音节词加more。"},
    {"topicId": "ct_YY6S001", "difficulty": "hard", "question": "选出'Tom is taller than me.'的中文意思", "options": ["Tom和我一样高", "Tom比我高", "Tom比我矮", "Tom没有我高"], "answer": 1, "explanation": "taller than表示比...高。"},
    {"topicId": "ct_YY6S008", "difficulty": "basic", "question": "选出'How much is it?'的正确回答", "options": ["It's 5 yuan.", "It's 5 o'clock.", "It's 5 years old.", "It's Monday."], "answer": 0, "explanation": "How much问价格，回答价格。"},
    {"topicId": "ct_YY6S008", "difficulty": "medium", "question": "选出'I'll take it.'的中文意思", "options": ["我买了", "我要这个", "我拿了", "我带走了"], "answer": 1, "explanation": "I'll take it.表示我要买这个。"},
    {"topicId": "ct_YY6S008", "difficulty": "hard", "question": "选出'expensive'的反义词", "options": ["cheap", "dear", "nice", "good"], "answer": 0, "explanation": "expensive（贵的）的反义词是cheap（便宜的）。"},
])

# ==================== 科学 ====================

# 三年级科学
all_questions.extend([
    {"topicId": "ct_KX3S005", "difficulty": "basic", "question": "水在什么温度下会结冰？", "options": ["0℃以下", "10℃", "50℃", "100℃"], "answer": 0, "explanation": "在标准大气压下，水在0℃以下会结冰。"},
    {"topicId": "ct_KX3S005", "difficulty": "medium", "question": "水变成水蒸气的过程叫什么？", "options": ["凝固", "蒸发", "凝结", "融化"], "answer": 1, "explanation": "水变成水蒸气是蒸发（汽化）过程。"},
    {"topicId": "ct_KX3S005", "difficulty": "hard", "question": "冬天，窗户上出现的水珠是什么现象？", "options": ["蒸发", "凝结", "融化", "凝固"], "answer": 1, "explanation": "室内温暖的水蒸气遇到冷的玻璃，凝结成小水珠。"},
    {"topicId": "ct_KX3S010", "difficulty": "basic", "question": "植物进行光合作用需要（ ）", "options": ["阳光、水、二氧化碳", "土壤、空气、肥料", "阳光、土壤、空气", "水、空气、肥料"], "answer": 0, "explanation": "光合作用需要阳光、水和二氧化碳。"},
    {"topicId": "ct_KX3S010", "difficulty": "medium", "question": "植物的根有什么作用？", "options": ["制造养分", "吸收水分和养分", "进行光合作用", "繁殖"], "answer": 1, "explanation": "根的作用是吸收水分和养分。"},
    {"topicId": "ct_KX3S015", "difficulty": "basic", "question": "下面哪种动物是哺乳动物？", "options": ["鸡", "鱼", "猫", "青蛙"], "answer": 2, "explanation": "猫是哺乳动物。"},
    {"topicId": "ct_KX3S015", "difficulty": "medium", "question": "下面哪种动物是昆虫？", "options": ["蜘蛛", "蝴蝶", "蚯蚓", "蜗牛"], "answer": 1, "explanation": "蝴蝶是昆虫，身体分头胸腹三部分，有三对足。"},
    {"topicId": "ct_KX3S020", "difficulty": "basic", "question": "下面哪种物质能溶解在水里？", "options": ["沙子", "盐", "石头", "塑料"], "answer": 1, "explanation": "盐能溶解在水里。"},
    {"topicId": "ct_KX3S020", "difficulty": "medium", "question": "加快溶解的方法不包括（ ）", "options": ["搅拌", "加热", "把物质弄碎", "加水"], "answer": 3, "explanation": "加水只是增加溶液量，不能加快溶解速度。"},
    {"topicId": "ct_KX3S020", "difficulty": "hard", "question": "把相同大小的糖块分别放入冷水和热水中，哪个溶解得快？", "options": ["冷水", "热水", "一样快", "无法确定"], "answer": 1, "explanation": "温度越高，溶解越快。"},
    {"topicId": "ct_KX3S025", "difficulty": "basic", "question": "测量气温用什么工具？", "options": ["尺子", "温度计", "天平", "量筒"], "answer": 1, "explanation": "测量气温用温度计。"},
    {"topicId": "ct_KX3S025", "difficulty": "medium", "question": "气温的单位是（ ）", "options": ["米", "摄氏度", "千克", "秒"], "answer": 1, "explanation": "气温单位是摄氏度。"},
    {"topicId": "ct_KX3S025", "difficulty": "hard", "question": "一天中气温最高通常在（ ）", "options": ["早上", "中午", "傍晚", "晚上"], "answer": 1, "explanation": "一天中气温最高通常在午后2点左右。"},
])

# 四年级科学
all_questions.extend([
    {"topicId": "ct_KX4S005", "difficulty": "basic", "question": "声音是由什么产生的？", "options": ["空气", "振动", "水", "光"], "answer": 1, "explanation": "声音是由物体振动产生的。"},
    {"topicId": "ct_KX4S005", "difficulty": "medium", "question": "下面哪种情况不能传播声音？", "options": ["空气", "水", "真空", "钢铁"], "answer": 2, "explanation": "真空不能传播声音。"},
    {"topicId": "ct_KX4S010", "difficulty": "basic", "question": "下面哪种物体是导体？", "options": ["塑料", "橡胶", "铜线", "木头"], "answer": 2, "explanation": "铜线是导体，容易导电。"},
    {"topicId": "ct_KX4S010", "difficulty": "medium", "question": "一个简单电路至少需要什么？", "options": ["电池、灯泡", "电池、导线、灯泡", "导线、开关", "电池、开关"], "answer": 1, "explanation": "简单电路需要电源（电池）、导线和用电器（灯泡）。"},
    {"topicId": "ct_KX4S015", "difficulty": "basic", "question": "下面哪种工具是杠杆？", "options": ["剪刀", "螺丝钉", "斜面", "轮轴"], "answer": 0, "explanation": "剪刀是杠杆的应用。"},
    {"topicId": "ct_KX4S015", "difficulty": "medium", "question": "斜面有什么作用？", "options": ["省力", "费力", "改变方向", "增加距离"], "answer": 0, "explanation": "斜面能省力。"},
    {"topicId": "ct_KX4S015", "difficulty": "hard", "question": "螺丝钉是哪种简单机械的应用？", "options": ["杠杆", "斜面", "轮轴", "滑轮"], "answer": 1, "explanation": "螺丝钉是斜面的变形应用。"},
])

# 五年级科学
all_questions.extend([
    {"topicId": "ct_KX5S005", "difficulty": "basic", "question": "细胞是生物体什么的基本单位？", "options": ["结构和功能", "生长和繁殖", "遗传和变异", "代谢"], "answer": 0, "explanation": "细胞是生物体结构和功能的基本单位。"},
    {"topicId": "ct_KX5S005", "difficulty": "medium", "question": "植物细胞与动物细胞最大的区别是植物细胞有（ ）", "options": ["细胞膜", "细胞质", "细胞壁", "细胞核"], "answer": 2, "explanation": "植物细胞有细胞壁，动物细胞没有。"},
    {"topicId": "ct_KX5S010", "difficulty": "basic", "question": "杠杆有三个点，分别是（ ）", "options": ["支点、用力点、阻力点", "起点、中点、终点", "上点、中点、下点", "重点、轻点、中点"], "answer": 0, "explanation": "杠杆三点：支点、用力点、阻力点。"},
    {"topicId": "ct_KX5S010", "difficulty": "medium", "question": "费力杠杆的特点是（ ）", "options": ["省力但费距离", "费力但省距离", "不省力也不费力", "既省力又省距离"], "answer": 1, "explanation": "费力杠杆费力但省距离。"},
    {"topicId": "ct_KX5S010", "difficulty": "hard", "question": "下面哪种工具是省力杠杆？", "options": ["镊子", "筷子", "撬棍", "钓鱼竿"], "answer": 2, "explanation": "撬棍是省力杠杆，动力臂大于阻力臂。"},
])

# 六年级科学
all_questions.extend([
    {"topicId": "ct_KX6S005", "difficulty": "basic", "question": "地球绕着什么转？", "options": ["月亮", "太阳", "火星", "北极星"], "answer": 1, "explanation": "地球绕着太阳转。"},
    {"topicId": "ct_KX6S005", "difficulty": "medium", "question": "太阳系中最大的行星是（ ）", "options": ["地球", "木星", "土星", "火星"], "answer": 1, "explanation": "木星是太阳系中最大的行星。"},
    {"topicId": "ct_KX6S005", "difficulty": "hard", "question": "月亮本身发光吗？", "options": ["发光", "不发光", "有时发光", "白天发光"], "answer": 1, "explanation": "月亮本身不发光，它反射太阳光。"},
    {"topicId": "ct_KX6S010", "difficulty": "basic", "question": "食物链从什么开始？", "options": ["动物", "植物", "微生物", "阳光"], "answer": 1, "explanation": "食物链从生产者（植物）开始。"},
    {"topicId": "ct_KX6S010", "difficulty": "medium", "question": "下面哪条食物链是正确的？", "options": ["草→兔→狼", "狼→兔→草", "兔→草→狼", "草→狼→兔"], "answer": 0, "explanation": "食物链从植物开始，到食草动物，再到食肉动物。"},
    {"topicId": "ct_KX6S015", "difficulty": "basic", "question": "生物多样性包括（ ）", "options": ["物种多样性、遗传多样性、生态系统多样性", "动物多样性、植物多样性", "陆地多样性、海洋多样性", "热带多样性、寒带多样性"], "answer": 0, "explanation": "生物多样性包括三个层次。"},
    {"topicId": "ct_KX6S015", "difficulty": "medium", "question": "保护生物多样性的根本措施是（ ）", "options": ["保护生物的栖息环境", "把动物关在动物园", "把植物种在公园", "减少人类活动"], "answer": 0, "explanation": "保护栖息环境是保护生物多样性的根本措施。"},
    {"topicId": "ct_KX6S015", "difficulty": "hard", "question": "下面哪种行为有利于保护生物多样性？", "options": ["乱砍滥伐", "建立自然保护区", "随意捕杀野生动物", "破坏湿地"], "answer": 1, "explanation": "建立自然保护区是保护生物多样性的有效措施。"},
])

# ==================== 生成最终题库 ====================

output = {
    "version": "v1.3-diagnostic",
    "description": "知识点诊断题库：覆盖数学、语文、英语、科学核心知识点",
    "generatedAt": "2026-08-27T00:00:00Z",
    "totalQuestions": len(all_questions),
    "questions": []
}

# 为每个知识点生成题目，添加id
topic_counter = {}
for q in all_questions:
    tid = q["topicId"]
    if tid not in topic_counter:
        topic_counter[tid] = 0
    topic_counter[tid] += 1
    
    topic_suffix = tid.replace("ct_", "")
    q["id"] = f"dq_{topic_suffix}_{topic_counter[tid]:02d}"
    output["questions"].append(q)

# 统计
print(f"生成诊断题总数: {len(all_questions)}")
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
for q in all_questions:
    diff_stats[q["difficulty"]] += 1

print("\n按难度统计:")
for d, count in diff_stats.items():
    print(f"  {d}: {count}道")

# 保存
with open(os.path.join(data_dir, 'diagnostic-questions.json'), 'w', encoding='utf-8') as fp:
    json.dump(output, fp, ensure_ascii=False, indent=2)

print(f"\n题库已保存到: {os.path.join(data_dir, 'diagnostic-questions.json')}")
