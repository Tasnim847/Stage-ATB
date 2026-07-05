// .vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  cacheDir: 'C:/Temp/vite-cache', // Utiliser un dossier différent
  build: {
    sourcemap: true,
  },
  server: {
    fs: {
      strict: false,
    },
  },
  optimizeDeps: {
    force: false, // Ne pas forcer la réoptimisation
    entries: [], // Liste des entrées
  },
});