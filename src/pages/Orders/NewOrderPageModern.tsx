import { FC, useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Formik, Form, FieldArray } from "formik"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { useOrderStore } from "../../store/orderStore"
import { orderValidationSchema, boxValidationSchema } from "../../utils/validationSchemas"
import { FormInput, FormSelect, FormTextarea } from "../../components/FormComponents"
import { SaveButton, FormSection, ProgressSteps } from "../../components/FormHelpers"
import { sanitizeText } from "../../utils/sanitize"
import toast from "react-hot-toast"
import { 
  HiUser, HiLocationMarker, HiShoppingCart, HiCube, 
  HiTruck, HiPlus, HiTrash, HiRefresh 
} from "react-icons/hi"

interface BoxDetails {
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

const NewOrderPageModern: FC = () => {
  const navigate = useNavigate()
  const { createDelhiveryShipment, loading } = useOrderStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)

  // Get user profile data for franchise
  const loginType = sessionStorage.getItem("loginType")
  const profileDataStr = sessionStorage.getItem("profileData")
  const profileData = profileDataStr ? JSON.parse(profileDataStr) : null

  const steps = ["Customer", "Delivery", "Product", "Shipping"]

  // Initial values
  const initialValues = useMemo(() => ({
    // Customer Details
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    
    // Delivery Address
    deliveryAddress: "",
    deliveryCity: "",
    deliveryState: "",
    deliveryPincode: "",
    deliveryCountry: "India",
    
    // Order Details
    orderId: generateOrderId(),
    paymentMode: "COD",
    codAmount: "",
    totalAmount: "",
    orderDate: new Date().toISOString().split('T')[0],
    
    // Seller/Return Details (optional)
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
    quantity: "1",
    
    // Shipping
    shippingMode: "Surface",
    addressType: "home",
    
    // Warehouse
    pickupLocation: profileData?.agencyName || profileData?.name || "",
    
    // Boxes
    boxes: [{
      packageType: "Box",
      length: "",
      breadth: "",
      height: "",
      weight: "",
    }] as BoxDetails[],
  }), [profileData])

  const paymentModeOptions = [
    { value: "COD", label: "Cash on Delivery (COD)" },
    { value: "Prepaid", label: "Prepaid" },
  ]

  const shippingModeOptions = [
    { value: "Surface", label: "Surface (Standard)" },
    { value: "Express", label: "Express (Fast)" },
    { value: "Air", label: "Air (Fastest)" },
  ]

  const packageTypeOptions = [
    { value: "Box", label: "Box" },
    { value: "Envelope", label: "Envelope" },
    { value: "Bag", label: "Bag" },
  ]

