import type { VercelRequest, VercelResponse } from '@vercel/node';
import { IncomingMessage } from 'http';

// Keep raw body available so form-urlencoded payloads (format=json&data=...)
// are forwarded exactly as Delhivery expects.
export const config = {
  api: {
    bodyParser: false,
  },
};

const DELHIVERY_TOKEN = process.env['DELHIVERY_API_TOKEN'] || "91aeec33f78a2d21a6348658708de71f31489038";

function getRawBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
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

      const rawBody = await getRawBody(req);
      const isCreateEndpoint = delhiveryPath.includes('create.json');

      if (isCreateEndpoint) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        if (rawBody.includes('format=')) {
          fetchOptions.body = rawBody;
        } else if (rawBody.includes('data=')) {
          // Some upstream parsers drop the first field; enforce Delhivery format key.
          fetchOptions.body = `format=json&${rawBody}`;
        } else {
          // Fallback if upstream sent JSON instead of pre-encoded form body.
          try {
            const parsed = rawBody ? JSON.parse(rawBody) : {};
            const formData = new URLSearchParams();
            formData.set('format', String((parsed as any)?.format || 'json'));
            if ((parsed as any)?.data !== undefined) {
              formData.set(
                'data',
                typeof (parsed as any).data === 'string'
                  ? (parsed as any).data
                  : JSON.stringify((parsed as any).data)
              );
            }
            fetchOptions.body = formData.toString();
          } catch {
            fetchOptions.body = 'format=json';
          }
        }
      } else {
        // Non-create endpoints continue as JSON by default.
        headers['Content-Type'] = 'application/json';
        fetchOptions.body = rawBody || '{}';
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
