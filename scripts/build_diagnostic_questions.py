#!/usr/bin/env python3
"""
批量生成诊断题库
覆盖数学、语文、英语、科学的核心知识点
每个知识点3-5道题，分基础/中等/拔高三个难度
"""

import json
import os

data_dir = 'D:/xcode/fgit/cn-primary-taxonomy/data'

# 诊断题数据（按知识点组织）
questions = []

# ==================== 数学 ====================

# 一年级数学
questions.extend([
    # 10以内数的认识
    {"topicId": "ct_SX1S001", "difficulty": "basic", "question": "数一数：图中有几个苹果？🍎🍎🍎", "options": ["2个", "3个", "4个", "5个"], "answer": 1, "explanation": "图中有3个苹果。"},
    {"topicId": "ct_SX1S001", "difficulty": "basic", "question": "下面哪个数字最大？", "options": ["5", "3", "7", "2"], "answer": 2, "explanation": "7是最大的数字。"},
    {"topicId": "ct_SX1S001", "difficulty": "medium", "question": "从1数到10，第5个数是几？", "options": ["4", "5", "6", "7"], "answer": 1, "explanation": "1、2、3、4、5，第5个数是5。"},
    
    # 10以内加减法
    {"topicId": "ct_SX1S002", "difficulty": "basic", "question": "计算：3 + 4 = ?", "options": ["6", "7", "8", "9"], "answer": 1, "explanation": "3+4=7。"},
    {"topicId": "ct_SX1S002", "difficulty": "basic", "question": "计算：9 - 5 = ?", "options": ["3", "4", "5", "6"], "answer": 1, "explanation": "9-5=4。"},
    {"topicId": "ct_SX1S002", "difficulty": "medium", "question": "小明有5个苹果，吃了2个，还剩几个？", "options": ["2个", "3个", "4个", "5个"], "answer": 1, "explanation": "5-2=3，还剩3个。"},
    {"topicId": "ct_SX1S002", "difficulty": "hard", "question": "括号里填几？3 + ( ) = 8", "options": ["4", "5", "6", "7"], "answer": 1, "explanation": "8-3=5，所以括号里填5。"},
    
    # 认识图形
    {"topicId": "ct_SX1S038", "difficulty": "basic", "question": "下面哪个图形是圆形？", "options": ["□", "○", "△", "▭"], "answer": 1, "explanation": "○是圆形。"},
    {"topicId": "ct_SX1S038", "difficulty": "basic", "question": "下面哪个图形是三角形？", "options": ["□", "○", "△", "▭"], "answer": 2, "explanation": "△是三角形。"},
    {"topicId": "ct_SX1S038", "difficulty": "medium", "question": "长方形有几条边？", "options": ["3条", "4条", "5条", "6条"], "answer": 1, "explanation": "长方形有4条边。"},
    
    # 位置与顺序
    {"topicId": "ct_SX1S037", "difficulty": "basic", "question": "小猫在小狗的（ ）面。", "options": ["上", "下", "左", "右"], "answer": 0, "explanation": "小猫在小狗的上面。"},
    {"topicId": "ct_SX1S037", "difficulty": "medium", "question": "从前往后数，小明排第3，从后往前数，小明排第4，一共有几个人？", "options": ["5", "6", "7", "8"], "answer": 1, "explanation": "3+4-1=6人。"},
])

# 二年级数学
questions.extend([
    # 乘法口诀
    {"topicId": "ct_SX2S020", "difficulty": "basic", "question": "计算：3 × 4 = ?", "options": ["9", "12", "15", "18"], "answer": 1, "explanation": "三四十二，3×4=12。"},
    {"topicId": "ct_SX2S020", "difficulty": "basic", "question": "计算：7 × 8 = ?", "options": ["54", "56", "63", "72"], "answer": 1, "explanation": "七八五十六，7×8=56。"},
    {"topicId": "ct_SX2S020", "difficulty": "medium", "question": "括号里最大能填几？( ) × 5 < 30", "options": ["4", "5", "6", "7"], "answer": 1, "explanation": "5×5=25<30，6×5=30，所以最大填5。"},
    {"topicId": "ct_SX2S020", "difficulty": "hard", "question": "有4排树，每排5棵，一共有多少棵树？", "options": ["15棵", "18棵", "20棵", "25棵"], "answer": 2, "explanation": "4×5=20棵。"},
    
    # 除法初步
    {"topicId": "ct_SX2S021", "difficulty": "basic", "question": "把12个苹果平均分成3份，每份几个？", "options": ["3个", "4个", "5个", "6个"], "answer": 1, "explanation": "12÷3=4，每份4个。"},
    {"topicId": "ct_SX2S021", "difficulty": "medium", "question": "18 ÷ 6 = ?", "options": ["2", "3", "4", "6"], "answer": 1, "explanation": "18÷6=3。"},
    {"topicId": "ct_SX2S021", "difficulty": "hard", "question": "小明有24颗糖，平均分给6个小朋友，每人几颗？", "options": ["3颗", "4颗", "6颗", "8颗"], "answer": 1, "explanation": "24÷6=4颗。"},
    
    # 角的认识
    {"topicId": "ct_SX2S040", "difficulty": "basic", "question": "下面哪个是角？", "options": ["直线", "曲线", "有顶点和两条边", "一个点"], "answer": 2, "explanation": "角有一个顶点和两条边。"},
    {"topicId": "ct_SX2S040", "difficulty": "basic", "question": "直角是（ ）度。", "options": ["45", "90", "180", "360"], "answer": 1, "explanation": "直角是90度。"},
    {"topicId": "ct_SX2S040", "difficulty": "medium", "question": "比直角小的角叫什么？", "options": ["锐角", "钝角", "平角", "周角"], "answer": 0, "explanation": "比直角小的角是锐角。"},
    {"topicId": "ct_SX2S040", "difficulty": "hard", "question": "一个三角形中最多有几个直角？", "options": ["0个", "1个", "2个", "3个"], "answer": 1, "explanation": "三角形内角和180度，最多有1个直角。"},
    
    # 长度单位
    {"topicId": "ct_SX2S050", "difficulty": "basic", "question": "1米 = （ ）厘米", "options": ["10", "100", "1000", "10000"], "answer": 1, "explanation": "1米=100厘米。"},
    {"topicId": "ct_SX2S050", "difficulty": "basic", "question": "一支铅笔大约长（ ）", "options": ["10厘米", "10米", "100厘米", "1米"], "answer": 0, "explanation": "一支铅笔大约长10厘米。"},
    {"topicId": "ct_SX2S050", "difficulty": "medium", "question": "3米 = （ ）厘米", "options": ["30", "300", "3000", "30000"], "answer": 1, "explanation": "3×100=300厘米。"},
])

