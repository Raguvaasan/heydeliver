import { jsPDF } from "jspdf"

interface B2BInvoiceParty {
    name?: string
    mobileNumber?: string
    phone?: string
    address?: string
    state?: string
    pincode?: string
    gstNumber?: string
}

interface B2BInvoiceDriver {
    driverName?: string
    phoneNumber?: string
    licenseNumber?: string
}

interface B2BInvoiceVehicle {
    vehicleType?: string
    capacityKg?: number
}

interface B2BInvoiceShipment {
    approximateWeight?: number
}

interface B2BInvoiceCharges {
    transportationCharge?: number
    totalAmount?: number
}

interface B2BInvoiceData {
    _id?: string
    invoiceNumber?: string
    order?: string
    orderNumber?: string
    b2bUserId?: string
    invoiceDate?: string
    createdAt?: string
    status?: string
    orderStatus?: string
    pickupAddress?: string
    deliveryAddress?: string
    billTo?: B2BInvoiceParty
    shipTo?: B2BInvoiceParty
    driver?: B2BInvoiceDriver
    vehicle?: B2BInvoiceVehicle
    shipment?: B2BInvoiceShipment
    charges?: B2BInvoiceCharges
}

const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
    })

/**
 * Fetches the B2B invoice for an order and renders it as a PDF, opened in a new tab.
 * Only includes sections/fields that actually exist in the /admin/b2b/invoice response:
 * billTo, shipTo, pickupAddress/deliveryAddress, shipment, driver, vehicle, charges.
 * No agency/parcel-count/loading/misc-charge/waybill sections, since the B2B response
 * doesn't return them.
 */
