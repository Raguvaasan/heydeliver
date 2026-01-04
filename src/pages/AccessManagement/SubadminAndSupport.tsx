import {
  Button,
  Label,
  Modal,
  Table,
  TextInput,
  ToggleSwitch,
  Select,
} from "flowbite-react"
import { FaKey, FaRegCopy } from "react-icons/fa"
import { ChangeEvent, FC, useEffect, useState } from "react"
import { RiDeleteBin5Line } from "react-icons/ri"
import { HiOutlineExclamationCircle } from "react-icons/hi"
import { AiOutlineEdit } from "react-icons/ai"
import { useStaffStore } from "../../store/staffStore"
import { Link } from "react-router-dom"
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
    error,
  } = useStaffStore()

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  useEffect(() => {
    fetchStaffs()
    fetchRoles()
  }, [fetchStaffs, fetchRoles])

  const handleEditClick = (staff: any) => {
    setSelectedUser(staff)
    setIsEditModalOpen(true)
  }

  useEffect(() => {
    console.log({ error })

    if (error) {
      toast.error(error)
    }
  }, [error])

  return (
    <NavbarSidebarLayout isFooter={false}>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      <div className="flex items-center justify-between border-b border-gray-200 bg-trans_bg p-4 dark:border-gray-700 dark:bg-gray-800">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
          SubAdmin & Support
        </h1>
        <Button
          className="bg-[#272727]"
          onClick={() => setIsAddModalOpen(true)}
        >
          Add User
        </Button>
      </div>

      <UserListTable
        staffs={staffs}
        onEdit={handleEditClick}
        onDelete={deleteStaff}
        onStatusToggle={updateStaff}
      />

      {/* Add User Modal */}
      <UserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        isEdit={false}
        onSubmit={(data) => addStaff(data)}
        roles={roles}
      />

      {/* Edit User Modal */}
      <UserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        isEdit={true}
        userData={selectedUser}
        onSubmit={(data) => {
          if (selectedUser?._id) {
            updateStaff(selectedUser._id, data)
          }
        }}
        roles={roles}
      />
    </NavbarSidebarLayout>
  )
}

