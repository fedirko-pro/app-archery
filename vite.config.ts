// @ts-nocheck
import { defineConfig, loadEnv } from 'vite';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  // @ts-ignore
  const env = loadEnv(mode, process.cwd(), '');
  const apiBase = env.VITE_API_BASE_URL || 'http://localhost:3000';
  let apiOrigin = apiBase;
  try {
    apiOrigin = new URL(apiBase).origin;
  } catch {
    // keep as-is if not a valid URL; env validation should catch this in app
  }
  return {
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
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          runtimeCaching: [
            // Do not cache API requests at all (avoid caching private/auth responses)
            {
              urlPattern: ({ url }) => url.origin === apiOrigin,
              handler: 'NetworkOnly',
              options: { cacheName: 'api-network-only' },
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
    },
  };
});
