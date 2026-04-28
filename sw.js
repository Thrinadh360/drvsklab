/**
 * CSYNC: SOVEREIGN SERVICE WORKER v110.0
 * Institution: Dr. V.S. Krishna Govt. Degree College (Autonomous)
 * Developed by: M. Thrinadh (https://linkedin.com/in/m3nadh)
 * 
 * Logic: Persistent Caching for Native Performance & Offline AI Vision.
 */

const CACHE_NAME = 'csync-sovereign-v110';

// 1. THE SOVEREIGN ASSET REPOSITORY
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './assets/css/csync-hud.css',
  './assets/js/config.js',
  './assets/js/ui-manager.js',
  './assets/js/cloud-sync.js',
  './assets/js/auth-engine.js',
  './assets/js/scanner.js',
  './assets/audio/notification.mp3',
  './assets/img/college-logo.svg',
  './assets/img/icon-512.png',
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
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Orbitron:wght@700;900&display=swap'
];

// 2. INSTALLATION: Building the Sovereign Cache
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('CSync: Initializing Sovereign Cache Vault...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 3. ACTIVATION: Purging Legacy Nodes
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

// 4. FETCH ENGINE: Stale-While-Revalidate Strategy
self.addEventListener('fetch', (event) => {
  // IGNORE: Google Apps Script API calls (must always be live)
  if (event.request.url.includes('script.google.com')) return;
  if (event.request.method === 'POST') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return from vault immediately for Native Speed
        // but refresh the cache in the background
        fetch(event.request).then((networkResponse) => {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse);
          });
        }).catch(() => {}); // Fail silently if offline
        
        return cachedResponse;
      }
      
      // If not in cache, fetch from network
      return fetch(event.request).catch(() => {
        // OFFLINE FALLBACK: If network fails, serve the index page
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

/**
 * CSYNC NATIVE NOTIFICATION HANDLER
 * Enables background alerts even when the PWA is closed
 */
self.addEventListener('push', (event) => {
  let data = { title: 'CSync Alert', body: 'New announcement from Dept of Computer Science.' };
  
  try {
    data = event.data.json();
  } catch (e) {
    data.body = event.data.text();
  }

  const options = {
    body: data.body,
    icon: './assets/img/icon-512.png',
    badge: './assets/img/icon-192.png',
    vibrate: [100, 50, 100],
    tag: 'csync-notification',
    data: { url: './index.html' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle Notification Click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('./index.html')
  );
});
