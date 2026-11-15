# 安卓APK打包方案

> 目标：将小学教育知识图谱项目打包成安卓APK，安装到孩子的平板中使用

---

## 方案对比

| 方案 | 优点 | 缺点 | 推荐度 |
|---|---|---|---|
| **PWA + TWA** | 无需后端、可离线、更新方便 | 需要Android Studio | ⭐⭐⭐⭐⭐ |
| **Capacitor** | 功能完整、插件丰富 | 需要Node.js环境 | ⭐⭐⭐⭐ |
| **Cordova** | 成熟稳定、插件多 | 性能一般 | ⭐⭐⭐ |
| **Flutter** | 性能最好 | 需要重写UI | ⭐⭐ |
| **React Native** | 跨平台 | 需要重写UI | ⭐⭐ |

**推荐方案：PWA + TWA（Trusted Web Activity）**

理由：
1. 我们的项目已经是纯静态HTML，改造成PWA成本最低
2. TWA可以直接在Android上运行PWA，无需重写代码
3. 可以离线使用，适合平板学习场景
4. 更新方便，只需更新网页即可

---

## 方案一：PWA + TWA（推荐）

### 第一步：将项目改造为PWA

#### 1.1 创建 manifest.json

```json
{
  "name": "小学教育知识图谱",
  "short_name": "知识图谱",
  "description": "中国小学教育知识图谱，覆盖1-6年级全学科",
  "start_url": "/index.html",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#667eea",
  "orientation": "portrait",
  "icons": [
    {
      "src": "icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### 1.2 创建 Service Worker（sw.js）

```javascript
const CACHE_NAME = 'knowledge-graph-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/parent-web/index.html',
  '/teacher-web/index.html',
  '/diagnostic-center.html',
  '/weekly-newsletter.html',
  '/faq-search.html',
  '/data/topics.json',
  '/data/dependencies.json',
  '/data/learning-paths.json',
  '/data/diagnostic-questions.json',
  '/data/cache-parent-faq.json',
  '/data/cache-teacher-lessons.json',
  '/css/style.css',
  '/js/app.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
```

#### 1.3 在HTML中注册Service Worker

```html
<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered:', registration);
      })
      .catch(error => {
        console.log('SW registration failed:', error);
      });
  });
}
</script>
```

### 第二步：使用TWA打包APK

#### 2.1 环境准备

1. 安装 [Android Studio](https://developer.android.com/studio)
2. 安装 JDK 11+
3. 配置 Android SDK

#### 2.2 使用Bubblewrap生成项目

```bash
# 安装Bubblewrap
npm install -g @bubblewrap/cli

# 初始化项目
bubblewrap init --manifest https://your-domain.com/manifest.json

# 构建APK
bubblewrap build
```

#### 2.3 手动配置（如果Bubblewrap不可用）

创建 `build.gradle`：

```gradle
android {
    compileSdkVersion 33
    
    defaultConfig {
        applicationId "com.example.knowledgegraph"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0"
    }
}
```

### 第三步：签名和发布

```bash
# 生成签名密钥
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-alias

# 签名APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.jks app-release-unsigned.apk my-alias

# 对齐APK
zipalign -v 4 app-release-unsigned.apk app-release.apk
```

---

## 方案二：Capacitor（备选）

### 第一步：安装Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
```

### 第二步：初始化项目

```bash
npx cap init "知识图谱" "com.example.knowledgegraph" --web-dir dist
```

### 第三步：复制静态文件

```bash
# 创建dist目录，复制所有静态文件
mkdir -p dist
cp -r docs/* dist/
cp -r data/* dist/
cp -r css/* dist/
cp -r js/* dist/
```

### 第四步：添加Android平台

```bash
npx cap add android
npx cap sync
npx cap open android
```

### 第五步：构建APK

在Android Studio中：
1. 点击 `Build > Build Bundle(s) / APK(s) > Build APK(s)`
2. 生成的APK在 `android/app/build/outputs/apk/debug/`

---

## 方案三：快速方案（在线打包服务）

如果不想配置开发环境，可以使用在线打包服务：

| 服务 | 网址 | 说明 |
|---|---|---|
| **PWABuilder** | pwabuilder.com | 微软官方，一键生成 |
| **AppsGeyser** | appsgeyser.com | 免费，有广告 |
| **GoNative** | gonative.io | 支持PWA转APK |

### PWABuilder使用步骤

1. 访问 [pwabuilder.com](https://pwabuilder.com)
2. 输入PWA网址
3. 点击"Package For Stores"
4. 选择"Android"
5. 下载生成的APK

---

## 平板适配优化

### 1. 横屏支持

在 `manifest.json` 中设置：

```json
{
  "orientation": "any"
}
```

### 2. 触控优化

```css
/* 增大点击区域 */
.btn, .option, .grade-btn {
  min-height: 44px;
  min-width: 44px;
}

/* 禁用长按选中 */
* {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
}
```

### 3. 离线支持

确保所有数据文件都被缓存：

```javascript
const urlsToCache = [
  // 所有JSON数据文件
  '/data/topics.json',
  '/data/dependencies.json',
  '/data/learning-paths.json',
  '/data/diagnostic-questions.json',
  '/data/cache-parent-faq.json',
  '/data/cache-teacher-lessons.json',
  // 所有HTML页面
  '/index.html',
  '/diagnostic-center.html',
  '/weekly-newsletter.html',
  '/faq-search.html'
];
```

### 4. 性能优化

```javascript
// 数据懒加载
async function loadData(url) {
  const cached = await caches.match(url);
  if (cached) return cached.json();
  
  const response = await fetch(url);
  const cache = await caches.open('data-cache');
  cache.put(url, response.clone());
  return response.json();
}
```

---

## 推荐实施步骤

### 阶段一：PWA改造（1-2天）

1. 创建 `manifest.json`
2. 创建 `sw.js` Service Worker
3. 在HTML中注册Service Worker
4. 测试离线功能

### 阶段二：TWA打包（半天）

1. 安装Android Studio
2. 使用Bubblewrap生成项目
3. 构建APK
4. 签名APK

### 阶段三：平板测试（1天）

1. 安装到平板
2. 测试离线功能
3. 测试触控体验
4. 收集反馈

---

## 预期效果

- **APK大小**：约15-20MB（主要是JSON数据）
- **离线可用**：安装后可完全离线使用
- **更新方式**：更新网页后，重新打包APK
- **平板适配**：支持横竖屏、触控操作

---

*本方案由项目自动生成，最后更新：2026-08-27*
