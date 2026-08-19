import { FC } from "react"
import { Modal } from "flowbite-react"
import { useAgencyStore } from "../../store/agencyStore"
import { HiX, HiOfficeBuilding, HiLocationMarker, HiLockClosed } from "react-icons/hi"
import { Formik, Form, Field } from "formik"
import { FormInput, FormSelect, FormTextarea } from "../../components/FormComponents"
import { SaveButton, FormSection } from "../../components/FormHelpers"
import { agencyValidationSchema, emailValidation } from "../../utils/validationSchemas"
import { sanitizeText } from "../../utils/sanitize"
import * as Yup from "yup"

interface AddAgencyModalProps {
  isOpen: boolean
  onClose: () => void
}

const addAgencyModalValidationSchema = agencyValidationSchema.shape({
  email: emailValidation,
  agencyType: Yup.boolean().required("Agency type is required"),
  commission: Yup.string().when("agencyType", {
    is: false,
    then: (schema) =>
      schema
        .required("Commission is required for third party agencies")
        .matches(/^\d+(\.\d{1,2})?$/, "Enter a valid commission value"),
    otherwise: (schema) => schema.notRequired(),
  }),
})

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
        status: values.status,
        agencyType: values.agencyType,
        commission: values.agencyType === false ? sanitizeText(values.commission) : null,
      }

      await addAgency(sanitizedValues)
      onClose()
    } catch (error) {
      throw error
    }
  }

  return (
    <Modal show={isOpen} onClose={onClose} size="4xl" position="center">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#64748b_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-500/70 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400/80">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-500 to-orange-600">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <HiOfficeBuilding className="w-6 h-6" />
            Add New Agency
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
              status: "Active",
              agencyType: true,
              commission: "",
            }}
            validationSchema={addAgencyModalValidationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values, errors, touched, setFieldValue }) => (
              <Form className="space-y-6">
                {/* Basic Details */}
                <FormSection
                  title="Basic Information"
                  description="Enter agency basic details"
                  icon={<HiOfficeBuilding className="w-5 h-5" />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      name="agencyName"
                      label="Agency Name"
                      required
                      helperText="Official agency name"
                    />
                    <FormInput
                      name="agencyOwner"
                      label="Agency Owner Name"
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
                      helperText="Agency account status"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Agency Type <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Field
                          type="radio"
                          name="agencyType"
                          value="true"
                          checked={values.agencyType === true}
                          onChange={() => {
                            setFieldValue("agencyType", true)
                            setFieldValue("commission", "")
                          }}
                          className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Own Agency</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Field
                          type="radio"
                          name="agencyType"
                          value="false"
                          checked={values.agencyType === false}
                          onChange={() => setFieldValue("agencyType", false)}
                          className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Third Party (Commission applicable)</span>
                      </label>
                    </div>
                    {touched.agencyType && errors.agencyType && (
                      <p className="mt-1 text-sm text-red-500">{errors.agencyType as string}</p>
                    )}
                  </div>
                </FormSection>

                {/* Location Details */}
                <FormSection
                  title="Location Information"
                  description="Enter agency address details"
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
                    Add Agency
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
