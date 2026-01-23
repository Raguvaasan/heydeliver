import { FC, useState, useEffect } from "react"
import { Button, Card, Label, Select, TextInput, Radio, Spinner, Alert } from "flowbite-react"
import { HiInformationCircle, HiCalculator } from "react-icons/hi"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { useRateCalculatorStore } from "../../store/rateCalculatorStore"
import { useMarkupStore } from "../../store/markupStore"
import toast from "react-hot-toast"

interface RateDetails {
  shippingCost: number
  gstCharge: number
  dieselCharge: number
  total: number
  zone?: string
  chargedWeight?: number
}

const RateCalculatorPage: FC = () => {
  const [selectedTab, setSelectedTab] = useState<"domestic" | "international">("domestic")
  const [pickupPincode, setPickupPincode] = useState("110042")
  const [deliveryPincode, setDeliveryPincode] = useState("110053")
  const [packageType, setPackageType] = useState("plastic")
  const [packageWeight, setPackageWeight] = useState("500")
  const [length, setLength] = useState("10")
  const [breadth, setBreadth] = useState("10")
  const [height, setHeight] = useState("10")
  const [paymentMode, setPaymentMode] = useState<"Pre-paid" | "COD">("Pre-paid")
  const [shippingType, setShippingType] = useState<"forward" | "rto" | "reverse">("forward")
  const [deliveryMode, setDeliveryMode] = useState<"E" | "S">("E") // E = Express, S = Surface

  const { rateData, loading, error, calculateRate, clearData } = useRateCalculatorStore()
  const { rateCalculatorMarkup, fetchRateCalculatorMarkup } = useMarkupStore()

  // Fetch markup on component mount
  useEffect(() => {
    fetchRateCalculatorMarkup()
  }, [])

  const calculateVolumetricWeight = () => {
    const l = parseFloat(length) || 0
    const b = parseFloat(breadth) || 0
    const h = parseFloat(height) || 0
    return ((l * b * h) / 5000).toFixed(2)
  }

  const getChargedWeight = () => {
    const actualWeight = parseFloat(packageWeight) || 0
    const volumetricWeight = parseFloat(calculateVolumetricWeight()) || 0
    return Math.max(actualWeight, volumetricWeight)
  }

  // Auto-calculate when parameters change
  useEffect(() => {
    if (pickupPincode.length === 6 && deliveryPincode.length === 6 && parseFloat(packageWeight) > 0) {
      handleCalculateRate()
    }
  }, [shippingType, deliveryMode, paymentMode])

  const handleCalculateRate = async () => {
    // Validation
    if (!pickupPincode || pickupPincode.length !== 6) {
      toast.error("Please enter a valid 6-digit pickup pincode")
      return
    }

    if (!deliveryPincode || deliveryPincode.length !== 6) {
      toast.error("Please enter a valid 6-digit delivery pincode")
      return
    }

    if (!packageWeight || parseFloat(packageWeight) <= 0) {
      toast.error("Please enter a valid package weight")
      return
    }

    const chargedWeight = getChargedWeight()

    // Map shipping type to status
    const statusMap = {
      forward: "Delivered",
      rto: "RTO",
      reverse: "DTO" // Direct To Origin (DTO) for reverse shipments
    }

    await calculateRate({
      md: deliveryMode, // E or S
      ss: statusMap[shippingType],
      d_pin: deliveryPincode,
      o_pin: pickupPincode,
      cgm: Math.ceil(chargedWeight), // Convert to grams and round up
      pt: paymentMode,
    })
  }

  const getRateDetails = (): RateDetails | null => {
    if (!rateData) return null

    const { charge_DL, tax_data, charge_DPH, total_amount, zone, charged_weight } = rateData

    // Get markup settings from API
    const markupValue = rateCalculatorMarkup?.markup_value || 0
    const markupType = rateCalculatorMarkup?.markup_type || "percentage"

    let baseTotal = total_amount || 0
    let finalTotal = baseTotal

    // Apply markup
    if (markupType === "percentage") {
      finalTotal = baseTotal * (1 + markupValue / 100)
    } else {
      finalTotal = baseTotal + markupValue
    }

    // Round off to nearest integer
    finalTotal = Math.round(finalTotal)

    return {
      shippingCost: charge_DL || 0,
      gstCharge: (tax_data.CGST || 0) + (tax_data.SGST || 0) + (tax_data.IGST || 0),
      dieselCharge: charge_DPH || 0,
      total: finalTotal,
      zone: zone || "N/A",
      chargedWeight: charged_weight || 0,
    }
  }

  const getBaseTotal = () => {
    if (!rateData) return 0
    return Math.round(rateData.total_amount || 0)
  }

  const getMarkupAmount = () => {
    const baseTotal = rateData?.total_amount || 0
    const markupValue = rateCalculatorMarkup?.markup_value || 0
    const markupType = rateCalculatorMarkup?.markup_type || "percentage"

    let markupAmount = 0
    if (markupType === "percentage") {
      markupAmount = baseTotal * (markupValue / 100)
    } else {
      markupAmount = markupValue
    }

    return Math.round(markupAmount)
  }

  const rateDetails = getRateDetails()

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
              <div className="mb-6">
                <Label className="mb-3 block font-semibold text-gray-700 dark:text-gray-300">
                  Payment Mode
                </Label>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <Radio
                      id="prepaid"
                      name="paymentMode"
                      value="Pre-paid"
                      checked={paymentMode === "Pre-paid"}
                      onChange={(e) => setPaymentMode(e.target.value as "Pre-paid")}
                    />
                    <Label htmlFor="prepaid" className="cursor-pointer">Prepaid</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Radio
                      id="cod"
                      name="paymentMode"
                      value="COD"
                      checked={paymentMode === "COD"}
                      onChange={(e) => setPaymentMode(e.target.value as "COD")}
                    />
                    <Label htmlFor="cod" className="cursor-pointer">Cash on Delivery (COD)</Label>
                  </div>
                </div>
              </div>

              {/* Calculate Button */}
              <div>
                <Button
                  color="dark"
                  size="lg"
                  className="w-full"
                  onClick={handleCalculateRate}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <HiCalculator className="mr-2 h-5 w-5" />
                      Calculate Rate
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Section - Rate Display */}
          <div className="lg:col-span-1">
            <Card>
              {/* Shipping Type Tabs */}
              <div className="flex gap-2 mb-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
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

              {/* Delivery Mode Tabs */}
              <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button
                  onClick={() => setDeliveryMode("E")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    deliveryMode === "E"
                      ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  Express
                </button>
                <button
                  onClick={() => setDeliveryMode("S")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    deliveryMode === "S"
                      ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  Surface
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <Alert color="failure" className="mb-4">
                  <span className="font-medium">Error!</span> {error}
                </Alert>
              )}

              {/* Rate Display */}
              {rateDetails ? (
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {deliveryMode === "E" ? "Express" : "Surface"} - {shippingType.charAt(0).toUpperCase() + shippingType.slice(1)}
                      </h3>
                    </div>
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                      <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      ₹{rateDetails.total}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
                    <div className="flex justify-between">
                      <span>Shipping Cost:</span>
                      <span className="font-medium">₹{Math.round(rateDetails.shippingCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST:</span>
                      <span className="font-medium">₹{Math.round(rateDetails.gstCharge)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>DPH (Diesel):</span>
                      <span className="font-medium">₹{Math.round(rateDetails.dieselCharge)}</span>
                    </div>
                    <div className="border-t border-blue-300 dark:border-blue-700 pt-2 flex justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>Base Total:</span>
                      <span>₹{getBaseTotal()}</span>
                    </div>
                    {getMarkupAmount() > 0 && (
                      <div className="flex justify-between text-xs text-green-600 dark:text-green-400">
                        <span>Your Markup:</span>
                        <span className="font-semibold">+₹{getMarkupAmount()}</span>
                      </div>
                    )}
                    <div className="border-t-2 border-blue-400 dark:border-blue-600 pt-2 mt-2 flex justify-between font-bold text-lg">
                      <span>Customer Pays:</span>
                      <span className="text-blue-600">₹{rateDetails.total}</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex items-center gap-1">
                      <HiInformationCircle className="h-3 w-3" />
                      <span>Zone: {rateDetails.zone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <HiInformationCircle className="h-3 w-3" />
                      <span>Charged Weight: {rateDetails.chargedWeight} grams</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <HiCalculator className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Enter shipment details and click "Calculate Rate" to see pricing</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </NavbarSidebarLayout>
  )
}

export default RateCalculatorPage
