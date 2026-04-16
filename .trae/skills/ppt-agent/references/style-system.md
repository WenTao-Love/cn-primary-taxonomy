# 风格系统

## 风格数据模型

每套风格由以下字段定义：

```json
{
  "style_name": "风格名称",
  "style_id": "dark_tech | xiaomi_orange | blue_white | royal_red | fresh_green | luxury_purple | minimal_gray | vibrant_rainbow",
  "background": {
    "primary": "#色值",
    "gradient_to": "#色值"
  },
  "card": {
    "gradient_from": "#色值",
    "gradient_to": "#色值",
    "border": "rgba(...)",
    "border_radius": 12
  },
  "text": {
    "primary": "#色值",
    "secondary": "rgba(...)",
    "title_size": 28,
    "body_size": 14,
    "card_title_size": 20
  },
  "accent": {
    "primary": ["#渐变起", "#渐变止"],
    "secondary": ["#渐变起", "#渐变止"]
  },
  "font_family": "字体族",
  "grid_pattern": {
    "enabled": true,
    "size": 40,
    "dot_radius": 1,
    "dot_color": "#色值",
    "dot_opacity": 0.05
  },
  "decorations": {
    "corner_lines": false,
    "glow_effects": false,
    "description": "装饰元素描述"
  }
}
```

---

## 预置风格库

### 1. 暗黑科技 (dark_tech)

适用场景：技术产品介绍、AI/SaaS 平台、数据平台、开发者工具

```json
{
  "style_name": "高阶暗黑科技风 (Premium Dark Mode)",
  "style_id": "dark_tech",
  "background": { "primary": "#0B1120", "gradient_to": "#0F172A" },
  "card": { "gradient_from": "#1E293B", "gradient_to": "#0F172A", "border": "rgba(255,255,255,0.05)", "border_radius": 12 },
  "text": { "primary": "#FFFFFF", "secondary": "rgba(255,255,255,0.7)", "title_size": 28, "body_size": 14, "card_title_size": 20 },
  "accent": { "primary": ["#22D3EE", "#3B82F6"], "secondary": ["#FDE047", "#F59E0B"] },
  "font_family": "PingFang SC, Microsoft YaHei, system-ui, sans-serif",
  "grid_pattern": { "enabled": true, "size": 40, "dot_radius": 1, "dot_color": "#FFFFFF", "dot_opacity": 0.05 },
  "decorations": { "corner_lines": true, "glow_effects": true, "description": "角落装饰线条 + 强调色模糊光晕" }
}
```

```css
:root {
  --bg-primary: #0B1120;
  --bg-secondary: #0F172A;
  --card-bg-from: #1E293B;
  --card-bg-to: #0F172A;
  --card-border: rgba(255,255,255,0.05);
  --card-radius: 12px;
  --text-primary: #FFFFFF;
  --text-secondary: rgba(255,255,255,0.7);
  --accent-1: #22D3EE;
  --accent-2: #3B82F6;
  --accent-3: #FDE047;
  --accent-4: #F59E0B;
}
```

---

### 2. 小米橙 (xiaomi_orange)

适用场景：硬件产品、IoT 设备、消费电子、智能家居

```json
{
  "style_name": "小米橙 (Xiaomi Orange)",
  "style_id": "xiaomi_orange",
  "background": { "primary": "#1A1A1A", "gradient_to": "#111111" },
  "card": { "gradient_from": "#2A2A2A", "gradient_to": "#1A1A1A", "border": "rgba(255,105,0,0.15)", "border_radius": 16 },
  "text": { "primary": "#FFFFFF", "secondary": "rgba(255,255,255,0.65)", "title_size": 28, "body_size": 14, "card_title_size": 20 },
  "accent": { "primary": ["#FF6900", "#FF8C00"], "secondary": ["#FFFFFF", "#E0E0E0"] },
  "font_family": "PingFang SC, Microsoft YaHei, system-ui, sans-serif",
  "grid_pattern": { "enabled": false },
  "decorations": { "corner_lines": false, "glow_effects": false, "description": "纯净简约，大面积留白，圆形图标元素" }
}
```

