import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

/**
 * API Proxy: Admin Dashboard Statistics
 * 
 * Frontend: GET /api/admin/dashboard?period=week
 * Backend: GET https://freightrekapi.vercel.app/admin/dashboard?period=week
 * 
 * Fetches admin dashboard statistics with optional period filter
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
      console.error('[Admin Dashboard API] Missing authorization token');
      return response.status(401).json({ 
        success: false, 
        message: 'Authorization token required' 
      });
    }

    // Get query parameters
    const { period = 'week' } = request.query;

    // Backend API endpoint
    const backendUrl = `https://freightrekapi.vercel.app/admin/dashboard`;

    console.log('[Admin Dashboard API] Forwarding request to:', backendUrl);
    console.log('[Admin Dashboard API] Period:', period);

    // Forward request to backend API
    const backendResponse = await axios.get(backendUrl, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      params: {
        period: period
      },
      timeout: 30000,
      validateStatus: (status) => status < 500,
    });

    console.log('[Admin Dashboard API] Backend response status:', backendResponse.status);

    // Return backend response
    return response.status(backendResponse.status).json(backendResponse.data);

  } catch (error: any) {
    console.error('[Admin Dashboard API] Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    if (error.code === 'ECONNABORTED') {
      return response.status(504).json({ 
        success: false, 
        message: 'Request timeout' 
      });
    }

    if (error.response) {
      return response.status(error.response.status).json(
        error.response.data || { 
          success: false, 
          message: 'Failed to fetch admin dashboard data' 
        }
      );
    }

    return response.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch admin dashboard data' 
    });
  }
}
