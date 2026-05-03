/**
 * C-SYNC SOVEREIGN SERVICE WORKER v76.0
 * Features: Stealth Caching, Offline Persistence, Instant Boot.
 * Developed by: M. Thrinadh
 */

const CACHE_NAME = 'csync-v76-sovereign';
const ASSETS_TO_CACHE = [
  'mobile.html',
  'manifest.json',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://unpkg.com/html5-qrcode',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=Orbitron:wght@700;900&display=swap'
];

// 1. INSTALL: Build the local fortress
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('C-Sync: Secure Shell Cached.');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. ACTIVATE: Purge legacy data
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('C-Sync: Purging Legacy Cache.');
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. FETCH: Network-First for Data, Cache-First for UI
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // RULE: Never cache real-time API calls to Google Apps Script
  if (url.includes('script.google.com')) {
    return event.respondWith(fetch(event.request));
  }

  // STRATEGY: Cache-First for UI assets (Speed)
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        // If everything fails (offline), return the cached mobile.html
        if (event.request.mode === 'navigate') {
          return caches.match('mobile.html');
        }
      });
    })
  );
});
