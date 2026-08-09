import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import os from 'os'
import dns from 'node:dns'

dns.setDefaultResultOrder('ipv4first')

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_LOCAL_IP': JSON.stringify(getLocalIP()),
  },
  server: {
    // Exponer en la red WiFi para que los amigos puedan entrar desde el celular
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      // Reenvía /api/* a FastAPI (evita CORS en desarrollo)
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
