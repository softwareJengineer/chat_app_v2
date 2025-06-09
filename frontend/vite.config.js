import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'AI Assistant Chat with Biomarkers',
        short_name: 'AI Chat',
        start_url: '.',
        display: 'standalone',
        background_color: '#ffde59',
        theme_color: '#ffffff',
        icons: [
          {
            "src": "3d-icon-robot-1.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "3d-icon-robot-2.png", 
            "sizes": "512x512",
            "type": "image/png"
        }
        ]
      }
    })
  ]
})