#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
为题目添加苏格拉底式引导提示（借鉴文章2的AI苏格拉底式辅导）
为每道题生成引导性问题，帮助孩子思考而不是直接给答案
"""
import json
import os
import re

BASE = r'D:\xcode\fgit\cn-primary-taxonomy'
QUESTIONS_FILE = os.path.join(BASE, 'data', 'diagnostic-questions-deduped.json')
OUTPUT_FILE = os.path.join(BASE, 'data', 'diagnostic-questions-hinted.json')

print("=" * 70)
print("苏格拉底式引导提示生成")
print("=" * 70)

with open(QUESTIONS_FILE, 'r', encoding='utf-8') as f:
    data = json.load(f)
questions = data['questions']

print(f"\n总题数: {len(questions)}")

def generate_hint(question, answer, explanation):
    """生成引导性提示"""
    # 数学题：引导计算思路
    if '计算' in question or '×' in question or '÷' in question or '+' in question or '-' in question:
        return "先想一想：这道题需要用到什么运算？你能把计算步骤拆成几步吗？"
    
    # 单位换算
    if '米' in question and '厘米' in question:
        return "提示：1米等于多少厘米？你能用这个关系来换算吗？"
    if '元' in question and '角' in question:
        return "提示：1元等于多少角？你能用这个关系来换算吗？"
    
    # 分数
    if '分数' in question or '1/' in question or '几分之' in question:
        return "提示：分数表示把一个整体平均分成几份，取其中的几份。你能画个图来帮助理解吗？"
    
    # 几何
    if '长方形' in question or '正方形' in question:
        return "提示：长方形的周长=（长+宽）×2，面积=长×宽。你能找到题目中的长和宽吗？"
    if '圆' in question:
        return "提示：圆的周长=2πr，面积=πr²。你能找到半径吗？"
    
    # 应用题
    if '小明' in question or '小红' in question:
        return "提示：先找出题目中的已知条件和要求的问题，再想想用什么运算。"
    
    # 语文：拼音、汉字
    if '拼音' in question or '声母' in question or '韵母' in question:
        return "提示：声母是音节开头的辅音，韵母是声母后面的部分。你能试着拼一拼吗？"
    
    # 语文：阅读理解
    if '阅读' in question or '课文' in question or '文章' in question:
        return "提示：回到原文中找一找，答案往往就在文章里。"
    
    # 英语：词汇
    if '选出' in question and '意思' in question:
        return "提示：把单词放到句子里想一想，它的意思是什么？"
    
    # 英语：语法
    if 'be动词' in question or '时态' in question or '复数' in question:
        return "提示：想一想主语是什么，应该用be动词的哪种形式？"
    
    # 科学
    if '植物' in question or '光合作用' in question:
        return "提示：植物生长需要阳光、水和空气。光合作用需要哪些条件？"
    if '动物' in question:
        return "提示：这种动物有什么特征？它属于哪一类动物？"
    
    # 通用提示
    return "提示：仔细读题，想一想这道题考的是哪个知识点。"

# 为每道题添加提示
hinted_count = 0
for q in questions:
    hint = generate_hint(q['question'], q['options'][q['answer']], q.get('explanation', ''))
    q['hint'] = hint
    hinted_count += 1

print(f"已添加提示: {hinted_count} 题")

# 保存
with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump({
        'version': 'v1.6-hinted',
        'description': '诊断题库（已去重+修复ID映射+苏格拉底提示）',
        'totalQuestions': len(questions),
        'questions': questions
    }, f, ensure_ascii=False, indent=2)

print(f"\n已保存: {OUTPUT_FILE}")
print(f"大小: {os.path.getsize(OUTPUT_FILE)/1024:.0f} KB")
