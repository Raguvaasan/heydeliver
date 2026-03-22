import { FC, useState, useEffect } from "react"
import { Modal, Button, Label, TextInput, Select } from "flowbite-react"
import { HiEye, HiEyeOff } from "react-icons/hi"
import { useHubStore } from "../../store/hubStore"

interface EditHubModalProps {
  isOpen: boolean
  onClose: () => void
}

const EditHubModal: FC<EditHubModalProps> = ({ isOpen, onClose }) => {
  const { selectedHub, updateHub, loading } = useHubStore()
  const [formData, setFormData] = useState({
    hubName: "",
    hubManagerName: "",
    phoneNo: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    username: "",
    password: "",
    status: true,
  })
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (selectedHub) {
      setFormData({
        hubName: selectedHub.hubName || "",
        hubManagerName: selectedHub.hubManagerName || "",
        phoneNo: selectedHub.phoneNo || "",
        address: selectedHub.address || "",
        city: selectedHub.city || "",
        state: selectedHub.state || "",
        pincode: selectedHub.pincode || "",
        username: selectedHub.username || "",
        password: "",
        status: selectedHub.status !== undefined ? selectedHub.status : true,
      })
    }
  }, [selectedHub])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "status" ? value === "true" : value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedHub) {
      try {
        // Build payload, omitting empty password
        const payload: any = { ...formData }
        if (!payload.password) {
          delete payload.password
        }
        await updateHub(selectedHub.id, payload)
        onClose()
      } catch (error) {
        // Error handled by store
      }
    }
  }

  return (
    <Modal show={isOpen} onClose={onClose} size="3xl">
      <Modal.Header>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Edit Hub
        </h3>
      </Modal.Header>
      <Modal.Body className="max-h-[calc(100vh-12rem)] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#64748b_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-500/70 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400/80">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Hub Name */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Label htmlFor="hubName" value="Hub Name" />
                <span className="text-red-500">*</span>
              </div>
              <TextInput
                id="hubName"
                name="hubName"
                type="text"
                placeholder="Enter hub name"
                value={formData.hubName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Hub Manager */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Label htmlFor="hubManagerName" value="Hub Manager" />
                <span className="text-red-500">*</span>
              </div>
              <TextInput
                id="hubManagerName"
                name="hubManagerName"
                type="text"
                placeholder="Enter manager name"
                value={formData.hubManagerName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Phone */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Label htmlFor="phoneNo" value="Phone Number" />
                <span className="text-red-500">*</span>
              </div>
              <TextInput
                id="phoneNo"
                name="phoneNo"
                type="tel"
                placeholder="Enter phone number"
                value={formData.phoneNo}
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
                <option value="Gujarat">Gujarat</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Delhi">Delhi</option>
                <option value="West Bengal">West Bengal</option>
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

            {/* Status */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Label htmlFor="status" value="Status" />
                <span className="text-red-500">*</span>
              </div>
              <Select
                id="status"
                name="status"
                value={String(formData.status)}
                onChange={handleChange}
                required
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
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
              {loading ? "Updating..." : "Update Hub"}
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  )
}

export default EditHubModal
