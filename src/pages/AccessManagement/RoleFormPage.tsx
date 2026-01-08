import { Button, Label, TextInput, Card } from "flowbite-react"
import { FC, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"

const modules = [
  "Franchise Management",
  "Orders Management",
  "Payment Management",
]

interface Permission {
  module: string
  view: boolean
  add: boolean
  edit: boolean
  delete: boolean
}

const RoleFormPage: FC = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [roleType, setRoleType] = useState("")

  const [permissions, setPermissions] = useState<Permission[]>(() =>
    modules.map((module) => ({
      module,
      view: false,
      add: false,
      edit: false,
      delete: false,
    }))
  )

  const handleCheckboxChange = (index: number, key: keyof Permission) => {
    setPermissions((prevPermissions) => {
      const updatedPermissions = [...prevPermissions]
      const currentPermission = updatedPermissions[index]
      if (currentPermission && key !== 'module') {
        updatedPermissions[index] = {
          ...currentPermission,
          [key]: !currentPermission[key],
        }
      }
      return updatedPermissions
    })
  }

  const handleSelectAll = () => {
    const allChecked = permissions.every(
      (perm) => perm.view && perm.add && perm.edit && perm.delete
    )
    setPermissions((prevPermissions) =>
      prevPermissions.map((perm) => ({
        ...perm,
        view: !allChecked,
        add: !allChecked,
        edit: !allChecked,
        delete: !allChecked,
      }))
    )
  }

  const handleRowSelectAll = (index: number) => {
    setPermissions((prevPermissions) => {
      const updatedPermissions = [...prevPermissions]
      const currentPermission = updatedPermissions[index]
      if (currentPermission) {
        const allChecked =
          currentPermission.view &&
          currentPermission.add &&
          currentPermission.edit &&
          currentPermission.delete
        updatedPermissions[index] = {
          ...currentPermission,
          view: !allChecked,
          add: !allChecked,
          edit: !allChecked,
          delete: !allChecked,
        }
      }
      return updatedPermissions
    })
  }

  const handleSubmit = () => {
    const roleData = {
      roleType,
      permissions,
    }
    console.log("Submitted Role Data:", roleData)
    navigate("/role")
  }

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4 pt-6 pb-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Management
          </h1>
        </div>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Role & Permission
          </h2>

          {/* Role Name Input */}
          <div className="mb-6">
            <Label htmlFor="roleName" className="mb-2 block">
              Role Name
            </Label>
            <TextInput
              id="roleName"
              placeholder="Enter role name"
              value={roleType}
              onChange={(e) => setRoleType(e.target.value)}
              required
            />
          </div>

          {/* Permissions Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-800 text-white text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">ASSIGN ROLE</th>
                  <th className="px-4 py-3 text-center">VIEW</th>
                  <th className="px-4 py-3 text-center">ADD</th>
                  <th className="px-4 py-3 text-center">EDIT</th>
                  <th className="px-4 py-3 text-center">DELETE</th>
                  <th className="px-4 py-3 text-center">
                    <button
                      onClick={handleSelectAll}
                      className="text-white hover:text-orange-400 font-semibold"
                    >
                      SELECT ALL
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {permissions.map((perm, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {perm.module}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 cursor-pointer"
                        checked={perm.view}
                        onChange={() => handleCheckboxChange(index, "view")}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 cursor-pointer"
                        checked={perm.add}
                        onChange={() => handleCheckboxChange(index, "add")}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 cursor-pointer"
                        checked={perm.edit}
                        onChange={() => handleCheckboxChange(index, "edit")}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 cursor-pointer"
                        checked={perm.delete}
                        onChange={() => handleCheckboxChange(index, "delete")}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 cursor-pointer"
                        checked={
                          perm.view && perm.add && perm.edit && perm.delete
                        }
                        onChange={() => handleRowSelectAll(index)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              color="gray"
              onClick={() => navigate("/role")}
              className="border border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Submit
            </Button>
          </div>
        </Card>
      </div>
    </NavbarSidebarLayout>
  )
}

export default RoleFormPage
