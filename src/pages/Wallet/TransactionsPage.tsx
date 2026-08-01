import { FC, useState, useEffect } from "react"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { Card, Button, TextInput, Select, Spinner, Label } from "flowbite-react"
import { useWalletStore } from "../../store/walletStore"

const TransactionsPage: FC = () => {
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [transactionType, setTransactionType] = useState("")

  // Get data from wallet store
  const { balance, transactions, loading, error, fetchBalance, fetchTransactions } = useWalletStore()

  // Calculate totals - ensure transactions is always an array
  const safeTransactions = Array.isArray(transactions) ? transactions : []
  const totalCredit = safeTransactions
    .filter((t) => t.type === "credit" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalDebit = safeTransactions
    .filter((t) => t.type === "debit" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)

  // Fetch data on mount
  useEffect(() => {
    fetchBalance()
    fetchTransactions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Run only on mount

  // Helper function to extract readable order ID
  const getOrderId = (orderId: string | undefined) => {
    if (!orderId) return "-"
    const parts = orderId.split("_")
    return parts[parts.length - 1] || orderId
  }

  // Helper function to format payment method
  const formatPaymentMethod = (method: string | undefined) => {
    if (!method) return "-"
    return method.toUpperCase()
  }

  const filteredTransactions = safeTransactions.filter((transaction) => {
    const txDate = new Date(transaction.createdAt)
    if (Number.isNaN(txDate.getTime())) return false

    if (fromDate) {
      const start = new Date(fromDate)
      start.setHours(0, 0, 0, 0)
      if (txDate < start) return false
    }

    if (toDate) {
      const end = new Date(toDate)
      end.setHours(23, 59, 59, 999)
      if (txDate > end) return false
    }

    if (transactionType && transaction.type !== transactionType) return false

    return true
  })

  return (
    <NavbarSidebarLayout>
      <div className="px-4 pt-6">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Wallet Transactions
          </h1>
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="mb-6 bg-red-50 dark:bg-red-900/20">
            <div className="text-red-600 dark:text-red-400">
              {error}
            </div>
          </Card>
        )}

        {/* Balance Summary Card */}
        <Card className="mb-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Current Balance
                </h2>
                <p className="text-3xl font-bold text-orange-600 mt-1">
                  ₹ {(balance || 0).toFixed(2)}
                </p>
              </div>
              <div className="flex gap-8">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Credit</p>
                  <p className="text-xl font-semibold text-green-600">
                    ₹{totalCredit.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Debit</p>
                  <p className="text-xl font-semibold text-red-600">
                    ₹{totalDebit.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Filters Card */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* <div className="lg:col-span-1">
              <TextInput
                placeholder="Search by AWB number"
                value={searchAwb}
                onChange={(e) => setSearchAwb(e.target.value)}
              />
            </div> */}
            <div>
              <Label htmlFor="fromDate" value="From Date" />
              <TextInput
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="toDate" value="To Date" />
              <TextInput
                id="toDate"
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div>
               <Label htmlFor="Transaction Type" value="Transaction Type" />
              <Select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
              >
                <option value="">Transaction Type</option>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
              </Select>
            </div>
            {/* <div>
              <Select
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              >
                <option value="">Account Name</option>
              </Select>
            </div> */}
          </div>
        </Card>

        {/* Transactions Table Card */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3">Transaction Details</th>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Branch Name</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3 text-right">Credit</th>
                  <th className="px-4 py-3 text-right">Debit</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
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
                  filteredTransactions.map((transaction, index) => (
                    <tr
                      key={transaction.id || index}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-4 py-3">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {transaction.orderId}
                      </td>
                      <td className="px-4 py-3 font-medium text-orange-600">
                        {transaction.franchiseName || "-"}
                      </td>
                      <td className="px-4 py-3">{transaction.description}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          {formatPaymentMethod(transaction.paymentMethod)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-green-600 font-medium">
                        {transaction.type === "credit" ? `₹${transaction.amount.toFixed(2)}` : "-"}
                      </td>
                      <td className="px-4 py-3 text-right text-red-600 font-medium">
                        {transaction.type === "debit" ? `₹${transaction.amount.toFixed(2)}` : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing 1 - {filteredTransactions.length} of {filteredTransactions.length}
            </p>
            <div className="flex gap-2">
              <Button size="sm" color="gray" disabled>
                &larr; Previous
              </Button>
              <Button size="sm" color="gray">
                Go to Page
              </Button>
              <Button size="sm" color="gray" disabled>
                Next &rarr;
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </NavbarSidebarLayout>
  )
}

export default TransactionsPage
