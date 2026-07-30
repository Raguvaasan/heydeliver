import { FC, useEffect, useState } from "react"
import { Badge, Button, Card, Select, Spinner, TextInput } from "flowbite-react"
import { HiPencil, HiPlus, HiSearch, HiTrash } from "react-icons/hi"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import DeleteConfirmModal from "../AgencyManagement/DeleteConfirmModal"
import AddEditDriver from "./addEditDriver"
import { Driver, useDriverStore } from "../../store/driverStore"

const PAGE_SIZE = 10

const DriverManagementPage: FC = () => {
    const { drivers, loading, pagination, fetchDrivers, deleteDriver } = useDriverStore()
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState<"add" | "edit">("add")
    const [selectedDriver, setSelectedDriver] = useState<Driver | undefined>(undefined)

    useEffect(() => {
        fetchDrivers({
            page: currentPage,
            limit: PAGE_SIZE,
            search: searchTerm || undefined,
            status: statusFilter || undefined,
        })
    }, [fetchDrivers, currentPage, searchTerm, statusFilter])

    const totalPages = Math.max(1, pagination?.totalPages || 1)

    const handleAdd = () => {
        setModalMode("add")
        setSelectedDriver(undefined)
        setIsModalOpen(true)
    }

    const handleEdit = (driver: Driver) => {
        setModalMode("edit")
        setSelectedDriver(driver)
        setIsModalOpen(true)
    }

    const handleDeleteClick = (id: string) => {
        setSelectedId(id)
        setIsDeleteModalOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!selectedId) return
        try {
            await deleteDriver(selectedId)
            setIsDeleteModalOpen(false)
            setSelectedId(null)
        } catch (error) {
            // error handled in store
        }
    }

    const isExpiringSoon = (dateStr: string) => {
        const expiry = new Date(dateStr)
        const now = new Date()
        const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        return diffDays <= 30
    }

    return (
        <NavbarSidebarLayout>
            <div className="px-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Driver Management</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage driver details</p>
                </div>

                <Card>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">List of Drivers</h2>

                            <div className="flex flex-col md:flex-row gap-3 max-w-3xl">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <HiSearch className="h-5 w-5 text-gray-400" />
                                    </div>

                                    <TextInput
                                        type="search"
                                        placeholder="Search driver name, phone number, license number"
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

                        <Button color="warning" onClick={() => handleAdd()} className="bg-orange-500 hover:bg-orange-600">
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
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Phone Number</th>
                                        <th className="px-4 py-3">License Number</th>
                                        <th className="px-4 py-3">Date of Expiry</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-center">Action</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {drivers.length > 0 ? (
                                        drivers.map((driver, index) => (
                                            <tr key={driver.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{(currentPage - 1) * PAGE_SIZE + index + 1}</td>

                                                <td className="px-4 py-3 text-gray-900 dark:text-white">{driver.name}</td>

                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{driver.phoneNumber}</td>

                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{driver.licenseNumber}</td>

                                                <td className="px-4 py-3">
                                                    <span className={isExpiringSoon(driver.dateOfExpiry) ? "text-red-600 dark:text-red-400 font-medium" : "text-gray-700 dark:text-gray-300"}>
                                                        {new Date(driver.dateOfExpiry).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-3 inline-block">
                                                    <Badge color={driver.status === "Active" ? "success" : "failure"}>
                                                        {driver.status}
                                                    </Badge>
                                                </td>

                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button onClick={() => handleEdit(driver)} className="p-1.5 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400" title="Edit">
                                                            <HiPencil className="h-5 w-5" />
                                                        </button>

                                                        <button onClick={() => handleDeleteClick(driver.id)} className="p-1.5 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400" title="Delete">
                                                            <HiTrash className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                                No drivers found
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

            <AddEditDriver
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode={modalMode}
                driver={selectedDriver}
                onSuccess={async () => {
                    await fetchDrivers({
                        page: currentPage,
                        limit: PAGE_SIZE,
                        search: searchTerm || undefined,
                        status: statusFilter || undefined,
                    })
                    setIsModalOpen(false)
                }}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Driver"
                message="Are you sure you want to delete this driver? This action cannot be undone."
            />
        </NavbarSidebarLayout>
    )
}

export default DriverManagementPage