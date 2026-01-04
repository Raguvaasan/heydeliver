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
      }
    }
  }
})
