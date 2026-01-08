import {
  Button,
  Label,
  Modal,
  TextInput,
  Select,
  Badge,
  Card,
  Spinner,
} from "flowbite-react"
import { ChangeEvent, FC, useEffect, useState } from "react"
import { HiOutlineExclamationCircle, HiEye, HiPencil, HiTrash } from "react-icons/hi"
import { useStaffStore } from "../../store/staffStore"
import { useAgencyStore } from "../../store/agencyStore"
import { useNavigate, useLocation } from "react-router-dom"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { toast, ToastContainer } from "react-toastify"

const UserPage: FC = function () {
  const {
    staffs,
    roles,
    fetchStaffs,
    fetchRoles,
    addStaff,
    updateStaff,
    deleteStaff,
    loading,
    error,
  } = useStaffStore()

  const { agencies, fetchAgencies } = useAgencyStore()

  const navigate = useNavigate()
  const location = useLocation()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchStaffs()
    fetchRoles()
    fetchAgencies()
  }, [fetchStaffs, fetchRoles, fetchAgencies])

  // Check if we need to open edit modal from navigation state
  useEffect(() => {
    if (location.state?.editStaffId) {
      const staffToEdit = staffs.find(s => s._id === location.state.editStaffId)
      if (staffToEdit) {
        handleEdit(staffToEdit)
      }
      // Clear the state
      window.history.replaceState({}, document.title)
    }
  }, [location.state, staffs])

  const handleView = (staff: any) => {
    navigate(`/staff/${staff._id}`)
  }

  const handleEdit = (staff: any) => {
    setSelectedUser(staff)
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (staff: any) => {
    setSelectedUser(staff)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (selectedUser?._id) {
      try {
        await deleteStaff(selectedUser._id)
        toast.success("Staff deleted successfully")
        setIsDeleteModalOpen(false)
        setSelectedUser(null)
      } catch (error: any) {
        toast.error(error.message || "Failed to delete staff")
      }
    }
  }

  const filteredStaffs = staffs.filter((staff) =>
    staff.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.phone?.includes(searchTerm)
  )

  return (
    <NavbarSidebarLayout isFooter={false}>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      
      <div className="px-4 pt-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Management
          </h1>
        </div>

        {/* Main Card */}
        <Card>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Manage Staffs
            </h2>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              ADD STAFF
            </Button>
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
                    <th className="px-4 py-3">NAME</th>
                    <th className="px-4 py-3">EMAIL</th>
                    <th className="px-4 py-3">PHONE</th>
                    <th className="px-4 py-3">ROLE</th>
                    <th className="px-4 py-3">STATUS</th>
                    <th className="px-4 py-3 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredStaffs.length > 0 ? (
                    filteredStaffs.map((staff, index) => (
                      <tr
                        key={staff._id}
                        className={`${
                          index === 0
                            ? "bg-orange-50 dark:bg-orange-900/20"
                            : "hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <span
                            className={`font-medium ${
                              index === 0
                                ? "text-orange-600"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            {staff.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {staff.email}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {staff.phone}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {staff.role?.roleType || "-"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge color={staff.status === "Active" || staff.status === true ? "success" : "failure"}>
                            {staff.status === "Active" || staff.status === true ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleView(staff)}
                              className="p-1.5 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                              title="View"
                            >
                              <HiEye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleEdit(staff)}
                              className="p-1.5 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
                              title="Edit"
                            >
                              <HiPencil className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(staff)}
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
                        No staff members found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      {/* Add Staff Modal */}
      <AddStaffModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={addStaff}
        roles={roles}
        agencies={agencies}
      />

      {/* Edit Staff Modal */}
      <EditStaffModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={async (data) => {
          if (selectedUser?._id) {
            return updateStaff(selectedUser._id, data)
          }
        }}
        userData={selectedUser}
        roles={roles}
        agencies={agencies}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </NavbarSidebarLayout>
  )
}

// Add Staff Modal Component
const AddStaffModal: FC<{
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  roles: any[]
  agencies: any[]
}> = ({ isOpen, onClose, onSubmit, roles, agencies }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    roleId: "",
    franchiseId: "",
    username: "",
    password: "",
    status: "Active",
  })

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    const { name, email, phone, roleId, username, password } = formData

    if (!name || !email || !phone || !roleId || !username || !password) {
      toast.error("All required fields must be filled")
      return
    }

    try {
      await onSubmit(formData)
      toast.success("Staff added successfully")
      onClose()
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        roleId: "",
        franchiseId: "",
        username: "",
        password: "",
        status: "Active",
      })
    } catch (error: any) {
      toast.error(error.message || "Failed to add staff")
    }
  }

  return (
    <Modal show={isOpen} size="2xl" onClose={onClose}>
      <Modal.Header>Add Staff</Modal.Header>
      <Modal.Body>
        <div className="space-y-6">
          {/* Basic Details */}
          <div>
            <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
              Basic Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">
                  Name<span className="text-red-500">*</span>
                </Label>
                <TextInput
                  id="name"
                  name="name"
                  placeholder="Enter name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">
                  Email<span className="text-red-500">*</span>
                </Label>
                <TextInput
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">
                  Phone Number<span className="text-red-500">*</span>
                </Label>
                <TextInput
                  id="phone"
                  name="phone"
                  placeholder="Enter mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="roleId">
                  Role<span className="text-red-500">*</span>
                </Label>
                <Select
                  id="roleId"
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role._id} value={role._id}>
                      {role.roleType}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="status">
                  Status<span className="text-red-500">*</span>
                </Label>
                <Select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Work Details */}
          <div>
            <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
              Work Details
            </h3>
            <div>
              <Label htmlFor="franchiseId">
                Franchise<span className="text-red-500">*</span>
              </Label>
              <Select
                id="franchiseId"
                name="franchiseId"
                value={formData.franchiseId}
                onChange={handleChange}
              >
                <option value="">Select the Franchise</option>
                {agencies.map((agency) => (
                  <option key={agency.id} value={agency.id}>
                    {agency.agencyName}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Login Credentials */}
          <div>
            <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
              Login Credentials
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">
                  Username<span className="text-red-500">*</span>
                </Label>
                <TextInput
                  id="username"
                  name="username"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">
                  Set Password<span className="text-red-500">*</span>
                </Label>
                <TextInput
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button color="gray" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600">
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

// Edit Staff Modal Component
const EditStaffModal: FC<{
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  userData: any
  roles: any[]
  agencies: any[]
}> = ({ isOpen, onClose, onSubmit, userData, roles, agencies }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    roleId: "",
    franchiseId: "",
    username: "",
    password: "",
    status: "Active",
  })

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        roleId: userData.role?._id || userData.roleId || "",
        franchiseId: userData.franchiseId || userData.franchise || "",
        username: userData.username || userData.email || "",
        password: "",
        status: userData.status === "Active" || userData.status === true ? "Active" : "Inactive",
      })
    }
  }, [userData])

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    const { name, email, phone, roleId, username } = formData

    if (!name || !email || !phone || !roleId || !username) {
      toast.error("All fields except password are required")
      return
    }

    const payload: any = { 
      name, 
      email, 
      phone, 
      roleId, 
      username, 
      franchiseId: formData.franchiseId,
      status: formData.status 
    }
    if (formData.password) {
      payload.password = formData.password
    }

    try {
      await onSubmit(payload)
      toast.success("Staff updated successfully")
      onClose()
    } catch (error: any) {
      toast.error(error.message || "Failed to update staff")
    }
  }

  return (
    <Modal show={isOpen} size="2xl" onClose={onClose}>
      <Modal.Header>Edit Staff</Modal.Header>
      <Modal.Body>
        <div className="space-y-6">
          {/* Basic Details */}
          <div>
            <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
              Basic Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">
                  Name<span className="text-red-500">*</span>
                </Label>
                <TextInput
                  id="edit-name"
                  name="name"
                  placeholder="Enter name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-email">
                  Email<span className="text-red-500">*</span>
                </Label>
                <TextInput
                  id="edit-email"
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">
                  Phone Number<span className="text-red-500">*</span>
                </Label>
                <TextInput
                  id="edit-phone"
                  name="phone"
                  placeholder="Enter mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-roleId">
                  Role<span className="text-red-500">*</span>
                </Label>
                <Select
                  id="edit-roleId"
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role._id} value={role._id}>
                      {role.roleType}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="edit-status">
                  Status<span className="text-red-500">*</span>
                </Label>
                <Select
                  id="edit-status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Work Details */}
          <div>
            <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
              Work Details
            </h3>
            <div>
              <Label htmlFor="edit-franchiseId">
                Franchise<span className="text-red-500">*</span>
              </Label>
              <Select
                id="edit-franchiseId"
                name="franchiseId"
                value={formData.franchiseId}
                onChange={handleChange}
              >
                <option value="">Select the Franchise</option>
                {agencies.map((agency) => (
                  <option key={agency.id} value={agency.id}>
                    {agency.agencyName}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Login Credentials */}
          <div>
            <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
              Login Credentials
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-username">
                  Username<span className="text-red-500">*</span>
                </Label>
                <TextInput
                  id="edit-username"
                  name="username"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-password">Set Password (optional)</Label>
                <TextInput
                  id="edit-password"
                  name="password"
                  type="password"
                  placeholder="Leave blank to keep unchanged"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button color="gray" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600">
          Update
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

// Delete Confirmation Modal
const DeleteConfirmModal: FC<{
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}> = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal onClose={onClose} show={isOpen} size="md">
      <Modal.Header className="px-3 pt-3 pb-0" />
      <Modal.Body className="px-6 pb-6 pt-0">
        <div className="flex flex-col items-center gap-y-6 text-center">
          <HiOutlineExclamationCircle className="text-7xl text-red-600" />
          <p className="text-lg text-gray-500 dark:text-gray-300">
            Are you sure you want to delete this staff member?
          </p>
          <div className="flex items-center gap-x-3">
            <Button color="gray" onClick={onClose}>
              No, cancel
            </Button>
            <Button color="failure" onClick={onConfirm}>
              Yes, I'm sure
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
}
export default UserPage
