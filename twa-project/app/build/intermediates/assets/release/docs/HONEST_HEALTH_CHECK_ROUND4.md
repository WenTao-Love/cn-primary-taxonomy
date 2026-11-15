# 四轮终极体检报告

> **审计维度**：安全性 + 可访问性 + 用户流程 + 边界情况 + 代码维护性  
> **审计方法**：XSS向量追踪 + ARIA属性审查 + 用户路径模拟 + 极端数据测试  
> **核心发现**：**2个XSS漏洞 + 若干可访问性改进点 + 用户体验死角 — XSS已全部修复**
>
> **更新（2026年8月22日）**：所有XSS漏洞已修复（inline onclick → data属性+事件委托，q.question转义），并通过重建验证。

---

## 一、安全性审查

### 1.1 🔴 XSS漏洞：inline onclick 未转义

**问题描述**：

H5版本（app.js）中大量使用 inline `onclick` 属性，其中 `topic.id` 直接插入 JavaScript 字符串：

```javascript
// app.js:538, 543, 547, 548, 761, 797, 822, 849, 965, 1181
onclick="window._h5SelectNode('${i.topic.id}')"
onclick="window._h5StartPractice('${topic.id}')"
onclick="window._h5FocusNode('${t.id}')"
```

**风险评估**：
- **当前安全**：所有 `topic.id` 格式为 `ct_YY1S001`（字母+数字+下划线），不含单引号
- **潜在风险**：如果数据源被污染或未来导入外部数据，攻击者可构造 `id` = `');alert(document.cookie);//` 实现 XSS

**修复方案**：

方案A：使用 `data-*` 属性 + 事件委托（推荐）
```javascript
// 创建元素时
div.dataset.topicId = topic.id;
div.addEventListener('click', () => window._h5SelectNode(topic.id));

// 或者使用 data-id 属性
<div class="bs-chain-item hard" data-id="${i.topic.id}">
// 然后在事件处理中读取
const id = e.currentTarget.dataset.id;
```

方案B：转义 ID（最小改动）
```javascript
onclick="window._h5SelectNode('${i.topic.id.replace(/'/g, "\\'")}')"
```

### 1.2 🟡 XSS风险：innerHTML 未转义

**问题描述**：

app.js:661 行：
```javascript
let html = `<div class="practice-question">${idx + 1}. ${q.question}</div>`;
```

`q.question` 包含 `topic.name` 和 `topic.description`，直接插入 innerHTML 未转义。

**当前风险评估**：
- 现有4个 topic.name 包含双引号（`"的、地、得"的用法`），但不含 `<` 或 `>`
- 如果未来数据包含 `<script>` 标签，将直接执行

**修复方案**：
```javascript
let html = `<div class="practice-question">${idx + 1}. ${CNPT.utils.escapeHtml(q.question)}</div>`;
```

### 1.3 安全检查通过项

| 检查项 | 状态 |
|---|---|
| `escapeHtml` 覆盖所有用户可见文本 | ✅ 已覆盖 |
| `textContent` 用于纯文本插入 | ✅ 安全 |
| `JSON.parse` 有 try/catch | ✅ 安全 |
| `localStorage` 数据无敏感信息 | ✅ 仅学习进度 |
| 无 `eval()` / `document.write` | ✅ 未使用 |
| 无 `v-html` / `dangerouslySetInnerHTML` | ✅ 不适用 |

---

## 二、可访问性审查

### 2.1 已具备的ARIA属性

| 属性 | 位置 | 状态 |
|---|---|---|
| `aria-label` | 搜索/筛选/助手按钮 | ✅ |
| `aria-expanded` | 侧边栏折叠按钮 | ✅ |
| `lang="zh-CN"` | 所有HTML | ✅ |
| `<label>` 包裹 `<input>` | 多选筛选器 | ✅ |
| 语义化标签 | header/main/nav/h1-h3 | ✅ |

### 2.2 🟡 可访问性改进点

| 问题 | 影响 | 建议 |
|---|---|---|
| 无 skip navigation 链接 | 键盘用户需跳过导航 | 添加"跳转到主内容"链接 |
| 无 focus 可见指示器 | 键盘用户无法知道当前焦点 | 添加 `:focus-visible` 样式 |
| 颜色作为唯一信息载体 | 色盲用户无法区分 | 添加形状/图案辅助 |
| 无 `role="status"` 区域 | 屏幕阅读器无法感知动态更新 | 为加载/搜索结果添加 aria-live |
| 无 form `<label>` | 部分输入框无标签 | 为所有输入添加 aria-label |

### 2.3 屏幕阅读器兼容性

当前页面在屏幕阅读器下的体验：
- ✅ 有标题层级（h1 → h3）
- ✅ 有 lang 属性
- ⚠️ 图谱可视化无法访问（Canvas/SVG 无替代文本）
- ⚠️ 动态内容更新无通知

**建议**：为图谱添加 `role="img"` 和 `aria-label` 描述，或提供文本替代视图。

---

## 三、用户流程完整性

### 3.1 主流程验证

| 流程 | 步骤 | 状态 |
|---|---|---|
| 首次打开 | 加载 → 显示图谱 → 可交互 | ✅ |
| 搜索知识点 | 输入 → 结果 → 点击 → 定位 | ✅ |
| 筛选节点 | 选择条件 → 图谱更新 | ✅ |
| 查看详情 | 点击节点 → 侧边栏展示 | ✅ |
| 学习路径 | 选择学科年级 → 生成路径 | ✅ |
| 错题本 | 做错题 → 记录 → 查看 | ✅ |

