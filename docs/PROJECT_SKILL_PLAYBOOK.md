# CN-Primary-Taxonomy 团队 Skill 手册

## 1. 文档定位

本文件不是“项目规则”，而是“怎么做事”的操作手册。

适用对象：

- 新接手项目的同事
- 继续扩科、扩版本、补资源直链的开发者
- 负责图谱体验与性能优化的前端同学

## 2. 常见任务与推荐做法

## 2.1 扩一个新学科或新版本

推荐步骤：

1. 先明确是否属于主节点扩展、版本映射扩展、还是父子节点扩展
2. 先补生成脚本，再补 schema / validate
3. 再接入 `merge.mjs`
4. 再观察前端详情面板是否需要展示新字段
5. 最后更新 README / DESIGN / memory

不要直接在 `data/topics.json` 手改长期维护数据。

## 2.2 给数学补真实作品 ID 直链

推荐步骤：

1. 先确认目标是否真的是高频、高价值单元
2. 先检查现有资源是否还是 `unit-pack` 或聚合入口
3. 资源匹配必须至少限定到：
   - 学科
   - 教材版本
   - 年级
   - 节点名称
4. 若同名单元容易混淆，要再加上册次 / 单元语义约束
5. 新增 `externalWorkId` 后，重跑合并与校验

经验原则：

- 先补准，再补多
- 宁可保留映射位，也不要误挂直链

## 2.3 给非主科推广“父节点 + 子节点 + 练习链 + 评价框架”

推荐路径：

1. 先定义该学科的子节点类型
2. 再定义该学科的 `practiceChain`
3. 再定义 `assessmentTasks`
4. 最后落 `evaluationRubric`

建议优先保持和语文 / 科学 / 道法 / 劳动 / 体音美 / 信息科技现有模式一致。

## 2.4 优化图谱页面体验

优先级顺序：

1. 先消除遮挡
2. 再降低长挂负载
3. 再优化交互细节

当前推荐做法：

- 搜索、筛选、状态提示统一放到右侧边栏
- 年级 / 学科 / 版本统一用可搜索的多选下拉
- 图谱默认只画当前筛选子图
- 页面隐藏时销毁旧图，恢复时重建

## 2.5 处理“越挂越卡”

优先排查：

1. 是否存在旧 simulation 未释放
2. 是否存在 `tick` 持续写 DOM
3. 是否存在 `requestAnimationFrame` 未取消
4. 是否存在 zoom 事件重复绑定
5. 是否存在搜索、缩放、重绘未做防抖

## 3. 推荐工作流

### 3.1 数据层改动

```bash
node scripts/merge.mjs
node scripts/generate-dependencies.mjs
node scripts/generate-manifest.mjs
node scripts/validate.mjs
```

### 3.2 页面层改动

```bash
node scripts/build-standalone.mjs
node scripts/build-split-standalone.mjs
```

### 3.3 完整交付前

```bash
node scripts/merge.mjs
node scripts/generate-dependencies.mjs
node scripts/generate-manifest.mjs
node scripts/validate.mjs
node scripts/build-standalone.mjs
node scripts/build-split-standalone.mjs
```

## 4. 高风险点清单

### 4.1 资源治理高风险

- 同名节点跨教材版本串挂
- 用宽松关键词把“圆”挂到“圆柱圆锥”
- 把聚合入口误写成精准直链

### 4.2 图谱性能高风险

- 把控件重新放回主画布浮层
- 恢复全量节点默认渲染
- 新增动画但没有销毁逻辑
- 新增缓存但没有失效机制

### 4.3 文档高风险

- 数据已经变了，README 还写旧数字
- 交互已经变了，DESIGN 还写旧布局
- 团队已经形成新约束，但 memory 没更新

## 5. 新同学接手建议

建议按这个顺序熟悉项目：

1. `README.md`
2. `docs/PROJECT_RULES.md`
3. `docs/PROJECT_SKILL_PLAYBOOK.md`
4. `docs/PROJECT_MEMORY.md`
5. `docs/DESIGN.md`
6. `scripts/merge.mjs`
7. `scripts/validate.mjs`
8. `web/index.html`

## 6. 当前默认共识

- 体验优先于花哨
- 精准优先于覆盖
- 显式配置优先于隐式推断
- 结构复用优先于另起一套
- 任何会导致资源泄露、内存泄露、IO 泄露、CPU 常驻空转的实现，都不应进入长期方案
