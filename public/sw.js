// Service Worker resiliente para Arcor Tycoon: El Dulce Imperio (PWA Offline)
const CACHE_NAME = 'arcor-tycoon-v2';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.svg',
  './icon-512.svg',
  './arcor_logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // 1. Navegaciones principales: Network-First (para evitar index.html desactualizado tras deploy)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkResp) => {
          if (networkResp && networkResp.status === 200) {
            const copy = networkResp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
          }
          return networkResp;
        })
        .catch(() => {
          return caches.match('./index.html').then((cached) => cached || caches.match('./'));
        })
    );
    return;
  }

  // 2. Assets estáticos, JS, CSS, Fuentes e Imágenes: Cache First con Runtime Caching
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        // En background revalidar si es posible
        fetch(req)
          .then((networkResp) => {
            if (networkResp && networkResp.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(req, networkResp));
            }
          })
          .catch(() => {
            // Silenciar errores de red en modo offline
          });
        return cachedResponse;
      }

      // Si no estaba en caché, buscar en red y guardar en caché
      return fetch(req)
        .then((networkResp) => {
          if (networkResp && (networkResp.status === 200 || networkResp.type === 'opaque')) {
            const copy = networkResp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return networkResp;
        })
        .catch((err) => {
          console.warn('[SW] Recurso offline no disponible:', req.url);
          throw err;
        });
    })
  );
});