# 三年级数学
questions.extend([
    # 万以内数的认识
    {"topicId": "ct_SX3S001", "difficulty": "basic", "question": "一千里面有（ ）个一百", "options": ["1", "10", "100", "1000"], "answer": 1, "explanation": "一千里面有10个一百。"},
    {"topicId": "ct_SX3S001", "difficulty": "basic", "question": "最小的四位数是（ ）", "options": ["100", "1000", "9999", "10000"], "answer": 1, "explanation": "最小的四位数是1000。"},
    {"topicId": "ct_SX3S001", "difficulty": "medium", "question": "3456读作（ ）", "options": ["三千四百五十六", "三千四百六十五", "三千五百四十六", "三千零四百五十六"], "answer": 0, "explanation": "3456读作三千四百五十六。"},
    {"topicId": "ct_SX3S001", "difficulty": "hard", "question": "用3、0、5、8组成最大的四位数是（ ）", "options": ["3580", "5830", "8530", "8350"], "answer": 2, "explanation": "把数字从大到小排列：8530。"},
    
    # 两三位数乘一位数
    {"topicId": "ct_SX3S015", "difficulty": "basic", "question": "计算：12 × 3 = ?", "options": ["26", "36", "46", "56"], "answer": 1, "explanation": "12×3=36。"},
    {"topicId": "ct_SX3S015", "difficulty": "medium", "question": "计算：123 × 4 = ?", "options": ["482", "492", "502", "512"], "answer": 1, "explanation": "123×4=492。"},
    {"topicId": "ct_SX3S015", "difficulty": "hard", "question": "每箱苹果23千克，5箱一共多少千克？", "options": ["105", "115", "125", "135"], "answer": 1, "explanation": "23×5=115千克。"},
    
    # 长方形正方形周长
    {"topicId": "ct_SX3S030", "difficulty": "basic", "question": "长方形的长是8厘米，宽是5厘米，周长是多少？", "options": ["13厘米", "26厘米", "40厘米", "45厘米"], "answer": 1, "explanation": "(8+5)×2=26厘米。"},
    {"topicId": "ct_SX3S030", "difficulty": "medium", "question": "正方形的边长是6厘米，周长是多少？", "options": ["12厘米", "18厘米", "24厘米", "36厘米"], "answer": 2, "explanation": "6×4=24厘米。"},
    {"topicId": "ct_SX3S030", "difficulty": "hard", "question": "一个长方形的周长是24厘米，长是8厘米，宽是多少？", "options": ["4厘米", "6厘米", "8厘米", "12厘米"], "answer": 0, "explanation": "24÷2-8=4厘米。"},
    
    # 分数初步认识
    {"topicId": "ct_SX3S025", "difficulty": "basic", "question": "把一个苹果平均分成2份，每份是它的（ ）", "options": ["1/2", "1/3", "2/1", "2/3"], "answer": 0, "explanation": "平均分成2份，每份是1/2。"},
    {"topicId": "ct_SX3S025", "difficulty": "medium", "question": "1/4读作（ ）", "options": ["一四", "四分之一", "四一", "十四分之一"], "answer": 1, "explanation": "1/4读作四分之一。"},
    {"topicId": "ct_SX3S025", "difficulty": "hard", "question": "同样大的圆，1/2和1/4哪个大？", "options": ["1/2大", "1/4大", "一样大", "无法比较"], "answer": 0, "explanation": "分的份数越多，每一份越小，所以1/2大。"},
])

