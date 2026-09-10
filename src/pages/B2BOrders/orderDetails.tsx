import { FC } from "react"
import { Badge } from "flowbite-react"
import { HiX } from "react-icons/hi"
import { B2BOrder } from "../../store/b2bOrderStore"
import { Field, SectionTitle, formatDate, formatStatus, getStatusColor } from "./b2bOrderUtils"

interface OrderDetailsModalProps {
    order: B2BOrder
    onClose: () => void
}

const OrderDetailsModal: FC<OrderDetailsModalProps> = ({ order, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="flex h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900" onClick={(event) => event.stopPropagation()}>
                <div className="flex shrink-0 items-start justify-between gap-4 bg-trans_main px-5 py-4 text-white">
                    <div className="min-w-0">
                        <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]">B2B Order</div>
                    </div>
                    <button onClick={onClose} className="rounded-full p-1.5 text-white/80 hover:bg-white/15 hover:text-white" aria-label="Close">
                        <HiX className="h-5 w-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4">
                    <div className="space-y-3">
                        <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                            <SectionTitle title="Order Summary" />
                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                                <Field label="LR Number" value={order.lrNum} />
                                <Field label="Created At" value={formatDate(order.bookingDate)} />
                                <div className="rounded-lg bg-white px-3 py-2.5 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700">
                                    <div className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">Status</div>
                                    <div className="mt-1.5">
                                        <Badge color={getStatusColor(order.status)} className="inline-flex w-fit">
                                            {formatStatus(order.status)}
                                        </Badge>
                                    </div>
                                </div>
                                <Field label="Distance" value={(order as any)["distanceKm"] ? `${(order as any)["distanceKm"]} km` : undefined} />
                                <Field label="Rate Per Km" value={(order as any)["ratePerKm"] ? `₹${(order as any)["ratePerKm"]}` : undefined} />
                                <Field label="Total Amount" value={(order as any)["totalAmount"] ? `₹${(order as any)["totalAmount"]}` : undefined} />
                            </div>
                        </section>
                        <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                            <SectionTitle title="Booking Customer" />
                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                                <Field label="Name" value={(order as any)["bookingCustomer"]?.name || order.customerName} />
                                <Field label="Phone" value={(order as any)["bookingCustomer"]?.phoneNumber} />
                                <Field label="Address" value={(order as any)["bookingCustomer"]?.address} wide />
                                <Field label="Pincode" value={(order as any)["bookingCustomer"]?.pincode} />
                            </div>
                        </section>
                        <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                            <SectionTitle title="Delivery Customer" />
                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                                <Field label="Name" value={(order as any)["deliveryCustomer"]?.name} />
                                <Field label="Phone" value={(order as any)["deliveryCustomer"]?.phoneNumber} />
                                <Field label="Address" value={(order as any)["deliveryCustomer"]?.address} wide />
                                <Field label="Pincode" value={(order as any)["deliveryCustomer"]?.pincode} />
                            </div>
                        </section>
                         <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                            <SectionTitle title="Shipment & Vehicle" />
                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                                <Field label="Approx. Weight" value={(order as any)["shipment"]?.approximateWeight} />
                                <Field label="Vehicle Type" value={(order as any)["userSelectedVehicle"]?.vehicleType || order.vehicleType} />
                                {/* <Field label="Registration Number" value={(order as any)["userSelectedVehicle"]?.registrationNumber} />
                                <Field label="Insurance Number" value={(order as any)["userSelectedVehicle"]?.insuranceNumber} />
                                <Field label="RC Number" value={(order as any)["userSelectedVehicle"]?.rcNumber} /> */}
                                <Field label="Capacity" value={(order as any)["userSelectedVehicle"]?.capacityKg} />
                            </div>
                        </section>
                        {(order as any)["selectedVehicleId"] && (
                        <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                            <SectionTitle title="Assigned Vehicle" />
                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                                <Field label="Vehicle Type" value={(order as any)["selectedVehicleId"]?.vehicleType || order.vehicleType} />
                                <Field label="Registration Number" value={(order as any)["selectedVehicleId"]?.vehicleRegistrationNumber} />
                                <Field label="Insurance Number" value={(order as any)["selectedVehicleId"]?.insuranceNumber} />
                                <Field label="RC Number" value={(order as any)["selectedVehicleId"]?.rcNumber} />
                                <Field label="Capacity" value={(order as any)["selectedVehicleId"]?.capacity} />
                            </div>
                        </section>
                        )}
                        {(order as any)["driver"] && (
                            <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                                <SectionTitle title="Driver Details" />
                                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                                    <Field label="Name" value={(order as any)["driver"]?.driverName} />
                                    <Field label="Phone" value={(order as any)["driver"]?.phoneNumber} />
                                    <Field label="License Number" value={(order as any)["driver"]?.licenseNumber} />
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderDetailsModal