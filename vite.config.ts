import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }: { mode: string }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBase = env.VITE_API_BASE_URL || 'http://localhost:3000';
  const projectRoot = path.resolve(__dirname);
  let apiOrigin = apiBase;
  try {
    apiOrigin = new URL(apiBase).origin;
  } catch {
    apiOrigin = 'http://localhost:3000';
  }
  const proxyTarget =
    apiBase.startsWith('http') ? apiBase : 'http://localhost:3000';
  return {
    resolve: {
      alias: {
        '@': path.resolve(projectRoot, 'src'),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: "@use 'helpers/mixins' as mx;\n",
          // Support absolute-like Sass imports from src/sass without aliases
          includePaths: ['src/sass', 'src'],
          // For modern compiler API
          loadPaths: ['src/sass', 'src'],
        },
      },
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['logo192.png', 'logo512.png', 'desktop.png', 'phone.png'],
        manifest: {
          "short_name": "UArchery",
          "name": "UArchery APP",
          "id": "/",
          "start_url": "/",
          "display_override": ["window-controls-overlay", "minimal-ui"],
          "display": "standalone",
          "background_color": "#ffffff",
          "theme_color": "#ffffff",
          "description": "An archery application for tracking and managing events. v.0.1.1",
          "orientation": "portrait-primary",
          "screenshots": [
            {
              "src": "desktop.png",
              "sizes": "1024x686",
              "type": "image/png",
              "form_factor": "wide",
              "label": "Desktop view"
            },
            {
              "src": "phone.png",
              "sizes": "350x623",
              "type": "image/png",
              "label": "Mobile view"
            }
          ],
          "categories": ["sports", "utilities"],
          "icons": [
            {
              "src": "logo192.png",
              "sizes": "192x192",
              "type": "image/png"
            },
            {
              "src": "logo512.png",
              "sizes": "512x512",
              "type": "image/png"
            }
          ]
        },
        workbox: {
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/pdf\//],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          runtimeCaching: [
            // 1. Cache public GET API for offline (must be first so it wins over NetworkOnly)
            {
              urlPattern: ({ url, request }) => {
                if (request?.method !== 'GET') return false;
                const path = url.pathname;
                const publicPath =
                  /^\/(?:api\/)?(tournaments|rules|clubs|divisions|bow-categories)(?:\/.*)?$/.test(path) ||
                  (url.origin === apiOrigin &&
                    /^\/(tournaments|rules|clubs|divisions|bow-categories)(?:\/.*)?$/.test(path));
                return publicPath;
              },
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-offline-cache',
                networkTimeoutSeconds: 8,
                expiration: { maxEntries: 128, maxAgeSeconds: 7 * 24 * 60 * 60 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            // 2. Private API (auth, users, applications, etc.) – do not cache
            {
              urlPattern: ({ url, request }) => {
                if (url.origin !== apiOrigin) return false;
                const path = url.pathname;
                return (
                  /^\/(?:api\/)?auth\//.test(path) ||
                  /^\/(?:api\/)?users\//.test(path) ||
                  /^\/(?:api\/)?tournament-applications\//.test(path) ||
                  /^\/(?:api\/)?patrols\//.test(path) ||
                  /^\/(?:api\/)?upload\//.test(path)
                );
              },
              handler: 'NetworkOnly',
              options: { cacheName: 'api-private-network-only' },
            },
            // PDF files: network only, never serve index.html
            {
              urlPattern: ({ url }) => url.pathname.startsWith('/pdf/'),
              handler: 'NetworkOnly',
              options: { cacheName: 'pdf-network-only' },
            },
            // HTML navigations (SPA): network-first with cache fallback
            {
              urlPattern: ({ request }) => request.mode === 'navigate',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'html-cache',
                expiration: { maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 },
              },
            },
            // Scripts and styles: cache-first
            {
              urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style',
              handler: 'CacheFirst',
              options: {
                cacheName: 'assets-cache',
                expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
              },
            },
            // Images: cache-first with expiration
            {
              urlPattern: ({ request }) => request.destination === 'image',
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 24 * 60 * 60 },
              },
            },
          ],
        },
      }),
    ],
    server: {
      port: Number(env.VITE_PORT) || 3001,
      host: true,
      // Proxy API to backend in dev to avoid CORS (frontend and backend on different ports)
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    preview: {
      port: Number(env.VITE_PREVIEW_PORT) || 4173,
      host: true,
      // Same proxy for local PWA testing (pnpm run build && pnpm run start)
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
  };
});
