import axios from "axios"

const API_URL = '/api'  // Always use proxy route

const httpRequest = axios.create({
  baseURL: API_URL,
  // The 5‑second default caused slow first‑loads to be aborted by axios
  // (you saw `canceled` entries at ~5s in DevTools). The backend takes
  // a little longer for cold responses, so bump the timeout or omit it
  // entirely if you prefer to rely on browser/network timeouts.
  timeout: 15000, // 15s (or remove this line if you don't want a client timeout)
  headers: {
    'Content-Type': 'application/json',
    // 'Accept-Encoding' removed: browser manages this header
  },
  // Performance optimizations
  maxRedirects: 5,
  maxContentLength: 50 * 1024 * 1024, // 50MB max
  decompress: true, // Auto-decompress responses
  // Connection pooling for keep-alive
  httpAgent: undefined, // Browser handles this automatically
  httpsAgent: undefined,
})

httpRequest.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("authToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

httpRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 401 Unauthorized - Let the component handle auth errors
      // Don't automatically redirect to allow proper error handling
    }
    return Promise.reject(error)
  }
)

// Public HTTP instance without token for public APIs
export const httpPublic = axios.create({
  baseURL: API_URL,
  timeout: 5000, // 5 second timeout
  headers: {
    // 'Accept-Encoding' removed: browser manages this header
  },
  decompress: true,
})

httpPublic.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error)
  }
)

export default httpRequest
