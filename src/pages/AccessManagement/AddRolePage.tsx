import { Button, Label, TextInput, ToggleSwitch } from "flowbite-react"
import { FC, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { useRoleStore } from "../../store/roleAndPermission"
import toast from "react-hot-toast"

const AddRolePage: FC = () => {
  const navigate = useNavigate()
  const { addRole, modules, fetchModules, loading } = useRoleStore()

  const [roleType, setRoleType] = useState("")
  const [status, setStatus] = useState<boolean>(true)
  const [permissions, setPermissions] = useState<any[]>([])

  // Fetch modules when the component is mounted
  useEffect(() => {
    fetchModules()
  }, [fetchModules])

  // Default modules if API fails
  const defaultModules = [
    "Dashboard",
    "Franchise Management", 
    "Access Management",
    "Orders Management",
    "Payment Management",
    "Reports",
    "Tracking",
    "Settings"
  ]
  
  const displayModules = modules.length > 0 ? modules : defaultModules

  const handleCheckboxChange = (moduleName: string, key: string) => {
    setPermissions((prevPermissions) => {
      const updatedPermissions = [...prevPermissions]
      const moduleIndex = updatedPermissions.findIndex(
        (p) => p.moduleName === moduleName
      )

      if (moduleIndex === -1) {
        updatedPermissions.push({
          moduleName,
          permission: {
            view: false,
            add: false,
            edit: false,
            delete: false,
            [key]: true,
          },
        })
      } else {
        updatedPermissions[moduleIndex] = {
          ...updatedPermissions[moduleIndex],
          permission: {
            ...updatedPermissions[moduleIndex].permission,
            [key]: !updatedPermissions[moduleIndex].permission[key],
          },
        }
      }

      return updatedPermissions
    })
  }

  const handleSubmit = async () => {
    if (!roleType.trim()) {
      toast.error("Please enter a role name.")
      return
    }

    try {
      // Convert UI permissions format to API format
      const apiPermissions = permissions.map((perm) => ({
        module: perm.moduleName,
        read: perm.permission.view || false,
        write: perm.permission.add || false,
        update: perm.permission.edit || false,
        delete: perm.permission.delete || false
      }))

      const roleData = {
        roleName: roleType,
        permissions: apiPermissions,
        status
      }
      
      await addRole(roleData)
      navigate("/role")
    } catch (error) {
      // Error handled by store
    }
  }

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="p-6 space-y-8 bg-[#d5e1f759] rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold text-black">Add Role</h1>

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
              onChange={() => setStatus((prevStatus) => !prevStatus)}
              label={status ? "Active" : "Inactive"}
              className="text-blue-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto border rounded-lg shadow-lg bg-white">
          <table className="min-w-full divide-y divide-gray-300 text-center text-sm dark:divide-gray-700">
            <thead className="bg-[#272727] text-white">
              <tr>
                <th className="py-3 px-4">Module</th>
                <th>View</th>
                <th>Add</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {displayModules.map((moduleName, index) => {
                const currentPerm = permissions.find(
                  (p) => p.moduleName === moduleName
                )
                const allChecked =
                  currentPerm &&
                  Object.values(currentPerm.permission).every(
                    (val) => val === true
                  )

                const handleSelectAllRow = () => {
                  setPermissions((prevPermissions) => {
                    const updated = [...prevPermissions]
                    const moduleIndex = updated.findIndex(
                      (p) => p.moduleName === moduleName
                    )

                    if (moduleIndex !== -1) {
                      updated[moduleIndex] = {
                        ...updated[moduleIndex],
                        permission: {
                          view: !allChecked,
                          add: !allChecked,
                          edit: !allChecked,
                          delete: !allChecked,
                        },
                      }
                    } else {
                      updated.push({
                        moduleName,
                        permission: {
                          view: true,
                          add: true,
                          edit: true,
                          delete: true,
                        },
                      })
                    }

                    return updated
                  })
                }

                return (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-800 flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-blue-600"
                        checked={allChecked}
                        onChange={handleSelectAllRow}
                      />
                      {moduleName}
                    </td>
                    {["view", "add", "edit", "delete"].map((action) => (
                      <td key={action} className="py-3 px-4">
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-blue-600 hover:bg-blue-200"
                          checked={currentPerm?.permission?.[action] === true}
                          onChange={() =>
                            handleCheckboxChange(moduleName, action)
                          }
                        />
                      </td>
                    ))}
                  </tr>
                )
              })}
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
            disabled={loading}
          >
            Submit
          </Button>
        </div>
      </div>
    </NavbarSidebarLayout>
  )
}

export default AddRolePage
