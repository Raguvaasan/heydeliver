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

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { orderId, paymentId } = req.body;

    // Validate input
    if (!orderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order ID is required' 
      });
    }

    // Get auth token from header
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    if (!authToken) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Forward to actual backend
    const backendUrl = process.env.BACKEND_API_URL || 'https://freightrekapi.vercel.app';
    const payload: any = { orderId };
    if (paymentId) {
      payload.paymentId = paymentId;
    }
    const response = await axios.post(
      `${backendUrl}/api/wallet/verify-payment`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Verify payment error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      orderId: req.body?.orderId,
      paymentId: req.body?.paymentId
    });
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to verify payment',
      error: error.response?.data || error.message
    });
  }
}
