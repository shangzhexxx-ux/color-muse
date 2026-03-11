const EXPORT_PATH = '/__cm_export.png';
const CACHE_NAME = 'cm-export-v1';

const TRANSPARENT_1X1_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/6X9y0cAAAAASUVORK5CYII=';

const base64ToUint8Array = (base64) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type !== 'SET_EXPORT') return;

  const port = event.ports && event.ports[0];
  const buffer = data.buffer;
  const contentType = data.contentType || 'image/png';

  if (!buffer) {
    if (port) port.postMessage({ ok: false });
    return;
  }

  const response = new Response(buffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'no-store',
      'Content-Disposition': 'inline; filename="color-muse.png"',
    },
  });

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(EXPORT_PATH, response);
      if (port) port.postMessage({ ok: true });
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.pathname !== EXPORT_PATH) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(EXPORT_PATH, { ignoreSearch: true });
      if (cached) return cached;

      const bytes = base64ToUint8Array(TRANSPARENT_1X1_PNG_BASE64);
      return new Response(bytes, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-store',
        },
      });
    })()
  );
});

