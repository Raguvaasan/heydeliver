import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Get the path from query params
  const pathSegments = req.query.path;
  
  // Reconstruct the API path
  let apiPath = '';
  if (Array.isArray(pathSegments)) {
    apiPath = pathSegments.join('/');
  } else if (pathSegments) {
    apiPath = pathSegments;
  }
  
  // Get query parameters excluding 'path'
  const queryParams = new URLSearchParams();
  Object.entries(req.query).forEach(([key, value]) => {
    if (key !== 'path') {
      if (Array.isArray(value)) {
        value.forEach(v => queryParams.append(key, v));
      } else if (value) {
        queryParams.append(key, value);
      }
    }
  });
  
  const queryString = queryParams.toString();
  const fullUrl = `https://track.delhivery.com/${apiPath}${queryString ? `?${queryString}` : ''}`;


  try {
    const response = await fetch(fullUrl, {
      method: req.method || 'GET',
      headers: {
        'Authorization': 'Token 76a094c150aed4e3a9c6b41b608ee7174f4d5b51',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    res.status(response.status).json(data);
  } catch (error: any) {
    console.error('Delhivery API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch from Delhivery API',
      message: error.message 
    });
  }
}
