import { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { hasRouteAccess } from "../utils/routePermissions"

interface PermissionRouteProps {
  children: ReactNode
}

/**
 * Route guard that checks both authentication AND module permissions.
 * - Unauthenticated users are redirected to login.
 * - Staff users without the required module permission see Access Denied.
 * - Admin, Franchise, Hub users with valid auth always pass through.
 */
const PermissionRoute: React.FC<PermissionRouteProps> = ({ children }) => {
  const authToken = sessionStorage.getItem("authToken")
  const location = useLocation()

  // Check authentication first
  if (!authToken) {
    return <Navigate to="/" />
  }

  // Check module permission for the current route
  if (!hasRouteAccess(location.pathname)) {
    return <Navigate to="/access-denied" replace />
  }

  return <>{children}</>
}

export default PermissionRoute
