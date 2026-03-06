import { FC, useState, useEffect } from "react";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import { Card, Button, Select, Label, TextInput, Spinner } from "flowbite-react";
import { HiDownload, HiTrendingUp, HiCurrencyRupee } from "react-icons/hi";
import toast from "react-hot-toast";
import { useReportsStore, PeriodType } from "../../store/reportsStore";

const TotalRevenueReportPage: FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("thisMonth");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const {
    revenueReport,
    revenueReportLoading,
    revenueReportError,
    fetchRevenueReport,
  } = useReportsStore();

  // fetch when filters change
  useEffect(() => {
    if (selectedPeriod === "customRange") {
      if (startDate && endDate) {
        fetchRevenueReport(selectedPeriod, startDate, endDate);
      }
    } else {
      fetchRevenueReport(selectedPeriod);
    }
  }, [selectedPeriod, startDate, endDate, fetchRevenueReport]);

  // safe extraction using optional chaining in case backend returns an incomplete object
  // map API response to local variables
  const revenueStats = {
    total: revenueReport?.overview?.totalRevenue ?? 0,
    shipping: revenueReport?.overview?.shippingCharges ?? 0,
    cod: revenueReport?.overview?.codCharges ?? 0,
    other: revenueReport?.overview?.otherCharges ?? 0,
    growth: 0, // backend doesn’t send growth yet
  };

  const monthlyRevenue = revenueReport?.revenueTrend
    ? revenueReport.revenueTrend.map(({ date, revenue }) => ({ month: date, revenue }))
    : [];

  const maxRevenue = monthlyRevenue.length > 0 ? Math.max(...monthlyRevenue.map((m) => m.revenue)) : 0;

  const handleExport = () => {
    if (!revenueReport) {
      toast.error("No data to export");
      return;
    }
    toast.success("Exporting revenue report...");
    // TODO: wire up real export API or CSV generation
  };

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4 pt-6 pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Total Revenue Report
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Revenue analytics and payment breakdowns
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
              <Button color="dark" onClick={handleExport} disabled={revenueReportLoading || !revenueReport}>
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
        {revenueReportLoading && (
          <div className="flex items-center justify-center h-64 mb-6">
            <Spinner aria-label="Loading report..." size="lg" />
          </div>
        )}

        {/* Error State */}
        {!revenueReportLoading && !revenueReport && (
          <Card className="mb-6 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400 font-semibold">Failed to load report data</p>
              <p className="text-red-500 dark:text-red-500 text-sm mt-2">Please try again or select a different period</p>
            </div>
          </Card>
        )}

        {/* Revenue Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{revenueStats.total.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <HiTrendingUp className="text-green-600" />
                  <span className="text-sm text-green-600">+{revenueStats.growth}%</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <HiCurrencyRupee className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">Shipping Charges</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{revenueStats.shipping.toLocaleString()}
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {((revenueStats.shipping / revenueStats.total) * 100).toFixed(1)}% of total
              </p>
            </div>
          </Card>

          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">COD Charges</p>
              <p className="text-2xl font-bold text-purple-600">
                ₹{revenueStats.cod.toLocaleString()}
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {((revenueStats.cod / revenueStats.total) * 100).toFixed(1)}% of total
              </p>
            </div>
          </Card>

          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">Other Charges</p>
              <p className="text-2xl font-bold text-orange-600">
                ₹{revenueStats.other.toLocaleString()}
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {((revenueStats.other / revenueStats.total) * 100).toFixed(1)}% of total
              </p>
            </div>
          </Card>
        </div>

        {/* Revenue Trend Chart */}
        <Card className="mb-6 border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Monthly Revenue Trend
          </h3>
          <div className="h-64 flex items-end justify-between gap-4">
            {monthlyRevenue.map((month, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {month.revenue >= 1000
                    ? `₹${(month.revenue / 1000).toFixed(1)}K`
                    : `₹${month.revenue.toLocaleString()}`}
                </div>
                <div
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all hover:from-blue-700 hover:to-blue-500"
                  style={{
                    height: maxRevenue > 0 ? `${(month.revenue / maxRevenue) * 100}%` : "0%",
                    minHeight: "30px",
                  }}
                ></div>
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">{month.month}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Revenue Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Revenue by Source
            </h3>
            <div className="space-y-4">
              {(revenueReport?.revenueBySource ?? []).map((item, index) => {
                const pct = revenueStats.total ? (item.amount / revenueStats.total) * 100 : 0
                const color =
                  item.source.toLowerCase().includes("shipping")
                    ? "bg-green-600"
                    : item.source.toLowerCase().includes("cod")
                    ? "bg-purple-600"
                    : "bg-orange-600"
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {item.source}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        ₹{item.amount.toLocaleString()} ({pct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className={`h-2 rounded-full ${color}`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Payment Method Split
            </h3>
            <div className="space-y-4">
              {(revenueReport?.paymentMethodSplit ?? []).map((item, index) => {
                const pct = revenueStats.total ? (item.amount / revenueStats.total) * 100 : 0
                const color = item.method.toLowerCase().includes("prepaid") ? "bg-blue-600" : "bg-yellow-600"
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {item.method}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        ₹{item.amount.toLocaleString()} ({pct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className={`h-2 rounded-full ${color}`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </NavbarSidebarLayout>
  );
};

export default TotalRevenueReportPage;
