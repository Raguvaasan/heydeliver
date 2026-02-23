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
import { HiOutlineExclamationCircle, HiEye, HiPencil, HiTrash, HiEyeOff } from "react-icons/hi"
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
  const [activeTab, setActiveTab] = useState<"headquarters" | "franchise">("headquarters")

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

  const filteredStaffs = staffs.filter((staff) => {
    const matchesSearch = staff.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.phone?.includes(searchTerm)
    
    // Filter by tab - headquarters staff have roles, franchise staff have franchiseId
    const matchesTab = activeTab === "headquarters" 
      ? staff.role && !staff.franchiseId  // HQ staff have roles but no franchise
      : staff.franchiseId  // Franchise staff have franchiseId
    
    return matchesSearch && matchesTab
  })

  // Helper function to get role name
  const getRoleName = (staff: any) => {
    if (!staff.role) return "-"
    
    // If role is an object with _id, find matching role from roles array
    if (typeof staff.role === 'object' && staff.role._id) {
      const matchedRole = roles.find(r => r._id === staff.role._id)
      return matchedRole?.roleType || "-"
    }
    
    // If role is just an ID string, find from roles array
    if (typeof staff.role === 'string') {
      const matchedRole = roles.find(r => r._id === staff.role)
      return matchedRole?.roleType || "-"
    }
    
    // Fallback to role properties
    return staff.role.roleName || staff.role.roleType || staff.role.name || "-"
  }

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

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab("headquarters")}
                className={`pb-3 px-1 font-medium transition-colors ${
                  activeTab === "headquarters"
                    ? "text-orange-500 border-b-2 border-orange-500"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                Head Quarters
              </button>
              <button
                onClick={() => setActiveTab("franchise")}
                className={`pb-3 px-1 font-medium transition-colors ${
                  activeTab === "franchise"
                    ? "text-orange-500 border-b-2 border-orange-500"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                Franchise
              </button>
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
                    <th className="px-4 py-3">NAME</th>
                    <th className="px-4 py-3">EMAIL</th>
                    <th className="px-4 py-3">PHONE</th>
                    {activeTab === "headquarters" ? (
                      <th className="px-4 py-3">ROLE</th>
                    ) : (
                      <th className="px-4 py-3">FRANCHISE</th>
                    )}
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
                          {activeTab === "headquarters" 
                            ? getRoleName(staff)
                            : (typeof staff.franchiseId === 'object' ? (staff.franchiseId as any)?.agencyName : staff.franchise) || "-"
                          }
                        </td>
                        <td className="px-4 py-3">
                          <Badge className="inline-flex w-fit" color={staff.status === "Active" ? "success" : "failure"}>
                            {staff.status === "Active" ? "Active" : "Inactive"}
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
    type: "head_quarter",
    roleId: "",
    franchiseId: "",
    username: "",
    password: "",
    status: "Active",
  })
  const [showPasswordAdd, setShowPasswordAdd] = useState(false)
  const [modalTab, setModalTab] = useState<"headquarters" | "franchise">("headquarters")

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    const { name, email, phone, roleId, franchiseId, username, password, type } = formData

    // Validate based on staff type
    if (!name || !email || !phone || !username || !password) {
      toast.error("All required fields must be filled")
      return
    }

    if (type === "head_quarter" && !roleId) {
      toast.error("Role is required for headquarters staff")
      return
    }

    if (type === "franchise" && !franchiseId) {
      toast.error("Franchise is required for franchise staff")
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
        type: "head_quarter",
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
      <Modal.Body className="max-h-[calc(100vh-12rem)] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#64748b_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-500/70 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400/80">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-8">
            <button
              onClick={() => {
                setModalTab("headquarters")
                setFormData((prev) => ({ ...prev, type: "head_quarter", franchiseId: "" }))
              }}
              className={`pb-3 px-1 font-medium transition-colors ${
                modalTab === "headquarters"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Head Quarters
            </button>
            <button
              onClick={() => {
                setModalTab("franchise")
                setFormData((prev) => ({ ...prev, type: "franchise", roleId: "" }))
              }}
              className={`pb-3 px-1 font-medium transition-colors ${
                modalTab === "franchise"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Franchise
            </button>
          </div>
        </div>
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
              {modalTab === "headquarters" ? (
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
              ) : (
                <div>
                  <Label htmlFor="franchiseId">
                    Franchise<span className="text-red-500">*</span>
                  </Label>
                  <Select
                    id="franchiseId"
                    name="franchiseId"
                    value={formData.franchiseId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Franchise</option>
                    {agencies.map((agency) => (
                      <option key={agency.id} value={agency.id}>
                        {agency.agencyName}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
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
                <div className="relative">
                  <TextInput
                    id="password"
                    name="password"
                    type={showPasswordAdd ? "text" : "password"}
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="[&_input]:pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordAdd(!showPasswordAdd)}
                    className="absolute inset-y-0 right-0 z-10 flex items-center pr-3 text-gray-500 focus:outline-none"
                    aria-label={showPasswordAdd ? "Hide password" : "Show password"}
                  >
                    {!showPasswordAdd ? (
                      <HiEyeOff className="h-5 w-5" />
                    ) : (
                      <HiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
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
    type: "head_quarter",
    roleId: "",
    franchiseId: "",
    username: "",
    password: "",
    status: "Active",
  })
  const [showPasswordEdit, setShowPasswordEdit] = useState(false)
  const [modalTab, setModalTab] = useState<"headquarters" | "franchise">("headquarters")

  useEffect(() => {
    if (userData) {
      // Determine type based on whether staff has franchiseId or roleId
      const staffType = userData.franchiseId ? "franchise" : "head_quarter"
      const tab = userData.franchiseId ? "franchise" : "headquarters"
      
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        type: staffType,
        roleId: userData.role?._id || userData.roleId || "",
        franchiseId: userData.franchiseId || userData.franchise || "",
        username: userData.username || userData.email || "",
        password: "",
        status: userData.status === "Active" || userData.status === true ? "Active" : "Inactive",
      })
      setModalTab(tab)
    }
  }, [userData])

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    const { name, email, phone, roleId, franchiseId, username, type } = formData

    // Validate based on staff type
    if (!name || !email || !phone || !username) {
      toast.error("All fields except password are required")
      return
    }

    if (type === "head_quarter" && !roleId) {
      toast.error("Role is required for headquarters staff")
      return
    }

    if (type === "franchise" && !franchiseId) {
      toast.error("Franchise is required for franchise staff")
      return
    }

    const payload: any = { 
      name, 
      email, 
      phone, 
      type,
      username, 
      status: formData.status 
    }

    // Include roleId only for headquarters staff
    if (type === "head_quarter" && roleId) {
      payload.roleId = roleId
    }

    // Include franchiseId only for franchise staff
    if (type === "franchise" && franchiseId) {
      payload.franchiseId = franchiseId
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
      <Modal.Body className="max-h-[calc(100vh-12rem)] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#64748b_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-500/70 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400/80">
        {/* Tabs - Only show the tab for the staff type */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-8">
            {formData.type === "head_quarter" && (
              <button
                onClick={() => {
                  setModalTab("headquarters")
                  setFormData((prev) => ({ ...prev, type: "head_quarter", franchiseId: "" }))
                }}
                className="pb-3 px-1 font-medium text-orange-500 border-b-2 border-orange-500"
              >
                Head Quarters
              </button>
            )}
            {formData.type === "franchise" && (
              <button
                onClick={() => {
                  setModalTab("franchise")
                  setFormData((prev) => ({ ...prev, type: "franchise", roleId: "" }))
                }}
                className="pb-3 px-1 font-medium text-orange-500 border-b-2 border-orange-500"
              >
                Franchise
              </button>
            )}
          </div>
        </div>
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
              {modalTab === "headquarters" ? (
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
              ) : (
                <div>
                  <Label htmlFor="edit-franchiseId-main">
                    Franchise<span className="text-red-500">*</span>
                  </Label>
                  <Select
                    id="edit-franchiseId-main"
                    name="franchiseId"
                    value={formData.franchiseId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Franchise</option>
                    {agencies.map((agency) => (
                      <option key={agency.id} value={agency.id}>
                        {agency.agencyName}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
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
                <div className="relative">
                  <TextInput
                    id="edit-password"
                    name="password"
                    type={showPasswordEdit ? "text" : "password"}
                    placeholder="Leave blank to keep unchanged"
                    value={formData.password}
                    onChange={handleChange}
                    className="[&_input]:pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordEdit(!showPasswordEdit)}
                    className="absolute inset-y-0 right-0 z-10 flex items-center pr-3 text-gray-500 focus:outline-none"
                    aria-label={showPasswordEdit ? "Hide password" : "Show password"}
                  >
                    {!showPasswordEdit ? (
                      <HiEyeOff className="h-5 w-5" />
                    ) : (
                      <HiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
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
