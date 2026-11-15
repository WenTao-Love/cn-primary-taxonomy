#!/usr/bin/env python3
"""
批量生成诊断题库 v2
聚焦核心知识点，避免重复，覆盖更多概念
"""

import json
import os

data_dir = 'D:/xcode/fgit/cn-primary-taxonomy/data'

# 诊断题数据（按知识点组织）
questions = []

# ==================== 数学（扩充） ====================

# 一年级数学 - 图形与分类
questions.extend([
    {"topicId": "ct_SX1S035", "difficulty": "basic", "question": "下面哪个是长方体？", "options": ["魔方", "书本", "足球", "乒乓球"], "answer": 1, "explanation": "书本的长方体形状。"},
    {"topicId": "ct_SX1S035", "difficulty": "basic", "question": "下面哪个是球体？", "options": ["魔方", "书本", "足球", "砖块"], "answer": 2, "explanation": "足球是球体。"},
    {"topicId": "ct_SX1S035", "difficulty": "medium", "question": "圆柱有什么特点？", "options": ["有两个平平的圆面", "有6个面", "方方的", "有尖尖的角"], "answer": 0, "explanation": "圆柱有两个平平的圆形底面。"},
    {"topicId": "ct_SX1S036", "difficulty": "basic", "question": "把下面的物品按形状分类，苹果和西瓜可以分成一类，因为它们都是（ ）", "options": ["圆形", "红色", "水果", "甜的"], "answer": 0, "explanation": "苹果和西瓜都是圆形。"},
    {"topicId": "ct_SX1S036", "difficulty": "medium", "question": "分类的标准有（ ）", "options": ["形状", "颜色", "大小", "以上都可以"], "answer": 3, "explanation": "分类可以按形状、颜色、大小等多种标准。"},
])

# 二年级数学 - 观察物体
questions.extend([
    {"topicId": "ct_SX2S045", "difficulty": "basic", "question": "从正面看一个正方体，看到的是（ ）", "options": ["正方形", "长方形", "圆形", "三角形"], "answer": 0, "explanation": "从正面看正方体是正方形。"},
    {"topicId": "ct_SX2S045", "difficulty": "medium", "question": "从上面看一个圆柱，看到的是（ ）", "options": ["圆形", "长方形", "正方形", "三角形"], "answer": 0, "explanation": "从上面看圆柱是圆形。"},
    {"topicId": "ct_SX2S045", "difficulty": "hard", "question": "一个长方体，从不同方向看，最多能看到（ ）个面", "options": ["1个", "2个", "3个", "4个"], "answer": 2, "explanation": "从斜上方看，最多能看到3个面。"},
])

# 二年级数学 - 表内乘法应用
questions.extend([
    {"topicId": "ct_SX2S022", "difficulty": "basic", "question": "每排有4棵树，3排一共有多少棵？", "options": ["7棵", "12棵", "16棵", "20棵"], "answer": 1, "explanation": "4×3=12棵。"},
    {"topicId": "ct_SX2S022", "difficulty": "medium", "question": "小明每天背5个单词，一个学期（按20周算）背多少个？", "options": ["100个", "500个", "700个", "1000个"], "answer": 2, "explanation": "5×5×20=500个（每周5天）。"},
    {"topicId": "ct_SX2S022", "difficulty": "hard", "question": "一盒巧克力有8块，买5盒一共有多少块？", "options": ["35块", "40块", "45块", "50块"], "answer": 1, "explanation": "8×5=40块。"},
])

# 三年级数学 - 两位数乘两位数
questions.extend([
    {"topicId": "ct_SX3S016", "difficulty": "basic", "question": "计算：12 × 11 = ?", "options": ["121", "132", "143", "154"], "answer": 1, "explanation": "12×11=132。"},
    {"topicId": "ct_SX3S016", "difficulty": "medium", "question": "计算：23 × 14 = ?", "options": ["312", "322", "332", "342"], "answer": 1, "explanation": "23×14=322。"},
    {"topicId": "ct_SX3S016", "difficulty": "hard", "question": "每箱有24瓶水，买了15箱，一共多少瓶？", "options": ["340瓶", "360瓶", "380瓶", "400瓶"], "answer": 1, "explanation": "24×15=360瓶。"},
])

