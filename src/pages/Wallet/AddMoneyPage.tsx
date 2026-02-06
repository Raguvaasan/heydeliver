import { FC, useState, useEffect } from "react"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { Card, Button, Modal, Label, TextInput, Spinner } from "flowbite-react"
import { HiCurrencyRupee, HiCreditCard } from "react-icons/hi"
import toast from "react-hot-toast"
import { useWalletStore } from "../../store/walletStore"

// Declare Cashfree SDK on window object
declare global {
  interface Window {
    Cashfree: any
  }
}

const AddMoneyPage: FC = () => {
  const [rechargeAmount, setRechargeAmount] = useState("")
  const [paymentType, setPaymentType] = useState<"upi" | "card">("upi")
  const [cashfreeLoaded, setCashfreeLoaded] = useState(false)

  const { balance, loading, paymentLoading, fetchBalance, createPaymentOrder, verifyPayment } = useWalletStore()

  // Load Cashfree SDK
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js"
    script.async = true
    script.onload = () => {
      setCashfreeLoaded(true)
      console.log("Cashfree SDK loaded successfully")
    }
    script.onerror = () => {
      toast.error("Failed to load payment gateway")
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  // Fetch wallet balance on mount
  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  const handleRecharge = async () => {
    const amount = parseFloat(rechargeAmount)
    
    if (!rechargeAmount || amount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    if (!cashfreeLoaded) {
      toast.error("Payment gateway not loaded. Please refresh the page.")
      return
    }

    try {
      // Create payment order from backend
      const orderData = await createPaymentOrder(amount, paymentType)
      
      console.log("Order Data:", orderData)
      
      if (!orderData?.orderId || !orderData?.sessionId) {
        toast.error("Failed to create payment order")
        return
      }

      // Check if Cashfree is available
      if (!window.Cashfree) {
        toast.error("Payment gateway not initialized. Please refresh the page.")
        return
      }

      // Initialize Cashfree with environment
      const cashfree = window.Cashfree({
        mode: "production" // Match backend environment
      })

      // Define payment session
      const checkoutOptions = {
        paymentSessionId: orderData.sessionId,
        returnUrl: `${window.location.origin}/admin/wallet/payment-callback?order_id=${orderData.orderId}`,
      }

      console.log("Redirecting to Cashfree with options:", checkoutOptions)

      // Trigger payment
      cashfree.checkout(checkoutOptions).then((result: any) => {
        console.log("Cashfree result:", result)
        if (result.error) {
          console.error("Payment error:", result.error)
          toast.error(result.error.message || "Payment failed")
        }
        if (result.redirect) {
          console.log("Payment redirect successful")
        }
      })

    } catch (error: any) {
      console.error("Recharge error:", error)
      toast.error(error.message || "Failed to process payment")
    }
  }

  const quickAmounts = [1, 10, 50, 100, 500, 1000]

  return (
    <NavbarSidebarLayout>
      <div className="px-4 pt-6">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Add Money to Wallet
          </h1>
        </div>

        {/* Current Balance Card */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Current Balance
              </h2>
              {loading ? (
                <div className="mt-2">
                  <Spinner size="md" />
                </div>
              ) : (
                <p className="text-3xl font-bold text-orange-600 mt-1">
                  ₹ {balance.toFixed(2)}
                </p>
              )}
            </div>
            <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full">
              <HiCurrencyRupee className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </Card>

        {/* Recharge Form Card */}
        <Card>
          <div className="space-y-6">
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-lg mb-3">
                <HiCurrencyRupee className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Recharge Wallet
              </h3>
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

            <Button
              color="dark"
              onClick={handleRecharge}
              size="lg"
              className="w-full bg-gray-800 hover:bg-gray-900"
              disabled={paymentLoading || !cashfreeLoaded}
            >
              {paymentLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Processing...
                </>
              ) : !cashfreeLoaded ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Loading Payment Gateway...
                </>
              ) : (
                "Proceed To Payment"
              )}
            </Button>
          </div>
        </Card>
      </div>
    </NavbarSidebarLayout>
  )
}

export default AddMoneyPage
