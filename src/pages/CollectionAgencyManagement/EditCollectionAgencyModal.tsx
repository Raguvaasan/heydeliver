import { FC } from "react"
import { Modal, Button, Label, TextInput, Select } from "flowbite-react"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { useCollectionAgencyStore } from "../../store/collectionAgencyStore"

interface Props {
  isOpen: boolean
  onClose: () => void
}

// Same rules as AddCollectionAgencyModal, with password made optional
// (blank = "don't change the password").
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

  email: Yup.string()
    .trim()
    .email("Enter a valid email address")
    .required("Email is required"),

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

  // Optional on edit: leave blank to keep the current password.
  password: Yup.string()
    .transform((val) => (val === "" ? undefined : val))
    .notRequired()
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password must be at most 64 characters")
    .matches(PASSWORD_REGEX, "Must include an uppercase letter, a lowercase letter, and a number"),

  status: Yup.string().oneOf(["Active", "Inactive"], "Select a valid status").required("Status is required"),
})

const fieldRows: Array<[string, string, string]> = [
  ["collectionAgencyName", "Collection Agency Name", "text"],
  ["ownerName", "Owner Name", "text"],
  ["phone", "Phone Number", "tel"],
  ["email", "Email Address", "email"],
  ["gstNumber", "GST Number", "text"],
  ["city", "City", "text"],
  ["pincode", "Pincode", "text"],
  ["username", "Username", "email"],
  ["password", "Password (leave blank to keep current)", "password"],
]

const states = ["Tamil Nadu", "Karnataka", "Kerala", "Andhra Pradesh", "Telangana", "Maharashtra", "Gujarat", "Rajasthan", "Delhi", "West Bengal"]

const EditCollectionAgencyModal: FC<Props> = ({ isOpen, onClose }) => {
  const { selectedCollectionAgency, updateCollectionAgency, updateCollectionAgencyStatus, loading } = useCollectionAgencyStore()

  if (!selectedCollectionAgency) return null

  const initialValues = {
    collectionAgencyName: selectedCollectionAgency.collectionAgencyName || "",
    ownerName: selectedCollectionAgency.ownerName || "",
    phone: selectedCollectionAgency.phone || "",
    email: selectedCollectionAgency.email || "",
    address: selectedCollectionAgency.address || "",
    city: selectedCollectionAgency.city || "",
    state: selectedCollectionAgency.state || "",
    pincode: selectedCollectionAgency.pincode || "",
    gstNumber: selectedCollectionAgency.gstNumber || "",
    username: selectedCollectionAgency.username || "",
    password: "",
    status: selectedCollectionAgency.status || "Active",
  }

  return (
    <Modal show={isOpen} onClose={onClose} size="3xl">
      <Modal.Header>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Collection Agency</h3>
      </Modal.Header>
      <Modal.Body className="max-h-[calc(100vh-12rem)] overflow-y-auto">
        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={schema}
          onSubmit={async (values) => {
            const { status, password, gstNumber, ...rest } = values
            const payload: Record<string, unknown> = { ...rest, gstNumber: gstNumber.toUpperCase() }
            if (password) payload.password = password

            await updateCollectionAgency(selectedCollectionAgency.id, payload)
            if (status !== selectedCollectionAgency.status) {
              await updateCollectionAgencyStatus(selectedCollectionAgency.id, status)
            }
            onClose()
          }}
        >
          {({ isSubmitting, values, errors, touched }) => (
            <Form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fieldRows.map(([name, label, type]) => (
                  <div key={name}>
                    <div className="flex items-center gap-1 mb-2">
                      <Label htmlFor={name} value={label} />
                    </div>
                    <Field
                      as={TextInput}
                      id={name}
                      name={name}
                      type={type}
                      maxLength={name === "phone" ? 10 : name === "pincode" ? 6 : name === "gstNumber" ? 15 : undefined}
                      color={(touched as any)[name] && (errors as any)[name] ? "failure" : undefined}
                    />
                    <ErrorMessage name={name} component="p" className="mt-1 text-sm text-red-600 dark:text-red-500" />
                  </div>
                ))}

                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <Label htmlFor="state" value="State" />
                  </div>
                  <Field as={Select} id="state" name="state" color={touched.state && errors.state ? "failure" : undefined}>
                    <option value="">Select</option>
                    {states.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Field>
                  <ErrorMessage name="state" component="p" className="mt-1 text-sm text-red-600 dark:text-red-500" />
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <Label htmlFor="status" value="Status" />
                  </div>
                  <Field as={Select} id="status" name="status">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </Field>
                  <ErrorMessage name="status" component="p" className="mt-1 text-sm text-red-600 dark:text-red-500" />
                </div>
              </div>

              <div>
                <Label htmlFor="address" value="Address" className="mb-2" />
                <Field
                  as={TextInput}
                  id="address"
                  name="address"
                  color={touched.address && errors.address ? "failure" : undefined}
                />
                <ErrorMessage name="address" component="p" className="mt-1 text-sm text-red-600 dark:text-red-500" />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button color="gray" onClick={onClose} disabled={isSubmitting || loading}>Cancel</Button>
                <Button type="submit" color="warning" disabled={isSubmitting || loading} className="bg-orange-500 hover:bg-orange-600">
                  {isSubmitting || loading ? "Updating..." : "Update Collection Agency"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  )
}

export default EditCollectionAgencyModal