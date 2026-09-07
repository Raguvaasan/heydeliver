
import { FC } from "react"
import { Button, Label, Modal, Select, TextInput, Textarea } from "flowbite-react"
import { Form, Formik } from "formik"
import * as Yup from "yup"
import { HiX } from "react-icons/hi"
import { useB2BCustomerStore, B2BCustomer } from "../../store/b2bCustomerStore"

type Mode = "add" | "edit"

interface Props {
  isOpen: boolean
  onClose: () => void
  mode: Mode
  customer?: B2BCustomer | null
}

const schema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Name is required"),

  mobileNumber: Yup.string()
    .matches(/^[0-9]{10}$/, "Enter a valid 10 digit mobile number")
    .required("Mobile number is required"),

  address: Yup.string()
    .trim()
    .required("Address is required"),

  state: Yup.string()
    .trim()
    .required("State is required"),

  pincode: Yup.string()
    .matches(/^[0-9]{6}$/, "Enter a valid 6 digit pincode")
    .required("Pincode is required"),

  gstNumber: Yup.string()
    .trim()
    .required("GST number is required"),

  status: Yup.string()
    .oneOf(["Active", "Inactive"])
    .required("Status is required"),
})

const AddEditB2BCustomerModal: FC<Props> = ({
  isOpen,
  onClose,
  mode,
  customer,
}) => {
  const { addCustomer, updateCustomer, loading } = useB2BCustomerStore()

  const isEdit = mode === "edit"

  const initialValues = {
    name: customer?.name || "",
    mobileNumber: customer?.mobileNumber || "",
    address: customer?.address || "",
    state: customer?.state || "",
    pincode: customer?.pincode || "",
    gstNumber: customer?.gstNumber || "",
    status: (customer?.status === "Inactive"
      ? "Inactive"
      : "Active") as "Active" | "Inactive",
  }

  return (
    <Modal show={isOpen} onClose={onClose} size="xl">
      <div className="flex items-center justify-between border-b border-gray-200 bg-[#FFCC00] px-6 py-4 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900">
          {isEdit ? "Edit B2B Customer" : "Add B2B Customer"}
        </h3>

        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Close"
        >
          <HiX className="h-5 w-5" />
        </button>
      </div>

      <div className="p-6">
        <Formik
          key={`${isOpen ? "open" : "closed"}-${mode}-${customer?.id || "new"}`}
          enableReinitialize
          initialValues={initialValues}
          validationSchema={schema}
          onSubmit={async (values) => {
            if (isEdit && customer?.id) {
              await updateCustomer(customer.id, {
                name: values.name,
                mobileNumber: values.mobileNumber,
                address: values.address,
                state: values.state,
                pincode: values.pincode,
                gstNumber: values.gstNumber,
                status: values.status,
              })
            } else {
              await addCustomer({
                name: values.name,
                mobileNumber: values.mobileNumber,
                address: values.address,
                state: values.state,
                pincode: values.pincode,
                gstNumber: values.gstNumber,
              })
            }

            onClose()
          }}
        >
          {({
            values,
            handleChange,
            errors,
            touched,
            isSubmitting,
          }) => (
            <Form className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                {/* Name */}
                <div>
                  <Label htmlFor="name" value="Name" />

                  <TextInput
                    id="name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    placeholder="Enter customer name"
                    color={
                      errors.name && touched.name
                        ? "failure"
                        : undefined
                    }
                  />

                  {errors.name && touched.name && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Mobile Number */}
                <div>
                  <Label htmlFor="mobileNumber" value="Mobile Number" />

                  <TextInput
                    id="mobileNumber"
                    name="mobileNumber"
                    value={values.mobileNumber}
                    onChange={handleChange}
                    placeholder="Enter 10 digit mobile number"
                    maxLength={10}
                    color={
                      errors.mobileNumber && touched.mobileNumber
                        ? "failure"
                        : undefined
                    }
                  />

                  {errors.mobileNumber && touched.mobileNumber && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.mobileNumber}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <Label htmlFor="address" value="Address" />

                  <Textarea
                    id="address"
                    name="address"
                    value={values.address}
                    onChange={handleChange}
                    placeholder="Enter customer address"
                    rows={3}
                    color={
                      errors.address && touched.address
                        ? "failure"
                        : undefined
                    }
                  />

                  {errors.address && touched.address && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* State */}
                <div>
                  <Label htmlFor="state" value="State" />

                  <TextInput
                    id="state"
                    name="state"
                    value={values.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                    color={
                      errors.state && touched.state
                        ? "failure"
                        : undefined
                    }
                  />

                  {errors.state && touched.state && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.state}
                    </p>
                  )}
                </div>

                {/* Pincode */}
                <div>
                  <Label htmlFor="pincode" value="Pincode" />

                  <TextInput
                    id="pincode"
                    name="pincode"
                    value={values.pincode}
                    onChange={handleChange}
                    placeholder="Enter 6 digit pincode"
                    maxLength={6}
                    color={
                      errors.pincode && touched.pincode
                        ? "failure"
                        : undefined
                    }
                  />

                  {errors.pincode && touched.pincode && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.pincode}
                    </p>
                  )}
                </div>

                {/* GST Number */}
                <div>
                  <Label htmlFor="gstNumber" value="GST Number" />

                  <TextInput
                    id="gstNumber"
                    name="gstNumber"
                    value={values.gstNumber}
                    onChange={handleChange}
                    placeholder="Enter GST number"
                    color={
                      errors.gstNumber && touched.gstNumber
                        ? "failure"
                        : undefined
                    }
                  />

                  {errors.gstNumber && touched.gstNumber && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.gstNumber}
                    </p>
                  )}
                </div>

                {/* Status */}
                {isEdit && (
                  <div>
                    <Label htmlFor="status" value="Status" />

                    <Select
                      id="status"
                      name="status"
                      value={values.status}
                      onChange={handleChange}
                    >
                      <option value="">Select status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </Select>

                    {errors.status && touched.status && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.status}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  color="gray"
                  type="button"
                  onClick={onClose}
                >
                  Cancel
                </Button>

                <Button
                  color="warning"
                  type="submit"
                  disabled={loading || isSubmitting}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {isEdit
                    ? "Update B2B Customer"
                    : "Add B2B Customer"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  )
}

export default AddEditB2BCustomerModal
