import { FC, useState } from "react"
import { Modal } from "flowbite-react"
import { Formik, Form } from "formik"
import * as Yup from "yup"
import { HiOutlineIdentification, HiX, HiExclamationCircle } from "react-icons/hi"
import { FormInput, FormSelect } from "../../components/FormComponents"
import { FormSection, SaveButton } from "../../components/FormHelpers"
import { useDriverStore } from "../../store/driverStore"

export interface DriverFormValues {
  name: string
  phoneNumber: string
  licenseNumber: string
  dateOfExpiry: string
  status: "Active" | "Inactive"
}

export interface Driver extends DriverFormValues {
  id: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  mode: "add" | "edit"
  driver?: Driver
  onSuccess?: (driver: Driver) => void
}

const schema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Driver name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .matches(/^[A-Za-z\s.'-]+$/, "Name can only contain letters and spaces"),

  phoneNumber: Yup.string()
    .trim()
    .required("Phone number is required")
    .matches(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number"),

  licenseNumber: Yup.string()
    .trim()
    .required("License number is required")
    .matches(/^[A-Za-z]{2}\d{2}\d{4}\d{7}$/, "Enter a valid license number (e.g. TN0120230001234)"
    ),

  dateOfExpiry: Yup.date()
    .typeError("Enter a valid date")
    .required("Date of expiry is required")
    .min(new Date(), "License has already expired — please renew before adding"),

  status: Yup.string()
    .oneOf(["Active", "Inactive"], "Select a valid status")
    .required("Status is required"),
})

const emptyValues: DriverFormValues = {
  name: "",
  phoneNumber: "",
  licenseNumber: "",
  dateOfExpiry: "",
  status: "Active",
}

const AddEditDriver: FC<Props> = ({ isOpen, onClose, mode, driver, onSuccess }) => {
  const isEdit = mode === "edit"
  const [apiError, setApiError] = useState<string | null>(null)
  const { addDriver, updateDriver } = useDriverStore()

  const initialValues: DriverFormValues = isEdit && driver ? driver : emptyValues

  const handleSubmit = async (
    values: DriverFormValues,
    { setSubmitting }: { setSubmitting: (v: boolean) => void }
  ) => {
    setApiError(null)

    try {
      if (isEdit && driver) {
        await updateDriver(driver.id, values)
      } else {
        await addDriver(values)
      }

      onSuccess?.(driver || ({ id: "", ...values } as Driver))
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
            <HiOutlineIdentification className="w-6 h-6" />
            {isEdit ? "Edit Driver" : "Add New Driver"}
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
                  title="Driver Information"
                  description={isEdit ? "Update driver details" : "Enter driver details"}
                  icon={<HiOutlineIdentification className="w-5 h-5" />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput name="name" label="Driver Name" required />

                    <FormInput name="phoneNumber" label="Phone Number" required />

                    <FormInput name="licenseNumber" label="License Number" required />

                    <FormInput name="dateOfExpiry" label="Date of Expiry" type="date" required />

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
                    {isEdit ? "Update Driver" : "Add Driver"}
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

export default AddEditDriver