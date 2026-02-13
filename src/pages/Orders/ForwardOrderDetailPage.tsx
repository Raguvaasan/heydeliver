import { FC, useEffect, useState } from "react";
import { Badge, Button, Card, Spinner } from "flowbite-react";
import { useNavigate, useParams } from "react-router-dom";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import http from "../../common/httpRequest";
import toast from "react-hot-toast";
import { HiArrowLeft } from "react-icons/hi";

interface ForwardOrderDetail {
  orderId: string;
  userId?: string;
  franchiseName?: string;
  status?: string;
  consigneeName?: string;
  consigneeNumber?: string;
  consigneeAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
  paymentMode?: string;
  amount?: string | number;
  weight?: string | number;
  dimensions?: string;
  productDescription?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

const ForwardOrderDetailPage: FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<ForwardOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOrderDetail(id);
    }
  }, [id]);

  const fetchOrderDetail = async (orderId: string) => {
    setLoading(true);
    try {
      const response = await http.get("/shipment/orders", { 
        params: { limit: 100 } // Fetch more to find the order
      });
      
      const ordersData = response.data?.data || [];
      const foundOrder = ordersData.find(
        (o: any) => 
          o.orderId === orderId || 
          o._id === orderId || 
          o.id === orderId
      );

      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        toast.error("Order not found");
        console.error("Order not found in list:", orderId);
      }
    } catch (error: any) {
      console.error("Error fetching order detail:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === "delivered") return "success";
    if (statusLower === "in-transit" || statusLower === "in transit") return "info";
    if (statusLower === "pending") return "warning";
    if (statusLower === "cancelled") return "failure";
    return "gray";
  };

  if (loading) {
    return (
      <NavbarSidebarLayout isFooter={false}>
        <div className="flex justify-center items-center h-64">
          <Spinner size="xl" />
        </div>
      </NavbarSidebarLayout>
    );
  }

  if (!order) {
    return (
      <NavbarSidebarLayout isFooter={false}>
        <div className="px-4 pt-6">
          <div className="flex justify-center items-center h-64 flex-col">
            <p className="text-red-500 text-xl font-semibold">Order not found</p>
            <Button
              onClick={() => navigate("/orders/forward")}
              color="gray"
              className="mt-4"
            >
              <HiArrowLeft className="mr-2 h-5 w-5" />
              Back to Forward Orders
            </Button>
          </div>
        </div>
      </NavbarSidebarLayout>
    );
  }

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4 pt-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Forward Order Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Order ID: {order.orderId}
            </p>
          </div>
          <Button
            onClick={() => navigate("/orders/forward")}
            color="gray"
          >
            <HiArrowLeft className="mr-2 h-5 w-5" />
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Information */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2">
              Order Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                <span className="font-semibold text-orange-600">
                  {order.orderId}
                </span>
              </div>
              
              {order.franchiseName && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 dark:text-gray-400">Franchise:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {order.franchiseName}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">Order Date:</span>
                <span className="font-medium">
                  {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}
                </span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <Badge color={getStatusColor(order.status)}>
                  {order.status || "Pending"}
                </Badge>
              </div>
              
              <div className="flex justify-between py-2 border-t pt-3">
                <span className="text-gray-600 dark:text-gray-400">Payment Mode:</span>
                <span className="font-medium">{order.paymentMode || "-"}</span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                <span className="font-bold text-lg text-gray-900 dark:text-white">
                  ₹{Number(order.amount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </Card>

          {/* Customer Information */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2">
              Customer Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">Name:</span>
                <span className="font-medium">
                  {order.consigneeName || "-"}
                </span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                <span className="font-medium">
                  {order.consigneeNumber || "-"}
                </span>
              </div>
              
              {order.consigneeAddress && (
                <div className="py-2">
                  <span className="text-gray-600 dark:text-gray-400 block mb-1">Address:</span>
                  <p className="font-medium text-sm">
                    {order.consigneeAddress}
                  </p>
                </div>
              )}
              
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">City:</span>
                <span className="font-medium">{order.city || "-"}</span>
              </div>
              
              {order.state && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 dark:text-gray-400">State:</span>
                  <span className="font-medium">{order.state}</span>
                </div>
              )}
              
              {order.pincode && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 dark:text-gray-400">Pincode:</span>
                  <span className="font-medium">{order.pincode}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Shipment Details */}
          {(order.weight || order.dimensions || order.productDescription) && (
            <Card className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2">
                Shipment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {order.weight && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 block mb-1">Weight:</span>
                    <span className="font-medium">{order.weight} kg</span>
                  </div>
                )}
                
                {order.dimensions && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 block mb-1">Dimensions:</span>
                    <span className="font-medium">{order.dimensions}</span>
                  </div>
                )}
                
                {order.productDescription && (
                  <div className="md:col-span-3">
                    <span className="text-gray-600 dark:text-gray-400 block mb-1">Product Description:</span>
                    <p className="font-medium text-sm">{order.productDescription}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Additional Info */}
        {order.updatedAt && (
          <Card className="mt-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Last Updated:</span>
              <span className="text-sm font-medium">
                {new Date(order.updatedAt).toLocaleString()}
              </span>
            </div>
          </Card>
        )}
      </div>
    </NavbarSidebarLayout>
  );
};

export default ForwardOrderDetailPage;
