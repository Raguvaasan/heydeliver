import { FC, useState } from "react"
import { Card, Button, Select, TextInput, Table, Badge } from "flowbite-react"
import { HiCalendar, HiDownload, HiCurrencyRupee, HiTrendingUp, HiTrendingDown } from "react-icons/hi"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import toast from "react-hot-toast"
import { Line, Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface RevenueData {
  date: string
  totalRevenue: number
  deliveryCharges: number
  otherCharges: number
  orders: number
  avgOrderValue: number
}

const RevenueReportPage: FC = () => {
  const [reportType, setReportType] = useState<"day" | "week" | "custom">("day")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Sample data
  const revenueStats = {
    totalRevenue: 2450000,
    deliveryCharges: 1850000,
    otherCharges: 600000,
    totalOrders: 1245,
    avgOrderValue: 1968,
    growth: 15.3
  }

  const dailyData: RevenueData[] = [
    { date: "Mon", totalRevenue: 350000, deliveryCharges: 265000, otherCharges: 85000, orders: 180, avgOrderValue: 1944 },
    { date: "Tue", totalRevenue: 380000, deliveryCharges: 290000, otherCharges: 90000, orders: 195, avgOrderValue: 1949 },
    { date: "Wed", totalRevenue: 345000, deliveryCharges: 260000, otherCharges: 85000, orders: 175, avgOrderValue: 1971 },
    { date: "Thu", totalRevenue: 410000, deliveryCharges: 310000, otherCharges: 100000, orders: 210, avgOrderValue: 1952 },
    { date: "Fri", totalRevenue: 440000, deliveryCharges: 335000, otherCharges: 105000, orders: 225, avgOrderValue: 1956 },
    { date: "Sat", totalRevenue: 275000, deliveryCharges: 205000, otherCharges: 70000, orders: 140, avgOrderValue: 1964 },
    { date: "Sun", totalRevenue: 250000, deliveryCharges: 185000, otherCharges: 65000, orders: 120, avgOrderValue: 2083 },
  ]

  const weeklyData: RevenueData[] = [
    { date: "Week 1", totalRevenue: 1850000, deliveryCharges: 1400000, otherCharges: 450000, orders: 950, avgOrderValue: 1947 },
    { date: "Week 2", totalRevenue: 2050000, deliveryCharges: 1550000, otherCharges: 500000, orders: 1050, avgOrderValue: 1952 },
    { date: "Week 3", totalRevenue: 2150000, deliveryCharges: 1625000, otherCharges: 525000, orders: 1100, avgOrderValue: 1955 },
    { date: "Week 4", totalRevenue: 2450000, deliveryCharges: 1850000, otherCharges: 600000, orders: 1245, avgOrderValue: 1968 },
  ]

  const currentData = reportType === "week" ? weeklyData : dailyData

  const lineChartData = {
    labels: currentData.map((d) => d.date),
    datasets: [
      {
        label: "Total Revenue",
        data: currentData.map((d) => d.totalRevenue),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        tension: 0.4,
      },
      {
        label: "Delivery Charges",
        data: currentData.map((d) => d.deliveryCharges),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.5)",
        tension: 0.4,
      },
      {
        label: "Other Charges",
        data: currentData.map((d) => d.otherCharges),
        borderColor: "rgb(234, 179, 8)",
        backgroundColor: "rgba(234, 179, 8, 0.5)",
        tension: 0.4,
      },
    ],
  }

  const doughnutData = {
    labels: ["Delivery Charges", "Other Charges"],
    datasets: [
      {
        data: [revenueStats.deliveryCharges, revenueStats.otherCharges],
        backgroundColor: [
          "rgba(34, 197, 94, 0.6)",
          "rgba(234, 179, 8, 0.6)",
        ],
        borderColor: [
          "rgb(34, 197, 94)",
          "rgb(234, 179, 8)",
        ],
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return "₹" + value.toLocaleString()
          }
        }
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  }

  const handleExport = () => {
    toast.success("Revenue report exported successfully!")
  }

  return (
    <NavbarSidebarLayout>
      <div className="px-4 pt-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Revenue Report
          </h1>
          <Button color="info" onClick={handleExport}>
            <HiDownload className="mr-2 h-5 w-5" />
            Export Report
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{revenueStats.totalRevenue.toLocaleString()}
                </p>
                <div className="mt-1 flex items-center gap-1 text-sm">
                  <HiTrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    +{revenueStats.growth}%
                  </span>
                </div>
              </div>
              <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900">
                <HiCurrencyRupee className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Delivery Charges
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ₹{revenueStats.deliveryCharges.toLocaleString()}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {((revenueStats.deliveryCharges / revenueStats.totalRevenue) * 100).toFixed(1)}% of total
                </p>
              </div>
              <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900">
                <HiCurrencyRupee className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Other Charges
                </p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  ₹{revenueStats.otherCharges.toLocaleString()}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {((revenueStats.otherCharges / revenueStats.totalRevenue) * 100).toFixed(1)}% of total
                </p>
              </div>
              <div className="rounded-lg bg-yellow-100 p-3 dark:bg-yellow-900">
                <HiCurrencyRupee className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Avg Order Value
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  ₹{revenueStats.avgOrderValue}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {revenueStats.totalOrders} orders
                </p>
              </div>
              <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900">
                <HiTrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Report Type
              </label>
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
              >
                <option value="day">Day Wise</option>
                <option value="week">Weekly</option>
                <option value="custom">Custom Date Range</option>
              </Select>
            </div>

            {reportType === "custom" && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start Date
                  </label>
                  <TextInput
                    type="date"
                    icon={HiCalendar}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    End Date
                  </label>
                  <TextInput
                    type="date"
                    icon={HiCalendar}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Charts */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Revenue Trend
            </h3>
            <div style={{ height: "300px" }}>
              <Line data={lineChartData} options={chartOptions} />
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Revenue Distribution
            </h3>
            <div style={{ height: "300px" }}>
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </Card>
        </div>

        {/* Detailed Table */}
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Detailed Revenue Report
          </h3>
          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Date/Period</Table.HeadCell>
                <Table.HeadCell>Total Revenue</Table.HeadCell>
                <Table.HeadCell>Delivery Charges</Table.HeadCell>
                <Table.HeadCell>Other Charges</Table.HeadCell>
                <Table.HeadCell>Orders</Table.HeadCell>
                <Table.HeadCell>Avg Order Value</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {currentData.map((data, index) => (
                  <Table.Row
                    key={index}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {data.date}
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">
                        ₹{data.totalRevenue.toLocaleString()}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        ₹{data.deliveryCharges.toLocaleString()}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                        ₹{data.otherCharges.toLocaleString()}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color="info">{data.orders}</Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="font-semibold">
                        ₹{data.avgOrderValue}
                      </span>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </Card>
      </div>
    </NavbarSidebarLayout>
  )
}

export default RevenueReportPage
