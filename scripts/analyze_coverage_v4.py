#!/usr/bin/env python3
"""分析诊断题库覆盖情况 v4 - 找出未覆盖的核心知识点"""
import json

with open('data/learning-paths.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

with open('data/diagnostic-questions.json', 'r', encoding='utf-8') as f:
    diag = json.load(f)

covered = set(q['topicId'] for q in diag['questions'])
print(f"已覆盖知识点: {len(covered)}个")

# 定义核心知识点（需要覆盖的重要概念）
core_topics = {
    '数学': [
        # 一年级
        'ct_SX1S009', 'ct_SX1S012', 'ct_SX1S013',  # 一图四式、20以内进位加法、20以内退位减法
        'ct_SX1S014', 'ct_SX1S015', 'ct_SX1S016',  # 20以内加减混合、解决问题、整理复习
        'ct_SX1X020', 'ct_SX1X021', 'ct_SX1X022',  # 100以内加减法（一）、（二）
        'ct_SX1X023', 'ct_SX1X024', 'ct_SX1X025',  # 100以内加减法应用
        # 二年级
        'ct_SX2S025', 'ct_SX2S026', 'ct_SX2S027',  # 万以内数的认识
        'ct_SX2S028', 'ct_SX2S029',  # 万以内加减法
        'ct_SX2S030', 'ct_SX2S031',  # 万以内加减法应用
        # 三年级
        'ct_SX3S019', 'ct_SX3S020',  # 两位数乘两位数、解决问题
        'ct_SX3S021', 'ct_SX3S022',  # 除数是一位数的除法、应用
        'ct_SX3S035', 'ct_SX3S036',  # 小数的初步认识、小数加减法
        # 四年级
        'ct_SX4S015', 'ct_SX4S016',  # 小数的意义和性质、小数的加减法
        'ct_SX4S017', 'ct_SX4S018',  # 小数的乘法、小数除法
        'ct_SX4S019', 'ct_SX4S020',  # 简易方程、解方程
        # 五年级
        'ct_SX5S021', 'ct_SX5S022',  # 分数的意义和性质、分数加减法
        'ct_SX5S023', 'ct_SX5S024',  # 分数乘法、分数除法
        'ct_SX5S025', 'ct_SX5S026',  # 折线统计图、找次品
        # 六年级
        'ct_SX6S027', 'ct_SX6S028',  # 数学广角、鸽巢问题
        'ct_SX6S029', 'ct_SX6S030',  # 数与形、思考问题
    ],
    '语文': [
        # 一年级
        'ct_YW1S038', 'ct_YW1S039', 'ct_YW1S040',  # 词语、句子、阅读
        'ct_YW1S041', 'ct_YW1S042',  # 识字、写字
        # 二年级
        'ct_YW2S013', 'ct_YW2S014', 'ct_YW2S015',  # 阅读、作文
        'ct_YW2S016', 'ct_YW2S017',  # 古诗、日积月累
        # 三年级
        'ct_YW3S024', 'ct_YW3S025', 'ct_YW3S026',  # 阅读、作文
        'ct_YW3S027', 'ct_YW3S028',  # 口语交际、综合性学习
        # 四年级
        'ct_YW4S017', 'ct_YW4S018', 'ct_YW4S019',  # 阅读、作文
        'ct_YW4S020', 'ct_YW4S021',  # 口语交际、综合性学习
        # 五年级
        'ct_YW5S020', 'ct_YW5S021', 'ct_YW5S022',  # 阅读、作文
        'ct_YW5S023', 'ct_YW5S024',  # 口语交际、综合性学习
        # 六年级
        'ct_YW6S020', 'ct_YW6S021', 'ct_YW6S022',  # 阅读、作文
        'ct_YW6S023', 'ct_YW6S024',  # 口语交际、综合性学习
    ],
    '英语': [
        # 三年级
        'ct_YY3S010', 'ct_YY3S011', 'ct_YY3S012',  # 语法、阅读、写作
        'ct_YY3S013', 'ct_YY3S014',  # 听力、口语
        # 四年级
        'ct_YY4S008', 'ct_YY4S009', 'ct_YY4S010',  # 语法、阅读、写作
        'ct_YY4S011', 'ct_YY4S012',  # 听力、口语
        # 五年级
        'ct_YY5S008', 'ct_YY5S009', 'ct_YY5S010',  # 语法、阅读、写作
        'ct_YY5S011', 'ct_YY5S012',  # 听力、口语
        # 六年级
        'ct_YY6S008', 'ct_YY6S009', 'ct_YY6S010',  # 语法、阅读、写作
        'ct_YY6S011', 'ct_YY6S012',  # 听力、口语
    ],
    '科学': [
        # 三年级
        'ct_KX3S032', 'ct_KX3S033', 'ct_KX3S034',  # 天气、测量、观察
        'ct_KX3S035', 'ct_KX3S036',  # 实验、探究
        # 四年级
        'ct_KX4S014', 'ct_KX4S015', 'ct_KX4S016',  # 植物、动物、人体
        'ct_KX4S017', 'ct_KX4S018',  # 实验、探究
        # 五年级
        'ct_KX5S018', 'ct_KX5S019', 'ct_KX5S020',  # 生物、环境、地球
        'ct_KX5S021', 'ct_KX5S022',  # 实验、探究
        # 六年级
        'ct_KX6S023', 'ct_KX6S024', 'ct_KX6S025',  # 宇宙、能源、环境
        'ct_KX6S026', 'ct_KX6S027',  # 实验、探究
    ]
}

print("=== 核心知识点覆盖情况 ===\n")
for subject, topics in core_topics.items():
    print(f"【{subject}】")
    covered_count = 0
    uncovered = []
    for tid in topics:
        if tid in covered:
            covered_count += 1
        else:
            uncovered.append(tid)
    print(f"  已覆盖: {covered_count}/{len(topics)}")
    if uncovered:
        print(f"  未覆盖: {', '.join(uncovered)}")
    print()
