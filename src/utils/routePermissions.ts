/**
 * Route-to-module permission mapping.
 * Maps route paths to the required module name for access control.
 * Staff users must have the corresponding module permission to access a route.
 */

export interface RoutePermission {
  /** The module name that must be present in staff permissions */
  module: string
  /** The minimum action required (defaults to "view" if not specified) */
  action?: "view" | "add" | "edit" | "delete"
}

/**
 * Maps route path prefixes to required module permissions.
 * Order matters: more specific paths should come first.
 * Routes not listed here are accessible to all authenticated users.
 */
export const routePermissionMap: Record<string, RoutePermission> = {
  // Orders
  "/orders/new": { module: "Orders", action: "add" },
  "/orders/bulk": { module: "Orders", action: "add" },
  "/orders": { module: "Orders", action: "view" },

  // Franchise/Agency Management
  "/agencies": { module: "Franchise", action: "view" },

  // Hub Management
  "/hubs": { module: "Hub", action: "view" },

  // Customers
  "/customers": { module: "Customers", action: "view" },

  // Access Management (Staff & Roles)
  "/staff": { module: "Access Management", action: "view" },
  "/role": { module: "Access Management", action: "view" },
  "/franchise-staff": { module: "Manage Staffs", action: "view" },
  "/franchise-role": { module: "Role & Permissions", action: "view" },

  // Wallet & Payments
  "/wallet": { module: "Wallet", action: "view" },
  "/payments": { module: "Payments", action: "view" },

  // Reports
  "/reports": { module: "Reports", action: "view" },

  // Tracking
  "/tracking": { module: "Tracking", action: "view" },

  // Settings
  "/settings": { module: "Settings", action: "view" },
  "/rate-calculator": { module: "Rate Calculator", action: "view" },

  // Service Availability
  "/service-availability": { module: "Service Availability Check", action: "view" },

  // Careers
  "/careers": { module: "Careers", action: "view" },

  // Invoice
  "/invoice": { module: "Payments", action: "view" },

  // Pickup Requests
  "/pickup-requests": { module: "Orders", action: "view" },
}

/**
 * Find the required permission for a given route path.
 * Matches the most specific route prefix first.
 */
export const getRoutePermission = (pathname: string): RoutePermission | null => {
  // Sort keys by length descending so more specific routes match first
  const sortedPaths = Object.keys(routePermissionMap).sort(
    (a, b) => b.length - a.length
  )

  for (const routePath of sortedPaths) {
    if (pathname === routePath || pathname.startsWith(routePath + "/")) {
      return routePermissionMap[routePath]
    }
  }

  return null
}

/**
 * Check if the current user has permission to access a route.
 * Non-staff users (admin, franchise, hub) always have access.
 * Staff users are checked against their assigned permissions.
 */
export const hasRouteAccess = (pathname: string): boolean => {
  // Staff users are identified by the isStaffLogin flag
  // (loginType may be remapped to franchise/hub/admin for API endpoint selection)
  const isStaffUser = sessionStorage.getItem("isStaffLogin") === "true"

  // Non-staff users get full access based on their role type
  if (!isStaffUser) return true

  // Get staff profile data
  let profileData: any = null
  try {
    const data = sessionStorage.getItem("profileData")
    profileData = data ? JSON.parse(data) : null
  } catch {
    return false
  }

  if (!profileData) return false

  // Root users have all permissions
  if (profileData?.role?.isRoot) return true

  const permissions: any[] =
    profileData?.role?.permissions ||
    profileData?.data?.role?.permissions ||
    profileData?.roleinfo?.permissions ||
    profileData?.data?.roleinfo?.permissions ||
    []

  // Dashboard and Profile are always accessible
  if (pathname === "/dashboard" || pathname === "/profile") return true

  const routePermission = getRoutePermission(pathname)

  // If no permission mapping exists for this route, allow access
  if (!routePermission) return true

  // If staff has no permissions assigned, deny access
  if (!Array.isArray(permissions) || permissions.length === 0) return false

  // Check if the staff has the required module permission
  const hasModule = permissions.some((perm: any) => {
    // API format uses "module", some formats use "moduleName"
    const moduleName = String(
      perm?.module || perm?.moduleName || perm?.name || ""
    ).trim().toLowerCase()

    if (!moduleName) return false

    const requiredModule = routePermission.module.toLowerCase()
    if (moduleName !== requiredModule) {
      return false
    }

    // If a specific action is required, check that too
    // API format: read/write/update/delete are flat on the perm object
    // UI format: nested under perm.permission
    if (routePermission.action) {
      const actionMap: Record<string, string[]> = {
        view: ["view", "read"],
        add: ["add", "write"],
        edit: ["edit", "update"],
        delete: ["delete"],
      }
      const keys = actionMap[routePermission.action] || [routePermission.action]
      // Check both flat (API) and nested (UI) formats
      return keys.some((key) => perm?.[key] === true || perm?.permission?.[key] === true)
    }

    return true
  })

  return hasModule
}
