import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.js',
        'dist/',
        'extensions/',
        'scripts/',
        'public/'
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },
    include: ['src/components/widgets/__tests__/TimezoneWidget.test.jsx'],
    exclude: [
      'node_modules', 
      'dist', 
      'extensions', 
      'scripts',
      'src/test/e2e/**',
      'src/test/performance/**',
      'src/test/integration/**',
      'src/components/__tests__/**',
      'src/components/tools/__tests__/**',
      'src/components/widgets/__tests__/WeatherWidget.test.jsx'
    ],
    testTimeout: 10000,
    hookTimeout: 10000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@test': path.resolve(__dirname, './src/test')
    }
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify('1.0.0'),
    'import.meta.env.VITE_GITHUB_REPO': JSON.stringify('test/repo')
  }
})