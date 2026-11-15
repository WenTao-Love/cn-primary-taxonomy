#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复题目与知识点的ID映射问题
问题：题目使用扁平编号（ct_SX3S025），但知识点使用分段编号（ct_SX3X025）
方案：基于内容语义匹配，将题目重新映射到正确的知识点ID
"""
import json
import os
import re
from difflib import SequenceMatcher

BASE = r'D:\xcode\fgit\cn-primary-taxonomy'
QUESTIONS_FILE = os.path.join(BASE, 'data', 'diagnostic-questions.json')
TOPICS_FILE = os.path.join(BASE, 'data', 'topics.json')
OUTPUT_FILE = os.path.join(BASE, 'data', 'diagnostic-questions-fixed.json')

print("=" * 70)
print("修复题目-知识点ID映射")
print("=" * 70)

with open(TOPICS_FILE, 'r', encoding='utf-8') as f:
    topics = json.load(f)['topics']
with open(QUESTIONS_FILE, 'r', encoding='utf-8') as f:
    questions = json.load(f)['questions']

topic_map = {t['id']: t for t in topics}
topic_ids = set(topic_map.keys())

# 按学科+年级分组知识点
from collections import defaultdict
topics_by_subj_grade = defaultdict(list)
for t in topics:
    key = (t['subject'], t['grade'])
    topics_by_subj_grade[key].append(t)

# 提取题目中的关键词
def extract_keywords(text):
    """从题目文本中提取关键词"""
    # 移除标点、数字、单位
    text = re.sub(r'[，。？！、；：""''（）《》【】\s\d+\.\d+\.\d/×÷+\-=<>]', ' ', str(text or ''))
    # 提取中文词
    words = re.findall(r'[\u4e00-\u9fff]{2,}', text)
    return set(words)

def compute_similarity(question, topic):
    """计算题目与知识点的相似度"""
    q_keywords = extract_keywords(question)
    t_keywords = set()
    t_keywords.update(extract_keywords(topic.get('name', '')))
    t_keywords.update(extract_keywords(topic.get('description', '')))
    t_keywords.update(extract_keywords(topic.get('examTips', '')))
    
    if not q_keywords or not t_keywords:
        return 0.0
    
    # Jaccard相似度
    intersection = len(q_keywords & t_keywords)
    union = len(q_keywords | t_keywords)
    jaccard = intersection / union if union > 0 else 0
    
    # 名称包含关系
    name_bonus = 0.0
    topic_name = topic.get('name', '')
    for kw in q_keywords:
        if len(kw) >= 2 and kw in topic_name:
            name_bonus = max(name_bonus, 0.3)
    
    return jaccard + name_bonus

def find_best_topic(question, topic_id, questions_for_topic):
    """为题目找到最佳匹配的知识点"""
    # 从原ID推断学科和年级
    # ct_SX3S025 -> subject=数学, grade=3
    match = re.match(r'ct_([A-Z]+)(\d+)[SX]', topic_id)
    if not match:
        return None, 0.0
    
    grade = int(match.group(2))
    
    # 推断学科
    subject_code = match.group(1)
    subject_map = {
        'SX': '数学', 'YW': '语文', 'YY': '英语', 'KX': '科学',
        'DF': '道德与法治', 'LD': '劳动', 'TY': '体育与健康',
        'MS': '美术', 'YYS': '音乐', 'XX': '信息科技', 'AI': 'AI素养'
    }
    subject = subject_map.get(subject_code)
    if not subject:
        return None, 0.0
    
    # 获取同学科同年级的所有知识点
    candidates = topics_by_subj_grade.get((subject, grade), [])
    if not candidates:
        return None, 0.0
    
    # 计算相似度
    best_topic = None
    best_score = 0.0
    for topic in candidates:
        score = compute_similarity(question, topic)
        if score > best_score:
            best_score = score
            best_topic = topic
    
    return best_topic, best_score

# 处理每道题目
print(f"\n总题数: {len(questions)}")
fixed = 0
unmatched = 0
low_confidence = 0
mapping_report = []

for q in questions:
    old_id = q['topicId']
    
    # 如果ID已存在，跳过
    if old_id in topic_ids:
        continue
    
    # 找最佳匹配
    best_topic, score = find_best_topic(q['question'], old_id, questions)
    
    if best_topic and score > 0.15:
        q['topicId'] = best_topic['id']
        q['originalTopicId'] = old_id  # 保留原ID
        fixed += 1
        mapping_report.append({
            'question': q['question'][:40],
            'old_id': old_id,
            'new_id': best_topic['id'],
            'new_name': best_topic['name'],
            'score': round(score, 3)
        })
        if score < 0.3:
            low_confidence += 1
    else:
        unmatched += 1
        mapping_report.append({
            'question': q['question'][:40],
            'old_id': old_id,
            'new_id': None,
            'new_name': None,
            'score': round(score, 3)
        })

print(f"\n修复结果:")
print(f"  成功映射: {fixed} 题")
print(f"  低置信度(<0.3): {low_confidence} 题")
print(f"  未匹配: {unmatched} 题")

# 显示映射详情
print(f"\n映射详情（前30条）:")
for r in mapping_report[:30]:
    if r['new_id']:
        print(f"  [{r['score']:.2f}] {r['old_id']} -> {r['new_id']} ({r['new_name']})")
        print(f"         Q: {r['question']}")
    else:
        print(f"  [未匹配] {r['old_id']}: {r['question']}")

# 统计修复后的覆盖
new_topic_ids = set(q['topicId'] for q in questions)
covered = new_topic_ids & topic_ids
print(f"\n修复后知识点覆盖: {len(covered)}/{len(topic_ids)}")

# 保存
with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump({
        'version': 'v1.1-fixed',
        'description': '诊断题库（已修复题目-知识点ID映射）',
        'totalQuestions': len(questions),
        'questions': questions
    }, f, ensure_ascii=False, indent=2)

print(f"\n已保存到: {OUTPUT_FILE}")
print(f"大小: {os.path.getsize(OUTPUT_FILE)/1024:.0f} KB")
