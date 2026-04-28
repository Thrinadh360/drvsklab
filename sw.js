/**
 * CSYNC: SOVEREIGN SERVICE WORKER v105.0
 * Institution: Dr. V.S. Krishna Govt. Degree College (Autonomous)
 * Developed by: M. Thrinadh (https://linkedin.com/in/m3nadh)
 * 
 * Logic: Persistent Caching for Native Performance & Offline AI Vision.
 */

const CACHE_NAME = 'csync-v1-sovereign-vault';

// 1. ASSET REPOSITORY (The core files that make the app 'Native')
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './assets/css/csync-hud.css',
  './assets/js/ui-manager.js',
  './assets/js/cloud-sync.js',
  './assets/js/auth-engine.js',
  './assets/js/scanner.js',
  './assets/audio/notification.mp3',
  './assets/img/icon-512.png',
  './assets/img/college-logo.svg',
  // --- AI NEURAL MODELS (Crucial for Offline Face AI) ---
  './models/tiny_face_detector_model.bin',
  './models/tiny_face_detector_model.json',
  './models/face_expression_model.bin',
  './models/face_expression_model.json',
  './models/face_landmark_68_model.bin',
  './models/face_landmark_68_model.json',
  // --- EXTERNAL RUNTIMES (Cached for Zero-Latency) ---
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://unpkg.com/html5-qrcode',
  'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

// 2. INSTALLATION: Building the local database on the phone
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('CSync: Creating Sovereign Cache Vault...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 3. ACTIVATION: Purging old versions to prevent logic conflicts
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 4. FETCH ENGINE: Optimized Stale-While-Revalidate Strategy
self.addEventListener('fetch', (event) => {
  // IGNORE: Google Apps Script POST requests (must always be live)
  if (event.request.method === 'POST') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return from cache immediately for "Native App" speed
        // but fetch an updated version in the background
        fetch(event.request).then((networkResponse) => {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse);
          });
        });
        return cachedResponse;
      }
      
      // If not in cache, fetch from network
      return fetch(event.request).catch(() => {
        // OFFLINE FALLBACK: If network fails, show the index page
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

/**
 * CSYNC NATIVE NOTIFICATION HANDLER
 * Mimics WhatsApp/Telegram background alerts
 */
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { body: 'New Departmental Announcement' };
  const options = {
    body: data.body,
    icon: './assets/img/icon-512.png',
    badge: './assets/img/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'csync-alert',
    data: { url: './index.html' }
  };
  event.waitUntil(self.registration.showNotification('CSync | VSK GDC (A)', options));
});
