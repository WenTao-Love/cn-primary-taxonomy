/*!
 * CN-Primary-Taxonomy · Service Worker
 * 提供离线缓存支持
 */
const CACHE_NAME = 'cnpt-cache-v1';

// 需要预缓存的核心文件
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './shared/css/tokens.css',
  './shared/css/common.css',
  './shared/js/core/constants.js',
  './shared/js/core/utils.js',
  './shared/js/core/data-loader.js',
  './shared/js/core/indices.js',
  './shared/js/core/search.js',
  './shared/js/core/path.js',
  './shared/js/core/storage.js',
  './shared/js/components/error-feedback.js',
  './shared/js/components/theme-manager.js',
  './shared/js/components/onboarding.js',
  './shared/js/components/search-history.js',
  './shared/js/components/bookmarks.js',
  './shared/js/components/node-detail.js',
  './shared/js/components/voice-search.js',
  './shared/js/components/share-card.js',
  './shared/js/graph/pc-graph.js'
];

// 安装：预缓存核心文件
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

// 激活：清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// 拦截请求：缓存优先，回退网络
self.addEventListener('fetch', event => {
  // 只处理 GET 请求
  if (event.request.method !== 'GET') return;

  // 跳过非 http(s) 请求
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        // 缓存命中，同时更新缓存
        fetch(event.request).then(response => {
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, response.clone());
            });
          }
        }).catch(() => {});
        return cached;
      }

      // 缓存未命中，请求网络
      return fetch(event.request).then(response => {
        // 缓存成功的响应
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      }).catch(() => {
        // 网络失败，返回离线页面
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return new Response('离线状态', { status: 503, statusText: 'Offline' });
      });
    })
  );
});
