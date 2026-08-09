import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Exponer en la red WiFi para que los amigos puedan entrar desde el celular
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      // Reenvía /api/* a FastAPI (evita CORS en desarrollo)
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
