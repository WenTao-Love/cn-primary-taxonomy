#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""验证生成的离线HTML完整性和正确性"""
import re
import json

HTML_FILE = r'D:\xcode\fgit\cn-primary-taxonomy\twa-project\app\src\main\assets\docs\diagnostic-offline.html'

with open(HTML_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

print(f"文件大小: {len(content)/1024/1024:.2f} MB")
print()

# 1. 检查占位符
print("=== 占位符检查 ===")
for ph in ['__ENGINE_JS__', '__FSRS_JS__', '__TOPICS_JSON__', '__DEPS_JSON__', '__QUESTIONS_JSON__']:
    status = '✅ 已替换' if ph not in content else '❌ 未替换'
    print(f"  {ph}: {status}")
print()

# 2. 提取并验证内嵌数据
print("=== 内嵌数据验证 ===")

# topicsData
m = re.search(r'const topicsData = ({.*?});\nconst depsData', content, re.DOTALL)
if m:
    topics = json.loads(m.group(1))
    print(f"  ✅ topicsData: {len(topics.get('topics', []))} 个知识点")
else:
    print("  ❌ topicsData 提取失败")

# depsData
m = re.search(r'const depsData = ({.*?});\nconst questionsData', content, re.DOTALL)
if m:
    deps = json.loads(m.group(1))
    print(f"  ✅ depsData: {len(deps.get('dependencies', []))} 条先修关系")
else:
    print("  ❌ depsData 提取失败")

# questionsData
m = re.search(r'const questionsData = ({.*?});\n', content, re.DOTALL)
if m:
    qs = json.loads(m.group(1))
    print(f"  ✅ questionsData: {len(qs.get('questions', []))} 道诊断题")
else:
    print("  ❌ questionsData 提取失败")

# 3. 检查关键函数
print()
print("=== 关键函数检查 ===")
for fn in ['function init()', 'function startDiagnostic(', 'function loadNextQuestion(',
           'function submitAnswer(', 'function showResults(', 'function startReview(',
           'class DiagnosticEngine', 'class FsrsEngine', 'function renderSubjectSelector(']:
    status = '✅' if fn in content else '❌'
    print(f"  {status} {fn}")

# 4. 检查UI元素
print()
print("=== UI元素检查 ===")
for el in ['id="quizContainer"', 'id="resultContainer"', 'id="reviewContainer"',
           'id="entryCard"', 'id="settingsModal"', 'id="subjectSelector"',
           'id="weakList"', 'id="pathContainer"']:
    status = '✅' if el in content else '❌'
    print(f"  {status} {el}")

# 5. 检查诚实声明
print()
print("=== 诚实声明检查 ===")
disclaimer_count = content.count('诚实声明')
print(f"  诚实声明出现次数: {disclaimer_count}")
print(f"  {'✅' if disclaimer_count >= 2 else '❌'} 声明完整性")

# 6. 验证题目答案格式
print()
print("=== 题目答案抽样检查 ===")
m = re.search(r'const questionsData = ({.*?});\n', content, re.DOTALL)
if m:
    qs = json.loads(m.group(1))
    questions = qs.get('questions', [])
    valid = 0
    for q in questions:
        if isinstance(q.get('answer'), int) and 0 <= q['answer'] < len(q.get('options', [])):
            valid += 1
    print(f"  答案格式有效: {valid}/{len(questions)} ({100*valid/len(questions):.1f}%)")
    
    # 按学科统计
    from collections import Counter
    subjects = Counter(q.get('topicId', '')[:5] for q in questions)
    print(f"  题目ID前缀分布: {dict(subjects)}")
