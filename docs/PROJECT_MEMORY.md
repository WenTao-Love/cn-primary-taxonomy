# CN-Primary-Taxonomy 项目 Memory

## 1. 文档定位

本文件是仓库内的人类可读“项目记忆镜像”，用于沉淀那些不会因为一次提交结束就失效的长期信息。

它不替代系统 memory，但用于：

- 项目交接
- 团队共识传承
- 回顾关键决策
- 防止重复踩坑

## 2. 当前项目画像

- 项目名称：`cn-primary-taxonomy`
- 目标：覆盖中国小学 1-6 年级、多学科、多教材版本的结构化知识图谱
- 技术栈：Node.js + JSON + D3.js + Canvas 2D（H5）
- 版本：v1.0-MultiRole
- 主要交付物：
  - `data/topics.json` / `data/dependencies.json`
  - `cn-primary-taxonomy-parent.html`（家长版独立文件）
  - `cn-primary-taxonomy-student.html`（学生版独立文件）
  - `cn-primary-taxonomy-teacher.html`（教师版独立文件）
  - `cn-primary-taxonomy-h5.html`（H5移动版独立文件）
  - `parent-web/` / `student-web/` / `teacher-web/` / `h5/`（源码目录）
  - `shared/`（公共模块层）

## 3. 已形成的长期决策

### 3.1 数据结构方向

- 项目已经从“主节点图谱”演进为“主节点 + 子节点 + 练习链 + 测评任务 + 评价框架”的结构
- 数学资源治理已经从聚合检索入口演进到：
  - `resourceId`
  - `resourceGroupKey`
  - `resourceUnitKey`
  - `externalWorkId`

### 3.2 多角色架构（v1.0关键决策）

