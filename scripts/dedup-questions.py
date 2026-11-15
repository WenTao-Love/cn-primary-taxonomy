#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
题目去重工具（借鉴 cn-math-taxonomy 的重复率检查）
检测重复题目并生成去重后的题库
"""
import json
import os
from collections import defaultdict

BASE = r'D:\xcode\fgit\cn-primary-taxonomy'
QUESTIONS_FILE = os.path.join(BASE, 'data', 'diagnostic-questions-fixed.json')
OUTPUT_FILE = os.path.join(BASE, 'data', 'diagnostic-questions-deduped.json')
REPORT_FILE = os.path.join(BASE, 'data', 'dedup-report.json')

print("=" * 70)
print("题目去重工具")
print("=" * 70)

with open(QUESTIONS_FILE, 'r', encoding='utf-8') as f:
    data = json.load(f)
questions = data['questions']

print(f"\n原始题目数: {len(questions)}")

# 按题目内容分组（题干+选项）
question_groups = defaultdict(list)
for i, q in enumerate(questions):
    key = (q['question'].strip(), tuple(q['options']))
    question_groups[key].append(i)

# 找出重复组
duplicates = {k: v for k, v in question_groups.items() if len(v) > 1}
print(f"重复题目组数: {len(duplicates)}")
print(f"涉及题目数: {sum(len(v) for v in duplicates.values())}")

# 去重：每组只保留第一条（保留原有顺序）
seen = set()
deduped = []
removed = []

for i, q in enumerate(questions):
    key = (q['question'].strip(), tuple(q['options']))
    if key in seen:
        removed.append({
            'index': i,
            'id': q['id'],
            'topicId': q['topicId'],
            'question': q['question'][:50]
        })
    else:
        seen.add(key)
        deduped.append(q)

print(f"\n去重后题目数: {len(deduped)}")
print(f"移除题目数: {len(removed)}")

# 按学科统计去重情况
print("\n各学科去重情况:")
subject_stats = defaultdict(lambda: {'original': 0, 'deduped': 0})
for q in questions:
    # 从topicId推断学科
    prefix = q['topicId'][:6]
    subject_map = {
        'ct_SX': '数学', 'ct_YW': '语文', 'ct_YY': '英语', 'ct_KX': '科学',
        'ct_DF': '道德与法治', 'ct_LD': '劳动', 'ct_TY': '体育与健康',
        'ct_MS': '美术', 'ct_YYS': '音乐', 'ct_XX': '信息科技', 'ct_AI': 'AI素养',
        'ct_YRP': '英语', 'ct_YWF': '英语', 'ct_YYL': '英语'
    }
    subject = subject_map.get(prefix, '其他')
    subject_stats[subject]['original'] += 1

for q in deduped:
    prefix = q['topicId'][:6]
    subject_map = {
        'ct_SX': '数学', 'ct_YW': '语文', 'ct_YY': '英语', 'ct_KX': '科学',
        'ct_DF': '道德与法治', 'ct_LD': '劳动', 'ct_TY': '体育与健康',
        'ct_MS': '美术', 'ct_YYS': '音乐', 'ct_XX': '信息科技', 'ct_AI': 'AI素养',
        'ct_YRP': '英语', 'ct_YWF': '英语', 'ct_YYL': '英语'
    }
    subject = subject_map.get(prefix, '其他')
    subject_stats[subject]['deduped'] += 1

for subject in sorted(subject_stats.keys()):
    s = subject_stats[subject]
    dup_rate = (1 - s['deduped'] / s['original']) * 100 if s['original'] > 0 else 0
    print(f"  {subject}: {s['original']} -> {s['deduped']} (重复率 {dup_rate:.1f}%)")

# 保存去重后的题库
with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump({
        'version': 'v1.4-deduped',
        'description': '诊断题库（已去重+修复ID映射）',
        'totalQuestions': len(deduped),
        'questions': deduped
    }, f, ensure_ascii=False, indent=2)

print(f"\n已保存: {OUTPUT_FILE}")
print(f"大小: {os.path.getsize(OUTPUT_FILE)/1024:.0f} KB")

# 保存去重报告
with open(REPORT_FILE, 'w', encoding='utf-8') as f:
    json.dump({
        'originalCount': len(questions),
        'dedupedCount': len(deduped),
        'removedCount': len(removed),
        'duplicateGroups': len(duplicates),
        'removed': removed
    }, f, ensure_ascii=False, indent=2)

print(f"报告已保存: {REPORT_FILE}")
