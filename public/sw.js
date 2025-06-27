// Pubcraft PWA Service Worker
// Dynamic versioning and robust caching strategy

// Cache name with dynamic versioning
const CACHE_PREFIX = 'pubcraft-pwa-';
const CACHE_VERSION = new Date().toISOString().split('T')[0];
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_VERSION}`;

// Critical assets to precache
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/favicon.ico',
  '/placeholder.svg',
  '/robots.txt'
];

// Install event - precache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Precache critical assets
        return cache.addAll(PRECACHE_URLS)
          .then(() => self.skipWaiting()); // Activate immediately
      })
      .catch((error) => {
        console.error('Precaching failed:', error);
      })
  );
});

// Activation event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((existingCacheName) => {
          // Delete caches that are not the current version
          if (!existingCacheName.startsWith(CACHE_PREFIX) || 
              existingCacheName !== CACHE_NAME) {
            return caches.delete(existingCacheName);
          }
        })
      ).then(() => {
        // Take control of all pages immediately
        return clients.claim();
      });
    })
  );
});

// Fetch event - Network-First with Cache Fallback strategy
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests and chrome-extension requests
  if (event.request.method !== 'GET' || 
      event.request.url.startsWith('chrome-extension')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If network request is successful, cache the response
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            // If cache miss, return offline page
            return cachedResponse || caches.match('/offline.html');
          });
      })
  );
});

// Optional: Handle push notifications if implemented
self.addEventListener('push', (event) => {
  const title = 'Pubcraft Update';
  const options = {
    body: 'New changes are available. Refresh to update.',
    icon: '/favicon.ico',
    badge: '/favicon.ico'
  };
  
  event.waitUntil(self.registration.showNotification(title, options));
});
