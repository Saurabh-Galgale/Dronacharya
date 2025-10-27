/* public/sw.js
   ✅ Final version – robust, production-safe, caches Cloudinary images.
   Features:
   - Cache-first with expiration
   - Caches opaque Cloudinary images using no-cors mode
   - Deduplicates concurrent fetches
   - No duplicate network calls
*/

const IMG_CACHE = "shop-images-v1";
const META_CACHE = "shop-images-meta-v1";
const MAX_ENTRIES = 300;
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

// Match your Cloudinary host(s)
const IMAGE_HOST_MATCH =
  /https?:\/\/res\.cloudinary\.com\/|https?:\/\/.*\.cloudinary\.com\//i;

const inFlightFetches = new Map();

async function setMetaFor(url, timestamp) {
  const metaCache = await caches.open(META_CACHE);
  await metaCache.put(
    new Request(url + "::meta"),
    new Response(String(timestamp))
  );
}

async function getMetaTimestamp(url) {
  const metaCache = await caches.open(META_CACHE);
  const r = await metaCache.match(new Request(url + "::meta"));
  if (!r) return null;
  const txt = await r.text();
  const n = Number(txt);
  return Number.isFinite(n) ? n : null;
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  for (let i = 0; i < keys.length - maxEntries; i++) {
    const key = keys[i];
    await cache.delete(key);
    const meta = await caches.open(META_CACHE);
    await meta.delete(new Request(key.url + "::meta"));
  }
}

self.addEventListener("install", (evt) => {
  self.skipWaiting();
  console.debug("SW installed");
});

self.addEventListener("activate", (evt) => {
  evt.waitUntil(
    (async () => {
      const keep = [IMG_CACHE, META_CACHE];
      const names = await caches.keys();
      await Promise.all(
        names.map((n) => (!keep.includes(n) ? caches.delete(n) : null))
      );
      await self.clients.claim();
      console.debug("SW activated and claimed clients");
    })()
  );
});

self.addEventListener("fetch", (evt) => {
  const req = evt.request;
  if (req.method !== "GET") return;

  const accept = req.headers.get("Accept") || "";
  const isImage = req.destination === "image" || accept.includes("image/");
  const matchesHost = IMAGE_HOST_MATCH.test(req.url);

  if (!isImage || !matchesHost) return;

  evt.respondWith(handleImageRequest(req));
});

async function handleImageRequest(request) {
  const cache = await caches.open(IMG_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    console.debug("SW: cache HIT", request.url);

    // Check if expired
    const ts = await getMetaTimestamp(request.url);
    const now = Date.now();
    const expired = ts && now - ts > MAX_AGE_SECONDS * 1000;

    if (expired) {
      console.debug("SW: expired, refreshing in background", request.url);
      startBackgroundUpdate(request);
    }
    return cached;
  }

  console.debug("SW: cache MISS", request.url);
  const networkResp = await fetchAndCacheDeduped(request);
  return (
    networkResp ||
    new Response(null, { status: 504, statusText: "Image fetch failed" })
  );
}

function startBackgroundUpdate(request) {
  fetchAndCacheDeduped(request).catch(() => {});
}

async function fetchAndCacheDeduped(request) {
  const key = request.url;
  if (inFlightFetches.has(key)) {
    return inFlightFetches.get(key);
  }

  const promise = (async () => {
    try {
      // For Cloudinary: force no-cors mode so response is opaque but cacheable
      const isCloudinary = IMAGE_HOST_MATCH.test(request.url);
      const fetchOptions = isCloudinary ? { mode: "no-cors" } : {};
      const resp = await fetch(request, fetchOptions);

      if (!resp) return null;

      if (!resp.ok && resp.type !== "opaque") {
        console.debug("SW: response not cached", request.url, resp.status);
        return resp;
      }

      const cache = await caches.open(IMG_CACHE);
      await cache.put(request, resp.clone());
      await setMetaFor(request.url, Date.now());
      trimCache(IMG_CACHE, MAX_ENTRIES).catch(() => {});
      console.debug("SW: fetched & cached", request.url, "type:", resp.type);

      return resp;
    } catch (e) {
      console.warn("SW: fetch failed for", request.url, e);
      return null;
    } finally {
      inFlightFetches.delete(key);
    }
  })();

  inFlightFetches.set(key, promise);
  return promise;
}
