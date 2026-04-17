# -*- coding: utf-8 -*-
"""
QClaw 培训课件生成脚本

主要功能：
- 基于 `docs` 目录中的培训材料，生成 48 页 QClaw 寿险培训课件
- 输出结构化的 `planning.json` 与 `style.json`
- 生成可直接进入后续 HTML -> SVG -> PPTX 管线的单页 HTML

使用示例：
    python generate_qclaw_training_deck.py

创建日期：2026-04-17
作者：开发团队
版权声明：Copyright © 2026 企业名称. All rights reserved.
"""

from __future__ import annotations

import html
import json
import shutil
from pathlib import Path
from typing import Iterable


ROOT_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = ROOT_DIR / "ppt-output"
FLAGSHIP_OUTPUT_DIR = ROOT_DIR / "ppt-output-flagship"


STYLE = {
    "style_name": "蓝白商务增强版 (Blue White Business Plus)",
    "style_id": "blue_white_qclaw",
    "background": {"primary": "#F8FBFF", "gradient_to": "#EEF4FF"},
    "card": {
        "gradient_from": "#FFFFFF",
        "gradient_to": "#F2F7FF",
        "border": "rgba(37,99,235,0.14)",
        "border_radius": 18,
    },
    "text": {
        "primary": "#102A43",
        "secondary": "#52667A",
        "title_size": 28,
        "body_size": 14,
        "card_title_size": 20,
    },
    "accent": {
        "primary": ["#2563EB", "#1D4ED8"],
        "secondary": ["#0EA5E9", "#059669"],
    },
    "font_family": "'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif",
    "grid_pattern": {"enabled": False},
    "decorations": {
        "corner_lines": False,
        "glow_effects": False,
        "description": "清爽的金融培训风，配合高密度卡片和柔和渐变色块",
    },
}

FLAGSHIP_STYLE = {
    "style_name": "旗舰发布会版 (Flagship Launch Edition)",
    "style_id": "flagship_launch_qclaw",
    "background": {"primary": "#06111F", "gradient_to": "#0B1C35"},
    "card": {
        "gradient_from": "rgba(10,24,44,0.92)",
        "gradient_to": "rgba(12,33,59,0.92)",
        "border": "rgba(56,189,248,0.22)",
        "border_radius": 20,
    },
    "text": {
        "primary": "#F8FBFF",
        "secondary": "rgba(226,238,255,0.76)",
        "title_size": 30,
        "body_size": 14,
        "card_title_size": 20,
    },
    "accent": {
        "primary": ["#38BDF8", "#2563EB"],
        "secondary": ["#22D3EE", "#A78BFA"],
    },
    "font_family": "'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif",
    "grid_pattern": {"enabled": True},
    "decorations": {
        "corner_lines": True,
        "glow_effects": True,
        "description": "更强的深色旗舰发布会风格，带冷光、层叠面板和更强视觉冲击",
    },
}


def text_card(title: str, content: str, items: list[str] | None = None, span: str = "") -> dict:
    return {
        "card_type": "text",
        "title": title,
        "content": content,
        "items": items or [],
        "span": span,
    }


def data_card(
    title: str,
    value: str,
    label: str,
    description: str,
    progress: int = 0,
    trend: str = "",
    span: str = "",
) -> dict:
    return {
        "card_type": "data",
        "title": title,
        "value": value,
        "label": label,
        "description": description,
        "progress": progress,
        "trend": trend,
        "span": span,
    }


def list_card(title: str, items: list[str], intro: str = "", span: str = "") -> dict:
    return {
        "card_type": "list",
        "title": title,
        "content": intro,
        "items": items,
        "span": span,
    }


def process_card(title: str, steps: list[dict], intro: str = "", span: str = "") -> dict:
    return {
        "card_type": "process",
        "title": title,
        "content": intro,
        "steps": steps,
        "span": span,
    }


def tags_card(title: str, items: list[str], intro: str = "", span: str = "") -> dict:
    return {
        "card_type": "tag_cloud",
        "title": title,
        "content": intro,
        "items": items,
        "span": span,
    }


def compare_card(title: str, items: list[dict], intro: str = "", span: str = "") -> dict:
    return {
        "card_type": "compare",
        "title": title,
        "content": intro,
        "items": items,
        "span": span,
    }


def cover_slide() -> dict:
    return {
        "page_number": 1,
        "page_type": "cover",
        "part_index": 0,
        "part_title": "封面",
        "title": "拥抱AI时代：OpenClaw入门与QClaw寿险实战",
        "subtitle": "了解 AI 技术发展趋势，引导全员先行试用 AI 工具，逐步探索适配路径",
        "meta": ["深圳分公司AI办公实操培训", "培训时长：60分钟", "日期：2026年4月17日"],
        "hero_stats": [
            {"value": "48", "label": "页完整课件"},
            {"value": "4", "label": "核心培训重点"},
            {"value": "当天", "label": "零基础也能上手"},
        ],
    }


def toc_slide() -> dict:
    sections = [
        "趋势认知：5年后的AI与职场畅想",
        "拨云见日：OpenClaw 与大模型的关系",
        "工具上手：为什么选择 QClaw",
        "实操教学：基础办公场景拆解",
        "严守红线：数据安全是生命线",
        "生存指南：传统寿险人的破局之道",
    ]
    return {
        "page_number": 2,
        "page_type": "toc",
        "part_index": 0,
        "part_title": "目录",
        "title": "60 分钟培训路线图",
        "subtitle": "本次培训聚焦安装绑定、核心功能演示、基础办公场景拆解和数据安全，帮助零基础员工先行试用并快速上手。",
        "sections": sections,
        "timeline": [
            ("趋势认知", "10 分钟"),
            ("关系理解", "8 分钟"),
            ("安装绑定", "10 分钟"),
            ("实操演示", "18 分钟"),
            ("安全合规", "8 分钟"),
            ("行动收束", "6 分钟"),
        ],
    }


def section_slide(page_number: int, part_index: int, part_title: str, title: str, subtitle: str, quote: str) -> dict:
    return {
        "page_number": page_number,
        "page_type": "section",
        "part_index": part_index,
        "part_title": part_title,
        "title": title,
        "subtitle": subtitle,
        "quote": quote,
    }


