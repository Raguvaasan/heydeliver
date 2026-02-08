import { FC, useEffect, useState } from "react";
import { Badge, Button, Card, Table, TextInput, Spinner, Select } from "flowbite-react";
import { HiSearch, HiEye } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import http from "../../common/httpRequest";
import toast from "react-hot-toast";

interface ForwardOrder {
  _id?: string;
  id?: string;
  orderId?: string;
  bookingId?: string;
  waybill?: string;
  awb?: string;
  customer?: string;
  customerName?: string;
  consigneeName?: string;
  name?: string;
  sellerAdd?: string;
  seller_add?: string;
  origin?: string;
  destination?: string;
  city?: string;
  deliveryCity?: string;
  pin?: string;
  forwardDate?: string;
  bookingDate?: string;
  createdAt?: string;
  status?: string;
  amount?: number | string;
  totalAmount?: number | string;
  total_amount?: number | string;
  paymentMode?: string;
  payment_mode?: string;
}

const ForwardOrdersPage: FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<ForwardOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [totalOrders, setTotalOrders] = useState(0);

  const fetchForwardOrders = async () => {
    setLoading(true);
    try {
      console.log("=== FETCHING FORWARD ORDERS ===");
      console.log("Page:", page, "Limit:", limit, "Status:", statusFilter);
      
      const params: any = { 
        page, 
        limit,
      };
      
      // Add status filter if not "all"
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      
      console.log("Request params:", params);
      
      // Call the backend API endpoint (http already has /api as baseURL)
      const response = await http.get("/shipment/orders", { params });
      
      console.log("API Response:", response.data);
      
      // Handle different response structures
      let ordersData: ForwardOrder[] = [];
      
      if (response.data?.data && Array.isArray(response.data.data)) {
        ordersData = response.data.data;
      } else if (response.data?.orders && Array.isArray(response.data.orders)) {
        ordersData = response.data.orders;
      } else if (response.data?.shipments && Array.isArray(response.data.shipments)) {
        ordersData = response.data.shipments;
      } else if (Array.isArray(response.data)) {
        ordersData = response.data;
      }
      
      console.log("Parsed orders:", ordersData.length, "orders");
      
      // Normalize the order data
      const normalizedOrders = ordersData.map((order: any) => ({
        _id: order._id || order.id || order.orderId,
        orderId: order.orderId,
        bookingId: order.bookingId || order.orderId || order.order,
        waybill: order.waybill || order.awb,
        customer: order.customer || order.customerName || order.consigneeName || order.name,
        franchiseName: order.franchiseName || order.franchise_name || order.franchise,
        origin: order.origin || order.sellerAdd || order.seller_add,
        destination: order.destination || order.city || order.deliveryCity,
        pin: order.pin || order.pincode,
        forwardDate: order.forwardDate || order.bookingDate || order.createdAt,
        status: order.status,
        amount: order.amount || order.totalAmount || order.total_amount,
        paymentMode: order.paymentMode || order.payment_mode,
        ...order
      }));
      
      setOrders(normalizedOrders);
      setTotalOrders(response.data?.total || response.data?.totalCount || normalizedOrders.length);
      
      toast.success(`Loaded ${normalizedOrders.length} orders`);
    } catch (error: any) {
      console.error("Failed to fetch forward orders:", error);
      console.error("Error response:", error.response?.data);
      
      const errorMsg = error.response?.data?.message || error.message || "Failed to fetch orders";
      toast.error(errorMsg);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForwardOrders();
  }, [page, limit, statusFilter]);

  const filteredOrders = orders.filter(
    (order: any) =>
      String(order.bookingId || order.orderId || order._id || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      String(order.waybill || order.awb || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      String(order.customer || order.customerName || order.consigneeName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <NavbarSidebarLayout>
      <div className="px-4 pt-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Forward Orders
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View all forwarded orders in transit ({totalOrders} total)
          </p>
        </div>

        <Card>
          <div className="mb-4 flex flex-col md:flex-row gap-4">
            <TextInput
              icon={HiSearch}
              placeholder="Search by Order ID, AWB, or Customer Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-48"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </Select>
            <Button
              color="gray"
              onClick={fetchForwardOrders}
              disabled={loading}
            >
              Refresh
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Order ID</Table.HeadCell>
                <Table.HeadCell>Franchise Name</Table.HeadCell>
                <Table.HeadCell>AWB Number</Table.HeadCell>
                <Table.HeadCell>Customer Name</Table.HeadCell>
                <Table.HeadCell>Origin</Table.HeadCell>
                <Table.HeadCell>Destination</Table.HeadCell>
                <Table.HeadCell>Forward Date</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell>Amount</Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {loading ? (
                  <Table.Row>
                    <Table.Cell colSpan={10} className="text-center py-8">
                      <div className="flex justify-center items-center gap-2">
                        <Spinner size="lg" />
                        <span className="text-gray-600">Loading orders...</span>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ) : filteredOrders.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={10} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          className="w-16 h-16 text-gray-300 mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                        <p className="text-gray-500 font-medium text-lg">
                          No forward orders found
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
                          Forward orders will appear here
                        </p>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  filteredOrders.map((order: any) => (
                    <Table.Row
                      key={order._id || order.id || order.orderId}
                      className="bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <Table.Cell className="font-medium text-gray-900 dark:text-white">
                        {order.bookingId || order.orderId || order._id || "-"}
                      </Table.Cell>
                      <Table.Cell>
                        <span className="font-medium text-orange-600">
                          {order.franchiseName || "-"}
                        </span>
                      </Table.Cell>
                      <Table.Cell>{order.waybill || order.awb || "-"}</Table.Cell>
                      <Table.Cell>{order.customer || order.customerName || order.consigneeName || "-"}</Table.Cell>
                      <Table.Cell>{order.origin || order.sellerAdd || order.seller_add || "-"}</Table.Cell>
                      <Table.Cell>
                        {order.destination || order.city || order.deliveryCity || "-"}
                        {order.pin && <span className="text-xs text-gray-500 block">PIN: {order.pin}</span>}
                      </Table.Cell>
                      <Table.Cell>
                        {order.forwardDate || order.bookingDate || (order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-")}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge 
                          color={
                            order.status?.toLowerCase() === "delivered" ? "success" :
                            order.status?.toLowerCase() === "pending" ? "warning" :
                            order.status?.toLowerCase() === "cancelled" ? "failure" :
                            "info"
                          }
                        >
                          {order.status || "In Transit"}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex flex-col">
                          <span className="font-medium">₹{Number(order.amount || order.totalAmount || 0).toFixed(2)}</span>
                          {order.paymentMode && (
                            <span className="text-xs text-gray-500">{order.paymentMode}</span>
                          )}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Button
                          size="sm"
                          color="light"
                          onClick={() => {
                            const orderId = order.orderId || order._id || order.id;
                            console.log("Navigating to forward order:", orderId);
                            navigate(`/orders/forward/${orderId}`);
                          }}
                        >
                          <HiEye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table>
          </div>
          
          {/* Pagination */}
          {!loading && filteredOrders.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-500">
                Showing {orders.length} of {totalOrders} orders
              </div>
              <div className="flex gap-2">
                <Button
                  color="gray"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1 || loading}
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 text-sm text-gray-700">
                  Page {page}
                </span>
                <Button
                  color="gray"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={orders.length < limit || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </NavbarSidebarLayout>
  );
};

export default ForwardOrdersPage;
