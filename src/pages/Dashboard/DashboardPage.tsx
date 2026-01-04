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
    {
      icon: <HiLocationMarker className="h-5 w-5" />,
      title: "Active Hubs",
      value: "15",
      subtitle: "Inactive 2",
      iconBgColor: "bg-pink-500",
    },
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                ₹45,350
              </p>
              <p className="text-sm text-green-600">+2.4% from last week</p>
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
            <div className="h-64 flex items-end justify-center">
              <div className="text-gray-400 text-sm">
                Chart visualization will be rendered here
              </div>
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