- **拆分原则**：按用户身份（家长/学生/教师）拆分HTML页面，实现高内聚、低耦合
- **公共层 shared/**：数据加载、索引构建、搜索、路径、存储、工具、D3图谱渲染
- **角色专属层**：各角色只包含专属 HTML/CSS/JS，通过 CSS Custom Properties 实现主题切换
- **数据隔离**：分角色 localStorage（不同 key 前缀），避免数据互相干扰
- **data-loader 自适应**：自动检测路径深度（根目录/一级/二级），无需手动配置 shared/data/ 路径
- **构建系统**：`build.mjs` 统一生成 shared/data/JS文件和独立HTML版本

### 3.3 页面交互方向

- 搜索、筛选、状态提示统一收敛到右侧边栏（家长版/教师版）
- 主画布只承担图谱浏览，不再承载浮层式密集控件
- 年级 / 学科 / 版本筛选统一走可搜索的多选下拉

### 3.4 性能治理方向

- 默认只渲染当前筛选子图
- 拖拽完成后自动停止布局
- 页面隐藏时销毁图谱实例，恢复时按当前筛选重建
- 旧 simulation、tick、RAF、zoom 事件都必须有显式回收

## 4. 当前硬约束记忆

- DAG 绝不能出环
- 资源匹配必须严防跨版本误挂
- 任何新增字段都必须同步 schema 与 validate
- 任何重要变更都必须同步 README、DESIGN、规则文档与 memory

## 5. 已验证过的有效经验

### 5.1 资源治理

- 资源匹配若只看“学科 + 年级 + 名称”，很容易串挂
- “圆”和“圆柱圆锥”这类近名主题必须收紧到更具体语义
- 直链资源的质量，优先于数量

### 5.2 页面治理

- 仅 `simulation.stop()` 无法彻底解决长挂卡顿
- 必须连带释放 tick 回调、RAF、旧图层和事件绑定
- 交互控件挪到右侧边栏后，图谱主视区的可读性明显更好

## 6. 当前文档地图

- `README.md`：项目入口说明
- `docs/DESIGN.md`：架构与数据设计
- `docs/PROJECT_RULES.md`：团队硬约束
- `docs/PROJECT_SKILL_PLAYBOOK.md`：常见任务操作手册
- `docs/PROJECT_MEMORY.md`：项目长期记忆镜像
- `docs/TEACHER_REVIEW.md`：一线在校教师视角复盘（数据质量/教学场景）
- `docs/TEACHER_REVIEW_CHOZIXIAOSHENG.md`：培训机构教师视角复盘（小升初/趋势）
- `docs/EDUCATION_MANAGER_REVIEW.md`：教育管理者/教育局视角复盘（政策合规/数据安全/规模化）
- `docs/HONEST_HEALTH_CHECK.md`：坦诚体检报告（代码Bug/数据质量/真话）
- `docs/exam-review.html`：小升初知识图谱交互式分析页面
- `docs/manager-dashboard.html`：教育管理者交互式驾驶舱（区域学情/均衡分析/质量监测）
- `docs/SHENZHEN_G2_TEACHER_CALIBRATION.md`：教师校准专项说明

## 7. 当前推荐接手顺序

1. 先看 README
2. 再看 PROJECT_RULES
3. 再看 PROJECT_SKILL_PLAYBOOK
4. 再看本文件
5. 最后看 DESIGN 和脚本实现

## 8. 未来继续扩展时优先记住

- 优先做"高频、高价值、高准确度"的扩展
- 优先复用已有字段和展示结构
- 优先消灭资源泄露、内存泄露、IO 泄露、CPU 常驻空转
- 不要为了短期好看，牺牲长期可维护性

## 9. 已修复的问题记录（2026年8月）

### 9.1 代码Bug修复 ✅

- **pc-graph.js zoomBehavior未定义**：第63行 `zoomBehavior` → `this.zoomBehavior`，修复PC版initCanvas崩溃
- **path.js 拓扑排序被破坏**：`buildLearningPath` 和 `buildSubjectPath` 中拓扑排序后的全局难度排序会违反依赖约束，已改为在Kahn算法内部用难度做同层优先级排序

### 9.2 数据质量修复 ✅

- **practiceChain/assessmentTasks补全**：1231个缺失字段（占28.8%）已全部按学科+子节点类型智能填充，现为100%覆盖
- **skillRubric**：94.8%缺失，该字段为英语学科专属四技能量表，其他学科不适用，暂不填充（建议后续改为通用评价方案字段）

### 9.3 构建系统与路径修复 ✅（2026年8月二轮体检）

- **独立版本路径全部错误（P0阻断级）**：`build.mjs` 构建独立HTML时只注入数据不重写相对路径，导致4个独立版本（parent/student/teacher/h5）的CSS和JS引用全部断链。已在build.mjs中添加路径修正逻辑：
  - `../shared/` → `shared/`
  - `css/xxx.css` → `{dir}/css/xxx.css`
  - `js/xxx.js` → `{dir}/js/xxx.js`
- **H5开发版路径错误**：`h5/index.html` 使用 `shared/...` 导致直接打开时脚本加载失败，已修正为 `../shared/...`
- **搜索结果教材版本消歧未完成**：CSS样式已定义但 `search.js` 中的 `detectDuplicateNames` 和 `buildSearchResultHTML` 函数虽已存在，但 `teacher.js` 未使用共享函数而是自行实现相同逻辑。已重构为统一使用 `CNPT.search.buildSearchResultHTML`，并通过 `contentRenderer` 选项保持各版本自定义样式
- **CDN依赖残留**：`web/index.html` 和 `cn-primary-taxonomy-split.html` 仍通过CDN加载D3.js。已改为本地 `shared/vendor/d3.min.js` 优先，CDN作为回退
- **构建产物验证缺失**：新增 `scripts/validate-build.mjs` 构建后自动检查所有引用路径，已集成到 `build.mjs` 流程中

### 9.4 性能与体验修复 ✅（2026年8月三轮体检）

- **pc-graph.js 模拟泄漏（P1）**：`render()` 方法每次调用创建新D3 simulation但未停止旧simulation，导致多次筛选后CPU飙升。已在render()开头添加 `if (this.simulation) { this.simulation.stop(); this.simulation = null; }`
- **缺少加载指示器（P2）**：用户打开页面后数据加载期间（2-5秒）看到空白页。已为所有5个入口页面添加加载指示器HTML和CSS，并在各角色init()末尾调用 `CNPT.utils.hideLoadingScreen()`
- **H5禁止缩放（P2-无障碍）**：原viewport设置 `maximum-scale=1.0, user-scalable=no` 阻止用户缩放。已移除限制，允许视力障碍用户缩放
- **未使用工具函数清理（P3）**：删除 `utils.js` 中5个未导出未使用的函数（`rafThrottle`, `truncate`, `formatTime`, `uid`）和3个导出但未使用的函数（`gradeLabel`, `layerLabel`, `unique`, `deepClone`），新增 `hideLoadingScreen` 和 `updateLoadingProgress` 工具函数
- **版本标签尾随空格（P3）**：`search.js` 中版本标签为空时产生尾随空格，已修复条件拼接
- **死代码清理（P3）**：删除 `pc-graph.js` 构造函数中未使用的 `this._resizeHandler = null`

### 9.5 安全与体验增强 ✅（2026年8月四轮体检）

- **H5 XSS漏洞（P1-security）**：`h5/js/app.js` 中10+处 `onclick="..."` 内联事件包含未转义的 `topic.id`，可能被利用注入恶意代码。已全部替换为 `data-action` + 事件委托模式
- **加载失败无重试（P2）**：数据加载失败时只显示Toast，用户无法操作。已为所有角色(parent/student/teacher/h5)添加 `showLoadError` 风格的加载错误界面，带重新加载按钮
- **筛选空结果无引导（P2）**：筛选条件过严时图为空白，用户不知道原因。已在 `applyFilters()` 中检测空结果并显示提示："当前筛选条件下没有匹配的知识点"
- **节点截断无通知（P2）**：超过500节点时静默截断。已添加节点数量超限提示，建议缩小筛选范围
- **可访问性增强（P2-a11y）**：
  - 所有6个HTML入口添加跳转链接 (`<a href="#main-content" class="cnpt-skip-link">跳到主内容</a>`)，键盘用户可按Tab聚焦后回车跳转
  - `common.css` 添加 `:focus-visible` 样式（键盘聚焦显示蓝色轮廓，鼠标点击不显示）
  - `build.mjs` 验证脚本修复：跳过 `#` 锚点链接验证
- **构建验证完善**：撤销 `scripts/validate-build.mjs` 独立脚本，将验证逻辑内联到 `build.mjs` 步骤3，并修复锚点误报
- **ARIA属性增强（P2-a11y）**：
  - `teacher-web/index.html` 导航添加 `aria-label="主导航"`
  - `h5/index.html` 底部导航添加 `aria-label="主导航"`
  - 修复 `student-web/index.html` 重复 `id="main-content"` 的无效HTML问题

### 9.6 五轮深度审计修复 ✅（2026年8月）

**SEO与语义化HTML**
- 所有5个HTML入口添加 `<meta name="description">` 和 Open Graph 标签
- 所有5个HTML入口添加视觉隐藏的 `<h1>` 标题（屏幕阅读器可访问）
- 所有 `viewport` 添加 `viewport-fit=cover`（适配iPhone刘海屏）
- 所有表单元素添加 `aria-label`（teacher-web: 6个, h5: 2个）

**CSS健康度**
- 移除 `teacher.css` 中重复的 `.cnpt-hidden`（已在 `common.css` 定义）

**数据质量确认**
- 0个孤儿依赖、0个循环依赖、0个自依赖、0个重复依赖
- 必填字段覆盖率100%，可选字段覆盖率84-100%
- 学科/年级/难度分布均衡

**隐私安全确认**
- 零第三方追踪（无GA/友盟/百度统计）
- 纯localStorage本地存储，无网络数据传输
- 6个console.log/error（均为错误处理所需）
- 无敏感数据（密码/token/API密钥）处理

**代码冗余发现**
- 4个角色JS文件存在约400-500行重复代码
- 最高优先级：`showNodeDetail()` 在3个文件中重复约270行
- 建议后续抽取为共享组件（error-handler, effects, mascot, topic-detail, practice, path-list等）

### 9.7 共享组件化重构 ✅（2026年8月五轮体检后）

**新增共享组件**
- `shared/js/components/show-load-error.js` - 统一加载失败UI（7角色共用）
- `shared/js/components/mascot-effects.js` - 吉祥物特效（气泡/鼓励/星星爆发）
- `shared/js/components/topic-tags.js` - 知识点标签构建（学科/领域/年级/难度）
- `shared/js/components/mastery-row.js` - 掌握度三态按钮行
- `shared/js/core/multi-user-storage.js` - 多用户存储引擎（培训机构/学校场景基础）
- `shared/js/components/diagnostic-engine.js` - 诊断测评引擎（入学诊断/学情分析）
- `shared/js/components/report-generator.js` - 报告生成器（进度报告/诊断报告/家校卡片）

**重构收益**
- 4个角色的HTML入口新增共享组件脚本引用
- 各角色JS移除重复函数：showLoadError、showMascotTip、showEncourage、showStarBurst
- 所有调用点改为 `CNPT.components.xxx()` 统一接口
- 构建验证通过：74个引用（原46个+28个新组件引用）

**性能观察**
- 102个addEventListener vs 2个removeEventListener（SPA中需关注）
- 4275个知识点 × 多次数组遍历，低端设备可能有卡顿
- 建议后续引入事件委托和虚拟滚动

### 9.8 三大新角色视角实现 ✅（2026年8月遗漏视角攻坚）

**培训机构版 (training-web/)**
- 位置: `training-web/index.html` + `training-web/css/training.css` + `training-web/js/training.js`
- 核心功能: 学员管理(增删改查)、入学诊断、学习进度排行、家校报告生成
- 复用组件: MultiUserStorage + DiagnosticEngine + ReportGenerator
- 特色: 学员档案卡片化、掌握度排行表格、诊断报告一键生成

**教育管理版 (admin-web/)**
- 位置: `admin-web/index.html` + `admin-web/css/admin.css` + `admin-web/js/admin.js`
- 核心功能: 全校概览仪表盘、学科×年级覆盖度矩阵、课标落实检查、学业预警
- 复用组件: ReportGenerator + 图谱结构分析
- 特色: 知识点分布柱状图、高难度关键节点识别、跨年级依赖分析

**教研员版 (researcher-web/)**
- 位置: `researcher-web/index.html` + `researcher-web/css/researcher.css` + `researcher-web/js/researcher.js`
- 核心功能: 知识图谱结构分析、学习路径推演、教材版本对比、教研标注共创
- 复用组件: CNPT.path(路径分析) + 本地标注存储
- 特色: 高度连接节点分析、版本对比卡片、知识点教学批注

**构建系统更新**
- build.mjs 入口从4个扩展到7个
- 独立HTML产物: 7个 (cn-primary-taxonomy-*.html)
- 验证引用数: 129个（每个新角色约18个脚本引用）
- 所有7个独立版本构建成功且路径验证通过

### 9.9 第二轮三大新角色视角实现 ✅（2026年8月第二轮遗漏视角攻坚）

**班主任版 (headteacher-web/)**
- 位置: `headteacher-web/index.html` + `headteacher-web/css/headteacher.css` + `headteacher-web/js/headteacher.js`
- 核心功能: 班级学情仪表盘、学生画像卡片、家校沟通模板、学业预警系统、升学推荐建议
- 复用组件: CNPT.components.showLoadError + Storage + 雷达图/热力图自定义渲染
- 特色: 学生×知识点掌握度热力图、一键生成家长会发言提纲、个性化学生评语生成器
- 主题: 橙色暖调 (#e67e22 → #f39c12)

**出题人版 (testdesigner-web/)**
- 位置: `testdesigner-web/index.html` + `testdesigner-web/css/testdesigner.css` + `testdesigner-web/js/testdesigner.js`
- 核心功能: 双向细目表生成、智能组卷、难度预测、覆盖度分析、试卷库管理
- 复用组件: CNPT.components.showLoadError + Storage + 图谱数据
- 特色: 知识点×认知维度矩阵自动生成、基于节点难度的难度预测算法、试卷保存/导出
- 主题: 青蓝专业调 (#1a73e8 → #6c5ce7)

**升学过渡版 (transition-web/)**
- 位置: `transition-web/index.html` + `transition-web/css/transition.css` + `transition-web/js/transition.js`
- 核心功能: 衔接知识图谱、考点热力图、学情差距分析、冲刺路径生成、模拟测评
- 复用组件: CNPT.components.showLoadError + Storage + 路径算法
- 特色: 倒计时进度追踪、目标vs现状差距可视化、三阶段冲刺路径规划
- 主题: 红金冲刺调 (#c0392b → #e67e22 → #f39c12)

**构建系统更新**
- build.mjs 入口从7个扩展到10个
- 独立HTML产物: 10个 (cn-primary-taxonomy-*.html)
- 验证引用数: 174个（每个新角色约15个脚本引用）
- 所有10个独立版本构建成功且路径验证通过

### 9.10 第三轮五大新角色视角实现 ✅（2026年8月第三轮刁钻角度攻坚）

**教育销售版 (edu-sales/)**
- 位置: `edu-sales/index.html` + `edu-sales/css/edu-sales.css` + `edu-sales/js/edu-sales.js`
- 核心功能: 快速学情诊断、学习方案生成、提分预测模型、竞品对比卡、转化漏斗追踪
- 复用组件: CNPT.components.showLoadError + Storage + 图谱数据
- 特色: 3分钟快速诊断、多套学习方案自动生成、转化漏斗可视化
- 主题: 金黄商业调 (#d4a017 → #f39c12 → #e67e22)

**竞品分析版 (competitor-analyst/)**
- 位置: `competitor-analyst/index.html` + `competitor-analyst/css/competitor-analyst.css` + `competitor-analyst/js/competitor-analyst.js`
- 核心功能: 知识结构对比、覆盖度分析、难度曲线对比、市场机会识别
- 复用组件: CNPT.components.showLoadError + Storage + 图谱数据
- 特色: 多维对比表格、难度曲线可视化、市场空白区域识别
- 主题: 冷灰专业调 (#37474f → #546e7a → #78909c)

**学校本体版 (school-entity/)**
- 位置: `school-entity/index.html` + `school-entity/css/school-entity.css` + `school-entity/js/school-entity.js`
- 核心功能: 知识资产仪表盘、招生卖点挖掘、师资缺口分析、校本课程设计
- 复用组件: CNPT.components.showLoadError + Storage + 图谱数据
- 特色: 学校作为法人的自我审视、知识资产全景、师资配置建议
- 主题: 藏青稳重调 (#1a3a5c → #2c5282 → #3182ce)

**招生办版 (admissions/)**
- 位置: `admissions/index.html` + `admissions/css/admissions.css` + `admissions/js/admissions.js`
- 核心功能: 智能招生简章生成、教学成果可视化、宣传素材生成、学校差异对比
- 复用组件: CNPT.components.showLoadError + Storage + 图谱数据
- 特色: 一键生成招生简章、数据可视化展示、宣传素材库
- 主题: 紫红品牌调 (#8e44ad → #a569bd → #d2b4de)

**课后服务版 (afterschool/)**
- 位置: `afterschool/index.html` + `afterschool/css/afterschool.css` + `afterschool/js/afterschool.js`
- 核心功能: 课后活动推荐、混龄分组策略、趣味学习设计、家长通报生成
- 复用组件: CNPT.components.showLoadError + Storage + 图谱数据
- 特色: 基于知识点的活动推荐、混龄分组策略、趣味学习游戏设计
- 主题: 草绿活力调 (#1e8449 → #27ae60 → #2ecc71)

**构建系统更新**
- build.mjs 入口从10个扩展到15个
- 独立HTML产物: 15个 (cn-primary-taxonomy-*.html)
- 验证引用数: 约225个（每个新角色约15个脚本引用）
- 所有15个独立版本构建成功且路径验证通过

### 9.11 待修复（未解决）

- 管理驾驶舱假数据（需要接入真实数据源后才能真正解决）
- 多角色功能同质化（需要产品层面重新定义角色差异化）
- 教材版本覆盖缺口（需要学科专家按版本补录）
- **培训机构视角关键缺口**（2026年8月复盘新增）：
  - 跨学科依赖缺失（当前0条，备考需要500+条）
  - 考试频次/区域标注缺失（`examFrequency`/`examRegions`字段）
  - 数学思维方法类节点不足（浓度/经济/最值/逻辑推理）
  - 情境化真实题目资源匮乏
  - 2027+趋势：素养化、跨学科融合、过程化评价
- **教育管理者视角关键缺口**（2026年8月复盘新增）：
  - 数据安全合规严重缺失（无隐私政策、无用户协议、无数据分级）
  - 城乡适配不足（无离线版、无低带宽版）
  - 教材版本覆盖缺口（约40%教材版本学生无法精准匹配）
  - 质量保障机制缺失（无专家审核、无反馈渠道、无错误修正流程）
  - 规模化推广体系缺失（无培训材料、无试点经验、无评估框架）
  - 督导评估能力缺失（无区域对比、无趋势分析、无预警机制）

### 9.12 H5 CSS 同步与文档更新 ✅（2026年8月第四轮优化）

**H5 CSS 同步验证**
- 验证范围：所有 15 个独立 HTML 文件（cn-primary-taxonomy-*.html）
- 验证结果：全部 15 个文件均正确引用 `shared/css/tokens.css` 和 `shared/css/common.css`
- H5 源码文件（h5/index.html）已添加共享 CSS 引用（`../shared/css/tokens.css` + `../shared/css/common.css`）
- H5 独立版本（cn-primary-taxonomy-h5.html）已同步更新
- 所有 15 个独立版本的 CSS/JS 引用路径验证通过

**H5 功能对齐验证**
- H5 源码与独立版本的共享 JS 模块引用一致（8个 core + 6个 components）
- H5 不使用 pc-graph.js（正确 — 使用 Canvas 渲染而非 SVG/D3）
- H5 的移动端特有结构（Canvas + 底部导航）与 PC 版本差异属于设计意图

**文档同步更新**
- README.md：已确认包含全部 15 个角色版本说明
- PROJECT_MEMORY.md：新增本节记录 CSS 同步状态
- DESIGN.md：已包含共享 CSS 架构说明（tokens.css + common.css）

### 9.13 v2.0 学习闭环：四篇文章借鉴反哺 ✅（2026-11-16）

**来源**
- 4 篇微信文章存档于 `docs/references/01~04-*.md`（《AI 自学数学账本实操》《edulab 把考题变 3D 交互页》《cn-math-taxonomy 开源先锋》《词光 一词一画》）。
- 逐篇方法论 → 落地对照表：`docs/四篇文章借鉴反哺报告.md`。

**新增共享组件（3 个）**
- `shared/js/components/fsrs-engine.js`：FSRS 间隔复习（6 轮 20分钟~30天、倍数 1/1.5/2、上限 60 天、连续 3 次独立答对休眠 60 天抽检、首做/重测分离、信心校准、错因与低级失误台账）。
- `shared/js/components/diagnostic-loop.js`：错题两步闭环（答错 → 20 分钟后重测 → 次日盲测 → mastered）+ 预检跳课（3 题全对 → mastered + 卡片 7 天）。
- `shared/js/components/daily-plan.js`：今日学习台（75 分钟预算、复习封顶 37 分钟、先复习后新学、知识边界硬约束、错因分布/低级失误统计）。

**修改的共享层**
- `constants.js`：新增 `LEARNING_BUDGET`、`ERROR_REASONS`（P01–P11 + LOW）。
- `utils.js`：新增 `localDateKey()`（本地时区，修复 UTC 跨日误差）。
- `storage.js`：新增 fsrs / mistakeLedger / dailyLog / diagnostic 读写。
- `common.css`：新增 `.cnpt-dayplan` / `.dp-*` 样式。

**修改的角色页**
- H5 与学生版：接入 3 个新组件；练习答错弹错因探针（P01–P11 + LOW 二级）；答错登记重测；今日学习台渲染；预检/重测/盲测弹层；AI 生成题目标注「未经学科教师审核」。
- `docs/diagnostic-center.html`：新增「🔄 诊断闭环机制」说明卡（含只读闭环队列状态）。

**关键决策**
- 「算」与「画」分离：依赖/路径/判分走确定性逻辑；AI 只生成展示性增强字段并显式声明。
- 首做与重测分离：重测/盲测不计入首做正确率（借鉴《词光》）。
- 错题两步闭环 + 预检跳课（借鉴《AI 自学数学账本实操》）。
- 探针「观察/退役/顽固」状态机未完整落地，当前仅 FSRS 卡片级休眠退役；错因维度仍是标注 + 统计（列为 P2）。

**验证**
- `node scripts/validate.mjs` ✓；`node build.mjs --standalone --target=h5`（436 引用）✓；`--target=student`（439 引用）✓。
- 浏览器实测：h5 与学生版的今日学习台、错因探针、重测/盲测/预检全流程均通过（详见反哺报告第四节）。

**构建坑（重要）**
- `build.mjs --target` 使用**入口 id**（如 `student`），不是目录名（`student-web`）；写错会静默跳过构建。

### 9.14 v2.1 学习工具包：第二批四篇文章借鉴反哺 ✅（2026-11-16）

**来源**
- 4 篇微信文章存档于 `docs/references/05~08-*.md`（《诗泉 免费古诗词 API 与自建诗库》《Marble Skill Taxonomy 微主题先修图谱》《四轮闯关背单词网页》《导图加会动的模型 高中数学自学》）。
- 逐篇方法论 → 落地对照表：`docs/四篇文章借鉴反哺报告-第二批.md`。

**新增文件**
- `PROVENANCE.md`：上游来源、四层授权表（ODbL 1.0 / CC BY-SA 4.0 / 课标上游 / MIT）、ODbL 衍生数据库澄清、规范署名与 SHA-256 版本锁。
- `scripts/compute-centrality.mjs`：枢纽度计算（1.0×入度 + 0.5×出度加权，归一化 0-1，4 位小数；4274/4275 填充，TOP1=ct_YW2S032）。
- `scripts/enrich-topics.mjs`：注入 `MODEL_REFS`（14 主题）与 `WORD_LISTS`（6 主题 18 词，取自 description 原文）。
- `shared/js/components/visual-models.js`：4 个 SVG 交互模型（fraction-bar / number-line / triangle-angle / cube-net）。
- `shared/js/components/spelling-quest.js`：四轮拼写闯关（认形→元音→骨架→默写；「第 N 个字母不对，还有 X 次机会」；3 次失败/看答案才揭示）。
- `shared/js/components/poetry.js` + `docs/poetry.html`：40 首示例库 + 搜索/随机/飞花令（页脚声明未内嵌近 40 万首全量库）。

**修改的共享层**
- `schema/topics.schema.json`：`centrality` 口径更新；新增 `wordList`、`modelRef`。
- `node-detail.js`：枢纽标签（⭐/🔗）、`showModels`、模型区块、家长费曼区块（🗣️ 让孩子讲给你听）；**修复 storage 误用命名空间的既有缺陷**。

**修改的角色页**
- 学生版：详情接入模型 + 「🔤 拼写闯关」按钮（接入 FSRS、加星、统计）。
- 家长版/H5：引入 `visual-models.js`（家长版详情渲染模型；H5 详情走独立渲染，模型为共享储备）。
- `web/index.html`：修正构建模板 CSS 路径（`../shared/` → `shared/`），消除产物断链。

**自测中发现并修复的缺陷（如实记录）**
1. `spelling-quest.js check()` 漏跳过「未遮挡槽」→ 填对也误报「第 1 个字母不对」；已改 `s.fixed || !state.mask[i]` 并同步标红/揭示/过关循环。
2. 第 2 关掩码方向写反（遮辅音露元音）→ 已改「露辅遮元」。
3. `node-detail.js` 误把 `CNPT.storage`（命名空间 `{StorageManager, create}`）当实例调用 `getTopicStatus` → 家长版/教师版详情一直无法打开；已改为接收 `storage` 实例参数并兜底 `create('parent')`。

**验证**
- `node scripts/validate.mjs` ✓（4275/4191，DAG 无环）；`node scripts/build-standalone.mjs` ✓（9430 KB）；`node scripts/build-split-standalone.mjs` ✓；`node scripts/validate-build.mjs` ✓（141 引用 0 问题）。
- 浏览器实测：学生版拼写四轮 + 模型联动（×2→2/8、÷2→1/4）；家长版详情/枢纽标签/费曼/模型；docs/poetry.html 随机《静夜思》+ 飞花令「春」11 句；student standalone 产物组件就绪。

**构建脚本（修正此前的错误结论）**
- ⚠️ 先前记录「不存在 `build.mjs`」是**误判**（只在 `scripts/` 目录查找）。`build.mjs` 位于**项目根目录**，是统一构建脚本：生成 `shared/data/*.js` + 15 个角色独立 HTML（`--target=<入口id>` 可单角色构建）。
- 辅助脚本：`scripts/build-standalone.mjs`（web 通用版主产物）、`scripts/build-split-standalone.mjs`（拆分版）、`h5/build-h5.mjs`（H5 专用，含增强字段）。
- 数据流水线：`merge.mjs` → `compute-centrality.mjs` → `enrich-topics.mjs` → `generate-dependencies.mjs` → `generate-manifest.mjs` → `validate.mjs`。

**乱码修复（2026-11-16 用户反馈「再学新」列表乱码）**
- 现象：standalone 产物「再学新」等数据字段显示 `é—®å€™` 类乱码；源码页与外部 JS 正常。
- 根因：旧构建把 15MB 数据脚本注入在 `<head>`/`<meta charset>` **之前**，浏览器 prescan 前 1024 字节找不到 charset，回退 **Windows-1252** 解码 UTF-8 字节 → 中文全乱。
- 修复（4 个构建脚本统一）：① 数据脚本改注入到 `<head>` 内、`<meta charset>` **之后**；② 写文件统一加 **UTF-8 BOM**；③ `h5/build-h5.mjs` 补 `../shared/`→`shared/`、`css/`→`h5/css/`、`js/`→`h5/js/` 路径修正，并内嵌 enhanced 字段（此前会覆盖 build.mjs 产物且缺 enhanced、路径断链）。
- 验证：h5 产物 4275 节点、`#daily-plan` 16 个名称全中文；student/parent 产物正常；`validate-build.mjs` 141 引用 0 问题。

### 9.15 v2.2 开源业界借鉴反哺：FSRS-4 内核 + 图谱聚合 + 依赖评测 ✅（2026-11-16）

**来源与调研**
- 开源调研（16 项分类清单，含 FSRS、知识图谱、可视化、间隔复习等方向）；本批落地三项优先改进。
- FSRS-4：算法与 17 参数默认值参照 open-spaced-repetition 社区（fsrs4anki / fsrs-rs）与 FSRS-4 论文公式；本项目按公式自研实现，未引入其代码。
- K12-KGraph：多关系类型设计借鉴（`relationType`）；其仓库未逐条核实，仅作方法参照。
- sigma.js / cytoscape：调研结论为本项目 4275 节点规模无需引入更重渲染器，沿用 D3 + 聚合降级即可（未引入 vendor）。

**新增文件**
- `shared/js/components/fsrs-scheduler.js`：FSRS-4 内核（17 参数 w0..w16；S/D/R；`R(t)=(1+FACTOR*t/S)^DECAY`，FACTOR=19/81，DECAY=-0.5；Again/Hard/Good/Easy 四档；间隔 `I = S/FACTOR*(r^(1/DECAY)-1)`）。零依赖，浏览器/Node 通用。
- `data/fsrs-params.json`：参数载体（构建时注入 `window.__CNPT_FSRS_PARAMS__`；缺失则引擎用内核默认）。
- `scripts/calibrate-fsrs.mjs`：用导出复习日志做 17 参数校准（log loss 目标；样本 ≥50 且 ≥5 知识点，不足 exit 2）。
- `scripts/test-fsrs-engine.mjs`：11 项回归测试。
- `scripts/evaluate-dependencies.mjs`：依赖质量评测（重复边 error / 对称边 warn / 度分布 / 跨学科年级学段 / hard-soft / reason 覆盖 / 拓扑最长链 / 入度 Top10 / 阈值告警；退出码 0/1/2）。

**修改的共享层**
- `fsrs-engine.js`：混合调度（学习阶段 6 步 20分钟~30天 → 之后 FSRS 稳定性算间隔）；存储 v2→v3 迁移（补 stability/difficulty/reps，**nextReview 不变**）；`getCard` 字段规范化；export/import v3；`CNPT.fsrs.setParams/getSchedulerInfo`。
- `pc-graph.js`：节点数 > `maxNodes`（`constants.MAX_RENDER_NODES.aggregate=900`）且非下钻 → 学科聚合超级节点（`__agg__<学科>`，count/weight）；点击下钻 `drillDown` / 返回 `backToOverview` / `getViewInfo`；大图降级（边>500 只画 hard、标签阈值 300→500、碰撞半径自适应、模拟默认 8s 停止）。
- `constants.js`：`MAX_RENDER_NODES = { core: 1300, detail: 900, aggregate: 900 }`。
- `schema/dependencies.schema.json`：新增可选 `relationType`（prerequisite/related/visual/experiment/assessment）。
- `scripts/validate.mjs`：新增重复边检测（error）、对称边对报告（warn）、`relationType` 枚举校验。

**构建链路**
- `build.mjs` / `build-standalone.mjs` / `build-split-standalone.mjs` / `h5/build-h5.mjs` 均注入 `window.__CNPT_FSRS_PARAMS__`；`student-web/index.html` 与 `h5/index.html` 在 fsrs-engine 前引用 `fsrs-scheduler.js`；`build.mjs` 步骤 1 生成 `shared/data/fsrs-params.js`。

**关键决策**
- 混合调度而非纯 FSRS：保留首学体验（学习阶段短间隔）与业务规则（休眠 3 次、60 天抽检、75 分钟预算、错因台账、首做分离），FSRS 只接管复习期间隔。
- 迁移不改 `nextReview`，避免老用户排期突变；`stability` 由 round 推算 `BASE_INTERVALS[round]/DAY_MS`。
- 聚合阈值 900：全量 4275（core 过滤后 1300/1455）远超 D3 交互流畅区；聚合后 11 个学科节点，下钻后单学科 ≤837。

**验证（实测）**
- 数据：`validate.mjs` ✓（重复边 0 / 对称 0）；`evaluate-dependencies` ✓ 无告警（4191 唯一边、hard 2810/soft 1381、reason 100%、孤立点 1、平均入度 0.98、最大入度 3、最大出度 8、跨学科 0、跨年级 195、跨学段 88 全 soft、最长链 141）。
- FSRS：`test-fsrs-engine` 11/11 ✓；浏览器实测 student standalone：首做独立答对 → `nextReview` +20 分钟、`stability=13.8`、`difficulty=1`、`mode=fsrs-v4-hybrid`、`storageVersion=3`、17 参数生效；`document.characterSet=UTF-8`。
- 图谱：教师版 standalone 实测聚合 11 节点（数学 837 / 语文 137 / 英语 224 / …）→ 点击数学下钻 837 节点 +「← 返回学科总览」→ 返回恢复 11 节点；家长版 337 节点标签正常显示。
- 构建：`build.mjs --standalone`（15 产物 + 445 引用）✓；`h5/build-h5` ✓；`build-standalone` ✓（9430 KB）；`build-split-standalone` ✓；`validate-build` 143 引用 0 问题。

**自测中发现并修复的缺陷（如实记录）**
1. `pc-graph.js` 下钻后 `render()` 覆盖 `_lastTopics` → 返回总览失败（停在数学 837）；已改为仅非下钻态保存快照。
2. 标签阈值 300 在家长版 337 节点时整图无标签；已放宽到 500。
3. FSRS 测试间共享内存 localStorage 导致卡片状态污染；测试脚本已加 `resetRole` 清理。
4. 手工构造 v2 卡片缺 `confidenceHistory` 导致 `push` 崩溃；`getCard` 已补字段规范化。

**已知边界（诚实记录）**
- FSRS 参数当前为 FSRS-4 默认值（`calibrated=false`）；需用真实复习日志跑 `calibrate-fsrs.mjs` 才是正式校准。
- `relationType` 仅 schema/validate 就绪，数据尚未使用（全部按 prerequisite 口径）。
- 聚合视图为 PC SVG 方案；H5 Canvas 未改（H5 有独立渲染与筛选）。
- sigma.js / cytoscape 未引入（调研结论：当前规模不需要）。

### 9.16 v2.3 开源业界借鉴反哺：诊断离线评测 + 可解释边 + 模型升级/FSRS-6 评估 ✅（2026-11-17）

**来源与调研**
- 调研截止 2026-11-17，聚焦第三批遗留的三个重点难点；清单与证据见 [docs/开源项目借鉴反哺报告-第四批.md](开源项目借鉴反哺报告-第四批.md)。
- pyBKT（CAHLR/pyBKT）：BKT 四参数 + AUC/MAE 校准口径；pyKT（pykt-team/pykt-toolkit，MIT）：留出评估与可复现基准方法论。均为方法参照，**未引入代码**。
- Manim（ManimCommunity/manim）：分步演示思路，用于交互模型的「自动演示」。
- AntV G6：分层 DAG/Combo 折叠候选，结论**暂不引入**（当前规模用 D3 + 聚合降级足够）。
- fsrs-rs（FSRS-6 官方 Rust 实现）：公式与 17→21 迁移规则参照，**未引入代码**。

**P1 诊断引擎离线评测（新增）**
- `scripts/evaluate-diagnostic.mjs` + `reports/diagnostic-benchmark.json`：合成数据（种子 42，3000 名学生）下引擎 gap 检测（无噪声 F1 1；8% 噪声 F1 0.952；分学科数学 0.9551/语文 0.941/科学 0.94/英语 0.9547）、BKT 掌握概率校准（65 主题/195,000 观测，AUC 0.8186、MAE 0.2837）、题目区分度（basic 0.7194/medium 0.6025/hard 0.4831）。
- 告警：735 道诊断题中 189 个 topicId 不在 topics.json（孤儿引用，待清理）。

**P2 可解释边 + 反向链接（新增）**
- `scripts/enrich-edge-explanations.mjs`：4191/4191 边派生 `category`（九类）/`explain`/`explainSource`（rule-derived）；`validate.mjs` 三条 check + 分布报告；schema 同步 `additionalProperties:false`。
- `node-detail.js`：前置链路 chip + 原因 + 「N 个直接前置 · 不补会听不懂」/「N 个 · 有基础更轻松」；后续「被 N 个知识点依赖」，>5 个折叠。
- `shared/js/core/indices.js`：edge 构造补 `category/explain/explainSource`（浏览器端 chip 不显示的根因修复）。
- 浏览器实测（家长版 standalone）：ct_SX2S020 chip 3 个 + 副标题正确；ct_YW2S032（8 后续）折叠文案正确。

**P3 交互模型 + G6 + FSRS-6（新增/升级）**
- `visual-models.js` 新增 `angle-protractor`（量角器 + 自动演示 0°→180°）与 `decimal-grid`（十乘十方格 + 演示 0→0.99）；模型清单 6 个、挂接 14 主题（`enrich-topics.mjs` MODEL_REFS）。
- 动画基础设施：`createAnimHost()`（rAF/定时器统一登记，stop 一次销毁）、`createAnimRef()`；`render()` 开头 `stopActiveAnim()`；`node-detail.js` 组装前 `visualModels.stop()`。浏览器 mock 验证：点击演示注册 1 个 rAF/1 个 setInterval，stop 后各 cancel/clear 1 次，切换知识点 stop 调用 3 次。
- `scripts/evaluate-fsrs-v6.mjs` + `reports/fsrs-v6-evaluation.json`：按 fsrs-rs 官方公式实现 FSRS-6（21 参数）与 17→21 迁移；两环境平均 logLoss FSRS-4 0.2691 / FSRS-6 官方 0.2592 / 迁移版 0.2798；RMSE 0.0817/0.0436/0.0849；AUC 0.5468/0.5149/0.5242。结论：FSRS-6 官方默认最优但**未校准**，建议影子运行 + ≥50 条真实日志校准后再切换；**线上仍 FSRS-4**。

**关键决策**
- 诊断评测用合成口径（种子固定可复现），明确标注「不代表真实学生表现」。
- 可解释边先做规则派生（rule-derived），人工精修（curated）列为后续。
- G6 暂不引入；FSRS-6 只评估不切换。
- 新增动画必须带销毁路径（PLAYBOOK 4.2）。

**验证（实测）**
- 数据：`validate.mjs` ✓（可解释边 4191/4191）；`evaluate-dependencies` ✓；`evaluate-diagnostic` ✓（1 条孤儿告警）；`evaluate-fsrs-v6` ✓；`test-fsrs-engine` 11/11 ✓。
- 构建：`build.mjs --standalone` / `build-standalone` / `build-split-standalone` / `validate-build` 全 EXIT=0。
- 浏览器：家长版 standalone 详情页 chip/折叠/两个新模型渲染与动画销毁均通过（mock rAF/定时器验证）。

**已知边界（诚实记录）**
- 诊断题 189 个孤儿 topicId 未清理，诊断覆盖 384 个主题。
- 可解释边 100% 为规则派生，未经人工逐条审核。
- FSRS-6 未校准、未切换；G6 未引入。
