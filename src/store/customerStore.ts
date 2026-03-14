import { create } from "zustand"
import http from "../common/httpRequest"
import toast from "react-hot-toast"

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  gstNumber?: string
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

export type CustomerPayload = Omit<Customer, "id" | "createdAt" | "updatedAt">

interface CustomerState {
  customers: Customer[]
  loading: boolean
  error: string | null
  selectedCustomer: Customer | null
  pagination: Pagination | null

  fetchCustomers: (page?: number, limit?: number, search?: string, status?: string) => Promise<void>
  addCustomer: (customer: CustomerPayload) => Promise<void>
  updateCustomer: (id: string, customer: Partial<CustomerPayload>) => Promise<void>
  deleteCustomer: (id: string) => Promise<void>
  fetchCustomerById: (id: string) => Promise<void>
  setSelectedCustomer: (customer: Customer | null) => void
}

export const useCustomerStore = create<CustomerState>((set) => ({
  customers: [],
  loading: false,
  error: null,
  selectedCustomer: null,
  pagination: null,

  fetchCustomers: async (page = 1, limit = 10, search?: string, status?: string) => {
    set({ loading: true, error: null })
    try {
      const params: Record<string, string | number> = { page, limit }
      if (search) params["search"] = search
      if (status) params["status"] = status

      const response = await http.get("/api/customers", { params })

      const data = response.data?.data || response.data
      const customersRaw = data?.customers || data || []

      const customers = (Array.isArray(customersRaw) ? customersRaw : []).map((item: any) => ({
        id: item._id || item.id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        address: item.address,
        city: item.city,
        state: item.state,
        pincode: item.pincode,
        gstNumber: item.gstNumber,
        status: item.status,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }))

      const pagination = data?.pagination ?? null

      set({ customers, pagination, loading: false })
    } catch (error: any) {
      set({
        loading: false,
        error: error?.response?.data?.message || error?.message || "Failed to fetch customers",
      })
    }
  },

  addCustomer: async (customer) => {
    set({ loading: true, error: null })
    try {
      const response = await http.post("/api/customers", customer)

      const payload = response.data?.data || response.data
      const newCustomer: Customer = {
        id: payload?._id || payload?.id,
        name: payload?.name,
        email: payload?.email,
        phone: payload?.phone,
        address: payload?.address,
        city: payload?.city,
        state: payload?.state,
        pincode: payload?.pincode,
        gstNumber: payload?.gstNumber,
        status: payload?.status,
        createdAt: payload?.createdAt,
        updatedAt: payload?.updatedAt,
      }
      set((state) => ({
        customers: [...state.customers, newCustomer],
        loading: false,
      }))
      toast.success("Customer added successfully!")
    } catch (error: any) {
      const apiMessage = error?.response?.data?.message
      const detailMessages = Array.isArray(error?.response?.data?.errors)
        ? error.response.data.errors.map((e: any) => e?.message).filter(Boolean)
        : []
      const message = detailMessages.length
        ? detailMessages.join("; ")
        : apiMessage || error?.message || "Failed to add customer"

      set({ loading: false, error: message })
      toast.error(message)
      throw new Error(message)
    }
  },

  updateCustomer: async (id, customer) => {
    set({ loading: true, error: null })
    try {
      const response = await http.put(`/api/customers/${encodeURIComponent(id)}`, customer)

      const payload = response.data?.data || response.data
      const updatedCustomer: Partial<Customer> = {
        id: payload?._id || id,
        name: payload?.name,
        email: payload?.email,
        phone: payload?.phone,
        address: payload?.address,
        city: payload?.city,
        state: payload?.state,
        pincode: payload?.pincode,
        gstNumber: payload?.gstNumber,
        status: payload?.status,
        createdAt: payload?.createdAt,
        updatedAt: payload?.updatedAt,
      }
      set((state) => ({
        customers: state.customers.map((c) =>
          c.id === id ? { ...c, ...updatedCustomer } : c
        ),
        loading: false,
      }))
      toast.success("Customer updated successfully!")
    } catch (error: any) {
      const apiMessage = error?.response?.data?.message
      const detailMessages = Array.isArray(error?.response?.data?.errors)
        ? error.response.data.errors.map((e: any) => e?.message).filter(Boolean)
        : []
      const message = detailMessages.length
        ? detailMessages.join("; ")
        : apiMessage || error?.message || "Failed to update customer"

      set({ loading: false, error: message })
      toast.error(message)
      throw new Error(message)
    }
  },

  deleteCustomer: async (id) => {
    set({ loading: true, error: null })
    try {
      if (!id) {
        throw new Error("Customer ID is required")
      }
      await http.delete(`/api/customers/${encodeURIComponent(id)}`)
      set((state) => ({
        customers: state.customers.filter((c) => c.id !== id),
        loading: false,
      }))
      toast.success("Customer deleted successfully!")
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to delete customer"
      set({ loading: false, error: message })
      toast.error(message)
      throw new Error(message)
    }
  },

  fetchCustomerById: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await http.get(`/api/customers/${encodeURIComponent(id)}`)
      const payload = response.data?.data || response.data
      const customer: Customer = {
        id: payload?._id || payload?.id,
        name: payload?.name,
        email: payload?.email,
        phone: payload?.phone,
        address: payload?.address,
        city: payload?.city,
        state: payload?.state,
        pincode: payload?.pincode,
        gstNumber: payload?.gstNumber,
        status: payload?.status,
        createdAt: payload?.createdAt,
        updatedAt: payload?.updatedAt,
      }
      set({ selectedCustomer: customer, loading: false })
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to fetch customer"
      set({ loading: false, error: message })
      toast.error(message)
    }
  },

  setSelectedCustomer: (customer) => {
    set({ selectedCustomer: customer })
  },
}))