  const handleSubmit = async (values: typeof initialValues, { setSubmitting }: any) => {
    try {
      // Sanitize user inputs
      const sanitizedValues = {
        ...values,
        customerName: sanitizeText(values.customerName),
        deliveryAddress: sanitizeText(values.deliveryAddress),
        productsDesc: sanitizeText(values.productsDesc),
      }

      // Calculate total weight and volume
      const totalWeight = values.boxes.reduce(
        (sum, box) => sum + (parseFloat(box.weight) || 0),
        0
      )

      // Prepare shipment data for Delhivery
      const shipmentData = {
        name: sanitizedValues.customerName,
        phone: sanitizedValues.customerPhone,
        add: sanitizedValues.deliveryAddress,
        city: sanitizedValues.deliveryCity,
        state: sanitizedValues.deliveryState,
        pin: sanitizedValues.deliveryPincode,
        country: sanitizedValues.deliveryCountry,
        order: sanitizedValues.orderId,
        payment_mode: sanitizedValues.paymentMode,
        cod_amount: sanitizedValues.paymentMode === "COD" ? sanitizedValues.codAmount : "0",
        total_amount: "0",
        products_desc: sanitizedValues.productsDesc,
        hsn_code: sanitizedValues.hsnCode,
        quantity: sanitizedValues.quantity,
        weight: totalWeight.toString(),
        shipping_mode: sanitizedValues.shippingMode,
        order_date: sanitizedValues.orderDate || null,
        
        // Optional return details
        ...(sanitizedValues.returnAddress && {
          return_add: sanitizedValues.returnAddress,
          return_city: sanitizedValues.returnCity,
          return_state: sanitizedValues.returnState,
          return_pin: sanitizedValues.returnPincode,
          return_phone: sanitizedValues.returnPhone,
          return_country: sanitizedValues.returnCountry,
        }),
        
        // Optional seller details
        ...(sanitizedValues.sellerName && {
          seller_name: sanitizedValues.sellerName,
          seller_add: sanitizedValues.sellerAddress,
          seller_inv: sanitizedValues.sellerInvoice,
        }),
      }

      // Create shipment
      const response = await createDelhiveryShipment(
        shipmentData,
        sanitizedValues.pickupLocation,
        {
          freightrekTotalAmount: sanitizedValues.totalAmount || sanitizedValues.codAmount || "0",
          freightrekCodAmount: sanitizedValues.codAmount || "0",
        }
      )

      if (response.success) {
        setShowSuccess(true)
        toast.success("Order created successfully!")
        
        // Redirect after success
        setTimeout(() => {
          navigate("/orders")
        }, 2000)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create order")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4 pt-6 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Create New Order
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Fill in the details below to create a new delivery order
            </p>
          </div>
          <button
            onClick={() => navigate("/orders")}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            ← Back to Orders
          </button>
        </div>

        {/* Progress Steps */}
        <ProgressSteps steps={steps} currentStep={currentStep} />

        {/* Form */}
        <Formik
          initialValues={initialValues}
          validationSchema={orderValidationSchema}
          onSubmit={handleSubmit}
          validateOnChange={true}
          validateOnBlur={true}
        >
          {({ values, errors, touched, isSubmitting, setFieldValue }) => (
            <Form className="space-y-6 mt-8">
              {/* Customer Details Section */}
              <FormSection
                title="Customer Information"
                description="Enter customer contact details"
                icon={<HiUser className="w-6 h-6" />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    name="customerName"
                    label="Customer Name"
                    required
                    icon={<HiUser className="w-5 h-5" />}
                  />
                  <FormInput
                    name="customerPhone"
                    label="Phone Number"
                    type="tel"
                    required
                    helperText="10-digit mobile number"
                    maxLength={10}
                  />
                  <FormInput
                    name="customerEmail"
                    label="Email Address"
                    type="email"
                    helperText="Optional"
                  />
                </div>
              </FormSection>

              {/* Delivery Address Section */}
              <FormSection
                title="Delivery Address"
                description="Where should we deliver this order?"
                icon={<HiLocationMarker className="w-6 h-6" />}
              >
                <div className="space-y-6">
                  <FormTextarea
                    name="deliveryAddress"
                    label="Complete Address"
                    rows={3}
                    required
                    helperText="Include house/flat number, street, landmark"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormInput
                      name="deliveryCity"
                      label="City"
                      required
                    />
                    <FormInput
                      name="deliveryState"
                      label="State"
                      required
                    />
                    <FormInput
                      name="deliveryPincode"
                      label="Pincode"
                      type="text"
                      maxLength={6}
                      required
                      helperText="6-digit pincode"
                    />
                  </div>
                  <FormInput
                    name="deliveryCountry"
                    label="Country"
                    value="India"
                    disabled
                  />
                </div>
              </FormSection>

              {/* Order Details Section */}
              <FormSection
                title="Order Details"
                description="Payment and order information"
                icon={<HiShoppingCart className="w-6 h-6" />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    name="orderId"
                    label="Order ID"
                    required
                    disabled
                    icon={<HiRefresh className="w-5 h-5 cursor-pointer" onClick={() => setFieldValue("orderId", generateOrderId())} />}
                    helperText="Click icon to regenerate"
                  />
                  <FormSelect
                    name="paymentMode"
                    label="Payment Mode"
                    options={paymentModeOptions}
                    required
                  />
                  {values.paymentMode === "COD" && (
                    <FormInput
                      name="codAmount"
                      label="COD Amount"
                      type="number"
                      required
                      helperText="Amount to collect on delivery"
                    />
                  )}
                  <FormInput
                    name="totalAmount"
                    label="Total Amount"
                    type="number"
                    required
                  />
                  <FormInput
                    name="orderDate"
                    label="Order Date"
                    type="date"
                  />
                </div>
              </FormSection>

              {/* Product Details Section */}
              <FormSection
                title="Product Information"
                description="What are you shipping?"
                icon={<HiCube className="w-6 h-6" />}
              >
                <div className="space-y-6">
                  <FormTextarea
                    name="productsDesc"
                    label="Product Description"
                    rows={3}
                    required
                    helperText="Describe the contents (max 500 characters)"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                      name="quantity"
                      label="Quantity"
                      type="number"
                      min="1"
                      required
                    />
                    <FormInput
                      name="hsnCode"
                      label="HSN Code"
                      helperText="Optional (4-8 digits)"
                    />
                  </div>
                </div>
              </FormSection>

              {/* Package Details Section */}
              <FormSection
                title="Package Dimensions"
                description="Add dimensions for each package"
                icon={<HiCube className="w-6 h-6" />}
              >
                <FieldArray name="boxes">
                  {({ push, remove }) => (
                    <div className="space-y-4">
                      {values.boxes.map((box, index) => (
                        <div
                          key={index}
                          className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg space-y-4"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              Package {index + 1}
                            </h4>
                            {values.boxes.length > 1 && (
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="text-red-600 hover:text-red-700 dark:text-red-400"
                              >
                                <HiTrash className="w-5 h-5" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <FormSelect
                              name={`boxes.${index}.packageType`}
                              label="Type"
                              options={packageTypeOptions}
                              required
                            />
                            <FormInput
                              name={`boxes.${index}.length`}
                              label="Length (cm)"
                              type="number"
                              step="0.01"
                              required
                            />
                            <FormInput
                              name={`boxes.${index}.breadth`}
                              label="Breadth (cm)"
                              type="number"
                              step="0.01"
                              required
                            />
                            <FormInput
                              name={`boxes.${index}.height`}
                              label="Height (cm)"
                              type="number"
                              step="0.01"
                              required
                            />
                            <FormInput
                              name={`boxes.${index}.weight`}
                              label="Weight (kg)"
                              type="number"
                              step="0.01"
                              required
                            />
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => push({
                          packageType: "Box",
                          length: "",
                          breadth: "",
                          height: "",
                          weight: "",
                        })}
                        className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:text-orange-700 border-2 border-dashed border-orange-300 hover:border-orange-400 rounded-lg transition-colors"
                      >
                        <HiPlus className="w-5 h-5" />
                        Add Another Package
                      </button>
                    </div>
                  )}
                </FieldArray>
              </FormSection>

              {/* Shipping Details Section */}
              <FormSection
                title="Shipping Configuration"
                description="Select shipping method and pickup location"
                icon={<HiTruck className="w-6 h-6" />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormSelect
                    name="shippingMode"
                    label="Shipping Mode"
                    options={shippingModeOptions}
                    required
                  />
                  <FormInput
                    name="pickupLocation"
                    label="Pickup Location"
                    required
                    helperText="Warehouse or pickup point"
                  />
                </div>
              </FormSection>

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => navigate("/orders")}
                  className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 font-semibold transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      // Save as draft logic here
                      toast.success("Draft saved!")
                    }}
                    className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 font-semibold transition-colors"
                    disabled={isSubmitting}
                  >
                    Save as Draft
                  </button>

                  <SaveButton
                    loading={isSubmitting || loading}
                    type="submit"
                  >
                    Create Order
                  </SaveButton>
                </div>
              </div>

              {/* Debug: Show validation errors (only in development) */}
              {import.meta.env.DEV && Object.keys(errors).length > 0 && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <h4 className="font-semibold text-red-800 dark:text-red-400 mb-2">
                    Validation Errors:
                  </h4>
                  <pre className="text-sm text-red-600 dark:text-red-400 overflow-auto">
                    {JSON.stringify(errors, null, 2)}
                  </pre>
                </div>
              )}
            </Form>
          )}
        </Formik>
      </div>
    </NavbarSidebarLayout>
  )
}

export default NewOrderPageModern
