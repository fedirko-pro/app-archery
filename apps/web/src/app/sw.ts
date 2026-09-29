/// <reference types="@serwist/next/typings" />

import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { NetworkOnly, Serwist } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

function resolveApiOrigin(): string | null {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  if (!apiBase) return null;
  try {
    return new URL(apiBase).origin;
  } catch {
    return null;
  }
}

const apiOrigin = resolveApiOrigin();

self.addEventListener('fetch', (event) => {
  if (!apiOrigin) return;
  if (new URL(event.request.url).origin !== apiOrigin) return;
  event.stopImmediatePropagation();
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ url }: { url: URL; sameOrigin: boolean }) =>
        url.pathname.startsWith('/api/') && url.pathname !== '/api/app-version',
      handler: new NetworkOnly(),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: '/~offline',
        matcher({ request }) {
          return request.destination === 'document';
        },
      },
    ],
  },
});

serwist.addEventListeners();

self.addEventListener('push', (event) => {
  let payload: { title?: string; body?: string; url?: string } = {};
  try {
    payload = (event.data?.json() ?? {}) as { title?: string; body?: string; url?: string };
  } catch {
    payload = { body: event.data?.text() };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'Sokil', {
      body: payload.body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      data: { url: payload.url || '/notifications' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data as { url?: string } | undefined;
  const target = new URL(data?.url || '/notifications', self.location.origin).href;

  event.waitUntil(
    (async () => {
      const windowClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });
      for (const client of windowClients) {
        if (!client.url.startsWith(self.location.origin)) continue;
        await client.focus();
        if ('navigate' in client) {
          await client.navigate(target);
        }
        return;
      }
      await self.clients.openWindow(target);
    })(),
  );
});
