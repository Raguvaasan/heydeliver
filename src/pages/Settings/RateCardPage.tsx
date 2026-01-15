import { FC, useState } from "react";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import { Card, Tabs, Button, Badge } from "flowbite-react";
import { HiCalculator } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

const RateCardPage: FC = () => {
  const navigate = useNavigate();
  const [showGST, setShowGST] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Surface Rate Data
  const surfaceZones = [
    "ZONE A",
    "ZONE B",
    "ZONE C1",
    "ZONE C2",
    "ZONE D1",
    "ZONE D2",
    "ZONE E",
    "ZONE F",
  ];

  const surfaceRates = {
    baseFare: [31.0, 36.0, 37.0, 39.0, 40.0, 41.0, 46.0, 52.0],
    additional250g: [7.0, 9.0, 10.0, 11.0, 12.0, 13.0, 15.0, 17.0],
    additional500g: [14.0, 18.0, 21.0, 24.0, 26.0, 27.0, 34.0, 37.0],
    additional1kg: [16.0, 19.0, 24.0, 27.0, 30.0, 35.0, 39.0, 42.0],
    returnRTO: [31.0, 36.0, 37.0, 39.0, 40.0, 41.0, 46.0, 52.0],
    reverseDTO: [50.0, 58.0, 59.0, 62.0, 64.0, 66.0, 74.0, 83.0],
  };

  // Express Rate Data
  const expressZones = ["ZONE A", "ZONE B", "ZONE C", "ZONE D", "ZONE E", "ZONE F"];

  const expressRates = {
    baseFare: [31.0, 36.0, 47.0, 51.0, 62.0, 69.0],
    additional250g: [7.0, 9.0, 14.0, 19.0, 20.0, 24.0],
    additional500g: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    additional1kg: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    returnRTO: [31.0, 36.0, 39.0, 41.0, 46.0, 52.0],
    reverseDTO: [50.0, 58.0, 62.0, 66.0, 74.0, 83.0],
  };

  const RateTable = ({
    zones,
    rates,
    type,
  }: {
    zones: string[];
    rates: any;
    type: string;
  }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 min-w-[250px]">
              {type === "Surface" ? "🚚 Surface" : "⚡ Express"}
            </th>
            {zones.map((zone, idx) => (
              <th key={idx} scope="col" className="px-6 py-3 text-center">
                {zone}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Base Fare */}
          <tr className="bg-white border-b hover:bg-gray-50">
            <td className="px-6 py-4 font-medium text-gray-900">
              Base Fare (upto 250 g)
            </td>
            {rates.baseFare.map((rate: number, idx: number) => (
              <td key={idx} className="px-6 py-4 text-center">
                ₹ {rate.toFixed(2)}
              </td>
            ))}
          </tr>

          {/* Additional 250g */}
          <tr className="bg-white border-b hover:bg-gray-50">
            <td className="px-6 py-4 font-medium text-gray-900">
              Every Additional 250 g (upto 500 g)
            </td>
            {rates.additional250g.map((rate: number, idx: number) => (
              <td key={idx} className="px-6 py-4 text-center">
                ₹ {rate.toFixed(2)}
              </td>
            ))}
          </tr>

          {/* Additional 500g */}
          <tr className="bg-white border-b hover:bg-gray-50">
            <td className="px-6 py-4 font-medium text-gray-900">
              Every Additional 500 g (upto 5 kg)
            </td>
            {rates.additional500g.map((rate: number, idx: number) => (
              <td key={idx} className="px-6 py-4 text-center">
                ₹ {rate.toFixed(2)}
              </td>
            ))}
          </tr>

          {/* Additional 1kg */}
          <tr className="bg-white border-b hover:bg-gray-50">
            <td className="px-6 py-4 font-medium text-gray-900">
              Every Additional 1 kg
            </td>
            {rates.additional1kg.map((rate: number, idx: number) => (
              <td key={idx} className="px-6 py-4 text-center">
                ₹ {rate.toFixed(2)}
              </td>
            ))}
          </tr>

          {/* Returns RTO */}
          <tr className="bg-gray-50">
            <td className="px-6 py-4 font-medium text-gray-900">
              ↩️ {type} - Returns (RTO)
            </td>
            <td colSpan={zones.length}></td>
          </tr>
          <tr className="bg-white border-b hover:bg-gray-50">
            <td className="px-6 py-4 font-medium text-gray-900">Base Fare</td>
            {rates.returnRTO.map((rate: number, idx: number) => (
              <td key={idx} className="px-6 py-4 text-center">
                ₹ {rate.toFixed(2)}
              </td>
            ))}
          </tr>

          {/* Reverse DTO */}
          <tr className="bg-gray-50">
            <td className="px-6 py-4 font-medium text-gray-900">
              📦 {type} - Reverse (DTO)
            </td>
            <td colSpan={zones.length}></td>
          </tr>
          <tr className="bg-white border-b hover:bg-gray-50">
            <td className="px-6 py-4 font-medium text-gray-900">Base Fare</td>
            {rates.reverseDTO.map((rate: number, idx: number) => (
              <td key={idx} className="px-6 py-4 text-center">
                ₹ {rate.toFixed(2)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4 pt-6 pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Information Center
          </h1>
        </div>

        <Card>
          {/* Tabs and Toggle */}
          <div className="flex items-center justify-between mb-6">
            <Tabs.Group
              aria-label="Rate Card Tabs"
              style="underline"
              onActiveTabChange={(tab) => setActiveTab(tab)}
            >
              <Tabs.Item active={activeTab === 0} title="Surface" />
              <Tabs.Item active={activeTab === 1} title="Express" />
            </Tabs.Group>

            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showGST}
                    onChange={(e) => setShowGST(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    Show Rates Inclusive of GST
                  </span>
                </label>
              </div>

              <Button color="dark" size="sm" onClick={() => navigate("/rate-calculator")}>
                <HiCalculator className="mr-2 h-4 w-4" />
                Try our Rate Calculator
              </Button>
            </div>
          </div>

          {/* Rate Tables */}
          {activeTab === 0 ? (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Surface Rates</h2>
              <RateTable zones={surfaceZones} rates={surfaceRates} type="Surface" />
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Express Rates</h2>
              <RateTable zones={expressZones} rates={expressRates} type="Express" />
            </>
          )}

          {/* COD Information */}
          <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 112 0v4a1 1 0 11-2 0V9zm1-5a1 1 0 100 2 1 1 0 000-2z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">CASH ON DELIVERY RATES (COD)</span> — ₹
                  50.00 or 2% of product bill value whichever is higher
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700">
                  These rates are exclusive of GST • Diesel Price Hike (DPH) Charges as per
                  Industry Standards
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Additional Information */}
        <Card className="mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Additional Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Maximum Liability - Forward
              </h3>
              <p className="text-gray-600">
                Lower of 100% of product value or ₹ 2000
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Maximum Liability - Reverse
              </h3>
              <p className="text-gray-600">
                Lower of 50% of product value or ₹ 2000
              </p>
            </div>
          </div>
        </Card>

        {/* Call to Action */}
        <Card className="mt-6">
          <div className="text-center py-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Want to calculate the charges between two cities?
            </h3>
            <Button
              color="dark"
              size="lg"
              onClick={() => navigate("/rate-calculator")}
            >
              <HiCalculator className="mr-2 h-5 w-5" />
              Try our Rate Calculator
            </Button>
          </div>
        </Card>
      </div>
    </NavbarSidebarLayout>
  );
};

export default RateCardPage;
