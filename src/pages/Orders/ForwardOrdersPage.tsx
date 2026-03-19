import { FC, useEffect, useState } from "react";
import { Badge, Button, Card, Table, TextInput, Spinner } from "flowbite-react";
import { HiSearch, HiEye, HiRefresh, HiCheckCircle, HiClock, HiTruck } from "react-icons/hi";
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
  franchiseName?: string;
  franchise_name?: string;
  franchise?: string;
  pincode?: string;
  codAmount?: number | string;
  cod_amount?: number | string;
  productsDesc?: string;
  products_desc?: string;
  add?: string;
  address?: string;
  deliveryAddress?: string;
  state?: string;
  deliveryState?: string;
  country?: string;
  deliveryCountry?: string;
  phone?: string;
  customerNumber?: string;
  fromName?: string;
  fromAdd?: string;
  fromPin?: string;
  fromCity?: string;
  fromState?: string;
  fromCountry?: string;
  fromPhone?: string;
  returnPin?: string;
  return_pin?: string;
  returnCity?: string;
  return_city?: string;
  returnPhone?: string;
  return_phone?: string;
  returnAdd?: string;
  return_add?: string;
  returnState?: string;
  return_state?: string;
  returnCountry?: string;
  return_country?: string;
  weight?: number | string;
  shippingMode?: string;
  shipping_mode?: string;
  shipmentDetails?: {
    order?: string;
  };
}

