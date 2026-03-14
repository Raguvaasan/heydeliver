import { FC } from "react"
import { Modal, Badge } from "flowbite-react"
import { useCustomerStore } from "../../store/customerStore"

interface ViewCustomerModalProps {
  isOpen: boolean
  onClose: () => void
}

const ViewCustomerModal: FC<ViewCustomerModalProps> = ({ isOpen, onClose }) => {
  const { selectedCustomer } = useCustomerStore()

  if (!selectedCustomer) return null

  const InfoRow: FC<{ label: string; value: string | undefined }> = ({
    label,
    value,
  }) => (
    <div className="flex flex-col md:flex-row md:items-center py-3 border-b border-gray-200 dark:border-gray-700">
      <div className="w-full md:w-1/3 font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-0">
        {label}
      </div>
      <div className="w-full md:w-2/3 text-gray-900 dark:text-white">
        {value || "N/A"}
      </div>
    </div>
  )

  return (
    <Modal show={isOpen} onClose={onClose} size="lg">
      <Modal.Header>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Customer Details
        </h3>
      </Modal.Header>
      <Modal.Body>
        <div className="space-y-1">
          <InfoRow label="Name" value={selectedCustomer.name} />
          <InfoRow label="Email" value={selectedCustomer.email} />
          <InfoRow label="Phone" value={selectedCustomer.phone} />
          <InfoRow label="Address" value={selectedCustomer.address} />
          <InfoRow label="City" value={selectedCustomer.city} />
          <InfoRow label="State" value={selectedCustomer.state} />
          <InfoRow label="Pincode" value={selectedCustomer.pincode} />
          <InfoRow label="GST Number" value={selectedCustomer.gstNumber} />

          <div className="flex flex-col md:flex-row md:items-center py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="w-full md:w-1/3 font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-0">
              Status
            </div>
            <div className="w-full md:w-2/3">
              <Badge
                color={selectedCustomer.status === "Active" ? "success" : "failure"}
                className="inline-flex w-fit"
              >
                {selectedCustomer.status}
              </Badge>
            </div>
          </div>

          {selectedCustomer.createdAt && (
            <InfoRow
              label="Created At"
              value={new Date(selectedCustomer.createdAt).toLocaleDateString()}
            />
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          Close
        </button>
      </Modal.Footer>
    </Modal>
  )
}

export default ViewCustomerModal
