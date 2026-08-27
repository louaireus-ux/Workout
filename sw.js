/* Readiness Board offline cache.
   Bump VERSION whenever index.html changes, or returning visitors keep the old
   copy for one extra load. */
const VERSION = 'readiness-v2';
const CORE = ['./', './index.html', './manifest.webmanifest',
              './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(VERSION)
      .then(function (c) { return c.addAll(CORE); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== VERSION; })
                               .map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

/* Serve from cache first so the board opens instantly and works with no signal,
   then refresh the copy in the background for next time. */
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  e.respondWith(
    caches.match(req).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && (res.ok || res.type === 'opaque')) {
          var copy = res.clone();
          caches.open(VERSION).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () {
        return hit || Response.error();
      });
      return hit || net;
    })
  );
});
