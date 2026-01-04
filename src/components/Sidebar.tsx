import { FC } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  HiHome,
  HiOfficeBuilding,
  HiLocationMarker,
  HiCube,
  HiUserGroup,
  HiCog,
  HiChevronDown,
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

  const menuItems: MenuItem[] = [
    {
      title: "Dashboard",
      icon: <HiHome className="h-5 w-5" />,
      path: "/dashboard",
    },
    {
      title: "Agency Management",
      icon: <HiOfficeBuilding className="h-5 w-5" />,
      path: "/agencies",
      submenu: [
        { title: "All Agencies", path: "/agencies" },
        { title: "Add Agency", path: "/agencies/add" },
        { title: "Agency Types", path: "/agencies/types" },
      ],
    },
    {
      title: "Hub Management",
      icon: <HiLocationMarker className="h-5 w-5" />,
      path: "/hubs",
      submenu: [
        { title: "All Hubs", path: "/hubs" },
        { title: "Add Hub", path: "/hubs/add" },
        { title: "Hub Zones", path: "/hubs/zones" },
      ],
    },
    {
      title: "Access Management",
      icon: <HiUserGroup className="h-5 w-5" />,
      path: "/role",
      submenu: [
        { title: "Roles & Permissions", path: "/role" },
        { title: "Staff Management", path: "/staff" },
      ],
    },
    {
      title: "Parcel Management",
      icon: <HiCube className="h-5 w-5" />,
      path: "/parcels",
      submenu: [
        { title: "All Parcels", path: "/parcels" },
        { title: "Track Parcel", path: "/parcels/track" },
        { title: "Bookings", path: "/parcels/bookings" },
      ],
    },
    {
      title: "Settings",
      icon: <HiCog className="h-5 w-5" />,
      path: "/settings",
      submenu: [
        { title: "General", path: "/settings/general" },
        { title: "Profile", path: "/settings/profile" },
        { title: "Security", path: "/settings/security" },
      ],
    },
  ]

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/")
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
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-yellow-500 font-bold text-xl">Hey</span>
                <span className="text-white font-bold text-xl">Deliver</span>
              </div>
            </Link>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <div className="space-y-1">
              {menuItems.map((item, index) => (
                <div key={index}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      isActive(item.path)
                        ? "bg-purple-600 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span className="flex-1 text-sm font-medium">
                      {item.title}
                    </span>
                    {item.submenu && (
                      <HiChevronDown className="h-4 w-4 flex-shrink-0" />
                    )}
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>

                  {/* Submenu - Show when active */}
                  {item.submenu && isActive(item.path) && (
                    <div className="ml-11 mt-1 space-y-1">
                      {item.submenu.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          to={subItem.path}
                          className={`block px-3 py-2 text-sm rounded-lg transition-all ${
                            location.pathname === subItem.path
                              ? "text-purple-400 font-medium"
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
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                RA
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Robert Allen</p>
                <p className="text-xs text-gray-400">Admin</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
