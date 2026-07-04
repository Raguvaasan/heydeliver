import { FC, useEffect, useMemo, useState } from "react"
import { Card, Button, Badge, TextInput, Spinner } from "flowbite-react"
import { HiSearch, HiPlus, HiEye, HiPencil, HiTrash } from "react-icons/hi"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { useCollectionAgencyStore } from "../../store/collectionAgencyStore"
import AddCollectionAgencyModal from "./AddCollectionAgencyModal"
import EditCollectionAgencyModal from "./EditCollectionAgencyModal"
import ViewCollectionAgencyModal from "./ViewCollectionAgencyModal"
import DeleteConfirmModal from "../AgencyManagement/DeleteConfirmModal"

const CollectionAgencyManagementPage: FC = () => {
  const { collectionAgencies, loading, fetchCollectionAgencies, setSelectedCollectionAgency, deleteCollectionAgency } = useCollectionAgencyStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    fetchCollectionAgencies(1, 10, searchTerm)
  }, [fetchCollectionAgencies, searchTerm])

  const handleView = (item: any) => {
    setSelectedCollectionAgency(item)
    setIsViewModalOpen(true)
  }
  const handleEdit = (item: any) => {
    setSelectedCollectionAgency(item)
    setIsEditModalOpen(true)
  }
  const handleDeleteClick = (id: string) => {
    setSelectedId(id)
    setIsDeleteModalOpen(true)
  }
  const handleDeleteConfirm = async () => {
    if (selectedId) {
      await deleteCollectionAgency(selectedId)
      setIsDeleteModalOpen(false)
      setSelectedId(null)
    }
  }

  const filtered = useMemo(
    () =>
      collectionAgencies.filter(
        (item) =>
          item.collectionAgencyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.phone?.includes(searchTerm) ||
          item.city?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [collectionAgencies, searchTerm]
  )

  return (
    <NavbarSidebarLayout>
      <div className="px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Collection Agency Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage collection agencies and their access details</p>
        </div>
        <Card>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">List of Collection Agencies</h2>
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <HiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <TextInput type="search" placeholder="Search collection agencies..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>
            <Button color="warning" onClick={() => setIsAddModalOpen(true)} className="bg-orange-500 hover:bg-orange-600">
              <HiPlus className="mr-2 h-5 w-5" /> ADD
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
                    <th className="px-4 py-3">Agency Name</th>
                    <th className="px-4 py-3">Owner</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">City</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filtered.length > 0 ? (
                    filtered.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{index + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.collectionAgencyName}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.ownerName}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.phone}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.city || "-"}</td>
                        <td className="px-4 py-3">
                          <Badge color={item.status === "Active" ? "success" : "failure"}>{item.status}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleView(item)} className="p-1.5 text-gray-600 hover:text-blue-600" title="View">
                              <HiEye className="h-5 w-5" />
                            </button>
                            <button onClick={() => handleEdit(item)} className="p-1.5 text-gray-600 hover:text-green-600" title="Edit">
                              <HiPencil className="h-5 w-5" />
                            </button>
                            <button onClick={() => handleDeleteClick(item.id)} className="p-1.5 text-gray-600 hover:text-red-600" title="Delete">
                              <HiTrash className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No collection agencies found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
      <AddCollectionAgencyModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <EditCollectionAgencyModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
      <ViewCollectionAgencyModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} />
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Collection Agency"
        message="Are you sure you want to delete this collection agency? This action cannot be undone."
      />
    </NavbarSidebarLayout>
  )
}

export default CollectionAgencyManagementPage