# 四年级数学
questions.extend([
    # 大数的认识
    {"topicId": "ct_SX4S001", "difficulty": "basic", "question": "一万一万地数，10个一万是（ ）", "options": ["十万", "一百万", "一千万", "一亿"], "answer": 0, "explanation": "10个一万是十万。"},
    {"topicId": "ct_SX4S001", "difficulty": "medium", "question": "100000000读作（ ）", "options": ["一千万", "一亿", "十亿", "一百亿"], "answer": 1, "explanation": "100000000读作一亿。"},
    {"topicId": "ct_SX4S001", "difficulty": "hard", "question": "一个九位数，最高位是（ ）位", "options": ["千万", "亿", "十亿", "百亿"], "answer": 1, "explanation": "九位数的最高位是亿位。"},
    
    # 三位数乘两位数
    {"topicId": "ct_SX4S010", "difficulty": "basic", "question": "计算：123 × 45 = ?", "options": ["5535", "5545", "5555", "5565"], "answer": 0, "explanation": "123×45=5535。"},
    {"topicId": "ct_SX4S010", "difficulty": "medium", "question": "每套书145元，买12套需要多少元？", "options": ["1740元", "1750元", "1760元", "1770元"], "answer": 0, "explanation": "145×12=1740元。"},
    
    # 除数是两位数的除法
    {"topicId": "ct_SX4S011", "difficulty": "basic", "question": "计算：480 ÷ 12 = ?", "options": ["30", "40", "50", "60"], "answer": 1, "explanation": "480÷12=40。"},
    {"topicId": "ct_SX4S011", "difficulty": "medium", "question": "计算：864 ÷ 24 = ?", "options": ["34", "36", "38", "40"], "answer": 1, "explanation": "864÷24=36。"},
    {"topicId": "ct_SX4S011", "difficulty": "hard", "question": "一道除法算式，商是15，余数是12，除数最小是（ ）", "options": ["12", "13", "14", "15"], "answer": 1, "explanation": "余数必须小于除数，所以除数最小是13。"},
])

# 五年级数学
questions.extend([
    # 小数乘法
    {"topicId": "ct_SX5S001", "difficulty": "basic", "question": "计算：0.5 × 2 = ?", "options": ["0.5", "1.0", "1.5", "2.0"], "answer": 1, "explanation": "0.5×2=1.0。"},
    {"topicId": "ct_SX5S001", "difficulty": "medium", "question": "计算：1.2 × 3 = ?", "options": ["3.2", "3.6", "4.2", "4.6"], "answer": 1, "explanation": "1.2×3=3.6。"},
    {"topicId": "ct_SX5S001", "difficulty": "hard", "question": "苹果每千克3.5元，买2.4千克需要多少元？", "options": ["8.2元", "8.4元", "8.6元", "8.8元"], "answer": 1, "explanation": "3.5×2.4=8.4元。"},
    
    # 小数除法
    {"topicId": "ct_SX5S002", "difficulty": "basic", "question": "计算：1.2 ÷ 0.3 = ?", "options": ["3", "4", "5", "6"], "answer": 1, "explanation": "1.2÷0.3=4。"},
    {"topicId": "ct_SX5S002", "difficulty": "medium", "question": "计算：4.8 ÷ 0.6 = ?", "options": ["6", "7", "8", "9"], "answer": 2, "explanation": "4.8÷0.6=8。"},
    
    # 简易方程
    {"topicId": "ct_SX5S010", "difficulty": "basic", "question": "x + 5 = 12，x = ?", "options": ["5", "6", "7", "8"], "answer": 2, "explanation": "12-5=7，x=7。"},
    {"topicId": "ct_SX5S010", "difficulty": "medium", "question": "3x = 15，x = ?", "options": ["3", "4", "5", "6"], "answer": 2, "explanation": "15÷3=5，x=5。"},
    {"topicId": "ct_SX5S010", "difficulty": "hard", "question": "小明今年x岁，爸爸是他的3倍，爸爸36岁，x = ?", "options": ["10", "11", "12", "13"], "answer": 2, "explanation": "3x=36，x=12。"},
])

