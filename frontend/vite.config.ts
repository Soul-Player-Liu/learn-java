import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

const apiTarget = process.env.VITE_API_TARGET ?? 'http://localhost:8080'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'cobertura'],
      reportsDirectory: 'coverage',
      include: ['src/api/tasks.ts', 'src/stores/taskStore.ts'],
      exclude: [
        'src/api/generated/**',
        'src/**/*.stories.ts',
        'src/main.ts',
        'src/mocks/**',
        'src/router/**',
        'src/types/**',
      ],
      thresholds: {
        lines: 85,
        functions: 85,
        statements: 85,
        branches: 80,
        'src/api/tasks.ts': {
          lines: 90,
          functions: 90,
          statements: 90,
          branches: 80,
        },
        'src/stores/taskStore.ts': {
          lines: 80,
          functions: 80,
          statements: 80,
          branches: 55,
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
})
