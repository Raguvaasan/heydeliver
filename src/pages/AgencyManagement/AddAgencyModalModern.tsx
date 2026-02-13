import { FC, useState } from "react"
import { Modal } from "flowbite-react"
import { useAgencyStore } from "../../store/agencyStore"
import {
  HiX,
  HiOfficeBuilding,
  HiLocationMarker,
  HiLockClosed,
  HiUser,
  HiMail,
  HiPhone,
  HiEye,
  HiEyeOff,
} from "react-icons/hi"
import { Formik, Form, useField } from "formik"
import { FormInput, FormSelect, FormTextarea } from "../../components/FormComponents"
import { SaveButton, FormSection } from "../../components/FormHelpers"
import { agencyValidationSchema } from "../../utils/validationSchemas"
import { sanitizeText } from "../../utils/sanitize"

interface AddAgencyModalProps {
  isOpen: boolean
  onClose: () => void
}

const PasswordInputField: FC<{
  name: string
  label: string
  helperText?: string
  required?: boolean
}> = ({ name, label, helperText, required = false }) => {
  const [field, meta] = useField(name)
  const [showPassword, setShowPassword] = useState(false)
  const hasError = meta.touched && meta.error

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
          <HiLockClosed />
        </div>
        <input
          {...field}
          id={name}
          type={showPassword ? "text" : "password"}
          className={`
            peer w-full px-4 py-3 pl-10 pr-10
            border-2 rounded-lg
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-white
            placeholder-transparent
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-0
            ${
              hasError
                ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                : "border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-200"
            }
          `}
          placeholder={label}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute inset-y-0 right-0 z-10 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {!showPassword ? (
            <HiEyeOff className="h-5 w-5" />
          ) : (
            <HiEye className="h-5 w-5" />
          )}
        </button>
        <label
          htmlFor={name}
          className={`
            absolute left-10 -top-2.5 px-1
            bg-white dark:bg-gray-800
            text-sm font-medium
            transition-all duration-200
            peer-placeholder-shown:text-base peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400
            peer-focus:-top-2.5 peer-focus:text-sm
            ${
              hasError
                ? "text-red-600 dark:text-red-400 peer-focus:text-red-600"
                : "text-gray-700 dark:text-gray-300 peer-focus:text-orange-600"
            }
          `}
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      </div>
      {hasError && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{meta.error}</p>
      )}
      {!hasError && helperText && (
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  )
}

const AddAgencyModalModern: FC<AddAgencyModalProps> = ({ isOpen, onClose }) => {
  const { addAgency, loading } = useAgencyStore()

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
  ]

  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ]

  const handleSubmit = async (values: any) => {
    try {
      // Sanitize inputs
      const sanitizedValues = {
        agencyName: sanitizeText(values.agencyName),
        agencyOwner: sanitizeText(values.agencyOwner),
        phone: sanitizeText(values.phone),
        email: sanitizeText(values.email),
        gstNumber: sanitizeText(values.gstNumber),
        address: sanitizeText(values.address),
        city: sanitizeText(values.city),
        state: values.state,
        pincode: sanitizeText(values.pincode),
        username: sanitizeText(values.username),
        password: sanitizeText(values.password),
        status: values.status
      }

      await addAgency(sanitizedValues)
      onClose()
    } catch (error) {
      console.error("Add agency failed:", error)
      throw error
    }
  }

  return (
    <Modal show={isOpen} onClose={onClose} size="4xl" position="center">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-500 to-orange-600">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <HiOfficeBuilding className="w-6 h-6" />
            Add New Franchise
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
              agencyName: "",
              agencyOwner: "",
              phone: "",
              email: "",
              gstNumber: "",
              address: "",
              city: "",
              state: "",
              pincode: "",
              username: "",
              password: "",
              status: "Active",
            }}
            validationSchema={agencyValidationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                {/* Basic Details */}
                <FormSection
                  title="Basic Information"
                  description="Enter franchise basic details"
                  icon={<HiOfficeBuilding className="w-5 h-5" />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      name="agencyName"
                      label="Franchise Name"
                      required
                      helperText="Official franchise name"
                    />
                    <FormInput
                      name="agencyOwner"
                      label="Franchise Owner Name"
                      required
                      helperText="Owner's full name"
                    />
                    <FormInput
                      name="phone"
                      label="Mobile Number"
                      type="tel"
                      required
                      helperText="10-digit mobile number"
                    />
                    <FormInput
                      name="email"
                      label="Email Address"
                      type="email"
                      required
                      helperText="Valid email address"
                    />
                    <FormInput
                      name="gstNumber"
                      label="GST Number"
                      required
                      helperText="15-character GST number"
                    />
                    <FormSelect
                      name="status"
                      label="Status"
                      options={statusOptions}
                      required
                      helperText="Franchise account status"
                    />
                  </div>
                </FormSection>

                {/* Location Details */}
                <FormSection
                  title="Location Information"
                  description="Enter franchise address details"
                  icon={<HiLocationMarker className="w-5 h-5" />}
                >
                  <FormTextarea
                    name="address"
                    label="Complete Address"
                    rows={2}
                    required
                    helperText="Full address with landmarks"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput
                      name="city"
                      label="City"
                      required
                      helperText="City name"
                    />
                    <FormSelect
                      name="state"
                      label="State"
                      options={stateOptions}
                      required
                      helperText="Select state"
                    />
                    <FormInput
                      name="pincode"
                      label="Pincode"
                      required
                      helperText="6-digit pincode"
                    />
                  </div>
                </FormSection>

                {/* Login Credentials */}
                <FormSection
                  title="Login Credentials"
                  description="Create login credentials for franchise"
                  icon={<HiLockClosed className="w-5 h-5" />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      name="username"
                      label="Username"
                      required
                      helperText="Unique username for login"
                    />
                    <PasswordInputField
                      name="password"
                      label="Password"
                      required
                      helperText="Strong password"
                    />
                  </div>
                </FormSection>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting || loading}
                    className="flex-1 px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <SaveButton loading={isSubmitting || loading} className="flex-1">
                    Add Franchise
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

export default AddAgencyModalModern
