import { FC, useState } from "react"
import { Modal } from "flowbite-react"
import { Formik, Form } from "formik"
import * as Yup from "yup"
import { HiOutlineTruck, HiX, HiExclamationCircle } from "react-icons/hi"
import { FormInput, FormSelect } from "../../components/FormComponents"
import { FormSection, SaveButton } from "../../components/FormHelpers"
import { useVehicleStore, VehicleFormValues, Vehicle } from "../../store/vehicleStore"

interface Props {
  isOpen: boolean
  onClose: () => void
  mode: "add" | "edit"
  vehicle?: Vehicle
  onSuccess?: (vehicle: Vehicle) => void // notify parent list to refresh/update
}

const schema = Yup.object({
  type: Yup.string()
    .trim()
    .required("Vehicle type is required")
    .min(2, "Vehicle type must be at least 2 characters")
    .max(50, "Vehicle type cannot exceed 50 characters"),

  capacity: Yup.string()
    .trim()
    .required("Capacity is required")
    .min(1, "Capacity is required")
    .max(50, "Capacity cannot exceed 50 characters"),

  registrationNumber: Yup.string()
    .trim()
    .required("Vehicle registration number is required")
    .matches(/^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{1,4}$/, "Enter a valid vehicle registration number (e.g. TN38AB1234)"),

  rcNumber: Yup.string()
    .trim()
    .required("RC number is required")
    .matches(/^[A-Z0-9]{8,20}$/, "Enter a valid RC number"),

  insuranceNumber: Yup.string()
    .trim()
    .required("Insurance number is required")
    .matches(/^[A-Z0-9/-]{6,30}$/, "Enter a valid insurance policy number"),

  status: Yup.string()
    .oneOf(["Active", "Inactive"], "Select a valid status")
    .required("Status is required"),
})

const emptyValues: VehicleFormValues = {
  type: "",
  capacity: "",
  registrationNumber: "",
  rcNumber: "",
  insuranceNumber: "",
  status: "Active",
}

const AddEditVehicle: FC<Props> = ({ isOpen, onClose, mode, vehicle, onSuccess }) => {
  const isEdit = mode === "edit"
  const [apiError, setApiError] = useState<string | null>(null)
  const { addVehicle, updateVehicle } = useVehicleStore()

  const initialValues: VehicleFormValues = isEdit && vehicle ? vehicle : emptyValues

  const handleSubmit = async (
    values: VehicleFormValues,
    { setSubmitting }: { setSubmitting: (v: boolean) => void }
  ) => {
    setApiError(null)

    try {
      if (isEdit && vehicle) {
        await updateVehicle(vehicle.id, values)
      } else {
        await addVehicle(values)
      }

      onSuccess?.(vehicle || ({ id: "", ...values } as Vehicle))
      onClose()
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal show={isOpen} onClose={onClose} size="3xl">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-500 to-orange-600">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <HiOutlineTruck className="w-6 h-6" />
            {isEdit ? "Edit Vehicle" : "Add New Vehicle"}
          </h3>

          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-1.5">
            <HiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {apiError && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
              <HiExclamationCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          <Formik
            initialValues={initialValues}
            enableReinitialize
            validationSchema={schema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <FormSection
                  title="Vehicle Information"
                  description={isEdit ? "Update vehicle details" : "Enter vehicle details"}
                  icon={<HiOutlineTruck className="w-5 h-5" />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput name="type" label="Vehicle Type" required />

                    <FormInput name="capacity" label="Capacity" type="number" required />

                    <FormInput
                      name="registrationNumber"
                      label="Vehicle Registration Number"
                      required
                    />

                    <FormInput name="rcNumber" label="RC Number" required />

                    <FormInput name="insuranceNumber" label="Insurance Number" required />

                    <FormSelect
                      name="status"
                      label="Status"
                      required
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
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                  >
                    Cancel
                  </button>

                  <SaveButton loading={isSubmitting} className="flex-1">
                    {isEdit ? "Update Vehicle" : "Add Vehicle"}
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

export default AddEditVehicle