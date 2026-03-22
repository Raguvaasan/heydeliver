import { create } from "zustand"
import http from "../common/httpRequest"
import toast from "react-hot-toast"

interface Hub {
  id: string
  hubName: string
  hubManagerName: string
  phoneNo: string
  address: string
  city: string
  state: string
  pincode: string
  username?: string
  password?: string
  status: boolean
  createdAt?: string
  updatedAt?: string
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

type HubPayload = Omit<Hub, "id" | "createdAt" | "updatedAt">

interface HubState {
  hubs: Hub[]
  loading: boolean
  error: string | null
  selectedHub: Hub | null
  pagination: Pagination | null

  // Actions
  fetchHubs: (page?: number, limit?: number) => Promise<void>
  addHub: (hub: HubPayload) => Promise<void>
  updateHub: (id: string, hub: Partial<HubPayload>) => Promise<void>
  deleteHub: (id: string) => Promise<void>
  setSelectedHub: (hub: Hub | null) => void
}

export const useHubStore = create<HubState>((set, get) => ({
  hubs: [],
  loading: false,
  error: null,
  selectedHub: null,
  pagination: null,

  fetchHubs: async (page = 1, limit = 10) => {
    set({ loading: true, error: null })
    try {
      const response = await http.get("/admin/hub", {
        params: { page, limit },
      })

      const rawData = response.data?.data?.data || response.data?.data?.hubs || response.data?.data || []
      const hubsArray = Array.isArray(rawData) ? rawData : []

      const hubs = hubsArray.map((item: any) => ({
        id: item._id || item.id,
        hubName: item.hubName,
        hubManagerName: item.hubManagerName,
        phoneNo: String(item.phoneNo || ""),
        address: item.address,
        city: item.city,
        state: item.state,
        pincode: String(item.pincode || ""),
        username: item.username,
        status: item.status !== undefined ? item.status : true,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }))

      const pagination = response.data?.data?.pagination ?? null

      set({ hubs, pagination, loading: false })
    } catch (error: any) {
      set({
        loading: false,
        error: error?.response?.data?.message || error?.message || "Failed to fetch hubs",
      })
    }
  },

  addHub: async (hub) => {
    set({ loading: true, error: null })
    try {
      const hubData = {
        ...hub,
        status: hub.status === "Active" || hub.status === true,
      }
      await http.post("/admin/hub", hubData)
      toast.success("Hub added successfully!")
      set({ loading: false })
      // Re-fetch to get the updated list
      get().fetchHubs()
    } catch (error: any) {
      const apiMessage = error?.response?.data?.message
      const detailMessages = Array.isArray(error?.response?.data?.errors)
        ? error.response.data.errors.map((e: any) => e?.message).filter(Boolean)
        : []
      const message = detailMessages.length
        ? detailMessages.join("; ")
        : apiMessage || error?.message || "Failed to add hub"

      set({ loading: false, error: message })
      toast.error(message)
      throw new Error(message)
    }
  },

  updateHub: async (id, hub) => {
    set({ loading: true, error: null })
    try {
      const hubData = {
        ...hub,
        status: hub.status === "Active" || hub.status === true,
      }
      await http.put(`/admin/hub/${id}`, hubData)
      toast.success("Hub updated successfully!")
      set({ loading: false })
      // Re-fetch to get the updated list
      get().fetchHubs()
    } catch (error: any) {
      const apiMessage = error?.response?.data?.message
      const detailMessages = Array.isArray(error?.response?.data?.errors)
        ? error.response.data.errors.map((e: any) => e?.message).filter(Boolean)
        : []
      const message = detailMessages.length
        ? detailMessages.join("; ")
        : apiMessage || error?.message || "Failed to update hub"

      set({ loading: false, error: message })
      toast.error(message)
      throw new Error(message)
    }
  },

  deleteHub: async (id) => {
    set({ loading: true, error: null })
    try {
      if (!id) {
        throw new Error("Hub ID is required")
      }
      await http.delete(`/admin/hub/${encodeURIComponent(id)}`)
      set((state) => ({
        hubs: state.hubs.filter((h) => h.id !== id),
        loading: false,
      }))
      toast.success("Hub deleted successfully!")
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to delete hub"
      set({ loading: false, error: message })
      toast.error(message)
      throw new Error(message)
    }
  },

  setSelectedHub: (hub) => {
    set({ selectedHub: hub })
  },
}))
