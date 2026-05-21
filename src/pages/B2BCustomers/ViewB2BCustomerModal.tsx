import { FC } from "react"
import { Modal, Badge, Button } from "flowbite-react"
import { useB2BCustomerStore } from "../../store/b2bCustomerStore"
import { HiOutlineMail, HiOutlinePhone, HiOutlineReceiptTax, HiOutlineStatusOnline } from "react-icons/hi";

interface ViewB2BCustomerModalProps { isOpen: boolean; onClose: () => void }

const ViewB2BCustomerModal: FC<ViewB2BCustomerModalProps> = ({ isOpen, onClose }) => {
  const { selectedCustomer } = useB2BCustomerStore()
  if (!selectedCustomer) return null

  const initials = `${selectedCustomer.firstName?.[0] ?? ""}${selectedCustomer.lastName?.[0] ?? ""}`.toUpperCase()
  const fullName = `${selectedCustomer.firstName} ${selectedCustomer.lastName}`.trim()
  const isActive = selectedCustomer.status === "Active"

  return (
    <Modal show={isOpen} onClose={onClose} size="lg">
      <Modal.Header>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
            {initials}
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900">{fullName}</p>
            <p className="text-xs text-gray-500">B2B Customer</p>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body>
        <div className="divide-y divide-gray-100">
          <div className="flex items-center gap-3 py-3">
            <HiOutlineMail className="h-5 w-5 shrink-0 text-gray-400" />
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-400">Email</p>
              <p className="text-sm text-gray-800">{selectedCustomer.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 py-3">
            <HiOutlinePhone className="h-5 w-5 shrink-0 text-gray-400" />
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-400">Mobile</p>
              <p className="text-sm text-gray-800">{selectedCustomer.mobileNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 py-3">
            <HiOutlineReceiptTax className="h-5 w-5 shrink-0 text-gray-400" />
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-400">GST Number</p>
              <p className="font-mono text-sm text-gray-800">{selectedCustomer.gst || "N/A"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 py-3">
            <HiOutlineStatusOnline className="h-5 w-5 shrink-0 text-gray-400" />
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-400">Status</p>
              <Badge color={isActive ? "success" : "purple"} className="mt-0.5">
                {selectedCustomer.status}
              </Badge>
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="justify-end">
        <Button color="gray" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ViewB2BCustomerModal
