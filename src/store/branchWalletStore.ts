import { create } from "zustand"
import toast from "react-hot-toast"
import http from "../common/httpRequest"

export interface BranchWallet {
  id: string
  branchId?: string
  branchName: string
  walletBalance: number
  profit: number
  status: "Active" | "Inactive" | string
  createdAt?: string
  updatedAt?: string
  raw?: any
}

export interface BranchWalletFormValues {
  branchId: string
  amount: string
  paymentMethod: "Cash" | "UPI" | "Bank"
  reference: string
  remarks: string
}

export interface BranchOption {
  id: string
  name: string
  walletBalance: number
  raw?: any
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface BranchWalletState {
  branchWallets: BranchWallet[]
  selectedBranchWallet: BranchWallet | null
  branchOptions: BranchOption[]
  loading: boolean
  branchLoading: boolean
  error: string | null
  pagination: Pagination | null
  branchPagination: Pagination | null
  fetchBranchWallets: (options?: {
    page?: number
    limit?: number
    search?: string
    status?: string
  }) => Promise<void>
  fetchBranchOptions: (options?: {
    page?: number
    limit?: number
  }) => Promise<void>
  getBranchWalletById: (id: string) => Promise<void>
  addBranchCredit: (branchId: string, payload: Omit<BranchWalletFormValues, "branchId">) => Promise<void>
  setSelectedBranchWallet: (item: BranchWallet | null) => void
}

const normalizeBranchWallet = (item: any): BranchWallet => ({
  id: item?._id || item?.id || item?.branchId || "",
  branchId: item?.branchId || item?._id || item?.id || "",
  branchName: item?.branchName || item?.agencyName || item?.franchiseName || item?.branch?.agencyName || "-",
  walletBalance: Number(item?.walletBalance ?? item?.balance ?? item?.currentBalance ?? 0),
  profit: Number(item?.profit ?? item?.walletProfit ?? 0),
  status: item?.status || "Inactive",
  createdAt: item?.createdAt,
  updatedAt: item?.updatedAt,
  raw: item,
})

const normalizeBranchOption = (item: any): BranchOption => ({
  id: item?._id || item?.id || "",
  name: item?.agencyName || item?.franchiseName || item?.name || "-",
  walletBalance: Number(item?.walletBalance ?? item?.balance ?? 0),
  raw: item,
})

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

export const useBranchWalletStore = create<BranchWalletState>((set, get) => ({
  branchWallets: [],
  selectedBranchWallet: null,
  branchOptions: [],
  loading: false,
  branchLoading: false,
  error: null,
  pagination: null,
  branchPagination: null,

  fetchBranchWallets: async ({ page = 1, limit = 10, search, status } = {}) => {
    set({ loading: true, error: null })
    try {
      const response = await http.get("/admin/branch-wallet", {
        params: {
          page,
          limit,
          ...(search !== undefined ? { search } : {}),
          ...(status !== undefined ? { status } : {}),
        },
      })

      const payload = response.data?.data ?? response.data
      const items = extractList(payload, ["branchWallets", "items", "wallets", "results", "data"])
      const branchWallets = Array.isArray(items) ? items.map(normalizeBranchWallet) : []
      const pagination = extractPagination(response, payload, page, limit)

      set({ branchWallets, pagination, loading: false, error: null })
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to fetch branch wallets"
      set({ loading: false, error: message })
      toast.error(message)
    }
  },

  fetchBranchOptions: async ({ page = 1, limit = 10 } = {}) => {
    set({ branchLoading: true, error: null })
    try {
      const response = await http.get("/admin/agency", { params: { page, limit } })
      const payload = response.data?.data ?? response.data
      const items = extractList(payload, ["agencies", "items", "branches", "results", "data"])
      const branchOptions = Array.isArray(items) ? items.map(normalizeBranchOption) : []
      const branchPagination = extractPagination(response, payload, page, limit)

      set({ branchOptions, branchPagination, branchLoading: false, error: null })
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to fetch branches"
      set({ branchLoading: false, error: message })
      toast.error(message)
    }
  },

  getBranchWalletById: async (id) => {
    const existing = get().branchWallets.find((item) => item.id === id)
    if (existing) {
      set({ selectedBranchWallet: existing })
      return
    }

    set({ loading: true, error: null })
    try {
      const response = await http.get("/admin/branch-wallet", {
        params: { page: 1, limit: 10 },
      })
      const payload = response.data?.data ?? response.data
      const items = extractList(payload, ["branchWallets", "items", "wallets", "results", "data"])
      const branchWallets = Array.isArray(items) ? items.map(normalizeBranchWallet) : []
      const selectedBranchWallet = branchWallets.find((item) => item.id === id) || null
      const pagination = extractPagination(response, payload, 1, 10)
      set({ branchWallets, pagination, selectedBranchWallet, loading: false, error: null })
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to fetch branch wallet details"
      set({ loading: false, error: message })
      toast.error(message)
    }
  },

  addBranchCredit: async (branchId, payload) => {
    set({ loading: true, error: null })
    try {
      const response = await http.post(`/admin/branch-wallet/${encodeURIComponent(branchId)}/credit`, {
        amount: Number(payload.amount),
        paymentMethod: payload.paymentMethod,
        reference: payload.reference,
        remarks: payload.remarks,
      })

      const normalized = normalizeBranchWallet(response.data?.data ?? response.data)
      set((state) => ({
        branchWallets: state.branchWallets.map((item) => (item.id === normalized.id ? { ...item, ...normalized } : item)),
        loading: false,
      }))
      toast.success("Branch wallet credited successfully")
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to credit branch wallet"
      set({ loading: false, error: message })
      toast.error(message)
      throw new Error(message)
    }
  },

  setSelectedBranchWallet: (item) => set({ selectedBranchWallet: item }),
}))
