// Disable body parsing for this API route
export const config = {
  api: {
    bodyParser: false,
  },
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { IncomingMessage } from 'http';
import { parseFormUrlEncoded } from '../../src/common/parseFormUrlEncoded';

function getRawBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
      resolve(data);
    });
    req.on('error', err => {
      reject(err);
    });
  });
}

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
    let fetchOptions: any = {
      method: req.method || 'GET',
      headers: {
        'Authorization': 'Token 76a094c150aed4e3a9c6b41b608ee7174f4d5b51',
      },
    };

    // If POST to create.json, forward as x-www-form-urlencoded and use raw body
    if (req.method === 'POST' && apiPath.endsWith('create.json')) {
      // Always forward as raw string, with Content-Type: application/json
      fetchOptions.headers['Content-Type'] = 'application/json';
      let rawBody = await getRawBody(req);
      // Log the incoming body from the frontend
      console.log('Delhivery Proxy INCOMING rawBody:', rawBody);

      // If body is not a string, convert to string
      if (typeof rawBody !== 'string') {
        rawBody = String(rawBody);
      }

      // If body is an object, convert to correct format
      if (!rawBody.includes('format=json')) {
        try {
          const parsed = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
          if (parsed.format && parsed.data) {
            rawBody = `format=${parsed.format}&data=${typeof parsed.data === 'string' ? parsed.data : JSON.stringify(parsed.data)}`;
          }
        } catch {
          // leave as is
        }
      }

      fetchOptions.body = rawBody;
      // Log for debug
      console.log('Delhivery Proxy Outgoing body:', rawBody);
    } else if (req.method === 'POST') {
      // For other POSTs, default to JSON
      fetchOptions.headers['Content-Type'] = 'application/json';
      fetchOptions.body = req.body && typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(fullUrl, fetchOptions);
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
