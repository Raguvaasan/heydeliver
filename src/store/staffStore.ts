import { create } from "zustand"
import http from "../common/httpRequest"

interface Role {
  _id?: string
  roleType: string
}


interface Staff {
  _id: string
  name: string
  phone: string
  email: string
  role: any
  roleId?: string
  franchiseId?: string
  status: string
  username?: string
  password?: string
  franchise?: string
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
      console.log("Fetched roles:", rolesList) // Debug log
      set({ roles: rolesList, loading: false })
    } catch (error) {
      console.error("Error fetching roles:", error)
      set({ 
        roles: [],
        loading: false 
      })
    }
  },

  fetchStaffs: async () => {
    set({ loading: true, error: null })
    try {
      const response = await http.get(`/admin/staff`)
      const staffArray = response.data?.data?.staff || []
      const staffList = staffArray.map((item: any) => ({
        _id: item._id || item.id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        role: item.roleId || item.role,
        roleId: item.roleId?._id || item.roleId,
        franchiseId: item.franchiseId?._id || item.franchiseId,
        status: item.status,
        username: item.username,
        franchise: item.franchiseId?.agencyName || item.franchise
      }))
      console.log("Fetched staff list:", staffList) // Debug log
      set({
        staffs: staffList,
        loading: false,
      })
    } catch (error: any) {
      console.error("Error fetching staffs:", error)
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
      console.error("Error fetching staff:", error)
      set({ 
        loading: false,
        error: error?.response?.data?.message || "Failed to fetch staff"
      })
    }
  },

  addStaff: async (data) => {
    set({ loading: true, error: null })
    try {
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone || data.mobile,
        roleId: data.roleId,
        franchiseId: data.franchiseId || data.franchise,
        username: data.username,
        password: data.password,
        status: typeof data.status === 'boolean' ? (data.status ? 'Active' : 'Inactive') : data.status
      }
      await http.post(`/admin/staff`, payload)
      await get().fetchStaffs()
      set({ loading: false })
    } catch (error: any) {
      console.error("Error adding staff:", error)
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
      if (updatedStaff.roleId) payload.roleId = updatedStaff.roleId
      if (updatedStaff.franchiseId || updatedStaff.franchise) payload.franchiseId = updatedStaff.franchiseId || updatedStaff.franchise
      if (updatedStaff.username) payload.username = updatedStaff.username
      if (updatedStaff.password) payload.password = updatedStaff.password
      if (updatedStaff.status !== undefined) {
        payload.status = typeof updatedStaff.status === 'boolean' ? (updatedStaff.status ? 'Active' : 'Inactive') : updatedStaff.status
      }

      await http.put(`/admin/staff/${id}`, payload)
      await get().fetchStaffs()
      set({ loading: false })
    } catch (error: any) {
      console.error("Error updating staff:", error)
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
      console.error("Error deleting staff:", error)
      const message = error?.response?.data?.message || "Failed to delete staff"
      set({ loading: false, error: message })
      throw new Error(message)
    }
  },
}))
