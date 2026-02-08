import type { VercelRequest, VercelResponse } from '@vercel/node'
import axios from 'axios'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

const BACKEND_API_URL = process.env['BACKEND_API_URL'] || 'https://freightrekapi.vercel.app'

const safe = (value?: string | null) => (value ? String(value) : '')

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'GET') {
    return response.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { id } = request.query
    if (!id || typeof id !== 'string') {
      return response.status(400).json({ success: false, message: 'Order ID is required' })
    }

    const authHeader = request.headers.authorization
    if (!authHeader) {
      return response.status(401).json({ success: false, message: 'Authorization token required' })
    }

    const backendUrl = `${BACKEND_API_URL}/api/shipment/order/${encodeURIComponent(id)}`
    const backendResponse = await axios.get(backendUrl, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
      validateStatus: (status) => status < 500,
    })

    if (backendResponse.status >= 400) {
      return response.status(backendResponse.status).json(backendResponse.data)
    }

    const shipment = backendResponse.data?.data ?? backendResponse.data ?? {}
    const consignee = shipment?.consignee ?? shipment?.receiver ?? {}
    const sender = shipment?.sender ?? shipment?.shipper ?? {}

    const receiverName =
      safe(consignee?.name) ||
      safe(shipment?.customerName) ||
      safe(shipment?.name) ||
      'Receiver'
    const receiverPhone = safe(consignee?.phone) || safe(shipment?.customerNumber) || safe(shipment?.phone)
    const receiverAddress =
      safe(consignee?.address) ||
      safe(shipment?.deliveryAddress) ||
      safe(shipment?.add) ||
      ''
    const receiverCity = safe(consignee?.city) || safe(shipment?.deliveryCity)
    const receiverState = safe(consignee?.state) || safe(shipment?.deliveryState)
    const receiverPin = safe(consignee?.pin) || safe(shipment?.deliveryPincode)

    const senderName =
      safe(shipment?.sellerName) ||
      safe(sender?.name) ||
      safe(shipment?.pickupLocation?.name) ||
      safe(shipment?.pickup_location?.name) ||
      'Sender'
    const senderPhone = safe(sender?.phone) || safe(shipment?.sellerPhone)
    const senderAddress = safe(shipment?.sellerAdd) || safe(sender?.address) || safe(shipment?.sellerAddress) || ''
    const senderCity = safe(sender?.city) || safe(shipment?.sellerCity)
    const senderState = safe(sender?.state) || safe(shipment?.sellerState)
    const senderPin = safe(sender?.pin) || safe(shipment?.sellerPincode)

    const awb =
      safe(shipment?.waybill) ||
      safe(shipment?.trackingNumber) ||
      safe(shipment?.awb) ||
      safe(shipment?.airwayBill) ||
      safe(shipment?.orderId) ||
      safe(shipment?.bookingId)

    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Invoice</title>
    <style>
      @page {
        size: 4in 6in;
        margin: 0.2in;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Arial, Helvetica, sans-serif;
        color: #000;
        background: #fff;
        width: 4in;
        height: 6in;
      }
      .label {
        width: 100%;
        height: 100%;
        border: 2px solid #000;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .title {
        font-size: 14px;
        font-weight: 700;
        text-transform: uppercase;
      }
      .awb {
        font-size: 16px;
        font-weight: 700;
        border: 2px solid #000;
        padding: 6px;
        text-align: center;
        letter-spacing: 1px;
      }
      .block {
        border: 1px solid #000;
        padding: 8px;
        font-size: 11px;
        line-height: 1.35;
      }
      .block h4 {
        margin: 0 0 4px 0;
        font-size: 11px;
        text-transform: uppercase;
      }
      .muted { font-size: 10px; }
    </style>
  </head>
  <body>
    <div class="label">
      <div class="title">Invoice</div>
      <div class="awb">AWB / Tracking: ${safe(awb) || 'N/A'}</div>
      <div class="block">
        <h4>Sender</h4>
        <div><strong>${safe(senderName)}</strong></div>
        <div>${safe(senderAddress)}</div>
        <div>${safe(senderCity)} ${safe(senderState)} ${safe(senderPin)}</div>
        <div class="muted">${safe(senderPhone)}</div>
      </div>
      <div class="block">
        <h4>Receiver</h4>
        <div><strong>${safe(receiverName)}</strong></div>
        <div>${safe(receiverAddress)}</div>
        <div>${safe(receiverCity)} ${safe(receiverState)} ${safe(receiverPin)}</div>
        <div class="muted">${safe(receiverPhone)}</div>
      </div>
    </div>
  </body>
</html>`

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    })
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({
      width: '4in',
      height: '6in',
      printBackground: false,
      scale: 1,
      preferCSSPageSize: true,
    })

    await browser.close()

    response.setHeader('Content-Type', 'application/pdf')
    response.setHeader('Content-Disposition', `inline; filename="invoice-${id}.pdf"`)
    return response.status(200).send(pdfBuffer)
  } catch (error: any) {
    console.error('[Invoice Generator] Error:', error)
    return response.status(500).json({
      success: false,
      message: error?.message || 'Failed to generate invoice',
    })
  }
}
