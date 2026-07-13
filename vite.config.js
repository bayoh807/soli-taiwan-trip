import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/soli-taiwan-trip/',
  server: {
    allowedHosts: true
  }
})
