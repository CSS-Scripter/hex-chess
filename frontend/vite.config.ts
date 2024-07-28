import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
        "/ws": {
            target: "http://localhost:3000",
            changeOrigin: true,
            secure: false,
            ws: true,
        },
        "/api": {
            target: 'http://localhost:3000',
            changeOrigin: true,
        }
    },
},
})
