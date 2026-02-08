import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

/**
 * API Proxy: Dashboard Statistics
 * 
 * Frontend: GET /api/dashboard
 * Backend: GET https://freightrekapi.vercel.app/api/dashboard
 * 
 * Fetches dashboard statistics including shipments, revenue, wallet data
 */
export default async function handler(request: VercelRequest, response: VercelResponse) {
  // Enable CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  // Handle OPTIONS request for CORS preflight
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // Only allow GET requests
  if (request.method !== 'GET') {
    return response.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // Get authorization token from request headers
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      console.error('[Dashboard API] Missing authorization token');
      return response.status(401).json({ 
        success: false, 
        message: 'Authorization token required' 
      });
    }

    // Backend API endpoint
    const backendUrl = 'https://freightrekapi.vercel.app/api/dashboard';

    console.log('[Dashboard API] Forwarding request to backend:', backendUrl);

    // Forward request to backend API
    const backendResponse = await axios.get(backendUrl, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
      validateStatus: (status) => status < 500, // Don't throw on 4xx errors
    });

    console.log('[Dashboard API] Backend response status:', backendResponse.status);

    // Return backend response
    return response.status(backendResponse.status).json(backendResponse.data);

  } catch (error: any) {
    console.error('[Dashboard API] Error details:', {
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
          message: 'Failed to fetch dashboard data' 
        }
      );
    }

    // Generic error response
    return response.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch dashboard data' 
    });
  }
}
