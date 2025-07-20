import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Set base path for GitHub Pages deployment
  // Replace 'personal-portal' with your actual repository name
  base: process.env.NODE_ENV === 'production' ? '/PortalWeb/' : '/',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // Optimize chunk size limits
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Enhanced manual chunks for better code splitting
        manualChunks: (id) => {
          // Vendor libraries
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router-dom')) {
              return 'router';
            }
            if (id.includes('framer-motion')) {
              return 'motion';
            }
            if (id.includes('axios')) {
              return 'http';
            }
            return 'vendor';
          }
          
          // Widget components
          if (id.includes('/widgets/')) {
            return 'widgets';
          }
          
          // Tool components
          if (id.includes('/tools/') || id.includes('Calculator') || id.includes('CurrencyConverter')) {
            return 'tools';
          }
          
          // Homepage specific components
          if (id.includes('/homepage/')) {
            return 'homepage';
          }
          
          // Theme and context
          if (id.includes('/contexts/') || id.includes('/theme/')) {
            return 'contexts';
          }
          
          // Utilities and systems
          if (id.includes('/utils/') || id.includes('/systems/')) {
            return 'utils';
          }
        },
        // Optimize asset naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js'
      }
    },
    // Enable minification and compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'axios'],
    exclude: []
  },
  // Define environment variables for performance optimizations
  define: {
    'process.env.HOMEPAGE_MODE': JSON.stringify(true),
    '__DEV__': JSON.stringify(process.env.NODE_ENV !== 'production'),
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version || '1.0.0'),
    'import.meta.env.VITE_GITHUB_REPO': JSON.stringify(process.env.VITE_GITHUB_REPO || 'yourusername/PortalWeb')
  }
}) 