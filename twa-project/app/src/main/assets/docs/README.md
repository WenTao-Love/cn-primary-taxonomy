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

## 当前版本 v2.4

> **v2.4 新增（主题落地 + 构建缓存治理）**：**跨学科主题研修**——国防教育（5 点）/ 国家安全（10 点）/ 挫折与意志（8 点），共 23 个**现有**知识点挂接（不新增知识点），拓扑序学习路线 + 学习目标/建议活动/**内容缺口**展示；共享组件 `theme-learning.js`，学生版 / H5 双端入口（`#btn-theme`），「开始主题学习」直达详情页闭环；`data/themes.json` + 构建注入。同时 4 个构建脚本为产物中本地 JS/CSS 引用附加 `?v=` 构建版本戳，杜绝「脚本更新后仍执行浏览器缓存旧版」。测试：`scripts/test-themes.mjs`（16 项）。详见 [docs/PROJECT_MEMORY.md](docs/PROJECT_MEMORY.md) 9.16.2。
> **v2.3 新增（cn-math-taxonomy 借鉴反哺）**：**根因回溯诊断**——从目标考点出发，三态判定（薄弱/不稳/未测）+ 确认题机制 + 沿硬先修回溯找「病根」+ 拓扑序补学路线 + **根因路径图（SVG）**与**盲区再测**；共享组件 `root-cause-diagnosis.js`，学生版 / H5 双端接入；诊断题构建注入（735 题，另随堂题与易错点判断题三级回退）；H5 整页布局缺陷修复（`#main-content`→`#app`）。详见 [docs/开源项目借鉴反哺报告-第四批.md](docs/开源项目借鉴反哺报告-第四批.md)。
> **v2.3 新增（开源业界借鉴反哺）**：诊断引擎离线基准（gap 检测/BKT 校准/题目区分度，种子可复现）+ 可解释边（4191/4191 条 category/explain/explainSource，详情页前置/后续链路与折叠）+ 交互模型升级至 6 个（新增角的度量、小数的意义，带动画销毁）+ FSRS-6 官方公式评估（未切换线上）+ AntV G6 候选评估（暂不引入）。详见 [docs/PROJECT_MEMORY.md](docs/PROJECT_MEMORY.md) 第 9.16 节与 [docs/开源项目借鉴反哺报告-第四批.md](docs/开源项目借鉴反哺报告-第四批.md)。
> **v2.2 新增（开源业界借鉴反哺）**：FSRS-4 调度内核（17 参数可校准）+ 学习阶段混合调度 + 存储 v3 平滑迁移；知识图谱学科聚合视图（超 900 节点自动聚合、点击下钻、大图降级）；依赖质量评测脚本（重复边/对称边/度分布/最长链/入度枢纽）。详见 [docs/PROJECT_MEMORY.md](docs/PROJECT_MEMORY.md) 第 9.15 节与 [docs/开源项目借鉴反哺报告-第三批.md](docs/开源项目借鉴反哺报告-第三批.md)。
> **v2.1 新增（借鉴第二批 4 篇行业文章反哺）**：枢纽度 centrality 全量计算与「⭐ 枢纽知识点」标签、4 个可拖拽交互模型（分数条/数轴/三角形内角/正方体展开图，14 主题挂接）、四轮拼写闯关（认形→元音→骨架→默写，接入 FSRS）、古诗词工具（搜索/随机/飞花令 + 独立页面）、上游授权合规文件 PROVENANCE.md。详见 [docs/四篇文章借鉴反哺报告-第二批.md](docs/四篇文章借鉴反哺报告-第二批.md)。
> **v2.0 新增**：FSRS 间隔复习引擎、错题两步闭环（当天重测 → 次日盲测）、预检跳课、11 个错因探针（P01–P11）+ 低级失误台账、75 分钟今日学习台（复习封顶一半 + 知识边界硬约束）。详见 [docs/四篇文章借鉴反哺报告.md](docs/四篇文章借鉴反哺报告.md)。

### 数据规模

- **年级范围**：一年级 ~ 六年级
- **学科覆盖**：语文、数学、英语、科学、道德与法治、劳动、体育与健康、美术、音乐、信息科技、AI素养 共11学科
- **知识点数**：**4275 个**（全量增强字段覆盖）
- **依赖关系**：**4191 条**（强依赖2810 / 弱依赖1381）
- **课标对齐**：13个课标文件，共197个编码条目

### 内容矩阵

| 模块 | 数量 | 说明 |
|---|---|---|
| 增强字段知识点 | 4275个 | 一句话核心价值、家长指导、教师指导、测试题 |
| 教师高频课程 | 69节 | 覆盖语数英+跨学科，含完整教学设计 |
| 家长高频问题 | 529个 | 13大类别，含话术建议和实操技巧 |
| 家长版周刊 | 12期 | 阅读兴趣/计算粗心/英文发音/作业拖延/课堂专注/厌学/考试焦虑/社交等 |
| 教师版周刊 | 12期 | 小数认知/平行四边形/英语绘本/科学实验/分数/周长/词汇教学等 |
| 学习路径 | 3学科×12学期 | 数学/语文/英语完整学习路径（含前置依赖） |
| 交互HTML页面 | 6个 | 周刊浏览/FAQ搜索/诊断中心/升学分析/管理者驾驶舱/古诗词工具 |
| 诊断题库 | 735道 | 覆盖384个知识点，数学/语文/英语/科学 |
| 诊断引擎v2 | 1套 | 难度自适应+智能确认题+多策略回溯+路径优化 |
| 根因回溯诊断 | 1套 | 三态判定+确认题+硬先修回溯+根因识别+拓扑序补学路线+历史/导出（共享组件，学生版/H5） |
| 跨学科主题研修 | 3主题/23点 | 国防教育5 / 国家安全10 / 挫折与意志8，挂接现有知识点（拓扑序路线 + 缺口展示，共享组件，学生版/H5） |
| 交互模型 | 6类/14主题 | 分数条/数轴/三角形内角/正方体展开图/角的度量/小数的意义（可拖拽 + 自动演示） |
| 拼写闯关 | 6主题18词 | 四轮记忆法（认形→元音→骨架→默写），接入 FSRS |
| 枢纽度 centrality | 4274个 | 全量计算（1.0×入度+0.5×出度加权，归一化 0-1） |
| FSRS 间隔复习引擎 | 1套 | FSRS-4 内核（17 参数，可校准）+ 6 轮学习间隔（20分钟~30天）+ 复习期按稳定性 + 信心校准 + 首做/重测分离 + 休眠退役 |
| 依赖质量评测 | 1套 | 重复边/对称边/度分布/跨学段硬边/DAG 最长链/入度枢纽（`scripts/evaluate-dependencies.mjs`） |
| 诊断离线评测 | 1套 | 引擎 gap 检测（结构/噪声）+ BKT 掌握校准（AUC/MAE）+ 题目区分度（`scripts/evaluate-diagnostic.mjs`） |
| FSRS-6 评估 | 1套 | 官方公式 + 17→21 迁移对比（`scripts/evaluate-fsrs-v6.mjs`，未切换线上） |
| 可解释边 | 4191/4191 | 九类 category + explain + explainSource（rule-derived） |
| 诊断闭环 | 1套 | 错题两步闭环(当天重测→次日盲测)+预检跳课(3题全对) |
| 今日学习台 | 2端 | H5/学生版：75分钟预算、复习封顶一半、知识边界硬约束 |
| PWA支持 | ✅ | 离线缓存/平板适配/APK打包 |

### 多角色版本（15大角色）

| 版本 | 入口 | 面向用户 | 特色功能 |
|---|---|---|---|
| 📱H5移动版 | `h5/index.html` | 通用 | Canvas渲染、触摸手势、底部导航、移动端原生体验 |
| 👨‍👩‍家长版 | `parent-web/index.html` | 家长 | 暗色主题、学习助手Bot、阅读指引、小伙伴模式切换 |
| 🧒学生版 | `student-web/index.html` | 小学生 | 明亮主题、星星奖励、正向激励、游戏化体验 |
| 👨‍🏫教师版 | `teacher-web/index.html` | 教师 | 专业主题、课标对照、路径生成器、覆盖统计表 |
| 🏫培训机构版 | `training-web/index.html` | 培训机构 | 多学员管理、诊断测评、班级对比、报告生成 |
| 🎓教育管理者版 | `admin-web/index.html` | 教育局/学校管理者 | 区域学情分析、覆盖矩阵、质量预警、均衡监测 |
| 📊教研员版 | `researcher-web/index.html` | 教研员 | 知识图谱结构分析、学习路径研究、教材对比、标注系统 |
| 👔班主任版 | `headteacher-web/index.html` | 班主任 | 班级学情全景、学生画像卡片、家校沟通模板、学业预警 |
| 📝出题人版 | `testdesigner-web/index.html` | 出题人 | 双向细目表生成、智能组卷、难度预测、覆盖度分析 |
| 🎯升学过渡版 | `transition-web/index.html` | 升学学生/家长 | 衔接知识图谱、考点热力图、学情差距分析、冲刺路径 |
| 💼教育销售版 | `edu-sales/index.html` | 课程顾问 | 快速学情诊断、学习路径提案、提分预测、竞品对比卡 |
| 🔍竞品分析版 | `competitor-analyst/index.html` | 产品经理 | 知识结构对比、覆盖度分析、难度曲线对比、机会识别 |
| 🏫学校本体版 | `school-entity/index.html` | 学校 | 知识资产仪表盘、招生卖点挖掘、师资缺口分析、校本课程 |
| 📢招生办版 | `admissions/index.html` | 招生办 | 招生简章生成、数据可视化、宣传素材、学校对比 |
| 🎪课后服务版 | `afterschool/index.html` | 课后服务教师 | 活动推荐、混龄分组策略、趣味学习设计、家长通报 |

## 快速开始

### 方法一：直接打开（推荐，无需服务器）

双击打开对应的独立HTML文件即可在浏览器中运行：

| 文件 | 说明 |
|---|---|
| `cn-primary-taxonomy-h5.html` | 📱H5移动版独立文件（数据已内嵌） |
| `cn-primary-taxonomy-parent.html` | 👨‍👩‍家长版独立文件（数据已内嵌） |
| `cn-primary-taxonomy-student.html` | 🧒学生版独立文件（数据已内嵌） |
| `cn-primary-taxonomy-teacher.html` | 👨‍🏫教师版独立文件（数据已内嵌） |
| `cn-primary-taxonomy-training.html` | 🏫培训机构版独立文件（数据已内嵌） |
| `cn-primary-taxonomy-admin.html` | 🎓教育管理者版独立文件（数据已内嵌） |
| `cn-primary-taxonomy-researcher.html` | 📊教研员版独立文件（数据已内嵌） |
| `cn-primary-taxonomy-headteacher.html` | 👔班主任版独立文件（数据已内嵌） |
| `cn-primary-taxonomy-testdesigner.html` | 📝出题人版独立文件（数据已内嵌） |
| `cn-primary-taxonomy-transition.html` | 🎯升学过渡版独立文件（数据已内嵌） |
| `cn-primary-taxonomy-edu-sales.html` | 💼教育销售版独立文件（数据已内嵌） |
| `cn-primary-taxonomy-competitor-analyst.html` | 🔍竞品分析版独立文件（数据已内嵌） |
| `cn-primary-taxonomy-school-entity.html` | 🏫学校本体版独立文件（数据已内嵌） |
| `cn-primary-taxonomy-admissions.html` | 📢招生办版独立文件（数据已内嵌） |
| `cn-primary-taxonomy-afterschool.html` | 🎪课后服务版独立文件（数据已内嵌） |

### 方法二：开发模式（使用shared/公共模块）

直接用浏览器打开源码目录下的HTML文件：

```bash
# H5移动版
open h5/index.html

# 家长版
open parent-web/index.html

# 学生版
open student-web/index.html

# 教师版
open teacher-web/index.html

# 培训机构版
open training-web/index.html

# 教育管理者版
open admin-web/index.html

# 教研员版
open researcher-web/index.html

# 班主任版
open headteacher-web/index.html

# 出题人版
open testdesigner-web/index.html

# 升学过渡版
open transition-web/index.html

# 教育销售版
open edu-sales/index.html

# 竞品分析版
open competitor-analyst/index.html

# 学校本体版
open school-entity/index.html

# 招生办版
open admissions/index.html

# 课后服务版
open afterschool/index.html
```

> 开发模式需要保持项目目录结构完整（shared/ 目录必须存在）

### 方法三：重新构建独立版本

```bash
# 【推荐】统一构建：生成 shared/data/ 数据文件 + 全部 15 个角色独立HTML（数据内嵌，可离线使用）
node build.mjs --standalone

# 仅生成 shared/data/ 数据文件（开发模式必需）
node build.mjs

# 单独重建某个角色（--target 使用入口 id：h5 / parent / student / teacher / ...）
node build.mjs --target=h5

# 生成主独立HTML（web 通用版，数据内嵌）
node scripts/build-standalone.mjs

# 生成拆分版离线页面与分包数据（降低单文件体积）
node scripts/build-split-standalone.mjs

# H5 专用构建（与 build.mjs 等价，含增强字段 + 路径修正 + UTF-8 BOM）
node h5/build-h5.mjs

# 验证构建产物路径完整性
node scripts/validate-build.mjs

# 依赖质量评测（重复边/对称边/度分布/最长链/枢纽）
node scripts/evaluate-dependencies.mjs

# FSRS 引擎回归测试（11 项）
node scripts/test-fsrs-engine.mjs

# 根因回溯诊断回归测试（20 项）
node scripts/test-root-cause-diagnosis.mjs

# 主题研修回归测试（16 项）
node scripts/test-themes.mjs

# 校准 FSRS 参数（输入：导出的复习日志 JSON）
node scripts/calibrate-fsrs.mjs <导出文件.json> [--out=data/fsrs-params.json]
```

> **构建流水线**：`merge.mjs` → `compute-centrality.mjs` → `enrich-topics.mjs` → `generate-dependencies.mjs` → `generate-manifest.mjs` → `validate.mjs`（详见 docs/PROJECT_RULES.md）
>
> **编码注意**：所有独立 HTML 产物统一写入 **UTF-8 BOM**，并把数据脚本放在 `<meta charset="utf-8">` 之后，避免浏览器按 Windows-1252 解码导致中文乱码。

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
│   │   │   ├── multi-user-storage.js ← 多用户存储引擎（培训机构/学校场景）
│   │   │   └── utils.js         ← 工具函数（防抖/转义/Toast）
│   │   ├── components/
│   │   │   ├── show-load-error.js ← 统一加载失败UI（10角色共用）
│   │   │   ├── mascot-effects.js  ← 吉祥物特效（气泡/鼓励/星星爆发）
│   │   │   ├── topic-tags.js      ← 知识点标签构建（学科/领域/年级/难度）
│   │   │   ├── mastery-row.js     ← 掌握度三态按钮行
│   │   │   ├── diagnostic-engine.js ← 诊断测评引擎（入学诊断/学情分析）
│   │   │   ├── root-cause-diagnosis.js ← 根因回溯诊断（三态/确认题/回溯/补学路线）
│   │   │   ├── theme-learning.js ← 跨学科主题研修（3主题挂接 + 拓扑序路线 + 缺口）
│   │   │   ├── fsrs-scheduler.js  ← FSRS-4 调度内核（17 参数，零依赖）
│   │   │   ├── fsrs-engine.js     ← FSRS 引擎（学习阶段 + FSRS 间隔，存储 v3）
│   │   │   └── report-generator.js  ← 报告生成器（进度/诊断/家校卡片）
│   │   └── graph/
│   │       └── pc-graph.js      ← PC端D3图谱渲染引擎
│   └── data/                    ← 构建生成的数据JS文件
│       ├── topics.js            ← 知识点数据（构建生成）
│       ├── dependencies.js      ← 依赖关系数据（构建生成）
│       ├── enhanced.js           ← 增强字段（构建生成，按需加载）
│       └── fsrs-params.js        ← FSRS 调度参数（构建生成，可校准）
│
├── h5/                          ← H5移动版（Canvas渲染）
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
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
├── training-web/                ← 培训机构版（紫色主题）
│   ├── index.html
│   ├── css/training.css
│   └── js/training.js
│
├── admin-web/                   ← 教育管理者版（绿色主题）
│   ├── index.html
│   ├── css/admin.css
│   └── js/admin.js
│
├── researcher-web/              ← 教研员版（蓝紫主题）
│   ├── index.html
│   ├── css/researcher.css
│   └── js/researcher.js
│
├── headteacher-web/              ← 班主任版（橙色主题）
│   ├── index.html
│   ├── css/headteacher.css
│   └── js/headteacher.js
│
├── testdesigner-web/             ← 出题人版（青蓝主题）
│   ├── index.html
│   ├── css/testdesigner.css
│   └── js/testdesigner.js
│
├── transition-web/               ← 升学过渡版（红金主题）
│   ├── index.html
│   ├── css/transition.css
│   └── js/transition.js
│
├── edu-sales/                   ← 教育销售版（金黄商业调）
│   ├── index.html
│   ├── css/edu-sales.css
│   └── js/edu-sales.js
│
├── competitor-analyst/          ← 竞品分析版（冷灰专业调）
│   ├── index.html
│   ├── css/competitor-analyst.css
│   └── js/competitor-analyst.js
│
├── school-entity/               ← 学校本体版（藏青稳重调）
│   ├── index.html
│   ├── css/school-entity.css
│   └── js/school-entity.js
│
├── admissions/                  ← 招生办版（紫红品牌调）
│   ├── index.html
│   ├── css/admissions.css
│   └── js/admissions.js
│
├── afterschool/                 ← 课后服务版（草绿活力调）
│   ├── index.html
│   ├── css/afterschool.css
│   └── js/afterschool.js
│
├── data/                        ← 原始JSON数据
│   ├── topics.json              ← 知识点节点（4275个）
│   ├── dependencies.json        ← 依赖边（4191条，DAG）
│   ├── curriculum-standards.json← 课标对齐（2022新课标）
│   ├── clusters.json            ← 面向家长的领域概览
│   ├── topics-enhanced-fields*.json ← 增强字段（全量覆盖）
│   ├── cache-parent-faq.json    ← 家长FAQ（529个问题）
│   ├── cache-teacher-lessons.json ← 教师课程（69节）
│   ├── learning-paths.json      ← 学习路径（3学科×12学期）
│   ├── weekly-parent-001.json ~ weekly-parent-012.json  ← 家长版周刊（12期）
│   ├── weekly-teacher-001.json ~ weekly-teacher-012.json ← 教师版周刊（12期）
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
│   ├── HONEST_HEALTH_CHECK_ROUND5.md ← 五轮深度体检报告
│   ├── MISSING_PERSPECTIVES_ANALYSIS.md ← 缺失视角分析（第一轮）
│   ├── MISSING_PERSPECTIVES_ROUND2.md ← 缺失视角深度分析（第二轮，含刁钻角度）
│   ├── exam-review.html         ← 小升初知识图谱交互式分析页面
│   ├── manager-dashboard.html   ← 教育管理者交互式驾驶舱
│   ├── weekly-newsletter.html   ← 周刊在线浏览（12期家长+12期教师）
│   ├── faq-search.html          ← 家长FAQ智能搜索（529个问题）
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
| `multi-user-storage.js` | 多学员存储引擎（培训机构/学校场景） | constants |
| `utils.js` | 防抖、HTML转义、Toast提示 | 无 |
| `pc-graph.js` | D3.js力导向图谱渲染 | D3.js(本地 + CDN回退) |
| `fsrs-scheduler.js` | FSRS-4 调度内核（17 参数、稳定性 S/难度 D/可提取性 R、间隔计算） | 无 |
| `fsrs-engine.js` | FSRS 混合引擎（学习阶段 6 步 + 复习期 FSRS 间隔；信心校准/首做分离/休眠退役；存储 v3） | fsrs-scheduler, constants, storage |
| `diagnostic-loop.js` | 错题两步闭环（当天重测→次日盲测）+ 预检跳课 | fsrs-engine, storage |
| `daily-plan.js` | 今日学习台（75分钟预算/复习封顶/知识边界硬约束） | fsrs-engine |
| `visual-models.js` | 6 个可拖拽 SVG 交互模型（分数条/数轴/三角形内角/正方体展开图/角的度量/小数的意义；含自动演示与动画销毁） | 无 |
| `spelling-quest.js` | 四轮拼写闯关（认形→元音→骨架→默写，错词定位反馈） | 无 |
| `poetry.js` | 古诗词工具（搜索/随机抽诗/飞花令，40 首示例库） | 无 |

### 共享组件说明

| 组件 | 功能 | 使用角色 |
|---|---|---|
| `show-load-error.js` | 统一加载失败UI，可配置图标/标题/重试回调 | 全部7角色 |
| `mascot-effects.js` | 吉祥物气泡提示、鼓励条、星星爆发动画 | 家长/学生/H5 |
| `topic-tags.js` | 构建学科/领域/年级/难度彩色标签 | 全部7角色 |
| `mastery-row.js` | 掌握度三态按钮行（已掌握/学习中/未开始） | 学生/家长/教师 |
| `diagnostic-engine.js` | 诊断测评引擎，学情缺口分析、学习建议生成 | 培训机构/教研员 |
| `report-generator.js` | 报告生成器（进度报告/诊断报告/家校卡片） | 培训机构/教育管理者 |
| `fsrs-engine.js` | FSRS 间隔复习引擎（FSRS-4 内核 + 学习阶段混合调度；首做/重测分离、信心校准、休眠退役） | H5/学生版 |
| `diagnostic-loop.js` | 错题两步闭环 + 预检跳课（AI 初稿题自动标注声明） | H5/学生版 |
| `daily-plan.js` | 今日学习台（预算/复习封顶/待解锁/错因分布） | H5/学生版 |
| `root-cause-diagnosis.js` | 根因回溯诊断（三态+确认题+硬先修回溯+根因+补学路线+历史/导出） | H5/学生版 |
| `theme-learning.js` | 跨学科主题研修（3 主题挂接现有知识点，拓扑序路线 + 缺口展示） | H5/学生版 |
| `visual-models.js` | 可拖拽交互模型（🎚️ 拖一拖，看变化） | 学生版/家长版 |
| `spelling-quest.js` | 四轮拼写闯关（英语词表主题） | 学生版 |
| `poetry.js` | 古诗词搜索/随机/飞花令（docs 工具页） | 全角色可用 |

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
4. `docs/PROJECT_SKILL_PLAYBOOK.md` - 重点关注2.7节「管理操作手册」
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
| `docs/poetry.html` | 古诗词工具（搜索/随机抽诗/飞花令，40 首示例库） |
| `docs/四篇文章借鉴反哺报告.md` | 第一批 4 篇行业文章方法论 → 项目落地对照表与实测记录 |
| `docs/四篇文章借鉴反哺报告-第二批.md` | 第二批 4 篇行业文章（诗词/Marble/拼写/模型）落地对照与实测 |
| `docs/开源项目借鉴反哺报告-第三批.md` | 第三批开源业界（FSRS/K12-KGraph/可视化等）调研与落地 |
| `docs/开源项目借鉴反哺报告-第四批.md` | 第四批（pyBKT/pyKT/Manim/fsrs-rs/G6）调研与落地 |

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
- **今日学习台**：75 分钟预算、先复习后新学、知识边界硬约束、错因分布与低级失误统计
- **错题两步闭环**：答错 → 当天重测（20 分钟）→ 次日盲测；预检 3 题全对可直接跳课
- **错因探针**：答错后定位 P01–P11 错因，低级失误单独台账
- **根因诊断**：从目标考点出发，答错自动退回前置知识追查「病根」，输出薄弱/不稳清单与补学路线（学生版与 H5 均可用）

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
- **今日学习台**：75 分钟预算、先复习后新学、知识边界硬约束（待解锁）、错因分布统计
- **错题两步闭环**：当天重测 → 次日盲测；预检 3 题全对直接标记掌握
- **错因探针**：P01–P11 + 低级失误二级台账
- **根因诊断**：底部弹层内完成「选目标 → 答题（含确认题）→ 报告 → 补学跳转」闭环，支持搜索候选与历史记录
- **主题研修**：`#btn-theme` 进入国防教育 / 国家安全 / 挫折与意志主题，查看拓扑序路线与内容缺口，一键跳到第一个未掌握点

### 🏫培训机构版 (training-web/)

面向培训机构教学场景，紫色渐变主题，核心功能：

- **多学员管理**：学员档案CRUD、当前学员切换、班级列表
- **诊断测评**：生成入学诊断测评，分析学情缺口，给出学习建议
- **班级对比**：全班知识点掌握对比表格、平均掌握率统计
- **报告生成**：学员进度报告、诊断报告、家校沟通卡片（支持HTML下载）
- **5大视图**：仪表盘、学员管理、诊断测评、报告中心、系统设置

### 🎓教育管理者版 (admin-web/)

面向教育局/学校管理者，绿色渐变主题，核心功能：

- **区域学情概览**：整体掌握率、活跃学员数、学习时长统计
- **分布可视化**：年级/学科/难度分布柱状图、知识点领域分布
- **覆盖矩阵**：年级 × 学科知识点覆盖热力图
- **质量预警**：关键节点识别、跨年级依赖断裂检测、薄弱学科预警
- **课标合规检查**：知识点与2022新课标对齐情况、缺失编码识别

### 📊教研员版 (researcher-web/)

面向教研员研究场景，蓝紫渐变主题，核心功能：

- **结构分析**：枢纽节点TOP20、知识模块度分析、图谱连通性
- **学习路径分析**：知识点前置依赖链、推荐学习序列生成
- **教材版本对比**：不同教材版本知识点编排差异对比分析
- **标注系统**：知识点批注、研究笔记、个人知识管理
- **分析报告**：研究摘要导出、关键发现总结、建议改进项

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
| `centrality` | 枢纽度 0-1（1.0×入度+0.5×出度加权归一化；null=未计算） | 0.0667 |
| `wordList[]` | 英语词表（词/中文/音标），用于拼写闯关 | [{word:"hello",meaning:"你好"}] |
| `modelRef` | 交互模型 ID（fraction-bar/number-line/triangle-angle/cube-net/angle-protractor/decimal-grid） | "fraction-bar" |

### 依赖边（Dependency）

| 字段 | 说明 |
|---|---|
| `topicId` | 后续知识点 |
| `prerequisiteId` | 前置知识点（先学它） |
| `strength` | `hard`=必须先掌握 / `soft`=有帮助但非必须 |
| `reason` | 一句话说明为什么需要这个前置 |
| `category` | 边类型九类之一：概念理解/技能操作/计算能力/空间观念/量感与单位/阅读表达/工具使用/常识经验/其他 |
| `explain` | 可解释说明（「T」依赖「P」：类别前提。+ 原因） |
| `explainSource` | `rule-derived`（规则派生）/ `curated`（人工精修） |
| `relationType` | 可选，关系类型：`prerequisite`（默认）/ `related` / `visual` / `experiment` / `assessment` |

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
- **v1.2**：✅ 共享组件化重构（7个共享组件，消除400+行重复代码）
- **v1.3**：✅ 教育机构/管理者/教研员三大新角色版本
- **v1.4**：✅ 班主任/出题人/升学过渡三大新角色版本
- **v1.5**：✅ 教育销售/竞品分析/学校本体/招生办/课后服务五大新角色版本
- **v1.6**：✅ 数据质量提升（全量增强字段覆盖）
- **v1.7**：✅ 内容矩阵扩充（529 FAQ + 69课程 + 24期周刊）
- **v1.8**：✅ 学习路径系统（数学/语文/英语三学科）
- **v1.9**：✅ 自适应诊断系统（三态判定+确认题+路径推荐+PWA）
- **v2.0**：✅ 学习闭环（FSRS 间隔复习 + 错题两步闭环 + 预检跳课 + 错因探针 + 今日学习台）—— 借鉴第一批 4 篇行业文章反哺
- **v2.1**：✅ 学习工具包（枢纽度 + 交互模型 + 四轮拼写 + 诗词工具 + 授权合规）—— 借鉴第二批 4 篇行业文章反哺
- **v2.2**：✅ FSRS-4 内核 + 图谱学科聚合视图 + 依赖质量评测 —— 借鉴开源业界（FSRS/K12-KGraph 等）反哺
- **v2.3**：✅ 根因回溯诊断（共享组件 + 学生端/H5 双端 + 诊断题注入 + 回归测试）—— 借鉴 cn-math-taxonomy 反哺
- **v2.3**：✅ 诊断离线评测 + 可解释边与反向链接 + 交互模型升级 + FSRS-6 评估 —— 借鉴 pyBKT/pyKT/Manim/fsrs-rs 等反哺
- **v2.4**：规模化推广体系（培训材料、试点经验、评估框架）
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
- 上游来源、授权四层表与署名要求详见 [PROVENANCE.md](PROVENANCE.md)
