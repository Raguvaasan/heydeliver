import { lazy, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { Spinner } from "flowbite-react"

import "./index.css"
import theme from "./flowbite-theme"
import { Flowbite } from "flowbite-react"
import { Routes, Route } from "react-router"
import { BrowserRouter } from "react-router-dom"
import ProtectedRoute from "./protectedRoutes/ProtectedRoute"
import PermissionRoute from "./protectedRoutes/PermissionRoute"
import ProtectedLogin from "./protectedRoutes/ProtectedLogin"
import { ThemeProvider } from "./context/ThemeContext"
import { Toaster } from "react-hot-toast"
import VehicleManagementPage from "./pages/vehicleManagement/vehicleManagementPage"
import DriverManagementPage from "./pages/driverManagement/driverManagementPage"
import ParcelManagementPage from "./pages/parcelBooking/parcelBooking"
import AgencyParcelOrdersPage from "./pages/AgencyOrders/AgencyParcelOrdersPage"

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
const FranchiseAddRolePage = lazy(() => import("./pages/Role/FranchiseAddRolePage"))
const FranchiseEditRolePage = lazy(() => import("./pages/Role/FranchiseEditRolePage"))

// Agency Management
const AgencyManagementPage = lazy(() => import("./pages/AgencyManagement/AgencyManagementPage"))

// Collection Agency Management
const CollectionAgencyManagementPage = lazy(() => import("./pages/CollectionAgencyManagement/CollectionAgencyManagementPage"))

// Hub Management
const HubManagementPage = lazy(() => import("./pages/HubManagement/HubManagementPage"))
const RouteManagementPage = lazy(() => import("./pages/RouteManagement/RouteManagementPage"))

// Customer Management
const CustomersPage = lazy(() => import("./pages/Customers/CustomersPage"))
const CustomerDetailsPage = lazy(() => import("./pages/Customers/CustomerDetailsPage"))
const B2BCustomersPage = lazy(() => import("./pages/B2BCustomers/B2BCustomersPage"))

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
const ForwardOrderDetailPage = lazy(() => import("./pages/Orders/ForwardOrderDetailPage"))

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
const RevenuePage = lazy(() => import("./pages/Payments/RevenuePage"))
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
const SettingsRateCalculatorPage = lazy(() => import("./pages/Settings/RateCalculatorPage"))
const BranchWalletPage = lazy(() => import("./pages/Settings/BranchWallet/BranchWalletPage"))
const BranchWalletDetailsPage = lazy(() => import("./pages/Settings/BranchWallet/BranchWalletDetailsPage"))
const PayoutPage = lazy(() => import("./pages/Settings/Payout/PayoutPage"))
const ProfitPercentagePage = lazy(() => import("./pages/Settings/ProfitPercentage/ProfitPercentagePage"))

// Profile
const ProfilePage = lazy(() => import("./pages/Profile/ProfilePageModern"))

// Careers
const CareersPage = lazy(() => import("./pages/Careers/CareersPage"))
const ApplicationsPage = lazy(() => import("./pages/Careers/ApplicationsPage"))

// Access Denied
const AccessDeniedPage = lazy(() => import("./pages/AccessDenied"))

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
            path="/access-denied"
            element={
              <ProtectedRoute>
                <AccessDeniedPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/agencies"
            element={
              <PermissionRoute>
                <AgencyManagementPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/collection-agencies"
            element={
              <PermissionRoute>
                <CollectionAgencyManagementPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/hubs"
            element={
              <PermissionRoute>
                <HubManagementPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/routes"
            element={
              <PermissionRoute>
                <RouteManagementPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/parcel-booking"
            element={
              <PermissionRoute>
                <ParcelManagementPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/parcel-booking/inward"
            element={
              <PermissionRoute>
                <AgencyParcelOrdersPage direction="inward" />
              </PermissionRoute>
            }
          />

          <Route
            path="/parcel-booking/outward"
            element={
              <PermissionRoute>
                <AgencyParcelOrdersPage direction="outward" />
              </PermissionRoute>
            }
          />

           <Route
            path="/vehicle"
            element={
              <PermissionRoute>
                <VehicleManagementPage />
              </PermissionRoute>
            }
          />

            <Route
            path="/driver"
            element={
              <PermissionRoute>
                <DriverManagementPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/customers"
            element={
              <PermissionRoute>
                <CustomersPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/customers/:mobileNumber"
            element={
              <PermissionRoute>
                <CustomerDetailsPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/b2b-customers"
            element={
              <PermissionRoute>
                <B2BCustomersPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/role"
            element={
              <PermissionRoute>
                <RoleAndPermissionPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/role/roleform"
            element={
              <PermissionRoute>
                <AddRolePage />
              </PermissionRoute>
            }
          />
          <Route
            path="/role/editrole/:id"
            element={
              <PermissionRoute>
                <EditRolePage />
              </PermissionRoute>
            }
          />

          <Route
            path="/franchise-role"
            element={
              <PermissionRoute>
                <FranchiseRolePage />
              </PermissionRoute>
            }
          />

          <Route
            path="/franchise-role/roleform"
            element={
              <PermissionRoute>
                <FranchiseAddRolePage />
              </PermissionRoute>
            }
          />

          <Route
            path="/franchise-role/editrole/:id"
            element={
              <PermissionRoute>
                <FranchiseEditRolePage />
              </PermissionRoute>
            }
          />

          <Route
            path="/staff"
            element={
              <PermissionRoute>
                <SubadminAndSupport />
              </PermissionRoute>
            }
          />

          <Route
            path="/franchise-staff"
            element={
              <PermissionRoute>
                <FranchiseStaffListPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/franchise-staff/add"
            element={
              <PermissionRoute>
                <FranchiseAddEditStaffPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/franchise-staff/edit/:id"
            element={
              <PermissionRoute>
                <FranchiseAddEditStaffPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/franchise-staff/:id"
            element={
              <PermissionRoute>
                <FranchiseStaffDetailPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/staff/:id"
            element={
              <PermissionRoute>
                <StaffPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <PermissionRoute>
                <OrdersPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/orders/new"
            element={
              <PermissionRoute>
                <NewOrderPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/orders/bulk"
            element={
              <PermissionRoute>
                <BulkOrderPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/orders/:id"
            element={
              <PermissionRoute>
                <OrderDetailsPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/orders/completed"
            element={
              <PermissionRoute>
                <CompletedOrdersPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/orders/forward"
            element={
              <PermissionRoute>
                <ForwardOrdersPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/orders/forward/:id"
            element={
              <PermissionRoute>
                <ForwardOrderDetailPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/rate-calculator"
            element={
              <PermissionRoute>
                <RateCalculatorPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/service-availability"
            element={
              <PermissionRoute>
                <ServiceAvailabilityPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/wallet"
            element={
              <PermissionRoute>
                <WalletPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/wallet/add"
            element={
              <PermissionRoute>
                <AddMoneyPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/wallet/payment-callback"
            element={
              <PermissionRoute>
                <PaymentCallbackPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/wallet/transactions"
            element={
              <PermissionRoute>
                <TransactionsPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/wallet/recharges"
            element={
              <PermissionRoute>
                <RechargesPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/invoice"
            element={
              <PermissionRoute>
                <InvoicePage />
              </PermissionRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <PermissionRoute>
                <ReportsPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/reports/franchise-wise"
            element={
              <PermissionRoute>
                <FranchiseWiseReportPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/reports/total-orders"
            element={
              <PermissionRoute>
                <TotalOrdersReportPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/reports/total-revenue"
            element={
              <PermissionRoute>
                <TotalRevenueReportPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/reports/delivery-performance"
            element={
              <PermissionRoute>
                <DeliveryPerformanceReportPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/tracking"
            element={
              <PermissionRoute>
                <TrackingPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/payments"
            element={
              <PermissionRoute>
                <PaymentsPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/payments/wallet"
            element={
              <PermissionRoute>
                <WalletPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/payments/revenue"
            element={
              <PermissionRoute>
                <RevenuePage />
              </PermissionRoute>
            }
          />

          <Route
            path="/settings/rate-calculator"
            element={
              <PermissionRoute>
                <SettingsRateCalculatorPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/settings/rate-card"
            element={
              <PermissionRoute>
                <RateCardPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/settings/pincode-serviceability"
            element={
              <PermissionRoute>
                <PincodeServiceabilityPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/settings/rate-card-markup"
            element={
              <PermissionRoute>
                <RateCardMarkupPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/settings/branch-wallet"
            element={
              <PermissionRoute>
                <BranchWalletPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/settings/branch-wallet/:id"
            element={
              <PermissionRoute>
                <BranchWalletDetailsPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/payout"
            element={
              <PermissionRoute>
                <PayoutPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/settings/profit-percentage"
            element={
              <PermissionRoute>
                <ProfitPercentagePage />
              </PermissionRoute>
            }
          />

          <Route
            path="/orders/pickup"
            element={
              <PermissionRoute>
                <PickupRequestsPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/orders/pickup/create"
            element={
              <PermissionRoute>
                <CreatePickupRequestPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/pickup-requests/create"
            element={
              <PermissionRoute>
                <CreatePickupRequestPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/reports/staff-performance"
            element={
              <PermissionRoute>
                <StaffPerformanceReportPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/reports/orders"
            element={
              <PermissionRoute>
                <OrdersReportPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/reports/revenue"
            element={
              <PermissionRoute>
                <RevenueReportPage />
              </PermissionRoute>
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

          <Route
            path="/careers"
            element={
              <PermissionRoute>
                <CareersPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/careers/applications"
            element={
              <PermissionRoute>
                <ApplicationsPage />
              </PermissionRoute>
            }
          />

          </Routes>
        </Suspense>
      </BrowserRouter>
    </Flowbite>
  </ThemeProvider>
)

