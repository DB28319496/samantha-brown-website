import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Use the port assigned by the launcher when present (autoPort)
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    strictPort: true,
  },
})
