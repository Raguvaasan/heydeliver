import { create } from "zustand"
import toast from "react-hot-toast"
import http from "../common/httpRequest"

export interface B2BOrder {
  id: string
  orderNumber: string
  bookingDate: string
  customerName: string
  customerPhone: string
  approximateWeight: string | number
  vehicleType: string
  status: string
  [key: string]: unknown
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface B2BOrderState {
  orders: B2BOrder[]
  loading: boolean
  error: string | null
  pagination: Pagination | null
  fetchOrders: (options?: {
    page?: number
    limit?: number
    search?: string
    startDate?: string
    endDate?: string
  }) => Promise<void>
}

const normalizeOrder = (item: any): B2BOrder => ({
  ...item,
  id: item?._id || item?.id || item?.orderId || "",
  orderNumber: item?.orderNumber || item?.bookingId || item?.orderId || item?.lrNumber || "-",
  bookingDate: item?.bookingDate || item?.createdAt || item?.orderDate || item?.date || "",
  customerName: item?.bookingCustomer?.name || item?.customerName || item?.customer?.name || item?.consigneeName || item?.name || "-",
  customerPhone: item?.customerPhone || item?.bookingCustomer?.phoneNumber || item?.customer?.phone || item?.customerNumber || item?.phone || "-",
  approximateWeight: item?.shipment?.approximateWeight ?? item?.approximateWeight ?? "-",
  vehicleType: item?.selectedVehicle?.vehicleType || item?.selectedVehicleId?.vehicleType || item?.vehicleType || "-",
  status: item?.status || "-",
  driverId: item?.driverId || item?.driver?._id || item?.driver?.id || "",
})

export const useB2BOrderStore = create<B2BOrderState>((set) => ({
  orders: [],
  loading: false,
  error: null,
  pagination: null,

  fetchOrders: async ({ page = 1, limit = 10, search, startDate, endDate } = {}) => {
    set({ loading: true, error: null })
    try {
      const response = await http.get("/admin/b2b/orders", {
        params: {
          page,
          limit,
          ...(search?.trim() ? { search: search.trim() } : {}),
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
        },
      })

      const payload = response.data?.data ?? response.data
      const items = Array.isArray(payload)
        ? payload
        : payload?.orders || payload?.items || []
      const orders = Array.isArray(items) ? items.map(normalizeOrder) : []
      const meta = response.data?.pagination || payload?.pagination

      set({
        orders,
        pagination: meta
          ? {
              total: Number(meta.total || orders.length),
              page: Number(meta.page || page),
              limit: Number(meta.limit || limit),
              totalPages: Number(meta.totalPages || 1),
            }
          : { total: orders.length, page, limit, totalPages: Math.max(1, Math.ceil(orders.length / limit)) },
        loading: false,
      })
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to fetch B2B orders"
      set({ orders: [], loading: false, error: message })
      toast.error(message)
    }
  },
}))
