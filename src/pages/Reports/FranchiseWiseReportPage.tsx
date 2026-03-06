import { FC, useState, useEffect } from "react";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import { Card, Button, Table, Badge, Select, Label, Spinner } from "flowbite-react";
import { HiDownload, HiTrendingUp, HiTrendingDown } from "react-icons/hi";
import toast from "react-hot-toast";
import http from "../../common/httpRequest";

interface FranchiseData {
  franchiseId: string;
  franchiseName: string;
  totalOrders: number;
  delivered: number;
  pending: number;
  rto: number;
  revenue: number;
  growth: string;
}

const FranchiseWiseReportPage: FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("this-month");
  const [franchiseData, setFranchiseData] = useState<FranchiseData[]>([]);
  const [loading, setLoading] = useState(false);
  const [summaryStats, setSummaryStats] = useState({
    totalFranchises: 0,
    totalOrders: 0,
    totalDelivered: 0,
    totalRevenue: 0,
  });

  // Fetch franchise report data
  useEffect(() => {
    fetchFranchiseReport();
  }, [selectedPeriod]);

  const fetchFranchiseReport = async () => {
    setLoading(true);
    try {
      const params: any = { period: "month" };
      
      // Add type=previous for last-month filter
      if (selectedPeriod === "month") {
        params.type = "previous";
      }
      
      const response = await http.get("/admin/dashboard/franchise-report", {
        params,
        timeout: 15000,
      });

      const apiData = response.data?.data;
      
      // Extract overview and franchise performance from API response
      const overview = apiData?.overview || {};
      const franchises = apiData?.franchisePerformance || [];
      
      setFranchiseData(franchises);

      // Set summary stats from API overview
      const stats = {
        totalFranchises: overview.totalFranchises || 0,
        totalOrders: overview.totalOrders || 0,
        totalDelivered: overview.delivered || 0,
        totalRevenue: overview.revenue || 0,
      };
      setSummaryStats(stats);
    } catch (error: any) {
      console.error("Failed to fetch franchise report:", error);
      toast.error(error.message || "Failed to load franchise report");
      setFranchiseData([]);
      setSummaryStats({
        totalFranchises: 0,
        totalOrders: 0,
        totalDelivered: 0,
        totalRevenue: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (franchiseData.length === 0) {
      toast.error("No data to export");
      return;
    }
    toast.success("Exporting franchise report...");
    // TODO: Implement export functionality
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
                disabled={loading}
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this-week">This Week</option>
                <option value="this-month">This Month</option>
                <option value="last-month">Last Month</option>
                {/* <option value="custom">Custom Range</option> */}
              </Select>
            </div>
            <Button color="dark" onClick={handleExport} disabled={loading}>
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
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{summaryStats.totalFranchises}</p>
            </div>
          </Card>
          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {summaryStats.totalOrders.toLocaleString()}
              </p>
            </div>
          </Card>
          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">Delivered</p>
              <p className="text-3xl font-bold text-green-600">
                {summaryStats.totalDelivered.toLocaleString()}
              </p>
            </div>
          </Card>
          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">Total Revenue</p>
              <p className="text-3xl font-bold text-blue-600">
                ₹{summaryStats.totalRevenue.toLocaleString()}
              </p>
            </div>
          </Card>
        </div>

        {/* Franchise Table */}
        <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Franchise Performance
          </h3>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner color="info" size="lg" />
            </div>
          ) : franchiseData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No franchise data available</p>
            </div>
          ) : (
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
                    <Table.Row key={franchise.franchiseId || index} className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700">
                      <Table.Cell className="font-medium text-gray-900 dark:text-white">
                        {franchise.franchiseName}
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
                        ₹{franchise.revenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-1">
                          {parseFloat(franchise.growth) > 0 ? (
                            <>
                              <HiTrendingUp className="text-green-600" />
                              <span className="text-green-600 font-semibold">
                                +{parseFloat(franchise.growth).toFixed(1)}%
                              </span>
                            </>
                          ) : (
                            <>
                              <HiTrendingDown className="text-red-600" />
                              <span className="text-red-600 font-semibold">
                                {parseFloat(franchise.growth).toFixed(1)}%
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
          )}
        </Card>
      </div>
    </NavbarSidebarLayout>
  );
};

export default FranchiseWiseReportPage;
