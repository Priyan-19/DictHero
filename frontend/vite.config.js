import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  define: {
    // Makes VITE_API_BASE_URL available as a global constant at build time
    __API_BASE__: JSON.stringify(process.env.VITE_API_BASE_URL || ''),
  },
})
