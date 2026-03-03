import { FC, useState, useEffect } from "react";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import { Card, Tabs, Button, Badge } from "flowbite-react";
import { HiCalculator } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useMarkupStore } from "../../store/markupStore";

const RateCardPage: FC = () => {
  const navigate = useNavigate();
  const [showGST, setShowGST] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  const { rateCardMarkup, fetchRateCardMarkup } = useMarkupStore();

  // Fetch markup from API on component mount
  useEffect(() => {
    fetchRateCardMarkup();
  }, []);

  // Apply markup to rate
  const applyMarkup = (rate: number): number => {
    if (!rateCardMarkup) return Math.round(rate);
    
    let finalRate = rate;
    
    if (rateCardMarkup.markup_type === "percentage") {
      finalRate = rate * (1 + rateCardMarkup.markup_value / 100);
    } else {
      finalRate = rate + rateCardMarkup.markup_value;
    }
    
    return Math.round(finalRate);
  };

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
        <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-900 dark:text-gray-200">
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
          <tr className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
              Base Fare (upto 250 g)
            </td>
            {rates.baseFare.map((rate: number, idx: number) => (
              <td key={idx} className="px-6 py-4 text-center text-gray-900 dark:text-gray-200">
                ₹ {applyMarkup(rate)}
              </td>
            ))}
          </tr>

          {/* Additional 250g */}
          <tr className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
              Every Additional 250 g (upto 500 g)
            </td>
            {rates.additional250g.map((rate: number, idx: number) => (
              <td key={idx} className="px-6 py-4 text-center text-gray-900 dark:text-gray-200">
                ₹ {applyMarkup(rate)}
              </td>
            ))}
          </tr>

          {/* Additional 500g */}
          <tr className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
              Every Additional 500 g (upto 5 kg)
            </td>
            {rates.additional500g.map((rate: number, idx: number) => (
              <td key={idx} className="px-6 py-4 text-center text-gray-900 dark:text-gray-200">
                ₹ {applyMarkup(rate)}
              </td>
            ))}
          </tr>

          {/* Additional 1kg */}
          <tr className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
              Every Additional 1 kg
            </td>
            {rates.additional1kg.map((rate: number, idx: number) => (
              <td key={idx} className="px-6 py-4 text-center text-gray-900 dark:text-gray-200">
                ₹ {applyMarkup(rate)}
              </td>
            ))}
          </tr>

          {/* Returns RTO */}
          <tr className="bg-gray-50 dark:bg-gray-900">
            <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
              ↩️ {type} - Returns (RTO)
            </td>
            <td colSpan={zones.length}></td>
          </tr>
          <tr className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">Base Fare</td>
            {rates.returnRTO.map((rate: number, idx: number) => (
              <td key={idx} className="px-6 py-4 text-center text-gray-900 dark:text-gray-200">
                ₹ {applyMarkup(rate)}
              </td>
            ))}
          </tr>

          {/* Reverse DTO */}
          <tr className="bg-gray-50 dark:bg-gray-900">
            <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
              📦 {type} - Reverse (DTO)
            </td>
            <td colSpan={zones.length}></td>
          </tr>
          <tr className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">Base Fare</td>
            {rates.reverseDTO.map((rate: number, idx: number) => (
              <td key={idx} className="px-6 py-4 text-center text-gray-900 dark:text-gray-200">
                ₹ {applyMarkup(rate)}
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

        <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          {/* Tabs and Toggle */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Tabs.Group
                aria-label="Rate Card Tabs"
                style="underline"
                onActiveTabChange={(tab) => setActiveTab(tab)}
              >
                <Tabs.Item active={activeTab === 0} title="Surface" />
                <Tabs.Item active={activeTab === 1} title="Express" />
              </Tabs.Group>
              
              {rateCardMarkup && rateCardMarkup.markup_value > 0 && (
                <Badge color="success" size="sm">
                  {rateCardMarkup.markup_type === "percentage" 
                    ? `+${rateCardMarkup.markup_value}% Markup Applied` 
                    : `+₹${rateCardMarkup.markup_value} Markup Applied`}
                </Badge>
              )}
            </div>

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
                  <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
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
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Surface Rates</h2>
              <RateTable zones={surfaceZones} rates={surfaceRates} type="Surface" />
            </>
          ) : (
            <>
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Express Rates</h2>
              <RateTable zones={expressZones} rates={expressRates} type="Express" />
            </>
          )}

          {/* COD Information */}
          <div className="mt-6 rounded border-l-4 border-blue-400 bg-blue-50 p-4 dark:bg-blue-900/20">
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
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <span className="font-semibold">CASH ON DELIVERY RATES (COD)</span> — ₹
                  50.00 or 2% of product bill value whichever is higher
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-4 rounded bg-gray-50 p-4 dark:bg-gray-700/60">
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
                <p className="text-sm text-gray-700 dark:text-gray-200">
                  These rates are exclusive of GST • Diesel Price Hike (DPH) Charges as per
                  Industry Standards
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Additional Information */}
        <Card className="mt-6 border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
            Additional Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                Maximum Liability - Forward
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Lower of 100% of product value or ₹ 2000
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                Maximum Liability - Reverse
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Lower of 50% of product value or ₹ 2000
              </p>
            </div>
          </div>
        </Card>

        {/* Call to Action */}
        <Card className="mt-6 border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="text-center py-8">
            <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
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