const UserListTable: FC<{
  staffs: any[]
  onEdit: (user: any) => void
  onDelete: (id: string) => void
  onStatusToggle: (id: string, user: Partial<any>) => void
}> = ({ staffs, onEdit, onDelete, onStatusToggle }) => {
  return (
    <Table className="divide-y divide-gray-200 dark:divide-gray-600">
      <Table.Head className="bg-[#272727] text-white">
        <Table.HeadCell>Name</Table.HeadCell>
        <Table.HeadCell>Email</Table.HeadCell>
        <Table.HeadCell>Mobile</Table.HeadCell>
        <Table.HeadCell>Role</Table.HeadCell>
        <Table.HeadCell>Status</Table.HeadCell>
        <Table.HeadCell>Action</Table.HeadCell>
      </Table.Head>
      <Table.Body className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
        {staffs.map((user) => (
          <Table.Row key={user._id}>
            <Table.Cell>
              <Link
                to={`/staff/${user._id}`}
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                {user.name}
              </Link>
            </Table.Cell>
            <Table.Cell>{user.email}</Table.Cell>
            <Table.Cell>{user.mobile}</Table.Cell>
            <Table.Cell>{user.role?.roleType}</Table.Cell>
            <Table.Cell>
              <ToggleSwitch
                checked={user.status}
                label=""
                onChange={(checked) =>
                  onStatusToggle(user._id, { status: checked })
                }
              />
            </Table.Cell>
            <Table.Cell className="flex gap-3">
              <AiOutlineEdit
                className="text-2xl cursor-pointer"
                onClick={() => onEdit(user)}
              />
              <DeleteUserModal userId={user._id} onDelete={onDelete} />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

const generatePassword = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let password = ""
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

const UserModal: FC<{
  isOpen: boolean
  onClose: () => void
  isEdit: boolean
  userData?: any
  onSubmit: (data: any) => void
  roles: any[]
}> = ({ isOpen, onClose, isEdit, userData, onSubmit, roles }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    roleId: "",
    password: "",
  })

  useEffect(() => {
    if (isEdit && userData) {
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        mobile: userData.mobile || "",
        roleId: userData.role?._id || "",
        password: "",
      })
    } else {
      setFormData({
        name: "",
        email: "",
        mobile: "",
        roleId: "",
        password: "",
      })
    }
  }, [isEdit, userData])

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleGeneratePassword = () => {
    const newPassword = generatePassword()
    setFormData((prev) => ({ ...prev, password: newPassword }))
  }

  const handleSubmit = () => {
    const { name, email, mobile, roleId, password } = formData

    if (!name || !email || !mobile || !roleId) {
      alert("All fields except password are required.")
      return
    }

    if (
      (!isEdit && password.length < 8) ||
      (isEdit && password && password.length < 8)
    ) {
      alert("Password must be at least 8 characters.")
      return
    }

    const payload: any = { name, email, mobile, roleId }
    if (!isEdit || (isEdit && password)) {
      payload.password = password
    }

    onSubmit(payload)
    onClose()
  }

  return (
    <Modal show={isOpen} size="lg" onClose={onClose}>
      <Modal.Header>{isEdit ? "Edit User" : "Add User"}</Modal.Header>
      <Modal.Body>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Name</Label>
            <TextInput
              name="name"
              placeholder="Enter name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label>Email</Label>
            <TextInput
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label>Mobile</Label>
            <TextInput
              name="mobile"
              placeholder="Enter mobile number"
              value={formData.mobile}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label>Role</Label>
            <Select
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

          {/* Password field */}
          <div className="sm:col-span-2">
            <Label>
              Password {isEdit && "(leave blank to keep unchanged)"}
            </Label>
            <div className="flex gap-2 items-center">
              <TextInput
                name="password"
                placeholder="Enter 8 character password"
                value={formData.password}
                onChange={handleChange}
                minLength={8}
                required={!isEdit}
              />
              <Button size="sm" onClick={handleGeneratePassword}>
                <FaKey />
              </Button>
              {formData.password && (
                <Button
                  size="sm"
                  onClick={() =>
                    navigator.clipboard.writeText(formData.password)
                  }
                  color="gray"
                >
                  <FaRegCopy />
                </Button>
              )}
            </div>
            {formData.password && formData.password.length < 8 && (
              <p className="text-red-600 text-sm mt-1">
                Password must be at least 8 characters.
              </p>
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button color="gray" onClick={onClose}>
          Cancel
        </Button>
        <Button className="bg-[#272727]" onClick={handleSubmit}>
          {isEdit ? "Update" : "Submit"}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

const DeleteUserModal: FC<{
  userId: string
  onDelete: (id: string) => void
}> = ({ userId, onDelete }) => {
  const [isOpen, setOpen] = useState(false)

  const handleDelete = () => {
    onDelete(userId)
    setOpen(false)
  }

  return (
    <>
      <RiDeleteBin5Line
        onClick={() => setOpen(true)}
        className="text-red-700 text-2xl cursor-pointer"
      />
      <Modal onClose={() => setOpen(false)} show={isOpen} size="md">
        <Modal.Header className="px-3 pt-3 pb-0" />
        <Modal.Body className="px-6 pb-6 pt-0">
          <div className="flex flex-col items-center gap-y-6 text-center">
            <HiOutlineExclamationCircle className="text-7xl text-red-600" />
            <p className="text-lg text-gray-500 dark:text-gray-300">
              Are you sure you want to delete this user?
            </p>
            <div className="flex items-center gap-x-3">
              <Button color="gray" onClick={() => setOpen(false)}>
                No, cancel
              </Button>
              <Button color="failure" onClick={handleDelete}>
                Yes, I'm sure
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default UserPage
