import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react({
        babel: {
          plugins: mode === 'production' ? ['transform-remove-console'] : [],
        },
      }),
      tailwindcss()
    ],
  };
});