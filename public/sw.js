// Worker de transição: elimina os caches antigos e não intercepta nenhuma
// requisição. A confiabilidade da homepage tem prioridade sobre o modo offline.
self.addEventListener("install", event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith("precocerto-")).map(key => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});
