import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

// Proxy for /api/dashboard and related dashboard endpoints (including orders-report)
export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'GET') {
    return response.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const authHeader = request.headers.authorization;
  if (!authHeader) {
    console.error('[Dashboard API] Missing authorization token');
    return response.status(401).json({ success: false, message: 'Authorization token required' });
  }

  try {
    // Determine whether to proxy to orders-report or general dashboard
    const url = new URL(request.url ?? '', 'http://localhost');
    let backendPath = '/api/dashboard';
    if (url.pathname.endsWith('/orders-report')) {
      backendPath = '/api/dashboard/orders-report';
    }

    const backendUrl = `https://freightrekapi.vercel.app${backendPath}${url.search}`;

    const backendResponse = await axios.get(backendUrl, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
      validateStatus: (status) => status < 500,
    });

    // For auth errors in dashboard endpoint, return empty placeholder
    if (backendResponse.status === 401 || backendResponse.status === 403) {
      if (backendPath === '/api/dashboard') {
        return response.status(200).json({
          success: true,
          data: {
            overview: { activeShipments: { total: 0, inTransit: 0, outForDelivery: 0 }, totalShipments: { count: 0, currentPeriod: 0, percentageChange: '0.0' }, revenue: { total: 0, percentageChange: '0.0', currency: '₹' } },
            revenueTrend: [],
            shipmentTypeDistribution: [],
            recentBookings: [],
            period: 'week',
          },
        });
      }
      // propagate original backend response for orders-report or others
    }

    return response.status(backendResponse.status).json(backendResponse.data);
  } catch (error: any) {
    console.error('[Dashboard API] Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: { url: error.config?.url, method: error.config?.method },
    });

    return response.status(500).json({ success: false, message: 'Error communicating with backend' });
  }
}
