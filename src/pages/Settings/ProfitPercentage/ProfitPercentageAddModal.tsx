import { FC, useEffect, useMemo } from "react"
import { Button, Label, Modal, Select, TextInput } from "flowbite-react"
import { Form, Formik } from "formik"
import * as Yup from "yup"
import { HiOutlineCurrencyRupee, HiX, HiOfficeBuilding } from "react-icons/hi"
import { FormSection } from "../../../components/FormHelpers"
import { useBranchWalletStore } from "../../../store/branchWalletStore"
import { useProfitPercentageStore } from "../../../store/profitPercentageStore"

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const validationSchema = Yup.object({
  agencyId: Yup.string().required("Agency is required"),
  profitPercentage: Yup.number().typeError("Profit percentage must be a number").min(0, "Must be at least 0").required("Profit percentage is required"),
  loadingChargePercentage: Yup.number().typeError("Loading charge must be a number").min(0, "Must be at least 0").required("Loading charge is required"),
  miscChargePercentage: Yup.number().typeError("Misc charge must be a number").min(0, "Must be at least 0").required("Misc charge is required"),
})

const ProfitPercentageAddModal: FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { branchLoading, branchOptions, fetchBranchOptions } = useBranchWalletStore()
  const { updatePercentages } = useProfitPercentageStore()

  const initialValues = useMemo(() => ({
    agencyId: "",
    profitPercentage: "",
    loadingChargePercentage: "",
    miscChargePercentage: "",
  }), [])

  useEffect(() => {
    if (!isOpen) return
    fetchBranchOptions({ page: 1, limit: 50 })
  }, [fetchBranchOptions, isOpen])

  return (
    <Modal show={isOpen} onClose={onClose} size="4xl" position="center">
      <div className="relative max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-2xl dark:bg-gray-800 [scrollbar-width:thin] [scrollbar-color:#64748b_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-500/70 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400/80">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600 p-5 dark:border-gray-700">
          <h3 className="flex items-center gap-2 text-xl font-bold text-white">
            <HiOutlineCurrencyRupee className="h-6 w-6" />
            Add Profit Percentage
          </h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white transition-colors hover:bg-white/20" type="button">
            <HiX className="h-5 w-5" />
          </button>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values, { resetForm, setSubmitting }) => {
            try {
              await updatePercentages(values.agencyId, {
                profitPercentage: Number(values.profitPercentage),
                loadingChargePercentage: Number(values.loadingChargePercentage),
                miscChargePercentage: Number(values.miscChargePercentage),
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
                title="Agency Percentage Information"
                description="Set agency commission and charge percentages"
                icon={<HiOfficeBuilding className="h-5 w-5" />}
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Label value="Agency" />
                    <Select
                      className="mt-2"
                      value={values.agencyId}
                      onChange={(e) => setFieldValue("agencyId", e.target.value)}
                      onBlur={handleBlur}
                    >
                      <option value="">Select agency</option>
                      {branchOptions.map((agency) => (
                        <option key={agency.id} value={agency.id}>
                          {agency.name}
                        </option>
                      ))}
                    </Select>
                    {touched.agencyId && errors.agencyId ? <p className="mt-1 text-sm text-red-600">{errors.agencyId}</p> : null}
                  </div>

                  <div>
                    <Label value="Profit Percentage" />
                    <TextInput
                      name="profitPercentage"
                      type="number"
                      min="0"
                      step="0.01"
                      className="mt-2"
                      value={values.profitPercentage}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter profit percentage"
                    />
                    {touched.profitPercentage && errors.profitPercentage ? <p className="mt-1 text-sm text-red-600">{errors.profitPercentage}</p> : null}
                  </div>

                  <div>
                    <Label value="Loading Charge" />
                    <TextInput
                      name="loadingChargePercentage"
                      type="number"
                      min="0"
                      step="0.01"
                      className="mt-2"
                      value={values.loadingChargePercentage}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter loading charge"
                    />
                    {touched.loadingChargePercentage && errors.loadingChargePercentage ? <p className="mt-1 text-sm text-red-600">{errors.loadingChargePercentage}</p> : null}
                  </div>

                  <div>
                    <Label value="Misc Charge" />
                    <TextInput
                      name="miscChargePercentage"
                      type="number"
                      min="0"
                      step="0.01"
                      className="mt-2"
                      value={values.miscChargePercentage}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter misc charge"
                    />
                    {touched.miscChargePercentage && errors.miscChargePercentage ? <p className="mt-1 text-sm text-red-600">{errors.miscChargePercentage}</p> : null}
                  </div>
                </div>
              </FormSection>

              <div className="flex gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <Button type="submit" disabled={isSubmitting || branchLoading} className="flex-1 bg-orange-500 hover:bg-orange-600">
                  Save
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  )
}

export default ProfitPercentageAddModal
