import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

  return {
    plugins: [
      react({
        // Only remove console calls in production
        babel: {
          plugins: isProd ? ['transform-remove-console'] : []
        }
      }),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['Logo.png'],
        manifest: {
          name: 'Muzox',
          short_name: 'Muzox',
          description: 'Music streaming application',
          theme_color: '#000000',
          background_color: '#000000',
          display: 'standalone',
          icons: [
            {
              src: 'Logo.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'Logo.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    // Optional: also drop any leftover console/debugger at minify time
    build: {
      terserOptions: {
        compress: {
          drop_console: isProd
        }
      }
    }
  }
})
