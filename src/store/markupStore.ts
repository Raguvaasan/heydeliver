import { create } from "zustand"
import http from "../common/httpRequest"

interface MarkupData {
  id: string
  markup_category: "rate_calculator" | "rate_card"
  markup_type: "percentage" | "fixed"
  markup_value: number
  user_id: string | null
  franchise_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface MarkupState {
  rateCalculatorMarkup: MarkupData | null
  rateCardMarkup: MarkupData | null
  loading: boolean
  error: string | null

  // Rate Calculator Markup
  fetchRateCalculatorMarkup: () => Promise<void>
  saveRateCalculatorMarkup: (markupType: "percentage" | "fixed", markupValue: number) => Promise<void>

  // Rate Card Markup
  fetchRateCardMarkup: () => Promise<void>
  saveRateCardMarkup: (markupType: "percentage" | "fixed", markupValue: number) => Promise<void>

  // Clear
  clearError: () => void
}

const normalizeMarkupData = (data: any): MarkupData => ({
  ...data,
  markup_type: data?.markup_type === "flat" ? "fixed" : data?.markup_type,
})

export const useMarkupStore = create<MarkupState>((set) => ({
  rateCalculatorMarkup: null,
  rateCardMarkup: null,
  loading: false,
  error: null,

  fetchRateCalculatorMarkup: async () => {
    set({ loading: true, error: null })
    try {
      const response = await http.get("/settings/rate-calculator-markup")
      
      if (response.data.success) {
        set({
          rateCalculatorMarkup: normalizeMarkupData(response.data.data),
          loading: false,
          error: null,
        })
      } else {
        // No markup found, set defaults
        set({
          rateCalculatorMarkup: null,
          loading: false,
          error: null,
        })
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        // No markup configured, not an error
        set({
          rateCalculatorMarkup: null,
          loading: false,
          error: null,
        })
      } else {
        set({
          loading: false,
          error: err.response?.data?.message || "Failed to fetch rate calculator markup",
        })
      }
    }
  },

  saveRateCalculatorMarkup: async (markupType: "percentage" | "fixed", markupValue: number) => {
    set({ loading: true, error: null })
    try {
      const response = await http.post("/settings/rate-calculator-markup", {
        markup_type: markupType,
        markup_value: markupValue,
      })

      if (response.data.success) {
        set({
          rateCalculatorMarkup: response.data.data,
          loading: false,
          error: null,
        })
      } else {
        throw new Error(response.data.message || "Failed to save markup")
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to save rate calculator markup"
      set({
        loading: false,
        error: errorMessage,
      })
      throw new Error(errorMessage)
    }
  },

  fetchRateCardMarkup: async () => {
    set({ loading: true, error: null })
    try {
      const response = await http.get("/settings/rate-card-markup")
      
      if (response.data.success) {
        set({
          rateCardMarkup: normalizeMarkupData(response.data.data),
          loading: false,
          error: null,
        })
      } else {
        set({
          rateCardMarkup: null,
          loading: false,
          error: null,
        })
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        set({
          rateCardMarkup: null,
          loading: false,
          error: null,
        })
      } else {
        set({
          loading: false,
          error: err.response?.data?.message || "Failed to fetch rate card markup",
        })
      }
    }
  },

  saveRateCardMarkup: async (markupType: "percentage" | "fixed", markupValue: number) => {
    set({ loading: true, error: null })
    try {
      const response = await http.post("/settings/rate-card-markup", {
        markup_type: markupType,
        markup_value: markupValue,
      })

      if (response.data.success) {
        set({
          rateCardMarkup: normalizeMarkupData(response.data.data),
          loading: false,
          error: null,
        })
      } else {
        throw new Error(response.data.message || "Failed to save markup")
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to save rate card markup"
      set({
        loading: false,
        error: errorMessage,
      })
      throw new Error(errorMessage)
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))
