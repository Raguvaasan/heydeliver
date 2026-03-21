import { create } from "zustand"
import http from "../common/httpRequest"
import toast from "react-hot-toast"

export interface Career {
  _id: string
  title: string
  experience: string
  qualification: string
  shortDesc: string
  description: string[]
  skills: string[]
  createdAt?: string
  updatedAt?: string
}

export type CareerPayload = Omit<Career, "_id" | "createdAt" | "updatedAt">

interface CareerState {
  careers: Career[]
  loading: boolean
  error: string | null
  fetchCareers: () => Promise<void>
  createCareer: (payload: CareerPayload) => Promise<void>
  updateCareer: (id: string, payload: Partial<CareerPayload>) => Promise<void>
  deleteCareer: (id: string) => Promise<void>
}

export const useCareerStore = create<CareerState>((set) => ({
  careers: [],
  loading: false,
  error: null,

  fetchCareers: async () => {
    set({ loading: true, error: null })
    try {
      const res = await http.get("/careers")
      const data = res.data
      set({ careers: Array.isArray(data) ? data : data?.data ?? [], loading: false })
    } catch (err: any) {
      set({ loading: false, error: err?.message || "Failed to fetch careers" })
    }
  },

  createCareer: async (payload) => {
    try {
      const res = await http.post("/careers", payload)
      const newCareer = res.data?.data ?? res.data
      set((state) => ({ careers: [newCareer, ...state.careers] }))
      toast.success("Career posting created successfully")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create career")
      throw err
    }
  },

  updateCareer: async (id, payload) => {
    try {
      const res = await http.put(`/careers/${id}`, payload)
      const updated = res.data?.data ?? res.data
      set((state) => ({
        careers: state.careers.map((c) => (c._id === id ? { ...c, ...updated } : c)),
      }))
      toast.success("Career posting updated successfully")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update career")
      throw err
    }
  },

  deleteCareer: async (id) => {
    try {
      await http.delete(`/careers/${id}`)
      set((state) => ({ careers: state.careers.filter((c) => c._id !== id) }))
      toast.success("Career posting deleted")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete career")
      throw err
    }
  },
}))
