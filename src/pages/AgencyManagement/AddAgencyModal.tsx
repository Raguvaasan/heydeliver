import { FC, useState } from "react"
import { Modal, Button, Label, TextInput, Select } from "flowbite-react"
import { useAgencyStore } from "../../store/agencyStore"
import { HiX } from "react-icons/hi"

interface AddAgencyModalProps {
  isOpen: boolean
  onClose: () => void
}

const AddAgencyModal: FC<AddAgencyModalProps> = ({ isOpen, onClose }) => {
  const { addAgency, loading } = useAgencyStore()
  const [formData, setFormData] = useState({
    agencyName: "",
    agencyOwner: "",
    phone: "",
    email: "",
    assignedHub: "",
    address: "",
    status: "Active" as "Active" | "Inactive",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addAgency(formData)
      setFormData({
        agencyName: "",
        agencyOwner: "",
        phone: "",
        email: "",
        assignedHub: "",
        address: "",
        status: "Active",
      })
      onClose()
    } catch (error) {
      console.error("Add agency failed:", error)
    }
  }

  return (
    <Modal show={isOpen} onClose={onClose} size="xl">
      <Modal.Header>
        <div className="flex items-center justify-between w-full">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add New Agency
          </h3>
        </div>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Agency Name */}
            <div>
              <Label htmlFor="agencyName" value="Agency Name" className="mb-2" />
              <TextInput
                id="agencyName"
                name="agencyName"
                type="text"
                placeholder="Enter agency name"
                value={formData.agencyName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Agency Owner */}
            <div>
              <Label htmlFor="agencyOwner" value="Agency Owner" className="mb-2" />
              <TextInput
                id="agencyOwner"
                name="agencyOwner"
                type="text"
                placeholder="Enter owner name"
                value={formData.agencyOwner}
                onChange={handleChange}
                required
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone" value="Phone Number" className="mb-2" />
              <TextInput
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" value="Email Address" className="mb-2" />
              <TextInput
                id="email"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Assigned Hub */}
            <div>
              <Label htmlFor="assignedHub" value="Assigned Hub" className="mb-2" />
              <Select
                id="assignedHub"
                name="assignedHub"
                value={formData.assignedHub}
                onChange={handleChange}
                required
              >
                <option value="">Select Hub</option>
                <option value="Chennai Central Hub">Chennai Central Hub</option>
                <option value="Coimbatore Hub">Coimbatore Hub</option>
                <option value="Delhi North Hub">Delhi North Hub</option>
                <option value="Mumbai West Hub">Mumbai West Hub</option>
                <option value="Bangalore South Hub">Bangalore South Hub</option>
              </Select>
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status" value="Status" className="mb-2" />
              <Select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
            </div>
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="address" value="Address" className="mb-2" />
            <TextInput
              id="address"
              name="address"
              type="text"
              placeholder="Enter full address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button color="gray" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              color="warning"
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {loading ? "Adding..." : "Add Agency"}
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  )
}

export default AddAgencyModal
