import { useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Spinner, Table, Breadcrumb } from "flowbite-react"
import { useStaffStore } from "../../store/staffStore"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"

const StaffDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { getStaffsById, selectedStaff, loading, error } = useStaffStore()

  useEffect(() => {
    if (id) getStaffsById(id)
  }, [id, getStaffsById])

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

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="dark:border-gray-700 dark:bg-gray-800 p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Staff Management
            </h1>
            <div className="flex items-center space-x-2 text-gray-600 mt-2">
              <Link to="/subadmin" className="hover:underline">
                Staff List
              </Link>
              <Breadcrumb.Item>Staff Details</Breadcrumb.Item>
            </div>
          </div>
          <button
            onClick={() => window.history.back()}
            className="mb-4 inline-flex items-center rounded-lg bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="px-4 space-y-8 pb-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#1E293B] via-[#123c69] to-[#012968da] rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-4xl font-extrabold mb-8 tracking-wide drop-shadow-md">
            Staff Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            <div className="space-y-2">
              <p className="uppercase text-sm font-semibold opacity-70 tracking-wide text-white/80">
                Name
              </p>
              <p className="text-2xl font-semibold drop-shadow-sm">
                {staff.name}
              </p>
            </div>
            <div className="space-y-2">
              <p className="uppercase text-sm font-semibold opacity-70 tracking-wide text-white/80">
                Email
              </p>
              <p className="text-2xl font-semibold drop-shadow-sm">
                {staff.email}
              </p>
            </div>
            <div className="space-y-2">
              <p className="uppercase text-sm font-semibold opacity-70 tracking-wide text-white/80">
                Mobile
              </p>
              <p className="text-2xl font-semibold drop-shadow-sm">
                {staff.mobile}
              </p>
            </div>
            <div className="space-y-2">
              <p className="uppercase text-sm font-semibold opacity-70 tracking-wide text-white/80">
                Role
              </p>
              <p className="text-2xl font-semibold drop-shadow-sm">
                {staff.role?.roleType ?? "N/A"}
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </NavbarSidebarLayout>
  )
}

export default StaffDetail
