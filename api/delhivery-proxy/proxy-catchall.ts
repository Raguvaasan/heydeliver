// Let Vercel parse the body normally — we reconstruct form body in the handler.

import type { VercelRequest, VercelResponse } from '@vercel/node';

const DELHIVERY_TOKEN = process.env['DELHIVERY_API_TOKEN'] || "91aeec33f78a2d21a6348658708de71f31489038";

function buildDelhiveryFormBody(body: any): string {
  const params = new URLSearchParams();
  params.set('format', 'json');

  if (body && typeof body === 'object') {
    if (body.data !== undefined) {
      const dataStr = typeof body.data === 'string' ? body.data : JSON.stringify(body.data);
      params.set('data', dataStr);
    } else if (body.shipments) {
      params.set('data', JSON.stringify(body));
    }
  } else if (typeof body === 'string') {
    if (body.includes('format=') && body.includes('data=')) {
      return body;
    }
    if (body.includes('data=') && !body.includes('format=')) {
      return `format=json&${body}`;
    }
    params.set('data', body);
  }

  return params.toString();
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).end();
    return;
  }

  // Get the path from query params
  const pathSegments = req.query['path'];

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
        'Authorization': `Token ${DELHIVERY_TOKEN}`,
      },
    };

    // If POST to create.json, construct form body for Delhivery
    if (req.method === 'POST' && apiPath.endsWith('create.json')) {
      fetchOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      const formBody = buildDelhiveryFormBody(req.body);
      fetchOptions.body = formBody;
      console.log('Delhivery Proxy Outgoing body:', formBody.substring(0, 300));
    } else if (req.method === 'POST') {
      // For other POSTs, default to JSON
      fetchOptions.headers['Content-Type'] = 'application/json';
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(fullUrl, fetchOptions);
    const rawResponse = await response.text();
    const contentType = response.headers.get('content-type') || '';

    let data: unknown;
    if (contentType.includes('application/json')) {
      try {
        data = JSON.parse(rawResponse);
      } catch {
        data = {
          error: 'Invalid JSON response from Delhivery',
          raw: rawResponse,
        };
      }
    } else {
      try {
        data = JSON.parse(rawResponse);
      } catch {
        data = {
          error: 'Non-JSON response from Delhivery',
          raw: rawResponse,
        };
      }
    }

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
