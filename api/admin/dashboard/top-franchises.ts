import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

/**
 * API Proxy: Top Franchises
 * 
 * Frontend: GET /api/admin/dashboard/top-franchises?limit=5
 * Backend: GET https://freightrekapi.vercel.app/admin/dashboard/top-franchises?limit=5
 * 
 * Fetches top performing franchises
 */
export default async function handler(request: VercelRequest, response: VercelResponse) {
  // Enable CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'GET') {
    return response.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      return response.status(401).json({ 
        success: false, 
        message: 'Authorization token required' 
      });
    }

    const { limit = 5 } = request.query;
    const backendUrl = 'https://freightrekapi.vercel.app/admin/dashboard/top-franchises';

    console.log('[Top Franchises API] Fetching with limit:', limit);

    const backendResponse = await axios.get(backendUrl, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      params: { limit },
      timeout: 30000,
      validateStatus: (status) => status < 500,
    });

    console.log('[Top Franchises API] Status:', backendResponse.status);

    return response.status(backendResponse.status).json(backendResponse.data);

  } catch (error: any) {
    console.error('[Top Franchises API] Error:', error.message);

    if (error.response) {
      return response.status(error.response.status).json(
        error.response.data || { 
          success: false, 
          message: 'Failed to fetch top franchises' 
        }
      );
    }

    return response.status(500).json({ 
      success: false, 
      message: 'Failed to fetch top franchises' 
    });
  }
}
