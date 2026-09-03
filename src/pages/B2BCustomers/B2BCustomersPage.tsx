import { FC, useEffect, useState } from "react"
import { Card, TextInput, Spinner, Select } from "flowbite-react"
import { HiEye, HiSearch, HiChevronLeft, HiChevronRight } from "react-icons/hi"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { useB2BCustomerStore, B2BCustomer } from "../../store/b2bCustomerStore"
import ViewB2BCustomerModal from "./ViewB2BCustomerModal"

const B2BCustomersPage: FC = () => {
  const {
    customers,
    loading,
    pagination,
    fetchCustomers,
    setSelectedCustomer,
  } = useB2BCustomerStore()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  useEffect(() => {
    fetchCustomers(currentPage, 10, searchTerm, statusFilter)
  }, [fetchCustomers, currentPage, searchTerm, statusFilter])

  const handleView = (customer: B2BCustomer) => {
    setSelectedCustomer(customer)
    setIsViewModalOpen(true)
  }

  const totalPages = pagination?.totalPages || 1

  return (
    <NavbarSidebarLayout>
      <div className="px-4">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            B2B Customer Management
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage all B2B customers and their information
          </p>
        </div>

        {/* Main Card */}
        <Card>
          {/* Header Section with Search, Filter and Add Button */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                List of B2B Customers
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative max-w-md flex-1">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <HiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <TextInput
                    type="search"
                    placeholder="Search B2B customers..."
                    value={searchTerm}
                    onChange={(e) => {
                      setCurrentPage(1)
                      setSearchTerm(e.target.value)
                    }}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setCurrentPage(1)
                    setStatusFilter(e.target.value)
                  }}
                  className="w-full sm:w-40"
                >
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                </Select>
              </div>
            </div>
            {/* <div>
              <Button
                color="warning"
                onClick={() => setIsAddModalOpen(true)}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <HiPlus className="mr-2 h-5 w-5" />
                ADD B2B CUSTOMER
              </Button>
            </div> */}
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
                    <th className="px-4 py-3 w-16">S.No</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Created Date</th>
                    <th className="px-4 py-3">Phone Number</th>
                    <th className="px-4 py-3">GST</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {customers.length > 0 ? (
                    customers.map((customer, index) => (
                      <tr
                        key={customer.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                          {(currentPage - 1) * 10 + index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900 dark:text-white">
                          {customer.name || "-"}
                        </span>
                      </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {customer.createdAt
                            ? new Date(customer.createdAt).toLocaleDateString("en-IN")
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {customer.mobileNumber || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {customer.gstNumber || "-"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleView(customer)}
                              className="p-1.5 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                              title="View"
                            >
                              <HiEye className="h-5 w-5" />
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
                        No B2B customers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-700 dark:text-gray-400">
                Page {currentPage} of {totalPages}
                {pagination?.total !== undefined && (
                  <span> ({pagination.total} total B2B customers)</span>
                )}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <HiChevronLeft className="h-5 w-5" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${currentPage === pageNum
                          ? "bg-orange-500 text-white"
                          : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                        }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <HiChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <ViewB2BCustomerModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      />
    </NavbarSidebarLayout>
  )
}

export default B2BCustomersPage


