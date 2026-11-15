#!/usr/bin/env python3
"""分析诊断题库覆盖情况 v5 - 找出未覆盖的核心知识点"""
import json

with open('data/learning-paths.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

with open('data/diagnostic-questions.json', 'r', encoding='utf-8') as f:
    diag = json.load(f)

covered = set(q['topicId'] for q in diag['questions'])
print(f"已覆盖知识点: {len(covered)}个")

# 按学科统计覆盖情况
for subject, info in data['subjects'].items():
    print(f"\n=== {subject} ===")
    total = 0
    uncovered = 0
    for grade_info in info['grades']:
        for domain in grade_info['domains']:
            for topic in domain['topics']:
                total += 1
                if topic['id'] not in covered:
                    uncovered += 1
    print(f"  总数: {total}, 未覆盖: {uncovered}")

# 列出未覆盖的核心知识点（按年级和领域）
print("\n=== 未覆盖的核心知识点（部分） ===")
for subject, info in data['subjects'].items():
    print(f"\n【{subject}】")
    count = 0
    for grade_info in info['grades']:
        grade = grade_info['grade']
        term = grade_info['term']
        for domain in grade_info['domains']:
            for topic in domain['topics']:
                if topic['id'] not in covered:
                    print(f"  G{grade}{term} {domain['domain']}: {topic['name']} ({topic['id']})")
                    count += 1
                    if count >= 20:
                        break
            if count >= 20:
                break
        if count >= 20:
            break
