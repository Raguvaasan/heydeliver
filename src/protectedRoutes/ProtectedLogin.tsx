import { Navigate } from "react-router-dom"
import { ReactNode } from "react"

interface ProtectedLoginProps {
  children: ReactNode
}

const ProtectedLogin: React.FC<ProtectedLoginProps> = ({ children }) => {
  const authToken = sessionStorage.getItem("authToken")
  let isAuthenticated = false
  if (authToken && authToken !== null) {
    isAuthenticated = true
  }
  return isAuthenticated ? <Navigate to="/dashboard" /> : <>{children}</>
}

export default ProtectedLogin
