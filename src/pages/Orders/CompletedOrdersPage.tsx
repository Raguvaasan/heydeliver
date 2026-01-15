import { FC, useEffect, useState } from "react";
import { Badge, Button, Card, Table, TextInput } from "flowbite-react";
import { HiSearch, HiEye } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";

interface CompletedOrder {
  id: string;
  awb: string;
  customerName: string;
  destination: string;
  deliveredDate: string;
  status: string;
  amount: number;
}

const CompletedOrdersPage: FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders] = useState<CompletedOrder[]>([]);

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.awb.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <NavbarSidebarLayout>
      <div className="px-4 pt-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Completed Orders
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View all successfully delivered orders
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
                <Table.HeadCell>Destination</Table.HeadCell>
                <Table.HeadCell>Delivered Date</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell>Amount</Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {loading ? (
                  <Table.Row>
                    <Table.Cell colSpan={8} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <span className="ml-2">Loading...</span>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ) : filteredOrders.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={8} className="text-center py-12">
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
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-gray-500 font-medium text-lg">
                          No completed orders found
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
                          Completed orders will appear here
                        </p>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  filteredOrders.map((order) => (
                    <Table.Row
                      key={order.id}
                      className="bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <Table.Cell className="font-medium text-gray-900 dark:text-white">
                        {order.id}
                      </Table.Cell>
                      <Table.Cell>{order.awb}</Table.Cell>
                      <Table.Cell>{order.customerName}</Table.Cell>
                      <Table.Cell>{order.destination}</Table.Cell>
                      <Table.Cell>{order.deliveredDate}</Table.Cell>
                      <Table.Cell>
                        <Badge color="success">Delivered</Badge>
                      </Table.Cell>
                      <Table.Cell>₹{order.amount.toFixed(2)}</Table.Cell>
                      <Table.Cell>
                        <Button
                          size="sm"
                          color="light"
                          onClick={() => navigate(`/orders/${order.id}`)}
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

export default CompletedOrdersPage;
