import { FC, useState } from "react";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import { Card, Button, TextInput, Badge, Table, Tabs } from "flowbite-react";
import { HiSearch, HiCheckCircle, HiXCircle, HiDownload, HiUpload } from "react-icons/hi";
import toast from "react-hot-toast";

interface PincodeData {
  pincode: string;
  city: string;
  state: string;
  serviceable: boolean;
  deliveryType: string;
  cod: boolean;
  prepaid: boolean;
  estimatedDays: string;
}

const PincodeServiceabilityPage: FC = () => {
  const [pincode, setPincode] = useState("");
  const [searchResult, setSearchResult] = useState<PincodeData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Sample pincode data
  const samplePincodes: PincodeData[] = [
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

    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      const found = samplePincodes.find((p) => p.pincode === pincode);
      if (found) {
        setSearchResult(found);
        toast.success("Pincode found!");
      } else {
        setSearchResult({
          pincode: pincode,
          city: "Unknown",
          state: "Unknown",
          serviceable: false,
          deliveryType: "N/A",
          cod: false,
          prepaid: false,
          estimatedDays: "N/A",
        });
        toast.error("Pincode not serviceable");
      }
      setIsSearching(false);
    }, 800);
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

        {/* Coverage Stats - Top */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Pincodes</p>
                <p className="text-3xl font-bold text-gray-900">
                  {samplePincodes.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
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
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Serviceable</p>
                <p className="text-3xl font-bold text-green-600">
                  {samplePincodes.filter((p) => p.serviceable).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <HiCheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">COD Available</p>
                <p className="text-3xl font-bold text-purple-600">
                  {samplePincodes.filter((p) => p.cod).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Pincode Check Card */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Check Pincode Serviceability
          </h3>

          <div className="flex gap-3 mb-6">
            <div className="flex-1">
              <TextInput
                type="text"
                placeholder="Enter 6-digit pincode (e.g., 600001)"
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
              isProcessing={isSearching}
            >
              <HiSearch className="mr-2 h-5 w-5" />
              Check
            </Button>
          </div>

          {/* Search Result */}
          {searchResult && (
            <div className={`p-6 rounded-lg border-2 ${
              searchResult.serviceable
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`mt-1 ${
                    searchResult.serviceable ? "text-green-600" : "text-red-600"
                  }`}>
                    {searchResult.serviceable ? (
                      <HiCheckCircle className="h-8 w-8" />
                    ) : (
                      <HiXCircle className="h-8 w-8" />
                    )}
                  </div>
                  <div>
                    <h4 className={`text-xl font-bold mb-2 ${
                      searchResult.serviceable ? "text-green-900" : "text-red-900"
                    }`}>
                      {searchResult.serviceable
                        ? "✓ Serviceable"
                        : "✗ Not Serviceable"}
                    </h4>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-600">Pincode</p>
                        <p className="font-semibold text-gray-900">
                          {searchResult.pincode}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">City</p>
                        <p className="font-semibold text-gray-900">
                          {searchResult.city}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">State</p>
                        <p className="font-semibold text-gray-900">
                          {searchResult.state}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Delivery Type</p>
                        <p className="font-semibold text-gray-900">
                          {searchResult.deliveryType}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Estimated Delivery</p>
                        <p className="font-semibold text-gray-900">
                          {searchResult.estimatedDays}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Available Services</p>
                        <div className="flex gap-2">
                          {searchResult.cod && (
                            <Badge color="success">COD</Badge>
                          )}
                          {searchResult.prepaid && (
                            <Badge color="info">Prepaid</Badge>
                          )}
                          {!searchResult.cod && !searchResult.prepaid && (
                            <Badge color="gray">N/A</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Tabs for Serviceable/Non-serviceable */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <Tabs.Group
              aria-label="Pincode tabs"
              style="underline"
              onActiveTabChange={(tab) => setActiveTab(tab)}
            >
              <Tabs.Item active={activeTab === 0} title="All Pincodes" />
              <Tabs.Item active={activeTab === 1} title="Serviceable" />
              <Tabs.Item active={activeTab === 2} title="Non-serviceable" />
            </Tabs.Group>

            <div className="flex gap-2">
              <Button color="light" size="sm" onClick={handleDownloadTemplate}>
                <HiDownload className="mr-2 h-4 w-4" />
                Download Template
              </Button>
              <Button color="dark" size="sm" onClick={handleUploadPincodes}>
                <HiUpload className="mr-2 h-4 w-4" />
                Upload Pincodes
              </Button>
            </div>
          </div>

          {/* Pincode Table */}
          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Pincode</Table.HeadCell>
                <Table.HeadCell>City</Table.HeadCell>
                <Table.HeadCell>State</Table.HeadCell>
                <Table.HeadCell>Delivery Type</Table.HeadCell>
                <Table.HeadCell>COD</Table.HeadCell>
                <Table.HeadCell>Prepaid</Table.HeadCell>
                <Table.HeadCell>Est. Days</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {samplePincodes
                  .filter((p) => {
                    if (activeTab === 1) return p.serviceable;
                    if (activeTab === 2) return !p.serviceable;
                    return true;
                  })
                  .map((pinData, index) => (
                    <Table.Row
                      key={index}
                      className="bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <Table.Cell className="font-medium text-gray-900">
                        {pinData.pincode}
                      </Table.Cell>
                      <Table.Cell>{pinData.city}</Table.Cell>
                      <Table.Cell>{pinData.state}</Table.Cell>
                      <Table.Cell>{pinData.deliveryType}</Table.Cell>
                      <Table.Cell>
                        {pinData.cod ? (
                          <Badge color="success" size="sm">Yes</Badge>
                        ) : (
                          <Badge color="gray" size="sm">No</Badge>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        {pinData.prepaid ? (
                          <Badge color="success" size="sm">Yes</Badge>
                        ) : (
                          <Badge color="gray" size="sm">No</Badge>
                        )}
                      </Table.Cell>
                      <Table.Cell>{pinData.estimatedDays}</Table.Cell>
                      <Table.Cell>
                        {pinData.serviceable ? (
                          <Badge color="success">Serviceable</Badge>
                        ) : (
                          <Badge color="failure">Not Serviceable</Badge>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  ))}
              </Table.Body>
            </Table>
          </div>
        </Card>
      </div>
    </NavbarSidebarLayout>
  );
};

export default PincodeServiceabilityPage;
