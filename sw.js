// Versión 3: Usando rutas absolutas y fallback de navegación robusto
const CACHE_NAME = 'calculadora-pv-cache-v3';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/icon.svg',
    '/manifest.json'
];

// Evento de instalación: se guarda el caché con los archivos de la app
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache v3 abierto, guardando archivos principales.');
                return cache.addAll(urlsToCache);
            })
    );
});

// Evento fetch: estrategia "Cache-first", con fallback a la red y fallback offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Si el recurso está en el caché, lo devuelve (rápido)
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Si no está en caché, lo busca en la red
                return fetch(event.request).catch(error => {
                    // La petición de red ha fallado (no hay conexión)
                    console.log('Fallo en la petición de red:', error);
                    
                    // Si la petición era para navegar a una página, devuelve el index.html offline
                    if (event.request.mode === 'navigate') {
                        console.log('Devolviendo página offline desde el caché.');
                        return caches.match('/index.html');
                    }
                });
            })
    );
});

// Evento de activación: limpia cachés antiguos para evitar conflictos
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Eliminando caché antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
