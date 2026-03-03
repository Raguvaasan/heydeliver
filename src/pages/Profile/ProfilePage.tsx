import { FC, useState, useEffect } from "react"
import { Card, Button, TextInput, Label, Avatar, Tabs, Table, Badge } from "flowbite-react"
import { HiUser, HiMail, HiPhone, HiLocationMarker, HiOfficeBuilding, HiPencil, HiKey } from "react-icons/hi"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import toast from "react-hot-toast"

const ProfilePage: FC = () => {
  const [isEditMode, setIsEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "security">("profile")

  // Get profile data from sessionStorage
  const getProfileFromSession = () => {
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

  const [profileData, setProfileData] = useState(getProfileFromSession())

  // Load profile data on component mount
  useEffect(() => {
    const data = getProfileFromSession()
    setProfileData(data)
  }, [])

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const recentOrders = [
    { id: "ORD-12345", date: "2026-01-17", status: "Delivered", amount: 1250 },
    { id: "ORD-12344", date: "2026-01-16", status: "In Transit", amount: 980 },
    { id: "ORD-12343", date: "2026-01-16", status: "Delivered", amount: 1580 },
    { id: "ORD-12342", date: "2026-01-15", status: "Delivered", amount: 2100 },
    { id: "ORD-12341", date: "2026-01-15", status: "Delivered", amount: 890 },
  ]

  const handleSaveProfile = () => {
    // Update sessionStorage with new profile data
    try {
      const existingData = JSON.parse(sessionStorage.getItem("profileData") || "{}")
      const fullName = `${profileData.firstName} ${profileData.lastName}`.trim()
      const updatedData = {
        ...existingData,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        name: fullName,
        username: fullName,
        email: profileData.email,
        mobile: profileData.phone,
        phone: profileData.phone,
        address: profileData.address,
        gstNumber: profileData.gstNumber,
        panNumber: profileData.panNumber,
        bankName: profileData.bankName,
        accountNumber: profileData.accountNumber,
        ifscCode: profileData.ifscCode
      }
      sessionStorage.setItem("profileData", JSON.stringify(updatedData))
      toast.success("Profile updated successfully!")
      setIsEditMode(false)
    } catch (error) {
      toast.error("Failed to update profile")
    }
  }

  const handleChangePassword = () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Passwords do not match!")
      return
    }
    if (passwords.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters!")
      return
    }
    // TODO: Call API to change password
    toast.success("Password changed successfully!")
    setPasswords({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    })
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

  // Generate avatar initials
  const getInitials = () => {
    const firstInitial = profileData.firstName?.charAt(0)?.toUpperCase() || ""
    const lastInitial = profileData.lastName?.charAt(0)?.toUpperCase() || ""
    return (firstInitial + lastInitial) || "U"
  }

  // Get full name
  const getFullName = () => {
    return `${profileData.firstName} ${profileData.lastName}`.trim() || "User"
  }

  return (
    <NavbarSidebarLayout>
      <div className="px-4 pt-6">
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
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Avatar
              size="xl"
              img={`https://ui-avatars.com/api/?name=${encodeURIComponent(getFullName())}&background=FFCC00&color=fff&size=128`}
              rounded
            >
              <div className="text-4xl font-bold">{getInitials()}</div>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {getFullName()}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {profileData.franchiseName && `${profileData.franchiseName} • `}
                {profileData.franchiseCode || profileData.email}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Member since {formatDate(profileData.memberSince)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                color={isEditMode ? "success" : "info"}
                onClick={() => isEditMode ? handleSaveProfile() : setIsEditMode(true)}
              >
                <HiPencil className="mr-2 h-4 w-4" />
                {isEditMode ? "Save Changes" : "Edit Profile"}
              </Button>
              {isEditMode && (
                <Button color="gray" onClick={() => setIsEditMode(false)}>
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-6 md:grid-cols-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
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
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Personal Information */}
              <Card>
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <TextInput
                      id="firstName"
                      icon={HiUser}
                      value={profileData.firstName}
                      disabled={!isEditMode}
                      placeholder={isEditMode ? "Enter first name" : ""}
                      onChange={(e) =>
                        setProfileData({ ...profileData, firstName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <TextInput
                      id="lastName"
                      icon={HiUser}
                      value={profileData.lastName}
                      disabled={!isEditMode}
                      placeholder={isEditMode ? "Enter last name" : ""}
                      onChange={(e) =>
                        setProfileData({ ...profileData, lastName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <TextInput
                      id="email"
                      type="email"
                      icon={HiMail}
                      value={profileData.email}
                      disabled={!isEditMode}
                      onChange={(e) =>
                        setProfileData({ ...profileData, email: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <TextInput
                      id="phone"
                      icon={HiPhone}
                      value={profileData.phone}
                      disabled={!isEditMode}
                      onChange={(e) =>
                        setProfileData({ ...profileData, phone: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <TextInput
                      id="address"
                      icon={HiLocationMarker}
                      value={profileData.address}
                      disabled={!isEditMode}
                      onChange={(e) =>
                        setProfileData({ ...profileData, address: e.target.value })
                      }
                    />
                  </div>
                </div>
              </Card>

              {/* Franchise Information */}
              <Card>
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Franchise Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="franchiseName">Franchise Name</Label>
                    <TextInput
                      id="franchiseName"
                      icon={HiOfficeBuilding}
                      value={profileData.franchiseName || "N/A"}
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="franchiseCode">Franchise Code</Label>
                    <TextInput
                      id="franchiseCode"
                      value={profileData.franchiseCode || "N/A"}
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="gstNumber">GST Number</Label>
                    <TextInput
                      id="gstNumber"
                      value={profileData.gstNumber || ""}
                      disabled={!isEditMode}
                      placeholder={isEditMode ? "Enter GST Number" : "N/A"}
                      onChange={(e) =>
                        setProfileData({ ...profileData, gstNumber: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="panNumber">PAN Number</Label>
                    <TextInput
                      id="panNumber"
                      value={profileData.panNumber || ""}
                      disabled={!isEditMode}
                      placeholder={isEditMode ? "Enter PAN Number" : "N/A"}
                      onChange={(e) =>
                        setProfileData({ ...profileData, panNumber: e.target.value })
                      }
                    />
                  </div>
                </div>
              </Card>

              {/* Bank Details */}
              <Card className="lg:col-span-2">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Bank Account Details
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <TextInput
                      id="bankName"
                      value={profileData.bankName || ""}
                      disabled={!isEditMode}
                      placeholder={isEditMode ? "Enter Bank Name" : "N/A"}
                      onChange={(e) =>
                        setProfileData({ ...profileData, bankName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <TextInput
                      id="accountNumber"
                      value={profileData.accountNumber || ""}
                      disabled={!isEditMode}
                      placeholder={isEditMode ? "Enter Account Number" : "N/A"}
                      onChange={(e) =>
                        setProfileData({ ...profileData, accountNumber: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="ifscCode">IFSC Code</Label>
                    <TextInput
                      id="ifscCode"
                      value={profileData.ifscCode || ""}
                      disabled={!isEditMode}
                      placeholder={isEditMode ? "Enter IFSC Code" : "N/A"}
                      onChange={(e) =>
                        setProfileData({ ...profileData, ifscCode: e.target.value })
                      }
                    />
                  </div>
                </div>
              </Card>
            </div>
          </Tabs.Item>

          <Tabs.Item title="Recent Orders" icon={HiOfficeBuilding}>
            <Card>
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Recent Orders
              </h3>
              <div className="overflow-x-auto">
                <Table hoverable>
                  <Table.Head>
                    <Table.HeadCell>Order ID</Table.HeadCell>
                    <Table.HeadCell>Date</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                    <Table.HeadCell>Amount</Table.HeadCell>
                  </Table.Head>
                  <Table.Body className="divide-y">
                    {recentOrders.map((order) => (
                      <Table.Row
                        key={order.id}
                        className="bg-white dark:border-gray-700 dark:bg-gray-800"
                      >
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                          {order.id}
                        </Table.Cell>
                        <Table.Cell>{order.date}</Table.Cell>
                        <Table.Cell>
                          <Badge
                            color={
                              order.status === "Delivered"
                                ? "success"
                                : order.status === "In Transit"
                                ? "warning"
                                : "info"
                            }
                          >
                            {order.status}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell className="font-semibold">
                          ₹{order.amount.toLocaleString()}
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            </Card>
          </Tabs.Item>

          <Tabs.Item title="Security" icon={HiKey}>
            <Card>
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Change Password
              </h3>
              <div className="max-w-md space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <TextInput
                    id="currentPassword"
                    type="password"
                    icon={HiKey}
                    value={passwords.currentPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, currentPassword: e.target.value })
                    }
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <TextInput
                    id="newPassword"
                    type="password"
                    icon={HiKey}
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, newPassword: e.target.value })
                    }
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <TextInput
                    id="confirmPassword"
                    type="password"
                    icon={HiKey}
                    value={passwords.confirmPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, confirmPassword: e.target.value })
                    }
                    placeholder="Confirm new password"
                  />
                </div>
                <Button color="info" onClick={handleChangePassword}>
                  Change Password
                </Button>
              </div>
            </Card>
          </Tabs.Item>
        </Tabs.Group>
      </div>
    </NavbarSidebarLayout>
  )
}

export default ProfilePage
