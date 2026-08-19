import { FC, useEffect, useMemo, useState } from "react"
import { Button, Card, Label, Spinner, Table, TextInput, Select, Textarea } from "flowbite-react"
import { HiArrowLeft } from "react-icons/hi"
import { useNavigate, useParams } from "react-router-dom"
import NavbarSidebarLayout from "../../../layouts/navbar-sidebar"
import http from "../../../common/httpRequest"
import toast from "react-hot-toast"

type PayoutOrder = {
  serialNo?: number
  date?: string
  lrNo?: string
  bookingAmount?: number
  profit?: number
  orderId?: string
  profitPercentage?: number
  adminShare?: number
}

type PaymentItem = {
  serialNo?: number
  paymentId?: string
  date?: string
  amount?: number
  paymentMethod?: string
  reference?: string
  remarks?: string
  status?: string
  paidByName?: string
}

type PayoutResponse = {
  agency?: {
    agencyId?: string
    agencyName?: string
    agencyOwner?: string
    phone?: string
    email?: string
    city?: string
    state?: string
    status?: string
    type?: string
    agencyType?: boolean
    profitPercentage?: number
  }
  summary?: {
    totalBookingAmount?: number
    profit?: number
    paid?: number
    remainingToPay?: number
    settledOrders?: number
    payments?: number
    currency?: string
  }
  orders?: PayoutOrder[]
  pagination?: {
    total?: number
    page?: number
    limit?: number
    totalPages?: number
  }
}

type PaymentsResponse = {
  summary?: {
    profit?: number
    paid?: number
    remainingToPay?: number
  }
  payments?: PaymentItem[]
  pagination?: {
    total?: number
    page?: number
    limit?: number
    totalPages?: number
  }
}

