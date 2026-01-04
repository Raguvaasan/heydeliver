import { ReactNode } from "react"
import { Navigate } from "react-router-dom"

interface ProtectedRouteProps {
  children: ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const authToken = sessionStorage.getItem("authToken")
  let isAuthenticated = false
  if (authToken && authToken !== null) {
    isAuthenticated = true
  }
  return isAuthenticated ? <>{children} </> : <Navigate to="/" />
}

export default ProtectedRoute
