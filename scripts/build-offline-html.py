#!/usr/bin/env python3
"""
构建离线版本的HTML文件，将JSON数据内嵌到HTML中
"""
import json
import os

data_dir = 'D:/xcode/fgit/cn-primary-taxonomy/twa-project/app/src/main/assets/data'
output_dir = 'D:/xcode/fgit/cn-primary-taxonomy/twa-project/app/src/main/assets/docs'

# 读取数据文件
with open(os.path.join(data_dir, 'topics-minimal.json'), 'r', encoding='utf-8') as f:
    topics_data = json.load(f)

# 读取HTML模板
html_file = os.path.join(output_dir, 'diagnostic-external.html')
with open(html_file, 'r', encoding='utf-8') as f:
    html_content = f.read()

# 替换fetch部分为内嵌数据
init_code = f"""
        // 内嵌数据（离线模式）
        const topicsData = {json.dumps(topics_data, ensure_ascii=False)};

        // 初始化
        function init() {{
            try {{
                var statusEl = document.getElementById('loadStatus');
                if (statusEl) statusEl.textContent = '正在加载知识点...';
                
                // 加载保存的年级设置
                loadSavedGrade();
                
                allTopics = topicsData.topics || topicsData;
                
                if (statusEl) statusEl.textContent = '已加载 ' + allTopics.length + ' 个知识点（' + selectedGrade + '年级）';
                
                renderSubjectSelector();
                renderGradeSelector();
                
                if (statusEl) statusEl.textContent = '数据加载完成！当前年级：' + selectedGrade + '年级';
                
                // 更新页面标题显示加载状态
                document.title = '已加载' + allTopics.length + '个知识点（' + selectedGrade + '年级）';
            }} catch (e) {{
                var statusEl = document.getElementById('loadStatus');
                if (statusEl) statusEl.textContent = '加载失败: ' + e.message;
            }}
        }}
"""

# 替换原来的init函数
import re
pattern = r'// 初始化 - 从外部JSON文件加载数据[\s\S]*?\n        \}\s*\n'
replacement = init_code
html_content = re.sub(pattern, replacement, html_content, count=1)

# 保存到assets目录
output_file = os.path.join(output_dir, 'diagnostic-offline.html')
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(html_content)

print(f"Offline HTML created: {output_file}")
print(f"Topics: {len(topics_data.get('topics', []))}")
print(f"File size: {os.path.getsize(output_file)} bytes")