```css
:root {
  --bg-primary: #1A1A1A;
  --bg-secondary: #111111;
  --card-bg-from: #2A2A2A;
  --card-bg-to: #1A1A1A;
  --card-border: rgba(255,105,0,0.15);
  --card-radius: 16px;
  --text-primary: #FFFFFF;
  --text-secondary: rgba(255,255,255,0.65);
  --accent-1: #FF6900;
  --accent-2: #FF8C00;
  --accent-3: #FFFFFF;
  --accent-4: #E0E0E0;
}
```

---

### 3. 蓝白商务 (blue_white)

适用场景：企业介绍、培训课件、教育材料、医疗/金融行业

```json
{
  "style_name": "蓝白商务 (Blue White Business)",
  "style_id": "blue_white",
  "background": { "primary": "#FFFFFF", "gradient_to": "#F8FAFC" },
  "card": { "gradient_from": "#F1F5F9", "gradient_to": "#E2E8F0", "border": "rgba(37,99,235,0.12)", "border_radius": 12 },
  "text": { "primary": "#1E293B", "secondary": "#64748B", "title_size": 28, "body_size": 14, "card_title_size": 20 },
  "accent": { "primary": ["#2563EB", "#1D4ED8"], "secondary": ["#059669", "#047857"] },
  "font_family": "PingFang SC, Microsoft YaHei, system-ui, sans-serif",
  "grid_pattern": { "enabled": false },
  "decorations": { "corner_lines": false, "glow_effects": false, "description": "清爽简洁，蓝色标题装饰条，卡片带浅色背景和细边框" }
}
```

```css
:root {
  --bg-primary: #FFFFFF;
  --bg-secondary: #F8FAFC;
  --card-bg-from: #F1F5F9;
  --card-bg-to: #E2E8F0;
  --card-border: rgba(37,99,235,0.12);
  --card-radius: 12px;
  --text-primary: #1E293B;
  --text-secondary: #64748B;
  --accent-1: #2563EB;
  --accent-2: #1D4ED8;
  --accent-3: #059669;
  --accent-4: #047857;
}
```

---

### 4. 朱红宫墙 (royal_red)

适用场景：文化/历史主题、政务汇报、品牌故事、中国风

```json
{
  "style_name": "朱红宫墙 (Royal Red)",
  "style_id": "royal_red",
  "background": { "primary": "#8B0000", "gradient_to": "#5C0000" },
  "card": { "gradient_from": "#A52A2A", "gradient_to": "#7A0000", "border": "rgba(255,215,0,0.15)", "border_radius": 8 },
  "text": { "primary": "#FFF8E7", "secondary": "rgba(255,248,231,0.75)", "title_size": 28, "body_size": 14, "card_title_size": 20 },
  "accent": { "primary": ["#FFD700", "#FFA500"], "secondary": ["#FFF8E7", "#F5E6C8"] },
  "font_family": "PingFang SC, STSong, SimSun, Microsoft YaHei, serif",
  "grid_pattern": { "enabled": false },
  "decorations": { "corner_lines": true, "glow_effects": false, "description": "金色角饰、祥云纹理，传统纹样装饰边框" }
}
```

```css
:root {
  --bg-primary: #8B0000;
  --bg-secondary: #5C0000;
  --card-bg-from: #A52A2A;
  --card-bg-to: #7A0000;
  --card-border: rgba(255,215,0,0.15);
  --card-radius: 8px;
  --text-primary: #FFF8E7;
  --text-secondary: rgba(255,248,231,0.75);
  --accent-1: #FFD700;
  --accent-2: #FFA500;
  --accent-3: #FFF8E7;
  --accent-4: #F5E6C8;
}
```

---

### 5. 清新自然 (fresh_green)

