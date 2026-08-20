import { FC, useMemo, useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { HiMenu, HiSearch, HiBell, HiChevronDown, HiLogout, HiCurrencyRupee } from "react-icons/hi"
import { useWalletStore } from "../store/walletStore"
import http from "../common/httpRequest"

interface NavbarProps {
  isMobileOpen: boolean
  setIsMobileOpen: (value: boolean) => void
  isSidebarExpanded: boolean
  setIsSidebarExpanded: (value: boolean) => void
}

const Navbar: FC<NavbarProps> = ({
  isMobileOpen,
  setIsMobileOpen,
  isSidebarExpanded,
  setIsSidebarExpanded,
}) => {
  const navigate = useNavigate()
  const [userName, setUserName] = useState("Admin")
  const [userInitial, setUserInitial] = useState("A")
  const [userRole, setUserRole] = useState("Admin")
  const [loginType, setLoginType] = useState("admin")
  const [staffAssignedType, setStaffAssignedType] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [payoutSummary, setPayoutSummary] = useState<{ totalPayoutPaid?: number; totalPayoutDue?: number }>({})
  const dropdownRef = useRef<HTMLDivElement>(null)
  const effectiveLoginType =
    loginType === "staff" && (staffAssignedType === "hub" || staffAssignedType === "franchise" || staffAssignedType === "head_quarter")
      ? staffAssignedType === "head_quarter"
        ? "admin"
        : staffAssignedType
      : loginType

  // Wallet store for franchise users
  const { balance, fetchBalance } = useWalletStore()

  useEffect(() => {
    // Get user data from sessionStorage
    try {
      const profileDataStr = sessionStorage.getItem("profileData")
      if (profileDataStr) {
        const profileData = JSON.parse(profileDataStr)
        // Try to get full name from different possible fields
        let name = ""
        if (profileData.firstName && profileData.lastName) {
          name = `${profileData.firstName} ${profileData.lastName}`
        } else if (profileData.firstName) {
          name = profileData.firstName
        } else if (profileData.name) {
          name = profileData.name
        } else if (profileData.username) {
          name = profileData.username
        } else if (profileData.agencyName) {
          name = profileData.agencyName
        } else {
          name = "Admin"
        }
        setUserName(name)
        setUserInitial(name.charAt(0).toUpperCase())
        setStaffAssignedType(String(profileData?.type || profileData?.data?.type || "").toLowerCase())

        // Get user role from loginType in sessionStorage
        const loginTypeValue = sessionStorage.getItem("loginType") || "admin"
        setLoginType(loginTypeValue)
        if (loginTypeValue) {
          const role =
            loginTypeValue.toLowerCase() === "franchise"
              ? "Agency"
              : loginTypeValue.charAt(0).toUpperCase() + loginTypeValue.slice(1);

          
          setUserRole(role);
        } else {
          setUserRole("Admin");
        }

        // Fetch wallet balance for franchise users
        const assignedType = String(profileData?.type || profileData?.data?.type || "").toLowerCase()
        const effectiveType =
          loginTypeValue === "staff" && (assignedType === "hub" || assignedType === "franchise" || assignedType === "head_quarter")
            ? assignedType === "head_quarter"
              ? "admin"
              : assignedType
            : loginTypeValue
        if (effectiveType === "franchise" || effectiveType === "staff") {
          fetchBalance()
        }

        if (effectiveType === "franchise" || effectiveType === "staff") {
          http.get("/admin/agency/dashboard")
            .then((response) => {
              const overview = response.data?.data?.overview || response.data?.overview || {}
              setPayoutSummary({
                totalPayoutPaid: Number(overview.totalPayoutPaid || 0),
                totalPayoutDue: Number(overview.totalPayoutDue || 0),
              })
            })
            .catch(() => {
              setPayoutSummary({})
            })
        }
      }
    } catch (error) {
      // Profile data parsing failed, use defaults
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Run only on mount

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    sessionStorage.removeItem("authToken")
    sessionStorage.removeItem("profileData")
    navigate("/", { replace: true })
  }

  const searchableRoutes = useMemo(() => {
    const baseRoutes = [
      { keywords: ["dashboard", "overview", "home"], path: "/dashboard" },
      { keywords: ["orders", "order", "bookings", "awb"], path: "/orders" },
      { keywords: ["new order", "create order", "book order"], path: "/orders/new" },
      { keywords: ["staff", "manage staff"], path: "/franchise-staff" },
      { keywords: ["role", "permissions", "role and permission"], path: "/franchise-role" },
      { keywords: ["reports", "report"], path: "/reports" },
      { keywords: ["wallet", "balance"], path: "/wallet" },
      { keywords: ["profile", "account"], path: "/profile" },
      { keywords: ["hubs", "hub"], path: "/hubs" },
      { keywords: ["route", "routes", "shipment route"], path: "/routes" },
      { keywords: ["vehicle", "vehicle management", "vehicles"], path: "/vehicle" },
      { keywords: ["driver", "driver management"], path: "/driver" },
      { keywords: ["parcel booking"], path: "/parcel-booking" },
      { keywords: ["franchise", "agencies"], path: "/agencies" },
      { keywords: ["customers", "customer"], path: "/customers" },
      { keywords: ["b2b customer", "b2b customers"], path: "/b2b-customers" },
      { keywords: ["invoice", "invoices"], path: "/invoice" },
      { keywords: ["tracking", "track"], path: "/tracking" },
      { keywords: ["pickup", "pickup requests"], path: "/pickup-requests" },
      { keywords: ["rate calculator", "rate"], path: "/rate-calculator" },
      { keywords: ["settings", "rate card", "pincode", "serviceability"], path: "/settings/rate-card" },
    ]

    // Franchise/staff users don't use agencies page in their nav
    if (effectiveLoginType === "franchise" || effectiveLoginType === "staff") {
      return baseRoutes.filter((item) => item.path !== "/agencies")
    }

    // Hub users don't use wallet and agencies in their nav
    if (effectiveLoginType === "hub") {
      return baseRoutes.filter((item) => item.path !== "/wallet" && item.path !== "/agencies")
    }

    return baseRoutes
  }, [effectiveLoginType])

  const handleSearchNavigate = () => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return

    const matched = searchableRoutes.find((item) =>
      item.keywords.some((keyword) => keyword.includes(query) || query.includes(keyword))
    )

    if (matched) {
      navigate(matched.path)
      setSearchTerm("")
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-white dark:bg-[#2c2c2c] border-b border-gray-200 dark:border-gray-700">
      <div
        className={`h-full px-4 lg:px-6 flex items-center justify-between transition-all duration-300 ${isSidebarExpanded ? "lg:ml-60" : "lg:ml-16"
          }`}
      >
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Desktop Sidebar Toggle */}
          <button
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="hidden lg:inline-flex p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            aria-label={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
            title={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <HiMenu className="h-6 w-6" />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <HiMenu className="h-6 w-6" />
          </button>

          {/* Search Bar */}
          <div className="relative hidden md:block">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <HiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleSearchNavigate()
                }
              }}
              className="w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Wallet Balance (Franchise) or Notifications (Admin) */}
          {effectiveLoginType === "franchise" || effectiveLoginType === "staff" ? (
            <><div
              onClick={() => navigate("/payout")}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              <HiCurrencyRupee className="h-5 w-5" />
              <span className="font-semibold text-sm">
                Paid: ₹{Number(payoutSummary.totalPayoutPaid || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
              <div
                onClick={() => navigate("/payout")}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <HiCurrencyRupee className="h-5 w-5" />
                <span className="font-semibold text-sm">
                  To Pay: ₹{Number(payoutSummary.totalPayoutDue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                   
                </span>
              </div>
            </>

          ) : (
            <button className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <HiBell className="h-6 w-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          )}

          {/* User Profile */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shadow-md group-hover:shadow-lg transition-shadow">
                {userInitial}
              </div>
              <div className="hidden md:flex flex-col items-start">
                <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">
                  {userName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{userRole}</p>
              </div>
              <HiChevronDown className={`h-5 w-5 text-gray-600 dark:text-gray-300 transition-transform duration-200 ml-2 ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Profile Header */}
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account</p>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-150"
                >
                  <HiLogout className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar

