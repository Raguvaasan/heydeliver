import { Button, Label, TextInput, ToggleSwitch } from "flowbite-react"
import { FC, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"

const modules = [
  "Dashboard",
  "Agency Management",
  "Hub management",
   "Access management",
     "Parcel management",
  "Settings",
]

interface Permission {
  module: string
  view: boolean
  add: boolean
  edit: boolean
  delete: boolean
  active: boolean
}

const RoleFormPage: FC = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [roleType, setRoleType] = useState("Subadmin")
  const [status, setStatus] = useState<boolean>(true)

  const [permissions, setPermissions] = useState<Permission[]>(() =>
    modules.map((module) => ({
      module,
      view: false,
      add: false,
      edit: false,
      delete: false,
      active: false,
    }))
  )

  const handleCheckboxChange = (index: number, key: keyof Permission) => {
    setPermissions((prevPermissions) => {
      const updatedPermissions = [...prevPermissions]

      // Ensure updatedPermissions[index] exists, then update it
      const currentPermission = updatedPermissions[index]
      if (currentPermission) {
        updatedPermissions[index] = {
          ...currentPermission,
          [key]: !currentPermission[key],
          module: currentPermission.module, // Ensure 'module' is always present
        }
      }

      return updatedPermissions
    })
  }

  const handleSubmit = () => {
    const roleData = {
      roleType,
      status,
      permissions,
    }
    console.log("Submitted Role Data:", roleData)
    navigate("/role")
  }

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="p-6 space-y-8 bg-[#d5e1f759]  rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold text-black">
          {id ? "Edit Role" : "Add Role"}
        </h1>

        <div className="max-w-xl space-y-6 bg-white p-6 rounded-xl shadow-lg">
          <Label value="Role Type" />
          <TextInput
            placeholder="Enter role name"
            value={roleType}
            onChange={(e) => setRoleType(e.target.value)}
            className="bg-gray-100 text-gray-700 border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg"
          />

          <div className="flex items-center gap-4 mt-4">
            <Label value="Status" />
            <ToggleSwitch
              checked={status}
              onChange={() => setStatus((prevStatus: boolean) => !prevStatus)}
              label={status ? "Active" : "Inactive"}
              className="text-blue-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto border rounded-lg shadow-lg bg-white">
          <table className="min-w-full divide-y divide-gray-300 text-center text-sm dark:divide-gray-700">
            <thead className="bg-[#272727] text-white">
              <tr>
                <th className="py-3 px-4">Assign Role</th>
                <th>View</th>
                <th>Add</th>
                <th>Edit</th>
                <th>Delete</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {permissions.map((perm, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-800">
                    {perm.module}
                  </td>
                  {["view", "add", "edit", "delete", "active"].map((action) => {
                    const actionKey = action as keyof Permission
                    return (
                      <td key={actionKey} className="py-3 px-4">
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-blue-600 hover:bg-blue-200"
                          checked={!!perm[actionKey]} // Convert the value to a boolean
                          onChange={() =>
                            handleCheckboxChange(index, actionKey)
                          }
                        />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-6 mt-8">
          <Button
            color="gray"
            onClick={() => navigate("/role")}
            className="hover:bg-gray-400 transition duration-300"
          >
            Cancel
          </Button>
          <Button
            className="bg-blue-600 text-white hover:bg-[#272727]_hover transition duration-300"
            onClick={handleSubmit}
          >
            {id ? "Update" : "Submit"}
          </Button>
        </div>
      </div>
    </NavbarSidebarLayout>
  )
}

export default RoleFormPage
