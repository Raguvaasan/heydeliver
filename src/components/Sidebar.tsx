import { FC, useState, useMemo } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  HiHome,
  HiOfficeBuilding,
  HiShoppingCart,
  HiCreditCard,
  HiChartBar,
  HiLocationMarker,
  HiUserGroup,
  HiCog,
  HiChevronDown,
  HiLogout,
  HiCurrencyRupee,
  HiUser,
  HiDocumentText,
} from "react-icons/hi"

interface SidebarProps {
  isExpanded: boolean
  setIsExpanded: (value: boolean) => void
  isMobileOpen: boolean
  setIsMobileOpen: (value: boolean) => void
}

interface MenuItem {
  title: string
  icon: React.ReactNode
  path: string
  badge?: string
  submenu?: { title: string; path: string }[]
}

const Sidebar: FC<SidebarProps> = ({
  isExpanded,
  setIsExpanded,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [openMenus, setOpenMenus] = useState<string[]>([])
  
  // Get login type from session storage
  const loginType = sessionStorage.getItem("loginType") || "admin"
  
  // Get user role to determine if admin
  const getProfileData = () => {
    try {
      const profileData = sessionStorage.getItem("profileData")
      return profileData ? JSON.parse(profileData) : null
    } catch (error) {
      return null
    }
  }

  const profileData = getProfileData()
  const userRole = profileData?.role?.name?.toLowerCase() || ""
  const isAdmin = userRole === "admin" || userRole === "super admin"
  
  // Admin menu items
  const adminMenuItems: MenuItem[] = [
    {
      title: "Dashboard",
      icon: <HiHome className="h-5 w-5" />,
      path: "/dashboard",
    },
    {
      title: "Franchise",
      icon: <HiOfficeBuilding className="h-5 w-5" />,
      path: "/agencies",
    },
    {
      title: "Access Management",
      icon: <HiUserGroup className="h-5 w-5" />,
      path: "/access",
      submenu: [
        { title: "Manage Staffs", path: "/staff" },
        { title: "Role & Permissions", path: "/role" },
      ],
    },
    {
      title: "Orders",
      icon: <HiShoppingCart className="h-5 w-5" />,
      path: "/orders",
      submenu: [
        { title: "Completed Orders", path: "/orders/completed" },
        { title: "Forward Orders", path: "/orders/forward" },
        { title: "Pickup Requests", path: "/orders/pickup" },
      ],
    },
    {
      title: "Payments",
      icon: <HiCreditCard className="h-5 w-5" />,
      path: "/payments",
      submenu: [
        { title: "Wallet Transactions", path: "/payments/wallet" },
        { title: "Invoices", path: "/invoice" },
      ],
    },
    {
      title: "Reports",
      icon: <HiChartBar className="h-5 w-5" />,
      path: "/reports",
      submenu: [
        { title: "Franchise wise", path: "/reports/franchise-wise" },
        { title: "Total orders", path: "/reports/total-orders" },
        { title: "Total Revenue", path: "/reports/total-revenue" },
        { title: "Delivery Performance", path: "/reports/delivery-performance" },
      ],
    },
    {
      title: "Tracking",
      icon: <HiLocationMarker className="h-5 w-5" />,
      path: "/tracking",
    },
    {
      title: "Settings",
      icon: <HiCog className="h-5 w-5" />,
      path: "/settings",
      submenu: [
        { title: "Rate Calculator Setup", path: "/rate-calculator" },
        { title: "Pincode Serviceability", path: "/settings/pincode-serviceability" },
        { title: "Rate Card", path: "/settings/rate-card" },
        { title: "Rate Card Markup", path: "/settings/rate-card-markup" },
      ],
    },
  ]

  // Franchise menu items
  const franchiseMenuItems: MenuItem[] = [
    {
      title: "Dashboard",
      icon: <HiHome className="h-5 w-5" />,
      path: "/dashboard",
    },
    {
      title: "Orders",
      icon: <HiShoppingCart className="h-5 w-5" />,
      path: "/orders",
      submenu: [
        { title: "New Order", path: "/orders/new" },
        { title: "Pending Orders", path: "/orders" },
        { title: "Active Orders", path: "/orders/pickup" },
      ],
    },
    {
      title: "Staffs",
      icon: <HiUserGroup className="h-5 w-5" />,
      path: "/staffs-management",
      submenu: [
        { title: "Manage Staffs", path: "/franchise-staff" },
        { title: "Role & Permissions", path: "/franchise-role" },
      ],
    },
    {
      title: "Rate Calculator",
      icon: <HiChartBar className="h-5 w-5" />,
      path: "/rate-calculator",
    },
    {
      title: "Service Availability Check",
      icon: <HiCog className="h-5 w-5" />,
      path: "/service-availability",
    },
    {
      title: "Tracking",
      icon: <HiLocationMarker className="h-5 w-5" />,
      path: "/tracking",
    },
    {
      title: "Wallet",
      icon: <HiCurrencyRupee className="h-5 w-5" />,
      path: "/wallet",
      submenu: isAdmin 
        ? [{ title: "Transaction details", path: "/wallet" }]
        : [
            { title: "Add Money", path: "/wallet/add" },
            { title: "Transaction details", path: "/wallet" },
          ],
    },
    {
      title: "Invoice",
      icon: <HiDocumentText className="h-5 w-5" />,
      path: "/invoice",
    },
    {
      title: "Reports",
      icon: <HiChartBar className="h-5 w-5" />,
      path: "/reports",
      submenu: [
        { title: "Staffs Performance", path: "/reports/staff-performance" },
        { title: "Orders (Day Wise / Weekly / Custom Date)", path: "/reports/orders" },
        { title: "Revenue (Day Wise / Weekly / Custom Date)", path: "/reports/revenue" },
      ],
    },
    {
      title: "Profile",
      icon: <HiUser className="h-5 w-5" />,
      path: "/profile",
    },
  ]

  // Staff menu items (similar to franchise)
  const staffMenuItems: MenuItem[] = franchiseMenuItems

  // Select menu items based on login type
  const menuItems = loginType === "franchise" || loginType === "staff" 
    ? franchiseMenuItems 
    : adminMenuItems

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/")
  }

  const toggleMenu = (menuTitle: string) => {
    if (!isExpanded) {
      setIsExpanded(true)
      return
    }

    setOpenMenus((prev) =>
      prev.includes(menuTitle)
        ? prev.filter((title) => title !== menuTitle)
        : [...prev, menuTitle]
    )
  }

  const isMenuOpen = (menuTitle: string) => {
    const menuItem = menuItems.find(item => item.title === menuTitle)
    
    // Check if manually opened
    if (openMenus.includes(menuTitle)) return true
    
    // Check if main menu path is active
    if (isActive(menuItem?.path || "")) return true
    
    // Check if any submenu path is active (auto-expand parent)
    if (menuItem?.submenu) {
      return menuItem.submenu.some(subItem => location.pathname === subItem.path || location.pathname.startsWith(subItem.path + "/"))
    }
    
    return false
  }

  const handleLogout = () => {
    sessionStorage.removeItem("authToken")
    sessionStorage.removeItem("profileData")
    navigate("/", { replace: true })
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen transition-transform duration-300 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${isExpanded ? "w-64" : "w-20"}`}
      >
        <div className="h-full bg-[#2c2c2c] dark:bg-[#1a1a1a] flex flex-col">
          {/* Logo Section */}
          <div className={`h-16 flex items-center border-b border-gray-700 ${isExpanded ? "justify-between px-4" : "justify-center px-2"}`}>
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="flex items-center">
                {isExpanded ? (
                  <>
                    <span className="text-yellow-500 font-bold text-xl">Hey</span>
                    <span className="text-white font-bold text-xl">Deliver</span>
                  </>
                ) : (
                  <span className="text-white font-bold text-lg">HD</span>
                )}
              </div>
            </Link>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 [scrollbar-width:thin] [scrollbar-color:#64748b_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-500/70 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400/80">
            <div className="space-y-1">
              {menuItems.map((item, index) => (
                <div key={index}>
                  {item.submenu ? (
                    // Menu item with submenu - use button instead of Link
                    <button
                      onClick={() => toggleMenu(item.title)}
                      className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all ${
                        isActive(item.path)
                          ? "bg-orange-500 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      } ${isExpanded ? "gap-3" : "justify-center"}`}
                      title={!isExpanded ? item.title : undefined}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      {isExpanded && (
                        <>
                          <span className="flex-1 text-left text-sm font-medium">
                            {item.title}
                          </span>
                          <HiChevronDown
                            className={`h-4 w-4 flex-shrink-0 transition-transform ${
                              isMenuOpen(item.title) ? "rotate-180" : ""
                            }`}
                          />
                          {item.badge && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  ) : (
                    // Menu item without submenu - use Link
                    <Link
                      to={item.path}
                      className={`flex items-center px-3 py-2.5 rounded-lg transition-all ${
                        isActive(item.path)
                          ? "bg-orange-500 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      } ${isExpanded ? "gap-3" : "justify-center"}`}
                      onClick={() => setIsMobileOpen(false)}
                      title={!isExpanded ? item.title : undefined}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      {isExpanded && (
                        <>
                          <span className="flex-1 text-sm font-medium">
                            {item.title}
                          </span>
                          {item.badge && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  )}

                  {/* Submenu - Show when open */}
                  {isExpanded && item.submenu && isMenuOpen(item.title) && (
                    <div className="ml-11 mt-1 space-y-1">
                      {item.submenu.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          to={subItem.path}
                          className={`block px-3 py-2 text-sm rounded-lg transition-all ${
                            location.pathname === subItem.path
                              ? "text-orange-400 font-medium"
                              : "text-gray-400 hover:text-white hover:bg-gray-700"
                          }`}
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* User Profile Section */}
          <div className="p-3 border-t border-gray-700">
            <div className={`flex items-center mb-2 ${isExpanded ? "gap-2" : "justify-center"}`}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                {(() => {
                  try {
                    const profileData = JSON.parse(sessionStorage.getItem("profileData") || "{}")
                    const displayName = profileData.data?.username || profileData.data?.email || profileData.username || profileData.email || profileData.data?.name || profileData.data?.agencyName || profileData.name || "User"
                    return displayName.charAt(0).toUpperCase()
                  } catch {
                    return "U"
                  }
                })()}
              </div>
              {isExpanded && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">
                    {(() => {
                      try {
                        const profileData = JSON.parse(sessionStorage.getItem("profileData") || "{}")
                        return profileData.data?.username || profileData.data?.email || profileData.username || profileData.email || profileData.data?.name || profileData.data?.agencyName || profileData.name || "User"
                      } catch {
                        return "User"
                      }
                    })()}
                  </p>
                  <p className="text-[10px] text-gray-400 capitalize">
                    {loginType}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded transition-colors ${isExpanded ? "" : "px-0"}`}
              title={!isExpanded ? "Logout" : undefined}
            >
              <HiLogout className="h-3.5 w-3.5" />
              {isExpanded && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
