import { FC, useCallback, useEffect, useState } from "react"
import { Card, Spinner, TextInput } from "flowbite-react"
import {
    HiArrowLeft,
    HiChevronLeft,
    HiChevronRight,
    HiShoppingCart,
    HiArchive,
    HiCheckCircle,
    HiClock,
    HiCurrencyRupee,
} from "react-icons/hi"
import { useNavigate, useParams } from "react-router-dom"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { useCustomerStore } from "../../store/customerStore"

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
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString()
}

type SummaryCardProps = {
    label: string
    value: string | number
    icon: FC<{ className?: string }>
    iconBg: string
    iconColor: string
    valueColor?: string
}

const SummaryCard: FC<SummaryCardProps> = ({
    label,
    value,
    icon: Icon,
    iconBg,
    iconColor,
    valueColor = "text-gray-900 dark:text-white",
}) => (
    <Card>
        <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
                <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                <p className={`mt-1 text-2xl font-bold ${valueColor}`}>{value}</p>
            </div>
        </div>
    </Card>
)

const CustomerDetailsPage: FC = () => {
    const { mobileNumber } = useParams<{ mobileNumber: string }>()
    const navigate = useNavigate()
    const {
        customerDetails,
        detailsLoading,
        detailsError,
        fetchCustomerDetails,
    } = useCustomerStore()
    const [currentPage, setCurrentPage] = useState(1)
    const [dateFrom, setDateFrom] = useState("")
    const [dateTo, setDateTo] = useState("")
    const limit = 10

    const loadDetails = useCallback(() => {
        if (mobileNumber) {
            fetchCustomerDetails(mobileNumber, currentPage, limit, dateFrom || undefined, dateTo || undefined)
        }
    }, [currentPage, dateFrom, dateTo, fetchCustomerDetails, mobileNumber])

    useEffect(() => {
        loadDetails()
    }, [loadDetails])

    useEffect(() => {
        setCurrentPage(1)
    }, [dateFrom, dateTo])

    const customer = customerDetails?.customer
    const summary = customerDetails?.summary
    const pagination = customerDetails?.pagination
    const totalPages = pagination?.totalPages || 1

    return (
        <NavbarSidebarLayout>
            <div className="px-4">
                <button
                    type="button"
                    onClick={() => navigate("/customers")}
                    className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400"
                >
                    <HiArrowLeft className="h-5 w-5" />
                    Back to Customers
                </button>

                <div className="mb-6">
                    <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                        {customer?.name || "Customer Details"}
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {customer?.mobileNumber || mobileNumber || "-"}
                        {customer?.address ? ` | ${customer.address}` : ""}
                    </p>
                </div>

                {detailsError && (
                    <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                        {detailsError}
                    </p>
                )}

                {detailsLoading && !customerDetails ? (
                    <div className="flex items-center justify-center py-12">
                        <Spinner size="xl" />
                    </div>
                ) : (
                    <>
                        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            <SummaryCard
                                label="Total Orders"
                                value={summary?.totalOrders ?? 0}
                                icon={HiShoppingCart}
                                iconBg="bg-blue-100 dark:bg-blue-900/30"
                                iconColor="text-blue-600 dark:text-blue-400"
                            />
                            <SummaryCard
                                label="Total Parcels"
                                value={summary?.totalParcels ?? 0}
                                icon={HiArchive}
                                iconBg="bg-purple-100 dark:bg-purple-900/30"
                                iconColor="text-purple-600 dark:text-purple-400"
                            />
                            <SummaryCard
                                label="Delivered Orders"
                                value={summary?.deliveredOrders ?? 0}
                                icon={HiCheckCircle}
                                iconBg="bg-green-100 dark:bg-green-900/30"
                                iconColor="text-green-600 dark:text-green-400"
                                valueColor="text-green-600"
                            />
                            <SummaryCard
                                label="Pending Orders"
                                value={summary?.pendingOrders ?? 0}
                                icon={HiClock}
                                iconBg="bg-yellow-100 dark:bg-yellow-900/30"
                                iconColor="text-yellow-500 dark:text-yellow-400"
                                valueColor="text-orange-600"
                            />

                            <SummaryCard
                                label="Total Amount"
                                value={formatAmount(summary?.totalAmount)}
                                icon={HiCurrencyRupee}
                               iconBg="bg-gray-200 dark:bg-gray-700"
                                iconColor="text-emerald-600 dark:text-emerald-400"
                            />
                        </div>

                        <Card>
                            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Orders</h2>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        From
                                        <TextInput type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        To
                                        <TextInput type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
                                    </label>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-800 text-xs uppercase text-white">
                                        <tr>
                                            <th className="whitespace-nowrap px-4 py-3">S.No</th>
                                            <th className="whitespace-nowrap px-4 py-3">Order Number</th>
                                            <th className="whitespace-nowrap px-4 py-3">Created At</th>
                                            <th className="whitespace-nowrap px-4 py-3">Delivery Agency</th>
                                            <th className="px-4 py-3">Article</th>
                                            <th className="whitespace-nowrap px-4 py-3">Payment Type</th>
                                            <th className="whitespace-nowrap px-4 py-3">Total Amount</th>
                                            <th className="whitespace-nowrap px-4 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {customerDetails?.orders.length ? customerDetails.orders.map((order, index) => (
                                            <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{(currentPage - 1) * limit + index + 1}</td>
                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{order.orderNumber || "-"}</td>
                                                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{formatDate(order.createdAt)}</td>
                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{order.deliveryAgencyName || "-"}</td>
                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{order.article || "-"}</td>
                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{order.paymentType || "-"}</td>
                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatAmount(order.totalAmount)}</td>
                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{order.status || "-"}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No orders found</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {totalPages > 1 && (
                                <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                                    <p className="text-sm text-gray-700 dark:text-gray-400">Page {currentPage} of {totalPages}{pagination?.total !== undefined && <span> ({pagination.total} total orders)</span>}</p>
                                    <div className="flex items-center gap-2">
                                        <button type="button" aria-label="Previous page" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage <= 1} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"><HiChevronLeft className="h-5 w-5" /></button>
                                        <button type="button" aria-label="Next page" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage >= totalPages} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"><HiChevronRight className="h-5 w-5" /></button>
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

export default CustomerDetailsPage