### 3.2 🟡 用户流程断点

| 场景 | 问题 | 建议 |
|---|---|---|
| 数据加载失败 | 仅 toast 提示，无重试按钮 | 添加"重试"按钮 |
| 搜索无结果 | 仅显示文字，无建议 | 推荐相似词或相关知识点 |
| 筛选结果为空 | 图谱空白，无引导 | 提示"当前筛选条件下无节点，试试调整条件" |
| 节点数超限 | 静默截断，用户不知 | 显示"节点过多，已显示前N个，建议缩小筛选范围" |

---

## 四、边界情况处理

### 4.1 极端数据测试

| 场景 | 当前行为 | 建议 |
|---|---|---|
| topic.name 含 `<script>` | 可能执行XSS | 已识别，需修复 |
| topic.name 含 `'` | onclick 可能断裂 | 已识别，需修复 |
| topic.name 为空字符串 | 显示空白 | 显示"未命名知识点" |
| topic.description 为空 | 显示"undefined" | 显示默认文本 |
| 依赖关系断裂 | 孤立节点 | 当前处理正确 |
| 循环依赖 | 不可能（已验证无环） | 无需处理 |

### 4.2 网络异常处理

| 场景 | 当前行为 | 建议 |
|---|---|---|
| 数据加载失败 | toast 提示 | ✅ 已有 |
| 加载超时 | 无超时处理 | 添加10秒超时+重试 |
| 离线状态 | 独立版可用，在线版不可用 | 添加离线检测提示 |

### 4.3 浏览器兼容性

| 特性 | IE11 | Edge | Chrome | Firefox | Safari |
|---|---|---|---|---|---|
| CSS Grid | ❌ | ✅ | ✅ | ✅ | ✅ |
| CSS Variables | ❌ | ✅ | ✅ | ✅ | ✅ |
| Optional Chaining | ❌ | ✅ | ✅ | ✅ | ✅ |
| ES6 Classes | ❌ | ✅ | ✅ | ✅ | ✅ |

**结论**：不支持IE11，但支持所有现代浏览器。

---

## 五、代码维护性

### 5.1 已清理

- ✅ 删除8个未使用工具函数
- ✅ 删除 `_resizeHandler` 死代码
- ✅ 统一搜索结果渲染逻辑

### 5.2 🟡 可改进

| 问题 | 建议 |
|---|---|
| `javascript:void(0)` 反模式 | 改用 `<button>` 或 `event.preventDefault()` |
| 内联 `onclick` 不利于 CSP | 改用 `addEventListener` |
| 部分魔法数字 | 提取为常量（如 `MAX_RENDER_NODES`） |
| 无 JSDoc 注释 | 为公共API添加文档 |

---

## 六、问题优先级排序

### 🔴 P1 - 安全（建议立即修）

| 问题 | 影响 | 修复时间 |
|---|---|---|
| inline onclick 未转义 | 数据污染时XSS | 1-2小时 |
| innerHTML 未转义 q.question | 恶意数据时XSS | 15分钟 |

### 🟡 P2 - 体验（建议规划修）

| 问题 | 影响 | 修复时间 |
|---|---|---|
| 无重试按钮 | 加载失败用户无助 | 30分钟 |
| 筛选空结果无引导 | 用户困惑 | 30分钟 |
| 节点截断无提示 | 用户不知数据不全 | 15分钟 |

### 🟢 P3 - 可访问性（可选）

| 问题 | 影响 | 修复时间 |
|---|---|---|
| 无 skip navigation | 键盘用户不便 | 1小时 |
| 无 focus 指示器 | 键盘用户迷失 | 30分钟 |
| 图谱无文本替代 | 视障用户无法使用 | 2-4小时 |

---

## 七、四轮体检总结

### 好消息

1. **核心安全机制到位** — `escapeHtml` 覆盖大部分场景
2. **ARIA基础良好** — 关键按钮有 aria-label
3. **语义化HTML** — header/main/nav/h1-h3 齐全
4. **用户主流程完整** — 搜索/筛选/路径/错题本 全部可走通
5. **边界处理意识** — 空数据、超限等都有处理

### 需要关注

1. **XSS漏洞** — inline onclick 和未转义 innerHTML 是实际风险
2. **加载失败体验** — 无重试机制
3. **无障碍访问** — 键盘用户和屏幕阅读器用户有障碍

### 一句话评价

> **从"能跑"90分、"跑得好"85分的基础上，安全性还有漏洞需要修补。修复XSS后可达"生产可用"级别。**

---

## 八、修复建议

### 立即修复（1-2小时）

1. **inline onclick 转义**：将所有 `onclick="window._h5SelectNode('${id}')"` 改为使用 data 属性 + 事件委托
2. **q.question 转义**：`CNPT.utils.escapeHtml(q.question)`

### 短期优化（1-2天）

3. 添加"重试"按钮
4. 添加筛选空结果引导
5. 添加节点截断提示

### 长期改进

6. 添加 skip navigation
7. 添加 focus-visible 样式
8. 图谱添加文本替代视图

---

*审计时间：2026年8月22日*  
*审计方法：XSS向量追踪 + ARIA审查 + 用户路径模拟*  
*v4.0 · 四轮终极体检*
