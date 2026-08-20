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
- 技术栈：Node.js + JSON + D3.js
- 主要交付物：
  - `data/topics.json`
  - `data/dependencies.json`
  - `cn-primary-taxonomy.html`
  - `cn-primary-taxonomy-split.html`

## 3. 已形成的长期决策

### 3.1 数据结构方向

- 项目已经从“主节点图谱”演进为“主节点 + 子节点 + 练习链 + 测评任务 + 评价框架”的结构
- 数学资源治理已经从聚合检索入口演进到：
  - `resourceId`
  - `resourceGroupKey`
  - `resourceUnitKey`
  - `externalWorkId`

### 3.2 页面交互方向

- 搜索、筛选、状态提示统一收敛到右侧边栏
- 主画布只承担图谱浏览，不再承载浮层式密集控件
- 年级 / 学科 / 版本筛选统一走可搜索的多选下拉

### 3.3 性能治理方向

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
- `docs/SHENZHEN_G2_TEACHER_CALIBRATION.md`：教师校准专项说明

## 7. 当前推荐接手顺序

1. 先看 README
2. 再看 PROJECT_RULES
3. 再看 PROJECT_SKILL_PLAYBOOK
4. 再看本文件
5. 最后看 DESIGN 和脚本实现

## 8. 未来继续扩展时优先记住

- 优先做“高频、高价值、高准确度”的扩展
- 优先复用已有字段和展示结构
- 优先消灭资源泄露、内存泄露、IO 泄露、CPU 常驻空转
- 不要为了短期好看，牺牲长期可维护性
