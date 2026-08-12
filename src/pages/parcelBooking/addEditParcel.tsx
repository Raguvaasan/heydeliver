// addEditParcel.tsx
import { FC, useEffect, useRef, useState } from "react"
import { Modal } from "flowbite-react"
import { Formik, Form, useField } from "formik"
import * as Yup from "yup"
import { HiOutlineUser, HiOutlineArchiveBox, HiInformationCircle } from "react-icons/hi2"
import { HiX, HiExclamationCircle } from "react-icons/hi"
import { FormInput, FormSelect } from "../../components/FormComponents"
import { FormSection, SaveButton } from "../../components/FormHelpers"
import toast from "react-hot-toast"

export interface ParcelFormValues {
    deliveryCustomerName: string
    deliveryCustomerMobileNumber: string
    deliveryCustomerAddress: string
    deliveryCustomerGstNumber: string
    deliveryBranch: string

    bookingCustomerName: string
    bookingMobileNumber: string
    bookingCustomerAddress: string
    bookingCustomerGstNumber: string
    paymentType: "Paid" | "To Pay"

    article: string
    remarks: string
    numberOfParcels: string
    approximateValue: string
    transportationCharge: string

    status: string
}

export interface StatusHistoryEntry {
    status: string
    note?: string
    updatedBy?: string
    updatedByRole?: string
    updatedByName?: string
    updatedAt?: string
}

export interface Parcel extends ParcelFormValues {
    id: string
    orderId: string
    bookingDate?: string
    deliveryBranchId?: string
    branchName?: string
    hubId?: string
    hubName?: string
    statusHistory?: StatusHistoryEntry[]
    assignedDriverId: string
    assignedDriverName: string
    assignedVehicleId: string
    assignedVehicleLabel: string
    createdAt: any
    driver?: {
        _id?: string
        driverName?: string
        phoneNumber?: string
        licenseNumber?: string
        status?: string
    }
    vehicle?: {
        _id?: string
        vehicleType?: string
        capacity?: string
        vehicleRegistrationNumber?: string
        status?: string
    }
    bookingCustomer?: {
        name?: string
        mobileNumber?: string
        address?: string
    }
    deliveryCustomer?: {
        name?: string
        mobileNumber?: string
        address?: string
    }
}

interface Props {
    isOpen: boolean
    onClose: () => void
    mode: "add" | "edit"
    parcel?: Parcel
    onSuccess?: (parcel: Parcel) => void
    chargeOnly?: boolean
}

interface DeliveryBranchOption {
    id: string
    agencyName: string
}

