import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'App Uarchery',
        short_name: 'Uarchery',
        description: 'Archery application',
        theme_color: '#ffffff',
        icons: [
          // {
          //   src: 'icon-192x192.png',
          //   sizes: '192x192',
          //   type: 'image/png',
          // },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  resolve: {
    dedupe: ['react', 'react-dom'], // Ensure single React instance
  },
  build: {
    sourcemap: true, // Enable source maps for easier debugging
  },
});



