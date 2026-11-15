# APK安装完整指南

> 目标：将小学教育知识图谱项目打包成安卓APK，安装到雷电模拟器

---

## 当前状态

✅ **本地服务器已启动**：`http://localhost:8080`
✅ **雷电模拟器已连接**：`127.0.0.1:5555`
✅ **诊断中心已在模拟器浏览器中打开**

由于缺少Android SDK，暂时无法构建APK。以下是完整的安装步骤：

---

## 方案一：通过雷电模拟器浏览器使用（立即可用）

### 步骤1：启动本地服务器

在电脑命令行中运行：
```bash
python scripts/start-local-server.py
```

### 步骤2：在雷电模拟器中打开浏览器

1. 打开雷电模拟器
2. 启动浏览器（Chrome）
3. 访问：`http://10.0.2.2:8080/docs/diagnostic-center.html`

### 步骤3：添加到书签

将页面添加到书签，方便下次访问。

---

## 方案二：构建APK（需要Android SDK）

### 步骤1：安装Android Studio

1. 下载Android Studio：
   - 官网：https://developer.android.com/studio
   - 下载地址：https://redirector.gvt1.com/edgedl/android/studio/install/2022.3.1.20/android-studio-2022.3.1.20-windows.exe

2. 安装Android Studio
   - 运行安装程序
   - 选择"Standard"安装类型
   - 完成安装

### 步骤2：安装Android SDK

1. 打开Android Studio
2. 点击 `More Actions` → `SDK Manager`
3. 在 `SDK Platforms` 标签页：
   - 勾选 `Android 14.0 (API 34)`
   - 点击 `Apply` 下载

4. 在 `SDK Tools` 标签页：
   - 勾选 `Android SDK Build-Tools 34`
   - 勾选 `Android SDK Platform-Tools`
   - 点击 `Apply` 下载

### 步骤3：配置环境变量

1. 打开"系统属性" → "高级" → "环境变量"
2. 添加 `ANDROID_HOME`：
   ```
   C:\Users\Administrator\AppData\Local\Android\Sdk
   ```
3. 添加 `Path`：
   ```
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\build-tools\34.0.0
   ```

### 步骤4：构建APK

在项目目录中运行：
```bash
cd twa-project
gradlew assembleRelease
```

生成的APK在：`app/build/outputs/apk/release/app-release.apk`

### 步骤5：安装到雷电模拟器

```bash
adb install app/build/outputs/apk/release/app-release.apk
```

---

## 方案三：使用在线APK构建服务

### PWABuilder（推荐）

1. 访问：https://www.pwabuilder.com/
2. 输入PWA网址：`http://localhost:8080/docs/diagnostic-center.html`
3. 点击 `Package For Stores`
4. 选择 `Android`
5. 下载生成的APK

### AppsGeyser

1. 访问：https://appsgeyser.com/
2. 选择"From Website"
3. 输入网址：`http://localhost:8080/docs/diagnostic-center.html`
4. 点击"Create App"
5. 下载APK

---

## 方案四：使用Capacitor（需要Node.js）

### 步骤1：安装Capacitor

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### 步骤2：初始化项目

```bash
npx cap init "知识图谱" "com.example.knowledgegraph" --web-dir docs
```

### 步骤3：添加Android平台

```bash
npx cap add android
npx cap sync
```

### 步骤4：构建APK

```bash
npx cap open android
```

在Android Studio中：
1. 点击 `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
2. 生成的APK在 `android/app/build/outputs/apk/debug/`

---

## 常见问题

### Q1：雷电模拟器无法访问本地服务器？

A：请确保：
1. 本地服务器已启动
2. 使用 `http://10.0.2.2:8080` 而不是 `http://localhost:8080`
3. 防火墙允许8080端口

### Q2：APK安装失败？

A：请检查：
1. APK是否已签名
2. 模拟器是否已连接（`adb devices`）
3. 是否允许安装未知来源应用

### Q3：页面显示不正常？

A：请尝试：
1. 清除浏览器缓存
2. 使用Chrome浏览器
3. 检查网络连接

---

## 技术架构

- **前端**：HTML5 + CSS3 + JavaScript
- **数据**：JSON格式，4275个知识点
- **诊断引擎**：自适应难度 + 智能确认题
- **离线支持**：PWA + Service Worker

---

*最后更新：2026-08-27*
