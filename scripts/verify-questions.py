#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
诊断题库三道防线验证脚本
借鉴 cn-math-taxonomy 的验证思路：
1. validate.py - 格式验证（标准库）
2. verify_questions.py - 答案重算与一致性验证
3. second_pass.py - 盲审抽样报告

输出：验证报告，标注通过/可疑/无法验证的题目
"""
import json
import re
import os
from collections import Counter, defaultdict

BASE = r'D:\xcode\fgit\cn-primary-taxonomy'
QUESTIONS_FILE = os.path.join(BASE, 'data', 'diagnostic-questions.json')
TOPICS_FILE = os.path.join(BASE, 'data', 'topics.json')

print("=" * 70)
print("诊断题库三道防线验证")
print("=" * 70)

# 读取数据
with open(QUESTIONS_FILE, 'r', encoding='utf-8') as f:
    qdata = json.load(f)
questions = qdata['questions']

with open(TOPICS_FILE, 'r', encoding='utf-8') as f:
    tdata = json.load(f)
topics = {t['id']: t for t in tdata['topics']}

print(f"\n总题数: {len(questions)}")
print(f"总知识点: {len(topics)}")

# ============================================================
# 第一道防线：格式验证
# ============================================================
print("\n" + "=" * 70)
print("第一道防线：格式验证")
print("=" * 70)

REQUIRED_FIELDS = ['id', 'topicId', 'difficulty', 'question', 'options', 'answer', 'explanation']
errors = []
warnings = []

for i, q in enumerate(questions):
    qid = q.get('id', f'index_{i}')
    
    # 必填字段
    for field in REQUIRED_FIELDS:
        if field not in q:
            errors.append(f"[{qid}] 缺少字段: {field}")
    
    # 答案索引范围
    if 'answer' in q and 'options' in q:
        if not isinstance(q['answer'], int):
            errors.append(f"[{qid}] 答案不是整数: {q['answer']}")
        elif q['answer'] < 0 or q['answer'] >= len(q['options']):
            errors.append(f"[{qid}] 答案索引越界: {q['answer']} (选项数: {len(q['options'])})")
    
    # 选项数量
    if 'options' in q:
        if len(q['options']) < 2:
            errors.append(f"[{qid}] 选项少于2个: {len(q['options'])}")
        elif len(q['options']) != 4:
            warnings.append(f"[{qid}] 选项不是4个: {len(q['options'])}")
    
    # 题目文本非空
    if 'question' in q and len(q['question'].strip()) < 5:
        warnings.append(f"[{qid}] 题目文本过短: '{q['question']}'")
    
    # 解析非空
    if 'explanation' in q and len(q['explanation'].strip()) < 3:
        warnings.append(f"[{qid}] 解析过短: '{q['explanation']}'")
    
    # 知识点存在性
    if 'topicId' in q and q['topicId'] not in topics:
        errors.append(f"[{qid}] 知识点不存在: {q['topicId']}")
    
    # 难度值
    if 'difficulty' in q and q['difficulty'] not in ('basic', 'medium', 'hard'):
        warnings.append(f"[{qid}] 难度值异常: {q['difficulty']}")

print(f"  错误: {len(errors)} 个")
print(f"  警告: {len(warnings)} 个")
if errors:
    print("\n  错误详情（前10个）:")
    for e in errors[:10]:
        print(f"    ❌ {e}")
if warnings:
    print(f"\n  警告详情（前10个）:")
    for w in warnings[:10]:
        print(f"    ⚠️ {w}")

# ============================================================
# 第二道防线：答案一致性验证
# ============================================================
print("\n" + "=" * 70)
print("第二道防线：答案一致性验证")
print("=" * 70)

# 2.1 解析中包含正确答案
answer_in_explanation = 0
answer_not_in_explanation = 0
for q in questions:
    if 'answer' not in q or 'options' not in q or 'explanation' not in q:
        continue
    correct_text = q['options'][q['answer']]
    # 提取正确答案中的关键文本（去掉数字单位等）
    key_text = re.sub(r'[个只条张本套件]', '', correct_text)
    key_text = key_text.strip()
    if key_text and key_text in q['explanation']:
        answer_in_explanation += 1
    else:
        answer_not_in_explanation += 1

print(f"  解析包含正确答案: {answer_in_explanation}/{len(questions)} ({100*answer_in_explanation/len(questions):.1f}%)")
print(f"  解析未包含正确答案: {answer_not_in_explanation}/{len(questions)} ({100*answer_not_in_explanation/len(questions):.1f}%)")

# 2.2 重复题目检测
question_texts = Counter(q['question'] for q in questions)
duplicates = [(text, count) for text, count in question_texts.items() if count > 1]
print(f"\n  重复题目: {len(duplicates)} 组")
for text, count in duplicates[:5]:
    print(f"    ⚠️ 出现{count}次: '{text[:50]}...'")

# 2.3 答案分布均衡性
answer_dist = Counter(q['answer'] for q in questions)
print(f"\n  答案分布:")
for idx in sorted(answer_dist.keys()):
    print(f"    选项{chr(65+idx)}: {answer_dist[idx]} 题 ({100*answer_dist[idx]/len(questions):.1f}%)")

# 2.4 难度分布
diff_dist = Counter(q['difficulty'] for q in questions)
print(f"\n  难度分布:")
for d, c in sorted(diff_dist.items()):
    print(f"    {d}: {c} 题 ({100*c/len(questions):.1f}%)")

# 2.5 每知识点题目数
topic_q_count = Counter(q['topicId'] for q in questions)
print(f"\n  知识点覆盖:")
print(f"    有题目的知识点: {len(topic_q_count)}/{len(topics)} ({100*len(topic_q_count)/len(topics):.1f}%)")
print(f"    平均每知识点: {len(questions)/len(topic_q_count):.1f} 题")
print(f"    最多题目的知识点: {topic_q_count.most_common(3)}")

# 2.6 可疑模式检测
print(f"\n  可疑模式检测:")
suspicious = 0
for q in questions:
    # 所有选项相同
    if len(set(q['options'])) < len(q['options']):
        print(f"    ⚠️ [{q['id']}] 选项有重复")
        suspicious += 1
    # 题目包含答案
    correct_text = q['options'][q['answer']]
    if len(correct_text) > 2 and correct_text in q['question']:
        print(f"    ⚠️ [{q['id']}] 题目中直接包含答案: '{correct_text}'")
        suspicious += 1
print(f"    可疑题目: {suspicious} 个")

# ============================================================
# 第三道防线：盲审抽样
# ============================================================
print("\n" + "=" * 70)
print("第三道防线：盲审抽样报告")
print("=" * 70)

# 按学科分层抽样
by_subject = defaultdict(list)
for q in questions:
    topic = topics.get(q['topicId'])
    if topic:
        by_subject[topic['subject']].append(q)

print("\n  各学科题目抽样（每学科3题）:")
for subject in sorted(by_subject.keys()):
    qs = by_subject[subject]
    print(f"\n  【{subject}】共 {len(qs)} 题")
    for q in qs[:3]:
        topic = topics.get(q['topicId'], {})
        print(f"    知识点: {topic.get('name', q['topicId'])}")
        print(f"    题目: {q['question'][:60]}")
        print(f"    答案: {q['options'][q['answer']]}")
        print(f"    解析: {q['explanation'][:60]}")
        print()

# ============================================================
# 总结
# ============================================================
print("=" * 70)
print("验证总结")
print("=" * 70)
print(f"  总题数: {len(questions)}")
print(f"  格式错误: {len(errors)} 个 {'✅ 全部通过' if len(errors)==0 else '❌ 需要修复'}")
print(f"  格式警告: {len(warnings)} 个 {'✅ 无警告' if len(warnings)==0 else '⚠️ 建议检查'}")
print(f"  重复题目: {len(duplicates)} 组")
print(f"  可疑题目: {suspicious} 个")
print(f"  知识点覆盖: {len(topic_q_count)}/{len(topics)} ({100*len(topic_q_count)/len(topics):.1f}%)")
print()
print("说明：")
print("  - 题目由 AI 生成，未经教师审核")
print("  - 自动验证只能检查格式和一致性，不能保证答案正确性")
print("  - 建议人工盲审抽样题目，特别是标记为可疑的题目")
print("  - 自动判题只是近似的，答题记录里可以逐题更正")
print("=" * 70)
