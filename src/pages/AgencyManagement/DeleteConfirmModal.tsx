import { FC } from "react"
import { Modal, Button } from "flowbite-react"
import { HiExclamationCircle } from "react-icons/hi"

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
}

const DeleteConfirmModal: FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Delete",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
}) => {
  return (
    <Modal show={isOpen} onClose={onClose} size="md" popup>
      <Modal.Header />
      <Modal.Body>
        <div className="text-center">
          <HiExclamationCircle className="mx-auto mb-4 h-14 w-14 text-red-600 dark:text-red-400" />
          <h3 className="mb-5 text-lg font-normal text-gray-700 dark:text-gray-300">
            {title}
          </h3>
          <p className="mb-5 text-sm text-gray-600 dark:text-gray-400">
            {message}
          </p>
          <div className="flex justify-center gap-4">
            <Button color="failure" onClick={onConfirm}>
              Yes, Delete
            </Button>
            <Button color="gray" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default DeleteConfirmModal
