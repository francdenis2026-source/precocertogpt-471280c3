const CACHE_VERSION = "precocerto-shell-v1";
const STATIC_CACHE = "precocerto-static-v1";
const NAVIGATION_TIMEOUT_MS = 8_000;

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => Promise.allSettled([
        cache.add("/"),
        cache.add("/manifest.json"),
        cache.add("/logo-preco-certo-simbolo.svg?v=11"),
      ]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => ![CACHE_VERSION, STATIC_CACHE].includes(key)).map(key => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

async function networkFirstNavigation(request) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), NAVIGATION_TIMEOUT_MS);
  try {
    const response = await fetch(request, { signal: controller.signal });
    if (!response.ok) return response;
    const cache = await caches.open(CACHE_VERSION);
    await cache.put(request, response.clone());
    return response;
  } catch {
    return await caches.match(request)
      || await caches.match("/")
      || new Response("Sem conexão. Abra novamente quando a rede estiver disponível.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8", "Retry-After": "30" },
      });
  } finally {
    clearTimeout(timer);
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  const update = fetch(request).then(response => {
    if (response.ok) void cache.put(request, response.clone());
    return response;
  }).catch(() => undefined);
  if (cached) {
    void update;
    return cached;
  }
  return await update || new Response("Recurso temporariamente indisponível.", {
    status: 504,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // APIs, Supabase e recursos externos mantêm sua própria semântica de erro.
  if (url.origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }
  if (["script", "style", "image", "font"].includes(request.destination)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
