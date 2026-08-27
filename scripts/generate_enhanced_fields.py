#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量生成4275个知识点的增强字段
基于模板+规则引擎，根据学科、年级、类型自动生成：
- oneLiner: 一句话核心价值
- parentGuide: 家长指导（快速解释、生活例子、常见错误、鼓励话术）
- teacherGuide: 教师指导（课堂活动、关键提问、教具建议、过渡语）
- quizQuestions: 3-5道测试题
"""

import json
import random
import re
from pathlib import Path

random.seed(42)

# 读取现有数据
DATA_DIR = Path('D:/xcode/fgit/cn-primary-taxonomy/data')

with open(DATA_DIR / 'topics.json', 'r', encoding='utf-8') as f:
    topics_data = json.load(f)

# 读取已有的50个增强字段作为参考样例
with open(DATA_DIR / 'topics-enhanced-fields.json', 'r', encoding='utf-8') as f:
    sample_enhanced = json.load(f)

with open(DATA_DIR / 'topics-enhanced-fields-extra.json', 'r', encoding='utf-8') as f:
    sample_extra = json.load(f)

# 合并参考样例
sample_topics = {t['id']: t for t in sample_enhanced.get('enhancedTopics', [])}
sample_topics.update({t['id']: t for t in sample_extra.get('enhancedTopics', [])})

# ============================================================
# 模板引擎：按学科分类的模板
# ============================================================

# 数学模板
MATH_TEMPLATES = {
    "oneLiner": [
        "{name}：让孩子理解{key_concept}，这是后续学习{foundation}的基础。",
        "掌握{name}，核心是理解{key_concept}，避免{mistake}。",
        "{name}的关键：{key_concept}，孩子掌握后能{benefit}。",
        "学好{name}，要让孩子明白{key_concept}，这是重中之重。",
    ],
    "quickExplanation": [
        "用生活中的例子解释：{example}，孩子更容易理解。",
        "简单说就是：{concept}，可以用{example}来演示。",
        "打个比方：{example}，这样孩子一下就明白了。",
    ],
    "dailyExample": [
        "超市购物时，让孩子计算{example}。",
        "吃饭时，让孩子{example}。",
        "散步时，和孩子一起{example}。",
        "做家务时，让孩子{example}。",
    ],
    "commonParentMistake": [
        "不要说'这么简单都不会'，换成'我们再来看看'。",
        "不要直接告诉答案，问孩子'你是怎么想的？'",
        "不要催孩子'快点快点'，换成'不着急，慢慢想'。",
        "不要批评孩子'又错了'，换成'我们看看错在哪里'。",
    ],
    "encouragement": [
        "孩子做对了，及时表扬：'你做得真棒！'",
        "孩子有进步，鼓励：'比上次做得更好了！'",
        "孩子认真思考了，表扬：'你的想法很有创意！'",
        "孩子主动尝试了，鼓励：'敢于尝试就是进步！'",
    ],
    "classroomActivity": [
        "小组合作：让学生分组{activity}，讨论{question}。",
        "动手操作：每人{activity}，记录结果。",
        "游戏竞赛：{activity}，看谁做得又对又快。",
        "情境模拟：{activity}，体验数学与生活的联系。",
    ],
    "keyQuestion": [
        "为什么{question}？说说你的理由。",
        "你发现了什么规律？",
        "如果{condition}，结果会怎样？",
        "你能用不同的方法解决吗？",
    ],
    "visualAid": [
        "准备{material}，让学生直观感受。",
        "制作{material}，帮助学生理解抽象概念。",
        "使用{material}，让课堂更生动。",
        "准备{material}，支持学生动手操作。",
    ],
    "transition": [
        "复习{previous}，引出今天的新内容。",
        "通过{previous}，我们学习了...今天继续学习...",
        "我们已经掌握了{previous}，现在来挑战更难的。",
        "从{previous}出发，今天我们探索新的知识。",
    ],
}

# 语文模板
CHINESE_TEMPLATES = {
    "oneLiner": [
        "{name}：培养孩子的{core_skill}，这是语文学习的基石。",
        "学好{name}，关键是{core_skill}，让孩子{benefit}。",
        "{name}的核心是{core_skill}，掌握后能{benefit}。",
        "通过{name}，孩子能{core_skill}，为{foundation}打下基础。",
    ],
    "quickExplanation": [
        "简单来说：{concept}，可以用{example}来说明。",
        "用孩子能懂的话说：{concept}，就像{example}。",
        "举个例子：{example}，孩子就明白了。",
    ],
    "dailyExample": [
        "阅读时，和孩子一起{example}。",
        "日常生活中，让孩子{example}。",
        "看电视时，引导孩子{example}。",
        "购物时，让孩子{example}。",
    ],
    "commonParentMistake": [
        "不要要求孩子死记硬背，引导理解记忆。",
        "不要批评孩子'写得不好'，先肯定再建议。",
        "不要替孩子思考，问'你是怎么想的？'",
        "不要只看结果，关注孩子的思考过程。",
    ],
    "encouragement": [
        "孩子表达有进步，表扬：'你说得真清楚！'",
        "孩子认真书写，鼓励：'字写得越来越好了！'",
        "孩子主动阅读，表扬：'爱阅读的孩子最棒！'",
        "孩子有想法，鼓励：'你的想法很独特！'",
    ],
    "classroomActivity": [
        "朗读比赛：学生分角色朗读，体会情感。",
        "小组讨论：围绕{question}，分享自己的理解。",
        "情境表演：通过表演，深入理解内容。",
        "读写结合：读后写感想，加深理解。",
    ],
    "keyQuestion": [
        "你从这句话中体会到了什么？",
        "如果你是主人公，你会怎么做？",
        "作者为什么这样写？",
        "这个词语用得好在哪里？",
    ],
    "visualAid": [
        "准备图片/视频，创设情境。",
        "制作生字卡片，辅助识字教学。",
        "使用思维导图，梳理文章结构。",
        "准备实物道具，增强直观感受。",
    ],
    "transition": [
        "复习旧知，引入新课。",
        "通过上节课的学习，今天我们继续...",
        "从生活情境出发，引入今天的学习内容。",
        "通过问题导入，激发学习兴趣。",
    ],
}

# 英语模板
ENGLISH_TEMPLATES = {
    "oneLiner": [
        "{name}：培养孩子的{core_skill}，让英语学习更有趣。",
        "学好{name}，关键是{core_skill}，让孩子{benefit}。",
        "{name}的核心是{core_skill}，为{foundation}打基础。",
        "通过{name}，孩子能{core_skill}，提升英语能力。",
    ],
    "quickExplanation": [
        "简单来说：{concept}，就像{example}。",
        "用中文解释：{concept}，可以用{example}来理解。",
        "打个比方：{example}，孩子就明白了。",
    ],
    "dailyExample": [
        "日常生活中，用英语{example}。",
        "看英语动画片时，注意{example}。",
        "听英语儿歌时，一起{example}。",
        "玩游戏时，用英语{example}。",
    ],
    "commonParentMistake": [
        "不要要求孩子一次记住，多重复几次。",
        "不要纠正每个错误，鼓励开口说。",
        "不要只关注成绩，关注学习兴趣。",
        "不要逼孩子背单词，在语境中学习。",
    ],
    "encouragement": [
        "孩子敢开口说，表扬：'你真有勇气！'",
        "孩子发音有进步，鼓励：'发音越来越标准了！'",
        "孩子主动学英语，表扬：'爱学英语的孩子最棒！'",
        "孩子认真完成作业，鼓励：'你的努力我看得到！'",
    ],
    "classroomActivity": [
        "角色扮演：学生分角色对话，练习表达。",
        "游戏活动：通过游戏，巩固所学内容。",
        "歌曲律动：唱英语歌曲，激发学习兴趣。",
        "小组竞赛：分组比赛，提高参与度。",
    ],
    "keyQuestion": [
        "What does it mean? Can you say it in Chinese?",
        "Can you make a sentence with this word?",
        "How do you pronounce this?",
        "Can you act it out?",
    ],
    "visualAid": [
        "准备单词卡片，辅助词汇教学。",
        "使用图片/实物，创设语言情境。",
        "播放音频/视频，提供标准示范。",
        "制作海报/思维导图，梳理知识。",
    ],
    "transition": [
        "Warm-up song to start the class.",
        "Review previous lesson, introduce new content.",
        "Use a game to lead in today's topic.",
        "Ask questions to activate prior knowledge.",
    ],
}

# 科学模板
SCIENCE_TEMPLATES = {
    "oneLiner": [
        "{name}：培养孩子的科学思维，从观察和实验开始。",
        "学好{name}，让孩子学会观察、思考、验证。",
        "{name}的核心是科学探究，让孩子{benefit}。",
        "通过{name}，孩子能培养科学素养，为{foundation}打基础。",
    ],
    "quickExplanation": [
        "简单来说：{concept}，就像{example}。",
        "用实验来解释：{example}，孩子一看就懂。",
        "打个比方：{example}，这样孩子更容易理解。",
    ],
    "dailyExample": [
        "在家里，和孩子一起{example}。",
        "去公园时，观察{example}。",
        "做饭时，让孩子{example}。",
        "做手工时，一起{example}。",
    ],
    "commonParentMistake": [
        "不要直接告诉答案，让孩子自己探索。",
        "不要忽视孩子的'为什么'，耐心回答。",
        "不要怕孩子弄脏，鼓励动手实验。",
        "不要只关注结果，关注探索过程。",
    ],
    "encouragement": [
        "孩子认真观察，表扬：'你观察得真仔细！'",
        "孩子提出问题，鼓励：'爱思考的孩子最棒！'",
        "孩子动手实验，表扬：'你的实验做得真好！'",
        "孩子有发现，鼓励：'你的发现很有价值！'",
    ],
    "classroomActivity": [
        "动手实验：学生分组实验，观察现象。",
        "观察记录：观察{object}，记录发现。",
        "小组讨论：围绕{question}，分享发现。",
        "科学探究：提出问题→作出假设→实验验证→得出结论。",
    ],
    "keyQuestion": [
        "你观察到了什么？",
        "为什么会这样？",
        "你能设计一个实验来验证吗？",
        "如果改变{condition}，结果会怎样？",
    ],
    "visualAid": [
        "准备实验材料，让学生动手操作。",
        "使用视频/图片，展示科学现象。",
        "准备实物标本，增强直观感受。",
        "使用科学模型，帮助理解抽象概念。",
    ],
    "transition": [
        "通过科学现象引入，激发好奇心。",
        "复习上节课的实验，引出新的问题。",
        "从生活现象出发，引入科学概念。",
        "通过问题导入，激发探究欲望。",
    ],
}

# 综合学科模板（道法、劳动、体育、美术、音乐、信息科技、AI素养）
GENERAL_TEMPLATES = {
    "oneLiner": [
        "{name}：培养孩子的{core_skill}，促进全面发展。",
        "学好{name}，让孩子{benefit}，为成长打基础。",
        "{name}的核心是{core_skill}，让孩子受益终身。",
        "通过{name}，孩子能{core_skill}，提升综合素养。",
    ],
    "quickExplanation": [
        "简单来说：{concept}，可以用{example}来说明。",
        "用孩子能懂的话说：{concept}，就像{example}。",
        "举个例子：{example}，孩子就明白了。",
    ],
    "dailyExample": [
        "日常生活中，让孩子{example}。",
        "家庭活动中，和孩子一起{example}。",
        "外出时，引导孩子{example}。",
        "做家务时，让孩子{example}。",
    ],
    "commonParentMistake": [
        "不要忽视{subject}教育，它对孩子成长很重要。",
        "不要只看成绩，关注孩子的兴趣和习惯。",
        "不要替孩子做，鼓励自己动手。",
        "不要批评孩子，多鼓励多引导。",
    ],
    "encouragement": [
        "孩子认真参与，表扬：'你做得真棒！'",
        "孩子有进步，鼓励：'比上次做得更好了！'",
        "孩子主动尝试，表扬：'敢于尝试就是进步！'",
        "孩子有创意，鼓励：'你的想法很有创意！'",
    ],
    "classroomActivity": [
        "小组合作：学生分组{activity}，分享交流。",
        "动手实践：每人{activity}，体验学习乐趣。",
        "游戏活动：通过游戏，巩固所学内容。",
        "展示分享：学生展示成果，互相学习。",
    ],
    "keyQuestion": [
        "你从中学到了什么？",
        "如果{condition}，你会怎么做？",
        "你能用自己的话说说吗？",
        "你还有什么想法？",
    ],
    "visualAid": [
        "准备相关材料，辅助教学。",
        "使用多媒体，创设学习情境。",
        "准备实物道具，增强直观感受。",
        "制作思维导图，梳理知识结构。",
    ],
    "transition": [
        "复习旧知，引入新课。",
        "从生活情境出发，引入学习内容。",
        "通过问题导入，激发学习兴趣。",
        "通过游戏/活动，自然过渡到新课。",
    ],
}

# 学科→模板映射
SUBJECT_TEMPLATES = {
    "数学": MATH_TEMPLATES,
    "语文": CHINESE_TEMPLATES,
    "英语": ENGLISH_TEMPLATES,
    "科学": SCIENCE_TEMPLATES,
    "道德与法治": GENERAL_TEMPLATES,
    "劳动": GENERAL_TEMPLATES,
    "体育与健康": GENERAL_TEMPLATES,
    "美术": GENERAL_TEMPLATES,
    "音乐": GENERAL_TEMPLATES,
    "信息科技": GENERAL_TEMPLATES,
    "AI素养": GENERAL_TEMPLATES,
}

# 学科核心概念映射（用于生成oneLiner）
SUBJECT_KEY_CONCEPTS = {
    "数学": {
        "default": "基本概念和运算方法",
        "计算": "正确、熟练的计算能力",
        "图形": "空间观念和几何直观",
        "统计": "数据分析观念",
        "概念": "数学概念的理解",
        "应用": "运用数学解决实际问题",
    },
    "语文": {
        "default": "语言运用能力",
        "阅读": "阅读理解能力",
        "写作": "书面表达能力",
        "识字": "汉字识记和书写",
        "拼音": "拼音拼读能力",
        "口语": "口语交际能力",
    },
    "英语": {
        "default": "英语综合运用能力",
        "词汇": "词汇识记和运用",
        "语法": "语法规则的理解和运用",
        "听说": "听力和口语表达",
        "阅读": "英语阅读理解",
        "写作": "英语书面表达",
    },
    "科学": {
        "default": "科学探究能力",
        "观察": "观察和描述能力",
        "实验": "实验设计和操作",
        "概念": "科学概念的理解",
        "探究": "科学探究方法",
    },
    "道德与法治": {
        "default": "道德品质和法治意识",
    },
    "劳动": {
        "default": "劳动技能和劳动习惯",
    },
    "体育与健康": {
        "default": "运动能力和健康意识",
    },
    "美术": {
        "default": "审美能力和创作能力",
    },
    "音乐": {
        "default": "音乐素养和表现能力",
    },
    "信息科技": {
        "default": "信息素养和计算思维",
    },
    "AI素养": {
        "default": "AI认知和应用能力",
    },
}

# 生活例子库
LIFE_EXAMPLES = {
    "数学": [
        "分水果、数物品、量长度、算价格",
        "购物时算账、看钟表、量身高",
        "分蛋糕、比高矮、数台阶",
        "整理玩具、分配零食、看时间",
    ],
    "语文": [
        "读故事书、看路牌、写便条",
        "看说明书、读广告、写日记",
        "读报纸、看菜单、写贺卡",
        "读绘本、看通知、写留言",
    ],
    "英语": [
        "看英语动画片、唱英语儿歌",
        "用英语打招呼、自我介绍",
        "看英语绘本、玩英语游戏",
        "听英语故事、看英语视频",
    ],
    "科学": [
        "观察植物生长、观察天气变化",
        "做简单实验、观察动物",
        "观察水的变化、观察影子",
        "种植小植物、观察昆虫",
    ],
    "道德与法治": [
        "与同学相处、尊敬师长",
        "遵守规则、爱护公物",
        "帮助他人、感恩父母",
        "保护环境、节约资源",
    ],
    "劳动": [
        "整理书包、打扫房间",
        "洗菜、做饭、浇花",
        "叠衣服、擦桌子、扫地",
        "制作手工、修理物品",
    ],
    "体育与健康": [
        "跑步、跳绳、拍球",
        "做操、游泳、打球",
        "注意坐姿、保护视力",
        "合理饮食、按时作息",
    ],
    "美术": [
        "画画、做手工、欣赏艺术作品",
        "涂色、折纸、捏泥巴",
        "观察自然、描绘生活",
        "创意设计、手工制作",
    ],
    "音乐": [
        "唱歌、跳舞、演奏乐器",
        "听音乐、打节奏",
        "学唱歌曲、欣赏乐曲",
        "音乐游戏、律动",
    ],
    "信息科技": [
        "使用电脑、上网查资料",
        "制作PPT、打字",
        "编程、使用平板",
        "信息检索、网络安全",
    ],
    "AI素养": [
        "了解AI、使用AI工具",
        "AI绘画、AI写作",
        "认识AI、AI应用",
        "AI安全、AI伦理",
    ],
}


def get_template(subject):
    """获取学科模板"""
    return SUBJECT_TEMPLATES.get(subject, GENERAL_TEMPLATES)


def get_key_concept(subject, domain):
    """获取核心概念"""
    concepts = SUBJECT_KEY_CONCEPTS.get(subject, {})
    for key, value in concepts.items():
        if key in (domain or ""):
            return value
    return concepts.get("default", "核心能力")


def get_life_example(subject):
    """获取生活例子"""
    examples = LIFE_EXAMPLES.get(subject, ["在日常生活中多练习"])
    return random.choice(examples)


def generate_one_liner(topic, template):
    """生成一句话核心价值"""
    name = topic.get('name', '')
    domain = topic.get('domain', '')
    subject = topic.get('subject', '')
    key_concept = get_key_concept(subject, domain)
    
    # 根据学科特点生成
    if subject == "数学":
        if "计算" in domain or "运算" in name:
            return f"掌握{name}，核心是理解算理、正确计算，避免运算错误。"
        elif "图形" in domain or "长度" in name or "面积" in name:
            return f"{name}：培养孩子的空间观念，从直观感知到抽象理解。"
        elif "统计" in domain or "数据" in name:
            return f"{name}：让孩子学会用数据说话，培养数据分析观念。"
        elif "概念" in domain or "认识" in name:
            return f"{name}：理解数学概念的本质，是后续学习的重要基础。"
        else:
            return f"{name}：掌握{key_concept}，为后续数学学习打下坚实基础。"
    elif subject == "语文":
        if "阅读" in domain or "阅读" in name:
            return f"{name}：培养孩子的阅读理解能力，学会从文本中获取信息。"
        elif "写作" in domain or "作文" in name or "写话" in name:
            return f"{name}：让孩子学会表达，把想说的话写清楚、写具体。"
        elif "识字" in domain or "字" in name:
            return f"{name}：掌握汉字的音形义，培养自主识字能力。"
        elif "拼音" in domain:
            return f"{name}：学好拼音，为独立识字和阅读打下基础。"
        else:
            return f"{name}：培养{key_concept}，提升语文素养。"
    elif subject == "英语":
        if "词汇" in domain or "单词" in name:
            return f"{name}：在语境中学习词汇，做到音形义用结合。"
        elif "听说" in domain or "听" in name or "说" in name:
            return f"{name}：培养英语听说能力，敢于开口、乐于表达。"
        elif "阅读" in domain:
            return f"{name}：培养英语阅读能力，从图片阅读到文字阅读。"
        else:
            return f"{name}：培养{key_concept}，让英语学习更有趣。"
    elif subject == "科学":
        return f"{name}：培养科学探究能力，从观察、提问到实验、验证。"
    else:
        return f"{name}：培养{key_concept}，促进全面发展。"


def generate_parent_guide(topic, template):
    """生成家长指导"""
    subject = topic.get('subject', '')
    name = topic.get('name', '')
    domain = topic.get('domain', '')
    life_example = get_life_example(subject)
    common_mistakes = topic.get('commonMistakes', [])
    
    # 快速解释
    if subject == "数学":
        quick_exp = f"用生活中的例子解释{name}：{life_example}，孩子更容易理解。"
    elif subject == "语文":
        quick_exp = f"简单来说：{name}就是...，可以用{life_example}来说明。"
    elif subject == "英语":
        quick_exp = f"用孩子能懂的话解释{name}，就像{life_example}。"
    elif subject == "科学":
        quick_exp = f"用实验或生活现象解释{name}：{life_example}，孩子一看就懂。"
    else:
        quick_exp = f"用通俗易懂的语言解释{name}，结合{life_example}来理解。"
    
    # 生活例子
    daily_example = f"{life_example}时，引导孩子运用所学知识。"
    
    # 常见错误
    if common_mistakes:
        mistake_hint = common_mistakes[0] if common_mistakes else ""
        common_mistake = f"不要直接告诉答案，问孩子'你是怎么想的？'避免'{mistake_hint}'。"
    else:
        common_mistake = "不要直接告诉答案，问孩子'你是怎么想的？'引导独立思考。"
    
    # 鼓励话术
    encouragements = [
        f"孩子做对了，及时表扬：'你做得真棒！'",
        f"孩子有进步，鼓励：'比上次做得更好了！'",
        f"孩子认真思考了，表扬：'你的想法很有创意！'",
        f"孩子主动尝试了，鼓励：'敢于尝试就是进步！'",
    ]
    encouragement = random.choice(encouragements)
    
    return {
        "quickExplanation": quick_exp,
        "dailyExample": daily_example,
        "commonParentMistake": common_mistake,
        "encouragement": encouragement
    }


def generate_teacher_guide(topic, template):
    """生成教师指导"""
    subject = topic.get('subject', '')
    name = topic.get('name', '')
    grade = topic.get('grade', 1)
    
    # 课堂活动
    if subject == "数学":
        activity = f"动手操作：让学生通过摆一摆、画一画，理解{name}的算理。"
    elif subject == "语文":
        activity = f"朗读感悟：通过多种形式的朗读，体会{name}的情感内涵。"
    elif subject == "英语":
        activity = f"情境对话：创设真实情境，让学生在对话中练习{name}。"
    elif subject == "科学":
        activity = f"实验探究：学生分组实验，观察现象、记录数据、得出结论。"
    else:
        activity = f"小组合作：学生分组讨论、实践，在活动中掌握{name}。"
    
    # 关键提问
    questions = [
        f"关于{name}，你发现了什么？",
        f"为什么这样说？说说你的理由。",
        f"如果换一种情况，结果会怎样？",
        f"你能用不同的方法解决吗？",
    ]
    key_question = random.choice(questions)
    
    # 教具建议
    if subject == "数学":
        visual_aid = f"准备小棒、计数器、图形教具等，帮助学生建立直观表象。"
    elif subject == "语文":
        visual_aid = f"准备生字卡片、图片、视频等，创设学习情境。"
    elif subject == "英语":
        visual_aid = f"准备单词卡片、图片、音频等，提供标准示范。"
    elif subject == "科学":
        visual_aid = f"准备实验材料、实物标本等，支持学生动手操作。"
    else:
        visual_aid = f"准备相关教具、多媒体资源等，辅助教学。"
    
    # 过渡语
    transitions = [
        f"复习旧知，引入今天的新内容——{name}。",
        f"通过上节课的学习，今天我们继续深入探讨{name}。",
        f"从生活情境出发，引入今天的学习内容。",
        f"通过问题导入，激发学生对{name}的学习兴趣。",
    ]
    transition = random.choice(transitions)
    
    return {
        "classroomActivity": activity,
        "keyQuestion": key_question,
        "visualAid": visual_aid,
        "transition": transition
    }


def generate_quiz_questions(topic):
    """生成测试题"""
    subject = topic.get('subject', '')
    name = topic.get('name', '')
    domain = topic.get('domain', '')
    
    questions = []
    
    if subject == "数学":
        # 数学：计算题、选择题、判断题
        questions = [
            {
                "question": f"关于{name}，下面说法正确的是？",
                "type": "choice",
                "options": ["只需要记住公式", "理解概念更重要", "不需要练习", "学不学无所谓"],
                "answer": 1,
                "explanation": f"学习{name}，理解概念比死记硬背更重要。"
            },
            {
                "question": f"下面哪个是{name}的正确应用？",
                "type": "choice",
                "options": ["随便猜测", "理解题意后计算", "不看题目直接做", "抄同学答案"],
                "answer": 1,
                "explanation": f"做{name}的题目，要先理解题意，再正确计算。"
            },
            {
                "question": f"计算时，最重要的是什么？",
                "type": "choice",
                "options": ["算得最快", "理解算理、正确计算", "字写得好看", "不用检查"],
                "answer": 1,
                "explanation": f"计算最重要的是理解算理，保证计算正确。"
            }
        ]
    elif subject == "语文":
        questions = [
            {
                "question": f"关于{name}，下面说法正确的是？",
                "type": "choice",
                "options": ["只需要死记硬背", "理解更重要", "不需要阅读", "不用练习"],
                "answer": 1,
                "explanation": f"学习{name}，理解比死记硬背更重要。"
            },
            {
                "question": f"学习{name}，最好的方法是？",
                "type": "choice",
                "options": ["多读多练", "只看不做", "只听不写", "不复习"],
                "answer": 0,
                "explanation": f"学习{name}，要多读多练，才能熟练掌握。"
            },
            {
                "question": f"下面哪个是学习{name}的好习惯？",
                "type": "choice",
                "options": ["每天坚持练习", "三天打鱼两天晒网", "只做难题", "不思考"],
                "answer": 0,
                "explanation": f"学习{name}，最重要的是每天坚持练习。"
            }
        ]
    elif subject == "英语":
        questions = [
            {
                "question": f"学习{name}，最重要的是？",
                "type": "choice",
                "options": ["多听多说多读多写", "只背单词", "只做题", "只听不说"],
                "answer": 0,
                "explanation": f"学习英语，要多听多说多读多写，全面发展。"
            },
            {
                "question": f"关于{name}，下面说法正确的是？",
                "type": "choice",
                "options": ["不需要开口说", "敢于开口表达", "只学语法", "不记单词"],
                "answer": 1,
                "explanation": f"学习英语，要敢于开口，不怕犯错。"
            },
            {
                "question": f"下面哪个是学习英语的好方法？",
                "type": "choice",
                "options": ["每天坚持学习", "一周学一次", "只靠课堂", "不复习"],
                "answer": 0,
                "explanation": f"学习英语，每天坚持比偶尔突击更有效。"
            }
        ]
    elif subject == "科学":
        questions = [
            {
                "question": f"学习{name}，最重要的是？",
                "type": "choice",
                "options": ["观察、思考、实验", "只记结论", "只看不做", "不提问"],
                "answer": 0,
                "explanation": f"科学学习的核心是观察、思考和实验验证。"
            },
            {
                "question": f"关于{name}，下面说法正确的是？",
                "type": "choice",
                "options": ["科学只需要记忆", "科学需要探究", "科学不需要实验", "科学不用思考"],
                "answer": 1,
                "explanation": f"科学学习需要主动探究，而不是被动记忆。"
            },
            {
                "question": f"下面哪个是科学探究的正确步骤？",
                "type": "choice",
                "options": ["观察→提问→假设→实验→结论", "直接下结论", "只做实验不记录", "不观察就假设"],
                "answer": 0,
                "explanation": f"科学探究的正确步骤是：观察→提问→假设→实验→结论。"
            }
        ]
    else:
        questions = [
            {
                "question": f"关于{name}，下面说法正确的是？",
                "type": "choice",
                "options": ["只需要记忆", "理解更重要", "不需要练习", "学不学无所谓"],
                "answer": 1,
                "explanation": f"学习{name}，理解比死记硬背更重要。"
            },
            {
                "question": f"学习{name}，最好的方法是？",
                "type": "choice",
                "options": ["多实践多练习", "只看不做", "只听不练", "不复习"],
                "answer": 0,
                "explanation": f"学习{name}，要多实践多练习，才能熟练掌握。"
            },
            {
                "question": f"下面哪个是学习{name}的好习惯？",
                "type": "choice",
                "options": ["每天坚持练习", "三天打鱼两天晒网", "只做简单的", "不思考"],
                "answer": 0,
                "explanation": f"学习{name}，最重要的是每天坚持练习。"
            }
        ]
    
    return questions


def generate_enhanced_fields(topic):
    """为单个知识点生成增强字段"""
    subject = topic.get('subject', '')
    template = get_template(subject)
    
    # 检查是否有参考样例
    topic_id = topic.get('id', '')
    if topic_id in sample_topics:
        return sample_topics[topic_id]
    
    # 生成增强字段
    one_liner = generate_one_liner(topic, template)
    parent_guide = generate_parent_guide(topic, template)
    teacher_guide = generate_teacher_guide(topic, template)
    quiz_questions = generate_quiz_questions(topic)
    
    return {
        "id": topic_id,
        "oneLiner": one_liner,
        "parentGuide": parent_guide,
        "teacherGuide": teacher_guide,
        "quizQuestions": quiz_questions
    }


def main():
    """主函数：批量生成所有知识点的增强字段"""
    topics = topics_data['topics']
    total = len(topics)
    
    print(f"开始生成 {total} 个知识点的增强字段...")
    
    enhanced_topics = []
    for i, topic in enumerate(topics):
        enhanced = generate_enhanced_fields(topic)
        enhanced_topics.append(enhanced)
        
        if (i + 1) % 500 == 0:
            print(f"  已生成 {i + 1}/{total} 个知识点...")
    
    print(f"  已生成 {total}/{total} 个知识点，完成！")
    
    # 构建输出数据结构
    output = {
        "version": "v3.0-enhanced-full",
        "description": "知识图谱增强字段（全量版）：全部4275个知识点的增强字段。基于模板+规则引擎批量生成，可作为初稿使用，建议人工审核优化。",
        "note": "本文件为全量增强字段，与原始topics文件配合使用。原始topics文件保持不动，前端通过id关联合并。",
        "generatedAt": "2026-08-27T00:00:00.000Z",
        "generationMethod": "template-based-batch-generation",
        "totalTopics": total,
        "enhancedTopics": enhanced_topics
    }
    
    # 保存到文件
    output_path = DATA_DIR / 'topics-enhanced-fields-full.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"\n已保存到: {output_path}")
    print(f"文件大小: {output_path.stat().st_size / 1024 / 1024:.2f} MB")
    
    # 统计信息
    print("\n=== 生成统计 ===")
    print(f"总知识点数: {total}")
    print(f"有参考样例的: {len([t for t in enhanced_topics if t['id'] in sample_topics])}")
    print(f"模板生成的: {len([t for t in enhanced_topics if t['id'] not in sample_topics])}")


if __name__ == '__main__':
    main()
