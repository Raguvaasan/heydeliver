import { FC, useState } from "react";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import { Card, Button, Select, Label, Badge } from "flowbite-react";
import { HiDownload, HiTrendingUp } from "react-icons/hi";
import toast from "react-hot-toast";

const TotalOrdersReportPage: FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("this-month");

  const orderStats = {
    total: 6925,
    delivered: 6590,
    inTransit: 255,
    pending: 60,
    rto: 20,
    growth: 18.5,
  };

  const dailyOrders = [
    { date: "Jan 10", orders: 245 },
    { date: "Jan 11", orders: 280 },
    { date: "Jan 12", orders: 220 },
    { date: "Jan 13", orders: 310 },
    { date: "Jan 14", orders: 265 },
    { date: "Jan 15", orders: 290 },
  ];

  const maxOrders = Math.max(...dailyOrders.map((d) => d.orders));

  const handleExport = () => {
    toast.success("Exporting orders report...");
  };

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

        {/* Order Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-6">
          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {orderStats.total.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <HiTrendingUp className="text-green-600 text-sm" />
                <span className="text-xs text-green-600">+{orderStats.growth}%</span>
              </div>
            </div>
          </Card>

          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">Delivered</p>
              <p className="text-2xl font-bold text-green-600">
                {orderStats.delivered.toLocaleString()}
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {((orderStats.delivered / orderStats.total) * 100).toFixed(1)}% of total
              </p>
            </div>
          </Card>

          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">In Transit</p>
              <p className="text-2xl font-bold text-blue-600">
                {orderStats.inTransit}
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {((orderStats.inTransit / orderStats.total) * 100).toFixed(1)}% of total
              </p>
            </div>
          </Card>

          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {orderStats.pending}
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {((orderStats.pending / orderStats.total) * 100).toFixed(1)}% of total
              </p>
            </div>
          </Card>

          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">RTO</p>
              <p className="text-2xl font-bold text-red-600">{orderStats.rto}</p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {((orderStats.rto / orderStats.total) * 100).toFixed(1)}% of total
              </p>
            </div>
          </Card>

          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">Success Rate</p>
              <p className="text-2xl font-bold text-purple-600">
                {((orderStats.delivered / orderStats.total) * 100).toFixed(1)}%
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
              { label: "Delivered", value: orderStats.delivered, color: "bg-green-600" },
              { label: "In Transit", value: orderStats.inTransit, color: "bg-blue-600" },
              { label: "Pending", value: orderStats.pending, color: "bg-yellow-600" },
              { label: "RTO", value: orderStats.rto, color: "bg-red-600" },
            ].map((status, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {status.label}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {status.value} ({((status.value / orderStats.total) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-2 rounded-full ${status.color}`}
                    style={{ width: `${(status.value / orderStats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </NavbarSidebarLayout>
  );
};

export default TotalOrdersReportPage;
