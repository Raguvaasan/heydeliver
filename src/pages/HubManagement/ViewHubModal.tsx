import { FC } from "react"
import { Modal, Badge } from "flowbite-react"
import { useHubStore } from "../../store/hubStore"

interface ViewHubModalProps {
  isOpen: boolean
  onClose: () => void
}

const ViewHubModal: FC<ViewHubModalProps> = ({ isOpen, onClose }) => {
  const { selectedHub } = useHubStore()

  if (!selectedHub) return null

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
          Hub Details
        </h3>
      </Modal.Header>
      <Modal.Body>
        <div className="space-y-1">
          <InfoRow label="Hub Name" value={selectedHub.hubName} />
          <InfoRow label="Hub Manager" value={selectedHub.hubManagerName} />
          <InfoRow label="Phone Number" value={selectedHub.phoneNo} />
          <InfoRow label="Address" value={selectedHub.address} />
          <InfoRow label="City" value={selectedHub.city} />
          <InfoRow label="State" value={selectedHub.state} />
          <InfoRow label="Pincode" value={selectedHub.pincode} />

          <div className="flex flex-col md:flex-row md:items-center py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="w-full md:w-1/3 font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-0">
              Status
            </div>
            <div className="w-full md:w-2/3">
              <Badge
                color={selectedHub.status ? "success" : "failure"}
                className="inline-flex w-fit"
              >
                {selectedHub.status ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          {selectedHub.createdAt && (
            <InfoRow
              label="Created At"
              value={new Date(selectedHub.createdAt).toLocaleDateString()}
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

export default ViewHubModal
