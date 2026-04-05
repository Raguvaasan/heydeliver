import toast from "react-hot-toast"
import { PDFDocument, rgb } from "pdf-lib"

/**
 * Removes price/amount values from a Delhivery packing slip PDF
 * by drawing white rectangles over the Price and Total columns.
 */
async function stripAmountsFromPdf(pdfBytes: ArrayBuffer): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const pages = pdfDoc.getPages()

  for (const page of pages) {
    const { width, height } = page.getSize()

    // Delhivery 4R packing slip layout (bottom-up, PDF y=0 is bottom):
    //   - Return barcode + address at the very bottom
    //   - "Total" row just above
    //   - Product row(s) above that
    //   - "Product | Price | Total" header row above that
    //
    // We cover the Price & Total data columns (right ~38% of width)
    // in the product table zone (roughly 12% to 27% from bottom).

    // Cover Price & Total column values (product rows + total row)
    page.drawRectangle({
      x: width * 0.61,
      y: height * 0.12,
      width: width * 0.39,
      height: height * 0.16,
      color: rgb(1, 1, 1),
      borderWidth: 0,
    })
  }

  return pdfDoc.save()
}

async function fetchPdfBytes(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url, { method: "GET" })
  if (!res.ok) {
    throw new Error("Failed to fetch PDF from download link")
  }
  return res.arrayBuffer()
}

function openPdfBlob(pdfBytes: Uint8Array | ArrayBuffer, waybill: string): void {
  const blob = new Blob([pdfBytes], { type: "application/pdf" })
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

    const endpoint = `/delhivery-api/api/p/packing_slip?wbns=${encodeURIComponent(cleanWaybill)}&pdf=true&pdf_size=4R`
    const response = await fetch(endpoint, {
      method: "GET",
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || "Failed to fetch Delhivery label")
    }

    let pdfBytes: ArrayBuffer

    const contentType = response.headers.get("content-type") || ""
    if (contentType.includes("application/pdf")) {
      pdfBytes = await response.arrayBuffer()
    } else {
      // JSON response with pdf_download_link
      const json = await response.json()
      const pdfDownloadLink = json?.packages?.[0]?.pdf_download_link
      if (!pdfDownloadLink) {
        throw new Error("Delhivery PDF link not found in response")
      }
      pdfBytes = await fetchPdfBytes(pdfDownloadLink)
    }

    // Strip amount values from the PDF before displaying
    const cleanedPdf = await stripAmountsFromPdf(pdfBytes)
    openPdfBlob(cleanedPdf, cleanWaybill)
  } catch (error: any) {
    toast.error(error?.message || "Failed to open Delhivery label")
  }
}
