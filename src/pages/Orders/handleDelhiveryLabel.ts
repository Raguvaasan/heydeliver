import toast from "react-hot-toast"
import { PDFDocument, rgb } from "pdf-lib"

/**
 * Removes price/amount values from a Delhivery packing slip PDF
 * by drawing white rectangles over the Price and Total columns.
 */
async function stripAmountsFromPdf(pdfBytes: ArrayBuffer): Promise<Uint8Array> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true })
    const pages = pdfDoc.getPages()
    console.log(`[stripAmounts] pages: ${pages.length}`)

    for (const page of pages) {
      const { width, height } = page.getSize()
      console.log(`[stripAmounts] page size: ${width} x ${height}`)

      // DEBUG: Draw RED rectangle to SEE where it lands
      // Will change to white once position is confirmed
      page.drawRectangle({
        x: width * 0.55,
        y: height * 0.04,
        width: width * 0.45,
        height: height * 0.30,
        color: rgb(1, 0, 0),
        opacity: 0.8,
        borderWidth: 0,
      })
    }

    return pdfDoc.save()
  } catch (err) {
    console.error('[stripAmounts] PDF processing failed:', err)
    return new Uint8Array(pdfBytes)
  }
}

function openPdfBlob(pdfBytes: Uint8Array | ArrayBuffer): void {
  const blob = new Blob([pdfBytes instanceof Uint8Array ? pdfBytes.buffer as ArrayBuffer : pdfBytes], { type: "application/pdf" })
  if (!blob || blob.size === 0) {
    throw new Error("Received empty PDF file")
  }
  const pdfUrl = URL.createObjectURL(blob)
  const previewWindow = window.open(pdfUrl, "_blank", "noopener,noreferrer")
  if (!previewWindow) {
    throw new Error("Popup blocked. Please allow popups to preview label.")
  }
  setTimeout(() => URL.revokeObjectURL(pdfUrl), 120_000)
}

export const handleDelhiveryLabel = async (waybill: string): Promise<void> => {
  try {
    const cleanWaybill = String(waybill || "").trim()
    if (!cleanWaybill) {
      toast.error("Waybill is missing for this order")
      return
    }

    // Use server-side proxy — avoids CORS when Delhivery returns an S3 redirect
    const response = await fetch(`/api/delhivery-label?waybill=${encodeURIComponent(cleanWaybill)}`, {
      method: "GET",
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || "Failed to fetch Delhivery label")
    }

    const pdfBytes = await response.arrayBuffer()

    // Strip amount values from the PDF before displaying
    const cleanedPdf = await stripAmountsFromPdf(pdfBytes)
    openPdfBlob(cleanedPdf)
  } catch (error: any) {
    toast.error(error?.message || "Failed to open Delhivery label")
  }
}
