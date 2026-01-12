import { FC, useEffect } from "react"
import { Badge, Button, Card, Spinner } from "flowbite-react"
import { useNavigate, useParams } from "react-router-dom"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { useOrderStore } from "../../store/orderStore"

const OrderDetailsPage: FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { selectedOrder, getOrderById, loading } = useOrderStore()

  useEffect(() => {
    if (id) {
      getOrderById(id)
    }
  }, [id, getOrderById])

  if (loading || !selectedOrder) {
    return (
      <NavbarSidebarLayout isFooter={false}>
        <div className="flex justify-center items-center h-64">
          {loading ? <Spinner size="xl" /> : <p className="text-red-500">Order not found</p>}
        </div>
      </NavbarSidebarLayout>
    )
  }

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase()
    if (statusLower === "delivered") return "success"
    if (statusLower === "in transit") return "info"
    if (statusLower === "pending") return "warning"
    return "gray"
  }

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4 pt-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Order Details
          </h1>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate("/orders")}
              color="gray"
            >
              Back
            </Button>
            <Button
              onClick={() => navigate(`/orders/edit/${id}`)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Edit Order
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Information */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Order Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-semibold text-orange-600">
                  {selectedOrder.bookingId || selectedOrder._id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span className="font-medium">
                  {selectedOrder.bookingDate || new Date(selectedOrder.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge color={getStatusColor(selectedOrder.status)}>
                  {selectedOrder.status || "Pending"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-lg">₹{selectedOrder.amount || 0}</span>
              </div>
              {selectedOrder.paymentMode && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Mode:</span>
                  <span className="font-medium">{selectedOrder.paymentMode}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Customer Information */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Customer Information
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 block mb-1">Customer Name:</span>
                <span className="font-medium">
                  {selectedOrder.customer || selectedOrder.customerName || "-"}
                </span>
              </div>
              <div>
                <span className="text-gray-600 block mb-1">Phone Number:</span>
                <span className="font-medium">
                  {selectedOrder.customerNumber || selectedOrder.phone || "-"}
                </span>
              </div>
              {selectedOrder.customerEmail && (
                <div>
                  <span className="text-gray-600 block mb-1">Email:</span>
                  <span className="font-medium">{selectedOrder.customerEmail}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Delivery Address */}
          {selectedOrder.deliveryAddress && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Delivery Address
              </h3>
              <div className="space-y-3">
                <p className="text-gray-700">{selectedOrder.deliveryAddress}</p>
                {selectedOrder.deliveryCity && (
                  <p className="text-gray-700">
                    {selectedOrder.deliveryCity}
                    {selectedOrder.deliveryState && `, ${selectedOrder.deliveryState}`}
                    {selectedOrder.deliveryPincode && ` - ${selectedOrder.deliveryPincode}`}
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Shipping Details */}
          {selectedOrder.shippingMode && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Shipping Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping Mode:</span>
                  <span className="font-medium">{selectedOrder.shippingMode}</span>
                </div>
                {selectedOrder.trackingNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tracking Number:</span>
                    <span className="font-medium">{selectedOrder.trackingNumber}</span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Box Details */}
        {selectedOrder.boxes && selectedOrder.boxes.length > 0 && (
          <Card className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Box Details
            </h3>
            <div className="space-y-4">
              {selectedOrder.boxes.map((box: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium mb-3">Box {index + 1}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <p className="font-medium">{box.packageType || "-"}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Dimensions:</span>
                      <p className="font-medium">
                        {box.length} x {box.breadth} x {box.height} cm
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Weight:</span>
                      <p className="font-medium">{box.weight} gm</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Order Timeline / History */}
        <Card className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Order Timeline
          </h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <div className="w-0.5 h-full bg-gray-300"></div>
              </div>
              <div className="pb-4">
                <p className="font-medium">Order Created</p>
                <p className="text-sm text-gray-500">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {selectedOrder.updatedAt !== selectedOrder.createdAt && (
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div className="w-0.5 h-full bg-gray-300"></div>
                </div>
                <div className="pb-4">
                  <p className="font-medium">Order Updated</p>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedOrder.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {selectedOrder.status === "Delivered" && (
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div>
                  <p className="font-medium">Order Delivered</p>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedOrder.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </NavbarSidebarLayout>
  )
}

export default OrderDetailsPage
