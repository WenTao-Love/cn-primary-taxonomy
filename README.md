# 🇨🇳 中国小学教育知识图谱 (CN-Primary-Taxonomy)

> 面向中国大陆小学教育的开放、结构化知识图谱。基于 [Marble Skill Taxonomy v1](https://github.com/withmarbleapp/os-taxonomy)（美国 Marble 公司开源）二次开发，完全本土化。

## 这是什么

把小学各学科知识拆解为**细粒度知识点**（micro-topic），用**前置依赖图**（DAG）表达"学 X 之前必须先会 Y"的关系，对齐《义务教育课程标准（2022年版）》。

这不是课程表、不是教材目录，而是一个**可计算的学习图谱**——可以用来做：

- 🎯 **学情诊断**：孩子不会做某道题，沿依赖链找到真正薄弱的前置知识点
- 🛤️ **学习路径推荐**：根据已掌握的知识点，智能推荐下一个该学什么
- 📊 **家长辅导地图**：清晰看到知识点关联、跨年级衔接与教材版本差异
- 🏫 **教师备课工具**：知识点关联、课标对接、易错点查询、路径生成
- 🤖 **AI 学习助手底层数据**：给 AI 辅导产品提供结构化知识底座
- 🧩 **题链挂接**：每个知识点都带有典型例题/练习题检索入口
- ✅ **学习进度追踪**：可视化标记每个知识点的掌握状态
- 📝 **交互式练习**：选择题、判断题、填空题，即时判分
- 📱 **多端适配**：PC网页 + H5移动端，家长/学生/教师多角色版本

## 当前版本 v1.0-MultiRole

### 数据规模

- **年级范围**：一年级 ~ 六年级
- **学科覆盖**：语文、数学、英语、科学、道德与法治、劳动、体育与健康、美术、音乐、信息科技、AI素养 共11学科
- **知识点数**：**4275 个**
- **依赖关系**：**4191 条**（强依赖2810 / 弱依赖1381）
- **课标对齐**：13个课标文件，共197个编码条目

### 多角色版本

| 版本 | 入口 | 面向用户 | 特色功能 |
|---|---|---|---|
| 👨‍👩‍家长版 | `parent-web/index.html` | 家长 | 暗色主题、学习助手Bot、阅读指引、小伙伴模式切换 |
| 🧒学生版 | `student-web/index.html` | 小学生 | 明亮主题、星星奖励、正向激励、游戏化体验 |
| 👨‍🏫教师版 | `teacher-web/index.html` | 教师 | 专业主题、课标对照、路径生成器、覆盖统计表 |
| 📱H5移动版 | `h5/index.html` | 通用 | Canvas渲染、触摸手势、底部导航、移动端原生体验 |

## 快速开始

### 方法一：直接打开（推荐，无需服务器）

双击打开对应的独立HTML文件即可在浏览器中运行：

| 文件 | 说明 |
|---|---|
| `cn-primary-taxonomy-parent.html` | 👨‍👩‍家长版独立文件（数据已内嵌） |
| `cn-primary-taxonomy-student.html` | 🧒学生版独立文件（数据已内嵌） |
| `cn-primary-taxonomy-teacher.html` | 👨‍🏫教师版独立文件（数据已内嵌） |
| `cn-primary-taxonomy-h5.html` | 📱H5移动版独立文件（数据已内嵌） |

### 方法二：开发模式（使用shared/公共模块）

直接用浏览器打开源码目录下的HTML文件：

```bash
# 家长版
open parent-web/index.html

# 学生版
open student-web/index.html

# 教师版
open teacher-web/index.html

# H5移动版
open h5/index.html
```

> 开发模式需要保持项目目录结构完整（shared/ 目录必须存在）

### 方法三：重新构建独立版本

```bash
# 生成shared/data/数据文件（开发模式必需）
node build.mjs

# 生成所有独立HTML版本（数据内嵌，可离线使用）
node build.mjs --standalone

# 生成指定版本
node build.mjs --target=h5
node build.mjs --target=parent
node build.mjs --target=student
node build.mjs --target=teacher

# 验证构建产物路径完整性
node scripts/validate-build.mjs
```

> **构建后自动验证**：`build.mjs --standalone` 会自动检查所有引用路径的有效性

### 方法四：使用数据

所有数据在 `data/` 目录下，纯 JSON，零运行时依赖：

```js
import topics from './data/topics.json' assert { type: 'json' };
import deps from './data/dependencies.json' assert { type: 'json' };

// 查询"进位加法"的前置知识
const byId = new Map(topics.topics.map(t => [t.id, t]));
const pre = deps.dependencies
  .filter(d => d.topicId === 'ct_SX2S011')
  .map(d => byId.get(d.prerequisiteId).name);
console.log('学习进位加法前需要先掌握:', pre);
```

### 方法五：重新生成数据

```bash
# 从 scripts/*.mjs 源文件生成所有 JSON 数据
node scripts/generate-yuwen-g1.mjs
node scripts/generate-yuwen-g2.mjs
# ... (其他生成脚本)

# 校验数据完整性
node scripts/validate.mjs
```

## 项目架构

### 高内聚、低耦合的多角色架构

```
cn-primary-taxonomy/
├── shared/                      ← 公共层（所有角色共享）
│   ├── css/
│   │   ├── tokens.css           ← CSS设计令牌（变量/颜色/间距）
│   │   └── common.css           ← 通用样式（按钮/输入框/面板）
│   ├── js/
│   │   ├── core/
│   │   │   ├── constants.js     ← 常量（颜色/角色/存储键）
│   │   │   ├── data-loader.js   ← 数据加载器（多策略自适应）
│   │   │   ├── indices.js       ← 索引构建器（Map/依赖图）
│   │   │   ├── search.js        ← 搜索引擎（评分/筛选）
│   │   │   ├── path.js          ← 路径算法（拓扑排序/学习路径）
│   │   │   ├── storage.js       ← 存储管理（分角色localStorage）
│   │   │   └── utils.js         ← 工具函数（防抖/转义/Toast）
│   │   └── graph/
│   │       └── pc-graph.js      ← PC端D3图谱渲染引擎
│   └── data/                    ← 构建生成的数据JS文件
│       ├── topics.js            ← 知识点数据（构建生成）
│       └── dependencies.js      ← 依赖关系数据（构建生成）
│
├── parent-web/                  ← 家长版（暗色主题）
│   ├── index.html
│   ├── css/parent.css
│   └── js/parent.js
│
├── student-web/                 ← 学生版（明亮主题）
│   ├── index.html
│   ├── css/student.css
│   └── js/student.js
│
├── teacher-web/                 ← 教师版（专业主题）
│   ├── index.html
│   ├── css/teacher.css
│   └── js/teacher.js
│
├── h5/                          ← H5移动版（Canvas渲染）
│   ├── index.html
│   ├── build-h5.mjs             ← 旧版H5构建脚本（保留）
│   ├── css/style.css
│   └── js/app.js
│
├── data/                        ← 原始JSON数据
│   ├── topics.json              ← 知识点节点（4275个）
│   ├── dependencies.json        ← 依赖边（4191条，DAG）
│   ├── curriculum-standards.json← 课标对齐（2022新课标）
│   ├── clusters.json            ← 面向家长的领域概览
│   └── ...                      ← 其他源数据
│
├── schema/                      ← JSON Schema定义
├── scripts/                     ← 数据生成脚本
├── docs/                        ← 项目文档
│   ├── DESIGN.md                ← 详细设计文档
│   ├── PROJECT_RULES.md         ← 项目硬约束与协作规则
│   ├── PROJECT_SKILL_PLAYBOOK.md← 团队常见任务操作手册
│   ├── PROJECT_MEMORY.md        ← 项目长期记忆镜像
│   ├── TEACHER_REVIEW.md        ← 一线在校教师视角复盘
│   ├── TEACHER_REVIEW_CHOZIXIAOSHENG.md ← 培训机构教师视角（小升初）
│   ├── EDUCATION_MANAGER_REVIEW.md ← 教育管理者/教育局视角复盘
│   ├── exam-review.html         ← 小升初知识图谱交互式分析页面
│   ├── manager-dashboard.html   ← 教育管理者交互式驾驶舱
│   └── SHENZHEN_G2_TEACHER_CALIBRATION.md ← 教师校准专项
│
├── build.mjs                    ← 统一构建脚本
└── README.md                    ← 本文件
```

### 共享模块说明

| 模块 | 功能 | 依赖 |
|---|---|---|
| `constants.js` | 学科颜色、角色定义、存储键 | 无 |
| `data-loader.js` | 多策略数据加载（嵌入式→JS文件→JSON fetch） | constants |
| `indices.js` | 构建搜索索引、依赖关系图 | 无 |
| `search.js` | 关键词搜索、多维度筛选 | indices |
| `path.js` | 拓扑排序、学习路径生成 | indices |
| `storage.js` | 分角色localStorage管理 | constants |
| `utils.js` | 防抖、HTML转义、Toast提示 | 无 |
| `pc-graph.js` | D3.js力导向图谱渲染 | D3.js(本地 + CDN回退) |

### 数据加载策略

data-loader 自动选择最优加载方式：

```javascript
// 策略1: window.__CNPT_EMBEDDED (独立HTML内嵌数据)
// 策略2: <script id="embedded-topics"> (HTML内嵌JSON)
// 策略3: shared/data/topics.js (构建生成的JS文件)
// 策略4: data/topics.json (原始JSON fetch)

// 路径深度自动检测：
// 根目录页面 → ./shared/data/
// 一级子目录 → ../shared/data/
// 二级子目录 → ../../shared/data/
```

## 文档阅读顺序

### 技术/学科方向

1. `README.md` - 项目总览
2. `docs/PROJECT_RULES.md` - 项目协作规则
3. `docs/PROJECT_SKILL_PLAYBOOK.md` - 操作手册
4. `docs/DESIGN.md` - 详细设计文档
5. `docs/PROJECT_MEMORY.md` - 项目记忆

### 教育管理方向

1. `README.md` - 项目总览
2. `docs/EDUCATION_MANAGER_REVIEW.md` - 管理者视角全景复盘
3. `docs/PROJECT_RULES.md` - 重点关注第8章「管理者专项规则」
4. `docs/PROJECT_SKILL_PLAYBOOK.md` - 重点关注2.6节「管理操作手册」
5. `docs/TEACHER_REVIEW.md` - 一线教师视角（了解基层需求）
6. `docs/TEACHER_REVIEW_CHOZIXIAOSHENG.md` - 培训机构视角（了解升学需求）
7. `docs/exam-review.html` - 交互式升学分析

## 复盘与专题分析

### 三维度全方位复盘

| 文档 | 视角 | 核心关注 | 内容 |
|---|---|---|---|
| `docs/TEACHER_REVIEW.md` | 一线在校教师 | 数据质量与教学场景 | 知识点准确性、教学匹配度、P0-P3改进路线图 |
| `docs/TEACHER_REVIEW_CHOZIXIAOSHENG.md` | 培训机构教师 | 小升初与应试 | 知识占比、经典试题、考纲对比、趋势预测 |
| `docs/EDUCATION_MANAGER_REVIEW.md` | 教育管理者/教育局 | 全局统筹与治理 | 政策合规、数据安全、区域均衡、规模化、质量保障 |

### 交互式分析页面

| 文档 | 功能 |
|---|---|
| `docs/exam-review.html` | 小升初知识图谱可视化分析（占比/对比/易错/趋势） |
| `docs/manager-dashboard.html` | 教育管理者交互式驾驶舱（区域学情/均衡分析/质量监测） |

## 各角色版本功能详解

### 👨‍👩‍家长版 (parent-web/)

面向家长用户，暗色主题设计，核心功能：

- 侧边栏布局：搜索、筛选、学习助手、节点详情
- **DAG Bot 学习助手**：输入薄弱点，自动回溯前置知识并生成辅导建议
- **小伙伴模式**：一键切换到孩子视角（暖色主题 + 吉祥物 + 星星奖励）
- **快捷入口**：年级 × 学科矩阵一键直达
- **组合筛选**：按年级 / 学科 / 教材版本多维筛选

### 🧒学生版 (student-web/)

面向小学生用户，明亮活泼主题，核心功能：

- **星星奖励系统**：答对题目获得星星，激发学习动力
- **正向激励反馈**：答错时不显示"错误"，而是鼓励话语
- **游戏化体验**：弹跳动画、吉祥物对话气泡、庆祝特效
- **学科网格**：可视化选择学科和年级
- **练习系统**：选择题、判断题、填空题即时判分

### 👨‍🏫教师版 (teacher-web/)

面向教师用户，专业蓝色主题，核心功能：

- **6大功能视图**：教学概览、知识图谱、课标对照、学习路径、知识点库、设置
- **教学概览**：年级 × 学科覆盖统计表、教材版本列表
- **课标对照**：所有知识点对应的2022版课标编码查询
- **路径生成器**：输入目标知识点，基于拓扑排序生成推荐学习序列
- **知识点库**：全文搜索 + 多维度筛选
- **专业详情**：技能量表、考法提示、易错点、课标编码

### 📱H5移动版 (h5/)

移动端原生体验，Canvas高性能渲染：

- **Canvas 2D 图谱渲染**：支持数百节点流畅交互
- **触摸手势**：双指缩放、拖拽平移、点击选择
- **底部导航**：图谱、搜索、学习、错题、我的
- **底部抽屉**：原生App风格的节点详情面板
- **学习助手**：自然语言输入，智能推荐辅导建议
- **练习系统**：选择、判断、填空三种题型

## 数据模型

### 知识点（Topic）

| 字段 | 说明 | 示例 |
|---|---|---|
| `id` | 唯一ID，格式 `ct_{学科码}{年级}{学期}{序号}` | `ct_SX2S011` |
| `subject` | 学科 | 语文/数学/英语/... |
| `domain` | 领域/模块 | 数与代数/识字与写字/... |
| `name` | 知识点名称 | 两位数加两位数（进位） |
| `description` | 1-3句清晰描述 | ... |
| `grade`/`term` | 年级（1-6）/学期（上/下） | 2/上 |
| `textbook` | 教材版本 | 人教版/统编版 |
| `difficulty` | 难度星级 | 1-5 |
| `evidence[]` | 掌握证据 | ["能列竖式计算进位加法"] |
| `commonMistakes[]` | 常见易错点 | ["忘记加进位的1"] |
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
| YY | 英语 | KX | 科学 |
| DF | 道德与法治 | LD | 劳动 |
| TY | 体育与健康 | MS | 美术 |
| YYP | 音乐 | XX | 信息科技 |
| AI | AI素养 | ZH | 综合实践 |

## 与 Marble 原版的关键差异

| 维度 | Marble（原版） | CN-Primary-Taxonomy（本项目） |
|---|---|---|
| 国家/课标 | 英美 | 中国大陆（2022新课标） |
| 核心学科 | English/Math/Science | **语文**/Math/English/Science/道法 |
| 年级组织 | 按年龄（4-15岁） | 按**年级（1-6）+学期（上/下）** |
| 特色字段 | — | +教材版本/+易错点/+考法/+难度/+课标 |
| 前端功能 | 静态可视化 | 多角色 + 练习 + 掌握追踪 + 错题本 + 学习路径 |

## 后续路线图

- **v0.9.x**：✅ H5 移动端版本
- **v1.0**：✅ 多角色版本拆分（家长/学生/教师 + H5）
- **v1.1**：✅ 三维度全方位复盘（在校教师/培训机构/教育管理者）
- **v1.2**：数据质量提升（pageRange补全、resource链接替换、跨学科依赖）
- **v1.3**：管理者驾驶舱（区域学情/均衡分析/质量监测/预警机制）
- **v1.4**：数据安全合规（隐私政策、数据分级、教育APP备案）
- **v2.0**：规模化推广体系（培训材料、试点经验、评估框架）
- **v3.0**：对标 Marble 完整度并面向商用学习产品收口

## 参与贡献

- **补充知识点**：参考 `scripts/generate-*.mjs` 模式
- **补依赖关系**：告诉我们"学X前到底必须先会什么"
- **补充易错点/考法**：基于真实教学经验
- **扩充课标对齐**：继续细化到更具体条目

## 开源协议

- 数据库层（结构与关系）：**ODbL 1.0**
- 文本内容层：**CC BY-SA 4.0**
- 课标原文：只引用编码和关键术语
- 代码：**MIT**
