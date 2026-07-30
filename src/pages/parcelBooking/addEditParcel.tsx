import { FC, useState } from "react"
import { Modal } from "flowbite-react"
import { Formik, Form, useField } from "formik"
import * as Yup from "yup"
import {
    HiOutlineUser,
    HiOutlineArchiveBox,
    HiInformationCircle,
} from "react-icons/hi2"
import { HiX, HiExclamationCircle } from "react-icons/hi"
import { FormInput, FormSelect } from "../../components/FormComponents"
import { FormSection, SaveButton } from "../../components/FormHelpers"

export interface ParcelFormValues {
    deliverCustomerName: string
    deliverMobileNumber: string
    deliveryState: string
    deliveryCityBranch: string

    bookingCustomerName: string
    bookingMobileNumber: string
    paymentType: "Paid" | "To Pay"

    article: string
    remarks: string
    numberOfParcels: string
    approximateValue: string
    transportationCharge: string

    status: "Pending" | "In Transit" | "Delivered" | "Cancelled"
    receivedFrom: string
    deliverTo: string
}

export interface Parcel extends ParcelFormValues {
    id: string
    orderId: string
}

interface Props {
    isOpen: boolean
    onClose: () => void
    mode: "add" | "edit"
    parcel?: Parcel
    onSuccess?: (parcel: Parcel) => void
}

// Simple radio group, since FormComponents doesn't have one yet
const FormRadioGroup: FC<{
    name: string
    label: string
    required?: boolean
    options: { value: string; label: string }[]
}> = ({ name, label, required, options }) => {
    const [field, meta] = useField(name)

    return (
        <div>
            <div className="flex items-center gap-1 mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>
                {required && <span className="text-red-500">*</span>}
            </div>

            <div className="flex items-center gap-6">
                {options.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name={name}
                            value={opt.value}
                            checked={field.value === opt.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
                    </label>
                ))}
            </div>

            {meta.touched && meta.error && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{meta.error}</p>
            )}
        </div>
    )
}

const INDIAN_STATES = [
    "Tamil Nadu",
    "Karnataka",
    "Kerala",
    "Andhra Pradesh",
    "Telangana",
    "Maharashtra",
    "Delhi",
    // extend as needed
]

const schema = Yup.object({
    deliverCustomerName: Yup.string()
        .trim()
        .required("Delivery customer name is required")
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name cannot exceed 100 characters"),

    deliverMobileNumber: Yup.string()
        .trim()
        .required("Delivery customer mobile number is required")
        .matches(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),

    deliveryState: Yup.string().required("Delivery state is required"),

    deliveryCityBranch: Yup.string()
        .trim()
        .required("Delivery city/branch is required")
        .min(2, "City/branch must be at least 2 characters"),

    bookingCustomerName: Yup.string()
        .trim()
        .required("Booking customer name is required")
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name cannot exceed 100 characters"),

    bookingMobileNumber: Yup.string()
        .trim()
        .required("Booking customer mobile number is required")
        .matches(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),

    paymentType: Yup.string()
        .oneOf(["Paid", "To Pay"], "Select a valid payment type")
        .required("Payment type is required"),

    article: Yup.string()
        .trim()
        .required("Article is required")
        .min(2, "Article must be at least 2 characters")
        .max(100, "Article cannot exceed 100 characters"),

    remarks: Yup.string().trim().max(250, "Remarks cannot exceed 250 characters"),

    numberOfParcels: Yup.number()
        .typeError("Number of parcels must be a valid number")
        .required("Number of parcels is required")
        .integer("Number of parcels must be a whole number")
        .positive("Number of parcels must be greater than 0")
        .max(9999, "Number of parcels is too large"),

    approximateValue: Yup.number()
        .typeError("Approximate value must be a valid number")
        .required("Approximate value is required")
        .positive("Approximate value must be greater than 0")
        .max(9999999, "Approximate value is too large"),

    transportationCharge: Yup.number()
        .typeError("Transportation charge must be a valid number")
        .min(0, "Transportation charge cannot be negative")
        .required("Transportation charge is required"),

    status: Yup.string()
        .oneOf(["Pending", "In Transit", "Delivered", "Cancelled"], "Select a valid status")
        .required("Status is required"),
})

const emptyValues: ParcelFormValues = {
    deliverCustomerName: "",
    deliverMobileNumber: "",
    deliveryState: "",
    deliveryCityBranch: "",

    bookingCustomerName: "",
    bookingMobileNumber: "",
    paymentType: "Paid",

    article: "",
    remarks: "",
    numberOfParcels: "",
    approximateValue: "",
    transportationCharge: "0",

    status: "Pending",
     receivedFrom:'',
        deliverTo:""
}

