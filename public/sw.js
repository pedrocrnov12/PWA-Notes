const CACHE_NAME = 'my-app-cache-v1';
const urlsToCache = [
  '/',  // Página principal
  

  '/manifest.json',
  '/1.png',

  // Aquí agrega más archivos que quieres almacenar en caché
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Archivos en caché');
        return cache.addAll(urlsToCache);
      })
  );
});
self.addEventListener('push', (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/1.png',
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Cache antigua eliminada:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si hay respuesta en caché, la devuelve
        if (response) {
          return response;
        }
        // Si no, hace la solicitud a la red
        return fetch(event.request).catch(() => {
          // Si la red falla (offline), devuelve un archivo de fallback si es necesario
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});
