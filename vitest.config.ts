import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    // Node 25+ exposes its own experimental global `localStorage`, which
    // shadows jsdom's when no --localstorage-file is given. Disable it so the
    // jsdom Web Storage implementation is used on every supported Node.
    execArgv: ['--no-experimental-webstorage'],
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/__tests__/**/*.test.{ts,tsx}'],
    passWithNoTests: true,
    coverage: {
      reporter: ['text', 'lcov'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
