import { FC, useState } from "react"
import { Button, Card, Label, Select, TextInput, Radio } from "flowbite-react"
import { HiInformationCircle } from "react-icons/hi"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"

interface RateDetails {
  shippingCost: number
  gstCharge: number
  dieselCharge: number
  total: number
}

const RateCalculatorPage: FC = () => {
  const [selectedTab, setSelectedTab] = useState<"domestic" | "international">("domestic")
  const [pickupPincode, setPickupPincode] = useState("600094")
  const [deliveryPincode, setDeliveryPincode] = useState("600094")
  const [packageType, setPackageType] = useState("plastic")
  const [packageWeight, setPackageWeight] = useState("500")
  const [length, setLength] = useState("1")
  const [breadth, setBreadth] = useState("1")
  const [height, setHeight] = useState("1")
  const [paymentMode, setPaymentMode] = useState("prepaid")
  const [shippingType, setShippingType] = useState<"forward" | "rto" | "reverse">("forward")

  const calculateVolumetricWeight = () => {
    const l = parseFloat(length) || 0
    const b = parseFloat(breadth) || 0
    const h = parseFloat(height) || 0
    return ((l * b * h) / 5000).toFixed(2)
  }

  const calculateRates = (type: "express" | "surface"): RateDetails => {
    const baseRates = {
      forward: { express: 38.00, surface: 38.00 },
      rto: { express: 76.00, surface: 76.00 },
      reverse: { express: 61.00, surface: 61.00 }
    }

    const shippingCost = baseRates[shippingType][type]
    const gstPercentage = shippingType === "forward" ? 0.18 : shippingType === "rto" ? 0.18 : 0.18
    const gstCharge = parseFloat((shippingCost * gstPercentage).toFixed(2))
    const dieselCharge = shippingType === "forward" ? 0.58 : shippingType === "rto" ? 1.16 : 0.93
    const total = parseFloat((shippingCost + gstCharge + dieselCharge).toFixed(2))

    return { shippingCost, gstCharge, dieselCharge, total }
  }

  const expressRates = calculateRates("express")
  const surfaceRates = calculateRates("surface")

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4 pt-6 pb-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Rate Calculator
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section - Calculator Form */}
          <div className="lg:col-span-2">
            <Card>
              {/* Tab Selection */}
              <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <div className="flex gap-8">
                  <button
                    onClick={() => setSelectedTab("domestic")}
                    className={`pb-3 px-4 font-medium transition-colors ${
                      selectedTab === "domestic"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                    }`}
                  >
                    Domestic
                  </button>
                  <button
                    onClick={() => setSelectedTab("international")}
                    className={`pb-3 px-4 font-medium transition-colors ${
                      selectedTab === "international"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                    }`}
                  >
                    International
                  </button>
                </div>
              </div>

              {/* Pickup and Delivery Pincode */}
              <div className="mb-6">
                <Label className="mb-2 block font-semibold text-gray-700 dark:text-gray-300">
                  Pickup and delivery pincode
                </Label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      </div>
                      <TextInput
                        type="text"
                        value={pickupPincode}
                        onChange={(e) => setPickupPincode(e.target.value)}
                        className="pl-8"
                        placeholder="Pickup pincode"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          TN
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-8">Chennai, Tamil nadu</p>
                  </div>

                  <div className="flex-shrink-0">
                    <div className="w-8 h-px bg-gray-400"></div>
                  </div>

                  <div className="flex-1">
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                      </div>
                      <TextInput
                        type="text"
                        value={deliveryPincode}
                        onChange={(e) => setDeliveryPincode(e.target.value)}
                        className="pl-8"
                        placeholder="Delivery pincode"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          TN
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-8">Chennai, Tamil nadu</p>
                  </div>
                </div>
              </div>

              {/* Package Type and Weight */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="packageType" className="mb-2 block font-semibold text-gray-700 dark:text-gray-300">
                    Package Type
                  </Label>
                  <Select
                    id="packageType"
                    value={packageType}
                    onChange={(e) => setPackageType(e.target.value)}
                  >
                    <option value="plastic">Plastic cover/Flyer</option>
                    <option value="box">Box</option>
                    <option value="envelope">Envelope</option>
                    <option value="document">Document</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="packageWeight" className="mb-2 block font-semibold text-gray-700 dark:text-gray-300">
                    Package Weight
                  </Label>
                  <div className="relative">
                    <TextInput
                      id="packageWeight"
                      type="number"
                      value={packageWeight}
                      onChange={(e) => setPackageWeight(e.target.value)}
                      className="pr-12"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-sm text-gray-500">gm</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Package weight: sum of item's weight and weight of packaging (e.g. box)
                  </p>
                </div>
              </div>

              {/* Package Dimensions */}
              <div className="mb-6">
                <Label className="mb-2 block font-semibold text-gray-700 dark:text-gray-300">
                  Package Dimensions
                </Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="relative">
                    <TextInput
                      type="number"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      placeholder="Length"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-sm text-gray-500">cm</span>
                    </div>
                  </div>
                  <div className="relative">
                    <TextInput
                      type="number"
                      value={breadth}
                      onChange={(e) => setBreadth(e.target.value)}
                      placeholder="Breadth"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-sm text-gray-500">cm</span>
                    </div>
                  </div>
                  <div className="relative">
                    <TextInput
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="Height"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-sm text-gray-500">cm</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Volumetric Weight */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <HiInformationCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Volumetric weight calculation
                    </h4>
                    <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span>
                          <strong>Express:</strong> L * B * H / Volumetric Divisor ({length} x {breadth} x {height} / 5000 = {calculateVolumetricWeight()} grams)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>
                          <strong>Surface:</strong> L * B * H / Volumetric Divisor ({length} x {breadth} x {height} / 5000 = {calculateVolumetricWeight()} grams)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Mode */}
              <div>
                <Label className="mb-3 block font-semibold text-gray-700 dark:text-gray-300">
                  Payment Mode
                </Label>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <Radio
                      id="prepaid"
                      name="paymentMode"
                      value="prepaid"
                      checked={paymentMode === "prepaid"}
                      onChange={(e) => setPaymentMode(e.target.value)}
                    />
                    <Label htmlFor="prepaid" className="cursor-pointer">Prepaid</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Radio
                      id="cod"
                      name="paymentMode"
                      value="cod"
                      checked={paymentMode === "cod"}
                      onChange={(e) => setPaymentMode(e.target.value)}
                    />
                    <Label htmlFor="cod" className="cursor-pointer">Cash on Delivery (COD)</Label>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Section - Rate Display */}
          <div className="lg:col-span-1">
            <Card>
              {/* Shipping Type Tabs */}
              <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button
                  onClick={() => setShippingType("forward")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    shippingType === "forward"
                      ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  Forward
                </button>
                <button
                  onClick={() => setShippingType("rto")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    shippingType === "rto"
                      ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  RTO
                </button>
                <button
                  onClick={() => setShippingType("reverse")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    shippingType === "reverse"
                      ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  Reverse
                </button>
              </div>

              {/* Express Rate */}
              <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Express</h3>
                  </div>
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    ₹{expressRates.total}
                  </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                  <div className="flex items-center gap-1">
                    <HiInformationCircle className="h-3 w-3" />
                    <span>
                      Shipping cost: ₹{expressRates.shippingCost.toFixed(2)} + GST charge: ₹{expressRates.gstCharge.toFixed(2)} + Diesel Price Hike (DPH) charge: ₹{expressRates.dieselCharge.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Surface Rate */}
              <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-800/20 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Surface</h3>
                  </div>
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                    <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    ₹{surfaceRates.total}
                  </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                  <div className="flex items-center gap-1">
                    <HiInformationCircle className="h-3 w-3" />
                    <span>
                      Shipping cost: ₹{surfaceRates.shippingCost.toFixed(2)} + GST charge: ₹{surfaceRates.gstCharge.toFixed(2)} + Diesel Price Hike (DPH) charge: ₹{surfaceRates.dieselCharge.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </NavbarSidebarLayout>
  )
}

export default RateCalculatorPage
