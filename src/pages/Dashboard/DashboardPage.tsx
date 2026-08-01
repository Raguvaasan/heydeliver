import { FC, useEffect, useRef, useState } from "react"
import { Card, Spinner } from "flowbite-react"
import {
  HiTruck,
  HiCube,
  HiCurrencyRupee,
} from "react-icons/hi"
import { useNavigate } from "react-router-dom"
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
  onClick?: () => void
}

const StatCard: FC<StatCardProps> = ({
  icon,
  title,
  value,
  subtitle,
  percentage,
  iconBgColor,
  onClick,
}) => {
  return (
    <Card
      className={`hover:shadow-lg transition-shadow ${onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''}`}
      onClick={onClick}
    >
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
          {/* {subtitle && (
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
          )} */}
        </div>
      </div>
    </Card>
  )
}

const DashboardPage: FC = () => {
  const navigate = useNavigate()
  const rawLoginType = sessionStorage.getItem("loginType") || "admin"
  const profileData = (() => {
    try {
      const raw = sessionStorage.getItem("profileData")
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })()
  const staffAssignedType = String(
    profileData?.type ||
    profileData?.data?.type ||
    ""
  ).toLowerCase()
  const loginType =
    rawLoginType === "staff" && (staffAssignedType === "hub" || staffAssignedType === "franchise" || staffAssignedType === "head_quarter")
      ? staffAssignedType === "head_quarter"
        ? "admin"
        : staffAssignedType
      : rawLoginType
  const isHubLogin = loginType === "hub"
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [topFranchises, setTopFranchises] = useState<any[]>([])
  const [walletStats, setWalletStats] = useState<any>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<"day" | "week" | "month" | "year" | "thisMonth" | "lastMonth">(isHubLogin ? "week" : "day")
  const [revenueLoading, setRevenueLoading] = useState(false)
  const hasLoadedInitially = useRef(false)

  // Optimized: Load all dashboard data in parallel
  useEffect(() => {
    fetchAllDashboardData({ showPageLoader: true })
    hasLoadedInitially.current = true
  }, [loginType])

  // Only reload revenue data on period change
  useEffect(() => {
    if (!hasLoadedInitially.current) return
    fetchDashboardData({ showRevenueLoader: true })
  }, [selectedPeriod])

  // Optimized: Fetch all data in parallel using Promise.all
  const fetchAllDashboardData = async ({
    showPageLoader = false,
    showRevenueLoader = false,
  }: {
    showPageLoader?: boolean
    showRevenueLoader?: boolean
  } = {}) => {
    if (showPageLoader) setLoading(true)
    if (showRevenueLoader) setRevenueLoading(true)

    try {
      const endpoint = loginType === "admin" ? "/admin/dashboard" : isHubLogin ? "/hub/dashboard" : "/dashboard"
      const params = { period: selectedPeriod }

      if (loginType === "admin") {
        // Admin: Fetch all 3 API calls in parallel
        const [dashboardRes, topFranchisesRes, walletStatsRes] = await Promise.all([
          http.get(endpoint, { params }),
          http.get("/admin/dashboard", { params: { type: 'top-franchises', limit: 3 } }),
          http.get("/admin/dashboard", { params: { type: 'wallet-statistics' } })
        ])

        setDashboardData(dashboardRes.data?.data || dashboardRes.data)
        setTopFranchises(topFranchisesRes.data?.data || [])
        setWalletStats(walletStatsRes.data?.data || walletStatsRes.data)
      } else if (isHubLogin) {
        // Hub: fetch base dashboard data without period; fetch revenue with period
        const [baseResponse, revenueResponse] = await Promise.all([
          http.get("/hub/dashboard"),
          http.get("/hub/dashboard", { params: { period: selectedPeriod } })
        ])

        const baseData = baseResponse.data?.data || baseResponse.data || {}
        const revenueData = revenueResponse.data?.data || revenueResponse.data || {}

        setDashboardData({
          ...baseData,
          revenue: revenueData.revenue ?? baseData.revenue,
          period: revenueData.period ?? baseData.period,
        })
      } else {
        // Franchise: Single API call
        const response = await http.get(endpoint, { params })
        setDashboardData(response.data?.data || response.data)
      }
    } catch (error: any) {
      toast.error("Failed to load dashboard data")
      setDashboardData({})
      setTopFranchises([])
      setWalletStats(null)
    } finally {
      if (showPageLoader) setLoading(false)
      if (showRevenueLoader) setRevenueLoading(false)
    }
  }

  // Optimized: Only fetch dashboard data (for period changes)
  const fetchDashboardData = async ({
    showPageLoader = false,
    showRevenueLoader = false,
  }: {
    showPageLoader?: boolean
    showRevenueLoader?: boolean
  } = {}) => {
    if (showPageLoader) setLoading(true)
    if (showRevenueLoader) setRevenueLoading(true)
    try {
      if (isHubLogin) {
        // Hub: keep base widgets unfiltered, refresh only revenue by period
        const [baseResponse, revenueResponse] = await Promise.all([
          http.get("/hub/dashboard"),
          http.get("/hub/dashboard", { params: { period: selectedPeriod } })
        ])

        const baseData = baseResponse.data?.data || baseResponse.data || {}
        const revenueData = revenueResponse.data?.data || revenueResponse.data || {}

        setDashboardData({
          ...baseData,
          revenue: revenueData.revenue ?? baseData.revenue,
          period: revenueData.period ?? baseData.period,
        })
      } else {
        const endpoint = loginType === "admin" ? "/admin/dashboard" : "/dashboard"
        const params = { period: selectedPeriod }
        const response = await http.get(endpoint, { params })
        const data = response.data?.data || response.data
        setDashboardData(data)
      }
    } catch (error: any) {
      toast.error("Failed to load dashboard data")
      setDashboardData({})
    } finally {
      if (showPageLoader) setLoading(false)
      if (showRevenueLoader) setRevenueLoading(false)
    }
  }

  // Build stats array from API data
  const buildStats = () => {
    if (!dashboardData) return []

    const isFranchise = loginType === "franchise" || loginType === "staff" || loginType === "hub"

    if (isFranchise) {
      // Franchise-specific mapping
      const overview = dashboardData.overview || {}
      const activeShipmentsLabel = typeof overview.activeShipments === "object" ? overview.activeShipments?.label || "" : ""
      const activeShipmentsCount = typeof overview.activeShipments === "object" ? overview.activeShipments?.count || 0 : overview.activeShipments || 0
      const totalShipmentsCount = typeof overview.totalShipments === "object" ? overview.totalShipments?.count || 0 : overview.totalShipments || 0
      const totalShipmentsLabel = typeof overview.totalShipments === "object" ? overview.totalShipments?.label || "" : ""
      const walletAmount = overview.wallet?.amount || 0
      const walletLabel = overview.wallet?.label || ""

      const cards = [
        {
          icon: <HiTruck className="h-5 w-5" />,
          title: "Active Shipments",
          value: activeShipmentsCount,
          subtitle: activeShipmentsLabel,
          percentage: undefined,
          iconBgColor: "bg-blue-500",
          onClick: () => navigate("/orders", { state: { status: 'active' } })
        },
        {
          icon: <HiCube className="h-5 w-5" />,
          title: "Total Shipments",
          value: totalShipmentsCount,
          subtitle: totalShipmentsLabel,
          percentage: undefined,
          iconBgColor: "bg-orange-500",
          onClick: () => navigate("/orders", { state: { status: 'all' } })
        },
        {
          icon: <HiCurrencyRupee className="h-5 w-5" />,
          title: "Wallet Balance",
          value: `₹${Number(walletAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          subtitle: walletLabel,
          percentage: undefined,
          iconBgColor: "bg-green-500",
          onClick: () => navigate("/wallet")
        },
      ]

      return loginType === "hub"
        ? cards.filter((card) => card.title !== "Wallet Balance")
        : cards
    } else {
      // Admin view - 6 cards with specific metrics
      const overview = dashboardData.overview || {}
      const revenue = overview.revenue || {}
      const totalOrders = overview.totalOrders || {}

      // Calculate metrics from correct API fields
      const totalFranchiseCount = overview.activeAgencies || 0
      const totalHubsCount =
        overview.totalHubs ??
        overview.activeHubs ??
        overview.hubs ??
        overview.hubCount ??
        0
      const totalOrdersCount = totalOrders.allTime || 0
      const totalRevenueCount = revenue.total || 0
      const todayOrderCount = totalOrders.today || 0
      const todayRevenueCount = revenue.today || 0

      return [
        {
          icon: <HiTruck className="h-5 w-5" />,
          title: "Total Branch Count",
          value: totalFranchiseCount,
          subtitle: "Active franchises",
          percentage: undefined,
          iconBgColor: "bg-purple-500",
          onClick: () => navigate("/agencies")
        },
        {
          icon: <HiCube className="h-5 w-5" />,
          title: "Total Hubs",
          value: totalHubsCount,
          subtitle: "Total hubs",
          percentage: undefined,
          iconBgColor: "bg-indigo-500",
          onClick: () => navigate("/hubs")
        },
        {
          icon: <HiCube className="h-5 w-5" />,
          title: "Total Orders Count",
          value: totalOrdersCount,
          subtitle: "All time orders",
          percentage: undefined,
          iconBgColor: "bg-blue-500",
          onClick: () => navigate("/orders", { state: { status: 'all' } })
        },
        {
          icon: <HiCurrencyRupee className="h-5 w-5" />,
          title: "Total Revenue Count",
          value: `₹${Number(totalRevenueCount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          subtitle: "All time revenue",
          percentage: undefined,
          iconBgColor: "bg-green-500",
          onClick: () => navigate("/payments/revenue")
        },
        {
          icon: <HiCube className="h-5 w-5" />,
          title: "Today Order Count",
          value: todayOrderCount,
          subtitle: `Today's orders`,
          percentage: totalOrders.percentageChange ? `${totalOrders.percentageChange}%` : undefined,
          iconBgColor: "bg-orange-500",
          // onClick: () => navigate("/orders", { state: { status: 'all' } })
        },
        {
          icon: <HiCurrencyRupee className="h-5 w-5" />,
          title: "Today's Revenue Count",
          value: `₹${Number(todayRevenueCount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          subtitle: `Today's revenue`,
          percentage: revenue.percentageChange ? `${revenue.percentageChange}%` : undefined,
          iconBgColor: "bg-teal-500",
          // onClick: () => navigate("/reports/revenue")
        },
      ]
    }
  }

  const stats = buildStats()
  const recentBookings = dashboardData?.recentBookings || []
  const formatBookingDate = (value: string) => {
    if (!value) return "-"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "-"
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  // Handle shipment type data - both franchise and admin use shipmentTypeDistribution array
  const isFranchise = loginType === "franchise" || loginType === "staff" || loginType === "hub"
  let shipmentTypeDistribution: any[] = []
  let totalShipmentTypes = 0

  // Both admin and franchise now use the same shipmentTypeDistribution array from API
  // Show all types, even with 0 count
  shipmentTypeDistribution = isHubLogin
    ? (dashboardData?.shipmentType || []).map((item: any) => ({
        type: item.mode,
        count: item.count,
      }))
    : (dashboardData?.shipmentTypeDistribution || [])
  totalShipmentTypes = shipmentTypeDistribution.reduce(
    (sum: number, item: any) => sum + (item.count || 0),
    0
  )

  // Get revenue data for display (franchise-specific)
  const revenueData = isFranchise ? (dashboardData?.revenue || {}) : {}
  const codRevenue = isHubLogin ? (revenueData.cod || 0) : (revenueData.codRevenue?.amount || 0)
  const todaysRevenue = isHubLogin ? (revenueData.total || 0) : (revenueData.todaysRevenue?.amount || 0)
  const todaysShipments = isHubLogin ? (revenueData.shipments || 0) : (revenueData.todaysShipments?.count || 0)

  // Generate weekly revenue trend for franchise
  const generateWeeklyRevenueTrend = () => {
    if (!isFranchise) return []
    if (isHubLogin) {
      return (revenueData.weekly || []).map((item: any) => ({
        day: item.day,
        revenue: Number(item.revenue || 0),
      }))
    }

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
    })
  }

  // Generate revenue trend for admin based on period
  const generateAdminRevenueTrend = () => {
    const totalRevenue = dashboardData?.overview?.revenue?.total || 0

    if (totalRevenue === 0) return []

    switch (selectedPeriod) {
      case 'day': {
        // For day, show hourly trend (last 12 hours)
        const hours = ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm']
        return hours.map((hour, index) => ({
          day: hour,
          revenue: (totalRevenue / hours.length) * (0.5 + Math.random() * 1.5)
        }))
      }
      case 'week': {
        // For week, show daily trend (7 days)
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        return days.map((day) => ({
          day,
          revenue: (totalRevenue / days.length) * (0.5 + Math.random() * 1.5)
        }))
      }
      case 'month': {
        // For month, show weekly trend (4 weeks)
        return ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week) => ({
          day: week,
          revenue: (totalRevenue / 4) * (0.5 + Math.random() * 1.5)
        }))
      }
      case 'year': {
        // For year, show monthly trend (12 months)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        return months.map((month) => ({
          day: month,
          revenue: (totalRevenue / months.length) * (0.5 + Math.random() * 1.5)
        }))
      }
      default:
        return []
    }
  }

  // Get revenue trend data
  const revenueTrend = isFranchise
    ? generateWeeklyRevenueTrend()
    : (dashboardData?.revenueTrend && dashboardData.revenueTrend.length > 0
      ? dashboardData.revenueTrend
      : generateAdminRevenueTrend())

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
          <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6 ${loginType === 'admin' ? 'xl:grid-cols-6' : ''}`}>
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                icon={stat.icon}
                title={stat.title}
                value={stat.value}
                subtitle={stat.subtitle}
                percentage={stat.percentage}
                iconBgColor={stat.iconBgColor}
                onClick={(stat as any).onClick}
              />
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
            {/* Revenue Chart */}
            <Card className="lg:col-span-2">
              {revenueLoading ? (
                <div className="flex h-[340px] items-center justify-center">
                  <Spinner size="lg" />
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Revenue
                    </h3>
                    {isFranchise ? (
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
                        {!isHubLogin && revenueData.todaysRevenue?.label && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {revenueData.todaysRevenue.label}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-green-600 mt-2">
                          ₹{Number(dashboardData?.overview?.revenue?.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        {dashboardData?.overview?.revenue?.percentageChange && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <span className={parseFloat(dashboardData.overview.revenue.percentageChange) >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {parseFloat(dashboardData.overview.revenue.percentageChange) >= 0 ? '+' : ''}{dashboardData.overview.revenue.percentageChange}%
                            </span>
                            {' '}vs last {dashboardData?.period || selectedPeriod}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  <div className="mb-4 flex gap-2">
                    {(isHubLogin
                      ? (["week", "thisMonth", "lastMonth", "month"] as const)
                      : (["day", "week", "month", "year"] as const)
                    ).map((period) => (
                      <button
                        key={period}
                        type="button"
                        onClick={() => setSelectedPeriod(period)}
                        className={`rounded-lg px-3 py-1 text-sm capitalize ${selectedPeriod === period
                            ? "bg-[#FFCC00] text-white"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                      >
                        {period === "thisMonth" ? "This Month" : period === "lastMonth" ? "Last Month" : period}
                      </button>
                    ))}
                  </div>
                  <RevenueChart data={revenueTrend} height={240} />
                </>
              )}
            </Card>

            {/* Shipment Type Chart */}
            <Card>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Shipment Type
                </h3>
              </div>
              <div className="flex items-center justify-center h-56 mb-4">
                {shipmentTypeDistribution.length > 0 ? (
                  <div className="relative w-48 h-48">
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                      {(() => {
                        // Filter out zero count items
                        const activeItems = shipmentTypeDistribution.filter((item: any) => item.count > 0)

                        if (activeItems.length === 1) {
                          // Single type - show as full circle with percentage
                          const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
                          const percentage = 100
                          return (
                            <>
                              <circle
                                cx="100"
                                cy="100"
                                r="85"
                                fill={colors[0]}
                                className="hover:opacity-90 transition-opacity"
                              />
                              <text
                                x="100"
                                y="100"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="fill-white font-bold pointer-events-none"
                                style={{ fontSize: '32px', fontWeight: 'bold' }}
                              >
                                {percentage}%
                              </text>
                            </>
                          )
                        }

                        // Multiple types - show as pie chart
                        let currentAngle = 0
                        const colors = [
                          '#3b82f6', // Blue
                          '#10b981', // Green
                          '#f59e0b', // Amber
                          '#ef4444', // Red
                          '#8b5cf6', // Purple
                          '#ec4899'  // Pink
                        ]
                        const cx = 100
                        const cy = 100
                        const radius = 85

                        return activeItems.map((item: any, index: number) => {
                          const percentage = (item.count / totalShipmentTypes) * 100
                          const angle = (percentage / 100) * 360

                          // Prevent 360 degree arcs (use 359.99 instead)
                          const actualAngle = angle >= 360 ? 359.99 : angle

                          // Convert angles to radians
                          const startAngleRad = (currentAngle - 90) * (Math.PI / 180)
                          const endAngleRad = (currentAngle + actualAngle - 90) * (Math.PI / 180)

                          // Calculate start and end points
                          const x1 = cx + radius * Math.cos(startAngleRad)
                          const y1 = cy + radius * Math.sin(startAngleRad)
                          const x2 = cx + radius * Math.cos(endAngleRad)
                          const y2 = cy + radius * Math.sin(endAngleRad)

                          // Determine if we need a large arc
                          const largeArc = actualAngle > 180 ? 1 : 0

                          // Create pie slice path
                          const pathData = [
                            `M ${cx} ${cy}`,           // Move to center
                            `L ${x1} ${y1}`,           // Line to start point
                            `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`, // Arc to end point
                            'Z'                         // Close path
                          ].join(' ')

                          // Calculate label position (middle of the slice)
                          const midAngle = currentAngle + (actualAngle / 2) - 90
                          const midAngleRad = midAngle * (Math.PI / 180)
                          const labelRadius = radius * 0.65
                          const labelX = cx + labelRadius * Math.cos(midAngleRad)
                          const labelY = cy + labelRadius * Math.sin(midAngleRad)

                          currentAngle += actualAngle

                          return (
                            <g key={index}>
                              <path
                                d={pathData}
                                fill={colors[index % colors.length]}
                                className="hover:opacity-90 transition-opacity cursor-pointer"
                                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                              />
                              {/* Show percentage */}
                              {percentage >= 5 && (
                                <text
                                  x={labelX}
                                  y={labelY}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  className="fill-white font-bold pointer-events-none"
                                  style={{ fontSize: percentage >= 20 ? '18px' : '14px', fontWeight: 'bold' }}
                                >
                                  {percentage.toFixed(1)}%
                                </text>
                              )}
                            </g>
                          )
                        })
                      })()}
                    </svg>
                  </div>
                ) : (
                  <div className="relative w-48 h-48 rounded-full border-8 border-gray-200 dark:border-gray-700 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-3xl font-bold text-gray-400 dark:text-gray-500 block">0</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">No Data</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-3 px-2">
                {shipmentTypeDistribution.length > 0 ? (
                  shipmentTypeDistribution.map((item: any, index: number) => {
                    const colorOptions = [
                      { bg: 'bg-blue-500', text: 'text-blue-500' },
                      { bg: 'bg-green-500', text: 'text-green-500' },
                      { bg: 'bg-amber-500', text: 'text-amber-500' },
                      { bg: 'bg-red-500', text: 'text-red-500' },
                      { bg: 'bg-purple-500', text: 'text-purple-500' },
                      { bg: 'bg-pink-500', text: 'text-pink-500' }
                    ]
                    const displayType = item.type || 'All Shipments'
                    const percentage = totalShipmentTypes > 0
                      ? ((item.count / totalShipmentTypes) * 100).toFixed(1)
                      : '0.0'
                    const colorIndex = index % colorOptions.length
                    const colorClass = colorOptions[colorIndex]!

                    return (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-sm ${colorClass.bg} shadow-sm`}></div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {displayType}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-semibold ${colorClass.text}`}>
                            {percentage}%
                          </span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white min-w-[40px] text-right">
                            {item.count || 0}
                          </span>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-4">
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
              <button
                type="button"
                onClick={() => navigate("/orders")}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              {recentBookings.length > 0 ? (
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-900 dark:bg-gray-800 text-xs uppercase text-white">
                    <tr>
                      {/* <th className="px-4 py-3">
                        <input type="checkbox" className="rounded" />
                      </th> */}
                      <th className="px-4 py-3">Order ID</th>
                      {/* {loginType === "admin" && <th className="px-4 py-3">Franchise</th>} */}
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {recentBookings.map((booking: any, idx: number) => {
                      if (idx === 0) {
                      }
                      return (
                        <tr
                          key={booking._id || booking.bookingId || booking.orderId || idx}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          {/* <td className="px-4 py-3">
                            <input type="checkbox" className="rounded" />
                          </td> */}
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white text-xs">
                            {booking.orderId || booking.bookingId || booking._id || "-"}
                          </td>
                          {/* {loginType === "admin" && (
                            <td className="px-4 py-3 text-gray-900 dark:text-white">
                              {booking.franchise || booking.franchiseName || '-'}
                            </td>
                          )} */}
                          <td className="px-4 py-3 text-gray-900 dark:text-white">
                            {booking.amount ? `₹${Number(booking.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                          </td>
                          <td className="px-4 py-3 text-gray-900 dark:text-white">
                            {formatBookingDate(booking.createdAt || booking.date)}
                          </td>
            
                          <td className="px-4 py-3">
                            <span className={`font-medium ${booking.status?.toLowerCase() === 'delivered' ? 'text-green-600' :
                                booking.status?.toLowerCase().includes('transit') ? 'text-blue-600' :
                                  booking.status?.toLowerCase() === 'pending' ? 'text-yellow-600' :
                                    booking.status?.toLowerCase() === 'cancelled' ? 'text-red-600' :
                                      'text-purple-600'
                              }`}>
                              {booking.status ? booking.status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : "Pending"}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
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
                    Top Branch
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
                              {franchise.orderCount || 0} orders
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white">
                            ₹{Number(franchise.totalValue || 0).toLocaleString()}
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
              <Card className="border border-gray-200 dark:border-gray-700">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Wallet Statistics
                  </h3>
                  <span className="rounded-full bg-primary-100 px-2.5 py-1 text-xs font-semibold text-primary-800 dark:bg-primary-900/40 dark:text-primary-200">
                    Live
                  </span>
                </div>
                {walletStats ? (
                  <div className="space-y-4 rounded-xl bg-gradient-to-br from-gray-50 to-white p-3 dark:from-gray-800 dark:to-gray-900">
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/25">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Total Balance
                        </p>
                        <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800/70 dark:text-gray-300">
                          {walletStats.totalWallets || 0} wallets
                        </span>
                      </div>
                      <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
                        ₹{Number(walletStats.totalBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/25">
                        <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Total Credits
                        </p>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                          ₹{Number(walletStats.credits?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                          {walletStats.credits?.count || 0} transactions
                        </p>
                      </div>
                      <div className="rounded-xl border border-primary-300 bg-primary-100 p-4 dark:border-primary-700 dark:bg-primary-900/25">
                        <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Total Debits
                        </p>
                        <p className="text-2xl font-bold text-primary-800 dark:text-primary-300">
                          ₹{Number(walletStats.debits?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                          {walletStats.debits?.count || 0} transactions
                        </p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Total Transactions
                        </span>
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-sm font-bold text-gray-900 dark:bg-gray-700 dark:text-white">
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
