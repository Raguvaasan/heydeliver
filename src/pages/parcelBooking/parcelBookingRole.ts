export interface ParcelAccessState {
  isAdmin: boolean
  isHub: boolean
  isBranch: boolean
}

export interface ParcelProfileData {
  role?: {
    name?: string
    roleName?: string
  }
}

export const resolveParcelAccess = (
  loginType: string,
  profileData: ParcelProfileData | null,
): ParcelAccessState => {
  const normalizedLoginType = (loginType || "").toLowerCase()
  const userRole = (profileData?.role?.name || "").toLowerCase()
  const roleName = (profileData?.role?.roleName || "").toLowerCase()

  const isAdmin =
    normalizedLoginType === "admin" ||
    userRole === "admin" ||
    userRole === "super admin" ||
    roleName === "admin" ||
    roleName === "super admin"

  const isHub =
    normalizedLoginType === "hub" ||
    userRole === "hub" ||
    roleName === "hub"

  const isBranch =
    !isAdmin &&
    !isHub &&
    (normalizedLoginType === "branch" ||
      normalizedLoginType === "franchise" ||
      normalizedLoginType === "staff" ||
      userRole === "branch" ||
      userRole === "franchise" ||
      userRole === "staff" ||
      roleName === "branch" ||
      roleName === "franchise" ||
      roleName === "staff")

  return { isAdmin, isHub, isBranch }
}
