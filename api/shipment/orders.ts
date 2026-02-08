import type { VercelRequest, VercelResponse } from '@vercel/node'
import axios from 'axios'

const BACKEND_API_URL = process.env['BACKEND_API_URL'] || 'https://freightrekapi.vercel.app'

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Enable CORS
  response.setHeader('Access-Control-Allow-Credentials', 'true')
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )

  if (request.method === 'OPTIONS') {
    response.status(200).end()
    return
  }

  try {
    const { page = 1, limit = 20, status } = request.query
    const authHeader = request.headers.authorization

    if (!authHeader) {
      return response.status(401).json({
        success: false,
        message: 'Authorization header is required'
      })
    }

    console.log('=== SHIPMENT ORDERS PROXY ===')
    console.log('Method:', request.method)
    console.log('Query params:', { page, limit, status })
    console.log('Auth header present:', !!authHeader)

    // Build query params
    const params: any = { page, limit }
    if (status && status !== 'all') {
      params.status = status
    }

    // Forward request to backend API
    const backendUrl = `${BACKEND_API_URL}/api/shipment/orders`
    console.log('Calling backend:', backendUrl)

    const backendResponse = await axios.get(backendUrl, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      params,
      timeout: 30000
    })

    console.log('Backend response status:', backendResponse.status)
    console.log('Backend response data:', JSON.stringify(backendResponse.data).substring(0, 200))

    return response.status(200).json(backendResponse.data)
  } catch (error: any) {
    console.error('=== SHIPMENT ORDERS ERROR ===')
    console.error('Error message:', error.message)
    console.error('Error response:', error.response?.data)
    console.error('Error status:', error.response?.status)

    if (error.response) {
      return response.status(error.response.status).json(
        error.response.data || { 
          success: false, 
          message: error.message 
        }
      )
    }

    return response.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    })
  }
}
