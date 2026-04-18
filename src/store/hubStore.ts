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
  username: string
  status: boolean
  createdAt?: string
  updatedAt?: string
}

type HubPayload = Omit<Hub, "id" | "createdAt" | "updatedAt"> & {
  password?: string
}

interface HubState {
  hubs: Hub[]
  loading: boolean
  error: string | null
  selectedHub: Hub | null

  fetchHubs: () => Promise<void>
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

  fetchHubs: async () => {
    set({ loading: true, error: null })
    try {
      const response = await http.get("/admin/hub")
      const rawData = response.data?.data
      const hubsList = Array.isArray(rawData?.hubs)
        ? rawData.hubs
        : Array.isArray(rawData?.data)
        ? rawData.data
        : Array.isArray(rawData)
        ? rawData
        : []

      const hubs = hubsList.map((item: any) => ({
        id: item._id || item.id,
        hubName: item.hubName,
        hubManagerName: item.hubManagerName,
        phoneNo: item.phoneNo,
        address: item.address,
        city: item.city,
        state: item.state,
        pincode: item.pincode,
        username: item.username,
        status: item.status !== undefined ? item.status : true,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }))
      set({ hubs, loading: false })
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to fetch hubs"
      set({ loading: false, error: message })
      toast.error(message)
    }
  },

  addHub: async (hub) => {
    set({ loading: true, error: null })
    try {
      const res = await http.post("/admin/hub", hub)
      const nested = res.data?.data
      if (nested && nested.success === false) {
        const message = nested.message || "Failed to add hub"
        set({ loading: false, error: message })
        toast.error(message)
        return
      }
      toast.success("Hub added successfully")
      await get().fetchHubs()
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to add hub"
      set({ loading: false, error: message })
      toast.error(message)
      throw error
    }
  },

  updateHub: async (id, hub) => {
    set({ loading: true, error: null })
    try {
      const res = await http.put(`/admin/hub/${id}`, hub)
      const nested = res.data?.data
      if (nested && nested.success === false) {
        const message = nested.message || "Failed to update hub"
        set({ loading: false, error: message })
        toast.error(message)
        return
      }
      toast.success("Hub updated successfully")
      await get().fetchHubs()
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to update hub"
      set({ loading: false, error: message })
      toast.error(message)
      throw error
    }
  },

  deleteHub: async (id) => {
    set({ loading: true, error: null })
    try {
      const res = await http.delete(`/admin/hub/${id}`)
      const nested = res.data?.data
      if (nested && nested.success === false) {
        const message = nested.message || "Failed to delete hub"
        set({ loading: false, error: message })
        toast.error(message)
        return
      }
      toast.success("Hub deleted successfully")
      set((state) => ({
        hubs: state.hubs.filter((h) => h.id !== id),
        loading: false,
      }))
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to delete hub"
      set({ loading: false, error: message })
      toast.error(message)
      throw error
    }
  },

  setSelectedHub: (hub) => set({ selectedHub: hub }),
}))
