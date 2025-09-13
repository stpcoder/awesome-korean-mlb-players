import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/awesome-korean-mlb-players/',
  server: {
    cors: true,
    proxy: {
      '/api/mlb': {
        target: 'https://statsapi.mlb.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/mlb/, '')
      }
    }
  }
})