import { FC, useEffect, useState } from "react"
import { Card, Label, Select, TextInput } from "flowbite-react"
import { HiDocumentDownload, HiEye, HiOutlinePrinter, HiSearch, HiTruck } from "react-icons/hi"
import toast from "react-hot-toast"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { B2BOrder, useB2BOrderStore } from "../../store/b2bOrderStore"
import http from "../../common/httpRequest"
import { generateB2BInvoice } from "./b2bInvoice"
import { formatDate } from "./b2bOrderUtils"
import AssignmentModal from "./assignmentmodal"
import OrderDetailsModal from "./orderDetails"
import { handleB2BLabel } from "./b2bPrintLabel"


const PAGE_SIZE = 10
const B2B_ORDERS_BASE = "/admin/b2b/orders"
const DRAFT_STATUS = "DRAFT"
// Negation convention for the active tab: send everything except drafts.
// Adjust this if your backend expects a different syntax (e.g. status[ne]=DRAFT).
const NOT_DRAFT_STATUS = "!DRAFT"

type OrderTab = "active" | "pending"

const B2BOrdersPage: FC = () => {
    const { orders, loading, error, pagination, fetchOrders } = useB2BOrderStore()
    const [tab, setTab] = useState<OrderTab>("active")
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [selectedOrder, setSelectedOrder] = useState<B2BOrder | null>(null)
    const [assignmentOrder, setAssignmentOrder] = useState<B2BOrder | null>(null)
    const [rowActionLoading, setRowActionLoading] = useState<Record<string, boolean>>({})
    const [isGeneratingInvoice, setIsGeneratingInvoice] = useState<string | null>(null)
    const [ordersLocal, setOrdersLocal] = useState<B2BOrder[]>([])

    const getAuthToken = () => {
        const authToken = sessionStorage.getItem("authToken")
        if (!authToken) throw new Error("Authorization token missing")
        return authToken
    }

    // Pending tab: ?status=DRAFT. Active tab: ?status=!DRAFT (everything except drafts).
    // Both filters are applied server-side now, so pagination totals stay accurate.
    const buildFetchParams = (targetPage: number, targetTab: OrderTab) => ({
        page: targetPage,
        limit: PAGE_SIZE,
        search,
        startDate,
        endDate,
        status: targetTab === "pending" ? DRAFT_STATUS : NOT_DRAFT_STATUS,
    })

    useEffect(() => {
        fetchOrders(buildFetchParams(page, tab))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchOrders, page, search, startDate, endDate, tab])

    useEffect(() => {
        setOrdersLocal(orders)
    }, [orders])

    const handleTabChange = (nextTab: OrderTab) => {
        if (nextTab === tab) return
        setTab(nextTab)
        setPage(1)
    }

    // Add near your other constants, after DRAFT_STATUS
const STATUS_FLOW = ["DRAFT", "VEHICLE_ASSIGNED", "IN_TRANSIT", "DELIVERED", "CANCELED"]

// Replace the old `const statusOptions = ["IN_TRANSIT", "DELIVERED"]` line with this helper
const getNextStatusOptions = (currentStatus: string) => {
    const currentIndex = STATUS_FLOW.indexOf(currentStatus)
    // Unknown/legacy status value -> fall back to showing everything after DRAFT
    if (currentIndex === -1) return STATUS_FLOW.slice(1)
    return STATUS_FLOW.slice(currentIndex + 1)
}

    const handleStatusChange = async (orderId: string, status: string) => {
        const previous = orders.find((order) => order.id === orderId)?.status ?? ""
        setRowActionLoading((state) => ({ ...state, [orderId]: true }))
        setOrdersLocal((prev) => prev.map((order) => (order.id === orderId ? { ...order, status } : order)))

        try {
            await http.patch(`${B2B_ORDERS_BASE}/${orderId}/status`, { status })

            toast.success("Status updated")
            fetchOrders(buildFetchParams(page, tab))
        } catch (error) {
            setOrdersLocal((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: previous } : order)))
            const message = error instanceof Error ? error.message : "Failed to update status"
            toast.error(message)
        } finally {
            setRowActionLoading((state) => ({ ...state, [orderId]: false }))
        }
    }

    const handleGenerateInvoice = async (orderId: string) => {
        setIsGeneratingInvoice(orderId)
        try {
            const authToken = getAuthToken()
            await generateB2BInvoice(orderId, authToken)
            toast.success("Invoice generated")
        } catch (error: any) {
            toast.error(error?.message || "Failed to generate invoice")
        } finally {
            setIsGeneratingInvoice(null)
        }
    }

    const handleVehicleAssigned = (orderId: string, vehicleType: string, vehicle: { id: string; vehicleType: string }) => {
        setOrdersLocal((currentOrders) => currentOrders.map((order) => (
            order.id === orderId
                ? { ...order, vehicleType, selectedVehicle: vehicle }
                : order
        )))
    }

    const renderOrder = (order: B2BOrder, index: number) => (
        <tr key={order.id || order.orderNumber} className="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{(page - 1) * PAGE_SIZE + index + 1}</td>
            <td className="w-12 px-4 py-3 font-medium text-gray-900 dark:text-white">{order.lrNum}</td>
            <td className="w-22 px-4 py-3 text-gray-700 dark:text-gray-300">{formatDate(order.bookingDate)}</td>
            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{order.customerName}</td>
            <td className="w-28 px-4 py-3 text-gray-700 dark:text-gray-300">{order.approximateWeight}</td>
            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{order.vehicleType}</td>
            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{order.assignedVehicle}</td>
           <td className="px-4 py-3">
    <Select
        value={order.status || ""}
        disabled={rowActionLoading[order.id] || loading}
        onChange={(event) => handleStatusChange(order.id, event.target.value)}
    >
        <option value={order.status || ""} disabled hidden>
            {(order.status || "Select status").replace(/_/g, " ")}
        </option>
        {getNextStatusOptions(order.status).map((status) => (
            <option key={status} value={status}>
                {status.replace(/_/g, " ")}
            </option>
        ))}
    </Select>
</td>
            <td className="px-4 py-3">
                <button
                    className="p-1.5 text-gray-600 hover:text-orange-600 disabled:opacity-50 dark:text-gray-400 dark:hover:text-orange-400"
                    onClick={() => setAssignmentOrder(order)}
                    title="Assign driver and vehicle"
                    disabled={rowActionLoading[order.id] || loading}
                >
                    <HiTruck className="h-5 w-5" />
                </button>
                <button onClick={() => handleGenerateInvoice(order.id)} className="p-1.5 text-gray-600 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400" title="Generate Invoice" disabled={isGeneratingInvoice === order.id}>
                    <HiDocumentDownload className="h-5 w-5" />
                </button>
                <button
    onClick={() => handleB2BLabel(order.id)}
    className="p-1.5 dark:text-gray-300 text-gray-700 hover:text-gray-900"
    title="Print Label"
>
    <HiOutlinePrinter className="h-5 w-5" />
</button>
                <button className="p-1.5 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400" onClick={() => setSelectedOrder(order)} title="View order details"><HiEye className="h-5 w-5" /></button></td>
        </tr>
    )

    const totalPages = pagination?.totalPages || 1

    return (
        <NavbarSidebarLayout>
            <div className="px-4">
                <div className="mb-6">
                    <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">B2B Orders</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">View B2B orders</p>
                </div>
                <Card>
                    {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                    <div className="mb-4 flex gap-2 border-b border-gray-200 dark:border-gray-700">
                        <button
                            className={`border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
                                tab === "active"
                                    ? "border-orange-600 text-orange-600 dark:text-orange-400"
                                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            }`}
                            onClick={() => handleTabChange("active")}
                        >
                            Active Orders
                        </button>
                        <button
                            className={`border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
                                tab === "pending"
                                    ? "border-orange-600 text-orange-600 dark:text-orange-400"
                                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            }`}
                            onClick={() => handleTabChange("pending")}
                        >
                            Pending Orders
                        </button>
                    </div>
                    <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                        <div className="relative">
                            <Label htmlFor="b2b-order-search" className="mb-1 block text-xs">Search</Label>
                            <HiSearch className="pointer-events-none absolute left-3 top-9 h-5 w-5 text-gray-400" />
                            <TextInput id="b2b-order-search" type="search" placeholder="Search customer name" value={search} onChange={(event) => { setPage(1); setSearch(event.target.value) }} className="pl-10" />
                        </div>
                        <div>
                            <Label htmlFor="b2b-start-date" className="mb-1 block text-xs">From Date</Label>
                            <TextInput id="b2b-start-date" type="date" value={startDate} onChange={(event) => { setPage(1); setStartDate(event.target.value) }} />
                        </div>
                        <div>
                            <Label htmlFor="b2b-end-date" className="mb-1 block text-xs">To Date</Label>
                            <TextInput id="b2b-end-date" type="date" value={endDate} onChange={(event) => { setPage(1); setEndDate(event.target.value) }} />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-800 text-xs uppercase text-white">
                                <tr>
                                    <th className="px-4 py-3">S.No.</th>
                                    <th className="px-4 py-3">LR Num</th>
                                    <th className="px-4 py-3 w-24">Date</th>
                                    <th className="px-4 py-3">Booking Customer</th>
                                    <th className="px-4 py-3">Approx. Weight</th>
                                    <th className="px-4 py-3 w-10">Vehicle Type</th>
                                    <th className="px-4 py-3">Assigned Vehicle</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {loading ? <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500">Loading orders...</td></tr> : ordersLocal.length === 0 ? <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500">No B2B orders found</td></tr> : ordersLocal.map(renderOrder)}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 flex flex-col gap-2 border-t border-gray-200 pt-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300 md:flex-row md:items-center md:justify-between">
                        <span>Showing {orders.length} of {pagination?.total || orders.length} orders</span>
                        <div className="flex items-center gap-2">
                            <button className="rounded-lg border border-gray-300 px-3 py-1.5 disabled:opacity-50" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)}>Previous</button>
                            <span>Page {page} of {totalPages}</span>
                            <button className="rounded-lg border border-gray-300 px-3 py-1.5 disabled:opacity-50" disabled={page >= totalPages || loading} onClick={() => setPage((value) => value + 1)}>Next</button>
                        </div>
                    </div>
                </Card>
                {assignmentOrder && (
                    <AssignmentModal
                        order={assignmentOrder}
                        onClose={() => setAssignmentOrder(null)}
                        onAssigned={() => fetchOrders(buildFetchParams(page, tab))}
                        onVehicleAssigned={handleVehicleAssigned}
                    />
                )}
                {selectedOrder && (
                    <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
                )}
            </div>
        </NavbarSidebarLayout>
    )
}

export default B2BOrdersPage