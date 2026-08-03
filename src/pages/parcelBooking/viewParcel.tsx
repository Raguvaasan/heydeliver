import { FC, useEffect } from "react"
import { Badge } from "flowbite-react"
import { HiX } from "react-icons/hi"
import { HiOutlineArchiveBox, HiOutlineClipboardDocumentList, HiOutlineTruck, HiOutlineUser } from "react-icons/hi2"
import { Parcel } from "./addEditParcel"

interface Props {
  isOpen: boolean
  onClose: () => void
  parcel?: Parcel
}

const statusColor: Record<string, string> = {
  "Order Created": "warning",
  Pending: "warning",
  "In Transit": "info",
  Delivered: "success",
  Cancelled: "failure",
}

const SectionTitle: FC<{ title: string; }> = ({ title }) => (
  <div className="mb-3 flex items-center gap-2">
    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600 dark:text-orange-400">{title}</h4>
  </div>
)

// Label-over-value card. Stacking (instead of label-left/value-right on one
// line) is what prevents long labels/values from crowding into each other
// inside a 2-col grid.
const Field: FC<{ label: string; value?: string; highlight?: boolean }> = ({ label, value, highlight = false }) => (
  <div className="rounded-lg bg-white px-3 py-2.5 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700">
    <div className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">{label}</div>
    <div
      className={`mt-1 truncate text-sm font-semibold ${
        highlight ? "text-orange-600 dark:text-orange-400" : "text-gray-900 dark:text-white"
      }`}
      title={value || "N/A"}
    >
      {value || "N/A"}
    </div>
  </div>
)

const ViewParcelModal: FC<Props> = ({ isOpen, onClose, parcel }) => {
  const formatDate = (value?: string) => {
    if (!value) return "N/A"

    const parsedDate = new Date(value)
    if (Number.isNaN(parsedDate.getTime())) return value

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  // Lock background page scroll while the modal is open, and allow Escape to close.
  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen || !parcel) return null

  const amount = Number(parcel.approximateValue || 0) + Number(parcel.transportationCharge || 0)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — pinned */}
        <div className="flex shrink-0 items-start justify-between gap-4 bg-trans_main px-5 py-4 text-white">
          <div className="min-w-0">
            <div className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]">
              Parcel Details
            </div>
            <h3 className="mt-2 truncate text-lg font-bold">Order {parcel.orderId}</h3>
          </div>

          <button
            onClick={onClose}
            className="ml-1 rounded-full p-1.5 text-white/80 hover:bg-white/15 hover:text-white"
            aria-label="Close"
          >
            <HiX className="h-5 w-5" />
          </button>
        </div>

        {/* Body — the only scrollable region */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-3">
            <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
              <SectionTitle title="Delivery Customer" />
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <Field label="Name" value={parcel.deliveryCustomerName} />
                <Field label="Mobile Number" value={parcel.deliveryCustomerMobileNumber} />
                <Field label="Delivery Branch" value={parcel.deliveryBranch} />
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
              <SectionTitle title="Booking Customer" />
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <Field label="Name" value={parcel.bookingCustomerName} />
                <Field label="Mobile Number" value={parcel.bookingMobileNumber} />
              </div>
              <div className="mt-2.5">
                <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  Payment Type
                </div>
                <Badge
                  color={parcel.paymentType === "Paid" ? "success" : "warning"}
                  className="inline-flex rounded-full px-3 py-1.5 text-sm font-semibold"
                >
                  {parcel.paymentType}
                </Badge>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
              <SectionTitle title="Parcel Information" />
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <Field label="Article" value={parcel.article} />
                <Field label="No. of Parcels" value={parcel.numberOfParcels} />
                <Field
                  label="Approx. Value"
                  value={parcel.approximateValue ? `₹${Number(parcel.approximateValue).toLocaleString("en-IN")}` : undefined}
                />
                <Field
                  label="Transport Charge"
                  value={parcel.transportationCharge ? `₹${Number(parcel.transportationCharge).toLocaleString("en-IN")}` : undefined}
                />
              </div>

              <div className="mt-2.5">
                <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  Remarks
                </div>
                <div className="rounded-lg bg-white px-3 py-2 text-sm text-gray-800 ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-700">
                  {parcel.remarks || "-"}
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800">
              <SectionTitle title="Order Summary" />
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <Field label="Order ID" value={parcel.orderId} />
                <div className="rounded-lg bg-white px-3 py-2.5 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700">
                  <div className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">Status</div>
                  <div className="mt-1.5">
                    <Badge color={statusColor[parcel.status] ?? "gray"} className="inline-flex rounded-full px-2.5 py-1 text-xs">
                      {parcel.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
              <SectionTitle title="Tracking Timeline" />
              {parcel.statusHistory && parcel.statusHistory.length > 0 ? (
                <div className="space-y-3">
                  {parcel.statusHistory.map((entry, index) => (
                    <div key={`${entry.status}-${entry.updatedAt || index}`} className="relative pl-6">
                      {index < (parcel.statusHistory?.length ?? 0) - 1 && (
                        <div className="absolute left-[6px] top-2.5 h-[calc(100%+0.5rem)] w-px bg-orange-200 dark:bg-orange-900" />
                      )}
                      <div className="absolute left-0 top-2 h-3 w-3 rounded-full bg-orange-500" />
                      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">{entry.status}</div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400">{formatDate(entry.updatedAt)}</div>
                        </div>
                        {entry.note && <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{entry.note}</p>}
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                          {entry.updatedByName && <span>By {entry.updatedByName}</span>}
                          {entry.updatedByRole && <span>• {entry.updatedByRole}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg bg-white px-3 py-2 text-sm text-gray-600 ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:ring-gray-700">
                  No tracking history available.
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Footer — pinned */}
        <div className="flex shrink-0 justify-end border-t border-gray-200 bg-gray-50 px-5 py-3 dark:border-gray-700 dark:bg-gray-800/70">
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ViewParcelModal