// ParcelManagementPage.tsx
import { FC, useEffect, useMemo, useState } from "react"
import { Badge, Button, Card, Select, TextInput } from "flowbite-react"
import toast from "react-hot-toast"
import { HiEye, HiPencil, HiPlus, HiSearch, HiTrash } from "react-icons/hi"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import DeleteConfirmModal from "../AgencyManagement/DeleteConfirmModal"
import AddEditParcel, { Parcel } from "./addEditParcel"
import { resolveParcelAccess } from "./parcelBookingRole"
import ViewParcelModal from "./viewParcel"

const PAGE_SIZE = 10

const ADMIN_BASE = "/api/admin/parcel-order"
const BRANCH_BASE = "/api/admin/branch/parcel-order"
const HUB_BASE = "/api/hub/parcel-order"
const HUB_LIST_BASE = "/api/admin/hub"

const statusColor: Record<string, string> = {
    "Order Created": "warning",
    "Parcel Collected": "warning",
    "Hub Assigned": "indigo",
    "Parcel Dispatched": "info",
    "Parcel Arrived at Hub": "info",
    "Parcel Processed at Hub": "info",
    "Parcel Dispatched from Hub": "info",
    "Parcel Arrived at Branch": "purple",
    "Parcel Received at Branch": "purple",
    Delivered: "success",
    Cancelled: "failure",
}

// Statuses a branch can set via /admin/branch/parcel-order/:id/status.
// "Parcel Collected" is available right away; everything else requires a
// hub to already be assigned.
const BRANCH_PRE_HUB_STATUSES = ["Parcel Collected"]
const BRANCH_POST_HUB_STATUSES = [
    "Parcel Dispatched",
    "Parcel Arrived at Branch",
    "Parcel Received at Branch",
    "Delivered",
]
const ALL_BRANCH_STATUSES = [...BRANCH_PRE_HUB_STATUSES, ...BRANCH_POST_HUB_STATUSES]

// Statuses a hub can set via /hub/parcel-order/:id/status (per API doc).
const HUB_STATUSES = ["Parcel Arrived at Hub", "Parcel Processed at Hub", "Parcel Dispatched from Hub"]

// Kept as-is (non-functional) — no matching driver/vehicle API yet.
const DRIVERS = [
    { id: "driver 1", name: "driver 1" },
    { id: "driver 2", name: "driver 2" },
    { id: "driver 3", name: "driver 3" },
]

const VEHICLES = [
    { id: "vehicle 1", name: "vehicle 1" },
    { id: "vehicle 2", name: "vehicle 2" },
    { id: "vehicle 3", name: "vehicle 3" },
]

interface Hub {
    id: string
    name: string
}