export async function generateB2BInvoice(orderId: string, authToken: string): Promise<void> {
    const response = await fetch(`/api/admin/b2b/invoice?orderId=${encodeURIComponent(orderId)}`, {
        headers: { Authorization: `Bearer ${authToken}` },
    })

    if (!response.ok) {
        const errText = await response.text()
        throw new Error(errText || "Failed to generate invoice")
    }

    const payload = await response.json().catch(() => null)
    const invoiceData: B2BInvoiceData = payload?.data || {}

    const billTo = invoiceData.billTo || {}
    const shipTo = invoiceData.shipTo || {}
    const driver = invoiceData.driver || {}
    const vehicle = invoiceData.vehicle || {}
    const shipment = invoiceData.shipment || {}
    const charges = invoiceData.charges || {}

    const transportationCharge = charges.transportationCharge ?? 0
    const totalAmount = charges.totalAmount ?? transportationCharge

    const invoiceDate = invoiceData.invoiceDate || invoiceData.createdAt || ""
    const dateStr = invoiceDate ? new Date(invoiceDate).toLocaleDateString() : new Date().toLocaleDateString()

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    const margin = 20
    const pageWidth = doc.internal.pageSize.getWidth()
    const contentWidth = pageWidth - margin * 2

    // ---------- Header ----------
    try {
        const logoImg = await loadImage("https://truecargos.com/admin/images/logo.png")
        const logoW = 40
        const logoH = (logoImg.height / logoImg.width) * logoW
        doc.addImage(logoImg, "PNG", margin, margin, logoW, logoH)
    } catch {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(24)
        doc.setTextColor(249, 115, 22)
        doc.text("TRUECARGO", margin, margin + 10)
    }

    doc.setTextColor(0)
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.text("TAX INVOICE", pageWidth - margin, margin + 10, { align: "right" })
    doc.setDrawColor(200)
    doc.line(margin, margin + 25, pageWidth - margin, margin + 25)

    // ---------- FROM (billTo) ----------
    let currentY = margin + 35
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("FROM:", margin, currentY)
    doc.setFont("helvetica", "normal")
    currentY += 5
    doc.text(String(billTo.name || "-"), margin, currentY)
    currentY += 5
    if (billTo.mobileNumber) {
        doc.text(`Phone: ${billTo.mobileNumber}`, margin, currentY)
        currentY += 5
    }
    const fromAddressParts = [invoiceData.pickupAddress || billTo.address, billTo.state, billTo.pincode]
        .filter(Boolean)
        .join(", ")
    const senderLines = doc.splitTextToSize(String(fromAddressParts || "-"), 80)
    doc.text(senderLines, margin, currentY)
    currentY += senderLines.length * 5
    if (billTo.gstNumber) {
        doc.text(`GSTIN: ${billTo.gstNumber}`, margin, currentY)
        currentY += 5
    }
    const fromBlockEndY = currentY

    // ---------- Invoice meta (right column) ----------
    const infoLabelX = pageWidth - 75
    const infoValueX = pageWidth - margin
    let infoY = margin + 35
    doc.setFontSize(10)
    const infoRow = (label: string, value: string) => {
        doc.setFont("helvetica", "bold")
        doc.text(label, infoLabelX, infoY)
        doc.setFont("helvetica", "normal")
        doc.text(value, infoValueX, infoY, { align: "right" })
        infoY += 7
    }
    infoRow("Invoice:", String(invoiceData.invoiceNumber || invoiceData.orderNumber || orderId))
    infoRow("Date:", dateStr)
    if (vehicle.vehicleType || vehicle.capacityKg) {
        const vehicleParts = [vehicle.vehicleType, vehicle.capacityKg ? `${vehicle.capacityKg} kg` : ""]
            .filter(Boolean)
            .join(" - ")
        infoRow("Vehicle:", vehicleParts)
    }

    currentY = Math.max(fromBlockEndY, infoY) + 10

    // ---------- SHIP TO ----------
    doc.setFillColor(245, 245, 245)
    doc.rect(margin, currentY, contentWidth, 10, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text("SHIP TO", margin + 5, currentY + 7)
    currentY += 15
    doc.setFontSize(11)
    doc.text(String(shipTo.name || "-").toUpperCase(), margin, currentY)
    currentY += 6
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")

    const shipAddrParts = invoiceData.deliveryAddress || [shipTo.address, shipTo.pincode].filter(Boolean).join(", ")
    const receiverLines = doc.splitTextToSize(shipAddrParts || "-", contentWidth - 10)
    doc.text(receiverLines, margin, currentY)
    currentY += receiverLines.length * 5 + 5

    const shipPhone = shipTo.mobileNumber || shipTo.phone
    if (shipPhone) {
        doc.text(`Phone: ${shipPhone}`, margin, currentY)
        currentY += 5
    }

    currentY += 5
    doc.setLineWidth(0.1)
    doc.line(margin, currentY, pageWidth - margin, currentY)
    currentY += 10

    // ---------- DRIVER DETAILS ----------
    if (driver.driverName || driver.phoneNumber || driver.licenseNumber) {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(9)
        doc.text("DRIVER DETAILS:", margin, currentY)
        doc.setFont("helvetica", "normal")
        currentY += 5
        if (driver.driverName) {
            doc.text(`Name: ${driver.driverName}`, margin, currentY)
            currentY += 5
        }
        if (driver.phoneNumber) {
            doc.text(`Phone: ${driver.phoneNumber}`, margin, currentY)
            currentY += 5
        }
        if (driver.licenseNumber) {
            doc.text(`License No: ${driver.licenseNumber}`, margin, currentY)
            currentY += 5
        }
        currentY += 5
    }

    // ---------- Charges table ----------
    doc.setDrawColor(0)
    doc.setFillColor(50, 50, 50)
    doc.rect(margin, currentY, contentWidth, 10, "F")
    doc.setTextColor(255)
    doc.setFont("helvetica", "bold")
    doc.text("Description", margin + 5, currentY + 7)
    doc.text("Weight", pageWidth - 70, currentY + 7, { align: "center" })
    doc.text("Amount", pageWidth - margin - 5, currentY + 7, { align: "right" })
    doc.setTextColor(0)
    currentY += 10
    doc.setFont("helvetica", "normal")
    doc.line(margin, currentY, pageWidth - margin, currentY)
    currentY += 8
    doc.text("Transportation Charges", margin + 5, currentY)
    doc.text(shipment.approximateWeight ? `${shipment.approximateWeight} kg` : "-", pageWidth - 70, currentY, { align: "center" })
    doc.text(`INR ${transportationCharge}`, pageWidth - margin - 5, currentY, { align: "right" })
    currentY += 12

    const summaryLabelX = pageWidth - margin - 80
    const summaryValueX = pageWidth - margin - 5

    doc.setDrawColor(200)
    doc.setLineWidth(0.1)
    doc.line(summaryLabelX, currentY, summaryValueX, currentY)
    currentY += 8

    doc.setFont("helvetica", "bold")
    doc.setFontSize(13)
    doc.setTextColor(0)
    doc.text("Total:", summaryLabelX, currentY)
    doc.setTextColor(249, 115, 22)
    doc.text(`INR ${totalAmount}`, summaryValueX, currentY, { align: "right" })

    const pdfUrl = doc.output("bloburl")
    window.open(pdfUrl, "_blank", "noopener,noreferrer")
}

function formatStatusLabel(status: string): string {
    return status.replace(/_/g, " ")
}