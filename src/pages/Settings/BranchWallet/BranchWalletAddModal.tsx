import { FC, useEffect, useMemo, useState } from "react"
import { Button, Label, Modal, Select, TextInput, Textarea } from "flowbite-react"
import { Form, Formik } from "formik"
import * as Yup from "yup"
import { HiOutlineCurrencyRupee, HiX, HiOfficeBuilding } from "react-icons/hi"
import BranchWalletBranchSelector from "./BranchWalletBranchSelector"
import { FormSection } from "../../../components/FormHelpers"
import { useBranchWalletStore } from "../../../store/branchWalletStore"

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const validationSchema = Yup.object({
  branchId: Yup.string().required("Branch is required"),
  amount: Yup.number().typeError("Amount must be a number").positive("Amount must be greater than 0").required("Amount is required"),
  paymentMethod: Yup.string().oneOf(["Cash", "UPI", "Bank"], "Select a valid payment method").required("Payment method is required"),
  reference: Yup.string().trim().min(2, "Reference must be at least 2 characters").max(100, "Reference must not exceed 100 characters").required("Reference is required"),
  remarks: Yup.string().trim().max(250, "Remarks must not exceed 250 characters").optional(),
})

const BranchWalletAddModal: FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [currentBalance, setCurrentBalance] = useState(0)
  const { branchLoading, branchOptions, branchPagination, fetchBranchOptions, addBranchCredit } = useBranchWalletStore()

  const initialValues = useMemo(() => ({
    branchId: "",
    amount: "",
    paymentMethod: "Cash",
    reference: "",
    remarks: "",
  }), [])

  useEffect(() => {
    if (!isOpen) return
    fetchBranchOptions({ page: 1, limit: 10 })
  }, [fetchBranchOptions, isOpen])

  return (
    <Modal show={isOpen} onClose={onClose} size="4xl" position="center">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#64748b_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-500/70 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400/80">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-500 to-orange-600">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <HiOutlineCurrencyRupee className="w-6 h-6" />
            Add Branch Wallet Credit
          </h3>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors" type="button">
            <HiX className="w-5 h-5" />
          </button>
        </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm, setSubmitting }) => {
          try {
            await addBranchCredit(values.branchId, {
              amount: values.amount,
              paymentMethod: values.paymentMethod as "Cash" | "UPI" | "Bank",
              reference: values.reference.trim(),
              remarks: values.remarks?.trim() || "",
            })
            resetForm()
            onClose()
            onSuccess()
          } finally {
            setSubmitting(false)
          }
        }}
      >
        {({ values, handleChange, handleBlur, touched, errors, setFieldValue, isSubmitting }) => (
          <Form className="p-6">
            <FormSection
              title="Branch Wallet Information"
              description="Enter branch credit details"
              icon={<HiOfficeBuilding className="w-5 h-5" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 flex flex-col gap-2">
                  <Label value="Branch" />
                  <BranchWalletBranchSelector
                    value={values.branchId}
                    options={branchOptions}
                    loading={branchLoading}
                    pagination={branchPagination}
                    onChange={(branchId, balance) => {
                      setFieldValue("branchId", branchId)
                      setCurrentBalance(balance || 0)
                    }}
                  />
                  {touched.branchId && errors.branchId ? <p className="text-sm text-red-600">{errors.branchId}</p> : null}
                </div>

                <div>
                  <Label value="Current Balance" />
                  <TextInput className="mt-2" readOnly value={`₹ ${Number(currentBalance || 0).toLocaleString()}`} />
                </div>

                <div>
                  <Label value="Amount" />
                  <TextInput
                    name="amount"
                    type="number"
                    min="1"
                    step="0.01"
                    className="mt-2"
                    value={values.amount}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter amount"
                  />
                  {touched.amount && errors.amount ? <p className="mt-1 text-sm text-red-600">{errors.amount}</p> : null}
                </div>

                <div>
                  <Label value="Payment Method" />
                  <Select name="paymentMethod" className="mt-2" value={values.paymentMethod} onChange={handleChange} onBlur={handleBlur}>
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank">Bank</option>
                  </Select>
                  {touched.paymentMethod && errors.paymentMethod ? <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p> : null}
                </div>

                <div>
                  <Label value="Reference" />
                  <TextInput
                    name="reference"
                    className="mt-2"
                    value={values.reference}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Transaction / receipt reference"
                  />
                  {touched.reference && errors.reference ? <p className="mt-1 text-sm text-red-600">{errors.reference}</p> : null}
                </div>

                <div className="md:col-span-2">
                  <Label value="Remarks" />
                  <Textarea
                    name="remarks"
                    className="mt-2"
                    rows={3}
                    value={values.remarks}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Optional remarks"
                  />
                  {touched.remarks && errors.remarks ? <p className="mt-1 text-sm text-red-600">{errors.remarks}</p> : null}
                </div>
              </div>
            </FormSection>

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <Button type="submit" disabled={isSubmitting || branchLoading} className="flex-1 bg-orange-500 hover:bg-orange-600">
                Add Credit
              </Button>
            </div>
          </Form>
        )}
      </Formik>
      </div>
    </Modal>
  )
}

export default BranchWalletAddModal
