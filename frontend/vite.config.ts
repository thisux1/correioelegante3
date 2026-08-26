import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

const frontendPort = Number(process.env.FRONTEND_PORT || process.env.VITE_PORT || 5173)
const backendPort = Number(process.env.BACKEND_PORT || 3000)

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    visualizer({
      filename: 'stats.html',
      open: false,
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-animation': ['framer-motion', 'lenis'],
          'vendor-ui': ['lucide-react', 'axios', 'zustand'],
        },
      },
    },
  },
  server: {
    host: true,
    allowedHosts: true,
    port: frontendPort,
    proxy: {
      '/api': {
        target: `http://localhost:${backendPort}`,
        changeOrigin: true,
      },
    },
  },
})
