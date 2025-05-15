import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        host: '0.0.0.0',      // listen on all interfaces (not just localhost)
        port: 5173,
        strictPort: true,     // make sure it uses 5173
        cors: true,           // allow cross-origin access if needed
        proxy: {
            '/ws': {
                target: 'http://backend:8000',
                ws: true,
            },
        },
        allowedHosts: ['localhost', '127.0.0.1', '.ngrok-free.app']
    },
})
