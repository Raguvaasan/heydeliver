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

interface DeliveryPerformanceReportData {
  overview: {
    onTimePercent: number
    avgDeliveryTime: number
    firstAttemptSuccess: number
    csatScore: number
    totalDelivered: number
    slaMet: number
  }
  zonePerformance: Array<{
    zone: string
    deliveries: number
    onTime: number
    avgTime: string
  }>
  attemptAnalysis: Array<{ label: string; value: number }>
  timeDistribution: Array<{ label: string; value: number }>
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

  // Delivery Performance Report
  deliveryPerformanceReport: DeliveryPerformanceReportData | null
  deliveryPerformanceLoading: boolean
  deliveryPerformanceError: string | null
  fetchDeliveryPerformanceReport: (period: PeriodType, startDate?: string, endDate?: string) => Promise<void>
}

// helper: convert raw backend payload into frontend-friendly structure
function normalizeDeliveryPerformance(raw: any): DeliveryPerformanceReportData {
  const overviewRaw = raw?.overview || {};

  const overview = {
    onTimePercent:
      overviewRaw.onTimePercent ?? overviewRaw.onTimePercentage ?? 0,
    avgDeliveryTime:
      overviewRaw.avgDeliveryTime ?? overviewRaw.avgTimeDays ?? 0,
    firstAttemptSuccess:
      overviewRaw.firstAttemptSuccess ?? overviewRaw.firstAttemptPercentage ?? 0,
    csatScore: overviewRaw.csatScore ?? 0,
    totalDelivered: overviewRaw.totalDelivered ?? 0,
    slaMet: overviewRaw.slaMet ?? overviewRaw.slaMetPercentage ?? 0,
  };

  const zonePerformance = Array.isArray(raw?.zonePerformance)
    ? raw.zonePerformance
    : [];

  // convert both array and object payloads for attempt analysis
  const attemptAnalysis: Array<{ label: string; value: number }> = [];
  if (Array.isArray(raw?.attemptAnalysis)) {
    attemptAnalysis.push(...raw.attemptAnalysis);
  } else if (raw?.deliveryAttemptAnalysis) {
    const a = raw.deliveryAttemptAnalysis;
    if (typeof a === 'object') {
      if ('firstAttempt' in a) {
        attemptAnalysis.push({ label: '1st Attempt', value: a.firstAttempt });
      }
      if ('secondAttempt' in a) {
        attemptAnalysis.push({ label: '2nd Attempt', value: a.secondAttempt });
      }
      if ('thirdPlus' in a) {
        attemptAnalysis.push({ label: '3rd+ Attempt', value: a.thirdPlus });
      }
    }
  }

  const timeDistribution: Array<{ label: string; value: number }> = [];
  if (Array.isArray(raw?.timeDistribution)) {
    timeDistribution.push(...raw.timeDistribution);
  } else if (raw?.deliveryTimeDistribution) {
    const t = raw.deliveryTimeDistribution;
    if (typeof t === 'object') {
      if ('within1day' in t) {
        timeDistribution.push({ label: 'Within 1 day', value: t.within1day });
      }
      if ('1-2days' in t) {
        timeDistribution.push({ label: '1-2 days', value: t['1-2days'] });
      }
      if ('2-3days' in t) {
        timeDistribution.push({ label: '2-3 days', value: t['2-3days'] });
      }
      if ('3+days' in t) {
        timeDistribution.push({ label: '3+ days', value: t['3+days'] });
      }
    }
  }

  const period = raw?.period || '';

  return { overview, zonePerformance, attemptAnalysis, timeDistribution, period };
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

  // initial values for delivery performance
  deliveryPerformanceReport: null,
  deliveryPerformanceLoading: false,
  deliveryPerformanceError: null,

  fetchDeliveryPerformanceReport: async (period: PeriodType, startDate?: string, endDate?: string) => {
    set({ deliveryPerformanceLoading: true, deliveryPerformanceError: null })
    try {
      let url = "/admin/reports/delivery-performance"
      const params: string[] = []

      if (period !== "thisMonth") {
        params.push(`period=${period}`)
      }

      if (period === "customRange" && startDate && endDate) {
        params.push(`startDate=${startDate}`)
        params.push(`endDate=${endDate}`)
      }

      const queryString = params.length > 0 ? `?${params.join("&")}` : ""
      const response = await httpRequest.get<{ success: boolean; data: DeliveryPerformanceReportData }>(
        `${url}${queryString}`
      )

      if (response.data.success && response.data.data) {
        // normalize backend payload into expected structure
        const safeData = normalizeDeliveryPerformance(response.data.data)
        if (!safeData.overview) {
          throw new Error("Delivery performance report missing overview")
        }
        set({ deliveryPerformanceReport: safeData, deliveryPerformanceLoading: false })
      } else {
        set({
          deliveryPerformanceError: "Failed to fetch delivery performance report",
          deliveryPerformanceLoading: false,
          deliveryPerformanceReport: null,
        })
        toast.error("Failed to fetch delivery performance report")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch delivery performance report"
      set({
        deliveryPerformanceError: errorMessage,
        deliveryPerformanceLoading: false,
      })
      toast.error(errorMessage)
    }
  },
}))
