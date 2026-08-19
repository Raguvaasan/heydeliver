import { create } from "zustand"
import http from "../common/httpRequest"
import toast from "react-hot-toast"

interface Agency {
  id: string
  agencyName: string
  agencyOwner: string
  phone: string
  status: "Active" | "Inactive"
  agencyType?: boolean
  commission?: string | number | null
  email?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  username?: string
  password?: string
  createdAt?: string
  updatedAt?: string
  image?: string
  gstNumber?: string
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

type AgencyPayload = Omit<Agency, "id" | "createdAt" | "updatedAt" | "image"> & {
  image?: File | null
}

interface AgencyState {
  agencies: Agency[]
  loading: boolean
  error: string | null
  selectedAgency: Agency | null
  pagination: Pagination | null
  
  // Actions
  fetchAgencies: (page?: number, limit?: number) => Promise<void>
  addAgency: (agency: AgencyPayload) => Promise<void>
  updateAgency: (id: string, agency: Partial<AgencyPayload>) => Promise<void>
  deleteAgency: (id: string) => Promise<void>
  setSelectedAgency: (agency: Agency | null) => void
}

export const useAgencyStore = create<AgencyState>((set, get) => ({
  agencies: [],
  loading: false,
  error: null,
  selectedAgency: null,
  pagination: null,

  fetchAgencies: async (page = 1, limit = 10) => {
    set({ loading: true, error: null })
    try {
      const response = await http.get("/admin/agency", {
        params: { page, limit },
      })

      const agencies = (response.data?.data?.agencies || []).map((item: any) => ({
        id: item._id || item.id,
        agencyName: item.agencyName,
        agencyOwner: item.agencyOwner,
        phone: item.phone,
        status: item.status,
        agencyType: item.agencyType,
        commission: item.commission,
        email: item.email,
        address: item.address,
        city: item.city,
        state: item.state,
        pincode: item.pincode,
        username: item.username,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        image: item.image,
        gstNumber: item.gstNumber || item.gst,
        type: item.type
      }))

      const pagination = response.data?.data?.pagination ?? null

      set({ agencies, pagination, loading: false })
    } catch (error: any) {
      set({
        loading: false,
        error: error?.response?.data?.message || error?.message || "Failed to fetch agencies",
      })
    }
  },

  addAgency: async (agency) => {
    set({ loading: true, error: null })
    try {
      const hasImage = agency.image instanceof File

      const response = hasImage
        ? await (() => {
            const formData = new FormData()
            Object.entries(agency).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                if (key === "image" && value instanceof File) {
                  formData.append("image", value)
                } else {
                  formData.append(key, String(value))
                }
              }
            })
            return http.post("/admin/agency", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            })
          })()
        : await http.post("/admin/agency", agency)

      const payload = response.data?.data
      const newAgency: Agency = {
        id: payload?._id || payload?.id,
        agencyName: payload?.agencyName,
        agencyOwner: payload?.agencyOwner,
        phone: payload?.phone,
        status: payload?.status,
        agencyType: payload?.agencyType,
        commission: payload?.commission,
        email: payload?.email,
        address: payload?.address,
        city: payload?.city,
        state: payload?.state,
        pincode: payload?.pincode,
        username: payload?.username,
        createdAt: payload?.createdAt,
        updatedAt: payload?.updatedAt,
        image: payload?.image,
        gstNumber: payload?.gstNumber || payload?.gst,
      }
      set((state) => ({
        agencies: [...state.agencies, newAgency],
        loading: false
      }))
      toast.success("Agency added successfully!")
    } catch (error: any) {
      const apiMessage = error?.response?.data?.message
      const detailMessages = Array.isArray(error?.response?.data?.errors)
        ? error.response.data.errors.map((e: any) => e?.message).filter(Boolean)
        : []
      const message = detailMessages.length
        ? detailMessages.join("; ")
        : apiMessage || error?.message || "Failed to add agency"

      set({ loading: false, error: message })
      toast.error(message)
      throw new Error(message)
    }
  },

  updateAgency: async (id, agency) => {
    set({ loading: true, error: null })
    try {
      const hasImage = agency.image instanceof File

      const response = hasImage
        ? await (() => {
            const formData = new FormData()
            Object.entries(agency).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                if (key === "image" && value instanceof File) {
                  formData.append("image", value)
                } else {
                  formData.append(key, String(value))
                }
              }
            })
            return http.put(`/admin/agency/${id}`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            })
          })()
        : await http.put(`/admin/agency/${id}`, agency)

      const payload = response.data?.data
      const updatedAgency: Partial<Agency> = {
        id: payload?._id || id,
        agencyName: payload?.agencyName,
        agencyOwner: payload?.agencyOwner,
        phone: payload?.phone,
        status: payload?.status,
        agencyType: payload?.agencyType,
        commission: payload?.commission,
        email: payload?.email,
        address: payload?.address,
        city: payload?.city,
        state: payload?.state,
        pincode: payload?.pincode,
        username: payload?.username,
        createdAt: payload?.createdAt,
        updatedAt: payload?.updatedAt,
        image: payload?.image,
        gstNumber: payload?.gstNumber || payload?.gst,
      }
      set((state) => ({
        agencies: state.agencies.map((a) => 
          a.id === id ? { ...a, ...updatedAgency } : a
        ),
        loading: false
      }))
      toast.success("Agency updated successfully!")
    } catch (error: any) {
      const apiMessage = error?.response?.data?.message
      const detailMessages = Array.isArray(error?.response?.data?.errors)
        ? error.response.data.errors.map((e: any) => e?.message).filter(Boolean)
        : []
      const message = detailMessages.length
        ? detailMessages.join("; ")
        : apiMessage || error?.message || "Failed to update agency"

      set({ loading: false, error: message })
      toast.error(message)
      throw new Error(message)
    }
  },

  deleteAgency: async (id) => {
    set({ loading: true, error: null })
    try {
      if (!id) {
        throw new Error("Agency ID is required")
      }
      await http.delete(`/admin/agency/${encodeURIComponent(id)}`)
      set((state) => ({
        agencies: state.agencies.filter((a) => a.id !== id),
        loading: false
      }))
      toast.success("Agency deleted successfully!")
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to delete agency"
      set({ loading: false, error: message })
      toast.error(message)
      throw new Error(message)
    }
  },

  setSelectedAgency: (agency) => {
    set({ selectedAgency: agency })
  },
}))

