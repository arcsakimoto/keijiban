/**
 * Service Worker - ARCFEELGROUP連絡掲示板アプリ用
 * オフライン時にキャッシュからページを表示する仕組み
 * プッシュ通知の受信・表示処理
 */

const CACHE_NAME = 'keijiban-v3';

// 最初にキャッシュしておくファイル一覧
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Service Workerのインストール時（初回登録時）
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  // 新しいService Workerをすぐに有効にする
  self.skipWaiting();
});

// Service Workerの有効化時（古いキャッシュを削除）
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // すべてのタブで新しいService Workerを使う
  self.clients.claim();
});

// ネットワークリクエスト時の処理
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // APIリクエスト（Supabase等）はキャッシュしない
  if (request.url.includes('supabase.co') || request.method !== 'GET') {
    return;
  }

  // ネットワーク優先、失敗時はキャッシュから返す（Network First戦略）
  event.respondWith(
    fetch(request)
      .then((response) => {
        // 正常なレスポンスをキャッシュに保存
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // オフライン時はキャッシュから返す
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // HTMLページの場合、トップページのキャッシュを返す
          if (request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/');
          }
        });
      })
  );
});

// === プッシュ通知の受信処理 ===

// プッシュ通知を受け取った時の処理
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const title = data.title || '新しいお知らせ';
  const options = {
    body: data.body || '',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-192x192.png',
    data: {
      url: data.url || '/',
    },
    // 同じタグの通知は上書きされる（重複防止）
    tag: 'keijiban-notification',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(title, options).then(() => {
      // アプリアイコンにバッジ（数字）を表示する
      if (navigator.setAppBadge) {
        navigator.setAppBadge();
      }
    })
  );
});

// 通知をタップした時の処理（該当ページを開く＋バッジを消す）
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // アイコンのバッジ（数字）を消す
  if (navigator.clearAppBadge) {
    navigator.clearAppBadge();
  }

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    // 既に開いているタブがあればそこにフォーカス、なければ新しく開く
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
