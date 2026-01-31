import { FC, useState, useEffect, ChangeEvent } from "react"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { Card, Button, Label, TextInput, Select, Spinner } from "flowbite-react"
import http from "../../common/httpRequest"
import toast from "react-hot-toast"
import { useNavigate, useParams } from "react-router-dom"
import { HiEye, HiEyeOff } from "react-icons/hi"

interface Role {
  _id: string
  roleName: string
  roleType: string
  status: boolean
}

interface Agency {
  _id: string
  franchiseName: string
  agencyName: string
  status: boolean
}

const FranchiseAddEditStaffPage: FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    type: "franchise",
    roleId: "",
    franchiseId: "",
    username: "",
    password: "",
    status: "Active",
  })

  const [roles, setRoles] = useState<Role[]>([])
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    fetchRoles()
    fetchAgencies()
    if (isEditMode && id) {
      fetchStaffData(id)
    }
  }, [id, isEditMode])

  const fetchStaffData = async (staffId: string) => {
    setFetchLoading(true)
    try {
      const response = await http.get(`/admin/staff/${staffId}`)
      const staff = response.data?.data
      
      if (staff) {
        setFormData({
          name: staff.name || "",
          email: staff.email || "",
          phone: staff.phone || "",
          type: staff.type || "franchise",
          roleId: typeof staff.roleId === 'object' ? staff.roleId?._id : staff.roleId || staff.role?._id || "",
          franchiseId: typeof staff.franchiseId === 'object' ? staff.franchiseId?._id : staff.franchiseId || "",
          username: staff.username || "",
          password: "",
          status: staff.status === "Active" || staff.status === true ? "Active" : "Inactive",
        })
      }
    } catch (error: any) {
      console.error("Error fetching staff:", error)
      toast.error("Failed to load staff data")
    } finally {
      setFetchLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await http.get("/admin/role")
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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { name, email, phone, roleId, franchiseId, username, password, type } = formData

    // Validation
    if (!name || !email || !phone || !username) {
      toast.error("All fields except password are required")
      return
    }

    if (!roleId) {
      toast.error("Role is required")
      return
    }

    if (!franchiseId) {
      toast.error("Franchise is required")
      return
    }

    if (!isEditMode && !password) {
      toast.error("Password is required for new staff")
      return
    }

    const payload: any = {
      name,
      email,
      phone,
      type,
      roleId,
      franchiseId,
      username,
      status: formData.status,
    }

    if (password) {
      payload.password = password
    }

    setLoading(true)
    try {
      if (isEditMode && id) {
        await http.put(`/admin/staff/${id}`, payload)
        toast.success("Staff updated successfully")
      } else {
        await http.post("/admin/staff", payload)
        toast.success("Staff added successfully")
      }
      navigate("/franchise-staff")
    } catch (error: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} staff:`, error)
      toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} staff`)
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <NavbarSidebarLayout isFooter={false}>
        <div className="flex justify-center items-center h-96">
          <Spinner size="xl" />
        </div>
      </NavbarSidebarLayout>
    )
  }

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {isEditMode ? "Edit Staff" : "Add New Staff"} (Franchise)
          </h1>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                        {role.roleType || role.roleName}
                      </option>
                    ))}
                  </Select>
                </div>
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
                      <option key={agency._id} value={agency._id}>
                        {agency.agencyName || agency.franchiseName}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
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
                    {isEditMode ? "Set Password (optional)" : "Set Password"}
                    {!isEditMode && <span className="text-red-500">*</span>}
                  </Label>
                  <div className="relative">
                    <TextInput
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={isEditMode ? "Leave blank to keep unchanged" : "Enter password"}
                      value={formData.password}
                      onChange={handleChange}
                      required={!isEditMode}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <HiEyeOff className="h-5 w-5" />
                      ) : (
                        <HiEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <Button
                color="gray"
                onClick={() => navigate("/franchise-staff")}
                disabled={loading}
                type="button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    {isEditMode ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  isEditMode ? "Update" : "Submit"
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </NavbarSidebarLayout>
  )
}

export default FranchiseAddEditStaffPage
