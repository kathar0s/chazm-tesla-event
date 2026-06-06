import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: '큐브 코치 — 루빅스 큐브 풀이 도우미',
        short_name: '큐브 코치',
        description: '3D 큐브를 보며 단계별로 큐브를 맞추는 것을 도와줍니다.',
        theme_color: '#0f1115',
        background_color: '#0f1115',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
    }),
  ],
  // cubejs / rubiks-cube-solver are CommonJS — make sure Vite pre-bundles them.
  optimizeDeps: {
    include: ['cubejs', 'rubiks-cube-solver'],
  },
});
