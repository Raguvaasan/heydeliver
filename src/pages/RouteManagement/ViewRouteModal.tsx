import { FC } from "react"
import { Modal, Badge } from "flowbite-react"
import { useRouteStore } from "../../store/routeStore"

interface Props {
  isOpen: boolean
  onClose: () => void
}

const ViewRouteModal: FC<Props> = ({ isOpen, onClose }) => {
  const { selectedRoute } = useRouteStore()
  if (!selectedRoute) return null

  const InfoRow: FC<{ label: string; value: string | undefined }> = ({ label, value }) => (
    <div className="flex flex-col md:flex-row md:items-center py-3 border-b border-gray-200 dark:border-gray-700">
      <div className="w-full md:w-1/3 font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-0">{label}</div>
      <div className="w-full md:w-2/3 text-gray-900 dark:text-white">{value || "N/A"}</div>
    </div>
  )

  return (
    <Modal show={isOpen} onClose={onClose} size="lg">
      <Modal.Header>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Route Details</h3>
      </Modal.Header>
      <Modal.Body>
        <div className="space-y-1">
          <InfoRow label="From" value={selectedRoute.from} />
          <InfoRow label="To" value={selectedRoute.to} />
          <InfoRow label="Branches" value={selectedRoute.branches?.join(", ")} />
          <div className="flex flex-col md:flex-row md:items-center py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="w-full md:w-1/3 font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-0">Status</div>
            <div className="w-full md:w-2/3">
              <Badge color={selectedRoute.status === "Active" ? "success" : "failure"} className="inline-flex w-fit">
                {selectedRoute.status}
              </Badge>
            </div>
          </div>
          {selectedRoute.createdAt && (
            <InfoRow label="Created At" value={new Date(selectedRoute.createdAt).toLocaleDateString()} />
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

export default ViewRouteModal
