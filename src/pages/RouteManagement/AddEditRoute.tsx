import { FC } from "react"
import { Modal } from "flowbite-react"
import { Formik, Form } from "formik"
import * as Yup from "yup"
import { HiX, HiOutlineMap } from "react-icons/hi"
import { FormInput, FormSelect } from "../../components/FormComponents"
import { FormSection, SaveButton } from "../../components/FormHelpers"
import { useRouteStore } from "../../store/routeStore"

interface Props {
  isOpen: boolean
  onClose: () => void
  mode: "add" | "edit"
}

const schema = Yup.object({
  routeName: Yup.string()
    .trim()
    .required("Route name is required")
    .min(2, "Route name must be at least 2 characters")
    .max(100, "Route name cannot exceed 100 characters"),

  from: Yup.string().trim().required("From is required"),

  to: Yup.string()
    .trim()
    .required("To is required")
    .test("not-same-as-from", "To cannot be the same as From", function (value) {
      return value !== this.parent.from
    }),

  status: Yup.string().oneOf(["Active", "Inactive"], "Select a valid status").required("Status is required"),
})

const emptyValues = {
  routeName: "",
  from: "",
  to: "",
  status: "Active",
}

const AddEditRouteModal: FC<Props> = ({ isOpen, onClose, mode }) => {
  const { addRoute, updateRoute, updateRouteStatus, selectedRoute, loading } = useRouteStore()
  const isEdit = mode === "edit"

  const initialValues =
    isEdit && selectedRoute
      ? {
          routeName: selectedRoute.routeName || "",
          from: selectedRoute.from || "",
          to: selectedRoute.to || "",
          status: selectedRoute.status || "Active",
        }
      : emptyValues

  return (
    <Modal show={isOpen} onClose={onClose} size="3xl">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-500 to-orange-600">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <HiOutlineMap className="w-6 h-6" />
            {isEdit ? "Edit Route" : "Add New Route"}
          </h3>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-1.5">
            <HiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <Formik
            initialValues={initialValues}
            enableReinitialize
            validationSchema={schema}
            onSubmit={async (values) => {
              if (isEdit && selectedRoute) {
                const payload: Record<string, string> = {}
                if (values.routeName !== selectedRoute.routeName) payload["routeName"] = values.routeName
                if (values.from !== selectedRoute.from) payload["from"] = values.from
                if (values.to !== selectedRoute.to) payload["to"] = values.to

                const statusChanged = values.status !== selectedRoute.status
                if (Object.keys(payload).length > 0) {
                  if (statusChanged) payload["status"] = values.status
                  await updateRoute(selectedRoute.id, payload as any)
                } else if (statusChanged) {
                  await updateRouteStatus(selectedRoute.id, values.status as "Active" | "Inactive")
                }
              } else {
                await addRoute({
                  routeName: values.routeName,
                  from: values.from,
                  to: values.to,
                  status: values.status as "Active" | "Inactive",
                })
              }
              onClose()
            }}
          >
            {() => (
              <Form className="space-y-6">
                <FormSection
                  title="Route Information"
                  description={isEdit ? "Update route details" : "Enter the route name, origin and destination"}
                  icon={<HiOutlineMap className="w-5 h-5" />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <FormInput name="routeName" label="Route Name" required />
                    </div>

                    <FormInput name="from" label="From" required helperText="Starting location" />
                    <FormInput name="to" label="To" required helperText="Destination location" />

                    <FormSelect
                      name="status"
                      label="Status"
                      required
                      helperText="Choose current route status"
                      options={[
                        { value: "Active", label: "Active" },
                        { value: "Inactive", label: "Inactive" },
                      ]}
                    />
                  </div>
                </FormSection>

                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                  >
                    Cancel
                  </button>
                  <SaveButton loading={loading} className="flex-1">
                    {isEdit ? "Update Route" : "Add Route"}
                  </SaveButton>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </Modal>
  )
}

export default AddEditRouteModal
