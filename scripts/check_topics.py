#!/usr/bin/env python3
"""检查诊断题覆盖的知识点"""
import json

with open('data/diagnostic-questions.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

topic_ids = set(q['topicId'] for q in data['questions'])
print(f'ct_SX1X050 有诊断题: {"ct_SX1X050" in topic_ids}')

sx_topics = sorted([tid for tid in topic_ids if tid.startswith('ct_SX')])
print(f'SX知识点: {len(sx_topics)}个')
for tid in sx_topics:
    count = len([q for q in data['questions'] if q['topicId'] == tid])
    print(f'  {tid}: {count}道')
