# 🇨🇳 中国小学教育知识图谱 (CN-Primary-Taxonomy)

> 面向中国大陆小学教育的开放、结构化知识图谱。基于 [Marble Skill Taxonomy v1](https://github.com/withmarbleapp/os-taxonomy)（美国 Marble 公司开源）二次开发，完全本土化。

## 这是什么

把小学各学科知识拆解为**细粒度知识点**（micro-topic），用**前置依赖图**（DAG）表达"学 X 之前必须先会 Y"的关系，对齐《义务教育课程标准（2022年版）》。

这不是课程表、不是教材目录，而是一个**可计算的学习图谱**——可以用来做：

- 🎯 **学情诊断**：孩子不会做某道题，沿依赖链找到真正薄弱的前置知识点
- 🛤️ **学习路径推荐**：根据已掌握的知识点，智能推荐下一个该学什么；支持直接问"孩子乘法口诀不熟，应该先补什么"
- 📊 **家长辅导地图**：清晰看到 1-6 年级关键知识点、先后顺序、跨年级衔接与教材版本差异，并能看到数学真实题链、英语 rubric 和多学科子节点信息
- 🏫 **教师备课工具**：知识点关联、课标对接、易错点查询
- 🤖 **AI 学习助手底层数据**：给 AI 辅导产品提供结构化知识底座
- 🧩 **题链挂接**：每个知识点都带有典型例题/练习题检索入口，便于快速串联"知识点-练习-讲解"
- 🧭 **三维筛选**：支持按年级 / 学科 / 教材版本查看知识图谱
- ✅ **学习进度追踪**：可视化标记每个知识点的掌握状态（已掌握/学习中/未开始）
- 📝 **交互式练习**：直接在图谱上做选择题、判断题、填空题，即时判分
- 📖 **智能错题本**：自动记录错题，追踪薄弱知识点

## 当前版本 v0.9-Interactive

- **年级范围**：一年级 + 二年级 + 三年级 + 四年级 + 五年级 + 六年级
- **学科覆盖**：语文、数学、英语、科学、道德与法治、劳动、体育与健康、美术、音乐、信息科技、AI素养 共11学科
- **教材版本**：
  - 语文：统编版（1-6年级）
  - 数学：人教版 / 北师大版 / 苏教版，已细化到**册次-单元-课时主题**，并继续拆到**例题型 / 易错型 / 方法型**子节点，同时挂接**逐单元精选题单映射、资源组键、资源 ID 与外部作品 ID 直链**；高年级重难点单元已优先补入一批真实作品直链
  - 英语：外研版（一起点）1-2年级；人教PEP版 / 外研版 / 译林版（三年级起点）3-6年级，已细化到**模块内词汇 / 句型 / 语篇 / 写作任务**，并挂接**页码 / 练习链 / 测评任务 / 分技能 rubric**
  - 语文 / 科学 / 道德与法治：已推广为**父节点 + 子节点 + 练习链 + 测评任务 + 结构化评价框架**模式
  - 劳动 / 体育与健康 / 美术 / 音乐 / 信息科技：已推广为**父节点 + 子节点 + 练习链 + 测评任务 + 结构化评价框架**模式
- **知识点数**：**4275 个**（语文1168 / 数学2511 / 英语224 / 科学72 / 道德与法治48 / 劳动48 / 体育与健康48 / 美术48 / 音乐48 / 信息科技48 / AI素养12）
- **依赖关系**：**4191 条**（强依赖2810 / 弱依赖1381）
- **课标对齐**：13个课标文件，共197个编码条目
- **领域概览**：134 个面向家长的领域说明
- **可视化升级**：完整交互式知识图谱网页（基于 D3.js），新增双视图模式（力导向图 + 层级树状图）
- **学习助手**：右侧内置 DAG Bot，可按薄弱点自动回溯前置知识
- **练习系统**：支持选择题、判断题、填空题三种题型，自动判分、错题自动录入
- **掌握追踪**：三态掌握标记（已掌握/学习中/未开始）+ 进度统计面板
- **学习路径**：基于 DAG 拓扑排序的智能路径推荐算法
- **家长友好**：快捷入口年级×学科一键直达、分步引导提示
- **🧒 小伙伴模式**：面向小学生的专属学习模式，含吉祥物陪伴、星星奖励、正向激励反馈
- **性能优化**：`requestAnimationFrame` 节流 + 隐藏态停布局/销毁 + 卸载清理 + 旧 simulation 生命周期回收
- **教师校准包**：已生成深圳二年级语文/数学待审清单 `data/shenzhen-g2-teacher-review.csv`

## 快速开始

### 零、📱 H5 移动端版本（推荐手机访问）

项目根目录双击打开 **`cn-primary-taxonomy-h5.html`**：

- **纯前端**，无需服务器，双击直接打开
- **Canvas 高性能渲染**，触摸手势操作
- **底部导航**：图谱、搜索、学习、错题、我的
- **支持**：手机浏览器、微信内置浏览器、移动端 Chrome

> 详细使用说明请查阅 [h5/README.md](h5/README.md)

### 方法一：直接打开可视化（推荐PC端）

双击打开项目根目录下的 **`cn-primary-taxonomy.html`**（纯前端，**不需要服务器**）：

#### 🗺️ 查看知识图谱

- 彩色圆点是知识点，颜色代表学科
- 🔴 红色实线 = 强依赖（必须先掌握）
- 🟡 橙色虚线 = 弱依赖（有帮助但非必须）

#### 🔍 快捷筛选（家长推荐）

页面顶部提供**年级 × 学科快捷入口**按钮，例如：

- 「一年级·语文」 — 只看一年级语文知识点
- 「三年级·数学」 — 只看三年级数学知识点
- 「六年级·英语」 — 只看六年级英语知识点

点击后图谱自动筛选到对应范围，无需手动勾选多个下拉框。

#### 🖱️ 探索知识点

**点击任一圆点**查看详情：描述、掌握标准、易错点、考法、家长测评话术、前置依赖链、后续解锁

#### ✅ 标记掌握状态

在节点详情面板中，点击掌握状态图标进行切换：
- 🟢 **已掌握**（绿色）— 孩子已经学会
- 🟡 **学习中**（黄色）— 正在学习
- ⚪ **未开始**（灰色）— 还没学到

标记后节点颜色会实时变化，右侧面板显示整体掌握进度统计。

#### 🧒 小伙伴模式（推荐给小学生）

点击页面右上角的 **"🧒 小伙伴模式"** 按钮，界面会切换为专为小学生设计的模式：

- 🎨 **明亮暖色主题**：从暗色变为暖黄色调，更友好
- 🦊 **狐狸小知**：左下角出现吉祥物，点击可获取学习提示
- ⭐ **星星奖励**：每答对一题获得一颗星星，激发学习动力
- 🌟 **正向鼓励**：答错时不会显示"错误"，而是"差一点~没关系！"
- 🎉 **庆祝动画**：答对时屏幕显示星星爆炸动画
- 👋 **欢迎面板**：进入时显示欢迎信息和引导

再次点击按钮可切换回"家长模式"。

#### 📝 做练习题

在节点详情面板点击「练习题」区域，可看到为该知识点自动生成的题目：

- **选择题**：选出正确答案，点击选项即时判分
- **判断题**：判断说法对错（✓ 或 ✗）
- **填空题**：输入答案，支持模糊匹配（如"分数单位"/"分数的分数单位"都算对）

答错会自动记录到错题本，并标注关联的薄弱知识点。

#### 📖 查看错题本

右侧展开错题本面板，可看到：

- 做错的题目和正确答案
- 错题关联的知识点
- 该知识点的掌握状态
- 一键跳转回图谱继续学习对应节点

#### 🛤️ 学习路径推荐

点击「学习路径」或顶部快捷入口后，系统基于 DAG 拓扑排序自动计算推荐路径：

1. 筛选当前年级/学科的知识点
2. 按依赖关系拓扑排序（前置知识在前）
3. 跳过已掌握的知识点
4. 优先推荐基础/简单的知识点
5. 生成最多 20 个节点的学习序列

路径面板中显示：
- 每个节点的步骤序号
- 知识点名称和描述
- 当前掌握状态（用图标区分）
- 前置依赖是否已满足

#### 🔄 切换视图模式

页面顶部提供两个视图切换按钮：

- **力导向图**（默认）：节点通过力模拟自动排列，直观展示知识点间的关联
- **层级树**：按父子层级关系展示，像树形目录一样从上到下，适合查看知识体系的层级结构

切换后图谱会自动居中适配视图，无需手动缩放。

#### 💬 右侧辅助功能

- **知识点搜索**：按名称/学科/领域快速定位
- **家长阅读指引**：帮助家长快速上手
- **学习助手 Bot**：输入薄弱点，生成辅导建议（原因 + 优先补点 + 本周辅导动作）
- **筛选面板**：按视图 / 年级 / 学科 / 教材版本组合筛选
- **进度面板**：显示整体掌握统计

如果更看重打开速度，可以优先使用拆分版：

- `cn-primary-taxonomy-split.html`
- `standalone-data/`（拆分后的离线数据包）

### 方法一补充：零服务器 GitHub 托管

本仓库已补入 GitHub Pages 自动部署工作流：

- 工作流文件：`.github/workflows/deploy-pages.yml`
- 触发方式：推送到 `cn-primary-taxonomy` / `main` / `master` 分支，或手动触发 `workflow_dispatch`
- Pages 默认首页：`cn-primary-taxonomy.html` 会作为站点根路径的 `index.html`
- 拆分版页面：`/cn-primary-taxonomy-split.html`

若当前 GitHub 仓库地址为：

- `https://github.com/WenTao-Love/cn-primary-taxonomy`

则 Pages 常见访问地址为：

- `https://WenTao-Love.github.io/cn-primary-taxonomy/`
- `https://WenTao-Love.github.io/cn-primary-taxonomy/cn-primary-taxonomy-split.html`

说明：

- 这是零服务器静态托管方案，适合直接公开访问知识图谱
- 工作流会在 GitHub 上自动重建独立版与拆分版 HTML，再发布到 Pages
- **首次启用时需要手动完成一次仓库设置**：进入 GitHub 仓库 `Settings -> Pages -> Build and deployment -> Source`，选择 `GitHub Actions`
- 若仓库尚未开启 Pages，`actions/configure-pages` 可能报 `Get Pages site failed / Not Found`
- 若仓库是私有仓库，还需要确认当前 GitHub 账号方案支持 Pages，或先改为公开仓库

### 方法二：使用数据

所有数据在 `data/` 目录下，纯 JSON，零运行时依赖：

```js
import topics from './data/topics.json' assert { type: 'json' };
import deps from './data/dependencies.json' assert { type: 'json' };

// 查询"进位加法"的前置知识
const byId = new Map(topics.topics.map(t => [t.id, t]));
const pre = deps.dependencies
  .filter(d => d.topicId === 'ct_SX2S011')  // 两位数加两位数(进位)
  .map(d => byId.get(d.prerequisiteId).name);
console.log('学习进位加法前需要先掌握:', pre);
// → [ '两位数加两位数（不进位）' ]
```

### 方法三：重新生成数据

```bash
# 从 scripts/*.mjs 源文件生成所有 JSON 数据
node scripts/generate-yuwen-g1.mjs
node scripts/generate-yuwen-g2.mjs
node scripts/generate-yuwen-g3.mjs
node scripts/generate-yuwen-g4.mjs
node scripts/generate-yuwen-g5.mjs
node scripts/generate-yuwen-g6.mjs
node scripts/generate-shuxue-g1.mjs
node scripts/generate-shuxue-g2.mjs
node scripts/generate-shuxue-g3.mjs
node scripts/generate-shuxue-g4.mjs
node scripts/generate-shuxue-g5.mjs
node scripts/generate-shuxue-g6.mjs
node scripts/generate-others-all-grades.mjs
node scripts/generate-shuxue-versions.mjs
node scripts/generate-english-versions.mjs
node scripts/generate-subnodes-yw-kx-df.mjs
node scripts/generate-subnodes-others.mjs
node scripts/merge.mjs
node scripts/generate-dependencies.mjs
node scripts/generate-standards.mjs
node scripts/generate-clusters.mjs
node scripts/generate-manifest.mjs

# 校验数据完整性（ID/DAG环/引用完整性/计数）
node scripts/validate.mjs

# 生成内嵌数据的独立 HTML
node scripts/build-standalone.mjs

# 生成拆分版离线 HTML + 分包数据
node scripts/build-split-standalone.mjs
```

## 文件结构

```
cn-primary-taxonomy/
├── README.md                    ← 本文件
├── cn-primary-taxonomy.html     ← 🔥 PC端独立可视化网页（双击直接打开）
├── cn-primary-taxonomy-h5.html  ← 📱 H5移动端独立网页（双击直接打开）
├── cn-primary-taxonomy-split.html ← ⚡ 拆分版离线网页（更适合长期浏览）
├── h5/                          ← 📱 H5移动端源码目录
│   ├── README.md                ← H5版本说明文档
│   ├── index.html               ← H5页面模板
│   ├── build-h5.mjs             ← H5构建脚本（内嵌数据）
│   ├── css/style.css            ← H5移动优先样式
│   └── js/app.js                ← H5主应用逻辑
├── docs/
│   ├── DESIGN.md                ← 详细设计文档
│   ├── PROJECT_RULES.md         ← 项目硬约束与协作规则
│   ├── PROJECT_SKILL_PLAYBOOK.md← 团队常见任务操作手册
│   ├── PROJECT_MEMORY.md        ← 项目长期记忆镜像
│   └── SHENZHEN_G2_TEACHER_CALIBRATION.md ← 教师校准专项文档
├── data/
│   ├── topics.json              ← 知识点节点（4275个）
│   ├── dependencies.json        ← 依赖边（4191条，DAG）
│   ├── curriculum-standards.json← 课标对齐（2022新课标）
│   ├── clusters.json            ← 面向家长的领域概览
│   ├── manifest.json            ← 校验和与统计
│   ├── shenzhen-g2-teacher-review.csv ← 深圳二年级语数教师审核清单
│   ├── topics-english-versions.json ← 英语多版本模块增强数据
│   ├── topics-others-g1-g6.json ← 其他学科1-6年级数据
│   ├── topics-subnodes-yw-kx-df.json ← 语文/科学/道法子节点扩展数据
│   ├── topics-yuwen-g1.json     ← 一年级语文源数据
│   ├── topics-yuwen-g2.json     ← 二年级语文源数据
│   ├── topics-yuwen-g3.json     ← 三年级语文源数据
│   ├── topics-yuwen-g4.json     ← 四年级语文源数据
│   ├── topics-yuwen-g5.json     ← 五年级语文源数据
│   ├── topics-yuwen-g6.json     ← 六年级语文源数据
│   ├── topics-shuxue-g1.json    ← 一年级数学源数据
│   ├── topics-shuxue-g2.json    ← 二年级数学源数据
│   ├── topics-shuxue-g3.json    ← 三年级数学源数据
│   ├── topics-shuxue-g4.json    ← 四年级数学源数据
│   ├── topics-shuxue-g5.json    ← 五年级数学源数据
│   ├── topics-shuxue-g6.json    ← 六年级数学源数据
│   └── topics-shuxue-versions.json ← 数学多版本子节点化数据
├── schema/
│   ├── topics.schema.json       ← 知识点JSON Schema
│   └── dependencies.schema.json ← 依赖JSON Schema
├── scripts/
│   ├── generate-yuwen-g1.mjs ~ generate-yuwen-g6.mjs ← 语文分年级生成
│   ├── generate-shuxue-g1.mjs ~ generate-shuxue-g6.mjs ← 数学分年级生成
│   ├── generate-others-all-grades.mjs ← 其他学科生成
│   ├── generate-shuxue-versions.mjs ← 数学多版本与题链直达页生成
│   ├── generate-english-versions.mjs ← 英语多版本与rubric生成
│   ├── generate-subnodes-yw-kx-df.mjs ← 语文/科学/道法子节点与评价框架生成
│   ├── generate-subnodes-others.mjs ← 劳动/体音美/信息科技子节点与评价框架生成
│   ├── generate-dependencies.mjs← 依赖关系生成
│   ├── generate-standards.mjs   ← 课标对齐生成
│   ├── generate-clusters.mjs    ← 领域概览生成
│   ├── generate-manifest.mjs    ← 清单生成
│   ├── merge.mjs                ← 全量主题合并
│   ├── build-standalone.mjs     ← 打包独立HTML
│   ├── build-split-standalone.mjs ← 打包拆分版离线HTML
│   └── validate.mjs             ← 数据完整性校验
├── standalone-data/
│   ├── topics.js                ← 拆分版离线知识点数据
│   ├── dependencies.js          ← 拆分版离线依赖数据
│   └── clusters.js              ← 拆分版离线领域概览
└── web/
    └── index.html               ← 可视化网页源文件
```

## 文档阅读顺序

推荐按以下顺序了解项目：

1. `README.md`
2. `docs/PROJECT_RULES.md`
3. `docs/PROJECT_SKILL_PLAYBOOK.md`
4. `docs/PROJECT_MEMORY.md`
5. `docs/DESIGN.md`

## 数据模型

### 知识点（Topic）

| 字段 | 说明 | 示例 |
|---|---|---|
| `id` | 唯一ID，格式 `ct_{学科码}{年级}{学期}{序号}` | `ct_SX2S011`（数学·二年级·上·第11个） |
| `type` | 类型枚举 | CONCEPTUAL/PROCEDURAL/REPRESENTATIONAL/LANGUAGE/META |
| `typeLabel` | 类型中文名 | 概念/技能/表征/语言/元认知 |
| `subject` | 学科 | 语文/数学/英语/... |
| `domain` | 领域/模块 | 数与代数/识字与写字/... |
| `name` | 知识点名称 | 两位数加两位数（进位） |
| `description` | 1-3句清晰描述 | ... |
| `grade`/`term` | 年级（1-6）/学期（上/下/全） | 2/上 |
| `gradeBand` | 年级段 | L（低段1-2）/M（中段3-4）/H（高段5-6） |
| `textbook` | 教材版本 | 人教版/统编版/教科版 |
| `volume` | 教材册次 | 四年级上册 |
| `unit` | 教材单元 | 四上 第1单元 认识更大的数与乘除法 |
| `chapter` | 章节/模块 | 分数与比 / 三上 Unit 1 Hello |
| `parentTopicId` | 父知识点ID | `ct_SXB4S001` |
| `subnodeType` | 子节点类型 | 例题型/易错型/方法型/词汇/句型/语篇/写作任务 |
| `lesson` | 课时主题 | 课时主题：分数乘法的意义 / Lesson 1 主题词汇 |
| `module` | 英语模块 | 六上 Unit 2 Plans and Dreams |
| `pageRange` | 页码映射 | 参考P12-P13 |
| `practiceChain[]` | 建议练习链 | ["跟读并指认本课词汇", ...] |
| `assessmentTasks[]` | 建议测评任务 | ["根据提示词口头完成问答", ...] |
| `skillRubric` | 分技能测评rubric | 听力/口语/阅读/写作三档描述 |
| `evaluationRubric[]` | 通用结构化评价框架 | 维度 + 三档指标描述 |
| `resources[].resourceId` | 资源槽位ID | `res_ct_SXB4S001_例题型_album-lecture` |
| `resources[].resourceGroupKey` | 资源分组键 | `北师大版-四年级上册-四上-第1单元-认识更大的数与乘除法-例题型` |
| `resources[].resourceUnitKey` | 资源单元键 | `北师大版-四年级上册-四上-第1单元-认识更大的数与乘除法` |
| `resources[].externalWorkId` | 外部作品ID | `53996087` |
| `difficulty` | 难度星级 | 1-5 |
| `evidence[]` | 掌握证据（会什么就算掌握了） | ["能列竖式计算进位加法",...] |
| `commonMistakes[]` | 常见易错点 | ["忘记加进位的1",...] |
| `examTips` | 常见考法 | "竖式计算；判断对错..." |
| `assessmentPrompt` | 家长测评话术（含{{name}}占位） | "给{{name}}一道36+37..." |
| `standards[]` | 对齐的课标编码 | ["cn-shuxue-2022:1-2-syds-1"] |

### 依赖边（Dependency）

| 字段 | 说明 |
|---|---|
| `topicId` | 后续知识点 |
| `prerequisiteId` | 前置知识点（先学它） |
| `strength` | `hard`=必须先掌握 / `soft`=有帮助但非必须 |
| `reason` | 一句话说明为什么需要这个前置 |

## 学科代码

| 代码 | 学科 | 代码 | 学科 |
|---|---|---|---|
| YW | 语文 | SX | 数学 |
| YY | 英语（二外，CEFR起步） | KX | 科学 |
| DF | 道德与法治 | LD | 劳动 |
| TY | 体育与健康 | MS | 美术 |
| YYP | 音乐 | XX | 信息科技 |
| AI | AI素养 | ZH | 综合实践 |

## 前端交互功能

### 双视图模式

| 视图 | 说明 | 适用场景 |
|---|---|---|
| 力导向图 | D3.js 力模拟布局，节点按依赖关系自动排列 | 查看知识点间的关联、发现跨学科联系 |
| 层级树 | d3.hierarchy + d3.tree 生成树形结构 | 查看知识体系层级、按父子关系逐一学习 |

### 掌握状态系统

家长可以为每个知识点标记掌握状态：

| 状态 | 图标 | 颜色 | 含义 |
|---|---|---|---|
| 已掌握 | 🟢 | #2ecc71 (绿色) | 孩子已经完全学会 |
| 学习中 | 🟡 | #f39c12 (橙色) | 正在学习但尚未完全掌握 |
| 未开始 | ⚪ | 原色 (灰色) | 还没学到这个知识点 |

掌握状态保存在浏览器本地存储（localStorage）中，刷新页面不丢失。

### 练习系统

每个知识点自动生成练习题，支持三种题型：

1. **选择题**：从 4 个选项中选择正确答案
2. **判断题**：判断说法正误（✓ 正确 / ✗ 错误）
3. **填空题**：输入文本答案，支持模糊匹配

答对的题目会加深对该知识点的理解；答错的题目会自动记录到错题本。

### 学习路径推荐算法

基于 DAG 拓扑排序实现智能学习路径：

```
输入：年级、学科、当前掌握状态
  ↓
筛选：按年级、学科过滤知识点
  ↓
排序：按依赖关系拓扑排序（Kahn算法）
  ↓
跳过：已掌握的知识点不再推荐
  ↓
优先：基础/简单知识点排在前面
  ↓
输出：最多20个节点的学习序列
```

### 家长快捷入口

为方便不熟悉图谱操作的家长，提供年级×学科矩阵快捷入口：

```
        语文    数学    英语    科学    ...
一年级  [按钮]  [按钮]  [按钮]  [按钮]
二年级  [按钮]  [按钮]  [按钮]  [按钮]
三年级  [按钮]  [按钮]  [按钮]  [按钮]
四年级  [按钮]  [按钮]  [按钮]  [按钮]
五年级  [按钮]  [按钮]  [按钮]  [按钮]
六年级  [按钮]  [按钮]  [按钮]  [按钮]
```

点击任意按钮，图谱立即定位到对应范围并高亮显示。

## 与 Marble 原版的关键差异

| 维度 | Marble（原版） | CN-Primary-Taxonomy（本项目） |
|---|---|---|
| 国家/课标 | 英美（Common Core/UK NC/NGSS） | 中国大陆（2022新课标） |
| 核心学科 | English（母语）/Math/Science/History | **语文**（中文母语）/Math/English（**二外**）/Science/道法/劳动 |
| 年级组织 | 按年龄（4-15岁） | 按**年级（1-6）+学期（上/下）**为主 |
| 特色字段 | — | +教材版本/+易错点/+考法提示/+难度星级/+中文typeLabel |
| ID 前缀 | `mt_` | `ct_` (cn-topic) |
| Clusters | subject+domain+ageBand | subject+domain+**gradeBand** |
| 缺的内容 | 语文/道法/劳动/体育/音乐/美术 | History（小学融入语文+道法，不单列） |
| 交互功能 | 静态可视化 | 双视图 + 练习 + 掌握追踪 + 错题本 + 学习路径 |

## 后续路线图

- **v0.8.x**：完成图谱交互重构 — 双视图、掌握标记、练习系统、错题本、学习路径推荐
- **v0.9**：教材多版本继续扩展到更多学科，并细化到单元 / 主题 / 章节 / 课时 / 题型级映射
- **v0.9.x**：✅ **H5 移动端版本** — Canvas 高性能渲染、触摸手势、底部导航、练习系统、学习助手
- **v1.0**：把当前"检索入口型资源链接"升级为教师精选题链、错题模式、教学建议
- **v1.1**：对标 Marble 完整度并面向商用学习产品进一步收口

## 📱 H5 移动端版本

项目已支持移动端访问，独立文件 `cn-primary-taxonomy-h5.html`（8MB，数据已内嵌）：

| 特性 | 说明 |
|---|---|
| **Canvas 渲染** | 高性能 Canvas 2D 图谱渲染，支持数百节点流畅交互 |
| **触摸手势** | 双指缩放、拖拽平移、点击选择 |
| **底部导航** | 图谱、搜索、学习、错题、我的 — 5个核心入口 |
| **节点详情** | 原生App风格的底部抽屉，滑动关闭 |
| **搜索筛选** | 实时搜索 + 组合筛选面板 |
| **练习系统** | 选择、判断、填空三种题型，自动判分 |
| **学习助手** | 自然语言输入问题，智能推荐辅导建议 |

详见 [h5/README.md](h5/README.md)

## 参与贡献

这是一个开源项目，欢迎贡献：

- **补充知识点**：参考 `scripts/generate-*.mjs` 的模式，按年级/学科/单元补充微知识点
- **补依赖关系**：最重要也最需要业务经验（一线教师、家长），告诉我们"学X前到底必须先会什么"
- **补充易错点/考法**：基于真实教学经验
- **扩充课标对齐**：当前已覆盖 1-2 / 3-4 学段关键编码，后续继续细化到更具体条目
- **方言/地区教材**：上海版、苏教版、香港/澳门/台湾教材版本可做分支

## 开源协议

- 数据库层（topics/dependencies/standards/clusters 的结构与关系）：**ODbL 1.0**（可商用，署名，派生数据库需开源回社区）
- 文本内容层（name/description/evidence/assessmentPrompt 等中文撰写内容）：**CC BY-SA 4.0**
- 课标原文：只引用编码和关键术语，不引用正文，版权归教育部所有
- 代码（scripts/*.mjs 和可视化网页）：MIT

### 署名

基于：Marble Skill Taxonomy (v1) · © Generative Spark, Inc. (Marble) · https://withmarble.com · ODbL 1.0 + CC BY-SA 4.0

二次开发：CN-Primary-Taxonomy (v0.9) · 2026
