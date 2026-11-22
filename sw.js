// Mise en cache pour que l'application fonctionne sans connexion.
const CACHE = 'tracabilite-v7';
const FILES = ['./', './index.html', './style.css', './manifest.webmanifest', './icon-192.png', './icon-512.png', './logo.jpg',
  './fonts/nunito.woff2', './fonts/dancing-script.woff2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Réseau d'abord (pour recevoir les mises à jour), cache si hors-ligne.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== self.location.origin) return;   // jamais de cache pour GitHub (sauvegardes, jeton)
  e.respondWith(
    // 'no-cache' : on revalide toujours auprès du serveur (sinon GitHub Pages fait réutiliser l'ancienne copie pendant 10 min).
    fetch(e.request, { cache: 'no-cache' }).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
