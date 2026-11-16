# Marble Skill Taxonomy：把小学阶段「学什么」拆成 1591 个微主题与 3225 条先修关系

> 来源：微信公众号文章（作者未在正文署名）
> 原文链接：https://mp.weixin.qq.com/s/TnFR-DGUaQNecOeXyFEniw
> 抓取时间：2026-11-16（浏览器自动化抓取，仅保留正文文本）

Marble Skill Taxonomy 是一份开放的结构化「学习图谱」数据集：把小学/初年级阶段孩子要学的内容拆成 1591 个可教学的微主题，再用 3225 条有向无环的先修依赖把它们串成一张图，并对接多国课程标准。纯数据是 JSON，没有运行时，适合作为教育产品、学情诊断工具或课程推荐系统的底层知识库。

大多数课程数据要么是一份扁平的标准清单，要么被锁死在某个商业产品内部。前者看不出「先学什么、后学什么」，后者别人又拿不到。Marble 这份数据集接住的是中间那段：它把抽象的课程标准变成一张「连通的学习图」——每个节点是一个具体的、可教学的小点子（如「组句」「恒星的视亮度」），每条边是一条先修关系（「要懂 X，先得会 Y」）。官方把它定位为「what children learn」的结构化表达，由 Marble（withmarble.com）出品，当前版本 v1。它解决的不是「怎么教」，而是「教什么、以及这些内容之间的先后依赖」这一长期缺位的基础层。它把「教什么」这件事从各家的私有格式里解放出来，变成一份人人可校验、可复用的公共基础设施，任何团队都能在自己的产品里复用同一张底图。

## 核心能力

- **微主题图谱**：1591 个 topic，每个带一句话通俗描述、掌握度「证据标准」、类型（概念/程序/表征/语言/元认知）、所属学科与领域，以及大致年龄区间；节点按学科着色，高度代表年龄，一眼能看出某个年龄段在学哪些主题。
- **先修依赖图**：3225 条有向无环边，格式为「topicId 依赖 prerequisiteId」，每条边标注 hard/soft 强度并附一句原因，反向即可得到「解锁了哪些后续主题」，从而支持「补齐知识缺口」式的路径推荐。
- **课标对齐**：每个微主题都链接回它所蒸馏自的课程标准（NGSS、Common Core、英国国家课程等），通过 standards 字段用「课程代码」回溯，方便做跨国课标的横向对比。
- **教学研究**：覆盖科学 547 个、数学 504 个主题的教学建议、学习活动、反馈与评估指引，并显式标注「还有 540 个主题本版暂无研究」，缺漏是透明的而非隐藏的。
- **家长友好摘要**：176 条「学科×领域×年龄段」的一段式总结，把专业术语翻译成家长能读的句子。

这张图真正的价值在「依赖」而非「清单」。给定任意一个目标主题，顺着先修边往回走，就能得到一张完整的「学习前置路径」；反过来，从一个孩子已经掌握的主题出发往前推，就能列出「下一步可以解锁什么」。这正是自适应学习、学情诊断和课程推荐长期缺的那一层基础设施——它不替老师决定教法，只把「内容之间的先后」讲清楚。

## 环境与安装

纯数据，没有运行时、没有依赖，连 Python 都不需要。先把仓库克隆到本地：

```bash
git clone https://github.com/withmarbleapp/os-taxonomy
cd os-taxonomy
```

数据全部在 data/ 目录下，是 UTF-8 的 JSON；schema/ 里是配套的 JSON Schema，data/manifest.json 记录了各类计数与 SHA-256 校验和。换句话说，你拿到的不是一篇文档，而是一张可以被程序直接消费的图：节点、边、标准映射、家长摘要、教学研究各司其职，想做统计、检索还是可视化都只需读 JSON，不用解析任何非结构化文本。

五个核心文件彼此只用 id 关联：topics.json 是图节点，dependencies.json 是先修边，curriculum-standards.json 是原始课标，clusters.json 是家长摘要，teaching-research.json 是按 topicId 关联的教学研究（约 24 MB）。想确认自己拿到的数据和官方一致，跑仓库自带的校验脚本：

