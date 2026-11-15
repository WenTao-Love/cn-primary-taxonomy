#!/usr/bin/env python3
"""
直接更新diagnostic-offline.html中的内嵌数据，保留所有已有功能
"""
import json
import os
import re

data_dir = 'D:/xcode/fgit/cn-primary-taxonomy/twa-project/app/src/main/assets/data'
output_dir = 'D:/xcode/fgit/cn-primary-taxonomy/twa-project/app/src/main/assets/docs'

# 读取新的完整数据
with open(os.path.join(data_dir, 'topics-minimal.json'), 'r', encoding='utf-8') as f:
    topics_data = json.load(f)

# 读取当前的offline HTML
html_file = os.path.join(output_dir, 'diagnostic-offline.html')
with open(html_file, 'r', encoding='utf-8') as f:
    html_content = f.read()

# 替换内嵌的topicsData
new_data_str = json.dumps(topics_data, ensure_ascii=False)
pattern = r'const topicsData = \{[^;]*\};'
replacement = f'const topicsData = {new_data_str};'
html_content = re.sub(pattern, replacement, html_content, count=1)

# 保存
with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html_content)

print(f"Updated offline HTML: {html_file}")
print(f"Topics: {len(topics_data.get('topics', []))}")
print(f"File size: {os.path.getsize(html_file)} bytes")
