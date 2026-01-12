
/* service-worker.js */
const CACHE_VERSION = "v1.0.0";
const CACHE_NAME = `emi-calculator-cache-${CACHE_VERSION}`;

/**
 * IMPORTANT: For GitHub Pages under /SVLF-Emi-Calculator/, keep these paths relative.
 * If you serve from root, you can use absolute "/" paths.
 */
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  // Icons (you said you'll add them)
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Bypass non-GET (e.g., form submits)
  if (request.method !== "GET") {
    return;
  }

  // Try cache first, then network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          // Cache successful responses for future offline use
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => {
          // Optional: return a minimal offline fallback page
          // return new Response("You are offline. Please try again later.", { headers: { "Content-Type": "text/plain" } });
        });
    })
  );
});