# 三年级数学 - 面积
questions.extend([
    {"topicId": "ct_SX3S032", "difficulty": "basic", "question": "长方形的面积公式是（ ）", "options": ["长+宽", "长×宽", "（长+宽）×2", "长÷宽"], "answer": 1, "explanation": "长方形面积=长×宽。"},
    {"topicId": "ct_SX3S032", "difficulty": "medium", "question": "一个长方形长6厘米，宽4厘米，面积是多少？", "options": ["10平方厘米", "20平方厘米", "24平方厘米", "28平方厘米"], "answer": 2, "explanation": "6×4=24平方厘米。"},
    {"topicId": "ct_SX3S032", "difficulty": "hard", "question": "正方形的边长是5厘米，面积是多少？", "options": ["10平方厘米", "20平方厘米", "25平方厘米", "30平方厘米"], "answer": 2, "explanation": "5×5=25平方厘米。"},
])

# 四年级数学 - 平行四边形和梯形
questions.extend([
    {"topicId": "ct_SX4S005", "difficulty": "basic", "question": "平行四边形的对边（ ）", "options": ["相等", "不相等", "有时相等", "无法确定"], "answer": 0, "explanation": "平行四边形的对边平行且相等。"},
    {"topicId": "ct_SX4S005", "difficulty": "medium", "question": "梯形有几条边平行？", "options": ["0条", "1条", "2条", "3条"], "answer": 1, "explanation": "梯形只有一组对边平行。"},
    {"topicId": "ct_SX4S005", "difficulty": "hard", "question": "把一个平行四边形拉成一个长方形，面积会（ ）", "options": ["变大", "变小", "不变", "无法确定"], "answer": 0, "explanation": "拉成长方形后，高变大，面积变大。"},
])

# 四年级数学 - 条形统计图
questions.extend([
    {"topicId": "ct_SX4S020", "difficulty": "basic", "question": "条形统计图的优点是什么？", "options": ["能看出数量多少", "能看出变化趋势", "能看出部分与整体", "能看出比例"], "answer": 0, "explanation": "条形统计图能直观看出数量多少。"},
    {"topicId": "ct_SX4S020", "difficulty": "medium", "question": "如果条形统计图1格表示5人，3格表示多少人？", "options": ["8人", "10人", "15人", "20人"], "answer": 2, "explanation": "3×5=15人。"},
])

# 五年级数学 - 倍数与因数
questions.extend([
    {"topicId": "ct_SX5S005", "difficulty": "basic", "question": "12的因数有哪些？", "options": ["1, 2, 3, 4, 6, 12", "1, 2, 4, 8, 12", "2, 3, 4, 6", "1, 3, 5, 12"], "answer": 0, "explanation": "12的因数有1、2、3、4、6、12。"},
    {"topicId": "ct_SX5S005", "difficulty": "medium", "question": "5的倍数最小是几？", "options": ["0", "1", "5", "10"], "answer": 2, "explanation": "5的最小倍数是5本身。"},
    {"topicId": "ct_SX5S005", "difficulty": "hard", "question": "既是2的倍数又是3的倍数的最小两位数是（ ）", "options": ["6", "12", "18", "24"], "answer": 1, "explanation": "2和3的最小公倍数是6，最小两位数是12。"},
])

