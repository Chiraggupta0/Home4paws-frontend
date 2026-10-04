import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    // Allow the Vite preview server to be served behind Caddy on the domain
    allowedHosts: ['home4paws.in', 'www.home4paws.in'],
  },
})
