import { FC, useState, useEffect } from "react"
import { Card, Label, TextInput, Button, Spinner } from "flowbite-react"
import { HiSave } from "react-icons/hi"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import toast from "react-hot-toast"
import { useMarkupStore } from "../../store/markupStore"

const RateCardMarkupPage: FC = () => {
  const [globalMarkup, setGlobalMarkup] = useState<number>(0)
  const [markupType, setMarkupType] = useState<"percentage" | "fixed">("percentage")

  const { 
    rateCardMarkup, 
    loading, 
    fetchRateCardMarkup, 
    saveRateCardMarkup 
  } = useMarkupStore()

  useEffect(() => {
    // Fetch markup from API on component mount
    fetchRateCardMarkup()
  }, [])

  useEffect(() => {
    // Update local state when API data is fetched
    if (rateCardMarkup) {
      setGlobalMarkup(rateCardMarkup.markup_value)
      setMarkupType(rateCardMarkup.markup_type)
    }
  }, [rateCardMarkup])

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
      await saveRateCardMarkup(markupType, globalMarkup)
      toast.success("Rate card markup saved successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to save markup")
    }
  }

  const calculateExample = () => {
    const baseRate = 28
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
            Rate Card Markup Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configure markup for Rate Card display prices
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Rate Card Markup Configuration
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
                    This markup will be displayed in the Rate Card table
                  </p>
                </div>

                {/* Example Calculation */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Example Calculation</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">Base Rate (Zone A):</span>
                      <span className="font-medium">₹28</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">
                        Your Markup ({markupType === "percentage" ? `${globalMarkup}%` : `₹${globalMarkup}`}):
                      </span>
                      <span className="font-medium text-green-600">
                        {markupType === "percentage"
                          ? `+₹${Math.round(28 * globalMarkup / 100)}`
                          : `+₹${Math.round(globalMarkup)}`}
                      </span>
                    </div>
                    <div className="border-t border-blue-300 dark:border-blue-700 pt-2 flex justify-between">
                      <span className="font-semibold text-gray-900 dark:text-white">Display Price:</span>
                      <span className="font-bold text-blue-600 text-lg">₹{calculateExample()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Your Profit:</span>
                      <span className="font-medium text-green-600">
                        ₹{calculateExample() - 28}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-3">
                  <Button color="dark" onClick={handleSaveMarkup} disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <HiSave className="mr-2 h-5 w-5" />
                        Save Rate Card Markup
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
                About Rate Card Markup
              </h3>
              <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Set Markup</div>
                    <p className="text-xs">Choose percentage or fixed amount for Rate Card</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Auto Display</div>
                    <p className="text-xs">Markup automatically applies to Rate Card table</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Show to Customers</div>
                    <p className="text-xs">Display prices with your profit included</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex gap-2">
                  <svg className="h-5 w-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="text-xs text-green-800 dark:text-green-200">
                    <div className="font-semibold mb-1">Separate Settings</div>
                    Rate Card markup is independent from Rate Calculator markup
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

export default RateCardMarkupPage
