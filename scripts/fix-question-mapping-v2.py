#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
精确修复题目-知识点ID映射（v2）
基于题目内容、答案、解析与知识点名称/描述的综合匹配
"""
import json
import os
import re
from collections import defaultdict

BASE = r'D:\xcode\fgit\cn-primary-taxonomy'
QUESTIONS_FILE = os.path.join(BASE, 'data', 'diagnostic-questions.json')
TOPICS_FILE = os.path.join(BASE, 'data', 'topics.json')
OUTPUT_FILE = os.path.join(BASE, 'data', 'diagnostic-questions-fixed.json')

with open(TOPICS_FILE, 'r', encoding='utf-8') as f:
    topics = json.load(f)['topics']
with open(QUESTIONS_FILE, 'r', encoding='utf-8') as f:
    questions = json.load(f)['questions']

topic_map = {t['id']: t for t in topics}
topic_ids = set(topic_map.keys())

# 按学科+年级分组（只取主知识点，排除子任务）
topics_by_sg = defaultdict(list)
for t in topics:
    if '·' not in t['name']:  # 排除子任务
        topics_by_sg[(t['subject'], t['grade'])].append(t)

# 学科代码映射
SUBJECT_MAP = {
    'SX': '数学', 'YW': '语文', 'YY': '英语', 'KX': '科学',
    'DF': '道德与法治', 'LD': '劳动', 'TY': '体育与健康',
    'MS': '美术', 'YYS': '音乐', 'XX': '信息科技', 'AI': 'AI素养'
}

def get_subject_grade(topic_id):
    """从ID推断学科和年级"""
    m = re.match(r'ct_([A-Z]+)(\d+)', topic_id)
    if not m:
        return None, None
    code = m.group(1)
    grade = int(m.group(2))
    subject = SUBJECT_MAP.get(code)
    return subject, grade

def normalize(text):
    """标准化文本"""
    text = str(text or '')
    # 移除标点、数字、单位、空格
    text = re.sub(r'[，。？！、；：""''（）《》【】\s\d+\.\d+\.\d/×÷+\-=<>℃°%]', '', text)
    return text

def extract_terms(text):
    """提取关键词（2-4字词）"""
    text = normalize(text)
    terms = set()
    # 2字词
    for i in range(len(text) - 1):
        terms.add(text[i:i+2])
    # 3字词
    for i in range(len(text) - 2):
        terms.add(text[i:i+3])
    return terms

def compute_score(question, topic):
    """综合相似度评分"""
    q_text = question.get('question', '') + ' ' + question.get('explanation', '')
    q_terms = extract_terms(q_text)
    
    t_text = str(topic.get('name') or '') + ' ' + str(topic.get('description') or '') + ' ' + str(topic.get('examTips') or '')
    t_terms = extract_terms(t_text)
    
    if not q_terms or not t_terms:
        return 0.0
    
    # Jaccard
    intersection = len(q_terms & t_terms)
    union = len(q_terms | t_terms)
    jaccard = intersection / union if union > 0 else 0
    
    # 名称包含加分
    name = normalize(topic.get('name', ''))
    q_norm = normalize(q_text)
    name_bonus = 0.0
    if len(name) >= 2 and name in q_norm:
        name_bonus = 0.25
    elif len(name) >= 3:
        # 部分匹配
        for i in range(len(name) - 2):
            if name[i:i+3] in q_norm:
                name_bonus = max(name_bonus, 0.15)
                break
    
    # 关键词精确匹配加分
    keyword_bonus = 0.0
    key_terms = ['分数', '周长', '面积', '体积', '方程', '比例', '百分数', '负数',
                 '统计', '平均数', '小数', '乘法', '除法', '加法', '减法',
                 '对称', '平移', '旋转', '观察', '方向', '位置',
                 '长方形', '正方形', '三角形', '圆', '长方体', '正方体',
                 '声母', '韵母', '拼音', '汉字', '词语', '句子', '阅读',
                 '元音', '辅音', '名词', '动词', '形容词', '比较级',
                 '植物', '动物', '溶解', '电路', '磁铁', '光', '热',
                 '呼吸', '消化', '循环', '食物链', '生态']
    for kt in key_terms:
        if kt in q_text and kt in t_text:
            keyword_bonus = max(keyword_bonus, 0.2)
    
    return jaccard + name_bonus + keyword_bonus

def find_best_match(question, old_id):
    """找到最佳匹配的知识点"""
    subject, grade = get_subject_grade(old_id)
    if not subject or not grade:
        return None, 0.0
    
    candidates = topics_by_sg.get((subject, grade), [])
    if not candidates:
        return None, 0.0
    
    best = None
    best_score = 0.0
    for topic in candidates:
        score = compute_score(question, topic)
        if score > best_score:
            best_score = score
            best = topic
    
    return best, best_score

# 处理每道题目
print("=" * 70)
print("精确修复题目-知识点ID映射 v2")
print("=" * 70)
print(f"\n总题数: {len(questions)}")

fixed = 0
unmatched = 0
mapping_details = []

for q in questions:
    old_id = q['topicId']
    
    if old_id in topic_ids:
        continue  # ID已存在
    
    best_topic, score = find_best_match(q, old_id)
    
    if best_topic and score > 0.1:
        q['topicId'] = best_topic['id']
        q['originalTopicId'] = old_id
        fixed += 1
        mapping_details.append({
            'old': old_id,
            'new': best_topic['id'],
            'name': best_topic['name'],
            'score': score,
            'q': q['question'][:50]
        })
    else:
        unmatched += 1
        mapping_details.append({
            'old': old_id,
            'new': None,
            'name': None,
            'score': score,
            'q': q['question'][:50]
        })

print(f"\n修复结果:")
print(f"  成功映射: {fixed} 题")
print(f"  未匹配: {unmatched} 题")

# 按原ID分组显示
from collections import defaultdict
by_old = defaultdict(list)
for d in mapping_details:
    by_old[d['old']].append(d)

print(f"\n映射详情（按原ID分组）:")
for old_id in sorted(by_old.keys()):
    items = by_old[old_id]
    new_id = items[0]['new']
    name = items[0]['name']
    score = items[0]['score']
    count = len(items)
    if new_id:
        print(f"  {old_id} -> {new_id} ({name}) [score={score:.2f}] ({count}题)")
    else:
        print(f"  {old_id} -> [未匹配] [score={score:.2f}] ({count}题)")
        print(f"    Q: {items[0]['q']}")

# 保存
with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump({
        'version': 'v1.2-fixed',
        'description': '诊断题库（已修复题目-知识点ID映射）',
        'totalQuestions': len(questions),
        'questions': questions
    }, f, ensure_ascii=False, indent=2)

print(f"\n已保存: {OUTPUT_FILE}")
print(f"大小: {os.path.getsize(OUTPUT_FILE)/1024:.0f} KB")

# 验证修复后覆盖
new_ids = set(q['topicId'] for q in questions)
covered = new_ids & topic_ids
print(f"\n修复后知识点覆盖: {len(covered)}/{len(topic_ids)} ({100*len(covered)/len(topic_ids):.1f}%)")
