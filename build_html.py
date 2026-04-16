import json
import os

with open('ppt-output/style.json', 'r', encoding='utf-8') as f:
    style = json.load(f)

with open('ppt-output/planning.json', 'r', encoding='utf-8') as f:
    planning = json.load(f)

css_vars = f"""
:root {{
  --bg-primary: {style['background']['primary']};
  --bg-secondary: {style['background']['gradient_to']};
  --card-bg-from: {style['card']['gradient_from']};
  --card-bg-to: {style['card']['gradient_to']};
  --card-border: {style['card']['border']};
  --card-radius: {style['card']['border_radius']}px;
  --text-primary: {style['text']['primary']};
  --text-secondary: {style['text']['secondary']};
  --accent-1: {style['accent']['primary'][0]};
  --accent-2: {style['accent']['primary'][1]};
  --accent-3: {style['accent']['secondary'][0]};
  --accent-4: {style['accent']['secondary'][1]};
  --font-family: {style['font_family']};
}}
"""

html_template = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
{css_vars}
body {{
  margin: 0; padding: 0;
  width: 1280px; height: 720px;
  background: linear-gradient(135deg, var(--bg-primary), var(--bg-secondary));
  font-family: var(--font-family);
  color: var(--text-primary);
  overflow: hidden;
  position: relative;
}}
.title-area {{
  position: absolute;
  left: 40px; top: 40px;
  width: 1200px; height: 50px;
}}
.page-title {{
  font-size: 32px; font-weight: 700; margin: 0;
  position: relative;
  display: inline-block;
}}
.page-title::after {{
  content: ''; position: absolute;
  left: 0; bottom: -8px;
  width: 60px; height: 4px;
  background: linear-gradient(90deg, var(--accent-1), var(--accent-2));
  border-radius: 2px;
}}
.content-area {{
  position: absolute;
  left: 40px; top: 120px;
  width: 1200px; height: 540px;
  display: grid;
  gap: 20px;
}}
.card {{
  background: linear-gradient(135deg, var(--card-bg-from), var(--card-bg-to));
  border: 1px solid var(--card-border);
  border-radius: var(--card-radius);
  padding: 24px;
  display: flex; flex-direction: column;
  position: relative;
  overflow: hidden;
}}
.card-title {{
  font-size: 20px; font-weight: 700; margin: 0 0 16px 0;
  color: var(--text-primary);
}}
.card-content {{
  font-size: 14px; line-height: 1.8; color: var(--text-secondary);
  flex: 1;
}}
.data-card .core-data {{
  font-size: 48px; font-weight: 800; color: var(--accent-1);
  font-variant-numeric: tabular-nums;
  margin: 10px 0;
}}
.footer {{
  position: absolute; bottom: 20px; left: 40px; right: 40px;
  display: flex; justify-content: space-between;
  font-size: 12px; color: var(--text-secondary); opacity: 0.6;
}}
/* Grid Layouts */
.layout-single {{ grid-template: 1fr / 1fr; }}
.layout-50-50 {{ grid-template: 1fr / 1fr 1fr; }}
.layout-23-13 {{ grid-template: 1fr / 2fr 1fr; }}
.layout-3col {{ grid-template: 1fr / repeat(3, 1fr); }}
.layout-main-sub {{ grid-template: 1fr 1fr / 2fr 1fr; }}
.layout-hero-3 {{ grid-template: auto 1fr / repeat(3, 1fr); }}
.layout-mixed {{ grid-template: repeat(2, 1fr) / 1fr 1fr; }}
.highlight {{
  color: var(--accent-1); font-weight: bold;
}}
</style>
</head>
<body>
{body_content}
<div class="footer">
  <span>{footer_left}</span>
  <span>{footer_right}</span>
