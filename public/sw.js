// ─── PorterOS Service Worker ─────────────────────────────────────────────
// Pre-caches all app routes + their JS/CSS bundles on install.
// No need to visit each page — everything is ready for offline.

const CACHE_NAME = 'porteros-v4';

const APP_ROUTES = [
  '/',
  '/paquetes',
  '/visitas',
  '/mensajes',
  '/novedades',
  '/turno',
  '/admin',
  '/admin/edificio',
  '/admin/residentes',
  '/admin/conserjes',
  '/admin/proveedores',
  '/admin/estacionamientos',
  '/admin/whatsapp',
  '/admin/qr',
  '/lobby',
];

// Pre-cache all routes + extract and cache their JS/CSS bundles
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[SW] Pre-caching all app routes + bundles...');
      const allUrls = new Set();

      for (const route of APP_ROUTES) {
        try {
          const res = await fetch(route);
          if (!res.ok) continue;
          const clone = res.clone();
          await cache.put(route, clone);

          // Parse HTML to find JS/CSS bundle URLs
          const html = await res.text();
          const scriptMatches = html.matchAll(/src="(\/_next\/[^"]+)"/g);
          const linkMatches = html.matchAll(/href="(\/_next\/[^"]+\.css[^"]*)"/g);

          for (const match of scriptMatches) allUrls.add(match[1]);
          for (const match of linkMatches) allUrls.add(match[1]);
        } catch (err) {
          console.warn('[SW] Failed to pre-cache route:', route);
        }
      }

      // Cache all discovered JS/CSS bundles
      console.log(`[SW] Caching ${allUrls.size} JS/CSS bundles...`);
      await Promise.allSettled(
        Array.from(allUrls).map(async (url) => {
          try {
            const res = await fetch(url);
            if (res.ok) await cache.put(url, res);
          } catch {
            // Skip failed bundles
          }
        })
      );

      console.log('[SW] Pre-cache complete!');
    })
  );
  self.skipWaiting();
});

// Clean old caches on activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Offline banner HTML to inject
const OFFLINE_BANNER = '<div id="offline-banner-static" style="background:#334155;color:white;padding:8px 16px;text-align:center;font-size:14px;font-family:system-ui,sans-serif;position:fixed;top:0;left:0;right:0;z-index:9999;">Sin conexion — modo offline. Por favor verifique conexion WiFi.</div>';

// Fetch strategy: network-first with cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.hostname.includes('supabase')) return;
  if (url.protocol === 'chrome-extension:') return;
  if (url.pathname.startsWith('/api/')) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);

        if (cached) {
          // Inject offline banner into HTML navigation responses
          if (request.mode === 'navigate') {
            try {
              const html = await cached.text();
              const modified = html.replace('</body>', OFFLINE_BANNER + '</body>');
              return new Response(modified, {
                status: 200,
                headers: { 'Content-Type': 'text/html' },
              });
            } catch {
              return cached;
            }
          }
          return cached;
        }

        // Fallback: serve cached home for unknown navigation
        if (request.mode === 'navigate') {
          const home = await caches.match('/');
          if (home) {
            try {
              const html = await home.text();
              const modified = html.replace('</body>', OFFLINE_BANNER + '</body>');
              return new Response(modified, {
                status: 200,
                headers: { 'Content-Type': 'text/html' },
              });
            } catch {
              return home;
            }
          }
        }

        return new Response('Offline', { status: 503 });
      })
  );
});
