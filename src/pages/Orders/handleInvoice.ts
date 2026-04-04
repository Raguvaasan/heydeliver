import { jsPDF } from "jspdf"
import toast from "react-hot-toast"

// Code 39 encoder for barcodes without dependencies
const CODE39: Record<string, string> = {
  '0': 'bwbWBwBwb', '1': 'BwbWbwbwB', '2': 'bwBWbwbwB', '3': 'BwBWbwbwb',
  '4': 'bwbWBwbwB', '5': 'BwbWBwbwb', '6': 'bwBWBwbwb', '7': 'bwbWbwBwB',
  '8': 'BwbWbwBwb', '9': 'bwBWbwBwb', 'A': 'BwbwbWbwB', 'B': 'bwBwbWbwB',
  'C': 'BwBwbWbwb', 'D': 'bwbwBWbwB', 'E': 'BwbwBWbwb', 'F': 'bwBwBWbwb',
  'G': 'bwbwbWBwB', 'H': 'BwbwbWBwb', 'I': 'bwBwbWBwb', 'J': 'bwbwBWBwb',
  'K': 'BwbwbwbWB', 'L': 'bwBwbwbWB', 'M': 'BwBwbwbWb', 'N': 'bwbwBwbWB',
  'O': 'BwbwBwbWb', 'P': 'bwBwBwbWb', 'Q': 'bwbwbwBWB', 'R': 'BwbwbwBWb',
  'S': 'bwBwbwBWb', 'T': 'bwbwBwBWb', 'U': 'BWbwbwbwb', 'V': 'bWBwbwbwb',
  'W': 'BWBwbwbwb', 'X': 'bWbwBwbwb', 'Y': 'BWbwBwbwb', 'Z': 'bWBwBwbwb',
  '-': 'bWbwbwBwb', '.': 'BWbwbwBwb', ' ': 'bWBwbwBwb', '*': 'bWbwBwBwb',
  '$': 'bWbWbWbwb', '/': 'bWbWbwbWb', '+': 'bWbwbWbWb', '%': 'bwbWbWbWb'
};

const drawCode39 = (doc: jsPDF, text: string, x: number, y: number, w: number, h: number) => {
  doc.setFillColor(0, 0, 0);
  const safeText = ('*' + text.toUpperCase().replace(/[^0-9A-Z\-\.\ \$\/\+\%]/g, '') + '*');
  let totalWidth = 0;
  const ratio = 2.5;
  for (let i = 0; i < safeText.length; i++) {
    const pattern = CODE39[safeText.charAt(i)];
    if (!pattern) continue;
    for (let j = 0; j < pattern.length; j++) {
      const char = pattern.charAt(j);
      totalWidth += (char.toLowerCase() === char) ? 1 : ratio;
    }
    totalWidth += 1; // inter-character gap
  }

  const unit = w / totalWidth;
  let currX = x;
  for (let i = 0; i < safeText.length; i++) {
    const pattern = CODE39[safeText.charAt(i)];
    if (!pattern) continue;
    for (let j = 0; j < pattern.length; j++) {
      const char = pattern.charAt(j);
      const isBar = (char === 'B' || char === 'b');
      const isWide = (char === 'B' || char === 'W');
      const barW = (isWide ? ratio : 1) * unit;
      if (isBar) {
        doc.rect(currX, y, barW, h, 'F');
      }
      currX += barW;
    }
    currX += unit;
  }
};

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

