import { FC, useState } from "react";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import { Card, Button, Table, Badge, Select, Label } from "flowbite-react";
import { HiDownload, HiTrendingUp, HiTrendingDown } from "react-icons/hi";
import toast from "react-hot-toast";

const FranchiseWiseReportPage: FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("this-month");

  const franchiseData = [
    {
      name: "Chennai Central",
      totalOrders: 1245,
      delivered: 1180,
      pending: 45,
      rto: 20,
      revenue: 125000,
      growth: 12.5,
    },
    {
      name: "Mumbai Hub",
      totalOrders: 2150,
      delivered: 2050,
      pending: 80,
      rto: 20,
      revenue: 215000,
      growth: 8.3,
    },
    {
      name: "Bangalore Branch",
      totalOrders: 1850,
      delivered: 1770,
      pending: 60,
      rto: 20,
      revenue: 185000,
      growth: -2.1,
    },
    {
      name: "Delhi North",
      totalOrders: 1680,
      delivered: 1590,
      pending: 70,
      rto: 20,
      revenue: 168000,
      growth: 15.7,
    },
  ];

  const handleExport = () => {
    toast.success("Exporting franchise report...");
  };

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4 pt-6 pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Franchise Wise Report
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Performance analysis across all franchise locations
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6 border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label htmlFor="period" value="Select Period" className="mb-2 text-gray-700 dark:text-gray-200" />
              <Select
                id="period"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this-week">This Week</option>
                <option value="this-month">This Month</option>
                <option value="last-month">Last Month</option>
                <option value="custom">Custom Range</option>
              </Select>
            </div>
            <Button color="dark" onClick={handleExport}>
              <HiDownload className="mr-2 h-5 w-5" />
              Export Report
            </Button>
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">Total Franchises</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{franchiseData.length}</p>
            </div>
          </Card>
          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {franchiseData.reduce((sum, f) => sum + f.totalOrders, 0).toLocaleString()}
              </p>
            </div>
          </Card>
          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">Delivered</p>
              <p className="text-3xl font-bold text-green-600">
                {franchiseData.reduce((sum, f) => sum + f.delivered, 0).toLocaleString()}
              </p>
            </div>
          </Card>
          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">Total Revenue</p>
              <p className="text-3xl font-bold text-blue-600">
                ₹{franchiseData.reduce((sum, f) => sum + f.revenue, 0).toLocaleString()}
              </p>
            </div>
          </Card>
        </div>

        {/* Franchise Table */}
        <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Franchise Performance
          </h3>
          <div className="overflow-x-auto">
            <Table hoverable className="[&_thead]:bg-gray-100 dark:[&_thead]:bg-gray-900 [&_thead_th]:text-gray-700 dark:[&_thead_th]:text-gray-200 [&_tbody]:divide-gray-200 dark:[&_tbody]:divide-gray-700">
              <Table.Head>
                <Table.HeadCell className="bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200">Franchise Name</Table.HeadCell>
                <Table.HeadCell className="bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200">Total Orders</Table.HeadCell>
                <Table.HeadCell className="bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200">Delivered</Table.HeadCell>
                <Table.HeadCell className="bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200">Pending</Table.HeadCell>
                <Table.HeadCell className="bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200">RTO</Table.HeadCell>
                <Table.HeadCell className="bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200">Revenue</Table.HeadCell>
                <Table.HeadCell className="bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200">Growth</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y divide-gray-200 dark:divide-gray-700">
                {franchiseData.map((franchise, index) => (
                  <Table.Row key={index} className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700">
                    <Table.Cell className="font-medium text-gray-900 dark:text-white">
                      {franchise.name}
                    </Table.Cell>
                    <Table.Cell className="text-gray-700 dark:text-gray-300">{franchise.totalOrders}</Table.Cell>
                    <Table.Cell>
                      <Badge color="success">{franchise.delivered}</Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color="warning">{franchise.pending}</Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color="failure">{franchise.rto}</Badge>
                    </Table.Cell>
                    <Table.Cell className="font-semibold text-gray-900 dark:text-gray-200">
                      ₹{franchise.revenue.toLocaleString()}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-1">
                        {franchise.growth > 0 ? (
                          <>
                            <HiTrendingUp className="text-green-600" />
                            <span className="text-green-600 font-semibold">
                              +{franchise.growth}%
                            </span>
                          </>
                        ) : (
                          <>
                            <HiTrendingDown className="text-red-600" />
                            <span className="text-red-600 font-semibold">
                              {franchise.growth}%
                            </span>
                          </>
                        )}
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </Card>
      </div>
    </NavbarSidebarLayout>
  );
};

export default FranchiseWiseReportPage;
