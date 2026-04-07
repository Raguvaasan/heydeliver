import { FC, useEffect, useState } from "react"
import { Card, Spinner } from "flowbite-react"
import {
  HiCurrencyRupee,
  HiTrendingUp,
  HiTrendingDown,
  HiCash,
} from "react-icons/hi"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import http from "../../common/httpRequest"
import toast from "react-hot-toast"

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

const RevenuePage: FC = () => {
  const loginType = sessionStorage.getItem("loginType") || "admin"
  const [loading, setLoading] = useState(true)
  const [revenue, setRevenue] = useState<RevenueData | null>(null)

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
  }, [loginType])

  const percentage = Number(revenue?.percentageChange || 0)
  const isPositive = percentage >= 0

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
      </div>
    </NavbarSidebarLayout>
  )
}

export default RevenuePage
