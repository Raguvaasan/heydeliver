import toast from "react-hot-toast"

export const handleDelhiveryLabel = async (waybill: string): Promise<void> => {
  try {
    const cleanWaybill = String(waybill || "").trim()
    if (!cleanWaybill) {
      toast.error("Waybill is missing for this order")
      return
    }

    const endpoint = import.meta.env.DEV
      ? `/delhivery-api/api/p/packing_slip?wbns=${encodeURIComponent(cleanWaybill)}&pdf=true&pdf_size=4R`
      : `/api/delhivery-label?waybill=${encodeURIComponent(cleanWaybill)}`
    const response = await fetch(endpoint, {
      method: "GET",
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || "Failed to fetch Delhivery label")
    }

    const contentType = response.headers.get("content-type") || ""
    if (contentType.includes("application/pdf")) {
      const pdfBytes = await response.arrayBuffer()
      const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" })
      if (!pdfBlob || pdfBlob.size === 0) {
        throw new Error("Received empty PDF file")
      }

      const pdfUrl = URL.createObjectURL(pdfBlob)
      const previewWindow = window.open(pdfUrl, "_blank", "noopener,noreferrer")
      if (!previewWindow) {
        throw new Error("Popup blocked. Please allow popups to preview label.")
      }
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 120_000)
      return
    }

    const json = await response.json()
    const pdfDownloadLink = json?.packages?.[0]?.pdf_download_link
    if (!pdfDownloadLink) {
      throw new Error("Delhivery PDF link not found in response")
    }

    const previewWindow = window.open(pdfDownloadLink, "_blank", "noopener,noreferrer")
    // if (!previewWindow) {
    //   throw new Error("Popup blocked. Please allow popups to preview label.")
    // }
  } catch (error: any) {
    toast.error(error?.message || "Failed to open Delhivery label")
  }
}
