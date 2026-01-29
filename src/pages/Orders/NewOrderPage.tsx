import { FC, useState, useEffect } from "react"
import { Button, Card, Label, TextInput, Select } from "flowbite-react"
import { useNavigate } from "react-router-dom"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { useOrderStore } from "../../store/orderStore"
import toast from "react-hot-toast"
import { HiPlus, HiTrash, HiRefresh } from "react-icons/hi"

interface BoxDetails {
  id: number
  packageType: string
  length: string
  breadth: string
  height: string
  weight: string
}

// Generate unique order ID
const generateOrderId = () => {
  const prefix = "ORD"
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${prefix}${timestamp}${random}`
}

const NewOrderPage: FC = () => {
  const navigate = useNavigate()
  const { createDelhiveryShipment, loading } = useOrderStore()

  // Get user profile data for franchise
  const loginType = sessionStorage.getItem("loginType")
  const profileDataStr = sessionStorage.getItem("profileData")
  const profileData = profileDataStr ? JSON.parse(profileDataStr) : null

  const [formData, setFormData] = useState({
    // Customer Details
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    deliveryAddress: "",
    deliveryCity: "",
    deliveryState: "",
    deliveryPincode: "",
    deliveryCountry: "India",
    
    // Order Details
    orderId: generateOrderId(),
    channelName: "",
    paymentMode: "",
    codAmount: "",
    totalAmount: "",
    orderDate: "",
    
    // Seller/Return Details
    sellerName: "",
    sellerAddress: "",
    sellerInvoice: "",
    returnAddress: "",
    returnCity: "",
    returnState: "",
    returnPincode: "",
    returnPhone: "",
    returnCountry: "India",
    
    // Product Details
    productsDesc: "",
    hsnCode: "",
    quantity: "",
    
    // Shipping
    shippingMode: "Surface",
    addressType: "",
    
    // Warehouse
    pickupLocation: "",
  })

  // Auto-populate pickup location for franchise users
  useEffect(() => {
    if (loginType === "franchise" && profileData) {
      const warehouseName = profileData.agencyName || profileData.name || ""
      if (warehouseName) {
        setFormData((prev) => ({
          ...prev,
          pickupLocation: warehouseName,
        }))
      }
    }
  }, [loginType, profileData])

  const [boxes, setBoxes] = useState<BoxDetails[]>([
    {
      id: 1,
      packageType: "Box",
      length: "",
      breadth: "",
      height: "",
      weight: "",
    },
  ])

  const [showSellerDetails, setShowSellerDetails] = useState(false)
  const [showCustomerDetails, setShowCustomerDetails] = useState(false)

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

    // Validation
    if (!formData.customerName || !formData.customerPhone) {
      toast.error("Customer name and phone are required")
      return
    }

    if (!formData.deliveryAddress || !formData.deliveryPincode) {
      toast.error("Delivery address and pincode are required")
      return
    }

    if (formData.customerPhone.length !== 10) {
      toast.error("Phone number must be 10 digits")
      return
    }

    if (formData.deliveryPincode.length !== 6) {
      toast.error("Pincode must be 6 digits")
      return
    }

    if (boxes.length === 0 || !boxes[0].weight) {
      toast.error("Please add at least one box with weight")
      return
    }

    if (!formData.pickupLocation) {
      toast.error("Please enter pickup location/warehouse name")
      return
    }

    try {
      // Calculate total weight from all boxes
      const totalWeight = boxes.reduce((sum, box) => sum + (parseFloat(box.weight) || 0), 0)

      // Use first box dimensions (you can calculate volumetric weight if needed)
      const firstBox = boxes[0]

      const shipmentData = {
        name: formData.customerName,
        add: formData.deliveryAddress,
        pin: formData.deliveryPincode,
        city: formData.deliveryCity,
        state: formData.deliveryState,
        country: formData.deliveryCountry,
        phone: formData.customerPhone,
        order: formData.orderId,
        payment_mode: formData.paymentMode,
        return_pin: formData.returnPincode || "",
        return_city: formData.returnCity || "",
        return_phone: formData.returnPhone || "",
        return_add: formData.returnAddress || "",
        return_state: formData.returnState || "",
        return_country: formData.returnCountry || "",
        products_desc: formData.productsDesc || "",
        hsn_code: formData.hsnCode || "",
        cod_amount: formData.paymentMode === "COD" ? formData.codAmount : "",
        order_date: formData.orderDate || null,
        total_amount: formData.totalAmount || "",
        seller_add: formData.sellerAddress || "",
        seller_name: formData.sellerName || "",
        seller_inv: formData.sellerInvoice || "",
        quantity: formData.quantity || "",
        waybill: "",
        shipment_width: firstBox.breadth || "100",
        shipment_height: firstBox.height || "100",
        weight: totalWeight.toString(),
        shipping_mode: formData.shippingMode,
        address_type: formData.addressType || "",
      }

      const response = await createDelhiveryShipment(shipmentData, formData.pickupLocation)
      
      console.log("Shipment created:", response)
      
      // Navigate to orders page on success
      setTimeout(() => {
        navigate("/orders")
      }, 1500)
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
                  <div className="flex gap-2">
                    <TextInput
                      id="orderId"
                      name="orderId"
                      type="text"
                      placeholder="Auto-generated Order ID"
                      value={formData.orderId}
                      onChange={handleChange}
                      required
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      color="gray"
                      onClick={() => setFormData({ ...formData, orderId: generateOrderId() })}
                      title="Generate new Order ID"
                    >
                      <HiRefresh className="h-5 w-5" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-generated unique order ID. Click refresh to generate new one.
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
                  onClick={() => setShowSellerDetails(!showSellerDetails)}
                >
                  📝 {showSellerDetails ? "Hide" : "Add"} Seller Details
                </Button>

                {showSellerDetails && (
                  <div className="space-y-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div>
                      <Label htmlFor="sellerName">Seller Name</Label>
                      <TextInput
                        id="sellerName"
                        name="sellerName"
                        value={formData.sellerName}
                        onChange={handleChange}
                        placeholder="Enter seller name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sellerAddress">Seller Address</Label>
                      <TextInput
                        id="sellerAddress"
                        name="sellerAddress"
                        value={formData.sellerAddress}
                        onChange={handleChange}
                        placeholder="Enter seller address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sellerInvoice">Seller Invoice Number</Label>
                      <TextInput
                        id="sellerInvoice"
                        name="sellerInvoice"
                        value={formData.sellerInvoice}
                        onChange={handleChange}
                        placeholder="Enter invoice number"
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="button"
                  color="gray"
                  size="sm"
                  className="w-full border-orange-500 text-orange-500"
                  onClick={() => setShowCustomerDetails(!showCustomerDetails)}
                >
                  👤 {showCustomerDetails ? "Hide" : "Add"} Customer Details
                </Button>

                {showCustomerDetails && (
                  <div className="space-y-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div>
                      <Label htmlFor="customerName">Customer Name *</Label>
                      <TextInput
                        id="customerName"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        placeholder="Enter customer name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerPhone">Customer Phone *</Label>
                      <TextInput
                        id="customerPhone"
                        name="customerPhone"
                        type="tel"
                        value={formData.customerPhone}
                        onChange={handleChange}
                        placeholder="10 digit mobile number"
                        maxLength={10}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerEmail">Customer Email</Label>
                      <TextInput
                        id="customerEmail"
                        name="customerEmail"
                        type="email"
                        value={formData.customerEmail}
                        onChange={handleChange}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="deliveryAddress">Delivery Address *</Label>
                      <TextInput
                        id="deliveryAddress"
                        name="deliveryAddress"
                        value={formData.deliveryAddress}
                        onChange={handleChange}
                        placeholder="Enter complete delivery address"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="deliveryCity">City</Label>
                        <TextInput
                          id="deliveryCity"
                          name="deliveryCity"
                          value={formData.deliveryCity}
                          onChange={handleChange}
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <Label htmlFor="deliveryState">State</Label>
                        <TextInput
                          id="deliveryState"
                          name="deliveryState"
                          value={formData.deliveryState}
                          onChange={handleChange}
                          placeholder="State"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="deliveryPincode">Pincode *</Label>
                        <TextInput
                          id="deliveryPincode"
                          name="deliveryPincode"
                          value={formData.deliveryPincode}
                          onChange={handleChange}
                          placeholder="6 digit pincode"
                          maxLength={6}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="deliveryCountry">Country</Label>
                        <TextInput
                          id="deliveryCountry"
                          name="deliveryCountry"
                          value={formData.deliveryCountry}
                          onChange={handleChange}
                          placeholder="Country"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Add Products to be shipped */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="text-orange-500">➕</span> Product Details{" "}
                <span className="text-gray-400">ⓘ</span>
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="productsDesc">Product Description</Label>
                <TextInput
                  id="productsDesc"
                  name="productsDesc"
                  value={formData.productsDesc}
                  onChange={handleChange}
                  placeholder="Enter product description"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Brief description of products being shipped
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <TextInput
                    id="quantity"
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="Enter quantity"
                  />
                </div>
                <div>
                  <Label htmlFor="hsnCode">HSN Code</Label>
                  <TextInput
                    id="hsnCode"
                    name="hsnCode"
                    value={formData.hsnCode}
                    onChange={handleChange}
                    placeholder="Enter HSN code"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalAmount">Total Amount (₹)</Label>
                  <TextInput
                    id="totalAmount"
                    name="totalAmount"
                    type="number"
                    value={formData.totalAmount}
                    onChange={handleChange}
                    placeholder="Enter total amount"
                  />
                </div>
                <div>
                  <Label htmlFor="orderDate">Order Date</Label>
                  <TextInput
                    id="orderDate"
                    name="orderDate"
                    type="date"
                    value={formData.orderDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Pickup Location */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-orange-500">🏭</span> Pickup Location *
            </h3>
            <div>
              <Label htmlFor="pickupLocation">Warehouse/Pickup Location Name</Label>
              <TextInput
                id="pickupLocation"
                name="pickupLocation"
                value={formData.pickupLocation}
                onChange={handleChange}
                placeholder={loginType === "franchise" ? "Auto-filled from your profile" : "Enter warehouse or pickup location name"}
                required
                disabled={loginType === "franchise"}
                className={loginType === "franchise" ? "bg-gray-100 dark:bg-gray-700" : ""}
              />
              <p className="text-xs text-gray-500 mt-1">
                {loginType === "franchise" 
                  ? "Auto-filled from your registered franchise location"
                  : "This must match your registered warehouse name in Delhivery"
                }
              </p>
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
              Choose shipping mode *
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, shippingMode: "Surface" })}
                className={`p-6 rounded-lg border-2 transition-colors ${
                  formData.shippingMode === "Surface"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="text-4xl mb-2">🚚</div>
                <h4 className="font-semibold">SURFACE</h4>
                <p className="text-sm text-gray-600 mt-2">Standard delivery (5-7 days)</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, shippingMode: "Express" })}
                className={`p-6 rounded-lg border-2 transition-colors ${
                  formData.shippingMode === "Express"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="text-4xl mb-2">✈️</div>
                <h4 className="font-semibold">EXPRESS</h4>
                <p className="text-sm text-gray-600 mt-2">Fast delivery (2-3 days)</p>
              </button>
            </div>
          </Card>

          {/* Payment Details */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-orange-500">💳</span> Payment Details *{" "}
              <span className="text-gray-400">ⓘ</span>
            </h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="paymentMode">Payment Mode</Label>
                <Select
                  id="paymentMode"
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Payment Mode</option>
                  <option value="Prepaid">Prepaid</option>
                  <option value="COD">Cash on Delivery (COD)</option>
                </Select>
              </div>

              {formData.paymentMode === "COD" && (
                <div>
                  <Label htmlFor="codAmount">COD Amount (₹) *</Label>
                  <TextInput
                    id="codAmount"
                    name="codAmount"
                    type="number"
                    value={formData.codAmount}
                    onChange={handleChange}
                    placeholder="Enter COD collection amount"
                    required={formData.paymentMode === "COD"}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Amount to be collected from customer
                  </p>
                </div>
              )}
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
