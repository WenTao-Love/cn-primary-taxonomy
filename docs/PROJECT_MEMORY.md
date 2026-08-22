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

### 9.5 待修复（未解决）

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
