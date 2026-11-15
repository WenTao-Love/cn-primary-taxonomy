#!/usr/bin/env python3
"""
诊断题库 v5：继续扩充核心知识点
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

# 一年级数学 - 20以内进位加法、退位减法
new_questions.extend([
    {"topicId": "ct_SX1S012", "difficulty": "basic", "question": "计算：8 + 5 = ?", "options": ["11", "12", "13", "14"], "answer": 2, "explanation": "8+5=13。"},
    {"topicId": "ct_SX1S012", "difficulty": "medium", "question": "计算：9 + 7 = ?", "options": ["15", "16", "17", "18"], "answer": 1, "explanation": "9+7=16。"},
    {"topicId": "ct_SX1S012", "difficulty": "hard", "question": "小明有8个苹果，妈妈又给了5个，现在有多少个？", "options": ["11", "12", "13", "14"], "answer": 2, "explanation": "8+5=13个。"},
    {"topicId": "ct_SX1S013", "difficulty": "basic", "question": "计算：13 - 5 = ?", "options": ["6", "7", "8", "9"], "answer": 2, "explanation": "13-5=8。"},
    {"topicId": "ct_SX1S013", "difficulty": "medium", "question": "计算：16 - 9 = ?", "options": ["5", "6", "7", "8"], "answer": 2, "explanation": "16-9=7。"},
    {"topicId": "ct_SX1S013", "difficulty": "hard", "question": "小明有16块糖，吃了9块，还剩几块？", "options": ["5", "6", "7", "8"], "answer": 2, "explanation": "16-9=7块。"},
    {"topicId": "ct_SX1S014", "difficulty": "basic", "question": "计算：7 + 8 - 3 = ?", "options": ["10", "11", "12", "13"], "answer": 2, "explanation": "7+8-3=12。"},
    {"topicId": "ct_SX1S015", "difficulty": "medium", "question": "小明有15个球，先拿走6个，又拿走4个，还剩几个？", "options": ["3", "4", "5", "6"], "answer": 2, "explanation": "15-6-4=5个。"},
])

# 一年级数学 - 100以内加减法
new_questions.extend([
    {"topicId": "ct_SX1X020", "difficulty": "basic", "question": "计算：35 + 20 = ?", "options": ["45", "55", "65", "75"], "answer": 1, "explanation": "35+20=55。"},
    {"topicId": "ct_SX1X020", "difficulty": "medium", "question": "计算：48 + 26 = ?", "options": ["64", "74", "84", "94"], "answer": 1, "explanation": "48+26=74。"},
    {"topicId": "ct_SX1X021", "difficulty": "basic", "question": "计算：56 - 30 = ?", "options": ["16", "26", "36", "46"], "answer": 1, "explanation": "56-30=26。"},
    {"topicId": "ct_SX1X021", "difficulty": "medium", "question": "计算：72 - 28 = ?", "options": ["34", "44", "54", "64"], "answer": 1, "explanation": "72-28=44。"},
    {"topicId": "ct_SX1X022", "difficulty": "basic", "question": "计算：45 + 23 + 12 = ?", "options": ["70", "80", "90", "100"], "answer": 1, "explanation": "45+23+12=80。"},
    {"topicId": "ct_SX1X023", "difficulty": "medium", "question": "小明有50元，买书花了28元，还剩多少元？", "options": ["12", "22", "32", "42"], "answer": 1, "explanation": "50-28=22元。"},
    {"topicId": "ct_SX1X024", "difficulty": "medium", "question": "小红有45颗糖，给了小明18颗，还剩多少颗？", "options": ["17", "27", "37", "47"], "answer": 1, "explanation": "45-18=27颗。"},
])

# 二年级数学 - 万以内数的认识
new_questions.extend([
    {"topicId": "ct_SX2S025", "difficulty": "basic", "question": "一千里面有（ ）个一百", "options": ["1", "10", "100", "1000"], "answer": 1, "explanation": "一千里面有10个一百。"},
    {"topicId": "ct_SX2S025", "difficulty": "medium", "question": "一万里面有（ ）个一千", "options": ["1", "10", "100", "1000"], "answer": 1, "explanation": "一万里面有10个一千。"},
    {"topicId": "ct_SX2S026", "difficulty": "basic", "question": "最小的四位数是（ ）", "options": ["100", "1000", "9999", "10000"], "answer": 1, "explanation": "最小的四位数是1000。"},
    {"topicId": "ct_SX2S026", "difficulty": "medium", "question": "3456读作（ ）", "options": ["三千四百五十六", "三千四百六十五", "三千五百四十六", "三千零四百五十六"], "answer": 0, "explanation": "3456读作三千四百五十六。"},
    {"topicId": "ct_SX2S027", "difficulty": "basic", "question": "用3、0、5、8组成最大的四位数是（ ）", "options": ["3580", "5830", "8530", "8350"], "answer": 2, "explanation": "把数字从大到小排列：8530。"},
])

# 二年级数学 - 万以内加减法
new_questions.extend([
    {"topicId": "ct_SX2S028", "difficulty": "basic", "question": "计算：2345 + 1678 = ?", "options": ["3923", "4023", "4123", "4223"], "answer": 1, "explanation": "2345+1678=4023。"},
    {"topicId": "ct_SX2S028", "difficulty": "medium", "question": "计算：5000 - 1876 = ?", "options": ["3024", "3124", "3224", "3324"], "answer": 1, "explanation": "5000-1876=3124。"},
    {"topicId": "ct_SX2S029", "difficulty": "basic", "question": "计算：3456 + 1234 = ?", "options": ["4590", "4690", "4790", "4890"], "answer": 1, "explanation": "3456+1234=4690。"},
    {"topicId": "ct_SX2S030", "difficulty": "medium", "question": "小明有500元，买书包花了268元，还剩多少元？", "options": ["132", "232", "332", "432"], "answer": 1, "explanation": "500-268=232元。"},
    {"topicId": "ct_SX2S031", "difficulty": "hard", "question": "小华有1000元，先花了456元，又花了278元，还剩多少元？", "options": ["266", "366", "466", "566"], "answer": 0, "explanation": "1000-456-278=266元。"},
])

# 三年级数学 - 两位数乘两位数、除法
new_questions.extend([
    {"topicId": "ct_SX3S019", "difficulty": "basic", "question": "计算：12 × 11 = ?", "options": ["121", "132", "143", "154"], "answer": 1, "explanation": "12×11=132。"},
    {"topicId": "ct_SX3S019", "difficulty": "medium", "question": "计算：23 × 14 = ?", "options": ["312", "322", "332", "342"], "answer": 1, "explanation": "23×14=322。"},
    {"topicId": "ct_SX3S020", "difficulty": "medium", "question": "每箱有24瓶水，买了15箱，一共多少瓶？", "options": ["340", "360", "380", "400"], "answer": 1, "explanation": "24×15=360瓶。"},
    {"topicId": "ct_SX3S021", "difficulty": "basic", "question": "计算：432 ÷ 6 = ?", "options": ["70", "72", "74", "76"], "answer": 1, "explanation": "432÷6=72。"},
    {"topicId": "ct_SX3S021", "difficulty": "medium", "question": "计算：567 ÷ 9 = ?", "options": ["61", "62", "63", "64"], "answer": 2, "explanation": "567÷9=63。"},
    {"topicId": "ct_SX3S022", "difficulty": "medium", "question": "有856个苹果，平均分给4个班，每班多少个？", "options": ["212", "214", "216", "218"], "answer": 1, "explanation": "856÷4=214个。"},
])

# 三年级数学 - 小数的初步认识、小数加减法
new_questions.extend([
    {"topicId": "ct_SX3S035", "difficulty": "basic", "question": "0.5读作（ ）", "options": ["五", "零点五", "五点", "五十"], "answer": 1, "explanation": "0.5读作零点五。"},
    {"topicId": "ct_SX3S035", "difficulty": "medium", "question": "1.25元 = （ ）元（ ）角（ ）分", "options": ["1元2角5分", "1元2角50分", "12元5角", "1元25角"], "answer": 0, "explanation": "1.25元=1元2角5分。"},
    {"topicId": "ct_SX3S036", "difficulty": "basic", "question": "计算：0.5 + 0.3 = ?", "options": ["0.2", "0.8", "1.0", "1.2"], "answer": 1, "explanation": "0.5+0.3=0.8。"},
    {"topicId": "ct_SX3S036", "difficulty": "medium", "question": "计算：1.2 - 0.7 = ?", "options": ["0.3", "0.4", "0.5", "0.6"], "answer": 2, "explanation": "1.2-0.7=0.5。"},
])

# 四年级数学 - 小数的意义和性质、小数的加减法
new_questions.extend([
    {"topicId": "ct_SX4S015", "difficulty": "basic", "question": "0.5表示（ ）", "options": ["5个十分之一", "5个百分之一", "5个千分之一", "5个一"], "answer": 0, "explanation": "0.5表示5个十分之一。"},
    {"topicId": "ct_SX4S015", "difficulty": "medium", "question": "0.25里面有（ ）个0.01", "options": ["2", "5", "25", "250"], "answer": 2, "explanation": "0.25里面有25个0.01。"},
    {"topicId": "ct_SX4S016", "difficulty": "basic", "question": "计算：3.5 + 2.7 = ?", "options": ["5.2", "6.2", "7.2", "8.2"], "answer": 1, "explanation": "3.5+2.7=6.2。"},
    {"topicId": "ct_SX4S016", "difficulty": "medium", "question": "计算：8.6 - 3.9 = ?", "options": ["4.5", "4.7", "5.3", "5.7"], "answer": 1, "explanation": "8.6-3.9=4.7。"},
    {"topicId": "ct_SX4S017", "difficulty": "basic", "question": "计算：0.5 × 2 = ?", "options": ["0.5", "1.0", "1.5", "2.0"], "answer": 1, "explanation": "0.5×2=1.0。"},
    {"topicId": "ct_SX4S017", "difficulty": "medium", "question": "计算：1.2 × 3 = ?", "options": ["3.2", "3.6", "4.2", "4.6"], "answer": 1, "explanation": "1.2×3=3.6。"},
    {"topicId": "ct_SX4S018", "difficulty": "basic", "question": "计算：1.2 ÷ 0.3 = ?", "options": ["3", "4", "5", "6"], "answer": 1, "explanation": "1.2÷0.3=4。"},
    {"topicId": "ct_SX4S018", "difficulty": "medium", "question": "计算：4.8 ÷ 0.6 = ?", "options": ["6", "7", "8", "9"], "answer": 2, "explanation": "4.8÷0.6=8。"},
])

# 四年级数学 - 简易方程、解方程
new_questions.extend([
    {"topicId": "ct_SX4S019", "difficulty": "basic", "question": "x + 5 = 12，x = ?", "options": ["5", "6", "7", "8"], "answer": 2, "explanation": "12-5=7，x=7。"},
    {"topicId": "ct_SX4S019", "difficulty": "medium", "question": "3x = 15，x = ?", "options": ["3", "4", "5", "6"], "answer": 2, "explanation": "15÷3=5，x=5。"},
    {"topicId": "ct_SX4S020", "difficulty": "medium", "question": "小明今年x岁，爸爸是他的3倍，爸爸36岁，x = ?", "options": ["10", "11", "12", "13"], "answer": 2, "explanation": "3x=36，x=12。"},
])

# 五年级数学 - 分数的意义和性质、分数加减法
new_questions.extend([
    {"topicId": "ct_SX5S021", "difficulty": "basic", "question": "1/2表示（ ）", "options": ["把整体平均分成2份，取1份", "把整体分成2份，取1份", "2个1", "1个2"], "answer": 0, "explanation": "1/2表示把整体平均分成2份，取1份。"},
    {"topicId": "ct_SX5S021", "difficulty": "medium", "question": "下面哪个分数最大？", "options": ["1/2", "1/3", "1/4", "1/5"], "answer": 0, "explanation": "分子相同，分母越小分数越大。"},
    {"topicId": "ct_SX5S022", "difficulty": "basic", "question": "计算：1/4 + 2/4 = ?", "options": ["3/8", "3/4", "1/2", "2/4"], "answer": 1, "explanation": "同分母分数相加：1/4+2/4=3/4。"},
    {"topicId": "ct_SX5S022", "difficulty": "medium", "question": "计算：2/3 - 1/6 = ?", "options": ["1/3", "1/2", "1/6", "2/3"], "answer": 1, "explanation": "2/3-1/6=4/6-1/6=3/6=1/2。"},
    {"topicId": "ct_SX5S023", "difficulty": "basic", "question": "计算：1/2 × 1/3 = ?", "options": ["1/5", "1/6", "2/5", "2/6"], "answer": 1, "explanation": "分子乘分子，分母乘分母：1/2×1/3=1/6。"},
    {"topicId": "ct_SX5S023", "difficulty": "medium", "question": "计算：2/3 × 3/4 = ?", "options": ["5/7", "6/12", "1/2", "5/12"], "answer": 2, "explanation": "2/3×3/4=6/12=1/2。"},
    {"topicId": "ct_SX5S024", "difficulty": "basic", "question": "计算：1/2 ÷ 1/4 = ?", "options": ["1/8", "2", "1/2", "4"], "answer": 1, "explanation": "除以一个数等于乘它的倒数：1/2×4=2。"},
    {"topicId": "ct_SX5S024", "difficulty": "medium", "question": "计算：3/4 ÷ 3/5 = ?", "options": ["5/4", "9/20", "4/5", "1/2"], "answer": 0, "explanation": "3/4×5/3=15/12=5/4。"},
])

# 六年级数学 - 数学广角、鸽巢问题、思考问题
new_questions.extend([
    {"topicId": "ct_SX6S027", "difficulty": "basic", "question": "鸽巢问题的基本原理是（ ）", "options": ["如果有n+1个物体放进n个抽屉，至少有一个抽屉有2个物体", "每个抽屉只能放一个物体", "物体可以随便放", "没有规律"], "answer": 0, "explanation": "鸽巢原理：n+1个物体放进n个抽屉，至少有一个抽屉有2个。"},
    {"topicId": "ct_SX6S027", "difficulty": "medium", "question": "把10个苹果放进3个抽屉，至少有一个抽屉有（ ）个苹果", "options": ["3", "4", "5", "6"], "answer": 1, "explanation": "10÷3=3余1，至少有一个抽屉有4个。"},
    {"topicId": "ct_SX6S028", "difficulty": "medium", "question": "把7本书放进2个抽屉，至少有一个抽屉有（ ）本书", "options": ["2", "3", "4", "5"], "answer": 2, "explanation": "7÷2=3余1，至少有一个抽屉有4本。"},
    {"topicId": "ct_SX6S029", "difficulty": "basic", "question": "数与形的关系是（ ）", "options": ["数可以表示形，形可以表示数", "数和形没有关系", "数就是形", "形就是数"], "answer": 0, "explanation": "数与形相互表示。"},
    {"topicId": "ct_SX6S030", "difficulty": "basic", "question": "思考问题的方法不包括（ ）", "options": ["画图", "列表", "猜想", "放弃"], "answer": 3, "explanation": "思考问题不能放弃。"},
])

# ==================== 语文扩充 ====================

# 一年级语文 - 词语、句子、阅读
new_questions.extend([
    {"topicId": "ct_YW1S038", "difficulty": "basic", "question": "下面哪个是词语？", "options": ["人", "人们", "很", "跑"], "answer": 1, "explanation": "人们是词语。"},
    {"topicId": "ct_YW1S038", "difficulty": "medium", "question": "'小鸟'的'鸟'字共有几画？", "options": ["3画", "4画", "5画", "6画"], "answer": 2, "explanation": "鸟字共5画。"},
    {"topicId": "ct_YW1S039", "difficulty": "basic", "question": "下面哪个句子最完整？", "options": ["小明跑步", "小明在公园跑步", "跑步", "在公园"], "answer": 1, "explanation": "完整的句子需要主语、地点、动作。"},
    {"topicId": "ct_YW1S040", "difficulty": "basic", "question": "阅读理解时，首先要（ ）", "options": ["读题目", "看文章", "查字典", "做笔记"], "answer": 1, "explanation": "阅读理解要先看文章。"},
    {"topicId": "ct_YW1S041", "difficulty": "basic", "question": "下面哪个字是'日'字？", "options": ["目", "日", "田", "白"], "answer": 1, "explanation": "日字像太阳。"},
    {"topicId": "ct_YW1S042", "difficulty": "basic", "question": "'木'字加一笔可以变成（ ）", "options": ["本", "林", "森", "术"], "answer": 0, "explanation": "木字加一横变成本。"},
])

# 二年级语文 - 阅读、作文、古诗
new_questions.extend([
    {"topicId": "ct_YW2S013", "difficulty": "basic", "question": "《坐井观天》中，青蛙认为天有多大？", "options": ["无边无际", "井口那么大", "很大很大", "比井大一点"], "answer": 1, "explanation": "青蛙坐在井里，认为天只有井口那么大。"},
    {"topicId": "ct_YW2S013", "difficulty": "medium", "question": "《狐假虎威》中，狐狸借了什么吓跑百兽？", "options": ["老虎的威风", "狮子的威风", "自己的威风", "大象的威风"], "answer": 0, "explanation": "狐狸借了老虎的威风。"},
    {"topicId": "ct_YW2S014", "difficulty": "basic", "question": "写日记的格式不包括（ ）", "options": ["日期", "天气", "正文", "标题"], "answer": 3, "explanation": "日记不需要标题。"},
    {"topicId": "ct_YW2S014", "difficulty": "medium", "question": "日记正文应该写（ ）", "options": ["当天发生的事", "明天的计划", "过去的事", "未来的梦想"], "answer": 0, "explanation": "日记写当天发生的事。"},
    {"topicId": "ct_YW2S015", "difficulty": "basic", "question": "'亡羊补牢'告诉我们什么道理？", "options": ["做事要专心", "出了问题及时补救", "要团结合作", "要勤奋学习"], "answer": 1, "explanation": "亡羊补牢告诉我们出了问题及时补救还不算晚。"},
    {"topicId": "ct_YW2S016", "difficulty": "basic", "question": "'咏鹅'的作者是（ ）", "options": ["骆宾王", "李白", "杜甫", "白居易"], "answer": 0, "explanation": "咏鹅作者是骆宾王。"},
    {"topicId": "ct_YW2S016", "difficulty": "medium", "question": "'白毛浮绿水'的下一句是（ ）", "options": ["红掌拨清波", "曲项向天歌", "鹅鹅鹅", "浮绿水"], "answer": 0, "explanation": "下一句是红掌拨清波。"},
    {"topicId": "ct_YW2S017", "difficulty": "basic", "question": "日积月累的作用是（ ）", "options": ["积累好词好句", "完成作业", "应付考试", "打发时间"], "answer": 0, "explanation": "日积月累帮助积累好词好句。"},
])

# 三年级语文 - 阅读、作文、口语交际
new_questions.extend([
    {"topicId": "ct_YW3S024", "difficulty": "basic", "question": "《秋天的雨》中，秋天的雨是什么颜色的？", "options": ["五彩缤纷的", "黄色的", "红色的", "蓝色的"], "answer": 0, "explanation": "秋天的雨是五彩缤纷的。"},
    {"topicId": "ct_YW3S024", "difficulty": "medium", "question": "《铺满金色巴掌的水泥道》中，'金色巴掌'指什么？", "options": ["树叶", "花朵", "小鸟", "星星"], "answer": 0, "explanation": "金色巴掌指梧桐树叶。"},
    {"topicId": "ct_YW3S025", "difficulty": "basic", "question": "写记叙文的三要素是（ ）", "options": ["时间、地点、人物", "开头、中间、结尾", "原因、经过、结果", "总起、分述、总结"], "answer": 0, "explanation": "记叙文三要素是时间、地点、人物。"},
    {"topicId": "ct_YW3S025", "difficulty": "medium", "question": "作文中间部分应该写什么？", "options": ["时间地点", "事情的经过", "心情感受", "收获体会"], "answer": 1, "explanation": "中间部分写事情的经过。"},
    {"topicId": "ct_YW3S026", "difficulty": "basic", "question": "《卖火柴的小女孩》中，小女孩擦了几根火柴？", "options": ["3根", "4根", "5根", "6根"], "answer": 2, "explanation": "小女孩擦了5根火柴。"},
    {"topicId": "ct_YW3S027", "difficulty": "basic", "question": "口语交际时，要注意（ ）", "options": ["认真听别人说话", "随意打断别人", "大声喧哗", "不礼貌"], "answer": 0, "explanation": "口语交际要认真听别人说话。"},
    {"topicId": "ct_YW3S028", "difficulty": "basic", "question": "综合性学习的特点是（ ）", "options": ["跨学科、实践性", "只学课本", "只做题", "只背书"], "answer": 0, "explanation": "综合性学习跨学科、实践性强。"},
])

# 四年级语文 - 阅读、作文、口语交际
new_questions.extend([
    {"topicId": "ct_YW4S017", "difficulty": "basic", "question": "《题西林壁》的作者是（ ）", "options": ["苏轼", "李白", "杜甫", "白居易"], "answer": 0, "explanation": "题西林壁作者是苏轼。"},
    {"topicId": "ct_YW4S017", "difficulty": "medium", "question": "'不识庐山真面目'的下一句是（ ）", "options": ["只缘身在此山中", "横看成岭侧成峰", "远近高低各不同", "题西林壁"], "answer": 0, "explanation": "下一句是只缘身在此山中。"},
    {"topicId": "ct_YW4S018", "difficulty": "basic", "question": "阅读理解时，要关注文章的（ ）", "options": ["中心思想", "字数", "标点", "字体"], "answer": 0, "explanation": "阅读理解要关注中心思想。"},
    {"topicId": "ct_YW4S018", "difficulty": "medium", "question": "文章的细节描写作用是（ ）", "options": ["使文章更生动", "使文章更短", "使文章更简单", "使文章更抽象"], "answer": 0, "explanation": "细节描写使文章更生动。"},
    {"topicId": "ct_YW4S019", "difficulty": "basic", "question": "写'我的妈妈'，下列哪个开头最吸引人？", "options": ["我的妈妈很漂亮", "我的妈妈有一双会说话的眼睛", "我的妈妈今年35岁", "我的妈妈很爱我"], "answer": 1, "explanation": "具体的细节描写更吸引人。"},
    {"topicId": "ct_YW4S020", "difficulty": "basic", "question": "口语交际时，表达要（ ）", "options": ["清楚、有条理", "随便说", "越快越好", "声音越大越好"], "answer": 0, "explanation": "口语交际要清楚、有条理。"},
    {"topicId": "ct_YW4S021", "difficulty": "basic", "question": "综合性学习的方式不包括（ ）", "options": ["调查", "访问", "背书", "实验"], "answer": 2, "explanation": "综合性学习不包括背书。"},
])

# 五年级语文 - 阅读、作文、口语交际
new_questions.extend([
    {"topicId": "ct_YW5S020", "difficulty": "basic", "question": "'鲸是哺乳动物'用了什么说明方法？", "options": ["举例子", "下定义", "打比方", "列数字"], "answer": 1, "explanation": "下定义是说明事物的本质特征。"},
    {"topicId": "ct_YW5S020", "difficulty": "medium", "question": "'赵州桥非常长，大约50多米'用了什么说明方法？", "options": ["作比较", "列数字", "打比方", "举例子"], "answer": 1, "explanation": "用数字说明，是列数字。"},
    {"topicId": "ct_YW5S021", "difficulty": "basic", "question": "说明文的语言特点是（ ）", "options": ["准确、严谨", "生动、形象", "抒情、优美", "幽默、风趣"], "answer": 0, "explanation": "说明文语言准确、严谨。"},
    {"topicId": "ct_YW5S021", "difficulty": "medium", "question": "说明文的顺序不包括（ ）", "options": ["时间顺序", "空间顺序", "逻辑顺序", "情感顺序"], "answer": 3, "explanation": "说明文没有情感顺序。"},
    {"topicId": "ct_YW5S022", "difficulty": "basic", "question": "缩写故事时，应该（ ）", "options": ["保留主要情节", "保留所有细节", "改变故事内容", "增加新情节"], "answer": 0, "explanation": "缩写要保留主要情节。"},
    {"topicId": "ct_YW5S023", "difficulty": "basic", "question": "口语交际时，要注意（ ）", "options": ["尊重他人、认真倾听", "随意打断", "大声喧哗", "不礼貌"], "answer": 0, "explanation": "口语交际要尊重他人、认真倾听。"},
    {"topicId": "ct_YW5S024", "difficulty": "basic", "question": "综合性学习的目的是（ ）", "options": ["提高综合能力", "应付考试", "完成作业", "打发时间"], "answer": 0, "explanation": "综合性学习提高综合能力。"},
])

# 六年级语文 - 阅读、作文、口语交际
new_questions.extend([
    {"topicId": "ct_YW6S020", "difficulty": "basic", "question": "《少年闰土》的作者是（ ）", "options": ["鲁迅", "老舍", "巴金", "茅盾"], "answer": 0, "explanation": "作者是鲁迅。"},
    {"topicId": "ct_YW6S020", "difficulty": "medium", "question": "《匆匆》中，作者感叹什么匆匆？", "options": ["时间", "青春", "生命", "流水"], "answer": 0, "explanation": "朱自清感叹时间匆匆。"},
    {"topicId": "ct_YW6S021", "difficulty": "basic", "question": "阅读理解时，要关注文章的（ ）", "options": ["中心思想", "字数", "标点", "字体"], "answer": 0, "explanation": "阅读理解要关注中心思想。"},
    {"topicId": "ct_YW6S021", "difficulty": "medium", "question": "文章的表达方式不包括（ ）", "options": ["记叙", "描写", "说明", "书写"], "answer": 3, "explanation": "表达方式包括记叙、描写、说明、议论、抒情。"},
    {"topicId": "ct_YW6S022", "difficulty": "basic", "question": "倡议书的格式不包括（ ）", "options": ["标题", "称呼", "正文", "摘要"], "answer": 3, "explanation": "倡议书格式：标题、称呼、正文、结尾、署名、日期。"},
    {"topicId": "ct_YW6S023", "difficulty": "basic", "question": "口语交际时，表达要（ ）", "options": ["清楚、有礼貌", "随便说", "越快越好", "声音越大越好"], "answer": 0, "explanation": "口语交际要清楚、有礼貌。"},
    {"topicId": "ct_YW6S024", "difficulty": "basic", "question": "综合性学习的特点是（ ）", "options": ["跨学科、实践性", "只学课本", "只做题", "只背书"], "answer": 0, "explanation": "综合性学习跨学科、实践性强。"},
])

# ==================== 英语扩充 ====================

# 三年级英语 - 语法、阅读、写作、听力、口语
new_questions.extend([
    {"topicId": "ct_YY3S010", "difficulty": "basic", "question": "选出正确的be动词：I ___ a student.", "options": ["am", "is", "are", "be"], "answer": 0, "explanation": "I后面用am。"},
    {"topicId": "ct_YY3S010", "difficulty": "medium", "question": "选出正确的be动词：She ___ a teacher.", "options": ["am", "is", "are", "be"], "answer": 1, "explanation": "第三人称单数用is。"},
    {"topicId": "ct_YY3S011", "difficulty": "basic", "question": "选出'Good morning'的中文意思", "options": ["晚上好", "早上好", "下午好", "再见"], "answer": 1, "explanation": "Good morning是早上好。"},
    {"topicId": "ct_YY3S011", "difficulty": "medium", "question": "选出'Nice to meet you'的中文意思", "options": ["很高兴认识你", "很高兴见到你", "再见", "谢谢"], "answer": 0, "explanation": "Nice to meet you是很高兴认识你。"},
    {"topicId": "ct_YY3S012", "difficulty": "basic", "question": "写作时，开头应该（ ）", "options": ["问候或介绍", "直接说重点", "说再见", "说谢谢"], "answer": 0, "explanation": "写作开头要问候或介绍。"},
    {"topicId": "ct_YY3S013", "difficulty": "basic", "question": "听力时，要注意（ ）", "options": ["关键词", "背景音乐", "说话人的声音", "语速"], "answer": 0, "explanation": "听力要注意关键词。"},
    {"topicId": "ct_YY3S014", "difficulty": "basic", "question": "口语时，发音要（ ）", "options": ["准确、清晰", "越快越好", "声音越大越好", "随便说"], "answer": 0, "explanation": "口语发音要准确、清晰。"},
])

# 四年级英语 - 语法、阅读、写作、听力、口语
new_questions.extend([
    {"topicId": "ct_YY4S009", "difficulty": "basic", "question": "选出'book'的复数形式", "options": ["book", "books", "bookes", "bookies"], "answer": 1, "explanation": "book的复数是books。"},
    {"topicId": "ct_YY4S009", "difficulty": "medium", "question": "选出'box'的复数形式", "options": ["boxs", "boxes", "boxies", "box"], "answer": 1, "explanation": "以x结尾加es。"},
    {"topicId": "ct_YY4S011", "difficulty": "basic", "question": "听力时，要注意（ ）", "options": ["关键词", "背景音乐", "说话人的声音", "语速"], "answer": 0, "explanation": "听力要注意关键词。"},
    {"topicId": "ct_YY4S012", "difficulty": "basic", "question": "口语时，发音要（ ）", "options": ["准确、清晰", "越快越好", "声音越大越好", "随便说"], "answer": 0, "explanation": "口语发音要准确、清晰。"},
])

# 五年级英语 - 语法、阅读、写作、听力、口语
new_questions.extend([
    {"topicId": "ct_YY5S009", "difficulty": "basic", "question": "选出正确的现在进行时：Look! The birds ___ in the sky.", "options": ["fly", "flies", "are flying", "flew"], "answer": 2, "explanation": "Look提示现在进行时，用are flying。"},
    {"topicId": "ct_YY5S009", "difficulty": "medium", "question": "选出正确的过去式：Yesterday, I ___ to the park.", "options": ["go", "goes", "went", "going"], "answer": 2, "explanation": "Yesterday提示过去式，go的过去式是went。"},
    {"topicId": "ct_YY5S010", "difficulty": "basic", "question": "选出'spring'的中文意思", "options": ["夏天", "秋天", "春天", "冬天"], "answer": 2, "explanation": "spring是春天。"},
    {"topicId": "ct_YY5S011", "difficulty": "basic", "question": "听力时，要注意（ ）", "options": ["关键词", "背景音乐", "说话人的声音", "语速"], "answer": 0, "explanation": "听力要注意关键词。"},
    {"topicId": "ct_YY5S012", "difficulty": "basic", "question": "口语时，发音要（ ）", "options": ["准确、清晰", "越快越好", "声音越大越好", "随便说"], "answer": 0, "explanation": "口语发音要准确、清晰。"},
])

# 六年级英语 - 语法、阅读、写作、听力、口语
new_questions.extend([
    {"topicId": "ct_YY6S009", "difficulty": "basic", "question": "选出'big'的比较级", "options": ["big", "bigger", "biggest", "more big"], "answer": 1, "explanation": "单音节词加er。"},
    {"topicId": "ct_YY6S009", "difficulty": "medium", "question": "选出'beautiful'的比较级", "options": ["beautifuler", "more beautiful", "most beautiful", "beautifully"], "answer": 1, "explanation": "多音节词加more。"},
    {"topicId": "ct_YY6S010", "difficulty": "basic", "question": "选出'How much is it?'的正确回答", "options": ["It's 5 yuan.", "It's 5 o'clock.", "It's 5 years old.", "It's Monday."], "answer": 0, "explanation": "How much问价格，回答价格。"},
    {"topicId": "ct_YY6S011", "difficulty": "basic", "question": "听力时，要注意（ ）", "options": ["关键词", "背景音乐", "说话人的声音", "语速"], "answer": 0, "explanation": "听力要注意关键词。"},
    {"topicId": "ct_YY6S012", "difficulty": "basic", "question": "口语时，发音要（ ）", "options": ["准确、清晰", "越快越好", "声音越大越好", "随便说"], "answer": 0, "explanation": "口语发音要准确、清晰。"},
])

# ==================== 科学扩充 ====================

# 三年级科学 - 天气、测量、观察、实验、探究
new_questions.extend([
    {"topicId": "ct_KX3S032", "difficulty": "basic", "question": "测量气温用什么工具？", "options": ["尺子", "温度计", "天平", "量筒"], "answer": 1, "explanation": "测量气温用温度计。"},
    {"topicId": "ct_KX3S032", "difficulty": "medium", "question": "气温的单位是（ ）", "options": ["米", "摄氏度", "千克", "秒"], "answer": 1, "explanation": "气温单位是摄氏度。"},
    {"topicId": "ct_KX3S033", "difficulty": "basic", "question": "测量长度用什么工具？", "options": ["尺子", "温度计", "天平", "量筒"], "answer": 0, "explanation": "测量长度用尺子。"},
    {"topicId": "ct_KX3S033", "difficulty": "medium", "question": "1米 = （ ）厘米", "options": ["10", "100", "1000", "10000"], "answer": 1, "explanation": "1米=100厘米。"},
    {"topicId": "ct_KX3S034", "difficulty": "basic", "question": "观察时，要用（ ）", "options": ["眼睛看", "耳朵听", "鼻子闻", "以上都要"], "answer": 3, "explanation": "观察要动用多种感官。"},
    {"topicId": "ct_KX3S035", "difficulty": "basic", "question": "做实验时，要注意（ ）", "options": ["安全", "速度", "好看", "声音"], "answer": 0, "explanation": "做实验要注意安全。"},
    {"topicId": "ct_KX3S036", "difficulty": "basic", "question": "科学探究的第一步是（ ）", "options": ["提出问题", "做实验", "得出结论", "写报告"], "answer": 0, "explanation": "科学探究从提出问题开始。"},
])

# 四年级科学 - 植物、动物、人体、实验、探究
new_questions.extend([
    {"topicId": "ct_KX4S014", "difficulty": "basic", "question": "植物进行光合作用需要（ ）", "options": ["阳光、水、二氧化碳", "土壤、空气、肥料", "阳光、土壤、空气", "水、空气、肥料"], "answer": 0, "explanation": "光合作用需要阳光、水和二氧化碳。"},
    {"topicId": "ct_KX4S014", "difficulty": "medium", "question": "植物的根有什么作用？", "options": ["制造养分", "吸收水分和养分", "进行光合作用", "繁殖"], "answer": 1, "explanation": "根的作用是吸收水分和养分。"},
    {"topicId": "ct_KX4S016", "difficulty": "basic", "question": "下面哪种动物是哺乳动物？", "options": ["鸡", "鱼", "猫", "青蛙"], "answer": 2, "explanation": "猫是哺乳动物。"},
    {"topicId": "ct_KX4S016", "difficulty": "medium", "question": "下面哪种动物是昆虫？", "options": ["蜘蛛", "蝴蝶", "蚯蚓", "蜗牛"], "answer": 1, "explanation": "蝴蝶是昆虫，身体分头胸腹三部分，有三对足。"},
    {"topicId": "ct_KX4S017", "difficulty": "basic", "question": "做实验时，要注意（ ）", "options": ["安全", "速度", "好看", "声音"], "answer": 0, "explanation": "做实验要注意安全。"},
    {"topicId": "ct_KX4S018", "difficulty": "basic", "question": "科学探究的第一步是（ ）", "options": ["提出问题", "做实验", "得出结论", "写报告"], "answer": 0, "explanation": "科学探究从提出问题开始。"},
])

# 五年级科学 - 生物、环境、地球、实验、探究
new_questions.extend([
    {"topicId": "ct_KX5S018", "difficulty": "basic", "question": "细胞是生物体什么的基本单位？", "options": ["结构和功能", "生长和繁殖", "遗传和变异", "代谢"], "answer": 0, "explanation": "细胞是生物体结构和功能的基本单位。"},
    {"topicId": "ct_KX5S018", "difficulty": "medium", "question": "植物细胞与动物细胞最大的区别是植物细胞有（ ）", "options": ["细胞膜", "细胞质", "细胞壁", "细胞核"], "answer": 2, "explanation": "植物细胞有细胞壁，动物细胞没有。"},
    {"topicId": "ct_KX5S019", "difficulty": "basic", "question": "保护环境应该（ ）", "options": ["乱扔垃圾", "节约用水用电", "砍伐森林", "污染河流"], "answer": 1, "explanation": "保护环境要节约资源。"},
    {"topicId": "ct_KX5S019", "difficulty": "medium", "question": "可持续发展的含义是（ ）", "options": ["满足当代需求，不损害后代", "只满足当代需求", "只考虑后代", "不考虑环境"], "answer": 0, "explanation": "可持续发展要兼顾当代和后代。"},
    {"topicId": "ct_KX5S020", "difficulty": "basic", "question": "地球绕着什么转？", "options": ["月亮", "太阳", "火星", "北极星"], "answer": 1, "explanation": "地球绕着太阳转。"},
    {"topicId": "ct_KX5S021", "difficulty": "basic", "question": "做实验时，要注意（ ）", "options": ["安全", "速度", "好看", "声音"], "answer": 0, "explanation": "做实验要注意安全。"},
    {"topicId": "ct_KX5S022", "difficulty": "basic", "question": "科学探究的第一步是（ ）", "options": ["提出问题", "做实验", "得出结论", "写报告"], "answer": 0, "explanation": "科学探究从提出问题开始。"},
])

# 六年级科学 - 宇宙、能源、环境、实验、探究
new_questions.extend([
    {"topicId": "ct_KX6S023", "difficulty": "basic", "question": "太阳系中最大的行星是（ ）", "options": ["地球", "木星", "土星", "火星"], "answer": 1, "explanation": "木星是太阳系中最大的行星。"},
    {"topicId": "ct_KX6S023", "difficulty": "medium", "question": "月亮本身发光吗？", "options": ["发光", "不发光", "有时发光", "白天发光"], "answer": 1, "explanation": "月亮本身不发光，它反射太阳光。"},
    {"topicId": "ct_KX6S024", "difficulty": "basic", "question": "下面哪种是可再生能源？", "options": ["煤", "石油", "太阳能", "天然气"], "answer": 2, "explanation": "太阳能是可再生能源。"},
    {"topicId": "ct_KX6S024", "difficulty": "medium", "question": "能量可以（ ）", "options": ["凭空产生", "凭空消失", "转化", "以上都不对"], "answer": 2, "explanation": "能量可以转化。"},
    {"topicId": "ct_KX6S025", "difficulty": "basic", "question": "保护环境应该（ ）", "options": ["乱扔垃圾", "节约用水用电", "砍伐森林", "污染河流"], "answer": 1, "explanation": "保护环境要节约资源。"},
    {"topicId": "ct_KX6S026", "difficulty": "basic", "question": "做实验时，要注意（ ）", "options": ["安全", "速度", "好看", "声音"], "answer": 0, "explanation": "做实验要注意安全。"},
    {"topicId": "ct_KX6S027", "difficulty": "basic", "question": "科学探究的第一步是（ ）", "options": ["提出问题", "做实验", "得出结论", "写报告"], "answer": 0, "explanation": "科学探究从提出问题开始。"},
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
    "version": "v1.6-diagnostic",
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
