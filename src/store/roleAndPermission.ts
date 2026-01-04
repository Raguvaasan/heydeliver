import { create } from "zustand"
import http from "../common/httpRequest"

interface ModulePermission {
  view: boolean
  add: boolean
  edit: boolean
  delete: boolean
  active?: boolean
}

interface Permission {
  moduleName: string
  permission: ModulePermission
}

interface Role {
  _id: string
  roleType: string
  permissions: Permission[]
  status: boolean
  isRoot?: boolean
}

interface RoleState {
  roles: Role[]
  modules: string[]
  loading: boolean
  error: string | null
  selectedRole: Role | null

  fetchRoles: () => Promise<void>
  getRoleById: (id: string) => Promise<void>
  addRole: (data: Omit<Role, "_id">) => Promise<void>
  updateRole: (id: string, data: Partial<Role>) => Promise<void>
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

  fetchRoles: async () => {
    set({ loading: true, error: null })
    try {
      const res = await http.get("/admin/role")
      console.log("Roles API response:", res.data)
      const rolesData = res.data?.data || res.data?.roles || []
      const rolesArray = Array.isArray(rolesData) ? rolesData : []
      set({ roles: rolesArray, loading: false })
    } catch (err: any) {
      console.error("Error fetching roles:", err)
      set({ roles: [], loading: false, error: err?.message || "Failed to fetch roles" })
    }
  },

  getRoleById: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const res = await http.get(`/admin/role/${id}`)
      const roleData = res.data?.data
      set({
        selectedRole: roleData || null,
        loading: false,
      })
    } catch (err: any) {
      console.error("Error getting role:", err)
      set({ loading: false, error: err?.message || "Failed to get role" })
    }
  },

  addRole: async (data) => {
    set({ loading: true, error: null })
    try {
      await http.post("/admin/role", data)
      await get().fetchRoles()
    } catch (err: any) {
      console.error("Error adding role:", err)
      set({ loading: false, error: err?.message || "Failed to add role" })
    }
  },

  updateRole: async (id, data) => {
    set({ loading: true, error: null })
    try {
      await http.put(`/admin/role/${id}`, data)
      // await get().fetchRoles()
    } catch (err: any) {
      console.error("Error updating role:", err)
      set({ loading: false, error: err?.message || "Failed to update role" })
    }
  },

  deleteRole: async (id) => {
    set({ loading: true, error: null })
    try {
      await http.delete(`/admin/role/${id}`)
      await get().fetchRoles()
    } catch (err: any) {
      console.error("Error deleting role:", err)
      set({ loading: false, error: err?.message || "Failed to delete role" })
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