```bash
node scripts/validate.mjs
node --test scripts/teaching-research.test.mjs
```

预期信号：校验通过时终端不报错；若提示某文件 SHA 不匹配，说明 taxonomy 版本对不上，应回到对应的 v1 tag 重新取数。没有 Node 也不要紧，这是数据文件，任何能读 JSON 的语言都能直接用。

## 实操主路径

以「查某个主题的直接先修」为例，纯前端就能加载并关联：

```js
import topics from './data/topics.json' with { type: 'json' };
import deps from './data/dependencies.json' with { type: 'json' };

const byId = new Map(topics.topics.map(t => [t.id, t]));
const prereqs = deps.dependencies
  .filter(d => d.topicId === 'mt_N8CpN1EJrP')
  .map(d => byId.get(d.prerequisiteId).name);
```

预期输出：prereqs 是一个字符串数组，列出「mt_N8CpN1EJrP」这个主题在学之前必须先掌握的所有主题名（如「组句」可能先要求「区分完整句与碎片句」）。如果拿到空数组，先确认 topicId 拼写和大小写——id 是形如 mt_… 的稳定标识符，区分大小写，且一个主题可能根本没有先修（它就是某个学科的起点）。若想算出到某个主题所需的全部前置（而非仅直接先修），对上述过滤做一次广度优先遍历即可：把直接先修建入邻接表，从目标主题出发层层回退，直到没有更上游的主题；结果就是一份可排序的学习清单。官方没有内置这条命令，但用同样的 dependencies 数据十几行代码就能实现，比手写课程顺序可靠得多。

## 另外两条值得跟做的路径

**路径 A——把教学研究接到主题上。** 教学研究文件按 topicId 关联，但覆盖是部分的：

```js
import research from './data/teaching-research.json' with { type: 'json' };

const guidanceByTopic = new Map(research.records.map(r => [r.topicId, r]));
const guidance = guidanceByTopic.get('mt_N8CpN1EJrP'); // undefined：英语主题本版尚未覆盖
const activities = guidance?.learn.activities ?? [];
```

注意返回 undefined 并不等于「这个主题没法教」，而是本版 540 个主题暂无研究记录，缺漏在文件里是显式标注的。每条记录的字段很规整：pedagogy 是原始教学摘要，learn 是可移植的学习指引（含 activities、约束与复习笔记），assess 是诊断任务与错误模式，sources 给出来源声明，confidence 是作者自身置信度而非独立质量分。

**路径 B——用 standards 回溯课标。** 每个 topic 的 standards 字段是「课程代码」数组（如 ccss-ela:L.K.1f、uk-nc-2013:Eng.App2.Y1.Sent.1），对应 curriculum-standards.json 里的原始标准条目。想做「某个课标要求对应哪些微主题」的反查，遍历 topics 按 standards 过滤即可，适合生成课标对齐报告或合规清单。

## 关键实现

一个 topic 的字段很规整：id、type、subject、domain、name、description、ageRangeStart/End、centrality（中心度，越高说明它在图谱里越「枢纽」）、evidence（可观察的掌握证据列表）、assessmentPrompt（一句自然语言检测，含 {{name}} 占位符，展示前需替换或去掉）。依赖边的 strength 分 hard/soft，reason 说明为什么这条先修成立——hard 表示强依赖、基本绕不过，soft 表示有帮助但非必需。教学研究文件通过 topicFileSha256 与 topics.json 的字节严格绑定：只要 canonical 主题文件变化（哪怕 id 不变），就该重新生成研究投影，否则关联会错位。

提供了一个可交互的 3D 图谱（withmarble.com/curriculum）：每个点是一个微主题，颜色代表学科、纵向高度代表年龄、连线代表先修——centrality 高的主题在图里更「枢纽」，往往是打通多个后续内容的关键节点，做内容优先级排序时可以优先关注。把它和 dependencies 一起用，能把「该先教什么」从经验判断变成可计算的图问题。不过要注意 teaching-research.json 约 24 MB，线上加载建议按需读取或对 records 按 topicId 建索引，不要每次都把整文件读入内存，否则前端首屏会明显变慢。

