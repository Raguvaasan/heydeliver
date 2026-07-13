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

// Regex references:
// Phone (India, 10 digit, starts 6-9): /^[6-9]\d{9}$/
// Pincode (India, 6 digit, can't start with 0): /^[1-9][0-9]{5}$/
// GSTIN (15 char standard format): /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
// Name (letters, spaces, & . ' - only): /^[a-zA-Z][a-zA-Z\s.&'-]*$/
// Password (min 8, at least 1 upper, 1 lower, 1 number): /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/

const PHONE_REGEX = /^[6-9]\d{9}$/
const PINCODE_REGEX = /^[1-9][0-9]{5}$/
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
const NAME_REGEX = /^[a-zA-Z][a-zA-Z\s.&'-]*$/
const CITY_REGEX = /^[a-zA-Z][a-zA-Z\s.-]*$/
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/

const schema = Yup.object({
  collectionAgencyName: Yup.string()
    .trim()
    .required("Collection agency name is required")
    .min(3, "Must be at least 3 characters")
    .max(100, "Must be at most 100 characters")
    .matches(NAME_REGEX, "Only letters, spaces, and . & ' - are allowed"),

  ownerName: Yup.string()
    .trim()
    .required("Owner name is required")
    .min(3, "Must be at least 3 characters")
    .max(75, "Must be at most 75 characters")
    .matches(NAME_REGEX, "Only letters and spaces are allowed"),

  phone: Yup.string()
    .trim()
    .required("Phone number is required")
    .matches(PHONE_REGEX, "Enter a valid 10-digit mobile number"),

  status: Yup.string()
    .oneOf(["Active", "Inactive"], "Select a valid status")
    .required("Status is required"),

  email: emailValidation.required("Email is required"),

  address: Yup.string()
    .trim()
    .required("Address is required")
    .min(10, "Address must be at least 10 characters")
    .max(250, "Address must be at most 250 characters"),

  city: Yup.string()
    .trim()
    .required("City is required")
    .min(2, "Must be at least 2 characters")
    .max(50, "Must be at most 50 characters")
    .matches(CITY_REGEX, "Only letters, spaces, . and - are allowed"),

  state: Yup.string().required("State is required"),

  pincode: Yup.string()
    .trim()
    .required("Pincode is required")
    .matches(PINCODE_REGEX, "Enter a valid 6-digit pincode"),

  gstNumber: Yup.string()
    .trim()
    .required("GST number is required")
    .uppercase()
    .matches(GST_REGEX, "Enter a valid 15-character GSTIN (e.g. 22AAAAA0000A1Z5)"),

  username: Yup.string()
    .trim()
    .email("Enter a valid email address")
    .required("Username is required")
    .max(100, "Must be at most 100 characters"),

  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password must be at most 64 characters")
    .matches(PASSWORD_REGEX, "Must include an uppercase letter, a lowercase letter, and a number"),
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
                gstNumber: sanitizeText(values.gstNumber.toUpperCase()),
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
                    <FormInput name="phone" label="Phone Number" type="tel" maxLength={10} required />
                    <FormInput name="email" label="Email Address" type="email" required />
                    <FormInput name="gstNumber" label="GST Number" maxLength={15} required />
                    <FormSelect name="status" label="Status" options={statusOptions} required />
                  </div>
                </FormSection>

                <FormSection title="Location Information" description="Enter address details" icon={<HiLocationMarker className="w-5 h-5" />}>
                  <FormTextarea name="address" label="Complete Address" rows={2} required />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput name="city" label="City" required />
                    <FormSelect name="state" label="State" options={stateOptions} required />
                    <FormInput name="pincode" label="Pincode" maxLength={6} required />
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