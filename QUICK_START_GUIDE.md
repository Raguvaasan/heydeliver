# 🚀 Quick Start Guide - Modern Forms

## ✅ What's Ready To Use

### **Modern Pages (Live Now):**
1. ✅ **NewOrderPageModern** - `/orders/new`
2. ✅ **ProfilePageModern** - `/profile`
3. ✅ **FranchiseAddStaffPageModern** - `/franchise-staff/add`
4. ✅ **AddAgencyModalModern** - Agency management modal

### **Component Library:**
- ✅ `FormInput` - Text, email, tel, password, number inputs
- ✅ `FormSelect` - Dropdown with validation
- ✅ `FormTextarea` - Multi-line text
- ✅ `SaveButton` - Button with loading state
- ✅ `FormSection` - Organized card sections
- ✅ `ProgressSteps` - Multi-step indicator

### **Validation Schemas:**
- ✅ 12+ schemas ready to use
- ✅ Located in: `src/utils/validationSchemas.ts`

---

## 📝 Copy-Paste Templates

### **1. Basic Form:**
```typescript
import { Formik, Form } from 'formik'
import { FormInput, FormSelect } from '@/components/FormComponents'
import { SaveButton } from '@/components/FormHelpers'
import { profileValidationSchema } from '@/utils/validationSchemas'

<Formik
  initialValues={{ name: '', email: '' }}
  validationSchema={profileValidationSchema}
  onSubmit={async (values) => {
    // Handle submit
  }}
>
  {({ isSubmitting }) => (
    <Form>
      <FormInput name="name" label="Name" required />
      <FormInput name="email" label="Email" type="email" required />
      <SaveButton loading={isSubmitting}>Save</SaveButton>
    </Form>
  )}
</Formik>
```

### **2. Form with Sections:**
```typescript
import { FormSection } from '@/components/FormHelpers'
import { HiUser } from 'react-icons/hi'

<FormSection
  title="Personal Information"
  description="Enter your details"
  icon={<HiUser className="w-5 h-5" />}
>
  <FormInput name="firstName" label="First Name" required />
  <FormInput name="lastName" label="Last Name" required />
</FormSection>
```

### **3. Form with Grid Layout:**
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <FormInput name="firstName" label="First Name" required />
  <FormInput name="lastName" label="Last Name" required />
  <FormInput name="email" label="Email" type="email" required />
  <FormInput name="phone" label="Phone" type="tel" required />
</div>
```

### **4. Select Dropdown:**
```typescript
const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" }
]

<FormSelect
  name="status"
  label="Status"
  options={statusOptions}
  required
/>
```

### **5. Conditional Fields:**
```typescript
{values.paymentMode === "COD" && (
  <FormInput
    name="codAmount"
    label="COD Amount"
    type="number"
    required
  />
)}
```

### **6. Dynamic Arrays (Multiple Items):**
```typescript
import { FieldArray } from 'formik'

<FieldArray name="boxes">
  {({ push, remove }) => (
    <>
      {values.boxes.map((box, index) => (
        <div key={index} className="grid grid-cols-4 gap-4">
          <FormInput name={`boxes.${index}.length`} label="Length" required />
          <FormInput name={`boxes.${index}.width`} label="Width" required />
          <FormInput name={`boxes.${index}.height`} label="Height" required />
          <FormInput name={`boxes.${index}.weight`} label="Weight" required />
          <button onClick={() => remove(index)}>Remove</button>
        </div>
      ))}
      <button onClick={() => push({ length: '', width: '', height: '', weight: '' })}>
        Add Box
      </button>
    </>
  )}
</FieldArray>
```

### **7. With Input Sanitization:**
```typescript
import { sanitizeText } from '@/utils/sanitize'

onSubmit={async (values) => {
  const sanitizedValues = {
    name: sanitizeText(values.name),
    email: sanitizeText(values.email),
    // ... other fields
  }
  await api.post('/endpoint', sanitizedValues)
}
```

---

## 🎯 Available Validation Schemas

```typescript
import {
  orderValidationSchema,          // Order creation
  boxValidationSchema,             // Package dimensions
  staffValidationSchema,           // Staff management
  agencyValidationSchema,          // Agency/franchise
  profileValidationSchema,         // Profile updates
  changePasswordSchema,            // Password change
  roleValidationSchema,            // Role creation
  rateCardValidationSchema,        // Rate card config
  markupValidationSchema,          // Markup settings
  pincodeValidationSchema,         // Pincode management
  addMoneyValidationSchema,        // Wallet transactions
  trackingValidationSchema,        // Shipment tracking
  pickupRequestValidationSchema,   // Pickup requests
} from '@/utils/validationSchemas'
```

---

## 🎨 Common Icons

```typescript
import {
  HiUser,              // User/person
  HiMail,              // Email
  HiPhone,             // Phone
  HiLocationMarker,    // Location/address
  HiOfficeBuilding,    // Company/franchise
  HiLockClosed,        // Password/security
  HiCreditCard,        // Payment/banking
  HiCheckCircle,       // Status/success
  HiExclamation,       // Warning
  HiInformationCircle, // Info
} from 'react-icons/hi'
```

---

## 📦 Full Page Template

```typescript
import { FC } from "react"
import { Card } from "flowbite-react"
import { Formik, Form } from "formik"
import { HiUser } from "react-icons/hi"
import NavbarSidebarLayout from "@/layouts/navbar-sidebar"
import { FormInput, FormSelect } from "@/components/FormComponents"
import { SaveButton, FormSection } from "@/components/FormHelpers"
import { profileValidationSchema } from "@/utils/validationSchemas"
import { sanitizeText } from "@/utils/sanitize"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import http from "@/common/httpRequest"

const MyFormPage: FC = () => {
  const navigate = useNavigate()

  const handleSubmit = async (values: any) => {
    try {
      // Sanitize inputs
      const sanitizedValues = {
        name: sanitizeText(values.name),
        email: sanitizeText(values.email),
      }

      // Call API
      await http.post('/api/endpoint', sanitizedValues)
      
      toast.success("Saved successfully!")
      navigate("/list-page")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save")
      throw error
    }
  }

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4 pt-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Page Title
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Page description
          </p>
        </div>

        <Card>
          <Formik
            initialValues={{
              name: "",
              email: "",
            }}
            validationSchema={profileValidationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <FormSection
                  title="Section Title"
                  description="Section description"
                  icon={<HiUser className="w-5 h-5" />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      name="name"
                      label="Name"
                      required
                      icon={<HiUser />}
                      helperText="Enter your full name"
                    />
                    <FormInput
                      name="email"
                      label="Email"
                      type="email"
                      required
                    />
                  </div>
                </FormSection>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => navigate("/back")}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 text-gray-700 bg-white border rounded-lg"
                  >
                    Cancel
                  </button>
                  <SaveButton loading={isSubmitting}>
                    Save
                  </SaveButton>
                </div>
              </Form>
            )}
          </Formik>
        </Card>
      </div>
    </NavbarSidebarLayout>
  )
}

