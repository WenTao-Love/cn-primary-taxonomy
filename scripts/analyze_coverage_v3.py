#!/usr/bin/env python3
"""分析诊断题库覆盖情况 v3"""
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
    uncovered = []
    for grade_info in info['grades']:
        grade = grade_info['grade']
        term = grade_info['term']
        for domain in grade_info['domains']:
            for topic in domain['topics']:
                if topic['id'] not in covered:
                    uncovered.append({
                        'id': topic['id'],
                        'name': topic['name'],
                        'grade': grade,
                        'term': term,
                        'domain': domain['domain']
                    })
    
    print(f"  未覆盖: {len(uncovered)}个")
    
    # 按领域分组显示
    domain_groups = {}
    for t in uncovered:
        key = f"G{t['grade']}{t['term']} {t['domain']}"
        if key not in domain_groups:
            domain_groups[key] = []
        domain_groups[key].append(t)
    
    # 显示前10个领域
    for key, topics in list(domain_groups.items())[:10]:
        print(f"  {key}: {len(topics)}个")
        for t in topics[:3]:
            print(f"    - {t['name']} ({t['id']})")
        if len(topics) > 3:
            print(f"    ... 还有{len(topics)-3}个")
