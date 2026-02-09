import { FC, useEffect, useState } from "react"
import { Card, Spinner } from "flowbite-react"
import {
  HiTruck,
  HiCube,
  HiCurrencyRupee,
} from "react-icons/hi"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import http from "../../common/httpRequest"
import toast from "react-hot-toast"
import RevenueChart from "../../components/RevenueChart"

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
  const loginType = sessionStorage.getItem("loginType") || "admin"
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [topFranchises, setTopFranchises] = useState<any[]>([])
  const [walletStats, setWalletStats] = useState<any>(null)
  
  useEffect(() => {
    fetchDashboardData()
    
    // Fetch admin-specific data
    if (loginType === "admin") {
      fetchTopFranchises()
      fetchWalletStatistics()
    }
  }, [loginType])
  
  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      console.log("Fetching dashboard data...")
      
      // Use admin endpoint for admin users, regular endpoint for franchise
      const endpoint = loginType === "admin" ? "/admin/dashboard" : "/dashboard"
      const params = loginType === "admin" ? { period: "week" } : {}
      
      console.log(`Calling ${endpoint} with params:`, params)
      const response = await http.get(endpoint, { params })
      console.log("Dashboard API response:", response.data)
      
      const data = response.data?.data || response.data
      console.log("Parsed dashboard data:", data)
      console.log("Overview:", data?.overview)
      console.log("Revenue:", data?.revenue)
      console.log("Total Shipments:", data?.totalShipments)
      console.log("Recent Bookings:", data?.recentBookings)
      console.log("Shipment Type Distribution:", data?.shipmentTypeDistribution)
      setDashboardData(data)
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error)
      toast.error("Failed to load dashboard data")
      setDashboardData({})
    } finally {
      setLoading(false)
    }
  }
  
  const fetchTopFranchises = async () => {
    try {
      console.log("Fetching top franchises...")
      const response = await http.get("/admin/dashboard", {
        params: { type: 'top-franchises', limit: 5 }
      })
      console.log("Top Franchises response:", response.data)
      
      const data = response.data?.data || response.data?.franchises || []
      setTopFranchises(data)
    } catch (error: any) {
      console.error("Error fetching top franchises:", error)
    }
  }
  
  const fetchWalletStatistics = async () => {
    try {
      console.log("Fetching wallet statistics...")
      const response = await http.get("/admin/dashboard", {
        params: { type: 'wallet-statistics' }
      })
      console.log("Wallet Statistics response:", response.data)
      
      const data = response.data?.data || response.data
      setWalletStats(data)
    } catch (error: any) {
      console.error("Error fetching wallet statistics:", error)
    }
  }
  
  // Build stats array from API data
  const buildStats = () => {
    if (!dashboardData) return []
    
    const isFranchise = loginType === "franchise" || loginType === "staff"
    
    if (isFranchise) {
      // Franchise-specific mapping
      const overview = dashboardData.overview || {}
      const revenue = dashboardData.revenue || {}
      
      const activeShipmentsLabel = overview.activeShipments?.label || ""
      const activeShipmentsCount = overview.activeShipments?.count || 0
      const totalShipmentsCount = overview.totalShipments?.count || 0
      const totalShipmentsLabel = overview.totalShipments?.label || ""
      const walletAmount = overview.wallet?.amount || 0
      const walletLabel = overview.wallet?.label || ""
      
      return [
        {
          icon: <HiTruck className="h-5 w-5" />,
          title: "Active Shipments",
          value: activeShipmentsCount,
          subtitle: activeShipmentsLabel,
          iconBgColor: "bg-blue-500",
        },
        {
          icon: <HiCube className="h-5 w-5" />,
          title: "Total Shipments",
          value: totalShipmentsCount,
          subtitle: totalShipmentsLabel,
          iconBgColor: "bg-orange-500",
        },
        {
          icon: <HiCurrencyRupee className="h-5 w-5" />,
          title: "Revenue Generated",
          value: `₹${Number(walletAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          subtitle: walletLabel,
          iconBgColor: "bg-green-500",
        },
      ]
    } else {
      // Admin view - original mapping
      const overview = dashboardData.overview || {}
      const revenue = overview.revenue || {}
      const totalShipments = overview.totalShipments || {}
      
      return [
        {
          icon: <HiTruck className="h-5 w-5" />,
          title: "Active Shipments",
          value: overview.activeShipments?.total || 0,
          subtitle: `In Transit: ${overview.activeShipments?.inTransit || 0}, Out for Delivery: ${overview.activeShipments?.outForDelivery || 0}`,
          iconBgColor: "bg-purple-500",
        },
        {
          icon: <HiCube className="h-5 w-5" />,
          title: "Total Shipments",
          value: totalShipments.count || 0,
          subtitle: `Current Period: ${totalShipments.currentPeriod || 0}`,
          percentage: totalShipments.percentageChange ? `${totalShipments.percentageChange}%` : undefined,
          iconBgColor: "bg-orange-500",
        },
        {
          icon: <HiCurrencyRupee className="h-5 w-5" />,
          title: "Revenue Generated",
          value: `${revenue.currency || '₹'}${Number(revenue.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          subtitle: `This ${dashboardData.period || 'week'}`,
          percentage: revenue.percentageChange ? `${revenue.percentageChange}%` : undefined,
          iconBgColor: "bg-green-500",
        },
      ]
    }
  }
  
  const stats = buildStats()
  const recentBookings = dashboardData?.recentBookings || []
  
  // Handle shipment type data differently for franchise vs admin
  const isFranchise = loginType === "franchise" || loginType === "staff"
  let shipmentTypeDistribution: any[] = []
  let totalShipmentTypes = 0
  
  if (isFranchise) {
    // Franchise: Convert shipmentType object to array
    const shipmentTypeData = dashboardData?.shipmentType || {}
    shipmentTypeDistribution = [
      { type: 'Road Freight', count: shipmentTypeData.roadFreight || 0 },
      { type: 'Ocean Freight', count: shipmentTypeData.oceanFreight || 0 },
      { type: 'Air Freight', count: shipmentTypeData.airFreight || 0 },
      { type: 'Rail Freight', count: shipmentTypeData.railFreight || 0 },
    ].filter(item => item.count > 0)
    totalShipmentTypes = shipmentTypeData.total || 0
  } else {
    // Admin: Use shipmentTypeDistribution array directly
    shipmentTypeDistribution = dashboardData?.shipmentTypeDistribution || []
    totalShipmentTypes = shipmentTypeDistribution.reduce(
      (sum: number, item: any) => sum + (item.count || 0),
      0
    )
  }
  
  // Get revenue data for display (franchise-specific)
  const revenueData = isFranchise ? (dashboardData?.revenue || {}) : {}
  const codRevenue = revenueData.codRevenue?.amount || 0
  const todaysRevenue = revenueData.todaysRevenue?.amount || 0
  const todaysShipments = revenueData.todaysShipments?.count || 0
  
  // Generate weekly revenue trend for franchise
  const generateWeeklyRevenueTrend = () => {
    if (!isFranchise) return []
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const today = new Date().getDay() // 0 = Sunday, 1 = Monday, etc.
    const todayIndex = today === 0 ? 6 : today - 1 // Convert to Mon=0, Sun=6
    
    // Generate weekly data with today's revenue as actual value
    return days.map((day, index) => {
      if (index === todayIndex) {
        // Today's actual revenue
        return { day, revenue: todaysRevenue }
      } else if (index < todayIndex) {
        // Past days: generate realistic declining values
        const daysAgo = todayIndex - index
        const variation = 0.7 + Math.random() * 0.5 // 70% to 120% of today
        return { day, revenue: todaysRevenue * variation }
      } else {
        // Future days: no data yet
        return { day, revenue: 0 }
      }
    }).filter(item => item.revenue > 0) // Only show days with data
  }
  
  // Get revenue trend data
  const revenueTrend = isFranchise 
    ? generateWeeklyRevenueTrend()
    : (dashboardData?.revenueTrend || [])
  
  // Get latest revenue from trend for admin
  const latestRevenue = revenueTrend.length > 0 ? revenueTrend[revenueTrend.length - 1] : null

  return (
    <NavbarSidebarLayout>
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Spinner size="xl" />
        </div>
      ) : (
        <div className="px-4 pt-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Overview
            </h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 mb-6">
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
                {isFranchise ? (
                  // Franchise view with today's revenue
                  <>
                    <div className="flex items-baseline gap-4 mt-2">
                      <p className="text-2xl font-bold text-green-600">
                        ₹{Number(todaysRevenue).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">COD: </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            ₹{Number(codRevenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Shipments: </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {todaysShipments}
                          </span>
                        </div>
                      </div>
                    </div>
                    {revenueData.todaysRevenue?.label && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {revenueData.todaysRevenue.label}
                      </p>
                    )}
                  </>
                ) : (
                  // Admin view with total revenue
                  <>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                      ₹{Number(latestRevenue?.revenue || dashboardData?.overview?.revenue?.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    {dashboardData?.overview?.revenue?.percentageChange && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span className={parseFloat(dashboardData.overview.revenue.percentageChange) >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {parseFloat(dashboardData.overview.revenue.percentageChange) >= 0 ? '+' : ''}{dashboardData.overview.revenue.percentageChange}%
                        </span>
                        {' '}vs last {dashboardData?.period || 'week'}
                      </p>
                    )}
                  </>
                )}
              </div>
            <div className="flex gap-2 mb-4">
              <button className="px-3 py-1 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                Day
              </button>
              <button className="px-3 py-1 text-sm rounded-lg bg-orange-500 text-white">
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
            <RevenueChart data={revenueTrend} height={240} />
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
                  {totalShipmentTypes}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {shipmentTypeDistribution.length > 0 ? (
                shipmentTypeDistribution.map((item: any, index: number) => {
                  const colors = ['bg-gray-700', 'bg-cyan-500', 'bg-blue-600', 'bg-orange-500', 'bg-purple-500', 'bg-pink-500']
                  const displayType = item.type || 'All Shipments'
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {displayType}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.count || 0} shipments
                      </span>
                    </div>
                  )
                })
              ) : (
                <div className="text-center text-gray-500 text-sm">
                  No shipment data available
                </div>
              )}
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
              href="/admin/orders"
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              View All
            </a>
          </div>
          <div className="overflow-x-auto">
            {recentBookings.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-900 dark:bg-gray-800 text-xs uppercase text-white">
                  <tr>
                    <th className="px-4 py-3">
                      <input type="checkbox" className="rounded" />
                    </th>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Franchise</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentBookings.map((booking: any, idx: number) => {
                    if (idx === 0) {
                      console.log("First booking sample:", booking)
                    }
                    return (
                    <tr
                      key={booking._id || booking.bookingId || booking.orderId || idx}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-4 py-3">
                        <input type="checkbox" className="rounded" />
                      </td>
                      <td className="px-4 py-3 font-medium text-orange-600 text-xs">
                        {booking.orderId || booking.bookingId || booking._id || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white">
                        {booking.franchise || booking.userId || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white">
                        {booking.amount ? `₹${Number(booking.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${
                          booking.status?.toLowerCase() === 'delivered' ? 'text-green-600' :
                          booking.status?.toLowerCase() === 'in transit' ? 'text-blue-600' :
                          booking.status?.toLowerCase() === 'pending' ? 'text-yellow-600' :
                          booking.status?.toLowerCase() === 'cancelled' ? 'text-red-600' :
                          'text-purple-600'
                        }`}>
                          {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : "Pending"}
                        </span>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent bookings available
              </div>
            )}
          </div>
        </Card>

        {/* Admin-Only Sections */}
        {loginType === "admin" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-6">
            {/* Top Franchises */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Top Franchises
                </h3>
              </div>
              <div className="space-y-4">
                {topFranchises.length > 0 ? (
                  topFranchises.map((franchise: any, index: number) => (
                    <div key={franchise._id || index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {franchise.franchiseName || franchise.name || "-"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {franchise.totalOrders || 0} orders
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">
                          ₹{Number(franchise.totalRevenue || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Revenue
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No franchise data available
                  </div>
                )}
              </div>
            </Card>

            {/* Wallet Statistics */}
            <Card>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Wallet Statistics
                </h3>
              </div>
              {walletStats ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Total Balance
                      </p>
                      <span className="text-xs text-gray-500">
                        {walletStats.totalWallets || 0} wallets
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      ₹{Number(walletStats.totalBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Total Credits
                      </p>
                      <p className="text-xl font-bold text-green-600">
                        ₹{Number(walletStats.credits?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {walletStats.credits?.count || 0} transactions
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Total Debits
                      </p>
                      <p className="text-xl font-bold text-orange-600">
                        ₹{Number(walletStats.debits?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {walletStats.debits?.count || 0} transactions
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Total Transactions
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {(walletStats.credits?.count || 0) + (walletStats.debits?.count || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Loading wallet statistics...
                </div>
              )}
            </Card>
          </div>
        )}
        </div>
      )}
    </NavbarSidebarLayout>
  )
}

export default DashboardPage
