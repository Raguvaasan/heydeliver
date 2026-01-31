import axios from "axios"

const API_URL = '/api'  // Always use proxy route

const httpRequest = axios.create({
  baseURL: API_URL,
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
      console.log("401 Error - but NOT redirecting automatically")
      console.log("Current path:", window.location.pathname)
      console.log("Auth token exists:", !!sessionStorage.getItem("authToken"))
      // Don't automatically redirect - let the component handle it
      // sessionStorage.removeItem("authToken")
      // window.location.href = "/"
    }
    return Promise.reject(error)
  }
)

// Public HTTP instance without token for public APIs
export const httpPublic = axios.create({
  baseURL: API_URL,
})

httpPublic.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error)
  }
)

export default httpRequest