适用场景：环保/可持续发展、健康/医疗/养生、食品/农业、美妆/护肤

```json
{
  "style_name": "清新自然 (Fresh Green)",
  "style_id": "fresh_green",
  "background": { "primary": "#F0FDF4", "gradient_to": "#ECFDF5" },
  "card": { "gradient_from": "#FFFFFF", "gradient_to": "#F0FDF4", "border": "rgba(22,163,74,0.12)", "border_radius": 16 },
  "text": { "primary": "#14532D", "secondary": "#4B5563", "title_size": 28, "body_size": 14, "card_title_size": 20 },
  "accent": { "primary": ["#16A34A", "#059669"], "secondary": ["#F59E0B", "#D97706"] },
  "font_family": "PingFang SC, Microsoft YaHei, system-ui, sans-serif",
  "grid_pattern": { "enabled": false },
  "decorations": { "corner_lines": false, "glow_effects": false, "description": "轻柔圆角、叶片图标、自然渐变色块，清新透气感" }
}
```

```css
:root {
  --bg-primary: #F0FDF4;
  --bg-secondary: #ECFDF5;
  --card-bg-from: #FFFFFF;
  --card-bg-to: #F0FDF4;
  --card-border: rgba(22,163,74,0.12);
  --card-radius: 16px;
  --text-primary: #14532D;
  --text-secondary: #4B5563;
  --accent-1: #16A34A;
  --accent-2: #059669;
  --accent-3: #F59E0B;
  --accent-4: #D97706;
}
```

---

### 6. 紫金奢华 (luxury_purple)

适用场景：时尚/奢侈品、高端服务/地产、设计/创意行业、品牌发布会

```json
{
  "style_name": "紫金奢华 (Luxury Purple)",
  "style_id": "luxury_purple",
  "background": { "primary": "#120A2E", "gradient_to": "#1A0B3D" },
  "card": { "gradient_from": "#2D1B69", "gradient_to": "#1A0B3D", "border": "rgba(192,132,252,0.1)", "border_radius": 12 },
  "text": { "primary": "#F5F3FF", "secondary": "rgba(245,243,255,0.7)", "title_size": 28, "body_size": 14, "card_title_size": 20 },
  "accent": { "primary": ["#A855F7", "#7C3AED"], "secondary": ["#F59E0B", "#D97706"] },
  "font_family": "PingFang SC, Microsoft YaHei, system-ui, sans-serif",
  "grid_pattern": { "enabled": true, "size": 50, "dot_radius": 1, "dot_color": "#A855F7", "dot_opacity": 0.03 },
  "decorations": { "corner_lines": true, "glow_effects": true, "description": "紫色光晕、金色点缀、钻石切割线条装饰，极致奢华感" }
}
```

```css
:root {
  --bg-primary: #120A2E;
  --bg-secondary: #1A0B3D;
  --card-bg-from: #2D1B69;
  --card-bg-to: #1A0B3D;
  --card-border: rgba(192,132,252,0.1);
  --card-radius: 12px;
  --text-primary: #F5F3FF;
  --text-secondary: rgba(245,243,255,0.7);
  --accent-1: #A855F7;
  --accent-2: #7C3AED;
  --accent-3: #F59E0B;
  --accent-4: #D97706;
}
```

---

### 7. 极简灰白 (minimal_gray)

适用场景：学术/研究报告、法务/合规、咨询/顾问报告、数据分析

```json
{
  "style_name": "极简灰白 (Minimal Gray)",
  "style_id": "minimal_gray",
  "background": { "primary": "#FAFAFA", "gradient_to": "#F5F5F5" },
  "card": { "gradient_from": "#FFFFFF", "gradient_to": "#FAFAFA", "border": "rgba(0,0,0,0.08)", "border_radius": 8 },
  "text": { "primary": "#171717", "secondary": "#737373", "title_size": 28, "body_size": 14, "card_title_size": 20 },
  "accent": { "primary": ["#171717", "#404040"], "secondary": ["#DC2626", "#B91C1C"] },
  "font_family": "'Inter', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif",
  "grid_pattern": { "enabled": false },
  "decorations": { "corner_lines": false, "glow_effects": false, "description": "纯净无装饰、大量留白、精确排版、红色仅用于关键数据强调" }
}
```

