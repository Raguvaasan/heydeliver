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
import FranchiseRolePage from "./pages/Role/FranchiseRolePage"
import DashboardPage from "./pages/Dashboard/DashboardPage"
import AgencyManagementPage from "./pages/AgencyManagement/AgencyManagementPage"
import SubadminAndSupport from "./pages/AccessManagement/SubadminAndSupport"
import StaffPage from "./pages/AccessManagement/StaffPage"
import FranchiseStaffPage from "./pages/Staff/FranchiseStaffPage"
import FranchiseStaffListPage from "./pages/Staff/FranchiseStaffListPage"
import FranchiseAddStaffPage from "./pages/Staff/FranchiseAddStaffPage"
import TestFranchiseStaffPage from "./pages/Staff/TestFranchiseStaffPage"
import FranchiseStaffDetailPage from "./pages/Staff/FranchiseStaffDetailPage"
import OrdersPage from "./pages/Orders/OrdersPage"
import NewOrderPage from "./pages/Orders/NewOrderPage"
import OrderDetailsPage from "./pages/Orders/OrderDetailsPage"
import BulkOrderPage from "./pages/Orders/BulkOrderPage"
import CompletedOrdersPage from "./pages/Orders/CompletedOrdersPage"
import ForwardOrdersPage from "./pages/Orders/ForwardOrdersPage"
import RateCalculatorPage from "./pages/RateCalculator/RateCalculatorPage"
import ServiceAvailabilityPage from "./pages/ServiceAvailability/ServiceAvailabilityPage"
import WalletPage from "./pages/Wallet/WalletPage"
import AddMoneyPage from "./pages/Wallet/AddMoneyPage"
import TransactionsPage from "./pages/Wallet/TransactionsPage"
import RechargesPage from "./pages/Wallet/RechargesPage"
import InvoicePage from "./pages/Invoice/InvoicePage"
import ReportsPage from "./pages/Reports/ReportsPage"
import FranchiseWiseReportPage from "./pages/Reports/FranchiseWiseReportPage"
import TotalOrdersReportPage from "./pages/Reports/TotalOrdersReportPage"
import TotalRevenueReportPage from "./pages/Reports/TotalRevenueReportPage"
import DeliveryPerformanceReportPage from "./pages/Reports/DeliveryPerformanceReportPage"
import TrackingPage from "./pages/Tracking/TrackingPage"
import PaymentsPage from "./pages/Payments/PaymentsPage"
import RateCardPage from "./pages/Settings/RateCardPage"
import PincodeServiceabilityPage from "./pages/Settings/PincodeServiceabilityPage"
import { ThemeProvider } from "./context/ThemeContext"
import { Toaster } from "react-hot-toast"
import RegisterPage from "./pages/authentication/RegisterPage"
import CreatePickupRequestPage from "./pages/PickupRequest/CreatePickupRequestPage"
import PickupRequestsPage from "./pages/PickupRequest/PickupRequestsPage"

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

          <Route
            path="/franchise-role"
            element={
              <ProtectedRoute>
                <FranchiseRolePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/franchise-role/roleform"
            element={
              <ProtectedRoute>
                <AddRolePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/franchise-role/editrole/:id"
            element={
              <ProtectedRoute>
                <EditRolePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff"
            element={
              <ProtectedRoute>
                <SubadminAndSupport />
              </ProtectedRoute>
            }
          />

          <Route
            path="/franchise-staff"
            element={
              <ProtectedRoute>
                <FranchiseStaffListPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/franchise-staff/add"
            element={
              <ProtectedRoute>
                <FranchiseAddStaffPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/franchise-staff/edit/:id"
            element={
              <ProtectedRoute>
                <FranchiseAddStaffPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/franchise-staff/:id"
            element={
              <ProtectedRoute>
                <FranchiseStaffDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff/:id"
            element={
              <ProtectedRoute>
                <StaffPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders/new"
            element={
              <ProtectedRoute>
                <NewOrderPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders/bulk"
            element={
              <ProtectedRoute>
                <BulkOrderPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetailsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders/completed"
            element={
              <ProtectedRoute>
                <CompletedOrdersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders/forward"
            element={
              <ProtectedRoute>
                <ForwardOrdersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/rate-calculator"
            element={
              <ProtectedRoute>
                <RateCalculatorPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/service-availability"
            element={
              <ProtectedRoute>
                <ServiceAvailabilityPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <WalletPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/wallet/add"
            element={
              <ProtectedRoute>
                <AddMoneyPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/wallet/transactions"
            element={
              <ProtectedRoute>
                <TransactionsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/wallet/recharges"
            element={
              <ProtectedRoute>
                <RechargesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/invoice"
            element={
              <ProtectedRoute>
                <InvoicePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports/franchise-wise"
            element={
              <ProtectedRoute>
                <FranchiseWiseReportPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports/total-orders"
            element={
              <ProtectedRoute>
                <TotalOrdersReportPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports/total-revenue"
            element={
              <ProtectedRoute>
                <TotalRevenueReportPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports/delivery-performance"
            element={
              <ProtectedRoute>
                <DeliveryPerformanceReportPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tracking"
            element={
              <ProtectedRoute>
                <TrackingPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <PaymentsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payments/wallet"
            element={
              <ProtectedRoute>
                <WalletPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings/rate-card"
            element={
              <ProtectedRoute>
                <RateCardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings/pincode-serviceability"
            element={
              <ProtectedRoute>
                <PincodeServiceabilityPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders/pickup"
            element={
              <ProtectedRoute>
                <PickupRequestsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders/pickup/create"
            element={
              <ProtectedRoute>
                <CreatePickupRequestPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/pickup-requests/create"
            element={
              <ProtectedRoute>
                <CreatePickupRequestPage />
              </ProtectedRoute>
            }
          />

                  </Routes>
      </BrowserRouter>
    </Flowbite>
  </ThemeProvider>
)
