import { FC } from "react"
import { Modal, Badge } from "flowbite-react"
import { Parcel } from "./addEditParcel"

interface Props {
  isOpen: boolean
  onClose: () => void
  parcel?: Parcel
}

const statusColor: Record<string, string> = {
  Pending: "warning",
  "In Transit": "info",
  Delivered: "success",
  Cancelled: "failure",
}

const ViewParcelModal: FC<Props> = ({ isOpen, onClose, parcel }) => {
  if (!parcel) return null

  const InfoRow: FC<{ label: string; value: string | undefined }> = ({ label, value }) => (
    <div className="flex flex-col md:flex-row md:items-center py-3 border-b border-gray-200 dark:border-gray-700">
      <div className="w-full md:w-1/3 font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-0">{label}</div>
      <div className="w-full md:w-2/3 text-gray-900 dark:text-white">{value || "N/A"}</div>
    </div>
  )

  const SectionTitle: FC<{ title: string }> = ({ title }) => (
    <h4 className="text-sm font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400 pt-5 pb-2 first:pt-0">
      {title}
    </h4>
  )

  const amount = Number(parcel.approximateValue || 0) + Number(parcel.transportationCharge || 0)

  return (
    <Modal show={isOpen} onClose={onClose} size="lg">
      <Modal.Header>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Parcel Booking Details</h3>
      </Modal.Header>

      <Modal.Body>
        <div className="space-y-1">
          {/* Order Info */}
          <SectionTitle title="Order Info" />
          <InfoRow label="Order ID" value={parcel.orderId} />

          <div className="flex flex-col md:flex-row md:items-center py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="w-full md:w-1/3 font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-0">
              Status
            </div>

            <div className="w-full md:w-2/3">
              <Badge color={statusColor[parcel.status] ?? "gray"} className="inline-flex w-fit">
                {parcel.status}
              </Badge>
            </div>
          </div>

          {/* Deliver Customer */}
          <SectionTitle title="Deliver Customer" />
          <InfoRow label="Name" value={parcel.deliverCustomerName} />
          <InfoRow label="Mobile Number" value={parcel.deliverMobileNumber} />
          <InfoRow label="Delivery State" value={parcel.deliveryState} />
          <InfoRow label="Delivery City / Branch" value={parcel.deliveryCityBranch} />

          {/* Booking Customer */}
          <SectionTitle title="Booking Customer" />
          <InfoRow label="Name" value={parcel.bookingCustomerName} />
          <InfoRow label="Mobile Number" value={parcel.bookingMobileNumber} />

          <div className="flex flex-col md:flex-row md:items-center py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="w-full md:w-1/3 font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-0">
              Payment Type
            </div>

            <div className="w-full md:w-2/3">
              <Badge color={parcel.paymentType === "Paid" ? "success" : "warning"} className="inline-flex w-fit">
                {parcel.paymentType}
              </Badge>
            </div>
          </div>

          {/* Article */}
          <SectionTitle title="Article Details" />
          <InfoRow label="Article" value={parcel.article} />
          <InfoRow label="Number of Parcels" value={parcel.numberOfParcels} />
          <InfoRow label="Approximate Value" value={parcel.approximateValue ? `₹${Number(parcel.approximateValue).toLocaleString("en-IN")}` : undefined} />
          <InfoRow label="Transportation Charge" value={parcel.transportationCharge ? `₹${Number(parcel.transportationCharge).toLocaleString("en-IN")}` : undefined} />
          <InfoRow label="Amount" value={`₹${amount.toLocaleString("en-IN")}`} />
          <InfoRow label="Remarks" value={parcel.remarks} />
        </div>
      </Modal.Body>

      <Modal.Footer>
        <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">
          Close
        </button>
      </Modal.Footer>
    </Modal>
  )
}

export default ViewParcelModal