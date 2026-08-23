import { jsPDF } from "jspdf"
import toast from "react-hot-toast"

const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
};

const getAuthToken = (): string | null => sessionStorage.getItem("authToken")

const isAgencyLogin = (() => {
    const type = String(sessionStorage.getItem("loginType") || "").toLowerCase()
    return type === "agency" || type === "collection-agency" || type === "collectionagency"
})()

/**
 * Generates a 4x6 shipping label using the SAME data set as the invoice
 * (billTo, shipTo, issuedByAgency, parcelDetails, charges) instead of the
 * old order/shipmentDetails/consignee structure.
 *
 * Barcodes removed — the tracking number is shown as large plain text in
 * the same spots the barcode used to occupy (top strip + bottom strip).
 */
export const handleLabel = async (orderId: string): Promise<void> => {
    try {
        const authToken = getAuthToken()
        if (!authToken) {
            toast.error("Authorization token missing")
            return
        }

        const endpoint = isAgencyLogin
            ? `/admin/agency/invoice?orderId=${encodeURIComponent(orderId)}`
            : `/admin/invoice?orderId=${encodeURIComponent(orderId)}`

        const response = await fetch(`/api${endpoint}`, {
            headers: { Authorization: `Bearer ${authToken}` },
        })

        if (!response.ok) {
            throw new Error("Failed to fetch label details")
        }

        const payload = await response.json().catch(() => null)
        const invoiceData = payload?.data?.invoices?.[0] || payload?.data?.invoice || payload?.data || payload || {}

        const order = invoiceData?.order || {}
        const billTo = invoiceData?.billTo || {}       // sender / booking customer
        const shipTo = invoiceData?.shipTo || {}        // receiver / consignee
        const issuedByAgency = invoiceData?.issuedByAgency || invoiceData?.agency || {}
        const parcelDetails = invoiceData?.parcelDetails || {}
        const charges = invoiceData?.charges || {}

        const amount = charges?.totalAmount ?? order?.totalAmount ?? invoiceData?.invoiceAmount ?? 0
        const transportationCharge = charges?.transportationCharge ?? 0
        const loadingCharge = charges?.loadingCharge ?? 0
        const miscellaneousCharge = charges?.miscellaneousCharge ?? 0

        const orderDate = invoiceData?.invoiceDate || order?.createdAt || invoiceData?.createdAt || ""
        const dObj = orderDate ? new Date(orderDate) : new Date()
        const dateStr = dObj.toLocaleDateString()

        const pickupAddress = invoiceData?.pickupAddress || order?.pickupAddress || billTo?.address || ""
        const deliveryAddressFull = invoiceData?.deliveryAddress || order?.deliveryAddress || shipTo?.address || ""

        const trackingNo = String(
            order?.orderNumber || invoiceData?.invoiceNumber || invoiceData?.orderNumber || orderId
        )
        const paymentType = invoiceData?.paymentType || order?.paymentType || "-"

        const franchiseName = String(issuedByAgency?.agencyName || issuedByAgency?.name || "TrueCargo")

        const returnAdd = [
            issuedByAgency?.name || issuedByAgency?.agencyName,
            issuedByAgency?.address,
            issuedByAgency?.city,
            issuedByAgency?.state,
            issuedByAgency?.pincode,
        ].filter(Boolean).join(", ")

        // -------------------------------------------------------------------
        // Build the 4x6 label (same visual layout as the original label, but
        // fed from invoice-shaped data so it stays in sync with the invoice)
        // -------------------------------------------------------------------
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "in",
            format: [4, 6],
        })

        doc.setDrawColor(0);
        doc.setLineWidth(0.025);
        doc.rect(0.1, 0.1, 3.8, 5.8); // outer border

        doc.setLineWidth(0.015);

        // Row 1: Header (Y: 0.1 -> 0.6)
        doc.line(0.1, 0.6, 3.9, 0.6);
        doc.line(2.0, 0.1, 2.0, 0.6);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        const franchiseLines = doc.splitTextToSize(franchiseName.toUpperCase(), 1.8);
        doc.text(franchiseLines, 1.05, 0.32, { align: "center" });

        try {
            const logoImg = await loadImage("https://truecargos.com/admin/images/logo.png");
            const logoW = 1.4;
            const logoH = (logoImg.height / logoImg.width) * logoW;
            const logoX = 2.95 - (logoW / 2);
            const logoY = 0.35 - (logoH / 2);
            doc.addImage(logoImg, "PNG", logoX, logoY, logoW, logoH);
        } catch (e) {
            doc.setFontSize(18);
            doc.text("TRUECARGO", 2.95, 0.40, { align: "center" });
        }

        // Row 2: Tracking Number strip (Y: 0.6 -> 1.5) — barcode replaced with big text
        doc.line(0.1, 1.5, 3.9, 1.5);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("LR Number", 2.0, 0.85, { align: "center" });

        doc.setFontSize(22);
        doc.text(trackingNo, 2.0, 1.20, { align: "center" });

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(String(shipTo?.pincode || "-"), 0.15, 1.45);
        const routingCode = shipTo?.city;
        doc.setFont("helvetica", "bold");
        doc.text(routingCode, 3.85, 1.45, { align: "right" });

        // Row 3: Ship To (Y: 1.5 -> 2.5)
        doc.line(0.1, 2.5, 3.9, 2.5);
        doc.line(2.8, 1.5, 2.8, 4.4); // vertical divider through rows 3-7

        // -- Ship To Left Pane --
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Ship To:", 0.15, 1.65);
        doc.text(String(shipTo?.name || "-").toUpperCase(), 0.15, 1.80);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const fullShipAddr = deliveryAddressFull
            || [shipTo?.address, `${shipTo?.city || ""} (${shipTo?.state || ""})`].filter(Boolean).join("\n");
        const shipLines = doc.splitTextToSize(fullShipAddr, 2.6);
        doc.text(shipLines, 0.15, 1.95);

        const addrHeight = shipLines.length * 0.15;
        doc.setFont("helvetica", "bold");
        const shipToPinPhone = [
            `PIN:${shipTo?.pincode || "-"}`,
            `PH:${shipTo?.mobileNumber || shipTo?.phone || "-"}`,
        ].join("  ");
        doc.text(shipToPinPhone, 0.15, 1.95 + addrHeight);

        // -- Ship To Right Pane (payment + amount, mirrors invoice) --
        doc.setFontSize(11);
        doc.text(String(paymentType), 3.35, 1.70, { align: "center" });
        doc.text(String(parcelDetails?.article || "Courier"), 3.35, 1.85, { align: "center" });
        doc.text("INR", 3.35, 2.25, { align: "center" });
        doc.text(String(amount), 3.35, 2.40, { align: "center" });

        // Row 4: Seller / Booking customer & Date (Y: 2.5 -> 3.3)
        doc.line(0.1, 3.3, 3.9, 3.3);

        // -- Seller (From) Left Pane --
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("From: ", 0.15, 2.65);
        doc.setFont("helvetica", "normal");
        doc.text(String(billTo?.name || "-"), doc.getTextWidth("From: ") + 0.15, 2.65);

        doc.setFont("helvetica", "bold");
        doc.text("Address: ", 0.15, 2.80);
        doc.setFont("helvetica", "normal");
        const sellerAddrVal = pickupAddress || "-";
        const sellerLines = doc.splitTextToSize(sellerAddrVal, 2.05);
        doc.text(sellerLines, doc.getTextWidth("Address: ") + 0.15, 2.85);

        // -- Date Right Pane --
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Date: ", 2.85, 2.80);
        doc.setFont("helvetica", "normal");
        doc.text(dateStr, doc.getTextWidth("Date: ") + 2.85, 2.80);

        // Row 5: Charges table header (Y: 3.3 -> 3.5)
        doc.line(0.1, 3.5, 3.9, 3.5);
        doc.line(3.4, 3.3, 3.4, 4.4);

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text("Charge", 0.15, 3.43);
        doc.text("Amt", 3.1, 3.43, { align: "center" });
        doc.text("Total", 3.65, 3.43, { align: "center" });

        // Row 6: Charges breakdown (Transportation / Loading) (Y: 3.5 -> 4.1)
        doc.line(0.1, 4.1, 3.9, 4.1);
        doc.text("Transport", 0.15, 3.65);
        doc.text("Loading", 0.15, 3.80);
        doc.text("Misc", 0.15, 3.95);

        doc.text(String(transportationCharge), 3.1, 3.65, { align: "center" });
        doc.text(String(loadingCharge), 3.1, 3.80, { align: "center" });
        doc.text(String(miscellaneousCharge), 3.1, 3.95, { align: "center" });

        doc.text("INR", 3.65, 3.70, { align: "center" });
        doc.text(String(amount), 3.65, 3.90, { align: "center" });

        // Row 7: Total row (Y: 4.1 -> 4.4)
        doc.line(0.1, 4.4, 3.9, 4.4);
        doc.setFont("helvetica", "bold");
        doc.text("Total", 0.15, 4.28);
        doc.text("INR", 3.1, 4.22, { align: "center" });
        doc.text(String(amount), 3.1, 4.38, { align: "center" });
        doc.text("INR", 3.65, 4.22, { align: "center" });
        doc.text(String(amount), 3.65, 4.38, { align: "center" });

        // Row 8: Bottom tracking number strip (Y: 4.4 -> 5.15) — barcode replaced with big text
        doc.line(0.1, 5.15, 3.9, 5.15);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text(trackingNo, 2.0, 4.90, { align: "center" });

        // Row 9: Booking agency / return address + GST (Y: 5.15 -> 5.9)
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        let footerY = 5.30;
        const retText = `Return Address: ` + (returnAdd || "-");
        const retLines = doc.splitTextToSize(retText, 3.7);
        doc.text(retLines, 0.15, footerY);
        footerY += retLines.length * 0.13;

        if (issuedByAgency?.gstNumber) {
            doc.setFont("helvetica", "bold");
            doc.text(`GSTIN: ${issuedByAgency.gstNumber}`, 0.15, footerY + 0.05);
        }

        const pdfUrl = doc.output("bloburl")
        window.open(pdfUrl, "_blank", "noopener,noreferrer")
    } catch (error: any) {
        toast.error(error?.message || "Failed to generate label")
    }
}