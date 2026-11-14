/* ============================================================
   LIFE OS â€” service worker
   App shell is cached for offline use; the AI Chef proxy is
   always network-only so it never serves a stale suggestion.
   ============================================================ */
const VERSION = 'lifeos-v1.3.28';
const SHELL = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './js/core.js',
  './js/food.js',
  './js/gym.js',
  './js/study.js',
  './js/profile.js',
  './js/schedule.js',
  './js/init.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith('/api/chef') || url.pathname.includes('/api/')) return;

  /* navigations: network first, fall back to the cached shell */
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((cache) => cache.put('./index.html', copy)).catch(() => {});
            return res;
          }
          return caches.match('./index.html').then((hit) => hit || res);
        })
        .catch(() => caches.match('./index.html').then((hit) => hit || caches.match('./')))
    );
    return;
  }

  /* static assets: cache first, refresh in the background */
  event.respondWith(
    caches.match(request).then((hit) => {
      if (hit) {
        fetch(request)
          .then((res) => { if (res && res.ok) caches.open(VERSION).then((cache) => cache.put(request, res.clone())); })
          .catch(() => {});
        return hit;
      }
      return fetch(request).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copy)).catch(() => {});
        }
        return res;
      });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') self.skipWaiting();
});


