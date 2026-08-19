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
- 🧩 **题链挂接**：每个知识点都带有典型例题/练习题检索入口，便于快速串联“知识点-练习-讲解”
- 🧭 **三维筛选**：支持按年级 / 学科 / 教材版本查看知识图谱

## 当前版本 v0.6-Expanded

- **年级范围**：一年级 + 二年级 + 三年级 + 四年级 + 五年级 + 六年级
- **学科覆盖**：语文、数学、英语、科学、道德与法治、劳动、体育与健康、美术、音乐、信息科技、AI素养 共11学科
- **教材版本**：
  - 语文：统编版（1-6年级）
  - 数学：人教版 / 北师大版 / 苏教版，已细化到**册次-单元-课时主题**，并继续拆到**例题型 / 易错型 / 方法型**子节点，同时挂接**真实题链来源站入口**
  - 英语：外研版（一起点）1-2年级；人教PEP版 / 外研版 / 译林版（三年级起点）3-6年级，已细化到**模块内词汇 / 句型 / 语篇 / 写作任务**，并挂接**页码 / 练习链 / 测评任务 / 分技能 rubric**
  - 语文 / 科学 / 道德与法治：已推广为**父节点 + 子节点 + 练习链 + 测评任务**模式
  - 其他学科：当前先按一个代表版本铺开 1-6 年级主干
- **知识点数**：**4095 个**（语文1168 / 数学2511 / 英语224 / 科学72 / 道德与法治48 / 其他学科72）
- **依赖关系**：**4007 条**（强依赖2628 / 弱依赖1379）
- **课标对齐**：13个课标文件，共197个编码条目
- **领域概览**：134 个面向家长的领域说明
- **可视化**：完整交互式知识图谱网页（基于 D3.js 力导向图）
- **学习助手**：右侧内置 DAG Bot，可按薄弱点自动回溯前置知识
- **教师校准包**：已生成深圳二年级语文/数学待审清单 `data/shenzhen-g2-teacher-review.csv`

## 快速开始

### 方法一：直接打开可视化（推荐）

双击打开项目根目录下的 **`cn-primary-taxonomy.html`**（纯前端，**不需要服务器**）：

- 彩色圆点是知识点，颜色代表学科
- 🔴 红色实线 = 强依赖（必须先掌握）
- 🟡 橙色虚线 = 弱依赖（有帮助但非必须）
- **点击任一圆点**查看详情：描述、掌握标准、易错点、考法、家长测评话术、前置依赖链、后续解锁
- 顶部搜索框按名称/学科/领域快速定位
- 右侧 **学习助手 Bot** 可直接输入薄弱点，生成个性化补弱路径
- 右上角支持按 **年级 / 学科 / 教材版本** 筛选
- 每个知识点详情中都带有 **典型例题 / 练习题链接**

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
node scripts/generate-yuwen.mjs
node scripts/generate-yuwen-g3.mjs
node scripts/generate-yuwen-g4.mjs
node scripts/generate-yuwen-g5.mjs
node scripts/generate-yuwen-g6.mjs
node scripts/generate-shuxue-g1.mjs
node scripts/generate-shuxue.mjs
node scripts/generate-shuxue-g3.mjs
node scripts/generate-shuxue-g4.mjs
node scripts/generate-shuxue-g5.mjs
node scripts/generate-shuxue-g6.mjs
node scripts/generate-others-all-grades.mjs
node scripts/generate-shuxue-versions.mjs
node scripts/generate-english-versions.mjs
node scripts/generate-subnodes-yw-kx-df.mjs
node scripts/merge.mjs
node scripts/generate-dependencies.mjs
node scripts/generate-standards.mjs
node scripts/generate-clusters.mjs
node scripts/generate-manifest.mjs

# 校验数据完整性（ID/DAG环/引用完整性/计数）
node scripts/validate.mjs

# 生成内嵌数据的独立 HTML
node scripts/build-standalone.mjs
```

## 文件结构

```
cn-primary-taxonomy/
├── README.md                    ← 本文件
├── cn-primary-taxonomy.html     ← 🔥 独立可视化网页（双击直接打开）
├── docs/
│   └── DESIGN.md                ← 详细设计文档
├── data/
│   ├── topics.json              ← 知识点节点（4095个）
│   ├── dependencies.json        ← 依赖边（4007条，DAG）
│   ├── curriculum-standards.json← 课标对齐（2022新课标）
│   ├── clusters.json            ← 面向家长的领域概览
│   ├── manifest.json            ← 校验和与统计
│   ├── shenzhen-g2-teacher-review.csv ← 深圳二年级语数教师审核清单
│   ├── topics-english-versions.json ← 英语多版本模块增强数据
│   ├── topics-others-g1-g6.json ← 其他学科1-6年级数据
│   ├── topics-subnodes-yw-kx-df.json ← 语文/科学/道法子节点扩展数据
│   ├── topics-yuwen-g1.json     ← 一年级语文源数据
│   ├── topics-yuwen-g2.json     ← 语文源数据
│   ├── topics-yuwen-g3.json     ← 三年级语文源数据
│   ├── topics-shuxue-g1.json    ← 一年级数学源数据
│   ├── topics-shuxue-g2.json    ← 数学源数据
│   ├── topics-shuxue-g3.json    ← 三年级数学源数据
│   ├── topics-shuxue-g4.json    ← 四年级数学源数据
│   ├── topics-shuxue-g5.json    ← 五年级数学源数据
│   ├── topics-shuxue-g6.json    ← 六年级数学源数据
│   └── topics-shuxue-versions.json ← 数学多版本子节点化数据
│   ├── topics-yuwen-g4.json     ← 四年级语文源数据
│   ├── topics-yuwen-g5.json     ← 五年级语文源数据
│   └── topics-yuwen-g6.json     ← 六年级语文源数据
├── schema/
│   ├── topics.schema.json       ← 知识点JSON Schema
│   └── dependencies.schema.json ← 依赖JSON Schema
├── scripts/
│   ├── generate-yuwen.mjs       ← 语文知识点生成
│   ├── generate-shuxue.mjs      ← 数学知识点生成
│   ├── generate-others.mjs      ← 其他学科生成
│   ├── generate-dependencies.mjs← 依赖关系生成
│   ├── generate-standards.mjs   ← 课标对齐生成
│   ├── generate-clusters.mjs    ← 领域概览生成
│   ├── generate-manifest.mjs    ← 清单生成
│   ├── merge.mjs                ← 三科合并
│   ├── build-standalone.mjs     ← 打包独立HTML
│   └── validate.mjs             ← 数据完整性校验
└── web/
    └── index.html               ← 可视化网页源文件
```

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

## 后续路线图

- **v0.6**：已扩展至 1-6 年级主干，并把数学三版本推进到真实题链来源、英语三版本推进到分技能 rubric，同时把语文 / 科学 / 道法推广到父子节点模式，达到 4095 个知识点 / 4007 条依赖
- **v0.7**：继续把劳动、体音美、信息科技等学科从“主干版”加密到“教材章节级 + 子节点版”
- **v0.8**：教材多版本继续扩展到更多学科，并细化到单元 / 主题 / 章节 / 课时 / 题型级映射
- **v0.9**：把当前“检索入口型资源链接”升级为教师精选题链、错题模式、教学建议
- **v1.0**：对标 Marble 完整度（1590知识点/3221依赖），面向商用学习产品

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

二次开发：CN-Primary-Taxonomy (v0.2) · 2026
