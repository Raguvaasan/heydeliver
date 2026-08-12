import { useEffect, useMemo, useState } from "react"
import { Badge, Card, Label, Select, TextInput } from "flowbite-react"
import { HiSearch } from "react-icons/hi"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import http from "../../common/httpRequest"

const PAGE_SIZE = 10

type Direction = "inward" | "outward"

interface AgencyParcelOrdersPageProps {
  direction: Direction
}

const statusColor: Record<string, string> = {
  "Order Created": "warning",
  "Parcel Collected": "warning",
  "Hub Assigned": "indigo",
  "Parcel Dispatched": "info",
  "Parcel Arrived at Hub": "info",
  "Parcel Processed at Hub": "info",
  "Parcel Dispatched from Hub": "info",
  "Parcel Arrived at Agency": "purple",
  "Parcel Received at Agency": "purple",
  Delivered: "success",
  Cancelled: "failure",
}

const AgencyParcelOrdersPage = ({ direction }: AgencyParcelOrdersPageProps) => {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [paymentType, setPaymentType] = useState("")
  const [hubAssignment, setHubAssignment] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 })
  const [usesServerPagination, setUsesServerPagination] = useState(false)

  const endpoint = `/admin/agency/parcel-order/${direction}`

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await http.get(endpoint, {
        params: {
          page,
          limit: PAGE_SIZE,
          search: search.trim() || undefined,
          status: status || undefined,
          paymentType: paymentType || undefined,
          hubAssignment: hubAssignment || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        },
      })

      const payload = response.data
      const list = Array.isArray(payload?.data?.orders)
        ? payload.data.orders
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.orders)
            ? payload.orders
            : Array.isArray(payload)
              ? payload
              : []

      setOrders(list)
      const meta = payload?.data?.pagination || payload?.pagination
      if (meta) {
        setUsesServerPagination(true)
        setPagination({
          page: Number(meta.page || page),
          limit: Number(meta.limit || PAGE_SIZE),
          total: Number(meta.total || list.length),
          totalPages: Number(meta.totalPages || Math.max(1, Math.ceil(Number(meta.total || list.length) / Number(meta.limit || PAGE_SIZE)))),
        })
      } else {
        setUsesServerPagination(false)
        setPagination({
          page,
          limit: PAGE_SIZE,
          total: list.length,
          totalPages: Math.max(1, Math.ceil(list.length / PAGE_SIZE)),
        })
      }
    } catch (err: any) {
      setOrders([])
      setError(err?.response?.data?.message || err?.message || "Failed to fetch orders")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction, page, search, status, paymentType, hubAssignment, dateFrom, dateTo])

  const normalizedOrders = useMemo(() => {
    return orders.map((item: any) => ({
      id: item._id || item.id || "",
      orderNumber: item.orderNumber || item.lrNumber || item.awbNumber || item.bookingNumber || "-",
      bookingDate: item.bookingDate || item.createdAt || item.date || "",
      customerName: item.bookingCustomer?.name || item.customerName || item.senderName || item.receiverName || "-",
      customerPhone: item.bookingCustomer?.mobileNumber || item.customerPhone || item.phoneNumber || "-",
      // "From" is always the agency that owns/booked the order
      fromPlace: item.agency?.agencyName || item.branch?.agencyName || item.fromPlace || item.origin || "-",
      // "To" is the delivery agency/branch the parcel is headed to
      toPlace:
        item.deliveryCustomer?.deliveryBranch?.agencyName ||
        item.deliveryCustomer?.deliveryAgency?.agencyName ||
        item.deliveryBranch?.agencyName ||
        item.deliveryAgency?.agencyName ||
        item.toPlace ||
        item.destination ||
        "-",
      status: item.status || "-",
      paymentType: item.paymentType || "-",
      hubAssignment: item.hubAssignment || item.hub?.hubName || item.hub?.name || item.assignedHub?.hubName || (item.hub ? "Assigned" : "Unassigned"),
      totalAmount: item.totalAmount || item.transportationCharge || item.amount || item.codAmount || "-",
    }))
  }, [orders])

  const filteredOrders = useMemo(() => {
    return normalizedOrders.filter((order) => {
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerPhone.toLowerCase().includes(q) ||
        order.fromPlace.toLowerCase().includes(q) ||
        order.toPlace.toLowerCase().includes(q)

      const matchesStatus = !status || order.status === status
      const matchesPayment = !paymentType || order.paymentType === paymentType
      const matchesHub = !hubAssignment || order.hubAssignment === hubAssignment

      return matchesSearch && matchesStatus && matchesPayment && matchesHub
    })
  }, [normalizedOrders, search, status, paymentType, hubAssignment])

  const totalPages = pagination.totalPages || Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE))
  const paginatedOrders = useMemo(() => {
    if (usesServerPagination) return filteredOrders
    const start = (page - 1) * PAGE_SIZE
    return filteredOrders.slice(start, start + PAGE_SIZE)
  }, [filteredOrders, page, usesServerPagination])

  const formatDate = (value?: string) => {
    if (!value) return "-"
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value
    return parsed.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  return (
    <NavbarSidebarLayout>
      <div className="px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {direction === "inward" ? "Inward Orders" : "Outward Orders"}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            View and filter agency parcel orders
          </p>
        </div>

        <Card>
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="mb-6 flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-4">
              <div className="relative xl:col-span-2">
                <Label htmlFor="order-search" className="mb-1 block text-xs">
                  Search
                </Label>
                <div className="pointer-events-none absolute inset-y-0 left-0 top-6 flex items-center pl-3">
                  <HiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <TextInput
                  id="order-search"
                  type="search"
                  placeholder="Search order, customer, phone, location..."
                  value={search}
                  onChange={(e) => {
                    setPage(1)
                    setSearch(e.target.value)
                  }}
                  className="pl-10"
                />
              </div>

              <div>
                <Label htmlFor="date-from" className="mb-1 block text-xs">
                  From Date
                </Label>
                <TextInput
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setPage(1)
                    setDateFrom(e.target.value)
                  }}
                />
              </div>
              <div>
                <Label htmlFor="date-to" className="mb-1 block text-xs">
                  To Date
                </Label>
                <TextInput
                  id="date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setPage(1)
                    setDateTo(e.target.value)
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <Label htmlFor="payment-type" className="mb-1 block text-xs">
                  Payment Type
                </Label>
                <Select
                  id="payment-type"
                  value={paymentType}
                  onChange={(e) => {
                    setPage(1)
                    setPaymentType(e.target.value)
                  }}
                >
                  <option value="">All Payment Types</option>
                  <option value="Paid">Paid</option>
                  <option value="To Pay">To Pay</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="hub-assignment" className="mb-1 block text-xs">
                  Hub Assignment
                </Label>
                <Select
                  id="hub-assignment"
                  value={hubAssignment}
                  onChange={(e) => {
                    setPage(1)
                    setHubAssignment(e.target.value)
                  }}
                >
                  <option value="">All Hub Assignments</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Unassigned">Unassigned</option>
                </Select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-800 text-xs uppercase text-white">
                <tr>
                  <th className="px-4 py-3">Order No</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">From</th>
                  <th className="px-4 py-3">To</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Hub</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                      Loading orders...
                    </td>
                  </tr>
                ) : paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{order.orderNumber}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatDate(order.bookingDate)}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{order.customerName}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{order.customerPhone}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{order.fromPlace}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{order.toPlace}</td>
                      <td className="px-4 py-3">
                        <Badge color={order.paymentType === "Paid" ? "success" : "warning"}>{order.paymentType}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{order.hubAssignment}</td>
                      <td className="px-4 py-3">
                        <Badge color={statusColor[order.status] || "gray"}>{order.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{order.totalAmount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col gap-2 border-t border-gray-200 pt-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300 md:flex-row md:items-center md:justify-between">
            <div>
              Showing {paginatedOrders.length} of {filteredOrders.length} orders
            </div>
            <div className="flex items-center gap-2">
              <button
                className="rounded-lg border border-gray-300 px-3 py-1.5 disabled:opacity-50 dark:border-gray-600"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span>
                Page {pagination.page || page} of {totalPages}
              </span>
              <button
                className="rounded-lg border border-gray-300 px-3 py-1.5 disabled:opacity-50 dark:border-gray-600"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Total orders: {pagination.total}
          </div>
        </Card>
      </div>
    </NavbarSidebarLayout>
  )
}

export default AgencyParcelOrdersPage