SLIDES = [
    cover_slide(),
    toc_slide(),
    {
        "page_number": 3,
        "page_type": "content",
        "part_index": 1,
        "part_title": "时代呼唤",
        "title": "预测 5 年后的 AI 与职场畅想",
        "summary": "这不是制造焦虑，而是帮助大家看见一个更积极的方向：AI 将成为每位员工身边的办公助手，工作会变得更高效、更轻松。",
        "layout": "hero_3",
        "cards": [
            data_card("趋势判断", "24x", "AI Agent 市场增长", "全球 AI Agent 市场预计在 8 年内增长 24 倍，说明 AI 助手会越来越像每个人办公桌边的“第二大脑”和“第二双手”。", progress=82, trend="长期上行", span="hero"),
            text_card("5年后的变化", "未来 5 年，文件整理、资料汇总、文档撰写、表格处理等基础办公事项，会越来越多地由 AI 助手先做初稿或先做第一步。"),
            list_card("更值得期待的职场画面", ["重复整理更少", "资料汇总更快", "写初稿更轻松", "跨岗位协作更顺畅"], "AI 的价值，不是让人失去位置，而是帮助每个人把精力放到更重要的事情上。"),
            text_card("培训基调", "今天我们不是空谈未来，而是直接上手一个已经能帮助日常办公的工具：QClaw。"),
        ],
    },
    {
        "page_number": 4,
        "page_type": "content",
        "part_index": 1,
        "part_title": "时代呼唤",
        "title": "为什么现在要先行试用 AI 工具",
        "summary": "本次培训重点很明确：先了解趋势，再先行试用，再逐步探索适配路径，重点不是一步到位，而是先建立正确认知和使用习惯。",
        "layout": "hero_3",
        "cards": [
            data_card("同业信号", "95.8%", "智能审核率", "头部寿险同业的数字化能力已经进入深水区：AI 已经从概念展示逐步走向流程提效。", progress=96, trend="效率提升", span="hero"),
            data_card("现实收益", "47%", "件均成本优化", "公开行业案例表明，AI 在后台流程、理赔辅助和审核支持中的价值已经越来越具体。", progress=47, trend="成本下降"),
            text_card("先行试用的意义", "不是要求大家马上变成技术专家，而是先知道它能做什么、不能做什么、最适合从哪里开始试。"),
            text_card("一句结论", "越早形成正确的试用习惯，越容易在未来办公中形成稳定的人机协作方式。"),
        ],
    },
    {
        "page_number": 5,
        "page_type": "content",
        "part_index": 1,
        "part_title": "时代呼唤",
        "title": "AI 的进化：从打字机到数字员工",
        "summary": "理解时代变化最好的方法，就是看它从“会回答”走向“会执行”的路径。",
        "layout": "three_col",
        "cards": [
            process_card(
                "2023 年：聊天机器人",
                [
                    {"title": "提问", "desc": "你问它答"},
                    {"title": "生成", "desc": "输出文本与建议"},
                    {"title": "结束", "desc": "动作还得你自己做"},
                ],
                "这一阶段的 AI 更像智能搜索与文案助手。",
            ),
            process_card(
                "2026 年：智能体 Agent",
                [
                    {"title": "理解", "desc": "理解你的任务"},
                    {"title": "规划", "desc": "自己拆解路径"},
                    {"title": "执行", "desc": "调用工具完成动作"},
                ],
                "OpenClaw 的价值，就在于把 AI 的能力从“说”推进到“做”。",
            ),
            text_card(
                "未来：数字员工团队",
                "未来的组织里，不是一个 AI 做所有事，而是多个能力不同的数字员工协同配合，人负责目标、判断与把关。",
                ["你将从执行者逐步转变为任务分配者、审核者和最终责任人。"],
            ),
        ],
    },
    {
        "page_number": 6,
        "page_type": "content",
        "part_index": 1,
        "part_title": "时代呼唤",
        "title": "什么是 OpenClaw 与“养虾热”",
        "summary": "培训中必须先把词讲明白，不然一开始就会产生距离感和误解。",
        "layout": "mixed_5",
        "cards": [
            text_card(
                "词汇翻译",
                "Claw 的字面意思是“爪子/钳子”。在 AI 语境里，OpenClaw 指的是能真正动手执行任务的数字员工。",
                ["它不只会回答，更会整理、归类、操作和汇报结果。"],
                span="wide",
            ),
            tags_card("“养虾”在说什么", ["培养助手", "调教习惯", "积累提示词", "建立工作流"], "所谓“养虾”，本质是让 AI 越来越懂你的工作语言与工作要求。"),
            list_card("最容易感知的能力", ["整理桌面文件", "写邮件与通知", "生成晨会提纲", "处理 Excel 求助"], "这些都是非技术同事最适合的首批入门动作。"),
        ],
    },
    section_slide(7, 2, "底层逻辑", "拨云见日：理解 AI 的底层逻辑", "先把“大脑”和“双手”的关系讲透，后面所有实操才不会停留在“会用按钮”。", "理解关系，才能理解价值"),
    {
        "page_number": 8,
        "page_type": "content",
        "part_index": 2,
        "part_title": "底层逻辑",
        "title": "核心关系：大模型是大脑，OpenClaw 是双手",
        "summary": "很多人把两者混为一谈，但真正的威力恰恰来自“思考”和“执行”协同。",
        "layout": "three_col",
        "cards": [
            text_card("大语言模型", "负责理解意图、推理路径、组织语言、做出任务规划。没有它，AI 不知道你真正想达成什么结果。"),
            text_card("OpenClaw", "负责调用工具、操作本地环境、读取文件、整理内容、返回执行过程。没有它，AI 只能停留在纸上谈兵。"),
            text_card("最佳组合", "一个负责想，一个负责做。真正的效率提升，不是把人替掉，而是让“思考 + 执行”更快闭环。"),
        ],
    },
    {
        "page_number": 9,
        "page_type": "content",
        "part_index": 2,
        "part_title": "底层逻辑",
        "title": "医院比喻：医生与护士",
        "summary": "抽象技术一旦放进熟悉场景里，非技术同事会立刻明白为什么两者缺一不可。",
        "layout": "two_col",
        "cards": [
            process_card(
                "大模型 = 医生",
                [
                    {"title": "问诊", "desc": "分析病情"},
                    {"title": "判断", "desc": "给出治疗方案"},
                    {"title": "交代", "desc": "明确下一步要做什么"},
                ],
                "医生负责做专业判断，但不直接完成全部操作。",
            ),
            process_card(
                "OpenClaw = 护士",
                [
                    {"title": "接单", "desc": "接收治疗安排"},
                    {"title": "执行", "desc": "打针、拿药、操作设备"},
                    {"title": "反馈", "desc": "汇报结果与异常"},
                ],
                "护士负责把方案落到动作层面，这才叫真正的完成。",
            ),
        ],
    },
    {
        "page_number": 10,
        "page_type": "content",
        "part_index": 2,
        "part_title": "底层逻辑",
        "title": "打车比喻：地图与司机",
        "summary": "同一个逻辑再换一个生活化场景，更方便在培训现场快速复述和记忆。",
        "layout": "two_col",
        "cards": [
            text_card("大模型 = 高德地图", "它会规划路线、估算时间、识别拥堵、给出建议路径。它擅长“告诉你怎么走”。", ["没有地图，司机也可能开，但效率低、容易走弯路。"]),
            text_card("OpenClaw = 滴滴司机", "它会真正踩油门、转方向盘、处理路况并把你送到目的地。它擅长“替你把动作做完”。", ["没有司机，路线再清晰，你也到不了终点。"]),
        ],
    },
    {
        "page_number": 11,
        "page_type": "content",
        "part_index": 2,
        "part_title": "底层逻辑",
        "title": "一次任务是如何被完成的",
        "summary": "让大家看见任务从输入到完成的完整链路，才能理解 AI 不是“魔法”，而是有步骤的自动化。",
        "layout": "hero_3",
        "cards": [
            process_card(
                "桌面整理任务全流程",
                [
                    {"title": "1. 用户输入", "desc": "把桌面的文件按类型分类"},
                    {"title": "2. 模型思考", "desc": "判断需要扫描、归类与新建文件夹"},
                    {"title": "3. OpenClaw 执行", "desc": "读取目录、创建文件夹、移动文件"},
                    {"title": "4. 返回结果", "desc": "汇报完成情况与耗时"},
                ],
                "真正的智能体流程，一定包含理解、规划、调用工具和结果反馈四步。",
                span="hero",
            ),
            text_card("为什么这很重要", "当你理解这套链路后，就知道怎么下更清晰的命令，也知道哪些任务适合交给它。"),
            list_card("适合交给 AI 的动作", ["格式统一", "批量归类", "公开资料整合", "模板生成"], "越是重复、规则明确、可验证的动作，越适合先交给 AI。"),
            list_card("仍需人工把关的动作", ["最终金额确认", "客户承诺口径", "敏感信息判断", "高风险决策"], "涉及责任与合规的关键环节，必须保留人工审核。"),
        ],
    },
    {
        "page_number": 12,
        "page_type": "content",
        "part_index": 2,
        "part_title": "底层逻辑",
        "title": "怎么判断一件事能不能交给 AI",
        "summary": "让员工形成判断框架，比背十个示例更重要，这样他们会自己迁移到真实工作场景。",
        "layout": "mixed_6",
        "cards": [
            tags_card("优先尝试的任务特征", ["重复多", "规则清晰", "结果可核验", "不含敏感信息", "流程标准化"], "这些任务最容易做出正向体验。"),
            text_card("高回报入口", "先从耗时又不值得你持续投入精力的动作开始，比如整理文件、写初稿、生成提纲、问 Excel 操作。"),
            text_card("谨慎入口", "如果任务包含客户隐私、内部机密、金额确认、正式承诺，就必须把 AI 限制在“辅助思考”而不是“直接处理”。"),
            text_card("判断口诀", "先低后高，从低风险动作开始。先试公开信息、模板生成、流程整理，熟悉边界后再逐步增加复杂度。"),
            list_card("能否马上验证", ["能否人工快速复核", "能否看出明显错误", "能否一键撤回或重做", "能否限定在公开资料范围"], "可验证，是把 AI 引入工作的重要前提。"),
            text_card("一页结论", "不要把 AI 当成“全自动替身”，而要把它当成“先做 60-80% 粗活，再由你把关”的助手。"),
        ],
    },
    section_slide(13, 3, "工具选择", "神器盘点：为什么最终选择 QClaw", "不是所有 AI 工具都适合寿险分公司的一线非技术员工，选择错误会导致一上来就挫败。", "选择比努力更重要"),
    {
        "page_number": 14,
        "page_type": "content",
        "part_index": 3,
        "part_title": "工具选择",
        "title": "国内 OpenClaw 竞品比较：为什么最终推荐 QClaw",
        "summary": "对非技术员工来说，关键不是功能宣传，而是谁更容易拿到、谁更容易开始、谁更适合长期试用。",
        "layout": "mixed_5",
        "cards": [
            compare_card(
                "四类产品格局",
                [
                    {"name": "积分限制型", "value": 55, "label": "功能强，但免费体力有限"},
                    {"name": "一码难求型", "value": 35, "label": "大厂支撑，但普通人难体验"},
                    {"name": "生态绑定/限时型", "value": 50, "label": "依赖平台或试用周期"},
                    {"name": "量大管饱型", "value": 90, "label": "QClaw 更适合培训起步"},
                ],
                "从培训角度看，易获得、低门槛、低心理负担，比花哨功能更关键。",
                span="wide",
            ),
            list_card("积分限制型", ["AutoClaw（澳龙）", "EasyClaw", "WorkBuddy"], "这类产品功能不差，但采用积分制，免费使用的“体力（token）”有限，重度使用很容易中断。"),
            list_card("一码难求型（内测）", ["灵犀Claw（WPS）", "悟空（钉钉）", "Solo（字节）"], "背后都有大厂支撑，但目前多在内测期，需要邀请码，普通员工很难直接体验。"),
            list_card("生态绑定 / 限时型", ["飞书 OpenClaw（绑定飞书生态）", "jvs claw（新人最多免费试用 7 天）"], "这类产品往往更依赖平台生态或试用周期，对分公司全员普及不够友好。"),
            text_card("量大管饱型：QClaw", "QClaw 属于腾讯系，每天赠送 4000 万 token，门槛低、试错成本低，更适合培训起步和形成第一轮正反馈。"),
        ],
    },
    {
        "page_number": 15,
        "page_type": "content",
        "part_index": 3,
        "part_title": "工具选择",
        "title": "为什么不建议原生配置和云端部署",
        "summary": "对非技术员工而言，最危险的不是不会用，而是还没开始就被部署门槛劝退。",
        "layout": "three_col",
        "cards": [
            text_card("原生配置门槛", "原生 OpenClaw 配置经常涉及 Python 环境、依赖安装与命令行操作，足以劝退绝大多数非技术同事。"),
            text_card("云端部署焦虑", "云服务器与模型 Token 都要持续花钱，一旦付费，用户会本能地计算成本，导致尝试意愿下降。"),
            text_card("QClaw 的现实优势", "本地客户端更适合员工先熟悉场景、先感受到价值，再决定要不要做更深度探索。"),
        ],
    },
    {
        "page_number": 16,
        "page_type": "content",
        "part_index": 3,
        "part_title": "工具选择",
        "title": "强烈推荐 QClaw 的四大理由",
        "summary": "真正适合内训普及的工具，必须同时满足稳定、低门槛、低焦虑和高可用。",
        "layout": "mixed_5",
        "cards": [
            data_card("免费体量", "4000万", "每日 Token", "材料显示，QClaw 每天赠送 4000 万 Token，足够支持高频尝试与办公级别使用。", progress=88, trend="试错无压力", span="wide"),
            text_card("腾讯背书", "大厂出品带来更强的稳定感与信任感，尤其适合给第一次接触 AI 的同事建立安全感。"),
            text_card("生态想象力", "和微信、QQ、腾讯文档等生态的天然联想，会让员工更容易理解它未来的办公价值。"),
            text_card("开箱即用", "不折腾环境，不讲一堆命令，员工才愿意在下班前真正迈出第一步。"),
            text_card("本地化心态更轻", "只要有网络和一点电费，就能开始尝试，心态上不会被“回本焦虑”绑架。"),
        ],
    },
    {
        "page_number": 17,
        "page_type": "content",
        "part_index": 3,
        "part_title": "工具选择",
        "title": "QClaw 安装绑定：零基础也能轻松上手",
        "summary": "QClaw 是微信直连的 AI 办公助手，培训现场要把“安装绑定简单、上手门槛低”讲清楚，让大家敢于马上试用。",
        "layout": "two_col",
        "cards": [
            process_card(
                "安装三步走",
                [
                    {"title": "访问官网", "desc": "进入 qclaw.qq.com 下载客户端"},
                    {"title": "下一步安装", "desc": "按常规软件方式完成安装"},
                    {"title": "微信绑定", "desc": "通过微信直连完成登录与绑定"},
                ],
                "这里的重点不是技术炫耀，而是把“我也能装”这个信心快速建立起来。",
            ),
            list_card("培训现场提醒", ["目前只有客户端，没有网页版", "建议优先在个人设备上安装", "安装完成后立刻试一个公开办公任务"], "让大家在培训当天就形成闭环体验。"),
            list_card("讲师话术建议", ["先说它是微信直连的 AI 办公助手", "再说今天就能装好开始试用", "最后强调先从公开低风险任务开始"], "这页的重点是建立“我也能上手”的信心。"),
        ],
    },
    {
        "page_number": 18,
        "page_type": "content",
        "part_index": 3,
        "part_title": "工具选择",
        "title": "首次登录后，先认识这四个核心区域",
        "summary": "先看懂界面，再下达任务。第一天先建立“知道先点哪里、知道结果在哪看”的掌控感。",
        "layout": "two_col",
        "cards": [
            process_card(
                "四个核心区域怎么理解",
                [
                    {"title": "对话区", "desc": "下达任务、补充要求，命令越清楚结果越稳"},
                    {"title": "任务区", "desc": "看执行步骤与当前进度，知道它正在做什么"},
                    {"title": "文件区", "desc": "限定操作范围，优先只指向某个测试文件夹"},
                    {"title": "结果区", "desc": "看返回结果、初稿内容和执行说明"},
                ],
                "第一天最重要的不是做复杂任务，而是先看懂界面分工。",
            ),
            list_card("上手原则与首日目标", ["先看懂，再让它做", "先完成一个公开任务", "先学会看结果和进度", "先说出一个适用场景"], "把第一次成功体验做扎实，比马上追求高级玩法更重要。"),
        ],
    },
    {
        "page_number": 19,
        "page_type": "content",
        "part_index": 3,
        "part_title": "工具选择",
        "title": "核心功能实操演示：第一个任务这样做最稳",
        "summary": "本次培训聚焦实操教学，所以第一个演示任务一定要短、稳、结果可见，让零基础员工立刻看到 QClaw 在日常办公里的价值。",
        "layout": "hero_3",
        "cards": [
            process_card(
                "公开文件整理 Demo",
                [
                    {"title": "准备素材", "desc": "提前放好测试文件夹和公开文档"},
                    {"title": "明确范围", "desc": "限定在一个文件夹内操作"},
                    {"title": "下达任务", "desc": "按类型或日期归档"},
                    {"title": "人工复核", "desc": "现场打开结果文件夹确认"},
                ],
                "这是最适合培训首秀的任务：可视、直观、风险低、成就感强。",
                span="hero",
            ),
            text_card("推荐指令结构", "身份/场景 + 文件位置 + 分类规则 + 输出要求，四要素写清楚，AI 的执行稳定性会明显提高。"),
            text_card("为什么不用高风险任务开场", "涉及客户隐私、金额判断或机密材料的任务，一旦出现疑问，现场气氛会迅速从好奇变成担忧。"),
            data_card("理想时长", "30秒", "首个结果反馈", "材料中提到，简单整理任务可以在几十秒内完成，最适合做培训开场反馈。", progress=68, trend="反馈及时"),
        ],
    },
    section_slide(20, 4, "业务实战", "寿险实战：五大岗位核心工作流重塑", "把认知和工具真正落到岗位动作里，员工才会觉得“这跟我有关系”。", "用 AI 解决最具体的工作痛点"),
    {
        "page_number": 21,
        "page_type": "content",
        "part_index": 4,
        "part_title": "业务实战",
        "title": "基础办公事项里，QClaw 最适合先帮你做什么",
        "summary": "这次培训明确聚焦基础办公场景：文件整理、数据汇总、文档撰写等事项最适合先行试用，这一页就是把应用边界讲清楚。",
        "layout": "mixed_5",
        "cards": [
            data_card("时间价值", "1-2 小时", "每天可节省", "熟练应用 QClaw 后，平均每天可节省 1-2 小时，这正是基础办公事项最先释放的时间价值。", progress=74, trend="效率释放", span="wide"),
            text_card("文件整理", "公开资料、测试文件、日常文档归档，是最适合 AI 先行试用的入口。"),
            text_card("数据汇总", "月底汇总、字段整理、表格初步处理，属于非常典型的基础办公流程。"),
            text_card("文档撰写", "周报、通知、邮件、晨会提纲、常见话术草稿，都是最容易看到效果的场景。"),
            text_card("培训核心观点", "AI 不是替你做所有事，而是先把最基础、最重复、最容易疲惫的部分拿走。"),
        ],
    },
    {
        "page_number": 22,
        "page_type": "content",
        "part_index": 4,
        "part_title": "业务实战",
        "title": "五大岗位 × 七类任务：QClaw 的应用地图",
        "summary": "通过一张应用地图，把“零散案例”变成“可迁移框架”。",
        "layout": "mixed_6",
        "cards": [
            tags_card("岗位覆盖", ["核保", "理赔", "增员", "销售", "客服/内勤"], "它并不是只服务技术岗，而是服务高频办公场景。"),
            tags_card("高频任务", ["文件整理", "文案生成", "资料归档", "话术润色", "会议提纲", "Excel 求助", "流程梳理"], "这些任务构成了最适合起步的能力包。"),
            text_card("核保/理赔", "最适合从附件整理、票据排序、文件重命名、资料归档等“机械动作”切入。"),
            text_card("销售/客服", "最适合从跟进微信、产品科普文案、客户沟通框架等“文字动作”切入。"),
            text_card("增员/人力", "简历分类、信息提取、面试安排初稿，是最容易感受到时间回报的场景。"),
            text_card("内勤/行政", "晨会大纲、通知草稿、办公技能求助，会让 AI 快速变成“每天都能用一次”的助手。"),
        ],
    },
    {
        "page_number": 23,
        "page_type": "content",
        "part_index": 4,
        "part_title": "业务实战",
        "title": "核保岗：告别资料杂乱，先从归档做起",
        "summary": "核保场景要强调“先做整理，再做判断”，避免给人“AI 替你核保”的误解。",
        "layout": "main_sub",
        "cards": [
            text_card(
                "场景主卡",
                "核保岗每天面对大量申请表、体检报告和影像资料，真正消耗精力的往往不是判断本身，而是前面的归档和查找。",
                [
                    "推荐指令：帮我把桌面“3月核保申请”文件夹里的体检报告、申请表，按客户姓名自动建立子文件夹并分类归档。",
                    "推荐边界：只处理非敏感测试材料或脱敏材料。",
                ],
                span="tall",
            ),
            data_card("效率对比", "30秒", "完成机械整理", "材料中给出的典型体验是：原本 30 分钟的机械整理，AI 在几十秒内就能完成初步归档。", progress=84, trend="效率显著提升"),
            list_card("培训强调点", ["AI 做整理，不替代核保判断", "最终资料是否齐全仍需人工确认", "先限定在测试文件夹内演示"], "把场景边界讲清楚，员工才会放心尝试。"),
        ],
    },
    {
        "page_number": 24,
        "page_type": "content",
        "part_index": 4,
        "part_title": "业务实战",
        "title": "理赔岗：票据初筛与明细初步整理",
        "summary": "理赔场景一定要把“AI 辅助整理，不替代金额确认”讲成红线。",
        "layout": "three_col",
        "cards": [
            text_card("痛点", "客户提交的发票图片和申请材料往往杂乱，人工逐张改名、排序、归档非常耗精力。"),
            text_card("神级指令", "帮我整理“张三理赔资料”文件夹，把所有发票图片按日期重命名排序，并把申请表单独归档。"),
            text_card("关键提醒", "AI 可以做初筛、改名、排序和汇总建议，但金额核对、凭证真实性和结论判断必须由人工复核。"),
        ],
    },
    {
        "page_number": 25,
        "page_type": "content",
        "part_index": 4,
        "part_title": "业务实战",
        "title": "增员与人力：简历秒筛与排期初稿",
        "summary": "这一页最能打动主管层，因为它直观看到“原来一小时工作可以压缩到几分钟”。",
        "layout": "hero_3",
        "cards": [
            data_card("效率回报", "5 分钟", "完成面试统筹初稿", "材料中提到，原本 1 小时的统筹工作可以压缩到 5 分钟左右，这类场景极适合作为培训后的首批试点。", progress=86, trend="明显提速", span="hero"),
            text_card("典型痛点", "招聘季候选人简历堆积如山，分类、筛选、提取联系方式和排面试时间都非常碎片化。"),
            text_card("推荐指令", "把“增员简历”文件夹按学历和工作年限分类，并提取所有本科学历候选人的姓名和电话，生成本周面试安排表初稿。"),
            list_card("人工把关点", ["电话是否准确", "学历信息是否完整", "面试时间是否冲突", "敏感信息是否脱敏"], "让 AI 先做 80%，人来做最后 20% 审核。"),
        ],
    },
    {
        "page_number": 26,
        "page_type": "content",
        "part_index": 4,
        "part_title": "业务实战",
        "title": "销售与客服：高情商跟进微信怎么写",
        "summary": "这页直接解决一线最常见的“我知道该跟进，但不知道怎么说”问题。",
        "layout": "two_col",
        "cards": [
            text_card(
                "真实场景",
                "刚拜访完一位 35 岁企业主，聊了养老规划。此时最怕的不是没内容，而是说得太硬、太推销、太像模板。",
                [
                    "推荐提示词：请帮我写一条得体的感谢 + 跟进微信，100 字内，有温度，不要浓重推销味，结尾留个悬念。",
                ],
            ),
            list_card("高质量结果应具备", ["先表达感谢", "回扣刚才聊过的话题", "不急着成交", "语气自然有温度", "结尾留下继续沟通空间"], "让员工知道“好结果”长什么样，后续才能自己调教提示词。"),
        ],
    },
    {
        "page_number": 27,
        "page_type": "content",
        "part_index": 4,
        "part_title": "业务实战",
        "title": "朋友圈文案：让保险科普更有人味",
        "summary": "朋友圈不是写给专家看的，而是写给潜在客户和熟人圈看的，AI 非常适合帮你调整语气。",
        "layout": "main_sub",
        "cards": [
            text_card(
                "场景主卡",
                "很多保险科普文案不是内容不对，而是太官方、太硬、太像“完成任务”。AI 最适合帮你把专业信息改成更接地气、更容易互动的表达。",
                [
                    "推荐提示词：帮我写一条朋友圈，科普意外险的重要性，语气轻松幽默、接地气，结尾带一个互动提问，并建议配图方向。",
                ],
                span="tall",
            ),
            tags_card("文案要素", ["真实感", "轻松感", "互动感", "场景化", "避免硬卖"], "培训现场可以让大家对比“原始版本”和“AI 优化版”的语气差异。"),
            text_card("应用提醒", "AI 可以给框架和第一稿，但你最终发出的文字，仍然要符合你自己的客户关系和人设风格。"),
        ],
    },
    {
        "page_number": 28,
        "page_type": "content",
        "part_index": 4,
        "part_title": "业务实战",
        "title": "内勤与行政：晨会大纲一键生成",
        "summary": "这类场景最适合帮助“平时不太敢碰 AI”的同事建立第一次成就感。",
        "layout": "two_col",
        "cards": [
            process_card(
                "5 分钟晨会稿生成逻辑",
                [
                    {"title": "定主题", "desc": "比如“在拒绝中寻找机会”"},
                    {"title": "加场景", "desc": "要求一个寿险销售故事"},
                    {"title": "定风格", "desc": "接地气、有感染力"},
                    {"title": "要结构", "desc": "生成开场、故事、收束"},
                ],
                "有了结构化要求，AI 才会输出可直接拿来讲的提纲。",
            ),
            list_card("为什么这个场景适合培训", ["内容公开、风险低", "结果可直接朗读", "前后效果差异明显", "适合现场互动修改"], "非常适合现场让同事自己补一句要求，立即看到效果变化。"),
        ],
    },
    {
        "page_number": 29,
        "page_type": "content",
        "part_index": 4,
        "part_title": "业务实战",
        "title": "全员通用：Excel 公式与办公求助",
        "summary": "很多人以为自己不会用 AI，其实只是没有意识到“办公求助”就是最简单的入口。",
        "layout": "hero_3",
        "cards": [
            text_card(
                "办公助手定位",
                "当你卡在某个 Excel 操作、筛选条件、条件格式、公式写法时，QClaw 可以变成一个全天候 IT 办公小助手。",
                [
                    "推荐提示词：A 列是日期，B 列是业绩金额，我想把本月业绩大于 1 万的单元格自动标红，请一步步告诉我具体操作。",
                ],
                span="hero",
            ),
            text_card("为什么这很适合起步", "它几乎不涉及敏感数据，只要把真实数据换成字段描述，就可以安全地先问方法。"),
            text_card("体验价值", "遇到 Excel 或办公问题时，先让 AI 给你步骤框架，再自己动手验证，能明显减少反复求人和试错时间。"),
            list_card("好的提问方式", ["说清列名/字段", "说清想要的效果", "要求分步骤输出", "必要时附上模拟示例"], "描述越具体，返回的步骤越能直接照着做。"),
        ],
    },
    {
        "page_number": 30,
        "page_type": "content",
        "part_index": 4,
        "part_title": "业务实战",
        "title": "QClaw 现场演示实操步骤：文件整理版",
        "summary": "这一页直接给出可照着演的步骤、指令和讲师动作，现场优先用这个版本：稳、快、结果直观。",
        "layout": "two_col",
        "cards": [
            process_card(
                "现场演示 6 步",
                [
                    {"title": "第1步", "desc": "先展示原始文件夹的杂乱状态"},
                    {"title": "第2步", "desc": "明确范围，只限定测试文件夹"},
                    {"title": "第3步", "desc": "输入整理指令，要求按类型归档"},
                    {"title": "第4步", "desc": "执行时只解释它在读取和分类"},
                    {"title": "第5步", "desc": "打开结果文件夹，现场核验结果"},
                    {"title": "第6步", "desc": "补一句边界提醒：仅适合公开或脱敏材料"},
                ],
                "这一页就是上台操作顺序，照着做即可。",
            ),
            process_card(
                "动作与切换",
                [
                    {"title": "推荐指令", "desc": "请整理测试文件夹，按类型建子文件夹并输出整理说明"},
                    {"title": "讲师动作", "desc": "先看原始状态，再读范围和目标，结果出来只讲 3 个重点"},
                    {"title": "理想时长", "desc": "首轮结果控制在 40 秒左右"},
                    {"title": "异常切换", "desc": "网络波动就切备用结果页或备用场景"},
                ],
                "右侧这张卡只保留上台最需要记住的动作，不再分散成多张小卡。",
            ),
        ],
    },
    {
        "page_number": 31,
        "page_type": "content",
        "part_index": 4,
        "part_title": "业务实战",
        "title": "QClaw 第二轮实操：文档撰写与数据汇总",
        "summary": "第一轮演完文件整理，第二轮建议演文档撰写或数据汇总，贴近日常办公，也更有干货。",
        "layout": "two_col",
        "cards": [
            process_card(
                "文档撰写演示步骤",
                [
                    {"title": "给背景", "desc": "例如写周会通知或晨会提纲"},
                    {"title": "给要求", "desc": "限定字数、语气、结构和对象"},
                    {"title": "看初稿", "desc": "先让 QClaw 出第一版"},
                    {"title": "再追问", "desc": "再要求更口语化或更正式"},
                ],
                "先稳后难。文件整理先建立信心，文档撰写再展示拓展能力。",
            ),
            process_card(
                "数据汇总步骤与话术",
                [
                    {"title": "说字段", "desc": "明确表格有哪些列"},
                    {"title": "说目标", "desc": "例如统计本月业绩或筛选名单"},
                    {"title": "要步骤", "desc": "要求分步骤解释处理逻辑"},
                    {"title": "再验证", "desc": "用模拟数据快速核验"},
                ],
                "现场话术：先讲场景，再讲目标，最后讲边界。强调它辅助办公，不替代最终判断。",
            ),
        ],
    },
    section_slide(32, 5, "安全合规", "严守红线：数据安全是生命线", "这一部分必须用最严肃的口气讲，因为它决定培训能不能真正落地。", "AI 可以提效，但绝不能碰合规底线"),
    {
        "page_number": 33,
        "page_type": "content",
        "part_index": 5,
        "part_title": "安全合规",
        "title": "真实违规案例：不是提醒，而是警钟",
        "summary": "只有把代价说透，员工才会真正把“不要上传敏感信息”当回事。",
        "layout": "hero_3",
        "cards": [
            data_card("违规后果", "1年6个月", "有期徒刑", "材料中的真实案例表明，向外部 AI 提供 1000 多位客户信息做分析，最终触及刑事责任。", progress=100, trend="高风险", span="hero"),
            data_card("机构代价", "200万", "监管重罚", "不仅个人受罚，机构也会承担监管处罚和品牌风险。", progress=100, trend="损失巨大"),
            text_card("案例回放", "某金融机构员工把包含大量客户信息的 Excel 发送给外部 AI 做“智能分析”，结果造成严重后果。"),
            text_card("核心结论", "为了偷懒而把客户隐私交给外部 AI，不是小失误，而是可能直接违法。"),
        ],
    },
    {
        "page_number": 34,
        "page_type": "content",
        "part_index": 5,
        "part_title": "安全合规",
        "title": "绝对禁止的五大高压线",
        "summary": "这一页要让大家明确：不是“谨慎点用”，而是“有些内容绝不能碰”。",
        "layout": "mixed_5",
        "cards": [
            text_card("客户身份信息", "身份证号、护照号、人脸照片等，属于极高敏感信息，绝对不能上传给外部 AI。"),
            text_card("金融账户信息", "银行卡号、交易密码、账户流水等，任何外发都可能带来不可逆的风险。"),
            text_card("私密联系方式", "手机号、详细住址、家庭住址等信息，不能因为“只是帮我整理一下”就放松警惕。"),
            text_card("健康信息", "病历、体检报告、健康告知问卷，是寿险业务里最需要敬畏的数据类型之一。"),
            text_card("公司内部机密", "未公开营销政策、内部财务数据、未授权课件，同样不能被当成训练或生成素材。"),
        ],
    },
    {
        "page_number": 35,
        "page_type": "content",
        "part_index": 5,
        "part_title": "安全合规",
        "title": "安全决策“三问法”：每次使用前先过脑",
        "summary": "把合规动作做成一个人人都能记住的小动作，比给一大页制度更有效。",
        "layout": "three_col",
        "cards": [
            text_card("第一问", "这个内容里有没有客户姓名、身份证号、手机号、银行卡号等可识别个人信息？有，就不能用。"),
            text_card("第二问", "这个文件是否带有“机密”“内部”“秘密”等标识？如果是，就不能拿去问外部 AI。"),
            text_card("第三问", "如果这份内容泄露出去，会不会对客户或公司造成损失？只要答案是“会”，就坚决不要冒险。"),
        ],
    },
    {
        "page_number": 36,
        "page_type": "content",
        "part_index": 5,
        "part_title": "安全合规",
        "title": "哪些内容相对安全，可以放心先用",
        "summary": "讲完不能做什么，还要讲能做什么，否则员工只会留下“AI 很危险”的印象。",
        "layout": "mixed_6",
        "cards": [
            text_card("公开通知", "对公司公开发布的文件、制度、公告做语言润色和结构优化。"),
            text_card("公开产品资料", "对官网产品介绍、公开条款说明做通俗化翻译和总结。"),
            text_card("个人工作总结", "前提是已经剔除客户隐私和公司机密，只保留公开工作结构与表达需求。"),
            text_card("话术模板", "生成通用营销话术、对比框架、客户沟通思路，但不带入真实客户隐私。"),
            text_card("本地公开文件整理", "整理自己电脑桌面上的非敏感工作文件，是最适合的入门动作。"),
            text_card("正确姿势", "先脱敏，再借助 AI。让 AI 帮你做框架、模板和初稿，而不是直接处理原始敏感数据。"),
        ],
    },
    {
        "page_number": 37,
        "page_type": "content",
        "part_index": 5,
        "part_title": "安全合规",
        "title": "隔离网络下的标准工作流：外脑思考，内网执行",
        "summary": "这是最适合寿险场景的合规心法，必须反复强调。",
        "layout": "hero_3",
        "cards": [
            process_card(
                "标准合规路径",
                [
                    {"title": "1. 外网提问", "desc": "在个人手机或外网电脑上问通用问题"},
                    {"title": "2. 消化逻辑", "desc": "把 AI 给出的框架先自己理解吸收"},
                    {"title": "3. 回到内网", "desc": "在云桌面内结合真实敏感数据手动完成"},
                    {"title": "4. 人工把关", "desc": "确保最终输出符合制度和口径"},
                ],
                "AI 是你的外脑，不是替你把公司敏感数据搬到外部世界的捷径。",
                span="hero",
            ),
            text_card("当前环境认知", "办公系统内网云桌面与外网物理隔离，本身就是为了保护敏感数据。"),
            text_card("为什么这套方法最稳", "既能借用 AI 的思路、模板和结构能力，又不会让客户数据离开合规边界。"),
            text_card("一句话记住", "让 AI 提供方法，让你来处理真实数据。"),
        ],
    },
    {
        "page_number": 38,
        "page_type": "content",
        "part_index": 5,
        "part_title": "安全合规",
        "title": "脱敏改写：把危险问题，改成安全问题",
        "summary": "员工真正需要学会的，不只是“不要发”，更是“怎么改写后再问”。",
        "layout": "two_col",
        "cards": [
            list_card(
                "危险问法",
                [
                    "帮我分析这份客户名单的购买潜力",
                    "把这份含身份证号的理赔表整理成摘要",
                    "根据这个真实客户健康问卷给出建议",
                    "把未公开政策做成销售话术",
                ],
                "这些问法的问题，不在于 AI 不聪明，而在于你把不该外发的内容送了出去。",
            ),
            list_card(
                "安全改写",
                [
                    "请给我一个客户分层分析模板",
                    "请给我一个理赔资料整理的字段清单",
                    "请给我一个健康问卷脱敏后的分析框架",
                    "请给我一个公开产品对比的话术骨架",
                ],
                "先要方法、要模板、要框架，再由自己在内网结合真实数据执行。",
            ),
        ],
    },
    {
        "page_number": 39,
        "page_type": "content",
        "part_index": 5,
        "part_title": "安全合规",
        "title": "安全使用黄金流程：先判断，再脱敏，再提问",
        "summary": "把安全使用动作流程化，员工回去才真正做得出来。",
        "layout": "three_col",
        "cards": [
            process_card("步骤一：判断", [{"title": "看内容", "desc": "先过三问法"}, {"title": "看边界", "desc": "确认是否含敏感信息"}, {"title": "看后果", "desc": "判断泄露风险"}], "先判断再操作。"),
            process_card("步骤二：脱敏", [{"title": "去标识", "desc": "删姓名、证件号、电话"}, {"title": "换模板", "desc": "改成通用场景"}, {"title": "保结构", "desc": "只保留问题骨架"}], "让问题变成方法咨询。"),
            process_card("步骤三：提问", [{"title": "要框架", "desc": "让 AI 给方法"}, {"title": "要模板", "desc": "让 AI 给初稿"}, {"title": "人工完成", "desc": "回到内网落地"}], "最终执行与责任必须回到人身上。"),
        ],
    },
    section_slide(40, 6, "行动激励", "生存指南：做驾驭 AI 的传统寿险人", "培训的最后不是把大家送回焦虑，而是把大家送回行动。", "AI 不会淘汰你，但会用 AI 的同事会拉开差距"),
    {
        "page_number": 41,
        "page_type": "content",
        "part_index": 6,
        "part_title": "行动激励",
        "title": "AI 会淘汰我们吗？先回答这个担忧",
        "summary": "如果不先处理情绪问题，后面的所有方法都会被“我是不是会失业”覆盖掉。",
        "layout": "hero_3",
        "cards": [
            text_card(
                "先给结论",
                "寿险是一门强烈依赖信任、温度、同理心和复杂情境判断的事业，AI 无法替代人与人之间的长期关系经营。",
                [
                    "它不能代替你在家庭遭遇变故时给予温度。",
                    "它也无法替代你在线下长期建立信任。",
                ],
                span="hero",
            ),
            text_card("AI 擅长什么", "AI 擅长的是整理、归纳、生成初稿、做辅助分析和提出结构化建议。"),
            text_card("人更擅长什么", "人更擅长的是判断责任、情绪沟通、复杂协商、建立长期关系和承担后果。"),
            text_card("真正的方向", "不是人与 AI 对抗，而是让 AI 帮你把更多时间重新还给“与人打交道”。"),
        ],
    },
    {
        "page_number": 42,
        "page_type": "content",
        "part_index": 6,
        "part_title": "行动激励",
        "title": "真正的危机：不是 AI，而是效率差距被放大",
        "summary": "这页要把竞争压力讲清楚，但不能讲成空泛威胁。",
        "layout": "three_col",
        "cards": [
            text_card("残酷真相", "AI 不会直接淘汰你，但熟练使用 AI 的同事，会在响应速度、质量和精力分配上迅速拉开差距。"),
            text_card("岗位趋势", "纯机械操作型岗位会持续缩减，而人机协同、审核把关、复杂沟通型岗位会越来越重要。"),
            text_card("角色重心", "从“做”走向“审”，从执行走向组织与把关。未来的优势不在于亲手做得多快，而在于能否更快组织 AI 产出高质量底稿。"),
        ],
    },
    {
        "page_number": 43,
        "page_type": "content",
        "part_index": 6,
        "part_title": "行动激励",
        "title": "未来竞争力公式：专业经验 × AI 处理能力",
        "summary": "真正不可替代的，不是单一技能，而是“业务理解”和“AI 使用能力”的乘法效应。",
        "layout": "main_sub",
        "cards": [
            text_card("竞争力公式", "经验 × AI，更像乘法不是加法。同样一个工具，不同业务经验的人用出来的结果完全不同；同样的经验，不借助 AI 又会被效率拖住。", ["业务理解负责判断，AI 负责放大效率。"], span="tall"),
            list_card("专业经验负责", ["理解客户", "理解产品", "理解流程", "理解风险"], "这些是 AI 无法凭空长出来的。"),
            list_card("AI 处理能力负责", ["写初稿", "理结构", "做整理", "给建议"], "它会把你的专业经验放大，而不是凭空替代。"),
        ],
    },
    {
        "page_number": 44,
        "page_type": "content",
        "part_index": 6,
        "part_title": "行动激励",
        "title": "从执行者到管理者 + 审核者",
        "summary": "岗位价值并没有消失，而是在重新定义“你该亲手做什么”。",
        "layout": "two_col",
        "cards": [
            process_card(
                "旧模式：全靠自己做",
                [
                    {"title": "接任务", "desc": "自己想"},
                    {"title": "找资料", "desc": "自己拼"},
                    {"title": "做初稿", "desc": "自己熬"},
                    {"title": "交结果", "desc": "自己扛"},
                ],
                "这种模式最消耗的是你的时间和精力。",
            ),
            process_card(
                "新模式：AI 先做 80%，你把关 20%",
                [
                    {"title": "拆任务", "desc": "交给 AI 处理粗活"},
                    {"title": "审结果", "desc": "筛错、改口径、补细节"},
                    {"title": "定输出", "desc": "你对结果负责"},
                    {"title": "再复用", "desc": "沉淀成自己的方法库"},
                ],
                "角色升级的核心，不是少做事，而是把精力放到更值钱的部分。",
            ),
        ],
    },
    {
        "page_number": 45,
        "page_type": "content",
        "part_index": 6,
        "part_title": "行动激励",
        "title": "提示词工程：未来的必修课",
        "summary": "同样一个工具，用得好不好，往往差在你给它的任务是否具体、可执行、可验证。",
        "layout": "mixed_6",
        "cards": [
            text_card("差的提示词", "帮我写个周报。这样的命令过于笼统，AI 只能给你一个平庸且难落地的答案。"),
            text_card("好的提示词", "明确身份、明确任务、明确格式、给出参考信息，效果会立刻拉开差距。"),
            tags_card("四要素公式", ["身份", "任务", "格式", "参考信息"], "这是最容易记住、也最容易现场练习的提示词框架。"),
            text_card("寿险场景加法", "如果是销售跟进，要补客户画像与语气；如果是晨会提纲，要补主题、时长、风格与故事要求。"),
            text_card("为什么提示词重要", "提示词不是“会不会说话”，而是你能否把模糊想法翻译成清晰任务。"),
            data_card("训练方法", "每天 3 次", "主动问 AI", "让自己养成习惯：工作中每遇到一个任务，先问一次“这件事 AI 能帮我做哪一部分？”", progress=75, trend="习惯养成"),
        ],
    },
    {
        "page_number": 46,
        "page_type": "content",
        "part_index": 6,
        "part_title": "行动激励",
        "title": "今天下班前，就做这三件事",
        "summary": "培训的最后一定要收束到动作，不然认知很快会重新蒸发。",
        "layout": "three_col",
        "cards": [
            process_card("第一件事", [{"title": "安装", "desc": "在个人设备装好 QClaw"}, {"title": "登录", "desc": "确保能顺利进入客户端"}, {"title": "确认", "desc": "把入口留在桌面"}], "先把门槛跨过去。"),
            process_card("第二件事", [{"title": "选任务", "desc": "找一个公开低风险任务"}, {"title": "下指令", "desc": "按四要素提问"}, {"title": "复核", "desc": "看结果并调整"}], "先做出第一次正反馈。"),
            process_card("第三件事", [{"title": "养习惯", "desc": "每天主动问 3 次"}, {"title": "做记录", "desc": "留住有效提示词"}, {"title": "再复用", "desc": "形成自己的方法库"}], "把偶发使用变成稳定能力。"),
        ],
    },
    {
        "page_number": 47,
        "page_type": "content",
        "part_index": 6,
        "part_title": "行动激励",
        "title": "最后送给大家两句话",
        "summary": "结尾要同时传递压力和希望，既要让大家行动，也要让大家安心。",
        "layout": "two_col",
        "cards": [
            text_card("第一句话", "AI 不会淘汰你，但会用 AI 的同事会淘汰你。真正拉开差距的，是行动速度和学习意愿。"),
            text_card("第二句话", "我们都是 AI 大模型大时代的赶路人。现在开始，永远不晚；愿意开始，就已经领先于原地观望。"),
        ],
    },
    {
        "page_number": 48,
        "page_type": "end",
        "part_index": 6,
        "part_title": "行动激励",
        "title": "共勉与现场答疑",
        "subtitle": "别怕开始晚，怕的是一直不开始。",
        "cards": [
            "回顾：先了解 AI 发展趋势，再先行试用工具，再逐步探索适配路径。",
            "行动：今天就完成安装绑定、首个低风险任务和一次基础办公试用。",
            "共勉：我们都是这个大时代的赶路人，一起加油。",
        ],
    },
]