```css
:root {
  --bg-primary: #FAFAFA;
  --bg-secondary: #F5F5F5;
  --card-bg-from: #FFFFFF;
  --card-bg-to: #FAFAFA;
  --card-border: rgba(0,0,0,0.08);
  --card-radius: 8px;
  --text-primary: #171717;
  --text-secondary: #737373;
  --accent-1: #171717;
  --accent-2: #404040;
  --accent-3: #DC2626;
  --accent-4: #B91C1C;
}
```

---

### 8. 活力彩虹 (vibrant_rainbow)

适用场景：社交/娱乐平台、营销/推广材料、年轻品牌、创意方案

```json
{
  "style_name": "活力彩虹 (Vibrant Rainbow)",
  "style_id": "vibrant_rainbow",
  "background": { "primary": "#FFFFFF", "gradient_to": "#FFF7ED" },
  "card": { "gradient_from": "#FFFFFF", "gradient_to": "#FFF1E6", "border": "rgba(251,146,60,0.15)", "border_radius": 20 },
  "text": { "primary": "#1C1917", "secondary": "#57534E", "title_size": 28, "body_size": 14, "card_title_size": 20 },
  "accent": { "primary": ["#F97316", "#EC4899"], "secondary": ["#8B5CF6", "#06B6D4"] },
  "font_family": "'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif",
  "grid_pattern": { "enabled": false },
  "decorations": { "corner_lines": false, "glow_effects": false, "description": "多彩渐变色块、圆润大圆角、活力四溢的卡片配色（每张卡片可用不同 accent 色）" }
}
```

```css
:root {
  --bg-primary: #FFFFFF;
  --bg-secondary: #FFF7ED;
  --card-bg-from: #FFFFFF;
  --card-bg-to: #FFF1E6;
  --card-border: rgba(251,146,60,0.15);
  --card-radius: 20px;
  --text-primary: #1C1917;
  --text-secondary: #57534E;
  --accent-1: #F97316;
  --accent-2: #EC4899;
  --accent-3: #8B5CF6;
  --accent-4: #06B6D4;
}
```

---

## 风格自动推断

当用户未指定风格时，根据主题关键词自动推断：

| 关键词匹配 | 推荐风格 |
|-----------|---------|
| AI、机器学习、深度学习、SaaS、云、平台、API、开发者、大模型、LLM、数据、算法 | dark_tech |
| 手机、硬件、IoT、智能家居、芯片、穿戴、电子、家电、机器人 | xiaomi_orange |
| 企业、公司、培训、教育、医疗、金融、银行、保险、制药、GLP、GMP、质量 | blue_white |
| 文化、历史、国风、中国、政务、党建、品牌故事、非遗、传统 | royal_red |
| 环保、绿色、可持续、健康、养生、食品、农业、有机、美妆、护肤、自然 | fresh_green |
| 时尚、奢侈品、高端、地产、设计、创意、艺术、珠宝、定制 | luxury_purple |
| 学术、研究、论文、报告、法务、合规、咨询、审计、数据分析、白皮书 | minimal_gray |
| 社交、娱乐、营销、推广、年轻、潮流、游戏、直播、短视频、电商 | vibrant_rainbow |
| 其他未匹配 | blue_white（最通用的默认风格） |

## 自定义风格

用户可以在 Step 1 的"补充需求"中指定品牌色：

> "品牌主色 #1DA1F2，背景用深色"

此时基于最接近的预置风格，替换对应的色值字段：
1. 将 accent.primary 替换为用户品牌色
2. 根据品牌色明度自动选择 background 深/浅
3. 其他字段保持预置风格的值
