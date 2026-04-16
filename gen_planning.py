import json
import re

with open('docs/QClaw培训PPT大纲.md', 'r', encoding='utf-8') as f:
    text = f.read()

slides_raw = text.split('### Slide ')[1:]
planning = []

def parse_cards(content_lines, page_type, title):
    cards = []
    
    # 针对封面页特殊处理
    if page_type == "cover":
        main_title = ""
        sub_title = ""
        for line in content_lines:
            if "主标题：" in line:
                main_title = line.split("主标题：")[1].strip().replace('**', '')
            elif "副标题：" in line:
                sub_title = line.split("副标题：")[1].strip().replace('**', '')
        
        cards.append({
            "position": "center",
            "card_type": "text",
            "title": "",
            "content": f"{sub_title}",
            "data_points": [],
            "emphasis_keywords": []
        })
        return cards, main_title, sub_title

    # 常规卡片解析
    for line in content_lines:
        line = line.strip()
        if not line or line.startswith('#'): continue
        if line.startswith('* ') or line.startswith('- ') or re.match(r'^\d+\.\s', line):
            text_content = re.sub(r'^(\* |- |\d+\.\s)', '', line).replace('**', '')
            
            parts = text_content.split('：', 1)
            card_title = parts[0] if len(parts) > 1 else ""
            desc = parts[1] if len(parts) > 1 else text_content
            
            # 如果是纯文本列表项，没有冒号，则不要空标题
            if not card_title and len(desc) < 15:
                card_title = desc
                desc = ""
                
            cards.append({
                "position": "auto",
                "card_type": "text",
                "title": card_title.strip(),
                "content": desc.strip(),
                "data_points": [],
                "emphasis_keywords": []
            })
    
    if not cards:
        cards.append({
            "position": "center",
            "card_type": "text",
            "title": "",
            "content": "详见演讲备注",
            "data_points": [],
            "emphasis_keywords": []
        })
    return cards, title, "详细内容"

for raw in slides_raw:
    lines = raw.strip().split('\n')
    header_line = lines[0]
    
    match = re.match(r'(\d+):\s*(.*)', header_line)
    if not match: continue
    
    page_num = int(match.group(1))
    raw_title = match.group(2).strip()
    
    page_type = "content"
    if page_num == 1:
        page_type = "cover"
    elif "目录" in raw_title:
        page_type = "toc"
    elif "答疑" in raw_title or "致谢" in raw_title or "结束" in raw_title:
        page_type = "end"
    elif "过渡页" in raw_title:
        page_type = "section"
        raw_title = raw_title.replace("模块过渡页：", "")
        
    cards, final_title, sub_content = parse_cards(lines[1:], page_type, raw_title)
    
    # 修复：如果是封面页，标题应该用大纲里解析出来的主标题
    if page_type == "cover" and final_title:
        raw_title = final_title
    
    layout_hint = "混合网格"
    if len(cards) == 1:
        layout_hint = "单一焦点"
    elif len(cards) == 2:
        layout_hint = "非对称两栏 (2/3 + 1/3)"
    elif len(cards) == 3:
        layout_hint = "三栏等宽"
        
    planning.append({
        "page_number": page_num,
        "page_type": page_type,
        "title": raw_title,
        "goal": "",
        "layout_hint": layout_hint,
        "content_summary": {
            "core_argument": "",
            "main_content": sub_content if page_type == "cover" else (raw_title if page_type == "section" else "详细内容"),
            "data_highlights": [],
            "supporting_points": ["QClaw培训", "深圳分公司"],
            "quote_or_conclusion": ""
        },
        "cards": cards,
        "design_notes": ""
    })

with open('ppt-output/planning.json', 'w', encoding='utf-8') as f:
    json.dump(planning, f, ensure_ascii=False, indent=2)

print(f"Generated planning.json with {len(planning)} slides")