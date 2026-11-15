#!/usr/bin/env python3
"""分析诊断题库覆盖情况"""
import json

with open('data/learning-paths.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

with open('data/diagnostic-questions.json', 'r', encoding='utf-8') as f:
    diag = json.load(f)

covered = set(q['topicId'] for q in diag['questions'])

for subject, info in data['subjects'].items():
    print(f'=== {subject} ===')
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
    print(f'  未覆盖: {len(uncovered)}个')
    for t in uncovered[:30]:
        print(f'    G{t["grade"]}{t["term"]} {t["domain"]}: {t["name"]} ({t["id"]})')
    if len(uncovered) > 30:
        print(f'    ... 还有 {len(uncovered)-30} 个')
    print()
