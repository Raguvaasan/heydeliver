import { create } from "zustand"
import http from "../common/httpRequest"
import toast from "react-hot-toast"

interface Agency {
  id: string
  agencyName: string
  agencyOwner: string
  phone: string
  assignedHub: string
  status: "Active" | "Inactive"
  email?: string
  address?: string
  createdAt?: string
}

interface AgencyState {
  agencies: Agency[]
  loading: boolean
  error: string | null
  selectedAgency: Agency | null
  
  // Actions
  fetchAgencies: () => Promise<void>
  addAgency: (agency: Omit<Agency, "id">) => Promise<void>
  updateAgency: (id: string, agency: Partial<Agency>) => Promise<void>
  deleteAgency: (id: string) => Promise<void>
  setSelectedAgency: (agency: Agency | null) => void
}

export const useAgencyStore = create<AgencyState>((set, get) => ({
  agencies: [
    {
      id: "1",
      agencyName: "SpeedX Express",
      agencyOwner: "David",
      phone: "918564785231",
      assignedHub: "Chennai Central Hub",
      status: "Active",
      email: "david@speedx.com",
      address: "123 Main Street, Chennai",
      createdAt: "2025-01-01",
    },
    {
      id: "2",
      agencyName: "Metro Parcel",
      agencyOwner: "Krish",
      phone: "918564785231",
      assignedHub: "Coimbatore Hub",
      status: "Active",
      email: "krish@metro.com",
      address: "456 Park Avenue, Coimbatore",
      createdAt: "2025-01-02",
    },
  ],
  loading: false,
  error: null,
  selectedAgency: null,

  fetchAgencies: async () => {
    set({ loading: true, error: null })
    try {
      const response = await http.get("/agencies")
      set({ agencies: response.data.data || [], loading: false })
    } catch (error: any) {
      // If API fails, keep the sample data
      console.log("Using sample data - API not available")
      set({ loading: false })
    }
  },

  addAgency: async (agency) => {
    set({ loading: true, error: null })
    try {
      const response = await http.post("/agencies", agency)
      const newAgency = response.data.data
      set((state) => ({
        agencies: [...state.agencies, newAgency],
        loading: false
      }))
      toast.success("Agency added successfully!")
    } catch (error: any) {
      // If API fails, add to local state with generated ID
      const newAgency = {
        ...agency,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }
      set((state) => ({
        agencies: [...state.agencies, newAgency],
        loading: false
      }))
      toast.success("Agency added successfully! (Demo mode)")
    }
  },

  updateAgency: async (id, agency) => {
    set({ loading: true, error: null })
    try {
      const response = await http.put(`/agencies/${id}`, agency)
      const updatedAgency = response.data.data
      set((state) => ({
        agencies: state.agencies.map((a) => 
          a.id === id ? { ...a, ...updatedAgency } : a
        ),
        loading: false
      }))
      toast.success("Agency updated successfully!")
    } catch (error: any) {
      // If API fails, update local state
      set((state) => ({
        agencies: state.agencies.map((a) => 
          a.id === id ? { ...a, ...agency } : a
        ),
        loading: false
      }))
      toast.success("Agency updated successfully! (Demo mode)")
    }
  },

  deleteAgency: async (id) => {
    set({ loading: true, error: null })
    try {
      await http.delete(`/agencies/${id}`)
      set((state) => ({
        agencies: state.agencies.filter((a) => a.id !== id),
        loading: false
      }))
      toast.success("Agency deleted successfully!")
    } catch (error: any) {
      // If API fails, delete from local state
      set((state) => ({
        agencies: state.agencies.filter((a) => a.id !== id),
        loading: false
      }))
      toast.success("Agency deleted successfully! (Demo mode)")
    }
  },

  setSelectedAgency: (agency) => {
    set({ selectedAgency: agency })
  },
}))

