interface CheckPermissionArgs {
  moduleName: string
  action?: "view" | "add" | "edit" | "delete"
}

export const checkModulePermission = ({
  moduleName,
  action,
}: CheckPermissionArgs): boolean => {
  try {
    const profileData = sessionStorage.getItem("profileData")
    if (!profileData) return false

    const profile = JSON.parse(profileData)

    // Root user has all permissions
    if (profile?.role?.isRoot) return true

    const permission = profile?.role?.permissions?.find(
      (perm: any) => perm.moduleName?.toLowerCase() === moduleName.toLowerCase()
    )

    if (!permission) return false

    if (action) {
      return !!permission.permission?.[action]
    }

    // If no specific action is provided, return true if module is present
    return true
  } catch (error) {
    console.error("Error checking module permission:", error)
    return false
  }
}