# 五年级数学 - 长方体和正方体
questions.extend([
    {"topicId": "ct_SX5S020", "difficulty": "basic", "question": "长方体有（ ）个面", "options": ["4个", "6个", "8个", "12个"], "answer": 1, "explanation": "长方体有6个面。"},
    {"topicId": "ct_SX5S020", "difficulty": "medium", "question": "正方体的棱长总和是48厘米，一条棱长多少厘米？", "options": ["4厘米", "6厘米", "8厘米", "12厘米"], "answer": 0, "explanation": "正方体有12条棱，48÷12=4厘米。"},
    {"topicId": "ct_SX5S020", "difficulty": "hard", "question": "一个长方体长8厘米、宽6厘米、高4厘米，体积是多少？", "options": ["192立方厘米", "184立方厘米", "168立方厘米", "148立方厘米"], "answer": 0, "explanation": "8×6×4=192立方厘米。"},
])

# 六年级数学 - 比和比例
questions.extend([
    {"topicId": "ct_SX6S005", "difficulty": "basic", "question": "3:5可以写成（ ）", "options": ["3/5", "5/3", "3÷5", "3×5"], "answer": 0, "explanation": "3:5可以写成分数3/5。"},
    {"topicId": "ct_SX6S005", "difficulty": "medium", "question": "如果3:5 = x:15，x = ?", "options": ["6", "9", "12", "15"], "answer": 1, "explanation": "3/5=x/15，x=9。"},
    {"topicId": "ct_SX6S005", "difficulty": "hard", "question": "男生和女生人数比是4:5，女生比男生多（ ）", "options": ["1/4", "1/5", "1/3", "1/2"], "answer": 0, "explanation": "(5-4)/4=1/4。"},
])

# 六年级数学 - 负数
questions.extend([
    {"topicId": "ct_SX6S015", "difficulty": "basic", "question": "-5℃和3℃哪个温度更高？", "options": ["-5℃", "3℃", "一样高", "无法比较"], "answer": 1, "explanation": "3℃高于-5℃。"},
    {"topicId": "ct_SX6S015", "difficulty": "medium", "question": "-3 + 8 = ?", "options": ["-11", "11", "5", "-5"], "answer": 2, "explanation": "-3+8=5。"},
    {"topicId": "ct_SX6S015", "difficulty": "hard", "question": "下列说法正确的是（ ）", "options": ["0是正数", "0是负数", "0既不是正数也不是负数", "0是最大的负数"], "answer": 2, "explanation": "0既不是正数也不是负数。"},
])

# ==================== 语文（扩充） ====================

# 一年级语文 - 简单写话
questions.extend([
    {"topicId": "ct_YW1S063", "difficulty": "basic", "question": "把句子补充完整：今天天气______", "options": ["很好", "跑步", "红色", "桌子"], "answer": 0, "explanation": "天气很好是完整的表达。"},
    {"topicId": "ct_YW1S063", "difficulty": "medium", "question": "下面哪个句子最完整？", "options": ["小明跑步", "小明在公园里跑步", "跑步", "在公园"], "answer": 1, "explanation": "完整的句子需要主语、地点、动作。"},
    {"topicId": "ct_YW1S065", "difficulty": "basic", "question": "看图写话时，首先应该（ ）", "options": ["直接写", "仔细观察图片", "问别人", "写很多字"], "answer": 1, "explanation": "看图写话要先仔细观察。"},
    {"topicId": "ct_YW1S065", "difficulty": "medium", "question": "看图写一句话，最重要的要素是（ ）", "options": ["用很多成语", "写出图中有什么", "写得很长", "用很多感叹号"], "answer": 1, "explanation": "看图写话要写出图中主要内容。"},
])

# 二年级语文 - 留言条
questions.extend([
    {"topicId": "ct_YW2S008", "difficulty": "basic", "question": "留言条应该包括哪些要素？", "options": ["称呼、正文、署名、日期", "标题、正文、结尾", "时间、地点、人物", "开头、中间、结尾"], "answer": 0, "explanation": "留言条四要素：称呼、正文、署名、日期。"},
    {"topicId": "ct_YW2S008", "difficulty": "medium", "question": "写留言条时，署名应该写（ ）", "options": ["对方的名字", "自己的名字", "老师的名字", "家长的名字"], "answer": 1, "explanation": "署名写留言人的名字。"},
])