const ForwardOrdersPage: FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<ForwardOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [totalOrders, setTotalOrders] = useState(0);
  const [recallingOrderId, setRecallingOrderId] = useState<string | null>(null);

  const fetchForwardOrders = async () => {
    setLoading(true);
    try {
      const params: any = { 
        page, 
        limit,
      };
      
      // Always add status filter (active, pending, or in-transit)
      if (statusFilter === "active") {
        params.status = "active,pending,in_transit,picked_up,out_for_delivery,manifested,shipped,dispatched";
      } else {
        params.status = statusFilter.replace("-", "_");
      }
      
      const response = await http.get("/shipment/orders", { params });
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
      setTotalOrders(
        response.data?.pagination?.total ||
        response.data?.total ||
        response.data?.totalCount ||
        normalizedOrders.length
      );
      
      toast.success(`Loaded ${normalizedOrders.length} orders`);
    } catch (error: any) {
      
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

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const handleRecallOrder = async (order: any) => {
    const rawOrderId = order.orderId || order.bookingId || order._id || order.id;
    if (!rawOrderId) {
      toast.error("Order ID not found");
      return;
    }

    const orderId = String(rawOrderId);
    const idParts = orderId.split("_");
    const apiOrderId = idParts[idParts.length - 1] || orderId;

    setRecallingOrderId(orderId);
    try {
      const payload = {
        name: order.consignee.name,
        add: order.consignee.address,
        pin:order.consignee.pin,
        city: order.consignee.city,
        state: order.consignee.state,
        country: order.consignee.country || "India",
        phone: order.consignee.phone,

        paymentMode: order.shipmentDetails.paymentMode,
        status: "in_transit",

        fromName: order.from.name,
        fromAdd: order.from.address,
        fromPin: order.from.pin,
        fromCity: order.from.city,
        fromState: order.from.state,
        fromCountry: order.from.country,
        fromPhone: order.from.phone,

        returnPin: order.pickupLocation.pincode,
        returnCity: order.pickupLocation.city || "",
        returnPhone: order.pickupLocation.phone,
        returnAdd: order.pickupLocation.address,
        returnState: order.pickupLocation.state || "",
        returnCountry: order.pickupLocation.country || "India",
        
        productsDesc: order.productsDesc || "",
        codAmount: String(order.codAmount || order.cod_amount || "0"),
        totalAmount: String(order.amount),
        weight: String(order.shipmentDetails.weight),
        shippingMode: order.shipmentDetails.shippingMode,
      };

      await http.put(`/shipment/order/${encodeURIComponent(apiOrderId)}`, payload);
      toast.success("Order recalled and set to active");
      await fetchForwardOrders();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to recall order";
      toast.error(errorMsg);
    } finally {
      setRecallingOrderId(null);
    }
  };

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

  const getOrderId = (order: ForwardOrder) =>
    order.shipmentDetails?.order || order.bookingId || order.orderId || order._id || order.id || "-";

  const totalPages = Math.max(1, Math.ceil(totalOrders / limit));

  const formatDateTime = (isoDate: string | undefined) => {
  if (!isoDate) return "-";

  const date = new Date(isoDate);

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

  const getStatusColor = (status?: string) =>
    status?.toLowerCase() === "delivered"
      ? "success"
      : status?.toLowerCase() === "pending"
        ? "warning"
        : status?.toLowerCase() === "cancelled"
          ? "failure"
          : "info";

  const getText = (value?: string | number, fallback = "-") => {
    if (value === null || value === undefined) return fallback;
    const text = String(value).trim();
    return text.length ? text : fallback;
  };

  return (
    <NavbarSidebarLayout>
      <div className="h-[calc(100vh-7rem)] md:h-full lg:h-[calc(100vh-7rem)] overflow-hidden px-4 flex flex-col">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Forward Orders
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View all forwarded orders in transit ({totalOrders} total)
          </p>
        </div>

        <Card className="overflow-hidden flex-1 flex flex-col min-w-0">
          <div className="flex h-full flex-col min-w-0">
          <div className="mb-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
            <TextInput
              icon={HiSearch}
              placeholder="Search by Order ID, AWB, or Customer Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button
              color="gray"
              onClick={fetchForwardOrders}
              disabled={loading}
              className="w-full md:w-auto"
            >
              <HiRefresh className="mr-2 h-5 w-5" />
              Refresh
            </Button>
          </div>

          {/* Status Tabs */}
          <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
            <nav className="flex flex-wrap gap-2 -mb-px" aria-label="Tabs">
              <button
                onClick={() => setStatusFilter("active")}
                className={`inline-flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
                  statusFilter === "active"
                    ? "border-orange-500 text-orange-600 dark:text-orange-500"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <HiCheckCircle className="h-5 w-5" />
                Active
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`inline-flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
                  statusFilter === "pending"
                    ? "border-orange-500 text-orange-600 dark:text-orange-500"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <HiClock className="h-5 w-5" />
                Pending
              </button>
              <button
                onClick={() => setStatusFilter("in-transit")}
                className={`inline-flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
                  statusFilter === "in-transit"
                    ? "border-orange-500 text-orange-600 dark:text-orange-500"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <HiTruck className="h-5 w-5" />
                In Transit
              </button>
            </nav>
          </div>

          <div className="hidden w-full min-w-0 flex-1 overflow-x-auto overflow-y-auto pb-2 pr-1 md:block [scrollbar-width:thin] [scrollbar-color:#64748b_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-500/70 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400/80">
            <Table hoverable className="min-w-[1100px] w-full table-fixed text-sm [&_th]:px-2 [&_th]:py-3 [&_td]:px-2 [&_td]:py-3">
              <colgroup>
                <col className="w-[15%]" />
                <col className="w-[13%]" />
                <col className="w-[10%]" />
                <col className="w-[12%]" />
                <col className="w-[9%]" />
                <col className="w-[9%]" />
                <col className="w-[10%]" />
                <col className="w-[6%]" />
                <col className="w-[6%]" />
                <col className="w-[10%]" />
              </colgroup>
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
                        <span className="block truncate" title={getText(getOrderId(order))}>
                          {getText(getOrderId(order))}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span
                          className="block truncate font-medium text-orange-600"
                          title={getText(order.franchiseName)}
                        >
                          {getText(order.franchiseName)}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span
                          className="block truncate"
                          title={getText(order.waybill || order.awb)}
                        >
                          {getText(order.waybill || order.awb)}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span
                          className="block truncate"
                          title={getText(order.consignee.name)}
                        >
                          {getText(order.consignee.name)}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span
                          className="block truncate"
                          title={getText(order.pickupLocation.address)}
                        >
                          {getText(order.pickupLocation.address)}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span
                          className="block truncate"
                          title={getText(order.consignee.city)}
                        >
                          {getText(order.consignee.city)}
                        </span>
                        {order.pin && (
                          <span className="text-xs text-gray-500 block truncate" title={`PIN: ${order.pin}`}>
                            PIN: {order.pin}
                          </span>
                        )}
                      </Table.Cell>
                     <Table.Cell>
  <span
    className="block truncate"
    title={formatDateTime(order.createdAt)}
  >
    {formatDateTime(order.createdAt)}
  </span>
</Table.Cell>
                      <Table.Cell>
                        <span className="block truncate" title={getText(order.status || "In Transit")}>
                          <Badge className="inline-flex" color={getStatusColor(order.status)}>
                            {getText(order.status || "In Transit")}
                          </Badge>
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex flex-col">
                          <span
                            className="block truncate font-medium"
                            title={`₹${Number(order.amount || order.totalAmount || 0).toFixed(2)}`}
                          >
                            ₹{Number(order.amount || order.totalAmount || 0).toFixed(2)}
                          </span>
                          {order.paymentMode && (
                            <span className="block truncate text-xs text-gray-500" title={getText(order.paymentMode)}>
                              {getText(order.paymentMode)}
                            </span>
                          )}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            color="light"
                            className="px-2"
                            title="View order"
                            onClick={() => {
                              const orderId = order.orderId || order._id || order.id;
                              navigate(`/orders/forward/${orderId}`);
                            }}
                          >
                            <HiEye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            color="gray"
                            title="Recall order"
                            onClick={() => handleRecallOrder(order)}
                            disabled={loading || recallingOrderId === String(order.orderId || order.bookingId || order._id || order.id)}
                          >
                            {recallingOrderId === String(order.orderId || order.bookingId || order._id || order.id) ? (
                              <Spinner size="sm" />
                            ) : (
                              <HiRefresh className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table>
          </div>

          <div className="md:hidden flex-1 overflow-y-auto space-y-3 [scrollbar-width:thin] [scrollbar-color:#64748b_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-500/70 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400/80">
            {loading ? (
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex justify-center items-center gap-2">
                  <Spinner size="lg" />
                  <span className="text-gray-600 dark:text-gray-300">Loading orders...</span>
                </div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
                <p className="text-gray-500 font-medium">No forward orders found</p>
                <p className="text-gray-400 text-sm mt-2">Forward orders will appear here</p>
              </div>
            ) : (
              filteredOrders.map((order: any) => (
                <div
                  key={order._id || order.id || order.orderId}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-sm break-all text-gray-900 dark:text-white">
                      {getOrderId(order)}
                    </p>
                    <Badge color={getStatusColor(order.status)}>{order.status || "In Transit"}</Badge>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <p className="text-gray-500">Franchise</p>
                    <p className="font-medium text-orange-600 text-right">
                      {order.franchiseName || "-"}
                    </p>
                    <p className="text-gray-500">AWB</p>
                    <p className="text-right break-all">{order.waybill || order.awb || "-"}</p>
                    <p className="text-gray-500">Customer</p>
                    <p className="text-right">{order.customer || order.customerName || order.consigneeName || "-"}</p>
                    <p className="text-gray-500">Destination</p>
                    <p className="text-right">
                      {order.destination || order.city || order.deliveryCity || "-"}
                    </p>
                    <p className="text-gray-500">Forward Date</p>
                    <p className="text-right">{(order.createdAt)}</p>
                    <p className="text-gray-500">Amount</p>
                    <p className="text-right font-medium">
                      ₹{Number(order.amount || order.totalAmount || 0).toFixed(2)}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <Button
                      size="sm"
                      color="light"
                      className="flex-1"
                      onClick={() => {
                        const orderId = order.orderId || order._id || order.id;
                        navigate(`/orders/forward/${orderId}`);
                      }}
                    >
                      <HiEye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      color="gray"
                      title="Recall order"
                      onClick={() => handleRecallOrder(order)}
                      disabled={loading || recallingOrderId === String(order.orderId || order.bookingId || order._id || order.id)}
                    >
                      {recallingOrderId === String(order.orderId || order.bookingId || order._id || order.id) ? (
                        <Spinner size="sm" />
                      ) : (
                        <HiRefresh className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          
            {/* Pagination */}
            {!loading && filteredOrders.length > 0 && (
              <div className="-mt-px flex flex-col gap-3 border-t pt-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-500 text-center sm:text-left">
                  Showing {orders.length} of {totalOrders} orders
                </div>
                <div className="flex items-center justify-center gap-2">
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
                    disabled={page >= totalPages || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </NavbarSidebarLayout>
  );
};

export default ForwardOrdersPage;
