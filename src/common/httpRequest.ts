import axios from "axios"

const API_URL = import.meta.env.VITE_ENV === 'dev' 
  ? '/api'  // Use proxy in development
  : import.meta.env.VITE_API_URL  // Use direct URL in production

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
      sessionStorage.removeItem("authToken")
      window.location.href = "/"
    }
    return Promise.reject(error)
  }
)

export default httpRequest