export default MyFormPage
```

---

## 🔍 Validation Examples

### **Phone Validation:**
```typescript
phone: Yup.string()
  .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
  .required("Phone is required")
```

### **Email Validation:**
```typescript
email: Yup.string()
  .email("Invalid email address")
  .required("Email is required")
```

### **Password Validation:**
```typescript
password: Yup.string()
  .min(8, "Password must be at least 8 characters")
  .matches(/[a-z]/, "Must contain lowercase")
  .matches(/[A-Z]/, "Must contain uppercase")
  .matches(/[0-9]/, "Must contain number")
  .matches(/[@$!%*?&#]/, "Must contain special character")
  .required("Password is required")
```

### **Pincode Validation:**
```typescript
pincode: Yup.string()
  .matches(/^[0-9]{6}$/, "Pincode must be 6 digits")
  .required("Pincode is required")
```

### **Conditional Validation:**
```typescript
codAmount: Yup.number()
  .when('paymentMode', {
    is: 'COD',
    then: Yup.number()
      .min(1, "COD amount must be greater than 0")
      .required("COD amount is required for COD orders")
  })
```

---

## 🎨 Styling Classes

### **Common Layouts:**
```typescript
// 2-column grid
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

// 3-column grid  
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">

// Responsive spacing
<div className="space-y-4">        // Vertical spacing
<div className="flex gap-4">       // Horizontal spacing
```

### **Card Styles:**
```typescript
// Standard card
<Card>

// Card with gradient header
<Card className="overflow-hidden">
  <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
    <h3 className="text-white">Title</h3>
  </div>
  <div className="p-6">Content</div>
</Card>
```

---

## 🚨 Common Pitfalls & Solutions

### **1. FormTextarea doesn't support icons**
```typescript
// ❌ Don't do this
<FormTextarea name="address" label="Address" icon={<HiLocationMarker />} />

// ✅ Do this
<FormTextarea name="address" label="Address" />
```

### **2. Always sanitize user inputs**
```typescript
// ✅ Always do this before API call
import { sanitizeText } from '@/utils/sanitize'

const sanitizedValues = {
  name: sanitizeText(values.name),
  email: sanitizeText(values.email),
}
```

### **3. Use import.meta.env in Vite, not process.env**
```typescript
// ❌ Don't do this
if (process.env.NODE_ENV === "development")

// ✅ Do this
if (import.meta.env.DEV)
```

### **4. Remember to add dependency arrays to useCallback**
```typescript
const myFunction = useCallback(() => {
  // function code
}, [dependency1, dependency2]) // ✅ Don't forget this!
```

---

## 📚 File Locations

### **Components:**
- `src/components/FormComponents.tsx`
- `src/components/FormHelpers.tsx`

### **Validation:**
- `src/utils/validationSchemas.ts`

### **Security:**
- `src/utils/sanitize.ts`

### **Modern Pages:**
- `src/pages/Orders/NewOrderPageModern.tsx`
- `src/pages/Profile/ProfilePageModern.tsx`
- `src/pages/Staff/FranchiseAddStaffPageModern.tsx`
- `src/pages/AgencyManagement/AddAgencyModalModern.tsx`

### **Documentation:**
- `MODERN_FORMS_IMPLEMENTATION.md` - Full guide
- `PHASE_1-3_COMPLETION_SUMMARY.md` - What was completed
- `BEFORE_AFTER_VISUAL_COMPARISON.md` - Visual comparison
- `QUICK_START_GUIDE.md` - This file

---

## ✅ Checklist for New Form

- [ ] Import Formik components
- [ ] Import Form components
- [ ] Choose validation schema
- [ ] Create initial values
- [ ] Wrap in Formik
- [ ] Add FormSection for organization
- [ ] Replace old inputs with FormInput/FormSelect
- [ ] Add icons for visual cues
- [ ] Add helper text for guidance
- [ ] Use SaveButton with loading
- [ ] Add input sanitization
- [ ] Handle errors with toast
- [ ] Test validation rules
- [ ] Test responsive design
- [ ] Test dark mode
- [ ] Test keyboard navigation

---

## 🎉 You're Ready!

Everything you need is ready to use. Just copy the templates above and customize for your needs!

**Questions? Check:** `MODERN_FORMS_IMPLEMENTATION.md` for detailed examples.

---

**Last Updated:** February 1, 2026  
**Version:** 1.0  
**Status:** ✅ Production Ready
