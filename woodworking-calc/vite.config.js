import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/Journeyman/',
  plugins: [react()],
  optimizeDeps: {
    include: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
  },
  build: {
    commonjsOptions: {
      include: [/firebase/, /node_modules/],
    },
  },
})
