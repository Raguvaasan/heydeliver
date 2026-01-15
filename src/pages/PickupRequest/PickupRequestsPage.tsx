import { FC, useEffect, useState } from "react";
import { Button, Card, Table, Badge, TextInput } from "flowbite-react";
import { HiPlus, HiSearch } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { usePickupStore } from "../../store/pickupStore";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";

const PickupRequestsPage: FC = () => {
  const navigate = useNavigate();
  const { pickupRequests, loading, fetchPickupRequests } = usePickupStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPickupRequests();
  }, [fetchPickupRequests]);

  const handleCreatePickup = () => {
    navigate("/orders/pickup/create");
  };

  const filteredRequests = pickupRequests.filter((request) =>
    request.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "warning",
      scheduled: "info",
      completed: "success",
      cancelled: "failure",
    };

    return (
      <Badge color={statusColors[status.toLowerCase()] || "gray"}>
        {status}
      </Badge>
    );
  };

  return (
    <NavbarSidebarLayout>
      <div className="px-4 pt-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Pickup Requests
          </h1>
          <Button color="dark" onClick={handleCreatePickup}>
            <HiPlus className="mr-2 h-5 w-5" />
            Create Pickup Request
          </Button>
        </div>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="w-96">
              <TextInput
                icon={HiSearch}
                placeholder="Search by pickup ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Pickup ID</Table.HeadCell>
                <Table.HeadCell>Location</Table.HeadCell>
                <Table.HeadCell>Pickup Date</Table.HeadCell>
                <Table.HeadCell>Time Slot</Table.HeadCell>
                <Table.HeadCell>Orders Count</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell>Created At</Table.HeadCell>
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
                ) : filteredRequests.length === 0 ? (
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
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                        <p className="text-gray-500 font-medium text-lg">
                          No pickup requests found
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
                          Create your first pickup request to get started
                        </p>
                        <Button
                          color="dark"
                          className="mt-4"
                          onClick={handleCreatePickup}
                        >
                          <HiPlus className="mr-2 h-5 w-5" />
                          Create Pickup Request
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  filteredRequests.map((request) => (
                    <Table.Row
                      key={request.id}
                      className="bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <Table.Cell className="font-medium text-gray-900 dark:text-white">
                        {request.id}
                      </Table.Cell>
                      <Table.Cell>{request.locationId}</Table.Cell>
                      <Table.Cell>{request.pickupDate}</Table.Cell>
                      <Table.Cell>{request.slotId}</Table.Cell>
                      <Table.Cell>{request.orderIds.length}</Table.Cell>
                      <Table.Cell>{getStatusBadge(request.status)}</Table.Cell>
                      <Table.Cell>{request.createdAt}</Table.Cell>
                      <Table.Cell>
                        <Button
                          size="sm"
                          color="light"
                          onClick={() =>
                            navigate(`/orders/pickup/${request.id}`)
                          }
                        >
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

export default PickupRequestsPage;
