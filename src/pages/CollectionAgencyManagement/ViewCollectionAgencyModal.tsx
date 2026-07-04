import { FC } from "react"
import { Badge, Modal } from "flowbite-react"
import { useCollectionAgencyStore } from "../../store/collectionAgencyStore"

interface Props {
  isOpen: boolean
  onClose: () => void
}

const ViewCollectionAgencyModal: FC<Props> = ({ isOpen, onClose }) => {
  const { selectedCollectionAgency } = useCollectionAgencyStore()
  if (!selectedCollectionAgency) return null

  const Row: FC<{ label: string; value?: string }> = ({ label, value }) => (
    <div className="flex flex-col md:flex-row md:items-center py-3 border-b border-gray-200 dark:border-gray-700">
      <div className="w-full md:w-1/2 font-medium text-gray-700 dark:text-gray-300">{label}</div>
      <div className="w-full md:w-2/3 text-gray-900 dark:text-white">{value || "N/A"}</div>
    </div>
  )

  return (
    <Modal show={isOpen} onClose={onClose} size="lg">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-h-[85vh] overflow-hidden">
        <Modal.Header>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Collection Agency Details</h3>
        </Modal.Header>
        <Modal.Body className="py-0 max-h-[70vh] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#64748b_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-500/70 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400/80">
          <div className="space-y-1">
          <Row label="Collection Agency Name" value={selectedCollectionAgency.collectionAgencyName} />
          <Row label="Owner Name" value={selectedCollectionAgency.ownerName} />
          <Row label="Phone" value={selectedCollectionAgency.phone} />
          <Row label="Email" value={selectedCollectionAgency.email} />
          <Row label="GST" value={selectedCollectionAgency.gstNumber} />
          <Row label="Address" value={selectedCollectionAgency.address} />
          <Row label="City" value={selectedCollectionAgency.city} />
          <Row label="State" value={selectedCollectionAgency.state} />
          <Row label="Pincode" value={selectedCollectionAgency.pincode} />
          <Row label="Username" value={selectedCollectionAgency.username} />
          <div className="flex flex-col md:flex-row md:items-center py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="w-full md:w-1/2 font-medium text-gray-700 dark:text-gray-300">Status</div>
            <div className="w-full md:w-2/3">
              <Badge color={selectedCollectionAgency.status === "Active" ? "success" : "failure"} className="inline-flex w-fit">
                {selectedCollectionAgency.status}
              </Badge>
            </div>
          </div>
          </div>
        </Modal.Body>
          <button onClick={onClose} className="m-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
            Close
          </button>
      </div>
    </Modal>
  )
}

export default ViewCollectionAgencyModal
