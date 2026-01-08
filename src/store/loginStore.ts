import http from "../common/httpRequest"
import { create } from "zustand"

export const loginAdminUser = (
  email: string,
  password: string,
  captchaToken?: string
) => {
  // Leading slash ensures axios joins with baseURL correctly (e.g., /api + /admin/...)
  return http.post("/admin/auth/login", { email, password, captchaToken })
}

export const loginFranchiseUser = (
  username: string,
  password: string
) => {
  return http.post("/admin/agency/login", { username, password })
}

export const loginStaffUser = (
  username: string,
  password: string
) => {
  return http.post("/admin/staff/login", { username, password })
}

interface Profile {
  name: string
  email: string
  mobile: string
  profileUrl?: string
  [key: string]: any
  roleinfo: any
}

interface ProfileStore {
  loading: boolean
  error: string | null
  profile: Profile | null
  fetchProfile: () => Promise<void>
}

export const useProfileStore = create<ProfileStore>((set) => ({
  loading: false,
  error: null,
  profile: null,
  fetchProfile: async () => {
    set({ loading: true, error: null })
    try {
      const response = await http.get("/admin/profile")
      set({ profile: response.data?.data || null, loading: false })
    } catch (error: any) {
      set({ loading: false, error: error?.message || "Something went wrong" })
    }
  },
  setProfile: (profileData: any) => set({ profile: profileData }),
}))