const formatCurrency = (value: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(Number(value || 0))

const formatDate = (value?: string) => {
  if (!value) return "-"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString()
}

const paymentMethodLabel = (value?: string) => {
  switch (value) {
    case "bank_transfer":
      return "Bank Transfer"
    case "cash":
      return "Cash"
    case "upi":
      return "UPI"
    default:
      return value || "-"
  }
}

const BranchWalletDetailsPage: FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [paymentsLoading, setPaymentsLoading] = useState(false)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [details, setDetails] = useState<PayoutResponse | null>(null)
  const [payments, setPayments] = useState<PaymentsResponse | null>(null)
  const [paymentsPage, setPaymentsPage] = useState(1)
  const [payAmount, setPayAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer")
  const [reference, setReference] = useState("")
  const [remarks, setRemarks] = useState("")

  const agencyId = id

  const fetchDetails = async () => {
    if (!agencyId) return
    setLoading(true)
    setError(null)
    try {
      const response = await http.get(`/admin/agency-payout/${encodeURIComponent(agencyId)}`)
      setDetails(response.data?.data ?? response.data)
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Failed to fetch payout details"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const fetchPayments = async (page = 1) => {
    if (!agencyId) return
    setPaymentsLoading(true)
    try {
      const response = await http.get(`/admin/agency-payout/${encodeURIComponent(agencyId)}/payments`, {
        params: { page, limit: 20 },
      })
      setPayments(response.data?.data ?? response.data)
      setPaymentsPage(page)
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Failed to fetch payments"
      toast.error(message)
    } finally {
      setPaymentsLoading(false)
    }
  }

  useEffect(() => {
    fetchDetails()
    fetchPayments(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agencyId])

  const summary = details?.summary || payments?.summary || {}
  const agency = details?.agency
  const orders = details?.orders || []
  const paymentRows = payments?.payments || []
  const pagination = payments?.pagination || { totalPages: 1, page: 1, total: paymentRows.length, limit: 20 }

  const agencyTypeLabel = agency?.agencyType === false ? "Third Party" : "Own Agency"
  const currency = summary.currency || "INR"

  const handlePay = async () => {
    if (!agencyId) return
    const amount = Number(payAmount)
    if (!payAmount || Number.isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount")
      return
    }

    setPaying(true)
    try {
      await http.post(`/admin/agency-payout/${encodeURIComponent(agencyId)}/pay`, {
        amount,
        paymentMethod: paymentMethod.trim() || undefined,
        reference: reference.trim() || undefined,
        remarks: remarks.trim() || undefined,
      })
      toast.success("Payment recorded successfully")
      setPayAmount("")
      setPaymentMethod("bank_transfer")
      setReference("")
      setRemarks("")
      await Promise.all([fetchDetails(), fetchPayments(paymentsPage)])
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Failed to record payment"
      toast.error(message)
    } finally {
      setPaying(false)
    }
  }

  const totals = useMemo(() => {
    return {
      totalBookingAmount: Number(summary.totalBookingAmount || 0),
      profit: Number(summary.profit || 0),
      paid: Number(summary.paid || 0),
      remainingToPay: Number(summary.remainingToPay || 0),
    }
  }, [summary])

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <Button color="light" size="sm" onClick={() => navigate("/settings/branch-wallet")} className="mb-3">
              <HiArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agency Payout Details</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{agency?.agencyName || "Agency"}</p>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </Card>
        )}

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card><p className="text-sm text-gray-500 dark:text-gray-400">Total Booking Amount</p><p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totals.totalBookingAmount, currency)}</p></Card>
          <Card><p className="text-sm text-gray-500 dark:text-gray-400">Profit</p><p className="mt-2 text-2xl font-bold text-green-600">{formatCurrency(totals.profit, currency)}</p></Card>
          <Card><p className="text-sm text-gray-500 dark:text-gray-400">Paid</p><p className="mt-2 text-2xl font-bold text-blue-600">{formatCurrency(totals.paid, currency)}</p></Card>
          <Card><p className="text-sm text-gray-500 dark:text-gray-400">Remaining to Pay</p><p className="mt-2 text-2xl font-bold text-orange-600">{formatCurrency(totals.remainingToPay, currency)}</p></Card>
        </div>



        <Card className="mb-6">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Order History
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                All payout orders for this agency
              </p>
            </div>
            <div className="flex items-end gap-3">
              <div>
                <Label value="Pay Amount" />
                <TextInput
                  type="number"
                  min="0"
                  step="0.01"
                  className="mt-2"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>

              <Button
                color="warning"
                onClick={handlePay}
                disabled={paying || loading}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {paying ? "Saving..." : "Pay"}
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head className="bg-gray-800 text-white">
                <Table.HeadCell>S.No</Table.HeadCell>
                <Table.HeadCell>Date</Table.HeadCell>
                <Table.HeadCell>LR No</Table.HeadCell>
                <Table.HeadCell>Booking Amount</Table.HeadCell>
                <Table.HeadCell>Profit</Table.HeadCell>
                <Table.HeadCell>Admin Share</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {orders.length > 0 ? orders.map((order, index) => (
                  <Table.Row key={`${order.orderId || index}`}>
                    <Table.Cell>{order.serialNo || index + 1}</Table.Cell>
                    <Table.Cell>{formatDate(order.date)}</Table.Cell>
                    <Table.Cell>{order.lrNo || "-"}</Table.Cell>
                    <Table.Cell>{formatCurrency(Number(order.bookingAmount || 0), currency)}</Table.Cell>
                    <Table.Cell>{formatCurrency(Number(order.profit || 0), currency)}</Table.Cell>
                    <Table.Cell>{formatCurrency(Number(order.adminShare || 0), currency)}</Table.Cell>
                  </Table.Row>
                )) : (
                  <Table.Row>
                    <Table.Cell colSpan={6} className="py-8 text-center text-gray-500">
                      No orders found
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Summary</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Recorded payments for this agency</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head className="bg-gray-800 text-white">
                <Table.HeadCell>S.No</Table.HeadCell>
                <Table.HeadCell>Date</Table.HeadCell>
                <Table.HeadCell>Amount</Table.HeadCell>
                {/* <Table.HeadCell>Method</Table.HeadCell> */}
                {/* <Table.HeadCell>Reference</Table.HeadCell>
                <Table.HeadCell>Remarks</Table.HeadCell> */}
                <Table.HeadCell>Status</Table.HeadCell>
                {/* <Table.HeadCell>Paid By</Table.HeadCell> */}
              </Table.Head>
              <Table.Body className="divide-y">
                {paymentsLoading ? (
                  <Table.Row>
                    <Table.Cell colSpan={8} className="py-8 text-center"><Spinner size="md" /></Table.Cell>
                  </Table.Row>
                ) : paymentRows.length > 0 ? paymentRows.map((payment, index) => (
                  <Table.Row key={payment.paymentId || index}>
                    <Table.Cell>{payment.serialNo || index + 1}</Table.Cell>
                    <Table.Cell>{formatDate(payment.date)}</Table.Cell>
                    <Table.Cell>{formatCurrency(Number(payment.amount || 0), currency)}</Table.Cell>
                    {/* <Table.Cell>{paymentMethodLabel(payment.paymentMethod)}</Table.Cell>
                    <Table.Cell>{payment.reference || "-"}</Table.Cell>
                    <Table.Cell>{payment.remarks || "-"}</Table.Cell> */}
                    <Table.Cell>{payment.status || "-"}</Table.Cell>
                    {/* <Table.Cell>{payment.paidByName || "-"}</Table.Cell> */}
                  </Table.Row>
                )) : (
                  <Table.Row>
                    <Table.Cell colSpan={8} className="py-8 text-center text-gray-500">
                      No payments found
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>Total payments: {pagination?.total || paymentRows.length}</span>
            <div className="flex gap-2">
              <Button size="xs" color="light" disabled={(pagination?.page || 1) <= 1 || paymentsLoading} onClick={() => fetchPayments(Math.max(1, (pagination?.page || 1) - 1))}>
                Previous
              </Button>
              <Button size="xs" color="light" disabled={(pagination?.page || 1) >= (pagination?.totalPages || 1) || paymentsLoading} onClick={() => fetchPayments((pagination?.page || 1) + 1)}>
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </NavbarSidebarLayout>
  )
}

const Info: FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className="mt-2 font-semibold text-gray-900 dark:text-white">{value ?? "-"}</p>
  </div>
)

const SummaryStat: FC<{ label: string; value: string; tone: "green" | "blue" | "orange" }> = ({ label, value, tone }) => {
  const color = tone === "green" ? "text-green-600" : tone === "blue" ? "text-blue-600" : "text-orange-600"
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`mt-2 text-xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

export default BranchWalletDetailsPage
