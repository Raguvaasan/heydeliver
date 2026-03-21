import express from "express"
import cors from "cors"
import axios from "axios"

const app = express()
const PORT = Number(process.env.PORT || 3000)
const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://freightrekapi.vercel.app"
const DELHIVERY_TOKEN = process.env.DELHIVERY_TOKEN || "91aeec33f78a2d21a6348658708de71f31489038"

app.use(cors())
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true }))

app.get("/api", (_req, res) => {
  res.json({ status: "API running" })
})

// ── Delhivery proxy ──────────────────────────────────────────────────────────
app.use("/delhivery-api", async (req, res) => {
  try {
    const qs = req.url.includes("?") ? "?" + req.url.split("?")[1] : ""
    const target = `https://track.delhivery.com${req.path}${qs}`
    const response = await axios({
      method: req.method,
      url: target,
      data: req.body,
      headers: {
        Authorization: `Token ${DELHIVERY_TOKEN}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
      validateStatus: () => true,
    })
    return res.status(response.status).json(response.data)
  } catch (err) {
    console.error("[delhivery proxy]", err)
    res.status(500).json({ error: "Proxy error" })
  }
})

// ── Backend API proxy ────────────────────────────────────────────────────────
// All /api/* requests are forwarded to BACKEND_API_URL.
// Special case: /api/settings/* → BACKEND_API_URL/api/v1/settings/*
app.use("/api", async (req, res) => {
  try {
    const segments = req.path.split("/").filter(Boolean) // req.path has /api stripped by Express

    let backendPath
    if (segments[0] === "settings") {
      // settings lives under /api/v1/settings/ on the backend
      backendPath = "/api/v1/settings/" + segments.slice(1).join("/")
    } else {
      // everything else: strip leading /api and forward as-is
      backendPath = req.path // e.g. /customers, /admin/auth/login, /shipment/orders
    }

    // Build query string from req.query (excludes path param added by old api-server)
    const params = { ...req.query }
    const qs = Object.keys(params).length
      ? "?" + new URLSearchParams(params).toString()
      : ""

    const targetUrl = `${BACKEND_API_URL}${backendPath}${qs}`
    const authHeader = req.headers.authorization

    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: ["GET", "DELETE", "HEAD"].includes((req.method || "GET").toUpperCase())
        ? undefined
        : req.body,
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      timeout: 30000,
      validateStatus: () => true,
    })

    return res.status(response.status).json(response.data)
  } catch (err) {
    console.error("[api proxy]", err)
    res.status(500).json({
      error: "Proxy error",
      message: err instanceof Error ? err.message : "Unknown error",
    })
  }
})

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`)
})