import { FC, useState, useEffect } from "react"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { Card, Spinner } from "flowbite-react"
import { Formik, Form } from "formik"
import { HiUser, HiMail, HiPhone, HiLockClosed, HiUserCircle, HiOfficeBuilding, HiCheckCircle } from "react-icons/hi"
import http from "../../common/httpRequest"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { FormInput, FormSelect } from "../../components/FormComponents"
import { SaveButton, FormSection } from "../../components/FormHelpers"
import { staffValidationSchema } from "../../utils/validationSchemas"
import { sanitizeText } from "../../utils/sanitize"

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

const FranchiseAddStaffPageModern: FC = () => {
  const navigate = useNavigate()
  const [roles, setRoles] = useState<Role[]>([])
  const [agencies, setAgencies] = useState<Agency[]>([])
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

  const fetchRoles = async () => {
    setRolesLoading(true)
    try {
      const response = await http.get("/admin/role")
      setRoles(response.data?.data || [])
    } catch (error) {
      toast.error("Failed to load roles")
      setRoles([])
    } finally {
      setRolesLoading(false)
    }
  }

  const fetchAgencies = async () => {
    setAgenciesLoading(true)
    try {
      const response = await http.get("/admin/franchise")
      setAgencies(response.data?.data || [])
    } catch (error) {
      toast.error("Failed to load franchises")
      setAgencies([])
    } finally {
      setAgenciesLoading(false)
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      // Sanitize inputs
      const sanitizedValues = {
        name: sanitizeText(values.name),
        email: sanitizeText(values.email),
        phone: sanitizeText(values.phone),
        username: sanitizeText(values.username),
        password: sanitizeText(values.password),
        roleId: values.roleId,
        franchiseId: values.franchiseId,
        status: values.status,
        type: "franchise"
      }

      await http.post("/admin/staff", sanitizedValues)
      toast.success("Staff member added successfully!")
      navigate("/franchise-staff")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add staff member")
      throw error
    }
  }

  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" }
  ]

  const roleOptions = roles.map(role => ({
    value: role._id,
    label: role.roleName
  }))

  const franchiseOptions = agencies.map(agency => ({
    value: agency._id,
    label: agency.franchiseName
  }))

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4 pt-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Add New Staff Member
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Add a new franchise staff member to the system
          </p>
        </div>

        <Card>
          <Formik
            initialValues={{
              name: "",
              email: "",
              phone: "",
              username: "",
              password: "",
              roleId: "",
              franchiseId: "",
              status: "Active",
            }}
            validationSchema={staffValidationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values }) => (
              <Form className="space-y-6">
                {/* Personal Information */}
                <FormSection
                  title="Personal Information"
                  description="Enter staff member's basic details"
                  icon={<HiUser className="w-5 h-5" />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      name="name"
                      label="Full Name"
                      required
                      icon={<HiUser />}
                      helperText="Enter first and last name"
                    />
                    <FormInput
                      name="email"
                      label="Email Address"
                      type="email"
                      required
                      icon={<HiMail />}
                      helperText="Valid email address"
                    />
                    <FormInput
                      name="phone"
                      label="Phone Number"
                      type="tel"
                      required
                      icon={<HiPhone />}
                      helperText="10-digit mobile number"
                    />
                  </div>
                </FormSection>

                {/* Account Credentials */}
                <FormSection
                  title="Account Credentials"
                  description="Create login credentials for staff member"
                  icon={<HiLockClosed className="w-5 h-5" />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      name="username"
                      label="Username"
                      required
                      icon={<HiUserCircle />}
                      helperText="Unique username for login"
                    />
                    <FormInput
                      name="password"
                      label="Password"
                      type="password"
                      required
                      icon={<HiLockClosed />}
                      helperText="Min 6 characters"
                    />
                  </div>
                </FormSection>

                {/* Assignment Details */}
                <FormSection
                  title="Assignment Details"
                  description="Assign role and franchise"
                  icon={<HiOfficeBuilding className="w-5 h-5" />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rolesLoading ? (
                      <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <Spinner size="sm" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Loading roles...
                        </span>
                      </div>
                    ) : (
                      <FormSelect
                        name="roleId"
                        label="Role"
                        options={roleOptions}
                        required
                        helperText="Select staff member's role"
                      />
                    )}

                    {agenciesLoading ? (
                      <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <Spinner size="sm" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Loading franchises...
                        </span>
                      </div>
                    ) : (
                      <FormSelect
                        name="franchiseId"
                        label="Franchise"
                        options={franchiseOptions}
                        required
                        helperText="Assign to franchise"
                      />
                    )}

                    <FormSelect
                      name="status"
                      label="Status"
                      options={statusOptions}
                      required
                      icon={<HiCheckCircle />}
                      helperText="Account status"
                    />
                  </div>
                </FormSection>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => navigate("/franchise-staff")}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <SaveButton loading={isSubmitting}>
                    Add Staff Member
                  </SaveButton>
                </div>
              </Form>
            )}
          </Formik>
        </Card>
      </div>
    </NavbarSidebarLayout>
  )
}

export default FranchiseAddStaffPageModern
