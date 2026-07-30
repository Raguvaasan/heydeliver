import { FC, useMemo, useState } from "react"
import { Badge, Button, Card, Select, TextInput } from "flowbite-react"
import { HiEye, HiPencil, HiPlus, HiSearch, HiTrash } from "react-icons/hi"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import DeleteConfirmModal from "../AgencyManagement/DeleteConfirmModal"
import AddEditParcel, { Parcel } from "./addEditParcel"
import ViewParcelModal from "./viewParcel"

const PAGE_SIZE = 10

const dummyParcels: Parcel[] = [
    {
        id: "1",
        orderId: "PB-00001",
        deliverCustomerName: "Vignesh R",
        deliverMobileNumber: "9876543210",
        deliveryState: "Karnataka",
        deliveryCityBranch: "Bangalore - Whitefield",
        bookingCustomerName: "Anita Sharma",
        bookingMobileNumber: "9123456780",
        paymentType: "Paid",
        article: "Electronics",
        remarks: "Handle with care",
        numberOfParcels: "2",
        approximateValue: "5000",
        transportationCharge: "250",
        status: "In Transit",
        receivedFrom:'Chennai',
        deliverTo:"Madurai"
    },
    {
        id: "2",
        orderId: "PB-00002",
        deliverCustomerName: "Karthik M",
        deliverMobileNumber: "9988776655",
        deliveryState: "Tamil Nadu",
        deliveryCityBranch: "Coimbatore - RS Puram",
        bookingCustomerName: "Deepak Iyer",
        bookingMobileNumber: "9012345678",
        paymentType: "To Pay",
        article: "Documents",
        remarks: "",
        numberOfParcels: "1",
        approximateValue: "500",
        transportationCharge: "100",
        status: "Pending",
         receivedFrom:'Chennai',
        deliverTo:"Madurai"
    },
]

const statusColor: Record<string, string> = {
    Pending: "warning",
    "In Transit": "info",
    Delivered: "success",
    Cancelled: "failure",
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
    const userRole = profileData?.role?.name?.toLowerCase() || ""
    const roleName = profileData?.role?.roleName?.toLowerCase() || ""
    const isAdmin =
        loginType === "admin" ||
        userRole === "admin" ||
        userRole === "super admin" ||
        roleName === "admin" ||
        roleName === "super admin"

    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [currentPage, setCurrentPage] = useState(1)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState<"add" | "edit">("add")
    const [selectedParcel, setSelectedParcel] = useState<Parcel | undefined>(undefined)

    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const filteredParcels = useMemo(() => {
        return dummyParcels.filter((parcel) => {
            const matchesSearch =
                parcel.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                parcel.bookingCustomerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                parcel.deliverCustomerName.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesStatus = statusFilter ? parcel.status === statusFilter : true

            return matchesSearch && matchesStatus
        })
    }, [searchTerm, statusFilter])

    const totalPages = Math.max(1, Math.ceil(filteredParcels.length / PAGE_SIZE))

    const paginatedParcels = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE
        return filteredParcels.slice(start, start + PAGE_SIZE)
    }, [filteredParcels, currentPage])

    const getAmount = (parcel: Parcel) =>
        Number(parcel.approximateValue) + Number(parcel.transportationCharge)

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
        //await deleteParcel(selectedId)
        setIsDeleteModalOpen(false)
        setSelectedId(null)
    }

    return (
        <NavbarSidebarLayout>
            <div className="px-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Parcel Booking Management</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage parcel bookings</p>
                </div>

                <Card>
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
                                    className="md:w-48"
                                >
                                    <option value="">All Status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="In Transit">In Transit</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </Select>
                            </div>
                        </div>

                        {!isAdmin && (
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
                                    <th className="px-4 py-3">Order ID</th>
                                    <th className="px-4 py-3">Received From</th>
                                    <th className="px-4 py-3">Deliver To</th>
                                    <th className="px-4 py-3">Payment Type</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-center">Action</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {paginatedParcels.length > 0 ? (
                                    paginatedParcels.map((parcel) => (
                                        <tr key={parcel.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{parcel.orderId}</td>

                                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{parcel.receivedFrom}</td>

                                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{parcel.deliverTo}</td>

                                            <td className="px-4 py-3 inline-block">
                                                <Badge color={parcel.paymentType === "Paid" ? "success" : "warning"}>
                                                    {parcel.paymentType}
                                                </Badge>
                                            </td>

                                            <td className="px-4 py-3 text-gray-900 dark:text-white">
                                                ₹{getAmount(parcel).toLocaleString("en-IN")}
                                            </td>

                                            <td className="px-4 py-3 inline-block">
                                                <Badge color={statusColor[parcel.status] ?? "gray"}>{parcel.status}</Badge>
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => handleView(parcel)} className="p-1.5 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400" title="View">
                                                        <HiEye className="h-5 w-5" />
                                                    </button>

                                                    <button onClick={() => handleEdit(parcel)} className="p-1.5 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400" title="Edit">
                                                        <HiPencil className="h-5 w-5" />
                                                    </button>

                                                    <button onClick={() => handleDeleteClick(parcel.id)} className="p-1.5 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400" title="Delete">
                                                        <HiTrash className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
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
                onSuccess={(parcel) => {
                    console.log("Saved:", parcel)
                    // e.g. refetch your parcel list here
                }}
            />

            <ViewParcelModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                parcel={selectedParcel}
            />

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
