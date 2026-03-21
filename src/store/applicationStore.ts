import { create } from "zustand"
import http from "../common/httpRequest"
import toast from "react-hot-toast"

export type ApplicationStatus = "pending" | "reviewed" | "rejected" | "accepted"

export interface Application {
  _id: string
  jobPostingId: { _id: string; title: string } | string
  name: string
  phone: string
  email: string
  coveringMessage: string
  resumePath?: string
  status: ApplicationStatus
  createdAt?: string
  updatedAt?: string
}

export interface ApplicationListParams {
  page?: number
  limit?: number
  status?: ApplicationStatus | ""
  jobPostingId?: string
  email?: string
}

export type ApplicationUpdatePayload = Partial<
  Pick<Application, "name" | "phone" | "email" | "coveringMessage" | "status">
>

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface ApplicationState {
  applications: Application[]
  loading: boolean
  error: string | null
  pagination: Pagination | null
  fetchApplications: (params?: ApplicationListParams) => Promise<void>
  updateApplication: (id: string, payload: ApplicationUpdatePayload) => Promise<void>
  deleteApplication: (id: string) => Promise<void>
}

export const useApplicationStore = create<ApplicationState>((set) => ({
  applications: [],
  loading: false,
  error: null,
  pagination: null,

  fetchApplications: async (params = {}) => {
    set({ loading: true, error: null })
    try {
      const query = new URLSearchParams()
      if (params.page) query.set("page", String(params.page))
      if (params.limit) query.set("limit", String(params.limit))
      if (params.status) query.set("status", params.status)
      if (params.jobPostingId) query.set("jobPostingId", params.jobPostingId)
      if (params.email) query.set("email", params.email)
      const qs = query.toString()
      const res = await http.get(`/applications${qs ? `?${qs}` : ""}`)
      const data = res.data
      const list: Application[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : []
      const pagination = data?.pagination ?? null
      set({ applications: list, pagination, loading: false })
    } catch (err: any) {
      set({ loading: false, error: err?.message || "Failed to fetch applications" })
    }
  },

  updateApplication: async (id, payload) => {
    try {
      const res = await http.put(`/applications/${id}`, payload)
      const updated: Application = res.data?.data ?? res.data
      set((state) => ({
        applications: state.applications.map((a) => (a._id === id ? { ...a, ...updated } : a)),
      }))
      toast.success("Application updated successfully")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update application")
      throw err
    }
  },

  deleteApplication: async (id) => {
    try {
      await http.delete(`/applications/${id}`)
      set((state) => ({ applications: state.applications.filter((a) => a._id !== id) }))
      toast.success("Application deleted")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete application")
      throw err
    }
  },
}))
