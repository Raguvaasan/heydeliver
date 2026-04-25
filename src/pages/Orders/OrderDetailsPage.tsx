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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

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

  const formatDate = (date) => {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4 pt-4 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Order Details
          </h1>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/orders")} color="gray" size="sm">
              Back
            </Button>
            <Button
              onClick={() => navigate(`/orders/edit/${id}`)}
              className="bg-orange-500 hover:bg-orange-600"
              size="sm"
            >
              Edit Order
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Order Information */}
          <Card className="p-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
              Order Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Booking ID</span>
                <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                  {selectedOrder.shipmentDetails.order}
                </span>
              </div>
               <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Awb</span>
                <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                  {selectedOrder.waybill}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Order Date</span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {formatDate(selectedOrder.bookingDate || selectedOrder.createdAt)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                <Badge color={getStatusColor(selectedOrder.status)}>
                  {selectedOrder.status || "Pending"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Amount</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  ₹{selectedOrder.amount || 0}
                </span>
              </div>
              {selectedOrder.paymentMode && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Payment Mode</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {selectedOrder.paymentMode}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Customer Information */}
          <Card className="p-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
              Customer Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Name</span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {selectedOrder.customer || selectedOrder.customerName || "-"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Phone</span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {selectedOrder.customerNumber || selectedOrder.phone || "-"}
                </span>
              </div>
              {selectedOrder.customerEmail && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Email</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {selectedOrder.customerEmail}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Delivery Address */}
          {selectedOrder.deliveryAddress && (
            <Card className="p-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                Delivery Address
              </h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  {selectedOrder.deliveryAddress}
                </p>
                {selectedOrder.deliveryCity && (
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {selectedOrder.deliveryCity}
                    {selectedOrder.deliveryState && `, ${selectedOrder.deliveryState}`}
                    {selectedOrder.deliveryPincode && ` - ${selectedOrder.deliveryPincode}`}
                  </p>
                )}
              </div>
            </Card>
          )}

          <Card className="p-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                Franchise Details
              </h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  {selectedOrder.pickupLocation.name}
                </p>
                
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {selectedOrder.pickupLocation.address}
                  </p>
               
              </div>
            </Card>

          {/* Shipping Details */}
          {selectedOrder.shippingMode && (
            <Card className="p-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                Shipping Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Shipping Mode</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {selectedOrder.shippingMode}
                  </span>
                </div>
                {selectedOrder.trackingNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Tracking No.</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {selectedOrder.trackingNumber}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Box Details */}
        {selectedOrder.boxes && selectedOrder.boxes.length > 0 && (
          <Card className="mt-4 p-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
              Box Details
            </h3>
            <div className="space-y-3">
              {selectedOrder.boxes.map((box: any, index: number) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                >
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Box {index + 1}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Type</span>
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        {box.packageType || "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Dimensions</span>
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        {box.length} × {box.breadth} × {box.height} cm
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Weight</span>
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        {box.weight} gm
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Order Timeline */}
        <Card className="mt-4 p-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
            Order Timeline
          </h3>
          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <div className="flex flex-col items-center mt-1">
                <div className="w-2.5 h-2.5 bg-orange-500 rounded-full shrink-0" />
                <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 mt-1" />
              </div>
              <div className="pb-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Order Created</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {selectedOrder.updatedAt !== selectedOrder.createdAt && (
              <div className="flex gap-3 items-start">
                <div className="flex flex-col items-center mt-1">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0" />
                  <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 mt-1" />
                </div>
                <div className="pb-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Order Updated</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(selectedOrder.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {selectedOrder.status === "Delivered" && (
              <div className="flex gap-3 items-start">
                <div className="mt-1">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Order Delivered</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
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
