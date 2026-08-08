import { FC, useEffect, useState, useMemo } from "react"
import { Badge, Card, Spinner } from "flowbite-react"
import {
  HiCurrencyRupee,
  HiTrendingUp,
  HiTrendingDown,
  HiCash,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import http from "../../common/httpRequest"
import toast from "react-hot-toast"
import { useOrderStore } from "../../store/orderStore"

interface RevenueData {
  total: number
  delhiveryCost: number
  markupProfit: number
  today: number
  percentageChange: string
}

const formatAmount = (value: number) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const PAGE_SIZE = 10

const RevenuePage: FC = () => {
  const loginType = sessionStorage.getItem("loginType") || "admin"
  const [loading, setLoading] = useState(true)
  const [revenue, setRevenue] = useState<RevenueData | null>(null)
  const { orders, fetchOrders, loading: ordersLoading } = useOrderStore()
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchRevenue = async () => {
      setLoading(true)
      try {
        const endpoint = loginType === "hub" ? "/hub/dashboard" : "/admin/dashboard"
        const response = await http.get(endpoint, { params: { period: "day" } })
        const data = response.data?.data || response.data
        const revenueData = data?.overview?.revenue || {}

        setRevenue({
          total: Number(revenueData.total || 0),
          delhiveryCost: Number(revenueData.delhiveryCost || 0),
          markupProfit: Number(revenueData.markupProfit || 0),
          today: Number(revenueData.today || 0),
          percentageChange: String(revenueData.percentageChange || "0"),
        })
      } catch (error: any) {
        toast.error("Failed to load revenue data")
        setRevenue({
          total: 0,
          delhiveryCost: 0,
          markupProfit: 0,
          today: 0,
          percentageChange: "0",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRevenue()
    fetchOrders(1, 500)
  }, [loginType])

  const percentage = Number(revenue?.percentageChange || 0)
  const isPositive = percentage >= 0

  const totalPages = Math.ceil(orders.length / PAGE_SIZE)
  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return orders.slice(start, start + PAGE_SIZE)
  }, [orders, page])

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase()
    if (s === "delivered") return "success"
    if (s === "in transit") return "info"
    if (s === "pending") return "warning"
    if (s === "failed" || s === "cancelled") return "failure"
    return "gray"
  }

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Revenue</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Revenue summary
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-14">
            <Spinner size="xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatAmount(revenue?.total || 0)}
                  </p>
                </div>
                <HiCurrencyRupee className="h-6 w-6 text-blue-600" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Delhivery Cost</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatAmount(revenue?.delhiveryCost || 0)}
                  </p>
                </div>
                <HiCash className="h-6 w-6 text-orange-600" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Markup Profit</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatAmount(revenue?.markupProfit || 0)}
                  </p>
                </div>
                <HiTrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Today</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatAmount(revenue?.today || 0)}
                  </p>
                </div>
                <HiCurrencyRupee className="h-6 w-6 text-purple-600" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Percentage Change</p>
                  <p className={`text-2xl font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                    {isPositive ? "+" : ""}
                    {percentage.toFixed(1)}%
                  </p>
                </div>
                {isPositive ? (
                  <HiTrendingUp className="h-6 w-6 text-green-600" />
                ) : (
                  <HiTrendingDown className="h-6 w-6 text-red-600" />
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Orders Table */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">All Orders</h2>

          {ordersLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="xl" />
            </div>
          ) : (
            <>
              <div className="w-full overflow-x-auto rounded-lg shadow [scrollbar-width:thin] [scrollbar-color:#64748b_transparent]">
                <table className="min-w-full w-full text-left text-sm">
                  <thead className="bg-gray-800 text-white text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 whitespace-nowrap">Sl.No</th>
                      <th className="px-4 py-3 whitespace-nowrap">AWB Number</th>
                      <th className="px-4 py-3 whitespace-nowrap">Order Number</th>
                      <th className="px-4 py-3 whitespace-nowrap">Agency / Hub</th>
                      <th className="px-4 py-3 whitespace-nowrap">Total Value</th>
                      <th className="px-4 py-3 whitespace-nowrap">Delhivery Cost</th>
                      <th className="px-4 py-3 whitespace-nowrap">Profit Markup</th>
                      <th className="px-4 py-3 whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                    {paginatedOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                          No orders found
                        </td>
                      </tr>
                    ) : (
                      paginatedOrders.map((order: any, index: number) => {
                        const slNo = (page - 1) * PAGE_SIZE + index + 1
                        const totalValue = Number(order.amount || order.totalAmount || order.total_amount || 0)
                        const delhiveryCost = Number(order.delhiveryCost || order.delhivery_cost || order.shippingCost || 0)
                        const profitMarkup = totalValue > 0 && delhiveryCost > 0 ? totalValue - delhiveryCost : 0

                        return (
                          <tr
                            key={order._id || index}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                              {slNo}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                              {order.waybill || order.awb || "-"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                              {order.shipmentDetails?.order || order.orderId || order.bookingId || "-"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                              {order.franchiseName == "Unknown" ? order.pickupLocation?.name : order.franchiseName || "-"}
                            </td>
                            {/* <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                              {order.orderType || order.order_type || "-"}
                            </td> */}
                            <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                              {order.markupAmount !== undefined ? Math.round(Number(order.markupAmount)) : "-"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                              {order.baseAmount !== undefined ? Math.round(Number(order.baseAmount)) : "-"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                              {order.markupProfit !== undefined ? Math.round(Number(order.markupProfit)) : "-"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <Badge color={getStatusColor(order.status)}>
                                {order.status || "Pending"}
                              </Badge>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {(page - 1) * PAGE_SIZE + 1} to{" "}
                    {Math.min(page * PAGE_SIZE, orders.length)} of {orders.length} orders
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-gray-700 dark:text-gray-400"
                    >
                      <HiChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-gray-700 dark:text-gray-400"
                    >
                      <HiChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </NavbarSidebarLayout>
  )
}

export default RevenuePage
