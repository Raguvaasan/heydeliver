import { FC, useState, useEffect } from "react"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { Card, Button, Spinner, Badge, TextInput, Label, Modal, Select } from "flowbite-react"
import http from "../../common/httpRequest"
import toast from "react-hot-toast"
import { HiEye, HiPencil, HiTrash, HiSearch, HiEyeOff } from "react-icons/hi"
import { useNavigate } from "react-router-dom"
import { useFormik } from "formik"
import * as Yup from "yup"

interface Staff {
  _id: string
  name: string
  email: string
  phone: string
  role?: any
  roleId?: string | any
  status: boolean | string
  username?: string
}

interface Role {
  _id: string
  roleName: string
  roleType?: string
  status?: boolean
}

interface Agency {
  _id: string
  franchiseName: string
}

const FranchiseStaffListPage: FC = () => {
  const navigate = useNavigate()
  const [staffs, setStaffs] = useState<Staff[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchStaffs = async () => {
    setLoading(true)
    try {
      // Check if franchise user - use franchise-specific endpoint
      const loginType = sessionStorage.getItem("loginType")
      const isFranchise = loginType === "franchise" || loginType === "staff"
      const endpoint = isFranchise ? "/admin/franchise/staff" : "/admin/staff"
      const response = await http.get(endpoint)
      let staffData = []
      if (response.data?.data) {
        // If data is nested under data property
        if (Array.isArray(response.data.data)) {
          staffData = response.data.data
        } else if (response.data.data.staff && Array.isArray(response.data.data.staff)) {
          // If staff is nested under data.data.staff
          staffData = response.data.data.staff
        }
      } else if (Array.isArray(response.data)) {
        // If data is at root level
        staffData = response.data
      }

      if (staffData.length > 0) {
        console.log("First staff object:", staffData[0])
      }

      setStaffs(staffData)
      setErrorMessage(null)
    } catch (error: any) {
      console.error("=== ERROR FETCHING STAFFS ===")
      console.error("Error object:", error)
      console.error("Error message:", error.message)
      console.error("Error response:", error.response)
      console.error("Error response status:", error.response?.status)
      console.error("Error response data:", error.response?.data)

      if (error.response?.status === 401) {
        setErrorMessage("Access Denied: You don't have permission to access staff data.")
      } else {
        setErrorMessage("Failed to load staff data. Please try again.")
      }

      // Always ensure staffs is an array
      setStaffs([])
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      // Check if franchise user - use franchise-specific endpoint
      const loginType = sessionStorage.getItem("loginType")
      const isFranchise = loginType === "franchise" || loginType === "staff"
      const endpoint = isFranchise ? "/admin/franchise/role" : "/admin/role"
      const response = await http.get(endpoint)
      setRoles(response.data?.data || [])
    } catch (error) {
      console.error("Error fetching roles:", error)
    }
  }

  const fetchAgencies = async () => {
    try {
      const response = await http.get("/admin/franchise")
      setAgencies(response.data?.data || [])
    } catch (error) {
      console.error("Error fetching agencies:", error)
    }
  }

  useEffect(() => {
    fetchStaffs()
    fetchRoles()
    fetchAgencies()
  }, [])

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
      .required("Phone is required"),
    username: Yup.string().required("Username is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    roleId: Yup.string().required("Role is required"),
    franchiseId: Yup.string().required("Franchise is required"),
  })

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      username: "",
      password: "",
      roleId: "",
      franchiseId: "",
      status: "Active",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Check if franchise user - use franchise-specific endpoint
        const loginType = sessionStorage.getItem("loginType")
        const isFranchise = loginType === "franchise" || loginType === "staff"
        const endpoint = isFranchise ? "/admin/franchise/staff" : "/admin/staff"

        await http.post(endpoint, values)
        toast.success("Staff added successfully")
        setAddModalOpen(false)
        formik.resetForm()
        fetchStaffs()
      } catch (error: any) {
        console.error("Error adding staff:", error)
        toast.error(error.response?.data?.message || "Failed to add staff")
      }
    },
  })

  const handleView = (id: string) => {
    navigate(`/franchise-staff/${id}`)
  }

  const handleEdit = (id: string) => {
    navigate(`/franchise-staff/edit/${id}`)
  }

  const confirmDelete = (staff: Staff) => {
    setStaffToDelete(staff)
    setDeleteModalOpen(true)
  }

  const handleDelete = async () => {
    if (!staffToDelete) return

    try {
      // Check if franchise user - use franchise-specific endpoint
      const loginType = sessionStorage.getItem("loginType")
      const isFranchise = loginType === "franchise" || loginType === "staff"
      const endpoint = isFranchise ? `/admin/franchise/staff/${staffToDelete._id}` : `/admin/staff/${staffToDelete._id}`

      await http.delete(endpoint)
      toast.success("Staff deleted successfully")
      setDeleteModalOpen(false)
      setStaffToDelete(null)
      fetchStaffs()
    } catch (error: any) {
      console.error("Error deleting staff:", error)
      toast.error("Failed to delete staff")
    }
  }

  const getRoleName = (staff: Staff) => {
    // Check if role is populated as an object
    if (staff.role && typeof staff.role === 'object') {
      return staff.role.roleName || staff.role.roleType || "-"
    }

    // If roleId exists (as string), find the role from the roles array
    if (staff.roleId) {
      const roleIdString = typeof staff.roleId === 'object' ? staff.roleId._id : staff.roleId
      const foundRole = roles.find(r => r._id === roleIdString)
      if (foundRole) {
        return foundRole.roleName || foundRole.roleType || "-"
      }
    }

    return "-"
  }

  const filteredStaffs = Array.isArray(staffs) ? staffs.filter((staff) => {
    const matchesSearch = staff.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.phone?.includes(searchTerm)

    return matchesSearch
  }) : []

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Staff Management (Franchise)
          </h1>
        </div>

        <Card>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Manage Staffs
            </h2>
            {/* <Button
              onClick={() => setAddModalOpen(true)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              ADD STAFF
            </Button> */}
          </div>

          <div className="mb-4">
            <Label htmlFor="search" value="Search Staff" />
            <TextInput
              id="search"
              type="text"
              icon={HiSearch}
              placeholder="Search by name, email, or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center py-8">
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
                <tbody>
                  {filteredStaffs.length > 0 ? (
                    filteredStaffs.map((staff) => (
                      <tr key={staff._id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                          {staff.name}
                        </td>
                        <td className="px-4 py-3">{staff.email}</td>
                        <td className="px-4 py-3">{staff.phone}</td>
                        <td className="px-4 py-3">{getRoleName(staff)}</td>
                        <td className="px-4 py-3">
                          <Badge color={staff.status === "Active" || staff.status === true ? "success" : "failure"}>
                            {staff.status === "Active" || staff.status === true ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleView(staff._id)}
                              className="text-blue-600 hover:text-blue-800"
                              title="View"
                            >
                              <HiEye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleEdit(staff._id)}
                              className="text-green-600 hover:text-green-800"
                              title="Edit"
                            >
                              <HiPencil className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => confirmDelete(staff)}
                              className="text-red-600 hover:text-red-800"
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
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        {searchTerm ? "No staff found matching your search" : "No staff members found. Click ADD STAFF to create one."}
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
      <Modal show={addModalOpen} onClose={() => setAddModalOpen(false)} size="2xl">
        <Modal.Header>Add Staff</Modal.Header>
        <Modal.Body>
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Basic Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Basic Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" value="Name" />
                  <span className="text-red-500">*</span>
                  <TextInput
                    id="name"
                    name="name"
                    placeholder="Enter name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    color={formik.touched.name && formik.errors.name ? "failure" : "gray"}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <p className="mt-1 text-xs text-red-600">{formik.errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" value="Email" />
                  <span className="text-red-500">*</span>
                  <TextInput
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    color={formik.touched.email && formik.errors.email ? "failure" : "gray"}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="mt-1 text-xs text-red-600">{formik.errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone" value="Phone Number" />
                  <span className="text-red-500">*</span>
                  <TextInput
                    id="phone"
                    name="phone"
                    placeholder="Enter mobile number"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    color={formik.touched.phone && formik.errors.phone ? "failure" : "gray"}
                  />
                  {formik.touched.phone && formik.errors.phone && (
                    <p className="mt-1 text-xs text-red-600">{formik.errors.phone}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="roleId" value="Role" />
                  <span className="text-red-500">*</span>
                  <Select
                    id="roleId"
                    name="roleId"
                    value={formik.values.roleId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    color={formik.touched.roleId && formik.errors.roleId ? "failure" : "gray"}
                  >
                    <option value="">Select Role</option>
                    {roles.map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.roleName}
                      </option>
                    ))}
                  </Select>
                  {formik.touched.roleId && formik.errors.roleId && (
                    <p className="mt-1 text-xs text-red-600">{formik.errors.roleId}</p>
                  )}
                </div>

                <div className="col-span-2">
                  <Label htmlFor="status" value="Status" />
                  <span className="text-red-500">*</span>
                  <Select
                    id="status"
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Work Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Work Details
              </h3>
              <div>
                <Label htmlFor="franchiseId" value="Franchise" />
                <span className="text-red-500">*</span>
                <Select
                  id="franchiseId"
                  name="franchiseId"
                  value={formik.values.franchiseId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  color={formik.touched.franchiseId && formik.errors.franchiseId ? "failure" : "gray"}
                >
                  <option value="">Select the Franchise</option>
                  {agencies.map((agency) => (
                    <option key={agency._id} value={agency._id}>
                      {agency.franchiseName}
                    </option>
                  ))}
                </Select>
                {formik.touched.franchiseId && formik.errors.franchiseId && (
                  <p className="mt-1 text-xs text-red-600">{formik.errors.franchiseId}</p>
                )}
              </div>
            </div>

            {/* Login Credentials */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Login Credentials
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username" value="Username" />
                  <span className="text-red-500">*</span>
                  <TextInput
                    id="username"
                    name="username"
                    placeholder="Enter username"
                    value={formik.values.username}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    color={formik.touched.username && formik.errors.username ? "failure" : "gray"}
                  />
                  {formik.touched.username && formik.errors.username && (
                    <p className="mt-1 text-xs text-red-600">{formik.errors.username}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password" value="Set Password" />
                  <span className="text-red-500">*</span>
                  <div className="relative">
                    <TextInput
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      color={formik.touched.password && formik.errors.password ? "failure" : "gray"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
                    </button>
                  </div>
                  {formik.touched.password && formik.errors.password && (
                    <p className="mt-1 text-xs text-red-600">{formik.errors.password}</p>
                  )}
                </div>
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setAddModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => formik.handleSubmit()} className="bg-orange-500 hover:bg-orange-600">
            Submit
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} size="md">
        <Modal.Header>Confirm Delete</Modal.Header>
        <Modal.Body>
          <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
            Are you sure you want to delete <strong>{staffToDelete?.name}</strong>? This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button color="failure" onClick={handleDelete}>
            Yes, Delete
          </Button>
          <Button color="gray" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </NavbarSidebarLayout>
  )
}

export default FranchiseStaffListPage
