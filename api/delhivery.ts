import type { VercelRequest, VercelResponse } from '@vercel/node';

// Let Vercel parse the body normally (JSON or form-urlencoded).
// We reconstruct the exact form body Delhivery expects in the handler.

const DELHIVERY_TOKEN = process.env['DELHIVERY_API_TOKEN'] || "91aeec33f78a2d21a6348658708de71f31489038";

/**
 * Build the form-urlencoded body that Delhivery expects:
 *   format=json&data=<url-encoded JSON string>
 *
 * Accepts either:
 *   - A parsed JSON object with { shipments, pickup_location } (from frontend JSON POST)
 *   - A parsed form object with { format, data } (from frontend form POST)
 */
function buildDelhiveryFormBody(body: any): string {
  const params = new URLSearchParams();
  params.set('format', 'json');

  if (body && typeof body === 'object') {
    if (body.data !== undefined) {
      // Frontend sent { format: "json", data: "..." } — use data value directly
      const dataStr = typeof body.data === 'string' ? body.data : JSON.stringify(body.data);
      params.set('data', dataStr);
    } else if (body.shipments) {
      // Frontend sent the payload directly as JSON { shipments: [...], pickup_location: {...} }
      params.set('data', JSON.stringify(body));
    }
  } else if (typeof body === 'string') {
    // Already a string — check if it's form-encoded or raw JSON
    if (body.includes('format=') && body.includes('data=')) {
      return body; // Already correctly formatted
    }
    if (body.includes('data=') && !body.includes('format=')) {
      return `format=json&${body}`;
    }
    // Assume it's a JSON string
    params.set('data', body);
  }

  return params.toString();
}

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
    const headers: Record<string, string> = {
      'Authorization': `Token ${DELHIVERY_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': '*/*',
    };

    let fetchOptions: RequestInit = {
      method: req.method || 'GET',
      headers,
    };

    if (req.method === 'POST' || req.method === 'PUT') {
      // For POST/PUT requests
      delhiveryUrl = `https://track.delhivery.com/${delhiveryPath}`;

      const isCreateEndpoint = delhiveryPath.includes('create.json');

      if (isCreateEndpoint) {
        // Delhivery create.json expects: Content-Type: application/x-www-form-urlencoded
        // Body: format=json&data=<url-encoded JSON>
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        const formBody = buildDelhiveryFormBody(req.body);
        fetchOptions.body = formBody;
        console.log('[delhivery proxy] create.json outgoing body:', formBody.substring(0, 300));
      } else {
        // Non-create endpoints continue as JSON by default.
        headers['Content-Type'] = 'application/json';
        fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
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
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/pdf')) {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="packing-slip.pdf"');
      res.status(response.status).send(buffer);
      return;
    }

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
