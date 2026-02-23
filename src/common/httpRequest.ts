import axios from "axios"

const API_URL = '/api'  // Always use proxy route

const httpRequest = axios.create({
  baseURL: API_URL,
  timeout: 5000, // 5 second timeout for fast responses
  headers: {
    'Content-Type': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br', // Enable compression
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
    'Accept-Encoding': 'gzip, deflate, br', // Enable compression
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
