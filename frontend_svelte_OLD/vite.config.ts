import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [sveltekit()],
    
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
                rewrite: path => path.replace(/^\/api/, '')
            }
        },
    },
});