PART_ACCENTS = {
    0: "#2563EB",
    1: "#2563EB",
    2: "#1D4ED8",
    3: "#0EA5E9",
    4: "#059669",
    5: "#DC2626",
    6: "#7C3AED",
}


BASE_CSS = f"""
:root {{
  --bg-primary: {STYLE["background"]["primary"]};
  --bg-secondary: {STYLE["background"]["gradient_to"]};
  --card-bg-from: {STYLE["card"]["gradient_from"]};
  --card-bg-to: {STYLE["card"]["gradient_to"]};
  --card-border: {STYLE["card"]["border"]};
  --card-radius: {STYLE["card"]["border_radius"]}px;
  --text-primary: {STYLE["text"]["primary"]};
  --text-secondary: {STYLE["text"]["secondary"]};
  --accent-1: {STYLE["accent"]["primary"][0]};
  --accent-2: {STYLE["accent"]["primary"][1]};
  --accent-3: {STYLE["accent"]["secondary"][0]};
  --accent-4: {STYLE["accent"]["secondary"][1]};
  --font-family: {STYLE["font_family"]};
  --danger: #DC2626;
  --success: #059669;
  --violet: #7C3AED;
}}
* {{
  box-sizing: border-box;
}}
body {{
  margin: 0;
  width: 1280px;
  height: 720px;
  overflow: hidden;
  position: relative;
  background:
    radial-gradient(circle at top right, rgba(37,99,235,0.10), transparent 32%),
    radial-gradient(circle at bottom left, rgba(14,165,233,0.10), transparent 28%),
    linear-gradient(135deg, var(--bg-primary), var(--bg-secondary));
  color: var(--text-primary);
  font-family: var(--font-family);
}}
.bg-shape {{
  position: absolute;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(37,99,235,0.10), rgba(14,165,233,0.06));
}}
.shape-a {{ width: 280px; height: 280px; right: -70px; top: -90px; }}
.shape-b {{ width: 220px; height: 220px; left: -80px; bottom: -80px; }}
.shape-c {{ width: 140px; height: 140px; right: 220px; bottom: 100px; opacity: 0.55; }}
.title-area {{
  position: absolute;
  left: 48px;
  top: 32px;
  width: 1184px;
  height: 108px;
}}
.overline {{
  font-size: 13px;
  letter-spacing: 2.5px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--part-accent);
  margin-bottom: 10px;
}}
.page-title {{
  margin: 0;
  font-size: 34px;
  line-height: 1.18;
  font-weight: 800;
  color: var(--text-primary);
}}
.title-underline {{
  width: 96px;
  height: 5px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--part-accent), var(--accent-2));
  margin-top: 12px;
}}
.summary-pill {{
  margin-top: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(255,255,255,0.82);
  border: 1px solid rgba(37,99,235,0.12);
  font-size: 14px;
  color: var(--text-secondary);
  max-width: 1120px;
}}
.content-area {{
  position: absolute;
  left: 48px;
  top: 164px;
  width: 1184px;
  height: 506px;
  display: grid;
  gap: 16px;
}}
.layout-two {{
  grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr);
}}
.layout-three {{
  grid-template-columns: repeat(3, minmax(0, 1fr));
}}
.layout-main-sub {{
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  grid-template-rows: 1fr 1fr;
}}
.layout-hero-3 {{
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: 220px 1fr;
}}
.layout-mixed-5 {{
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: 1fr 1fr;
}}
.layout-mixed-6 {{
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: 1fr 1fr;
}}
.card {{
  position: relative;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: linear-gradient(180deg, var(--card-bg-from), var(--card-bg-to));
  border: 1px solid var(--card-border);
  border-radius: var(--card-radius);
  box-shadow: 0 14px 32px rgba(16,42,67,0.06);
  padding: 20px 22px 18px 22px;
}}
.card::selection {{
  background: rgba(37,99,235,0.18);
}}
.card-line {{
  position: absolute;
  left: 0;
  top: 20px;
  width: 4px;
  height: 72px;
  border-radius: 0 999px 999px 0;
  background: linear-gradient(180deg, var(--part-accent), transparent);
}}
.card-glow {{
  position: absolute;
  right: -30px;
  top: -30px;
  width: 100px;
  height: 100px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(37,99,235,0.10), transparent 65%);
}}
.card-title {{
  margin: 0 0 12px 0;
  font-size: 22px;
  line-height: 1.22;
  font-weight: 800;
  color: var(--text-primary);
  overflow-wrap: anywhere;
}}
.card-copy {{
  font-size: 14px;
  line-height: 1.65;
  color: var(--text-secondary);
  overflow-wrap: anywhere;
}}
.card-copy p {{
  margin: 0 0 8px 0;
}}
.card-copy strong {{
  color: var(--text-primary);
}}
.bullet-list {{
  margin-top: 12px;
  display: grid;
  gap: 10px;
}}
.bullet-item {{
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 14px;
  line-height: 1.56;
  color: var(--text-secondary);
  min-width: 0;
}}
.bullet-dot {{
  width: 8px;
  height: 8px;
  min-width: 8px;
  margin-top: 7px;
  border-radius: 999px;
  background: var(--part-accent);
}}
.data-top {{
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 10px;
}}
.data-value {{
  font-size: 46px;
  line-height: 1;
  font-weight: 900;
  color: var(--part-accent);
  font-variant-numeric: tabular-nums;
}}
.data-label {{
  font-size: 16px;
  color: var(--text-secondary);
  font-weight: 700;
}}
.trend-pill {{
  display: inline-flex;
  margin-top: 10px;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(37,99,235,0.10);
  color: var(--part-accent);
  font-size: 13px;
  font-weight: 700;
}}
.progress-track {{
  margin-top: 14px;
  width: 100%;
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(16,42,67,0.08);
}}
.progress-fill {{
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--part-accent), var(--accent-2));
}}
.chip-wrap {{
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}}
.chip {{
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(37,99,235,0.20);
  background: rgba(255,255,255,0.82);
  font-size: 13px;
  color: var(--part-accent);
  font-weight: 700;
  white-space: normal;
}}
.process-list {{
  margin-top: 12px;
  display: grid;
  gap: 10px;
}}
.process-step {{
  display: grid;
  grid-template-columns: 30px 1fr;
  gap: 12px;
  align-items: start;
}}
.process-number {{
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: var(--part-accent);
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}}
.process-main {{
  font-size: 14px;
  line-height: 1.44;
  color: var(--text-secondary);
  min-width: 0;
  overflow-wrap: anywhere;
}}
.process-main strong {{
  display: block;
  color: var(--text-primary);
  margin-bottom: 2px;
}}
.compare-wrap {{
  margin-top: 14px;
  display: grid;
  gap: 10px;
}}
.compare-row {{
  display: grid;
  grid-template-columns: 96px 1fr auto;
  align-items: center;
  gap: 12px;
}}
.compare-name {{
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 700;
}}
.compare-track {{
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(16,42,67,0.08);
}}
.compare-fill {{
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--part-accent), var(--accent-2));
}}
.compare-label {{
  font-size: 13px;
  color: var(--text-secondary);
}}
.wide {{
  grid-column: span 2;
}}
.hero {{
  grid-column: 1 / -1;
}}
.tall {{
  grid-row: 1 / -1;
}}
.footer {{
  position: absolute;
  left: 48px;
  right: 48px;
  bottom: 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  letter-spacing: 1px;
  color: rgba(82,102,122,0.78);
}}
.footer-right {{
  font-variant-numeric: tabular-nums;
}}
.cover-shell,
.section-shell,
.end-shell {{
  position: absolute;
  inset: 0;
}}
.cover-left {{
  position: absolute;
  left: 64px;
  top: 72px;
  width: 560px;
}}
.cover-kicker {{
  display: inline-flex;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(37,99,235,0.10);
  border: 1px solid rgba(37,99,235,0.16);
  color: var(--accent-1);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 2px;
}}
.cover-title {{
  margin: 20px 0 0 0;
  font-size: 54px;
  line-height: 1.1;
  font-weight: 900;
  color: var(--text-primary);
}}
.cover-subtitle {{
  margin-top: 18px;
  font-size: 23px;
  line-height: 1.55;
  color: var(--text-secondary);
}}
.cover-meta {{
  margin-top: 28px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}}
.cover-meta span {{
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255,255,255,0.84);
  border: 1px solid rgba(37,99,235,0.12);
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 700;
}}
.cover-right {{
  position: absolute;
  right: 64px;
  top: 48px;
  width: 520px;
  height: 624px;
  border-radius: 32px;
  background: linear-gradient(150deg, rgba(37,99,235,0.18), rgba(14,165,233,0.12));
  border: 1px solid rgba(37,99,235,0.16);
  overflow: hidden;
}}
.hero-panel {{
  position: absolute;
  border-radius: 24px;
  background: rgba(255,255,255,0.86);
  border: 1px solid rgba(37,99,235,0.12);
  box-shadow: 0 16px 28px rgba(16,42,67,0.08);
}}
.hero-panel-a {{ left: 28px; top: 28px; width: 464px; height: 194px; }}
.hero-panel-b {{ left: 28px; top: 234px; width: 224px; height: 332px; }}
.hero-panel-c {{ right: 28px; top: 234px; width: 224px; height: 332px; }}
.hero-ring {{
  position: absolute;
  right: -30px;
  top: -30px;
  width: 190px;
  height: 190px;
  border-radius: 999px;
  border: 26px solid rgba(37,99,235,0.10);
}}
.hero-grid {{
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 26px;
}}
.mini-card {{
  border-radius: 18px;
  background: linear-gradient(180deg, #FFFFFF, #F7FAFF);
  border: 1px solid rgba(37,99,235,0.10);
  padding: 14px;
}}
.mini-label {{
  font-size: 13px;
  color: var(--text-secondary);
}}
.mini-value {{
  margin-top: 10px;
  font-size: 34px;
  line-height: 1;
  font-weight: 900;
  color: var(--accent-1);
}}
.hero-list {{
  padding: 18px;
  display: grid;
  gap: 8px;
}}
.hero-task {{
  padding: 11px 13px;
  border-radius: 16px;
  background: rgba(37,99,235,0.06);
  border: 1px solid rgba(37,99,235,0.10);
  font-size: 15px;
  line-height: 1.28;
  color: var(--text-primary);
  font-weight: 700;
}}
.hero-task span {{
  display: block;
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.32;
  font-weight: 400;
  color: var(--text-secondary);
}}
.section-center {{
  position: absolute;
  left: 72px;
  top: 96px;
  right: 72px;
  bottom: 96px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}}
.section-number {{
  font-size: 18px;
  letter-spacing: 5px;
  font-weight: 800;
  color: var(--part-accent);
}}
.section-title {{
  margin-top: 18px;
  font-size: 48px;
  line-height: 1.15;
  font-weight: 900;
  color: var(--text-primary);
  max-width: 860px;
}}
.section-subtitle {{
  margin-top: 18px;
  max-width: 780px;
  font-size: 18px;
  line-height: 1.7;
  color: var(--text-secondary);
}}
.section-quote {{
  margin-top: 28px;
  display: inline-flex;
  align-self: flex-start;
  padding: 12px 16px;
  border-radius: 18px;
  background: rgba(255,255,255,0.84);
  border: 1px solid rgba(37,99,235,0.12);
  font-size: 14px;
  color: var(--text-primary);
}}
.section-watermark {{
  position: absolute;
  right: 76px;
  bottom: 52px;
  font-size: 160px;
  line-height: 1;
  font-weight: 900;
  color: rgba(37,99,235,0.07);
}}
.toc-shell {{
  position: absolute;
  inset: 0;
}}
.toc-title {{
  position: absolute;
  left: 60px;
  top: 54px;
  width: 1140px;
}}
.toc-grid {{
  position: absolute;
  left: 60px;
  top: 160px;
  width: 1160px;
  height: 360px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 1fr 1fr;
  gap: 18px;
}}
.toc-card {{
  padding: 22px;
  border-radius: 22px;
  background: linear-gradient(180deg, #FFFFFF, #F3F8FF);
  border: 1px solid rgba(37,99,235,0.12);
  box-shadow: 0 12px 24px rgba(16,42,67,0.05);
}}
.toc-index {{
  width: 38px;
  height: 38px;
  border-radius: 999px;
  background: rgba(37,99,235,0.10);
  color: var(--accent-1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 900;
}}
.toc-card h3 {{
  margin: 16px 0 8px 0;
  font-size: 18px;
  line-height: 1.35;
}}
.toc-card p {{
  margin: 0;
  font-size: 13px;
  line-height: 1.65;
  color: var(--text-secondary);
}}
.timeline {{
  position: absolute;
  left: 60px;
  right: 60px;
  bottom: 72px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}}
.timeline-item {{
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255,255,255,0.80);
  border: 1px solid rgba(37,99,235,0.12);
}}
.timeline-item strong {{
  display: block;
  font-size: 12px;
  color: var(--text-primary);
}}
.timeline-item span {{
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}}
.end-main {{
  position: absolute;
  left: 84px;
  top: 92px;
  right: 84px;
}}
.end-title {{
  margin: 0;
  font-size: 46px;
  line-height: 1.12;
  font-weight: 900;
}}
.end-subtitle {{
  margin-top: 16px;
  font-size: 20px;
  line-height: 1.6;
  color: var(--text-secondary);
}}
.end-grid {{
  position: absolute;
  left: 84px;
  right: 84px;
  top: 250px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}}
.end-card {{
  padding: 24px;
  border-radius: 22px;
  background: linear-gradient(180deg, #FFFFFF, #F5F8FF);
  border: 1px solid rgba(37,99,235,0.12);
}}
.end-card strong {{
  display: block;
  margin-bottom: 12px;
  font-size: 18px;
}}
.end-card p {{
  margin: 0;
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-secondary);
}}
.end-quote {{
  position: absolute;
  left: 84px;
  bottom: 70px;
  padding: 14px 18px;
  border-radius: 18px;
  background: rgba(255,255,255,0.86);
  border: 1px solid rgba(37,99,235,0.12);
  font-size: 14px;
  color: var(--text-primary);
}}
"""


