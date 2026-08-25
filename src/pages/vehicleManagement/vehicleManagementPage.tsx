import { FC, useEffect, useState } from "react"
import { Badge, Button, Card, Select, Spinner, TextInput } from "flowbite-react"
import { HiEye, HiPencil, HiPlus, HiSearch, HiTrash } from "react-icons/hi"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import ViewVehicleModal from "./viewVehicle"
import DeleteConfirmModal from "../AgencyManagement/DeleteConfirmModal"
import AddEditVehicle from "./addVehicle"
import { useVehicleStore, Vehicle } from "../../store/vehicleStore"

const PAGE_SIZE = 10

const VehicleManagementPage: FC = () => {
    const {
        vehicles,
        loading,
        pagination,
        fetchVehicles,
        deleteVehicle,
        getVehicleById,
        selectedVehicle: storeSelectedVehicle,
        setSelectedVehicle,
    } = useVehicleStore()

    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState<"add" | "edit">("add")
    const [selectedVehicle, setLocalSelectedVehicle] = useState<Vehicle | undefined>(undefined)

    useEffect(() => {
        fetchVehicles({
            page: currentPage,
            limit: PAGE_SIZE,
            search: searchTerm || undefined,
            status: statusFilter || undefined,
        })
    }, [fetchVehicles, currentPage, searchTerm, statusFilter])

    const totalPages = Math.max(1, pagination?.totalPages || 1)

    const handleView = async (vehicle: Vehicle) => {
        await getVehicleById(vehicle.id)
        setIsViewModalOpen(true)
    }

    const handleAdd = () => {
        setModalMode("add")
        setLocalSelectedVehicle(undefined)
        setIsModalOpen(true)
    }

    const handleEdit = (vehicle: Vehicle) => {
        setModalMode("edit")
        setLocalSelectedVehicle(vehicle)
        setIsModalOpen(true)
    }

    const handleDeleteClick = (id: string) => {
        setSelectedId(id)
        setIsDeleteModalOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!selectedId) return
        try {
            await deleteVehicle(selectedId)
            setIsDeleteModalOpen(false)
            setSelectedId(null)
        } catch (error) {
            // error handled in store
        }
    }

    return (
        <NavbarSidebarLayout>
            <div className="px-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Vehicle Management</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage vehicle details</p>
                </div>

                <Card>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">List of Vehicles</h2>

                            <div className="flex flex-col md:flex-row gap-3 max-w-3xl">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <HiSearch className="h-5 w-5 text-gray-400" />
                                    </div>

                                    <TextInput
                                        type="search"
                                        placeholder="Search vehicle..."
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
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </Select>
                            </div>
                        </div>

                        <Button color="warning" onClick={handleAdd} className="bg-orange-500 hover:bg-orange-600">
                            <HiPlus className="mr-2 h-5 w-5" />
                            ADD
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex justify-center items-center py-8">
                                <Spinner size="xl" />
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-800 text-white text-xs uppercase">
                                    <tr>
                                        <th className="px-4 py-3 w-16">S.No</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3">Capacity</th>
                                        <th className="px-4 py-3">Vehicle Registration Number</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-center">Action</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {vehicles.length > 0 ? (
                                        vehicles.map((vehicle, index) => (
                                            <tr key={vehicle.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                                                <td className="px-4 py-3 text-gray-900 dark:text-white">{vehicle.type}</td>
                                                <td className="px-4 py-3 text-gray-900 dark:text-white">{vehicle.capacity}</td>
                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{vehicle.registrationNumber}</td>
                                                <td className="px-4 py-3 inline-block">
                                                    <Badge color={vehicle.status === "Active" ? "success" : "failure"}>
                                                        {vehicle.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button onClick={() => handleView(vehicle)} className="p-1.5 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400" title="View">
                                                            <HiEye className="h-5 w-5" />
                                                        </button>
                                                        <button onClick={() => handleEdit(vehicle)} className="p-1.5 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400" title="Edit">
                                                            <HiPencil className="h-5 w-5" />
                                                        </button>
                                                        <button onClick={() => handleDeleteClick(vehicle.id)} className="p-1.5 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400" title="Delete">
                                                            <HiTrash className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                                No vehicles found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
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
            <AddEditVehicle
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode={modalMode}
                vehicle={selectedVehicle}
                onSuccess={async () => {
                    await fetchVehicles({
                        page: currentPage,
                        limit: PAGE_SIZE,
                        search: searchTerm || undefined,
                        status: statusFilter || undefined,
                    })
                    setIsModalOpen(false)
                }}
            />
            <ViewVehicleModal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false)
                    setSelectedVehicle(null)
                }}
                vehicle={storeSelectedVehicle}
            />
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Vehicle"
                message="Are you sure you want to delete this Vehicle? This action cannot be undone."
            />
        </NavbarSidebarLayout>
    )
}

export default VehicleManagementPage
