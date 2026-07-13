import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@reel-maker/render-core': path.resolve(__dirname, '../packages/render-core/src/index.browser.js'),
    },
  },
  server: {
    proxy: {
      // Must match Reel-Maker-Backend PORT (3002 in backend .env)
      '/api': { target: 'http://127.0.0.1:3002', changeOrigin: true, timeout: 120000 },
      '/uploads': { target: 'http://127.0.0.1:3002', changeOrigin: true, timeout: 120000 },
    },
  },
})
