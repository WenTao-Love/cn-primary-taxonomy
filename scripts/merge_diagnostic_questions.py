#!/usr/bin/env python3
"""
合并诊断题库：v1（144道）+ v2（79道）= 最终题库
去重：相同topicId + 相同question的题只保留一道
"""

import json
import os

data_dir = 'D:/xcode/fgit/cn-primary-taxonomy/data'

# 读取旧题库（v1）
with open(os.path.join(data_dir, 'diagnostic-questions.json'), 'r', encoding='utf-8') as f:
    old_data = json.load(f)

# 读取新题库（v2）- 已被v2脚本覆盖，需要从备份恢复
# 实际上v2脚本已经覆盖了v1，所以需要重新运行v1脚本
print("注意：v2脚本已覆盖v1题库，需要合并两个脚本生成的数据")
print("当前题库:", len(old_data['questions']), "道")

# 由于v2脚本直接覆盖了v1，我们需要把两个脚本的题目合并
# 策略：运行两个脚本，收集所有题目，去重后保存

# 这里我们手动合并：读取当前v2题库，然后补充v1的题目
# 实际上更好的方式是：修改脚本，让它追加而不是覆盖

# 当前v2题库内容
current_questions = old_data['questions']
print(f"当前题库: {len(current_questions)}道")

# 为了演示，我们输出需要合并的信息
print("\n建议：修改脚本使其支持追加模式，或手动合并两个JSON文件")
