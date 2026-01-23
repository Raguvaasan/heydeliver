import { FC, useState, useEffect } from "react"
import { Card, Label, TextInput, Button, Spinner } from "flowbite-react"
import { HiSave } from "react-icons/hi"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import toast from "react-hot-toast"
import { useMarkupStore } from "../../store/markupStore"

const RateMarkupPage: FC = () => {
  const [globalMarkup, setGlobalMarkup] = useState<number>(0)
  const [markupType, setMarkupType] = useState<"percentage" | "fixed">("percentage")

  const { 
    rateCalculatorMarkup, 
    loading, 
    fetchRateCalculatorMarkup, 
    saveRateCalculatorMarkup 
  } = useMarkupStore()

  useEffect(() => {
    // Fetch markup from API on component mount
    fetchRateCalculatorMarkup()
  }, [])

  useEffect(() => {
    // Update local state when API data is fetched
    if (rateCalculatorMarkup) {
      setGlobalMarkup(rateCalculatorMarkup.markup_value)
      setMarkupType(rateCalculatorMarkup.markup_type)
    }
  }, [rateCalculatorMarkup])

  const handleSaveMarkup = async () => {
    if (markupType === "percentage" && (globalMarkup < 0 || globalMarkup > 100)) {
      toast.error("Percentage markup must be between 0 and 100")
      return
    }

    if (markupType === "fixed" && globalMarkup < 0) {
      toast.error("Fixed markup cannot be negative")
      return
    }

    try {
      await saveRateCalculatorMarkup(markupType, globalMarkup)
      toast.success("Rate markup saved successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to save markup")
    }
  }

  const calculateExample = () => {
    const baseRate = 45.52
    if (markupType === "percentage") {
      return Math.round(baseRate * (1 + globalMarkup / 100))
    } else {
      return Math.round(baseRate + globalMarkup)
    }
  }

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4 pt-6 pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Rate Markup Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configure markup percentage or fixed amount to add on top of Delhivery rates
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Card */}
          <div className="lg:col-span-2">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Global Markup Configuration
              </h3>

              <div className="space-y-6">
                {/* Markup Type Selection */}
                <div>
                  <Label className="mb-3 block font-semibold text-gray-700 dark:text-gray-300">
                    Markup Type
                  </Label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setMarkupType("percentage")}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                        markupType === "percentage"
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                          : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <div className="font-semibold mb-1">Percentage (%)</div>
                      <div className="text-xs">Add % on base rate</div>
                    </button>
                    <button
                      onClick={() => setMarkupType("fixed")}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                        markupType === "fixed"
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                          : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <div className="font-semibold mb-1">Fixed Amount (₹)</div>
                      <div className="text-xs">Add fixed ₹ amount</div>
                    </button>
                  </div>
                </div>

                {/* Markup Value */}
                <div>
                  <Label htmlFor="markupValue" className="mb-2 block font-semibold text-gray-700 dark:text-gray-300">
                    {markupType === "percentage" ? "Markup Percentage (%)" : "Markup Amount (₹)"}
                  </Label>
                  <div className="relative">
                    <TextInput
                      id="markupValue"
                      type="number"
                      value={globalMarkup}
                      onChange={(e) => setGlobalMarkup(parseFloat(e.target.value) || 0)}
                      placeholder={markupType === "percentage" ? "Enter percentage (e.g., 10)" : "Enter amount (e.g., 5)"}
                      step={markupType === "percentage" ? "0.1" : "1"}
                      min="0"
                      max={markupType === "percentage" ? "100" : undefined}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                        {markupType === "percentage" ? "%" : "₹"}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {markupType === "percentage"
                      ? "This percentage will be added to the base Delhivery rate"
                      : "This fixed amount will be added to the base Delhivery rate"}
                  </p>
                </div>

                {/* Example Calculation */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Example Calculation</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">Base Delhivery Rate:</span>
                      <span className="font-medium">₹46</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">
                        Your Markup ({markupType === "percentage" ? `${globalMarkup}%` : `₹${globalMarkup}`}):
                      </span>
                      <span className="font-medium text-green-600">
                        {markupType === "percentage"
                          ? `+₹${Math.round(45.52 * globalMarkup / 100)}`
                          : `+₹${Math.round(globalMarkup)}`}
                      </span>
                    </div>
                    <div className="border-t border-blue-300 dark:border-blue-700 pt-2 flex justify-between">
                      <span className="font-semibold text-gray-900 dark:text-white">Customer Pays:</span>
                      <span className="font-bold text-blue-600 text-lg">₹{calculateExample()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Your Profit:</span>
                      <span className="font-medium text-green-600">
                        ₹{calculateExample() - 46}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-3">
                  <Button
                    color="dark"
                    onClick={handleSaveMarkup}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <HiSave className="mr-2 h-5 w-5" />
                        Save Markup Settings
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Info Card */}
          <div className="lg:col-span-1">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                How It Works
              </h3>
              <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Set Your Markup</div>
                    <p className="text-xs">Choose percentage or fixed amount markup</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Auto-Apply</div>
                    <p className="text-xs">Markup automatically applies to Rate Calculator</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Customer Pricing</div>
                    <p className="text-xs">Show final price with your profit to customers</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex gap-2">
                  <svg className="h-5 w-5 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="text-xs text-yellow-800 dark:text-yellow-200">
                    <div className="font-semibold mb-1">Note</div>
                    Markup applies to all shipments calculated through Rate Calculator. Adjust based on your business needs.
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

export default RateMarkupPage