# 六年级数学
questions.extend([
    # 分数乘法
    {"topicId": "ct_SX6S001", "difficulty": "basic", "question": "计算：1/2 × 1/3 = ?", "options": ["1/5", "1/6", "2/5", "2/6"], "answer": 1, "explanation": "分子乘分子，分母乘分母：1/2×1/3=1/6。"},
    {"topicId": "ct_SX6S001", "difficulty": "medium", "question": "计算：2/3 × 3/4 = ?", "options": ["5/7", "6/12", "1/2", "5/12"], "answer": 2, "explanation": "2/3×3/4=6/12=1/2。"},
    
    # 分数除法
    {"topicId": "ct_SX6S002", "difficulty": "basic", "question": "计算：1/2 ÷ 1/4 = ?", "options": ["1/8", "2", "1/2", "4"], "answer": 1, "explanation": "除以一个数等于乘它的倒数：1/2×4=2。"},
    {"topicId": "ct_SX6S002", "difficulty": "medium", "question": "计算：3/4 ÷ 3/5 = ?", "options": ["5/4", "9/20", "4/5", "1/2"], "answer": 0, "explanation": "3/4×5/3=15/12=5/4。"},
    
    # 圆的周长和面积
    {"topicId": "ct_SX6S010", "difficulty": "basic", "question": "圆的周长公式是（ ）", "options": ["C=πd", "C=2πr", "C=πr²", "A和B都对"], "answer": 3, "explanation": "C=πd=2πr。"},
    {"topicId": "ct_SX6S010", "difficulty": "medium", "question": "半径3厘米的圆，周长是多少？（π取3.14）", "options": ["9.42厘米", "18.84厘米", "28.26厘米", "37.68厘米"], "answer": 1, "explanation": "2×3.14×3=18.84厘米。"},
    {"topicId": "ct_SX6S010", "difficulty": "hard", "question": "半径4厘米的圆，面积是多少？（π取3.14）", "options": ["12.56平方厘米", "25.12平方厘米", "50.24平方厘米", "100.48平方厘米"], "answer": 2, "explanation": "3.14×4²=50.24平方厘米。"},
    
    # 百分数
    {"topicId": "ct_SX6S020", "difficulty": "basic", "question": "50% = （ ）", "options": ["0.5", "5", "0.05", "50"], "answer": 0, "explanation": "50%=0.5。"},
    {"topicId": "ct_SX6S020", "difficulty": "medium", "question": "一件衣服原价200元，打8折后多少元？", "options": ["160元", "180元", "190元", "170元"], "answer": 0, "explanation": "200×0.8=160元。"},
])

# ==================== 语文 ====================

# 一年级语文
questions.extend([
    # 拼音
    {"topicId": "ct_YW1S001", "difficulty": "basic", "question": "下面哪个是声母？", "options": ["a", "b", "o", "i"], "answer": 1, "explanation": "b是声母，a、o、i是韵母。"},
    {"topicId": "ct_YW1S001", "difficulty": "basic", "question": "'b'的正确发音是（ ）", "options": ["波", "泼", "摸", "佛"], "answer": 0, "explanation": "b发音为'波'。"},
    {"topicId": "ct_YW1S001", "difficulty": "medium", "question": "下面哪个是整体认读音节？", "options": ["ba", "zhi", "pa", "ma"], "answer": 1, "explanation": "zhi是整体认读音节。"},
    {"topicId": "ct_YW1S001", "difficulty": "hard", "question": "'ü'和n相拼时，两点（ ）", "options": ["保留", "去掉", "变成u", "变成i"], "answer": 0, "explanation": "ü和n相拼时两点保留，如nü。"},
    
    # 识字
    {"topicId": "ct_YW1S005", "difficulty": "basic", "question": "下面哪个字是'日'字？", "options": ["目", "日", "田", "白"], "answer": 1, "explanation": "日字是太阳的意思。"},
    {"topicId": "ct_YW1S005", "difficulty": "basic", "question": "'木'字加一笔可以变成（ ）", "options": ["本", "林", "森", "术"], "answer": 0, "explanation": "木字加一横变成'本'。"},
    {"topicId": "ct_YW1S005", "difficulty": "medium", "question": "'人'字加两笔可以变成（ ）", "options": ["大", "天", "夫", "太"], "answer": 1, "explanation": "人字加两横变成'天'。"},
    
    # 简单阅读
    {"topicId": "ct_YW1S010", "difficulty": "basic", "question": "《小蝌蚪找妈妈》中，小蝌蚪最后找到了谁？", "options": ["鸭子", "鱼", "青蛙", "乌龟"], "answer": 2, "explanation": "小蝌蚪最后找到了青蛙妈妈。"},
    {"topicId": "ct_YW1S010", "difficulty": "medium", "question": "'锄禾日当午'的下一句是（ ）", "options": ["汗滴禾下土", "粒粒皆辛苦", "谁知盘中餐", "春种一粒粟"], "answer": 0, "explanation": "下一句是'汗滴禾下土'。"},
])

