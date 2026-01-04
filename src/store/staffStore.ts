import { create } from "zustand"
import http from "../common/httpRequest"

interface Role {
  roleType: string
}


interface Staff {
  _id: string
  name: string
  mobile: string
  email: string
  role: any
  status: boolean
  
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
      const response = await http.get("/admin/auth/role/available")
      set({ roles: response.data?.data || [], loading: false })
    } catch (error) {
      console.error("Error fetching roles:", error)
      set({ loading: false, error: "Failed to fetch roles" })
    }
  },

  fetchStaffs: async () => {
    set({ loading: true, error: null })
    try {
      const response = await http.get(`/admin/auth/user`)
      set({
        staffs: response.data?.data || [],
        loading: false,
      })
    } catch (error) {
      set({ loading: false, error: (error as Error).message })
    }
  },

  getStaffsById: async (id) => {
    set({ loading: true, error: null, selectedStaff: null })
    try {
      const response = await http.get(`/admin/auth/user/${id}`)
      const staff = response.data?.data

      const currentStaffs = get().staffs
      const updatedStaffs = currentStaffs.some((s) => s._id === id)
        ? currentStaffs.map((s) => (s._id === id ? staff : s))
        : [...currentStaffs, staff]

      set({
        staffs: updatedStaffs,
        selectedStaff: staff, // ✅ set selected
        loading: false,
      })
    } catch (error) {
      console.error("Error fetching staff:", error)
      set({ loading: false, error: "Failed to fetch staff details" })
    }
  },

  addStaff: async (data) => {
    set({ loading: true, error: null })
    try {
      await http.post(`/admin/auth/create-user`, data)
      await get().fetchStaffs()
    } catch (error) {
      console.error("Error adding staff:", error)
      set({ loading: false, error: "Failed to add staff" })
    }
  },

  updateStaff: async (id, updatedStaff) => {
    set({ loading: true, error: null })
    try {
      await http.put(`/admin/auth/user/${id}`, updatedStaff)
      await get().fetchStaffs()
    } catch (error: any) {
      console.error("Error updating staff:", error)
      set({
        loading: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to update staff",
      })
    }
  },

  deleteStaff: async (id) => {
    set({ loading: true, error: null })
    try {
      await http.delete(`/admin/auth/user/${id}`)
      await get().fetchStaffs()
    } catch (error) {
      console.error("Error deleting staff:", error)
      set({ loading: false, error: "Failed to delete staff" })
    }
  },
}))
