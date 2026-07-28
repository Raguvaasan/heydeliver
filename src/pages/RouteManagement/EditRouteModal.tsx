import { FC, useEffect, useState } from "react"
import { Modal, Button, Label, TextInput, Select } from "flowbite-react"
import { useRouteStore } from "../../store/routeStore"

interface Props {
  isOpen: boolean
  onClose: () => void
}

const EditRouteModal: FC<Props> = ({ isOpen, onClose }) => {
  const { selectedRoute, updateRoute, loading } = useRouteStore()
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    branchesText: "",
    status: "Active",
  })

  useEffect(() => {
    if (selectedRoute) {
      setFormData({
        from: selectedRoute.from || "",
        to: selectedRoute.to || "",
        branchesText: (selectedRoute.branches || []).join(", "),
        status: selectedRoute.status || "Active",
      })
    }
  }, [selectedRoute])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRoute) return
    const branches = formData.branchesText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
    await updateRoute(selectedRoute.id, {
      from: formData.from,
      to: formData.to,
      branches,
      status: formData.status as "Active" | "Inactive",
    })
    onClose()
  }

  return (
    <Modal show={isOpen} onClose={onClose} size="3xl">
      <Modal.Header>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Route</h3>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Label htmlFor="from" value="From" />
                <span className="text-red-500">*</span>
              </div>
              <TextInput id="from" name="from" value={formData.from} onChange={(e) => setFormData({ ...formData, from: e.target.value })} required />
            </div>
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Label htmlFor="to" value="To" />
                <span className="text-red-500">*</span>
              </div>
              <TextInput id="to" name="to" value={formData.to} onChange={(e) => setFormData({ ...formData, to: e.target.value })} required />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="branchesText" value="Branches" className="mb-2" />
              <TextInput id="branchesText" name="branchesText" value={formData.branchesText} onChange={(e) => setFormData({ ...formData, branchesText: e.target.value })} placeholder="Guindy, Tambaram" />
            </div>
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Label htmlFor="status" value="Status" />
                <span className="text-red-500">*</span>
              </div>
              <Select id="status" name="status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} required>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button color="gray" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" color="warning" disabled={loading} className="bg-orange-500 hover:bg-orange-600">
              {loading ? "Updating..." : "Update Route"}
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  )
}

export default EditRouteModal
