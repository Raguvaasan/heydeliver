import { FC, useEffect, useState, useCallback, useMemo } from "react"
import { Badge, Button, Card, Spinner, Tabs } from "flowbite-react"
import { HiDocumentDownload, HiEye, HiPencil, HiTrash, HiViewGrid, HiCheckCircle, HiClock, HiTruck, HiXCircle, HiOutlinePrinter } from "react-icons/hi"
import { useNavigate, useLocation } from "react-router-dom"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { useOrderStore } from "../../store/orderStore"
import toast from "react-hot-toast"
import { handleInvoice as generateInvoice } from "./handleInvoice"
import { handleLabel as generateLabel } from "./handleLabel"
import { handleDelhiveryLabel as generateDelhiveryLabel } from "./handleDelhiveryLabel"

const OrdersPage: FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { orders, activeOrders, fetchOrders, fetchActiveOrders, deleteOrder, loading } = useOrderStore()
  const [activeTab, setActiveTab] = useState<"recent" | "active">("recent")
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [franchiseSearch, setFranchiseSearch] = useState("")
  
  // Get initial status from location state if available
  const initialStatus = (location.state as any)?.status || "all"
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus)

  useEffect(() => {
    fetchOrders()
    fetchActiveOrders()
    
    // If status filter was passed in location state, ensure it's set
    if ((location.state as any)?.status) {
      setStatusFilter((location.state as any).status)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]) // Re-run if location state changes (e.g. navigating back from dashboard with same route but different state)

  // Memoized callbacks to prevent unnecessary re-renders
  const handleSelectOrder = useCallback((orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    )
  }, [])

  const handleSelectAll = useCallback((ordersList: any[]) => {
    if (selectedOrders.length === ordersList.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(ordersList.map((order) => order._id))
    }
  }, [selectedOrders.length])

  const handleView = useCallback((orderId: string) => {
    navigate(`/orders/${orderId}`)
  }, [navigate])

  const handleEdit = useCallback((orderId: string) => {
    navigate(`/orders/edit/${orderId}`)
  }, [navigate])

  const handleDelete = useCallback(async (orderId: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await deleteOrder(orderId)
        toast.success("Order deleted successfully")
      } catch (error) {
        toast.error("Failed to delete order")
      }
    }
  }, [deleteOrder])

  const handleInvoice = useCallback(async (orderId: string) => {
    await generateInvoice(orderId)
  }, [])

  const handleLabel = useCallback(async (orderId: string) => {
    await generateLabel(orderId)
  }, [])

  const handleDelhiveryLabel = useCallback(async (waybill: string) => {
    await generateDelhiveryLabel(waybill)
  }, [])
  const getStatusColor = useCallback((status: string) => {
    const statusLower = status?.toLowerCase()
    if (statusLower === "delivered") return "success"
    if (statusLower === "in transit") return "info"
    if (statusLower === "pending") return "warning"
    return "gray"
  }, [])

  // Memoize the current orders list based on active tab and status filter
  const currentOrdersList = useMemo(() => {
    const baseOrders = activeTab === "recent" ? orders : activeOrders

    // Apply status filter
    const statusFilteredOrders = statusFilter === "all" ? baseOrders : baseOrders.filter(order => {
      const orderStatus = order.status?.toLowerCase().replace(/[\s_-]/g, "")
      const filterStatus = statusFilter.toLowerCase().replace(/[\s_-]/g, "")
      return orderStatus === filterStatus
    })

    // Apply franchise search filter
    const search = franchiseSearch.trim().toLowerCase()
    if (!search) return statusFilteredOrders

    return statusFilteredOrders.filter((order) =>
      String(order.franchiseName || "").toLowerCase().includes(search)
    )
  }, [activeTab, orders, activeOrders, statusFilter, franchiseSearch])

  const renderOrdersTable = useCallback((ordersList: any[]) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Spinner size="xl" />
        </div>
      )
    }

    return (
      <div className="w-full overflow-x-auto [scrollbar-width:thin] [scrollbar-color:#64748b_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-500/70 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400/80">
        <table className="min-w-[1100px] w-full text-left text-sm">
          <thead className="bg-gray-800 text-white text-xs uppercase">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={ordersList.length > 0 && selectedOrders.length === ordersList.length}
                  onChange={() => handleSelectAll(ordersList)}
                  className="form-checkbox h-4 w-4"
                  disabled={ordersList.length === 0}
                />
              </th>
              <th className="px-4 py-3 whitespace-nowrap">Order ID</th>
              <th className="px-4 py-3 whitespace-nowrap">AWB</th>
              <th className="px-4 py-3 whitespace-nowrap">BOOKING DATE & TIME</th>
              <th className="px-4 py-3 whitespace-nowrap">CUSTOMER</th>
              <th className="px-4 py-3 whitespace-nowrap">CUSTOMER NUMBER</th>
              <th className="px-4 py-3 whitespace-nowrap">FRANCHISE NAME</th>
              <th className="px-4 py-3 whitespace-nowrap">AMOUNT</th>
              <th className="px-4 py-3 whitespace-nowrap">STATUS</th>
              <th className="px-4 py-3 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {ordersList.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              ordersList.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleView(order._id || order.orderId || order.bookingId)}
                >
                  <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order._id)}
                      onChange={() => handleSelectOrder(order._id)}
                      className="form-checkbox h-4 w-4"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {order.shipmentDetails.order}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {order.waybill}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {order.bookingDate || new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {order.consignee.name || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {order.consignee.phone || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {order.franchiseName || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    ₹{order.amount || 0}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge color={getStatusColor(order.status)}>
                      {order.status || "Pending"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() =>
                          handleInvoice(order.orderId)}
                        className="p-1.5 text-gray-700 hover:text-gray-900 dark:text-gray-300"
                        title="View Invoice"
                      >
                        <HiDocumentDownload className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() =>
                          handleLabel(order.orderId)}
                        className="p-1.5 text-gray-700 hover:text-gray-900 dark:text-gray-300"
                        title="Print Label"
                      >
                        <HiOutlinePrinter className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() =>
                          handleDelhiveryLabel(order.waybill)}
                        className="p-1.5 text-orange-600 hover:text-orange-700 dark:text-orange-400"
                        title="Delhivery Label"
                      >
                        <HiDocumentDownload className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleView(order._id || order.orderId || order.bookingId)}
                        className="p-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        title="View"
                      >
                        <HiEye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(order._id || order.orderId || order.bookingId)}
                        className="p-1.5 text-green-600 hover:text-green-700 dark:text-green-400"
                        title="Edit"
                      >
                        <HiPencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(order._id)}
                        className="p-1.5 text-red-600 hover:text-red-700 dark:text-red-400"
                        title="Delete"
                      >
                        <HiTrash className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    )
  }, [loading, selectedOrders, handleSelectAll, handleView, handleEdit, handleDelete, getStatusColor, handleInvoice, handleLabel, handleDelhiveryLabel])

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4 pt-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Orders
          </h1>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate("/orders/bulk")}
              color="light"
              className="border-2 border-orange-500 text-orange-500 bg-transparent hover:bg-transparent"
            >
              BULK ORDER
            </Button>
            <Button
              onClick={() => navigate("/orders/new")}
              className="bg-orange-500 hover:bg-orange-600"
            >
              NEW ORDER
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Card>
          <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab("recent")}
                  className={`pb-3 font-medium transition-colors ${activeTab === "recent"
                    ? "text-orange-500 border-b-2 border-orange-500"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    }`}
                >
                  Recent Bookings
                </button>
              </div>
              <div className="pb-2 md:pb-0">
                <input
                  type="text"
                  value={franchiseSearch}
                  onChange={(e) => setFranchiseSearch(e.target.value)}
                  placeholder="Search franchise name..."
                  className="w-full md:w-72 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
              {/* <button
                onClick={() => setActiveTab("active")}
                className={`pb-3 font-medium transition-colors ${activeTab === "active"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
              >
                Pickup Requests
              </button> */}
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
            <nav className="flex flex-wrap gap-2 -mb-px" aria-label="Status Tabs">
              <button
                onClick={() => setStatusFilter("all")}
                className={`inline-flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${statusFilter === "all"
                  ? "border-orange-500 text-orange-600 dark:text-orange-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
              >
                <HiViewGrid className="h-5 w-5" />
                All Status
              </button>
              <button
                onClick={() => setStatusFilter("active")}
                className={`inline-flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${statusFilter === "active"
                  ? "border-orange-500 text-orange-600 dark:text-orange-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
              >
                <HiCheckCircle className="h-5 w-5" />
                Active
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`inline-flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${statusFilter === "pending"
                  ? "border-orange-500 text-orange-600 dark:text-orange-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
              >
                <HiClock className="h-5 w-5" />
                Pending
              </button>
              <button
                onClick={() => setStatusFilter("in-transit")}
                className={`inline-flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${statusFilter === "in-transit"
                  ? "border-orange-500 text-orange-600 dark:text-orange-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
              >
                <HiTruck className="h-5 w-5" />
                In Transit
              </button>
              <button
                onClick={() => setStatusFilter("delivered")}
                className={`inline-flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${statusFilter === "delivered"
                  ? "border-orange-500 text-orange-600 dark:text-orange-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
              >
                <HiCheckCircle className="h-5 w-5" />
                Delivered
              </button>
              <button
                onClick={() => setStatusFilter("cancelled")}
                className={`inline-flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${statusFilter === "cancelled"
                  ? "border-orange-500 text-orange-600 dark:text-orange-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
              >
                <HiXCircle className="h-5 w-5" />
                Cancelled
              </button>
            </nav>
          </div>

          {/* Table */}
          {renderOrdersTable(currentOrdersList)}
        </Card>
      </div>
    </NavbarSidebarLayout>
  )
}

export default OrdersPage
