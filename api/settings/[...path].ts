import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const BACKEND_API_URL = process.env['BACKEND_API_URL'] || 'https://freightrekapi.vercel.app';

/**
 * API Proxy: Settings Endpoints (Consolidated)
 * 
 * Handles:
 * - GET/POST /api/settings/v1/settings/rate-calculator-markup
 * - GET/POST /api/settings/v1/settings/rate-card-markup
 * 
 * Forwards to backend at https://freightrekapi.vercel.app/v1/settings/*
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Get auth token from header
    const authToken = req.headers.authorization;
    if (!authToken) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Get the path segments
    const pathSegments = req.query['path'];
    let apiPath = '';
    
    if (Array.isArray(pathSegments)) {
      apiPath = pathSegments.join('/');
    } else if (pathSegments) {
      apiPath = pathSegments;
    }

    // Construct backend URL - path already includes v1/settings
    const backendUrl = `${BACKEND_API_URL}/api/${apiPath}`;
    if (req.method === 'GET') {
      // Fetch settings
      const response = await axios.get(backendUrl, {
        headers: {
          'Authorization': authToken
        }
      });

      return res.status(200).json(response.data);
    } else if (req.method === 'POST') {
      // Save settings
      const response = await axios.post(backendUrl, req.body, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });

      return res.status(200).json(response.data);
    }
    
    // Should not reach here due to method check above
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error: any) {
    console.error('[Settings API] Error:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to process settings request'
    });
  }
}
