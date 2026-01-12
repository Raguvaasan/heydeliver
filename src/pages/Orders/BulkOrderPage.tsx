import { FC, useState } from "react"
import { Button, Card, Label, Select, Textarea } from "flowbite-react"
import { HiUpload, HiDocumentText } from "react-icons/hi"
import { useNavigate } from "react-router-dom"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import toast from "react-hot-toast"

const BulkOrderPage: FC = () => {
  const navigate = useNavigate()
  const [selectedChannel, setSelectedChannel] = useState("")
  const [uploadType, setUploadType] = useState<"orders" | "shipments" | null>(null)
  const [instructions, setInstructions] = useState("")

  const handleUploadOrders = () => {
    setUploadType("orders")
    toast.success("Upload Orders selected")
  }

  const handleUploadShipments = () => {
    setUploadType("shipments")
    toast.success("Upload Shipments selected")
  }

  const handleChannelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedChannel(e.target.value)
  }

  const handleViewOnly = () => {
    toast.info("View only mode")
  }

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4 pt-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Orders
          </h1>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate("/orders/bulk")}
              color="light"
              className="border-2 border-orange-500 text-orange-500 hover:bg-orange-50"
            >
              BULK ORDER
            </Button>
            <Button
              onClick={() => navigate("/orders/new")}
              className="bg-orange-500 hover:bg-orange-600"
            >
              NEW ORDER
            </Button>
          </div>
        </div>

        {/* Bulk Order Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Bulk Order
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Section - Upload Options */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upload Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Upload Orders Card */}
                <Card
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    uploadType === "orders"
                      ? "border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border border-gray-200"
                  }`}
                  onClick={handleUploadOrders}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-lg ${uploadType === "orders" ? "bg-blue-500" : "bg-gray-200"}`}>
                        <HiUpload className={`h-6 w-6 ${uploadType === "orders" ? "text-white" : "text-gray-600"}`} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Upload Orders
                        </h3>
                        <span className="px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">
                          Recommended
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        New orders will be created and you can manifest them later. View these
                        in the Pending Orders tab.
                      </p>
                    </div>
                    {uploadType === "orders" && (
                      <div className="flex-shrink-0">
                        <svg
                          className="h-6 w-6 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Upload Shipments Card */}
                <Card
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    uploadType === "shipments"
                      ? "border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border border-gray-200"
                  }`}
                  onClick={handleUploadShipments}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-lg ${uploadType === "shipments" ? "bg-blue-500" : "bg-gray-200"}`}>
                        <HiDocumentText className={`h-6 w-6 ${uploadType === "shipments" ? "text-white" : "text-gray-600"}`} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Upload Shipments
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        AWBs will be created and manifested immediately. View them in the Ready
                        to Ship tab.
                      </p>
                    </div>
                    {uploadType === "shipments" && (
                      <div className="flex-shrink-0">
                        <svg
                          className="h-6 w-6 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Select Channel */}
              <Card>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="channel" className="mb-2 block font-semibold">
                      Select Channel
                    </Label>
                    <Select
                      id="channel"
                      value={selectedChannel}
                      onChange={handleChannelChange}
                      required
                    >
                      <option value="">Select a channel</option>
                      <option value="website">Website</option>
                      <option value="app">Mobile App</option>
                      <option value="phone">Phone</option>
                      <option value="partner">Partner</option>
                    </Select>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Orders uploaded will be linked to this channel
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Section - Instructions */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <div className="flex items-start gap-2 mb-4">
                  <HiDocumentText className="h-5 w-5 text-gray-500 mt-0.5" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Instructions
                  </h3>
                </div>
                <Textarea
                  id="instructions"
                  placeholder="Enter any special instructions or notes for bulk order processing..."
                  rows={12}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="resize-none"
                />
              </Card>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            color="gray"
            size="sm"
            className="flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <Button
            color="blue"
            size="sm"
            className="flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
          </Button>
          <Button
            color="gray"
            size="sm"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </Button>
          <Button
            color="light"
            size="sm"
            onClick={handleViewOnly}
            className="border border-gray-300"
          >
            View only
          </Button>
          <Button
            color="gray"
            size="sm"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </Button>
          <Button
            color="gray"
            size="sm"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          </Button>
          <Button
            color="gray"
            size="sm"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </Button>
        </div>
      </div>
    </NavbarSidebarLayout>
  )
}

export default BulkOrderPage
