import { FC } from "react"
import { Badge, Modal } from "flowbite-react"
import { B2BVehicle } from "../../store/b2bVehicleStore"

interface Props {
  isOpen: boolean
  onClose: () => void
  vehicle?: B2BVehicle | null
}

const ViewB2BVehicleModal: FC<Props> = ({ isOpen, onClose, vehicle }) => {
  if (!vehicle) return null
  const InfoRow: FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => (
    <div className="flex flex-col md:flex-row md:items-center py-3 border-b border-gray-200 dark:border-gray-700">
      <div className="w-full md:w-1/3 font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-0">{label}</div>
      <div className="w-full md:w-2/3 text-gray-900 dark:text-white">{value ?? "N/A"}</div>
    </div>
  )
  return (
    <Modal show={isOpen} onClose={onClose} size="lg">
      <Modal.Header><h3 className="text-xl font-semibold text-gray-900 dark:text-white">B2B Vehicle Details</h3></Modal.Header>
      <Modal.Body>
        <InfoRow label="Vehicle Type" value={vehicle.vehicleType} />
        <InfoRow label="Capacity" value={vehicle.capacityKg} />
        <InfoRow label="Rate Per Km" value={vehicle.ratePerKm} />
        <div className="flex flex-col md:flex-row md:items-center py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="w-full md:w-1/3 font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-0">Status</div>
          <div className="w-full md:w-2/3"><Badge color={vehicle.status === "Active" ? "success" : "failure"} className="inline-flex w-fit">{vehicle.status}</Badge></div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">Close</button>
      </Modal.Footer>
    </Modal>
  )
}

export default ViewB2BVehicleModal
