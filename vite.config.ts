import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import svgr from "vite-plugin-svgr"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [svgr(), react()],
  base: "/admin/",
  server: {
    proxy: {
      '/api': {
        target: 'https://freightrekapi.vercel.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: true,
      },
      '/delhivery-api': {
        target: 'https://track.delhivery.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/delhivery-api/, ''),
        secure: true,
        headers: {
          'Authorization': 'Token 76a094c150aed4e3a9c6b41b608ee7174f4d5b51'
        }
      }
    }
  }
})
