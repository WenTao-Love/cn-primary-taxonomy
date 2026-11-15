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

*最后更新：2026-08-27*
