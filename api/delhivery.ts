import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const url = new URL(req.url || '', `https://${req.headers.host}`);
    const delhiveryPath = url.searchParams.get('path') || 'c/api/pin-codes/json';
    
    let delhiveryUrl = '';
    let fetchOptions: RequestInit = {
      method: req.method || 'GET',
      headers: {
        'Authorization': 'Token 76a094c150aed4e3a9c6b41b608ee7174f4d5b51',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    if (req.method === 'POST' || req.method === 'PUT') {
      // For POST/PUT requests
      delhiveryUrl = `https://track.delhivery.com/${delhiveryPath}`;
      
      // Pass through the body
      if (req.body) {
        // If body is form-urlencoded string
        if (typeof req.body === 'string') {
          fetchOptions.headers!['Content-Type'] = 'application/x-www-form-urlencoded';
          fetchOptions.body = req.body;
        } else {
          // For shipment creation endpoint, use form-urlencoded
          if (delhiveryPath.includes('/api/cmu/create.json')) {
            fetchOptions.headers!['Content-Type'] = 'application/x-www-form-urlencoded';
            const formData = new URLSearchParams();
            Object.entries(req.body).forEach(([key, value]) => {
              formData.append(key, String(value));
            });
            fetchOptions.body = formData.toString();
          } else {
            // For other endpoints (edit, ewaybill), use JSON
            fetchOptions.body = JSON.stringify(req.body);
          }
        }
      }
    } else {
      // For GET requests (pincode check, tracking, etc)
      const queryParams = new URLSearchParams();
      url.searchParams.forEach((value, key) => {
        if (key !== 'path') {
          queryParams.append(key, value);
        }
      });
      
      const queryString = queryParams.toString();
      delhiveryUrl = `https://track.delhivery.com/${delhiveryPath}${queryString ? `?${queryString}` : ''}`;
    }

    const response = await fetch(delhiveryUrl, fetchOptions);
    const data = await response.json();
    
    res.status(response.status).json(data);
    
  } catch (error: any) {
    console.error('Delhivery API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch from Delhivery API',
      message: error.message,
      details: error.toString()
    });
  }
}
