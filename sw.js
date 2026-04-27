/**
 * CSync v1.0 - Service Worker
 * Sovereign AI Caching Engine
 * Developed by: M. Thrinadh (https://linkedin.com/in/m3nadh)
 */

const CACHE_NAME = 'csync-v1-sovereign-cache';

// 1. ASSETS TO BE CACHED PERMANENTLY (Instant Load)
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/assets/css/csync-hud.css',
  '/assets/js/auth-engine.js',
  '/assets/js/cloud-sync.js',
  '/assets/js/scanner.js',
  '/assets/js/ui-manager.js',
  '/assets/audio/notification.mp3',
  '/assets/img/icon-512.png',
  '/manifest.json',
  // AI Vision Models (Pre-cache to ensure Face AI works offline)
  '/models/tiny_face_detector_model-weights.bin',
  '/models/face_expression_model-weights.bin',
  '/models/face_landmark_68_model-weights.bin',
  // Critical External CDNs (Cached for speed)
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://unpkg.com/html5-qrcode'
];

// 2. INSTALLATION: Build the Sovereign Vault
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('CSync: Initializing Sovereign Cache...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 3. ACTIVATION: Clean old data nodes
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 4. FETCH LOGIC: Cache-First, then Network (The "Speed" Strategy)
self.addEventListener('fetch', (event) => {
  // We do NOT cache the Google Apps Script POST requests (Attendance/Lab sync)
  if (event.request.method === 'POST') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version for instant UI load
        return cachedResponse;
      }
      
      // If not in cache, fetch from network
      return fetch(event.request).then((networkResponse) => {
        // Cache external scripts as they are requested (e.g., FontAwesome)
        if (event.request.url.startsWith('http')) {
           return caches.open(CACHE_NAME).then((cache) => {
             cache.put(event.request, networkResponse.clone());
             return networkResponse;
           });
        }
        return networkResponse;
      });
    }).catch(() => {
      // Offline Fallback for index page
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});

/**
 * CSync Autonomous System Message Handling
 */
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/assets/img/icon-512.png',
    badge: '/assets/img/icon-192.png',
    vibrate: [100, 50, 100],
    data: { url: data.url }
  };
  event.waitUntil(self.registration.showNotification('CSync Alert', options));
});