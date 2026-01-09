import { create } from "zustand"
import http from "../common/httpRequest"
import toast from "react-hot-toast"

interface ModulePermission {
  module: string
  read: boolean
  write: boolean
  update: boolean
  delete: boolean
}

interface Role {
  _id: string
  roleName: string
  permissions: ModulePermission[]
  status: boolean
  isRoot?: boolean
  createdAt?: string
  updatedAt?: string
}

interface RoleState {
  roles: Role[]
  modules: string[]
  loading: boolean
  error: string | null
  selectedRole: Role | null
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  } | null

  fetchRoles: (page?: number, limit?: number) => Promise<void>
  getRoleById: (id: string) => Promise<void>
  addRole: (data: { roleName: string; permissions: ModulePermission[]; status?: boolean }) => Promise<void>
  updateRole: (id: string, data: { roleName?: string; permissions?: ModulePermission[]; status?: boolean }) => Promise<void>
  deleteRole: (id: string) => Promise<void>
  fetchModules: () => Promise<void>
  clearSelectedRole: () => void
}

export const useRoleStore = create<RoleState>((set, get) => ({
  roles: [],
  modules: [],
  loading: false,
  error: null,
  selectedRole: null,
  pagination: null,

  fetchRoles: async (page = 1, limit = 10) => {
    set({ loading: true, error: null })
    try {
      const res = await http.get("/admin/role", {
        params: { page, limit }
      })
      console.log("Roles API response:", res.data)
      
      // Handle response structure: { success: true, data: [...] }
      const rolesData = res.data?.data || []
      const rolesArray = Array.isArray(rolesData) ? rolesData : []
      
      console.log("Parsed roles:", rolesArray)
      
      const pagination = res.data?.pagination || null
      
      set({ 
        roles: rolesArray, 
        pagination,
        loading: false 
      })
    } catch (err: any) {
      console.error("Error fetching roles:", err)
      set({ 
        roles: [], 
        loading: false, 
        error: err?.response?.data?.message || err?.message || "Failed to fetch roles"
      })
      toast.error("Failed to fetch roles")
    }
  },

  getRoleById: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const res = await http.get(`/admin/role/${id}`)
      const roleData = res.data?.data || res.data
      set({
        selectedRole: roleData || null,
        loading: false,
      })
    } catch (err: any) {
      console.error("Error getting role:", err)
      set({ loading: false, error: err?.response?.data?.message || err?.message || "Failed to get role" })
      toast.error("Failed to get role details")
    }
  },

  addRole: async (data) => {
    set({ loading: true, error: null })
    try {
      await http.post("/admin/role", data)
      await get().fetchRoles()
      toast.success("Role added successfully!")
      set({ loading: false })
    } catch (err: any) {
      console.error("Error adding role:", err)
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to add role"
      set({ loading: false, error: errorMessage })
      toast.error(errorMessage)
      throw err
    }
  },

  updateRole: async (id, data) => {
    set({ loading: true, error: null })
    try {
      await http.put(`/admin/role/${id}`, data)
      await get().fetchRoles()
      toast.success("Role updated successfully!")
      set({ loading: false })
    } catch (err: any) {
      console.error("Error updating role:", err)
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to update role"
      set({ loading: false, error: errorMessage })
      toast.error(errorMessage)
      throw err
    }
  },

  deleteRole: async (id) => {
    set({ loading: true, error: null })
    try {
      await http.delete(`/admin/role/${id}`)
      await get().fetchRoles()
      set({ loading: false })
    } catch (err: any) {
      console.error("Error deleting role:", err)
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to delete role"
      set({ loading: false, error: errorMessage })
      throw err
    }
  },

  fetchModules: async () => {
    set({ loading: true, error: null })
    try {
      const res = await http.get("/admin/modules")
      const modules = res.data?.data
        ? (Object.values(res.data.data) as string[])
        : []
      set({ modules, loading: false })
    } catch (err: any) {
      console.error("Error fetching modules:", err)
      set({ loading: false, error: err?.message || "Failed to fetch modules" })
    }
  },

  clearSelectedRole: () => {
    set({ selectedRole: null })
  },
}))
