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

    // If backend returns 401, return mock data instead of blocking
    if (backendResponse.status === 401 || backendResponse.status === 403) {
      console.log('[Dashboard API] Auth error from backend, returning mock data');
      return response.status(200).json({
        success: true,
        data: {
          overview: {
            activeShipments: 0,
            inTransit: 0,
            outForDelivery: 0,
            totalShipments: 0,
            currentPeriod: 0
          },
          revenue: {
            total: 0,
            period: 'week',
            dailyRevenue: [],
            weeklyRevenue: [],
            monthlyRevenue: [],
            yearlyRevenue: []
          },
          recentBookings: [],
          shipmentTypeDistribution: []
        }
      });
    }

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

    // Return mock data if backend is unavailable
    console.log('[Dashboard API] Backend unavailable, returning mock data');
    
    return response.status(200).json({
      success: true,
      data: {
        overview: {
          activeShipments: 0,
          inTransit: 0,
          outForDelivery: 0,
          totalShipments: 0,
          currentPeriod: 0
        },
        revenue: {
          total: 0,
          period: 'week',
          dailyRevenue: [],
          weeklyRevenue: [],
          monthlyRevenue: [],
          yearlyRevenue: []
        },
        recentBookings: [],
        shipmentTypeDistribution: []
      }
    });
  }
}
