import { create } from "zustand"
import http from "../common/httpRequest"
import toast from "react-hot-toast"

export interface VehicleFormValues {
  type: string
  capacity: string
  registrationNumber: string
  rcNumber: string
  insuranceNumber: string
  status: "Active" | "Inactive"
}

export interface Vehicle extends VehicleFormValues {
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

interface VehicleState {
  vehicles: Vehicle[]
  selectedVehicle: Vehicle | null
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
  addVehicle: (vehicle: VehicleFormValues) => Promise<Vehicle>
  updateVehicle: (id: string, vehicle: Partial<VehicleFormValues>) => Promise<Vehicle>
  updateVehicleStatus: (id: string, status: "Active" | "Inactive") => Promise<Vehicle>
  deleteVehicle: (id: string) => Promise<void>
  setSelectedVehicle: (vehicle: Vehicle | null) => void
}

const normalizeVehicle = (item: any): Vehicle => ({
  id: item?._id || item?.id || "",
  type: item?.vehicleType || item?.type || "",
  capacity: item?.capacity || "",
  registrationNumber: item?.vehicleRegistrationNumber || item?.registrationNumber || "",
  rcNumber: item?.rcNumber || "",
  insuranceNumber: item?.insuranceNumber || "",
  status: item?.status || "Inactive",
  createdAt: item?.createdAt,
  updatedAt: item?.updatedAt,
})

export const useVehicleStore = create<VehicleState>((set, get) => ({
  vehicles: [],
  selectedVehicle: null,
  loading: false,
  error: null,
  pagination: null,

  fetchVehicles: async ({ page = 1, limit = 10, search, status } = {}) => {
    set({ loading: true, error: null })
    try {
      const response = await http.get("/admin/vehicle", {
        params: {
          page,
          limit,
          ...(search !== undefined ? { search } : {}),
          ...(status !== undefined ? { status } : {}),
        },
      })

      const payload = response.data?.data ?? response.data
      const items = Array.isArray(payload)
        ? payload
        : payload?.vehicles || payload?.items || []

      const vehicles = Array.isArray(items)
        ? items.map((item: any) => normalizeVehicle(item))
        : []

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
      const response = await http.get("/admin/vehicle", {
        params: {
          page: 1,
          limit: 10,
        },
      })

      const payload = response.data?.data ?? response.data
      const items = Array.isArray(payload)
        ? payload
        : payload?.vehicles || payload?.items || []

      const vehicles = Array.isArray(items)
        ? items.map((item: any) => normalizeVehicle(item))
        : []

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
      const response = await http.post("/admin/vehicle", {
        vehicleType: vehicle.type,
        capacity: vehicle.capacity,
        vehicleRegistrationNumber: vehicle.registrationNumber,
        rcNumber: vehicle.rcNumber,
        insuranceNumber: vehicle.insuranceNumber,
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
      if (vehicle.type !== undefined) payload.vehicleType = vehicle.type
      if (vehicle.capacity !== undefined) payload.capacity = vehicle.capacity
      if (vehicle.registrationNumber !== undefined) payload.vehicleRegistrationNumber = vehicle.registrationNumber
      if (vehicle.rcNumber !== undefined) payload.rcNumber = vehicle.rcNumber
      if (vehicle.insuranceNumber !== undefined) payload.insuranceNumber = vehicle.insuranceNumber
      if (vehicle.status !== undefined) payload.status = vehicle.status

      const response = await http.put(`/admin/vehicle/${encodeURIComponent(id)}`, payload)
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

  updateVehicleStatus: async (id, status) => {
    set({ loading: true, error: null })
    try {
      const response = await http.patch(`/admin/vehicle/${encodeURIComponent(id)}/status`, { status })
      const updatedVehicle = normalizeVehicle(response.data?.data ?? response.data)

      set((state) => ({
        vehicles: state.vehicles.map((item) => (item.id === id ? { ...item, ...updatedVehicle } : item)),
        loading: false,
      }))

      toast.success("Vehicle status updated")
      return updatedVehicle
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to update vehicle status"
      set({ loading: false, error: message })
      toast.error(message)
      throw new Error(message)
    }
  },

  deleteVehicle: async (id) => {
    set({ loading: true, error: null })
    try {
      await http.delete(`/admin/vehicle/${encodeURIComponent(id)}`)
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