export const handleInvoice = async (orderId: string): Promise<void> => {
  try {
    const authToken = sessionStorage.getItem("authToken")
    if (!authToken) {
      toast.error("Authorization token missing")
      return
    }

    const response = await fetch(`/api/shipment/order/${encodeURIComponent(orderId)}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || "Failed to fetch order details")
    }

    const payload = await response.json()
    const order = payload?.data || {}
    const consignee = order?.consignee || {}
    const shipmentDetails = order?.shipmentDetails || {}
    const pickupLocation = order?.pickupLocation || {}
    const from = order?.from || {}

    const amount = order?.amount || 0
    const orderDate = order?.createdAt || order?.updatedAt || ""
    const dObj = orderDate ? new Date(orderDate) : new Date();
    const dateStr = dObj.toLocaleDateString();

    const awb = order.waybill;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (margin * 2);

    // --- Header ---
    try {
      const logoImg = await loadImage("/truecargo-invoice-logo.png");
      const logoW = 40;
      const logoH = (logoImg.height / logoImg.width) * logoW;
      doc.addImage(logoImg, "PNG", margin, margin, logoW, logoH);
    } catch (e) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(249, 115, 22); // Orange-500
      doc.text("TRUECARGO", margin, margin + 10);
    }

    doc.setTextColor(0);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", pageWidth - margin, margin + 10, { align: "right" });

    doc.setDrawColor(200);
    doc.line(margin, margin + 25, pageWidth - margin, margin + 25);

    // --- Info Section ---
    let currentY = margin + 35;

    // Left: Business Info (Seller)
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("FROM:", margin, currentY);
    doc.setFont("helvetica", "normal");
    currentY += 5;
    
    // Explicitly use from/seller name and address as per label
    const senderName = from?.name || order?.franchiseName || "Freightrek Private Limited";
    doc.text(String(senderName), margin, currentY);
    
    currentY += 5;
    const senderAddr = from?.address || "";
    const senderCity = from?.city || "";
    const senderState = from?.state || "";
    const senderPin = from?.pin || "";
    
    let senderFull = "";
    if (senderAddr) {
      senderFull = `${senderAddr}, ${senderCity}, ${senderState} ${senderPin}`;
    } else {
      // Fallback only if from is completely empty, but prioritize seller data
      senderFull = pickupLocation?.address ? `${pickupLocation.address}, ${pickupLocation.pin}` : "";
    }
    
    const senderLines = doc.splitTextToSize(senderFull, 80);
    doc.text(senderLines, margin, currentY);

    // Right: Shipment Barcode & Details
    let infoY = margin + 35;
    if (awb) {
      drawCode39(doc, awb, pageWidth - margin - 50, infoY - 5, 50, 10);
      doc.setFontSize(8);
      doc.text(awb, pageWidth - margin - 25, infoY + 8, { align: "center" });
      infoY += 15;
    }

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Invoice:", pageWidth - 70, infoY);
    doc.setFont("helvetica", "normal");
    doc.text(shipmentDetails?.order?.replace("ORD", "INV") || "-", pageWidth - margin, infoY, { align: "right" });

    infoY += 7;
    doc.setFont("helvetica", "bold");
    doc.text("Date:", pageWidth - 70, infoY);
    doc.setFont("helvetica", "normal");
    doc.text(dateStr, pageWidth - margin, infoY, { align: "right" });

    infoY += 7;
    doc.setFont("helvetica", "bold");
    doc.text("Order ID:", pageWidth - 70, infoY);
    doc.setFont("helvetica", "normal");
    doc.text(String(shipmentDetails?.order || "-"), pageWidth - margin, infoY, { align: "right" });

    const receiverCity = consignee?.city || "";
    const validCity = typeof receiverCity === 'string' && receiverCity.length >= 3 ? receiverCity : "MAD";
    const routingCode = validCity.substring(0, 3).toUpperCase() + "/AVA";

    infoY += 7;
    doc.setFont("helvetica", "bold");
    doc.text("Routing:", pageWidth - 70, infoY);
    doc.setFont("helvetica", "normal");
    doc.text(routingCode, pageWidth - margin, infoY, { align: "right" });

    currentY = Math.max(currentY + (senderLines.length * 5), infoY + 10);

    // --- Billing & Shipping Modes ---
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, currentY, contentWidth, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO / SHIP TO", margin + 5, currentY + 7);

    // Modes inline
    doc.setFontSize(9);
    doc.text(`MODE: ${shipmentDetails.shippingMode || "-"} | PAY: ${shipmentDetails.paymentMode || "-"}`, pageWidth - margin - 5, currentY + 7, { align: "right" });

    currentY += 15;
    doc.setFontSize(11);
    doc.text(String(consignee?.name || "-").toUpperCase(), margin, currentY);
    currentY += 6;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const receiverPin = consignee?.pin || "";
    const receiverAddr = `${consignee?.address || ""}, ${consignee?.city || ""} (${consignee?.state || ""}) - ${receiverPin}`;
    const receiverLines = doc.splitTextToSize(receiverAddr, contentWidth - 10);
    doc.text(receiverLines, margin, currentY);
    currentY += (receiverLines.length * 5) + 5;
    doc.text(`Phone: ${consignee?.phone || "-"}`, margin, currentY);

    currentY += 10;

    // --- Shipment Details Row ---
    doc.setLineWidth(0.1);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 5;
    doc.setFontSize(9);
    doc.text(`Weight: ${order.shipmentDetails.weight || "-"} gm`, margin, currentY);
    doc.text(`AWB: ${awb}`, pageWidth / 2, currentY, { align: "center" });
    doc.text(`Return PIN: ${senderPin}`, pageWidth - margin, currentY, { align: "right" });
    currentY += 5;
    doc.line(margin, currentY, pageWidth - margin, currentY);

    currentY += 10;

    // --- Return Address Section ---
    const returnAdd = [
      pickupLocation?.name,
      pickupLocation?.address,
      pickupLocation?.pin
    ].filter(Boolean).join(", ");

    if (returnAdd) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("RETURN ADDRESS:", margin, currentY);
      doc.setFont("helvetica", "normal");
      currentY += 5;
      const retLines = doc.splitTextToSize(returnAdd, contentWidth);
      doc.text(retLines, margin, currentY);
      currentY += (retLines.length * 5) + 5;
    }

    // --- Table ---
    doc.setDrawColor(0);
    doc.setLineWidth(0.1);
    doc.setFillColor(50, 50, 50);
    doc.rect(margin, currentY, contentWidth, 10, "F");

    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.text("Description", margin + 5, currentY + 7);
    doc.text("Qty", pageWidth - 70, currentY + 7, { align: "center" });
    doc.text("Unit Price", pageWidth - 45, currentY + 7, { align: "center" });
    doc.text("Total", pageWidth - margin - 5, currentY + 7, { align: "right" });

    doc.setTextColor(0);
    currentY += 10;

    // Table content
    doc.setFont("helvetica", "normal");
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 8;
    doc.text("Logistic Services - Courier Charges", margin + 5, currentY);
    doc.text("1", pageWidth - 70, currentY, { align: "center" });
    doc.text(`INR ${amount}`, pageWidth - 45, currentY, { align: "center" });
    doc.text(`INR ${amount}`, pageWidth - margin - 5, currentY, { align: "right" });

    currentY += 5;
    doc.line(margin, currentY, pageWidth - margin, currentY);

    // --- Totals ---
    currentY += 20;
    const totalX = pageWidth - margin - 80;
    doc.setFont("helvetica", "bold");
    doc.text("Subtotal:", totalX, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(`INR ${amount}`, pageWidth - margin - 5, currentY, { align: "right" });

    currentY += 7;
    doc.setFont("helvetica", "bold");
    // doc.text("Tax (0%):", totalX, currentY);
    doc.setFont("helvetica", "normal");
    // doc.text(`INR 0.00`, pageWidth - margin - 5, currentY, { align: "right" });

    currentY += 5;
    doc.setLineWidth(0.5);
    doc.line(totalX, currentY, pageWidth - margin, currentY);

    currentY += 8;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Total Amount:", totalX, currentY);
    doc.setTextColor(249, 115, 22);
    doc.text(`INR ${amount}`, pageWidth - margin - 5, currentY, { align: "right" });

    // --- Footer ---
    const footerY = doc.internal.pageSize.getHeight() - 30;
    doc.setDrawColor(200);
    doc.line(margin, footerY, pageWidth - margin, footerY);
    doc.setTextColor(100);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for your business!", pageWidth / 2, footerY + 10, { align: "center" });
    doc.text("Freightrek Private Limited | support@truecargos.com | https://truecargos.com", pageWidth / 2, footerY + 15, { align: "center" });

    const pdfUrl = doc.output("bloburl")
    window.open(pdfUrl, "_blank", "noopener,noreferrer")
  } catch (error: any) {
    toast.error(error?.message || "Failed to generate invoice")
  }
}
