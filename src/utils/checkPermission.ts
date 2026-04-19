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
      // Map UI action names to API permission field names
      const actionMap: Record<string, string[]> = {
        view: ["view", "read"],
        add: ["add", "write"],
        edit: ["edit", "update"],
        delete: ["delete"],
      }
      const keys = actionMap[action] || [action]
      return keys.some((key) => !!permission.permission?.[key])
    }

    // If no specific action is provided, return true if module is present
    return true
  } catch (error) {
    return false
  }
}
