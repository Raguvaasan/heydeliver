import type { VercelRequest, VercelResponse } from "@vercel/node"

const DELHIVERY_TOKEN = process.env.DELHIVERY_TOKEN || "91aeec33f78a2d21a6348658708de71f31489038"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

  if (req.method === "OPTIONS") {
    res.status(200).end()
    return
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  try {
    const waybill = String(req.query["waybill"] || "").trim()
    if (!waybill) {
      res.status(400).json({ error: "waybill is required" })
      return
    }

    const delhiveryUrl = `https://track.delhivery.com/api/p/packing_slip?wbns=${encodeURIComponent(
      waybill
    )}&pdf=true&pdf_size=4R`

    const delhiveryRes = await fetch(delhiveryUrl, {
      method: "GET",
      headers: {
        Authorization: `Token ${DELHIVERY_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "*/*",
      },
    })

    if (!delhiveryRes.ok) {
      const errorText = await delhiveryRes.text()
      res.status(delhiveryRes.status).json({
        error: "Failed to fetch Delhivery packing slip",
        details: errorText || `HTTP ${delhiveryRes.status}`,
      })
      return
    }

    const contentType = delhiveryRes.headers.get("content-type") || ""
    if (contentType.includes("application/pdf")) {
      const bytes = await delhiveryRes.arrayBuffer()
      const buffer = Buffer.from(bytes)
      res.setHeader("Content-Type", "application/pdf")
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="delhivery-label-${waybill}.pdf"`
      )
      res.status(200).send(buffer)
      return
    }

    const json = await delhiveryRes.json()
    const signedPdfUrl = json?.packages?.[0]?.pdf_download_link
    if (!signedPdfUrl) {
      res.status(502).json({
        error: "Delhivery response does not include pdf_download_link",
      })
      return
    }

    const pdfRes = await fetch(signedPdfUrl, { method: "GET" })
    if (!pdfRes.ok) {
      res.status(pdfRes.status).json({
        error: "Failed to fetch signed PDF from Delhivery link",
      })
      return
    }

    const pdfBytes = await pdfRes.arrayBuffer()
    const pdfBuffer = Buffer.from(pdfBytes)
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="delhivery-label-${waybill}.pdf"`
    )
    res.status(200).send(pdfBuffer)
  } catch (error: any) {
    res.status(500).json({
      error: "Internal server error",
      message: error?.message || "unknown error",
    })
  }
}
