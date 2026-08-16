import { create } from "zustand"
import toast from "react-hot-toast"
import http from "../common/httpRequest"

export interface ProfitPercentageItem {
  id: string
  branchId?: string
  agencyName: string
  agencyOwner?: string
  phone?: string
  email?: string
  city?: string
  state?: string
  status: string
  profitPercentage: number
  loadingChargePercentage: number
  miscChargePercentage: number
  raw?: any
}

export interface AgencyOption {
  id: string
  name: string
  raw?: any
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface ProfitPercentageState {
  items: ProfitPercentageItem[]
  agencyOptions: AgencyOption[]
  loading: boolean
  agencyLoading: boolean
  error: string | null
  pagination: Pagination | null
  agencyPagination: Pagination | null
  fetchItems: (options?: { page?: number; limit?: number; search?: string }) => Promise<void>
  fetchAgencyOptions: (options?: { page?: number; limit?: number }) => Promise<void>
  updatePercentages: (agencyId: string, payload: { profitPercentage: number; loadingChargePercentage: number; miscChargePercentage: number }) => Promise<void>
}

const extractList = (payload: any, fallbackKeys: string[]) => {
  if (Array.isArray(payload)) return payload
  for (const key of fallbackKeys) {
    if (Array.isArray(payload?.[key])) return payload[key]
  }
  return []
}

const extractPagination = (response: any, payload: any, page: number, limit: number): Pagination => {
  const meta = response?.data?.pagination || payload?.pagination || payload?.meta || {}
  return {
    total: meta.total || 0,
    page: meta.page || page,
    limit: meta.limit || limit,
    totalPages: meta.totalPages || 1,
  }
}

const normalizeItem = (item: any): ProfitPercentageItem => ({
  id: item?._id || item?.id || item?.branchId || "",
  branchId: item?.branchId || item?._id || item?.id || "",
  agencyName: item?.agencyName || item?.branchName || item?.name || "-",
  agencyOwner: item?.agencyOwner || item?.ownerName || "",
  phone: item?.phone || "",
  email: item?.email || "",
  city: item?.city || "",
  state: item?.state || "",
  status: item?.status || "Inactive",
  profitPercentage: Number(item?.profitPercentage ?? 0),
  loadingChargePercentage: Number(item?.loadingChargePercentage ?? 0),
  miscChargePercentage: Number(item?.miscChargePercentage ?? 0),
  raw: item,
})

const normalizeAgencyOption = (item: any): AgencyOption => ({
  id: item?._id || item?.id || item?.branchId || "",
  name: item?.agencyName || item?.branchName || item?.name || "-",
  raw: item,
})

export const useProfitPercentageStore = create<ProfitPercentageState>((set, get) => ({
  items: [],
  agencyOptions: [],
  loading: false,
  agencyLoading: false,
  error: null,
  pagination: null,
  agencyPagination: null,

  fetchItems: async ({ page = 1, limit = 10, search } = {}) => {
    set({ loading: true, error: null })
    try {
      const response = await http.get("/admin/branch-wallet", {
        params: {
          page,
          limit,
          ...(search !== undefined ? { search } : {}),
        },
      })

      const payload = response.data?.data ?? response.data
      const items = extractList(payload, ["wallets", "items", "results", "data"])
      const normalized = Array.isArray(items) ? items.map(normalizeItem) : []
      const pagination = extractPagination(response, payload, page, limit)

      set({ items: normalized, pagination, loading: false, error: null })
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to fetch profit percentages"
      set({ loading: false, error: message })
      toast.error(message)
    }
  },

  fetchAgencyOptions: async ({ page = 1, limit = 10 } = {}) => {
    set({ agencyLoading: true, error: null })
    try {
      const response = await http.get("/admin/agency", { params: { page, limit } })
      const payload = response.data?.data ?? response.data
      const items = extractList(payload, ["agencies", "items", "branches", "results", "data"])
      const agencyOptions = Array.isArray(items) ? items.map(normalizeAgencyOption) : []
      const agencyPagination = extractPagination(response, payload, page, limit)

      set({ agencyOptions, agencyPagination, agencyLoading: false, error: null })
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to fetch agencies"
      set({ agencyLoading: false, error: message })
      toast.error(message)
    }
  },

  updatePercentages: async (agencyId, payload) => {
    set({ loading: true, error: null })
    try {
      const response = await http.patch(`/admin/agency-wallet/${encodeURIComponent(agencyId)}/percentage`, {
        profitPercentage: Number(payload.profitPercentage),
        loadingChargePercentage: Number(payload.loadingChargePercentage),
        miscChargePercentage: Number(payload.miscChargePercentage),
      })

      const normalized = normalizeItem(response.data?.data ?? response.data)
      set((state) => ({
        items: state.items.map((item) => (item.id === normalized.id ? { ...item, ...normalized } : item)),
        loading: false,
      }))
      toast.success("Profit percentage updated successfully")
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to update profit percentage"
      set({ loading: false, error: message })
      toast.error(message)
      throw new Error(message)
    }
  },
}))
