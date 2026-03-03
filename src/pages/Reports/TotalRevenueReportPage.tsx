import { FC, useState } from "react";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import { Card, Button, Select, Label } from "flowbite-react";
import { HiDownload, HiTrendingUp, HiCurrencyRupee } from "react-icons/hi";
import toast from "react-hot-toast";

const TotalRevenueReportPage: FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("this-month");

  const revenueStats = {
    total: 693000,
    shipping: 550000,
    cod: 120000,
    other: 23000,
    growth: 22.3,
  };

  const monthlyRevenue = [
    { month: "Jul", revenue: 450000 },
    { month: "Aug", revenue: 520000 },
    { month: "Sep", revenue: 480000 },
    { month: "Oct", revenue: 590000 },
    { month: "Nov", revenue: 630000 },
    { month: "Dec", revenue: 693000 },
  ];

  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue));

  const handleExport = () => {
    toast.success("Exporting revenue report...");
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
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label htmlFor="period" value="Select Period" className="mb-2 text-gray-700 dark:text-gray-200" />
              <Select
                id="period"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="this-week">This Week</option>
                <option value="this-month">This Month</option>
                <option value="last-month">Last Month</option>
                <option value="this-quarter">This Quarter</option>
                <option value="this-year">This Year</option>
                <option value="custom">Custom Range</option>
              </Select>
            </div>
            <Button color="dark" onClick={handleExport}>
              <HiDownload className="mr-2 h-5 w-5" />
              Export Report
            </Button>
          </div>
        </Card>

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
                  ₹{(month.revenue / 1000).toFixed(0)}K
                </div>
                <div
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all hover:from-blue-700 hover:to-blue-500"
                  style={{
                    height: `${(month.revenue / maxRevenue) * 100}%`,
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
              {[
                {
                  label: "Shipping Charges",
                  value: revenueStats.shipping,
                  color: "bg-green-600",
                },
                {
                  label: "COD Charges",
                  value: revenueStats.cod,
                  color: "bg-purple-600",
                },
                {
                  label: "Other Charges",
                  value: revenueStats.other,
                  color: "bg-orange-600",
                },
              ].map((source, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {source.label}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      ₹{source.value.toLocaleString()} (
                      {((source.value / revenueStats.total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className={`h-2 rounded-full ${source.color}`}
                      style={{
                        width: `${(source.value / revenueStats.total) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Payment Method Split
            </h3>
            <div className="space-y-4">
              {[
                { label: "Prepaid", value: 453000, color: "bg-blue-600" },
                { label: "COD", value: 240000, color: "bg-yellow-600" },
              ].map((method, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {method.label}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      ₹{method.value.toLocaleString()} (
                      {((method.value / revenueStats.total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className={`h-2 rounded-full ${method.color}`}
                      style={{
                        width: `${(method.value / revenueStats.total) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </NavbarSidebarLayout>
  );
};

export default TotalRevenueReportPage;
