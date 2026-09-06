/**
 * MailCraft Studio - Progressive Web App (PWA) Offline Service Worker
 * Implements Cache-First / Stale-While-Revalidate caching for seamless offline usage
 */

const CACHE_NAME = 'mailcraft-v2.0.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './studio.html',
  './site.webmanifest',
  './favicon.ico',
  './assets/favicon.svg',
  './assets/apple-touch-icon.png',
  './assets/default-avatar.js',
  './assets/default-avatar.jpg',
  './css/studio.css',
  './css/components.css',
  './css/email-preview.css',
  './js/html2canvas.min.js',
  './js/zip-builder.js',
  './js/icons.js',
  './js/quotes.js',
  './js/presets.js',
  './js/preset-manager.js',
  './js/team-engine.js',
  './js/image-processor.js',
  './js/qr-vcard-engine.js',
  './js/banner-builder.js',
  './js/admin-tools.js',
  './js/linter.js',
  './js/signature-engine.js',
  './js/email-template-engine.js',
  './js/clipboard.js',
  './js/guides.js',
  './js/dot-matrix.js',
  './js/app.js'
];

// Install Event: Cache Core Offline Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('PWA Cache AddAll Warning (continuing):', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Stale-While-Revalidate / Cache-First strategy
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version immediately, fetch and update in background
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
        }).catch(() => {/* Offline fallback */});

        return cachedResponse;
      }

      // If not in cache, fetch from network and cache
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Fallback to offline page if available
        if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./studio.html');
        }
      });
    })
  );
});