# 二年级语文
questions.extend([
    # 查字典
    {"topicId": "ct_YW2S005", "difficulty": "basic", "question": "用音序查字法查'学'字，先查（ ）", "options": ["xue", "X", "学", "x"], "answer": 1, "explanation": "音序查字法先查音序X。"},
    {"topicId": "ct_YW2S005", "difficulty": "medium", "question": "用部首查字法查'河'字，先查（ ）部", "options": ["氵", "可", "口", "亅"], "answer": 0, "explanation": "河字是三点水旁，先查氵部。"},
    {"topicId": "ct_YW2S005", "difficulty": "hard", "question": "'夜'字的部首是（ ）", "options": ["亠", "亻", "夕", "丶"], "answer": 2, "explanation": "夜字是夕字旁。"},
    
    # 句子
    {"topicId": "ct_YW2S008", "difficulty": "basic", "question": "下面哪个句子是完整的？", "options": ["在公园玩", "小明在公园玩", "玩得很开心", "公园里"], "answer": 1, "explanation": "完整句子需要有主语和谓语。"},
    {"topicId": "ct_YW2S008", "difficulty": "medium", "question": "把'小鸟飞上了天空'改成比喻句", "options": ["小鸟像飞机一样飞上了天空", "小鸟飞得很高", "小鸟在天空中飞", "小鸟飞上了蓝蓝的天空"], "answer": 0, "explanation": "比喻句需要把小鸟比作其他事物。"},
    
    # 阅读
    {"topicId": "ct_YW2S010", "difficulty": "basic", "question": "《坐井观天》中，青蛙认为天有多大？", "options": ["无边无际", "井口那么大", "很大很大", "比井大一点"], "answer": 1, "explanation": "青蛙坐在井里，认为天只有井口那么大。"},
    {"topicId": "ct_YW2S010", "difficulty": "medium", "question": "《狐假虎威》中，狐狸借了什么吓跑百兽？", "options": ["老虎的威风", "狮子的威风", "自己的威风", "大象的威风"], "answer": 0, "explanation": "狐狸借了老虎的威风。"},
    {"topicId": "ct_YW2S010", "difficulty": "hard", "question": "《亡羊补牢》告诉我们什么道理？", "options": ["做事要专心", "出了问题及时补救", "要团结合作", "要勤奋学习"], "answer": 1, "explanation": "亡羊补牢告诉我们出了问题及时补救还不算晚。"},
])

# 三年级语文
questions.extend([
    # 成语
    {"topicId": "ct_YW3S005", "difficulty": "basic", "question": "'画蛇添足'比喻什么？", "options": ["做事认真", "多此一举", "画得很好", "速度很快"], "answer": 1, "explanation": "画蛇添足比喻多此一举，反而坏事。"},
    {"topicId": "ct_YW3S005", "difficulty": "medium", "question": "'守株待兔'的'株'指什么？", "options": ["树桩", "兔子", "农夫", "田地"], "answer": 0, "explanation": "株指树桩。"},
    {"topicId": "ct_YW3S005", "difficulty": "hard", "question": "下面哪个成语与'勤奋学习'有关？", "options": ["三心二意", "悬梁刺股", "守株待兔", "画蛇添足"], "answer": 1, "explanation": "悬梁刺股形容勤奋学习。"},
    
    # 修辞手法
    {"topicId": "ct_YW3S008", "difficulty": "basic", "question": "'小鸟在树上唱歌'用了什么修辞手法？", "options": ["比喻", "拟人", "排比", "夸张"], "answer": 1, "explanation": "把小鸟当作人来写，是拟人。"},
    {"topicId": "ct_YW3S008", "difficulty": "medium", "question": "'弯弯的月亮像小船'用了什么修辞手法？", "options": ["拟人", "比喻", "排比", "夸张"], "answer": 1, "explanation": "把月亮比作小船，是比喻。"},
    {"topicId": "ct_YW3S008", "difficulty": "hard", "question": "下面哪句是排比句？", "options": ["春天来了，花儿开了，草儿绿了，鸟儿叫了", "花儿像笑脸", "花儿真美", "我喜欢花儿"], "answer": 0, "explanation": "三个以上结构相似的句子构成排比。"},
    
    # 阅读理解
    {"topicId": "ct_YW3S015", "difficulty": "basic", "question": "《秋天的雨》中，秋天的雨是什么颜色的？", "options": ["五彩缤纷的", "黄色的", "红色的", "蓝色的"], "answer": 0, "explanation": "秋天的雨是五彩缤纷的。"},
    {"topicId": "ct_YW3S015", "difficulty": "medium", "question": "《铺满金色巴掌的水泥道》中，'金色巴掌'指什么？", "options": ["树叶", "花朵", "小鸟", "星星"], "answer": 0, "explanation": "金色巴掌指梧桐树叶。"},
    {"topicId": "ct_YW3S015", "difficulty": "hard", "question": "《卖火柴的小女孩》中，小女孩擦了几根火柴？", "options": ["3根", "4根", "5根", "6根"], "answer": 2, "explanation": "小女孩擦了5根火柴。"},
])

# 四年级语文
questions.extend([
    # 古诗
    {"topicId": "ct_YW4S005", "difficulty": "basic", "question": "'床前明月光'的下一句是（ ）", "options": ["疑是地上霜", "举头望明月", "低头思故乡", "明月松间照"], "answer": 0, "explanation": "下一句是'疑是地上霜'。"},
    {"topicId": "ct_YW4S005", "difficulty": "medium", "question": "'春眠不觉晓'的作者是（ ）", "options": ["李白", "杜甫", "孟浩然", "王维"], "answer": 2, "explanation": "作者是孟浩然。"},
    {"topicId": "ct_YW4S005", "difficulty": "hard", "question": "'停车坐爱枫林晚'的下一句是（ ）", "options": ["霜叶红于二月花", "白云生处有人家", "远上寒山石径斜", "不及汪伦送我情"], "answer": 0, "explanation": "下一句是'霜叶红于二月花'。"},
    
    # 作文
    {"topicId": "ct_YW4S010", "difficulty": "basic", "question": "写记叙文的三要素是（ ）", "options": ["时间、地点、人物", "开头、中间、结尾", "原因、经过、结果", "总起、分述、总结"], "answer": 0, "explanation": "记叙文三要素是时间、地点、人物。"},
    {"topicId": "ct_YW4S010", "difficulty": "medium", "question": "作文中间部分应该写什么？", "options": ["时间地点", "事情的经过", "心情感受", "收获体会"], "answer": 1, "explanation": "中间部分写事情的经过。"},
    {"topicId": "ct_YW4S010", "difficulty": "hard", "question": "写'我的妈妈'，下列哪个开头最吸引人？", "options": ["我的妈妈很漂亮", "我的妈妈有一双会说话的眼睛，每次我犯错，她不用开口，我就知道错了", "我的妈妈今年35岁", "我的妈妈很爱我"], "answer": 1, "explanation": "具体的细节描写比概括性陈述更吸引人。"},
])

