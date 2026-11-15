#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""验证离线HTML中的学科数据"""

import re
import json
from collections import Counter

html_file = r'D:\xcode\fgit\cn-primary-taxonomy\twa-project\app\src\main\assets\docs\diagnostic-offline.html'

with open(html_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 提取topicsData
match = re.search(r'const topicsData = ({.*?});', content, re.DOTALL)
if match:
    data = json.loads(match.group(1))
    topics = data.get('topics', [])
    
    print(f"总知识点数: {len(topics)}")
    
    # 统计学科
    subjects = Counter(t.get('subject') for t in topics)
    print(f"\n学科数量: {len(subjects)}")
    print("\n各学科知识点数:")
    for subject, count in sorted(subjects.items()):
        print(f"  {subject}: {count}")
    
    # 检查是否有空学科
    if None in subjects or '' in subjects:
        print("\n警告：存在学科为空的数据！")
else:
    print("未找到topicsData！")
