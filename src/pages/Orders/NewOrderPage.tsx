import { FC, useState } from "react"
import { Button, Card, Label, TextInput, Select } from "flowbite-react"
import { useNavigate } from "react-router-dom"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { useOrderStore } from "../../store/orderStore"
import toast from "react-hot-toast"
import { HiPlus, HiTrash } from "react-icons/hi"

interface BoxDetails {
  id: number
  packageType: string
  length: string
  breadth: string
  height: string
  weight: string
}

const NewOrderPage: FC = () => {
  const navigate = useNavigate()
  const { addOrder, loading } = useOrderStore()

  const [formData, setFormData] = useState({
    channelName: "",
    orderId: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    deliveryAddress: "",
    deliveryCity: "",
    deliveryState: "",
    deliveryPincode: "",
    paymentMode: "",
    shippingMode: "SURFACE",
  })

  const [boxes, setBoxes] = useState<BoxDetails[]>([
    {
      id: 1,
      packageType: "",
      length: "",
      breadth: "",
      height: "",
      weight: "",
    },
  ])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleBoxChange = (id: number, field: keyof BoxDetails, value: string) => {
    setBoxes((prev) =>
      prev.map((box) =>
        box.id === id ? { ...box, [field]: value } : box
      )
    )
  }

  const addBox = () => {
    const newId = boxes.length > 0 ? Math.max(...boxes.map((b) => b.id)) + 1 : 1
    setBoxes([
      ...boxes,
      {
        id: newId,
        packageType: "",
        length: "",
        breadth: "",
        height: "",
        weight: "",
      },
    ])
  }

  const removeBox = (id: number) => {
    if (boxes.length > 1) {
      setBoxes(boxes.filter((box) => box.id !== id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const orderData = {
        ...formData,
        boxes,
        status: "Pending",
        amount: 0, // Calculate based on boxes and shipping
      }

      await addOrder(orderData)
      navigate("/orders")
    } catch (error) {
      console.error("Order creation failed:", error)
    }
  }

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4 pt-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Orders
          </h1>
          <Button
            onClick={() => navigate("/orders")}
            color="gray"
          >
            Back
          </Button>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          New Order
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Details */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-orange-500">📋</span> Order Details
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="channelName">
                    Select Channel Name <span className="text-gray-400">ⓘ</span>
                  </Label>
                  <Select
                    id="channelName"
                    name="channelName"
                    value={formData.channelName}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Channel Name</option>
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Custom">Custom Channel</option>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Channels are online (Shopify) or custom channel for offline (physical store) orders.
                  </p>
                </div>

                <div>
                  <Label htmlFor="orderId">
                    Order ID <span className="text-gray-400">ⓘ</span>
                  </Label>
                  <TextInput
                    id="orderId"
                    name="orderId"
                    type="text"
                    placeholder="Enter Order ID/ Reference Number"
                    value={formData.orderId}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    It is a unique identification number for an order
                  </p>
                </div>
              </div>
            </Card>

            {/* Delivery Details */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-orange-500">📍</span> Delivery Details <span className="text-gray-400">ⓘ</span>
              </h3>

              <div className="space-y-4">
                <Button
                  type="button"
                  color="gray"
                  size="sm"
                  className="w-full border-orange-500 text-orange-500"
                >
                  📝 Add Seller Details
                </Button>

                <Button
                  type="button"
                  color="gray"
                  size="sm"
                  className="w-full border-orange-500 text-orange-500"
                >
                  👤 Add Customer Details
                </Button>
              </div>
            </Card>
          </div>

          {/* Add Products to be shipped */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="text-orange-500">➕</span> Add products to be shipped{" "}
                <span className="text-gray-400">ⓘ</span>
              </h3>
            </div>

            <div>
              <Label htmlFor="productSearch">
                Select Channel Name <span className="text-gray-400">ⓘ</span>
              </Label>
              <TextInput
                id="productSearch"
                type="text"
                placeholder="Enter atleast 3 letters to search by product name/ SKU code"
                className="mb-2"
              />
              <p className="text-xs text-gray-500 mb-4">
                Add products you want to ship. This cannot be modified once the order is created
              </p>

              <div className="flex items-center justify-center py-12 text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-2">📦</div>
                  <p>No products added</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Box Details */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="text-orange-500">📦</span> Box Details{" "}
                <span className="text-gray-400">ⓘ</span>
              </h3>
              <Button
                type="button"
                size="sm"
                onClick={addBox}
                className="bg-orange-500 hover:bg-orange-600"
              >
                + Add Box
              </Button>
            </div>

            <div className="space-y-4">
              {boxes.map((box, index) => (
                <div key={box.id} className="border border-orange-500 rounded-lg p-4 bg-orange-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">BOX {index + 1}</h4>
                    {boxes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBox(box.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <HiTrash className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Package Type</Label>
                      <Select
                        value={box.packageType}
                        onChange={(e) => handleBoxChange(box.id, "packageType", e.target.value)}
                        required
                      >
                        <option value="">Select Package</option>
                        <option value="Box">Box</option>
                        <option value="Envelope">Envelope</option>
                        <option value="Packet">Packet</option>
                      </Select>
                    </div>

                    <div>
                      <Label>Package Type</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <TextInput
                          type="number"
                          placeholder="L"
                          value={box.length}
                          onChange={(e) => handleBoxChange(box.id, "length", e.target.value)}
                          required
                        />
                        <TextInput
                          type="number"
                          placeholder="B"
                          value={box.breadth}
                          onChange={(e) => handleBoxChange(box.id, "breadth", e.target.value)}
                          required
                        />
                        <TextInput
                          type="number"
                          placeholder="H"
                          value={box.height}
                          onChange={(e) => handleBoxChange(box.id, "height", e.target.value)}
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Length x Breadth x Height should be atleast 15 cm
                      </p>
                    </div>

                    <div>
                      <Label>Package weight</Label>
                      <div className="flex gap-2 items-center">
                        <TextInput
                          type="number"
                          placeholder="Enter Package weight"
                          value={box.weight}
                          onChange={(e) => handleBoxChange(box.id, "weight", e.target.value)}
                          required
                          className="flex-1"
                        />
                        <span className="text-gray-500">gm</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Package weight should be atleast 50 grams
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  ⓘ The estimated cost may vary from the final shipping cost based on
                  the package dimensions & weight measured before delivery
                </p>
                <div>
                  <Label>Total Chargeable Weight <span className="text-gray-400">ⓘ</span></Label>
                  <p className="text-lg font-semibold">- gm</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Shipping Mode */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Choose shipping mode
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, shippingMode: "SURFACE" })}
                className={`p-6 rounded-lg border-2 transition-colors ${
                  formData.shippingMode === "SURFACE"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="text-4xl mb-2">🚚</div>
                <h4 className="font-semibold">SURFACE</h4>
                <p className="text-2xl font-bold text-orange-500 my-2">--</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, shippingMode: "EXPRESS" })}
                className={`p-6 rounded-lg border-2 transition-colors ${
                  formData.shippingMode === "EXPRESS"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="text-4xl mb-2">✈️</div>
                <h4 className="font-semibold">EXPRESS</h4>
                <p className="text-2xl font-bold text-orange-500 my-2">--</p>
              </button>
            </div>

            {/* Shipping Cost Breakup */}
            <div className="mt-6 space-y-2">
              <h4 className="font-semibold">Shipping Cost Breakup ▼</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Freight Cost</span>
                  <span>--</span>
                </div>
                <div className="flex justify-between">
                  <span>Fuel Surcharge</span>
                  <span>--</span>
                </div>
                <div className="flex justify-between">
                  <span>GST -18% (CGST + SGST)</span>
                  <span>--</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>--</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Payment Details */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-orange-500">💳</span> Payment Details{" "}
              <span className="text-gray-400">ⓘ</span>
            </h3>

            <div>
              <Label htmlFor="paymentMode">Payment Mode</Label>
              <Select
                id="paymentMode"
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option value="Prepaid">Prepaid</option>
                <option value="COD">Cash on Delivery (COD)</option>
                <option value="Credit">Credit</option>
              </Select>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              color="gray"
              onClick={() => navigate("/orders")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Order"}
            </Button>
          </div>
        </form>
      </div>
    </NavbarSidebarLayout>
  )
}

export default NewOrderPage