关于授权要特别留意：这份数据是多授权层的。数据库整体（结构、id、topic↔topic 与 topic↔standard 关系）走 ODbL 1.0——研究和商用都免费，但需署名、且衍生数据库须保持开放；Marble 撰写的文字内容（描述、证据、原因等）走 CC BY-SA 4.0；而从第三方框架抽取的 curriculum-standards.json 不归 Marble 重新授权，遵循各自上游许可。官方特意澄清：ODbL 区分「衍生数据库」（扩展/修改图谱须保持开放）与「产出作品」（把图谱用进产品/模型/App 仍归你），所以你可以基于它做商业产品，只需把对图谱本身的改进回馈回去。这是它比「一次性抓取课标」更适合长期产品的关键。

## 边界与代价

不是教学大纲、也不是测评系统，只是一份知识图谱数据。适合做教育产品的底层知识库、课标对齐工具、个性化学习路径引擎，以及课程研究的分析数据源；不适合直接当教案或测评卷使用，也不应包含任何儿童个人数据。研究者引用时务必保留 ODbL 与 CC BY-SA 的署名与共享要求，把对图谱本身的修改回馈到开放数据库。

已知限制有几点：教学研究是 agent 撰写的，学习指引经过可移植性重写、由独立事实评审核对、再由第二个 agent 抽样，但明确声明是「研究启发式的提议，而非经实证验证的干预」，源标注也未重新抓取核实；覆盖是部分的（科学/数学较全，英语等 540 个主题暂无研究）。另外，语义向量、任何按儿童维度的用户数据都刻意未发布。官方版本为 v1，包含 1591 个主题、3225 条先修边、8 个学科（科学 547、数学 504、英语 286、历史 90、个人与社交发展 88、生活技能 37、计算机 21、学会学习 18）。任何使用都必须署名「Marble Skill Taxonomy (v1) · © Generative Spark, Inc. (Marble)」，并附上 PROVENANCE.md 里的上游声明；做商业产品时，对图谱本身的修改（新增/修订主题或依赖）要回吐到开放数据库。在持续集成里把 manifest.json 的 SHA-256 当作数据版本锁，每次拉取都比对，能避免「无声升级导致路径推荐失真」这类最难排查的线上问题，也方便在课标更新时做增量修订而非整体重来。

## 怎么开始

最快的入口是克隆仓库、用浏览器打开官方 withmarble.com/curriculum 交互式图谱，点任意一个概念就能顺着先修链追溯「学会它之前必须先懂什么」。工程上建议的下一步：先用 node scripts/validate.mjs 校验拿到的是 v1 原版数据，再挑一个你关心的学科，按上面的代码片段把 topics 与 dependencies 加载进来，做一个「给定目标主题、列出完整先修路径」的小工具——这比直接读扁平标准清单要有用得多，也更适合做个性化学习路径推荐。如果你在做教育类产品，建议把 topics/dependencies 作为「内容图谱」层、把 teaching-research 作为「教学提示」层分开存储：前者驱动路径规划，后者驱动练习与反馈生成，两层解耦后各自迭代数据会轻松很多，也更容易在不改动图谱结构的前提下补充教学研究。一个最小可行的起步是把 v1 数据直接落进你已有的图数据库或关系表，用 dependencies 建边、用 topics 建节点，再用两三条 Cypher 或 SQL 查询就能回答「学会 X 之前要过哪几关」——这比维护一份手工的章节顺序表稳得多，也方便随课标更新做增量修订。对于只想快速验证价值的团队，先拿「给定目标主题、列出完整先修路径」这一个查询做原型，就足够说明它能解决什么问题。

标签：#教育数据# #知识图谱# #开源数据集# #课程对齐# #教育科技#
