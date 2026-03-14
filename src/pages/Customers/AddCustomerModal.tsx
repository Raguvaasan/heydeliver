import { FC } from "react"
import { Modal } from "flowbite-react"
import { useCustomerStore } from "../../store/customerStore"
import { HiX, HiUser, HiMail, HiPhone, HiLocationMarker } from "react-icons/hi"
import { Formik, Form } from "formik"
import { FormInput, FormSelect, FormTextarea } from "../../components/FormComponents"
import { SaveButton, FormSection } from "../../components/FormHelpers"
import * as Yup from "yup"
import { sanitizeText } from "../../utils/sanitize"

interface AddCustomerModalProps {
  isOpen: boolean
  onClose: () => void
}

const customerValidationSchema = Yup.object({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .required("Name is required"),
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
    .required("Phone number is required"),
  address: Yup.string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must not exceed 200 characters")
    .required("Address is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  pincode: Yup.string()
    .matches(/^[0-9]{6}$/, "Pincode must be exactly 6 digits")
    .required("Pincode is required"),
  gstNumber: Yup.string()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GST number format")
    .optional(),
  status: Yup.string()
    .oneOf(["Active", "Inactive"])
    .required("Status is required"),
})

const stateOptions = [
  { value: "Tamil Nadu", label: "Tamil Nadu" },
  { value: "Karnataka", label: "Karnataka" },
  { value: "Kerala", label: "Kerala" },
  { value: "Andhra Pradesh", label: "Andhra Pradesh" },
  { value: "Telangana", label: "Telangana" },
  { value: "Maharashtra", label: "Maharashtra" },
  { value: "Gujarat", label: "Gujarat" },
  { value: "Rajasthan", label: "Rajasthan" },
  { value: "Delhi", label: "Delhi" },
  { value: "West Bengal", label: "West Bengal" },
  { value: "Uttar Pradesh", label: "Uttar Pradesh" },
  { value: "Bihar", label: "Bihar" },
  { value: "Madhya Pradesh", label: "Madhya Pradesh" },
  { value: "Punjab", label: "Punjab" },
  { value: "Haryana", label: "Haryana" },
  { value: "Odisha", label: "Odisha" },
  { value: "Jharkhand", label: "Jharkhand" },
  { value: "Chhattisgarh", label: "Chhattisgarh" },
  { value: "Assam", label: "Assam" },
  { value: "Goa", label: "Goa" },
]

const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
]

const AddCustomerModal: FC<AddCustomerModalProps> = ({ isOpen, onClose }) => {
  const { addCustomer, loading } = useCustomerStore()

  const handleSubmit = async (values: any) => {
    try {
      const sanitizedValues = {
        name: sanitizeText(values.name),
        email: sanitizeText(values.email),
        phone: sanitizeText(values.phone),
        address: sanitizeText(values.address),
        city: sanitizeText(values.city),
        state: values.state,
        pincode: sanitizeText(values.pincode),
        gstNumber: values.gstNumber ? sanitizeText(values.gstNumber) : undefined,
        status: values.status,
      }
      await addCustomer(sanitizedValues as any)
      onClose()
    } catch {
      // Error handled by store
    }
  }

  return (
    <Modal show={isOpen} onClose={onClose} size="4xl" position="center">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#64748b_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-500/70 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400/80">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-500 to-orange-600">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <HiUser className="w-6 h-6" />
            Add New Customer
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <Formik
            initialValues={{
              name: "",
              email: "",
              phone: "",
              address: "",
              city: "",
              state: "",
              pincode: "",
              gstNumber: "",
              status: "Active",
            }}
            validationSchema={customerValidationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <FormSection title="Personal Information" icon={<HiUser />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      name="name"
                      label="Customer Name"
                      icon={<HiUser />}
                      required
                      placeholder="Enter customer name"
                    />
                    <FormInput
                      name="email"
                      label="Email Address"
                      type="email"
                      icon={<HiMail />}
                      required
                      placeholder="Enter email"
                    />
                    <FormInput
                      name="phone"
                      label="Phone Number"
                      type="tel"
                      icon={<HiPhone />}
                      required
                      placeholder="Enter 10 digit phone"
                    />
                    <FormSelect
                      name="status"
                      label="Status"
                      options={statusOptions}
                      required
                    />
                  </div>
                </FormSection>

                <FormSection title="Address Details" icon={<HiLocationMarker />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <FormTextarea
                        name="address"
                        label="Address"
                        required
                        placeholder="Enter full address"
                      />
                    </div>
                    <FormInput
                      name="city"
                      label="City"
                      required
                      placeholder="Enter city"
                    />
                    <FormSelect
                      name="state"
                      label="State"
                      options={stateOptions}
                      required
                    />
                    <FormInput
                      name="pincode"
                      label="Pincode"
                      required
                      placeholder="Enter 6 digit pincode"
                    />
                    <FormInput
                      name="gstNumber"
                      label="GST Number"
                      placeholder="e.g. 33AABCU9603R1ZX"
                    />
                  </div>
                </FormSection>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <SaveButton loading={loading || isSubmitting}>
                    Add Customer
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

export default AddCustomerModal