# 三年级语文 - 续写故事
questions.extend([
    {"topicId": "ct_YW3S020", "difficulty": "basic", "question": "续写故事时，最重要的是（ ）", "options": ["写得越长越好", "承接上文，情节合理", "用很多好词", "写不同的故事"], "answer": 1, "explanation": "续写要承接上文，情节合理。"},
    {"topicId": "ct_YW3S020", "difficulty": "medium", "question": "续写故事时，人物应该（ ）", "options": ["突然改变性格", "保持原有性格", "全部换掉", "减少人物"], "answer": 1, "explanation": "续写要保持人物性格一致。"},
    {"topicId": "ct_YW3S020", "difficulty": "hard", "question": "续写《龟兔赛跑》，下列哪个情节最合理？", "options": ["兔子又睡觉了，乌龟又赢了", "乌龟和兔子成为了朋友，一起跑步", "兔子改掉了骄傲的毛病，和乌龟一起练习", "兔子学会开车，赢了乌龟"], "answer": 2, "explanation": "续写要符合故事逻辑，有教育意义。"},
])

# 四年级语文 - 写信
questions.extend([
    {"topicId": "ct_YW4S010", "difficulty": "basic", "question": "书信的格式不包括（ ）", "options": ["称呼", "正文", "署名", "标题"], "answer": 3, "explanation": "书信格式包括称呼、正文、结尾、署名、日期，不需要标题。"},
    {"topicId": "ct_YW4S010", "difficulty": "medium", "question": "书信开头的称呼应该（ ）", "options": ["空两格写", "顶格写", "写在中上方", "写在右下角"], "answer": 1, "explanation": "称呼要顶格写，表示尊敬。"},
    {"topicId": "ct_YW4S010", "difficulty": "hard", "question": "写信的结尾祝福语，下列哪个最合适？", "options": ["此致敬礼", "再见", "谢谢", "好的"], "answer": 0, "explanation": "书信结尾常用'此致敬礼'。"},
])

# 五年级语文 - 缩写故事
questions.extend([
    {"topicId": "ct_YW5S015", "difficulty": "basic", "question": "缩写故事时，应该（ ）", "options": ["保留主要情节", "保留所有细节", "改变故事内容", "增加新情节"], "answer": 0, "explanation": "缩写要保留主要情节。"},
    {"topicId": "ct_YW5S015", "difficulty": "medium", "question": "缩写时，下列哪种句子应该删除？", "options": ["主要人物的对话", "次要人物的描写", "故事的起因", "故事的结果"], "answer": 1, "explanation": "次要人物的描写可以删减。"},
    {"topicId": "ct_YW5S015", "difficulty": "hard", "question": "缩写《草船借箭》，下列哪个内容不能删？", "options": ["鲁肃的担心", "诸葛亮的计谋", "江上的大雾", "周瑜的佩服"], "answer": 1, "explanation": "诸葛亮的计谋是核心情节，不能删。"},
])

# 六年级语文 - 倡议书
questions.extend([
    {"topicId": "ct_YW6S010", "difficulty": "basic", "question": "倡议书的格式不包括（ ）", "options": ["标题", "称呼", "正文", "摘要"], "answer": 3, "explanation": "倡议书格式：标题、称呼、正文、结尾、署名、日期。"},
    {"topicId": "ct_YW6S010", "difficulty": "medium", "question": "倡议书正文应该写（ ）", "options": ["倡议的原因和内容", "个人感想", "故事", "诗歌"], "answer": 0, "explanation": "正文要写清倡议的原因和具体内容。"},
    {"topicId": "ct_YW6S010", "difficulty": "hard", "question": "写'节约用水'倡议书，下列哪个建议最具体？", "options": ["要节约用水", "洗手时关小水龙头", "水是宝贵的", "浪费水不好"], "answer": 1, "explanation": "具体建议比口号更有号召力。"},
])

# ==================== 英语（扩充） ====================