# 五年级语文
questions.extend([
    # 说明文
    {"topicId": "ct_YW5S005", "difficulty": "basic", "question": "'鲸是哺乳动物'用了什么说明方法？", "options": ["举例子", "下定义", "打比方", "列数字"], "answer": 1, "explanation": "下定义是说明事物的本质特征。"},
    {"topicId": "ct_YW5S005", "difficulty": "medium", "question": "'赵州桥非常长，大约50多米'用了什么说明方法？", "options": ["作比较", "列数字", "打比方", "举例子"], "answer": 1, "explanation": "用数字说明，是列数字。"},
    {"topicId": "ct_YW5S005", "difficulty": "hard", "question": "'松鼠的叫声很响亮，比黄鼠狼的叫声还要尖些'用了什么说明方法？", "options": ["举例子", "列数字", "作比较", "打比方"], "answer": 2, "explanation": "把松鼠和黄鼠狼比较，是作比较。"},
])

# 六年级语文
questions.extend([
    # 综合阅读
    {"topicId": "ct_YW6S005", "difficulty": "basic", "question": "《少年闰土》的作者是（ ）", "options": ["鲁迅", "老舍", "巴金", "茅盾"], "answer": 0, "explanation": "作者是鲁迅。"},
    {"topicId": "ct_YW6S005", "difficulty": "medium", "question": "《匆匆》中，作者感叹什么匆匆？", "options": ["时间", "青春", "生命", "流水"], "answer": 0, "explanation": "朱自清感叹时间匆匆。"},
    {"topicId": "ct_YW6S005", "difficulty": "hard", "question": "《为人民服务》是（ ）写的", "options": ["毛泽东", "周恩来", "邓小平", "江泽民"], "answer": 0, "explanation": "《为人民服务》是毛泽东写的。"},
])

# ==================== 英语 ====================

# 三年级英语
questions.extend([
    # 字母
    {"topicId": "ct_YY3S001", "difficulty": "basic", "question": "选出字母表中第5个字母", "options": ["D", "E", "F", "G"], "answer": 1, "explanation": "第5个字母是E。"},
    {"topicId": "ct_YY3S001", "difficulty": "medium", "question": "选出元音字母", "options": ["B", "C", "A", "D"], "answer": 2, "explanation": "A是元音字母。"},
    
    # 单词
    {"topicId": "ct_YY3S002", "difficulty": "basic", "question": "选出'school'的中文意思", "options": ["家", "学校", "公园", "商店"], "answer": 1, "explanation": "school是学校。"},
    {"topicId": "ct_YY3S002", "difficulty": "basic", "question": "选出'teacher'的中文意思", "options": ["学生", "老师", "医生", "工人"], "answer": 1, "explanation": "teacher是老师。"},
    {"topicId": "ct_YY3S002", "difficulty": "medium", "question": "选出'friend'的中文意思", "options": ["家人", "朋友", "同学", "邻居"], "answer": 1, "explanation": "friend是朋友。"},
    
    # 句型
    {"topicId": "ct_YY3S005", "difficulty": "basic", "question": "选出'How are you?'的正确回答", "options": ["I'm fine, thank you.", "My name is Tom.", "I am 9 years old.", "Goodbye!"], "answer": 0, "explanation": "How are you? 的正确回答是 I'm fine, thank you."},
    {"topicId": "ct_YY3S005", "difficulty": "medium", "question": "选出'What's your name?'的正确回答", "options": ["I'm fine.", "My name is Lily.", "I am happy.", "Goodbye."], "answer": 1, "explanation": "What's your name? 的正确回答是 My name is..."},
    {"topicId": "ct_YY3S005", "difficulty": "hard", "question": "选出'How old are you?'的正确回答", "options": ["I'm fine.", "I'm 9 years old.", "My name is Tom.", "Good morning."], "answer": 1, "explanation": "How old are you? 询问年龄，回答用 I'm ... years old."},
])

