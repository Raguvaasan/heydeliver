import { FC, useEffect, useMemo, useState } from "react"
import { Button, Card, Spinner, Table } from "flowbite-react"
import { HiChevronLeft, HiChevronRight } from "react-icons/hi"
import NavbarSidebarLayout from "../../../layouts/navbar-sidebar"
import http from "../../../common/httpRequest"
import toast from "react-hot-toast"

type PayoutOrder = {
  serialNo?: number
  date?: string
  lrNo?: string
  bookingAmount?: number
  profit?: number
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

type AgencyPayoutResponse = {
  agency?: {
    agencyId?: string
    agencyName?: string
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

type AgencyPaymentsResponse = {
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

const PayoutPage: FC = () => {
  const [loading, setLoading] = useState(false)
  const [paymentsLoading, setPaymentsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [details, setDetails] = useState<AgencyPayoutResponse | null>(null)
  const [payments, setPayments] = useState<AgencyPaymentsResponse | null>(null)

  const fetchDetails = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await http.get("/admin/agency/payout")
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
    setPaymentsLoading(true)
    try {
      const response = await http.get("/admin/agency/payout/payments", {
        params: { page, limit: 10 },
      })
      setPayments(response.data?.data ?? response.data)
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
  }, [])

  const summary = details?.summary || payments?.summary || {}
  const agency = details?.agency
  const orders = details?.orders || []
  const paymentRows = payments?.payments || []
  const pagination = payments?.pagination || { totalPages: 1, page: 1, total: paymentRows.length, limit: 10 }
  const currency = summary.currency || "INR"

  const totals = useMemo(
    () => ({
      totalBookingAmount: Number(summary.totalBookingAmount || 0),
      profit: Number(summary.profit || 0),
      paid: Number(summary.paid || 0),
      remainingToPay: Number(summary.remainingToPay || 0),
    }),
    [summary],
  )

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payout</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{agency?.agencyName || "Agency payout overview"}</p>
        </div>

        {error && (
          <Card className="mb-6 border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </Card>
        )}

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Booking Amount</p>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totals.totalBookingAmount, currency)}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500 dark:text-gray-400">Profit</p>
            <p className="mt-2 text-2xl font-bold text-green-600">{formatCurrency(totals.profit, currency)}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500 dark:text-gray-400">Paid</p>
            <p className="mt-2 text-2xl font-bold text-blue-600">{formatCurrency(totals.paid, currency)}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500 dark:text-gray-400">Remaining to Pay</p>
            <p className="mt-2 text-2xl font-bold text-orange-600">{formatCurrency(totals.remainingToPay, currency)}</p>
          </Card>
        </div>

        <Card className="mb-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Payout Orders</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">All payout orders for this agency</p>
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
                {loading ? (
                  <Table.Row>
                    <Table.Cell colSpan={5} className="py-8 text-center">
                      <Spinner size="md" />
                    </Table.Cell>
                  </Table.Row>
                ) : orders.length > 0 ? (
                  orders.map((order, index) => (
                    <Table.Row key={`${order.serialNo || index}-${order.lrNo || ""}`}>
                      <Table.Cell>{order.serialNo || index + 1}</Table.Cell>
                      <Table.Cell>{formatDate(order.date)}</Table.Cell>
                      <Table.Cell>{order.lrNo || "-"}</Table.Cell>
                      <Table.Cell>{formatCurrency(Number(order.bookingAmount || 0), currency)}</Table.Cell>
                      <Table.Cell>{formatCurrency(Number(order.profit || 0), currency)}</Table.Cell>
                       <Table.Cell>{formatCurrency(Number(order.adminShare || 0), currency)}</Table.Cell>
                    </Table.Row>
                  ))
                ) : (
                  <Table.Row>
                    <Table.Cell colSpan={5} className="py-8 text-center text-gray-500">
                      No orders found
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
        </Card>

        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment History</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Recorded payments for this agency</p>
          </div>
          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head className="bg-gray-800 text-white">
                <Table.HeadCell>S.No</Table.HeadCell>
                <Table.HeadCell>Date</Table.HeadCell>
                <Table.HeadCell>Amount</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                {/* <Table.HeadCell>Paid By</Table.HeadCell> */}
              </Table.Head>
              <Table.Body className="divide-y">
                {paymentsLoading ? (
                  <Table.Row>
                    <Table.Cell colSpan={5} className="py-8 text-center">
                      <Spinner size="md" />
                    </Table.Cell>
                  </Table.Row>
                ) : paymentRows.length > 0 ? (
                  paymentRows.map((payment, index) => (
                    <Table.Row key={payment.paymentId || index}>
                      <Table.Cell>{payment.serialNo || index + 1}</Table.Cell>
                      <Table.Cell>{formatDate(payment.date)}</Table.Cell>
                      <Table.Cell>{formatCurrency(Number(payment.amount || 0), currency)}</Table.Cell>
                      <Table.Cell>{payment.status || "-"}</Table.Cell>
                      {/* <Table.Cell>{payment.paidByName || "-"}</Table.Cell> */}
                    </Table.Row>
                  ))
                ) : (
                  <Table.Row>
                    <Table.Cell colSpan={5} className="py-8 text-center text-gray-500">
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
              <Button
                size="xs"
                color="light"
                disabled={(pagination?.page || 1) <= 1 || paymentsLoading}
                onClick={() => fetchPayments(Math.max(1, (pagination?.page || 1) - 1))}
              >
                <HiChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <Button
                size="xs"
                color="light"
                disabled={(pagination?.page || 1) >= (pagination?.totalPages || 1) || paymentsLoading}
                onClick={() => fetchPayments((pagination?.page || 1) + 1)}
              >
                Next
                <HiChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </NavbarSidebarLayout>
  )
}

export default PayoutPage
