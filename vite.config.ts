import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import svgr from "vite-plugin-svgr"
import dts from "vite-plugin-dts"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const apiProxyTarget =
    env["VITE_API_PROXY_TARGET"] || "https://truecargos.com/api/"
  const invoiceProxyTarget =
    env["VITE_INVOICE_PROXY_TARGET"] || "http://localhost:3000"
  const delhiveryToken =
    env["DELHIVERY_TOKEN"] || "91aeec33f78a2d21a6348658708de71f31489038"

  return {
    plugins: [svgr(), react()],
    base: "/admin/",
    server: {
      proxy: {
        "/api/shipment/invoice": {
          target: invoiceProxyTarget,
          changeOrigin: true,
          rewrite: (path) => path,
        },
        "/api/shipment": {
          target: "https://truecargos.com/api/",
          changeOrigin: true,
          rewrite: (path) => path,
          secure: true,
        },
        "/api/settings": {
          target: apiProxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/settings/, "/api/v1/settings"),
          secure: true,
        },
        "/api/wallet": {
          target: apiProxyTarget,
          changeOrigin: true,
          // Wallet endpoints on backend are mounted under /api/wallet.
          rewrite: (path) => path,
          secure: true,
        },
        "/api/admin": {
          target: apiProxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
          secure: true,
        },
        "/api/dashboard": {
          target: apiProxyTarget,
          changeOrigin: true,
          rewrite: (path) => path,
          secure: true,
        },
        "/api/customers": {
          target: apiProxyTarget,
          changeOrigin: true,
          rewrite: (path) => path,
          secure: true,
        },
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: true,
          // Keep the "/api" prefix for backend routes like /api/customers.
          rewrite: (path) => path,
        },
        "/delhivery-api": {
          target: "https://track.delhivery.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/delhivery-api/, ""),
          secure: true,
          headers: {
            Authorization: `Token ${delhiveryToken}`,
          },
        },
      },
    },
  }
})
