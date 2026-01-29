import { create } from "zustand"
import axios from "axios"
import { DELHIVERY_CONFIG } from "../common/delhiveryConfig"

interface Center {
  code: string
  cn: string
  s: string
  e: string
  ud: string
  u?: string
  sort_code?: string
}

interface PostalCode {
  postal_code: {
    pin: number
    city: string
    state_code: string
    district: string
    cod: string
    pre_paid: string
    pickup: string
    repl: string
    max_weight: number
    max_amount: number
    remarks: string
    country_code: string
    is_oda: string
    sort_code: string
    covid_zone: string
    protect_blacklist: boolean
    sun_tat: boolean
    inc: string
    center: Center[]
  }
}

interface DelhiveryResponse {
  delivery_codes: PostalCode[]
}

interface PincodeStoreState {
  pincodeData: PostalCode | null
  loading: boolean
  error: string | null
  fetchPincodeData: (pincode: string) => Promise<void>
  clearData: () => void
}

export const usePincodeStore = create<PincodeStoreState>((set) => ({
  pincodeData: null,
  loading: false,
  error: null,

  fetchPincodeData: async (pincode: string) => {
    set({ loading: true, error: null, pincodeData: null })

    try {
      // Call through serverless function proxy
      const apiUrl = `/delhivery-api/c/api/pin-codes/json?filter_codes=${pincode}`
      
      const response = await axios.get<DelhiveryResponse>(
        apiUrl,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 15000,
        }
      )

      if (response.data?.delivery_codes && response.data.delivery_codes.length > 0) {
        const pincodeInfo = response.data.delivery_codes[0]
        
        if (pincodeInfo.postal_code) {
          set({
            pincodeData: pincodeInfo,
            loading: false,
            error: null,
          })
          return
        }
      }
      
      set({
        loading: false,
        error: "Pincode not found or not serviceable",
        pincodeData: null,
      })
      
    } catch (err: any) {
      let errorMessage = "Failed to fetch pincode data"
      
      if (err.code === "ECONNABORTED") {
        errorMessage = "Request timeout - API took too long to respond"
      } else if (err.response?.status === 404) {
        errorMessage = "Pincode not found"
      } else if (err.response?.status === 401) {
        errorMessage = "Authentication failed - Invalid API token"
      } else if (err.response?.status === 403) {
        errorMessage = "Access forbidden"
      } else if (err.response?.status === 500) {
        errorMessage = "Delhivery server error"
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.message === "Network Error") {
        errorMessage = "Cannot connect to Delhivery API. Please check your internet connection."
      } else if (err.message?.includes("CORS")) {
        errorMessage = "CORS error - API blocked by browser security policy"
      } else if (err.message) {
        errorMessage = err.message
      }
      
      console.error("Pincode fetch error:", err)
      
      set({
        loading: false,
        error: errorMessage,
        pincodeData: null,
      })
    }
  },

  clearData: () => {
    set({ pincodeData: null, error: null, loading: false })
  },
}))
