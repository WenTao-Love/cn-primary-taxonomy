# 知识图谱使用指南

## 当前状态

由于缺少Android SDK，暂时无法构建APK。但您可以通过以下方式使用：

### 方式一：通过雷电模拟器浏览器访问（推荐）

1. **启动本地服务器**
   ```bash
   python scripts/start-local-server.py
   ```

2. **在雷电模拟器中打开浏览器**
   - 打开雷电模拟器
   - 启动浏览器（Chrome）
   - 访问：`http://10.0.2.2:8080/docs/diagnostic-center.html`

3. **添加到书签**
   - 将页面添加到书签，方便下次访问

### 方式二：使用PWA模式（推荐）

1. **在电脑浏览器中打开**
   - 访问：`http://localhost:8080/docs/diagnostic-center.html`

2. **安装为PWA**
   - Chrome浏览器会提示"安装应用"
   - 安装后可以从桌面启动

### 方式三：构建APK（需要Android SDK）

如果您想构建APK，需要先安装Android SDK：

1. **下载Android Studio**
   - 访问：https://developer.android.com/studio
   - 安装Android Studio

2. **安装SDK**
   - 打开Android Studio
   - 进入 SDK Manager
   - 安装 Android SDK Platform 34
   - 安装 Android SDK Build-Tools 34.0.0

3. **构建APK**
   ```bash
   cd twa-project
   ./gradlew assembleRelease
   ```

4. **安装到雷电模拟器**
   ```bash
   adb install app/build/outputs/apk/release/app-release.apk
   ```

---

## 功能说明

### 诊断中心

- **搜索诊断**：输入知识点名称进行诊断
- **按年级诊断**：选择学科和年级，测试整册
- **智能出题**：根据答题情况自动调整难度
- **薄弱点分析**：精准定位学习薄弱点
- **学习路径**：生成个性化学习路径

### 根因诊断（v2.3 新增）

- **入口**：学生版今日学习台 / 节点详情「🔍 根因诊断」；H5 底部导航「学习」页 `#btn-rcd` 或节点详情按钮
- **流程**：选目标考点 → 逐题作答（答错自动出确认题）→ 报告 → 一键补学
- **三态判定**：答错且确认题也错 = 薄弱；答错但确认题对 = 不稳；未轮到 = 未测
- **回溯**：薄弱点沿硬先修边往回查，揪出「病根」（根因），输出拓扑序补学路线
- **结果页**：统计 / 根因清单 / 不稳清单 / **根因路径图** / 补学路线 / 盲区再测 / 重新诊断 / 导出 JSON / 换目标
- **根因路径图**：目标橙框、根因/薄弱红框、不稳黄底；hard 实线、soft 虚线；按拓扑深度分层（目标在上、根因在下）
- **盲区再测**：当存在「未测」知识点时出现，点击后把未测点重新入队续测（题量上限自动放宽）
- **历史**：本地保存最近 20 次诊断（学生版与 H5 分开存储）

### 周刊浏览

- **家长版**：12期，覆盖学习习惯、学科辅导、心理健康
- **教师版**：12期，覆盖教学难点、教学设计、课堂管理
- **互动测验**：每期都有小测验

### FAQ搜索

- **529个问题**：覆盖13大类别
- **智能搜索**：关键词搜索
- **分类筛选**：按类别筛选
- **话术建议**：提供家长沟通话术

---

## 技术架构

- **前端**：HTML5 + CSS3 + JavaScript
- **数据**：JSON格式，4275个知识点
- **诊断引擎**：自适应难度 + 智能确认题
- **离线支持**：PWA + Service Worker

---

## 构建与自检（v2.3）

```bash
# 构建全部 standalone 产物
node build.mjs --standalone

# 校验产物引用完整性
node scripts/validate-build.mjs

# 依赖质量评测（重复边/对称边/度分布/最长链/枢纽）
node scripts/evaluate-dependencies.mjs

# FSRS 引擎回归测试（11 项）
node scripts/test-fsrs-engine.mjs

# 根因回溯诊断回归测试（20 项）
node scripts/test-root-cause-diagnosis.mjs
```

> 更完整的构建流水线、角色版本与学习系统说明见项目根目录 [README](../README.md)。

---

*最后更新：2026-11-17*
