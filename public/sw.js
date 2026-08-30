const CACHE_VERSION = 'v6';
const STATIC_CACHE = `ctc-static-${CACHE_VERSION}`;
const FONT_CACHE = `ctc-fonts-${CACHE_VERSION}`;
const IMAGE_CACHE = `ctc-images-${CACHE_VERSION}`;
const MAX_IMAGE_CACHE = 60;

const PRECACHE_URLS = ['/', '/index.html', '/manifest.json'];

// ── Install: pre-cache critical shell ────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: delete stale caches ────────────────────────────────────────────
self.addEventListener('activate', event => {
  const validCaches = [STATIC_CACHE, FONT_CACHE, IMAGE_CACHE];
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => !validCaches.includes(k)).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch: tiered caching strategy ───────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET over http(s)
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // Skip API calls entirely – always go to network
  if (url.pathname.startsWith('/api/')) return;

  // Google Fonts → Cache-first (long TTL, separate bucket)
  if (url.hostname.includes('fonts.g')) {
    event.respondWith(cacheFirst(request, FONT_CACHE));
    return;
  }

  // Images → Cache-first with entry limit
  if (/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i.test(url.pathname)) {
    event.respondWith(cacheFirstWithLimit(request, IMAGE_CACHE, MAX_IMAGE_CACHE));
    return;
  }

  // Static assets (JS, CSS, fonts) → Cache-first
  if (/\.(js|css|woff2?|ttf|otf)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Videos → Network-only (too large; avoid cache pollution)
  if (/\.(mp4|webm|ogg|mov)$/i.test(url.pathname)) return;

  // HTML navigation → Network-first, fallback to cache / index.html
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request, STATIC_CACHE));
    return;
  }

  // Everything else (fetch, XHR) → Stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
});

// ── Strategy helpers ──────────────────────────────────────────────────────────

/** Cache-first: return cached copy; fetch & store on miss. */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 503, statusText: 'Service Unavailable' });
  }
}

/** Cache-first with LRU-style eviction when limit is reached. */
async function cacheFirstWithLimit(request, cacheName, limit) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      if (keys.length >= limit) {
        // Evict oldest entry (FIFO approximation)
        await cache.delete(keys[0]);
      }
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 503, statusText: 'Service Unavailable' });
  }
}

/** Network-first: try network, update cache; fall back to cached / index.html. */
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // SPA fallback: serve shell for any HTML request
    const shell = await caches.match('/index.html');
    return shell || new Response('Offline', {
      status: 503,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}

/** Stale-while-revalidate: return cache immediately, refresh in background. */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  return cached || (await fetchPromise) || new Response('', { status: 503 });
}
