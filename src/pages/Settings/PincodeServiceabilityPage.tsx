import { FC, useState } from "react";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import { Card, Button, TextInput, Label } from "flowbite-react";
import { HiSearch } from "react-icons/hi";
import toast from "react-hot-toast";
import { usePincodeStore } from "../../store/pincodeStore";

const PincodeServiceabilityPage: FC = () => {
  const [pincode, setPincode] = useState("");
  const { pincodeData, loading, error, fetchPincodeData, clearData } = usePincodeStore();

  const handleCheckPincode = () => {
    if (!pincode.trim() || pincode.length !== 6) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }
    fetchPincodeData(pincode);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCheckPincode();
    }
  };

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4 pt-6 pb-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Pincode Serviceability
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Check last-mile serviceability by entering a pincode
          </p>
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
                  onClick={handleCheckPincode}
                  disabled={loading || pincode.length !== 6}
                  className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700"
                  isProcessing={loading}
                >
                  Check Serviceability
                </Button>
              </div>
            </div>

            {/* Results Section */}
            {pincodeData && (
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
                        {pincodeData.postal_code.pin}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">City</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {pincodeData.postal_code.city}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">District</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {pincodeData.postal_code.district}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">State</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {pincodeData.postal_code.state_code}
                      </div>
                    </div>
                  </div>

                  {/* Service Status */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${pincodeData.postal_code.cod === "Y" ? "bg-green-500" : "bg-red-500"}`}></div>
                        <span className="font-medium text-gray-900 dark:text-white">Cash on Delivery (COD)</span>
                      </div>
                      <span className={`text-sm font-semibold ${pincodeData.postal_code.cod === "Y" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {pincodeData.postal_code.cod === "Y" ? "Available" : "Not Available"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${pincodeData.postal_code.pre_paid === "Y" ? "bg-green-500" : "bg-red-500"}`}></div>
                        <span className="font-medium text-gray-900 dark:text-white">Prepaid Delivery</span>
                      </div>
                      <span className={`text-sm font-semibold ${pincodeData.postal_code.pre_paid === "Y" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {pincodeData.postal_code.pre_paid === "Y" ? "Available" : "Not Available"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${pincodeData.postal_code.pickup === "Y" ? "bg-green-500" : "bg-red-500"}`}></div>
                        <span className="font-medium text-gray-900 dark:text-white">Pickup Service</span>
                      </div>
                      <span className={`text-sm font-semibold ${pincodeData.postal_code.pickup === "Y" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {pincodeData.postal_code.pickup === "Y" ? "Available" : "Not Available"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${pincodeData.postal_code.repl === "Y" ? "bg-green-500" : "bg-red-500"}`}></div>
                        <span className="font-medium text-gray-900 dark:text-white">Return Service</span>
                      </div>
                      <span className={`text-sm font-semibold ${pincodeData.postal_code.repl === "Y" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {pincodeData.postal_code.repl === "Y" ? "Available" : "Not Available"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!pincodeData && !loading && !error && (
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
  );
};

export default PincodeServiceabilityPage;