def build_root_override(style: dict) -> str:
    return f"""
:root {{
  --bg-primary: {style["background"]["primary"]};
  --bg-secondary: {style["background"]["gradient_to"]};
  --card-bg-from: {style["card"]["gradient_from"]};
  --card-bg-to: {style["card"]["gradient_to"]};
  --card-border: {style["card"]["border"]};
  --card-radius: {style["card"]["border_radius"]}px;
  --text-primary: {style["text"]["primary"]};
  --text-secondary: {style["text"]["secondary"]};
  --accent-1: {style["accent"]["primary"][0]};
  --accent-2: {style["accent"]["primary"][1]};
  --accent-3: {style["accent"]["secondary"][0]};
  --accent-4: {style["accent"]["secondary"][1]};
  --font-family: {style["font_family"]};
}}
"""


FLAGSHIP_OVERRIDES = f"""
{build_root_override(FLAGSHIP_STYLE)}
body {{
  background:
    linear-gradient(rgba(56,189,248,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(56,189,248,0.05) 1px, transparent 1px),
    radial-gradient(circle at 82% 10%, rgba(56,189,248,0.22), transparent 24%),
    radial-gradient(circle at 12% 88%, rgba(59,130,246,0.18), transparent 28%),
    linear-gradient(135deg, #030914 0%, #07111F 38%, #0B1C35 100%);
  background-size: 72px 72px, 72px 72px, auto, auto, auto;
}}
.bg-shape {{
  background: linear-gradient(135deg, rgba(56,189,248,0.18), rgba(37,99,235,0.08));
  filter: none;
}}
.title-underline {{
  height: 6px;
  box-shadow: 0 0 18px rgba(56,189,248,0.35);
}}
.card {{
  box-shadow: 0 22px 52px rgba(2,8,23,0.48);
  backdrop-filter: none;
}}
.card-glow {{
  background: radial-gradient(circle, rgba(56,189,248,0.22), transparent 68%);
}}
.summary-pill,
.cover-meta span,
.hero-panel,
.mini-card,
.hero-task,
.toc-card,
.timeline-item,
.end-card,
.section-quote,
.end-quote {{
  background: linear-gradient(180deg, rgba(8,20,38,0.88), rgba(10,28,52,0.84));
  border: 1px solid rgba(56,189,248,0.18);
  box-shadow: 0 16px 34px rgba(2,8,23,0.32);
}}
.summary-pill,
.mini-label,
.timeline-item span,
.toc-card p,
.cover-subtitle,
.section-subtitle,
.end-subtitle,
.end-card p,
.hero-task span {{
  color: var(--text-secondary);
}}
.cover-kicker,
.toc-index {{
  background: rgba(56,189,248,0.14);
  border: 1px solid rgba(56,189,248,0.22);
  color: var(--accent-1);
}}
.hero-ring {{
  border-color: rgba(56,189,248,0.16);
}}
.cover-right {{
  background: linear-gradient(150deg, rgba(14,25,47,0.92), rgba(10,30,58,0.82));
  border: 1px solid rgba(56,189,248,0.18);
  box-shadow: 0 34px 72px rgba(2,8,23,0.48);
}}
.hero-panel-a,
.hero-panel-b,
.hero-panel-c {{
  outline: 1px solid rgba(56,189,248,0.12);
}}
.footer {{
  color: rgba(226,238,255,0.72);
}}
.section-watermark {{
  color: rgba(56,189,248,0.08);
}}
.page-title,
.section-title,
.cover-title,
.end-title {{
  letter-spacing: 0.5px;
}}
"""


