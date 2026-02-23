import { FC, useState } from "react"
import { Modal, Button, Label, TextInput, Select, ToggleSwitch } from "flowbite-react"
import { useAgencyStore } from "../../store/agencyStore"
import { HiX, HiEye, HiEyeOff } from "react-icons/hi"

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
    gstNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    username: "",
    password: "",
    status: true,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [showPassword, setShowPassword] = useState(false)

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
      await addAgency({ 
        ...formData, 
        status: formData.status ? "Active" : "Inactive",
        image: imageFile 
      })
      setFormData({
        agencyName: "",
        agencyOwner: "",
        phone: "",
        email: "",
        gstNumber: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        username: "",
        password: "",
        status: true,
      })
      setImageFile(null)
      onClose()
    } catch (error) {
      // Error handled by store
    }
  }

  return (
    <Modal show={isOpen} onClose={onClose} size="3xl" position="center">
      <div className="relative bg-white rounded-lg shadow-2xl max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Add</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Details Section */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Basic Details</h4>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Franchise Name */}
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Franchise Name<span className="text-red-500">*</span>
                </Label>
                <TextInput
                  name="agencyName"
                  type="text"
                  placeholder="Enter name"
                  value={formData.agencyName}
                  onChange={handleChange}
                  required
                  sizing="sm"
                />
              </div>

              {/* Franchise Owner Name */}
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Franchise Owner Name<span className="text-red-500">*</span>
                </Label>
                <TextInput
                  name="agencyOwner"
                  type="text"
                  placeholder="Enter manager name"
                  value={formData.agencyOwner}
                  onChange={handleChange}
                  required
                  sizing="sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Mobile Number */}
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Mobile Number<span className="text-red-500">*</span>
                </Label>
                <TextInput
                  name="phone"
                  type="tel"
                  placeholder="Enter mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  sizing="sm"
                />
              </div>

              {/* Email Address */}
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Email Address<span className="text-red-500">*</span>
                </Label>
                <TextInput
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  sizing="sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* GST No */}
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  GST No.<span className="text-red-500">*</span>
                </Label>
                <TextInput
                  name="gstNumber"
                  type="text"
                  placeholder="Enter your GST number"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  required
                  sizing="sm"
                />
              </div>

              {/* Status Toggle */}
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Status<span className="text-red-500">*</span>
                </Label>
                <ToggleSwitch
                  checked={formData.status}
                  onChange={(checked) => setFormData({ ...formData, status: checked })}
                  color="success"
                />
              </div>
            </div>

          </div>

          {/* Location Section */}
          <div className="mb-6 border-2 border-blue-400 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Location</h4>
            
            {/* Address */}
            <div className="mb-4">
              <Label className="block text-xs font-medium text-gray-700 mb-1">
                Address<span className="text-red-500">*</span>
              </Label>
              <TextInput
                name="address"
                type="text"
                placeholder="Enter full address"
                value={formData.address}
                onChange={handleChange}
                required
                sizing="sm"
              />
            </div>

            {/* City */}
            <div className="mb-4">
              <Label className="block text-xs font-medium text-gray-700 mb-1">
                City<span className="text-red-500">*</span>
              </Label>
              <TextInput
                name="city"
                type="text"
                placeholder="Enter city name"
                value={formData.city}
                onChange={handleChange}
                required
                sizing="sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* State */}
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  State<span className="text-red-500">*</span>
                </Label>
                <Select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  sizing="sm"
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
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Pincode<span className="text-red-500">*</span>
                </Label>
                <TextInput
                  name="pincode"
                  type="text"
                  placeholder="Enter pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                  sizing="sm"
                />
              </div>
            </div>
          </div>

          {/* Login Credentials Section */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Login Credentials</h4>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Username */}
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Username<span className="text-red-500">*</span>
                </Label>
                <TextInput
                  name="username"
                  type="text"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  sizing="sm"
                />
              </div>

              {/* Set Password */}
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Set Password<span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <TextInput
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    sizing="sm"
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
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              color="gray"
              onClick={onClose}
              disabled={loading}
              className="w-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default AddAgencyModal
