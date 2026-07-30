import { FC } from "react"
import { Modal, Badge } from "flowbite-react"

import { Vehicle } from "../../store/vehicleStore"

interface Props {
  isOpen: boolean
  onClose: () => void
  vehicle?: Vehicle | null
}

const ViewVehicleModal: FC<Props> = ({ isOpen, onClose, vehicle }) => {
  const selectedVehicle = vehicle

  if (!selectedVehicle) return null

  const InfoRow: FC<{ label: string; value: string | undefined }> = ({ label, value }) => (
    <div className="flex flex-col md:flex-row md:items-center py-3 border-b border-gray-200 dark:border-gray-700">
      <div className="w-full md:w-1/3 font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-0">{label}</div>
      <div className="w-full md:w-2/3 text-gray-900 dark:text-white">{value || "N/A"}</div>
    </div>
  )

  return (
    <Modal show={isOpen} onClose={onClose} size="lg">
      <Modal.Header>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Vehicle Details</h3>
      </Modal.Header>

      <Modal.Body>
        <div className="space-y-1">
          <InfoRow label="Vehicle Type" value={selectedVehicle.type} />

          <InfoRow label="Capacity" value={selectedVehicle.capacity} />

          <InfoRow label="Vehicle Registration Number" value={selectedVehicle.registrationNumber} />

          <InfoRow label="RC Number" value={selectedVehicle.rcNumber} />

          <InfoRow label="Insurance Number" value={selectedVehicle.insuranceNumber} />

          <div className="flex flex-col md:flex-row md:items-center py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="w-full md:w-1/3 font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-0">
              Status
            </div>

            <div className="w-full md:w-2/3">
              <Badge color={selectedVehicle.status === "Active" ? "success" : "failure"} className="inline-flex w-fit">
                {selectedVehicle.status}
              </Badge>
            </div>
          </div>

          {selectedVehicle.createdAt && (
            <InfoRow label="Created At" value={new Date(selectedVehicle.createdAt).toLocaleDateString()} />
          )}
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

export default ViewVehicleModal