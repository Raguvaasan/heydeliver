import { FC, useMemo, useState, useEffect } from "react"
import { HiMenu, HiSearch, HiBell, HiChevronDown } from "react-icons/hi"

interface NavbarProps {
  isMobileOpen: boolean
  setIsMobileOpen: (value: boolean) => void
}

const Navbar: FC<NavbarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const [userName, setUserName] = useState("Admin")
  const [userInitial, setUserInitial] = useState("A")

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
      }
    } catch (error) {
      console.error("Error parsing profile data:", error)
    }
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-white dark:bg-[#2c2c2c] border-b border-gray-200 dark:border-gray-700">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between lg:ml-64">
        {/* Left Section */}
        <div className="flex items-center gap-4">
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
              className="w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <HiBell className="h-6 w-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
              {userInitial}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {userName}
              </p>
            </div>
            <HiChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
