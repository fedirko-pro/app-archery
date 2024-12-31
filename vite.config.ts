import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
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
    }),
  ],
});
