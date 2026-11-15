#!/usr/bin/env python3
"""验证诊断题库JSON格式"""
import json

with open('D:/xcode/fgit/cn-primary-taxonomy/data/diagnostic-questions.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print('JSON格式验证: 通过')
print(f'总题数: {data["totalQuestions"]}')
print(f'实际题数: {len(data["questions"])}')
print(f'版本: {data["version"]}')

# 检查每道题的字段
required_fields = ['id', 'topicId', 'difficulty', 'question', 'options', 'answer', 'explanation']
errors = []
for i, q in enumerate(data['questions']):
    for field in required_fields:
        if field not in q:
            errors.append(f'第{i+1}题缺少字段: {field}')
            break

if errors:
    for e in errors[:10]:
        print(e)
else:
    print('所有题目字段完整')

# 统计知识点覆盖
topic_ids = set(q['topicId'] for q in data['questions'])
print(f'覆盖知识点数: {len(topic_ids)}')

# 按难度统计
diff_count = {}
for q in data['questions']:
    d = q['difficulty']
    diff_count[d] = diff_count.get(d, 0) + 1
print(f'难度分布: {diff_count}')
