import { create } from "zustand"
import http from "../common/httpRequest"
import axios from "axios"
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

interface DelhiveryShipment {
  name: string
  add: string
  pin: string
  city: string
  state: string
  country: string
  phone: string
  order: string
  payment_mode: string
  return_pin?: string
  return_city?: string
  return_phone?: string
  return_add?: string
  return_state?: string
  return_country?: string
  products_desc?: string
  hsn_code?: string
  cod_amount?: string
  order_date?: string | null
  total_amount?: string
  seller_add?: string
  seller_name?: string
  seller_inv?: string
  quantity?: string
  waybill?: string
  shipment_width?: string
  shipment_height?: string
  weight?: string
  shipping_mode?: string
  address_type?: string
}

interface DelhiveryResponse {
  success: boolean
  packages: Array<{
    status: string
    waybill: string
    client: string
    sort_code: string
    remarks: string[]
    cash_amount: number
  }>
  rmk: string
  cash_pickups_count: number
  prepaid_pickups_count: number
  upload_wbn: string
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
  trackingData: any

  fetchOrders: (page?: number, limit?: number) => Promise<void>
  fetchActiveOrders: (page?: number, limit?: number) => Promise<void>
  getOrderById: (id: string) => Promise<void>
  addOrder: (data: Partial<Order>) => Promise<void>
  createDelhiveryShipment: (shipmentData: DelhiveryShipment, pickupLocation: string) => Promise<DelhiveryResponse>
  updateOrder: (id: string, data: Partial<Order>) => Promise<void>
  deleteOrder: (id: string) => Promise<void>
  clearSelectedOrder: () => void
  
  // New Delhivery APIs
  updateShipment: (waybill: string, data: any) => Promise<any>
  cancelShipment: (waybill: string) => Promise<any>
  updateEwaybill: (waybill: string, dcn: string, ewbn: string) => Promise<any>
  trackShipment: (waybill?: string, ref_ids?: string) => Promise<any>
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  activeOrders: [],
  selectedOrder: null,
  loading: false,
  error: null,
  pagination: null,
  trackingData: null,

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

  createDelhiveryShipment: async (shipmentData: DelhiveryShipment, pickupLocation: string) => {
    set({ loading: true, error: null })
    try {
      const requestData = {
        format: 'json',
        data: JSON.stringify({
          shipments: [shipmentData],
          pickup_location: {
            name: pickupLocation
          }
        })
      }

      // Use URLSearchParams for form-urlencoded format
      const formData = new URLSearchParams()
      formData.append('format', 'json')
      formData.append('data', JSON.stringify({
        shipments: [shipmentData],
        pickup_location: {
          name: pickupLocation
        }
      }))

      const response = await axios.post<DelhiveryResponse>(
        '/delhivery-api/api/cmu/create.json',
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          timeout: 30000
        }
      )

      set({ loading: false })
      
      if (response.data.success) {
        toast.success("Shipment created successfully!")
        return response.data
      } else {
        throw new Error(response.data.rmk || "Failed to create shipment")
      }
    } catch (err: any) {
      console.error("Error creating Delhivery shipment:", err)
      const errorMessage = err?.response?.data?.rmk || 
                          err?.response?.data?.message || 
                          err?.message || 
                          "Failed to create shipment"
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

  // Update Shipment (Edit API)
  updateShipment: async (waybill: string, data: any) => {
    set({ loading: true, error: null })
    try {
      const response = await axios.post(
        '/delhivery-api/api/p/edit',
        {
          waybill,
          ...data
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      )

      set({ loading: false })
      toast.success("Shipment updated successfully!")
      return response.data
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || 
                          err?.response?.data?.message || 
                          err?.message || 
                          "Failed to update shipment"
      set({ loading: false, error: errorMessage })
      toast.error(errorMessage)
      throw err
    }
  },

  // Cancel Shipment
  cancelShipment: async (waybill: string) => {
    set({ loading: true, error: null })
    try {
      const response = await axios.post(
        '/delhivery-api/api/p/edit',
        {
          waybill,
          cancellation: "true"
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      )

      set({ loading: false })
      toast.success("Shipment cancelled successfully!")
      return response.data
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || 
                          err?.response?.data?.message || 
                          err?.message || 
                          "Failed to cancel shipment"
      set({ loading: false, error: errorMessage })
      toast.error(errorMessage)
      throw err
    }
  },

  // Update E-waybill
  updateEwaybill: async (waybill: string, dcn: string, ewbn: string) => {
    set({ loading: true, error: null })
    try {
      const response = await axios.put(
        `/delhivery-api/api/rest/ewaybill/${waybill}/`,
        {
          data: [
            {
              dcn,
              ewbn
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      set({ loading: false })
      toast.success("E-waybill updated successfully!")
      return response.data
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || 
                          err?.response?.data?.message || 
                          err?.message || 
                          "Failed to update e-waybill"
      set({ loading: false, error: errorMessage })
      toast.error(errorMessage)
      throw err
    }
  },

  // Track Shipment
  trackShipment: async (waybill?: string, ref_ids?: string) => {
    set({ loading: true, error: null, trackingData: null })
    try {
      const queryParams = new URLSearchParams()
      if (waybill) queryParams.append('waybill', waybill)
      if (ref_ids) queryParams.append('ref_ids', ref_ids)

      const response = await axios.get(
        `/delhivery-api/api/v1/packages/json/?${queryParams.toString()}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 15000
        }
      )

      set({ trackingData: response.data, loading: false })
      toast.success("Tracking data fetched successfully!")
      return response.data
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || 
                          err?.response?.data?.message || 
                          err?.message || 
                          "Failed to track shipment"
      set({ loading: false, error: errorMessage, trackingData: null })
      toast.error(errorMessage)
      throw err
    }
  },
}))
