import { ReactNode } from "react"
import { Navigate } from "react-router-dom"

interface ProtectedRouteProps {
  children: ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const authToken = sessionStorage.getItem("authToken")
  const loginType = sessionStorage.getItem("loginType")
  
  console.log("ProtectedRoute check:", { authToken, loginType, path: window.location.pathname })
  
  let isAuthenticated = false
  if (authToken && authToken !== null) {
    isAuthenticated = true
  }
  
  if (!isAuthenticated) {
    console.warn("Not authenticated, redirecting to login")
  }
  
  return isAuthenticated ? <>{children} </> : <Navigate to="/" />
}

export default ProtectedRoute
