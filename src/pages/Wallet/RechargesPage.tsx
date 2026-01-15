import { FC, useState } from "react"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { Card, Button, TextInput } from "flowbite-react"
import { HiCalendar } from "react-icons/hi"

const RechargesPage: FC = () => {
  const [dateRange, setDateRange] = useState("8 Jan 2026 to 15 Jan 2026")
  const [searchTransactionId, setSearchTransactionId] = useState("")

  // Mock data
  const currentBalance = 0.0
  const recharges: any[] = []

  return (
    <NavbarSidebarLayout>
      <div className="px-4 pt-6">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Wallet
          </h1>
        </div>

        {/* Balance Card */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Current Balance
              </h2>
              <p className="text-3xl font-bold text-orange-600 mt-1">
                ₹ {currentBalance.toFixed(2)}
              </p>
            </div>
            <Button color="dark" className="bg-gray-800 hover:bg-gray-900">
              Recharge Wallet
            </Button>
          </div>
        </Card>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <TextInput
                placeholder="Search by transaction ID"
                value={searchTransactionId}
                onChange={(e) => setSearchTransactionId(e.target.value)}
              />
            </div>
            <Button color="gray">
              <HiCalendar className="mr-2 h-4 w-4" />
              Date Range: {dateRange}
            </Button>
          </div>
        </Card>

        {/* Recharges Table Card */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3">Transaction ID</th>
                  <th className="px-4 py-3">Transaction Date</th>
                  <th className="px-4 py-3 flex items-center">
                    Bank's Transaction ID
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                      />
                    </svg>
                  </th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Transaction Amount</th>
                </tr>
              </thead>
              <tbody>
                {recharges.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-12 text-gray-500 dark:text-gray-400"
                    >
                      <div className="flex flex-col items-center">
                        <svg
                          className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <p className="text-lg font-medium">No Records Found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recharges.map((recharge: any, index: number) => (
                    <tr
                      key={index}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-4 py-3">{recharge.id}</td>
                      <td className="px-4 py-3">{recharge.date}</td>
                      <td className="px-4 py-3">{recharge.bankTransactionId}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            recharge.status === "Success"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : recharge.status === "Failed"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          }`}
                        >
                          {recharge.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        ₹{recharge.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Showing 1 - 0 of 0
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Show</span>
              <select className="border border-gray-300 rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600">
                <option>10</option>
                <option>25</option>
                <option>50</option>
                <option>100</option>
              </select>
              <span className="text-sm text-gray-500 dark:text-gray-400">per page</span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" color="gray" disabled>
                &lt;
              </Button>
              <Button size="sm" color="gray">
                Go to Page
              </Button>
              <Button size="sm" color="gray" disabled>
                &gt;
              </Button>
              <Button size="sm" color="gray">
                &gt;&gt;
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </NavbarSidebarLayout>
  )
}

export default RechargesPage
