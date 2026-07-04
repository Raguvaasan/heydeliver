import { FC } from "react"
import { Modal } from "flowbite-react"
import { Formik, Form } from "formik"
import { HiOfficeBuilding, HiX, HiLocationMarker, HiLockClosed } from "react-icons/hi"
import { FormInput, FormSelect, FormTextarea } from "../../components/FormComponents"
import { FormSection, SaveButton } from "../../components/FormHelpers"
import { sanitizeText } from "../../utils/sanitize"
import { useCollectionAgencyStore } from "../../store/collectionAgencyStore"
import { emailValidation } from "../../utils/validationSchemas"
import * as Yup from "yup"

interface Props {
  isOpen: boolean
  onClose: () => void
}

const schema = Yup.object({
  collectionAgencyName: Yup.string().required("Collection agency name is required"),
  ownerName: Yup.string().required("Owner name is required"),
  phone: Yup.string().required("Phone number is required"),
  status: Yup.string().oneOf(["Active", "Inactive"]).required("Status is required"),
  email: emailValidation.required("Email is required"),
  address: Yup.string().required("Address is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  pincode: Yup.string().required("Pincode is required"),
  gstNumber: Yup.string().required("GST number is required"),
  username: Yup.string().required("Username is required"),
  password: Yup.string().min(6).required("Password is required"),
})

const AddCollectionAgencyModal: FC<Props> = ({ isOpen, onClose }) => {
  const { addCollectionAgency, loading } = useCollectionAgencyStore()

  const states = ["Tamil Nadu", "Karnataka", "Kerala", "Andhra Pradesh", "Telangana", "Maharashtra", "Gujarat", "Rajasthan", "Delhi", "West Bengal"]
  const stateOptions = states.map((value) => ({ value, label: value }))
  const statusOptions = ["Active", "Inactive"].map((value) => ({ value, label: value }))

  return (
    <Modal show={isOpen} onClose={onClose} size="4xl" position="center">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-500 to-orange-600">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <HiOfficeBuilding className="w-6 h-6" />
            Add Collection Agency
          </h3>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors">
            <HiX className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <Formik
            initialValues={{
              collectionAgencyName: "",
              ownerName: "",
              phone: "",
              status: "Active",
              email: "",
              address: "",
              city: "",
              state: "",
              pincode: "",
              gstNumber: "",
              username: "",
              password: "",
            }}
            validationSchema={schema}
            onSubmit={async (values) => {
              await addCollectionAgency({
                collectionAgencyName: sanitizeText(values.collectionAgencyName),
                ownerName: sanitizeText(values.ownerName),
                phone: sanitizeText(values.phone),
                status: values.status as "Active" | "Inactive",
                email: sanitizeText(values.email),
                address: sanitizeText(values.address),
                city: sanitizeText(values.city),
                state: values.state,
                pincode: sanitizeText(values.pincode),
                gstNumber: sanitizeText(values.gstNumber),
                username: sanitizeText(values.username),
                password: values.password,
              })
              onClose()
            }}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <FormSection title="Basic Information" description="Enter collection agency details" icon={<HiOfficeBuilding className="w-5 h-5" />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput name="collectionAgencyName" label="Collection Agency Name" required />
                    <FormInput name="ownerName" label="Owner Name" required />
                    <FormInput name="phone" label="Phone Number" type="tel" required />
                    <FormInput name="email" label="Email Address" type="email" required />
                    <FormInput name="gstNumber" label="GST Number" required />
                    <FormSelect name="status" label="Status" options={statusOptions} required />
                  </div>
                </FormSection>

                <FormSection title="Location Information" description="Enter address details" icon={<HiLocationMarker className="w-5 h-5" />}>
                  <FormTextarea name="address" label="Complete Address" rows={2} required />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput name="city" label="City" required />
                    <FormSelect name="state" label="State" options={stateOptions} required />
                    <FormInput name="pincode" label="Pincode" required />
                  </div>
                </FormSection>

                <FormSection title="Login Credentials" description="Create agency portal login" icon={<HiLockClosed className="w-5 h-5" />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput name="username" label="Username" type="email" required />
                    <FormInput name="password" label="Password" type="password" required />
                  </div>
                </FormSection>

                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button type="button" onClick={onClose} disabled={isSubmitting || loading} className="flex-1 px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                    Cancel
                  </button>
                  <SaveButton loading={isSubmitting || loading} className="flex-1">Add Collection Agency</SaveButton>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </Modal>
  )
}

export default AddCollectionAgencyModal
