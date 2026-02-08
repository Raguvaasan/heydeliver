import * as Yup from "yup"

/**
 * Comprehensive validation schemas for all forms in the application
 * Using Yup for type-safe, consistent validation
 */

// ==================== COMMON VALIDATIONS ====================

export const emailValidation = Yup.string()
  .email("Please enter a valid email address")
  .required("Email is required")

export const phoneValidation = Yup.string()
  .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
  .required("Phone number is required")

export const pincodeValidation = Yup.string()
  .matches(/^[0-9]{6}$/, "Pincode must be exactly 6 digits")
  .required("Pincode is required")

export const passwordValidation = Yup.string()
  .min(8, "Password must be at least 8 characters")
  .matches(/[a-z]/, "Password must contain at least one lowercase letter")
  .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
  .matches(/[0-9]/, "Password must contain at least one number")
  .matches(/[@$!%*?&#]/, "Password must contain at least one special character (@$!%*?&#)")
  .required("Password is required")

export const nameValidation = Yup.string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must not exceed 100 characters")
  .matches(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces")
  .required("Name is required")

export const usernameValidation = Yup.string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must not exceed 30 characters")
  .matches(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
  .required("Username is required")

// ==================== ORDER VALIDATIONS ====================

export const orderValidationSchema = Yup.object({
  // Customer Details
  customerName: nameValidation,
  customerPhone: phoneValidation,
  customerEmail: emailValidation.optional(),
  
  // Delivery Address
  deliveryAddress: Yup.string()
    .min(10, "Address must be at least 10 characters")
    .max(200, "Address must not exceed 200 characters")
    .required("Delivery address is required"),
  deliveryCity: Yup.string()
    .min(2, "City name is required")
    .required("City is required"),
  deliveryState: Yup.string()
    .min(2, "State is required")
    .required("State is required"),
  deliveryPincode: pincodeValidation,
  deliveryCountry: Yup.string().required("Country is required"),
  
  // Order Details
  orderId: Yup.string().required("Order ID is required"),
  paymentMode: Yup.string()
    .oneOf(["COD", "Prepaid"], "Invalid payment mode")
    .required("Payment mode is required"),
  codAmount: Yup.string().when("paymentMode", {
    is: "COD",
    then: (schema) => schema
      .required("COD amount is required")
      .matches(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
    otherwise: (schema) => schema.optional(),
  }),
  totalAmount: Yup.string()
    .required("Total amount is required")
    .matches(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  orderDate: Yup.string().optional(),
  
  // Seller/Return Details
  sellerName: Yup.string().optional(),
  sellerAddress: Yup.string().optional(),
  returnAddress: Yup.string().optional(),
  returnCity: Yup.string().optional(),
  returnState: Yup.string().optional(),
  returnPincode: Yup.string()
    .matches(/^[0-9]{6}$/, "Pincode must be 6 digits")
    .optional(),
  returnPhone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
    .optional(),
  
  // Product Details
  productsDesc: Yup.string()
    .max(500, "Description must not exceed 500 characters")
    .required("Product description is required"),
  hsnCode: Yup.string()
    .matches(/^[0-9]{4,8}$/, "HSN code must be 4-8 digits")
    .optional(),
  quantity: Yup.string()
    .matches(/^[1-9][0-9]*$/, "Quantity must be a positive number")
    .required("Quantity is required"),
  
  // Shipping
  shippingMode: Yup.string()
    .oneOf(["Surface", "Express", "Air"], "Invalid shipping mode")
    .required("Shipping mode is required"),
  addressType: Yup.string().optional(),
  
  // Warehouse
  pickupLocation: Yup.string()
    .min(2, "Pickup location is required")
    .required("Pickup location is required"),
})

// Box/Package Validation
export const boxValidationSchema = Yup.object({
  packageType: Yup.string()
    .oneOf(["Box", "Envelope", "Bag"], "Invalid package type")
    .required("Package type is required"),
  length: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, "Length must be a valid number")
    .test("min", "Length must be at least 1", (val) => parseFloat(val || "0") >= 1)
    .required("Length is required"),
  breadth: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, "Breadth must be a valid number")
    .test("min", "Breadth must be at least 1", (val) => parseFloat(val || "0") >= 1)
    .required("Breadth is required"),
  height: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, "Height must be a valid number")
    .test("min", "Height must be at least 1", (val) => parseFloat(val || "0") >= 1)
    .required("Height is required"),
  weight: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, "Weight must be a valid number")
    .test("min", "Weight must be at least 0.1", (val) => parseFloat(val || "0") >= 0.1)
    .test("max", "Weight cannot exceed 50kg", (val) => parseFloat(val || "0") <= 50)
    .required("Weight is required"),
})

// ==================== USER MANAGEMENT VALIDATIONS ====================

export const staffValidationSchema = Yup.object({
  name: nameValidation,
  email: emailValidation,
  phone: phoneValidation,
  username: usernameValidation,
  password: Yup.string().when("$isEditing", {
    is: false,
    then: (schema) => passwordValidation,
    otherwise: (schema) => schema.optional(),
  }),
  roleId: Yup.string().required("Role is required"),
  franchiseId: Yup.string().when("$userType", {
    is: "franchise",
    then: (schema) => schema.required("Franchise is required"),
    otherwise: (schema) => schema.optional(),
  }),
  status: Yup.string().oneOf(["active", "inactive"]).required(),
})

export const roleValidationSchema = Yup.object({
  roleName: Yup.string()
    .min(3, "Role name must be at least 3 characters")
    .max(50, "Role name must not exceed 50 characters")
    .required("Role name is required"),
  description: Yup.string()
    .max(200, "Description must not exceed 200 characters")
    .optional(),
  permissions: Yup.array()
    .of(Yup.string())
    .min(1, "At least one permission is required")
    .required("Permissions are required"),
})

// ==================== AGENCY/FRANCHISE VALIDATIONS ====================

export const agencyValidationSchema = Yup.object({
  agencyName: Yup.string()
    .min(3, "Agency name must be at least 3 characters")
    .max(100, "Agency name must not exceed 100 characters")
    .required("Agency name is required"),
  agencyOwner: Yup.string()
    .min(2, "Owner name must be at least 2 characters")
    .max(100, "Owner name must not exceed 100 characters")
    .optional(),
  contactPerson: Yup.string()
    .min(2, "Contact person must be at least 2 characters")
    .max(100, "Contact person must not exceed 100 characters")
    .optional(),
  email: emailValidation,
  phone: phoneValidation,
  address: Yup.string()
    .min(10, "Address must be at least 10 characters")
    .max(200, "Address must not exceed 200 characters")
    .required("Address is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  pincode: pincodeValidation,
  gstNumber: Yup.string()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GST number format")
    .optional(),
  panNumber: Yup.string()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN number format")
    .optional(),
  username: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must not exceed 30 characters")
    .optional(),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  commissionRate: Yup.number()
    .min(0, "Commission rate cannot be negative")
    .max(100, "Commission rate cannot exceed 100%")
    .optional(),
  status: Yup.string().oneOf(["Active", "Inactive", "active", "inactive"]).required(),
})

// ==================== PROFILE VALIDATIONS ====================

export const profileValidationSchema = Yup.object({
  firstName: Yup.string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters")
    .required("First name is required"),
  lastName: Yup.string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters")
    .required("Last name is required"),
  email: emailValidation,
  phone: phoneValidation,
  address: Yup.string()
    .max(200, "Address must not exceed 200 characters")
    .optional(),
  city: Yup.string().optional(),
  state: Yup.string().optional(),
  pincode: Yup.string()
    .matches(/^[0-9]{6}$/, "Pincode must be 6 digits")
    .optional(),
})

export const changePasswordSchema = Yup.object({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: passwordValidation,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your password"),
})

// ==================== SETTINGS VALIDATIONS ====================

export const rateCardValidationSchema = Yup.object({
  name: Yup.string()
    .min(3, "Rate card name is required")
    .required("Name is required"),
  zone: Yup.string().required("Zone is required"),
  minWeight: Yup.number()
    .min(0, "Weight cannot be negative")
    .required("Minimum weight is required"),
  maxWeight: Yup.number()
    .min(0, "Weight cannot be negative")
    .test("greater", "Max weight must be greater than min weight", function(value) {
      return value ? value > this.parent.minWeight : true
    })
    .required("Maximum weight is required"),
  rate: Yup.number()
    .min(0, "Rate cannot be negative")
    .required("Rate is required"),
  additionalRate: Yup.number()
    .min(0, "Additional rate cannot be negative")
    .optional(),
})

export const markupValidationSchema = Yup.object({
  serviceType: Yup.string().required("Service type is required"),
  markupType: Yup.string()
    .oneOf(["percentage", "fixed"], "Invalid markup type")
    .required("Markup type is required"),
  markupValue: Yup.number()
    .min(0, "Markup value cannot be negative")
    .test("max-percentage", "Percentage cannot exceed 100%", function(value) {
      if (this.parent.markupType === "percentage") {
        return value ? value <= 100 : true
      }
      return true
    })
    .required("Markup value is required"),
})

export const pincodeValidationSchema = Yup.object({
  pincode: pincodeValidation,
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  serviceAvailable: Yup.boolean().required(),
  codAvailable: Yup.boolean().optional(),
  prepaidAvailable: Yup.boolean().optional(),
  deliveryDays: Yup.number()
    .min(1, "Delivery days must be at least 1")
    .max(30, "Delivery days cannot exceed 30")
    .required("Delivery days is required"),
})

// ==================== WALLET/PAYMENT VALIDATIONS ====================

export const addMoneyValidationSchema = Yup.object({
  amount: Yup.number()
    .min(100, "Minimum amount is ₹100")
    .max(50000, "Maximum amount is ₹50,000")
    .required("Amount is required"),
  paymentMethod: Yup.string()
    .oneOf(["upi", "card", "netbanking"], "Invalid payment method")
    .required("Payment method is required"),
})

// ==================== TRACKING VALIDATIONS ====================

export const trackingValidationSchema = Yup.object({
  waybill: Yup.string()
    .matches(/^[A-Z0-9]+$/, "Invalid waybill format")
    .required("Waybill number is required"),
})

// ==================== PICKUP REQUEST VALIDATIONS ====================

export const pickupRequestValidationSchema = Yup.object({
  pickupDate: Yup.date()
    .min(new Date(), "Pickup date cannot be in the past")
    .required("Pickup date is required"),
  pickupTime: Yup.string().required("Pickup time is required"),
  contactPerson: nameValidation,
  contactPhone: phoneValidation,
  address: Yup.string()
    .min(10, "Address must be at least 10 characters")
    .required("Pickup address is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  pincode: pincodeValidation,
  numberOfPackages: Yup.number()
    .min(1, "At least 1 package is required")
    .max(100, "Cannot exceed 100 packages")
    .required("Number of packages is required"),
  totalWeight: Yup.number()
    .min(0.1, "Weight must be at least 0.1 kg")
    .required("Total weight is required"),
  instructions: Yup.string()
    .max(500, "Instructions must not exceed 500 characters")
    .optional(),
})

// Export all schemas for easy import
export default {
  order: orderValidationSchema,
  box: boxValidationSchema,
  staff: staffValidationSchema,
  role: roleValidationSchema,
  agency: agencyValidationSchema,
  profile: profileValidationSchema,
  changePassword: changePasswordSchema,
  rateCard: rateCardValidationSchema,
  markup: markupValidationSchema,
  pincode: pincodeValidationSchema,
  addMoney: addMoneyValidationSchema,
  tracking: trackingValidationSchema,
  pickupRequest: pickupRequestValidationSchema,
}
