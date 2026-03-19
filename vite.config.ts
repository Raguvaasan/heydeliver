import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import svgr from "vite-plugin-svgr"
import dts from "vite-plugin-dts"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const apiProxyTarget =
    env["VITE_API_PROXY_TARGET"] || "https://freightrekapi.vercel.app"
  const invoiceProxyTarget =
    env["VITE_INVOICE_PROXY_TARGET"] || "http://localhost:3000"

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
          target: "https://freightrekapi.vercel.app",
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
          rewrite: (path) => path,
          secure: true,
        },
        "/api/dashboard": {
          target: apiProxyTarget,
          changeOrigin: true,
          rewrite: (path) => path,
          secure: true,
        },
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: true,
          // remove the leading "/api" segment before forwarding so the
          // backend doesn’t need to know about our development proxy prefix.
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
        "/delhivery-api": {
          target: "https://track.delhivery.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/delhivery-api/, ""),
          secure: true,
          headers: {
            Authorization: "Token 76a094c150aed4e3a9c6b41b608ee7174f4d5b51",
          },
        },
      },
    },
  }
})
