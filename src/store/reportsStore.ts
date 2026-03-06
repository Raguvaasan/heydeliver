import { create } from "zustand"
import httpRequest from "../common/httpRequest"
import toast from "react-hot-toast"

export type PeriodType = "today" | "yesterday" | "thisWeek" | "thisMonth" | "lastMonth" | "customRange"

interface StatusBreakdown {
  delivered: {
    count: number
    percentage: number
  }
  inTransit: {
    count: number
    percentage: number
  }
  pending: {
    count: number
    percentage: number
  }
  rto: {
    count: number
    percentage: number
  }
}

interface OrdersReportData {
  summary: {
    totalOrders: number
    period: string
  }
  statusBreakdown: StatusBreakdown
  successRate: number
  dailyTrend: {
    [key: string]: number
  }
}

interface RevenueReportData {
  overview: {
    totalRevenue: number
    shippingCharges: number
    codCharges: number
    otherCharges: number
  }
  revenueTrend: Array<{ date: string; revenue: number }>
  revenueBySource: Array<{ source: string; amount: number; percentage: number }>
  paymentMethodSplit: Array<{ method: string; amount: number; percentage: number }>
  period: string
}

interface ReportsState {
  // Orders Report
  ordersReport: OrdersReportData | null
  ordersReportLoading: boolean
  ordersReportError: string | null
  fetchOrdersReport: (period: PeriodType, startDate?: string, endDate?: string) => Promise<void>

  // Revenue Report
  revenueReport: RevenueReportData | null
  revenueReportLoading: boolean
  revenueReportError: string | null
  fetchRevenueReport: (period: PeriodType, startDate?: string, endDate?: string) => Promise<void>
}

export const useReportsStore = create<ReportsState>((set) => ({
  ordersReport: null,
  ordersReportLoading: false,
  ordersReportError: null,

  fetchOrdersReport: async (period: PeriodType, startDate?: string, endDate?: string) => {
    set({ ordersReportLoading: true, ordersReportError: null })
    try {
      let url = "/dashboard/orders-report"
      const params: string[] = []

      if (period !== "thisMonth") {
        params.push(`period=${period}`)
      }

      if (period === "customRange" && startDate && endDate) {
        params.push(`startDate=${startDate}`)
        params.push(`endDate=${endDate}`)
      }

      const queryString = params.length > 0 ? `?${params.join("&")}` : ""
      const response = await httpRequest.get<{ success: boolean; data: OrdersReportData }>(
        `${url}${queryString}`
      )

      if (response.data.success) {
        set({ ordersReport: response.data.data, ordersReportLoading: false })
      } else {
        set({
          ordersReportError: "Failed to fetch orders report",
          ordersReportLoading: false,
        })
        toast.error("Failed to fetch orders report")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch orders report"
      set({
        ordersReportError: errorMessage,
        ordersReportLoading: false,
      })
      toast.error(errorMessage)
    }
  },

  // initial values for revenue
  revenueReport: null,
  revenueReportLoading: false,
  revenueReportError: null,

  fetchRevenueReport: async (period: PeriodType, startDate?: string, endDate?: string) => {
    set({ revenueReportLoading: true, revenueReportError: null })
    try {
      let url = "/admin/reports/total-revenue"
      const params: string[] = []

      if (period !== "thisMonth") {
        params.push(`period=${period}`)
      }

      if (period === "customRange" && startDate && endDate) {
        params.push(`startDate=${startDate}`)
        params.push(`endDate=${endDate}`)
      }

      const queryString = params.length > 0 ? `?${params.join("&")}` : ""
      const response = await httpRequest.get<{ success: boolean; data: RevenueReportData }>(
        `${url}${queryString}`
      )

      if (response.data.success && response.data.data) {
        const safeData = response.data.data
        if (!safeData.overview) {
          throw new Error("Revenue report missing overview")
        }
        set({ revenueReport: safeData, revenueReportLoading: false })
      } else {
        set({
          revenueReportError: "Failed to fetch revenue report",
          revenueReportLoading: false,
          revenueReport: null,
        })
        toast.error("Failed to fetch revenue report")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch revenue report"
      set({
        revenueReportError: errorMessage,
        revenueReportLoading: false,
      })
      toast.error(errorMessage)
    }
  },
}))
