import { FC, useEffect, useState } from "react"
import { Label, Select } from "flowbite-react"
import { HiX } from "react-icons/hi"
import toast from "react-hot-toast"
import http from "../../common/httpRequest"
import { B2BOrder } from "../../store/b2bOrderStore"

const B2B_ORDERS_BASE = "/admin/b2b/orders"

interface DriverOption {
    id: string
    driverName: string
}

interface VehicleOption {
    id: string
    vehicleType: string
}

interface AssignmentModalProps {
    order: B2BOrder
    onClose: () => void
    // Called after a successful assignment so the parent can refetch the order list.
    onAssigned: () => void
    // Optional: lets the parent optimistically reflect the newly assigned vehicle
    // in its local rows before the refetch completes.
    onVehicleAssigned?: (orderId: string, vehicleType: string, vehicle: VehicleOption) => void
}

const AssignmentModal: FC<AssignmentModalProps> = ({ order, onClose, onAssigned, onVehicleAssigned }) => {
    const [drivers, setDrivers] = useState<DriverOption[]>([])
    const [vehicles, setVehicles] = useState<VehicleOption[]>([])
    const [driversLoading, setDriversLoading] = useState(false)
    const [vehiclesLoading, setVehiclesLoading] = useState(false)
    const [assignmentLoading, setAssignmentLoading] = useState(false)

    const assignedDriver = (order as any).driverId || (order as any).driver
    const assignedVehicle = (order as any).selectedVehicle || (order as any).vehicleId || (order as any).vehicle
    const initialVehicleLabel = assignedVehicle?.vehicleType || (typeof order.vehicleType === "string" ? order.vehicleType : "")

    const [assignmentDriverId, setAssignmentDriverId] = useState(String(assignedDriver?._id || assignedDriver?.id || assignedDriver || "").trim())
    const [assignmentVehicleId, setAssignmentVehicleId] = useState(String(assignedVehicle?._id || assignedVehicle?.id || assignedVehicle || "").trim())
    // Human-readable label for the order's currently assigned vehicle, used as a
    // fallback <option> so the Select shows a selection even before/without the
    // vehicles list containing it.
    const [assignmentVehicleLabel] = useState(initialVehicleLabel)

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

    useEffect(() => {
        const fetchVehicles = async () => {
            setVehiclesLoading(true)
            try {
                const response = await http.get(`${B2B_ORDERS_BASE}/vehicles`)
                const payload = response.data
                const items = Array.isArray(payload?.data)
                    ? payload.data
                    : Array.isArray(payload?.data?.vehicles)
                        ? payload.data.vehicles
                        : Array.isArray(payload?.vehicles)
                            ? payload.vehicles
                            : Array.isArray(payload)
                                ? payload
                                : []
                const mapped: VehicleOption[] = items
                    .map((item: any) => ({
                        id: String(item?._id || item?.id || item?.vehicleId || "").trim(),
                        vehicleType: item?.vehicleType || item?.type || item?.name || "Unnamed vehicle",
                    }))
                    .filter((item: VehicleOption) => item.id)
                setVehicles(Array.from(new Map(mapped.map((vehicle) => [vehicle.id, vehicle])).values()))
            } catch (error) {
                const message = error instanceof Error ? error.message : "Failed to fetch vehicles"
                toast.error(message)
            } finally {
                setVehiclesLoading(false)
            }
        }

        fetchVehicles()
    }, [])

    // If the vehicle id captured when opening the modal doesn't match anything in the
    // fetched vehicles list (e.g. different id formats from different endpoints) but a
    // vehicle with the same type name does exist, snap the selection to that vehicle's
    // real id so the Select shows a single entry and assignment submits a valid id.
    useEffect(() => {
        if (!assignmentVehicleId || vehicles.length === 0) return
        if (vehicles.some((vehicle) => vehicle.id === assignmentVehicleId)) return
        const matchByName = vehicles.find(
            (vehicle) => assignmentVehicleLabel && vehicle.vehicleType.trim().toLowerCase() === assignmentVehicleLabel.trim().toLowerCase()
        )
        if (matchByName) {
            setAssignmentVehicleId(matchByName.id)
        }
    }, [vehicles, assignmentVehicleId, assignmentVehicleLabel])

    const handleAssignment = async () => {
        if (!assignmentDriverId && !assignmentVehicleId) {
            toast.error("Select a driver or vehicle")
            return
        }

        setAssignmentLoading(true)
        try {
            if (assignmentDriverId) {
                await http.patch(`${B2B_ORDERS_BASE}/${order.id}/assign-driver`, { driver: assignmentDriverId })
            }
            if (assignmentVehicleId) {
                await http.patch(`${B2B_ORDERS_BASE}/${order.id}/assign-vehicle`, { vehicle: assignmentVehicleId })
                const assigned = vehicles.find((vehicle) => vehicle.id === assignmentVehicleId)
                if (assigned) {
                    onVehicleAssigned?.(order.id, assigned.vehicleType, assigned)
                }
            }
            toast.success("Assignment updated")
            onAssigned()
            onClose()
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to update assignment"
            toast.error(message)
        } finally {
            setAssignmentLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm" onClick={() => !assignmentLoading && onClose()}>
            <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl dark:bg-gray-900" onClick={(event) => event.stopPropagation()}>
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Assign Driver & Vehicle</h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Order {order.lrNum}</p>
                    </div>
                    <button onClick={onClose} disabled={assignmentLoading} className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-800" aria-label="Close">
                        <HiX className="h-5 w-5" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="assign-driver" className="mb-1 block text-sm">Driver</Label>
                        <Select id="assign-driver" value={assignmentDriverId} disabled={driversLoading || assignmentLoading} onChange={(event) => setAssignmentDriverId(event.target.value)}>
                            <option value="">{driversLoading ? "Loading drivers..." : "Select driver"}</option>
                            {assignmentDriverId && !drivers.some((driver) => driver.id === assignmentDriverId) && (
                                <option value={assignmentDriverId}>{(order as any).driver?.driverName || "Current driver"}</option>
                            )}
                            {drivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.driverName}</option>)}
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="assign-vehicle" className="mb-1 block text-sm">Vehicle</Label>
                        <Select id="assign-vehicle" value={assignmentVehicleId} disabled={vehiclesLoading || assignmentLoading} onChange={(event) => setAssignmentVehicleId(event.target.value)}>
                            <option value="">{vehiclesLoading ? "Loading vehicles..." : "Select vehicle"}</option>
                            {assignmentVehicleId && !vehicles.some((vehicle) => (
                                vehicle.id === assignmentVehicleId
                                || (!!assignmentVehicleLabel && vehicle.vehicleType.trim().toLowerCase() === assignmentVehicleLabel.trim().toLowerCase())
                            )) && (
                                <option value={assignmentVehicleId}>{assignmentVehicleLabel || "Current vehicle"}</option>
                            )}
                            {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.vehicleType}</option>)}
                        </Select>
                    </div>
                    <button type="button" onClick={handleAssignment} disabled={assignmentLoading || driversLoading || vehiclesLoading} className="w-full rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50">
                        {assignmentLoading ? "Assigning..." : "Assign"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AssignmentModal