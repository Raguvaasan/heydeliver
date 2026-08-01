import { FC, useState, useEffect } from "react"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { Card, Button, Label, TextInput, Select, Spinner } from "flowbite-react"
import { useFormik } from "formik"
import * as Yup from "yup"
import http from "../../common/httpRequest"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

interface Role {
  _id: string
  roleName: string
  roleType: string
  status: boolean
}

interface Agency {
  _id: string
  franchiseName: string
  status: boolean
}

const FranchiseAddStaffPage: FC = () => {
  const navigate = useNavigate()
  const [roles, setRoles] = useState<Role[]>([])
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [loading, setLoading] = useState(false)
  const [rolesLoading, setRolesLoading] = useState(false)
  const [agenciesLoading, setAgenciesLoading] = useState(false)

  useEffect(() => {
    // Optimized: Fetch both roles and agencies in parallel
    const fetchAllData = async () => {
      setRolesLoading(true)
      setAgenciesLoading(true)
      try {
        const [rolesRes, agenciesRes] = await Promise.all([
          http.get("/admin/role"),
          http.get("/admin/franchise")
        ])

        setRoles(rolesRes.data?.data || [])
        setAgencies(agenciesRes.data?.data || [])
      } catch (error) {
        setRoles([])
        setAgencies([])
      } finally {
        setRolesLoading(false)
        setAgenciesLoading(false)
      }
    }

    fetchAllData()
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
    franchiseId: Yup.string().required("Branch is required"),
    status: Yup.string(),
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
      setLoading(true)
      try {
        // Add type field for franchise staff
        const payload = {
          ...values,
          type: "franchise"
        }
        await http.post("/admin/staff", payload)
        toast.success("Staff added successfully")
        navigate("/franchise-staff")
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to add staff")
      } finally {
        setLoading(false)
      }
    },
  })

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Add New Staff {sessionStorage.getItem("loginType") === "hub" ? "" : "(Branch)"}
          </h1>
        </div>

        <Card>
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <Label htmlFor="name" value="Full Name" />
                <TextInput
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter full name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  color={formik.touched.name && formik.errors.name ? "failure" : "gray"}
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" value="Email" />
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
                  <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone" value="Phone Number" />
                <TextInput
                  id="phone"
                  name="phone"
                  type="text"
                  placeholder="Enter 10-digit phone"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  color={formik.touched.phone && formik.errors.phone ? "failure" : "gray"}
                />
                {formik.touched.phone && formik.errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.phone}</p>
                )}
              </div>

              {/* Username */}
              <div>
                <Label htmlFor="username" value="Username" />
                <TextInput
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  color={formik.touched.username && formik.errors.username ? "failure" : "gray"}
                />
                {formik.touched.username && formik.errors.username && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.username}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password" value="Password" />
                <TextInput
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  color={formik.touched.password && formik.errors.password ? "failure" : "gray"}
                />
                {formik.touched.password && formik.errors.password && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <Label htmlFor="roleId" value="Role" />
                {rolesLoading ? (
                  <div className="flex items-center gap-2">
                    <Spinner size="sm" />
                    <span className="text-sm text-gray-500">Loading roles...</span>
                  </div>
                ) : (
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
                )}
                {formik.touched.roleId && formik.errors.roleId && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.roleId}</p>
                )}
              </div>

              {/* Franchise */}
              <div>
                <Label htmlFor="franchiseId" value="Branch" />
                {agenciesLoading ? (
                  <div className="flex items-center gap-2">
                    <Spinner size="sm" />
                    <span className="text-sm text-gray-500">Loading branches...</span>
                  </div>
                ) : (
                  <Select
                    id="franchiseId"
                    name="franchiseId"
                    value={formik.values.franchiseId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    color={formik.touched.franchiseId && formik.errors.franchiseId ? "failure" : "gray"}
                  >
                    <option value="">Select Branch</option>
                    {agencies.map((agency) => (
                      <option key={agency._id} value={agency._id}>
                        {agency.franchiseName}
                      </option>
                    ))}
                  </Select>
                )}
                {formik.touched.franchiseId && formik.errors.franchiseId && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.franchiseId}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status" value="Status" />
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

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <Button
                color="gray"
                onClick={() => navigate("/franchise-staff")}
                disabled={loading}
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
                    Adding...
                  </>
                ) : (
                  "Add Staff"
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </NavbarSidebarLayout>
  )
}

export default FranchiseAddStaffPage
