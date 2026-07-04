// .vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  cacheDir: 'C:/Temp/vite-cache',
  build: {
    sourcemap: true,
  },
  server: {
    fs: {
      strict: false,
    },
  },
});