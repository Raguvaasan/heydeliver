import { FC, useState, useEffect } from "react";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import { Card, Button, Select, Label, TextInput, Spinner } from "flowbite-react";
import { HiDownload, HiTrendingUp } from "react-icons/hi";
import toast from "react-hot-toast";
import { useReportsStore, PeriodType } from "../../store/reportsStore";

const TotalOrdersReportPage: FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("thisMonth");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { ordersReport, ordersReportLoading, fetchOrdersReport } = useReportsStore();

  // Fetch data on mount and when period changes
  useEffect(() => {
    if (selectedPeriod === "customRange") {
      if (startDate && endDate) {
        fetchOrdersReport(selectedPeriod, startDate, endDate);
      }
    } else {
      fetchOrdersReport(selectedPeriod);
    }
  }, [selectedPeriod, startDate, endDate, fetchOrdersReport]);

  const handleExport = () => {
    if (!ordersReport) {
      toast.error("No data to export");
      return;
    }
    toast.success("Exporting orders report...");
    // TODO: Implement actual export functionality
  };

  // Calculate stats from API data
  const orderStats = ordersReport ? {
    total: ordersReport.summary.totalOrders,
    delivered: ordersReport.statusBreakdown.delivered.count,
    inTransit: ordersReport.statusBreakdown.inTransit.count,
    pending: ordersReport.statusBreakdown.pending.count,
    rto: ordersReport.statusBreakdown.rto.count,
    growth: 18.5, // This might need to come from API
  } : null;

  const dailyOrders = ordersReport
    ? Object.entries(ordersReport.dailyTrend).map(([date, orders]) => ({
        date,
        orders,
      }))
    : [];

  const maxOrders = dailyOrders.length > 0 ? Math.max(...dailyOrders.map((d) => d.orders)) : 1;

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4 pt-6 pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Total Orders Report
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Comprehensive orders analytics and trends
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6 border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-col gap-4">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="period" value="Select Period" className="mb-2 text-gray-700 dark:text-gray-200" />
                <Select
                  id="period"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as PeriodType)}
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="thisWeek">This Week</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="customRange">Custom Range</option>
                </Select>
              </div>
              <Button color="dark" onClick={handleExport} disabled={ordersReportLoading || !ordersReport}>
                <HiDownload className="mr-2 h-5 w-5" />
                Export Report
              </Button>
            </div>

            {/* Custom Date Range Inputs */}
            {selectedPeriod === "customRange" && (
              <div className="flex items-end gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex-1">
                  <Label htmlFor="startDate" value="Start Date" className="mb-2 text-gray-700 dark:text-gray-200" />
                  <TextInput
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="endDate" value="End Date" className="mb-2 text-gray-700 dark:text-gray-200" />
                  <TextInput
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Loading State */}
        {ordersReportLoading && (
          <div className="flex items-center justify-center h-64 mb-6">
            <Spinner aria-label="Loading report..." size="lg" />
          </div>
        )}

        {/* Error State */}
        {!ordersReportLoading && !ordersReport && (
          <Card className="mb-6 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400 font-semibold">Failed to load report data</p>
              <p className="text-red-500 dark:text-red-500 text-sm mt-2">Please try again or select a different period</p>
            </div>
          </Card>
        )}

        {/* Content */}
        {!ordersReportLoading && ordersReport && (
          <>
        {/* Order Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-6">
          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {orderStats?.total.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <HiTrendingUp className="text-green-600 text-sm" />
                <span className="text-xs text-green-600">+{orderStats?.growth}%</span>
              </div>
            </div>
          </Card>

          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">Delivered</p>
              <p className="text-2xl font-bold text-green-600">
                {orderStats?.delivered.toLocaleString()}
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {ordersReport?.statusBreakdown.delivered.percentage.toFixed(1)}% of total
              </p>
            </div>
          </Card>

          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">In Transit</p>
              <p className="text-2xl font-bold text-blue-600">
                {orderStats?.inTransit}
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {ordersReport?.statusBreakdown.inTransit.percentage.toFixed(1)}% of total
              </p>
            </div>
          </Card>

          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {orderStats?.pending}
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {ordersReport?.statusBreakdown.pending.percentage.toFixed(1)}% of total
              </p>
            </div>
          </Card>

          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">RTO</p>
              <p className="text-2xl font-bold text-red-600">{orderStats?.rto}</p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {ordersReport?.statusBreakdown.rto.percentage.toFixed(1)}% of total
              </p>
            </div>
          </Card>

          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">Success Rate</p>
              <p className="text-2xl font-bold text-purple-600">
                {ordersReport?.successRate.toFixed(1)}%
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Delivery success</p>
            </div>
          </Card>
        </div>

        {/* Chart */}
        <Card className="mb-6 border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Daily Orders Trend</h3>
          <div className="h-64 flex items-end justify-between gap-4">
            {dailyOrders.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {day.orders}
                </div>
                <div
                  className="w-full bg-blue-600 rounded-t transition-all hover:bg-blue-700"
                  style={{
                    height: `${(day.orders / maxOrders) * 100}%`,
                    minHeight: "20px",
                  }}
                ></div>
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">{day.date}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Status Breakdown */}
        <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Order Status Breakdown
          </h3>
          <div className="space-y-4">
            {[
              { 
                label: "Delivered", 
                value: ordersReport?.statusBreakdown.delivered.count, 
                percentage: ordersReport?.statusBreakdown.delivered.percentage,
                color: "bg-green-600" 
              },
              { 
                label: "In Transit", 
                value: ordersReport?.statusBreakdown.inTransit.count,
                percentage: ordersReport?.statusBreakdown.inTransit.percentage,
                color: "bg-blue-600" 
              },
              { 
                label: "Pending", 
                value: ordersReport?.statusBreakdown.pending.count,
                percentage: ordersReport?.statusBreakdown.pending.percentage,
                color: "bg-yellow-600" 
              },
              { 
                label: "RTO", 
                value: ordersReport?.statusBreakdown.rto.count,
                percentage: ordersReport?.statusBreakdown.rto.percentage,
                color: "bg-red-600" 
              },
            ].map((status, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {status.label}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {status.value} ({status.percentage?.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-2 rounded-full ${status.color}`}
                    style={{ width: `${status.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
          </>
        )}
      </div>
    </NavbarSidebarLayout>
  );
};

export default TotalOrdersReportPage;
