/* 
    Worker para lidar com o cache do navegador, ele lida com:

    1. Implementação Cache First
    2. Armazenar os jogos no cache conforme são abertos

    Referência: https://developer.mozilla.org/pt-BR/docs/Web/API/Service_Worker_API
    Guia Base: https://www.freecodecamp.org/portuguese/news/como-criar-um-aplicativo-web-progressivo-pwa-do-zero-com-html-css-e-javascript/
*/

const CACHE_NAME = 'acervo';

const ASSETS_CACHE = [
    'index.html',
    'main.js',
    'menu.js',
    'evento-ponte.js',
    'config-jogos.js',
    'manifest.json',
    'phaser.min.js',
    'assets/icone-uniasselvi.png',
    'assets/imagem-fundo.png',
    'assets/intro.jpeg',       
    'assets/favicons/android-icon-192x192.png',
    'assets/favicons/favicon-32x32.png',
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_CACHE);
        })
    );
});

// Limpa caches antigos se mudar o CACHE_NAME (útil para limpar cache de versões antigas)
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
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response;
            }

            return fetch(event.request).then((fetchRes) => {

                if (!fetchRes || fetchRes.status !== 200 || fetchRes.type !== 'basic') {
                    return fetchRes;
                }

                const responseToCache = fetchRes.clone();

                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return fetchRes;
            }).catch(() => {
            });
        })
    );
});