def build_theme_css(style: dict, variant: str) -> str:
    if variant == "flagship":
        return BASE_CSS + "\n" + FLAGSHIP_OVERRIDES
    return BASE_CSS


def esc(value: str) -> str:
    return html.escape(value, quote=False)


def paragraphs(text: str) -> str:
    if not text:
        return ""
    parts = [segment.strip() for segment in text.split("\n") if segment.strip()]
    return "".join(f"<p>{esc(segment)}</p>" for segment in parts)


def render_bullets(items: Iterable[str]) -> str:
    items = list(items)
    if not items:
        return ""
    rows = []
    for item in items:
        rows.append(
            f"""
            <div class="bullet-item">
              <div class="bullet-dot"></div>
              <div>{esc(item)}</div>
            </div>
            """
        )
    return f'<div class="bullet-list">{"".join(rows)}</div>'


def render_process(steps: list[dict]) -> str:
    rows = []
    for idx, step in enumerate(steps, start=1):
        rows.append(
            f"""
            <div class="process-step">
              <div class="process-number">{idx}</div>
              <div class="process-main">
                <strong>{esc(step["title"])}</strong>
                <div>{esc(step["desc"])}</div>
              </div>
            </div>
            """
        )
    return f'<div class="process-list">{"".join(rows)}</div>'


