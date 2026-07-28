import { create } from "zustand"
import toast from "react-hot-toast"
import http from "../common/httpRequest"

export interface RouteItem {
  id: string
  from: string
  to: string
  branches: string[]
  status: "Active" | "Inactive"
  createdAt?: string
  updatedAt?: string
}

type RoutePayload = Omit<RouteItem, "id" | "createdAt" | "updatedAt">

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface RouteState {
  routes: RouteItem[]
  selectedRoute: RouteItem | null
  loading: boolean
  error: string | null
  pagination: Pagination | null

  fetchRoutes: (params?: { page?: number; limit?: number; search?: string; status?: string }) => Promise<void>
  addRoute: (route: RoutePayload) => Promise<void>
  updateRoute: (id: string, route: Partial<RoutePayload>) => Promise<void>
  updateRouteStatus: (id: string, status: "Active" | "Inactive") => Promise<void>
  deleteRoute: (id: string) => Promise<void>
  setSelectedRoute: (route: RouteItem | null) => void
}

const normalizeRoutes = (rawData: any): RouteItem[] => {
  const list = Array.isArray(rawData?.routes)
    ? rawData.routes
    : Array.isArray(rawData?.data)
    ? rawData.data
    : Array.isArray(rawData)
    ? rawData
    : []

  return list.map((item: any) => ({
    id: item._id || item.id,
    from: item.from || "",
    to: item.to || "",
    branches: Array.isArray(item.branches)
      ? item.branches
      : typeof item.branches === "string"
      ? [item.branches]
      : [],
    status: (item.status === "Inactive" ? "Inactive" : "Active") as "Active" | "Inactive",
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }))
}

export const useRouteStore = create<RouteState>((set, get) => ({
  routes: [],
  selectedRoute: null,
  loading: false,
  error: null,
  pagination: null,

  fetchRoutes: async (params) => {
    set({ loading: true, error: null })
    try {
      const query = new URLSearchParams()
      if (params?.page) query.set("page", String(params.page))
      if (params?.limit) query.set("limit", String(params.limit))
      if (params?.search) query.set("search", params.search)
      if (params?.status) query.set("status", params.status)

      const response = await http.get(`/admin/route${query.toString() ? `?${query.toString()}` : ""}`)
      const rawData = response.data?.data
      const routes = normalizeRoutes(rawData)

      const pagination = rawData?.pagination
        ? {
            total: Number(rawData.pagination.total || routes.length || 0),
            page: Number(rawData.pagination.page || params?.page || 1),
            limit: Number(rawData.pagination.limit || params?.limit || 10),
            totalPages: Number(rawData.pagination.totalPages || 1),
          }
        : null

      set({ routes, pagination, loading: false })
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to fetch routes"
      set({ loading: false, error: message })
      toast.error(message)
    }
  },

  addRoute: async (route) => {
    set({ loading: true, error: null })
    try {
      const response = await http.post("/admin/route", route)
      const nested = response.data?.data
      if (nested && nested.success === false) {
        const message = nested.message || "Failed to add route"
        set({ loading: false, error: message })
        toast.error(message)
        return
      }
      toast.success("Route added successfully")
      await get().fetchRoutes()
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to add route"
      set({ loading: false, error: message })
      toast.error(message)
      throw error
    }
  },

  updateRoute: async (id, route) => {
    set({ loading: true, error: null })
    try {
      const response = await http.put(`/admin/route/${id}`, route)
      const nested = response.data?.data
      if (nested && nested.success === false) {
        const message = nested.message || "Failed to update route"
        set({ loading: false, error: message })
        toast.error(message)
        return
      }
      toast.success("Route updated successfully")
      await get().fetchRoutes()
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to update route"
      set({ loading: false, error: message })
      toast.error(message)
      throw error
    }
  },

  updateRouteStatus: async (id, status) => {
    set({ loading: true, error: null })
    try {
      const response = await http.patch(`/admin/route/${id}/status`, { status })
      const nested = response.data?.data
      if (nested && nested.success === false) {
        const message = nested.message || "Failed to update route status"
        set({ loading: false, error: message })
        toast.error(message)
        return
      }
      toast.success("Route status updated successfully")
      await get().fetchRoutes()
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to update route status"
      set({ loading: false, error: message })
      toast.error(message)
      throw error
    }
  },

  deleteRoute: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await http.delete(`/admin/route/${id}`)
      const nested = response.data?.data
      if (nested && nested.success === false) {
        const message = nested.message || "Failed to delete route"
        set({ loading: false, error: message })
        toast.error(message)
        return
      }
      toast.success("Route deleted successfully")
      set((state) => ({
        routes: state.routes.filter((route) => route.id !== id),
        loading: false,
      }))
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to delete route"
      set({ loading: false, error: message })
      toast.error(message)
      throw error
    }
  },

  setSelectedRoute: (route) => set({ selectedRoute: route }),
}))