# 三年级英语 - 颜色和数字
questions.extend([
    {"topicId": "ct_YY3S005", "difficulty": "basic", "question": "选出'red'的中文意思", "options": ["蓝色", "红色", "绿色", "黄色"], "answer": 1, "explanation": "red是红色。"},
    {"topicId": "ct_YY3S005", "difficulty": "medium", "question": "选出'How many'的正确用法", "options": ["How many book?", "How many books?", "How many bookes?", "How many booking?"], "answer": 1, "explanation": "How many后接可数名词复数。"},
    {"topicId": "ct_YY3S005", "difficulty": "hard", "question": "'I have ten apples.'中，ten的意思是（ ）", "options": ["二", "五", "十", "十二"], "answer": 2, "explanation": "ten是十。"},
])

# 四年级英语 - 天气
questions.extend([
    {"topicId": "ct_YY4S008", "difficulty": "basic", "question": "选出'sunny'的中文意思", "options": ["下雨的", "晴朗的", "多云的", "下雪的"], "answer": 1, "explanation": "sunny是晴朗的。"},
    {"topicId": "ct_YY4S008", "difficulty": "medium", "question": "选出'What's the weather like today?'的正确回答", "options": ["It's sunny.", "It's Monday.", "It's 3 o'clock.", "It's January."], "answer": 0, "explanation": "问天气回答天气状况。"},
    {"topicId": "ct_YY4S008", "difficulty": "hard", "question": "选出'rainy'的反义词", "options": ["windy", "sunny", "cloudy", "snowy"], "answer": 1, "explanation": "rainy（下雨的）的反义词是sunny（晴朗的）。"},
])

# 五年级英语 - 季节
questions.extend([
    {"topicId": "ct_YY5S008", "difficulty": "basic", "question": "选出'spring'的中文意思", "options": ["夏天", "秋天", "春天", "冬天"], "answer": 2, "explanation": "spring是春天。"},
    {"topicId": "ct_YY5S008", "difficulty": "medium", "question": "选出'I like summer best.'的中文意思", "options": ["我喜欢夏天", "我喜欢夏天最好", "我最喜欢夏天", "我比较好喜欢夏天"], "answer": 2, "explanation": "like...best表示最喜欢。"},
    {"topicId": "ct_YY5S008", "difficulty": "hard", "question": "选出'winter'的季节特征", "options": ["hot", "warm", "cool", "cold"], "answer": 3, "explanation": "winter是冬天，特征是cold。"},
])

# 六年级英语 - 购物
questions.extend([
    {"topicId": "ct_YY6S008", "difficulty": "basic", "question": "选出'How much is it?'的正确回答", "options": ["It's 5 yuan.", "It's 5 o'clock.", "It's 5 years old.", "It's Monday."], "answer": 0, "explanation": "How much问价格，回答价格。"},
    {"topicId": "ct_YY6S008", "difficulty": "medium", "question": "选出'I'll take it.'的中文意思", "options": ["我买了", "我要这个", "我拿了", "我带走了"], "answer": 1, "explanation": "I'll take it.表示我要买这个。"},
    {"topicId": "ct_YY6S008", "difficulty": "hard", "question": "选出'expensive'的反义词", "options": ["cheap", "dear", "nice", "good"], "answer": 0, "explanation": "expensive（贵的）的反义词是cheap（便宜的）。"},
])

# ==================== 科学（扩充） ====================

# 三年级科学 - 溶解
questions.extend([
    {"topicId": "ct_KX3S020", "difficulty": "basic", "question": "下面哪种物质能溶解在水里？", "options": ["沙子", "盐", "石头", "塑料"], "answer": 1, "explanation": "盐能溶解在水里。"},
    {"topicId": "ct_KX3S020", "difficulty": "medium", "question": "加快溶解的方法不包括（ ）", "options": ["搅拌", "加热", "把物质弄碎", "加水"], "answer": 3, "explanation": "加水只是增加溶液量，不能加快溶解速度。"},
    {"topicId": "ct_KX3S020", "difficulty": "hard", "question": "把相同大小的糖块分别放入冷水和热水中，哪个溶解得快？", "options": ["冷水", "热水", "一样快", "无法确定"], "answer": 1, "explanation": "温度越高，溶解越快。"},
])

