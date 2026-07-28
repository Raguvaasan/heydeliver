import { FC } from "react"
import { Modal } from "flowbite-react"
import { Formik, Form } from "formik"
import * as Yup from "yup"
import { HiX, HiOutlineMap } from "react-icons/hi"
import { FormInput, FormSelect, FormTextarea } from "../../components/FormComponents"
import { FormSection, SaveButton } from "../../components/FormHelpers"
import { useRouteStore } from "../../store/routeStore"

interface Props {
  isOpen: boolean
  onClose: () => void
}

const schema = Yup.object({
  from: Yup.string().required("From is required"),
  to: Yup.string().required("To is required"),
  branchesText: Yup.string().required("At least one branch is required"),
  status: Yup.string().oneOf(["Active", "Inactive"]).required(),
})

const AddRouteModal: FC<Props> = ({ isOpen, onClose }) => {
  const { addRoute, loading } = useRouteStore()

  return (
    <Modal show={isOpen} onClose={onClose} size="3xl">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-500 to-orange-600">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <HiOutlineMap className="w-6 h-6" />
            Add New Route
          </h3>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-1.5">
            <HiX className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <Formik
            initialValues={{ from: "", to: "", branchesText: "", status: "Active" }}
            validationSchema={schema}
            onSubmit={async (values) => {
              const branches = values.branchesText
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
              await addRoute({ from: values.from, to: values.to, branches, status: values.status as "Active" | "Inactive" })
              onClose()
            }}
          >
            {() => (
              <Form className="space-y-6">
                <FormSection
                  title="Route Information"
                  description="Enter the origin, destination and branch list"
                  icon={<HiOutlineMap className="w-5 h-5" />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput name="from" label="From" required helperText="Starting location" />
                    <FormInput name="to" label="To" required helperText="Destination location" />
                    <div className="md:col-span-2">
                      <FormTextarea
                        name="branchesText"
                        label="Branches"
                        required
                        helperText="Comma-separated branches, for example: Guindy, Tambaram"
                        rows={3}
                      />
                    </div>
                    <FormSelect
                      name="status"
                      label="Status"
                      options={[
                        { value: "Active", label: "Active" },
                        { value: "Inactive", label: "Inactive" },
                      ]}
                      required
                      helperText="Choose current route status"
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
                    Add Route
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

export default AddRouteModal
