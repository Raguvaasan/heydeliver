import { FC, useState, useEffect } from "react"
import { Modal, Button, Label, TextInput, Select, Spinner } from "flowbite-react"
import { useOrderStore } from "../../store/orderStore"
import http from "../../common/httpRequest"

interface EditOrderModalProps {
  isOpen: boolean
  onClose: () => void
  order: any
}

interface HubStaff {
  _id: string
  name: string
  phone: string
  type: string
  hubId?: any
}

const EditOrderModal: FC<EditOrderModalProps> = ({ isOpen, onClose, order }) => {
  const { editHubOrder, loading } = useOrderStore()
  const [hubStaffs, setHubStaffs] = useState<HubStaff[]>([])
  const [staffLoading, setStaffLoading] = useState(false)

  const [formData, setFormData] = useState({
    weight: "",
    codAmount: "",
    totalAmount: "",
    assignedStaffId: "",
    status: "pending",
  })

  useEffect(() => {
    if (isOpen) {
      fetchHubStaffs()
    }
  }, [isOpen])

  const fetchHubStaffs = async () => {
    setStaffLoading(true)
    try {
      const profileDataStr = sessionStorage.getItem("profileData")
      const profileData = profileDataStr ? JSON.parse(profileDataStr) : null
      const loginType = sessionStorage.getItem("loginType") || ""

      // Hub admin login → profileData._id IS the hub's ID
      // Hub staff login → profileData.hubId._id is the hub's ID
      const myHubId =
        (loginType === "hub" ? profileData?._id : null) ||
        profileData?.hubId?._id ||
        (typeof profileData?.hubId === "string" ? profileData.hubId : null) ||
        ""

      // Fetch with large limit to avoid pagination missing staff
      const response = await http.get("/admin/staff", { params: { limit: 100 } })
      const responseData = response.data?.data

      // Handle both { staff: [...] } and direct array format
      const allStaffs: HubStaff[] = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData?.staff)
        ? responseData.staff
        : []

      // Filter: only hub-type staff belonging to the logged-in hub
      const filtered = allStaffs.filter((s) => {
        if (s.type !== "hub") return false
        if (!myHubId) return true
        const staffHubId = typeof s.hubId === "object" ? s.hubId?._id : s.hubId
        return staffHubId === myHubId
      })

      setHubStaffs(filtered)
    } catch {
      setHubStaffs([])
    } finally {
      setStaffLoading(false)
    }
  }

  useEffect(() => {
    if (order) {
      setFormData({
        weight: order.shipmentDetails?.weight || order.weight || "",
        codAmount: order.shipmentDetails?.cod_amount || order.codAmount || "",
        totalAmount: order.amount || order.totalAmount || order.shipmentDetails?.total_amount || "",
        assignedStaffId: order.assignedStaffId || order.assignedStaff?._id || "",
        status: order.status?.toLowerCase() || "pending",
      })
    }
  }, [order])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!order) return

    const orderId = order._id || order.orderId || order.bookingId
    try {
      await editHubOrder(orderId, formData)
      onClose()
    } catch {
      // Error handled by store
    }
  }

  return (
    <Modal show={isOpen} onClose={onClose} size="xl">
      <Modal.Header>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Edit Order
        </h3>
      </Modal.Header>
      <Modal.Body className="max-h-[calc(100vh-12rem)] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#64748b_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-500/70 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400/80">
        {/* Order Info (Read Only) */}
        {order && (
          <div className="mb-5 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <h4 className="mb-3 text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
              Order Details
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Order ID:</span>{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {order.shipmentDetails?.order || order.orderId || order._id}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">AWB:</span>{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {order.waybill || "-"}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Customer:</span>{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {order.consignee?.name || order.customer || "-"}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Phone:</span>{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {order.consignee?.phone || order.customerNumber || "-"}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Payment Mode:</span>{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {order.shipmentDetails?.payment_mode || order.paymentMode || "-"}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Booking Date:</span>{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {order.bookingDate
                    ? new Date(order.bookingDate).toLocaleDateString()
                    : order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString()
                    : "-"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weight */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Label htmlFor="weight" value="Weight (kg)" />
              </div>
              <TextInput
                id="weight"
                name="weight"
                type="number"
                step="0.1"
                min="0"
                placeholder="Enter weight"
                value={formData.weight}
                onChange={handleChange}
              />
            </div>

            {/* COD Amount */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Label htmlFor="codAmount" value="COD Amount (₹)" />
              </div>
              <TextInput
                id="codAmount"
                name="codAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter COD amount"
                value={formData.codAmount}
                onChange={handleChange}
              />
            </div>

            {/* Total Amount */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Label htmlFor="totalAmount" value="Total Amount (₹)" />
              </div>
              <TextInput
                id="totalAmount"
                name="totalAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter total amount"
                value={formData.totalAmount}
                onChange={handleChange}
              />
            </div>

            {/* Status */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Label htmlFor="status" value="Status" />
              </div>
              <Select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="in transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="failed">Failed</option>
              </Select>
            </div>
          </div>

          {/* Assigned Staff - Full Width */}
          <div>
            <div className="flex items-center gap-1 mb-2">
              <Label htmlFor="assignedStaffId" value="Assign Staff" />
            </div>
            {staffLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Spinner size="sm" /> Loading staff...
              </div>
            ) : (
              <Select
                id="assignedStaffId"
                name="assignedStaffId"
                value={formData.assignedStaffId}
                onChange={handleChange}
              >
                <option value="">-- Select Staff --</option>
                {hubStaffs.map((staff) => (
                  <option key={staff._id} value={staff._id}>
                    {staff.name} ({staff.phone})
                  </option>
                ))}
              </Select>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button color="gray" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Updating...
                </>
              ) : (
                "Update Order"
              )}
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  )
}

export default EditOrderModal
