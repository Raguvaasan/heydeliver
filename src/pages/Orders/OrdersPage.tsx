import { FC, useEffect, useState, useCallback, useMemo } from "react"
import { Badge, Button, Card, Spinner, Tabs } from "flowbite-react"
import { HiDocumentDownload, HiEye, HiPencil, HiTrash } from "react-icons/hi"
import { useNavigate } from "react-router-dom"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { useOrderStore } from "../../store/orderStore"
import toast from "react-hot-toast"
import { jsPDF } from "jspdf"

const OrdersPage: FC = () => {
  const navigate = useNavigate()
  const { orders, activeOrders, fetchOrders, fetchActiveOrders, deleteOrder, loading } = useOrderStore()
  const [activeTab, setActiveTab] = useState<"recent" | "active">("recent")
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])

  useEffect(() => {
    fetchOrders()
    fetchActiveOrders()
  }, [fetchOrders, fetchActiveOrders])

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
    try {
      const authToken = sessionStorage.getItem("authToken")
      if (!authToken) {
        toast.error("Authorization token missing")
        return
      }

      const response = await fetch(`/api/shipment/order/${encodeURIComponent(orderId)}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Failed to fetch order details")
      }

      const payload = await response.json()
      const order = payload?.data || {}
      const consignee = order?.consignee || {}
      const shipmentDetails = order?.shipmentDetails || {}
      const pickupLocation = order?.pickupLocation || {}

      const awb =
        shipmentDetails?.order ||
        order?.awb ||
        order?.waybill ||
        order?.trackingNumber ||
        order?.orderId ||
        orderId

      const senderName = pickupLocation?.name || "Sender"
      const senderAddress = order?.pickupLocation?.address || order?.senderAddress || ""
      const receiverName = consignee?.name || "Receiver"
      const receiverAddress = consignee?.address || ""
      const receiverCity = consignee?.city || ""
      const receiverState = consignee?.state || ""
      const receiverPin = consignee?.pin || ""
      const receiverPhone = consignee?.phone || ""

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: [4, 6],
      })

      const marginX = 0.2
      const marginY = 0.2
      const labelWidth = 4
      const labelHeight = 6
      let y = 0.5

      // Outer border
      doc.setDrawColor(0)
      doc.setLineWidth(0.02)
      doc.rect(marginX, marginY, labelWidth - marginX * 2, labelHeight - marginY * 2)

      // Header
      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.text("SHIPPING LABEL", marginX + 0.1, y)

      // AWB box
      y += 0.28
      doc.setLineWidth(0.02)
      doc.rect(marginX + 0.1, y, labelWidth - (marginX * 2) - 0.2, 0.42)
      doc.setFontSize(12)
      doc.text(`Order ID: ${awb}`, marginX + 0.2, y + 0.28)

      // Sender block
      y += 0.7
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text("SENDER", marginX + 0.1, y)
      y += 0.16
      doc.setFont("helvetica", "normal")
      const senderLines = doc.splitTextToSize(
        `${senderName}${senderAddress ? `, ${senderAddress}` : ""}`,
        3.5
      )
      doc.text(senderLines, marginX + 0.1, y)
      y += senderLines.length * 0.16 + 0.08

      // Receiver block
      doc.setFont("helvetica", "bold")
      doc.text("RECEIVER", marginX + 0.1, y)
      y += 0.16
      doc.setFont("helvetica", "normal")
      const receiverLines = doc.splitTextToSize(
        `${receiverName}, ${receiverAddress}, ${receiverCity}, ${receiverState} ${receiverPin}`,
        3.5
      )
      doc.text(receiverLines, marginX + 0.1, y)
      y += receiverLines.length * 0.16 + 0.08
      if (receiverPhone) {
        doc.text(`Phone: ${receiverPhone}`, marginX + 0.1, y)
        y += 0.2
      }

      // Shipment details block
      doc.setFont("helvetica", "bold")
      doc.text("SHIPMENT DETAILS", marginX + 0.1, y)
      y += 0.16
      doc.setFont("helvetica", "normal")
      const shipmentLine = [
        shipmentDetails?.shippingMode ? `Mode: ${shipmentDetails.shippingMode}` : "",
        shipmentDetails?.paymentMode ? `Payment: ${shipmentDetails.paymentMode}` : "",
        shipmentDetails?.weight ? `Weight: ${shipmentDetails.weight}` : "",
      ].filter(Boolean).join(" | ")
      if (shipmentLine) {
        doc.text(shipmentLine, marginX + 0.1, y)
        y += 0.18
      }
      const dims = shipmentDetails?.dimensions || {}
      const dimensionLine =
        dims?.width || dims?.height
          ? `Dimensions: ${dims.width || "-"} x ${dims.height || "-"}`
          : ""
      if (dimensionLine) {
        doc.text(dimensionLine, marginX + 0.1, y)
      }

      const pdfUrl = doc.output("bloburl")
      window.open(pdfUrl, "_blank", "noopener,noreferrer")
    } catch (error: any) {
      console.error("Invoice generation failed:", error)
      toast.error(error?.message || "Failed to generate invoice")
    }
  }, [])

  const getStatusColor = useCallback((status: string) => {
    const statusLower = status?.toLowerCase()
    if (statusLower === "delivered") return "success"
    if (statusLower === "in transit") return "info"
    if (statusLower === "pending") return "warning"
    return "gray"
  }, [])

  // Memoize the current orders list based on active tab
  const currentOrdersList = useMemo(() => {
    return activeTab === "recent" ? orders : activeOrders
  }, [activeTab, orders, activeOrders])

  const renderOrdersTable = useCallback((ordersList: any[]) => {
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
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
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
                  className={`${index === 0
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
                      className={`font-medium ${index === 0
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
                        onClick={() => handleInvoice(order._id || order.orderId || order.bookingId)}
                        className="p-1.5 text-gray-700 hover:text-gray-900 dark:text-gray-300"
                        title="View Invoice"
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
  }, [loading, selectedOrders, handleSelectAll, handleView, handleEdit, handleDelete, getStatusColor, handleInvoice])

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
                className={`pb-3 font-medium transition-colors ${activeTab === "recent"
                    ? "text-orange-500 border-b-2 border-orange-500"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
              >
                Recent Bookings
              </button>
              <button
                onClick={() => setActiveTab("active")}
                className={`pb-3 font-medium transition-colors ${activeTab === "active"
                    ? "text-orange-500 border-b-2 border-orange-500"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
              >
                Active Orders
              </button>
            </div>
          </div>

          {/* Table */}
          {renderOrdersTable(currentOrdersList)}
        </Card>
      </div>
    </NavbarSidebarLayout>
  )
}

export default OrdersPage
