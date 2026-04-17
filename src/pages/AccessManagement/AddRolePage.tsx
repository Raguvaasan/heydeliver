import { Button, Label, TextInput, ToggleSwitch } from "flowbite-react"
import { FC, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { useRoleStore } from "../../store/roleAndPermission"
import toast from "react-hot-toast"
import { getRoleModules } from "../../utils/roleModules"

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

  const loginType = sessionStorage.getItem("loginType") || "admin"
  const displayModules = getRoleModules({
    loginType,
    apiModules: modules,
  })

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
      <div className="rounded-lg bg-[#d5e1f759] p-6 shadow-lg dark:bg-gray-800/70 space-y-8">
        <h1 className="text-2xl font-semibold text-black dark:text-white">Add Role</h1>

        <div className="max-w-xl space-y-6 rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900">
          <Label value="Role Type" className="text-gray-700 dark:text-gray-300" />
          <TextInput
            placeholder="Enter role name"
            value={roleType}
            onChange={(e) => setRoleType(e.target.value)}
            className="[&_input]:border-2 [&_input]:border-gray-300 [&_input]:bg-gray-100 [&_input]:text-gray-700 [&_input]:rounded-lg [&_input]:focus:ring-2 [&_input]:focus:ring-primary-500 [&_input]:focus:border-transparent dark:[&_input]:border-gray-600 dark:[&_input]:bg-gray-800 dark:[&_input]:text-gray-100"
          />

          <div className="flex items-center gap-4 mt-4">
            <Label value="Status" className="text-gray-700 dark:text-gray-300" />
            <ToggleSwitch
              checked={status}
              onChange={() => setStatus((prevStatus) => !prevStatus)}
              label={status ? "Active" : "Inactive"}
              className="text-primary-600 dark:text-primary-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
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
                  <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-100 flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-primary-600 dark:text-primary-400"
                        checked={allChecked}
                        onChange={handleSelectAllRow}
                      />
                      {moduleName}
                    </td>
                    {["view", "add", "edit", "delete"].map((action) => (
                      <td key={action} className="py-3 px-4">
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-primary-600 hover:bg-primary-100 dark:text-primary-400 dark:hover:bg-primary-900/20"
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
            className="bg-primary-600 text-white hover:bg-primary-700 transition duration-300"
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
