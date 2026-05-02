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

    const permissions: any[] =
      profile?.role?.permissions ||
      profile?.data?.role?.permissions ||
      profile?.roleinfo?.permissions ||
      profile?.data?.roleinfo?.permissions ||
      []

    // Find the module — API uses "module", some formats use "moduleName"
    const permission = permissions.find(
      (perm: any) => {
        const name = String(perm?.module || perm?.moduleName || perm?.name || "").trim().toLowerCase()
        return name === moduleName.toLowerCase()
      }
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
      // Check both flat (API format) and nested (UI format)
      return keys.some((key) => permission?.[key] === true || permission?.permission?.[key] === true)
    }

    // If no specific action is provided, return true if module is present
    return true
  } catch (error) {
    return false
  }
}
