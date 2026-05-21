import { FC } from "react"
import { Modal } from "flowbite-react"
import { useB2BCustomerStore } from "../../store/b2bCustomerStore"
import { HiX } from "react-icons/hi"
import { Formik, Form } from "formik"
import { FormInput, FormSelect } from "../../components/FormComponents"
import { SaveButton, FormSection } from "../../components/FormHelpers"
import * as Yup from "yup"
import { sanitizeText } from "../../utils/sanitize"

interface EditB2BCustomerModalProps { isOpen: boolean; onClose: () => void }
const schema = Yup.object({ firstName: Yup.string().required(), lastName: Yup.string().required(), email: Yup.string().email().required(), mobileNumber: Yup.string().matches(/^[0-9]{10}$/).required(), gst: Yup.string().optional(), status: Yup.string().oneOf(["Active", "Pending"]).required() })

const EditB2BCustomerModal: FC<EditB2BCustomerModalProps> = ({ isOpen, onClose }) => {
  const { selectedCustomer, updateCustomer, loading } = useB2BCustomerStore()
  if (!selectedCustomer) return null
  const normalizedStatus = String(selectedCustomer.status || "").toLowerCase() === "active" ? "Active" : "Pending"
  return <Modal show={isOpen} onClose={onClose} size="xl"><div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-[#FFCC00]"><h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit B2B Customer</h3><button onClick={onClose} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close"><HiX className="w-5 h-5" /></button></div><div className="p-6"><Formik enableReinitialize initialValues={{ firstName: selectedCustomer.firstName || "", lastName: selectedCustomer.lastName || "", email: selectedCustomer.email || "", mobileNumber: selectedCustomer.mobileNumber || "", gst: selectedCustomer.gst || "", status: normalizedStatus }} validationSchema={schema} onSubmit={async (v) => { await updateCustomer(selectedCustomer.id, { ...v, firstName: sanitizeText(v.firstName), lastName: sanitizeText(v.lastName), email: sanitizeText(v.email), mobileNumber: sanitizeText(v.mobileNumber), gst: sanitizeText(v.gst) }); onClose() }}>{({ isSubmitting }) => <Form className="space-y-4"><FormSection title="Edit Customer Details" icon={null}><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><FormInput name="firstName" label="First Name" required /><FormInput name="lastName" label="Last Name" required /><FormInput name="email" label="Email" type="email" required /><FormInput name="mobileNumber" label="Mobile Number" required /><FormInput name="gst" label="GST" /><FormSelect name="status" label="Status" options={[{value:"Active",label:"Active"},{value:"Pending",label:"Pending"}]} required /></div></FormSection><div className="flex justify-end"><SaveButton loading={loading || isSubmitting}>Update B2B Customer</SaveButton></div></Form>}</Formik></div></Modal>
}

export default EditB2BCustomerModal
