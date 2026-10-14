import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  esbuild: {
    charset: 'ascii',
    legalComments: 'none'
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@markdown-reader/core': path.resolve(__dirname, '../../packages/core/src'),
      '@markdown-reader/ui': path.resolve(__dirname, '../../packages/ui/src')
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'popup.html'),
        onboarding: path.resolve(__dirname, 'onboarding.html'),
        contentScript: path.resolve(__dirname, 'src/content/contentScript.tsx'),
        serviceWorker: path.resolve(__dirname, 'src/background/serviceWorker.ts')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'contentScript') return 'contentScript.js';
          if (chunkInfo.name === 'serviceWorker') return 'serviceWorker.js';
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'contentScript.css';
          }
          return 'assets/[name].[ext]';
        }
      }
    }
  }
});
