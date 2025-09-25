import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { registerSW } from 'virtual:pwa-register';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);

// Unregister legacy custom service worker if it still exists (/service-worker.js)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      const scriptUrl =
        registration.active?.scriptURL ||
        registration.waiting?.scriptURL ||
        registration.installing?.scriptURL;
      if (scriptUrl && scriptUrl.includes('/service-worker.js')) {
        registration.unregister();
      }
    });
  });
}
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Register PWA and prompt on updates
const updateSW = registerSW({
  onNeedRefresh() {
    const shouldRefresh = window.confirm(
      'A new version is available. Reload now?',
    );
    if (shouldRefresh) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    // Optionally notify the user that the app is ready to work offline
    // console.log('App ready to work offline');
  },
});
