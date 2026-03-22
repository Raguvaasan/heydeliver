import { FC, useEffect, useState } from "react"
import { Card, Button, Badge, TextInput, Spinner } from "flowbite-react"
import { HiSearch, HiPlus, HiEye, HiPencil, HiTrash } from "react-icons/hi"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { useHubStore } from "../../store/hubStore"
import AddHubModal from "./AddHubModal"
import EditHubModal from "./EditHubModal"
import ViewHubModal from "./ViewHubModal"
import DeleteConfirmModal from "../AgencyManagement/DeleteConfirmModal"

const HubManagementPage: FC = () => {
  const { hubs, loading, fetchHubs, setSelectedHub, deleteHub } = useHubStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    fetchHubs()
  }, [fetchHubs])

  const handleView = (hub: any) => {
    setSelectedHub(hub)
    setIsViewModalOpen(true)
  }

  const handleEdit = (hub: any) => {
    setSelectedHub(hub)
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setSelectedId(id)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (selectedId) {
      try {
        await deleteHub(selectedId)
        setIsDeleteModalOpen(false)
        setSelectedId(null)
      } catch (error) {
        // Error handled by store
      }
    }
  }

  const filteredHubs = hubs.filter((hub) =>
    hub.hubName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hub.hubManagerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hub.phoneNo?.includes(searchTerm) ||
    hub.city?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <NavbarSidebarLayout>
      <div className="px-4">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Hub Management
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage all hubs and their information
          </p>
        </div>

        {/* Main Card */}
        <Card>
          {/* Header Section with Search and Add Button */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                List of Hubs
              </h2>
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <HiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <TextInput
                  type="search"
                  placeholder="Search hubs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Button
                color="warning"
                onClick={() => setIsAddModalOpen(true)}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <HiPlus className="mr-2 h-5 w-5" />
                ADD
              </Button>
            </div>
          </div>

          {/* Table */}
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
                    <th className="px-4 py-3">Hub Name</th>
                    <th className="px-4 py-3">Hub Manager</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredHubs.length > 0 ? (
                    filteredHubs.map((hub, index) => (
                      <tr
                        key={hub.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {hub.hubName}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {hub.hubManagerName}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {hub.phoneNo}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            color={
                              hub.status ? "success" : "failure"
                            }
                          >
                            {hub.status ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleView(hub)}
                              className="p-1.5 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                              title="View"
                            >
                              <HiEye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleEdit(hub)}
                              className="p-1.5 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
                              title="Edit"
                            >
                              <HiPencil className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(hub.id)}
                              className="p-1.5 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                              title="Delete"
                            >
                              <HiTrash className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        No hubs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      {/* Modals */}
      <AddHubModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      <EditHubModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
      <ViewHubModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      />
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Hub"
        message="Are you sure you want to delete this hub? This action cannot be undone."
      />
    </NavbarSidebarLayout>
  )
}

export default HubManagementPage
