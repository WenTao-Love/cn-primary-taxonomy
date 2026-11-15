#!/usr/bin/env python3
"""
创建最小化的数据文件，只包含数学知识点的必要信息
"""
import json
import os

data_dir = 'D:/xcode/fgit/cn-primary-taxonomy/data'
output_dir = 'D:/xcode/fgit/cn-primary-taxonomy/twa-project/app/src/main/assets/data'

# 读取完整的topics.json
with open(os.path.join(data_dir, 'topics.json'), 'r', encoding='utf-8') as f:
    topics_data = json.load(f)

# 只保留数学知识点，并且只保留必要的信息
minimal_topics = []
for t in topics_data['topics']:
    if t.get('subject') == '数学':
        minimal_topics.append({
            'id': t.get('id', ''),
            'name': t.get('name', ''),
            'subject': t.get('subject', ''),
            'grade': t.get('grade', 0),
            'term': t.get('term', ''),
            'description': t.get('description', '')
        })

minimal_data = {
    'version': 'v1.0-minimal',
    'topics': minimal_topics
}

# 保存最小化的topics.json
with open(os.path.join(output_dir, 'topics-minimal.json'), 'w', encoding='utf-8') as f:
    json.dump(minimal_data, f, ensure_ascii=False)

print(f"Created minimal topics.json with {len(minimal_topics)} math topics")
print(f"Original size: {os.path.getsize(os.path.join(data_dir, 'topics.json'))} bytes")
print(f"Minimal size: {os.path.getsize(os.path.join(output_dir, 'topics-minimal.json'))} bytes")
