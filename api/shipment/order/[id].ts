import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

/**
 * API Proxy: Get Single Order by ID
 * 
 * Frontend: GET /api/shipment/order/:id
 * Backend: GET https://freightrekapi.vercel.app/api/shipment/order/:id
 * 
 * Forwards authentication token and retrieves specific order details.
 */
export default async function handler(request: VercelRequest, response: VercelResponse) {
  // Only allow GET requests
  if (request.method !== 'GET') {
    return response.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { id } = request.query;

    // Validate order ID parameter
    if (!id || typeof id !== 'string') {
      console.error('[Shipment Order API] Missing or invalid order ID');
      return response.status(400).json({ 
        success: false, 
        message: 'Order ID is required' 
      });
    }

    // Get authorization token from request headers
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      console.error('[Shipment Order API] Missing authorization token');
      return response.status(401).json({ 
        success: false, 
        message: 'Authorization token required' 
      });
    }

    // Backend API endpoint
    const backendUrl = `https://freightrekapi.vercel.app/api/shipment/order/${encodeURIComponent(id)}`;


    // Forward request to backend API
    const backendResponse = await axios.get(backendUrl, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
      validateStatus: (status) => status < 500, // Don't throw on 4xx errors
    });


    // Return backend response
    return response.status(backendResponse.status).json(backendResponse.data);

  } catch (error: any) {
    console.error('[Shipment Order API] Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
      }
    });

    // Handle network or timeout errors
    if (error.code === 'ECONNABORTED') {
      return response.status(504).json({ 
        success: false, 
        message: 'Request timeout - backend took too long to respond' 
      });
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return response.status(503).json({ 
        success: false, 
        message: 'Backend service unavailable' 
      });
    }

    // Return error from backend if available
    if (error.response) {
      return response.status(error.response.status).json(
        error.response.data || { 
          success: false, 
          message: 'Failed to fetch order details' 
        }
      );
    }

    // Generic error response
    return response.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch order details' 
    });
  }
}
