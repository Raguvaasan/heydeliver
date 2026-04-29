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
  shipment_length: string | undefined
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

interface FreightrekShipmentRequest {
  name: string
  add: string
  pin: string
  city: string
  state: string
  country: string
  phone: string
  order: string
  paymentMode: string
  fromName?: string
  fromAdd?: string
  fromPin?: string
  fromCity?: string
  fromState?: string
  fromCountry?: string
  fromPhone?: string
  returnPin?: string
  returnCity?: string
  returnPhone?: string
  returnAdd?: string
  returnState?: string
  returnCountry?: string
  productsDesc?: string
  hsnCode?: string
  codAmount?: string
  orderDate?: string | null
  totalAmount?: string
  sellerName?: string
  sellerAdd?: string
  sellerInv?: string
  quantity?: string
  shipmentWidth?: string
  shipmentHeight?: string
    shipmentLength?: string
  weight?: string
  shippingMode?: string
  addressType?: string
  baseAmount?: string
  markupAmount?: string
  pickupLocation: {
    name: string
  }
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
  createDelhiveryShipment: (
    shipmentData: DelhiveryShipment,
    pickupLocation: string,
    freightrekExtras?: (Omit<FreightrekShipmentRequest, "pickupLocation" | "name" | "add" | "pin" | "city" | "state" | "country" | "phone" | "order" | "paymentMode"> & {
      freightrekTotalAmount?: string
      freightrekCodAmount?: string
    })
  ) => Promise<DelhiveryResponse>
  createHubOrder: (payload: Record<string, any>) => Promise<any>
  updateOrder: (id: string, data: Partial<Order>) => Promise<void>
  deleteOrder: (id: string) => Promise<void>
  clearSelectedOrder: () => void
  editHubOrder: (orderId: string, data: Record<string, any>) => Promise<any>
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

    const authToken = sessionStorage.getItem("authToken")
    const requestParams = { page, limit, _ts: Date.now() }

    try {
      const res = await axios.get("/api/shipment/orders", {
        params: requestParams,
        headers: {
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        timeout: 30000,
      })

      const raw = res.data?.data ?? res.data ?? []
      const ordersData = Array.isArray(raw)
        ? raw.map((item: any) => ({
            ...item,
            _id: item?._id || item?.id || item?.orderId,
            bookingId: item?.bookingId || item?.orderId || item?.order,
            customer: item?.customer || item?.customerName || item?.consigneeName,
            customerNumber: item?.customerNumber || item?.phone || item?.consigneeNumber,
          }))
        : []

      const pagination = res.data?.pagination || null

      // Derive active orders client-side (avoids a separate API call)
      const activeOrdersData = ordersData.filter((order: any) => {
        const s = (order.status || "").toLowerCase().replace(/[\s_-]/g, "")
        return s === "active" || s === "intransit" || s === "pending"
      })

      set({
        orders: ordersData,
        activeOrders: activeOrdersData,
        pagination,
        loading: false,
        error: null,
      })
    } catch (err: any) {
      set({
        orders: [],
        loading: false,
        error: err?.response?.data?.message || err?.message || "Failed to fetch orders",
      })
    }
  },

  fetchActiveOrders: async (_page = 1, _limit = 10) => {
    // Active orders are derived from the main orders list in fetchOrders.
    // This is a no-op kept for interface compatibility.
    const currentOrders = get().orders
    if (currentOrders.length > 0) {
      const activeOrdersData = currentOrders.filter((order: any) => {
        const s = (order.status || "").toLowerCase().replace(/[\s_-]/g, "")
        return s === "active" || s === "intransit" || s === "pending"
      })
      set({ activeOrders: activeOrdersData })
    }
  },

