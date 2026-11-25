#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
构建完整离线诊断HTML（v2）
借鉴两篇文章：
1. cn-math-taxonomy：先诊断再刷题、五态判定、根因追溯、三道防线、诚实标注
2. Word Atlas：FSRS间隔复习、每日配额、进度导出、本地优先

内嵌内容：
- diagnostic-engine-v2.js（自适应诊断引擎）
- fsrs-engine.js（间隔复习引擎）
- topics-minimal.json（4275个知识点）
- dependencies.json（4191条先修关系）
- diagnostic-questions.json（735道诊断题）
"""
import json
import os
import re

BASE = r'D:\xcode\fgit\cn-primary-taxonomy'
DATA_DIR = os.path.join(BASE, 'data')
ASSETS_DATA = os.path.join(BASE, 'twa-project', 'app', 'src', 'main', 'assets', 'data')
OUTPUT = os.path.join(BASE, 'twa-project', 'app', 'src', 'main', 'assets', 'docs', 'diagnostic-offline.html')

print("=" * 60)
print("构建完整离线诊断HTML v2")
print("=" * 60)

# 读取数据
with open(os.path.join(ASSETS_DATA, 'topics-minimal.json'), 'r', encoding='utf-8') as f:
    topics_data = json.load(f)
print(f"✓ 知识点: {len(topics_data.get('topics', []))} 个")

with open(os.path.join(DATA_DIR, 'dependencies.json'), 'r', encoding='utf-8') as f:
    deps_data = json.load(f)
print(f"✓ 先修关系: {len(deps_data.get('dependencies', []))} 条")

with open(os.path.join(DATA_DIR, 'diagnostic-questions-hinted.json'), 'r', encoding='utf-8') as f:
    questions_data = json.load(f)
print(f"✓ 诊断题: {len(questions_data.get('questions', []))} 道（已去重+ID修复+苏格拉底提示）")

# 读取引擎JS
with open(os.path.join(BASE, 'scripts', 'diagnostic-engine-v2.js'), 'r', encoding='utf-8') as f:
    engine_js = f.read()
print(f"✓ 诊断引擎: {len(engine_js)} 字符")

with open(os.path.join(BASE, 'scripts', 'fsrs-engine-v2.js'), 'r', encoding='utf-8') as f:
    fsrs_js = f.read()
print(f"✓ FSRS引擎v2: {len(fsrs_js)} 字符")

# 序列化数据（紧凑格式，减小体积）
topics_json = json.dumps(topics_data, ensure_ascii=False, separators=(',', ':'))
deps_json = json.dumps(deps_data, ensure_ascii=False, separators=(',', ':'))
questions_json = json.dumps(questions_data, ensure_ascii=False, separators=(',', ':'))

print(f"✓ topics JSON: {len(topics_json)/1024:.0f} KB")
print(f"✓ deps JSON: {len(deps_json)/1024:.0f} KB")
print(f"✓ questions JSON: {len(questions_json)/1024:.0f} KB")

# ============================================================
# HTML 模板
# ============================================================
HTML_TEMPLATE = r'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>诊断中心 - 小学教育知识图谱</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f5f7fa; color: #333; line-height: 1.6; padding-bottom: 40px; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 0; text-align: center; margin-bottom: 30px; border-radius: 0 0 20px 20px; }
        header h1 { font-size: 28px; margin-bottom: 10px; }
        header p { opacity: 0.9; }
        .header-btns { margin-top: 15px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        .header-btn { background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.4); padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
        .header-btn:hover { background: rgba(255,255,255,0.3); }
        #loadStatus { margin-top: 10px; font-size: 14px; opacity: 0.9; }
        #reviewBanner { margin-top: 10px; font-size: 14px; background: rgba(255,255,255,0.15); border-radius: 8px; padding: 8px 15px; display: inline-block; }
        #reviewBanner a { color: #ffe4b5; text-decoration: underline; cursor: pointer; font-weight: 600; }
        .card { background: white; border-radius: 12px; padding: 25px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .card-title { font-size: 20px; font-weight: 600; margin-bottom: 15px; color: #2d3748; display: flex; align-items: center; gap: 10px; }
        .entry-tabs { display: flex; gap: 10px; margin-bottom: 20px; }
        .entry-tab { padding: 10px 20px; border: 2px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s; font-weight: 500; }
        .entry-tab:hover { border-color: #667eea; color: #667eea; }
        .entry-tab.active { background: #667eea; border-color: #667eea; color: white; }
        .search-box { display: flex; gap: 10px; margin-bottom: 20px; }
        .search-input { flex: 1; padding: 12px 15px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 16px; }
        .search-input:focus { outline: none; border-color: #667eea; }
        .btn { padding: 12px 24px; border: none; border-radius: 8px; font-size: 16px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .btn-primary { background: #667eea; color: white; }
        .btn-primary:hover { background: #5a67d8; }
        .btn-secondary { background: #edf2f7; color: #4a5568; }
        .btn-secondary:hover { background: #e2e8f0; }
        .btn-success { background: #48bb78; color: white; }
        .btn-success:hover { background: #38a169; }
        .btn-warning { background: #ed8936; color: white; }
        .btn-sm { padding: 8px 16px; font-size: 14px; }
        .subject-selector { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
        .subject-btn { padding: 8px 16px; border: 2px solid #e2e8f0; border-radius: 20px; cursor: pointer; transition: all 0.2s; font-size: 14px; }
        .subject-btn:hover { border-color: #667eea; }
        .subject-btn.active { background: #667eea; border-color: #667eea; color: white; }
        .grade-selector { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin-bottom: 20px; }
        .grade-btn { padding: 15px; border: 2px solid #e2e8f0; border-radius: 8px; text-align: center; cursor: pointer; transition: all 0.2s; }
        .grade-btn:hover { border-color: #667eea; }
        .grade-btn.active { background: #667eea; border-color: #667eea; color: white; }
        .grade-name { font-weight: 600; margin-bottom: 5px; }
        .topic-count { font-size: 12px; opacity: 0.8; }
        .topic-list { display: grid; gap: 10px; }
        .topic-item { background: #f7fafc; border-radius: 8px; padding: 15px; display: flex; justify-content: space-between; align-items: center; }
        .topic-info h4 { font-size: 16px; margin-bottom: 5px; }
        .topic-info p { font-size: 14px; color: #718096; }
        .topic-status { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; flex-shrink: 0; }
        .status-weak { background: #fed7d7; color: #c53030; }
        .status-unstable { background: #feebc8; color: #c05621; }
        .status-mastered { background: #c6f6d5; color: #276749; }
        .status-untested { background: #e2e8f0; color: #4a5568; }
        .loading { text-align: center; padding: 40px; color: #a0aec0; }
        /* 答题区域 */
        .quiz-container { display: none; }
        .quiz-container.active { display: block; }
        .progress-bar { height: 6px; background: #e2e8f0; border-radius: 3px; margin-bottom: 20px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #667eea, #764ba2); border-radius: 3px; transition: width 0.3s; }
        .question-info { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 14px; color: #718096; flex-wrap: wrap; gap: 5px; }
        .question-text { font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #2d3748; }
        .options { display: grid; gap: 12px; }
        .option { padding: 15px 20px; border: 2px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 12px; }
        .option:hover { border-color: #667eea; background: #f7fafc; }
        .option.selected { border-color: #667eea; background: #ebf8ff; }
        .option.correct { border-color: #48bb78; background: #f0fff4; }
        .option.wrong { border-color: #f56565; background: #fff5f5; }
        .option-label { width: 30px; height: 30px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; }
        .option.selected .option-label { background: #667eea; color: white; }
        .confirm-message { background: #fffaf0; border: 1px solid #fbd38d; border-radius: 8px; padding: 15px; margin-bottom: 20px; color: #744210; }
        .difficulty-badge { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; background: #e6fffa; color: #2c7a7b; }
        .quiz-actions { margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end; }
        /* 结果页 */
        .result-container { display: none; }
        .result-container.active { display: block; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; }
        .stat-card { background: #f7fafc; border-radius: 8px; padding: 20px; text-align: center; }
        .stat-value { font-size: 32px; font-weight: 700; color: #2d3748; }
        .stat-label { font-size: 14px; color: #718096; margin-top: 5px; }
        .stat-card.weak .stat-value { color: #f56565; }
        .stat-card.unstable .stat-value { color: #ed8936; }
        .stat-card.mastered .stat-value { color: #48bb78; }
        .stat-card.untested .stat-value { color: #a0aec0; }
        .result-section { margin-bottom: 25px; }
        .result-section-title { font-size: 18px; font-weight: 600; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; }
        .path-container { display: grid; gap: 10px; }
        .path-item { display: flex; align-items: center; gap: 15px; background: #f7fafc; border-radius: 8px; padding: 15px; }
        .path-step { width: 32px; height: 32px; border-radius: 50%; background: #667eea; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 14px; }
        .path-step.weak { background: #f56565; }
        .path-step.unstable { background: #ed8936; }
        .disclaimer { background: #fffaf0; border: 1px solid #fbd38d; border-radius: 8px; padding: 15px; margin-top: 20px; font-size: 13px; color: #744210; }
        .disclaimer strong { color: #c05621; }
        /* 错题溯源链 */
        .lineage-banner { background: linear-gradient(90deg, #ebf8ff, #f0fff4); border: 1px solid #bee3f8; border-radius: 8px; padding: 12px 15px; margin-bottom: 15px; font-size: 14px; color: #2c5282; }
        .lineage-chain { display: flex; flex-direction: column; gap: 0; }
        .lineage-node { display: flex; align-items: center; gap: 10px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; }
        .lineage-node.target { border-color: #f56565; background: #fff5f5; }
        .lineage-grade { flex-shrink: 0; min-width: 64px; text-align: center; font-size: 12px; font-weight: 600; color: #4a5568; background: #edf2f7; border-radius: 6px; padding: 4px 6px; }
        .lineage-name { font-size: 14px; font-weight: 600; color: #2d3748; }
        .lineage-meta { font-size: 12px; color: #a0aec0; margin-top: 2px; }
        .lineage-arrow { text-align: center; color: #a0aec0; font-size: 13px; line-height: 1.2; padding: 1px 0; }
        .lineage-reason { font-size: 12px; color: #718096; margin-top: 2px; }
        .lineage-toggle { background: none; border: none; color: #667eea; font-size: 13px; cursor: pointer; padding: 5px; }
        /* 练习解析 */
        .parse-box { margin-top: 15px; padding: 15px; background: #f0fff4; border: 1px solid #9ae6b4; border-radius: 8px; }
        .parse-title { font-weight: 600; color: #276749; margin-bottom: 5px; }
        .parse-text { color: #2f855a; font-size: 14px; line-height: 1.6; }
        /* 错因三分类 */
        .reason-row { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; margin-top: 8px; }
        .reason-btn { border: 1px solid #e2e8f0; background: #fff; border-radius: 14px; padding: 4px 10px; font-size: 12px; cursor: pointer; color: #4a5568; }
        .reason-btn:hover { border-color: #cbd5e0; }
        .reason-btn.selected.careless { background: #fffaf0; border-color: #fbd38d; color: #c05621; font-weight: 600; }
        .reason-btn.selected.unknown { background: #fff5f5; border-color: #feb2b2; color: #c53030; font-weight: 600; }
        .reason-btn.selected.unsolved { background: #faf5ff; border-color: #d6bcfa; color: #6b46c1; font-weight: 600; }
        .fix-text { font-size: 12px; color: #2f855a; margin-top: 6px; line-height: 1.5; }
        .reason-tag { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 12px; margin-left: 4px; }
        .reason-tag.careless { background: #fffaf0; color: #c05621; }
        .reason-tag.unknown { background: #fff5f5; color: #c53030; }
        .reason-tag.unsolved { background: #faf5ff; color: #6b46c1; }
        /* 周末巩固练习卷 */
        .sheet-group-title { font-size: 14px; font-weight: 600; color: #2d3748; margin: 14px 0 6px; padding-left: 8px; border-left: 3px solid #667eea; }
        .sheet-item { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; margin-bottom: 8px; }
        .sheet-q { font-size: 14px; color: #2d3748; line-height: 1.6; }
        .sheet-opts { font-size: 13px; color: #4a5568; margin-top: 4px; line-height: 1.7; }
        .sheet-remove { float: right; background: none; border: none; color: #e53e3e; cursor: pointer; font-size: 13px; }
        .seg-btn { flex: 1; padding: 8px 12px; border: 1px solid #e2e8f0; background: #f7fafc; font-size: 13px; cursor: pointer; border-radius: 8px; color: #4a5568; }
        .seg-btn.active { background: #667eea; color: #fff; border-color: #667eea; }
        /* 复习区域 */
        .review-container { display: none; }
        .review-container.active { display: block; }
        .review-item { display: flex; justify-content: space-between; align-items: center; background: #f7fafc; border-radius: 8px; padding: 12px 15px; margin-bottom: 8px; }
        .review-item-info { flex: 1; }
        .review-item-name { font-weight: 600; font-size: 15px; }
        .review-item-meta { font-size: 13px; color: #718096; margin-top: 2px; }
        .review-due { color: #f56565; font-weight: 600; }
        .confidence-btn { padding: 8px 16px; border: 2px solid #e2e8f0; border-radius: 8px; background: white; cursor: pointer; font-size: 14px; transition: all 0.2s; }
        .confidence-btn:hover { border-color: #667eea; }
        .confidence-btn.selected { background: #667eea; border-color: #667eea; color: white; }
        .error-item { background: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; padding: 15px; margin-bottom: 10px; }
        .error-question { font-weight: 600; margin-bottom: 8px; }
        .error-answer { font-size: 14px; color: #718096; margin-bottom: 5px; }
        .error-answer .correct { color: #48bb78; }
        .error-answer .wrong { color: #f56565; }
        .report-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px; }
        .report-card { background: #f7fafc; border-radius: 8px; padding: 20px; }
        .report-value { font-size: 24px; font-weight: 700; color: #2d3748; }
        .report-label { font-size: 14px; color: #718096; margin-top: 5px; }
        .report-note { font-size: 12px; color: #a0aec0; margin-top: 5px; }
        /* 设置弹窗 */
        .modal-overlay { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; }
        .modal-overlay.active { display: flex; }
        .modal { background: white; border-radius: 12px; padding: 30px; max-width: 400px; width: 90%; }
        .modal h3 { margin-bottom: 20px; }
        .modal select { width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 16px; margin-bottom: 20px; }
        .modal-btns { display: flex; gap: 10px; justify-content: flex-end; }
        @media (max-width: 768px) {
            .grade-selector { grid-template-columns: repeat(3, 1fr); }
            .stats-grid { grid-template-columns: repeat(2, 1fr); }
            .topic-item { flex-direction: column; align-items: flex-start; gap: 10px; }
            .container { padding: 10px; }
        }
    </style>
</head>
<body>
    <header>
        <h1>诊断中心</h1>
        <p>基于知识图谱的自适应诊断，精准找到学习薄弱点</p>
        <div class="header-btns">
            <button class="header-btn" onclick="showReview()">🔄 今日复习</button>
            <button class="header-btn" onclick="showErrorNotebook()">📕 错题本</button>
            <button class="header-btn" onclick="showWeeklyReport()">📊 每周战报</button>
            <button class="header-btn" onclick="openSettings()">⚙️ 设置年级</button>
            <button class="header-btn" onclick="openHumanEdu()">📖 人性教育</button>
            <button class="header-btn" onclick="exportProgress()">💾 导出进度</button>
        </div>
        <div id="loadStatus">正在加载数据...</div>
        <div id="reviewBanner" style="display:none;"></div>
    </header>

    <div class="container">
        <!-- 选题入口 -->
        <div class="card" id="entryCard">
            <div class="card-title">选择要诊断的知识点</div>
            <div class="entry-tabs">
                <div class="entry-tab active" data-entry="grade">按年级册章</div>
                <div class="entry-tab" data-entry="search">搜索知识点</div>
                <div class="entry-tab" data-entry="diagnostic">整册诊断</div>
            </div>

            <div class="entry-content" id="searchEntry" style="display:none;">
                <div class="search-box">
                    <input type="text" class="search-input" id="searchInput" placeholder="输入知识点名称...">
                    <button class="btn btn-primary" onclick="searchTopics()">搜索</button>
                </div>
                <div id="searchResults" style="display:none;">
                    <div class="card-title" style="font-size:16px;">搜索结果</div>
                    <div class="topic-list" id="searchResultList"></div>
                </div>
            </div>

            <div class="entry-content" id="gradeEntry">
                <div class="card-title" style="font-size:16px;">选择学科</div>
                <div class="subject-selector" id="subjectSelector"></div>
                <div class="card-title" style="font-size:16px;">选择年级</div>
                <div class="grade-selector" id="gradeSelector"></div>
                <div id="topicList" style="display:none;">
                    <div class="card-title" style="font-size:16px;">选择知识点（仅显示有诊断题的）</div>
                    <div class="topic-list" id="topicListContent"></div>
                </div>
            </div>

            <div class="entry-content" id="diagnosticEntry" style="display:none;">
                <div class="card-title" style="font-size:16px;">选择学科和年级</div>
                <div class="subject-selector" id="subjectSelector2"></div>
                <div class="grade-selector" id="gradeSelector2"></div>
                <button class="btn btn-primary" onclick="startGradeDiagnostic()">开始整册诊断</button>
            </div>

            <div class="disclaimer">
                <strong>⚠️ 诚实声明：</strong>本应用题目由 AI 生成，未经教师审核；诊断结果仅供学习参考，不构成教学建议。知识点图谱基于人教版课标结构化整理，先修关系未经学生数据检验。
            </div>
        </div>

        <!-- 答题区域 -->
        <div class="card quiz-container" id="quizContainer">
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill" style="width: 0%"></div>
            </div>
            <div class="question-info">
                <span id="questionNumber">第 1 题</span>
                <span id="questionTopic">知识点：--</span>
                <span id="questionDifficulty" class="difficulty-badge">难度：基础</span>
            </div>
            <div class="confirm-message" id="confirmMessage" style="display:none;">
                前面有题没答对，再出一道基础的题确认：这一题也错才算薄弱，答对则标为"不稳"。
            </div>
            <div class="question-text" id="questionText">题目加载中...</div>
            <div class="options" id="optionsContainer"></div>
            <div id="hintBox" style="display:none; margin-top:15px; padding:15px; background:#ebf8ff; border:1px solid #bee3f8; border-radius:8px;">
                <div style="font-weight:600; color:#2b6cb0; margin-bottom:5px;">💡 引导提示</div>
                <div id="hintText" style="color:#2c5282; font-size:14px;"></div>
            </div>
            <div id="parseBox" style="display:none;">
                <div class="parse-title">📖 本题解析</div>
                <div class="parse-text" id="parseText"></div>
            </div>
            <div style="margin-top: 20px; padding: 15px; background: #f7fafc; border-radius: 8px;">
                <div style="font-weight: 600; margin-bottom: 10px;">作答前：这题几成把握？</div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="confidence-btn" data-confidence="0" onclick="selectConfidence(0)">0%</button>
                    <button class="confidence-btn" data-confidence="25" onclick="selectConfidence(25)">25%</button>
                    <button class="confidence-btn" data-confidence="50" onclick="selectConfidence(50)">50%</button>
                    <button class="confidence-btn" data-confidence="75" onclick="selectConfidence(75)">75%</button>
                    <button class="confidence-btn" data-confidence="100" onclick="selectConfidence(100)">100%</button>
                </div>
            </div>
            <div class="quiz-actions">
                <button class="btn btn-secondary" id="hintBtn" onclick="showHint()">💡 提示</button>
                <button class="btn btn-secondary" id="skipBtn" onclick="skipQuestion()">跳过</button>
                <button class="btn btn-primary" id="submitBtn" onclick="submitAnswer()" disabled>提交答案</button>
            </div>
        </div>

        <!-- 结果页 -->
        <div class="card result-container" id="resultContainer">
            <div class="card-title" id="resultTitle">📊 诊断结果</div>
            <div class="stats-grid" id="statsGrid"></div>
            <div class="result-section" id="weakSection">
                <div class="result-section-title">🔴 薄弱知识点</div>
                <div class="topic-list" id="weakList"></div>
            </div>
            <div class="result-section" id="unstableSection">
                <div class="result-section-title">🟡 不稳知识点</div>
                <div class="topic-list" id="unstableList"></div>
            </div>
            <div class="result-section" id="untestedSection">
                <div class="result-section-title">⚪ 未测知识点</div>
                <div class="topic-list" id="untestedList"></div>
            </div>
            <div class="result-section">
                <div class="result-section-title">🗺️ 推荐学习路径</div>
                <div class="path-container" id="pathContainer"></div>
            </div>
            <div class="result-section" id="lineageSection" style="display:none;">
                <div class="result-section-title">🔍 错题溯源链</div>
                <div id="lineageContent"></div>
            </div>
            <div class="result-section" id="prereqSection" style="display:none;">
                <div class="result-section-title">🔗 前置知识关系</div>
                <div id="prereqContent"></div>
            </div>
            <div class="result-section" id="adviceSection" style="display:none;">
                <div class="result-section-title">💡 学习建议</div>
                <div id="adviceContent"></div>
            </div>
            <div class="disclaimer">
                <strong>⚠️ 诚实声明：</strong>诊断结果由 AI 生成的题目自动判定，自动判题只是近似的，可能存在误判。建议在答题记录中逐题核对。题目与答案全部由 AI 生成、未经教师审核。
            </div>
            <div style="display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap;">
                <button class="btn btn-success" id="retestBtn" onclick="retest()">🔄 盲区重测</button>
                <button class="btn btn-warning" id="weakPracticeBtn" onclick="startWeakPractice()">🎯 定向练习薄弱点</button>
                <button class="btn btn-primary" onclick="exportResult()">📤 导出结果</button>
                <button class="btn btn-secondary" onclick="backToEntry()">📚 重新选题</button>
            </div>
        </div>

        <!-- 复习区域 -->
        <div class="card review-container" id="reviewContainer">
            <div class="card-title">🔄 今日待复习</div>
            <p style="color: #718096; margin-bottom: 15px;">基于 FSRS 间隔复习算法，以下知识点到了该复习的时间。复习可以巩固记忆，防止遗忘。</p>
            <div id="reviewList"></div>
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button class="btn btn-success" onclick="startReview()">开始复习</button>
                <button class="btn btn-secondary" onclick="backToEntry()">返回选题</button>
            </div>
        </div>

        <!-- 错题本 -->
        <div class="card review-container" id="errorNotebookContainer">
            <div class="card-title">📕 错题本</div>
            <p style="color: #718096; margin-bottom: 15px;">记录做错的题目，定期复习可以加深印象。可标记错因（粗心 / 没掌握 / 不会做），三种错的补法不一样。</p>
            <div id="errorList"></div>
            <div style="display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap;">
                <button class="btn btn-success" onclick="startErrorReview()">复习错题</button>
                <button class="btn btn-warning" onclick="showPracticeSheet()">📋 生成练习卷</button>
                <button class="btn btn-secondary" onclick="backToEntry()">返回选题</button>
            </div>
        </div>

        <!-- 周末巩固 · 练习卷 -->
        <div class="card review-container" id="practiceSheetContainer">
            <div class="card-title">📋 周末巩固 · 练习卷</div>
            <p style="color: #718096; margin-bottom: 10px;">把错题按知识点重新组卷，只出题、不给答案；不想要的题可以去掉，复制文本发给家人或打印。</p>
            <div style="display:flex;gap:8px;margin-bottom:12px;">
                <button class="seg-btn active" id="sheetModeWeek" onclick="setSheetMode('week')">本周错题</button>
                <button class="seg-btn" id="sheetModeAll" onclick="setSheetMode('all')">全部错题</button>
            </div>
            <div id="sheetList"></div>
            <div style="display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="copySheet()">📄 复制题目文本</button>
                <button class="btn btn-secondary" onclick="backFromSheet()">← 返回错题本</button>
            </div>
        </div>

        <!-- 每周战报 -->
        <div class="card review-container" id="weeklyReportContainer">
            <div class="card-title">📊 每周战报</div>
            <p style="color: #718096; margin-bottom: 15px;">本周学习情况汇总</p>
            <div id="weeklyReportContent"></div>
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button class="btn btn-secondary" onclick="backToEntry()">返回选题</button>
            </div>
        </div>
    </div>

    <!-- 设置弹窗 -->
    <div class="modal-overlay" id="settingsModal">
        <div class="modal">
            <h3>⚙️ 设置孩子年级</h3>
            <p style="color: #718096; margin-bottom: 15px;">设置后自动记住，减少每次询问</p>
            <select id="gradeSelect">
                <option value="1">1年级</option>
                <option value="2">2年级</option>
                <option value="3">3年级</option>
                <option value="4">4年级</option>
                <option value="5">5年级</option>
                <option value="6">6年级</option>
            </select>
            <div class="modal-btns">
                <button class="btn btn-secondary" onclick="closeSettings()">取消</button>
                <button class="btn btn-primary" onclick="saveSettings()">保存</button>
            </div>
        </div>
    </div>

    <script>
// ============================================================
// 诊断引擎 v2（自适应诊断）
// ============================================================
__ENGINE_JS__

// ============================================================
// FSRS 间隔复习引擎
// ============================================================
__FSRS_JS__

// ============================================================
// 内嵌数据（离线模式，完全本地运行）
// ============================================================
const topicsData = __TOPICS_JSON__;
const depsData = __DEPS_JSON__;
const questionsData = __QUESTIONS_JSON__;

// ============================================================
// 应用逻辑
// ============================================================
let engine = null;
let fsrs = null;
let session = null;
let currentQuestion = null;
let selectedOption = null;
let selectedConfidence = null;
let currentHintUsed = false;   // 本题是否查看过引导提示（影响"独立作答"判定）
let allTopics = [];

// 错因三分类：三种错的补法不一样（粗心→检查；没掌握→回炉同类型题；不会做→回到前置概念）
const REASON_MAP = {
    careless: { label: '粗心', fix: '下次做完花 10 秒回头检查一遍，重点看运算符号和抄写' },
    unknown: { label: '没掌握', fix: '回到这个知识点，先看引导提示，再做同类型题' },
    unsolved: { label: '不会做', fix: '先看前置知识溯源链，从更基础的概念学起' }
};

function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
let selectedSubject = '数学';
let selectedGrade = 3;
let reviewQueue = [];

// 初始化
function init() {
    try {
        var statusEl = document.getElementById('loadStatus');
        if (statusEl) statusEl.textContent = '正在加载知识点...';

        // 加载保存的年级设置
        loadSavedGrade();

        allTopics = topicsData.topics || topicsData;
        var dependencies = depsData.dependencies || depsData;
        var questions = questionsData.questions || questionsData;

        if (statusEl) statusEl.textContent = '已加载 ' + allTopics.length + ' 个知识点，' + questions.length + ' 道诊断题';

        // 初始化引擎
        engine = new DiagnosticEngine(allTopics, dependencies, questions);
        fsrs = new CNPT.FsrsEngine();

        renderSubjectSelector();
        renderGradeSelector();
        renderTopicList();
        updateReviewBanner();

        if (statusEl) statusEl.textContent = '数据加载完成！当前年级：' + selectedGrade + '年级';
        document.title = '已加载' + allTopics.length + '个知识点（' + selectedGrade + '年级）';
    } catch (e) {
        var statusEl = document.getElementById('loadStatus');
        if (statusEl) statusEl.textContent = '加载失败: ' + e.message;
        console.error('Init error:', e);
    }
}

// 从localStorage读取保存的年级设置
function loadSavedGrade() {
    const savedGrade = localStorage.getItem('childGrade');
    if (savedGrade) {
        selectedGrade = parseInt(savedGrade);
    }
}

// 更新复习提示横幅
function updateReviewBanner() {
    var banner = document.getElementById('reviewBanner');
    if (!banner || !fsrs) return;
    var due = fsrs.getDueToday();
    if (due.length > 0) {
        banner.innerHTML = '📅 今日有 <strong>' + due.length + '</strong> 个知识点待复习 <a onclick="showReview()">立即复习</a>';
        banner.style.display = 'inline-block';
    } else {
        banner.style.display = 'none';
    }
}

// ========== 设置弹窗 ==========
function openSettings() {
    document.getElementById('settingsModal').classList.add('active');
    document.getElementById('gradeSelect').value = selectedGrade;
}
function closeSettings() {
    document.getElementById('settingsModal').classList.remove('active');
}
function saveSettings() {
    const grade = document.getElementById('gradeSelect').value;
    localStorage.setItem('childGrade', grade);
    selectedGrade = parseInt(grade);
    closeSettings();
    renderGradeSelector();
    const statusEl = document.getElementById('loadStatus');
    if (statusEl) statusEl.textContent = '数据加载完成！当前年级：' + selectedGrade + '年级';
}
document.getElementById('settingsModal').addEventListener('click', function(e) {
    if (e.target === this) closeSettings();
});

// ========== 渲染学科选择器 ==========
function renderSubjectSelector() {
    const subjects = [...new Set(allTopics.map(t => t.subject))].filter(s => s);
    const container = document.getElementById('subjectSelector');
    const container2 = document.getElementById('subjectSelector2');
    container.innerHTML = '';
    container2.innerHTML = '';

    subjects.forEach(subject => {
        const btn = document.createElement('div');
        btn.className = 'subject-btn' + (subject === selectedSubject ? ' active' : '');
        btn.textContent = subject;
        btn.onclick = () => {
            selectedSubject = subject;
            document.querySelectorAll('#subjectSelector .subject-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderGradeSelector();
        };
        container.appendChild(btn);

        const btn2 = btn.cloneNode(true);
        btn2.onclick = () => {
            selectedSubject = subject;
            document.querySelectorAll('#subjectSelector2 .subject-btn').forEach(b => b.classList.remove('active'));
            btn2.classList.add('active');
        };
        container2.appendChild(btn2);
    });
}

// ========== 渲染年级选择器 ==========
function renderGradeSelector() {
    const container = document.getElementById('gradeSelector');
    const container2 = document.getElementById('gradeSelector2');
    container.innerHTML = '';
    container2.innerHTML = '';

    for (let grade = 1; grade <= 6; grade++) {
        const count = allTopics.filter(t => t.subject === selectedSubject && t.grade === grade).length;
        const btn = document.createElement('div');
        btn.className = 'grade-btn' + (grade === selectedGrade ? ' active' : '');
        btn.innerHTML = '<div class="grade-name">' + grade + '年级</div><div class="topic-count">' + count + '个知识点</div>';
        btn.onclick = () => {
            selectedGrade = grade;
            localStorage.setItem('childGrade', grade);
            document.querySelectorAll('#gradeSelector .grade-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTopicList();
        };
        container.appendChild(btn);

        const btn2 = btn.cloneNode(true);
        btn2.onclick = () => {
            selectedGrade = grade;
            localStorage.setItem('childGrade', grade);
            document.querySelectorAll('#gradeSelector2 .grade-btn').forEach(b => b.classList.remove('active'));
            btn2.classList.add('active');
        };
        container2.appendChild(btn2);
    }
}

// ========== 渲染知识点列表（仅显示有诊断题的） ==========
function renderTopicList() {
    const container = document.getElementById('topicListContent');
    container.innerHTML = '';
    const diagnosticTopicIds = new Set(engine.questions.map(q => q.topicId));
    const topics = allTopics.filter(t =>
        t.subject === selectedSubject &&
        t.grade === selectedGrade &&
        diagnosticTopicIds.has(t.id)
    );

    if (topics.length === 0) {
        container.innerHTML = '<div class="loading">该年级暂无可诊断的知识点，请选择其他年级或学科</div>';
        document.getElementById('topicList').style.display = 'block';
        return;
    }

    topics.forEach(topic => {
        const item = document.createElement('div');
        item.className = 'topic-item';
        const reviewStatus = fsrs ? fsrs.getStatus(topic.id) : null;
        let statusBadge = '';
        if (reviewStatus) {
            if (reviewStatus.isDue) {
                statusBadge = '<span class="topic-status status-weak">待复习</span>';
            } else {
                statusBadge = '<span class="topic-status status-mastered">' + reviewStatus.daysUntil + '天后复习</span>';
            }
        }
        item.innerHTML = '<div class="topic-info"><h4>' + topic.name + '</h4><p>' + (topic.description || '') + '</p></div><div style="display:flex;gap:8px;align-items:center;">' + statusBadge + '<button class="btn btn-primary btn-sm" onclick="startDiagnostic(\'' + topic.id + '\')">开始诊断</button></div>';
        container.appendChild(item);
    });

    document.getElementById('topicList').style.display = 'block';
}

// ========== 搜索知识点 ==========
function searchTopics() {
    const keyword = document.getElementById('searchInput').value.trim();
    if (!keyword) return;
    const diagnosticTopicIds = new Set(engine.questions.map(q => q.topicId));
    const results = allTopics.filter(t =>
        t.name && t.name.includes(keyword) && diagnosticTopicIds.has(t.id)
    );
    const container = document.getElementById('searchResultList');
    container.innerHTML = '';
    if (results.length === 0) {
        container.innerHTML = '<div class="loading">未找到相关知识点</div>';
    } else {
        results.forEach(topic => {
            const item = document.createElement('div');
            item.className = 'topic-item';
            item.innerHTML = '<div class="topic-info"><h4>' + topic.name + '</h4><p>' + topic.subject + ' · ' + topic.grade + '年级 · ' + (topic.description || '') + '</p></div><button class="btn btn-primary btn-sm" onclick="startDiagnostic(\'' + topic.id + '\')">开始诊断</button>';
            container.appendChild(item);
        });
    }
    document.getElementById('searchResults').style.display = 'block';
}

// ========== 开始诊断 ==========
function startDiagnostic(topicId) {
    session = engine.startSession(topicId, {
        maxQuestions: 20,
        confirmOnFail: true,
        autoBacktrack: true
    });
    document.getElementById('entryCard').style.display = 'none';
    document.getElementById('quizContainer').classList.add('active');
    document.getElementById('resultContainer').classList.remove('active');
    loadNextQuestion();
}

// ========== 整册诊断 ==========
function startGradeDiagnostic() {
    const topics = allTopics.filter(t => t.subject === selectedSubject && t.grade === selectedGrade);
    if (topics.length === 0) { alert('该年级暂无知识点'); return; }
    const diagnosticTopicIds = new Set(engine.questions.map(q => q.topicId));
    const diagnosticTopics = topics.filter(t => diagnosticTopicIds.has(t.id));
    if (diagnosticTopics.length === 0) { alert('该年级暂无诊断题'); return; }
    const targetTopic = diagnosticTopics[0];
    session = engine.startSession(targetTopic.id, {
        maxQuestions: Math.min(diagnosticTopics.length * 2, 40),
        confirmOnFail: true,
        autoBacktrack: true
    });
    for (const topic of diagnosticTopics) {
        session.queue.push({
            topicId: topic.id,
            priority: 2,
            reason: '整册诊断：' + selectedSubject + selectedGrade + '年级'
        });
    }
    document.getElementById('entryCard').style.display = 'none';
    document.getElementById('quizContainer').classList.add('active');
    document.getElementById('resultContainer').classList.remove('active');
    loadNextQuestion();
}

// ========== 加载下一道题 ==========
function loadNextQuestion() {
    const question = engine.getNextQuestion(session);
    if (!question) { showResults(); return; }
    currentQuestion = question;
    selectedOption = null;
    selectedConfidence = null;
    currentHintUsed = false;
    document.querySelectorAll('.confidence-btn').forEach(btn => btn.classList.remove('selected'));
    const progress = (session.questionCount / session.options.maxQuestions) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    // 练习模式在 getNextQuestion 中已计数，诊断模式在提交后计数
    const displayIndex = session.practiceMode ? session.questionCount : session.questionCount + 1;
    document.getElementById('questionNumber').textContent = '第 ' + displayIndex + ' 题 / ' + (session.practiceMode ? '共' : '最多') + session.options.maxQuestions + '题';
    const topic = engine.getTopicInfo(question.topicId);
    document.getElementById('questionTopic').textContent = '知识点：' + (topic ? topic.name : question.topicId);
    const diffNames = { basic: '基础', medium: '中等', hard: '拔高' };
    document.getElementById('questionDifficulty').textContent = '难度：' + (diffNames[question.question.difficulty] || '基础');
    if (question.type === 'confirm') {
        document.getElementById('confirmMessage').style.display = 'block';
    } else {
        document.getElementById('confirmMessage').style.display = 'none';
    }
    document.getElementById('questionText').textContent = question.question.question;
    document.getElementById('hintBox').style.display = 'none';
    document.getElementById('parseBox').style.display = 'none';
    document.getElementById('hintBtn').style.display = 'inline-block';
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    question.question.options.forEach((option, index) => {
        const optionEl = document.createElement('div');
        optionEl.className = 'option';
        optionEl.innerHTML = '<div class="option-label">' + String.fromCharCode(65 + index) + '</div><div>' + option + '</div>';
        optionEl.onclick = () => selectOption(index);
        optionsContainer.appendChild(optionEl);
    });
    document.getElementById('submitBtn').disabled = true;
}

// ========== 选择选项 ==========
function selectOption(index) {
    selectedOption = index;
    document.querySelectorAll('.option').forEach((el, i) => {
        el.classList.toggle('selected', i === index);
    });
    document.getElementById('submitBtn').disabled = false;
}

// ========== 选择信心 ==========
function selectConfidence(confidence) {
    selectedConfidence = confidence;
    document.querySelectorAll('.confidence-btn').forEach(btn => {
        btn.classList.toggle('selected', parseInt(btn.dataset.confidence) === confidence);
    });
}

// ========== 提交答案 ==========
function submitAnswer() {
    if (selectedOption === null) return;
    let result;
    if (currentQuestion.type === 'confirm') {
        result = engine.submitConfirmAnswer(session, currentQuestion.question.id, selectedOption);
    } else {
        result = engine.submitAnswer(session, currentQuestion.question.id, selectedOption);
    }
    
    // 记录到FSRS v2（含信心校准）；看过引导提示则不算"独立作答"
    if (fsrs && currentQuestion) {
        const isIndependent = !currentHintUsed;
        fsrs.recordAnswer(
            currentQuestion.topicId,
            result.correct,
            isIndependent,
            selectedConfidence,
            {
                questionId: currentQuestion.question.id,
                question: currentQuestion.question.question,
                options: currentQuestion.question.options,
                answer: currentQuestion.question.answer,
                selected: selectedOption
            }
        );
    }

    const options = document.querySelectorAll('.option');
    options.forEach((el, i) => {
        if (i === currentQuestion.question.answer) {
            el.classList.add('correct');
        } else if (i === selectedOption && !result.correct) {
            el.classList.add('wrong');
        }
    });

    // 定向练习模式：展示本题解析，由孩子看清错因后手动进入下一题
    if (session.practiceMode && currentQuestion) {
        const q = currentQuestion.question;
        const correctText = (q.options && q.options[q.answer]) || '';
        let parseHtml = '<strong>✅ 正确答案：' + String.fromCharCode(65 + q.answer) + '. ' + correctText + '</strong>';
        if (q.hint) {
            parseHtml += '<br>💡 引导：' + q.hint;
        }
        if (!result.correct) {
            parseHtml += '<br>❌ 这题还没掌握，已记入错题本。点一下错因，补法更对症：';
            parseHtml += '<div class="reason-row"><span style="font-size:12px;color:#718096;">错因</span>' +
                '<button class="reason-btn" data-reason="careless" onclick="markReason(\'careless\')">粗心</button>' +
                '<button class="reason-btn" data-reason="unknown" onclick="markReason(\'unknown\')">没掌握</button>' +
                '<button class="reason-btn" data-reason="unsolved" onclick="markReason(\'unsolved\')">不会做</button>' +
                '<input id="reasonNote" placeholder="当时怎么想的？（一句就行）" style="flex:1;min-width:120px;border:1px solid #e2e8f0;border-radius:6px;padding:4px 8px;font-size:12px;">' +
                '</div><div id="fixHint" class="fix-text" style="display:none;"></div>';
        } else {
            parseHtml += '<br>🎉 答对了！这个知识点正在变扎实。';
        }
        parseHtml += '<div style="margin-top:10px;"><button class="btn btn-primary btn-sm" onclick="loadNextQuestion()">下一题 ▶</button></div>';
        document.getElementById('parseText').innerHTML = parseHtml;
        document.getElementById('parseBox').style.display = 'block';
        return;
    }

    setTimeout(() => { loadNextQuestion(); }, 1500);
}

// ========== 显示提示 ==========
function showHint() {
    if (!currentQuestion || !currentQuestion.question.hint) return;
    document.getElementById('hintText').textContent = currentQuestion.question.hint;
    document.getElementById('hintBox').style.display = 'block';
    document.getElementById('hintBtn').style.display = 'none';
    currentHintUsed = true;
}

// ========== 跳过题目 ==========
function skipQuestion() { loadNextQuestion(); }

// ========== 显示结果 ==========
function showResults() {
    const isPractice = !!(session && session.practiceMode);
    const report = engine.finishSession(session);
    document.getElementById('quizContainer').classList.remove('active');
    document.getElementById('resultContainer').classList.add('active');

    // 练习模式与诊断模式的界面差异
    document.getElementById('resultTitle').textContent = isPractice ? '🎯 定向练习成绩' : '📊 诊断结果';
    document.getElementById('retestBtn').style.display = isPractice ? 'none' : '';
    document.getElementById('weakPracticeBtn').textContent = isPractice ? '🎯 再练一次' : '🎯 定向练习薄弱点';

    // 统计
    const statsGrid = document.getElementById('statsGrid');
    statsGrid.innerHTML =
        '<div class="stat-card"><div class="stat-value">' + report.statistics.totalQuestions + '</div><div class="stat-label">已答题数</div></div>' +
        '<div class="stat-card weak"><div class="stat-value">' + report.statistics.weakCount + '</div><div class="stat-label">薄弱</div></div>' +
        '<div class="stat-card unstable"><div class="stat-value">' + report.statistics.unstableCount + '</div><div class="stat-label">不稳</div></div>' +
        '<div class="stat-card untested"><div class="stat-value">' + report.statistics.untestedCount + '</div><div class="stat-label">未测</div></div>';

    renderResultList('weakList', report.results.weak, '薄弱');
    renderResultList('unstableList', report.results.unstable, '不稳');
    renderResultList('untestedList', report.results.untested, '未测');

    // 学习路径
    const pathContainer = document.getElementById('pathContainer');
    pathContainer.innerHTML = '';
    if (report.learningPath.length === 0) {
        pathContainer.innerHTML = '<div class="loading">🎉 太棒了！没有发现薄弱点，继续保持！</div>';
    } else {
        report.learningPath.forEach((item, index) => {
            const pathItem = document.createElement('div');
            pathItem.className = 'path-item';
            pathItem.innerHTML = '<div class="path-step ' + item.status + '">' + (index + 1) + '</div><div><div style="font-weight:600;">' + item.name + '</div><div style="font-size:14px;color:#718096;">' + item.subject + ' · ' + item.grade + '年级 · ' + (item.description || '') + '</div></div>';
            pathContainer.appendChild(pathItem);
        });
    }

    renderLineage(report);
    renderAdvice(report);
    renderPrereq(report);
}

// ========== 错因标记（练习解析面板 & 结果页薄弱项） ==========
function markReason(reason) {
    if (!fsrs) return;
    const noteEl = document.getElementById('reasonNote');
    const note = noteEl ? noteEl.value.trim() : '';
    fsrs.updateLastError(reason, note || null);
    document.querySelectorAll('#parseBox .reason-btn').forEach(b => b.classList.remove('selected'));
    const btn = document.querySelector('#parseBox .reason-btn[data-reason="' + reason + '"]');
    if (btn) btn.classList.add('selected');
    const fix = document.getElementById('fixHint');
    if (fix && REASON_MAP[reason]) {
        fix.textContent = '💊 补法：' + REASON_MAP[reason].fix;
        fix.style.display = 'block';
    }
}

function markWeakReason(topicId, reason) {
    if (!fsrs) return;
    fsrs.updateLastErrorByTopic(topicId, reason);
    const info = REASON_MAP[reason];
    const btn = document.querySelector('[data-topic="' + topicId + '"]');
    if (btn && btn.parentElement) {
        btn.parentElement.innerHTML = '<span class="fix-text">💊 ' + info.fix + '</span>';
    }
}

function renderResultList(containerId, items, status) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    if (items.length === 0) {
        container.innerHTML = '<div class="loading">暂无</div>';
        return;
    }
    items.forEach(item => {
        const topic = allTopics.find(t => t.id === item.topicId);
        const topicItem = document.createElement('div');
        topicItem.className = 'topic-item';
        let reasonRow = '';
        if (status === '薄弱' || status === '不稳') {
            reasonRow = '<div class="reason-row"><span style="font-size:12px;color:#a0aec0;">错因</span>' +
                '<button class="reason-btn" data-topic="' + item.topicId + '" onclick="markWeakReason(\'' + item.topicId + '\', \'careless\')">粗心</button>' +
                '<button class="reason-btn" data-topic="' + item.topicId + '" onclick="markWeakReason(\'' + item.topicId + '\', \'unknown\')">没掌握</button>' +
                '<button class="reason-btn" data-topic="' + item.topicId + '" onclick="markWeakReason(\'' + item.topicId + '\', \'unsolved\')">不会做</button>' +
                '</div>';
        }
        const practiceBtn = (status !== '未测')
            ? '<button class="btn btn-warning btn-sm" style="margin-left:8px;" onclick="startPractice([\'' + item.topicId + '\'])">▶ 练习</button>'
            : '';
        topicItem.innerHTML = '<div class="topic-info"><h4>' + (topic ? topic.name : item.topicId) + '</h4><p>' + (item.message || '') + '</p>' + reasonRow + '</div><span style="display:flex;align-items:center;"><span class="topic-status status-' + (status === '薄弱' ? 'weak' : status === '不稳' ? 'unstable' : 'untested') + '">' + status + '</span>' + practiceBtn + '</span>';
        container.appendChild(topicItem);
    });
}

// ========== 渲染学习建议 ==========
function renderAdvice(report) {
    const adviceSection = document.getElementById('adviceSection');
    const adviceContent = document.getElementById('adviceContent');
    if (report.learningPath.length === 0) {
        adviceSection.style.display = 'none';
        return;
    }
    adviceSection.style.display = 'block';
    const weakItem = report.learningPath.find(item => item.status === 'weak');
    if (!weakItem) {
        adviceContent.innerHTML = '<div class="loading">继续保持，定期复习即可</div>';
        return;
    }
    const advice = engine.getStudyAdvice(weakItem.topicId);
    let html = '<div class="topic-item" style="margin-bottom:15px;"><div class="topic-info"><h4>📚 ' + advice.topic + '</h4><p>' + (advice.description || '') + '</p></div></div>';
    if (advice.prerequisites.length > 0) {
        html += '<div style="margin-bottom:10px;"><strong>前置知识：</strong>' + advice.prerequisites.map(p => '<span class="topic-status ' + (p.strength === 'hard' ? 'status-weak' : 'status-unstable') + '" style="margin-right:5px;">' + p.name + '</span>').join('') + '</div>';
    }
    if (advice.successors.length > 0) {
        html += '<div style="margin-bottom:10px;"><strong>后续应用：</strong>' + advice.successors.map(s => '<span class="topic-status status-mastered" style="margin-right:5px;">' + s.name + '</span>').join('') + '</div>';
    }
    if (advice.tips.length > 0) {
        html += '<div style="background:#f7fafc;padding:15px;border-radius:8px;margin-top:10px;"><strong>💡 学习建议：</strong><ul style="margin:10px 0 0 20px;padding:0;">' + advice.tips.map(tip => '<li style="margin-bottom:5px;">' + tip + '</li>').join('') + '</ul></div>';
    }
    adviceContent.innerHTML = html;
}

// ========== 渲染前置知识关系 ==========
function renderPrereq(report) {
    const prereqSection = document.getElementById('prereqSection');
    const prereqContent = document.getElementById('prereqContent');
    
    if (report.learningPath.length === 0) {
        prereqSection.style.display = 'none';
        return;
    }
    
    // 获取第一个薄弱知识点的前置知识
    const weakItem = report.learningPath.find(item => item.status === 'weak');
    if (!weakItem) {
        prereqSection.style.display = 'none';
        return;
    }
    
    const advice = engine.getStudyAdvice(weakItem.topicId);
    let html = '';
    
    if (advice.prerequisites.length > 0) {
        html += '<div style="margin-bottom:15px;"><strong>📚 需要先掌握：</strong></div>';
        advice.prerequisites.forEach(p => {
            const isHard = p.strength === "hard";
            const strengthLabel = isHard ? "必须先学" : "建议先学";
            const strengthClass = isHard ? "status-weak" : "status-unstable";
            const stepClass = isHard ? "weak" : "unstable";
            html += '<div class="path-item"><div class="path-step ' + stepClass + '">前置</div><div><div style="font-weight:600;">' + p.name + '</div><div style="font-size:14px;color:#718096;">' + p.subject + ' · ' + p.grade + '年级 · <span class="topic-status ' + strengthClass + '">' + strengthLabel + '</span></div></div></div>';
        });
    }
    
    if (advice.successors.length > 0) {
        html += '<div style="margin-top:15px; margin-bottom:15px;"><strong>📈 后续会用到：</strong></div>';
        advice.successors.forEach(s => {
            html += '<div class="path-item"><div class="path-step mastered">后续</div><div><div style="font-weight:600;">' + s.name + '</div><div style="font-size:14px;color:#718096;">' + s.subject + ' · ' + s.grade + '年级</div></div></div>';
        });
    }
    
    prereqContent.innerHTML = html;
    prereqSection.style.display = 'block';
}

// ========== 错题溯源链（跨学段追溯） ==========
function renderLineage(report) {
    const section = document.getElementById('lineageSection');
    const content = document.getElementById('lineageContent');
    // 优先展示最薄弱的知识点；没有薄弱则展示第一个需要学习的
    const target = report.learningPath.find(item => item.status === 'weak') || report.learningPath[0];
    if (!target) {
        section.style.display = 'none';
        return;
    }
    const lineage = engine.traceLineage(target.topicId);
    if (!lineage || !lineage.nodes || lineage.nodes.length <= 1) {
        section.style.display = 'none';
        return;
    }
    // 反转：从最底层前置一路指向当前错题知识点
    const nodes = lineage.nodes.slice().reverse();
    let banner = '<div class="lineage-banner">🔍 <strong>' + (target.name || '') + '</strong> 的错题溯源链：';
    if (lineage.crossGrade && lineage.gradeSpan) {
        banner += '从 ' + lineage.gradeSpan[1] + ' 年级一路追溯到 <strong>' + lineage.gradeSpan[0] + ' 年级</strong>，';
    }
    banner += '共涉及 ' + lineage.ancestorCount + ' 个前置知识点';
    if (lineage.crossGrade && lineage.gradeSpan) {
        banner += '（横跨 ' + (lineage.gradeSpan[1] - lineage.gradeSpan[0] + 1) + ' 个年级）';
    }
    banner += '。顺着这条链逐环检查，哪一环没掌握就补哪一环。</div>';

    let html = banner + '<div class="lineage-chain">';
    nodes.forEach((n, idx) => {
        const isTarget = idx === nodes.length - 1;
        const gradeLabel = (n.grade !== null && n.grade !== undefined) ? (n.grade + ' 年级') : '';
        html += '<div class="lineage-node' + (isTarget ? ' target' : '') + '">';
        html += '<span class="lineage-grade">' + gradeLabel + '</span>';
        html += '<div><div class="lineage-name">' + n.name + '</div>';
        if (isTarget) {
            html += '<div class="lineage-meta">👈 本次错误对应的知识点</div>';
        } else if (n.reason) {
            html += '<div class="lineage-reason">⛓ ' + n.reason + '</div>';
        }
        html += '</div></div>';
        if (!isTarget) {
            html += '<div class="lineage-arrow">↓ 依赖</div>';
        }
    });
    html += '</div>';
    content.innerHTML = html;
    section.style.display = 'block';
}

// ========== 定向练习（哪里薄弱练哪里） ==========
function startPractice(topicIds) {
    if (!topicIds || topicIds.length === 0) { alert('没有可练习的知识点'); return; }
    session = engine.startPractice(topicIds);
    if (!session.practiceQueue || session.practiceQueue.length === 0) {
        alert('这些知识点暂无练习题，请先进行诊断');
        session = null;
        return;
    }
    document.getElementById('entryCard').style.display = 'none';
    document.getElementById('resultContainer').classList.remove('active');
    document.getElementById('quizContainer').classList.add('active');
    loadNextQuestion();
}

function startWeakPractice() {
    const ids = [];
    if (session && session.results) {
        (session.results.weak || []).forEach(w => ids.push(w.topicId));
        (session.results.unstable || []).forEach(u => ids.push(u.topicId));
    }
    startPractice(ids);
}

// ========== 盲区重测 ==========
function retest() {
    session = engine.retest(session);
    document.getElementById('resultContainer').classList.remove('active');
    document.getElementById('quizContainer').classList.add('active');
    loadNextQuestion();
}

// ========== 导出结果 ==========
function exportResult() {
    const report = engine.finishSession(session);
    const dataStr = JSON.stringify(report, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '诊断结果_' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
}

// ========== 返回选题 ==========
function backToEntry() {
document.getElementById('resultContainer').classList.remove('active');
document.getElementById('quizContainer').classList.remove('active');
document.getElementById('reviewContainer').classList.remove('active');
document.getElementById('errorNotebookContainer').classList.remove('active');
document.getElementById('weeklyReportContainer').classList.remove('active');
document.getElementById('practiceSheetContainer').classList.remove('active');
document.getElementById('entryCard').style.display = 'block';
updateReviewBanner();
renderTopicList();
}

// ========== 复习系统（FSRS） ==========
function showReview() {
    if (!fsrs) return;
    const due = fsrs.getDueToday();
    const container = document.getElementById('reviewList');
    container.innerHTML = '';
    if (due.length === 0) {
        container.innerHTML = '<div class="loading">🎉 今日暂无待复习的知识点，明天再来看看吧！</div>';
        reviewQueue = [];
    } else {
        reviewQueue = due;
        due.forEach(topicId => {
            const topic = allTopics.find(t => t.id === topicId);
            const status = fsrs.getStatus(topicId);
            const item = document.createElement('div');
            item.className = 'review-item';
            const dormantText = status && status.dormant ? ' · 休眠抽检' : '';
            const daysText = status && status.daysUntil !== null ? status.daysUntil + '天后' : '';
            item.innerHTML = '<div class="review-item-info"><div class="review-item-name">' + (topic ? topic.name : topicId) + '</div><div class="review-item-meta">' + (topic ? topic.subject + ' · ' + topic.grade + '年级' : '') + dormantText + ' · ' + daysText + '</div></div><span class="review-due">待复习</span>';
            container.appendChild(item);
        });
    }
    document.getElementById('entryCard').style.display = 'none';
    document.getElementById('resultContainer').classList.remove('active');
    document.getElementById('quizContainer').classList.remove('active');
    document.getElementById('errorNotebookContainer').classList.remove('active');
    document.getElementById('weeklyReportContainer').classList.remove('active');
    document.getElementById('reviewContainer').classList.add('active');
}

function startReview() {
    if (reviewQueue.length === 0) { alert('没有待复习的知识点'); return; }
    // 复习第一个知识点
    startDiagnostic(reviewQueue[0]);
}

// ========== 错题本 ==========
function showErrorNotebook() {
    if (!fsrs) return;
    const errors = fsrs.getErrors();
    const container = document.getElementById('errorList');
    container.innerHTML = '';
    if (errors.length === 0) {
        container.innerHTML = '<div class="loading">🎉 暂无错题，继续保持！</div>';
    } else {
        // 按时间倒序，只显示最近50条
        const recent = errors.slice(-50).reverse();
        recent.forEach(err => {
            const topic = allTopics.find(t => t.id === err.topicId);
            const item = document.createElement('div');
            item.className = 'error-item';
            const correctText = err.options ? err.options[err.answer] : '';
            const selectedText = err.options ? err.options[err.selected] : '';
            let extraHtml = '';
            if (err.reason && REASON_MAP[err.reason]) {
                extraHtml += '<div class="error-answer">错因：<span class="reason-tag ' + err.reason + '">' + REASON_MAP[err.reason].label + '</span>　💊 ' + REASON_MAP[err.reason].fix + '</div>';
            }
            if (err.note) {
                extraHtml += '<div class="error-answer">💭 当时的想法：' + escapeHtml(err.note) + '</div>';
            }
            item.innerHTML = '<div class="error-question">' + (err.question || '') + '</div>' +
                '<div class="error-answer"><span class="correct">✓ 正确答案：' + correctText + '</span></div>' +
                '<div class="error-answer"><span class="wrong">✗ 你的答案：' + selectedText + '</span></div>' +
                '<div class="error-answer" style="margin-top:5px;">知识点：' + (topic ? topic.name : err.topicId) + ' · ' + (topic ? topic.subject + ' ' + topic.grade + '年级' : '') + '</div>' +
                '<div class="error-answer">信心：' + (err.confidence !== null ? err.confidence + '%' : '未记录') + ' · 时间：' + new Date(err.timestamp).toLocaleString('zh-CN') + '</div>' +
                extraHtml;
            container.appendChild(item);
        });
    }
    document.getElementById('entryCard').style.display = 'none';
    document.getElementById('resultContainer').classList.remove('active');
    document.getElementById('quizContainer').classList.remove('active');
    document.getElementById('reviewContainer').classList.remove('active');
    document.getElementById('errorNotebookContainer').classList.add('active');
}

function startErrorReview() {
    if (!fsrs) return;
    const errors = fsrs.getErrors();
    if (errors.length === 0) { alert('没有错题需要复习'); return; }
    // 找到第一个错题的知识点
    const topicId = errors[errors.length - 1].topicId;
    startDiagnostic(topicId);
}

// ========== 周末巩固 · 生成练习卷 ==========
let sheetMode = 'week';            // week=近7天（以一周为限） | all=全部
let sheetExcluded = new Set();     // 本次组卷剔除的题目 key

function sheetKey(e) {
    return (e.questionId || '') + '|' + e.timestamp;
}

function getSheetErrors() {
    const errors = fsrs ? fsrs.getErrors() : [];
    if (sheetMode === 'week') {
        const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
        return errors.filter(e => e.timestamp >= weekAgo);
    }
    return errors.slice();
}

function showPracticeSheet() {
    if (!fsrs) return;
    sheetExcluded = new Set();
    document.getElementById('errorNotebookContainer').classList.remove('active');
    document.getElementById('practiceSheetContainer').classList.add('active');
    renderSheet();
}

function backFromSheet() {
    document.getElementById('practiceSheetContainer').classList.remove('active');
    document.getElementById('errorNotebookContainer').classList.add('active');
}

function setSheetMode(mode) {
    sheetMode = mode;
    sheetExcluded = new Set();
    renderSheet();
}

function excludeSheetItem(key) {
    sheetExcluded.add(key);
    renderSheet();
}

function renderSheet() {
    document.getElementById('sheetModeWeek').classList.toggle('active', sheetMode === 'week');
    document.getElementById('sheetModeAll').classList.toggle('active', sheetMode === 'all');
    const list = document.getElementById('sheetList');
    const errors = getSheetErrors().filter(e => !sheetExcluded.has(sheetKey(e)));
    if (errors.length === 0) {
        list.innerHTML = '<div class="loading">' + (fsrs.getErrors().length === 0 ? '🎉 暂无错题，先从诊断或练习开始吧' : '本周没有新错题，可切换到「全部错题」看看历史') + '</div>';
        return;
    }
    // 按知识点分组
    const groups = {};
    errors.forEach(e => {
        if (!groups[e.topicId]) groups[e.topicId] = [];
        groups[e.topicId].push(e);
    });
    let html = '';
    let seq = 0;
    Object.keys(groups).forEach(topicId => {
        const topic = allTopics.find(t => t.id === topicId);
        const name = topic ? topic.name : topicId;
        const meta = topic ? (topic.subject + ' · ' + topic.grade + '年级') : '';
        html += '<div class="sheet-group-title">' + escapeHtml(name) + (meta ? ' <span style="font-weight:400;font-size:12px;color:#a0aec0;">' + escapeHtml(meta) + '</span>' : '') + '</div>';
        groups[topicId].forEach(e => {
            seq++;
            const opts = e.options ? e.options.map((o, i) => String.fromCharCode(65 + i) + '. ' + o).join('　') : '';
            html += '<div class="sheet-item"><button class="sheet-remove" onclick="excludeSheetItem(\'' + sheetKey(e) + '\')">✕ 去掉</button>' +
                '<div class="sheet-q">' + seq + '. ' + escapeHtml(e.question || '') + '</div>' +
                (opts ? '<div class="sheet-opts">' + escapeHtml(opts) + '</div>' : '') +
                '</div>';
        });
    });
    html += '<div style="font-size:12px;color:#a0aec0;margin-top:5px;">共 ' + seq + ' 道题 · 只出题不给答案，做完可回错题本对答案</div>';
    list.innerHTML = html;
}

function copySheet() {
    const errors = getSheetErrors().filter(e => !sheetExcluded.has(sheetKey(e)));
    if (errors.length === 0) { alert('没有可复制的题目'); return; }
    const groups = {};
    errors.forEach(e => {
        if (!groups[e.topicId]) groups[e.topicId] = [];
        groups[e.topicId].push(e);
    });
    let text = '📋 周末巩固练习卷（' + (sheetMode === 'week' ? '本周' : '全部') + ' · ' + errors.length + ' 道题）\n';
    text += '说明：只出题不给答案，做完回错题本核对。\n';
    let seq = 0;
    Object.keys(groups).forEach(topicId => {
        const topic = allTopics.find(t => t.id === topicId);
        text += '\n【' + (topic ? topic.name : topicId) + (topic ? '（' + topic.subject + '·' + topic.grade + '年级）' : '') + '】\n';
        groups[topicId].forEach(e => {
            seq++;
            text += seq + '. ' + (e.question || '') + '\n';
            if (e.options) {
                e.options.forEach((o, i) => {
                    text += '    ' + String.fromCharCode(65 + i) + '. ' + o + '\n';
                });
            }
        });
    });
    text += '\n—— 由 cn-primary-taxonomy 离线诊断生成';
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => alert('已复制 ' + errors.length + ' 道题到剪贴板')).catch(() => fallbackCopy(text, errors.length));
    } else {
        fallbackCopy(text, errors.length);
    }
}

function fallbackCopy(text, count) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
        document.execCommand('copy');
        alert('已复制 ' + (count || '') + ' 道题到剪贴板');
    } catch (err) {
        alert('复制失败：' + err.message);
    }
    document.body.removeChild(ta);
}

// ========== 每周战报 ==========
function showWeeklyReport() {
    if (!fsrs) return;
    const report = fsrs.getWeeklyReport();
    const container = document.getElementById('weeklyReportContent');
    
    let html = '<div class="report-grid">';
    
    // 总复习次数
    html += '<div class="report-card"><div class="report-value">' + report.totalReviews + '</div><div class="report-label">本周复习次数</div></div>';
    
    // 独立答对率
    if (report.independentAccuracy) {
        html += '<div class="report-card"><div class="report-value">' + report.independentAccuracy.rate + '%</div><div class="report-label">独立答对率</div><div class="report-note">' + report.independentAccuracy.independentCorrect + '/' + report.independentAccuracy.independentCount + ' 题</div></div>';
    } else {
        html += '<div class="report-card"><div class="report-value">--</div><div class="report-label">独立答对率</div><div class="report-note">样本不足</div></div>';
    }
    
    // 信心校准偏差
    if (report.calibration && report.calibration.sampleSize >= 15) {
        const bias = report.calibration.bias;
        let biasText = bias > 0 ? '高估自己 ' + bias + '%' : bias < 0 ? '低估自己 ' + Math.abs(bias) + '%' : '校准准确';
        html += '<div class="report-card"><div class="report-value">' + bias + '%</div><div class="report-label">信心校准偏差</div><div class="report-note">' + biasText + '</div></div>';
    } else {
        html += '<div class="report-card"><div class="report-value">--</div><div class="report-label">信心校准偏差</div><div class="report-note">样本不足（需≥15次）</div></div>';
    }
    
    // 同类错误复发率
    if (report.recurrenceRate) {
        html += '<div class="report-card"><div class="report-value">' + report.recurrenceRate.rate + '%</div><div class="report-label">同类错误复发率</div><div class="report-note">' + report.recurrenceRate.recurrentTopics + '/' + report.recurrenceRate.totalTopics + ' 个知识点</div></div>';
    } else {
        html += '<div class="report-card"><div class="report-value">--</div><div class="report-label">同类错误复发率</div><div class="report-note">暂无复发记录</div></div>';
    }
    
    html += '</div>';
    
    // 本周错题数
    html += '<div style="background:#fffaf0;border:1px solid #fbd38d;border-radius:8px;padding:15px;margin-top:15px;">';
    html += '<strong>📕 本周错题数：' + report.errorCount + ' 道</strong>';
    html += '<p style="color:#744210;margin-top:5px;font-size:14px;">提示就算未通过：给了思路、公式、第一步，都算提示。作答前不翻答案、不看笔记，先自己写。</p>';
    html += '</div>';
    
    // 说明
    html += '<div style="background:#f7fafc;border-radius:8px;padding:15px;margin-top:15px;font-size:13px;color:#718096;">';
    html += '<strong>📊 指标说明：</strong><br>';
    html += '• <strong>独立答对率</strong>：不靠提示自己做对的比例（目标：上升）<br>';
    html += '• <strong>信心校准偏差</strong>：平均信心 - 实际正确率（正值=高估自己）<br>';
    html += '• <strong>同类错误复发率</strong>：同一知识点30天内再次答错的比例（目标：下降）';
    html += '</div>';
    
    container.innerHTML = html;
    
    document.getElementById('entryCard').style.display = 'none';
    document.getElementById('resultContainer').classList.remove('active');
    document.getElementById('quizContainer').classList.remove('active');
    document.getElementById('reviewContainer').classList.remove('active');
    document.getElementById('errorNotebookContainer').classList.remove('active');
    document.getElementById('weeklyReportContainer').classList.add('active');
}

// ========== 导出进度 ==========
function exportProgress() {
    if (!fsrs) return;
    const data = {
        fsrs: fsrs.export(),
        childGrade: localStorage.getItem('childGrade'),
        exportedAt: new Date().toISOString()
    };
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '学习进度_' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
}

// ========== 人性教育入口 ==========
function openHumanEdu() {
    window.location.href = 'human-education.html';
}

// ========== 入口切换 ==========
document.querySelectorAll('.entry-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.entry-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const entry = tab.dataset.entry;
        document.getElementById('searchEntry').style.display = entry === 'search' ? 'block' : 'none';
        document.getElementById('gradeEntry').style.display = entry === 'grade' ? 'block' : 'none';
        document.getElementById('diagnosticEntry').style.display = entry === 'diagnostic' ? 'block' : 'none';
    });
});

// ========== 启动 ==========
init();
    </script>
</body>
</html>
'''

# ============================================================
# 替换占位符
# ============================================================
print("\n生成HTML...")
html = HTML_TEMPLATE
html = html.replace('__ENGINE_JS__', engine_js)
html = html.replace('__FSRS_JS__', fsrs_js)
html = html.replace('__TOPICS_JSON__', topics_json)
html = html.replace('__DEPS_JSON__', deps_json)
html = html.replace('__QUESTIONS_JSON__', questions_json)

# 验证替换完整性
for placeholder in ['__ENGINE_JS__', '__FSRS_JS__', '__TOPICS_JSON__', '__DEPS_JSON__', '__QUESTIONS_JSON__']:
    if placeholder in html:
        print(f"⚠️ 警告：占位符 {placeholder} 未被替换！")

# 保存
with open(OUTPUT, 'w', encoding='utf-8') as f:
    f.write(html)

print(f"\n{'='*60}")
print(f"✅ 离线HTML构建完成！")
print(f"   文件: {OUTPUT}")
print(f"   大小: {os.path.getsize(OUTPUT)/1024/1024:.2f} MB")
print(f"{'='*60}")
