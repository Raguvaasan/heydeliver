/**
 * BACKEND IMPLEMENTATION GUIDE
 * 
 * The frontend is calling: POST /api/pincode/check
 * 
 * Backend should implement this endpoint to:
 * 1. Receive pincode from request body
 * 2. Call Delhivery API with the pincode
 * 3. Return the response to frontend
 * 
 * DELHIVERY API DETAILS:
 * 
 * Endpoint: https://track.delhivery.com/c/api/pin-codes/json/
 * Method: GET
 * Query Parameter: filter_codes=<pincode>
 * Header: Authorization: Token <DELHIVERY_TOKEN>
 * 
 * Example cURL:
 * curl --location 'https://track.delhivery.com/c/api/pin-codes/json/?filter_codes=194103' \
 *   --header 'Authorization: Token 38ddf1efc8e1669a4bf352376506b7da9d0b3c99'
 * 
 * EXPECTED RESPONSE FORMAT:
 * {
 *   "delivery_codes": [
 *     {
 *       "postal_code": {
 *         "pin": 194103,
 *         "city": "Kargil",
 *         "state_code": "LA",
 *         "district": "Kargil",
 *         "cod": "Y",
 *         "pre_paid": "Y",
 *         "pickup": "Y",
 *         "repl": "N",
 *         "max_weight": 0.0,
 *         "max_amount": 0.0,
 *         "remarks": "",
 *         "country_code": "IN",
 *         "is_oda": "N",
 *         "sort_code": "DEL/PRT",
 *         "covid_zone": "G",
 *         "protect_blacklist": false,
 *         "sun_tat": true,
 *         "inc": "Kargil_Poyen_DPP (Ladakh)",
 *         "center": [ ... ]
 *       }
 *     }
 *   ]
 * }
 * 
 * BACKEND PSEUDOCODE (Node.js/Express example):
 * 
 * app.post('/api/pincode/check', async (req, res) => {
 *   try {
 *     const { pincode } = req.body;
 *     
 *     if (!pincode || pincode.length !== 6) {
 *       return res.status(400).json({ error: 'Invalid pincode' });
 *     }
 *     
 *     const delhiveryToken = process.env.DELHIVERY_API_TOKEN;
 *     const response = await fetch(
 *       `https://track.delhivery.com/c/api/pin-codes/json/?filter_codes=${pincode}`,
 *       {
 *         headers: {
 *           'Authorization': `Token ${delhiveryToken}`
 *         }
 *       }
 *     );
 *     
 *     const data = await response.json();
 *     
 *     if (!data.delivery_codes || data.delivery_codes.length === 0) {
 *       return res.status(404).json({ error: 'Pincode not found' });
 *     }
 *     
 *     res.json(data);
 *   } catch (error) {
 *     console.error('Error fetching pincode:', error);
 *     res.status(500).json({ error: 'Failed to fetch pincode data' });
 *   }
 * });
 */

export const DELHIVERY_CONFIG = {
  BASE_URL: "https://track.delhivery.com/c/api",
  ENDPOINT: "/pin-codes/json/",
  // Store token in environment variable
  TOKEN_ENV_VAR: "DELHIVERY_API_TOKEN",
}

export const PINCODE_CHECK_ENDPOINT = "/api/pincode/check"
