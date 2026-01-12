import { FC, useEffect, useState } from "react"
import { Badge, Button, Card, Spinner, Tabs } from "flowbite-react"
import { HiEye, HiPencil, HiTrash } from "react-icons/hi"
import { useNavigate } from "react-router-dom"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { useOrderStore } from "../../store/orderStore"
import toast from "react-hot-toast"

const OrdersPage: FC = () => {
  const navigate = useNavigate()
  const { orders, activeOrders, fetchOrders, fetchActiveOrders, deleteOrder, loading } = useOrderStore()
  const [activeTab, setActiveTab] = useState<"recent" | "active">("recent")
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])

  useEffect(() => {
    fetchOrders()
    fetchActiveOrders()
  }, [fetchOrders, fetchActiveOrders])

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    )
  }

  const handleSelectAll = (ordersList: any[]) => {
    if (selectedOrders.length === ordersList.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(ordersList.map((order) => order._id))
    }
  }

  const handleView = (orderId: string) => {
    navigate(`/orders/${orderId}`)
  }

  const handleEdit = (orderId: string) => {
    navigate(`/orders/edit/${orderId}`)
  }

  const handleDelete = async (orderId: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await deleteOrder(orderId)
      } catch (error) {
        console.error("Delete failed:", error)
      }
    }
  }

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase()
    if (statusLower === "delivered") return "success"
    if (statusLower === "in transit") return "info"
    if (statusLower === "pending") return "warning"
    return "gray"
  }

  const renderOrdersTable = (ordersList: any[]) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Spinner size="xl" />
        </div>
      )
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
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
              <th className="px-4 py-3">BOOKING ID</th>
              <th className="px-4 py-3">BOOKING DATE & TIME</th>
              <th className="px-4 py-3">CUSTOMER</th>
              <th className="px-4 py-3">CUSTOMER NUMBER</th>
              <th className="px-4 py-3">AMOUNT</th>
              <th className="px-4 py-3">STATUS</th>
              <th className="px-4 py-3 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white">
            {ordersList.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              ordersList.map((order, index) => (
              <tr
                key={order._id}
                className={`${
                  index === 0
                    ? "bg-orange-50 dark:bg-orange-900/20"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order._id)}
                    onChange={() => handleSelectOrder(order._id)}
                    className="form-checkbox h-4 w-4"
                  />
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`font-medium ${
                      index === 0
                        ? "text-orange-600"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {order.bookingId || order._id}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {order.bookingDate || new Date(order.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {order.customer || order.customerName || "-"}
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {order.customerNumber || order.phone || "-"}
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  ₹{order.amount || 0}
                </td>
                <td className="px-4 py-3">
                  <Badge color={getStatusColor(order.status)}>
                    {order.status || "Pending"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleView(order._id)}
                      className="p-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      title="View"
                    >
                      <HiEye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(order._id)}
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
  }

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
              className="border-2 border-orange-500 text-orange-500 hover:bg-orange-50"
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
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab("recent")}
                className={`pb-3 font-medium transition-colors ${
                  activeTab === "recent"
                    ? "text-orange-500 border-b-2 border-orange-500"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                Recent Bookings
              </button>
              <button
                onClick={() => setActiveTab("active")}
                className={`pb-3 font-medium transition-colors ${
                  activeTab === "active"
                    ? "text-orange-500 border-b-2 border-orange-500"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                Active Orders
              </button>
            </div>
          </div>

          {/* Table */}
          {activeTab === "recent" ? renderOrdersTable(orders) : renderOrdersTable(activeOrders)}
        </Card>
      </div>
    </NavbarSidebarLayout>
  )
}

export default OrdersPage