# 三年级科学 - 测量气温
questions.extend([
    {"topicId": "ct_KX3S025", "difficulty": "basic", "question": "测量气温用什么工具？", "options": ["尺子", "温度计", "天平", "量筒"], "answer": 1, "explanation": "测量气温用温度计。"},
    {"topicId": "ct_KX3S025", "difficulty": "medium", "question": "气温的单位是（ ）", "options": ["米", "摄氏度", "千克", "秒"], "answer": 1, "explanation": "气温单位是摄氏度。"},
    {"topicId": "ct_KX3S025", "difficulty": "hard", "question": "一天中气温最高通常在（ ）", "options": ["早上", "中午", "傍晚", "晚上"], "answer": 1, "explanation": "一天中气温最高通常在午后2点左右。"},
])

# 四年级科学 - 简单机械
questions.extend([
    {"topicId": "ct_KX4S015", "difficulty": "basic", "question": "下面哪种工具是杠杆？", "options": ["剪刀", "螺丝钉", "斜面", "轮轴"], "answer": 0, "explanation": "剪刀是杠杆的应用。"},
    {"topicId": "ct_KX4S015", "difficulty": "medium", "question": "斜面有什么作用？", "options": ["省力", "费力", "改变方向", "增加距离"], "answer": 0, "explanation": "斜面能省力。"},
    {"topicId": "ct_KX4S015", "difficulty": "hard", "question": "螺丝钉是哪种简单机械的应用？", "options": ["杠杆", "斜面", "轮轴", "滑轮"], "answer": 1, "explanation": "螺丝钉是斜面的变形应用。"},
])

# 五年级科学 - 杠杆
questions.extend([
    {"topicId": "ct_KX5S010", "difficulty": "basic", "question": "杠杆有三个点，分别是（ ）", "options": ["支点、用力点、阻力点", "起点、中点、终点", "上点、中点、下点", "重点、轻点、中点"], "answer": 0, "explanation": "杠杆三点：支点、用力点、阻力点。"},
    {"topicId": "ct_KX5S010", "difficulty": "medium", "question": "费力杠杆的特点是（ ）", "options": ["省力但费距离", "费力但省距离", "不省力也不费力", "既省力又省距离"], "answer": 1, "explanation": "费力杠杆费力但省距离。"},
    {"topicId": "ct_KX5S010", "difficulty": "hard", "question": "下面哪种工具是省力杠杆？", "options": ["镊子", "筷子", "撬棍", "钓鱼竿"], "answer": 2, "explanation": "撬棍是省力杠杆，动力臂大于阻力臂。"},
])

# 六年级科学 - 生物多样性
questions.extend([
    {"topicId": "ct_KX6S015", "difficulty": "basic", "question": "生物多样性包括（ ）", "options": ["物种多样性、遗传多样性、生态系统多样性", "动物多样性、植物多样性", "陆地多样性、海洋多样性", "热带多样性、寒带多样性"], "answer": 0, "explanation": "生物多样性包括三个层次。"},
    {"topicId": "ct_KX6S015", "difficulty": "medium", "question": "保护生物多样性的根本措施是（ ）", "options": ["保护生物的栖息环境", "把动物关在动物园", "把植物种在公园", "减少人类活动"], "answer": 0, "explanation": "保护栖息环境是保护生物多样性的根本措施。"},
    {"topicId": "ct_KX6S015", "difficulty": "hard", "question": "下面哪种行为有利于保护生物多样性？", "options": ["乱砍滥伐", "建立自然保护区", "随意捕杀野生动物", "破坏湿地"], "answer": 1, "explanation": "建立自然保护区是保护生物多样性的有效措施。"},
])

# 生成最终题库
output = {
    "version": "v1.2-diagnostic",
    "description": "知识点诊断题库：覆盖数学、语文、英语、科学核心知识点",
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
