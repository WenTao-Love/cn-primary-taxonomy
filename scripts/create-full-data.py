#!/usr/bin/env python3
"""
创建完整的数据文件，包含所有学科（数学、语文、英语、科学）
只保留必要字段以控制文件大小
"""
import json
import os

data_dir = 'D:/xcode/fgit/cn-primary-taxonomy/data'
output_dir = 'D:/xcode/fgit/cn-primary-taxonomy/twa-project/app/src/main/assets/data'

# 读取完整的topics.json
with open(os.path.join(data_dir, 'topics.json'), 'r', encoding='utf-8') as f:
    topics_data = json.load(f)

# 保留所有学科，只保留必要字段
minimal_topics = []
for t in topics_data['topics']:
    minimal_topics.append({
        'id': t.get('id', ''),
        'name': t.get('name', ''),
        'subject': t.get('subject', ''),
        'grade': t.get('grade', 0),
        'term': t.get('term', ''),
        'description': t.get('description', '')
    })

minimal_data = {
    'version': 'v2.0-full',
    'topics': minimal_topics
}

# 保存
with open(os.path.join(output_dir, 'topics-minimal.json'), 'w', encoding='utf-8') as f:
    json.dump(minimal_data, f, ensure_ascii=False)

# 统计各学科
subject_count = {}
for t in minimal_topics:
    s = t.get('subject', '其他')
    subject_count[s] = subject_count.get(s, 0) + 1

print(f"总知识点: {len(minimal_topics)}")
print(f"文件大小: {os.path.getsize(os.path.join(output_dir, 'topics-minimal.json'))} bytes")
print("\n各学科:")
for s, c in sorted(subject_count.items(), key=lambda x: -x[1]):
    print(f"  {s}: {c}")
