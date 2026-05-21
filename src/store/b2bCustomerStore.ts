import { create } from "zustand"
import http from "../common/httpRequest"
import toast from "react-hot-toast"

export interface B2BCustomer {
  id: string
  firstName: string
  lastName: string
  email: string
  mobileNumber: string
  gst?: string
  status: "Active" | "Inactive"
  createdAt?: string
  updatedAt?: string
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export type B2BCustomerPayload = {
  firstName: string
  lastName: string
  email: string
  password?: string
  mobileNumber: string
  gst?: string
  status?: "Active" | "Inactive"
}

interface B2BCustomerState {
  customers: B2BCustomer[]
  loading: boolean
  error: string | null
  selectedCustomer: B2BCustomer | null
  pagination: Pagination | null
  fetchCustomers: (page?: number, limit?: number, search?: string, status?: string) => Promise<void>
  addCustomer: (customer: B2BCustomerPayload) => Promise<void>
  updateCustomer: (id: string, customer: Partial<B2BCustomerPayload>) => Promise<void>
  deleteCustomer: (id: string) => Promise<void>
  setSelectedCustomer: (customer: B2BCustomer | null) => void
}

export const useB2BCustomerStore = create<B2BCustomerState>((set) => ({
  customers: [], loading: false, error: null, selectedCustomer: null, pagination: null,
  fetchCustomers: async (page = 1, limit = 10, search, status) => {
    set({ loading: true, error: null })
    try {
      const params: Record<string, string | number> = { page, limit }
      if (search) params.search = search
      if (status) params.status = status
      const res = await http.get("/admin/customers", { params })
      const data = res.data?.data || res.data
      const list = data?.customers || data || []
      set({
        customers: (Array.isArray(list) ? list : []).map((i: any) => ({
          id: i._id || i.id,
          firstName: i.firstName || "",
          lastName: i.lastName || "",
          email: i.email || "",
          mobileNumber: i.mobileNumber || i.phone || "",
          gst: i.gst,
          status: i.status || "Inactive",
          createdAt: i.createdAt,
          updatedAt: i.updatedAt,
        })),
        pagination: data?.pagination ?? null,
        loading: false,
      })
    } catch (error: any) {
      set({ loading: false, error: error?.response?.data?.message || error?.message || "Failed to fetch B2B customers" })
    }
  },
  addCustomer: async (customer) => {
    set({ loading: true, error: null })
    try {
      const res = await http.post("/customer/email-auth/signup", customer)
      const i = res.data?.data || res.data
      set((state) => ({
        customers: [...state.customers, {
          id: i._id || i.id,
          firstName: i.firstName || customer.firstName,
          lastName: i.lastName || customer.lastName,
          email: i.email || customer.email,
          mobileNumber: i.mobileNumber || customer.mobileNumber,
          gst: i.gst || customer.gst,
          status: i.status || "Active",
          createdAt: i.createdAt,
          updatedAt: i.updatedAt,
        }],
        loading: false,
      }))
      toast.success("B2B customer added successfully!")
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to add B2B customer"
      set({ loading: false, error: message }); toast.error(message); throw new Error(message)
    }
  },
  updateCustomer: async (id, customer) => {
    set({ loading: true, error: null })
    try {
      const res = await http.put(`/admin/customers/${encodeURIComponent(id)}`, customer)
      const i = res.data?.data || res.data
      set((state) => ({
        customers: state.customers.map((c) => c.id === id ? {
          ...c,
          firstName: i.firstName ?? c.firstName,
          lastName: i.lastName ?? c.lastName,
          email: i.email ?? c.email,
          mobileNumber: i.mobileNumber ?? c.mobileNumber,
          gst: i.gst ?? c.gst,
          status: i.status ?? c.status,
          updatedAt: i.updatedAt ?? c.updatedAt,
        } : c),
        loading: false,
      }))
      toast.success("B2B customer updated successfully!")
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to update B2B customer"
      set({ loading: false, error: message }); toast.error(message); throw new Error(message)
    }
  },
  deleteCustomer: async (id) => {
    set({ loading: true, error: null })
    try {
      await http.delete(`/admin/customers/${encodeURIComponent(id)}`)
      set((state) => ({ customers: state.customers.filter((c) => c.id !== id), loading: false }))
      toast.success("B2B customer deleted successfully!")
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to delete B2B customer"
      set({ loading: false, error: message }); toast.error(message); throw new Error(message)
    }
  },
  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
}))
