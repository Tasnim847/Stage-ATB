// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  // Utiliser un dossier de cache différent et accessible
  cacheDir: 'C:/Temp/vite-cache',
  
  build: {
    sourcemap: true,
    // Réduire la charge mémoire
    minify: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  
  server: {
    fs: {
      // Autoriser l'accès aux fichiers en dehors du root
      strict: false,
    },
    // Désactiver le HMR si nécessaire
    hmr: {
      overlay: false
    },
    // Réduire le polling
    watch: {
      usePolling: false,
      interval: 1000
    }
  },
  
  optimizeDeps: {
    // Désactiver complètement l'optimisation pour éviter les erreurs EPERM
    disabled: true,
    // Ou forcer la réoptimisation à chaque démarrage
    force: false,
    // Exclure les dépendances problématiques
    exclude: ['@angular/core', '@angular/common', 'rxjs'],
    // Inclure les dépendances nécessaires
    include: [
      '@angular/platform-browser',
      '@angular/platform-browser-dynamic',
      '@angular/forms',
      '@angular/router'
    ]
  },
  
  // Résolution des modules
  resolve: {
    alias: {
      '@': '/src',
      '@core': '/src/app/core',
      '@shared': '/src/app/shared',
      '@features': '/src/app/features'
    }
  },
  
  // Plugins
  plugins: [],
  
  // Environnement
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
});