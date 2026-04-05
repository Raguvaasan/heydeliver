import toast from "react-hot-toast"

export const handleDelhiveryLabel = async (waybill: string): Promise<void> => {
  try {
    const cleanWaybill = String(waybill || "").trim()
    if (!cleanWaybill) {
      toast.error("Waybill is missing for this order")
      return
    }

    // Server-side proxy fetches Delhivery PDF and strips amount values
    const response = await fetch(`/api/delhivery-label?waybill=${encodeURIComponent(cleanWaybill)}`, {
      method: "GET",
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || "Failed to fetch Delhivery label")
    }

    const pdfBytes = await response.arrayBuffer()
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
  } catch (error: any) {
    toast.error(error?.message || "Failed to open Delhivery label")
  }
}
