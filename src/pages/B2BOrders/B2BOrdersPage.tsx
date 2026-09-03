import { FC, useEffect, useState } from "react"
import { Badge, Button, Card, Label, TextInput } from "flowbite-react"
import { HiEye, HiSearch, HiX } from "react-icons/hi"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { B2BOrder, useB2BOrderStore } from "../../store/b2bOrderStore"

const PAGE_SIZE = 10

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

    useEffect(() => {
        fetchOrders({ page, limit: PAGE_SIZE, search, startDate, endDate })
    }, [fetchOrders, page, search, startDate, endDate])

    const formatDate = (value: string) => {
        if (!value) return "-"
        const date = new Date(value)
        return Number.isNaN(date.getTime())
            ? value
            : date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })
    }

    const renderOrder = (order: B2BOrder, index: number) => (
        <tr key={order.id || order.orderNumber} className="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{(page - 1) * PAGE_SIZE + index + 1}</td>
            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatDate(order.bookingDate)}</td>
            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{order.customerName}</td>
            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{order.approximateWeight}</td>
            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{order.vehicleType}</td>
            <td className="px-4 py-3"><Badge color={order.status === "CONFIRMED" ? "success" : "warning"}>{order.status}</Badge></td>
            
            <td className="px-4 py-3"><button className="p-1.5 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400" onClick={() => setSelectedOrder(order)} title="View order details"><HiEye className="h-5 w-5" /></button></td>
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
                                <th className="px-4 py-3">S.No.</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Booking Customer</th><th className="px-4 py-3">Approx. Weight</th><th className="px-4 py-3">Vehicle Type</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th>
                            </tr></thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {loading ? <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading orders...</td></tr> : orders.length === 0 ? <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No B2B orders found</td></tr> : orders.map(renderOrder)}
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
                                                <div className="mt-1.5"><Badge color={selectedOrder.status === "CONFIRMED" ? "success" : "warning"}>{selectedOrder.status}</Badge></div>
                                            </div>
                                            <Field label="Distance" value={selectedOrder.distanceKm ? `${selectedOrder.distanceKm} km` : undefined} />
                                            <Field label="Rate Per Km" value={selectedOrder.ratePerKm ? `₹${selectedOrder.ratePerKm}` : undefined} />
                                            <Field label="Total Amount" value={selectedOrder.totalAmount ? `₹${selectedOrder.totalAmount}` : undefined} />
                                        </div>
                                    </section>
                                    <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                                        <SectionTitle title="Booking Customer" />
                                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                                            <Field label="Name" value={(selectedOrder.bookingCustomer as any)?.name || selectedOrder.customerName} />
                                            <Field label="Phone" value={(selectedOrder.bookingCustomer as any)?.phoneNumber} />
                                            <Field label="Address" value={(selectedOrder.bookingCustomer as any)?.address} wide />
                                            <Field label="Pincode" value={(selectedOrder.bookingCustomer as any)?.pincode} />
                                        </div>
                                    </section>
                                    <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                                        <SectionTitle title="Delivery Customer" />
                                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                                            <Field label="Name" value={(selectedOrder.deliveryCustomer as any)?.name} />
                                            <Field label="Phone" value={(selectedOrder.deliveryCustomer as any)?.phoneNumber} />
                                            <Field label="Address" value={(selectedOrder.deliveryCustomer as any)?.address} wide />
                                            <Field label="Pincode" value={(selectedOrder.deliveryCustomer as any)?.pincode} />
                                        </div>
                                    </section>
                                    <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                                        <SectionTitle title="Shipment & Vehicle" />
                                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                                            <Field label="Approx. Weight" value={(selectedOrder.shipment as any)?.approximateWeight} />
                                            <Field label="Vehicle Type" value={(selectedOrder.selectedVehicle as any)?.vehicleType || selectedOrder.vehicleType} />
                                            <Field label="Capacity" value={(selectedOrder.selectedVehicle as any)?.capacityKg} />
                                        </div>
                                    </section>
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
