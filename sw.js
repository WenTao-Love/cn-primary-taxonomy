/**
 * Service Worker for 小学教育知识图谱 PWA
 * 实现离线缓存，让平板可以离线使用
 */

const CACHE_NAME = 'knowledge-graph-v1';
const CACHE_VERSION = '1.0.0';

// 需要缓存的核心文件
const CORE_FILES = [
  '/',
  '/manifest.json',
  '/docs/weekly-newsletter.html',
  '/docs/faq-search.html',
  '/docs/diagnostic-center.html',
  '/docs/exam-review.html',
  '/docs/manager-dashboard.html',
  '/data/topics.json',
  '/data/dependencies.json',
  '/data/learning-paths.json',
  '/data/diagnostic-questions.json',
  '/data/cache-parent-faq.json',
  '/data/cache-teacher-lessons.json',
  '/data/curriculum-standards.json',
  '/data/clusters.json',
  '/data/topics-enhanced-fields.json',
  '/data/topics-enhanced-fields-extra.json',
  '/scripts/diagnostic-engine.js'
];

// 需要缓存的所有周刊文件
const WEEKLY_FILES = [
  '/data/weekly-parent-001.json',
  '/data/weekly-parent-002.json',
  '/data/weekly-parent-003.json',
  '/data/weekly-parent-004.json',
  '/data/weekly-parent-005.json',
  '/data/weekly-parent-006.json',
  '/data/weekly-parent-007.json',
  '/data/weekly-parent-008.json',
  '/data/weekly-parent-009.json',
  '/data/weekly-parent-010.json',
  '/data/weekly-parent-011.json',
  '/data/weekly-parent-012.json',
  '/data/weekly-teacher-001.json',
  '/data/weekly-teacher-002.json',
  '/data/weekly-teacher-003.json',
  '/data/weekly-teacher-004.json',
  '/data/weekly-teacher-005.json',
  '/data/weekly-teacher-006.json',
  '/data/weekly-teacher-007.json',
  '/data/weekly-teacher-008.json',
  '/data/weekly-teacher-009.json',
  '/data/weekly-teacher-010.json',
  '/data/weekly-teacher-011.json',
  '/data/weekly-teacher-012.json'
];

const urlsToCache = [...CORE_FILES, ...WEEKLY_FILES];

// 安装事件：缓存核心文件
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching core files...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] Core files cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Cache failed:', error);
      })
  );
});

// 激活事件：清理旧缓存
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  ).then(() => {
    console.log('[SW] Service Worker activated');
    return self.clients.claim();
  });
});

// 获取事件：缓存优先，网络回退
self.addEventListener('fetch', event => {
  // 只处理GET请求
  if (event.request.method !== 'GET') return;
  
  // 忽略chrome-extension等非http请求
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // 缓存命中，直接返回
        if (cachedResponse) {
          console.log('[SW] Cache hit:', event.request.url);
          return cachedResponse;
        }

        // 缓存未命中，从网络获取
        console.log('[SW] Cache miss, fetching:', event.request.url);
        return fetch(event.request)
          .then(response => {
            // 检查响应是否有效
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 缓存新资源（仅缓存同源资源）
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            console.error('[SW] Fetch failed:', error);
            // 返回离线页面（如果有）
            if (event.request.mode === 'navigate') {
              return caches.match('/docs/weekly-newsletter.html');
            }
          });
      })
  );
});

// 消息事件：处理来自页面的消息
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME);
  }
});
