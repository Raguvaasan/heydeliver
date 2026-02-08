import { create } from "zustand"
import axios from "axios"

interface TaxData {
  swacch_bharat_tax: number
  IGST: number
  SGST: number
  service_tax: number
  krishi_kalyan_cess: number
  CGST: number
}

interface RateData {
  charge_ROV: number
  charge_REATTEMPT: number
  charge_RTO: number
  charge_MPS: number
  charge_pickup: number
  charge_CWH: number
  tax_data: TaxData
  charge_DEMUR: number
  charge_AWB: number
  zone: string
  wt_rule_id: string | null
  charge_AIR: number
  charge_FSC: number
  charge_LABEL: number
  charge_COD: number
  status: string
  charge_PEAK: number
  charge_POD: number
  charge_LM: number
  adhoc_data: Record<string, any>
  wt_sop_type: string
  charge_CCOD: number
  gross_amount: number
  charge_E2E: number
  charge_DTO: number
  charge_COVID: number
  divisor: number
  zonal_cl: string | null
  charge_DL: number
  total_amount: number
  charge_DPH: number
  charge_FOD: number
  charge_DOCUMENT: number
  charge_WOD: number
  charge_INS: number
  charge_FS: number
  charge_CNC: number
  charge_FOV: number
  charge_QC: number
  charged_weight: number
}

interface RateCalculatorParams {
  md: string // Mode: E for Express, S for Surface
  ss: string // Shipment status: Delivered, RTO, etc
  d_pin: string // Destination pincode
  o_pin: string // Origin pincode
  cgm: number // Charged weight in grams
  pt: string // Payment type: Pre-paid or COD
}

interface RateCalculatorState {
  rateData: RateData | null
  loading: boolean
  error: string | null
  calculateRate: (params: RateCalculatorParams) => Promise<void>
  fetchRateData: (params: RateCalculatorParams) => Promise<RateData | null>
  clearData: () => void
}

const buildApiUrl = (params: RateCalculatorParams) => {
  const queryParams = new URLSearchParams({
    md: params.md,
    ss: params.ss,
    d_pin: params.d_pin,
    o_pin: params.o_pin,
    cgm: params.cgm.toString(),
    pt: params.pt,
  })

  return `/delhivery-api/api/kinko/v1/invoice/charges/.json?${queryParams.toString()}`
}

const getErrorMessage = (err: any) => {
  let errorMessage = "Failed to calculate rate"

  if (err.code === "ECONNABORTED") {
    errorMessage = "Request timeout - API took too long to respond"
  } else if (err.response?.status === 404) {
    errorMessage = "Rate not found for the given pincodes"
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

  return errorMessage
}

const requestRateData = async (params: RateCalculatorParams) => {
  const apiUrl = buildApiUrl(params)

  const response = await axios.get<RateData[]>(apiUrl, {
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 15000,
  })

  if (response.data && response.data.length > 0) {
    return response.data[0]
  }

  return null
}

export const useRateCalculatorStore = create<RateCalculatorState>((set) => ({
  rateData: null,
  loading: false,
  error: null,

  calculateRate: async (params: RateCalculatorParams) => {
    set({ loading: true, error: null, rateData: null })

    try {
      const data = await requestRateData(params)

      if (data) {
        set({ rateData: data, loading: false, error: null })
        return
      }

      set({
        loading: false,
        error: "No rate data found for the given parameters",
        rateData: null,
      })
    } catch (err: any) {
      const errorMessage = getErrorMessage(err)

      set({
        loading: false,
        error: errorMessage,
        rateData: null,
      })
    }
  },

  fetchRateData: async (params: RateCalculatorParams) => {
    try {
      return await requestRateData(params)
    } catch (err: any) {
      const errorMessage = getErrorMessage(err)
      console.error("Rate calculation error:", err)
      throw new Error(errorMessage)
    }
  },

  clearData: () => {
    set({ rateData: null, error: null, loading: false })
  },
}))
