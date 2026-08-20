import { FC, useCallback, useEffect, useState } from "react"
import { Card, Spinner, TextInput } from "flowbite-react"
import { HiChevronLeft, HiChevronRight, HiSearch } from "react-icons/hi"
import { useNavigate } from "react-router-dom"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { Customer, useCustomerStore } from "../../store/customerStore"

const formatAmount = (amount?: number): string => {
  if (amount === undefined || amount === null) return "-"

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount)
}

const CustomersPage: FC = () => {
  const { customers, loading, error, pagination, fetchCustomers } = useCustomerStore()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const limit = 10

  const loadCustomers = useCallback(() => {
    fetchCustomers(currentPage, limit, searchTerm.trim() || undefined)
  }, [currentPage, fetchCustomers, searchTerm])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const totalPages = pagination?.totalPages || 1

  return (
    <NavbarSidebarLayout>
      <div className="px-4">
        <div className="mb-6">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            Customer Management
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            View booking customers and their order totals
          </p>
        </div>

        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Customer List
            </h2>
            <div className="relative w-full md:max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <HiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <TextInput
                type="search"
                placeholder="Search by name or mobile number..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="xl" />
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-800 text-xs uppercase text-white">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3">S.No</th>
                    <th className="whitespace-nowrap px-4 py-3">Name</th>
                    <th className="whitespace-nowrap px-4 py-3">Mobile Number</th>
                    <th className="whitespace-nowrap px-4 py-3">GST</th>
                    <th className="px-4 py-3">Address</th>
                    <th className="whitespace-nowrap px-4 py-3">Total Orders</th>
                    <th className="whitespace-nowrap px-4 py-3">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {customers.length > 0 ? (
                    customers.map((customer: Customer, index: number) => (
                      <tr
                        key={customer.id}
                        onClick={() => navigate(`/customers/${encodeURIComponent(customer.mobileNumber || customer.phone || "")}`)}
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                          {customer.serialNo || (currentPage - 1) * limit + index + 1}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                          {customer.name || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {customer.mobileNumber || customer.phone || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {customer.gstNumber || "-"}
                        </td>
                        <td className="min-w-56 px-4 py-3 text-gray-700 dark:text-gray-300">
                          {customer.address || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {customer.totalOrders ?? 0}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {formatAmount(customer.totalAmount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No customers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
              <p className="text-sm text-gray-700 dark:text-gray-400">
                Page {currentPage} of {totalPages}
                {pagination?.total !== undefined && <span> ({pagination.total} total customers)</span>}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous page"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage <= 1}
                  className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <HiChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next page"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage >= totalPages}
                  className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <HiChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </NavbarSidebarLayout>
  )
}

export default CustomersPage