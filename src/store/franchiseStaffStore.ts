import http, { httpPublic } from "../common/httpRequest"
import { create } from "zustand"

interface Staff {
  _id: string
  name: string
  email: string
  phone: string
  role: any
  status: boolean | string
  username?: string
}

interface Role {
  _id: string
  roleName: string
  roleType: string
  status: boolean
  permissions?: any[]
}

interface FranchiseStaffStore {
  staffs: Staff[]
  roles: Role[]
  selectedStaff: Staff | null
  loading: boolean
  error: string | null
  fetchStaffs: () => Promise<void>
  fetchRoles: () => Promise<void>
  getStaffById: (id: string) => Promise<void>
  addStaff: (data: any) => Promise<void>
  updateStaff: (id: string, data: any) => Promise<void>
  deleteStaff: (id: string) => Promise<void>
}

export const useFranchiseStaffStore = create<FranchiseStaffStore>((set) => ({
  staffs: [],
  roles: [],
  selectedStaff: null,
  loading: false,
  error: null,

  fetchStaffs: async () => {
    set({ loading: true, error: null })
    try {
      const response = await httpPublic.get("/admin/staff")
      const staffData = response.data?.data || []
      console.log("Fetched staffs:", staffData)
      set({ staffs: staffData, loading: false })
    } catch (error: any) {
      console.error("Error fetching staffs:", error)
      set({ error: error.message, loading: false, staffs: [] })
    }
  },

  fetchRoles: async () => {
    set({ loading: true, error: null })
    try {
      const response = await http.get("/admin/role")
      const roleData = response.data?.data || []
      console.log("Fetched roles:", roleData)
      set({ roles: roleData, loading: false })
    } catch (error: any) {
      console.error("Error fetching roles:", error)
      set({ error: error.message, loading: false, roles: [] })
    }
  },

  getStaffById: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const response = await http.get(`/admin/staff/${id}`)
      set({ selectedStaff: response.data?.data, loading: false })
    } catch (error: any) {
      console.error("Error fetching staff by id:", error)
      set({ error: error.message, loading: false })
    }
  },

  addStaff: async (data: any) => {
    set({ loading: true, error: null })
    try {
      // Ensure type is set to franchise for franchise staff
      const payload = {
        ...data,
        type: "franchise"
      }
      await http.post("/admin/staff", payload)
      set({ loading: false })
    } catch (error: any) {
      console.error("Error adding staff:", error)
      set({ error: error.message, loading: false })
      throw error
    }
  },

  updateStaff: async (id: string, data: any) => {
    set({ loading: true, error: null })
    try {
      // Ensure type is set to franchise for franchise staff
      const payload = {
        ...data,
        type: "franchise"
      }
      await http.put(`/admin/staff/${id}`, payload)
      set({ loading: false })
    } catch (error: any) {
      console.error("Error updating staff:", error)
      set({ error: error.message, loading: false })
      throw error
    }
  },

  deleteStaff: async (id: string) => {
    set({ loading: true, error: null })
    try {
      await http.delete(`/admin/staff/${id}`)
      set({ loading: false })
    } catch (error: any) {
      console.error("Error deleting staff:", error)
      set({ error: error.message, loading: false })
      throw error
    }
  },
}))
