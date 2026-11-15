#!/usr/bin/env python3
"""
诊断题库 v6：继续扩充核心知识点
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

# 一年级数学 - 拼搭图形、认识立体图形
new_questions.extend([
    {"topicId": "ct_SX1S039", "difficulty": "basic", "question": "用4根小棒可以拼成（ ）", "options": ["三角形", "正方形", "长方形", "圆形"], "answer": 1, "explanation": "4根小棒可以拼成正方形。"},
    {"topicId": "ct_SX1S039", "difficulty": "medium", "question": "用6根小棒可以拼成（ ）", "options": ["三角形", "正方形", "长方形", "六边形"], "answer": 3, "explanation": "6根小棒可以拼成六边形。"},
    {"topicId": "ct_SX1S043", "difficulty": "basic", "question": "长方体有几个面？", "options": ["4个", "6个", "8个", "12个"], "answer": 1, "explanation": "长方体有6个面。"},
    {"topicId": "ct_SX1S043", "difficulty": "medium", "question": "正方体有几个顶点？", "options": ["4个", "6个", "8个", "12个"], "answer": 2, "explanation": "正方体有8个顶点。"},
    {"topicId": "ct_SX1S044", "difficulty": "basic", "question": "圆柱有几个平平的面？", "options": ["1个", "2个", "3个", "4个"], "answer": 1, "explanation": "圆柱有2个平平的面。"},
])

# 二年级数学 - 图形运动、轴对称
new_questions.extend([
    {"topicId": "ct_SX2S048", "difficulty": "basic", "question": "下面哪种现象是平移？", "options": ["电风扇转动", "电梯升降", "风车转动", "荡秋千"], "answer": 1, "explanation": "电梯升降是平移。"},
    {"topicId": "ct_SX2S048", "difficulty": "medium", "question": "下面哪种现象是旋转？", "options": ["电梯升降", "推拉窗户", "钟表指针转动", "滑梯"], "answer": 2, "explanation": "钟表指针转动是旋转。"},
    {"topicId": "ct_SX2S049", "difficulty": "basic", "question": "下面哪个图形是轴对称图形？", "options": ["长方形", "平行四边形", "任意三角形", "不规则图形"], "answer": 0, "explanation": "长方形是轴对称图形。"},
    {"topicId": "ct_SX2S049", "difficulty": "medium", "question": "正方形有几条对称轴？", "options": ["1条", "2条", "3条", "4条"], "answer": 3, "explanation": "正方形有4条对称轴。"},
    {"topicId": "ct_SX2S049", "difficulty": "hard", "question": "圆有几条对称轴？", "options": ["1条", "2条", "4条", "无数条"], "answer": 3, "explanation": "圆有无数条对称轴。"},
])

# 二年级数学 - 数据收集整理
new_questions.extend([
    {"topicId": "ct_SX2S052", "difficulty": "basic", "question": "统计最喜欢的颜色，用（ ）方法最方便", "options": ["画正字", "画圆圈", "画三角形", "画五角星"], "answer": 0, "explanation": "画正字最方便。"},
    {"topicId": "ct_SX2S052", "difficulty": "medium", "question": "如果5个人喜欢红色，3个人喜欢蓝色，一共调查了多少人？", "options": ["5人", "3人", "8人", "15人"], "answer": 2, "explanation": "5+3=8人。"},
])

# 三年级数学 - 位置与方向、年月日
new_questions.extend([
    {"topicId": "ct_SX3S028", "difficulty": "basic", "question": "地图通常是按（ ）方向绘制的", "options": ["上北下南，左西右东", "上南下北，左东右西", "上东下西，左北右南", "上西下东，左南右北"], "answer": 0, "explanation": "地图通常上北下南，左西右东。"},
    {"topicId": "ct_SX3S028", "difficulty": "medium", "question": "小明面向东，他的后面是（ ）", "options": ["东", "南", "西", "北"], "answer": 2, "explanation": "面向东，后面是西。"},
    {"topicId": "ct_SX3S029", "difficulty": "basic", "question": "一年有（ ）个月", "options": ["6", "10", "12", "24"], "answer": 2, "explanation": "一年有12个月。"},
    {"topicId": "ct_SX3S029", "difficulty": "medium", "question": "下面哪个是大月？", "options": ["4月", "6月", "9月", "7月"], "answer": 3, "explanation": "7月是大月，有31天。"},
    {"topicId": "ct_SX3S029", "difficulty": "hard", "question": "2024年是（ ）年", "options": ["平年", "闰年", "平年或闰年", "无法确定"], "answer": 1, "explanation": "2024能被4整除，是闰年。"},
])

# 三年级数学 - 复式统计表、搭配
new_questions.extend([
    {"topicId": "ct_SX3S033", "difficulty": "basic", "question": "复式统计表的优点是什么？", "options": ["能同时比较两组数据", "更简单", "更漂亮", "更省纸"], "answer": 0, "explanation": "复式统计表能同时比较两组数据。"},
    {"topicId": "ct_SX3S034", "difficulty": "basic", "question": "3件上衣和2条裤子，一共有多少种搭配方法？", "options": ["3种", "4种", "5种", "6种"], "answer": 3, "explanation": "3×2=6种搭配。"},
    {"topicId": "ct_SX3S034", "difficulty": "medium", "question": "4个同学互相握手，一共握多少次？", "options": ["4次", "6次", "8次", "12次"], "answer": 1, "explanation": "4×3÷2=6次。"},
])

# 四年级数学 - 运算定律、三角形
new_questions.extend([
    {"topicId": "ct_SX4S014", "difficulty": "basic", "question": "加法交换律的公式是（ ）", "options": ["a+b=b+a", "a×b=b×a", "(a+b)+c=a+(b+c)", "a×(b+c)=a×b+a×c"], "answer": 0, "explanation": "加法交换律：a+b=b+a。"},
    {"topicId": "ct_SX4S014", "difficulty": "medium", "question": "乘法结合律的公式是（ ）", "options": ["a+b=b+a", "(a×b)×c=a×(b×c)", "a×b=b×a", "a×(b+c)=a×b+a×c"], "answer": 1, "explanation": "乘法结合律：(a×b)×c=a×(b×c)。"},
    {"topicId": "ct_SX4S006", "difficulty": "basic", "question": "三角形的内角和是（ ）", "options": ["90°", "180°", "270°", "360°"], "answer": 1, "explanation": "三角形内角和是180°。"},
    {"topicId": "ct_SX4S006", "difficulty": "medium", "question": "一个三角形，两个角分别是60°和70°，第三个角是（ ）", "options": ["40°", "50°", "60°", "70°"], "answer": 1, "explanation": "180-60-70=50°。"},
    {"topicId": "ct_SX4S006", "difficulty": "hard", "question": "等腰三角形的两个底角（ ）", "options": ["相等", "不相等", "和是90°", "和是180°"], "answer": 0, "explanation": "等腰三角形两底角相等。"},
])

# 四年级数学 - 平均数、条形统计图
new_questions.extend([
    {"topicId": "ct_SX4S021", "difficulty": "basic", "question": "平均数的含义是（ ）", "options": ["总数除以个数", "最大的数", "最小的数", "中间的数"], "answer": 0, "explanation": "平均数=总数÷个数。"},
    {"topicId": "ct_SX4S021", "difficulty": "medium", "question": "5、8、10的平均数是（ ）", "options": ["7", "7.5", "8", "8.5"], "answer": 1, "explanation": "(5+8+10)÷3=7.5。"},
    {"topicId": "ct_SX4S022", "difficulty": "basic", "question": "条形统计图的优点是什么？", "options": ["能看出数量多少", "能看出变化趋势", "能看出部分与整体", "能看出比例"], "answer": 0, "explanation": "条形统计图能直观看出数量多少。"},
])

# 五年级数学 - 折线统计图、找次品
new_questions.extend([
    {"topicId": "ct_SX5S025", "difficulty": "basic", "question": "折线统计图的优点是什么？", "options": ["能看出数量多少", "能看出变化趋势", "能看出部分与整体", "能看出比例"], "answer": 1, "explanation": "折线统计图能看出变化趋势。"},
    {"topicId": "ct_SX5S025", "difficulty": "medium", "question": "如果折线向上，表示数量（ ）", "options": ["增加", "减少", "不变", "无法确定"], "answer": 0, "explanation": "折线向上表示数量增加。"},
    {"topicId": "ct_SX5S026", "difficulty": "basic", "question": "找次品时，最好把物品分成（ ）份", "options": ["2", "3", "4", "5"], "answer": 1, "explanation": "分成3份最好。"},
    {"topicId": "ct_SX5S026", "difficulty": "medium", "question": "有9个球，其中1个是次品，至少称几次能找出次品？", "options": ["1次", "2次", "3次", "4次"], "answer": 1, "explanation": "9个球分成3、3、3，至少称2次。"},
])

# 六年级数学 - 鸽巢问题、绿色出行
new_questions.extend([
    {"topicId": "ct_SX6S025", "difficulty": "basic", "question": "鸽巢问题的基本原理是（ ）", "options": ["如果有n+1个物体放进n个抽屉，至少有一个抽屉有2个物体", "每个抽屉只能放一个物体", "物体可以随便放", "没有规律"], "answer": 0, "explanation": "鸽巢原理：n+1个物体放进n个抽屉，至少有一个抽屉有2个。"},
    {"topicId": "ct_SX6S025", "difficulty": "medium", "question": "把10个苹果放进3个抽屉，至少有一个抽屉有（ ）个苹果", "options": ["3", "4", "5", "6"], "answer": 1, "explanation": "10÷3=3余1，至少有一个抽屉有4个。"},
    {"topicId": "ct_SX6S026", "difficulty": "basic", "question": "绿色出行的方式不包括（ ）", "options": ["步行", "骑自行车", "乘公交车", "开私家车"], "answer": 3, "explanation": "开私家车不是绿色出行。"},
])

# ==================== 语文扩充 ====================

# 一年级语文 - 口语交际、写话
new_questions.extend([
    {"topicId": "ct_YW1S069", "difficulty": "basic", "question": "口语交际时，要注意（ ）", "options": ["认真听别人说话", "随意打断别人", "大声喧哗", "不礼貌"], "answer": 0, "explanation": "口语交际要认真听别人说话。"},
    {"topicId": "ct_YW1S069", "difficulty": "medium", "question": "别人说话时，我们应该（ ）", "options": ["认真倾听", "随意打断", "做自己的事", "大声说话"], "answer": 0, "explanation": "别人说话时要认真倾听。"},
    {"topicId": "ct_YW1S070", "difficulty": "basic", "question": "自我介绍时，要说清楚（ ）", "options": ["姓名、年龄、爱好", "家庭住址", "父母工作", "家庭收入"], "answer": 0, "explanation": "自我介绍要说姓名、年龄、爱好。"},
    {"topicId": "ct_YW1S070", "difficulty": "medium", "question": "自我介绍时，语气要（ ）", "options": ["自然、大方", "紧张、小声", "傲慢、无礼", "随便、敷衍"], "answer": 0, "explanation": "自我介绍要自然、大方。"},
    {"topicId": "ct_YW1S071", "difficulty": "basic", "question": "说普通话时，要注意（ ）", "options": ["发音准确", "越快越好", "声音越大越好", "随便说"], "answer": 0, "explanation": "说普通话要注意发音准确。"},
    {"topicId": "ct_YW1S072", "difficulty": "basic", "question": "向同学借物品时，应该（ ）", "options": ["有礼貌地说请", "直接拿走", "命令对方", "不告诉对方"], "answer": 0, "explanation": "借物品要有礼貌。"},
])

# 二年级语文 - 写话、日积月累
new_questions.extend([
    {"topicId": "ct_YW2S066", "difficulty": "basic", "question": "按顺序写两三句话，首先要（ ）", "options": ["想清楚写什么", "直接写", "问别人", "抄范文"], "answer": 0, "explanation": "写话前要想清楚。"},
    {"topicId": "ct_YW2S066", "difficulty": "medium", "question": "写话时，要注意（ ）", "options": ["句子通顺", "字越多越好", "用很多成语", "写得很长"], "answer": 0, "explanation": "写话要注意句子通顺。"},
    {"topicId": "ct_YW2S067", "difficulty": "basic", "question": "写话时，要写清（ ）", "options": ["时间、地点、人物、事情", "天气、心情", "感受、收获", "想法、愿望"], "answer": 0, "explanation": "写话要写清时间、地点、人物、事情。"},
    {"topicId": "ct_YW2S067", "difficulty": "medium", "question": "写话时，开头可以写（ ）", "options": ["什么时候、谁、在哪里", "天气很好", "我很高兴", "今天是星期一"], "answer": 0, "explanation": "开头可以写时间、人物、地点。"},
    {"topicId": "ct_YW2S068", "difficulty": "basic", "question": "写一句感谢的话，可以说（ ）", "options": ["谢谢你", "对不起", "再见", "你好"], "answer": 0, "explanation": "感谢的话可以说谢谢你。"},
])

# 三年级语文 - 古诗、阅读、作文
new_questions.extend([
    {"topicId": "ct_YW3S029", "difficulty": "basic", "question": "'咏柳'的作者是（ ）", "options": ["贺知章", "李白", "杜甫", "白居易"], "answer": 0, "explanation": "咏柳作者是贺知章。"},
    {"topicId": "ct_YW3S029", "difficulty": "medium", "question": "'碧玉妆成一树高'的下一句是（ ）", "options": ["万条垂下绿丝绦", "不知细叶谁裁出", "二月春风似剪刀", "草长莺飞二月天"], "answer": 0, "explanation": "下一句是万条垂下绿丝绦。"},
    {"topicId": "ct_YW3S030", "difficulty": "basic", "question": "阅读理解时，首先要（ ）", "options": ["读题目", "看文章", "查字典", "做笔记"], "answer": 1, "explanation": "阅读理解要先看文章。"},
    {"topicId": "ct_YW3S030", "difficulty": "medium", "question": "文章的中心思想通常在（ ）", "options": ["开头或结尾", "中间", "题目", "注释"], "answer": 0, "explanation": "中心思想通常在开头或结尾。"},
    {"topicId": "ct_YW3S031", "difficulty": "basic", "question": "写记叙文的三要素是（ ）", "options": ["时间、地点、人物", "开头、中间、结尾", "原因、经过、结果", "总起、分述、总结"], "answer": 0, "explanation": "记叙文三要素是时间、地点、人物。"},
    {"topicId": "ct_YW3S031", "difficulty": "medium", "question": "作文中间部分应该写什么？", "options": ["时间地点", "事情的经过", "心情感受", "收获体会"], "answer": 1, "explanation": "中间部分写事情的经过。"},
])

# 四年级语文 - 古诗、阅读、作文
new_questions.extend([
    {"topicId": "ct_YW4S022", "difficulty": "basic", "question": "'望庐山瀑布'的作者是（ ）", "options": ["李白", "杜甫", "白居易", "王维"], "answer": 0, "explanation": "望庐山瀑布作者是李白。"},
    {"topicId": "ct_YW4S022", "difficulty": "medium", "question": "'飞流直下三千尺'的下一句是（ ）", "options": ["疑是银河落九天", "遥看瀑布挂前川", "日照香炉生紫烟", "不及汪伦送我情"], "answer": 0, "explanation": "下一句是疑是银河落九天。"},
    {"topicId": "ct_YW4S023", "difficulty": "basic", "question": "阅读理解时，遇到不理解的词语应该（ ）", "options": ["跳过", "查字典", "问同学", "猜意思"], "answer": 1, "explanation": "遇到不理解的词语查字典。"},
    {"topicId": "ct_YW4S023", "difficulty": "medium", "question": "文章的细节描写作用是（ ）", "options": ["使文章更生动", "使文章更短", "使文章更简单", "使文章更抽象"], "answer": 0, "explanation": "细节描写使文章更生动。"},
    {"topicId": "ct_YW4S024", "difficulty": "basic", "question": "写'我的妈妈'，下列哪个开头最吸引人？", "options": ["我的妈妈很漂亮", "我的妈妈有一双会说话的眼睛", "我的妈妈今年35岁", "我的妈妈很爱我"], "answer": 1, "explanation": "具体的细节描写更吸引人。"},
    {"topicId": "ct_YW4S024", "difficulty": "medium", "question": "作文结尾的作用是（ ）", "options": ["总结全文", "引出下文", "设置悬念", "描写环境"], "answer": 0, "explanation": "结尾总结全文。"},
])

# 五年级语文 - 说明文、阅读、作文
new_questions.extend([
    {"topicId": "ct_YW5S025", "difficulty": "basic", "question": "'鲸是哺乳动物'用了什么说明方法？", "options": ["举例子", "下定义", "打比方", "列数字"], "answer": 1, "explanation": "下定义是说明事物的本质特征。"},
    {"topicId": "ct_YW5S025", "difficulty": "medium", "question": "'赵州桥非常长，大约50多米'用了什么说明方法？", "options": ["作比较", "列数字", "打比方", "举例子"], "answer": 1, "explanation": "用数字说明，是列数字。"},
    {"topicId": "ct_YW5S026", "difficulty": "basic", "question": "说明文的语言特点是（ ）", "options": ["准确、严谨", "生动、形象", "抒情、优美", "幽默、风趣"], "answer": 0, "explanation": "说明文语言准确、严谨。"},
    {"topicId": "ct_YW5S026", "difficulty": "medium", "question": "说明文的顺序不包括（ ）", "options": ["时间顺序", "空间顺序", "逻辑顺序", "情感顺序"], "answer": 3, "explanation": "说明文没有情感顺序。"},
    {"topicId": "ct_YW5S027", "difficulty": "basic", "question": "缩写故事时，应该（ ）", "options": ["保留主要情节", "保留所有细节", "改变故事内容", "增加新情节"], "answer": 0, "explanation": "缩写要保留主要情节。"},
    {"topicId": "ct_YW5S027", "difficulty": "medium", "question": "缩写时，下列哪种句子应该删除？", "options": ["主要人物的对话", "次要人物的描写", "故事的起因", "故事的结果"], "answer": 1, "explanation": "次要人物的描写可以删减。"},
])

# 六年级语文 - 古诗、阅读、作文
new_questions.extend([
    {"topicId": "ct_YW6S025", "difficulty": "basic", "question": "'马诗'的作者是（ ）", "options": ["李贺", "李白", "杜甫", "白居易"], "answer": 0, "explanation": "马诗作者是李贺。"},
    {"topicId": "ct_YW6S025", "difficulty": "medium", "question": "'大漠沙如雪'的下一句是（ ）", "options": ["燕山月似钩", "何当金络脑", "快走踏清秋", "瑟瑟谷中风"], "answer": 0, "explanation": "下一句是燕山月似钩。"},
    {"topicId": "ct_YW6S026", "difficulty": "basic", "question": "阅读理解时，要关注文章的（ ）", "options": ["中心思想", "字数", "标点", "字体"], "answer": 0, "explanation": "阅读理解要关注中心思想。"},
    {"topicId": "ct_YW6S026", "difficulty": "medium", "question": "文章的表达方式不包括（ ）", "options": ["记叙", "描写", "说明", "书写"], "answer": 3, "explanation": "表达方式包括记叙、描写、说明、议论、抒情。"},
    {"topicId": "ct_YW6S027", "difficulty": "basic", "question": "倡议书的格式不包括（ ）", "options": ["标题", "称呼", "正文", "摘要"], "answer": 3, "explanation": "倡议书格式：标题、称呼、正文、结尾、署名、日期。"},
    {"topicId": "ct_YW6S027", "difficulty": "medium", "question": "倡议书正文应该写（ ）", "options": ["倡议的原因和内容", "个人感想", "故事", "诗歌"], "answer": 0, "explanation": "正文要写清倡议的原因和具体内容。"},
])

# ==================== 英语扩充 ====================

# 一年级英语 - 问候、颜色、数字
new_questions.extend([
    {"topicId": "ct_YY1S001", "difficulty": "basic", "question": "选出'hello'的中文意思", "options": ["再见", "你好", "谢谢", "对不起"], "answer": 1, "explanation": "hello是你好。"},
    {"topicId": "ct_YY1S001", "difficulty": "medium", "question": "选出'goodbye'的中文意思", "options": ["再见", "你好", "谢谢", "对不起"], "answer": 0, "explanation": "goodbye是再见。"},
    {"topicId": "ct_YY1S002", "difficulty": "basic", "question": "选出'How are you?'的正确回答", "options": ["I'm fine, thank you.", "My name is Tom.", "I am 9 years old.", "Goodbye!"], "answer": 0, "explanation": "How are you? 的正确回答是 I'm fine, thank you."},
    {"topicId": "ct_YY1S005", "difficulty": "basic", "question": "选出'red'的中文意思", "options": ["蓝色", "红色", "绿色", "黄色"], "answer": 1, "explanation": "red是红色。"},
    {"topicId": "ct_YY1S005", "difficulty": "medium", "question": "选出'blue'的中文意思", "options": ["蓝色", "红色", "绿色", "黄色"], "answer": 0, "explanation": "blue是蓝色。"},
    {"topicId": "ct_YY1S006", "difficulty": "basic", "question": "选出'one'的中文意思", "options": ["一", "二", "三", "四"], "answer": 0, "explanation": "one是一。"},
    {"topicId": "ct_YY1S006", "difficulty": "medium", "question": "选出'two'的中文意思", "options": ["一", "二", "三", "四"], "answer": 1, "explanation": "two是二。"},
])

# 二年级英语 - 自我介绍、学习用品
new_questions.extend([
    {"topicId": "ct_YY2S001", "difficulty": "basic", "question": "选出'name'的中文意思", "options": ["名字", "年龄", "学校", "班级"], "answer": 0, "explanation": "name是名字。"},
    {"topicId": "ct_YY2S001", "difficulty": "medium", "question": "选出'age'的中文意思", "options": ["名字", "年龄", "学校", "班级"], "answer": 1, "explanation": "age是年龄。"},
    {"topicId": "ct_YY2S002", "difficulty": "basic", "question": "选出'school'的中文意思", "options": ["家", "学校", "公园", "商店"], "answer": 1, "explanation": "school是学校。"},
    {"topicId": "ct_YY2S002", "difficulty": "medium", "question": "选出'classroom'的中文意思", "options": ["教室", "操场", "图书馆", "食堂"], "answer": 0, "explanation": "classroom是教室。"},
    {"topicId": "ct_YY2S003", "difficulty": "basic", "question": "选出'pencil'的中文意思", "options": ["铅笔", "钢笔", "尺子", "橡皮"], "answer": 0, "explanation": "pencil是铅笔。"},
    {"topicId": "ct_YY2S003", "difficulty": "medium", "question": "选出'ruler'的中文意思", "options": ["铅笔", "钢笔", "尺子", "橡皮"], "answer": 2, "explanation": "ruler是尺子。"},
])

# 三年级英语 - 数字、颜色、动物、食物
new_questions.extend([
    {"topicId": "ct_YY3S003", "difficulty": "basic", "question": "选出'five'的中文意思", "options": ["三", "四", "五", "六"], "answer": 2, "explanation": "five是五。"},
    {"topicId": "ct_YY3S003", "difficulty": "medium", "question": "选出'nine'的中文意思", "options": ["七", "八", "九", "十"], "answer": 2, "explanation": "nine是九。"},
    {"topicId": "ct_YY3S004", "difficulty": "basic", "question": "选出'blue'的中文意思", "options": ["蓝色", "红色", "绿色", "黄色"], "answer": 0, "explanation": "blue是蓝色。"},
    {"topicId": "ct_YY3S004", "difficulty": "medium", "question": "选出'green'的中文意思", "options": ["蓝色", "红色", "绿色", "黄色"], "answer": 2, "explanation": "green是绿色。"},
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
])

# 六年级英语 - 旅行、计划、节日
new_questions.extend([
    {"topicId": "ct_YY6S002", "difficulty": "basic", "question": "选出'travel'的中文意思", "options": ["学习", "工作", "旅行", "休息"], "answer": 2, "explanation": "travel是旅行。"},
    {"topicId": "ct_YY6S002", "difficulty": "medium", "question": "选出'summer holiday'的中文意思", "options": ["寒假", "暑假", "春假", "秋假"], "answer": 1, "explanation": "summer holiday是暑假。"},
    {"topicId": "ct_YY6S003", "difficulty": "basic", "question": "选出'plan'的中文意思", "options": ["计划", "结果", "过程", "目标"], "answer": 0, "explanation": "plan是计划。"},
    {"topicId": "ct_YY6S003", "difficulty": "medium", "question": "选出'goal'的中文意思", "options": ["计划", "结果", "过程", "目标"], "answer": 3, "explanation": "goal是目标。"},
    {"topicId": "ct_YY6S004", "difficulty": "basic", "question": "选出'Spring Festival'的中文意思", "options": ["春节", "中秋节", "端午节", "元宵节"], "answer": 0, "explanation": "Spring Festival是春节。"},
    {"topicId": "ct_YY6S004", "difficulty": "medium", "question": "选出'Mid-Autumn Festival'的中文意思", "options": ["春节", "中秋节", "端午节", "元宵节"], "answer": 1, "explanation": "Mid-Autumn Festival是中秋节。"},
])

# ==================== 科学扩充 ====================

# 一年级科学 - 观察、比较、分类
new_questions.extend([
    {"topicId": "ct_KX1S001", "difficulty": "basic", "question": "观察时，要用（ ）", "options": ["眼睛看", "耳朵听", "鼻子闻", "以上都要"], "answer": 3, "explanation": "观察要动用多种感官。"},
    {"topicId": "ct_KX1S001", "difficulty": "medium", "question": "观察时，要按照（ ）顺序", "options": ["从上到下", "从下到上", "从左到右", "以上都可以"], "answer": 3, "explanation": "观察可以按不同顺序。"},
    {"topicId": "ct_KX1S002", "difficulty": "basic", "question": "比较两个物体，可以从（ ）方面比较", "options": ["大小", "颜色", "形状", "以上都可以"], "answer": 3, "explanation": "比较可以从多个方面。"},
    {"topicId": "ct_KX1S003", "difficulty": "basic", "question": "把物品分类，可以按（ ）分类", "options": ["颜色", "形状", "大小", "以上都可以"], "answer": 3, "explanation": "分类可以按不同标准。"},
])

# 二年级科学 - 植物、动物、天气
new_questions.extend([
    {"topicId": "ct_KX2S001", "difficulty": "basic", "question": "植物有哪些部分？", "options": ["根、茎、叶", "只有叶", "只有根", "只有茎"], "answer": 0, "explanation": "植物有根、茎、叶。"},
    {"topicId": "ct_KX2S001", "difficulty": "medium", "question": "植物的根有什么作用？", "options": ["吸收水分", "制造养分", "繁殖", "光合作用"], "answer": 0, "explanation": "根吸收水分。"},
    {"topicId": "ct_KX2S002", "difficulty": "basic", "question": "下面哪种动物是哺乳动物？", "options": ["鸡", "鱼", "猫", "青蛙"], "answer": 2, "explanation": "猫是哺乳动物。"},
    {"topicId": "ct_KX2S002", "difficulty": "medium", "question": "下面哪种动物是鸟类？", "options": ["鸡", "鱼", "猫", "青蛙"], "answer": 0, "explanation": "鸡是鸟类。"},
    {"topicId": "ct_KX2S003", "difficulty": "basic", "question": "天气现象不包括（ ）", "options": ["晴", "雨", "雪", "学习"], "answer": 3, "explanation": "学习不是天气现象。"},
])

# 三年级科学 - 磁铁、电、岩石、土壤
new_questions.extend([
    {"topicId": "ct_KX3S030", "difficulty": "basic", "question": "磁铁能吸住下面哪种物体？", "options": ["塑料", "铁", "木头", "纸"], "answer": 1, "explanation": "磁铁能吸住铁。"},
    {"topicId": "ct_KX3S030", "difficulty": "medium", "question": "磁铁有几个磁极？", "options": ["1个", "2个", "3个", "4个"], "answer": 1, "explanation": "磁铁有2个磁极。"},
    {"topicId": "ct_KX3S031", "difficulty": "basic", "question": "下面哪种物体能导电？", "options": ["塑料", "橡胶", "铜线", "木头"], "answer": 2, "explanation": "铜线能导电。"},
    {"topicId": "ct_KX3S032", "difficulty": "basic", "question": "测量气温用什么工具？", "options": ["尺子", "温度计", "天平", "量筒"], "answer": 1, "explanation": "测量气温用温度计。"},
    {"topicId": "ct_KX3S033", "difficulty": "basic", "question": "测量长度用什么工具？", "options": ["尺子", "温度计", "天平", "量筒"], "answer": 0, "explanation": "测量长度用尺子。"},
])

# 四年级科学 - 天气、植物生长、动物生命周期
new_questions.extend([
    {"topicId": "ct_KX4S010", "difficulty": "basic", "question": "测量气温用什么工具？", "options": ["尺子", "温度计", "天平", "量筒"], "answer": 1, "explanation": "测量气温用温度计。"},
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
    "version": "v1.7-diagnostic",
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
