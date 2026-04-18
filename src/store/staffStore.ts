import { create } from "zustand"
import http, { httpPublic } from "../common/httpRequest"

interface Role {
  _id?: string
  roleType: string
}


interface Staff {
  _id: string
  name: string
  phone: string
  mobile?: string
  email: string
  type?: "head_quarter" | "franchise" | "hub"
  role: any
  roleId?: string
  franchiseId?: string
  hubId?: string
  status: string
  username?: string
  password?: string
  franchise?: string
  hub?: string
}

interface StaffState {
  staffs: Staff[]
  roles: Role[]
  selectedStaff: Staff | null
  loading: boolean
  error: string | null
  fetchRoles: () => Promise<void>
  fetchStaffs: () => Promise<void>
  getStaffsById: (id: string) => Promise<void>
  addStaff: (data: Omit<Staff, "_id">) => Promise<void>
  updateStaff: (id: string, reward: Partial<Staff>) => Promise<void>
  deleteStaff: (id: string) => Promise<void>
}

export const useStaffStore = create<StaffState>((set, get) => ({
  staffs: [],
  roles: [],
  selectedStaff: null,
  loading: false,
  error: null,

  fetchRoles: async () => {
    set({ loading: true, error: null })
    try {
      const response = await http.get("/admin/role", {
        params: { page: 1, limit: 100 }
      })
      const rolesData = response.data?.data || []
      const rolesList = rolesData.map((item: any) => ({
        _id: item._id || item.id,
        roleType: item.roleName || item.name || item.roleType
      }))
      set({ roles: rolesList, loading: false })
    } catch (error) {
      set({ 
        roles: [],
        loading: false 
      })
    }
  },

  fetchStaffs: async () => {
    set({ loading: true, error: null })
    try {
      const response = await httpPublic.get(`/admin/staff`)
      const staffArray = response.data?.data?.staff || []
      if (staffArray.length > 0) {
      }
      const staffList = staffArray.map((item: any) => ({
        _id: item._id || item.id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        role: item.roleId || item.role,
        roleId: typeof item.roleId === 'object' ? item.roleId?._id : item.roleId,
        franchiseId: typeof item.franchiseId === 'object' ? item.franchiseId?._id : item.franchiseId,
        hubId: typeof item.hubId === 'object' ? item.hubId?._id : item.hubId,
        status: item.status,
        username: item.username,
        franchise: typeof item.franchiseId === 'object' ? (item.franchiseId?.agencyName || item.franchiseId?.name) : item.franchise,
        hub: typeof item.hubId === 'object' ? (item.hubId?.hubName || item.hubId?.name) : item.hub
      }))
      set({
        staffs: staffList,
        loading: false,
      })
    } catch (error: any) {
      // Set empty array instead of showing error on initial load
      set({ 
        staffs: [],
        loading: false,
        error: null // Don't set error to avoid toast on page load
      })
    }
  },

  getStaffsById: async (id) => {
    set({ loading: true, error: null, selectedStaff: null })
    try {
      const response = await http.get(`/admin/staff/${id}`)
      const staff = response.data?.data
      const mappedStaff = {
        _id: staff._id || staff.id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        roleId: staff.roleId || staff.role?._id,
        franchiseId: staff.franchiseId,
        status: staff.status,
        username: staff.username,
        franchise: staff.franchise
      }

      const currentStaffs = get().staffs
      const updatedStaffs = currentStaffs.some((s) => s._id === id)
        ? currentStaffs.map((s) => (s._id === id ? mappedStaff : s))
        : [...currentStaffs, mappedStaff]

      set({
        staffs: updatedStaffs,
        selectedStaff: mappedStaff,
        loading: false,
      })
    } catch (error: any) {
      set({ 
        loading: false,
        error: error?.response?.data?.message || "Failed to fetch staff"
      })
    }
  },

  addStaff: async (data) => {
    set({ loading: true, error: null })
    try {
      // Auto-generate username from email and a random password (OTP-based login, backend still requires these fields)
      const autoUsername = data.username || data.email
      const autoPassword = data.password || Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10).toUpperCase() + "!1"

      const payload: any = {
        name: data.name,
        email: data.email,
        phone: data.phone || data.mobile,
        type: data.type || "head_quarter",
        username: autoUsername,
        password: autoPassword,
      }
      if (data.type !== "hub") {
        payload.status = typeof data.status === 'boolean' ? (data.status ? 'Active' : 'Inactive') : data.status
      }

      // Include roleId only for headquarters staff
      if (data.type === "head_quarter" && data.roleId) {
        payload.roleId = data.roleId
      }

      // Include franchiseId only for franchise staff
      if (data.type === "franchise" && (data.franchiseId || data.franchise)) {
        payload.franchiseId = data.franchiseId || data.franchise
      }

      // Include hubId only for hub staff
      if (data.type === "hub" && (data.hubId || data.hub)) {
        payload.hubId = data.hubId || data.hub
      }

      await http.post(`/admin/staff`, payload)
      await get().fetchStaffs()
      set({ loading: false })
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to add staff"
      set({ loading: false, error: message })
      throw new Error(message)
    }
  },

  updateStaff: async (id, updatedStaff) => {
    set({ loading: true, error: null })
    try {
      const payload: any = {}
      if (updatedStaff.name) payload.name = updatedStaff.name
      if (updatedStaff.phone || updatedStaff.phone) payload.phone = updatedStaff.phone || updatedStaff.phone
      if (updatedStaff.email) payload.email = updatedStaff.email
      if (updatedStaff.type) payload.type = updatedStaff.type
      if (updatedStaff.username) payload.username = updatedStaff.username
      if (updatedStaff.password) payload.password = updatedStaff.password
      
      // Include roleId only for headquarters staff
      if (updatedStaff.type === "head_quarter" && updatedStaff.roleId) {
        payload.roleId = updatedStaff.roleId
      }
      
      // Include franchiseId only for franchise staff
      if (updatedStaff.type === "franchise" && (updatedStaff.franchiseId || updatedStaff.franchise)) {
        payload.franchiseId = updatedStaff.franchiseId || updatedStaff.franchise
      }
      
      // Include hubId only for hub staff
      if (updatedStaff.type === "hub" && (updatedStaff.hubId || updatedStaff.hub)) {
        payload.hubId = updatedStaff.hubId || updatedStaff.hub
      }
      
      if (updatedStaff.type !== "hub" && updatedStaff.status !== undefined) {
        payload.status = typeof updatedStaff.status === 'boolean' ? (updatedStaff.status ? 'Active' : 'Inactive') : updatedStaff.status
      }

      await http.put(`/admin/staff/${id}`, payload)
      await get().fetchStaffs()
      set({ loading: false })
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to update staff"
      set({ loading: false, error: message })
      throw new Error(message)
    }
  },

  deleteStaff: async (id) => {
    set({ loading: true, error: null })
    try {
      await http.delete(`/admin/staff/${id}`)
      await get().fetchStaffs()
      set({ loading: false })
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to delete staff"
      set({ loading: false, error: message })
      throw new Error(message)
    }
  },
}))