</div>
</body>
</html>
"""

def generate_card_html(card, index, layout_hint):
    style_str = ""
    if layout_hint == "主次结合" and index == 0:
        style_str = "grid-row: 1 / -1;"
    elif layout_hint == "顶部英雄式" and index == 0:
        style_str = "grid-column: 1 / -1;"
        
    content_html = card.get('content', '').replace('\n', '<br>')
    for kw in card.get('emphasis_keywords', []):
        content_html = content_html.replace(kw, f'<span class="highlight">{kw}</span>')

    if card.get('card_type') == 'data':
        data_point = card.get('data_points', [''])[0] if card.get('data_points') else '100'
        return f"""
        <div class="card data-card" style="{style_str}">
            <h3 class="card-title">{card.get('title', '')}</h3>
            <div class="core-data">{data_point}</div>
            <div class="card-content">{content_html}</div>
            <div style="height:4px; background:var(--card-border); border-radius:2px; margin-top:16px; overflow:hidden;">
                <div style="height:100%; width:75%; background:var(--accent-1); border-radius:2px;"></div>
            </div>
        </div>
        """
    elif card.get('card_type') == 'list' or card.get('card_type') == 'process':
        items = content_html.split('<br>')
        items_html = "".join([f'<div style="display:flex; gap:10px; margin-bottom:12px;"><div style="min-width:8px; height:8px; border-radius:50%; background:var(--accent-1); margin-top:6px;"></div><div>{item}</div></div>' for item in items if item.strip()])
        return f"""
        <div class="card" style="{style_str}">
            <h3 class="card-title">{card.get('title', '')}</h3>
            <div class="card-content">{items_html}</div>
        </div>
        """
    else:
        return f"""
        <div class="card" style="{style_str}">
            <h3 class="card-title">{card.get('title', '')}</h3>
            <div class="card-content">{content_html}</div>
        </div>
        """

def map_layout(hint):
    mapping = {
        "单一焦点": "layout-single",
        "50/50 对称": "layout-50-50",
        "非对称两栏 (2/3 + 1/3)": "layout-23-13",
        "三栏等宽": "layout-3col",
        "主次结合": "layout-main-sub",
        "顶部英雄式": "layout-hero-3",
        "混合网格": "layout-mixed"
    }
    return mapping.get(hint, "layout-mixed")

for page in planning:
    page_num = page['page_number']
    
    if page['page_type'] == 'cover':
        body_content = f"""
        <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100%; text-align:center;">
            <div style="font-size:56px; font-weight:900; color:var(--accent-1); margin-bottom:20px;">{page['title']}</div>
            <div style="font-size:28px; color:var(--text-primary); margin-bottom:40px;">{page['content_summary']['main_content']}</div>
            <div style="font-size:18px; color:var(--text-secondary); margin-top:60px;">{page['content_summary']['supporting_points'][0]} | {page['content_summary']['supporting_points'][1]}</div>
        </div>
        """
        footer_left, footer_right = "", ""
    elif page['page_type'] == 'section':
        body_content = f"""
        <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100%; text-align:center;">
            <div style="font-size:20px; font-weight:700; color:var(--accent-1); letter-spacing:4px; margin-bottom:20px;">PART 0{page_num-1}</div>
            <div style="font-size:48px; font-weight:800; color:var(--text-primary); margin-bottom:20px;">{page['title']}</div>
            <div style="font-size:20px; color:var(--text-secondary);">{page['content_summary']['main_content']}</div>
        </div>
        """
        footer_left, footer_right = "", ""
    elif page['page_type'] == 'end':
        body_content = f"""
        <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100%; text-align:center;">
            <div style="font-size:48px; font-weight:800; color:var(--accent-1); margin-bottom:40px;">{page['title']}</div>
            <div style="font-size:24px; color:var(--text-primary); margin-bottom:20px;">{page['cards'][0]['content'].replace('\\n', '<br>')}</div>
        </div>
        """
        footer_left, footer_right = "", ""
    else:
        cards_html = ""
        for i, card in enumerate(page['cards']):
            cards_html += generate_card_html(card, i, page['layout_hint'])
            
        layout_class = map_layout(page['layout_hint'])
        body_content = f"""
        <div class="title-area">
            <h1 class="page-title">{page['title']}</h1>
        </div>
        <div class="content-area {layout_class}">
            {cards_html}
        </div>
        """
        footer_left = f"深圳分公司AI赋能培训 - {page['title']}"
        footer_right = f"{page_num} / {len(planning)} | QClaw AI Training"

    html = html_template.format(
        css_vars=css_vars,
        body_content=body_content,
        footer_left=footer_left,
        footer_right=footer_right
    )
    
    with open(f"ppt-output/slides/{page_num:02d}.html", "w", encoding="utf-8") as f:
        f.write(html)

print("Generated HTML slides successfully.")
