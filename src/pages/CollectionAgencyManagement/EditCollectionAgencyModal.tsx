import { FC, useEffect, useState } from "react"
import { Modal, Button, Label, TextInput, Select } from "flowbite-react"
import { useCollectionAgencyStore } from "../../store/collectionAgencyStore"

interface Props {
  isOpen: boolean
  onClose: () => void
}

const EditCollectionAgencyModal: FC<Props> = ({ isOpen, onClose }) => {
  const { selectedCollectionAgency, updateCollectionAgency, updateCollectionAgencyStatus, loading } = useCollectionAgencyStore()
  const [formData, setFormData] = useState({
    collectionAgencyName: "",
    ownerName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gstNumber: "",
    username: "",
    password: "",
    status: "Active" as "Active" | "Inactive",
  })

  useEffect(() => {
    if (selectedCollectionAgency) {
      setFormData({
        collectionAgencyName: selectedCollectionAgency.collectionAgencyName || "",
        ownerName: selectedCollectionAgency.ownerName || "",
        phone: selectedCollectionAgency.phone || "",
        email: selectedCollectionAgency.email || "",
        address: selectedCollectionAgency.address || "",
        city: selectedCollectionAgency.city || "",
        state: selectedCollectionAgency.state || "",
        pincode: selectedCollectionAgency.pincode || "",
        gstNumber: selectedCollectionAgency.gstNumber || "",
        username: selectedCollectionAgency.username || "",
        password: selectedCollectionAgency.password || "",
        status: selectedCollectionAgency.status || "Active",
      })
    }
  }, [selectedCollectionAgency])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCollectionAgency) return
    const { status, ...rest } = formData
    await updateCollectionAgency(selectedCollectionAgency.id, rest)
    if (status !== selectedCollectionAgency.status) {
      await updateCollectionAgencyStatus(selectedCollectionAgency.id, status)
    }
    onClose()
  }

  return (
    <Modal show={isOpen} onClose={onClose} size="3xl">
      <Modal.Header>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Collection Agency</h3>
      </Modal.Header>
      <Modal.Body className="max-h-[calc(100vh-12rem)] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ["collectionAgencyName", "Collection Agency Name"],
              ["ownerName", "Owner Name"],
              ["phone", "Phone Number"],
              ["email", "Email Address"],
              ["gstNumber", "GST Number"],
              ["city", "City"],
              ["state", "State"],
              ["pincode", "Pincode"],
              ["username", "Username"],
              ["password", "Password"],
            ].map(([name, label]) => (
              <div key={name}>
                <div className="flex items-center gap-1 mb-2">
                  <Label htmlFor={name} value={label} />
                </div>
                {name === "state" ? (
                  <Select id={name} name={name} value={(formData as any)[name]} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Maharashtra">Maharashtra</option>
                  </Select>
                ) : (
                  <TextInput id={name} name={name} type={name === "password" ? "password" : name === "email" ? "email" : "text"} value={(formData as any)[name]} onChange={handleChange} />
                )}
              </div>
            ))}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Label htmlFor="status" value="Status" />
              </div>
              <Select id="status" name="status" value={formData.status} onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="address" value="Address" className="mb-2" />
            <TextInput id="address" name="address" value={formData.address} onChange={handleChange} />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button color="gray" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" color="warning" disabled={loading} className="bg-orange-500 hover:bg-orange-600">
              {loading ? "Updating..." : "Update Collection Agency"}
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  )
}

export default EditCollectionAgencyModal
