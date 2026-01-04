import { FC, useState, useEffect } from "react"
import { Modal, Button, Label, TextInput, Select } from "flowbite-react"
import { useAgencyStore } from "../../store/agencyStore"

interface EditAgencyModalProps {
  isOpen: boolean
  onClose: () => void
}

const EditAgencyModal: FC<EditAgencyModalProps> = ({ isOpen, onClose }) => {
  const { selectedAgency, updateAgency, loading } = useAgencyStore()
  const [formData, setFormData] = useState({
    agencyName: "",
    agencyOwner: "",
    phone: "",
    email: "",
    address: "",
    gstNumber: "",
    status: "Active" as "Active" | "Inactive",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)

  useEffect(() => {
    if (selectedAgency) {
      setFormData({
        agencyName: selectedAgency.agencyName || "",
        agencyOwner: selectedAgency.agencyOwner || "",
        phone: selectedAgency.phone || "",
        email: selectedAgency.email || "",
        address: selectedAgency.address || "",
        gstNumber: selectedAgency.gstNumber ||"",
        status: selectedAgency.status || "Active",
      })
      setImageFile(null)
    }
  }, [selectedAgency])

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
    if (selectedAgency) {
      try {
        await updateAgency(selectedAgency.id, {
          ...formData,
          image: imageFile ?? undefined,
        })
        onClose()
      } catch (error) {
        console.error("Update agency failed:", error)
      }
    }
  }

  return (
    <Modal show={isOpen} onClose={onClose} size="xl">
      <Modal.Header>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Edit Franchise
        </h3>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Agency Name */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Label htmlFor="agencyName" value="Franchise Name" />
                <span className="text-red-500">*</span>
              </div>
              <TextInput
                id="agencyName"
                name="agencyName"
                type="text"
                placeholder="Enter franchise name"
                value={formData.agencyName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Agency Owner */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Label htmlFor="agencyOwner" value="Franchise Owner" />
                <span className="text-red-500">*</span>
              </div>
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
              <div className="flex items-center gap-1 mb-2">
                <Label htmlFor="phone" value="Phone Number" />
                <span className="text-red-500">*</span>
              </div>
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

            {/* GST */}
            <div>
              <Label htmlFor="gstNumber" value="GST" className="mb-2" />
              <TextInput
                id="gstNumber"
                name="gstNumber"
                type="text"
                placeholder="Enter GST number"
                value={formData.gstNumber}
                onChange={handleChange}
              />
            </div>

            {/* Image */}
            <div>
              <Label htmlFor="image" value="Franchise Image" className="mb-2" />
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
              />
              {imageFile && (
                <p className="text-xs text-gray-500 mt-1">{imageFile.name}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Label htmlFor="status" value="Status" />
                <span className="text-red-500">*</span>
              </div>
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
              {loading ? "Updating..." : "Update Franchise"}
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  )
}

export default EditAgencyModal
