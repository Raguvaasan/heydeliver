import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Get auth token from header
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    if (!authToken) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Forward to actual backend
    const backendUrl = process.env.BACKEND_API_URL || 'https://freightrekapi.vercel.app';
    const response = await axios.get(
      `${backendUrl}/api/wallet/balance`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Get balance error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to fetch balance'
    });
  }
}
