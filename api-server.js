import express from "express"
import cors from "cors"

const app = express()
const PORT = Number(process.env.PORT || 3000)

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get("/api", (_req, res) => {
  res.json({ status: "API running" })
})

app.use("/api", async (req, res) => {
  try {
    const module = await import(new URL("./api/[...path].ts", import.meta.url).href)
    const handler = module.default

    const pathSegments = req.path.split("/").filter(Boolean)

    Object.defineProperty(req, "query", {
      value: { ...req.query, path: pathSegments },
      writable: true,
      configurable: true,
    })

    await handler(req, res)
  } catch (error) {
    console.error("API error:", error)
    res.status(500).json({
      error: "Internal API error",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`)
})