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
    // Log request for debugging
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    
    const { amount, paymentMethod } = req.body;

    // Validate input
    if (!amount || !paymentMethod) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount and payment method are required',
        debug: { receivedBody: req.body }
      });
    }

    // Validate amount is positive
    if (amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount must be greater than 0'
      });
    }

    // Get auth token from header
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    if (!authToken) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Forward to actual backend
    const backendUrl = process.env.BACKEND_API_URL || 'https://freightrekapi.vercel.app';
    const requestPayload = { amount, paymentMethod };
    console.log('Forwarding to backend:', `${backendUrl}/api/wallet/create-payment-order`);
    console.log('Request payload:', requestPayload);
    
    const response = await axios.post(
      `${backendUrl}/api/wallet/create-payment-order`,
      requestPayload,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Backend response:', response.data);

    res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Create payment order error:', error.response?.data || error.message);
    console.error('Full error:', error);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to create payment order',
      backendError: error.response?.data,
      backendStatus: error.response?.status
    });
  }
}
