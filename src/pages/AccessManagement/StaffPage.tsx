import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Spinner, Badge, Button, Card } from "flowbite-react"
import { useStaffStore } from "../../store/staffStore"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"

const StaffDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getStaffsById, selectedStaff, loading, error } = useStaffStore()
  const [activeTab, setActiveTab] = useState("franchise")

  useEffect(() => {
    if (id) getStaffsById(id)
  }, [id, getStaffsById])

  const handleEdit = () => {
    // Navigate back to staff list and open edit modal
    navigate("/staff", { state: { editStaffId: id } })
  }

  if (loading || !selectedStaff) {
    return (
      <NavbarSidebarLayout isFooter={false}>
        <div className="flex justify-center items-center h-64">
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <Spinner size="xl" />
          )}
        </div>
      </NavbarSidebarLayout>
    )
  }

  const staff = selectedStaff

  // Mock history data - replace with actual data from API
  const historyData = [
    {
      bookingId: "HD-234678",
      date: "23-12-2025",
      customer: "Shankar",
      amount: 2500,
      status: "In Transit",
    },
    {
      bookingId: "HD-234662",
      date: "22-12-2025",
      customer: "Prem",
      amount: 2346,
      status: "Delivered",
    },
  ]

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4 pb-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Management
          </h1>
        </div>

        {/* Staff Name and Edit Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {staff.name}
          </h2>
          <Button
            onClick={handleEdit}
            className="bg-orange-500 hover:bg-orange-600"
          >
            EDIT
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Basic Details Card */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Basic Details
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Email Address
                </p>
                <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
                  {staff.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Phone Number
                </p>
                <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
                  {staff.phone}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Status
                </p>
                <Badge color={staff.status ? "success" : "failure"} className="w-fit">
                  {staff.status ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Login Credentials Card */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Login Credentials
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Username
                </p>
                <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
                  {staff.email || staff.username || "abc@gmail.com"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Password
                </p>
                <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
                  ••••••••••••••••••
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last Login
                </p>
                <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
                  22-12-2025, 10.30AM
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* History Section */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-800 text-white text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">BOOKING ID</th>
                  <th className="px-4 py-3">DATE</th>
                  <th className="px-4 py-3">CUSTOMER</th>
                  <th className="px-4 py-3">AMOUNT (₹)</th>
                  <th className="px-4 py-3">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {historyData.length > 0 ? (
                  historyData.map((item, index) => (
                    <tr
                      key={index}
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
                          {item.bookingId}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {item.date}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {item.customer}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {item.amount}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          color={
                            item.status === "Delivered"
                              ? "success"
                              : item.status === "In Transit"
                              ? "info"
                              : "warning"
                          }
                        >
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No history records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Back Button */}
        <div className="mt-6 flex justify-end">
          <Button
            color="gray"
            onClick={() => navigate(-1)}
            className="border border-gray-300"
          >
            BACK
          </Button>
        </div>
      </div>
    </NavbarSidebarLayout>
  )
}

export default StaffDetail
