#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
答案机器重算工具（借鉴 cn-math-taxonomy 的 verify_questions.py）
为数学题添加 verify 表达式，自动核验答案
"""
import json
import os
import re
import ast
import operator

BASE = r'D:\xcode\fgit\cn-primary-taxonomy'
QUESTIONS_FILE = os.path.join(BASE, 'data', 'diagnostic-questions-deduped.json')
OUTPUT_FILE = os.path.join(BASE, 'data', 'diagnostic-questions-verified.json')

print("=" * 70)
print("答案机器重算工具")
print("=" * 70)

with open(QUESTIONS_FILE, 'r', encoding='utf-8') as f:
    data = json.load(f)
questions = data['questions']

print(f"\n总题数: {len(questions)}")

# 安全的数学表达式求值
SAFE_OPS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
    ast.FloorDiv: operator.floordiv,
    ast.Mod: operator.mod,
}

def safe_eval(expr):
    """安全求值数学表达式"""
    try:
        tree = ast.parse(expr, mode='eval')
        return _eval_node(tree.body)
    except Exception:
        return None

def _eval_node(node):
    if isinstance(node, ast.BinOp):
        left = _eval_node(node.left)
        right = _eval_node(node.right)
        op = SAFE_OPS.get(type(node.op))
        if op is None or left is None or right is None:
            return None
        return op(left, right)
    elif isinstance(node, ast.UnaryOp):
        operand = _eval_node(node.operand)
        op = SAFE_OPS.get(type(node.op))
        if op is None or operand is None:
            return None
        return op(operand)
    elif isinstance(node, ast.Num):  # Python 3.7
        return node.n
    elif isinstance(node, ast.Constant):  # Python 3.8+
        if isinstance(node.value, (int, float)):
            return node.value
        return None
    elif isinstance(node, ast.Expression):
        return _eval_node(node.body)
    else:
        return None

def extract_expression(question):
    """从题目中提取数学表达式"""
    # 清理题目
    q = question.replace('×', '*').replace('÷', '/')
    q = q.replace('（', '(').replace('）', ')')
    
    patterns = [
        r'计算[：:]\s*(.+?)(?:\?|？|$)',  # 计算：...
        r'(.+?)\s*=\s*\??\s*$',  # ... = ?
        r'(.+?)\s*=\s*[（(]',  # ... = （
    ]
    
    for pattern in patterns:
        m = re.search(pattern, q)
        if m:
            expr = m.group(1).strip()
            # 移除变量和中文
            expr = re.sub(r'[a-zA-Z\u4e00-\u9fff]', '', expr)
            expr = re.sub(r'\s+', ' ', expr).strip()
            # 只保留数学表达式
            if expr and re.match(r'^[\d\s\+\-\*/\(\)\.]+$', expr):
                return expr
    return None

def extract_answer_value(answer_text):
    """从答案文本中提取数值"""
    text = answer_text.strip()
    
    # 处理 "X余Y" 格式
    m = re.match(r'^(-?\d+)\s*余\d+', text)
    if m:
        return float(m.group(1))
    
    # 处理 "X元Y角Z分" 格式
    m = re.match(r'^(\d+)元(\d+)角(\d+)分$', text)
    if m:
        return float(m.group(1)) + float(m.group(2))/10 + float(m.group(3))/100
    
    # 处理 "X元Y角" 格式
    m = re.match(r'^(\d+)元(\d+)角$', text)
    if m:
        return float(m.group(1)) + float(m.group(2))/10
    
    # 移除单位
    text = re.sub(r'[个只条张本件套厘米米分米毫米元角分天小时分钟秒年月日℃°]', '', text)
    # 提取数字
    m = re.search(r'-?\d+\.?\d*', text)
    if m:
        return float(m.group())
    return None

# 处理每道题
verified_count = 0
mismatch_count = 0
no_expression_count = 0
not_math_count = 0

for q in questions:
    # 只处理数学题
    if not q['topicId'].startswith('ct_SX'):
        q['verifyResult'] = 'not_math'
        not_math_count += 1
        continue
    
    question = q['question']
    answer_text = q['options'][q['answer']]
    
    # 尝试提取表达式
    expr = extract_expression(question)
    if expr:
        computed = safe_eval(expr)
        expected = extract_answer_value(answer_text)
        
        if computed is not None and expected is not None:
            q['verify'] = expr
            q['verifyComputed'] = computed
            q['verifyExpected'] = expected
            if abs(computed - expected) < 0.01:
                q['verifyResult'] = 'pass'
                verified_count += 1
            else:
                q['verifyResult'] = 'mismatch'
                mismatch_count += 1
                print(f"  ⚠️ 不匹配: {q['id']}")
                print(f"     题目: {question[:50]}")
                print(f"     表达式: {expr} = {computed}")
                print(f"     答案: {answer_text} -> {expected}")
        else:
            q['verifyResult'] = 'cannot_eval'
            no_expression_count += 1
    else:
        q['verifyResult'] = 'no_expression'
        no_expression_count += 1

print(f"\n验证结果:")
print(f"  通过: {verified_count} 题")
print(f"  不匹配: {mismatch_count} 题")
print(f"  无法验证: {no_expression_count} 题")

# 保存
with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump({
        'version': 'v1.5-verified',
        'description': '诊断题库（已去重+修复ID映射+答案重算）',
        'totalQuestions': len(questions),
        'questions': questions
    }, f, ensure_ascii=False, indent=2)

print(f"\n已保存: {OUTPUT_FILE}")
print(f"大小: {os.path.getsize(OUTPUT_FILE)/1024:.0f} KB")

# 统计验证覆盖率
verifiable = verified_count + mismatch_count
print(f"\n可验证覆盖率: {verifiable}/{len(questions)} ({100*verifiable/len(questions):.1f}%)")
if mismatch_count > 0:
    print(f"\n⚠️ 发现 {mismatch_count} 道题答案可能错误，建议人工复核")
