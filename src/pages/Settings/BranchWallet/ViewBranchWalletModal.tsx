import { FC } from "react"
import { Badge, Modal } from "flowbite-react"

interface BranchWalletItem {
  branchName?: string
  agencyName?: string
  walletBalance?: number
  profit?: number
  status?: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  item: BranchWalletItem | null
}

const ViewBranchWalletModal: FC<Props> = ({ isOpen, onClose, item }) => {
  if (!item) return null

  const InfoRow: FC<{ label: string; value: string | undefined }> = ({ label, value }) => (
    <div className="flex flex-col md:flex-row md:items-center py-3 border-b border-gray-200 dark:border-gray-700">
      <div className="w-full md:w-1/3 font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-0">{label}</div>
      <div className="w-full md:w-2/3 text-gray-900 dark:text-white">{value || "N/A"}</div>
    </div>
  )

  return (
    <Modal show={isOpen} onClose={onClose} size="lg">
      <Modal.Header>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Agency Wallet Details</h3>
      </Modal.Header>
      <Modal.Body>
        <div className="space-y-1">
          <InfoRow label="Agency Name" value={item.branchName || item.agencyName} />
          <InfoRow label="Wallet Balance" value={`₹ ${(Number(item.walletBalance) || 0).toLocaleString()}`} />
          <InfoRow label="Profit" value={`₹ ${(Number(item.profit) || 0).toLocaleString()}`} />
          <div className="flex flex-col md:flex-row md:items-center py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="w-full md:w-1/3 font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-0">Status</div>
            <div className="w-full md:w-2/3">
              <Badge color={String(item.status || "").toLowerCase() === "active" ? "success" : "failure"} className="inline-flex w-fit">
                {item.status || "Unknown"}
              </Badge>
            </div>
          </div>
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

export default ViewBranchWalletModal
