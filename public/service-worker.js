// public/service-worker.js

const CACHE_NAME = 'app-cache-v2';
const urlsToCache = [
  '/', // Root page
  '/index.html', // Main HTML file
  '/manifest.webmanifest', // Manifest file
  '/logo192.png', // Icons
  '/logo512.png',
  '/offline.html', // Offline fallback page
];

// Install event: Cache specified resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing and caching resources...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch((error) => {
        console.error('Failed to cache resources during install:', error);
      });
    })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event: Serve cached resources and handle offline scenarios
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Serve from cache if available
      if (response) {
        return response;
      }

      // If not cached, try to fetch from network
      return fetch(event.request).catch(() => {
        // Serve the offline fallback page for HTML requests when offline
        if (event.request.destination === 'document') {
          return caches.match('/offline.html');
        }
      });
    })
  );
});

// Optional: Dynamic caching for new resources
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            // Cache dynamically fetched resources
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
      );
    })
  );
});
