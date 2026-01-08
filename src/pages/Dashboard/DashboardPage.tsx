import { FC } from "react"
import { Card } from "flowbite-react"
import {
  HiTruck,
  HiCube,
  HiCurrencyRupee,
  HiLocationMarker,
  HiOfficeBuilding,
} from "react-icons/hi"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: string | number
  subtitle?: string
  percentage?: string
  iconBgColor: string
}

const StatCard: FC<StatCardProps> = ({
  icon,
  title,
  value,
  subtitle,
  percentage,
  iconBgColor,
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`p-2 rounded-lg ${iconBgColor} text-white flex items-center justify-center`}
            >
              {icon}
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {value}
          </h3>
          {subtitle && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{subtitle}</span>
              {percentage && (
                <span
                  className={`font-medium ${
                    percentage.includes("+")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {percentage}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

const DashboardPage: FC = () => {
  // Sample data - replace with actual API calls
  const stats = [
    {
      icon: <HiTruck className="h-5 w-5" />,
      title: "Active Shipments",
      value: "350",
      subtitle: "In Transit 183 | Out for Delivery 167",
      iconBgColor: "bg-purple-500",
    },
    {
      icon: <HiCube className="h-5 w-5" />,
      title: "Total Shipments",
      value: "2775",
      subtitle: "₹100k this week",
      iconBgColor: "bg-orange-500",
    },
    {
      icon: <HiCurrencyRupee className="h-5 w-5" />,
      title: "Revenue Generated",
      value: "₹8,25,480",
      subtitle: "Monthly ₹6,99,250",
      iconBgColor: "bg-yellow-500",
    },
    // {
    //   icon: <HiLocationMarker className="h-5 w-5" />,
    //   title: "Active Hubs",
    //   value: "15",
    //   subtitle: "Inactive 2",
    //   iconBgColor: "bg-pink-500",
    // },
    {
      icon: <HiOfficeBuilding className="h-5 w-5" />,
      title: "Active Agencies",
      value: "65",
      subtitle: "Inactive 1",
      iconBgColor: "bg-blue-500",
    },
  ]

  const recentBookings = [
    {
      id: "HD-245781",
      agency: "SpeedX Express",
      hub: "CHN - S Hub",
      amount: "₹1,250",
      status: "Delivered",
      statusColor: "text-green-600",
    },
    {
      id: "HD-245782",
      agency: "SwiftGo Couriers",
      hub: "CHN - C Hub",
      amount: "₹1,780",
      status: "In Transit",
      statusColor: "text-blue-600",
    },
    {
      id: "HD-245783",
      agency: "QuickShip Logistics",
      hub: "DEL - N Hub",
      amount: "₹2,150",
      status: "Pending",
      statusColor: "text-yellow-600",
    },
    {
      id: "HD-245784",
      agency: "FastTrack Services",
      hub: "MUM - W Hub",
      amount: "₹890",
      status: "Out for Delivery",
      statusColor: "text-purple-600",
    },
  ]

  return (
    <NavbarSidebarLayout>
      <div className="px-4 pt-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Overview
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-6">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              icon={stat.icon}
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              iconBgColor={stat.iconBgColor}
            />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Revenue
              </h3>
              <p className="text-2xl font-bold text-green-600 mt-2">
                ₹58,642
              </p>
            </div>
            <div className="flex gap-2 mb-4">
              <button className="px-3 py-1 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                Day
              </button>
              <button className="px-3 py-1 text-sm rounded-lg bg-purple-600 text-white">
                Week
              </button>
              <button className="px-3 py-1 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                Month
              </button>
              <button className="px-3 py-1 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                Year
              </button>
            </div>
            {/* Revenue Area Chart */}
            <div className="relative h-64">
              <svg
                viewBox="0 0 600 200"
                className="w-full h-full"
                preserveAspectRatio="none"
              >
                {/* Grid lines */}
                <line x1="0" y1="40" x2="600" y2="40" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                <line x1="0" y1="80" x2="600" y2="80" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                <line x1="0" y1="120" x2="600" y2="120" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                <line x1="0" y1="160" x2="600" y2="160" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                
                {/* Y-axis labels */}
                <text x="5" y="15" fontSize="10" fill="#9ca3af">₹100k</text>
                <text x="5" y="55" fontSize="10" fill="#9ca3af">₹80k</text>
                <text x="5" y="95" fontSize="10" fill="#9ca3af">₹60k</text>
                <text x="5" y="135" fontSize="10" fill="#9ca3af">₹40k</text>
                <text x="5" y="175" fontSize="10" fill="#9ca3af">₹20k</text>
                
                {/* Area gradient */}
                <defs>
                  <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fb923c" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#fb923c" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#fef3c7" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                
                {/* Area path */}
                <path
                  d="M 50,150 L 135,140 L 220,100 L 305,60 L 390,90 L 475,70 L 560,50 L 560,200 L 50,200 Z"
                  fill="url(#revenueGradient)"
                  stroke="none"
                />
                
                {/* Line */}
                <path
                  d="M 50,150 L 135,140 L 220,100 L 305,60 L 390,90 L 475,70 L 560,50"
                  fill="none"
                  stroke="#fb923c"
                  strokeWidth="2"
                />
                
                {/* Data point on Thursday */}
                <circle cx="305" cy="60" r="5" fill="#fb923c" stroke="white" strokeWidth="2" />
                
                {/* Tooltip on Thursday */}
                <g>
                  <rect x="295" y="30" width="80" height="25" fill="white" stroke="#e5e7eb" strokeWidth="1" rx="4" />
                  <text x="300" y="42" fontSize="9" fill="#6b7280">Revenue</text>
                  <text x="300" y="52" fontSize="11" fontWeight="bold" fill="#16a34a">₹58,642</text>
                </g>
                
                {/* X-axis labels */}
                <text x="50" y="195" fontSize="11" fill="#6b7280" textAnchor="middle">Mon</text>
                <text x="135" y="195" fontSize="11" fill="#6b7280" textAnchor="middle">Tue</text>
                <text x="220" y="195" fontSize="11" fill="#6b7280" textAnchor="middle">Wed</text>
                <text x="305" y="195" fontSize="11" fill="#6b7280" textAnchor="middle">Thu</text>
                <text x="390" y="195" fontSize="11" fill="#6b7280" textAnchor="middle">Fri</text>
                <text x="475" y="195" fontSize="11" fill="#6b7280" textAnchor="middle">Sat</text>
                <text x="560" y="195" fontSize="11" fill="#6b7280" textAnchor="middle">Sun</text>
              </svg>
            </div>
          </Card>

          {/* Shipment Type Chart */}
          <Card>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Shipment Type
              </h3>
            </div>
            <div className="flex items-center justify-center h-48 mb-4">
              <div className="relative w-40 h-40 rounded-full border-8 border-gray-200 dark:border-gray-700 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  2775
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-700"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Road Freight
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  1,240 shipments
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Ocean Freight
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  875 shipments
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Air Freight
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  780 shipments
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Rail Freight
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  380 shipments
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Bookings Table */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Bookings
            </h3>
            <a
              href="/admin/bookings"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              View All
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="px-4 py-3">Booking ID</th>
                  <th className="px-4 py-3">Agency</th>
                  <th className="px-4 py-3">Hub</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-3">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-4 py-3 font-medium text-yellow-600">
                      {booking.id}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                      {booking.agency}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {booking.hub}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                      {booking.amount}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${booking.statusColor}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </NavbarSidebarLayout>
  )
}

export default DashboardPage
