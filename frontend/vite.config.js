import { defineConfig } from 'vite'

export default defineConfig({
  // Base public path — '/' works for both Vercel and Render static deploys
  base: '/',

  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    // Ensure clean builds
    emptyOutDir: true,
  },
})