# 四年级英语
questions.extend([
    # 语法
    {"topicId": "ct_YY4S001", "difficulty": "basic", "question": "选出正确的be动词：I ___ a student.", "options": ["am", "is", "are", "be"], "answer": 0, "explanation": "I后面用am。"},
    {"topicId": "ct_YY4S001", "difficulty": "basic", "question": "选出正确的be动词：She ___ a teacher.", "options": ["am", "is", "are", "be"], "answer": 1, "explanation": "第三人称单数用is。"},
    {"topicId": "ct_YY4S001", "difficulty": "medium", "question": "选出正确的be动词：They ___ playing football.", "options": ["am", "is", "are", "be"], "answer": 2, "explanation": "复数用are。"},
    
    # 名词复数
    {"topicId": "ct_YY4S005", "difficulty": "basic", "question": "选出'book'的复数形式", "options": ["book", "books", "bookes", "bookies"], "answer": 1, "explanation": "book的复数是books。"},
    {"topicId": "ct_YY4S005", "difficulty": "medium", "question": "选出'box'的复数形式", "options": ["boxs", "boxes", "boxies", "box"], "answer": 1, "explanation": "以x结尾加es。"},
    {"topicId": "ct_YY4S005", "difficulty": "hard", "question": "选出'child'的复数形式", "options": ["childs", "childes", "children", "childrens"], "answer": 2, "explanation": "child的复数是children。"},
    
    # 阅读
    {"topicId": "ct_YY4S010", "difficulty": "basic", "question": "选出'Good morning'的中文意思", "options": ["晚上好", "早上好", "下午好", "再见"], "answer": 1, "explanation": "Good morning是早上好。"},
    {"topicId": "ct_YY4S010", "difficulty": "medium", "question": "选出'Nice to meet you'的中文意思", "options": ["很高兴认识你", "很高兴见到你", "再见", "谢谢"], "answer": 0, "explanation": "Nice to meet you是很高兴认识你。"},
])

# 五年级英语
questions.extend([
    # 时态
    {"topicId": "ct_YY5S001", "difficulty": "basic", "question": "选出正确的现在进行时：Look! The birds ___ in the sky.", "options": ["fly", "flies", "are flying", "flew"], "answer": 2, "explanation": "Look提示现在进行时，用are flying。"},
    {"topicId": "ct_YY5S001", "difficulty": "medium", "question": "选出正确的过去式：Yesterday, I ___ to the park.", "options": ["go", "goes", "went", "going"], "answer": 2, "explanation": "Yesterday提示过去式，go的过去式是went。"},
    {"topicId": "ct_YY5S001", "difficulty": "hard", "question": "选出正确的将来时：Tomorrow, I ___ visit my grandma.", "options": ["visit", "visits", "will visit", "visited"], "answer": 2, "explanation": "Tomorrow提示将来时，用will visit。"},
    
    # 介词
    {"topicId": "ct_YY5S005", "difficulty": "basic", "question": "选出正确的介词：The cat is ___ the table.", "options": ["in", "on", "at", "to"], "answer": 1, "explanation": "在桌子上用on。"},
    {"topicId": "ct_YY5S005", "difficulty": "medium", "question": "选出正确的介词：I go to school ___ bus.", "options": ["in", "on", "by", "at"], "answer": 2, "explanation": "by bus表示乘公交车。"},
])

# 六年级英语
questions.extend([
    # 比较级
    {"topicId": "ct_YY6S001", "difficulty": "basic", "question": "选出'big'的比较级", "options": ["big", "bigger", "biggest", "more big"], "answer": 1, "explanation": "单音节词加er。"},
    {"topicId": "ct_YY6S001", "difficulty": "medium", "question": "选出'beautiful'的比较级", "options": ["beautifuler", "more beautiful", "most beautiful", "beautifully"], "answer": 1, "explanation": "多音节词加more。"},
    {"topicId": "ct_YY6S001", "difficulty": "hard", "question": "选出'Tom is taller than me.'的中文意思", "options": ["Tom和我一样高", "Tom比我高", "Tom比我矮", "Tom没有我高"], "answer": 1, "explanation": "taller than表示比...高。"},
])

# ==================== 科学 ====================

# 三年级科学
questions.extend([
    # 水的三态
    {"topicId": "ct_KX3S005", "difficulty": "basic", "question": "水在什么温度下会结冰？", "options": ["0℃以下", "10℃", "50℃", "100℃"], "answer": 0, "explanation": "在标准大气压下，水在0℃以下会结冰。"},
    {"topicId": "ct_KX3S005", "difficulty": "medium", "question": "水变成水蒸气的过程叫什么？", "options": ["凝固", "蒸发", "凝结", "融化"], "answer": 1, "explanation": "水变成水蒸气是蒸发（汽化）过程。"},
    {"topicId": "ct_KX3S005", "difficulty": "hard", "question": "冬天，窗户上出现的水珠是什么现象？", "options": ["蒸发", "凝结", "融化", "凝固"], "answer": 1, "explanation": "室内温暖的水蒸气遇到冷的玻璃，凝结成小水珠。"},
    
    # 植物
    {"topicId": "ct_KX3S010", "difficulty": "basic", "question": "植物进行光合作用需要（ ）", "options": ["阳光、水、二氧化碳", "土壤、空气、肥料", "阳光、土壤、空气", "水、空气、肥料"], "answer": 0, "explanation": "光合作用需要阳光、水和二氧化碳。"},
    {"topicId": "ct_KX3S010", "difficulty": "medium", "question": "植物的根有什么作用？", "options": ["制造养分", "吸收水分和养分", "进行光合作用", "繁殖"], "answer": 1, "explanation": "根的作用是吸收水分和养分。"},
    
    # 动物
    {"topicId": "ct_KX3S015", "difficulty": "basic", "question": "下面哪种动物是哺乳动物？", "options": ["鸡", "鱼", "猫", "青蛙"], "answer": 2, "explanation": "猫是哺乳动物。"},
    {"topicId": "ct_KX3S015", "difficulty": "medium", "question": "下面哪种动物是昆虫？", "options": ["蜘蛛", "蝴蝶", "蚯蚓", "蜗牛"], "answer": 1, "explanation": "蝴蝶是昆虫，身体分头胸腹三部分，有三对足。"},
])