  getOrderById: async (id: string) => {
    set({ loading: true, error: null })
    const authToken = sessionStorage.getItem("authToken")

    try {
      const [ordersRes, shipmentRes] = await Promise.allSettled([
        http.get(`/orders/${id}`, { validateStatus: () => true }),
        axios.get(`/api/shipment/order/${encodeURIComponent(id)}`, {
          headers: {
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          timeout: 5000,
          validateStatus: () => true,
        }),
      ])

      if (ordersRes.status === "fulfilled") {
        const res = ordersRes.value
        if (res.status >= 200 && res.status < 300) {
          const orderData = res.data?.data || res.data
          if (orderData) {
            set({
              selectedOrder: orderData,
              loading: false,
              error: null,
            })
            return
          }
        }
      }

      if (shipmentRes.status === "fulfilled") {
        const res = shipmentRes.value
        if (res.status >= 200 && res.status < 300) {
          const shipmentData = res.data?.data || res.data
          const normalizedShipment = shipmentData
            ? {
              ...shipmentData,
              _id: shipmentData?.orderId,
              bookingId: shipmentData?.orderId,
              customer: shipmentData?.consignee?.name ?? "",
              customerNumber: shipmentData?.consignee?.phone ?? "",
              amount: shipmentData?.amount ?? shipmentData?.totalAmount ?? 0,
              paymentMode: shipmentData?.shipmentDetails?.paymentMode ?? "",
              deliveryAddress: shipmentData?.consignee?.address ?? "",
              deliveryCity: shipmentData?.consignee?.city ?? "",
              deliveryState: shipmentData?.consignee?.state ?? "",
              deliveryPincode: shipmentData?.consignee?.pin ?? "",
              bookingDate: shipmentData?.createdAt ?? "",
            }
            : null

          if (normalizedShipment) {
            set({
              selectedOrder: normalizedShipment,
              loading: false,
              error: null,
            })
            return
          }
        }
      }

      set({
        loading: false,
        selectedOrder: null,
        error: "Failed to get order",
      })
      toast.error("Failed to get order details")
    } catch (err: any) {
      set({
        loading: false,
        selectedOrder: null,
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
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to create order"
      set({ loading: false, error: errorMessage })
      toast.error(errorMessage)
      throw err
    }
  },

  createDelhiveryShipment: async (
    shipmentData: DelhiveryShipment,
    pickupLocation: string,
    freightrekExtras?
  ) => {
    set({ loading: true, error: null })
    try {
      // ── 1. Wallet balance check ────────────────────────────────────────────
      const loginType = sessionStorage.getItem("loginType") || "admin"
      if (loginType !== "hub") {
        let walletAmount = 0

        if (loginType === "admin") {
          const dashboardResponse = await http.get("/admin/dashboard", { params: { period: "week" } })
          const dashboardData = dashboardResponse.data?.data || dashboardResponse.data
          walletAmount = Number(dashboardData?.overview?.wallet?.amount ?? 0)
        } else {
          const walletBalanceResponse = await http.get("/wallet/balance")
          const walletBalanceData = walletBalanceResponse.data?.data || walletBalanceResponse.data
          walletAmount = Number(walletBalanceData?.balance ?? 0)
        }

        if (walletAmount <= 50) {
          throw new Error("Insufficient balance")
        }
      }

      // ── 2. Build Delhivery B2C payload ─────────────────────────────────────
      // Send JSON to our proxy; the proxy constructs the form-urlencoded body
      // that Delhivery expects (format=json&data=<JSON>).
      const payload = {
        shipments: [shipmentData],
        pickup_location: { name: pickupLocation },
      }

      const authToken = sessionStorage.getItem("authToken")

      const delhiveryResponse = await axios.post<DelhiveryResponse>(
        '/delhivery-api/api/cmu/create.json',
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          timeout: 10000,
        }
      )

      const delhiveryData = delhiveryResponse.data

      // Delhivery returns success:true on a valid creation
      if (!delhiveryData?.success) {
        throw new Error(delhiveryData?.rmk || "Delhivery shipment creation failed")
      }

      // ── 3. Mirror to our backend (/api/shipment/create) ────────────────────
      // Only called after Delhivery confirms success
      const waybill = delhiveryData?.packages?.[0]?.waybill ?? ""

      const freightrekPayload: FreightrekShipmentRequest = {
        // Consignee / destination
        name: shipmentData.name,
        add: shipmentData.add,
        pin: shipmentData.pin,
        city: shipmentData.city,
        state: shipmentData.state,
        country: shipmentData.country,
        phone: shipmentData.phone,
        order: shipmentData.order,
        paymentMode: shipmentData.payment_mode,

        // Sender / from address (optional, passed via freightrekExtras)
        fromName: freightrekExtras?.fromName,
        fromAdd: freightrekExtras?.fromAdd,
        fromPin: freightrekExtras?.fromPin,
        fromCity: freightrekExtras?.fromCity,
        fromState: freightrekExtras?.fromState,
        fromCountry: freightrekExtras?.fromCountry,
        fromPhone: freightrekExtras?.fromPhone,

        // Return address
        returnPin: shipmentData.return_pin,
        returnCity: shipmentData.return_city,
        returnPhone: shipmentData.return_phone,
        returnAdd: shipmentData.return_add,
        returnState: shipmentData.return_state,
        returnCountry: shipmentData.return_country,

        // Shipment meta
        productsDesc: shipmentData.products_desc,
        hsnCode: shipmentData.hsn_code || "",
        codAmount: freightrekExtras?.freightrekCodAmount || shipmentData.cod_amount || "0",
        orderDate: shipmentData.order_date ? new Date(shipmentData.order_date).toISOString() : new Date().toISOString(),
        totalAmount: freightrekExtras?.freightrekTotalAmount || shipmentData.total_amount,
        sellerName: shipmentData.seller_name,
        sellerAdd: shipmentData.seller_add,
        sellerInv: shipmentData.seller_inv,
        quantity: shipmentData.quantity,
baseAmount: freightrekExtras.baseAmount,
markupAmount: freightrekExtras.markupAmount,
        // Dimensions — all three axes now included
        shipmentLength: shipmentData.shipment_length,
        shipmentWidth: shipmentData.shipment_width,
        shipmentHeight: shipmentData.shipment_height,

        weight: shipmentData.weight,
        shippingMode: shipmentData.shipping_mode,
        addressType: shipmentData.address_type,

        // Waybill returned by Delhivery (useful for our records)
        ...(waybill ? { waybill } : {}),

        pickupLocation: { name: pickupLocation },
      }

      try {
        await axios.post("/api/shipment/create", freightrekPayload, {
          headers: {
            "Content-Type": "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          timeout: 8000,
        })
      } catch (freightrekErr: any) {
        // Our backend sync failure is non-fatal — Delhivery already accepted the shipment.
        // Log for debugging but don't surface to the user.
        console.warn(
          "[orderStore] /api/shipment/create failed (non-fatal):",
          freightrekErr?.response?.data || freightrekErr?.message
        )
      }

      set({ loading: false })
      toast.success("Shipment created successfully!")
      return delhiveryData
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.rmk ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create shipment"
      set({ loading: false, error: errorMessage })
      toast.error(errorMessage)
      throw err
    }
  },

  createHubOrder: async (payload) => {
    set({ loading: true, error: null })
    try {
      const authToken = sessionStorage.getItem("authToken")
      const delhiveryBaseAmount = String(
        payload?.baseAmount ?? payload?.delhiveryTotalAmount ?? "0"
      )
      const delhiveryCodAmount =
        payload?.paymentMode === "COD"
          ? String(payload?.delhiveryCodAmount ?? payload?.baseAmount ?? "0")
          : "0"
      const freightrekTotalAmount = String(
        payload?.totalAmount ?? payload?.markupAmount ?? payload?.codAmount ?? delhiveryBaseAmount
      )

      const cmuPayload = {
        shipments: [
          {
            name: payload?.name || "",
            add: payload?.add || "",
            pin: payload?.pin || "",
            city: payload?.city || "",
            state: payload?.state || "",
            country: payload?.country || "India",
            phone: payload?.phone || "",
            order: payload?.order || "",
            payment_mode: payload?.paymentMode === "COD" ? "COD" : "Prepaid",
            return_pin: payload?.returnPin || "",
            return_city: payload?.returnCity || "",
            return_phone: payload?.returnPhone || "",
            return_add: payload?.returnAdd || "",
            return_state: payload?.returnState || "",
            return_country: payload?.returnCountry || "",
            products_desc: payload?.productsDesc || "",
            hsn_code: payload?.hsnCode || "",
            cod_amount: delhiveryCodAmount,
            order_date: payload?.orderDate || null,
            total_amount: delhiveryBaseAmount,
            seller_add: payload?.sellerAdd || payload?.fromAdd || "",
            seller_name: payload?.sellerName || payload?.fromName || "",
            seller_inv: payload?.sellerInv || "",
            quantity: payload?.quantity ? String(payload.quantity) : "",
            waybill: payload?.waybill || "",
            shipment_width: payload?.shipmentWidth ? String(payload.shipmentWidth) : "100",
            shipment_height: payload?.shipmentHeight ? String(payload.shipmentHeight) : "100",
            shipment_length: payload?.shipmentLength ? String(payload.shipmentLength) : "100",
            weight: payload?.weight ? String(payload.weight) : "",
            shipping_mode: payload?.shippingMode || "Surface",
            address_type: payload?.addressType || "",
          },
        ],
        pickup_location: {
          name: payload?.pickupLocation?.name || "warehouse_name",
        },
      }

      const formBody = new URLSearchParams()
      formBody.append("format", "json")
      formBody.append("data", JSON.stringify(cmuPayload))

      const delhiveryResponse = await axios.post<DelhiveryResponse>(
        "/delhivery-api/api/cmu/create.json",
        formBody.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          timeout: 15000,
        }
      )

      const delhiveryData = delhiveryResponse.data
      if (!delhiveryData?.success) {
        throw new Error(delhiveryData?.rmk || "Delhivery shipment creation failed")
      }

      const waybill = delhiveryData?.packages?.[0]?.waybill ?? ""
      const response = await axios.post(
        "/api/hub/orders/create",
        {
          ...payload,
          totalAmount: freightrekTotalAmount,
          format: "json",
          data: JSON.stringify(cmuPayload),
          ...(waybill ? { waybill } : {}),
        },
        {
          headers: {
            "Content-Type": "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          timeout: 10000,
        }
      )

      set({ loading: false })
      toast.success("Order created successfully!")
      return response.data
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.rmk ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to create hub order"
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
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to update order"
      set({ loading: false, error: errorMessage })
      toast.error(errorMessage)
      throw err
    }
  },

  deleteOrder: async (id) => {
    set({ loading: true, error: null })
    try {
      // If it's a Freightrek order (starts with ORD_), we might need to hit the shipment endpoint
      if (id.startsWith("ORD_")) {
        try {
          // We use axios directly to match how generic shipments are handled in getOrderById
          const authToken = sessionStorage.getItem("authToken")
          await axios.delete(`/api/shipment/order/${encodeURIComponent(id)}`, {
            headers: {
              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            }
          })
          toast.success("Shipment deleted successfully!")
        } catch (shipmentErr: any) {
          // If shipment delete fails, try the primary orders endpoint as fallback
          await http.delete(`/orders/${id}`)
          toast.success("Order deleted successfully!")
        }
      } else {
        await http.delete(`/orders/${id}`)
        toast.success("Order deleted successfully!")
      }

      await get().fetchOrders()
      set({ loading: false })
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to delete order"
      set({ loading: false, error: errorMessage })
      toast.error(errorMessage)
      throw err
    }
  },

  clearSelectedOrder: () => {
    set({ selectedOrder: null })
  },

  // Edit Hub Order
  editHubOrder: async (orderId: string, data: Record<string, any>) => {
    set({ loading: true, error: null })
    try {
      const authToken = sessionStorage.getItem("authToken")
      const response = await axios.put(
        `/api/hub/staff/booking/${encodeURIComponent(orderId)}/edit`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          timeout: 10000,
        }
      )

      set({ loading: false })
      toast.success("Order updated successfully!")
      await get().fetchOrders()
      return response.data
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to update order"
      set({ loading: false, error: errorMessage })
      toast.error(errorMessage)
      throw err
    }
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