const FormRadioGroup: FC<{
    name: string
    label: string
    required?: boolean
    disabled?: boolean
    options: { value: string; label: string }[]
}> = ({ name, label, required, disabled, options }) => {
    const [field, meta] = useField(name)

    return (
        <div>
            <div className="flex items-center gap-1 mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>
                {required && <span className="text-red-500">*</span>}
            </div>

            <div className="flex items-center gap-6">
                {options.map((opt) => (
                    <label key={opt.value} className={`flex items-center gap-2 ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                        <input
                            type="radio"
                            name={name}
                            value={opt.value}
                            checked={field.value === opt.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            disabled={disabled}
                            className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
                    </label>
                ))}
            </div>

            {meta.touched && meta.error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{meta.error}</p>}
        </div>
    )
}

const fullSchema = Yup.object({
    deliveryCustomerName: Yup.string().trim().required("Delivery customer name is required").min(2).max(100),
    deliveryCustomerMobileNumber: Yup.string().trim().required("Delivery customer mobile number is required").matches(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
    deliveryCustomerAddress: Yup.string().trim().required("Delivery customer address is required").min(5).max(250),
    deliveryCustomerGstNumber: Yup.string()
        .trim()
        .optional()
        .transform((value) => (value ? value.toUpperCase() : ""))
        .matches(/^$|^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, "Enter a valid GSTIN"),
    deliveryBranch: Yup.string().trim().required("Delivery branch is required").min(2),
    bookingCustomerName: Yup.string().trim().required("Booking customer name is required").min(2).max(100),
    bookingMobileNumber: Yup.string().trim().required("Booking customer mobile number is required").matches(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
    bookingCustomerAddress: Yup.string().trim().required("Booking customer address is required").min(5).max(250),
    bookingCustomerGstNumber: Yup.string()
        .trim()
        .optional()
        .transform((value) => (value ? value.toUpperCase() : ""))
        .matches(/^$|^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, "Enter a valid GSTIN"),
    paymentType: Yup.string().oneOf(["Paid", "To Pay"]).required("Payment type is required"),
    article: Yup.string().trim().required("Article is required").min(2).max(100),
    remarks: Yup.string().trim().max(250),
    numberOfParcels: Yup.number().typeError("Must be a valid number").required().integer().positive().max(9999),
    approximateValue: Yup.number().typeError("Must be a valid number").required().positive().max(9999999),
    transportationCharge: Yup.number().typeError("Must be a valid number").min(0).required("Transportation charge is required"),
})

// Charge-only mode: skip validating fields the user can't touch.
const chargeSchema = Yup.object({
    transportationCharge: Yup.number().typeError("Must be a valid number").min(0).required("Transportation charge is required"),
})

const emptyValues: ParcelFormValues = {
    deliveryCustomerName: "",
    deliveryCustomerMobileNumber: "",
    deliveryCustomerAddress: "",
    deliveryCustomerGstNumber: "",
    deliveryBranch: "",
    bookingCustomerName: "",
    bookingMobileNumber: "",
    bookingCustomerAddress: "",
    bookingCustomerGstNumber: "",
    paymentType: "Paid",
    article: "",
    remarks: "",
    numberOfParcels: "",
    approximateValue: "",
    transportationCharge: "0",
    status: "Order Created",
}

const BRANCH_BASE = "/api/admin/branch/parcel-order"
const ADMIN_BASE = "/api/admin/parcel-order"
const DELIVERY_BRANCH_OPTIONS_BASE = "/api/admin/branch/parcel-order/options/delivery-branches"

const AddEditParcel: FC<Props> = ({ isOpen, onClose, mode, parcel, onSuccess, chargeOnly = false }) => {
    const isEdit = mode === "edit"
    const loginType = String(sessionStorage.getItem("loginType") || "").toLowerCase()
    const isAdminUser = loginType === "admin"
    const [apiError, setApiError] = useState<string | null>(null)
    const [deliveryBranches, setDeliveryBranches] = useState<DeliveryBranchOption[]>([])
    const [deliveryBranchesLoading, setDeliveryBranchesLoading] = useState(false)
    const resetFormRef = useRef<null | ((nextState?: { values: ParcelFormValues }) => void)>(null)

    const resolveDeliveryBranchValue = () => {
        if (!isEdit || !parcel) return ""

        const directId = parcel.deliveryBranchId || ""
        if (directId) return directId

        const branchName = parcel.deliveryBranch || ""
        if (!branchName) return ""

        const matchedBranch = deliveryBranches.find(
            (branch) =>
                branch.id === branchName ||
                branch.agencyName === branchName
        )

        return matchedBranch?.id || branchName
    }

    const initialValues: ParcelFormValues = isEdit && parcel
        ? {
            deliveryCustomerName: parcel.deliveryCustomerName || "",
            deliveryCustomerMobileNumber: parcel.deliveryCustomerMobileNumber || "",
            deliveryCustomerAddress: parcel.deliveryCustomerAddress || "",
            deliveryCustomerGstNumber: parcel.deliveryCustomerGstNumber || "",
            deliveryBranch: resolveDeliveryBranchValue(),
            bookingCustomerName: parcel.bookingCustomerName || "",
            bookingMobileNumber: parcel.bookingMobileNumber || "",
            bookingCustomerAddress: parcel.bookingCustomerAddress || "",
            bookingCustomerGstNumber: parcel.bookingCustomerGstNumber || "",
            paymentType: parcel.paymentType || "Paid",
            article: parcel.article || "",
            remarks: parcel.remarks || "",
            numberOfParcels: parcel.numberOfParcels || "",
            approximateValue: parcel.approximateValue || "",
            transportationCharge: parcel.transportationCharge || "0",
            status: parcel.status || "Order Created",
        }
        : emptyValues
    const fieldsDisabled = chargeOnly // everything but transportationCharge is locked

    const handleClose = () => {
        resetFormRef.current?.({ values: emptyValues })
        setApiError(null)
        onClose()
    }

    useEffect(() => {
        if (!isOpen || chargeOnly) return

        let cancelled = false

        const fetchDeliveryBranches = async () => {
            setDeliveryBranchesLoading(true)

            try {
                const authToken = sessionStorage.getItem("authToken")
                if (!authToken) throw new Error("Authorization token missing")

                const res = await fetch(DELIVERY_BRANCH_OPTIONS_BASE, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                })

                if (!res.ok) {
                    const errBody = await res.json().catch(() => null)
                    throw new Error(errBody?.message || "Failed to load delivery branches")
                }

                const payload = await res.json()
                const records = Array.isArray(payload)
                    ? payload
                    : Array.isArray(payload?.data)
                        ? payload.data
                        : Array.isArray(payload?.data?.branches)
                            ? payload.data.branches
                            : Array.isArray(payload?.branches)
                                ? payload.branches
                                : []

                if (cancelled) return

                setDeliveryBranches(
                    records.map((item: any) => ({
                        id: String(item._id || item.id || item.branchId || item.agencyName || ""),
                        agencyName: String(item.agencyName || item.name || item.branchName || ""),
                    }))
                )
            } catch {
                if (!cancelled) {
                    setDeliveryBranches([])
                }
            } finally {
                if (!cancelled) {
                    setDeliveryBranchesLoading(false)
                }
            }
        }

        fetchDeliveryBranches()

        return () => {
            cancelled = true
        }
    }, [isOpen, chargeOnly])

   const handleSubmit = async (
    values: ParcelFormValues,
    { setSubmitting }: { setSubmitting: (v: boolean) => void }
) => {
    setApiError(null);

    try {
        const authToken = sessionStorage.getItem("authToken");
        if (!authToken) throw new Error("Authorization token missing");

        // Charge Only
        if (chargeOnly) {
            if (!parcel?.id) throw new Error("Missing booking reference");

            const res = await fetch(`${ADMIN_BASE}/${parcel.id}/charge`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    transportationCharge: Number(values.transportationCharge),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.message || "Failed to update transportation charge"
                );
            }

            onSuccess?.(data);
            resetFormRef.current?.({ values: emptyValues });
            setApiError(null);
            onClose();
            return;
        }

        // Create / Update Payload
        const payload = {
            bookingCustomer: {
                name: values.bookingCustomerName.trim(),
                mobileNumber: values.bookingMobileNumber.trim(),
                address: values.bookingCustomerAddress.trim(),
                ...(values.bookingCustomerGstNumber.trim()
                    ? {
                          gstNumber: values.bookingCustomerGstNumber
                              .trim()
                              .toUpperCase(),
                      }
                    : {}),
            },
            paymentType: values.paymentType,
            deliveryCustomer: {
                name: values.deliveryCustomerName.trim(),
                mobileNumber: values.deliveryCustomerMobileNumber.trim(),
                address: values.deliveryCustomerAddress.trim(),
                ...(values.deliveryCustomerGstNumber.trim()
                    ? {
                          gstNumber: values.deliveryCustomerGstNumber
                              .trim()
                              .toUpperCase(),
                      }
                    : {}),
                deliveryBranch: values.deliveryBranch.trim(),
            },
            parcelDetails: {
                article: values.article.trim(),
                remarks: values.remarks.trim(),
                numberOfParcels: Number(values.numberOfParcels),
                approximateValue: Number(values.approximateValue),
            },
        };

        const url =
            isEdit && parcel?.id
                ? `${BRANCH_BASE}/${parcel.id}`
                : BRANCH_BASE;

        const method = isEdit ? "PUT" : "POST";

        const res = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
            throw new Error(
                data?.message ||
                    `Failed to ${isEdit ? "update" : "create"} booking`
            );
        }

        const savedParcel: Parcel = data;

        onSuccess?.(savedParcel);
        resetFormRef.current?.({ values: emptyValues });
        setApiError(null);
        onClose();
    } catch (err) {
        const message =
            err instanceof Error
                ? err.message
                : "Something went wrong. Please try again.";

        setApiError(message);
        toast.error(message);
    } finally {
        setSubmitting(false);
    }
};

    return (
        <Modal show={isOpen} onClose={handleClose} size="4xl">
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl">
                <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-500 to-orange-600">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <HiOutlineArchiveBox className="w-6 h-6" />
                        {chargeOnly ? "Update Transportation Charge" : isEdit ? "Edit Parcel Booking" : "New Parcel Booking"}
                    </h3>

                    <button onClick={handleClose} className="text-white hover:bg-white/20 rounded-lg p-1.5">
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

                    {chargeOnly && (
                        <div className="mb-4 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            <HiInformationCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span>Booking details are read-only here. Only the transportation charge can be updated.</span>
                        </div>
                    )}

                    <Formik
                        initialValues={initialValues}
                        enableReinitialize
                        validationSchema={chargeOnly ? chargeSchema : fullSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ isSubmitting, resetForm }) => {
                            resetFormRef.current = resetForm
                            return (
                                <Form className="space-y-6">
                                    <FormSection title="Deliver Customer" description="Details of the customer receiving the parcel" icon={<HiOutlineUser className="w-5 h-5" />}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormInput name="deliveryCustomerName" label="Name" required disabled={fieldsDisabled} />
                                            <FormInput name="deliveryCustomerMobileNumber" label="Mobile Number" required disabled={fieldsDisabled} />
                                            <FormInput name="deliveryCustomerAddress" label="Address" required disabled={fieldsDisabled} />
                                            <FormInput name="deliveryCustomerGstNumber" label="GST Number" disabled={fieldsDisabled} helperText="Optional, must be a valid GSTIN if provided" />
                                            <FormSelect
                                                name="deliveryBranch"
                                                label="Delivery Agency"
                                                required
                                                disabled={fieldsDisabled || deliveryBranchesLoading}
                                                options={deliveryBranches.map((branch) => ({
                                                    value: branch.id,
                                                    label: branch.agencyName,
                                                }))}
                                                helperText={deliveryBranchesLoading ? "Loading delivery branches..." : undefined}
                                            />
                                        </div>
                                    </FormSection>

                                    <FormSection title="Booking Customer" description="Details of the customer booking the parcel" icon={<HiOutlineUser className="w-5 h-5" />}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormInput name="bookingCustomerName" label="Name" required disabled={fieldsDisabled} />
                                            <FormInput name="bookingMobileNumber" label="Mobile Number" required disabled={fieldsDisabled} />
                                            <FormInput name="bookingCustomerAddress" label="Address" required disabled={fieldsDisabled} />
                                            <FormInput name="bookingCustomerGstNumber" label="GST Number" disabled={fieldsDisabled} helperText="Optional, must be a valid GSTIN if provided" />

                                            <div className="md:col-span-2">
                                                <FormRadioGroup
                                                    name="paymentType"
                                                    label="Payment Type"
                                                    required
                                                    disabled={fieldsDisabled}
                                                    options={[
                                                        { value: "Paid", label: "Paid" },
                                                        { value: "To Pay", label: "To Pay" },
                                                    ]}
                                                />
                                            </div>
                                        </div>
                                    </FormSection>

                                    <FormSection title="Article Details" description="Parcel content and charge details" icon={<HiOutlineArchiveBox className="w-5 h-5" />}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormInput name="article" label="Article" required disabled={fieldsDisabled} />
                                            <FormInput name="numberOfParcels" label="Number of Parcels" type="number" required disabled={fieldsDisabled} />
                                            <FormInput name="approximateValue" label="Approximate Value" type="number" required disabled={fieldsDisabled} />

                                            <div>
                                                <FormInput
                                                    name="transportationCharge"
                                                    label="Transportation Charge"
                                                    type="number"
                                                    required
                                                    disabled={!isAdminUser}
                                                />
                                                <p className="mt-1.5 flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg">
                                                    <HiInformationCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                    {isAdminUser
                                                        ? "This field can be updated by admin users."
                                                        : "The transportation charge is set by the administrator."}
                                                </p>
                                            </div>

                                            <div className="md:col-span-2">
                                                <FormInput name="remarks" label="Remarks" disabled={fieldsDisabled} />
                                            </div>
                                        </div>
                                    </FormSection>

                                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                resetForm({ values: emptyValues })
                                                handleClose()
                                            }}
                                            disabled={isSubmitting}
                                            className="flex-1 px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                                        >
                                            Cancel
                                        </button>

                                        <SaveButton
                                            loading={isSubmitting}
                                            className="flex-1"
                                        >
                                            {chargeOnly ? "Update Charge" : isEdit ? "Update Booking" : "Create Booking"}
                                        </SaveButton>
                                    </div>
                                </Form>
                            )
                        }}
                    </Formik>
                </div>
            </div>
        </Modal>
    )
}

export default AddEditParcel