const API_BASE = "/api/parcels" // adjust to your actual base URL / service

const AddEditParcel: FC<Props> = ({ isOpen, onClose, mode, parcel, onSuccess }) => {
    const isEdit = mode === "edit"
    const [apiError, setApiError] = useState<string | null>(null)

    const initialValues: ParcelFormValues = isEdit && parcel ? parcel : emptyValues

    const handleSubmit = async (
        values: ParcelFormValues,
        { setSubmitting }: { setSubmitting: (v: boolean) => void }
    ) => {
        setApiError(null)

        const payload = {
            ...values,
            numberOfParcels: Number(values.numberOfParcels),
            approximateValue: Number(values.approximateValue),
            transportationCharge: Number(values.transportationCharge),
        }

        try {
            const url = isEdit ? `${API_BASE}/${parcel?.id}` : API_BASE
            const method = isEdit ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const errBody = await res.json().catch(() => null)
                throw new Error(errBody?.message || `Failed to ${isEdit ? "update" : "create"} booking`)
            }

            const savedParcel: Parcel = await res.json()

            onSuccess?.(savedParcel)
            onClose()
        } catch (err) {
            setApiError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Modal show={isOpen} onClose={onClose} size="4xl">
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl">
                <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-500 to-orange-600">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <HiOutlineArchiveBox className="w-6 h-6" />
                        {isEdit ? "Edit Parcel Booking" : "New Parcel Booking"}
                    </h3>

                    <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-1.5">
                        <HiX className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 max-h-[75vh] overflow-y-auto">
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
                                {/* Deliver Customer */}
                                <FormSection
                                    title="Deliver Customer"
                                    description="Details of the customer receiving the parcel"
                                    icon={<HiOutlineUser className="w-5 h-5" />}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormInput name="deliverCustomerName" label="Name" required />
                                        <FormInput name="deliverMobileNumber" label="Mobile Number" required />

                                        <FormSelect
                                            name="deliveryState"
                                            label="Delivery State"
                                            required
                                            options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
                                        />

                                        <FormInput name="deliveryCityBranch" label="Delivery City / Branch" required />
                                    </div>
                                </FormSection>

                                {/* Booking Customer */}
                                <FormSection
                                    title="Booking Customer"
                                    description="Details of the customer booking the parcel"
                                    icon={<HiOutlineUser className="w-5 h-5" />}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormInput name="bookingCustomerName" label="Name" required />
                                        <FormInput name="bookingMobileNumber" label="Mobile Number" required />

                                        <div className="md:col-span-2">
                                            <FormRadioGroup
                                                name="paymentType"
                                                label="Payment Type"
                                                required
                                                options={[
                                                    { value: "Paid", label: "Paid" },
                                                    { value: "To Pay", label: "To Pay" },
                                                ]}
                                            />
                                        </div>
                                    </div>
                                </FormSection>

                                {/* Article */}
                                <FormSection
                                    title="Article Details"
                                    description="Parcel content and charge details"
                                    icon={<HiOutlineArchiveBox className="w-5 h-5" />}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormInput name="article" label="Article" required />
                                        <FormInput name="numberOfParcels" label="Number of Parcels" type="number" required />
                                        <FormInput name="approximateValue" label="Approximate Value" type="number" required />

                                        <div>
                                            <FormInput
                                                name="transportationCharge"
                                                label="Transportation Charge"
                                                type="number"
                                                required
                                                disabled={!isEdit}
                                            />
                                            <p className="mt-1.5 flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                <HiInformationCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                The transportation charge is automatically applied based on the
                                                configured values maintained by the administrator.
                                                {isEdit ? " You may override it here if needed." : ""}
                                            </p>
                                        </div>

                                        <div className="md:col-span-2">
                                            <FormInput name="remarks" label="Remarks" />
                                        </div>

                                        {isEdit && (
                                            <FormSelect
                                                name="status"
                                                label="Booking Status"
                                                required
                                                options={[
                                                    { value: "Pending", label: "Pending" },
                                                    { value: "In Transit", label: "In Transit" },
                                                    { value: "Delivered", label: "Delivered" },
                                                    { value: "Cancelled", label: "Cancelled" },
                                                ]}
                                            />
                                        )}
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
                                        {isEdit ? "Update Booking" : "Create Booking"}
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

export default AddEditParcel