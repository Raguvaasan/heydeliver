import { FC, useState } from "react"
import { Button, Card, Label, TextInput } from "flowbite-react"
import { HiDownload, HiSearch } from "react-icons/hi"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import toast from "react-hot-toast"

interface ServiceabilityResult {
  pincode: string
  city: string
  state: string
  serviceable: boolean
  expressAvailable: boolean
  surfaceAvailable: boolean
  codAvailable: boolean
}

const ServiceAvailabilityPage: FC = () => {
  const [pincode, setPincode] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ServiceabilityResult | null>(null)

  const handleCheckServiceability = async () => {
    if (!pincode || pincode.length !== 6) {
      toast.error("Please enter a valid 6-digit pincode")
      return
    }

    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      // Mock data - replace with actual API call
      const mockResult: ServiceabilityResult = {
        pincode: pincode,
        city: "Chennai",
        state: "Tamil Nadu",
        serviceable: true,
        expressAvailable: true,
        surfaceAvailable: true,
        codAvailable: true
      }
      
      setResult(mockResult)
      setLoading(false)
      toast.success("Serviceability checked successfully")
    }, 1000)
  }

  const handleExportFile = () => {
    toast.success("Exporting serviceability file...")
    // Implement export functionality
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCheckServiceability()
    }
  }

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4 pt-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Pincode Serviceability
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Check last-mile serviceability by entering a pincode
            </p>
          </div>
          <Button
            color="light"
            onClick={handleExportFile}
            className="flex items-center gap-2"
          >
            <HiDownload className="h-5 w-5" />
            Export serviceability file
          </Button>
        </div>

        {/* Main Content */}
        <Card>
          <div className="max-w-2xl">
            {/* Search Section */}
            <div className="mb-8">
              <Label htmlFor="pincode" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Enter Pincode
              </Label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <TextInput
                    id="pincode"
                    type="text"
                    placeholder="Enter a six digit Pincode"
                    value={pincode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                      setPincode(value)
                    }}
                    onKeyPress={handleKeyPress}
                    maxLength={6}
                    icon={HiSearch}
                  />
                </div>
                <Button
                  onClick={handleCheckServiceability}
                  disabled={loading || pincode.length !== 6}
                  className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700"
                  isProcessing={loading}
                >
                  Check Serviceability
                </Button>
              </div>
            </div>

            {/* Results Section */}
            {result && (
              <div className="mt-8 space-y-6">
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Serviceability Details
                  </h3>

                  {/* Location Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pincode</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {result.pincode}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">City</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {result.city}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg col-span-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">State</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {result.state}
                      </div>
                    </div>
                  </div>

                  {/* Service Status */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${result.serviceable ? "bg-green-500" : "bg-red-500"}`}></div>
                        <span className="font-medium text-gray-900 dark:text-white">Serviceable</span>
                      </div>
                      <span className={`text-sm font-semibold ${result.serviceable ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {result.serviceable ? "Available" : "Not Available"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${result.expressAvailable ? "bg-green-500" : "bg-red-500"}`}></div>
                        <span className="font-medium text-gray-900 dark:text-white">Express Delivery</span>
                      </div>
                      <span className={`text-sm font-semibold ${result.expressAvailable ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {result.expressAvailable ? "Available" : "Not Available"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${result.surfaceAvailable ? "bg-green-500" : "bg-red-500"}`}></div>
                        <span className="font-medium text-gray-900 dark:text-white">Surface Delivery</span>
                      </div>
                      <span className={`text-sm font-semibold ${result.surfaceAvailable ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {result.surfaceAvailable ? "Available" : "Not Available"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${result.codAvailable ? "bg-green-500" : "bg-red-500"}`}></div>
                        <span className="font-medium text-gray-900 dark:text-white">Cash on Delivery (COD)</span>
                      </div>
                      <span className={`text-sm font-semibold ${result.codAvailable ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {result.codAvailable ? "Available" : "Not Available"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!result && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p className="mt-4">Enter a pincode to check serviceability</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </NavbarSidebarLayout>
  )
}

export default ServiceAvailabilityPage
