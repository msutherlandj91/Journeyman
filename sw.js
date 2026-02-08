const CACHE_NAME = 'journeyman-v1';
const RUNTIME_CACHE = 'journeyman-runtime';

const PRECACHE_URLS = [
  '/Journeyman/',
  '/Journeyman/index.html',
];

// Install: precache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate: cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for assets, network-first for API
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip Supabase API calls (need network)
  if (url.hostname.includes('supabase')) {
    event.respondWith(fetch(request));
    return;
  }

  // Cache-first for static assets
  if (request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'image') {
    event.respondWith(
      caches.match(request).then(cached => {
        return cached || fetch(request).then(response => {
          return caches.open(RUNTIME_CACHE).then(cache => {
            cache.put(request, response.clone());
            return response;
          });
        });
      })
    );
    return;
  }

  // Network-first for HTML
  event.respondWith(
    fetch(request)
      .then(response => {
        return caches.open(RUNTIME_CACHE).then(cache => {
          cache.put(request, response.clone());
          return response;
        });
      })
      .catch(() => caches.match(request))
  );
});

// Background sync for pending calculations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-calculations') {
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'RETRY_SYNC' });
        });
      })
    );
  }
});
