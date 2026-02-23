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
      // Check if franchise user - use franchise-specific endpoint
      const loginType = sessionStorage.getItem("loginType")
      const isFranchise = loginType === "franchise" || loginType === "staff"
      const endpoint = isFranchise ? "/admin/franchise/staff" : "/admin/staff"
      const response = await http.get(endpoint)
      const staffData = response.data?.data || []
      set({ staffs: staffData, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false, staffs: [] })
    }
  },

  fetchRoles: async () => {
    set({ loading: true, error: null })
    try {
      // Check if franchise user - use franchise-specific endpoint
      const loginType = sessionStorage.getItem("loginType")
      const isFranchise = loginType === "franchise" || loginType === "staff"
      const endpoint = isFranchise ? "/admin/franchise/role" : "/admin/role"
      const response = await http.get(endpoint)
      const roleData = response.data?.data || []
      set({ roles: roleData, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false, roles: [] })
    }
  },

  getStaffById: async (id: string) => {
    set({ loading: true, error: null })
    try {
      // Check if franchise user - use franchise-specific endpoint
      const loginType = sessionStorage.getItem("loginType")
      const isFranchise = loginType === "franchise" || loginType === "staff"
      const endpoint = isFranchise ? `/admin/franchise/staff/${id}` : `/admin/staff/${id}`
      
      const response = await http.get(endpoint)
      set({ selectedStaff: response.data?.data, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  addStaff: async (data: any) => {
    set({ loading: true, error: null })
    try {
      // Check if franchise user - use franchise-specific endpoint
      const loginType = sessionStorage.getItem("loginType")
      const isFranchise = loginType === "franchise" || loginType === "staff"
      const endpoint = isFranchise ? "/admin/franchise/staff" : "/admin/staff"
      
      await http.post(endpoint, data)
      set({ loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  updateStaff: async (id: string, data: any) => {
    set({ loading: true, error: null })
    try {
      // Check if franchise user - use franchise-specific endpoint
      const loginType = sessionStorage.getItem("loginType")
      const isFranchise = loginType === "franchise" || loginType === "staff"
      const endpoint = isFranchise ? `/admin/franchise/staff/${id}` : `/admin/staff/${id}`
      
      await http.put(endpoint, data)
      set({ loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  deleteStaff: async (id: string) => {
    set({ loading: true, error: null })
    try {
      // Check if franchise user - use franchise-specific endpoint
      const loginType = sessionStorage.getItem("loginType")
      const isFranchise = loginType === "franchise" || loginType === "staff"
      const endpoint = isFranchise ? `/admin/franchise/staff/${id}` : `/admin/staff/${id}`
      
      await http.delete(endpoint)
      set({ loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
      throw error
    }
  },
}))
