/*
    Worker para lidar com o cache do navegador, ele lida com:

    1. Implementação Network First (com fallback para cache, usado offline)
    2. Armazenar os jogos no cache conforme são abertos

    Referência: https://developer.mozilla.org/pt-BR/docs/Web/API/Service_Worker_API
    Guia Base: https://www.freecodecamp.org/portuguese/news/como-criar-um-aplicativo-web-progressivo-pwa-do-zero-com-html-css-e-javascript/
*/

// Suba este número a cada mudança relevante no código: isso força os navegadores
// que já instalaram o app a descartar o cache antigo e buscar os arquivos novos.
const CACHE_NAME = 'acervo-v2';

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

// Limpa caches antigos (de versões anteriores do CACHE_NAME) e assume o controle
// das abas já abertas imediatamente, sem precisar de um reload extra.
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
        }).then(() => self.clients.claim())
    );
});

// Network First: tenta buscar a versão mais recente na rede e atualiza o cache.
// Se a rede falhar (offline), usa o que estiver em cache como alternativa.
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).then((fetchRes) => {
            if (fetchRes && fetchRes.status === 200 && fetchRes.type === 'basic') {
                const responseToCache = fetchRes.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
            }
            return fetchRes;
        }).catch(() => caches.match(event.request))
    );
});