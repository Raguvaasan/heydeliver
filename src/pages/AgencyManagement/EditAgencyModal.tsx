import { FC, useState, useEffect } from "react"
import { Modal, Button, Label, TextInput, Select } from "flowbite-react"
import { HiEye, HiEyeOff } from "react-icons/hi"
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
    city: "",
    state: "",
    pincode: "",
    gstNumber: "",
    username: "",
    password: "",
    status: "Active" as "Active" | "Inactive",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (selectedAgency) {
      setFormData({
        agencyName: selectedAgency.agencyName || "",
        agencyOwner: selectedAgency.agencyOwner || "",
        phone: selectedAgency.phone || "",
        email: selectedAgency.email || "",
        address: selectedAgency.address || "",
        city: (selectedAgency as any).city || "",
        state: (selectedAgency as any).state || "",
        pincode: (selectedAgency as any).pincode || "",
        gstNumber: selectedAgency.gstNumber || "",
        username: (selectedAgency as any).username || "",
        password: "",
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
    <Modal show={isOpen} onClose={onClose} size="3xl">
      <Modal.Header>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Edit Franchise
        </h3>
      </Modal.Header>
      <Modal.Body className="max-h-[calc(100vh-12rem)] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#64748b_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-500/70 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400/80">
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

            {/* Username */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Label htmlFor="username" value="Username" />
                <span className="text-red-500">*</span>
              </div>
              <TextInput
                id="username"
                name="username"
                type="text"
                placeholder="Enter username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" value="Password (leave blank to keep current)" className="mb-2" />
              <div className="relative">
                <TextInput
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <HiEyeOff className="h-5 w-5" />
                  ) : (
                    <HiEye className="h-5 w-5" />
                  )}
                </button>
              </div>
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
