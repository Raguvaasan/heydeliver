import { FC } from "react"
import { Modal, Badge } from "flowbite-react"
import { useAgencyStore } from "../../store/agencyStore"

interface ViewAgencyModalProps {
  isOpen: boolean
  onClose: () => void
}

const ViewAgencyModal: FC<ViewAgencyModalProps> = ({ isOpen, onClose }) => {
  const { selectedAgency } = useAgencyStore()

  if (!selectedAgency) return null
  const agencyTypeLabel = selectedAgency.agencyType ? "Own Agency" : "Third Party"

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
          Agency Details
        </h3>
      </Modal.Header>
      <Modal.Body>
        <div className="space-y-1">
          <InfoRow label="Agency Name" value={selectedAgency.agencyName} />
          <InfoRow label="Agency Owner" value={selectedAgency.agencyOwner} />
          <InfoRow label="Agency Type" value={agencyTypeLabel} />
          <InfoRow label="Phone Number" value={selectedAgency.phone} />
          <InfoRow label="Email Address" value={selectedAgency.email} />
          <InfoRow label="GST" value={selectedAgency.gstNumber} />
          <InfoRow label="Address" value={selectedAgency.address} />
          
          <div className="flex flex-col md:flex-row md:items-center py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="w-full md:w-1/3 font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-0">
              Status
            </div>
            <div className="w-full md:w-2/3">
              <Badge
                color={selectedAgency.status === "Active" ? "success" : "failure"}
                className="inline-flex w-fit"
              >
                {selectedAgency.status}
              </Badge>
            </div>
          </div>

          {selectedAgency.createdAt && (
            <InfoRow
              label="Created At"
              value={new Date(selectedAgency.createdAt).toLocaleDateString()}
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

export default ViewAgencyModal