def render_tags(items: list[str]) -> str:
    chips = "".join(f'<span class="chip">{esc(item)}</span>' for item in items)
    return f'<div class="chip-wrap">{chips}</div>'


def render_compare(items: list[dict]) -> str:
    rows = []
    for item in items:
        rows.append(
            f"""
            <div class="compare-row">
              <div class="compare-name">{esc(item["name"])}</div>
              <div class="compare-track">
                <div class="compare-fill" style="width:{int(item['value'])}%;"></div>
              </div>
              <div class="compare-label">{esc(item["label"])}</div>
            </div>
            """
        )
    return f'<div class="compare-wrap">{"".join(rows)}</div>'


def render_card(card: dict) -> str:
    span_class = card.get("span", "")
    common_head = '<div class="card-line"></div><div class="card-glow"></div>'
    title_html = f'<h3 class="card-title">{esc(card.get("title", ""))}</h3>' if card.get("title") else ""

    if card["card_type"] == "data":
        body = f"""
        {common_head}
        {title_html}
        <div class="data-top">
          <span class="data-value">{esc(card["value"])}</span>
          <span class="data-label">{esc(card["label"])}</span>
        </div>
        <div class="card-copy">{paragraphs(card.get("description", ""))}</div>
        {'<div class="trend-pill">' + esc(card["trend"]) + '</div>' if card.get("trend") else ''}
        <div class="progress-track"><div class="progress-fill" style="width:{card.get('progress', 0)}%;"></div></div>
        """
    elif card["card_type"] == "list":
        body = f"""
        {common_head}
        {title_html}
        <div class="card-copy">{paragraphs(card.get("content", ""))}</div>
        {render_bullets(card.get("items", []))}
        """
    elif card["card_type"] == "process":
        body = f"""
        {common_head}
        {title_html}
        <div class="card-copy">{paragraphs(card.get("content", ""))}</div>
        {render_process(card.get("steps", []))}
        """
    elif card["card_type"] == "tag_cloud":
        body = f"""
        {common_head}
        {title_html}
        <div class="card-copy">{paragraphs(card.get("content", ""))}</div>
        {render_tags(card.get("items", []))}
        """
    elif card["card_type"] == "compare":
        body = f"""
        {common_head}
        {title_html}
        <div class="card-copy">{paragraphs(card.get("content", ""))}</div>
        {render_compare(card.get("items", []))}
        """
    else:
        body = f"""
        {common_head}
        {title_html}
        <div class="card-copy">{paragraphs(card.get("content", ""))}</div>
        {render_bullets(card.get("items", []))}
        """

    return f'<div class="card {span_class}">{body}</div>'


