import { FC, useState } from "react"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { Card, Button, Label, TextInput, Select } from "flowbite-react"
import { HiArrowLeft, HiMail, HiDocumentText, HiClock } from "react-icons/hi"
import { useNavigate } from "react-router-dom"

const ReportsPage: FC = () => {
  const navigate = useNavigate()
  const [frequency, setFrequency] = useState("month")
  const [formData, setFormData] = useState({
    reportType: "order",
    reportName: "",
    recipients: "",
    dates: "15",
    time: "01:09 pm",
    dataRange: "1",
    dataUnit: "days",
    orderType: "",
    orderStatus: "",
    orderSubStatus: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Scheduled Reports
          </h1>
        </div>

        <Card>
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate("/reports")}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <HiArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Schedule Report
            </h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Report Details */}
              <div className="space-y-6">
                {/* Report Details Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <HiMail className="h-5 w-5 text-gray-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Report Details
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reportType" value="Please select a report type" />
                      <Select
                        id="reportType"
                        value={formData.reportType}
                        onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
                      >
                        <option value="order">Order Report</option>
                        <option value="payment">Payment Report</option>
                        <option value="delivery">Delivery Report</option>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="reportName" value="Report Name" />
                      <TextInput
                        id="reportName"
                        placeholder="Enter Report Name"
                        value={formData.reportName}
                        onChange={(e) => setFormData({ ...formData, reportName: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="recipients" value="Recipients Email IDs" />
                      <TextInput
                        id="recipients"
                        placeholder="Enter Recipients email IDs separated by commas"
                        value={formData.recipients}
                        onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Reports would be sent to the recipients' email
                      </p>
                    </div>
                  </div>
                </div>

                {/* Report Content Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <HiDocumentText className="h-5 w-5 text-gray-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Report Content
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="orderType" value="Order Type" />
                      <Select
                        id="orderType"
                        value={formData.orderType}
                        onChange={(e) => setFormData({ ...formData, orderType: e.target.value })}
                      >
                        <option value="">Select Order Type</option>
                        <option value="standard">Standard</option>
                        <option value="express">Express</option>
                        <option value="overnight">Overnight</option>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="orderStatus" value="Order Status" />
                      <Select
                        id="orderStatus"
                        value={formData.orderStatus}
                        onChange={(e) => setFormData({ ...formData, orderStatus: e.target.value })}
                      >
                        <option value="">Select Order Status</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="orderSubStatus" value="Order Sub-status" />
                      <Select
                        id="orderSubStatus"
                        value={formData.orderSubStatus}
                        onChange={(e) => setFormData({ ...formData, orderSubStatus: e.target.value })}
                      >
                        <option value="">Select Sub-status</option>
                        <option value="awaiting">Awaiting Pickup</option>
                        <option value="in-transit">In Transit</option>
                        <option value="out-for-delivery">Out for Delivery</option>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Frequency Details */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <HiClock className="h-5 w-5 text-gray-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Frequency Details
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {/* Send Reports */}
                    <div>
                      <Label value="Send Reports" />
                      <div className="flex gap-4 mt-2">
                        <button
                          type="button"
                          onClick={() => setFrequency("month")}
                          className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                            frequency === "month"
                              ? "border-blue-600 bg-blue-50 text-blue-600"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          Every Month
                        </button>
                        <button
                          type="button"
                          onClick={() => setFrequency("week")}
                          className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                            frequency === "week"
                              ? "border-blue-600 bg-blue-50 text-blue-600"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          Every Week
                        </button>
                        <button
                          type="button"
                          onClick={() => setFrequency("day")}
                          className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                            frequency === "day"
                              ? "border-blue-600 bg-blue-50 text-blue-600"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          Every Day
                        </button>
                      </div>
                    </div>

                    {/* Select Dates */}
                    <div>
                      <Label htmlFor="dates" value="Select Dates for sending reports" />
                      <div className="flex gap-2 mt-2">
                        <TextInput
                          id="dates"
                          value={formData.dates}
                          onChange={(e) => setFormData({ ...formData, dates: e.target.value })}
                          className="flex-1"
                        />
                        <span className="flex items-center px-3 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-600">
                          15 x
                        </span>
                      </div>
                    </div>

                    {/* Select Time */}
                    <div>
                      <Label htmlFor="time" value="Select Time" />
                      <TextInput
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      />
                    </div>

                    {/* Get data for the last */}
                    <div>
                      <Label value="Get data for the last" />
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <Select
                          value={formData.dataRange}
                          onChange={(e) => setFormData({ ...formData, dataRange: e.target.value })}
                        >
                          <option value="1">1</option>
                          <option value="7">7</option>
                          <option value="15">15</option>
                          <option value="30">30</option>
                        </Select>
                        <Select
                          value={formData.dataUnit}
                          onChange={(e) => setFormData({ ...formData, dataUnit: e.target.value })}
                        >
                          <option value="days">Days</option>
                          <option value="weeks">Weeks</option>
                          <option value="months">Months</option>
                        </Select>
                      </div>
                    </div>

                    {/* Info Message */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-700">
                        ℹ️ It can take upto 24 hrs in sending your first report
                      </p>
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-700">
                        We'll send reports on your email every month on{" "}
                        <strong>15th</strong> with the last{" "}
                        <strong>1 day data</strong> with the selected report content
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
              <Button
                type="button"
                color="gray"
                onClick={() => navigate("/reports")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gray-900 hover:bg-gray-800"
              >
                Schedule Report
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </NavbarSidebarLayout>
  )
}

export default ReportsPage
