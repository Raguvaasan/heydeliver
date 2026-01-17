import { FC, useState, useEffect } from "react"
import { Card, Table, Badge, Button, Select, TextInput, Spinner } from "flowbite-react"
import { HiSearch, HiDownload, HiUser, HiTruck, HiCheckCircle } from "react-icons/hi"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import toast from "react-hot-toast"

interface StaffPerformance {
  id: string
  name: string
  role: string
  totalOrders: number
  completedOrders: number
  pendingOrders: number
  successRate: number
  avgDeliveryTime: string
  revenue: number
  rating: number
}

const StaffPerformanceReportPage: FC = () => {
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [dateRange, setDateRange] = useState("this_month")
  const [staffData, setStaffData] = useState<StaffPerformance[]>([
    {
      id: "1",
      name: "Rajesh Kumar",
      role: "Delivery Staff",
      totalOrders: 245,
      completedOrders: 238,
      pendingOrders: 7,
      successRate: 97.1,
      avgDeliveryTime: "2.5 hrs",
      revenue: 125000,
      rating: 4.8
    },
    {
      id: "2",
      name: "Priya Sharma",
      role: "Support Staff",
      totalOrders: 180,
      completedOrders: 175,
      pendingOrders: 5,
      successRate: 97.2,
      avgDeliveryTime: "2.3 hrs",
      revenue: 98000,
      rating: 4.9
    },
    {
      id: "3",
      name: "Amit Patel",
      role: "Delivery Staff",
      totalOrders: 310,
      completedOrders: 295,
      pendingOrders: 15,
      successRate: 95.2,
      avgDeliveryTime: "3.1 hrs",
      revenue: 156000,
      rating: 4.6
    }
  ])

  const handleExport = () => {
    toast.success("Report exported successfully!")
  }

  const filteredData = staffData.filter((staff) => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || staff.role === filterRole
    return matchesSearch && matchesRole
  })

  return (
    <NavbarSidebarLayout>
      <div className="px-4 pt-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Staff Performance Report
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
                  Total Staff
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {staffData.length}
                </p>
              </div>
              <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900">
                <HiUser className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {staffData.reduce((sum, staff) => sum + staff.totalOrders, 0)}
                </p>
              </div>
              <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900">
                <HiTruck className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Completed
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {staffData.reduce((sum, staff) => sum + staff.completedOrders, 0)}
                </p>
              </div>
              <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900">
                <HiCheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Avg Success Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(staffData.reduce((sum, staff) => sum + staff.successRate, 0) / staffData.length).toFixed(1)}%
                </p>
              </div>
              <div className="rounded-lg bg-yellow-100 p-3 dark:bg-yellow-900">
                <HiCheckCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date Range
              </label>
              <Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="custom">Custom Date Range</option>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role
              </label>
              <Select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="Delivery Staff">Delivery Staff</option>
                <option value="Support Staff">Support Staff</option>
                <option value="Manager">Manager</option>
              </Select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Search Staff
              </label>
              <TextInput
                icon={HiSearch}
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Staff Performance Table */}
        <Card>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="xl" />
              </div>
            ) : (
              <Table hoverable>
                <Table.Head>
                  <Table.HeadCell>Staff Name</Table.HeadCell>
                  <Table.HeadCell>Role</Table.HeadCell>
                  <Table.HeadCell>Total Orders</Table.HeadCell>
                  <Table.HeadCell>Completed</Table.HeadCell>
                  <Table.HeadCell>Pending</Table.HeadCell>
                  <Table.HeadCell>Success Rate</Table.HeadCell>
                  <Table.HeadCell>Avg Time</Table.HeadCell>
                  <Table.HeadCell>Revenue (₹)</Table.HeadCell>
                  <Table.HeadCell>Rating</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {filteredData.length === 0 ? (
                    <Table.Row>
                      <Table.Cell colSpan={9} className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">
                          No staff performance data found
                        </p>
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    filteredData.map((staff) => (
                      <Table.Row
                        key={staff.id}
                        className="bg-white dark:border-gray-700 dark:bg-gray-800"
                      >
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                          {staff.name}
                        </Table.Cell>
                        <Table.Cell>
                          <Badge color="info">{staff.role}</Badge>
                        </Table.Cell>
                        <Table.Cell>{staff.totalOrders}</Table.Cell>
                        <Table.Cell>
                          <span className="text-green-600 dark:text-green-400 font-semibold">
                            {staff.completedOrders}
                          </span>
                        </Table.Cell>
                        <Table.Cell>
                          <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                            {staff.pendingOrders}
                          </span>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge
                            color={staff.successRate >= 95 ? "success" : "warning"}
                          >
                            {staff.successRate}%
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>{staff.avgDeliveryTime}</Table.Cell>
                        <Table.Cell className="font-semibold">
                          ₹{staff.revenue.toLocaleString()}
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span className="font-semibold">{staff.rating}</span>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  )}
                </Table.Body>
              </Table>
            )}
          </div>
        </Card>
      </div>
    </NavbarSidebarLayout>
  )
}

export default StaffPerformanceReportPage