def footer(slide: dict, total: int) -> str:
    if slide["page_type"] in {"cover", "section"}:
        return ""
    return f"""
    <div class="footer">
      <div>PART 0{slide["part_index"]} · {esc(slide["part_title"])}</div>
      <div class="footer-right">{slide["page_number"]:02d} / {total:02d} | QClaw Shenzhen Training</div>
    </div>
    """


def render_cover(slide: dict, total: int) -> str:
    stats = "".join(
        f"""
        <div class="mini-card">
          <div class="mini-label">{esc(item["label"])}</div>
          <div class="mini-value">{esc(item["value"])}</div>
        </div>
        """
        for item in slide["hero_stats"]
    )
    tasks = [
        ("趋势认知", "看懂 AI 与办公变化"),
        ("安装绑定", "敢装、敢连、敢试"),
        ("实操教学", "基础办公场景上手"),
        ("安全边界", "守住寿险合规底线"),
    ]
    task_html = "".join(
        f'<div class="hero-task">{esc(title)}<span>{esc(desc)}</span></div>' for title, desc in tasks
    )
    meta_html = "".join(f"<span>{esc(item)}</span>" for item in slide["meta"])
    return f"""
    <div class="cover-shell" style="--part-accent:{PART_ACCENTS[1]};">
      <div class="bg-shape shape-a"></div>
      <div class="bg-shape shape-b"></div>
      <div class="bg-shape shape-c"></div>
      <div class="cover-left">
        <div class="cover-kicker">QCLAW AI OFFICE TRAINING</div>
        <h1 class="cover-title">{esc(slide["title"])}</h1>
        <div class="cover-subtitle">{esc(slide["subtitle"])}</div>
        <div class="cover-meta">{meta_html}</div>
      </div>
      <div class="cover-right">
        <div class="hero-ring"></div>
        <div class="hero-panel hero-panel-a">
          <div class="hero-grid">{stats}</div>
        </div>
        <div class="hero-panel hero-panel-b">
          <div class="hero-list">
            <div class="mini-label">今天会解决什么</div>
            {task_html}
          </div>
        </div>
        <div class="hero-panel hero-panel-c">
          <div class="hero-list">
            <div class="mini-label">培训输出结果</div>
            <div class="hero-task">看懂 AI 与 OpenClaw 的关系<span>先建立认知，再进入实操</span></div>
            <div class="hero-task">完成安装绑定与首个任务<span>围绕文件整理、数据汇总、文档撰写</span></div>
            <div class="hero-task">记住数据安全红线<span>能试什么，绝不能碰什么</span></div>
          </div>
        </div>
      </div>
      {footer(slide, total)}
    </div>
    """


def render_toc(slide: dict, total: int) -> str:
    cards = []
    for idx, section in enumerate(slide["sections"], start=1):
        cards.append(
            f"""
            <div class="toc-card">
              <div class="toc-index">{idx:02d}</div>
              <h3>{esc(section)}</h3>
              <p>围绕这一章，讲认知、讲方法、讲边界、讲行动。</p>
            </div>
            """
        )
    timeline_html = "".join(
        f"""
        <div class="timeline-item">
          <strong>{esc(title)}</strong>
          <span>{esc(duration)}</span>
        </div>
        """
        for title, duration in slide["timeline"]
    )
    return f"""
    <div class="toc-shell" style="--part-accent:{PART_ACCENTS[1]};">
      <div class="bg-shape shape-a"></div>
      <div class="bg-shape shape-b"></div>
      <div class="toc-title">
        <div class="overline">TRAINING MAP</div>
        <h1 class="page-title">{esc(slide["title"])}</h1>
        <div class="title-underline"></div>
        <div class="summary-pill">{esc(slide["subtitle"])}</div>
      </div>
      <div class="toc-grid">{"".join(cards)}</div>
      <div class="timeline">{timeline_html}</div>
      {footer(slide, total)}
    </div>
    """


def render_section(slide: dict, total: int) -> str:
    accent = PART_ACCENTS.get(slide["part_index"], PART_ACCENTS[1])
    return f"""
    <div class="section-shell" style="--part-accent:{accent};">
      <div class="bg-shape shape-a"></div>
      <div class="bg-shape shape-b"></div>
      <div class="bg-shape shape-c"></div>
      <div class="section-center">
        <div class="section-number">PART 0{slide["part_index"]} · {esc(slide["part_title"])}</div>
        <div class="section-title">{esc(slide["title"])}</div>
        <div class="section-subtitle">{esc(slide["subtitle"])}</div>
        <div class="section-quote">{esc(slide["quote"])}</div>
      </div>
      <div class="section-watermark">0{slide["part_index"]}</div>
      {footer(slide, total)}
    </div>
    """


def render_end(slide: dict, total: int) -> str:
    cards_html = "".join(
        f"""
        <div class="end-card">
          <strong>要点 {idx}</strong>
          <p>{esc(item)}</p>
        </div>
        """
        for idx, item in enumerate(slide["cards"], start=1)
    )
    return f"""
    <div class="end-shell" style="--part-accent:{PART_ACCENTS[6]};">
      <div class="bg-shape shape-a"></div>
      <div class="bg-shape shape-b"></div>
      <div class="end-main">
        <div class="overline">Q & A</div>
        <h1 class="end-title">{esc(slide["title"])}</h1>
        <div class="title-underline"></div>
        <div class="end-subtitle">{esc(slide["subtitle"])}</div>
      </div>
      <div class="end-grid">{cards_html}</div>
      <div class="end-quote">AI 大时代日新月异，只要开始，我们就都在路上。</div>
      {footer(slide, total)}
    </div>
    """


def render_content(slide: dict, total: int) -> str:
    accent = PART_ACCENTS.get(slide["part_index"], PART_ACCENTS[1])
    layout_map = {
        "two_col": "layout-two",
        "three_col": "layout-three",
        "main_sub": "layout-main-sub",
        "hero_3": "layout-hero-3",
        "mixed_5": "layout-mixed-5",
        "mixed_6": "layout-mixed-6",
    }
    layout_class = layout_map.get(slide["layout"], "layout-three")
    cards_html = "".join(render_card(card) for card in slide["cards"])
    summary = (
        f'<div class="summary-pill">{esc(slide["summary"])}</div>'
        if slide.get("summary")
        else ""
    )
    return f"""
    <div style="--part-accent:{accent};">
      <div class="bg-shape shape-a"></div>
      <div class="bg-shape shape-b"></div>
      <div class="title-area">
        <div class="overline">PART 0{slide["part_index"]} · {esc(slide["part_title"])}</div>
        <h1 class="page-title">{esc(slide["title"])}</h1>
        <div class="title-underline"></div>
        {summary}
      </div>
      <div class="content-area {layout_class}">
        {cards_html}
      </div>
      {footer(slide, total)}
    </div>
    """


