import { FC, useState } from "react";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import { Card, Button, Select, Label, Badge, Progress } from "flowbite-react";
import { HiDownload, HiCheckCircle, HiClock, HiTruck } from "react-icons/hi";
import toast from "react-hot-toast";

const DeliveryPerformanceReportPage: FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("this-month");

  const performanceMetrics = {
    onTimeDelivery: 94.5,
    avgDeliveryTime: 2.3,
    firstAttemptSuccess: 89.2,
    customerSatisfaction: 4.6,
    totalDeliveries: 6590,
    sla: 96.8,
  };

  const zonePerformance = [
    { zone: "Zone A", deliveries: 1850, onTime: 96.2, avgTime: "1.8 days" },
    { zone: "Zone B", deliveries: 1620, onTime: 94.8, avgTime: "2.1 days" },
    { zone: "Zone C", deliveries: 1450, onTime: 93.5, avgTime: "2.5 days" },
    { zone: "Zone D", deliveries: 1120, onTime: 92.8, avgTime: "2.8 days" },
    { zone: "Zone E", deliveries: 550, onTime: 91.5, avgTime: "3.2 days" },
  ];

  const handleExport = () => {
    toast.success("Exporting performance report...");
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 95) return "success";
    if (percentage >= 90) return "warning";
    return "failure";
  };

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4 pt-6 pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Delivery Performance Report
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track delivery metrics and performance indicators
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
                <option value="this-week">This Week</option>
                <option value="this-month">This Month</option>
                <option value="last-month">Last Month</option>
                <option value="this-quarter">This Quarter</option>
                <option value="custom">Custom Range</option>
              </Select>
            </div>
            <Button color="dark" onClick={handleExport}>
              <HiDownload className="mr-2 h-5 w-5" />
              Export Report
            </Button>
          </div>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-6">
          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">On-Time %</p>
                <p className="text-2xl font-bold text-green-600">
                  {performanceMetrics.onTimeDelivery}%
                </p>
              </div>
              <HiCheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </Card>

          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">Avg Time</p>
                <p className="text-2xl font-bold text-blue-600">
                  {performanceMetrics.avgDeliveryTime}d
                </p>
              </div>
              <HiClock className="w-10 h-10 text-blue-600" />
            </div>
          </Card>

          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">1st Attempt</p>
                <p className="text-2xl font-bold text-purple-600">
                  {performanceMetrics.firstAttemptSuccess}%
                </p>
              </div>
              <HiTruck className="w-10 h-10 text-purple-600" />
            </div>
          </Card>

          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">CSAT Score</p>
              <p className="text-2xl font-bold text-yellow-600">
                {performanceMetrics.customerSatisfaction}/5
              </p>
              <div className="flex gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(performanceMetrics.customerSatisfaction)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </Card>

          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">Total Delivered</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {performanceMetrics.totalDeliveries.toLocaleString()}
              </p>
            </div>
          </Card>

          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">SLA Met</p>
              <p className="text-2xl font-bold text-green-600">
                {performanceMetrics.sla}%
              </p>
            </div>
          </Card>
        </div>

        {/* Zone-wise Performance */}
        <Card className="mb-6 border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Zone-wise Performance
          </h3>
          <div className="space-y-6">
            {zonePerformance.map((zone, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{zone.zone}</span>
                    <span className="ml-3 text-sm text-gray-600 dark:text-gray-300">
                      {zone.deliveries.toLocaleString()} deliveries
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Avg: {zone.avgTime}</span>
                    <Badge color={getPerformanceColor(zone.onTime)}>
                      {zone.onTime}% On-Time
                    </Badge>
                  </div>
                </div>
                <Progress
                  progress={zone.onTime}
                  size="lg"
                  color={getPerformanceColor(zone.onTime) === "success" ? "green" : getPerformanceColor(zone.onTime) === "warning" ? "yellow" : "red"}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Performance Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Delivery Attempt Analysis
            </h3>
            <div className="space-y-4">
              {[
                { label: "1st Attempt Success", value: 89.2, color: "bg-green-600" },
                { label: "2nd Attempt Success", value: 8.3, color: "bg-yellow-600" },
                { label: "3+ Attempts", value: 2.5, color: "bg-red-600" },
              ].map((attempt, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {attempt.label}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {attempt.value}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className={`h-2 rounded-full ${attempt.color}`}
                      style={{ width: `${attempt.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Delivery Time Distribution
            </h3>
            <div className="space-y-4">
              {[
                { label: "Within 1 day", value: 35, color: "bg-green-600" },
                { label: "1-2 days", value: 42, color: "bg-blue-600" },
                { label: "2-3 days", value: 18, color: "bg-yellow-600" },
                { label: "3+ days", value: 5, color: "bg-red-600" },
              ].map((time, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {time.label}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {time.value}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className={`h-2 rounded-full ${time.color}`}
                      style={{ width: `${time.value}%` }}
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

export default DeliveryPerformanceReportPage;
