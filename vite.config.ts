import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',  // Vercel 배포용 (루트 경로)
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