def build_transition_line(current_slide: dict, next_slide: dict | None) -> str:
    if next_slide is None:
        return "最后停顿 2 秒，进入答疑或收尾。"
    if next_slide["page_type"] == "section":
        return f"这一页收束后，用一句“下面进入{next_slide['title']}”再翻页。"
    return f"讲完这一页后，把最后一句自然落到“{next_slide['title']}”，顺势翻到下一页。"


def extract_primary_hooks(slide: dict) -> list[str]:
    hooks: list[str] = []
    for card in slide.get("cards", []):
        label = card.get("title") or card.get("label") or card.get("value")
        if label:
            hooks.append(label)
        if len(hooks) >= 2:
            break
    return hooks


def build_speaker_notes_markdown(slides: list[dict], variant: str = "standard") -> str:
    header = "# QClaw 培训逐页讲稿备注卡"
    guide = "使用建议：每页备注控制在 20-50 秒，先讲结论，再讲案例或方法，最后给翻页提示。"
    if variant == "flagship":
        header = "# QClaw 培训逐页讲稿备注卡（现场演示专用版）"
        guide = "使用建议：优先服务现场演示与大会式讲解，强调停顿、翻页、画面停留、实操话术和观众注意力调度。"
    lines = [header, "", guide, ""]
    total = len(slides)
    for index, slide in enumerate(slides):
        next_slide = slides[index + 1] if index + 1 < total else None
        page_no = slide["page_number"]
        lines.append(f"## Slide {page_no:02d} · {slide['title']}")
        if slide["page_type"] == "cover":
            notes = [
                "开场先问好，再说明今天的主题是“让非技术员工也能真正上手 QClaw”。",
                "强调今天不是讲空概念，而是围绕安装绑定、核心功能、基础办公场景和数据安全来做实操教学。",
                "点一下“我们都是 AI 大模型大时代的赶路人”，把现场情绪拉到积极、共进的状态。",
                build_transition_line(slide, next_slide),
            ]
        elif slide["page_type"] == "toc":
            notes = [
                "这一页不要逐字念目录，而是把 6 个模块讲成一条学习路径：先看趋势、再懂原理、再装工具、再做演示、再守边界、最后形成行动。",
                "提醒大家尤其关注安装绑定、核心功能实操和数据安全，因为这三部分最直接决定今天能不能马上用起来。",
                "可以告诉大家：中途如果想到问题先记下来，答疑页集中解决。",
                build_transition_line(slide, next_slide),
            ]
        elif slide["page_type"] == "section":
            notes = [
                f"这里停半拍，明确告诉大家：下面进入“{slide['title']}”这一章节。",
                f"用一句话点出这一章要解决的问题：{slide['subtitle']}",
                "章节过渡页语速可以稍慢，让观众从上一段内容切换到下一段内容。",
                build_transition_line(slide, next_slide),
            ]
        elif slide["page_type"] == "end":
            notes = [
                "收尾时先回顾：今天已经把趋势、安装绑定、实操教学和安全边界四件事串起来了。",
                "再强调行动：今天下班前完成安装绑定，先做一个低风险公开办公任务。",
                "最后把气氛拉到正向共勉，再进入现场提问。",
                build_transition_line(slide, next_slide),
            ]
        else:
            summary = slide.get("summary", slide["title"])
            hooks = extract_primary_hooks(slide)
            hook_text = "、".join(hooks) if hooks else slide["title"]
            part_title = slide["part_title"]
            reminder = "语气保持自然、有节奏。"
            if part_title == "安全合规":
                reminder = "这一页语气要明显更严肃，重点强调底线和责任，不能讲得轻飘。"
            elif part_title == "业务实战":
                reminder = "这一页适合多举 1 个现场工作例子，让非技术同事立刻产生代入感。"
            elif part_title == "行动激励":
                reminder = "这一页要坚定但不制造恐慌，把焦点落在‘现在开始也不晚’。"
            elif "演示" in slide["title"] or "安装" in slide["title"]:
                reminder = "这里可以停 2-3 秒，让观众看画面或跟着你一起想象操作流程。"
            notes = [
                f"先用一句话讲结论：{summary}",
                f"重点展开“{hook_text}”，不要平均用力，优先讲最打动现场的一到两个点。",
                reminder,
                build_transition_line(slide, next_slide),
            ]
            if variant == "flagship":
                if "演示" in slide["title"] or "安装" in slide["title"]:
                    notes.insert(2, "这一页按现场演示页处理：翻到页面后先停 1 秒，让观众先看画面，再按步骤讲。")
                elif part_title == "业务实战":
                    notes.insert(2, "讲到案例页时，先讲场景，再讲指令，最后讲人工把关点，翻页节奏要干脆。")
                elif slide["page_number"] in {3, 4, 5}:
                    notes.insert(2, "这一页是大会主视觉阶段，语速略慢，句子更短，给观众留出理解和拍照时间。")
        for note in notes:
            lines.append(f"- {note}")
        lines.append("")
    return "\n".join(lines)


def build_demo_runbook_markdown() -> str:
    lines = [
        "# QClaw 演示与实操步骤手册",
        "",
        "适用场景：培训现场直接照着演，优先选择公开、脱敏、低风险任务。",
        "",
        "## 一、上台前准备",
        "- 确认 `QClaw` 客户端已登录，网络稳定，浏览器可全屏打开 `preview.html`。",
        "- 提前准备测试文件夹：`桌面\\测试文件夹`、`公开通知素材`、`模拟数据表`。",
        "- 所有指令先在自己电脑上跑过一遍，确保结果稳定。",
        "- 同时准备 HTML 版和 PPTX 版，现场异常时能快速切换。",
        "",
        "## 二、演示 1：文件整理",
        "- 第1步：先展示原始文件夹，让大家看到文件是乱的。",
        "- 第2步：明确范围，只限定在测试文件夹内操作。",
        "- 第3步：输入指令：请整理“桌面\\测试文件夹”中的文件，按文件类型建立子文件夹，把图片、PDF、Word、Excel 分别归类，最后输出整理结果说明。",
        "- 第4步：执行过程中只解释两件事：它在读取文件、它在按规则分类。",
        "- 第5步：打开结果文件夹，现场核验分类是否正确。",
        "- 第6步：收束一句话：这种任务适合公开或脱敏测试材料，不适合直接处理敏感原始数据。",
        "",
        "## 三、演示 2：文档撰写",
        "- 第1步：给场景，例如“帮我写一份周会通知”或“帮我写一个 5 分钟晨会提纲”。",
        "- 第2步：给要求，至少说清楚对象、语气、字数、结构。",
        "- 第3步：先让它输出第一版，再补一句“更口语化”或“更正式一些”。",
        "- 第4步：只展示修改前后差异，让大家直观看到省脑力的价值。",
        "- 推荐指令：请帮我写一份周会通知，发给部门同事，语气清楚正式，控制在 150 字以内，并列出 3 个会议重点。",
        "",
        "## 四、演示 3：数据汇总",
        "- 第1步：不要直接上传真实敏感数据，优先用模拟表格或字段描述演示。",
        "- 第2步：说清楚有哪些列、想统计什么、输出成什么格式。",
        "- 第3步：要求它分步骤说明处理逻辑，而不是只给结论。",
        "- 第4步：用一组模拟数据现场核验 1 次，证明它是辅助工具，不替代人工判断。",
        "- 推荐指令：A 列是姓名，B 列是日期，C 列是业绩金额，请告诉我如何筛选本月业绩大于 1 万的记录，并分步骤说明操作方法。",
        "",
        "## 五、现场话术模板",
        "- 开场句：这一项不是炫技，而是我们每天都可能遇到的基础办公动作。",
        "- 解释句：我先让 QClaw 帮我做第一步，结果出来后我再人工确认。",
        "- 收束句：如果这个动作你今晚下班后也愿意自己试一次，这场培训就值了。",
        "",
        "## 六、现场防翻车原则",
        "- 不现场临时写复杂指令。",
        "- 不直接演示真实敏感数据。",
        "- 网络波动时，立刻切换到备用结果页或备用场景。",
        "- 每次演示结束都要补一句边界提醒：能辅助，不替代最终判断。",
        "",
    ]
    return "\n".join(lines)


def wrap_html(body_content: str, css_text: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1280, initial-scale=1.0" />
<title>QClaw Training Slide</title>
<style>
{css_text}
</style>
</head>
<body>
{body_content}
</body>
</html>
"""


def render_slide(slide: dict, total: int, css_text: str) -> str:
    page_type = slide["page_type"]
    if page_type == "cover":
        body_content = render_cover(slide, total)
    elif page_type == "toc":
        body_content = render_toc(slide, total)
    elif page_type == "section":
        body_content = render_section(slide, total)
    elif page_type == "end":
        body_content = render_end(slide, total)
    else:
        body_content = render_content(slide, total)
    return wrap_html(body_content, css_text)


def reset_output_dirs(output_dir: Path) -> None:
    slides_dir = output_dir / "slides"
    svg_dir = output_dir / "svg"
    images_dir = output_dir / "images"
    output_dir.mkdir(exist_ok=True)
    for directory in (slides_dir, svg_dir, images_dir):
        if directory.exists():
            shutil.rmtree(directory)
        directory.mkdir(parents=True, exist_ok=True)


def write_json_files(output_dir: Path, style: dict) -> None:
    (output_dir / "style.json").write_text(
        json.dumps(style, ensure_ascii=False, indent=2),
        encoding="utf-8",
        newline="\n",
    )
    (output_dir / "planning.json").write_text(
        json.dumps(SLIDES, ensure_ascii=False, indent=2),
        encoding="utf-8",
        newline="\n",
    )


def write_speaker_notes(output_dir: Path, variant: str) -> None:
    (output_dir / "speaker_notes_cards.md").write_text(
        build_speaker_notes_markdown(SLIDES, variant),
        encoding="utf-8",
        newline="\n",
    )
    if variant == "flagship":
        (output_dir / "live_demo_cue_cards.md").write_text(
            build_speaker_notes_markdown(SLIDES, "flagship"),
            encoding="utf-8",
            newline="\n",
        )


def write_demo_runbook(output_dir: Path) -> None:
    (output_dir / "qclaw_demo_runbook.md").write_text(
        build_demo_runbook_markdown(),
        encoding="utf-8",
        newline="\n",
    )


def write_html_slides(output_dir: Path, css_text: str) -> None:
    slides_dir = output_dir / "slides"
    total = len(SLIDES)
    for slide in SLIDES:
        html_content = render_slide(slide, total, css_text)
        file_path = slides_dir / f"{slide['page_number']:02d}.html"
        file_path.write_text(html_content, encoding="utf-8", newline="\n")


def generate_bundle(output_dir: Path, style: dict, variant: str) -> None:
    css_text = build_theme_css(style, variant)
    reset_output_dirs(output_dir)
    write_json_files(output_dir, style)
    write_speaker_notes(output_dir, variant)
    write_demo_runbook(output_dir)
    write_html_slides(output_dir, css_text)


def main() -> None:
    generate_bundle(OUTPUT_DIR, STYLE, "standard")
    generate_bundle(FLAGSHIP_OUTPUT_DIR, FLAGSHIP_STYLE, "flagship")
    print(f"Generated {len(SLIDES)} slides into {OUTPUT_DIR / 'slides'}")
    print(f"Generated {len(SLIDES)} flagship slides into {FLAGSHIP_OUTPUT_DIR / 'slides'}")


if __name__ == "__main__":
    main()
