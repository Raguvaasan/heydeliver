import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import svgr from "vite-plugin-svgr"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [svgr(), dts(), react()],
  base: "/admin/",
  server: {
    proxy: {
      '/api': {
        target: 'http://3.27.77.241:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
      }
    }
  }
})
