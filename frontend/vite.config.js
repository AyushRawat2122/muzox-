import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

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
      tailwindcss()
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
