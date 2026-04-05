import type { VercelRequest, VercelResponse } from '@vercel/node'
import axios from 'axios'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'
import url from 'url'
import { PDFDocument, rgb } from 'pdf-lib'

// Helper constants
const BACKEND_API_URL = process.env['BACKEND_API_URL'] || 'https://freightrekapi.vercel.app'
const DELHIVERY_TOKEN = process.env['DELHIVERY_API_TOKEN'] || '91aeec33f78a2d21a6348658708de71f31489038'

// Helpers for response formatting
function sendCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,PATCH,DELETE')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version'
  )
}

function safe(value?: any) {
  return value != null ? String(value) : ''
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  sendCorsHeaders(res)
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const parsedUrl = new URL(req.url || '', 'http://localhost')
  const path = parsedUrl.pathname.replace(/^\/api\/?/, '')
  const segments = path.split('/').filter(Boolean) // ['admin','dashboard',...]

  try {
    // ROUTING
    // --- authentication/login endpoints (were missing in catch‑all) ---
    if (segments[0] === 'admin' && segments[1] === 'auth' && segments[2] === 'login') {
      // POST /api/admin/auth/login
      if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' })
      }
      const backendUrl = `${BACKEND_API_URL}/admin/auth/login`
      const backendResponse = await axios.post(backendUrl, req.body, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
        validateStatus: (status) => status < 500,
      })
      return res.status(backendResponse.status).json(backendResponse.data)
    }
    if (segments[0] === 'admin' && segments[1] === 'agency' && segments[2] === 'login') {
      // POST /api/admin/agency/login
      if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' })
      }
      const backendUrl = `${BACKEND_API_URL}/admin/agency/login`
      const backendResponse = await axios.post(backendUrl, req.body, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
        validateStatus: (status) => status < 500,
      })
      return res.status(backendResponse.status).json(backendResponse.data)
    }
    if (
      segments[0] === 'admin' &&
      segments[1] === 'staff' &&
      segments[2] === 'login' &&
      segments[3] === 'headquarter'
    ) {
      // POST /api/admin/staff/login/headquarter
      if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' })
      }
      const backendUrl = `${BACKEND_API_URL}/admin/staff/login/headquarter`
      const backendResponse = await axios.post(backendUrl, req.body, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
        validateStatus: (status) => status < 500,
      })
      return res.status(backendResponse.status).json(backendResponse.data)
    }

    // existing specific handlers follow
    if (segments[0] === 'admin' && segments[1] === 'reports') {
      // identical to original api/admin/reports.ts
      if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' })
      }

      const authHeader = req.headers.authorization
      if (!authHeader) {
        return res.status(401).json({ success: false, message: 'Authorization token required' })
      }

      // compute backendPath after admin/reports/
      const rest = segments.slice(2).join('/') // everything after admin/reports
      let backendUrl = `${BACKEND_API_URL}/admin/reports/${rest}`
      const params: any = {}
      if (parsedUrl.searchParams.get('period')) params.period = parsedUrl.searchParams.get('period')
      if (parsedUrl.searchParams.get('startDate')) params.startDate = parsedUrl.searchParams.get('startDate')
      if (parsedUrl.searchParams.get('endDate')) params.endDate = parsedUrl.searchParams.get('endDate')

      const backendResponse = await axios.get(backendUrl, {
        headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
        params,
        timeout: 30000,
        validateStatus: (status) => status < 500,
      })

      if (backendResponse.status === 401 || backendResponse.status === 403) {
        if (rest === 'delivery-performance') {
          return res.status(200).json({
            success: true,
            data: {
              overview: {
                onTimePercent: 94.5,
                avgDeliveryTime: 2.3,
                firstAttemptSuccess: 89.2,
                csatScore: 4.6,
                totalDelivered: 6590,
                slaMet: 96.8,
              },
              zonePerformance: [
                { zone: 'Zone A', deliveries: 1850, onTime: 96.2, avgTime: '1.8 days' },
                { zone: 'Zone B', deliveries: 1620, onTime: 94.8, avgTime: '2.1 days' },
              ],
              attemptAnalysis: [
                { label: '1st Attempt Success', value: 89.2 },
                { label: '2nd Attempt Success', value: 8.3 },
              ],
              timeDistribution: [
                { label: 'Within 1 day', value: 35 },
                { label: '1-2 days', value: 42 },
              ],
              period: params.period || 'thisMonth',
            },
          })
        }
        return res.status(200).json({ success: true, data: {} })
      }
      return res.status(backendResponse.status).json(backendResponse.data)
    }

    if (segments[0] === 'admin' && segments[1] === 'dashboard') {
      // copy from api/admin/dashboard.ts (simplified)
      if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' })
      }
      const authHeader = req.headers.authorization
      if (!authHeader) {
        console.error('[Admin Dashboard API] Missing authorization token')
        return res.status(401).json({ success: false, message: 'Authorization token required' })
      }
      const { type, period = 'week', limit = '5' } = req.query as any
      let backendUrl = `${BACKEND_API_URL}/admin/dashboard`
      const params: any = {}
      if (type === 'top-franchises') {
        backendUrl += '/top-franchises'
        params.limit = limit
      } else if (type === 'wallet-statistics') {
        backendUrl += '/wallet-statistics'
      } else {
        params.period = period
      }
      const backendResponse = await axios.get(backendUrl, {
        headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
        params,
        timeout: 30000,
        validateStatus: (status) => status < 500,
      })
      if (backendResponse.status === 401 || backendResponse.status === 403) {
        // return same mock data as original file
        if (type === 'top-franchises') {
          return res.status(200).json({
            success: true, data: [
              { franchiseId: '1', franchiseName: 'Mumbai Franchise', shipmentCount: 245, totalRevenue: 125000 },
              { franchiseId: '2', franchiseName: 'Delhi Franchise', shipmentCount: 198, totalRevenue: 98000 },
              { franchiseId: '3', franchiseName: 'Bangalore Franchise', shipmentCount: 176, totalRevenue: 87500 },
              { franchiseId: '4', franchiseName: 'Chennai Franchise', shipmentCount: 142, totalRevenue: 71000 },
              { franchiseId: '5', franchiseName: 'Pune Franchise', shipmentCount: 128, totalRevenue: 64000 }
            ]
          })
        }
        if (type === 'wallet-statistics') {
          return res.status(200).json({
            success: true, data: {
              totalBalance: 184.6,
              totalWallets: 5,
              credits: { amount: 308, count: 11 },
              debits: { amount: 123.4, count: 3 }
            }
          })
        }
        return res.status(200).json({
          success: true, data: {
            overview: { activeShipments: { total: 0, inTransit: 0, outForDelivery: 0 }, totalShipments: { count: 0, currentPeriod: 0, percentageChange: '0.0' }, revenue: { total: 0, percentageChange: '0.0', currency: '₹' }, activeAgencies: 0 },
            revenueTrend: [],
            shipmentTypeDistribution: [],
            recentBookings: [],
            period: period
          }
        })
      }
      return res.status(backendResponse.status).json(backendResponse.data)
    }

    if (segments[0] === 'dashboard') {
      // copy from api/dashboard/[[...path]].ts
      if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' })
      }
      const authHeader = req.headers.authorization
      if (!authHeader) {
        console.error('[Dashboard API] Missing authorization token')
        return res.status(401).json({ success: false, message: 'Authorization token required' })
      }
      let backendPath = '/api/dashboard'
      if (parsedUrl.pathname.endsWith('/orders-report')) {
        backendPath = '/api/dashboard/orders-report'
      }
      const backendUrl = `https://freightrekapi.vercel.app${backendPath}${parsedUrl.search}`
      const backendResponse = await axios.get(backendUrl, {
        headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
        timeout: 30000,
        validateStatus: (status) => status < 500,
      })
      if (backendResponse.status === 401 || backendResponse.status === 403) {
        if (backendPath === '/api/dashboard') {
          return res.status(200).json({ success: true, data: { overview: { activeShipments: { total: 0, inTransit: 0, outForDelivery: 0 }, totalShipments: { count: 0, currentPeriod: 0, percentageChange: '0.0' }, revenue: { total: 0, percentageChange: '0.0', currency: '₹' } }, revenueTrend: [], shipmentTypeDistribution: [], recentBookings: [], period: 'week' } })
        }
      }
      return res.status(backendResponse.status).json(backendResponse.data)
    }

    if (segments[0] === 'settings') {
      // copy from api/settings/[...path].ts
      if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' })
      }
      const authToken = req.headers.authorization
      if (!authToken) {
        return res.status(401).json({ success: false, message: 'Unauthorized' })
      }
      const apiPath = segments.slice(1).join('/')
      const backendUrl = `${BACKEND_API_URL}/api/v1/settings/${apiPath}`
      if (req.method === 'GET') {
        const backendResponse = await axios.get(backendUrl, { headers: { Authorization: authToken } })
        return res.status(200).json(backendResponse.data)
      } else {
        const backendResponse = await axios.post(backendUrl, req.body, { headers: { Authorization: authToken, 'Content-Type': 'application/json' } })
        return res.status(200).json(backendResponse.data)
      }
    }

    if (segments[0] === 'shipment') {
      // depending on second segment
      if (segments[1] === 'orders') {
        // GET /api/shipment/orders
        if (req.method === 'OPTIONS') { return res.status(200).end() }
        const { page = 1, limit = 20, status } = req.query as any
        const authHeader = req.headers.authorization
        if (!authHeader) return res.status(401).json({ success: false, message: 'Authorization header is required' })
        const params: any = { page, limit }
        if (status && status !== 'all') params.status = status
        const backendResponse = await axios.get(`${BACKEND_API_URL}/api/shipment/orders`, {
          headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
          params,
          timeout: 30000,
        })
        return res.status(200).json(backendResponse.data)
      }
      if (segments[1] === 'create' && req.method === 'POST') {
        // POST /api/shipment/create → proxy to backend
        const authHeader = req.headers.authorization
        if (!authHeader) return res.status(401).json({ success: false, message: 'Authorization header is required' })
        const backendResponse = await axios.post(`${BACKEND_API_URL}/api/shipment/create`, req.body, {
          headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
          timeout: 30000,
          validateStatus: (s: number) => s < 500,
        })
        return res.status(backendResponse.status).json(backendResponse.data)
      }
      if (segments[1] === 'order' && segments[2]) {
        // GET /api/shipment/order/:id
        if (req.method !== 'GET' && req.method !== 'DELETE' && req.method !== 'PUT') return res.status(405).json({ success: false, message: 'Method not allowed' })
        const id = segments[2]
        const authHeader = req.headers.authorization
        if (!authHeader) return res.status(401).json({ success: false, message: 'Authorization token required' })

        let backendResponse
        if (req.method === 'GET') {
          backendResponse = await axios.get(`${BACKEND_API_URL}/api/shipment/order/${encodeURIComponent(id)}`, {
            headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
            timeout: 30000,
            validateStatus: (status) => status < 500,
          })
        } else {
          backendResponse = await axios({
            method: req.method,
            url: `${BACKEND_API_URL}/api/shipment/order/${encodeURIComponent(id)}`,
            data: req.body,
            headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
            timeout: 30000,
            validateStatus: (status) => status < 500,
          })
        }
        return res.status(backendResponse.status).json(backendResponse.data)
      }
      if (segments[1] === 'invoice' && segments[2]) {
        // invoice generation
        if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' })
        const id = segments[2]
        const authHeader = req.headers.authorization
        if (!authHeader) return res.status(401).json({ success: false, message: 'Authorization token required' })
        const backendResponse = await axios.get(`${BACKEND_API_URL}/api/shipment/order/${encodeURIComponent(id)}`, {
          headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
          timeout: 30000,
          validateStatus: (status) => status < 500,
        })
        if (backendResponse.status >= 400) {
          return res.status(backendResponse.status).json(backendResponse.data)
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
        const page2 = await browser.newPage()
        await page2.setContent(html, { waitUntil: 'networkidle0' })

        const pdfBuffer = await page2.pdf({
          width: '4in',
          height: '6in',
          printBackground: false,
          scale: 1,
          preferCSSPageSize: true,
        })

        await browser.close()

        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `inline; filename="invoice-${id}.pdf"`)
        return res.status(200).send(pdfBuffer)
      }
    }

    if (segments[0] === 'wallet') {
      // handle balance, create-payment-order, transactions, verify-payment
      const authToken = req.headers.authorization?.replace('Bearer ', '')
      if (!authToken) return res.status(401).json({ success: false, message: 'Unauthorized' })
      if (segments[1] === 'balance' && req.method === 'GET') {
        const response = await axios.get(`${BACKEND_API_URL}/api/wallet/balance`, { headers: { Authorization: `Bearer ${authToken}` } })
        return res.status(200).json(response.data)
      }
      if (segments[1] === 'create-payment-order' && req.method === 'POST') {
        const { amount, paymentMethod } = req.body as any
        if (!amount || !paymentMethod) return res.status(400).json({ success: false, message: 'Amount and payment method are required', debug: { receivedBody: req.body } })
        if (amount <= 0) return res.status(400).json({ success: false, message: 'Amount must be greater than 0' })
        const response = await axios.post(`${BACKEND_API_URL}/api/wallet/create-payment-order`, { amount, paymentMethod }, { headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' } })
        return res.status(200).json(response.data)
      }
      if (segments[1] === 'transactions' && req.method === 'GET') {
        const { page = '1', limit = '20', type } = req.query as any
        let queryString = `page=${page}&limit=${limit}`
        if (type) queryString += `&type=${type}`
        const response = await axios.get(`${BACKEND_API_URL}/api/wallet/transactions?${queryString}`, { headers: { Authorization: `Bearer ${authToken}` } })
        return res.status(200).json(response.data)
      }
      if (segments[1] === 'verify-payment' && req.method === 'POST') {
        const { orderId, paymentId } = req.body as any
        if (!orderId) return res.status(400).json({ success: false, message: 'Order ID is required' })
        const payload: any = { orderId }
        if (paymentId) payload.paymentId = paymentId
        const response = await axios.post(`${BACKEND_API_URL}/api/wallet/verify-payment`, payload, { headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' } })
        return res.status(200).json(response.data)
      }
    }

    if (segments[0] === 'orders') {
      // forward /api/orders/... to the real backend
      const authHeader = req.headers.authorization
      const backendUrl = `${BACKEND_API_URL}/${path}`
      const axiosConfig: any = {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
        validateStatus: (status: number) => status < 500,
      }
      if (authHeader) axiosConfig.headers.Authorization = authHeader

      let backendResponse
      if (req.method === 'GET' || req.method === 'DELETE') {
        backendResponse = await axios({
          method: req.method,
          url: backendUrl,
          params: parsedUrl.searchParams,
          ...axiosConfig,
        })
      } else {
        backendResponse = await axios({
          method: req.method || 'GET',
          url: backendUrl,
          data: req.body,
          ...axiosConfig,
        })
      }
      return res.status(backendResponse.status).json(backendResponse.data)
    }

    // catch‑all for any other admin request not handled above
    if (segments[0] === 'admin') {
      // forward everything under /api/admin/... to the real backend
      const authHeader = req.headers.authorization
      const backendUrl = `${BACKEND_API_URL}/${path}`
      const axiosConfig: any = {
        headers: {},
        timeout: 30000,
        validateStatus: (status: number) => status < 500,
      }
      if (authHeader) axiosConfig.headers.Authorization = authHeader

      let backendResponse
      if (req.method === 'GET') {
        backendResponse = await axios.get(backendUrl, {
          ...axiosConfig,
          params: parsedUrl.searchParams,
        })
      } else {
        backendResponse = await axios({
          method: req.method || 'GET',
          url: backendUrl,
          data: req.body,
          ...axiosConfig,
        })
      }
      return res.status(backendResponse.status).json(backendResponse.data)
    }

    // --- Delhivery label proxy (fetches packing slip, strips amounts, returns PDF) ---
    if (segments[0] === 'delhivery-label') {
      const waybill = String(parsedUrl.searchParams.get('waybill') || '').trim()
      if (!waybill) {
        return res.status(400).json({ error: 'waybill is required' })
      }

      const delhiveryUrl = `https://track.delhivery.com/api/p/packing_slip?wbns=${encodeURIComponent(waybill)}&pdf=true&pdf_size=4R`
      const delhiveryRes = await fetch(delhiveryUrl, {
        headers: { Authorization: `Token ${DELHIVERY_TOKEN}`, Accept: '*/*' },
      })

      if (!delhiveryRes.ok) {
        const text = await delhiveryRes.text()
        return res.status(delhiveryRes.status).json({ error: 'Delhivery error', details: text })
      }

      let pdfBytes: ArrayBuffer

      const ct = delhiveryRes.headers.get('content-type') || ''
      if (ct.includes('application/pdf')) {
        pdfBytes = await delhiveryRes.arrayBuffer()
      } else {
        // JSON with pdf_download_link — fetch S3 URL server-side to avoid CORS
        const json = await delhiveryRes.json()
        const s3Url = json?.packages?.[0]?.pdf_download_link
        if (!s3Url) {
          return res.status(502).json({ error: 'pdf_download_link not found' })
        }
        const pdfRes = await fetch(s3Url)
        if (!pdfRes.ok) {
          return res.status(pdfRes.status).json({ error: 'Failed to fetch PDF from S3' })
        }
        pdfBytes = await pdfRes.arrayBuffer()
      }

      // Strip amount values from the PDF by drawing white rectangles over Price & Total columns
      try {
        const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true })
        const pages = pdfDoc.getPages()
        for (const page of pages) {
          const { width, height } = page.getSize()
          // Cover Price & Total column values (product rows + total row)
          page.drawRectangle({
            x: width * 0.55,
            y: height * 0.04,
            width: width * 0.45,
            height: height * 0.30,
            color: rgb(1, 1, 1),
            borderWidth: 0,
          })
        }
        pdfBytes = await pdfDoc.save()
      } catch (pdfErr: any) {
        console.error('[delhivery-label] PDF stripping failed:', pdfErr?.message)
        // Return original PDF if stripping fails
      }

      const finalBuf = Buffer.from(pdfBytes)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="label-${waybill}.pdf"`)
      return res.status(200).send(finalBuf)
    }

    if (segments[0] === 'delhivery') {
      // copy from api/delhivery.ts with path query
      const pathSegments = parsedUrl.searchParams.get('path') || 'c/api/pin-codes/json'
      let delhiveryPath = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments
      let delhiveryUrl = ''
      const method = req.method || 'GET'
      const headers: any = { Authorization: `Token ${DELHIVERY_TOKEN}`, 'Content-Type': 'application/json', Accept: '*/*' }
      let body: any = undefined
      if (method === 'POST' || method === 'PUT') {
        if (req.body) {
          if (typeof req.body === 'string') {
            headers['Content-Type'] = 'application/x-www-form-urlencoded'
            body = req.body
          } else {
            if (delhiveryPath.includes('create.json')) {
              headers['Content-Type'] = 'application/x-www-form-urlencoded'
              const formData = new URLSearchParams()
              Object.entries(req.body).forEach(([k, v]) => formData.append(k, String(v)))
              body = formData.toString()
            } else {
              body = JSON.stringify(req.body)
            }
          }
        }
        delhiveryUrl = `https://track.delhivery.com/${delhiveryPath}`
      } else {
        const queryParams = new URLSearchParams()
        parsedUrl.searchParams.forEach((v, k) => {
          if (k !== 'path') queryParams.append(k, v)
        })
        const qs = queryParams.toString()
        delhiveryUrl = `https://track.delhivery.com/${delhiveryPath}${qs ? `?${qs}` : ''}`
      }
      const fetchRes = await fetch(delhiveryUrl, { method, headers, body })
      const contentType = fetchRes.headers.get('content-type') || ''
      if (contentType.includes('application/pdf')) {
        const arrayBuffer = await fetchRes.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', 'inline; filename="packing-slip.pdf"')
        return res.status(fetchRes.status).send(buffer)
      }
      const data = await fetchRes.json()
      return res.status(fetchRes.status).json(data)
    }

    if (segments[0] === 'delhivery-proxy') {
      // copy from previous delhivery-proxy handler
      let apiPath = ''
      const pathSegments = req.query.path
      if (Array.isArray(pathSegments)) apiPath = pathSegments.join('/')
      else if (pathSegments) apiPath = pathSegments as string
      const queryParams = new URLSearchParams()
      Object.entries(req.query).forEach(([k, v]) => {
        if (k !== 'path') {
          if (Array.isArray(v)) v.forEach(x => queryParams.append(k, x))
          else if (v) queryParams.append(k, v as string)
        }
      })
      const qs = queryParams.toString()
      const fullUrl = `https://track.delhivery.com/${apiPath}${qs ? `?${qs}` : ''}`
      const response = await fetch(fullUrl, { method: req.method || 'GET', headers: { Authorization: `Token ${DELHIVERY_TOKEN}`, 'Content-Type': 'application/json' } })
      const data = await response.json()
      return res.status(response.status).json(data)
    }

    // ── Customers handler ───────────────────────────────────────────────────
    if (segments[0] === 'customers') {
      const authHeader = req.headers.authorization
      if (!authHeader) {
        return res.status(401).json({ success: false, message: 'Authorization token required' })
      }
      const qs = parsedUrl.search || ''
      const id = segments[1]
      const baseUrl = `${BACKEND_API_URL}/api/customers`
      const targetUrl = id ? `${baseUrl}/${encodeURIComponent(id)}${qs}` : `${baseUrl}${qs}`
      const backendResponse = await axios({
        method: req.method || 'GET',
        url: targetUrl,
        data: req.method !== 'GET' && req.method !== 'DELETE' ? req.body : undefined,
        headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
        timeout: 30000,
        validateStatus: (status: number) => status < 600,
      })
      return res.status(backendResponse.status).json(backendResponse.data)
    }

    // ── Generic catch-all proxy ─────────────────────────────────────────────
    // Forward any unmatched /api/* request to the backend so routes like
    // /api/careers, /api/applications, etc. work without
    // needing an explicit handler for each one.
    if (segments.length > 0) {
      const authHeader = req.headers.authorization
      const backendUrl = `${BACKEND_API_URL}/${path}`
      const axiosConfig: any = {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
        validateStatus: (status: number) => status < 600,
      }
      if (authHeader) axiosConfig.headers.Authorization = authHeader

      const qs = parsedUrl.search || ''
      let backendResponse
      if (req.method === 'GET' || req.method === 'DELETE') {
        backendResponse = await axios({
          method: req.method,
          url: `${backendUrl}${qs}`,
          ...axiosConfig,
        })
      } else {
        backendResponse = await axios({
          method: req.method || 'POST',
          url: `${backendUrl}${qs}`,
          data: req.body,
          ...axiosConfig,
        })
      }
      return res.status(backendResponse.status).json(backendResponse.data)
    }

    // if we reach here, path was empty
    res.status(404).json({ success: false, message: 'Not found' })
  } catch (error: any) {
    console.error('[Unified API] error', error)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
