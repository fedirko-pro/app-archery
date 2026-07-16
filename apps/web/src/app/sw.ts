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

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Never cache private/auth API responses (same rule as the former Vite Workbox setup).
    ...(apiOrigin
      ? [
          {
            matcher: ({ url }: { url: URL }) => url.origin === apiOrigin,
            handler: new NetworkOnly(),
          },
        ]
      : []),
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
