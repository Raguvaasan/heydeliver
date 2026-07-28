import { FC, useEffect, useMemo, useState } from "react"
import { Badge, Button, Card, Select, Spinner, TextInput } from "flowbite-react"
import { HiEye, HiPencil, HiPlus, HiSearch, HiTrash } from "react-icons/hi"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { useRouteStore } from "../../store/routeStore"
import AddRouteModal from "./AddRouteModal"
import EditRouteModal from "./EditRouteModal"
import ViewRouteModal from "./ViewRouteModal"
import DeleteConfirmModal from "../AgencyManagement/DeleteConfirmModal"

const PAGE_SIZE = 10

const RouteManagementPage: FC = () => {
  const { routes, loading, pagination, fetchRoutes, setSelectedRoute, deleteRoute, updateRouteStatus } = useRouteStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    fetchRoutes({ page: currentPage, limit: PAGE_SIZE, search: searchTerm || undefined, status: statusFilter || undefined })
  }, [fetchRoutes, currentPage, searchTerm, statusFilter])

  const handleView = (route: any) => {
    setSelectedRoute(route)
    setIsViewModalOpen(true)
  }

  const handleEdit = (route: any) => {
    setSelectedRoute(route)
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setSelectedId(id)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedId) return
    await deleteRoute(selectedId)
    setIsDeleteModalOpen(false)
    setSelectedId(null)
  }

  const totalPages = pagination?.totalPages || 1
  const paginatedRoutes = useMemo(() => routes, [routes])

  return (
    <NavbarSidebarLayout>
      <div className="px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Route Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage routes between cities and branches</p>
        </div>

        <Card>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">List of Routes</h2>
              <div className="flex flex-col md:flex-row gap-3 max-w-3xl">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <HiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <TextInput type="search" placeholder="Search routes..." value={searchTerm} onChange={(e) => { setCurrentPage(1); setSearchTerm(e.target.value) }} className="pl-10" />
                </div>
                <Select value={statusFilter} onChange={(e) => { setCurrentPage(1); setStatusFilter(e.target.value) }} className="md:w-48">
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Select>
              </div>
            </div>
            <Button color="warning" onClick={() => setIsAddModalOpen(true)} className="bg-orange-500 hover:bg-orange-600">
              <HiPlus className="mr-2 h-5 w-5" />
              ADD
            </Button>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-8"><Spinner size="xl" /></div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-800 text-white text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 w-16">S.No</th>
                    <th className="px-4 py-3">From</th>
                    <th className="px-4 py-3">To</th>
                    <th className="px-4 py-3">Branches</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedRoutes.length > 0 ? paginatedRoutes.map((route, index) => (
                    <tr key={route.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white">{route.from}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{route.to}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{route.branches?.length ? route.branches.join(", ") : "-"}</td>
                      <td className="px-4 py-3 inline-block">
                        <Badge color={route.status === "Active" ? "success" : "failure"}>{route.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleView(route)} className="p-1.5 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400" title="View">
                            <HiEye className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleEdit(route)} className="p-1.5 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400" title="Edit">
                            <HiPencil className="h-5 w-5" />
                          </button>
                          
                          <button onClick={() => handleDeleteClick(route.id)} className="p-1.5 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400" title="Delete">
                            <HiTrash className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No routes found</td>
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
              <Button size="sm" color="gray" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1 || loading}>Previous</Button>
              <Button size="sm" color="gray" onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage >= totalPages || loading}>Next</Button>
            </div>
          </div>
        </Card>
      </div>

      <AddRouteModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <EditRouteModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
      <ViewRouteModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} />
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Route"
        message="Are you sure you want to delete this route? This action cannot be undone."
      />
    </NavbarSidebarLayout>
  )
}

export default RouteManagementPage