# 四年级科学
questions.extend([
    # 声音
    {"topicId": "ct_KX4S005", "difficulty": "basic", "question": "声音是由什么产生的？", "options": ["空气", "振动", "水", "光"], "answer": 1, "explanation": "声音是由物体振动产生的。"},
    {"topicId": "ct_KX4S005", "difficulty": "medium", "question": "下面哪种情况不能传播声音？", "options": ["空气", "水", "真空", "钢铁"], "answer": 2, "explanation": "真空不能传播声音。"},
    
    # 电
    {"topicId": "ct_KX4S010", "difficulty": "basic", "question": "下面哪种物体是导体？", "options": ["塑料", "橡胶", "铜线", "木头"], "answer": 2, "explanation": "铜线是导体，容易导电。"},
    {"topicId": "ct_KX4S010", "difficulty": "medium", "question": "一个简单电路至少需要什么？", "options": ["电池、灯泡", "电池、导线、灯泡", "导线、开关", "电池、开关"], "answer": 1, "explanation": "简单电路需要电源（电池）、导线和用电器（灯泡）。"},
])

# 五年级科学
questions.extend([
    # 生物
    {"topicId": "ct_KX5S005", "difficulty": "basic", "question": "细胞是生物体什么的基本单位？", "options": ["结构和功能", "生长和繁殖", "遗传和变异", "代谢"], "answer": 0, "explanation": "细胞是生物体结构和功能的基本单位。"},
    {"topicId": "ct_KX5S005", "difficulty": "medium", "question": "植物细胞与动物细胞最大的区别是植物细胞有（ ）", "options": ["细胞膜", "细胞质", "细胞壁", "细胞核"], "answer": 2, "explanation": "植物细胞有细胞壁，动物细胞没有。"},
])

# 六年级科学
questions.extend([
    # 宇宙
    {"topicId": "ct_KX6S005", "difficulty": "basic", "question": "地球绕着什么转？", "options": ["月亮", "太阳", "火星", "北极星"], "answer": 1, "explanation": "地球绕着太阳转。"},
    {"topicId": "ct_KX6S005", "difficulty": "medium", "question": "太阳系中最大的行星是（ ）", "options": ["地球", "木星", "土星", "火星"], "answer": 1, "explanation": "木星是太阳系中最大的行星。"},
    {"topicId": "ct_KX6S005", "difficulty": "hard", "question": "月亮本身发光吗？", "options": ["发光", "不发光", "有时发光", "白天发光"], "answer": 1, "explanation": "月亮本身不发光，它反射太阳光。"},
    
    # 生态
    {"topicId": "ct_KX6S010", "difficulty": "basic", "question": "食物链从什么开始？", "options": ["动物", "植物", "微生物", "阳光"], "answer": 1, "explanation": "食物链从生产者（植物）开始。"},
    {"topicId": "ct_KX6S010", "difficulty": "medium", "question": "下面哪条食物链是正确的？", "options": ["草→兔→狼", "狼→兔→草", "兔→草→狼", "草→狼→兔"], "answer": 0, "explanation": "食物链从植物开始，到食草动物，再到食肉动物。"},
])

# 生成最终题库
output = {
    "version": "v1.1-diagnostic",
    "description": "知识点诊断题库：覆盖数学、语文、英语、科学核心知识点，每个知识点3-5道题",
    "generatedAt": "2026-08-27T00:00:00Z",
    "totalQuestions": len(questions),
    "questions": []
}

# 为每个知识点生成题目，添加id
topic_counter = {}
for q in questions:
    tid = q["topicId"]
    if tid not in topic_counter:
        topic_counter[tid] = 0
    topic_counter[tid] += 1
    
    # 从topicId提取学科和编号
    # ct_SX2S011 -> SX2S011
    topic_suffix = tid.replace("ct_", "")
    
    q["id"] = f"dq_{topic_suffix}_{topic_counter[tid]:02d}"
    output["questions"].append(q)

# 统计
print(f"生成诊断题总数: {len(questions)}")
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
for q in questions:
    diff_stats[q["difficulty"]] += 1

print("\n按难度统计:")
for d, count in diff_stats.items():
    print(f"  {d}: {count}道")

# 保存
with open(os.path.join(data_dir, 'diagnostic-questions.json'), 'w', encoding='utf-8') as fp:
    json.dump(output, fp, ensure_ascii=False, indent=2)

print(f"\n题库已保存到: {os.path.join(data_dir, 'diagnostic-questions.json')}")
