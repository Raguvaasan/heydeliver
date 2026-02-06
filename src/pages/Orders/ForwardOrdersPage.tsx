import { FC, useEffect, useState } from "react";
import { Badge, Button, Card, Table, TextInput } from "flowbite-react";
import { HiSearch, HiEye } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import axios from "axios";
import http from "../../common/httpRequest";

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
  sellerAdd?: string;
  seller_add?: string;
  origin?: string;
  destination?: string;
  city?: string;
  deliveryCity?: string;
  forwardDate?: string;
  bookingDate?: string;
  createdAt?: string;
  status?: string;
  amount?: number | string;
  totalAmount?: number | string;
}

const ForwardOrdersPage: FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<ForwardOrder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchForwardOrders = async () => {
      setLoading(true);
      try {
        const authToken = sessionStorage.getItem("authToken");
        const params = { page: 1, limit: 50, _ts: Date.now() };
        const [primaryRes, shipmentRes] = await Promise.allSettled([
          http.get("/orders", { params, validateStatus: () => true }),
          axios.get("/api/shipment/orders", {
            params,
            headers: {
              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            },
            timeout: 30000,
            validateStatus: () => true,
          }),
        ]);

        const primaryList =
          primaryRes.status === "fulfilled" &&
          primaryRes.value.status >= 200 &&
          primaryRes.value.status < 300 &&
          Array.isArray(primaryRes.value.data?.data)
            ? primaryRes.value.data.data
            : [];

        const shipmentRaw =
          shipmentRes.status === "fulfilled" &&
          shipmentRes.value.status >= 200 &&
          shipmentRes.value.status < 300
            ? shipmentRes.value.data?.data ?? shipmentRes.value.data?.orders ?? shipmentRes.value.data?.shipments ?? []
            : [];
        const shipmentList = Array.isArray(shipmentRaw) ? shipmentRaw : [];

        const normalizedShipment = shipmentList.map((item: any) => ({
          ...item,
          _id: item?._id || item?.id || item?.orderId,
          bookingId: item?.bookingId || item?.orderId || item?.order,
          customer: item?.customer || item?.customerName || item?.consigneeName,
        }));

        const merged = Array.from(
          new Map(
            [...primaryList, ...normalizedShipment].map((order: any) => [
              order?._id || order?.id || order?.orderId || order?.bookingId || JSON.stringify(order),
              order,
            ])
          ).values()
        );

        setOrders(merged);
      } catch (error) {
        console.error("Failed to fetch forward orders:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchForwardOrders();
  }, []);

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
            View all forwarded orders in transit
          </p>
        </div>

        <Card>
          <div className="mb-4">
            <TextInput
              icon={HiSearch}
              placeholder="Search by Order ID, AWB, or Customer Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-96"
            />
          </div>

          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Order ID</Table.HeadCell>
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
                    <Table.Cell colSpan={9} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <span className="ml-2">Loading...</span>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ) : filteredOrders.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={9} className="text-center py-12">
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
                      <Table.Cell>{order.waybill || order.awb || "-"}</Table.Cell>
                      <Table.Cell>{order.customer || order.customerName || order.consigneeName || "-"}</Table.Cell>
                      <Table.Cell>{order.origin || order.sellerAdd || order.seller_add || "-"}</Table.Cell>
                      <Table.Cell>{order.destination || order.city || order.deliveryCity || "-"}</Table.Cell>
                      <Table.Cell>{order.forwardDate || order.bookingDate || (order.createdAt ? new Date(order.createdAt).toLocaleString() : "-")}</Table.Cell>
                      <Table.Cell>
                        <Badge color="info">{order.status || "In Transit"}</Badge>
                      </Table.Cell>
                      <Table.Cell>₹{Number(order.amount || order.totalAmount || 0).toFixed(2)}</Table.Cell>
                      <Table.Cell>
                        <Button
                          size="sm"
                          color="light"
                          onClick={() => navigate(`/orders/${order._id || order.id || order.orderId}`)}
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
        </Card>
      </div>
    </NavbarSidebarLayout>
  );
};

export default ForwardOrdersPage;
