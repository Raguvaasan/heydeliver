import { Button, Card, Badge, TextInput, Spinner, Modal } from "flowbite-react"
import { FC, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { useRoleStore } from "../../store/roleAndPermission"
import { HiSearch, HiPlus, HiEye, HiPencil, HiTrash, HiExclamation } from "react-icons/hi"
import toast from "react-hot-toast"

const FranchiseRolePage: FC = () => {
  const navigate = useNavigate()
  const { roles, loading, fetchRoles, deleteRole } = useRoleStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<any>(null)
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  const handleView = (role: any) => {
    setSelectedRole(role)
    setIsViewModalOpen(true)
  }

  const handleEdit = (roleId: string) => {
    navigate(`/franchise-role/editrole/${roleId}`)
  }

  const handleDeleteClick = (roleId: string) => {
    setSelectedRoleId(roleId)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (selectedRoleId) {
      try {
        await deleteRole(selectedRoleId)
        toast.success("Role deleted successfully!")
        setIsDeleteModalOpen(false)
        setSelectedRoleId(null)
      } catch (error) {
        toast.error("Failed to delete role")
      }
    }
  }

  const filteredRoles = roles.filter((role) =>
    role.roleName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4 pt-6 pb-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Staff Management
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage roles and their permissions
          </p>
        </div>

        {/* Main Card */}
        <Card>
          {/* Header Section with Search and Add Button */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Role & Permission
              </h2>
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <HiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <TextInput
                  type="search"
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Button
                color="warning"
                onClick={() => navigate("/franchise-role/roleform")}
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
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-white uppercase bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      S.NO
                    </th>
                    <th scope="col" className="px-6 py-3">
                      ROLE NAME
                    </th>
                    <th scope="col" className="px-6 py-3">
                      STATUS
                    </th>
                    <th scope="col" className="px-6 py-3 text-right">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoles.length > 0 ? (
                    filteredRoles.map((role, index) => (
                      <tr
                        key={role._id}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                          {role.roleName}
                        </td>
                        <td className="px-6 py-4">
                          <Badge color={role.status ? "success" : "failure"} className="inline-flex">
                            {role.status ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleView(role)}
                              className="font-medium text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                              title="View"
                            >
                              <HiEye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleEdit(role._id)}
                              className="font-medium text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 transition-colors"
                              title="Edit"
                            >
                              <HiPencil className="h-5 w-5" />
                            </button>
                            {!role.isRoot && (
                              <button
                                onClick={() => handleDeleteClick(role._id)}
                                className="font-medium text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                                title="Delete"
                              >
                                <HiTrash className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        No roles found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </Card>

        {/* View Modal */}
        <Modal show={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} size="xl">
          <Modal.Header>Role Details</Modal.Header>
          <Modal.Body>
            {selectedRole && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role Name
                  </label>
                  <p className="text-gray-900 font-semibold">{selectedRole.roleName}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <Badge color={selectedRole.status ? "success" : "failure"}>
                    {selectedRole.status ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Permissions
                  </label>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-gray-300">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left border-b">Module</th>
                          <th className="px-4 py-2 text-center border-b">Read</th>
                          <th className="px-4 py-2 text-center border-b">Write</th>
                          <th className="px-4 py-2 text-center border-b">Update</th>
                          <th className="px-4 py-2 text-center border-b">Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRole.permissions?.map((perm: any, idx: number) => (
                          <tr key={idx} className="border-b">
                            <td className="px-4 py-2 capitalize">{perm.module}</td>
                            <td className="px-4 py-2 text-center">
                              {perm.read ? "✓" : "✗"}
                            </td>
                            <td className="px-4 py-2 text-center">
                              {perm.write ? "✓" : "✗"}
                            </td>
                            <td className="px-4 py-2 text-center">
                              {perm.update ? "✓" : "✗"}
                            </td>
                            <td className="px-4 py-2 text-center">
                              {perm.delete ? "✓" : "✗"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button color="gray" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          show={isDeleteModalOpen}
          size="md"
          onClose={() => setIsDeleteModalOpen(false)}
          popup
        >
          <Modal.Header />
          <Modal.Body>
            <div className="text-center">
              <HiExclamation className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
              <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                Are you sure you want to delete this role?
              </h3>
              <div className="flex justify-center gap-4">
                <Button color="failure" onClick={handleDeleteConfirm}>
                  Yes, I'm sure
                </Button>
                <Button color="gray" onClick={() => setIsDeleteModalOpen(false)}>
                  No, cancel
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </NavbarSidebarLayout>
  )
}

export default FranchiseRolePage
