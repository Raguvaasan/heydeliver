import { FC, useState, useEffect } from "react";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import { Card, Button, TextInput, Badge, Table, Tabs, Spinner } from "flowbite-react";
import { HiSearch, HiCheckCircle, HiXCircle, HiDownload, HiUpload, HiLocationMarker, HiTruck } from "react-icons/hi";
import toast from "react-hot-toast";
import { usePincodeStore } from "../../store/pincodeStore";

const PincodeServiceabilityPage: FC = () => {
  const [pincode, setPincode] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const { pincodeData, loading, error, fetchPincodeData, clearData } = usePincodeStore();

  // Sample pincode data for table display
  const samplePincodes = [
    {
      pincode: "600001",
      city: "Chennai",
      state: "Tamil Nadu",
      serviceable: true,
      deliveryType: "Express & Surface",
      cod: true,
      prepaid: true,
      estimatedDays: "1-2 days",
    },
    {
      pincode: "400001",
      city: "Mumbai",
      state: "Maharashtra",
      serviceable: true,
      deliveryType: "Express & Surface",
      cod: true,
      prepaid: true,
      estimatedDays: "2-3 days",
    },
    {
      pincode: "560001",
      city: "Bangalore",
      state: "Karnataka",
      serviceable: true,
      deliveryType: "Express & Surface",
      cod: true,
      prepaid: true,
      estimatedDays: "1-2 days",
    },
    {
      pincode: "110001",
      city: "Delhi",
      state: "Delhi",
      serviceable: true,
      deliveryType: "Express & Surface",
      cod: true,
      prepaid: true,
      estimatedDays: "2-3 days",
    },
    {
      pincode: "700001",
      city: "Kolkata",
      state: "West Bengal",
      serviceable: true,
      deliveryType: "Surface",
      cod: false,
      prepaid: true,
      estimatedDays: "3-4 days",
    },
  ];

  const handleCheckPincode = () => {
    if (!pincode.trim() || pincode.length !== 6) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }
    fetchPincodeData(pincode);
  };

  const handleDownloadTemplate = () => {
    toast.success("Downloading pincode template...");
  };

  const handleUploadPincodes = () => {
    toast.info("Upload pincode functionality coming soon");
  };

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4 pt-6 pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Pincode Serviceability
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Check delivery serviceability and manage pincodes
          </p>
        </div>

        {/* Pincode Check Card */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Check Pincode Serviceability
            </h3>
          </div>

          <div className="flex gap-3 mb-6">
            <div className="flex-1">
              <TextInput
                type="text"
                placeholder="Enter 6-digit pincode (Try: 194103, 600001, 400001)"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyPress={(e) => e.key === "Enter" && handleCheckPincode()}
                sizing="lg"
                maxLength={6}
              />
            </div>
            <Button
              color="dark"
              size="lg"
              onClick={handleCheckPincode}
              disabled={loading}
              className="disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Checking...
                </>
              ) : (
                <>
                  <HiSearch className="mr-2 h-5 w-5" />
                  Check
                </>
              )}
            </Button>
          </div>

          {/* Error State */}
          {error && (
            <div className="p-6 rounded-lg bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-red-600 dark:text-red-400 mt-1">
                    <HiXCircle className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-red-900 dark:text-red-400 mb-2">
                      ✗ Error
                    </h4>
                    <p className="text-red-800 dark:text-red-300 mb-3">{error}</p>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded border border-yellow-200 dark:border-yellow-700 text-sm">
                      <p className="font-semibold text-gray-900 dark:text-white mb-2">💡 Currently Using Mock Data</p>
                      <p className="text-gray-700 dark:text-gray-300 mb-2">Try these pincodes: <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">194103, 600001, 400001, 560001, 110001, 700001</code></p>
                      <p className="text-gray-600 dark:text-gray-400 text-xs mt-2">When backend is ready, uncomment the API code in pincodeStore.ts</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setPincode("")
                    clearData()
                  }}
                  className="ml-4 px-3 py-1 text-sm bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="p-8 flex items-center justify-center">
              <div className="text-center">
                <Spinner size="lg" className="mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Fetching pincode details...</p>
              </div>
            </div>
          )}

          {/* Search Result - API Response Display */}
          {pincodeData && !loading && (
            <div className="p-6 rounded-lg bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800">
              <div className="flex items-start gap-4 mb-6">
                <div className="text-green-600 dark:text-green-400 mt-1">
                  <HiCheckCircle className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-green-900 dark:text-green-400 mb-1">
                    ✓ Serviceable
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Pincode is available for delivery
                  </p>
                </div>
              </div>

              {/* Main Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Pincode</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {pincodeData.postal_code.pin}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">City</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {pincodeData.postal_code.city}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">District</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {pincodeData.postal_code.district}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">State</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {pincodeData.postal_code.state_code}
                  </p>
                </div>
              </div>

              {/* Services Available */}
              <div className="mb-6">
                <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">
                  Services Available
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      pincodeData.postal_code.cod === "Y"
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}>
                      <HiTruck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">COD</p>
                      <Badge color={pincodeData.postal_code.cod === "Y" ? "success" : "gray"}>
                        {pincodeData.postal_code.cod === "Y" ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      pincodeData.postal_code.pre_paid === "Y"
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}>
                      <HiTruck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Prepaid</p>
                      <Badge color={pincodeData.postal_code.pre_paid === "Y" ? "success" : "gray"}>
                        {pincodeData.postal_code.pre_paid === "Y" ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      pincodeData.postal_code.pickup === "Y"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-400"
                    }`}>
                      <HiLocationMarker className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Pickup</p>
                      <Badge color={pincodeData.postal_code.pickup === "Y" ? "info" : "gray"}>
                        {pincodeData.postal_code.pickup === "Y" ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      pincodeData.postal_code.repl === "Y"
                        ? "bg-purple-100 text-purple-600"
                        : "bg-gray-100 text-gray-400"
                    }`}>
                      <HiTruck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Return</p>
                      <Badge color={pincodeData.postal_code.repl === "Y" ? "purple" : "gray"}>
                        {pincodeData.postal_code.repl === "Y" ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Max Weight</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {pincodeData.postal_code.max_weight} kg
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Max Amount (COD)</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    ₹{pincodeData.postal_code.max_amount.toLocaleString()}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">ODA</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {pincodeData.postal_code.is_oda === "Y" ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              {/* Centers/Distribution Points */}
              {pincodeData.postal_code.center && pincodeData.postal_code.center.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
                    Distribution Centers
                  </h5>
                  <div className="space-y-2">
                    {pincodeData.postal_code.center.slice(0, 5).map((center, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{center.cn}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Code: {center.code}</p>
                        </div>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                          {new Date(center.s).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </NavbarSidebarLayout>
  );
};

export default PincodeServiceabilityPage;
