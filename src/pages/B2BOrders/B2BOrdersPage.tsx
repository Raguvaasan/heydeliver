import { FC, useEffect, useState } from "react"
import { Badge, Card, Label, Select, TextInput } from "flowbite-react"
import { HiDocumentDownload, HiEye, HiSearch, HiX } from "react-icons/hi"
import toast from "react-hot-toast"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { B2BOrder, useB2BOrderStore } from "../../store/b2bOrderStore"
import http from "../../common/httpRequest"
import { generateB2BInvoice } from "./b2bInvoice"

const PAGE_SIZE = 10
const B2B_ORDERS_BASE = "/admin/b2b/orders"

interface DriverOption {
    id: string
    driverName: string
}

const getStatusColor = (status?: string) => {
    switch (status) {
        case "CONFIRMED":
            return "success"
        case "IN_TRANSIT":
            return "info"
        case "DELIVERED":
            return "success"
        default:
            return "warning"
    }
}

const formatStatus = (status?: string) => (status ? status.replace(/_/g, " ") : "N/A")

const SectionTitle: FC<{ title: string }> = ({ title }) => (
    <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-orange-600 dark:text-orange-400">{title}</h4>
)

const Field: FC<{ label: string; value?: unknown; wide?: boolean }> = ({ label, value, wide = false }) => {
    const displayValue = value === undefined || value === null || value === "" ? "N/A" : String(value)
    return (
        <div className={`rounded-lg bg-white px-3 py-2.5 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700 ${wide ? "sm:col-span-2" : ""}`}>
            <div className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">{label}</div>
            <div className="mt-1 break-words text-sm font-semibold text-gray-900 dark:text-white">{displayValue}</div>
        </div>
    )
}

