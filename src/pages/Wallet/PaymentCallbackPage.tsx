import { FC, useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { Card, Button, Spinner } from "flowbite-react"
import { HiCheckCircle, HiXCircle } from "react-icons/hi"
import { useWalletStore } from "../../store/walletStore"
import toast from "react-hot-toast"

const PaymentCallbackPage: FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [verifying, setVerifying] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<"success" | "failed" | null>(null)
  const { verifyPayment, fetchBalance } = useWalletStore()

  useEffect(() => {
    const orderId = searchParams.get("order_id")
    const paymentId = searchParams.get("payment_id") || searchParams.get("cf_payment_id")
    const txStatus = searchParams.get("txStatus") || searchParams.get("payment_status")

    console.log('💳 Payment callback received:', { orderId, paymentId, txStatus, allParams: Object.fromEntries(searchParams.entries()) })

    if (!orderId) {
      console.error('❌ No order_id in URL')
      toast.error("Invalid payment response")
      setVerifying(false)
      setPaymentStatus("failed")
      return
    }

    // Check if Cashfree indicated failure in the callback
    if (txStatus && (txStatus.toLowerCase() === 'failed' || txStatus.toLowerCase() === 'cancelled')) {
      console.log('⚠️ Payment status from callback:', txStatus)
      toast.error(`Payment ${txStatus.toLowerCase()}`)
      setVerifying(false)
      setPaymentStatus("failed")
      return
    }

    const verifyPaymentStatus = async () => {
      try {
        console.log('🔍 Starting payment verification for:', orderId, paymentId)
        
        // Call verify payment with paymentId
        await verifyPayment(orderId, paymentId || undefined)
        
        // Refresh balance
        await fetchBalance()
        
        console.log('✅ Payment verified successfully')
        setPaymentStatus("success")
        
      } catch (error: any) {
        console.error('❌ Payment verification error:', error)
        setPaymentStatus("failed")
        
        // Show specific error message if available
        const errorMessage = error.response?.data?.message || error.message || "Payment verification failed"
        toast.error(errorMessage)
      } finally {
        setVerifying(false)
      }
    }

    verifyPaymentStatus()
  }, [searchParams, verifyPayment, fetchBalance])

  const handleGoToWallet = () => {
    navigate("/wallet")
  }

  const handleTryAgain = () => {
    navigate("/wallet/add")
  }

  if (verifying) {
    return (
      <NavbarSidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md w-full">
            <div className="text-center py-8">
              <Spinner size="xl" className="mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Verifying Payment
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we verify your payment...
              </p>
            </div>
          </Card>
        </div>
      </NavbarSidebarLayout>
    )
  }

  return (
    <NavbarSidebarLayout>
      <div className="flex items-center justify-center min-h-screen px-4">
        <Card className="max-w-md w-full">
          <div className="text-center py-8">
            {paymentStatus === "success" ? (
              <>
                <div className="flex justify-center mb-4">
                  <HiCheckCircle className="w-20 h-20 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Payment Successful!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your wallet has been recharged successfully.
                </p>
                <div className="space-y-3">
                  <Button
                    color="success"
                    size="lg"
                    className="w-full"
                    onClick={handleGoToWallet}
                  >
                    Go to Wallet
                  </Button>
                  <Button
                    color="gray"
                    size="lg"
                    className="w-full"
                    onClick={() => navigate("/dashboard")}
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-center mb-4">
                  <HiXCircle className="w-20 h-20 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Payment Failed
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your payment could not be processed. Please try again.
                </p>
                <div className="space-y-3">
                  <Button
                    color="failure"
                    size="lg"
                    className="w-full"
                    onClick={handleTryAgain}
                  >
                    Try Again
                  </Button>
                  <Button
                    color="gray"
                    size="lg"
                    className="w-full"
                    onClick={handleGoToWallet}
                  >
                    Go to Wallet
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </NavbarSidebarLayout>
  )
}

export default PaymentCallbackPage
