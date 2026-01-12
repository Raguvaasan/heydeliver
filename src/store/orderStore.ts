import { create } from "zustand"
import http from "../common/httpRequest"
import toast from "react-hot-toast"

interface Order {
  _id: string
  bookingId: string
  bookingDate: string
  customer: string
  customerNumber: string
  amount: number
  status: string
  paymentMode?: string
  deliveryAddress?: string
  [key: string]: any
}

interface OrderState {
  orders: Order[]
  activeOrders: Order[]
  selectedOrder: Order | null
  loading: boolean
  error: string | null
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  } | null

  fetchOrders: (page?: number, limit?: number) => Promise<void>
  fetchActiveOrders: (page?: number, limit?: number) => Promise<void>
  getOrderById: (id: string) => Promise<void>
  addOrder: (data: Partial<Order>) => Promise<void>
  updateOrder: (id: string, data: Partial<Order>) => Promise<void>
  deleteOrder: (id: string) => Promise<void>
  clearSelectedOrder: () => void
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  activeOrders: [],
  selectedOrder: null,
  loading: false,
  error: null,
  pagination: null,

  fetchOrders: async (page = 1, limit = 10) => {
    set({ loading: true, error: null })
    try {
      const res = await http.get("/orders", {
        params: { page, limit }
      })
      console.log("Orders API response:", res.data)
      
      const ordersData = res.data?.data || []
      const ordersArray = Array.isArray(ordersData) ? ordersData : []
      const pagination = res.data?.pagination || null
      
      set({ 
        orders: ordersArray, 
        pagination,
        loading: false 
      })
    } catch (err: any) {
      console.error("Error fetching orders:", err)
      set({ 
        orders: [], 
        loading: false, 
        error: err?.response?.data?.message || err?.message || "Failed to fetch orders"
      })
    }
  },

  fetchActiveOrders: async (page = 1, limit = 10) => {
    set({ loading: true, error: null })
    try {
      const res = await http.get("/orders/active", {
        params: { page, limit }
      })
      
      const ordersData = res.data?.data || []
      const ordersArray = Array.isArray(ordersData) ? ordersData : []
      
      set({ 
        activeOrders: ordersArray, 
        loading: false 
      })
    } catch (err: any) {
      console.error("Error fetching active orders:", err)
      set({ 
        activeOrders: [], 
        loading: false, 
        error: err?.response?.data?.message || err?.message || "Failed to fetch active orders"
      })
    }
  },

  getOrderById: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const res = await http.get(`/orders/${id}`)
      const orderData = res.data?.data || res.data
      set({
        selectedOrder: orderData || null,
        loading: false,
      })
    } catch (err: any) {
      console.error("Error getting order:", err)
      set({ 
        loading: false, 
        error: err?.response?.data?.message || err?.message || "Failed to get order" 
      })
      toast.error("Failed to get order details")
    }
  },

  addOrder: async (data) => {
    set({ loading: true, error: null })
    try {
      await http.post("/orders", data)
      await get().fetchOrders()
      toast.success("Order created successfully!")
      set({ loading: false })
    } catch (err: any) {
      console.error("Error creating order:", err)
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to create order"
      set({ loading: false, error: errorMessage })
      toast.error(errorMessage)
      throw err
    }
  },

  updateOrder: async (id, data) => {
    set({ loading: true, error: null })
    try {
      await http.put(`/orders/${id}`, data)
      await get().fetchOrders()
      toast.success("Order updated successfully!")
      set({ loading: false })
    } catch (err: any) {
      console.error("Error updating order:", err)
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to update order"
      set({ loading: false, error: errorMessage })
      toast.error(errorMessage)
      throw err
    }
  },

  deleteOrder: async (id) => {
    set({ loading: true, error: null })
    try {
      await http.delete(`/orders/${id}`)
      await get().fetchOrders()
      toast.success("Order deleted successfully!")
      set({ loading: false })
    } catch (err: any) {
      console.error("Error deleting order:", err)
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to delete order"
      set({ loading: false, error: errorMessage })
      toast.error(errorMessage)
      throw err
    }
  },

  clearSelectedOrder: () => {
    set({ selectedOrder: null })
  },
}))
