import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import theme from "./flowbite-theme"
import { Flowbite } from "flowbite-react"
import { Routes, Route } from "react-router"
import { BrowserRouter } from "react-router-dom"
import LoginPage from "./pages/authentication/LoginPage"
import ProtectedRoute from "./protectedRoutes/ProtectedRoute"
import ProtectedLogin from "./protectedRoutes/ProtectedLogin"
import RoleAndPermissionPage from "./pages/AccessManagement/RoleAndPermission"
import AddRolePage from "./pages/AccessManagement/AddRolePage"
import EditRolePage from "./pages/AccessManagement/EditRolePage"
import DashboardPage from "./pages/Dashboard/DashboardPage"
import AgencyManagementPage from "./pages/AgencyManagement/AgencyManagementPage"
import { ThemeProvider } from "./context/ThemeContext"
import { Toaster } from "react-hot-toast"
import RegisterPage from "./pages/authentication/RegisterPage"

const container = document.getElementById("root")

if (!container) {
  throw new Error("React root element doesn't exist!")
}

const root = createRoot(container)

root.render(
  <ThemeProvider>
    <Flowbite theme={{ theme }}>
      <BrowserRouter basename="/admin">
        <Toaster position="top-right" reverseOrder={false} />
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedLogin>
                <LoginPage />
              </ProtectedLogin>
            }          />
         
         <Route
            path="/register"
            element={
              <ProtectedLogin>
                <RegisterPage />
              </ProtectedLogin>
            }          />
         
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/agencies"
            element={
              <ProtectedRoute>
                <AgencyManagementPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/role"
            element={
              <ProtectedRoute>
                <RoleAndPermissionPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/role/roleform"
            element={
              <ProtectedRoute>
                <AddRolePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/role/editrole/:id"
            element={
              <ProtectedRoute>
                <EditRolePage />
              </ProtectedRoute>
            }
          />

                  </Routes>
      </BrowserRouter>
    </Flowbite>
  </ThemeProvider>
)