const B2BOrdersPage: FC = () => {
    const { orders, loading, error, pagination, fetchOrders } = useB2BOrderStore()
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [selectedOrder, setSelectedOrder] = useState<B2BOrder | null>(null)
    const [drivers, setDrivers] = useState<DriverOption[]>([])
    const [driversLoading, setDriversLoading] = useState(false)
    const [rowActionLoading, setRowActionLoading] = useState<Record<string, boolean>>({})
    const [isGeneratingInvoice, setIsGeneratingInvoice] = useState<string | null>(null)
    const [ordersLocal, setOrdersLocal] = useState<B2BOrder[]>([])

     const getAuthToken = () => {
        const authToken = sessionStorage.getItem("authToken")
        if (!authToken) throw new Error("Authorization token missing")
        return authToken
    }
    
    useEffect(() => {
        fetchOrders({ page, limit: PAGE_SIZE, search, startDate, endDate })
    }, [fetchOrders, page, search, startDate, endDate])

    useEffect(() => {
        const fetchDrivers = async () => {
            setDriversLoading(true)
            try {
                const response = await http.get(`${B2B_ORDERS_BASE}/drivers`)
                const payload = response.data
                const items = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []
                const mapped: DriverOption[] = items
                    .map((item: any) => ({
                        id: String(item?._id || item?.id || "").trim(),
                        driverName: item?.driverName || item?.name || "Unnamed driver",
                    }))
                    .filter((item: DriverOption) => item.id)

                // dedupe by id in case the API returns duplicates
                const uniqueDrivers = Array.from(new Map(mapped.map((driver) => [driver.id, driver])).values())
                setDrivers(uniqueDrivers)
            } catch (error) {
                const message = error instanceof Error ? error.message : "Failed to fetch drivers"
                toast.error(message)
            } finally {
                setDriversLoading(false)
            }
        }

        fetchDrivers()
    }, [])

    const formatDate = (value: string) => {
        if (!value) return "-"
        const date = new Date(value)
        return Number.isNaN(date.getTime())
            ? value
            : date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })
    }

    const statusOptions = ["IN_TRANSIT", "DELIVERED"]

    const handleAssignDriver = async (orderId: string, driverId: string) => {
        const previousOrder = ordersLocal.find((order) => order.id === orderId) as any
        const previous = previousOrder?.driverId ?? ""
        setRowActionLoading((state) => ({ ...state, [orderId]: true }))
        setOrdersLocal((prev) => prev.map((order) => (order.id === orderId ? { ...order, driverId } : order)))

        try {
            const response = await http.patch(`${B2B_ORDERS_BASE}/${orderId}/assign-driver`, { driver: driverId })
            const assignedOrder = response.data?.data
            const assignedDriverId = assignedOrder?.driverId || driverId
            setOrdersLocal((prev) => prev.map((order) => (order.id === orderId ? {
                ...order,
                driverId: assignedDriverId,
                driver: assignedOrder?.driver || (order as any).driver,
            } : order)))
            toast.success("Driver assigned")
        } catch (error) {
            setOrdersLocal((prev) => prev.map((order) => (order.id === orderId ? { ...order, driverId: previous } : order)))
            const message = error instanceof Error ? error.message : "Failed to assign driver"
            toast.error(message)
        } finally {
            setRowActionLoading((state) => ({ ...state, [orderId]: false }))
        }
    }

    const handleStatusChange = async (orderId: string, status: string) => {
        const previous = orders.find((order) => order.id === orderId)?.status ?? ""
        setRowActionLoading((state) => ({ ...state, [orderId]: true }))
        setOrdersLocal((prev) => prev.map((order) => (order.id === orderId ? { ...order, status } : order)))

        try {
            await http.patch(`${B2B_ORDERS_BASE}/${orderId}/status`, { status })

            toast.success("Status updated")
            fetchOrders({ page, limit: PAGE_SIZE, search, startDate, endDate })
        } catch (error) {
            setOrdersLocal((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: previous } : order)))
            const message = error instanceof Error ? error.message : "Failed to update status"
            toast.error(message)
        } finally {
            setRowActionLoading((state) => ({ ...state, [orderId]: false }))
        }
    }

    useEffect(() => {
        setOrdersLocal(orders)
    }, [orders])

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

    const renderOrder = (order: B2BOrder, index: number) => (
        <tr key={order.id || order.orderNumber} className="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{(page - 1) * PAGE_SIZE + index + 1}</td>
            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatDate(order.bookingDate)}</td>
            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{order.customerName}</td>
            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{order.approximateWeight}</td>
            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{order.vehicleType}</td>
            <td className="px-4 py-3">
                <Select
                    value={order.status || ""}
                    disabled={rowActionLoading[order.id] || loading}
                    onChange={(event) => handleStatusChange(order.id, event.target.value)}
                >
                    {order.status && !statusOptions.includes(order.status) && <option value={order.status}>{order.status}</option>}
                    <option value="IN_TRANSIT">IN TRANSIT</option>
                    <option value="DELIVERED">DELIVERED</option>
                </Select>
            </td>
            <td className="px-4 py-3">
                {(() => {
                    const selectedDriverId = String((order as any).driverId || "").trim()
                    const selectedDriver = (order as any).driver
                    const hasSelectedDriverOption = drivers.some(
                        (driver) => driver.id.trim().toLowerCase() === selectedDriverId.toLowerCase()
                    )
                    return (
                        <Select
                            value={selectedDriverId}
                            disabled={driversLoading || rowActionLoading[order.id] || loading}
                            onChange={(event) => handleAssignDriver(order.id, event.target.value)}
                        >
                            <option value="">{driversLoading ? "Loading drivers..." : "Select driver"}</option>
                            {selectedDriverId && !hasSelectedDriverOption && (
                                <option value={selectedDriverId}>
                                    {selectedDriver?.driverName || "Selected driver"}
                                </option>
                            )}
                            {drivers.map((driver) => (
                                <option key={driver.id} value={driver.id}>
                                    {driver.driverName}
                                </option>
                            ))}
                        </Select>
                    )
                })()}
            </td>
            <td className="px-4 py-3">
                <button onClick={() => handleGenerateInvoice(order.id)} className="p-1.5 text-gray-600 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400" title="Generate Invoice" disabled={isGeneratingInvoice === order.id}>
                    <HiDocumentDownload className="h-5 w-5" />
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
                            <thead className="bg-gray-800 text-xs uppercase text-white"><tr>
                                <th className="px-4 py-3">S.No.</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Booking Customer</th><th className="px-4 py-3">Approx. Weight</th><th className="px-4 py-3">Vehicle Type</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Assign Driver</th><th className="px-4 py-3">Action</th>
                            </tr></thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {loading ? <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Loading orders...</td></tr> : ordersLocal.length === 0 ? <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No B2B orders found</td></tr> : ordersLocal.map(renderOrder)}
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
                {selectedOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
                        <div className="flex h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900" onClick={(event) => event.stopPropagation()}>
                            <div className="flex shrink-0 items-start justify-between gap-4 bg-trans_main px-5 py-4 text-white">
                                <div className="min-w-0">
                                    <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]">B2B Order</div>

                                </div>
                                <button onClick={() => setSelectedOrder(null)} className="rounded-full p-1.5 text-white/80 hover:bg-white/15 hover:text-white" aria-label="Close">
                                    <HiX className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto px-5 py-4">
                                <div className="space-y-3">
                                    <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                                        <SectionTitle title="Order Summary" />
                                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">

                                            <Field label="Created At" value={formatDate(selectedOrder.bookingDate)} />
                                            <div className="rounded-lg bg-white px-3 py-2.5 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700">
                                                <div className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">Status</div>
                                                <div className="mt-1.5">
                                                    <Badge color={getStatusColor(selectedOrder.status)} className="inline-flex w-fit">
                                                        {formatStatus(selectedOrder.status)}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <Field label="Distance" value={(selectedOrder as any)["distanceKm"] ? `${(selectedOrder as any)["distanceKm"]} km` : undefined} />
                                            <Field label="Rate Per Km" value={(selectedOrder as any)["ratePerKm"] ? `₹${(selectedOrder as any)["ratePerKm"]}` : undefined} />
                                            <Field label="Total Amount" value={(selectedOrder as any)["totalAmount"] ? `₹${(selectedOrder as any)["totalAmount"]}` : undefined} />
                                        </div>
                                    </section>
                                    <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                                        <SectionTitle title="Booking Customer" />
                                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                                            <Field label="Name" value={(selectedOrder as any)["bookingCustomer"]?.name || selectedOrder.customerName} />
                                            <Field label="Phone" value={(selectedOrder as any)["bookingCustomer"]?.phoneNumber} />
                                            <Field label="Address" value={(selectedOrder as any)["bookingCustomer"]?.address} wide />
                                            <Field label="Pincode" value={(selectedOrder as any)["bookingCustomer"]?.pincode} />
                                        </div>
                                    </section>
                                    <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                                        <SectionTitle title="Delivery Customer" />
                                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                                            <Field label="Name" value={(selectedOrder as any)["deliveryCustomer"]?.name} />
                                            <Field label="Phone" value={(selectedOrder as any)["deliveryCustomer"]?.phoneNumber} />
                                            <Field label="Address" value={(selectedOrder as any)["deliveryCustomer"]?.address} wide />
                                            <Field label="Pincode" value={(selectedOrder as any)["deliveryCustomer"]?.pincode} />
                                        </div>
                                    </section>
                                    <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                                        <SectionTitle title="Shipment & Vehicle" />
                                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                                            <Field label="Approx. Weight" value={(selectedOrder as any)["shipment"]?.approximateWeight} />
                                            <Field label="Vehicle Type" value={(selectedOrder as any)["selectedVehicle"]?.vehicleType || selectedOrder.vehicleType} />
                                            <Field label="Capacity" value={(selectedOrder as any)["selectedVehicle"]?.capacityKg} />
                                        </div>
                                    </section>
                                    {(selectedOrder as any)["driver"] && (
                                        <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                                            <SectionTitle title="Driver Details" />
                                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                                                <Field label="Name" value={(selectedOrder as any)["driver"]?.driverName} />
                                                <Field label="Phone" value={(selectedOrder as any)["driver"]?.phoneNumber} />
                                                <Field label="License Number" value={(selectedOrder as any)["driver"]?.licenseNumber} />
                                            </div>
                                        </section>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </NavbarSidebarLayout>
    )
}

export default B2BOrdersPage
