import { create } from "zustand"
import http from "../common/httpRequest"
import toast from "react-hot-toast"

export interface DriverFormValues {
  name: string
  phoneNumber: string
  licenseNumber: string
  dateOfExpiry: string
  status: "Active" | "Inactive"
}

export interface Driver extends DriverFormValues {
  id: string
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface DriverState {
  drivers: Driver[]
  loading: boolean
  error: string | null
  pagination: Pagination | null
  selectedDriver: Driver | null
  fetchDrivers: (options?: {
    page?: number
    limit?: number
    search?: string
    status?: string
  }) => Promise<void>
  addDriver: (driver: DriverFormValues) => Promise<Driver>
  updateDriver: (id: string, driver: Partial<DriverFormValues>) => Promise<Driver>
  updateDriverStatus: (id: string, status: "Active" | "Inactive") => Promise<Driver>
  deleteDriver: (id: string) => Promise<void>
  setSelectedDriver: (driver: Driver | null) => void
}

const normalizeDriver = (item: any): Driver => ({
  id: item?._id || item?.id || "",
  name: item?.driverName || item?.name || "",
  phoneNumber: item?.phoneNumber || item?.phone || "",
  licenseNumber: item?.licenseNumber || item?.licenseNumber || "",
  dateOfExpiry: item?.dateOfExpiry || item?.expiryDate || "",
  status: item?.status || "Inactive",
})

export const useDriverStore = create<DriverState>((set) => ({
  drivers: [],
  loading: false,
  error: null,
  pagination: null,
  selectedDriver: null,

  fetchDrivers: async ({ page = 1, limit = 10, search, status } = {}) => {
    set({ loading: true, error: null })
    try {
      const response = await http.get("/admin/driver", {
        params: {
          page,
          limit,
          ...(search !== undefined ? { search } : {}),
          ...(status !== undefined ? { status } : {}),
        },
      })

      const payload = response.data?.data ?? response.data
      const driversArray = Array.isArray(payload)
        ? payload
        : payload?.drivers || payload?.items || []

      const drivers = Array.isArray(driversArray)
        ? driversArray.map((item: any) => normalizeDriver(item))
        : []

      const pagination = response.data?.pagination || payload?.pagination || null

      set({ drivers, pagination, loading: false, error: null })
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to fetch drivers"
      set({ loading: false, error: message })
      toast.error(message)
    }
  },

  addDriver: async (driver) => {
    set({ loading: true, error: null })
    try {
      const response = await http.post("/admin/driver", {
        driverName: driver.name,
        phoneNumber: driver.phoneNumber,
        licenseNumber: driver.licenseNumber,
        dateOfExpiry: driver.dateOfExpiry,
        status: driver.status,
      })

      const payload = response.data?.data ?? response.data
      const newDriver = normalizeDriver(payload)

      set((state) => ({ drivers: [newDriver, ...state.drivers], loading: false }))
      toast.success("Driver added successfully")
      return newDriver
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to add driver"
      set({ loading: false, error: message })
      toast.error(message)
      throw new Error(message)
    }
  },

  updateDriver: async (id, driver) => {
    set({ loading: true, error: null })
    try {
      const payload: any = {}
      if (driver.name !== undefined) payload.driverName = driver.name
      if (driver.phoneNumber !== undefined) payload.phoneNumber = driver.phoneNumber
      if (driver.licenseNumber !== undefined) payload.licenseNumber = driver.licenseNumber
      if (driver.dateOfExpiry !== undefined) payload.dateOfExpiry = driver.dateOfExpiry
      if (driver.status !== undefined) payload.status = driver.status

      const response = await http.put(`/admin/driver/${encodeURIComponent(id)}`, payload)
      const updated = normalizeDriver(response.data?.data ?? response.data)

      set((state) => ({
        drivers: state.drivers.map((item) => (item.id === id ? { ...item, ...updated } : item)),
        loading: false,
      }))

      toast.success("Driver updated successfully")
      return updated
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to update driver"
      set({ loading: false, error: message })
      toast.error(message)
      throw new Error(message)
    }
  },

  updateDriverStatus: async (id, status) => {
    set({ loading: true, error: null })
    try {
      const response = await http.patch(`/admin/driver/${encodeURIComponent(id)}/status`, { status })
      const updated = normalizeDriver(response.data?.data ?? response.data)

      set((state) => ({
        drivers: state.drivers.map((item) => (item.id === id ? { ...item, ...updated } : item)),
        loading: false,
      }))

      toast.success("Driver status updated")
      return updated
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to update driver status"
      set({ loading: false, error: message })
      toast.error(message)
      throw new Error(message)
    }
  },

  deleteDriver: async (id) => {
    set({ loading: true, error: null })
    try {
      await http.delete(`/admin/driver/${encodeURIComponent(id)}`)
      set((state) => ({
        drivers: state.drivers.filter((item) => item.id !== id),
        loading: false,
      }))
      toast.success("Driver deleted successfully")
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to delete driver"
      set({ loading: false, error: message })
      toast.error(message)
      throw new Error(message)
    }
  },

  setSelectedDriver: (driver) => set({ selectedDriver: driver }),
}))
