import { FC, useState } from "react"
import { Card, Button, Select, TextInput, Table, Badge, Tabs } from "flowbite-react"
import { HiCalendar, HiDownload, HiTruck, HiCheckCircle, HiClock, HiX } from "react-icons/hi"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import toast from "react-hot-toast"
import { Line, Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface OrderData {
  date: string
  total: number
  completed: number
  pending: number
  cancelled: number
}

const OrdersReportPage: FC = () => {
  const [reportType, setReportType] = useState<"day" | "week" | "custom">("day")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Sample data
  const orderStats = {
    total: 1245,
    completed: 1050,
    pending: 145,
    cancelled: 50,
    successRate: 84.3
  }

  const dailyData: OrderData[] = [
    { date: "Mon", total: 180, completed: 155, pending: 20, cancelled: 5 },
    { date: "Tue", total: 195, completed: 168, pending: 22, cancelled: 5 },
    { date: "Wed", total: 175, completed: 145, pending: 25, cancelled: 5 },
    { date: "Thu", total: 210, completed: 180, pending: 23, cancelled: 7 },
    { date: "Fri", total: 225, completed: 192, pending: 28, cancelled: 5 },
    { date: "Sat", total: 140, completed: 115, pending: 18, cancelled: 7 },
    { date: "Sun", total: 120, completed: 95, pending: 20, cancelled: 5 },
  ]

  const weeklyData: OrderData[] = [
    { date: "Week 1", total: 950, completed: 820, pending: 95, cancelled: 35 },
    { date: "Week 2", total: 1050, completed: 900, pending: 110, cancelled: 40 },
    { date: "Week 3", total: 1100, completed: 950, pending: 115, cancelled: 35 },
    { date: "Week 4", total: 1245, completed: 1050, pending: 145, cancelled: 50 },
  ]

  const currentData = reportType === "week" ? weeklyData : dailyData

  const chartData = {
    labels: currentData.map((d) => d.date),
    datasets: [
      {
        label: "Total Orders",
        data: currentData.map((d) => d.total),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        tension: 0.4,
      },
      {
        label: "Completed",
        data: currentData.map((d) => d.completed),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.5)",
        tension: 0.4,
      },
      {
        label: "Pending",
        data: currentData.map((d) => d.pending),
        borderColor: "rgb(234, 179, 8)",
        backgroundColor: "rgba(234, 179, 8, 0.5)",
        tension: 0.4,
      },
    ],
  }

  const barChartData = {
    labels: currentData.map((d) => d.date),
    datasets: [
      {
        label: "Completed",
        data: currentData.map((d) => d.completed),
        backgroundColor: "rgba(34, 197, 94, 0.6)",
      },
      {
        label: "Pending",
        data: currentData.map((d) => d.pending),
        backgroundColor: "rgba(234, 179, 8, 0.6)",
      },
      {
        label: "Cancelled",
        data: currentData.map((d) => d.cancelled),
        backgroundColor: "rgba(239, 68, 68, 0.6)",
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
      },
    },
  }

  const handleExport = () => {
    toast.success("Report exported successfully!")
  }

  return (
    <NavbarSidebarLayout>
      <div className="px-4 pt-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Orders Report
          </h1>
          <Button color="info" onClick={handleExport}>
            <HiDownload className="mr-2 h-5 w-5" />
            Export Report
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-5">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {orderStats.total}
                </p>
              </div>
              <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900">
                <HiTruck className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Completed
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {orderStats.completed}
                </p>
              </div>
              <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900">
                <HiCheckCircle className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Pending
                </p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {orderStats.pending}
                </p>
              </div>
              <div className="rounded-lg bg-yellow-100 p-3 dark:bg-yellow-900">
                <HiClock className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Cancelled
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {orderStats.cancelled}
                </p>
              </div>
              <div className="rounded-lg bg-red-100 p-3 dark:bg-red-900">
                <HiX className="h-6 w-6 text-red-600 dark:text-red-300" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Success Rate
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {orderStats.successRate}%
                </p>
              </div>
              <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900">
                <HiCheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-300" />
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
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Orders Trend
            </h3>
            <div style={{ height: "300px" }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Order Status Distribution
            </h3>
            <div style={{ height: "300px" }}>
              <Bar data={barChartData} options={chartOptions} />
            </div>
          </Card>
        </div>

        {/* Detailed Table */}
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Detailed Report
          </h3>
          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Date/Period</Table.HeadCell>
                <Table.HeadCell>Total Orders</Table.HeadCell>
                <Table.HeadCell>Completed</Table.HeadCell>
                <Table.HeadCell>Pending</Table.HeadCell>
                <Table.HeadCell>Cancelled</Table.HeadCell>
                <Table.HeadCell>Success Rate</Table.HeadCell>
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
                      <Badge color="info">{data.total}</Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        {data.completed}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                        {data.pending}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-red-600 dark:text-red-400 font-semibold">
                        {data.cancelled}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge
                        color={
                          ((data.completed / data.total) * 100) >= 80
                            ? "success"
                            : "warning"
                        }
                      >
                        {((data.completed / data.total) * 100).toFixed(1)}%
                      </Badge>
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

export default OrdersReportPage
