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

function getRawBodyFromStream(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
    // Safety timeout: if the stream never fires events (already consumed), resolve empty
    setTimeout(() => resolve(data), 3000);
  });
}

/**
 * Robustly read the raw body from a Vercel request.
 * Vercel may pre-buffer the body as a Buffer, string, or parsed object
 * even when bodyParser is false. Fall back to stream reading only if needed.
 */
async function getRawBody(req: VercelRequest): Promise<string> {
  // 1. Check if Vercel already made the body available
  if (req.body !== undefined && req.body !== null) {
    if (Buffer.isBuffer(req.body)) {
      return req.body.toString('utf-8');
    }
    if (typeof req.body === 'string') {
      return req.body;
    }
    if (typeof req.body === 'object') {
      // Body was parsed into an object — reconstruct form-urlencoded
      const params = new URLSearchParams();
      for (const [key, val] of Object.entries(req.body as Record<string, any>)) {
        params.set(key, typeof val === 'object' ? JSON.stringify(val) : String(val));
      }
      return params.toString();
    }
  }

  // 2. Fall back to reading from the stream
  return getRawBodyFromStream(req as unknown as IncomingMessage);
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

      console.log('[delhivery proxy] isCreate:', isCreateEndpoint, 'rawBody length:', rawBody.length, 'rawBody preview:', rawBody.substring(0, 200));

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
            // Last resort: construct minimal valid body
            fetchOptions.body = rawBody ? `format=json&data=${encodeURIComponent(rawBody)}` : 'format=json';
          }
        }

        // Final safety check: ensure format= is always present
        const bodyStr = String(fetchOptions.body);
        if (!bodyStr.includes('format=')) {
          fetchOptions.body = `format=json&${bodyStr}`;
        }

        console.log('[delhivery proxy] outgoing body preview:', String(fetchOptions.body).substring(0, 200));
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
