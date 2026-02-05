import { lazy, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { Spinner } from "flowbite-react"

import "./index.css"
import theme from "./flowbite-theme"
import { Flowbite } from "flowbite-react"
import { Routes, Route } from "react-router"
import { BrowserRouter } from "react-router-dom"
import ProtectedRoute from "./protectedRoutes/ProtectedRoute"
import ProtectedLogin from "./protectedRoutes/ProtectedLogin"
import { ThemeProvider } from "./context/ThemeContext"
import { Toaster } from "react-hot-toast"

// Lazy load all page components for better performance
// Authentication
const LoginPage = lazy(() => import("./pages/authentication/LoginPage"))
const RegisterPage = lazy(() => import("./pages/authentication/RegisterPage"))

// Dashboard
const DashboardPage = lazy(() => import("./pages/Dashboard/DashboardPage"))

// Access Management
const RoleAndPermissionPage = lazy(() => import("./pages/AccessManagement/RoleAndPermission"))
const AddRolePage = lazy(() => import("./pages/AccessManagement/AddRolePage"))
const EditRolePage = lazy(() => import("./pages/AccessManagement/EditRolePage"))
const SubadminAndSupport = lazy(() => import("./pages/AccessManagement/SubadminAndSupport"))
const StaffPage = lazy(() => import("./pages/AccessManagement/StaffPage"))

// Franchise Role
const FranchiseRolePage = lazy(() => import("./pages/Role/FranchiseRolePage"))

// Agency Management
const AgencyManagementPage = lazy(() => import("./pages/AgencyManagement/AgencyManagementPage"))

// Staff Management
const FranchiseStaffPage = lazy(() => import("./pages/Staff/FranchiseStaffPage"))
const FranchiseStaffListPage = lazy(() => import("./pages/Staff/FranchiseStaffListPage"))
const FranchiseAddStaffPage = lazy(() => import("./pages/Staff/FranchiseAddStaffPageModern"))
const FranchiseAddEditStaffPage = lazy(() => import("./pages/Staff/FranchiseAddEditStaffPage"))
const TestFranchiseStaffPage = lazy(() => import("./pages/Staff/TestFranchiseStaffPage"))
const FranchiseStaffDetailPage = lazy(() => import("./pages/Staff/FranchiseStaffDetailPage"))

// Orders
const OrdersPage = lazy(() => import("./pages/Orders/OrdersPage"))
const NewOrderPage = lazy(() => import("./pages/Orders/NewOrderPage"))
const OrderDetailsPage = lazy(() => import("./pages/Orders/OrderDetailsPage"))
const BulkOrderPage = lazy(() => import("./pages/Orders/BulkOrderPage"))
const CompletedOrdersPage = lazy(() => import("./pages/Orders/CompletedOrdersPage"))
const ForwardOrdersPage = lazy(() => import("./pages/Orders/ForwardOrdersPage"))

// Pickup Requests
const CreatePickupRequestPage = lazy(() => import("./pages/PickupRequest/CreatePickupRequestPage"))
const PickupRequestsPage = lazy(() => import("./pages/PickupRequest/PickupRequestsPage"))

// Rate Calculator & Service
const RateCalculatorPage = lazy(() => import("./pages/RateCalculator/RateCalculatorPage"))
const ServiceAvailabilityPage = lazy(() => import("./pages/ServiceAvailability/ServiceAvailabilityPage"))

// Wallet & Payments
const WalletPage = lazy(() => import("./pages/Wallet/WalletPage"))
const AddMoneyPage = lazy(() => import("./pages/Wallet/AddMoneyPage"))
const PaymentCallbackPage = lazy(() => import("./pages/Wallet/PaymentCallbackPage"))
const TransactionsPage = lazy(() => import("./pages/Wallet/TransactionsPage"))
const RechargesPage = lazy(() => import("./pages/Wallet/RechargesPage"))
const PaymentsPage = lazy(() => import("./pages/Payments/PaymentsPage"))
const InvoicePage = lazy(() => import("./pages/Invoice/InvoicePage"))

// Reports
const ReportsPage = lazy(() => import("./pages/Reports/ReportsPage"))
const FranchiseWiseReportPage = lazy(() => import("./pages/Reports/FranchiseWiseReportPage"))
const TotalOrdersReportPage = lazy(() => import("./pages/Reports/TotalOrdersReportPage"))
const TotalRevenueReportPage = lazy(() => import("./pages/Reports/TotalRevenueReportPage"))
const DeliveryPerformanceReportPage = lazy(() => import("./pages/Reports/DeliveryPerformanceReportPage"))
const StaffPerformanceReportPage = lazy(() => import("./pages/Reports/StaffPerformanceReportPage"))
const OrdersReportPage = lazy(() => import("./pages/Reports/OrdersReportPage"))
const RevenueReportPage = lazy(() => import("./pages/Reports/RevenueReportPage"))

// Tracking
const TrackingPage = lazy(() => import("./pages/Tracking/TrackingPage"))

// Settings
const RateCardPage = lazy(() => import("./pages/Settings/RateCardPage"))
const PincodeServiceabilityPage = lazy(() => import("./pages/Settings/PincodeServiceabilityPage"))
const RateMarkupPage = lazy(() => import("./pages/Settings/RateMarkupPage"))
const RateCardMarkupPage = lazy(() => import("./pages/Settings/RateCardMarkupPage"))

// Profile
const ProfilePage = lazy(() => import("./pages/Profile/ProfilePageModern"))

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <Spinner size="xl" />
      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
)

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
        <Suspense fallback={<PageLoader />}>
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
                <FranchiseAddEditStaffPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/franchise-staff/edit/:id"
            element={
              <ProtectedRoute>
                <FranchiseAddEditStaffPage />
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
            path="/wallet/payment-callback"
            element={
              <ProtectedRoute>
                <PaymentCallbackPage />
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
            path="/settings/rate-card-markup"
            element={
              <ProtectedRoute>
                <RateCardMarkupPage />
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

          <Route
            path="/reports/staff-performance"
            element={
              <ProtectedRoute>
                <StaffPerformanceReportPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports/orders"
            element={
              <ProtectedRoute>
                <OrdersReportPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports/revenue"
            element={
              <ProtectedRoute>
                <RevenueReportPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          </Routes>
        </Suspense>
      </BrowserRouter>
    </Flowbite>
  </ThemeProvider>
)
