import { FC, useCallback, useEffect, useState } from "react"
import { Card, Spinner } from "flowbite-react"
import {
    HiArrowLeft,
    HiChevronLeft,
    HiChevronRight,
    HiCheckCircle,
    HiClock,
    HiCurrencyRupee,
    HiShoppingCart,
} from "react-icons/hi"
import { useNavigate, useParams } from "react-router-dom"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import http from "../../common/httpRequest"

type B2BOrder = {
    id: string
    lrNumber?: string
    orderNumber?: string
    bookingId?: string
    createdAt?: string
    totalAmount?: number
    approximateWeight?: number
    status?: string
}

type B2BCustomerDetails = {
    customer?: {
        name?: string
        mobileNumber?: string
        address?: string
        state?: string
        pincode?: string
        gstNumber?: string
        status?: string
    }
    summary?: {
        totalOrders?: number
        deliveredOrders?: number
        pendingOrders?: number
        totalAmount?: number
    }
    orders: B2BOrder[]
    pagination?: {
        total?: number
        page?: number
        limit?: number
        totalPages?: number
    }
}

const formatAmount = (amount?: number): string => {
    if (amount === undefined || amount === null) return "-"
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(amount)
}

const formatDate = (value?: string): string => {
    if (!value) return "-"
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-IN")
}

type SummaryCardProps = {
    label: string
    value: string | number
    icon: FC<{ className?: string }>
    iconBg: string
    iconColor: string
}

const SummaryCard: FC<SummaryCardProps> = ({ label, value, icon: Icon, iconBg, iconColor }) => (
    <Card>
        <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
                <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    </Card>
)

const B2BCustomerDetailsPage: FC = () => {
    const { customerId } = useParams<{ customerId: string }>()
    const navigate = useNavigate()
    const [details, setDetails] = useState<B2BCustomerDetails | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const limit = 10

    const loadDetails = useCallback(async () => {
        if (!customerId) return
        setLoading(true)
        setError(null)
        try {
            const response = await http.get(`/admin/b2b/users/${encodeURIComponent(customerId)}`, {
                params: { page: currentPage, limit },
            })
            const data = response.data?.data || response.data
            const orders = Array.isArray(data?.orders) ? data.orders : []
            setDetails({
                ...data,
                orders: orders.map((order: any) => ({
                    ...order,
                    id: order?._id || order?.id || order?.orderNumber || "",
                    lrNumber: order?.lrNumber || order?.orderNumber || order?.bookingId || order?._id,
                    approximateWeight: order?.shipment?.approximateWeight,
                })),
            })
        } catch (requestError: any) {
            setError(requestError?.response?.data?.message || requestError?.message || "Failed to fetch B2B customer details")
        } finally {
            setLoading(false)
        }
    }, [currentPage, customerId])

    useEffect(() => {
        loadDetails()
    }, [loadDetails])

    const customer = details?.customer
    const summary = details?.summary
    const totalPages = details?.pagination?.totalPages || 1

    return (
        <NavbarSidebarLayout>
            <div className="px-4">
                <button
                    type="button"
                    onClick={() => navigate("/b2b-customers")}
                    className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400"
                >
                    <HiArrowLeft className="h-5 w-5" />
                    Back to B2B Customers
                </button>

                <div className="mb-6">
                    <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">{customer?.name || "B2B Customer Details"}</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {customer?.mobileNumber || "-"}{customer?.address ? ` | ${customer.address}` : ""}
                    </p>
                </div>

                {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">{error}</p>}

                {loading && !details ? (
                    <div className="flex items-center justify-center py-12"><Spinner size="xl" /></div>
                ) : (
                    <>
                        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <SummaryCard label="Total Orders" value={summary?.totalOrders ?? 0} icon={HiShoppingCart} iconBg="bg-blue-100 dark:bg-blue-900/30" iconColor="text-blue-600 dark:text-blue-400" />
                            <SummaryCard label="Delivered Orders" value={summary?.deliveredOrders ?? 0} icon={HiCheckCircle} iconBg="bg-green-100 dark:bg-green-900/30" iconColor="text-green-600 dark:text-green-400" />
                            <SummaryCard label="Pending Orders" value={summary?.pendingOrders ?? 0} icon={HiClock} iconBg="bg-yellow-100 dark:bg-yellow-900/30" iconColor="text-yellow-500 dark:text-yellow-400" />
                            <SummaryCard label="Total Amount" value={formatAmount(summary?.totalAmount)} icon={HiCurrencyRupee} iconBg="bg-gray-200 dark:bg-gray-700" iconColor="text-emerald-600 dark:text-emerald-400" />
                        </div>

                        <Card>
                            <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">Orders</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-800 text-xs uppercase text-white">
                                        <tr>
                                            <th className="whitespace-nowrap px-4 py-3">S.No</th>
                                            <th className="whitespace-nowrap px-4 py-3">LR Number</th>
                                            <th className="whitespace-nowrap px-4 py-3">Created Date</th>
                                            <th className="whitespace-nowrap px-4 py-3">Total Amount</th>
                                            <th className="whitespace-nowrap px-4 py-3">Approx. Weight</th>
                                            <th className="whitespace-nowrap px-4 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {details?.orders.length ? details.orders.map((order, index) => (
                                            <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{(currentPage - 1) * limit + index + 1}</td>
                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{order.lrNo || "-"}</td>
                                                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{formatDate(order.createdAt)}</td>
                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatAmount(order.totalAmount)}</td>
                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{order.approximateWeight ?? "-"}</td>
                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{order.status || "-"}</td>
                                            </tr>
                                        )) : <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No orders found</td></tr>}
                                    </tbody>
                                </table>
                            </div>

                            {totalPages > 1 && (
                                <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                                    <p className="text-sm text-gray-700 dark:text-gray-400">Page {currentPage} of {totalPages}{details?.pagination?.total !== undefined && <span> ({details.pagination.total} total orders)</span>}</p>
                                    <div className="flex items-center gap-2">
                                        <button type="button" aria-label="Previous page" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage <= 1 || loading} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"><HiChevronLeft className="h-5 w-5" /></button>
                                        <button type="button" aria-label="Next page" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage >= totalPages || loading} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"><HiChevronRight className="h-5 w-5" /></button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </>
                )}
            </div>
        </NavbarSidebarLayout>
    )
}

export default B2BCustomerDetailsPage
