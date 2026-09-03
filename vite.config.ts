import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import svgr from "vite-plugin-svgr"
import dts from "vite-plugin-dts"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const apiProxyTarget =
    env["VITE_API_PROXY_TARGET"] || "https://truecargos.com/api/"
  const b2bApiProxyTarget =
    env["VITE_B2B_API_PROXY_TARGET"] || "https://freightrekapi.vercel.app"
  const invoiceProxyTarget =
    env["VITE_INVOICE_PROXY_TARGET"] || "http://localhost:3000"
  const delhiveryToken =
    env["DELHIVERY_TOKEN"] ||
    env["DELHIVERY_API_TOKEN"] ||
    "38ddf1efc8e1669a4bf352376506b7da9d0b3c99"

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
          rewrite: (path) =>
            path === "/api/shipment/create"
              ? "/api/shipment/order"
              : path,
          secure: false,
        },
        "/api/settings": {
          target: apiProxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
          secure: false,
        },
        "/api/wallet": {
          target: apiProxyTarget,
          changeOrigin: true,
          // Wallet endpoints on backend are mounted under /api/wallet.
          rewrite: (path) => path,
          secure: false,
        },
        "/api/admin": {
          target: apiProxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
          secure: false,
        },
        "/api/dashboard": {
          target: apiProxyTarget,
          changeOrigin: true,
          rewrite: (path) => path,
          secure: false,
        },
        "/api/customers": {
          target: apiProxyTarget,
          changeOrigin: true,
          rewrite: (path) => path,
          secure: false,
        },
        "/api/b2b": {
          target: b2bApiProxyTarget,
          changeOrigin: true,
          // The B2B backend is mounted at /b2b, without the /api prefix.
          rewrite: (path) => path.replace(/^\/api/, ""),
          secure: false,
        },
        "/api/hub": {
          target: "https://freightrekapi.vercel.app/hub",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/hub/, ""),
          secure: false,
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
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
          // Keep the "/api" prefix for backend routes like /api/customers.
          rewrite: (path) => path,
        },
      },
    },
  }
})
