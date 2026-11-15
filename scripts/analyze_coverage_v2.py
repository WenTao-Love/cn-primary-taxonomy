#!/usr/bin/env python3
"""分析诊断题库覆盖情况，找出未覆盖的重要知识点"""
import json

with open('data/learning-paths.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

with open('data/diagnostic-questions.json', 'r', encoding='utf-8') as f:
    diag = json.load(f)

covered = set(q['topicId'] for q in diag['questions'])

# 定义重要知识点（需要覆盖的核心概念）
important_topics = {
    '数学': [
        # 一年级
        'ct_SX1S003', 'ct_SX1S004', 'ct_SX1S005',  # 10以内比较、第几、分与合
        'ct_SX1S006', 'ct_SX1S007', 'ct_SX1S008',  # 加法、减法、加减混合
        # 二年级
        'ct_SX2S001', 'ct_SX2S002', 'ct_SX2S003',  # 100以内数的认识
        'ct_SX2S004', 'ct_SX2S005', 'ct_SX2S006',  # 100以内加减法
        'ct_SX2S007', 'ct_SX2S008',  # 连加连减、加减混合
        # 三年级
        'ct_SX3S002', 'ct_SX3S003',  # 万以内加减法
        'ct_SX3S017', 'ct_SX3S018',  # 除数是一位数的除法
        # 四年级
        'ct_SX4S002', 'ct_SX4S003',  # 大数的读写
        'ct_SX4S012', 'ct_SX4S013',  # 角的度量、三位数乘两位数
        # 五年级
        'ct_SX5S003', 'ct_SX5S004',  # 小数加减法
        'ct_SX5S006', 'ct_SX5S007',  # 解方程、列方程
        # 六年级
        'ct_SX6S003', 'ct_SX6S004',  # 分数加减法
        'ct_SX6S006', 'ct_SX6S007',  # 圆柱圆锥
        'ct_SX6S008', 'ct_SX6S009',  # 比例
    ],
    '语文': [
        # 一年级
        'ct_YW1S002', 'ct_YW1S003', 'ct_YW1S004',  # 韵母、整体认读
        'ct_YW1S006', 'ct_YW1S007', 'ct_YW1S008',  # 生字、偏旁
        # 二年级
        'ct_YW2S001', 'ct_YW2S002', 'ct_YW2S003',  # 字音、字形、字义
        'ct_YW2S006', 'ct_YW2S007',  # 近义词、反义词
        # 三年级
        'ct_YW3S001', 'ct_YW3S002', 'ct_YW3S003',  # 生字、词语
        'ct_YW3S006', 'ct_YW3S007',  # 标点符号、病句修改
        # 四年级
        'ct_YW4S001', 'ct_YW4S002', 'ct_YW4S003',  # 生字、词语
        'ct_YW4S006', 'ct_YW4S007',  # 句子、修辞
        # 五年级
        'ct_YW5S001', 'ct_YW5S002', 'ct_YW5S003',  # 生字、词语
        'ct_YW5S006', 'ct_YW5S007',  # 句子、标点
        # 六年级
        'ct_YW6S001', 'ct_YW6S002', 'ct_YW6S003',  # 生字、词语
        'ct_YW6S006', 'ct_YW6S007',  # 句子、修辞
    ],
    '英语': [
        # 三年级
        'ct_YY3S003', 'ct_YY3S004',  # 数字、颜色
        'ct_YY3S006', 'ct_YY3S007',  # 动物、食物
        # 四年级
        'ct_YY4S002', 'ct_YY4S003',  # 学校、家庭
        'ct_YY4S004', 'ct_YY4S005',  # 时间、日期
        # 五年级
        'ct_YY5S002', 'ct_YY5S003',  # 日常活动、爱好
        'ct_YY5S004', 'ct_YY5S005',  # 交通、购物
        # 六年级
        'ct_YY6S002', 'ct_YY6S003',  # 旅行、计划
        'ct_YY6S004', 'ct_YY6S005',  # 节日、文化
    ],
    '科学': [
        # 三年级
        'ct_KX3S006', 'ct_KX3S007',  # 磁铁、电
        'ct_KX3S008', 'ct_KX3S009',  # 岩石、土壤
        # 四年级
        'ct_KX4S006', 'ct_KX4S007',  # 天气、气候
        'ct_KX4S008', 'ct_KX4S009',  # 植物的生长、动物的生命周期
        # 五年级
        'ct_KX5S006', 'ct_KX5S007',  # 光、影子
        'ct_KX5S008', 'ct_KX5S009',  # 热传递、水的循环
        # 六年级
        'ct_KX6S006', 'ct_KX6S007',  # 能量、能源
        'ct_KX6S008', 'ct_KX6S009',  # 环境保护、可持续发展
    ]
}

print("=== 重要知识点覆盖情况 ===\n")
for subject, topics in important_topics.items():
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

# 统计各学科已覆盖的知识点数量
print("=== 已覆盖知识点统计 ===")
subject_covered = {}
for subject, info in data['subjects'].items():
    for grade_info in info['grades']:
        for domain in grade_info['domains']:
            for topic in domain['topics']:
                if topic['id'] in covered:
                    if subject not in subject_covered:
                        subject_covered[subject] = set()
                    subject_covered[subject].add(topic['id'])

for subject, topics in sorted(subject_covered.items()):
    print(f"  {subject}: {len(topics)}个知识点")
