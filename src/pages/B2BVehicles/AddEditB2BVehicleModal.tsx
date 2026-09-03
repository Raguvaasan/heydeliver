import { FC, useState } from "react"
import { Modal } from "flowbite-react"
import { Form, Formik } from "formik"
import * as Yup from "yup"
import { HiOutlineTruck, HiX, HiExclamationCircle } from "react-icons/hi"
import { FormInput, FormSelect } from "../../components/FormComponents"
import { FormSection, SaveButton } from "../../components/FormHelpers"
import { B2BVehicle, B2BVehicleFormValues, useB2BVehicleStore } from "../../store/b2bVehicleStore"

interface Props {
  isOpen: boolean
  onClose: () => void
  mode: "add" | "edit"
  vehicle?: B2BVehicle
  onSuccess?: () => void
}

const schema = Yup.object({
  vehicleType: Yup.string().trim().required("Vehicle type is required").min(2).max(50),
  capacityKg: Yup.string().trim().required("Capacity is required").min(1).max(50),
  ratePerKm: Yup.number().typeError("Rate per km must be a number").required("Rate per km is required").min(0),
  status: Yup.string().oneOf(["Active", "Inactive"]).required("Status is required"),
})

const emptyValues: B2BVehicleFormValues = {
  vehicleType: "",
  capacityKg: "",
  ratePerKm: "",
  status: "Active",
}

const AddEditB2BVehicleModal: FC<Props> = ({ isOpen, onClose, mode, vehicle, onSuccess }) => {
  const isEdit = mode === "edit"
  const [apiError, setApiError] = useState<string | null>(null)
  const { addVehicle, updateVehicle } = useB2BVehicleStore()

  const initialValues: B2BVehicleFormValues = isEdit && vehicle
    ? { vehicleType: vehicle.vehicleType, capacityKg: vehicle.capacityKg, ratePerKm: vehicle.ratePerKm, status: vehicle.status }
    : emptyValues

  return (
    <Modal show={isOpen} onClose={onClose} size="3xl">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-500 to-orange-600">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <HiOutlineTruck className="w-6 h-6" />
            {isEdit ? "Edit B2B Vehicle" : "Add B2B Vehicle"}
          </h3>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-1.5"><HiX className="w-5 h-5" /></button>
        </div>
        <div className="p-6">
          {apiError && <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400"><HiExclamationCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /><span>{apiError}</span></div>}
          <Formik initialValues={initialValues} enableReinitialize validationSchema={schema} onSubmit={async (values, { setSubmitting }) => {
            setApiError(null)
            try {
              if (isEdit && vehicle) await updateVehicle(vehicle.id, values)
              else await addVehicle(values)
              onSuccess?.()
              onClose()
            } catch (err) {
              setApiError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
            } finally {
              setSubmitting(false)
            }
          }}>
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <FormSection title="Vehicle Information" description={isEdit ? "Update B2B vehicle details" : "Enter B2B vehicle details"} icon={<HiOutlineTruck className="w-5 h-5" />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput name="vehicleType" label="Vehicle Type" required />
                    <FormInput name="capacityKg" label="Capacity (Kg)" required />
                    <FormInput name="ratePerKm" label="Rate Per Km" type="number" required />
                    <FormSelect name="status" label="Status" required options={[{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }]} />
                  </div>
                </FormSection>
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">Cancel</button>
                  <SaveButton loading={isSubmitting} className="flex-1">{isEdit ? "Update Vehicle" : "Add Vehicle"}</SaveButton>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </Modal>
  )
}

export default AddEditB2BVehicleModal
