import { create } from "zustand"
import http from "../common/httpRequest"
import toast from "react-hot-toast"

export interface CollectionAgency {
  id: string
  collectionAgencyName: string
  ownerName: string
  phone: string
  status: "Active" | "Inactive"
  email?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  gstNumber?: string
  username?: string
  password?: string
  createdAt?: string
  updatedAt?: string
}

type CollectionAgencyPayload = Omit<CollectionAgency, "id" | "createdAt" | "updatedAt">

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface CollectionAgencyState {
  collectionAgencies: CollectionAgency[]
  loading: boolean
  error: string | null
  selectedCollectionAgency: CollectionAgency | null
  pagination: Pagination | null
  fetchCollectionAgencies: (page?: number, limit?: number, search?: string) => Promise<void>
  addCollectionAgency: (collectionAgency: CollectionAgencyPayload) => Promise<void>
  updateCollectionAgency: (id: string, collectionAgency: Partial<CollectionAgencyPayload>) => Promise<void>
  updateCollectionAgencyStatus: (id: string, status: "Active" | "Inactive") => Promise<void>
  deleteCollectionAgency: (id: string) => Promise<void>
  setSelectedCollectionAgency: (collectionAgency: CollectionAgency | null) => void
}

const normalizeList = (responseData: any): any[] => {
  const raw = responseData?.data
  if (Array.isArray(raw?.collectionAgencies)) return raw.collectionAgencies
  if (Array.isArray(raw?.collectionAgency)) return raw.collectionAgency
  if (Array.isArray(raw?.data)) return raw.data
  if (Array.isArray(raw)) return raw
  return []
}

export const useCollectionAgencyStore = create<CollectionAgencyState>((set, get) => ({
  collectionAgencies: [],
  loading: false,
  error: null,
  selectedCollectionAgency: null,
  pagination: null,

  fetchCollectionAgencies: async (page = 1, limit = 10, search = "") => {
    set({ loading: true, error: null })
    try {
      const response = await http.get("/admin/collection-agency", {
        params: { page, limit, ...(search.trim() ? { search: search.trim() } : {}) },
      })

      const collectionAgencies = normalizeList(response.data).map((item: any) => ({
        id: item._id || item.id,
        collectionAgencyName: item.collectionAgencyName,
        ownerName: item.ownerName,
        phone: item.phone,
        status: item.status || "Active",
        email: item.email,
        address: item.address,
        city: item.city,
        state: item.state,
        pincode: item.pincode,
        gstNumber: item.gstNumber,
        username: item.username,
        password: item.password,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }))

      const pagination = response.data?.data?.pagination ?? null
      set({ collectionAgencies, pagination, loading: false })
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to fetch collection agencies"
      set({ loading: false, error: message })
      toast.error(message)
    }
  },

  addCollectionAgency: async (collectionAgency) => {
    set({ loading: true, error: null })
    try {
      await http.post("/admin/collection-agency", collectionAgency)
      toast.success("Collection agency added successfully")
      await get().fetchCollectionAgencies()
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to add collection agency"
      set({ loading: false, error: message })
      toast.error(message)
      throw error
    }
  },

  updateCollectionAgency: async (id, collectionAgency) => {
    set({ loading: true, error: null })
    try {
      await http.put(`/admin/collection-agency/${id}`, collectionAgency)
      toast.success("Collection agency updated successfully")
      await get().fetchCollectionAgencies()
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to update collection agency"
      set({ loading: false, error: message })
      toast.error(message)
      throw error
    }
  },

  updateCollectionAgencyStatus: async (id, status) => {
    set({ loading: true, error: null })
    try {
      await http.patch(`/admin/collection-agency/${id}/status`, { status })
      toast.success("Collection agency status updated successfully")
      await get().fetchCollectionAgencies()
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to update collection agency status"
      set({ loading: false, error: message })
      toast.error(message)
      throw error
    }
  },

  deleteCollectionAgency: async (id) => {
    set({ loading: true, error: null })
    try {
      await http.delete(`/admin/collection-agency/${encodeURIComponent(id)}`)
      set((state) => ({
        collectionAgencies: state.collectionAgencies.filter((item) => item.id !== id),
        loading: false,
      }))
      toast.success("Collection agency deleted successfully")
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to delete collection agency"
      set({ loading: false, error: message })
      toast.error(message)
      throw error
    }
  },

  setSelectedCollectionAgency: (collectionAgency) => set({ selectedCollectionAgency: collectionAgency }),
}))
