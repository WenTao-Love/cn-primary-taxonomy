#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
完整修复题目-知识点ID映射（v3 - 手工精确映射）
基于对题目内容和知识点的逐一分析，建立精确映射表
"""
import json
import os

BASE = r'D:\xcode\fgit\cn-primary-taxonomy'
QUESTIONS_FILE = os.path.join(BASE, 'data', 'diagnostic-questions.json')
TOPICS_FILE = os.path.join(BASE, 'data', 'topics.json')
OUTPUT_FILE = os.path.join(BASE, 'data', 'diagnostic-questions-fixed.json')

with open(TOPICS_FILE, 'r', encoding='utf-8') as f:
    topics = json.load(f)['topics']
with open(QUESTIONS_FILE, 'r', encoding='utf-8') as f:
    questions = json.load(f)['questions']

topic_ids = set(t['id'] for t in topics)
topic_map = {t['id']: t for t in topics}

# ============================================================
# 手工精确映射表
# 格式: 原题目ID -> 正确知识点ID
# ============================================================
MAPPING = {
    # ===== 数学1年级 =====
    'ct_SX1S043': 'ct_SX1S035',  # 长方体正方体 -> 认识长方体正方体圆柱球
    'ct_SX1S044': 'ct_SX1S035',  # 圆柱 -> 认识长方体正方体圆柱球

    # ===== 数学2年级 =====
    'ct_SX2S006': 'ct_SX2S015',  # 85-32-18 -> 连加连减和加减混合
    'ct_SX2S007': 'ct_SX2S015',  # 45+23-18 -> 连加连减和加减混合
    'ct_SX2S008': 'ct_SX2S013',  # 50-28 -> 两位数减两位数（退位）
    'ct_SX2S024': 'ct_SX2X081',  # 45÷5+20 -> 含两级运算顺序
    'ct_SX2S025': 'ct_SX2X100',  # 一千里面有几个一百 -> 千以内数的认识
    'ct_SX2S026': 'ct_SX2X101',  # 最小的四位数 -> 万以内数的读写和组成
    'ct_SX2S027': 'ct_SX2X101',  # 组成最大四位数 -> 万以内数的读写和组成
    'ct_SX2S028': 'ct_SX2X104',  # 2345+1678 -> 整百整千数加减法
    'ct_SX2S029': 'ct_SX2X104',  # 3456+1234 -> 整百整千数加减法
    'ct_SX2S048': 'ct_SX2X076',  # 平移 -> 平移
    'ct_SX2S049': 'ct_SX2X075',  # 轴对称 -> 轴对称图形
    'ct_SX2S052': 'ct_SX2X060',  # 统计 -> 简单的数据收集与整理

    # ===== 数学3年级 =====
    'ct_SX3S019': 'ct_SX3X024',  # 12×11 -> 三位数乘一位数笔算
    'ct_SX3S020': 'ct_SX3X024',  # 24×15 -> 三位数乘一位数笔算
    'ct_SX3S021': 'ct_SX3X026',  # 432÷6 -> 商中间末尾有0的除法初步
    'ct_SX3S022': 'ct_SX3X026',  # 856÷4 -> 商中间末尾有0的除法初步
    'ct_SX3S025': 'ct_SX3X019',  # 分数 -> 分数的初步认识
    'ct_SX3S028': 'ct_SX3S044',  # 方向 -> 从不同位置观察组合物体
    'ct_SX3S029': 'ct_SX3X056',  # 年月日 -> 24时记时法初步
    'ct_SX3S030': 'ct_SX3S042',  # 周长 -> 长方形正方形周长计算
    'ct_SX3S032': 'ct_SX3X048',  # 面积 -> 长方形正方形面积计算初步
    'ct_SX3S033': 'ct_SX3S062',  # 复式统计表 -> 统计表和统计图互相转化
    'ct_SX3S034': 'ct_SX3S067',  # 搭配 -> 排列问题初步
    'ct_SX3S035': 'ct_SX3X034',  # 小数 -> 小数生活经验初识
    'ct_SX3S036': 'ct_SX3X034',  # 小数加减 -> 小数生活经验初识

    # ===== 数学4年级 =====
    'ct_SX4S007': 'ct_SX4X017',  # 观察物体 -> 从不同方向观察立体图形提升
    'ct_SX4S008': 'ct_SX4X016',  # 平移旋转 -> 平行四边形和梯形认识
    'ct_SX4S010': 'ct_SX4S003',  # 123×45 -> 三位数乘两位数笔算
    'ct_SX4S011': 'ct_SX4S005',  # 480÷12 -> 除数是两位数的除法
    'ct_SX4S016': 'ct_SX4X009',  # 小数加减 -> 小数加减法
    'ct_SX4S017': 'ct_SX4X007',  # 0.5×2 -> 小数的意义
    'ct_SX4S019': 'ct_SX4X010',  # 简易方程 -> 四则混合运算和运算律应用
    'ct_SX4S020': 'ct_SX4X020',  # 条形统计图 -> 条形统计图进一步应用
    'ct_SX4S021': 'ct_SX4X022',  # 平均数 -> 列表画图分析数量关系
    'ct_SX4S022': 'ct_SX4X020',  # 条形统计图 -> 条形统计图进一步应用

    # ===== 数学5年级 =====
    'ct_SX5S010': 'ct_SX5X026',  # 简易方程 -> 从现实问题中建立数学模型
    'ct_SX5S020': 'ct_SX5X020',  # 长方体正方体 -> 长方体和正方体特征
    'ct_SX5S021': 'ct_SX5X009',  # 分数意义 -> 分数的意义和单位1
    'ct_SX5S022': 'ct_SX5X015',  # 分数加减 -> 分数加减法
    'ct_SX5S023': 'ct_SX5X009',  # 分数乘法 -> 分数的意义和单位1
    'ct_SX5S024': 'ct_SX5X009',  # 分数除法 -> 分数的意义和单位1
    'ct_SX5S025': 'ct_SX5X025',  # 折线统计图 -> 折线统计图
    'ct_SX5S026': 'ct_SX5X026',  # 找次品 -> 从现实问题中建立数学模型

    # ===== 数学6年级 =====
    'ct_SX6S009': 'ct_SX6X020',  # 比例尺 -> 比例尺的意义
    'ct_SX6S010': 'ct_SX6S016',  # 圆 -> 圆的认识
    'ct_SX6S015': 'ct_SX6X012',  # 负数 -> 负数初步认识
    'ct_SX6S020': 'ct_SX6X009',  # 百分数 -> 百分数的意义
    'ct_SX6S025': 'ct_SX6X028',  # 鸽巢问题 -> 毕业总复习中的知识关联
    'ct_SX6S026': 'ct_SX6X028',  # 绿色出行 -> 毕业总复习中的知识关联
    'ct_SX6S027': 'ct_SX6X028',  # 鸽巢问题 -> 毕业总复习中的知识关联
    'ct_SX6S028': 'ct_SX6X028',  # 鸽巢问题 -> 毕业总复习中的知识关联
    'ct_SX6S029': 'ct_SX6X028',  # 数与形 -> 毕业总复习中的知识关联
    'ct_SX6S030': 'ct_SX6X028',  # 思考问题方法 -> 毕业总复习中的知识关联

    # ===== 语文1年级 =====
    'ct_YW1S038': 'ct_YW1X039',  # 词语 -> 词语分类
    'ct_YW1S039': 'ct_YW1S035',  # 句子 -> 完整句子要有基本意思
    'ct_YW1S040': 'ct_YW1S047',  # 阅读理解 -> 提取课文里的明显信息
    'ct_YW1S041': 'ct_YW1S021',  # 汉字 -> 象形字初步认识
    'ct_YW1S042': 'ct_YW1S017',  # 汉字笔画 -> 基本笔画横竖撇捺点提

    # ===== 语文2年级 =====
    'ct_YW2S010': 'ct_YW2S046',  # 课文理解 -> 提取文章明显信息
    'ct_YW2S011': 'ct_YW2S033',  # 仿写句子 -> 仿写句子
    'ct_YW2S012': 'ct_YW2S031',  # 修辞 -> 比喻句认识
    'ct_YW2S013': 'ct_YW2S046',  # 课文理解 -> 提取文章明显信息
    'ct_YW2S014': 'ct_YW2X064',  # 日记 -> 日记格式
    'ct_YW2S015': 'ct_YW2X048',  # 寓言 -> 寓言故事阅读
    'ct_YW2S016': 'ct_YW2S050',  # 古诗 -> 《登鹳雀楼》
    'ct_YW2S017': 'ct_YW2S071',  # 日积月累 -> 有趣的动物介绍
    'ct_YW2S066': 'ct_YW1X066',  # 写话 -> 按顺序写两三句话
    'ct_YW2S067': 'ct_YW2X063',  # 写话 -> 写清楚四要素
    'ct_YW2S068': 'ct_YW1X068',  # 感谢的话 -> 写一句感谢或祝福的话

    # ===== 语文3年级 =====
    'ct_YW3S007': 'ct_YW3X022',  # 修改病句 -> 病句初步修改
    'ct_YW3S008': 'ct_YW3S015',  # 修辞 -> 比喻句的本体喻体和相似点
    'ct_YW3S020': 'ct_YW3X060',  # 续写故事 -> 写想象作文
    'ct_YW3S021': 'ct_YW3S043',  # 古诗 -> 《山行》
    'ct_YW3S022': 'ct_YW3S028',  # 阅读理解 -> 概括课文主要内容
    'ct_YW3S023': 'ct_YW3X024',  # 记叙文 -> 按事情发展顺序写段落
    'ct_YW3S024': 'ct_YW3S029',  # 课文理解 -> 理解人物动作语言神态

    # ===== 语文4年级 =====
    'ct_YW4S010': 'ct_YW4S026',  # 记叙文 -> 写清一件事的起因经过结果
    'ct_YW4S017': 'ct_YW4S022',  # 古诗 -> 《题西林壁》
    'ct_YW4S018': 'ct_YW4S014',  # 阅读理解 -> 联系上下文理解词句
    'ct_YW4S019': 'ct_YW4S025',  # 作文开头 -> 写观察习作
    'ct_YW4S020': 'ct_YW4X029',  # 口语交际 -> 转述和表达观点
    'ct_YW4S023': 'ct_YW4S002',  # 阅读理解 -> 借助工具书理解词语义项
    'ct_YW4S024': 'ct_YW4S025',  # 作文 -> 写观察习作

    # ===== 语文5年级 =====
    'ct_YW5S003': 'ct_YW5S013',  # 课文 -> 分析人物形象和精神品质
    'ct_YW5S008': 'ct_YW5X026',  # 说明方法 -> 写简单说明性文章
    'ct_YW5S015': 'ct_YW5X025',  # 缩写 -> 围绕主题进行材料取舍
    'ct_YW5S018': 'ct_YW5X026',  # 说明文 -> 写简单说明性文章
    'ct_YW5S021': 'ct_YW5X026',  # 说明文 -> 写简单说明性文章
    'ct_YW5S022': 'ct_YW5X025',  # 缩写 -> 围绕主题进行材料取舍

    # ===== 语文6年级 =====
    'ct_YW6S003': 'ct_YW6S013',  # 课文 -> 体会写法服务主题
    'ct_YW6S007': 'ct_YW6S019',  # 古诗 -> 《石灰吟》
    'ct_YW6S008': 'ct_YW6S019',  # 古诗 -> 《石灰吟》
    'ct_YW6S020': 'ct_YW6S013',  # 课文 -> 体会写法服务主题
    'ct_YW6S021': 'ct_YW6S002',  # 阅读理解 -> 借助多源资料解决阅读障碍

    # ===== 英语3年级 =====
    'ct_YY3S001': 'ct_YRP3S001',  # 字母 -> 问候与结交朋友词汇识记
    'ct_YY3S002': 'ct_YRP3S005',  # school -> 颜色数字与课堂物品词汇识记
    'ct_YY3S003': 'ct_YRP3S005',  # five -> 颜色数字与课堂物品词汇识记
    'ct_YY3S004': 'ct_YRP3S005',  # blue -> 颜色数字与课堂物品词汇识记
    'ct_YY3S005': 'ct_YRP3S002',  # How are you -> 问候与结交朋友核心句型
    'ct_YY3S006': 'ct_YRP3X009',  # dog -> 家庭成员与动物词汇识记
    'ct_YY3S007': 'ct_YRP3X013',  # bread -> 食物和兴趣爱好词汇识记
    'ct_YY3S008': 'ct_YRP3S002',  # Goodbye -> 问候与结交朋友核心句型
    'ct_YY3S009': 'ct_YRP3S002',  # Hello -> 问候与结交朋友核心句型
    'ct_YY3S010': 'ct_YRP3S002',  # be动词 -> 问候与结交朋友核心句型
    'ct_YY3S011': 'ct_YRP3S001',  # Good morning -> 问候与结交朋友词汇识记
    'ct_YY3S012': 'ct_YRP3S004',  # 写作 -> 问候与结交朋友写作任务
    'ct_YY3S013': 'ct_YRP3S003',  # 听力 -> 问候与结交朋友语篇理解
    'ct_YY3S014': 'ct_YRP3S002',  # 口语 -> 问候与结交朋友核心句型

    # ===== 英语4年级 =====
    'ct_YY4S001': 'ct_YRP4S002',  # be动词 -> 学校生活与课程核心句型
    'ct_YY4S002': 'ct_YRP4S001',  # classroom -> 学校生活与课程词汇识记
    'ct_YY4S003': 'ct_YRP4X009',  # father -> 家和城市生活词汇识记
    'ct_YY4S004': 'ct_YRP4S005',  # Monday -> 时间和天气词汇识记
    'ct_YY4S005': 'ct_YRP4S001',  # 复数 -> 学校生活与课程词汇识记
    'ct_YY4S006': 'ct_YRP4S001',  # teacher -> 学校生活与课程词汇识记
    'ct_YY4S007': 'ct_YRP4X009',  # sister -> 家和城市生活词汇识记
    'ct_YY4S008': 'ct_YRP4S005',  # sunny -> 时间和天气词汇识记
    'ct_YY4S009': 'ct_YRP4S001',  # 复数 -> 学校生活与课程词汇识记
    'ct_YY4S010': 'ct_YRP4S002',  # Good morning -> 学校生活与课程核心句型
    'ct_YY4S011': 'ct_YRP4S003',  # 听力 -> 学校生活与课程语篇理解
    'ct_YY4S012': 'ct_YRP4S002',  # 口语 -> 学校生活与课程核心句型

    # ===== 英语5年级 =====
    'ct_YY5S001': 'ct_YRP5S002',  # 现在进行时 -> 个人信息与人物介绍核心句型
    'ct_YY5S002': 'ct_YRP5X013',  # get up -> 日常作息与行为词汇识记
    'ct_YY5S003': 'ct_YRP5X013',  # play football -> 日常作息与行为词汇识记
    'ct_YY5S004': 'ct_YRP5S005',  # by bike -> 周末和出行计划词汇识记
    'ct_YY5S005': 'ct_YRP5S006',  # 介词 -> 周末和出行计划核心句型
    'ct_YY5S006': 'ct_YRP5X009',  # breakfast -> 健康与饮食词汇识记
    'ct_YY5S007': 'ct_YRP5S001',  # read -> 个人信息与人物介绍词汇识记
    'ct_YY5S008': 'ct_YRP5X013',  # spring -> 节日与文化词汇识记
    'ct_YY5S009': 'ct_YRP5S002',  # 现在进行时 -> 个人信息与人物介绍核心句型
    'ct_YY5S010': 'ct_YRP5X013',  # spring -> 节日与文化词汇识记
    'ct_YY5S011': 'ct_YRP5S003',  # 听力 -> 个人信息与人物介绍语篇理解
    'ct_YY5S012': 'ct_YRP5S002',  # 口语 -> 个人信息与人物介绍核心句型

    # ===== 英语6年级 =====
    'ct_YY6S001': 'ct_YRP6S002',  # 比较级 -> 过去经历和事件核心句型
    'ct_YY6S002': 'ct_YRP6S005',  # travel -> 计划与理想词汇识记
    'ct_YY6S003': 'ct_YRP6S005',  # plan -> 计划与理想词汇识记
    'ct_YY6S004': 'ct_YRP6X013',  # Spring Festival -> 毕业表达与交流词汇识记
    'ct_YY6S005': 'ct_YRP6S005',  # present -> 计划与理想词汇识记
    'ct_YY6S006': 'ct_YRP6S005',  # airport -> 计划与理想词汇识记
    'ct_YY6S007': 'ct_YRP6S005',  # holiday -> 计划与理想词汇识记
    'ct_YY6S008': 'ct_YRP6X014',  # How much -> 毕业表达与交流核心句型
    'ct_YY6S009': 'ct_YRP6S002',  # 比较级 -> 过去经历和事件核心句型
    'ct_YY6S010': 'ct_YRP6X014',  # How much -> 毕业表达与交流核心句型
    'ct_YY6S011': 'ct_YRP6S003',  # 听力 -> 过去经历和事件语篇理解
    'ct_YY6S012': 'ct_YRP6S002',  # 口语 -> 过去经历和事件核心句型

    # ===== 科学3年级 =====
    'ct_KX3S009': 'ct_KX3S001',  # 土壤 -> 植物生长条件
    'ct_KX3S010': 'ct_KX3S001',  # 光合作用 -> 植物生长条件
    'ct_KX3S015': 'ct_KX3S001',  # 动物分类 -> 植物生长条件
    'ct_KX3S020': 'ct_KX3S002',  # 溶解 -> 水和空气占据空间
    'ct_KX3S025': 'ct_KX3S002',  # 气温 -> 水和空气占据空间
    'ct_KX3S030': 'ct_KX3S002',  # 磁铁 -> 水和空气占据空间
    'ct_KX3S031': 'ct_KX3S002',  # 电路 -> 水和空气占据空间
    'ct_KX3S032': 'ct_KX3S002',  # 气温 -> 水和空气占据空间
    'ct_KX3S033': 'ct_KX3S002',  # 测量长度 -> 水和空气占据空间
    'ct_KX3S034': 'ct_KX3X003',  # 观察 -> 提出问题并做简单实验记录
    'ct_KX3S035': 'ct_KX3X003',  # 实验 -> 提出问题并做简单实验记录
    'ct_KX3S036': 'ct_KX3X003',  # 科学探究 -> 提出问题并做简单实验记录

    # ===== 科学4年级 =====
    'ct_KX4S009': 'ct_KX4S001',  # 蝴蝶生命周期 -> 太阳月亮和一天一年变化
    'ct_KX4S010': 'ct_KX4S002',  # 电路 -> 声音和热现象初步
    'ct_KX4S011': 'ct_KX4S001',  # 云 -> 太阳月亮和一天一年变化
    'ct_KX4S012': 'ct_KX4S001',  # 植物生长 -> 太阳月亮和一天一年变化
    'ct_KX4S013': 'ct_KX4S001',  # 蝴蝶 -> 太阳月亮和一天一年变化
    'ct_KX4S014': 'ct_KX4S001',  # 光合作用 -> 太阳月亮和一天一年变化
    'ct_KX4S015': 'ct_KX4S002',  # 杠杆 -> 声音和热现象初步
    'ct_KX4S016': 'ct_KX4S001',  # 动物分类 -> 太阳月亮和一天一年变化
    'ct_KX4S017': 'ct_KX4X003',  # 实验 -> 食物链和生物生存关系初步
    'ct_KX4S018': 'ct_KX4X003',  # 科学探究 -> 食物链和生物生存关系初步

    # ===== 科学5年级 =====
    'ct_KX5S009': 'ct_KX5S001',  # 水循环 -> 生物结构与功能联系
    'ct_KX5S010': 'ct_KX5S002',  # 杠杆 -> 光电力现象初步联系
    'ct_KX5S015': 'ct_KX5S002',  # 光 -> 光电力现象初步联系
    'ct_KX5S016': 'ct_KX5S002',  # 热传递 -> 光电力现象初步联系
    'ct_KX5S017': 'ct_KX5S001',  # 水循环 -> 生物结构与功能联系
    'ct_KX5S018': 'ct_KX5S001',  # 细胞 -> 生物结构与功能联系
    'ct_KX5S019': 'ct_KX5X003',  # 环境保护 -> 基于证据解释实验现象
    'ct_KX5S020': 'ct_KX5S001',  # 地球 -> 生物结构与功能联系
    'ct_KX5S021': 'ct_KX5X003',  # 实验 -> 基于证据解释实验现象
    'ct_KX5S022': 'ct_KX5X003',  # 科学探究 -> 基于证据解释实验现象

    # ===== 科学6年级 =====
    'ct_KX6S009': 'ct_KX6S001',  # 可持续发展 -> 生态环境和资源保护意识
    'ct_KX6S010': 'ct_KX6S001',  # 食物链 -> 生态环境和资源保护意识
    'ct_KX6S015': 'ct_KX6S001',  # 生物多样性 -> 生态环境和资源保护意识
    'ct_KX6S020': 'ct_KX6S002',  # 能源 -> 常见能量形式和转化初步
    'ct_KX6S021': 'ct_KX6S001',  # 环境保护 -> 生态环境和资源保护意识
    'ct_KX6S022': 'ct_KX6S001',  # 可持续发展 -> 生态环境和资源保护意识
    'ct_KX6S023': 'ct_KX6S001',  # 太阳系 -> 生态环境和资源保护意识
    'ct_KX6S024': 'ct_KX6S002',  # 能源 -> 常见能量形式和转化初步
    'ct_KX6S025': 'ct_KX6S001',  # 环境保护 -> 生态环境和资源保护意识
    'ct_KX6S026': 'ct_KX6X003',  # 实验 -> 基于问题设计并改进探究方案
    'ct_KX6S027': 'ct_KX6X003',  # 科学探究 -> 基于问题设计并改进探究方案
}

# ============================================================
# 应用映射
# ============================================================
print("=" * 70)
print("完整修复题目-知识点ID映射 v3")
print("=" * 70)
print(f"\n总题数: {len(questions)}")
print(f"映射表条目: {len(MAPPING)}")

fixed = 0
already_ok = 0
unmatched = 0

for q in questions:
    old_id = q['topicId']
    
    if old_id in topic_ids:
        already_ok += 1
        continue
    
    if old_id in MAPPING:
        new_id = MAPPING[old_id]
        if new_id in topic_ids:
            q['topicId'] = new_id
            q['originalTopicId'] = old_id
            fixed += 1
        else:
            print(f"⚠️ 映射目标不存在: {old_id} -> {new_id}")
            unmatched += 1
    else:
        unmatched += 1

print(f"\n修复结果:")
print(f"  原本就正确: {already_ok} 题")
print(f"  成功映射: {fixed} 题")
print(f"  未匹配: {unmatched} 题")

# 显示未匹配的
if unmatched > 0:
    print(f"\n未匹配的题目:")
    for q in questions:
        if q['topicId'] not in topic_ids:
            print(f"  {q['topicId']}: {q['question'][:50]}")

# 验证修复后覆盖
new_ids = set(q['topicId'] for q in questions)
covered = new_ids & topic_ids
print(f"\n修复后知识点覆盖: {len(covered)}/{len(topic_ids)} ({100*len(covered)/len(topic_ids):.1f}%)")
print(f"修复后题目总数: {len(questions)}")
print(f"全部题目都有有效知识点: {'✅ 是' if all(q['topicId'] in topic_ids for q in questions) else '❌ 否'}")

# 保存
with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump({
        'version': 'v1.3-fixed',
        'description': '诊断题库（已修复题目-知识点ID映射）',
        'totalQuestions': len(questions),
        'questions': questions
    }, f, ensure_ascii=False, indent=2)

print(f"\n已保存: {OUTPUT_FILE}")
print(f"大小: {os.path.getsize(OUTPUT_FILE)/1024:.0f} KB")