const ParcelManagementPage: FC = () => {
    const getProfileData = () => {
        try {
            const profileData = sessionStorage.getItem("profileData")
            return profileData ? JSON.parse(profileData) : null
        } catch (error) {
            return null
        }
    }

    const profileData = getProfileData()
    const loginType = (sessionStorage.getItem("loginType") || "").toLowerCase()
    const { isAdmin, isHub, isBranch } = resolveParcelAccess(loginType, profileData)

    const API_BASE = isAdmin ? ADMIN_BASE : isHub ? HUB_BASE : BRANCH_BASE

    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [parcels, setParcels] = useState<Parcel[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [apiError, setApiError] = useState<string | null>(null)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState<"add" | "edit">("add")
    const [selectedParcel, setSelectedParcel] = useState<Parcel | undefined>(undefined)

    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const [hubs, setHubs] = useState<Hub[]>([])
    const [assignedDrivers, setAssignedDrivers] = useState<Record<string, string>>({})
    const [assignedVehicles, setAssignedVehicles] = useState<Record<string, string>>({})
    const [rowActionError, setRowActionError] = useState<string | null>(null)

    const getAuthToken = () => {
        const authToken = sessionStorage.getItem("authToken")
        if (!authToken) throw new Error("Authorization token missing")
        return authToken
    }

    const resolveHubValue = (hub: any) => {
        if (!hub) return { id: "", name: "" }

        if (typeof hub === "string") {
            return { id: hub, name: hub }
        }

        if (typeof hub === "object") {
            const id = String(hub._id || hub.id || hub.hubId || "")
            const name = String(hub.hubName || hub.name || hub.hub || "")
            return { id, name }
        }

        return { id: String(hub), name: String(hub) }
    }

    const extractAssignedHub = (payload: any) => {
        const source = payload?.hub || payload?.data?.hub || payload?.data?.assignedHub || payload?.assignedHub || payload?.hubDetails || payload?.hubData
        return resolveHubValue(source)
    }

    const fetchParcels = async () => {
        setIsLoading(true)
        setApiError(null)

        try {
            const authToken = getAuthToken()

            const response = await fetch(API_BASE, {
                headers: { Authorization: `Bearer ${authToken}` },
            })

            if (!response.ok) {
                const errBody = await response.json().catch(() => null)
                throw new Error(errBody?.message || "Failed to load parcel bookings")
            }

            const payload = await response.json()
            const orders = payload?.data?.orders ?? []

            const normalizedParcels: Parcel[] = orders.map((item: any) => {
                const hub = resolveHubValue(item.hub)
                return {
                    id: item._id,
                    orderId: item.orderNumber,
                    deliveryCustomerName: item.deliveryCustomer?.name || "",
                    deliveryCustomerMobileNumber: item.deliveryCustomer?.mobileNumber || "",
                    deliveryBranch: item.deliveryCustomer?.deliveryBranch || "",
                    bookingCustomerName: item.bookingCustomer?.name || "",
                    bookingMobileNumber: item.bookingCustomer?.mobileNumber || "",
                    paymentType: item.paymentType === "To Pay" ? "To Pay" : "Paid",
                    article: item.parcelDetails?.article || "",
                    remarks: item.parcelDetails?.remarks || "",
                    numberOfParcels: String(item.parcelDetails?.numberOfParcels ?? ""),
                    approximateValue: String(item.parcelDetails?.approximateValue ?? ""),
                    transportationCharge: String(item.transportationCharge ?? "0"),
                    status: item.status,
                    branchName: item.branch?.agencyName || "",
                    hubId: hub.id,
                    hubName: hub.name || item.hub?.hubName || "",
                    statusHistory: Array.isArray(item.statusHistory) ? item.statusHistory : (Array.isArray(item.data?.statusHistory) ? item.data.statusHistory : []),
                }
            })

            setParcels(normalizedParcels)
        } catch (error) {
            setApiError(error instanceof Error ? error.message : "Failed to load parcel bookings")
            setParcels([])
        } finally {
            setIsLoading(false)
        }
    }

    const fetchHubs = async () => {
        try {
            const authToken = getAuthToken()
            const response = await fetch(HUB_LIST_BASE, {
                headers: { Authorization: `Bearer ${authToken}` },
            })
            if (!response.ok) return

            const payload = await response.json()
            const records = Array.isArray(payload) ? payload : payload?.data || []
            setHubs(
                records.map((h: any) => ({
                    id: String(h._id || h.id),
                    name: String(h.hubName || h.name || h._id),
                }))
            )
        } catch {
            // Non-critical — assignment dropdown just stays empty.
        }
    }

    useEffect(() => {
        fetchParcels()
        if (isAdmin) fetchHubs()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const filteredParcels = useMemo(() => {
        return parcels.filter((parcel) => {
            const matchesSearch =
                parcel.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                parcel.bookingCustomerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                parcel.deliveryCustomerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                parcel.deliveryBranch.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesStatus = statusFilter ? parcel.status === statusFilter : true

            return matchesSearch && matchesStatus
        })
    }, [parcels, searchTerm, statusFilter])

    const totalPages = Math.max(1, Math.ceil(filteredParcels.length / PAGE_SIZE))

    const paginatedParcels = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE
        return filteredParcels.slice(start, start + PAGE_SIZE)
    }, [filteredParcels, currentPage])

    const handleAdd = () => {
        setModalMode("add")
        setSelectedParcel(undefined)
        setIsModalOpen(true)
    }

    const handleEdit = (parcel: Parcel) => {
        setModalMode("edit")
        setSelectedParcel(parcel)
        setIsModalOpen(true)
    }

    const handleView = (parcel: Parcel) => {
        setSelectedParcel(parcel)
        setIsViewModalOpen(true)
    }

    const handleDeleteClick = (id: string) => {
        setSelectedId(id)
        setIsDeleteModalOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!selectedId) return
        setIsDeleting(true)
        setRowActionError(null)

        try {
            const authToken = getAuthToken()
            const res = await fetch(`${ADMIN_BASE}/${selectedId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${authToken}` },
            })
            if (!res.ok) {
                const errBody = await res.json().catch(() => null)
                throw new Error(errBody?.message || "Failed to delete booking")
            }
            setParcels((prev) => prev.filter((p) => p.id !== selectedId))
        } catch (error) {
            setRowActionError(error instanceof Error ? error.message : "Failed to delete booking")
        } finally {
            setIsDeleting(false)
            setIsDeleteModalOpen(false)
            setSelectedId(null)
        }
    }

    const handleAssignHub = async (parcelId: string, hubId: string) => {
        const previous = parcels.find((p) => p.id === parcelId)?.hubId ?? ""
        setParcels((prev) => prev.map((p) => (p.id === parcelId ? { ...p, hubId } : p)))
        setRowActionError(null)

        try {
            const authToken = getAuthToken()
            const res = await fetch(`${ADMIN_BASE}/${parcelId}/assign-hub`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({ hub: hubId }),
            })
            if (!res.ok) {
                const errBody = await res.json().catch(() => null)
                throw new Error(errBody?.message || "Failed to assign hub")
            }

            const responsePayload = await res.json().catch(() => null)
            const assignedHub = extractAssignedHub(responsePayload)
            const fallbackHubName = hubs.find((hub) => hub.id === hubId)?.name || ""

            setParcels((prev) =>
                prev.map((p) =>
                    p.id === parcelId
                        ? {
                              ...p,
                              hubId: assignedHub.id || hubId,
                              hubName: assignedHub.name || fallbackHubName,
                          }
                        : p
                )
            )
            fetchParcels()
        } catch (error) {
            setParcels((prev) => prev.map((p) => (p.id === parcelId ? { ...p, hubId: previous } : p)))
            setRowActionError(error instanceof Error ? error.message : "Failed to assign hub")
        }
    }

    // Shared status-update handler for both branch and hub actors — only the
    // base URL and value set differ.
    const handleStatusChange = async (parcelId: string, status: string, base: string) => {
        const previous = parcels.find((p) => p.id === parcelId)?.status
        setParcels((prev) => prev.map((p) => (p.id === parcelId ? { ...p, status } : p)))
        setRowActionError(null)

        try {
            const authToken = getAuthToken()
            const res = await fetch(`${base}/${parcelId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({ status }),
            })
            if (!res.ok) {
                const errBody = await res.json().catch(() => null)
                throw new Error(errBody?.message || "Failed to update status")
            }

            toast.success(`Status updated to ${status}`)
            fetchParcels()
        } catch (error) {
            setParcels((prev) => prev.map((p) => (p.id === parcelId ? { ...p, status: previous as string } : p)))
            const message = error instanceof Error ? error.message : "Failed to update status"
            setRowActionError(message)
            toast.error(message)
        }
    }

    const handleDriverChange = (parcelId: string, driverId: string) => {
        setAssignedDrivers((prev) => ({ ...prev, [parcelId]: driverId }))
    }

    const handleVehicleChange = (parcelId: string, vehicleId: string) => {
        setAssignedVehicles((prev) => ({ ...prev, [parcelId]: vehicleId }))
    }

    const showAmountColumn = !isBranch
    const showDeliveryBranchColumn = !isBranch
    const assignmentColumnCount = (isAdmin ? 1 : 0) + (isHub ? 2 : 0)
    const baseColumnCount = 5 + (showDeliveryBranchColumn ? 1 : 0) + (showAmountColumn ? 1 : 0)
    const totalColumnCount = baseColumnCount + assignmentColumnCount + 1

    return (
        <NavbarSidebarLayout>
            <div className="px-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Parcel Booking Management</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage parcel bookings</p>
                </div>

                <Card>
                    {apiError && (
                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
                            {apiError}
                        </div>
                    )}

                    {/* {rowActionError && (
                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
                            {rowActionError}
                        </div>
                    )} */}

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">List of Bookings</h2>

                            <div className="flex flex-col md:flex-row gap-3 max-w-3xl">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <HiSearch className="h-5 w-5 text-gray-400" />
                                    </div>

                                    <TextInput
                                        type="search"
                                        placeholder="Search order ID, customer..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setCurrentPage(1)
                                            setSearchTerm(e.target.value)
                                        }}
                                        className="pl-10"
                                    />
                                </div>

                                <Select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setCurrentPage(1)
                                        setStatusFilter(e.target.value)
                                    }}
                                    className="md:w-56"
                                >
                                    <option value="">All Status</option>
                                    {Object.keys(statusColor).map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        {!isAdmin && !isHub && (
                            <Button color="warning" onClick={() => handleAdd()} className="bg-orange-500 hover:bg-orange-600">
                                <HiPlus className="mr-2 h-5 w-5" />
                                ADD
                            </Button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-800 text-white text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-3">LR Number</th>
                                    {showDeliveryBranchColumn && <th className="px-4 py-3">Delivery Branch</th>}
                                    <th className="px-4 py-3">Booking Customer</th>
                                    <th className="px-4 py-3">Payment Type</th>
                                    {showAmountColumn && <th className="px-4 py-3">Amount</th>}
                                    <th className="px-4 py-3">Status</th>
                                    {isAdmin && <th className="px-4 py-3">Assign Hub</th>}
                                    {isHub && <th className="px-4 py-3">Assign Driver</th>}
                                    {isHub && <th className="px-4 py-3">Assign Vehicle</th>}
                                    <th className="px-4 py-3 text-center">Action</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={totalColumnCount} className="px-4 py-8 text-center text-gray-500">
                                            Loading bookings...
                                        </td>
                                    </tr>
                                ) : paginatedParcels.length > 0 ? (
                                    paginatedParcels.map((parcel) => {
                                        const hubAssigned = Boolean(parcel.hubId)
                                        const branchOptions = hubAssigned ? ALL_BRANCH_STATUSES : BRANCH_PRE_HUB_STATUSES

                                        return (
                                            <tr key={parcel.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{parcel.orderId}</td>

                                                {showDeliveryBranchColumn && (
                                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{parcel.deliveryBranch || "-"}</td>
                                                )}

                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{parcel.bookingCustomerName}</td>

                                                <td className="px-4 py-3 inline-block">
                                                    <Badge className="py-2" color={parcel.paymentType === "Paid" ? "success" : "warning"}>
                                                        {parcel.paymentType}
                                                    </Badge>
                                                </td>

                                                {showAmountColumn && <td className="px-4 py-3 text-gray-900 dark:text-white">-</td>}

                                                {/* Status cell: dropdown for branch/hub, read-only badge for admin */}
                                                <td className="px-4 py-3">
                                                    {isBranch ? (
                                                        <>
                                                            <Select
                                                                value={branchOptions.includes(parcel.status) ? parcel.status : ""}
                                                                onChange={(e) => handleStatusChange(parcel.id, e.target.value, BRANCH_BASE)}
                                                                disabled={branchOptions.length === 0}
                                                                className="min-w-[190px]"
                                                            >
                                                                <option value="" disabled>
                                                                    {parcel.status}
                                                                </option>
                                                                {branchOptions.map((status) => (
                                                                    <option key={status} value={status}>
                                                                        {status}
                                                                    </option>
                                                                ))}
                                                            </Select>
                                                            {!hubAssigned && (
                                                                <p className="mt-1 text-[11px] text-gray-400">Waiting for hub assignment</p>
                                                            )}
                                                        </>
                                                    ) : isHub ? (
                                                        <Select
                                                            value={HUB_STATUSES.includes(parcel.status) ? parcel.status : ""}
                                                            onChange={(e) => handleStatusChange(parcel.id, e.target.value, HUB_BASE)}
                                                            className="min-w-[190px]"
                                                        >
                                                            <option value="" disabled>
                                                                {parcel.status}
                                                            </option>
                                                            {HUB_STATUSES.map((status) => (
                                                                <option key={status} value={status}>
                                                                    {status}
                                                                </option>
                                                            ))}
                                                        </Select>
                                                    ) : (
                                                        <Badge className="inline-block py-2" color={statusColor[parcel.status] ?? "gray"}>
                                                            {parcel.status}
                                                        </Badge>
                                                    )}
                                                </td>

                                                {isAdmin && (
                                                    <td>
                                                        <Select
                                                            value={parcel.hubId ?? (parcel.hubName ? hubs.find((hub) => hub.name === parcel.hubName)?.id ?? "" : "")}
                                                            onChange={(e) => handleAssignHub(parcel.id, e.target.value)}
                                                        >
                                                            <option value="">Unassigned</option>
                                                            {parcel.hubId && !hubs.some((hub) => hub.id === parcel.hubId) && parcel.hubName && (
                                                                <option value={parcel.hubId}>{parcel.hubName}</option>
                                                            )}
                                                            {hubs.map((hub) => (
                                                                <option key={hub.id} value={hub.id}>
                                                                    {hub.name}
                                                                </option>
                                                            ))}
                                                        </Select>
                                                    </td>
                                                )}

                                                {isHub && (
                                                    <td>
                                                        <Select
                                                            value={assignedDrivers[parcel.id] ?? ""}
                                                            onChange={(e) => handleDriverChange(parcel.id, e.target.value)}
                                                        >
                                                            <option value="">Unassigned</option>
                                                            {DRIVERS.map((driver) => (
                                                                <option key={driver.id} value={driver.id}>
                                                                    {driver.name}
                                                                </option>
                                                            ))}
                                                        </Select>
                                                    </td>
                                                )}

                                                {isHub && (
                                                    <td>
                                                        <Select
                                                            value={assignedVehicles[parcel.id] ?? ""}
                                                            onChange={(e) => handleVehicleChange(parcel.id, e.target.value)}
                                                        >
                                                            <option value="">Unassigned</option>
                                                            {VEHICLES.map((vehicle) => (
                                                                <option key={vehicle.id} value={vehicle.id}>
                                                                    {vehicle.name}
                                                                </option>
                                                            ))}
                                                        </Select>
                                                    </td>
                                                )}

                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button onClick={() => handleView(parcel)} className="p-1.5 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400" title="View">
                                                            <HiEye className="h-5 w-5" />
                                                        </button>

                                                        {!isHub && (
                                                            <button onClick={() => handleEdit(parcel)} className="p-1.5 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400" title={isAdmin ? "Update Charge" : "Edit"}>
                                                                <HiPencil className="h-5 w-5" />
                                                            </button>
                                                        )}

                                                        {isAdmin && (
                                                            <button onClick={() => handleDeleteClick(parcel.id)} className="p-1.5 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400" title="Delete">
                                                                <HiTrash className="h-5 w-5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={totalColumnCount} className="px-4 py-8 text-center text-gray-500">
                                            No bookings found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Page {currentPage} of {totalPages}
                        </p>

                        <div className="flex gap-2">
                            <Button size="sm" color="gray" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1}>
                                Previous
                            </Button>

                            <Button size="sm" color="gray" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
                                Next
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>

            <AddEditParcel
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode={modalMode}
                parcel={selectedParcel}
                chargeOnly={isAdmin}
                onSuccess={() => {
                    fetchParcels().catch(() => undefined)
                }}
            />

            <ViewParcelModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} parcel={selectedParcel} />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Booking"
                message="Are you sure you want to delete this parcel booking? This action cannot be undone."
                
            />
        </NavbarSidebarLayout>
    )
}

export default ParcelManagementPage