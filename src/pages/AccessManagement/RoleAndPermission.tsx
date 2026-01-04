import { Button, Modal, Table, ToggleSwitch } from "flowbite-react"
import { FC, useEffect, useState } from "react"
import { AiOutlineEdit } from "react-icons/ai"
import { RiDeleteBin5Line } from "react-icons/ri"
import { useNavigate } from "react-router-dom"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { useRoleStore } from "../../store/roleAndPermission"
import { HiOutlineExclamationCircle } from "react-icons/hi"

const RoleAndPermissionPage: FC = () => {
  const { fetchRoles, deleteRole, updateRole, roles, loading, error } = useRoleStore()
  const navigate = useNavigate()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)

  useEffect(() => {
    fetchRoles()
  }, [])

  // Ensure roles is always an array
  const safeRoles = Array.isArray(roles) ? roles : []

  const handleStatusToggle = (id: string, status: boolean) => {
    // Optimistically update the local state
    useRoleStore.setState((state) => ({
      roles: state.roles.map((role) =>
        role._id === id ? { ...role, status } : role
      ),
    }))

    // Call API
    updateRole(id, { status })
  }

  const openDeleteModal = (id: string) => {
    setSelectedRoleId(id)
    setIsModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedRoleId) {
      deleteRole(selectedRoleId)
      setSelectedRoleId(null)
      setIsModalOpen(false)
    }
  }

  const handleCancelDelete = () => {
    setSelectedRoleId(null)
    setIsModalOpen(false)
  }

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="flex justify-between items-center border-b border-gray-200 p-4 dark:border-gray-700 dark:bg-gray-800">
        <h1 className="text-xl font-semibold dark:text-white">
          Role & Permissions
        </h1>
        <Button
          className="bg-[#272727]"
          onClick={() => navigate("/role/roleform")}
        >
          Add Role
        </Button>
      </div>

      {loading && (
        <div className="p-4 text-center">
          <p>Loading roles...</p>
        </div>
      )}

      {error && (
        <div className="p-4 text-center text-red-600">
          <p>Error: {error}</p>
        </div>
      )}

      {!loading && !error && (
        <Table className="mt-4 divide-y dark:divide-gray-700">
          <Table.Head className="bg-[#272727] text-white">
            <Table.HeadCell>Role</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>Action</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y dark:divide-gray-700 dark:bg-gray-800">
            {safeRoles.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={3} className="text-center">
                  No roles found
                </Table.Cell>
              </Table.Row>
            ) : (
              safeRoles.map((role) => (
            <Table.Row key={role._id}>
              <Table.Cell>{role.roleType}</Table.Cell>
              <Table.Cell>
                <ToggleSwitch
                  checked={role.status}
                  label=""
                  onChange={(checked) => handleStatusToggle(role._id, checked)}
                />
              </Table.Cell>
              <Table.Cell className="flex gap-3 items-center">
                <AiOutlineEdit
                  className="text-2xl cursor-pointer"
                  onClick={() => navigate(`/role/editrole/${role._id}`)}
                />
                <RiDeleteBin5Line
                  className="text-2xl text-red-600 cursor-pointer"
                  onClick={() => openDeleteModal(role._id)}
                />
              </Table.Cell>
              </Table.Row>
            ))
            )}
          </Table.Body>
        </Table>
      )}

      {/* Delete Confirmation Modal */}
      {/* <Modal show={isModalOpen} onClose={handleCancelDelete}>
        <Modal.Header>Delete Role</Modal.Header>
        <Modal.Body>
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete this role? This action cannot be
            undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button color="failure" onClick={handleConfirmDelete}>
            Yes, Delete
          </Button>
          <Button color="gray" onClick={handleCancelDelete}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal> */}

      <Modal show={isModalOpen} onClose={handleCancelDelete} size="md">
        <Modal.Header className="px-3 pt-3 pb-0">
          <span className="sr-only">block</span>
        </Modal.Header>
        <Modal.Body className="px-6 pb-6 pt-0">
          <div className="flex flex-col items-center gap-y-6 text-center">
            <HiOutlineExclamationCircle className="text-7xl text-red-600" />
            <p className="text-lg text-gray-500 dark:text-gray-300">
              Are you sure you want to delete this reward?
            </p>
            <div className="flex items-center gap-x-3">
              <Button color="gray" onClick={handleCancelDelete}>
                No, cancel
              </Button>
              <Button color="failure" onClick={handleConfirmDelete}>
                Yes, I'm sure
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </NavbarSidebarLayout>
  )
}

export default RoleAndPermissionPage
