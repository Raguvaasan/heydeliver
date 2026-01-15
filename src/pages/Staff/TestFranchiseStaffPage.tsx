import { FC, useState } from "react"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { Card, Button } from "flowbite-react"
// import { useFranchiseStaffStore } from "../../store/franchiseStaffStore"

const TestFranchiseStaffPage: FC = () => {
  console.log("TestFranchiseStaffPage loaded successfully!")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  
  // DON'T call the store yet - testing if import itself causes issue
  // const { staffs, roles, loading, fetchStaffs, fetchRoles } = useFranchiseStaffStore()
  
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
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              ADD STAFF
            </Button>
          </div>

          <div className="overflow-x-auto">
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
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    <div>
                      <p className="text-green-600 font-bold">✓ Page Loaded Successfully!</p>
                      <p className="mt-2">Route: /franchise-staff</p>
                      <p>Auth Token: {sessionStorage.getItem("authToken") ? "EXISTS ✓" : "MISSING ✗"}</p>
                      <p>Login Type: {sessionStorage.getItem("loginType")}</p>
                      <p className="mt-4 text-sm text-yellow-600">
                        Testing without store - will add incrementally
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </NavbarSidebarLayout>
  )
}

export default TestFranchiseStaffPage
