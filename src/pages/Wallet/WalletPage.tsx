import { FC, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { Card, Button, Modal, Label, TextInput, Tabs, Spinner } from "flowbite-react"
import { HiCurrencyRupee, HiCreditCard } from "react-icons/hi"
import toast from "react-hot-toast"
import { useWalletStore } from "../../store/walletStore"

const WalletPage: FC = () => {
  const navigate = useNavigate()
  const [showRechargeModal, setShowRechargeModal] = useState(false)
  const [rechargeAmount, setRechargeAmount] = useState("")
  const [paymentType, setPaymentType] = useState<"upi" | "card">("upi")
  const [activeTab, setActiveTab] = useState(0)
  const [transactionsFromDate, setTransactionsFromDate] = useState("")
  const [transactionsToDate, setTransactionsToDate] = useState("")
  const [rechargesFromDate, setRechargesFromDate] = useState("")
  const [rechargesToDate, setRechargesToDate] = useState("")

  // Get user role from session storage
  const getProfileData = () => {
    try {
      const profileData = sessionStorage.getItem("profileData")
      return profileData ? JSON.parse(profileData) : null
    } catch (error) {
      return null
    }
  }

  const profileData = getProfileData()
  const loginType = sessionStorage.getItem("loginType") || ""
  const userRole = profileData?.role?.name?.toLowerCase() || ""
  const roleName = profileData?.role?.roleName?.toLowerCase() || ""
  
  // Check if user is admin from multiple sources
  const isAdmin = loginType === "admin" || 
                 userRole === "admin" || 
                 userRole === "super admin" ||
                 roleName === "admin" ||
                 roleName === "super admin"

  // Get data from wallet store
  const { balance, transactions, loading, error, fetchBalance, fetchTransactions, fetchAllFranchiseTransactions, fetchAllFranchiseRecharges } = useWalletStore()

  // Calculate totals - ensure transactions is always an array
  const safeTransactions = Array.isArray(transactions) ? transactions : []
  const totalCredit = safeTransactions
    .filter((t) => t.type === "credit" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalDebit = safeTransactions
    .filter((t) => t.type === "debit" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)

  // Separate transactions by type
  // Recharges: wallet credit transactions (adding money)
  // For admin: show all credit transactions from all franchises
  // For users: show only their own recharge transactions
  const recharges = isAdmin 
    ? safeTransactions.filter((t) => t.type === "credit")  // Admin sees all franchise credits
    : safeTransactions.filter((t) => 
        t.type === "credit" && t.description?.toLowerCase().includes("recharge")
      )

  // Order transactions: transactions related to orders (typically debits or with orderId)
  const orderTransactions = safeTransactions.filter((t) => 
    t.type === "debit" || (t.orderId && !t.description?.toLowerCase().includes("recharge"))
  )

  const isWithinDateRange = (createdAt: string, fromDate: string, toDate: string): boolean => {
    const txDate = new Date(createdAt)
    if (Number.isNaN(txDate.getTime())) return false

    if (fromDate) {
      const from = new Date(fromDate)
      from.setHours(0, 0, 0, 0)
      if (txDate < from) return false
    }

    if (toDate) {
      const to = new Date(toDate)
      to.setHours(23, 59, 59, 999)
      if (txDate > to) return false
    }

    return true
  }

  const filteredOrderTransactions = orderTransactions.filter((t) =>
    isWithinDateRange(t.createdAt, transactionsFromDate, transactionsToDate)
  )

  const filteredRecharges = recharges.filter((t) =>
    isWithinDateRange(t.createdAt, rechargesFromDate, rechargesToDate)
  )

  // Fetch data on mount - admin gets all franchise transactions, others get their own
  useEffect(() => {
    if (isAdmin) {
      if (activeTab === 0) {
        // Transactions tab: fetch all types
        fetchAllFranchiseTransactions()
      } else {
        // Recharges tab: fetch only credit transactions
        fetchAllFranchiseRecharges()
      }
    } else {
      fetchBalance()
      fetchTransactions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, activeTab]) // Only re-run when role or tab changes

  const handleRecharge = () => {
    if (!rechargeAmount || parseFloat(rechargeAmount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    // Navigate to add money page with amount
    navigate(`/wallet/add?amount=${rechargeAmount}`)
    setShowRechargeModal(false)
  }

  // Helper function to extract user/franchise name from transaction
  const getUserDisplayName = (transaction: any): string => {
    // Try different possible formats from backend
    if (transaction.franchiseName) return transaction.franchiseName
    if (transaction.userName) return transaction.userName
    
    // Check nested user object
    if (transaction.user) {
      if (transaction.user.name) return transaction.user.name
      if (transaction.user.agencyName) return transaction.user.agencyName
      if (transaction.user.firstName && transaction.user.lastName) {
        return `${transaction.user.firstName} ${transaction.user.lastName}`
      }
      if (transaction.user.firstName) return transaction.user.firstName
      if (transaction.user.email) return transaction.user.email
    }
    
    // Check nested franchise object
    if (transaction.franchise) {
      if (transaction.franchise.agencyName) return transaction.franchise.agencyName
      if (transaction.franchise.name) return transaction.franchise.name
    }
    
    // Fallback to userId if nothing else found
    return transaction.userId || "-"
  }

  const quickAmounts = [1, 10, 50, 100, 500, 1000]

  return (
    <NavbarSidebarLayout>
      <div className="px-4 pt-6">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {isAdmin ? "Agency Wallet Transactions" : "Wallet"}
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

        {/* Admin Summary Card - Show franchise recharge statistics */}
        {isAdmin && !loading && (
          <Card className="mb-6">
            <div className="mb-4">
              <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Agency Wallets Overview
              </h2>
            </div>
            <div className="flex gap-8">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Recharges</p>
                <p className="text-2xl font-semibold text-blue-600">{recharges.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Credit Amount</p>
                <p className="text-2xl font-semibold text-green-600">₹{totalCredit.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Debit Amount</p>
                <p className="text-2xl font-semibold text-red-600">₹{totalDebit.toFixed(2)}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Wallet Balance Card - Only show for non-admin users */}
        {!isAdmin && (
          <Card className="mb-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      Current Balance
                    </h2>
                    <p className="text-3xl font-bold text-orange-600">
                      ₹ {(balance || 0).toFixed(2)}
                    </p>
                  </div>
                  <Button
                    color="dark"
                    onClick={() => setShowRechargeModal(true)}
                    className="bg-gray-800 hover:bg-gray-900"
                  >
                    <HiCurrencyRupee className="mr-2 h-5 w-5" />
                    Recharge Wallet
                  </Button>
                </div>

                {activeTab === 0 && (
                  <div className="flex gap-8 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Credit</p>
                      <p className="text-lg font-semibold text-green-600">₹{totalCredit.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Debit</p>
                      <p className="text-lg font-semibold text-red-600">₹{totalDebit.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        )}

        {/* Tabs for Transactions and Recharges */}
        <Card>
          <Tabs.Group
            aria-label="Wallet tabs"
            style="underline"
            onActiveTabChange={(tab) => setActiveTab(tab)}
          >
            <Tabs.Item active title="Transactions">
              <div className="mb-4 flex gap-4">
                {/* <TextInput
                  placeholder="Search by AWB number"
                  className="flex-1"
                /> */}
                <div>
                  <Label htmlFor="transactionsFromDate" value="From Date" />
                  <TextInput
                    id="transactionsFromDate"
                    type="date"
                    value={transactionsFromDate}
                    onChange={(e) => setTransactionsFromDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="transactionsToDate" value="To Date" />
                  <TextInput
                    id="transactionsToDate"
                    type="date"
                    value={transactionsToDate}
                    min={transactionsFromDate || undefined}
                    onChange={(e) => setTransactionsToDate(e.target.value)}
                  />
                </div>
                {/* <select className="border border-gray-300 rounded-lg px-3">
                  <option>Transaction Type</option>
                  <option>Credit</option>
                  <option>Debit</option>
                </select> */}
                {/* <select className="border border-gray-300 rounded-lg px-3 py-2">
                  <option>Account Name</option>
                </select> */}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th className="px-4 py-3">Transaction Details</th>
                      <th className="px-4 py-3">Account Details</th>
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">AWB / LBN</th>
                      <th className="px-4 py-3">Weight & Zone</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Credit</th>
                      <th className="px-4 py-3">Debit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrderTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8">
                          No Records Found
                        </td>
                      </tr>
                    ) : (
                      filteredOrderTransactions.map((transaction, index) => (
                        <tr key={transaction.id || index} className="border-b dark:border-gray-700">
                          <td className="px-4 py-3">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">-</td>
                          <td className="px-4 py-3">{transaction.orderId || "-"}</td>
                          <td className="px-4 py-3">-</td>
                          <td className="px-4 py-3">-</td>
                          <td className="px-4 py-3">{transaction.description}</td>
                          <td className="px-4 py-3 text-green-600">
                            {transaction.type === "credit" ? `₹${transaction.amount.toFixed(2)}` : "-"}
                          </td>
                          <td className="px-4 py-3 text-red-600">
                            {transaction.type === "debit" ? `₹${transaction.amount.toFixed(2)}` : "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-500">
                  Showing 1 - {filteredOrderTransactions.length} of {filteredOrderTransactions.length}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" color="gray" disabled>Previous</Button>
                  <Button size="sm" color="gray" disabled>Next</Button>
                </div>
              </div>
            </Tabs.Item>

            <Tabs.Item title="Recharges">
              <div className="mb-4">
                <TextInput
                  placeholder="Search by transaction ID"
                  className="max-w-sm"
                />
                <div className="mt-3 flex gap-2">
                  <div>
                    <Label htmlFor="rechargesFromDate" value="From Date" />
                    <TextInput
                      id="rechargesFromDate"
                      type="date"
                      value={rechargesFromDate}
                      onChange={(e) => setRechargesFromDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rechargesToDate" value="To Date" />
                    <TextInput
                      id="rechargesToDate"
                      type="date"
                      value={rechargesToDate}
                      min={rechargesFromDate || undefined}
                      onChange={(e) => setRechargesToDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th className="px-4 py-3">Transaction ID</th>
                      <th className="px-4 py-3">Transaction Date</th>
                      {isAdmin && <th className="px-4 py-3">Agency / User</th>}
                      <th className="px-4 py-3">Payment Method</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Transaction Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecharges.length === 0 ? (
                      <tr>
                        <td colSpan={isAdmin ? 6 : 5} className="text-center py-8">
                          No Records Found
                        </td>
                      </tr>
                    ) : (
                      filteredRecharges.map((recharge, index) => (
                        <tr key={recharge.id || index} className="border-b dark:border-gray-700">
                          <td className="px-4 py-3">{recharge.id}</td>
                          <td className="px-4 py-3">
                            {new Date(recharge.createdAt).toLocaleString()}
                          </td>
                          {isAdmin && (
                            <td className="px-4 py-3">
                              {getUserDisplayName(recharge)}
                            </td>
                          )}
                          <td className="px-4 py-3">{recharge.paymentMethod || "-"}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                recharge.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : recharge.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {recharge.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">₹{recharge.amount.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-500">
                  Showing 1 - {filteredRecharges.length} of {filteredRecharges.length}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" color="gray" disabled>Previous</Button>
                  <Button size="sm" color="gray" disabled>Next</Button>
                </div>
              </div>
            </Tabs.Item>
          </Tabs.Group>
        </Card>
      </div>

      {/* Recharge Modal */}
      <Modal
        show={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
        // size="lg"
      >
        <Modal.Header>Recharge Wallet</Modal.Header>
        <Modal.Body>
          <div className="space-y-6 h-[48vh] overflow-auto">
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-lg mb-3">
                <HiCurrencyRupee className="w-10 h-10 text-gray-600" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add money to your wallet for seamless order processing
              </p>
            </div>

            <div>
              <Label htmlFor="amount" value="Enter Recharge Amount" />
              <div className="relative mt-2">
                <span className="absolute left-3 top-2.5 text-gray-500 font-semibold">₹</span>
                <TextInput
                  id="amount"
                  type="number"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  placeholder="100"
                  className="pl-8"
                  min="1"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter any amount starting from ₹1
              </p>
              <div className="flex gap-3 mt-3">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setRechargeAmount(amount.toString())}
                    className="text-blue-600 text-sm hover:underline font-medium"
                  >
                    +₹{amount}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label value="Select Payment Type" className="mb-3 block" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentType("upi")}
                  className={`border-2 rounded-lg p-6 flex flex-col items-center gap-3 transition-all ${
                    paymentType === "upi"
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                      : "border-gray-300 hover:border-gray-400 dark:border-gray-600"
                  }`}
                >
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-white">
                    <HiCurrencyRupee className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    UPI / Netbanking / Others
                  </p>
                </button>

                <button
                  onClick={() => setPaymentType("card")}
                  className={`border-2 rounded-lg p-6 flex flex-col items-center gap-3 transition-all ${
                    paymentType === "card"
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                      : "border-gray-300 hover:border-gray-400 dark:border-gray-600"
                  }`}
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <HiCreditCard className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Credit / Debit Card
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      *Upto 2% convenience fee will apply
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            color="dark"
            onClick={handleRecharge}
            size="lg"
            className="w-full bg-gray-800 hover:bg-gray-900"
          >
            Proceed To Payment
          </Button>
        </Modal.Footer>
      </Modal>
    </NavbarSidebarLayout>
  )
}

export default WalletPage
