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

export const handleLabel = async (orderId: string): Promise<void> => {
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
    const returnAdd = [
      pickupLocation?.name,
      pickupLocation?.address,
      pickupLocation?.pin
    ].filter(Boolean).join(", ");

    const awb = String(shipmentDetails?.order)

    const senderName = from?.name
    const senderAddressStr = from?.address
    const senderCityStr = from?.city
    const senderStateStr = from?.state
    const senderPinStr = from?.pin
    const defaultSenderAddress = `${senderAddressStr}, ${senderCityStr}, ${senderStateStr} ${senderPinStr}`;

    const receiverName = consignee?.name
    const receiverAddress = consignee?.address
    const receiverCity = consignee?.city
    const receiverState = consignee?.state
    const receiverPin = consignee?.pin

    const amount = order?.amount
    const orderDate = order?.createdAt || order?.updatedAt || ""

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "in",
      format: [4, 6],
    })

    doc.setDrawColor(0);
    // Outer Border
    doc.setLineWidth(0.025);
    doc.rect(0.1, 0.1, 3.8, 5.8);

    doc.setLineWidth(0.015);

    // Row 1: Header (Y: 0.1 -> 0.6)
    doc.line(0.1, 0.6, 3.9, 0.6);
    doc.line(2.0, 0.1, 2.0, 0.6);

    const franchiseName = order?.franchiseName || "TrueCargo";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    const franchiseLines = doc.splitTextToSize(franchiseName.toUpperCase(), 1.8);
    doc.text(franchiseLines, 1.05, 0.32, { align: "center" });

    // Project Logo instead of "DELHIVERY"
    try {
      const logoImg = await loadImage("/admin/images/logo.png");
      const logoW = 1.4;
      const logoH = (logoImg.height / logoImg.width) * logoW;
      const logoX = 2.95 - (logoW / 2);
      const logoY = 0.35 - (logoH / 2);
      doc.addImage(logoImg, "PNG", logoX, logoY, logoW, logoH);
    } catch (e) {
      doc.setFontSize(18);
      doc.text("TRUECARGO", 2.95, 0.40, { align: "center" });
    }

    // Row 2: Top Barcode (Y: 0.6 -> 1.5)
    doc.line(0.1, 1.5, 3.9, 1.5);
    drawCode39(doc, awb, 0.4, 0.65, 3.2, 0.55);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(awb, 2.0, 1.35, { align: "center" });

    doc.setFontSize(12);
    doc.text(String(receiverPin), 0.15, 1.45);
    const validCity = typeof receiverCity === 'string' && receiverCity.length >= 3 ? receiverCity : "MAD";
    const routingCode = validCity.substring(0, 3).toUpperCase() + "/AVA";
    doc.setFont("helvetica", "bold");
    doc.text(routingCode, 3.85, 1.45, { align: "right" });

    // Row 3: Ship To (Y: 1.5 -> 2.5)
    doc.line(0.1, 2.5, 3.9, 2.5);
    // Vertical line connecting Row 3, 4, 5, 6, 7
    doc.line(2.8, 1.5, 2.8, 4.4);

    // -- Ship To Left Pane --
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Ship To:", 0.15, 1.65);
    doc.text(String(receiverName).toUpperCase(), 0.15, 1.80);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const fullShipAddr = [
      receiverName,
      receiverAddress,
      `${receiverCity} (${receiverState})`
    ].filter(Boolean).join("\n");
    const shipLines = doc.splitTextToSize(fullShipAddr, 2.6);
    doc.text(shipLines, 0.15, 1.95);

    const addrHeight = shipLines.length * 0.15;
    doc.setFont("helvetica", "bold");
    doc.text(`PIN:${receiverPin}`, 0.15, 1.95 + addrHeight);

    // -- Ship To Right Pane --
    doc.setFontSize(12);
    doc.text(`${shipmentDetails.paymentMode}`, 3.35, 1.70, { align: "center" });
    doc.text(`${shipmentDetails.shippingMode}`, 3.35, 1.85, { align: "center" });
    doc.text("INR", 3.35, 2.25, { align: "center" });
    doc.text(String(amount), 3.35, 2.40, { align: "center" });

    // Row 4: Seller & Date (Y: 2.5 -> 3.3)
    doc.line(0.1, 3.3, 3.9, 3.3);

    // -- Seller Left Pane --
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Seller: ", 0.15, 2.65);
    doc.setFont("helvetica", "normal");
    doc.text(String(senderName), doc.getTextWidth("Seller: ") + 0.15, 2.65);

    doc.setFont("helvetica", "bold");
    doc.text("Address: ", 0.15, 2.80);
    doc.setFont("helvetica", "normal");
    const sellerAddrVal = order?.pickupLocation?.address ?
      `${senderAddressStr}, ${senderCityStr}, ${senderStateStr} ${senderPinStr}` :
      defaultSenderAddress;
    const sellerLines = doc.splitTextToSize(sellerAddrVal, 2.05);
    doc.text(sellerLines, doc.getTextWidth("Address: ") + 0.15, 2.85);

    // -- Date Right Pane --
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Date: ", 2.85, 2.80);
    doc.setFont("helvetica", "normal");
    const dObj = orderDate ? new Date(orderDate) : new Date();
    const dateStr = `${dObj.getFullYear()}-${dObj.getMonth() + 1}-${dObj.getDate()}`;
    const timeStr = `${dObj.getHours()}: ${dObj.getMinutes()}: ${dObj.getSeconds()}`;
    doc.text(dateStr, doc.getTextWidth("Date: ") + 2.85, 2.80);
    doc.text(timeStr, 2.85, 3.00);

    // Row 5: Table Header (Y: 3.3 -> 3.5)
    doc.line(0.1, 3.5, 3.9, 3.5);
    doc.line(3.4, 3.3, 3.4, 4.4);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Product(Qty)", 0.15, 3.43);
    doc.text("Price", 3.1, 3.43, { align: "center" });
    doc.text("Total", 3.65, 3.43, { align: "center" });

    // Row 6: Table Item Row (Y: 3.5 -> 4.1)
    doc.line(0.1, 4.1, 3.9, 4.1);
    doc.text("", 0.15, 3.75);
    doc.text("INR", 3.1, 3.70, { align: "center" });
    doc.text(String(amount), 3.1, 3.90, { align: "center" });
    doc.text("INR", 3.65, 3.70, { align: "center" });
    doc.text(String(amount), 3.65, 3.90, { align: "center" });

    // Row 7: Table Total Row (Y: 4.1 -> 4.4)
    doc.line(0.1, 4.4, 3.9, 4.4);
    doc.text("Total", 0.15, 4.28);
    doc.text("INR", 3.1, 4.22, { align: "center" });
    doc.text(String(amount), 3.1, 4.38, { align: "center" });
    doc.text("INR", 3.65, 4.22, { align: "center" });
    doc.text(String(amount), 3.65, 4.38, { align: "center" });

    // Row 8: Bottom barcode (Y: 4.4 -> 4.95)
    doc.line(0.1, 5.15, 3.9, 5.15);
    const botBarcodeText = String(shipmentDetails?.order);
    drawCode39(doc, botBarcodeText, 0.4, 4.55, 3.2, 0.40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(botBarcodeText, 2.0, 5.05, { align: "center" });

    // Row 9: Return Address (Y: 4.95 -> 5.9)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const retText = `Return Address: ` + returnAdd;
    const retLines = doc.splitTextToSize(retText, 3.7);
    doc.text(retLines, 0.15, 5.30);

    const pdfUrl = doc.output("bloburl")
    window.open(pdfUrl, "_blank", "noopener,noreferrer")
  } catch (error: any) {
    toast.error(error?.message || "Failed to generate label")
  }
}
