import { FC, useState, useMemo } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  HiHome,
  HiOfficeBuilding,
  HiMap,
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
  HiTruck,
  HiUserCircle,
  HiCube,
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
  const roleName = profileData?.role?.roleName?.toLowerCase() || ""
  const isAdmin = userRole === "admin" || userRole === "super admin"
  const isCollectionAgencyUser =
    loginType === "agency" ||
    loginType === "collection-agency" ||
    loginType === "collectionagency" ||
    userRole === "collection agency" ||
    userRole === "collection-agency" ||
    roleName === "collection agency" ||
    roleName === "collection-agency"
  const staffAssignedType = String(
    profileData?.type ||
    profileData?.data?.type ||
    ""
  ).toLowerCase()
  // loginType is already the effective type (franchise staff → "franchise", hub staff → "hub", HQ staff → "admin")
  const effectiveLoginType = loginType
  // Detect staff users: check the isStaffLogin flag OR detect from profile data
  // (profileData.type indicates staff assigned to franchise/hub/head_quarter)
  const isStaffUser = (() => {
    if (sessionStorage.getItem("isStaffLogin") === "true") return true
    // Fallback: if profileData has a "type" field (franchise/hub/head_quarter), it's a staff user
    // Regular franchise/hub logins don't have a "type" field
    const staffType = String(
      profileData?.type || profileData?.data?.type || ""
    ).toLowerCase()
    if (staffType === "franchise" || staffType === "hub" || staffType === "head_quarter") {
      return true
    }
    return false
  })()

  /**
   * Extract permissions array from profile data.
   * The staff login API may return permissions at various paths depending on
   * whether the role is populated or just an ID. We check all known locations.
   */
  const extractPermissions = (profile: any): any[] => {
    if (!profile) return []

    // Try all known paths where permissions might exist
    const candidates = [
      // Populated roleId object (backend populates roleId with full role data)
      profile?.roleId?.permissions,
      profile?.data?.roleId?.permissions,
      // Populated role object
      profile?.role?.permissions,
      profile?.data?.role?.permissions,
      // Separate roleinfo field
      profile?.roleinfo?.permissions,
      profile?.data?.roleinfo?.permissions,
      // roleInfo with capital I
      profile?.roleInfo?.permissions,
      profile?.data?.roleInfo?.permissions,
      // Permissions directly on profile
      profile?.permissions,
      profile?.data?.permissions,
    ]

    for (const perms of candidates) {
      if (Array.isArray(perms) && perms.length > 0) {
        return perms
      }
    }

    return []
  }

  const staffPermissions = extractPermissions(profileData)
  const isRootUser =
    profileData?.roleId?.isRoot === true ||
    profileData?.data?.roleId?.isRoot === true ||
    profileData?.role?.isRoot === true ||
    profileData?.data?.role?.isRoot === true ||
    profileData?.roleinfo?.isRoot === true ||
    profileData?.data?.roleinfo?.isRoot === true

  // Debug: log permissions data to help diagnose issues (remove after confirmed working)
  if (isStaffUser && staffPermissions.length === 0) {
    console.warn(
      "[Sidebar] Staff user has 0 permissions. profileData keys:",
      profileData ? Object.keys(profileData) : "null",
      "| role type:", typeof profileData?.role,
      "| role:", profileData?.role,
      "| roleinfo:", profileData?.roleinfo,
      "| data keys:", profileData?.data ? Object.keys(profileData.data) : "N/A"
    )
  }
  if (isStaffUser) {
    console.log("[Sidebar] Staff permissions:", staffPermissions)
  }

  /**
   * Check if staff has access to a module by exact module name.
   * The API stores permissions as: { module: "Orders", read: true, write: false, update: true, delete: false }
   * We match against the exact module names from franchiseRoleModules / adminRoleModules.
   */
  const hasStaffModuleAccess = (exactModuleNames: string[]) => {
    if (!isStaffUser) return true
    if (isRootUser) return true
    if (!Array.isArray(staffPermissions) || staffPermissions.length === 0) {
      return false
    }

    return staffPermissions.some((perm: any) => {
      // Get the module name — API format uses "module", UI format uses "moduleName"
      const moduleName = String(
        perm?.module || perm?.moduleName || perm?.name || ""
      ).trim().toLowerCase()
      if (!moduleName) return false

      // Match against exact module names (case-insensitive)
      const matchesModule = exactModuleNames.some(
        (name) => name.toLowerCase() === moduleName
      )
      if (!matchesModule) return false

      // Check if any CRUD action is granted
      // API format: read/write/update/delete (flat on perm)
      // UI format: permission.view/add/edit/delete (nested)
      const hasAnyAccess =
        perm?.read === true ||
        perm?.write === true ||
        perm?.update === true ||
        perm?.delete === true ||
        perm?.permission?.view === true ||
        perm?.permission?.read === true ||
        perm?.permission?.add === true ||
        perm?.permission?.write === true ||
        perm?.permission?.edit === true ||
        perm?.permission?.update === true ||
        perm?.permission?.delete === true

      return hasAnyAccess
    })
  }

  /**
   * Check if staff has a specific action permission on a module.
   * action: "read" | "write" | "update" | "delete"
   */
  const hasStaffActionAccess = (moduleName: string, action: "read" | "write" | "update" | "delete") => {
    if (!isStaffUser) return true
    if (isRootUser) return true
    if (!Array.isArray(staffPermissions) || staffPermissions.length === 0) return false

    return staffPermissions.some((perm: any) => {
      const name = String(perm?.module || perm?.moduleName || "").trim().toLowerCase()
      if (name !== moduleName.toLowerCase()) return false

      // Check flat API format and nested UI format
      const actionMap: Record<string, string[]> = {
        read: ["read", "view"],
        write: ["write", "add"],
        update: ["update", "edit"],
        delete: ["delete"],
      }
      const keys = actionMap[action] || [action]
      return keys.some((k) => perm?.[k] === true || perm?.permission?.[k] === true)
    })
  }
  
  // Admin menu items
  const adminMenuItems: MenuItem[] = [
    {
      title: "Dashboard",
      icon: <HiHome className="h-5 w-5" />,
      path: "/dashboard",
    },
    {
      title: "Agency",
      icon: <HiOfficeBuilding className="h-5 w-5" />,
      path: "/agencies",
    },
    // {
    //   title: "Collection Agency",
    //   icon: <HiOfficeBuilding className="h-5 w-5" />,
    //   path: "/collection-agencies",
    // },
    {
      title: "Hub",
      icon: <HiOfficeBuilding className="h-5 w-5" />,
      path: "/hubs",
    },
    {
      title: "Route",
      icon: <HiMap className="h-5 w-5" />,
      path: "/routes",
    },
    {
      title: "Orders",
      icon: <HiCube className="h-5 w-5" />,
      path: "/parcel-booking",
    },
    {
      title: "Vehicle",
      icon: <HiTruck className="h-5 w-5" />,
      path: "/vehicle",
    },
     {
      title: "Driver",
      icon: <HiUser className="h-5 w-5" />,
      path: "/driver",
    },
    {
      title: "Customers",
      icon: <HiUserGroup className="h-5 w-5" />,
      path: "/customers",
    },
    // {
    //   title: "B2B Customer",
    //   icon: <HiUserGroup className="h-5 w-5" />,
    //   path: "/b2b-customers",
    // },
    {
      title: "Access Management",
      icon: <HiUserGroup className="h-5 w-5" />,
      path: "/access",
      submenu: [
        { title: "Manage Staffs", path: "/staff" },
        { title: "Role & Permissions", path: "/role" },
      ],
    },
    // {
    //   title: "Orders",
    //   icon: <HiShoppingCart className="h-5 w-5" />,
    //   path: "/orders",
    //   submenu: [
    //     { title: "All Orders", path: "/orders" },
    //   ],
    // },
    // {
    //   title: "Payments",
    //   icon: <HiCreditCard className="h-5 w-5" />,
    //   path: "/payments",
    //   submenu: [
    //     { title: "Wallet Transactions", path: "/wallet/transactions" },
    //     { title: "Revenue", path: "/payments/revenue" },
    //     // { title: "Invoices", path: "/invoice" },
    //   ],
    // },
    // {
    //   title: "Reports",
    //   icon: <HiChartBar className="h-5 w-5" />,
    //   path: "/reports",
    //   submenu: [
    //     { title: "Franchise wise", path: "/reports/franchise-wise" },
    //     { title: "Total orders", path: "/reports/total-orders" },
    //     { title: "Total Revenue", path: "/reports/total-revenue" },
    //     // { title: "Delivery Performance", path: "/reports/delivery-performance" },
    //   ],
    // },
    // {
    //   title: "Tracking",
    //   icon: <HiLocationMarker className="h-5 w-5" />,
    //   path: "/tracking",
    // },
    {
      title: "Settings",
      icon: <HiCog className="h-5 w-5" />,
      path: "/settings",
      submenu: [
        { title: "Wallet", path: "/settings/branch-wallet" },
        { title: "Profit Percentage", path: "/settings/profit-percentage" },
        // { title: "Rate Calculator", path: "/settings/rate-calculator" },
        // { title: "Rate Calculator Setup", path: "/rate-calculator" },
        // { title: "Pincode Serviceability", path: "/settings/pincode-serviceability" },
        // { title: "Rate Card", path: "/settings/rate-card" },
        // { title: "Rate Card Markup", path: "/settings/rate-card-markup" },
      ],
    },
    {
      title: "Careers",
      icon: <HiDocumentText className="h-5 w-5" />,
      path: "/careers",
      submenu: [
        { title: "Job Postings", path: "/careers" },
        { title: "Applications", path: "/careers/applications" },
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
    // {
    //   title: "Orders",
    //   icon: <HiShoppingCart className="h-5 w-5" />,
    //   path: "/orders",
    //   submenu: [
    //     { title: "New Order", path: "/orders/new" },
    //     { title: "All Orders", path: "/orders" },
    //   ],
    // },
    {
      title: "Staffs",
      icon: <HiUserGroup className="h-5 w-5" />,
      path: "/staffs-management",
      submenu: [
        { title: "Manage Staffs", path: "/franchise-staff" },
        { title: "Role & Permissions", path: "/franchise-role" },
      ],
    },
    // {
    //   title: "Rate Calculator",
    //   icon: <HiChartBar className="h-5 w-5" />,
    //   path: "/rate-calculator",
    // },
    // {
    //   title: "Service Availability Check",
    //   icon: <HiCog className="h-5 w-5" />,
    //   path: "/service-availability",
    // },
    // {
    //   title: "Tracking",
    //   icon: <HiLocationMarker className="h-5 w-5" />,
    //   path: "/tracking",
    // },
    {
      title: "Orders",
      icon: <HiCube className="h-5 w-5" />,
      path: "/parcel-booking",
      submenu: [
        { title: "Parcel Booking", path: "/parcel-booking" },
        { title: "Inward Orders", path: "/parcel-booking/inward" },
        { title: "Outward Orders", path: "/parcel-booking/outward" },
      ],
    },
    {
      title: "Payout",
      icon: <HiCurrencyRupee className="h-5 w-5" />,
      path: "/payout",
    },
    // {
    //   title: "Wallet",
    //   icon: <HiCurrencyRupee className="h-5 w-5" />,
    //   path: "/wallet",
    //   submenu: isAdmin 
    //     ? [{ title: "Transaction details", path: "/wallet" }]
    //     : [
    //         { title: "Add Money", path: "/wallet/add" },
    //         { title: "Transaction details", path: "/wallet" },
    //       ],
    // },
    // {
    //   title: "Invoice",
    //   icon: <HiDocumentText className="h-5 w-5" />,
    //   path: "/invoice",
    // },
    // {
    //   title: "Reports",
    //   icon: <HiChartBar className="h-5 w-5" />,
    //   path: "/reports",
    //   submenu: [
    //     { title: "Staffs Performance", path: "/reports/staff-performance" },
    //     { title: "Orders (Day Wise / Weekly / Custom Date)", path: "/reports/orders" },
    //     { title: "Revenue (Day Wise / Weekly / Custom Date)", path: "/reports/revenue" },
    //   ],
    // },
    {
      title: "Profile",
      icon: <HiUser className="h-5 w-5" />,
      path: "/profile",
    },
  ]

  // Staff menu items (filtered by role permissions) for franchise/hub staff
  // Module names must EXACTLY match what's in franchiseRoleModules (roleModules.ts) / the role permission API
  const staffMenuItems: MenuItem[] = franchiseMenuItems
    .map((item) => {
      if (item.title === "Dashboard" || item.title === "Profile") return item

      if (item.title === "Orders") {
        if (!hasStaffModuleAccess(["Orders"])) return null
        const filteredSubmenu = (item.submenu || []).filter((sub) => {
          if (sub.path === "/orders/new") return hasStaffActionAccess("Orders", "write")
          if (sub.path === "/orders") return hasStaffActionAccess("Orders", "read")
          return true
        })
        if (filteredSubmenu.length === 0) return null
        return { ...item, submenu: filteredSubmenu }
      }

      if (item.title === "Staffs") {
        const canStaff = hasStaffModuleAccess(["Manage Staffs"])
        const canRole = hasStaffModuleAccess(["Role & Permissions"])
        if (!canStaff && !canRole) return null
        const filteredSubmenu = (item.submenu || []).filter((sub) => {
          if (sub.path === "/franchise-staff") return canStaff
          if (sub.path === "/franchise-role") return canRole
          return false
        })
        if (filteredSubmenu.length === 0) return null
        return { ...item, submenu: filteredSubmenu }
      }

      if (item.title === "Rate Calculator") {
        return hasStaffModuleAccess(["Rate Calculator"]) ? item : null
      }

      if (item.title === "Service Availability Check") {
        return hasStaffModuleAccess(["Service Availability Check"]) ? item : null
      }

      if (item.title === "Tracking") {
        return hasStaffModuleAccess(["Tracking"]) ? item : null
      }

      if (item.title === "Wallet") {
        if (!hasStaffModuleAccess(["Wallet"])) return null
        const filteredSubmenu = (item.submenu || []).filter((sub) => {
          if (sub.path === "/wallet/add") return hasStaffActionAccess("Wallet", "write")
          if (sub.path === "/wallet") return hasStaffActionAccess("Wallet", "read")
          return true
        })
        if (filteredSubmenu.length === 0) return null
        return { ...item, submenu: filteredSubmenu }
      }

      if (item.title === "Reports") {
        return hasStaffModuleAccess(["Reports"]) ? item : null
      }

      return item
    })
    .filter(Boolean) as MenuItem[]

  // Admin staff menu items (filtered by role permissions for head_quarter staff)
  // Module names must EXACTLY match what's in adminRoleModules (roleModules.ts)
  const adminStaffMenuItems: MenuItem[] = adminMenuItems
    .map((item) => {
      if (item.title === "Dashboard") return item

      if (item.title === "Agency") {
        return hasStaffModuleAccess(["Franchise"]) ? item : null
      }

      if (item.title === "Collection Agency") {
        return hasStaffModuleAccess(["Collection Agency"]) ? item : null
      }

      if (item.title === "Hub") {
        return hasStaffModuleAccess(["Hub"]) ? item : null
      }

      if (item.title === "Route") {
        return hasStaffModuleAccess(["Route"]) ? item : null
      }

      if (item.title === "Parcel Booking") {
        return hasStaffModuleAccess(["Parcel Booking"]) ? item : null
      }

      if (item.title === "Vehicle") {
        return hasStaffModuleAccess(["Vehicle"]) ? item : null
      }

      if (item.title === "Driver") {
        return hasStaffModuleAccess(["Driver"]) ? item : null
      }

      if (item.title === "Customers") {
        return hasStaffModuleAccess(["Customers"]) ? item : null
      }

      if (item.title === "B2B Customer") {
        return hasStaffModuleAccess(["Customers"]) ? item : null
      }

      if (item.title === "Access Management") {
        if (!hasStaffModuleAccess(["Access Management"])) return null
        const filteredSubmenu = (item.submenu || []).filter((sub) => {
          if (sub.path === "/staff") return hasStaffActionAccess("Access Management", "read")
          if (sub.path === "/role") return hasStaffActionAccess("Access Management", "read")
          return true
        })
        if (filteredSubmenu.length === 0) return null
        return { ...item, submenu: filteredSubmenu }
      }

      if (item.title === "Orders") {
        return hasStaffModuleAccess(["Orders"]) ? item : null
      }

      if (item.title === "Payments") {
        if (!hasStaffModuleAccess(["Payments"])) return null
        const filteredSubmenu = (item.submenu || []).filter((sub) => {
          if (sub.path === "/wallet/transactions") return hasStaffActionAccess("Payments", "read")
          if (sub.path === "/payments/revenue") return hasStaffActionAccess("Payments", "read")
          return true
        })
        if (filteredSubmenu.length === 0) return null
        return { ...item, submenu: filteredSubmenu }
      }

      if (item.title === "Tracking") {
        return hasStaffModuleAccess(["Tracking"]) ? item : null
      }

      if (item.title === "Settings") {
        if (!hasStaffModuleAccess(["Settings"])) return null
        const filteredSubmenu = (item.submenu || []).filter((sub) => {
          if (sub.path === "/settings/branch-wallet") return hasStaffActionAccess("Settings", "read")
          if (sub.path === "/rate-calculator") return hasStaffActionAccess("Settings", "write")
          return hasStaffActionAccess("Settings", "read")
        })
        if (filteredSubmenu.length === 0) return null
        return { ...item, submenu: filteredSubmenu }
      }

      if (item.title === "Careers") {
        if (!hasStaffModuleAccess(["Careers"])) return null
        const filteredSubmenu = (item.submenu || []).filter((sub) => {
          if (sub.path === "/careers/applications") return hasStaffActionAccess("Careers", "read")
          if (sub.path === "/careers") return hasStaffActionAccess("Careers", "read")
          return true
        })
        if (filteredSubmenu.length === 0) return null
        return { ...item, submenu: filteredSubmenu }
      }

      return item
    })
    .filter(Boolean) as MenuItem[]

  // Hub menu items (franchise items without Wallet / Reports / restricted tools)
  const hubMenuItems: MenuItem[] = franchiseMenuItems
    .filter(
      (item) =>
        item.title !== "Wallet" &&
        item.title !== "Reports" &&
        item.title !== "Rate Calculator" &&
        item.title !== "Service Availability Check" &&
        item.title !== "Tracking"
    )

  const agencyStaffMenuItems: MenuItem[] = isStaffUser && effectiveLoginType === "franchise"
    ? franchiseMenuItems
        .map((item) => {
          if (item.title !== "Orders") return item
          return item
        })
        .filter(Boolean) as MenuItem[]
    : franchiseMenuItems

  const agencyMenuItems: MenuItem[] = [
    {
      title: "Dashboard",
      icon: <HiHome className="h-5 w-5" />,
      path: "/dashboard",
    },
    {
      title: "Payout",
      icon: <HiCurrencyRupee className="h-5 w-5" />,
      path: "/payout",
    },
    {
      title: "Profile",
      icon: <HiUser className="h-5 w-5" />,
      path: "/profile",
    },
  ]

  // Select menu items based on login type
  const menuItems = isStaffUser && !isRootUser
    ? effectiveLoginType === "admin"
      ? adminStaffMenuItems
      : effectiveLoginType === "hub"
      ? hubMenuItems.map((item) => {
          if (item.title === "Dashboard" || item.title === "Profile") return item

          if (item.title === "Orders") {
            if (!hasStaffModuleAccess(["Orders"])) return null
            const filteredSubmenu = (item.submenu || []).filter((sub) => {
              if (sub.path === "/orders/new") return hasStaffActionAccess("Orders", "write")
              if (sub.path === "/orders") return hasStaffActionAccess("Orders", "read")
              return true
            })
            if (filteredSubmenu.length === 0) return null
            return { ...item, submenu: filteredSubmenu }
          }

          if (item.title === "Staffs") {
            const canStaff = hasStaffModuleAccess(["Manage Staffs"])
            const canRole = hasStaffModuleAccess(["Role & Permissions"])
            if (!canStaff && !canRole) return null
            const filteredSubmenu = (item.submenu || []).filter((sub) => {
              if (sub.path === "/franchise-staff") return canStaff
              if (sub.path === "/franchise-role") return canRole
              return false
            })
            if (filteredSubmenu.length === 0) return null
            return { ...item, submenu: filteredSubmenu }
          }

          if (item.title === "Rate Calculator") return hasStaffModuleAccess(["Rate Calculator"]) ? item : null
          if (item.title === "Service Availability Check") return hasStaffModuleAccess(["Service Availability Check"]) ? item : null
          if (item.title === "Tracking") return hasStaffModuleAccess(["Tracking"]) ? item : null
          return item
        }).filter(Boolean) as MenuItem[]
      : staffMenuItems
    : effectiveLoginType === "franchise"
    ? agencyStaffMenuItems
    : isCollectionAgencyUser
    ? agencyMenuItems
    : effectiveLoginType === "agency"
    ? agencyMenuItems
    : effectiveLoginType === "hub"
    ? hubMenuItems
    : effectiveLoginType === "admin"
    ? adminMenuItems
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
    return openMenus.includes(menuTitle)
  }

  const handleLogout = () => {
    sessionStorage.removeItem("authToken")
    sessionStorage.removeItem("profileData")
    sessionStorage.removeItem("isStaffLogin")
    sessionStorage.removeItem("loginType")
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
        <div className="h-full bg-white text-black dark:bg-[#1a1a1a] dark:text-white flex flex-col">
          {/* Logo Section */}
          <div className={`h-16 flex items-center border-b border-gray-200 dark:border-gray-700 ${isExpanded ? "justify-between px-4" : "justify-center px-2"}`}>
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="flex items-center">
                {isExpanded ? (
                  <>
                    <span className="text-yellow-300 font-bold text-xl">TRUE</span>
                    <span className="text-red-700 font-bold text-xl">CARGO</span>
                  </>
                ) : (
                  <span className="text-orange-500 font-bold text-lg">TC</span>
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
                          : "text-black hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
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
                          : "text-black hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
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
                              : "text-gray-700 hover:text-black hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
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
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
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
                  <p className="text-xs font-medium text-black dark:text-white truncate">
                    {(() => {
                      try {
                        const profileData = JSON.parse(sessionStorage.getItem("profileData") || "{}")
                        return profileData.data?.username || profileData.data?.email || profileData.username || profileData.email || profileData.data?.name || profileData.data?.agencyName || profileData.name || "User"
                      } catch {
                        return "User"
                      }
                    })()}
                  </p>
                  <p className="text-[10px] text-gray-600 dark:text-gray-400 capitalize">
                     {loginType.toLowerCase() === "franchise"
                    ? "Agency"
    : loginType.charAt(0).toUpperCase() + loginType.slice(1)}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs text-black hover:text-black bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:hover:text-white dark:bg-gray-700 dark:hover:bg-gray-600 rounded transition-colors ${isExpanded ? "" : "px-0"}`}
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

