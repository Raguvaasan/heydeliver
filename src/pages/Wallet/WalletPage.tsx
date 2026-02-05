import { FC, useState } from "react"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { Card, Button, Modal, Label, TextInput, Tabs } from "flowbite-react"
import { HiCurrencyRupee, HiCreditCard } from "react-icons/hi"
import toast from "react-hot-toast"

const WalletPage: FC = () => {
  const [showRechargeModal, setShowRechargeModal] = useState(false)
  const [rechargeAmount, setRechargeAmount] = useState("")
  const [paymentType, setPaymentType] = useState<"upi" | "card">("upi")
  const [activeTab, setActiveTab] = useState(0)

  // Mock data
  const currentBalance = 0.0
  const totalCredit = 0.0
  const totalDebit = 0.0

  const transactions: any[] = []
  const recharges: any[] = []

  const handleRecharge = () => {
    if (!rechargeAmount || parseFloat(rechargeAmount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    // Handle payment processing here
    toast.success("Proceeding to payment...")
    setShowRechargeModal(false)
  }

  const quickAmounts = [500, 1000, 2000, 5000]

  return (
    <NavbarSidebarLayout>
      <div className="px-4 pt-6">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Wallet
          </h1>
        </div>

        {/* Wallet Balance Card */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Current Balance
              </h2>
              <p className="text-3xl font-bold text-orange-600">
                ₹ {currentBalance.toFixed(2)}
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
        </Card>

        {/* Tabs for Transactions and Recharges */}
        <Card>
          <Tabs.Group
            aria-label="Wallet tabs"
            style="underline"
            onActiveTabChange={(tab) => setActiveTab(tab)}
          >
            <Tabs.Item active title="Transactions">
              <div className="mb-4 flex gap-4">
                <TextInput
                  placeholder="Search by AWB number"
                  className="flex-1"
                />
                <Button color="gray">
                  Date Range: 8 Jan 2026 to 15 Jan 2026
                </Button>
                <select className="border border-gray-300 rounded-lg px-3 py-2">
                  <option>Transaction Type</option>
                  <option>Credit</option>
                  <option>Debit</option>
                </select>
                <select className="border border-gray-300 rounded-lg px-3 py-2">
                  <option>Account Name</option>
                </select>
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
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8">
                          No Records Found
                        </td>
                      </tr>
                    ) : (
                      transactions.map((transaction: any, index: number) => (
                        <tr key={index} className="border-b dark:border-gray-700">
                          <td className="px-4 py-3">{transaction.details}</td>
                          <td className="px-4 py-3">{transaction.account}</td>
                          <td className="px-4 py-3">{transaction.orderId}</td>
                          <td className="px-4 py-3">{transaction.awb}</td>
                          <td className="px-4 py-3">{transaction.weight}</td>
                          <td className="px-4 py-3">{transaction.description}</td>
                          <td className="px-4 py-3 text-green-600">
                            {transaction.credit}
                          </td>
                          <td className="px-4 py-3 text-red-600">
                            {transaction.debit}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-500">Showing 1 - 0 of 0</p>
                <div className="flex gap-2">
                  <Button size="sm" color="gray">Previous</Button>
                  <Button size="sm" color="gray">Next</Button>
                </div>
              </div>
            </Tabs.Item>

            <Tabs.Item title="Recharges">
              <div className="mb-4">
                <TextInput
                  placeholder="Search by transaction ID"
                  className="max-w-sm"
                />
                <Button color="gray" className="ml-2">
                  Date Range: 8 Jan 2026 to 15 Jan 2026
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th className="px-4 py-3">Transaction ID</th>
                      <th className="px-4 py-3">Transaction Date</th>
                      <th className="px-4 py-3">Bank's Transaction ID</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Transaction Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recharges.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8">
                          No Records Found
                        </td>
                      </tr>
                    ) : (
                      recharges.map((recharge: any, index: number) => (
                        <tr key={index} className="border-b dark:border-gray-700">
                          <td className="px-4 py-3">{recharge.id}</td>
                          <td className="px-4 py-3">{recharge.date}</td>
                          <td className="px-4 py-3">{recharge.bankId}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                recharge.status === "Success"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {recharge.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">₹{recharge.amount}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-500">Showing 1 - 0 of 0</p>
                <div className="flex gap-2">
                  <Button size="sm" color="gray">Previous</Button>
                  <Button size="sm" color="gray">Next</Button>
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
        size="md"
      >
        <Modal.Header>Recharge Wallet</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mb-3">
                <HiCurrencyRupee className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-sm text-gray-600">
                Add money to your wallet for seamless order processing
              </p>
            </div>

            <div>
              <Label htmlFor="amount" value="Enter Recharge Amount" />
              <div className="relative mt-2">
                <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                <TextInput
                  id="amount"
                  type="number"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  placeholder="500"
                  className="pl-7"
                />
                <div className="flex gap-2 mt-2">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setRechargeAmount(amount.toString())}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      +₹{amount}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label value="Select Payment Type" />
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  onClick={() => setPaymentType("upi")}
                  className={`border-2 rounded-lg p-4 flex flex-col items-center gap-2 transition-all ${
                    paymentType === "upi"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center text-white">
                    <HiCurrencyRupee className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium">UPI / Netbanking / Others</p>
                </button>

                <button
                  onClick={() => setPaymentType("card")}
                  className={`border-2 rounded-lg p-4 flex flex-col items-center gap-2 transition-all ${
                    paymentType === "card"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                    <HiCreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Credit / Debit Card</p>
                    <p className="text-xs text-gray-500">*Upto 2% convenience fee will apply</p>
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
