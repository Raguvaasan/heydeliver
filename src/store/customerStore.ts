import { create } from "zustand"
import http from "../common/httpRequest"
import toast from "react-hot-toast"

export interface Customer {
  id: string
  serialNo?: number
  name: string
  email?: string
  phone?: string
  mobileNumber?: string
  address: string
  city?: string
  state?: string
  pincode?: string
  gstNumber?: string
  totalOrders?: number
  totalAmount?: number
  status?: "Active" | "Inactive"
  createdAt?: string
  updatedAt?: string
}

export interface CustomerOrder {
  id: string
  orderNumber?: string
  createdAt?: string
  deliveryAgencyName?: string
  article?: string
  paymentType?: string
  totalAmount?: number
  status?: string
}

export interface CustomerSummary {
  totalOrders?: number
  totalParcels?: number
  deliveredOrders?: number
  pendingOrders?: number
  totalAmount?: number
}

export interface CustomerDetails {
  customer: Customer
  summary: CustomerSummary
  orders: CustomerOrder[]
  pagination: Pagination | null
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
  customerDetails: CustomerDetails | null
  detailsLoading: boolean
  detailsError: string | null

  fetchCustomers: (page?: number, limit?: number, search?: string, status?: string) => Promise<void>
  addCustomer: (customer: CustomerPayload) => Promise<void>
  updateCustomer: (id: string, customer: Partial<CustomerPayload>) => Promise<void>
  deleteCustomer: (id: string) => Promise<void>
  fetchCustomerById: (id: string) => Promise<void>
  fetchCustomerDetails: (mobileNumber: string, page?: number, limit?: number, dateFrom?: string, dateTo?: string) => Promise<void>
  setSelectedCustomer: (customer: Customer | null) => void
}

export const useCustomerStore = create<CustomerState>((set) => ({
  customers: [],
  loading: false,
  error: null,
  selectedCustomer: null,
  pagination: null,
  customerDetails: null,
  detailsLoading: false,
  detailsError: null,

  fetchCustomers: async (page = 1, limit = 10, search?: string, status?: string) => {
    set({ loading: true, error: null })
    try {
      const params: Record<string, string | number> = { page, limit }
      if (search) params["search"] = search
      if (status) params["status"] = status

      const response = await http.get("/admin/booking-customer", { params })

      const data = response.data?.data || response.data
      const customersRaw = data?.customers || data || []

      const customers = (Array.isArray(customersRaw) ? customersRaw : []).map((item: any, index: number) => ({
        id: item._id || item.id || String(item.serialNo || index),
        serialNo: item.serialNo,
        name: item.name,
        email: item.email,
        phone: item.phone || item.mobileNumber,
        mobileNumber: item.mobileNumber || item.phone,
        address: item.address,
        city: item.city,
        state: item.state,
        pincode: item.pincode,
        gstNumber: item.gstNumber,
        totalOrders: item.totalOrders,
        totalAmount: item.totalAmount,
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
      const response = await http.post("/customers", customer)

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
      const response = await http.put(`/customers/${encodeURIComponent(id)}`, customer)

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
      await http.delete(`/customers/${encodeURIComponent(id)}`)
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
      const response = await http.get(`/customers/${encodeURIComponent(id)}`)
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

  fetchCustomerDetails: async (mobileNumber, page = 1, limit = 10, dateFrom, dateTo) => {
    set({ detailsLoading: true, detailsError: null })
    try {
      const params: Record<string, string | number> = { page, limit }
      if (dateFrom) params.dateFrom = dateFrom
      if (dateTo) params.dateTo = dateTo

      const response = await http.get(
        `/admin/booking-customer/${encodeURIComponent(mobileNumber)}`,
        { params }
      )
      const data = response.data?.data || response.data
      const customer = data?.customer || {}
      const summary = data?.summary || {}
      const ordersRaw = Array.isArray(data?.orders) ? data.orders : []

      set({
        customerDetails: {
          customer: {
            id: customer._id || customer.id || mobileNumber,
            name: customer.name || "",
            mobileNumber: customer.mobileNumber || mobileNumber,
            phone: customer.mobileNumber || mobileNumber,
            address: customer.address || "",
            gstNumber: customer.gstNumber,
          },
          summary: {
            totalOrders: summary.totalOrders,
            totalParcels: summary.totalParcels,
            deliveredOrders: summary.deliveredOrders,
            pendingOrders: summary.pendingOrders,
            totalAmount: summary.totalAmount,
          },
          orders: ordersRaw.map((order: any, index: number) => ({
            id: order._id || order.id || String(index),
            orderNumber: order.orderNumber,
            createdAt: order.createdAt,
            deliveryAgencyName:
              order.deliveryCustomer?.deliveryAgency?.agencyName || "-",
            article: order.parcelDetails?.article,
            paymentType: order.paymentType,
            totalAmount: order.totalAmount,
            status: order.statusLabel || order.status,
          })),
          pagination: data?.pagination ?? null,
        },
        detailsLoading: false,
      })
    } catch (error: any) {
      set({
        detailsLoading: false,
        detailsError:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch customer details",
      })
    }
  },

  setSelectedCustomer: (customer) => {
    set({ selectedCustomer: customer })
  },
}))
