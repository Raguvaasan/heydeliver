import http from "../common/httpRequest"
import { create } from "zustand"

// all login helpers now support a reusable captchaToken parameter.  the
// backend performs recaptcha validation server‑side, so we must forward the
// token obtained from the client (v3/invisible).  franchise login does not
// currently require captcha but the parameter is included for future parity.
export const loginAdminUser = (
  email: string,
  password: string,
  captchaToken?: string
) => {
  const payload: any = {
    email,
    password,
  }
  if (captchaToken) {
    payload.captchaToken = captchaToken
  }
  return http.post("/admin/auth/login", payload)
}

export const loginFranchiseUser = (
  username: string,
  password: string,
  captchaToken?: string
) => {
  const payload: any = {
    username: username.trim(),
    password: password.trim(),
  }
  if (captchaToken) {
    payload.captchaToken = captchaToken
  }
  return http.post("/admin/agency/login", payload)
}

export const loginStaffUser = (
  username: string,
  password: string,
  captchaToken?: string
) => {
  const payload: any = {
    username: username.trim(),
    password: password.trim(),
  }
  if (captchaToken) {
    payload.captchaToken = captchaToken
  }
  return http.post("/admin/staff/login/headquarter", payload)
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
