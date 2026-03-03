import { FC, useEffect, useMemo, useState } from "react"
import { Card, Avatar, Tabs, Table, Badge, Spinner } from "flowbite-react"
import { HiUser, HiOfficeBuilding, HiKey, HiCreditCard } from "react-icons/hi"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import toast from "react-hot-toast"
import { Formik, Form } from "formik"
import { FormInput, FormTextarea } from "../../components/FormComponents"
import { SaveButton, FormSection } from "../../components/FormHelpers"
import { profileValidationSchema, changePasswordSchema } from "../../utils/validationSchemas"
import { sanitizeText } from "../../utils/sanitize"
import { useOrderStore } from "../../store/orderStore"

interface ProfileData {
  firstName: string
  lastName: string
  email: string
  phone: string
  franchiseName: string
  franchiseCode: string
  address: string
  gstNumber: string
  panNumber: string
  bankName: string
  accountNumber: string
  ifscCode: string
  walletBalance: number
  totalOrders: number
  activeOrders: number
  completedOrders: number
  memberSince: string
}

const ProfilePageModern: FC = () => {
  const [, setActiveTab] = useState<"profile" | "orders" | "security">("profile")
  const { orders, fetchOrders, loading: ordersLoading } = useOrderStore()

  // Get profile data from sessionStorage
  const getProfileFromSession = (): ProfileData => {
    try {
      const profileDataStr = sessionStorage.getItem("profileData")
      if (profileDataStr) {
        const data = JSON.parse(profileDataStr)
        const fullName = data.name || data.username || data.agencyName || "User"
        const nameParts = fullName.trim().split(" ")
        const firstName = nameParts[0] || ""
        const lastName = nameParts.slice(1).join(" ") || ""
        
        return {
          firstName: data.firstName || firstName,
          lastName: data.lastName || lastName,
          email: data.email || "",
          phone: data.mobile || data.phone || data.phoneNumber || "",
          franchiseName: data.agencyName || data.franchiseName || "",
          franchiseCode: data.agencyCode || data.franchiseCode || data.code || "",
          address: data.address || data.location || "",
          gstNumber: data.gstNumber || data.gst || "",
          panNumber: data.panNumber || data.pan || "",
          bankName: data.bankName || data.bank?.name || "",
          accountNumber: data.accountNumber || data.bank?.accountNumber || "",
          ifscCode: data.ifscCode || data.bank?.ifsc || "",
          walletBalance: data.walletBalance || data.wallet?.balance || 0,
          totalOrders: data.totalOrders || data.orders?.total || 0,
          activeOrders: data.activeOrders || data.orders?.active || 0,
          completedOrders: data.completedOrders || data.orders?.completed || 0,
          memberSince: data.createdAt || data.memberSince || "N/A"
        }
      }
    } catch (error) {
      // Profile parsing failed, use defaults
    }
    return {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      franchiseName: "",
      franchiseCode: "",
      address: "",
      gstNumber: "",
      panNumber: "",
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      walletBalance: 0,
      totalOrders: 0,
      activeOrders: 0,
      completedOrders: 0,
      memberSince: "N/A"
    }
  }

  const [profileData] = useState(getProfileFromSession())

  useEffect(() => {
    fetchOrders(1, 50)
  }, [fetchOrders])

  const pendingOrders = useMemo(() => {
    return orders
      .filter((order: any) => (order?.status || "").toLowerCase() === "pending")
      .slice(0, 10)
  }, [orders])

  const handleSaveProfile = async (values: any) => {
    try {
      // Sanitize inputs
      const sanitizedValues = {
        firstName: sanitizeText(values.firstName),
        lastName: sanitizeText(values.lastName),
        email: sanitizeText(values.email),
        phone: sanitizeText(values.phone),
        address: sanitizeText(values.address),
        gstNumber: sanitizeText(values.gstNumber),
        panNumber: sanitizeText(values.panNumber),
        bankName: sanitizeText(values.bankName),
        accountNumber: sanitizeText(values.accountNumber),
        ifscCode: sanitizeText(values.ifscCode)
      }

      // Update sessionStorage with new profile data
      const existingData = JSON.parse(sessionStorage.getItem("profileData") || "{}")
      const fullName = `${sanitizedValues.firstName} ${sanitizedValues.lastName}`.trim()
      const updatedData = {
        ...existingData,
        ...sanitizedValues,
        name: fullName,
        username: fullName,
        mobile: sanitizedValues.phone
      }
      sessionStorage.setItem("profileData", JSON.stringify(updatedData))
      
      // TODO: Call API to update profile
      // await http.put('/admin/profile', sanitizedValues)
      
      toast.success("Profile updated successfully!")
    } catch (error) {
      toast.error("Failed to update profile")
      throw error
    }
  }

  const handleChangePassword = async (values: any) => {
    try {
      // Sanitize password inputs
      const sanitizedValues = {
        currentPassword: sanitizeText(values.currentPassword),
        newPassword: sanitizeText(values.newPassword),
        confirmPassword: sanitizeText(values.confirmPassword)
      }

      // TODO: Call API to change password
      // await http.post('/admin/change-password', {
      //   currentPassword: sanitizedValues.currentPassword,
      //   newPassword: sanitizedValues.newPassword
      // })
      
      toast.success("Password changed successfully!")
    } catch (error) {
      toast.error("Failed to change password")
      throw error
    }
  }

  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === "N/A") return "N/A"
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    } catch {
      return dateStr
    }
  }

  // Get full name
  const getFullName = () => {
    return `${profileData.firstName} ${profileData.lastName}`.trim() || "User"
  }

  return (
    <NavbarSidebarLayout>
      <div className="px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Header Card */}
        <Card className="mb-6">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
            <Avatar
              size="lg"
              img={`https://ui-avatars.com/api/?name=${encodeURIComponent(getFullName())}&background=FFCC00&color=fff&size=128`}
              rounded
            />
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-white">
                {getFullName()}
              </h2>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                {profileData.franchiseName && `${profileData.franchiseName} • `}
                {profileData.franchiseCode || profileData.email}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Member since {formatDate(profileData.memberSince)}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-4 md:grid-cols-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                ₹{profileData.walletBalance.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Wallet Balance</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {profileData.totalOrders}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {profileData.activeOrders}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Orders</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {profileData.completedOrders}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs.Group
          aria-label="Profile tabs"
          style="underline"
          onActiveTabChange={(tab: number) => setActiveTab(tab === 0 ? "profile" : tab === 1 ? "orders" : "security")}
        >
          <Tabs.Item active title="Profile Information" icon={HiUser}>
            <Formik
              initialValues={{
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                email: profileData.email,
                phone: profileData.phone,
                address: profileData.address,
                gstNumber: profileData.gstNumber,
                panNumber: profileData.panNumber,
                bankName: profileData.bankName,
                accountNumber: profileData.accountNumber,
                ifscCode: profileData.ifscCode
              }}
              validationSchema={profileValidationSchema}
              onSubmit={handleSaveProfile}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Personal Information */}
                    <FormSection
                      title="Personal Information"
                      description="Update your personal details"
                      icon={<HiUser className="w-5 h-5" />}
                    >
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <FormInput
                            name="firstName"
                            label="First Name"
                            required
                          />
                          <FormInput
                            name="lastName"
                            label="Last Name"
                            required
                          />
                        </div>
                        <FormInput
                          name="email"
                          label="Email Address"
                          type="email"
                          required
                        />
                        <FormInput
                          name="phone"
                          label="Phone Number"
                          type="tel"
                          required
                          helperText="10-digit mobile number"
                        />
                        <FormTextarea
                          name="address"
                          label="Address"
                          rows={3}
                        />
                      </div>
                    </FormSection>

                    {/* Franchise Information */}
                    <FormSection
                      title="Franchise Information"
                      description="Your franchise details (read-only)"
                      icon={<HiOfficeBuilding className="w-5 h-5" />}
                    >
                      <div className="space-y-4">
                        <div className="space-y-4">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Franchise Name
                            </label>
                            <div className="rounded-lg bg-gray-100 px-4 py-3 text-gray-900 dark:bg-gray-700 dark:text-white">
                              {profileData.franchiseName || "N/A"}
                            </div>
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Franchise Code
                            </label>
                            <div className="rounded-lg bg-gray-100 px-4 py-3 text-gray-900 dark:bg-gray-700 dark:text-white">
                              {profileData.franchiseCode || "N/A"}
                            </div>
                          </div>
                        </div>
                        <FormInput
                          name="gstNumber"
                          label="GST Number"
                          helperText="15-character GST number"
                        />
                        <FormInput
                          name="panNumber"
                          label="PAN Number"
                          helperText="10-character PAN number"
                        />
                      </div>
                    </FormSection>

                    {/* Bank Details */}
                    <FormSection
                      title="Bank Account Details"
                      description="Update your bank information"
                      icon={<HiCreditCard className="w-5 h-5" />}
                      className="lg:col-span-2"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormInput
                          name="bankName"
                          label="Bank Name"
                        />
                        <FormInput
                          name="accountNumber"
                          label="Account Number"
                        />
                        <FormInput
                          name="ifscCode"
                          label="IFSC Code"
                          helperText="11-character IFSC code"
                        />
                      </div>
                    </FormSection>
                  </div>

                  {/* Save Button */}
                  <div className="mt-6 flex justify-end">
                    <SaveButton loading={isSubmitting}>
                      Save Profile Changes
                    </SaveButton>
                  </div>
                </Form>
              )}
            </Formik>
          </Tabs.Item>

          <Tabs.Item title="Recent Orders" icon={HiOfficeBuilding}>
            <Card>
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Recent Orders
              </h3>
              <div className="overflow-x-auto">
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Spinner size="lg" />
                  </div>
                ) : (
                  <Table hoverable>
                    <Table.Head>
                      <Table.HeadCell>Order ID</Table.HeadCell>
                      <Table.HeadCell>Date</Table.HeadCell>
                      <Table.HeadCell>Status</Table.HeadCell>
                      <Table.HeadCell>Amount</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y">
                      {pendingOrders.length === 0 ? (
                        <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                          <Table.Cell
                            colSpan={4}
                            className="py-6 text-center text-gray-500 dark:text-gray-400"
                          >
                            No pending orders found
                          </Table.Cell>
                        </Table.Row>
                      ) : (
                        pendingOrders.map((order: any) => (
                          <Table.Row
                            key={order._id || order.orderId || order.bookingId}
                            className="bg-white dark:border-gray-700 dark:bg-gray-800"
                          >
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                              {order.bookingId || order.orderId || order._id}
                            </Table.Cell>
                            <Table.Cell>
                              {order.bookingDate || (order.createdAt ? new Date(order.createdAt).toLocaleString() : "-")}
                            </Table.Cell>
                            <Table.Cell>
                              <Badge className="inline-flex w-fit" color="warning">
                                Pending
                              </Badge>
                            </Table.Cell>
                            <Table.Cell className="font-semibold">
                              ₹{Number(order.amount || 0).toLocaleString()}
                            </Table.Cell>
                          </Table.Row>
                        ))
                      )}
                    </Table.Body>
                  </Table>
                )}
              </div>
            </Card>
          </Tabs.Item>

          <Tabs.Item title="Security" icon={HiKey}>
            <FormSection
              title="Change Password"
              description="Update your account password"
              icon={<HiKey className="w-5 h-5" />}
            >
              <Formik
                initialValues={{
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: ""
                }}
                validationSchema={changePasswordSchema}
                onSubmit={handleChangePassword}
              >
                {({ isSubmitting }) => (
                  <Form className="max-w-md space-y-4">
                    <FormInput
                      name="currentPassword"
                      label="Current Password"
                      type="password"
                      required
                    />
                    <FormInput
                      name="newPassword"
                      label="New Password"
                      type="password"
                      required
                      helperText="Min 8 characters with uppercase, lowercase, number & special character"
                    />
                    <FormInput
                      name="confirmPassword"
                      label="Confirm New Password"
                      type="password"
                      required
                    />
                    <SaveButton loading={isSubmitting}>
                      Change Password
                    </SaveButton>
                  </Form>
                )}
              </Formik>
            </FormSection>
          </Tabs.Item>
        </Tabs.Group>
      </div>
    </NavbarSidebarLayout>
  )
}

export default ProfilePageModern
