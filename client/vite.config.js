import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // ─── Production Build ──────────────────────────────────────────────────────
  // Output built files directly into server/public so Express can serve them
  build: {
    outDir: '../server/public',
    emptyOutDir: true, // Clean old build before each new one
  },

  // ─── Dev Server Proxy ─────────────────────────────────────────────────────
  // Forwards /api/* requests from Vite dev server → Express on :5000
  // This means VITE_API_URL can be omitted in dev and relative /api will work
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})

