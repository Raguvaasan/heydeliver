import { FC, useEffect, useState } from "react"
import { Modal, Button, Label, TextInput, Select } from "flowbite-react"
import { useAgencyStore } from "../../store/agencyStore"

interface EditAgencyModalProps {
  isOpen: boolean
  onClose: () => void
}

const EditAgencyModal: FC<EditAgencyModalProps> = ({ isOpen, onClose }) => {
  const { selectedAgency, updateAgency, loading, fetchAgencies } = useAgencyStore()
  const [formData, setFormData] = useState({
    agencyName: "",
    agencyOwner: "",
    phone: "",
    email: "",
    agencyType: true as boolean,
    address: "",
    city: "",
    state: "",
    pincode: "",
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
        agencyType: selectedAgency.agencyType ?? true,
        address: selectedAgency.address || "",
        city: (selectedAgency as any).city || "",
        state: (selectedAgency as any).state || "",
        pincode: (selectedAgency as any).pincode || "",
        gstNumber: selectedAgency.gstNumber || "",
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
        })
        onClose()
        fetchAgencies()
      } catch (error) {
        // Error handled by store
      }
    }
  }

  return (
    <Modal show={isOpen} onClose={onClose} size="3xl">
      <Modal.Header>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Edit Agency
        </h3>
      </Modal.Header>
      <Modal.Body className="max-h-[calc(100vh-12rem)] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#64748b_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-500/70 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400/80">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Agency Name */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Label htmlFor="agencyName" value="Agency Name" />
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
                <Label htmlFor="agencyOwner" value="Agency Owner" />
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
              <div className="flex items-center gap-1 mb-2">
                <Label htmlFor="email" value="Email Address" />
                <span className="text-red-500">*</span>
              </div>
              <TextInput
                id="email"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Agency Type */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Label htmlFor="agencyType" value="Agency Type" />
                <span className="text-red-500">*</span>
              </div>
              <Select
                id="agencyType"
                name="agencyType"
                value={formData.agencyType ? "true" : "false"}
                onChange={(e) => {
                  const nextType = e.target.value === "true"
                  setFormData({
                    ...formData,
                    agencyType: nextType,
                  })
                }}
                required
              >
                <option value="true">Own Agency</option>
                <option value="false">Third Party</option>
              </Select>
            </div>

            {/* {formData.agencyType === false && (
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <Label htmlFor="commission" value="Commission" />
                  <span className="text-red-500">*</span>
                </div>
                <TextInput
                  id="commission"
                  name="commission"
                  type="text"
                  placeholder="Enter commission"
                  value={formData.commission}
                  onChange={handleChange}
                  required
                />
              </div>
            )} */}

            {/* GST */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Label htmlFor="gstNumber" value="GST Number" />
                <span className="text-red-500">*</span>
              </div>
              <TextInput
                id="gstNumber"
                name="gstNumber"
                type="text"
                placeholder="Enter GST number"
                value={formData.gstNumber}
                onChange={handleChange}
                required
              />
            </div>

            {/* City */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Label htmlFor="city" value="City" />
                <span className="text-red-500">*</span>
              </div>
              <TextInput
                id="city"
                name="city"
                type="text"
                placeholder="Enter city name"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>

            {/* State */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Label htmlFor="state" value="State" />
                <span className="text-red-500">*</span>
              </div>
              <Select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Kerala">Kerala</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Telangana">Telangana</option>
                <option value="Maharashtra">Maharashtra</option>
              </Select>
            </div>

            {/* Pincode */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Label htmlFor="pincode" value="Pincode" />
                <span className="text-red-500">*</span>
              </div>
              <TextInput
                id="pincode"
                name="pincode"
                type="text"
                placeholder="Enter pincode"
                value={formData.pincode}
                onChange={handleChange}
                required
              />
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
              {loading ? "Updating..." : "Update Agency"}
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  )
}

export default EditAgencyModal
