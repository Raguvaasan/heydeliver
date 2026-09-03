import { create } from "zustand"
import toast from "react-hot-toast"
import http from "../common/httpRequest"

const VEHICLE_API_PATH = "/b2b/vehicles"

export interface B2BVehicleFormValues {
  vehicleType: string
  capacityKg: string
  ratePerKm: number | string
  status: "Active" | "Inactive"
}

export interface B2BVehicle extends B2BVehicleFormValues {
  id: string
  createdAt?: string
  updatedAt?: string
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface B2BVehicleState {
  vehicles: B2BVehicle[]
  selectedVehicle: B2BVehicle | null
  loading: boolean
  error: string | null
  pagination: Pagination | null
  fetchVehicles: (options?: {
    page?: number
    limit?: number
    search?: string
    status?: string
  }) => Promise<void>
  getVehicleById: (id: string) => Promise<void>
  addVehicle: (vehicle: B2BVehicleFormValues) => Promise<B2BVehicle>
  updateVehicle: (id: string, vehicle: Partial<B2BVehicleFormValues>) => Promise<B2BVehicle>
  deactivateVehicle: (id: string) => Promise<B2BVehicle>
  deleteVehicle: (id: string) => Promise<void>
  setSelectedVehicle: (vehicle: B2BVehicle | null) => void
}

const normalizeVehicle = (item: any): B2BVehicle => ({
  id: item?._id || item?.id || "",
  vehicleType: item?.vehicleType || "",
  capacityKg: item?.capacityKg ?? item?.capacity ?? "",
  ratePerKm: item?.ratePerKm ?? "",
  status: item?.status || "Inactive",
  createdAt: item?.createdAt,
  updatedAt: item?.updatedAt,
})

export const useB2BVehicleStore = create<B2BVehicleState>((set, get) => ({
  vehicles: [],
  selectedVehicle: null,
  loading: false,
  error: null,
  pagination: null,

  fetchVehicles: async ({ page = 1, limit = 10, search, status } = {}) => {
    set({ loading: true, error: null })
    try {
      const response = await http.get(VEHICLE_API_PATH, {
        params: {
          page,
          limit,
          ...(search !== undefined ? { search } : {}),
          ...(status !== undefined ? { status } : {}),
        },
      })

      const payload = response.data?.data ?? response.data
      const items = Array.isArray(payload) ? payload : payload?.vehicles || payload?.items || []
      const vehicles = Array.isArray(items) ? items.map((item: any) => normalizeVehicle(item)) : []
      const pagination = response.data?.pagination || payload?.pagination || null

      set({ vehicles, pagination, loading: false, error: null })
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to fetch vehicles"
      set({ loading: false, error: message })
      toast.error(message)
    }
  },

  getVehicleById: async (id) => {
    const existingVehicle = get().vehicles.find((item) => item.id === id)
    if (existingVehicle) {
      set({ selectedVehicle: existingVehicle })
      return
    }

    set({ loading: true, error: null })
    try {
      const response = await http.get(VEHICLE_API_PATH, { params: { page: 1, limit: 10 } })
      const payload = response.data?.data ?? response.data
      const items = Array.isArray(payload) ? payload : payload?.vehicles || payload?.items || []
      const vehicles = Array.isArray(items) ? items.map((item: any) => normalizeVehicle(item)) : []
      const selectedVehicle = vehicles.find((item) => item.id === id) || null
      const pagination = response.data?.pagination || payload?.pagination || null

      set({ vehicles, pagination, selectedVehicle, loading: false, error: null })
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to fetch vehicle details"
      set({ loading: false, error: message })
      toast.error(message)
    }
  },

  addVehicle: async (vehicle) => {
    set({ loading: true, error: null })
    try {
      const response = await http.post(VEHICLE_API_PATH, {
        vehicleType: vehicle.vehicleType,
        capacity: vehicle.capacityKg,
        ratePerKm: Number(vehicle.ratePerKm),
        status: vehicle.status,
      })

      const newVehicle = normalizeVehicle(response.data?.data ?? response.data)
      set((state) => ({ vehicles: [newVehicle, ...state.vehicles], loading: false }))
      toast.success("Vehicle added successfully")
      return newVehicle
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to add vehicle"
      set({ loading: false, error: message })
      toast.error(message)
      throw new Error(message)
    }
  },

  updateVehicle: async (id, vehicle) => {
    set({ loading: true, error: null })
    try {
      const payload: any = {}
      if (vehicle.vehicleType !== undefined) payload.vehicleType = vehicle.vehicleType
      if (vehicle.capacityKg !== undefined) payload.capacity = vehicle.capacityKg
      if (vehicle.ratePerKm !== undefined) payload.ratePerKm = Number(vehicle.ratePerKm)
      if (vehicle.status !== undefined) payload.status = vehicle.status

      const response = await http.put(`${VEHICLE_API_PATH}/${encodeURIComponent(id)}`, payload)
      const updatedVehicle = normalizeVehicle(response.data?.data ?? response.data)

      set((state) => ({
        vehicles: state.vehicles.map((item) => (item.id === id ? { ...item, ...updatedVehicle } : item)),
        loading: false,
      }))

      toast.success("Vehicle updated successfully")
      return updatedVehicle
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to update vehicle"
      set({ loading: false, error: message })
      toast.error(message)
      throw new Error(message)
    }
  },

  deactivateVehicle: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await http.patch(`${VEHICLE_API_PATH}/${encodeURIComponent(id)}/deactivate`)
      const updatedVehicle = normalizeVehicle(response.data?.data ?? response.data)

      set((state) => ({
        vehicles: state.vehicles.map((item) => (item.id === id ? { ...item, ...updatedVehicle } : item)),
        loading: false,
      }))

      toast.success("Vehicle deactivated successfully")
      return updatedVehicle
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to deactivate vehicle"
      set({ loading: false, error: message })
      toast.error(message)
      throw new Error(message)
    }
  },

  deleteVehicle: async (id) => {
    set({ loading: true, error: null })
    try {
      await http.delete(`${VEHICLE_API_PATH}/${encodeURIComponent(id)}`)
      set((state) => ({ vehicles: state.vehicles.filter((item) => item.id !== id), loading: false }))
      toast.success("Vehicle deleted successfully")
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to delete vehicle"
      set({ loading: false, error: message })
      toast.error(message)
      throw new Error(message)
    }
  },

  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
}))
