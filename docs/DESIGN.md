# 中国小学教育知识图谱（CN-Primary-Taxonomy）设计文档

> 基于 [Marble Skill Taxonomy v1](https://github.com/withmarbleapp/os-taxonomy)（美国 Marble 公司开源）二次开发，面向中国大陆小学教育的本土化知识图谱。

## 一、项目目标

构建一个面向中国大陆 1-6 年级小学生的**开放、结构化、可计算**的知识图谱：

- **细粒度知识点**：将学科课程拆解为可教、可测的"微知识点"（micro-topic）
- **前置依赖图**：用有向无环图（DAG）表达"学X之前必须先会Y"，支持学习路径规划、薄弱点诊断
- **课标对齐**：每个知识点对齐《义务教育课程标准（2022年版）》
- **教材对齐**：标注主流教材版本（统编版/人教版/北师大版/苏教版/外研版/教科版等）
- **面向应用**：纯 JSON 数据，零运行时依赖，可直接用于学习 App、AI 辅导产品、错题本、自适应学习系统
- **家长友好**：为非技术专业背景的家长提供直观、易用的交互体验

## 二、与 Marble 原版的关键差异

| 维度 | Marble（原版） | CN-Primary-Taxonomy（本项目） |
|---|---|---|
| 目标国家 | 英美（英+美课标） | 中国大陆（2022新课标） |
| 学科数量 | 8（英/数/科/史/社交/生活/计算/学会学习） | 11（语/数/英/科/道法/劳动/体育与健康/美术/音乐/信息科技/AI素养） |
| 语文课 | English（英语母语语文） | **语文**（中文母语，含拼音/识字/写字/阅读/习作/古诗文/口语交际） |
| 英语 | 英语母语语文课 | **英语（外语）**：CEFT Pre-A1/A1 起步，听说是主 |
| 历史 | 英国史/古埃及/希腊罗马 | 不单独设科（小学历史内容融入语文+道法），图谱中以专题方式保留文化常识 |
| 道法/思政 | 无 | **道德与法治**（必修，2016年起替代品德） |
| 劳动 | Life Skills（生活技能） | **劳动**（2022新课标独立成必修，含日常生活劳动/生产劳动/服务性劳动） |
| 艺术 | 无 | **音乐**+**美术**（代表性知识点） |
| 体育 | 无 | **体育与健康**（代表性知识点） |
| 信息科技 | Computing（偏AI素养） | **信息科技**（2022新课标独立成必修，含信息意识/计算思维/数字化学习/信息社会责任） |
| AI素养 | 21个AI相关知识点 | 保留并扩展，结合中国《中小学人工智能通识教育指南》 |
| 年龄 vs 年级 | 按年龄(age) | **按年级(grade)为主、年龄为辅**，中国小学按年级组织教学 |
| 教材版本 | 无 | 标注**教材版本+册次**（上/下/全一册） |
| 评估提示 | assessmentPrompt | assessmentPrompt（保留）+ **commonMistakes**（易错点）+ **examTips**（常见考法） |
| 知识点类型 | 5类（概念/程序/表征/语言/元认知） | 保持英文枚举兼容，新增**中文标签**便于前端展示 |
| 难度 | 无 | 星级难度（1-5★） |
| ID前缀 | mt_ | **ct_**（cn-topic） |
| 依赖强度 | hard/soft | hard/soft（含义同：hard=必须先掌握/soft=有帮助但非必须） |
| Clusters | 按 subject+domain+ageBand | **按 subject+domain+gradeBand**（年级段：低段1-2/中段3-4/高段5-6） |
| 语言 | 英文为主 | **简体中文**（名称、描述、评估提示全部中文），保留英文参考字段可选 |
| 交互功能 | 静态可视化 | 双视图切换 + 掌握状态标记 + 交互式练习 + 错题本 + 学习路径推荐 |

## 二点五、项目文档分层

为保证项目交接、团队协作与后续扩展不依赖口头传达，当前文档体系分为五层：

- `README.md`：项目入口、范围、快速开始与功能说明
- `docs/DESIGN.md`：架构、Schema、数据模型、交互设计与路线图
- `docs/PROJECT_RULES.md`：不可破坏的工程约束与交付规则
- `docs/PROJECT_SKILL_PLAYBOOK.md`：常见任务的推荐做法与操作手册
- `docs/PROJECT_MEMORY.md`：长期决策、踩坑记录与接手背景

## 三、Schema 设计

### 3.1 topics.json（知识点节点）

```jsonc
{
      "version": "v0.8-expanded",
  "topicCount": 4275,
  "topics": [
    {
      "id": "ct_2YW001",               // 以 ct_ 开头，后接学科代码+年级+序号
      "type": "CONCEPTUAL",            // CONCEPTUAL|PROCEDURAL|REPRESENTATIONAL|LANGUAGE|META
      "typeLabel": "概念",             // 中文标签：概念/技能/表征/语言/元认知
      "subject": "语文",
      "domain": "识字与写字",
      "name": "部首查字法",
      "description": "知道部首目录，能通过部首在字典中查找生字：先确定部首、数部首笔画查部首目录、再数除部首外笔画查检字表、最后翻到对应页码。",
      "grade": 2,                      // 年级 1-6
      "term": "上",                    // 上/下/全（可跨学期）
      "textbook": "统编版",            // 教材版本
      "ageRangeStart": 7,
      "ageRangeEnd": 8,
      "difficulty": 3,                 // 1-5星，3=中等
      "centrality": null,              // 后续根据图计算
      "evidence": [
        "给定一个生字，能说出它的部首",
        "能独立用部首查字法在字典中查到指定生字"
      ],
      "commonMistakes": [
        "把整个字当作部首数笔画",
        "分不清部首本身的笔画数和除部首外的笔画数",
        "遇到独体字不知道查第一笔或本身"
      ],
      "examTips": "常考：给出一个字问部首是什么、除部首外几画；用部首查字法查字典排序",
      "assessmentPrompt": "给{{name}}一个'园'字，让他/她用部首查字法在字典里查出来，能独立完成吗？会不会先找部首'囗'再数剩下的'元'是4画？",
      "standards": ["cn-yuwen-2022:1-2-2-1", "cn-yuwen-tongbian-2s:识字2"]
    }
  ]
}
```

### 3.2 学科代码

| 代码 | 学科 | 英语参考 | 说明 |
|---|---|---|---|
| YW | 语文 | Chinese (Native) | 中文母语 |
| SX | 数学 | Math | |
| YY | 英语 | English (EFL) | 外语，CEFR Pre-A1/A1/A2 |
| KX | 科学 | Science | |
| DF | 道德与法治 | Moral & Rule of Law | 思政类 |
| LD | 劳动 | Labor | 2022新课标必修 |
| TY | 体育与健康 | PE & Health | |
| MS | 美术 | Art | |
| YYP | 音乐 | Music | |
| XX | 信息科技 | IT | 2022新课标必修 |
| AI | AI素养 | AI Literacy | 可并入信息科技 |
| ZH | 综合实践 | Integrated Practice | 跨学科项目学习 |

### 3.3 知识点类型（type）中文对照

| 英文 | 中文 | 解释 | 例子 |
|---|---|---|---|
| CONCEPTUAL | 概念 | 理解一个"是什么"的知识 | 分数的含义、轴对称图形 |
| PROCEDURAL | 技能 | 掌握一个"怎么做"的步骤 | 进位加法、部首查字法 |
| REPRESENTATIONAL | 表征 | 用符号/图表/图像表征信息 | 用条形图表示数据、汉字笔画 |
| LANGUAGE | 语言 | 语言文字运用类 | 标点符号、比喻句、英语口语 |
| META | 元认知 | 学习方法、思维习惯 | 预习方法、检查习惯、错题反思 |

### 3.4 年级段（gradeBand）

- **低段** (L)：1-2年级
- **中段** (M)：3-4年级
- **高段** (H)：5-6年级

### 3.5 课标编码规则

对齐《义务教育课程标准（2022年版）》，编码格式：`cn-{学科}-2022:{学段}-{领域}-{主题}-{序号}`

示例：
- `cn-yuwen-2022:1-2-2-1`：语文2022版，学段1-2年级，学习任务群2（实用性阅读与交流），具体目标1
- `cn-shuxue-2022:1-2-syy-sf-1`：数学2022版，学段1-2年级，数与代数领域，数的认识，目标1

当前阶段已覆盖 1-2 / 3-4 / 5-6 学段的核心课标编码，后续继续精细化到更具体条目。

## 四、当前范围（v0.8）

**年级范围**：一年级到六年级
**学科范围**：
- **P0 主科**：语文（1-6年级，统编版）292个主节点 + 876个父子节点扩展，共1168个知识点；数学（1-6年级，人教版）279个知识点；数学多版本**册次-单元-课时主题 + 例题/易错/方法子节点**（北师大版/苏教版）2232个知识点，并挂接逐单元精选题单映射、资源组键、资源ID与外部作品ID直链
- **P1 次科**：英语（1-2年级启蒙模块 + 3-6年级版本化**模块子节点**）224个知识点，已挂接页码、练习链、测评任务与分技能rubric
- **P2 其他学科**：科学、道德与法治、劳动、体育与健康、美术、音乐、信息科技、AI素养 已补到 1-6 年级主干；其中语文、科学、道法、劳动、体育与健康、美术、音乐、信息科技已推广到父子节点 + 结构化评价框架模式
- **当前成果**：总计 **4275 个知识点，4191 条依赖边**，并提供前端可视化、资源链接、DAG 学习助手、教材版本筛选、轻量视图/拆分版离线页，以及数学逐单元资源治理 / 英语rubric / 多学科子节点显示入口；其中高年级高频数学单元已优先补入一批真实作品 ID 直链
- **当前成果**：总计 **4275 个知识点，4191 条依赖边**，并提供前端可视化、资源链接、DAG 学习助手、教材版本筛选、轻量视图/拆分版离线页，以及数学逐单元资源治理 / 英语rubric / 多学科子节点显示入口；其中高年级高频数学单元与人教版五六年级主干重难点已优先补入一批真实作品 ID 直链
- **v0.9 新增**：双视图模式（力导向图 + 层级树）、掌握状态标记系统、交互式练习（选择/判断/填空）、自动错题本、学习路径推荐算法、家长快捷入口

## 五、前端交互设计

### 5.1 双视图模式

知识图谱提供两种可视化方式，满足不同场景需求：

#### 力导向图（默认视图）

采用 D3.js force simulation，节点根据依赖关系自动排列：

- **力学模型**：
  - link force: 强依赖距离 56px/弱依赖 90px
  - charge force: -85（互相排斥）
  - collide force: 根据难度动态半径
  - center force: 画布中心
- **节点定位优化**：初始位置按学科（列）× 年级（行）分区，避免随机布局导致的混乱
- **终止条件**：alphaDecay 0.045，模拟结束后自动停止以节省性能
- **规模阈值与聚合（v2.2）**：节点数 > `MAX_RENDER_NODES.aggregate`（900）时自动按学科聚合为超级节点（详见 5.6.7）；下钻后单学科仍超阈值则走大图降级

#### 层级树视图

采用 d3.hierarchy + d3.tree 生成树形结构：

- 按 parentTopicId 构建层级
- 自动居中计算：根据树的宽高和画布尺寸计算初始缩放和平移
- 支持展开/折叠子树

### 5.2 掌握状态系统

#### 状态定义

| 状态 | 颜色 | 色值 | 含义 |
|---|---|---|---|
| 已掌握 (mastered) | 绿色 | #2ecc71 | 孩子已完全学会 |
| 学习中 (learning) | 橙色 | #f39c12 | 正在学习但尚未完全掌握 |
| 未开始 (not-started) | 学科原色 | — | 还没学到 |

#### 数据持久化

使用浏览器 localStorage 保存掌握状态：

```js
const STORAGE_KEY = 'cn-primary-taxonomy-mastery';
// 格式: { [topicId]: 'mastered' | 'learning' | 'not-started' }
```

#### 节点着色逻辑

```js
function getNodeFill(node) {
  const status = getMastery(node.id);
  if (status === 'mastered') return MASTERY_COLORS.mastered;   // 绿色
  if (status === 'learning') return MASTERY_COLORS.learning;   // 橙色
  return COLORS[node.subject] || '#888'; // 学科原色
}
```

### 5.3 练习系统

#### 题目类型

| 题型 | 交互方式 | 判分逻辑 |
|---|---|---|
| 选择题 | 点击选项 | 比对正确答案索引 |
| 判断题 | 点击 ✓/✗ | 比对正确答案布尔值 |
| 填空题 | 输入文本 | 模糊匹配（包含关键词即算对） |

#### 题目生成策略

题目基于以下数据字段自动生成：

- `commonMistakes[]` → 生成判断题和选择题干扰项
- `evidence[]` → 生成填空题答案
- `description` → 生成选择题题干

#### 错题本机制

答错的题目自动记录到错题本：

```js
// 错题数据结构
{
  topicId: 'ct_SX2S011',
  topicName: '两位数加两位数（进位）',
  question: '36+37=?',
  userAnswer: '63',
  correctAnswer: '73',
  timestamp: 1692600000000,
  mastery: 'not-started' // 答错后自动标记为未掌握
}
```

错题本同样使用 localStorage 持久化。

### 5.4 学习路径推荐算法

基于 DAG 拓扑排序实现智能学习路径推荐：

```
输入: grade(年级), subject(学科), masteryData(掌握状态)
输出: 推荐学习序列(最多20个节点)

算法步骤:
1. filteredTopics ← 按 grade + subject 筛选知识点
2. sortedTopics ← 对 filteredTopics 进行拓扑排序 (Kahn算法)
3. recommendedTopics ← sortedTopics 中过滤掉已掌握的
4. 按 difficulty 升序排列 (简单的先学)
5. 返回前20个
```

#### 拓扑排序实现

```javascript
function getGradeLearningPath(grade, subject) {
  // 1. 筛选
  let topics = data.nodes.filter(n => n.grade === grade && n.subject === subject);
  
  // 2. 拓扑排序
  const inDegree = new Map();
  const adjList = new Map();
  topics.forEach(t => { inDegree.set(t.id, 0); adjList.set(t.id, []); });
  
  data.links.forEach(link => {
    if (adjList.has(link.source) && inDegree.has(link.target)) {
      adjList.get(link.source).push(link.target);
      inDegree.set(link.target, inDegree.get(link.target) + 1);
    }
  });
  
  // Kahn's algorithm
  const queue = [...inDegree.entries()].filter(([,d]) => d === 0).map(([id]) => id);
  const sorted = [];
  while (queue.length) {
    const id = queue.shift();
    sorted.push(id);
    adjList.get(id).forEach(next => {
      inDegree.set(next, inDegree.get(next) - 1);
      if (inDegree.get(next) === 0) queue.push(next);
    });
  }
  
  // 3. 过滤已掌握 + 4. 按难度排序 + 5. 取前20
  return sorted
    .map(id => data.nodes.find(n => n.id === id))
    .filter(t => getMastery(t.id) !== 'mastered')
    .sort((a, b) => (a.difficulty || 3) - (b.difficulty || 3))
    .slice(0, 20);
}
```

### 5.5 家长快捷入口

为降低家长使用门槛，提供年级×学科矩阵快捷按钮：

```javascript
function quickSelect(grade, subject) {
  currentGrades = new Set([grade]);
  currentSubjects = new Set([subject]);
  currentTextbooks = new Set(['全部']);
  currentLayer = 'core';
  buildControls();
  applyFilters();
}
```

点击后直接定位到对应范围，无需操作复杂的筛选面板。

### 5.6 性能优化

| 优化手段 | 实现 | 效果 |
|---|---|---|
| RAF 节流 | requestAnimationFrame 合并 tick 渲染 | 降低 CPU 占用 |
| 隐藏态停布局 | visibilitychange 事件监听 | 页面隐藏时暂停/销毁 simulation |
| 卸载清理 | 切换视图前停止并清空 simulation 引用 | 防止内存泄漏 |
| 布局结束释放 | 模拟结束后主动释放 tick/RAF/simulation | 减少残留 |
| 初始位置优化 | 按学科×年级分区定位 | 减少布局收敛时间 |

### 5.6 小伙伴模式（Kid Mode）

> 以"普通小学生（甚至是学渣、不太灵光）"的视角，对项目做深入全面回顾复盘，从易用性、年级、学科连贯性等方面全方位查漏补缺，并一一完善用户体验与交互。

#### 设计理念

面向 1-6 年级小学生的专属学习模式，核心设计原则：

- **低认知负荷**：减少信息密度，用图标、颜色、动画替代文字说明
- **正向激励**：每答对一题获得星星奖励，错误时给予鼓励而非负面反馈
- **陪伴感**：引入"小知"🦊 狐狸吉祥物，提供学习指引和情感支持
- **游戏化**：用"知识大闯关"等游戏化框架激发学习兴趣
- **零门槛**：界面简洁直观，不需要阅读大量文字即可上手

#### 功能清单

| 功能 | 说明 |
|---|---|
| 🧒 一键切换 | 右上角按钮可在"小伙伴模式"与"家长模式"间无缝切换 |
| 🎨 明亮主题 | 从暗色主题切换为暖黄色调，更符合儿童审美 |
| 🦊 吉祥物 | 左下角固定显示狐狸"小知"，点击可获取学习提示 |
| 💬 引导气泡 | 用气泡形式展示提示信息，4秒自动消失 |
| ⭐ 星星奖励 | 答对题目获得星星，计数器持久化存储 |
| 🎉 庆祝动画 | 答对时屏幕中央显示星星爆炸动画 |
| 🌟 鼓励栏 | 顶部固定鼓励语条幅，3秒自动消失 |
| 👋 欢迎面板 | 进入小伙伴模式时显示欢迎面板 |
| 📊 简化统计 | 用"知识圆球/小星星/学科"替代复杂数据 |
| 💪 正向反馈 | 答错时显示"差一点~没关系！"而非"❌ 回答错误" |

#### 技术实现

```javascript
// 状态管理
let kidMode = false;
let kidStars = parseInt(localStorage.getItem('cnpt-kid-stars') || '0');

// 切换函数
function toggleKidMode() {
  kidMode = !kidMode;
  document.body.classList.toggle('kid-mode', kidMode);
  // ... 更新按钮文本、显示欢迎面板、吉祥物提示等
}

// 星星庆祝
function celebrateStar() {
  kidStars++;
  localStorage.setItem('cnpt-kid-stars', kidStars.toString());
  // 创建星星爆炸动画 DOM 元素
  // 显示鼓励条幅
}
```

#### 样式切换

```css
.kid-mode {
  background: #fefcf6 !important; /* 暖黄背景 */
}
.kid-mode #graph {
  background: radial-gradient(ellipse at center, #fff8e7 0%, #fef3d4 100%);
}
.mascot {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffcc33, #ff9900);
}
```

#### 交互反馈对比

| 场景 | 家长模式 | 小伙伴模式 |
|---|---|---|
| 答对 | "✅ 回答正确！" | "🎉 你答对啦！真厉害！" + 星星动画 |
| 答错 | "❌ 回答错误" | "💡 差一点点！我们再看看" + 吉祥物鼓励 |
| 进入 | 直接展示图谱 | 欢迎面板 + 吉祥物自我介绍 |
| 提示 | 文字说明 | 气泡 + 吉祥物图标 |

## 五点五、学习闭环设计（v2.0）

> 借鉴《AI 自学数学账本实操》《edulab》《cn-math-taxonomy》《词光》四篇文章反哺，落地于 H5 移动版与学生版。方法论对照见 `docs/四篇文章借鉴反哺报告.md`。

### 5.5.1 FSRS 间隔复习引擎（`shared/js/components/fsrs-engine.js` + `fsrs-scheduler.js`）

- **内核（fsrs-scheduler.js）**：FSRS-4，17 参数 w0..w16，零依赖。状态为稳定性 S / 难度 D / 可提取性 R；`R(t) = (1 + FACTOR·t/S)^DECAY`（FACTOR=19/81，DECAY=-0.5）；目标保留率 r=0.9 时间隔 `I = S/FACTOR·(r^(1/DECAY) − 1)`；评分 1..4 = Again/Hard/Good/Easy，Again 走独立分支 `S' = w10·D^(−w11)·((S+1)^w12 − 1)`。
- **混合调度**：学习阶段（连续独立答对 ≤ 6 步）沿用短间隔 20 分钟 / 1 小时 / 1 天 / 3 天 / 7 天 / 30 天；之后进入复习期，间隔由 FSRS 稳定性折算天数。业务规则不变（连续 3 次独立答对休眠、60 天抽检、首做/重测分离、信心校准、错因与低级失误台账）。
- **参数注入**：`data/fsrs-params.json` → 构建生成 `shared/data/fsrs-params.js` 并注入 `window.__CNPT_FSRS_PARAMS__`；`scripts/calibrate-fsrs.mjs` 用导出日志做 17 参数校准（log loss），当前为 FSRS-4 默认值（`calibrated=false`）。
- **FSRS-6 影子运行（v2.4）**：`fsrs6-scheduler.js` 提供官方 FSRS-6 内核（21 参数，当天短期分支按 `round(delta_t)==0` 判定）；`fsrs-engine` 每次作答并行计算 FSRS-6 间隔写入 `card.shadow6` 与 `reviewLog`（`shadow6IntervalDays/shadow6Stability` + 线上 `fsrs4IntervalDays`），**只观察不改排期**；`getShadowStats()` 汇总，`scripts/evaluate-fsrs-v6.mjs --logs` 离线消费。FSRS-6 选型结论见 `docs/开源项目借鉴反哺报告-第四批.md`。
- **存储 v3**：卡片新增 `stability/difficulty/reps/migratedFrom`；v2→v3 迁移补字段且 **nextReview 不变**，避免排期突变；`export/import` 版本号 3。
- **首做与重测分离**：`firstAttempts` 只记录每个知识点的第一次作答；重测（retest）、盲测（blind）不计入首做正确率，`getFirstAttemptAccuracy()` 单独统计（含独立作答子项）。
- **信心校准**：练习作答前记录 25/50/75/100 四档信心，`getCalibrationBias()` 输出校准偏差。
- **错因与台账**：答错写入 `errorLog`；若标记为低级失误（LOW），同时写入独立的 `mistakeLedger`（二级类型：抄写错误/口算错误/单位遗漏/符号遗漏/漏题/格式不规范）。

### 5.5.2 诊断闭环（`shared/js/components/diagnostic-loop.js`）

- **错题两步闭环**：答错 → `registerWrong()` 登记 20 分钟后重测（第 1 步）→ 重测通过进入次日「盲测」队列（第 2 步）→ 盲测通过标记 `mastered`，闭环完成；任一步失败回退到当天重测。
- **预检跳课**：新学知识点前可答 3 题预检，全对直接标记 `mastered` 并推进 FSRS 卡片（`consecutiveCorrect≥2`、`nextReview=+7 天`）。
- **题目来源**：优先取增强字段 `quizQuestions`（AI 生成初稿，UI 标注「未经学科教师审核」），缺失时回退到 `commonMistakes`/`evidence` 构造判断题。

### 5.5.3 今日学习台（`shared/js/components/daily-plan.js`）

- **75 分钟日预算**：复习最多占用一半（37 分钟），超出后 `reviewBudgetCapped` 提示并停止排复习；剩余预算保底新学。
- **先复习后新学**：分区顺序固定，计时器按 `review`/`new` 分账写入 `dailySeconds`。
- **知识边界硬约束**：`buildTodayPlan()` 扫描每个知识点的入边，`strength==='hard'` 的前置未掌握则进入 `blocked`（「🔒 待解锁」），不排进新学；H5 节点详情同步显示边界提示。
- **统计面板**：在学卡片数、首做正确率、低级失误数、错因分布（P01–P11）。

### 5.5.4 数据键与隐私

- 全部学习数据保存于浏览器 localStorage，键前缀 `cnpt-{role}-`：`fsrs` / `mistakeLedger` / `dailyLog` / `diagnostic`。
- 不上传任何服务器；支持导出 / 导入（`fsrs-engine.export/import`、`diagnostic-loop.export`）。

### 5.5.5 组件挂载约定

- 共享组件统一挂载到 `window.CNPT.*`（IIFE，无 `eval`）：`CNPT.fsrs.create(role)`、`CNPT.diagnostic.create(role)`、`CNPT.components.initDailyPlan/dailyPlan`。
- 按角色缓存单例，避免多实例互相覆盖 localStorage。

## 五点六、学习工具包设计（v2.1）

> 借鉴《诗泉》《Marble Skill Taxonomy》《四轮闯关背单词》《导图加会动的模型》四篇文章反哺。方法论对照见 `docs/四篇文章借鉴反哺报告-第二批.md`。

### 5.6.1 枢纽度 centrality（`scripts/compute-centrality.mjs`）

- **口径**：`score(v) = 1.0 × 入度加权 + 0.5 × 出度加权`，其中 hard 边权 1.0 / soft 边权 0.5；再除以全图最高分归一化到 0–1，保留 4 位小数；`null` 表示未计算（全图仅 1 个孤立点）。
- **展示**：节点详情标签 `centrality ≥ 0.5` → 「⭐ 枢纽知识点」，否则「🔗 枢纽度 N%」（title 提示依赖规模）。
- **定位**：结构性枢纽度，不等于教学重要性；后续可接入学习路径排序与图谱节点视觉强调。

### 5.6.2 交互模型（`shared/js/components/visual-models.js`）

- **六个 SVG 交互模型**：分数条（分子/分母滑块 + ×2 等值 ÷2 约分 + 与 1/2 比较）、数轴（拖拽读数，多量程与刻度）、三角形内角（拖顶点实时显示内角与和恒 180°）、正方体展开图（点面显示相对面）、**角的度量**（量角器刻度 + 拖拽端点 + 角的类型/补角 + 自动演示 0°→180°）、**小数的意义**（十乘十方格 + 十分位/百分位滑块 + 读数换算 + 演示 0→0.99）。
- **动画销毁硬约束**：所有带动画的模型统一走 `createAnimHost()`（登记 rAF/定时器）与 `createAnimRef()`；`render()` 开头 `stopActiveAnim()`；`node-detail.js` 在组装 HTML 前调用 `visualModels.stop()`。新增动画必须提供销毁路径（PLAYBOOK 4.2 高风险）。
- **挂接方式**：`scripts/enrich-topics.mjs` 的 `MODEL_REFS` 把 `modelRef` 写入 14 个数学主题；`node-detail.js` 的 `modelHtml` 与 `student.js` 在详情中渲染 `.cnpt-vm-slot` 并调用 `visualModels.render`。
- **设计原则**（来自文章 08）：网负责「知道考什么」、模型负责「看见为什么」，先网后模型；模型为可选增强，不阻塞学习流程。

### 5.6.3 四轮拼写闯关（`shared/js/components/spelling-quest.js`）

- **四轮遮挡递增**：① 认形留首尾 → ② 元音露辅遮元 → ③ 骨架留首字母 → ④ 默写全遮；短语按空格拆槽，空格为固定槽。
- **错词反馈**：`check()` 只校验被遮挡槽（未遮挡槽与空格槽跳过），定位第一个错字母 → 「第 N 个字母不对，还有 X 次机会」；3 次失败或点「看答案」才揭示完整单词。
- **数据接入**：`scripts/enrich-topics.mjs` 的 `WORD_LISTS` 为 6 个英语主题注入 18 词（词取自 description 原文）；schema 新增 `wordList`。
- **闭环**：完成一组后 `onResult` → 学生版 `startSpelling` 调用 `state.fsrs.recordAnswer` 记录掌握，并更新星星/统计/列表。

### 5.6.4 古诗词工具（`shared/js/components/poetry.js` + `docs/poetry.html`）

- **内置 40 首**课标常见古诗示例库（公版文本，含 title/author/dynasty/tags/lines），零依赖、可离线。
- **三个能力**：全文搜索（标题/作者/正文）、随机抽诗（按作者/体裁）、飞花令（按字逐句检索）。
- **诚实边界**：完整近 40 万首库未内嵌，页面明确指路开源项目（中华古诗词/诗泉 poetry.palemoky.com）。

### 5.6.5 家长费曼区块（`node-detail.js`）

- `enhancedVariant === 'parent'` 时渲染「🗣️ 让孩子讲给你听」：话术「宝贝，你能给我讲讲 {name} 为什么是这样吗？」+ 费曼学习法说明（孩子能用自己的话讲出来，才是真的懂了）。
- 与「先网后模型」配合：家长先引导孩子看模型，再请孩子复述为什么。

### 5.6.6 授权合规（`PROVENANCE.md`）

- 四层授权表：数据库层 ODbL 1.0 / 文本层 CC BY-SA 4.0 / 课标上游 / 项目代码 MIT。
- 规范署名「Marble Skill Taxonomy (v1) · © Generative Spark, Inc. (Marble)」；manifest SHA-256 版本锁；ODbL 衍生数据库 vs 产出作品澄清。
- 边界：无儿童个人数据；AI 生成字段均标注「未经学科教师审核」。

### 5.6.7 图谱规模治理：学科聚合与大图降级（v2.2，`shared/js/graph/pc-graph.js`）

- **触发**：节点数 > `maxNodes`（`constants.MAX_RENDER_NODES.aggregate=900`）且非下钻态 → 渲染学科聚合超级节点（`__agg__<学科>`，半径随知识点数，标签「学科 (数量)」）。
- **下钻**：点击聚合节点 → `drillDown(subject)` 只渲染该学科；「← 返回学科总览」→ `backToOverview()` 恢复全量聚合（快照仅总览态保存，避免被子集覆盖）。
- **大图降级**：边数 > 500 只画 hard 依赖；标签显示阈值 500（聚合态必显示）；碰撞半径按节点数 6/9/12 自适应；模拟默认 8s 后停止。
- **实测**：教师版 core 层 1300 节点 → 聚合 11 个学科（数学 837 / 语文 137 / 英语 224 / …）；点击数学下钻 837 节点；返回总览恢复。
- **阈值配置**：`MAX_RENDER_NODES = { core: 1300, detail: 900, aggregate: 900 }`。
- **图渲染候选（v2.3）**：评估 AntV G6（dagre 分层布局 / Combo 折叠 / WebGL 插件），结论为当前 4275 节点规模**暂不引入**，沿用 D3 + 聚合降级；若节点增至数万或需分层折叠视图再评估（见 `docs/开源项目借鉴反哺报告-第四批.md` 6.2）。

### 5.6.8 可解释边与反向链接（v2.3）

- **数据层**：`scripts/enrich-edge-explanations.mjs` 对全部依赖边派生 `category`（九类：概念理解/技能操作/计算能力/空间观念/量感与单位/阅读表达/工具使用/常识经验/其他）、`explain`（「T」依赖「P」：类别前提。+ 原因）、`explainSource`（`rule-derived` / `curated`）；人工精修走 `data/edge-explanations-curated.json` 覆盖表（key=`前置->目标`，命中即 `curated` 且优先于规则派生）；`validate.mjs` 校验枚举/长度/curated 命中并报告分布，schema `additionalProperties:false` 同步。
- **页面层**（`node-detail.js`）：前置链路展示类别 chip + 具体原因 + 「N 个直接前置 · 不补会听不懂」/「N 个 · 有基础更轻松」；后续链路展示「被 N 个知识点依赖」，超过 5 个折叠进 `<details>`。
- **浏览器端字段链路**：`shared/js/core/indices.js` 构造 edge 时必须保留 `category/explain/explainSource`，否则页面 chip 不显示（已修复并复验）。
- **定位**：把 `reason` 从自由文本升级为语义化、可统计、可精修的边属性，为后续路径代价函数与边质量评测打底。

## 五点七、根因回溯诊断设计（v2.3，`shared/js/components/root-cause-diagnosis.js`）

> 借鉴开源项目 cn-math-taxonomy 的「根因回溯诊断」方法论（[反哺报告-第四批](开源项目借鉴反哺报告-第四批.md) / [竞品分析](竞品分析_cn-math-taxonomy.md) P0）。目标：从指定目标考点出发，答错自动退回前置知识继续查，揪出真正的「病根」，再给一条按顺序补回来的路线。

### 5.7.1 诊断流程

1. **选题**：目标考点（学生版今日学习台入口 / 节点详情按钮预设目标；弹层内 picker = 未掌握候选前 12 + 实时搜索 + 历史记录）。
2. **目标优先队列**：先测目标，再测其前置；每题后按结果更新队列。
3. **三态判定**：
   - **掌握**：答对且无需继续；
   - **不稳**：第一题答错，但确认题答对（偶然失误，**不回溯**，进巩固清单）；
   - **薄弱**：答错且确认题也错 → 沿依赖链回溯。
4. **确认题机制**：答错后换同知识点、更低或同难度、且非当前题的题目确认，排除手滑/看错题等偶然因素。
5. **回溯**：薄弱点沿 **hard 前置边** BFS 往回查（soft 边只作参考不回溯）；一直查到没有更薄弱的前置为止。
6. **根因**：薄弱点中「没有更薄弱 hard 前置」的知识点，即「病根」。
7. **补学路线**：把「根因 → 目标」之间未掌握的点按拓扑序（`CNPT.path`）排成一条路线，报告页一键「开始补学第一个」直接跳转练习。

### 5.7.2 题目三级回退

`window.__CNPT_DIAGNOSTIC_QUESTIONS__`（构建注入，735 题 / 384 知识点）→ `topic.quizQuestions`（choice 型随堂题）→ `commonMistakes[0] + evidence[0]` 自动生成判断题（answer=1），保证任意知识点都可诊断。

### 5.7.3 接口与存储

- `window.CNPT.rootCause.create(role)` → 引擎实例；`start(targetId, {maxQuestions:15, confirmOnFail, autoBacktrack, backtrackStrength, isMastered})`、`next(session)`、`answer(session, qid, idx)`、`answerConfirm(...)`、`finish(session)`、`buildRemedialPath(...)`、`getHistory/clearHistory/exportReport`、`expandUntested(session)`（盲区再测）、`getPathGraphData(report)`/`renderPathGraphSVG(report)`（根因路径图）。
- 历史：localStorage `cnpt-<role>-rcd-history`，上限 20 条；报告可导出 JSON。
- 结果结构：`target / statistics / rootCauses / weak / unstable / untested / mastered / remedialPath / answers`。

### 5.7.4 端侧接入

- **学生版**（`student-web/js/student.js`）：今日学习台入口 + 详情「🔍 根因诊断」按钮 + 弹层；`isTopicMastered` 取 storage mastered 或 FSRS dormant/连续答对≥2。
- **H5**（`h5/index.html` + `h5/js/app.js` + `h5/css/style.css`）：`#btn-rcd` 入口 + `#rcd-modal` 底部弹层；答题复用 `.practice-question/.practice-option` 组件与正误态；全局桥接 `window._h5StartRcd`（替代 inline onclick，防 XSS）。
- **回归测试**：`scripts/test-root-cause-diagnosis.mjs`（20 项：目标优先、薄弱/掌握、根因、路线、历史、确认题→不稳、不稳不回溯、盲区再测、路径图数据/SVG）。

### 5.7.5 根因路径图与盲区再测

- **路径图**：`getPathGraphData` 从 `remedialPath` 提取节点（含 `isRoot`/`isTarget`）与路线内边（强度取自依赖图），按拓扑深度分层（目标=0，前置递增，最长链）；`renderPathGraphSVG` 输出自绘 SVG：目标橙框、根因/薄弱红框、不稳黄底，hard 实线 / soft 虚线，节点名超 7 字截断、悬停显示全称。不引第三方库。
- **盲区再测**：报告页在 `untestedCount > 0` 时显示「🧪 盲区再测」，点击调用 `expandUntested(session)`：清空未测列表 → 未测点重新入队（priority 3）→ 上限放宽为 `已答数 + 未测数 + 5` → 回到答题流程；续测完成报告 id 加 `-rN` 后缀。

### 5.7.6 跨学科主题研修（国防教育 / 国家安全 / 挫折与意志）

- **定位**：把散落在各学科的同一主题知识点串成一条学习线，作为跨学科主题学习的落地入口；**不新增知识点**，只做挂接、路线与导航。
- **数据**：`data/themes.json`（3 主题 23 点）：`defense-education`（5 点，家乡/国家象征/爱国情感）、`national-security`（10 点，信息/网络/国家主权）、`resilience-will`（8 点，挫折/意志/坚持）。字段：`id/name/icon/intro/objectives/activities/topics/gaps`；`topics` 为现有知识点 id（以母点为主），`gaps` 为待补内容缺口。
- **组件**：`shared/js/components/theme-learning.js`（IIFE + `CNPT.themeLearning.create(role)`）：`getThemes / getTheme / topicsOf / buildThemePath / stats / list`；`buildThemePath` 用 `CNPT.path.topologicalSort` 对主题点排序并补充名称/学科/年级/状态。
- **端侧**：学生版 `#btn-theme` → `#theme-modal`（列表 → 详情 → 「开始主题学习」→ 关闭弹层并 `showTopicDetail(first)`）；H5 同构（`showNodeDetail`）。主题挂接点多为道法/信息科技母点、几乎无随堂题，因此闭环走**详情页**（查看内容 + 标记掌握），不依赖自动生成练习。
- **注入**：4 个构建脚本统一注入 `window.__CNPT_THEMES__`；split 版另生成 `standalone-data/themes.js`。
- **测试**：`scripts/test-themes.mjs` 16 项（数据完整性、关联点存在、组件 API、未知主题空路径）。

## 六、后续路线图

- **v0.8.x**：把当前"主干映射版"继续加密为教材章节级 / 课时级 / 题型级颗粒度，并推广到更多非主科；同时把外部资源接入升级为逐单元精选题单、资源组键、资源ID和外部作品ID直链治理，并用缓存/停布局/卸载清理/旧 zoom 与 simulation 回收/隐藏态整图休眠/`requestAnimationFrame` tick 节流/布局结束主动释放实例引用等手段持续压低页面常驻负载；把年级/学科/版本筛选改造为右侧边栏可搜索的多选下拉式交互，并将知识点搜索与图谱状态提示也收拢进右侧；继续把标题、副标题、统计概览也移入右侧工作台，并为多选下拉增加"全选 / 反选 / 清空"，同时允许右侧整栏展开 / 折叠，以兼顾筛选效率与主图谱展示空间；继续把图谱解释层从"工程可读"往"家长可读"收敛，新增右侧阅读指引、节点级"先补什么 / 建议补什么 / 学稳后带动什么"摘要，以及面向家长的 Bot 结果结构，尽量把 DAG 关系翻译成可执行的辅导动作
- **v0.9**：完成前端交互重构 — 双视图模式（力导向图 + 层级树）、掌握状态标记系统（三态切换 + 节点变色 + 进度统计）、交互式练习系统（选择/判断/填空三种题型）、自动错题本与薄弱点追踪、基于 DAG 拓扑排序的学习路径推荐算法、家长快捷入口矩阵；同步更新项目文档（README + DESIGN）
- **v0.9**：教材多版本继续扩展到更多学科，并把"例题/练习题检索入口"升级为教师精选题链和本地化题库映射
- **v1.0**：对标 Marble 完整度（1590/3221），面向商用场景

## 七、开源协议（沿用 Marble 的 Share-Alike 精神）

- 数据库层：**ODbL 1.0**（派生数据库必须开源，但产品中使用不要求产品开源）
- 文本内容层：**CC BY-SA 4.0**
- 课标原文引用：2022版义务教育课程标准的引用参照官方公开版本，仅使用编码与关键术语，不大段引用原文以避免版权问题

## 八、应用场景

本知识库可直接支撑以下应用：
1. **AI 学习助手**：基于前置依赖图进行学情诊断、个性化学习路径推荐
2. **错题归因**：错题自动归因到知识点，沿依赖链定位薄弱根源
3. **家长辅导地图**：按年级/学期展示孩子该学什么、先后顺序、家长该怎么辅导
4. **自适应练习**：按依赖图智能出题，掌握前置再推进
5. **教材配套工具**：教师备课、知识点导航
6. **幼小衔接/升学诊断**：入学时检查学前基础、毕业时检查全学科掌握情况
7. **家庭学习进度管理**：家长记录每个知识点的掌握状态，可视化追踪学习进展
8. **课外辅导针对性训练**：根据错题本和薄弱点分析，精准推送练习题
