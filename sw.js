/**
 * MailCraft Studio - Progressive Web App (PWA) Offline Service Worker
 * High-reliability caching with Network-First navigation & Stale-While-Revalidate assets
 */

const CACHE_NAME = 'mailcraft-v1.1.1';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/studio',
  '/studio.html',
  '/site.webmanifest',
  '/favicon.ico',
  '/assets/favicon.svg',
  '/assets/apple-touch-icon.png',
  '/assets/default-avatar.js',
  '/assets/default-avatar.jpg',
  '/css/studio.css',
  '/css/components.css',
  '/css/email-preview.css',
  '/js/html2canvas.min.js',
  '/js/zip-builder.js',
  '/js/icons.js',
  '/js/quotes.js',
  '/js/presets.js',
  '/js/preset-manager.js',
  '/js/team-engine.js',
  '/js/image-processor.js',
  '/js/qr-vcard-engine.js',
  '/js/banner-builder.js',
  '/js/admin-tools.js',
  '/js/linter.js',
  '/js/signature-engine.js',
  '/js/email-template-engine.js',
  '/js/clipboard.js',
  '/js/guides.js',
  '/js/dot-matrix.js',
  '/js/app.js'
];

// Install: Pre-cache all essential core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`PWA: Pre-caching asset skipped: ${url}`, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate: Purge stale caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('PWA: Purging outdated cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Strategy depending on request type
self.addEventListener('fetch', (event) => {
  // Only handle GET requests with HTTP/HTTPS protocols
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  const url = new URL(event.request.url);

  // Strategy 1: HTML Document Navigations -> Network-First, fallback to Cache
  if (event.request.mode === 'navigate' || (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline / Network Failure Fallback
          const cached = await caches.match(event.request, { ignoreSearch: true });
          if (cached) return cached;

          // If navigating to studio
          if (url.pathname.includes('studio')) {
            const studioCached = await caches.match('/studio.html', { ignoreSearch: true }) || await caches.match('/studio', { ignoreSearch: true }) || await caches.match('./studio.html', { ignoreSearch: true });
            if (studioCached) return studioCached;
          }

          // Fallback to root/index
          const indexCached = await caches.match('/index.html', { ignoreSearch: true }) || await caches.match('/', { ignoreSearch: true }) || await caches.match('./index.html', { ignoreSearch: true });
          if (indexCached) return indexCached;

          return new Response('<!DOCTYPE html><html><head><meta charset="utf-8"><title>MailCraft Studio - Offline</title></head><body style="background:#07090b;color:#f8fafc;font-family:sans-serif;padding:40px;text-align:center;"><h2>MailCraft Studio</h2><p>You appear to be offline. Reconnect to access MailCraft Studio.</p></body></html>', {
            headers: { 'Content-Type': 'text/html' }
          });
        })
    );
    return;
  }

  // Strategy 2: Static Local Assets -> Cache-First with Network Revalidation (Stale-While-Revalidate)
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      }).catch(async () => {
        const fallback = await caches.match(event.request, { ignoreSearch: true });
        if (fallback) return fallback;
        return new Response('', { status: 408, statusText: 'Request Timeout' });
      })
    );
    return;
  }

  // Strategy 3: External CDNs (Google Fonts, etc.) -> Cache-First with fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return networkResponse;
      });
    }).catch(() => {
      return new Response('', { status: 503, statusText: 'CDN Resource Unavailable' });
    })
  );
});
