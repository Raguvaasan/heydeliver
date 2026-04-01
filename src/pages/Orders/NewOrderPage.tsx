import { FC, useState, useEffect, useRef } from "react"
import { Button, Card, Label, TextInput, Select } from "flowbite-react"
import { useNavigate } from "react-router-dom"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { useOrderStore } from "../../store/orderStore"
import toast from "react-hot-toast"
import { HiTrash, HiRefresh } from "react-icons/hi"


// ─── API endpoints ────────────────────────────────────────────────────────────
const RATE_API = "/delhivery-api/api/kinko/v1/invoice/charges/.json"
const MARKUP_API = "/api/settings/rate-card-markup"
const PINCODE_API = "/delhivery-api/c/api/pin-codes/json/"

// ─── State code → full name map ───────────────────────────────────────────────
const STATE_CODE_MAP: Record<string, string> = {
  AN: "Andaman and Nicobar Islands",
  AP: "Andhra Pradesh",
  AR: "Arunachal Pradesh",
  AS: "Assam",
  BR: "Bihar",
  CH: "Chandigarh",
  CG: "Chhattisgarh",
  DN: "Dadra and Nagar Haveli and Daman and Diu",
  DL: "Delhi",
  GA: "Goa",
  GJ: "Gujarat",
  HR: "Haryana",
  HP: "Himachal Pradesh",
  JK: "Jammu and Kashmir",
  JH: "Jharkhand",
  KA: "Karnataka",
  KL: "Kerala",
  LA: "Ladakh",
  LD: "Lakshadweep",
  MP: "Madhya Pradesh",
  MH: "Maharashtra",
  MN: "Manipur",
  ML: "Meghalaya",
  MZ: "Mizoram",
  NL: "Nagaland",
  OD: "Odisha",
  OR: "Odisha",
  PY: "Puducherry",
  PB: "Punjab",
  RJ: "Rajasthan",
  SK: "Sikkim",
  TN: "Tamil Nadu",
  TS: "Telangana",
  TR: "Tripura",
  UP: "Uttar Pradesh",
  UK: "Uttarakhand",
  WB: "West Bengal",
}

// ─── Pincode lookup (module-level cache — same pin never fetched twice) ────────
interface PincodeInfo { city: string; state: string; country: string }
const pincodeCache = new Map<string, PincodeInfo | null>()

async function lookupPincode(pin: string): Promise<PincodeInfo | null> {
  if (pincodeCache.has(pin)) return pincodeCache.get(pin)!
  try {
    const res = await fetch(`${PINCODE_API}?filter_codes=${pin}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const postal = data?.delivery_codes?.[0]?.postal_code
    if (!postal) { pincodeCache.set(pin, null); return null }
    const info: PincodeInfo = {
      city: postal.city || postal.district || "",
      state: STATE_CODE_MAP[postal.state_code] || postal.state_code || "",
      country: postal.country_code === "IN" ? "India" : (postal.country_code || "India"),
    }
    pincodeCache.set(pin, info)
    return info
  } catch {
    pincodeCache.set(pin, null)
    return null
  }
}

// ─── Markup config ────────────────────────────────────────────────────────────
interface MarkupConfig {
  markupType: "percentage" | "flat"
  markupValue: number
  isActive: boolean
}

let markupCache: MarkupConfig = { markupType: "percentage", markupValue: 63, isActive: true }
let markupPromise: Promise<MarkupConfig> | null = null

function loadMarkupConfig(force = false): Promise<MarkupConfig> {
  if (markupPromise && !force) return markupPromise
  const token = sessionStorage.getItem("authToken")
  markupPromise = fetch(MARKUP_API, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
    .then((r) => r.json())



    .then((payload) => {
      const d = payload?.data ?? payload
      markupCache = {
        markupType: (d?.markup_type === "flat" ? "flat" : "percentage") as "percentage" | "flat",
        markupValue: Math.max(0, Number(d?.markup_value ?? 0)),
        isActive: Boolean(d?.is_active),
      }
      return markupCache
    })
    .catch(() => markupCache)



  return markupPromise
}

import { calculateRate, RateMarkupConfig } from "../../common/rateCalculator"

function deepGet(obj: unknown, keys: string[]): number | string | undefined {
  const q: unknown[] = [obj]
  while (q.length) {
    const n = q.shift()
    if (!n || typeof n !== "object") continue
    for (const k of Object.keys(n as Record<string, unknown>)) {
      if (keys.includes(k.toLowerCase()))
        return (n as Record<string, unknown>)[k] as number | string
      q.push((n as Record<string, unknown>)[k])
    }
  }

}

// ─── Types ────────────────────────────────────────────────────────────────────
interface BoxDetails {
  id: number
  packageType: string
  length: string
  breadth: string
  height: string
  weight: string
}

interface RateResult {
  total: number
  shipping: number
  gst: number
  dph: number
  zone: string
  chargedWeight: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generateOrderId = () => {
  const ts = Date.now().toString().slice(-8)
  const rnd = Math.floor(Math.random() * 1000).toString().padStart(3, "0")
  return `ORD${ts}${rnd}`
}

const volGrams = (l: number, b: number, h: number): number =>
  Math.ceil((l * b * h) / 5000 * 1000)

const volKgDisplay = (l: number, b: number, h: number): string =>
  (volGrams(l, b, h) / 1000).toFixed(3)

const boxChargeableGrams = (box: BoxDetails): number => {
  const actual = Math.round(parseFloat(box.weight) || 0)
  const pType = box.packageType.toLowerCase()
  const supportsDimensions = pType === "box" || pType === "envelope" // "envelope" is the value for Plastic/Flyer

  if (!supportsDimensions) return actual
  const l = parseFloat(box.length) || 0
  const b = parseFloat(box.breadth) || 0
  const h = parseFloat(box.height) || 0
  return Math.max(actual, volGrams(l, b, h))
}

const totalChargeableGrams = (boxes: BoxDetails[]): number =>
  boxes.reduce((sum, box) => sum + boxChargeableGrams(box), 0)

// ─── Spinner icon (inline so no extra dep) ────────────────────────────────────
const Spinner = () => (
  <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
)

// ─── Component ────────────────────────────────────────────────────────────────
const NewOrderPage: FC = () => {
  const navigate = useNavigate()
  const { createDelhiveryShipment, createHubOrder, loading } = useOrderStore()

  const loginType = sessionStorage.getItem("loginType")
  const profileDataStr = sessionStorage.getItem("profileData")
  const profileData = profileDataStr ? JSON.parse(profileDataStr) : null
  const isHubLogin = loginType === "hub"
  const channelDisplayName = isHubLogin
    ? (profileData?.hubId?.hubName || profileData.hubName || "offline")
    : (profileData?.agencyName || "Offline")
  // ── Form state ──────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    deliveryAddress: "",
    deliveryCity: "",
    deliveryState: "",
    deliveryPincode: "",
    deliveryCountry: "India",
    orderId: generateOrderId(),
    channelName: "",
    paymentMode: "Prepaid",
    codAmount: "",
    totalAmount: "",
    sellerName: "",
    sellerAddress: "",
    sellerInvoice: "",
    fromName: "",
    fromAdd: "",
    fromPin: "",
    fromCity: "",
    fromState: "",
    fromCountry: "India",
    fromPhone: "",
    returnCountry: "India",
    productsDesc: "",
    hsnCode: "",
    quantity: "",
    shippingMode: "Surface",
    addressType: "",
    pickupLocation: "",
    weight: "",
  })

  console.log("formData",formData)

  const [boxes, setBoxes] = useState<BoxDetails[]>([
    { id: 1, packageType: "Box", length: "", breadth: "", height: "", weight: "" },
  ])

  const [showSellerDetails, setShowSellerDetails] = useState(false)
  const [showCustomerDetails, setShowCustomerDetails] = useState(false)
  const [showFromDetails, setShowFromDetails] = useState(false)

  // ── Pincode autofill loading state ──────────────────────────────────────────
  const [deliveryPinLoading, setDeliveryPinLoading] = useState(false)
  const [fromPinLoading, setFromPinLoading] = useState(false)

  // ── Rate state ──────────────────────────────────────────────────────────────
  const [expressRate, setExpressRate] = useState<RateResult | null>(null)
  const [surfaceRate, setSurfaceRate] = useState<RateResult | null>(null)
  const [rateLoading, setRateLoading] = useState(false)
  const [rateError, setRateError] = useState<string | null>(null)
  const rateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { loadMarkupConfig() }, [])

  useEffect(() => {
    if (!profileDataStr) return
    const p = JSON.parse(profileDataStr)
    const name = loginType === "hub"
      ? (p?.hubId?.hubName || p?.data?.hubId?.hubName || "")
      : (p?.agencyName || p?.name || "")
    if (name) setFormData((prev) => ({ ...prev, pickupLocation: name }))
  }, [loginType, profileDataStr])

  // ── Autofill delivery address fields when deliveryPincode = 6 digits ─────────
  useEffect(() => {
    const pin = formData.deliveryPincode
    if (pin.length !== 6) return
    let cancelled = false
    setDeliveryPinLoading(true)
    lookupPincode(pin).then((info) => {
      if (cancelled) return
      setDeliveryPinLoading(false)
      if (!info) { toast.error("Pincode not serviceable or not found"); return }
      setFormData((prev) => ({
        ...prev,
        deliveryCity: info.city,
        deliveryState: info.state,
        deliveryCountry: info.country,
      }))
    })
    return () => { cancelled = true }
  }, [formData.deliveryPincode])

  // ── Autofill from address fields when fromPin = 6 digits ─────────────────────
  useEffect(() => {
    const pin = formData.fromPin
    if (pin.length !== 6) return
    let cancelled = false
    setFromPinLoading(true)
    lookupPincode(pin).then((info) => {
      if (cancelled) return
      setFromPinLoading(false)
      if (!info) { toast.error("Pincode not serviceable or not found"); return }
      setFormData((prev) => ({
        ...prev,
        fromCity: info.city,
        fromState: info.state,
        fromCountry: info.country,
      }))
    })
    return () => { cancelled = true }
  }, [formData.fromPin])

  // ── Rate fetch ───────────────────────────────────────────────────────────────
  const fetchRate = async (
    cgm: number, oPin: string, dPin: string,
    md: "E" | "S", pt: string
  ): Promise<RateResult | null> => {
    await loadMarkupConfig(true)

    const params = new URLSearchParams({
      md, ss: "Delivered",
      o_pin: oPin, d_pin: dPin,
      cgm: String(cgm),
      pt: pt === "COD" ? "COD" : "Pre-paid",
    })
    const res = await fetch(`${RATE_API}?${params}`)
    if (!res.ok) throw new Error(`API ${res.status}`)
    const data = await res.json()

    const totalAmount = Number(deepGet(data, ["total_amount"]) ?? 0)
    const dph = Number(deepGet(data, ["charge_dph"]) ?? 0)
    const zone = String(deepGet(data, ["zone", "zone_code"]) ?? "N/A")
    const cw = Number(deepGet(data, ["charged_weight", "chargeable_weight", "billed_weight"]) ?? cgm)

    const markupConfig: RateMarkupConfig = {
      markupType: (markupCache.markupType === "flat" ? "flat" : "percentage"),
      markupValue: markupCache.markupValue,
      isActive: markupCache.isActive,
    }
    return calculateRate({
      totalAmount,
      dph, zone, chargedWeight: cw, markupConfig,
    })
  }

  useEffect(() => {
    const cgm = totalChargeableGrams(boxes)
    const oPin = formData.fromPin.length === 6
      ? formData.fromPin
      : (
        profileData?.pincode ||
        profileData?.data?.pincode ||
        profileData?.hubId?.pincode ||
        profileData?.data?.hubId?.pincode ||
        ""
      )
    const dPin = formData.deliveryPincode

    setExpressRate(null)
    setSurfaceRate(null)
    setRateError(null)

    if (!cgm || oPin.length !== 6 || dPin.length !== 6) {
      setRateLoading(false)
      return
    }

    if (rateTimerRef.current) clearTimeout(rateTimerRef.current)

    rateTimerRef.current = setTimeout(async () => {
      setRateLoading(true)
      try {
        const [expr, surf] = await Promise.all([
          fetchRate(cgm, oPin, dPin, "E", formData.paymentMode),
          fetchRate(cgm, oPin, dPin, "S", formData.paymentMode),
        ])
        setExpressRate(expr)
        setSurfaceRate(surf)
      } catch (err: any) {
        setRateError(err?.message || "Failed to fetch rates")
      } finally {
        setRateLoading(false)
      }
    }, 400)

    return () => {
      if (rateTimerRef.current) clearTimeout(rateTimerRef.current)
    }
  }, [boxes, formData.deliveryPincode, formData.fromPin, formData.paymentMode])

  const displaySurfaceRate = surfaceRate?.total ?? null
  const displayExpressRate = expressRate?.total ?? null
  const selectedRate =
    formData.shippingMode === "Express" ? displayExpressRate : displaySurfaceRate

  useEffect(() => {
    if (!isHubLogin || selectedRate === null) return
    const amount = selectedRate.toString()
    setFormData((prev) => {
      if (prev.totalAmount === amount && prev.codAmount === amount) return prev
      return {
        ...prev,
        totalAmount: amount,
        codAmount: amount,
      }
    })
  }, [isHubLogin, selectedRate])

  // ── Form handlers ────────────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleChannelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setFormData((prev) => ({
      ...prev,
      channelName: value,
      sellerName: value
        ? (isHubLogin
          ? (profileData?.hubId?.hubName || profileData?.data?.hubId?.hubName || prev.sellerName)
          : (profileData?.agencyName || profileData?.data?.agencyName || prev.sellerName))
        : prev.sellerName,
      sellerAddress: value ? (profileData?.address || prev.sellerAddress) : prev.sellerAddress,
      sellerInvoice: value ? (profileData?.gstNumber || prev.sellerInvoice) : prev.sellerInvoice,
    }))
    if (value) setShowSellerDetails(true)
  }

  const handleBoxChange = (id: number, field: keyof BoxDetails, value: string) => {
    const numericFields: Array<keyof BoxDetails> = ["length", "breadth", "height", "weight"]
    if (numericFields.includes(field)) {
      if (!/^\d*$/.test(value)) return
      if (value !== "" && Number(value) <= 0) return
    }
    setBoxes((prev) => prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)))
  }

  const preventInvalidKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["-", "+", "e", "E", "."].includes(e.key)) e.preventDefault()


  }

  const addBox = () => {
    const newId = boxes.length ? Math.max(...boxes.map((b) => b.id)) + 1 : 1
    setBoxes([...boxes, { id: newId, packageType: "", length: "", breadth: "", height: "", weight: "" }])

  }

  const removeBox = (id: number) => {
    if (boxes.length > 1) setBoxes(boxes.filter((b) => b.id !== id))
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customerName || !formData.customerPhone) {
      toast.error("Customer name and phone are required"); return
    }
    if (!formData.deliveryAddress || !formData.deliveryPincode) {
      toast.error("Delivery address and pincode are required"); return
    }
    if (formData.customerPhone.length !== 10) {
      toast.error("Phone number must be 10 digits"); return
    }
    if (formData.deliveryPincode.length !== 6) {
      toast.error("Pincode must be 6 digits"); return
    }
    if (!boxes[0]?.weight) {
      toast.error("Please add at least one box with weight"); return
    }
    if (!isHubLogin && !formData.pickupLocation) {
      toast.error("Please enter pickup location/warehouse name"); return
    }

    try {
      const totalWeight = boxes.reduce((s, b) => s + (parseFloat(b.weight) || 0), 0)

      const firstBox = boxes[0]
      const payableAmount = selectedRate?.toString() || formData.totalAmount || formData.codAmount

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
        return_pin: profileData?.pincode || "",
        return_city: profileData?.city || "",
        return_phone: profileData?.phone || "",
        return_add: profileData?.address || "",
        return_state: profileData?.state || "",
        return_country: formData.returnCountry || "",
        products_desc: formData.productsDesc || "",
        hsn_code: formData.hsnCode || "",
        cod_amount: formData.paymentMode === "COD" ? formData.codAmount : "",
        order_date: new Date().toISOString(),
        total_amount: payableAmount,
        seller_add: profileData?.address || "",
        seller_name: profileData?.agencyOwner || "",
        seller_inv: formData.sellerInvoice || "",
        quantity: formData.quantity || "",
        waybill: "",
        shipment_width: firstBox?.breadth || "100",
        shipment_height: firstBox?.height || "100",
        shipment_length: firstBox?.length || "100",
        weight: totalWeight.toString(),
        shipping_mode: formData.shippingMode,
        address_type: formData.addressType || "",
      }

      if (isHubLogin) {
        const hubPayload = {
          orderType: "hub",
          name: formData.customerName,
          add: formData.deliveryAddress,
          pin: formData.deliveryPincode,
          city: formData.deliveryCity,
          state: formData.deliveryState,
          phone: formData.customerPhone,
          order: formData.orderId,
          paymentMode: formData.paymentMode === "COD" ? "COD" : "Prepaid",
          codAmount: payableAmount,
          totalAmount: payableAmount,
          weight: formData.weight || cgmDisplay.toString() || totalWeight.toString(),
          productsDesc: formData.productsDesc || "",
          quantity: formData.quantity || "",
          pickupLocation: {
            name: formData.channelName || channelDisplayName || "Offline",
          },
          fromName: formData.fromName || profileData?.agencyOwner || profileData?.data?.agencyOwner || "",
          fromAdd: formData.fromAdd || profileData?.address || profileData?.data?.address || "",
          fromPin: formData.fromPin || profileData?.pincode || profileData?.data?.pincode || "",
          fromCity: formData.fromCity || profileData?.city || profileData?.data?.city || "",
          fromState: formData.fromState || profileData?.state || profileData?.data?.state || "",
          fromPhone: formData.fromPhone || profileData?.phone || profileData?.data?.phone || "",
          shipmentWidth: firstBox?.breadth || "100",
          shipmentHeight: firstBox?.height || "100",
          shipmentLength: firstBox?.length || "100",
          shippingMode: formData.shippingMode,
          addressType: formData.addressType || "",
        }

        await createHubOrder(hubPayload)
      } else {
        await createDelhiveryShipment(shipmentData, formData.pickupLocation, {
          fromName: formData.fromName,
          fromAdd: formData.fromAdd,
          fromPin: formData.fromPin,
          fromCity: formData.fromCity,
          fromState: formData.fromState,
          fromCountry: formData.fromCountry,
          fromPhone: formData.fromPhone,
        })
      }

      setTimeout(() => navigate("/orders"), 1500)
    } catch {
      // errors handled by orderStore
    }
  }

  const cgmDisplay = totalChargeableGrams(boxes)

  useEffect(() => {
    if (!isHubLogin) return
    const chargeableWeight = cgmDisplay ? cgmDisplay.toString() : ""
    setFormData((prev) => {
      if (prev.weight === chargeableWeight) return prev
      return { ...prev, weight: chargeableWeight }
    })
  }, [isHubLogin, cgmDisplay])

  // ── Autofilled field component ────────────────────────────────────────────────
  // Green tint + "✓ auto-filled" badge when value came from pincode lookup
  const AutofilledInput = ({
    id, label, isLoading, value, onChange,
  }: {
    id: string
    label: string
    isLoading: boolean
    value: string
    onChange: React.ChangeEventHandler<HTMLInputElement>
  }) => (
    <div>
      <Label htmlFor={id} className="flex items-center gap-1.5">
        {label}
        {isLoading && (
          <span className="inline-flex items-center gap-1 text-xs font-normal text-orange-500 animate-pulse">
            <Spinner /> filling…
          </span>
        )}
        {!isLoading && value && (
          <span className="text-xs font-normal text-green-600 dark:text-green-400">✓ auto-filled</span>
        )}
      </Label>
      <TextInput
        id={id} name={id} type="text"
        value={value} onChange={onChange}
        placeholder="Auto-filled from pincode"
        className={!isLoading && value ? "border-green-400 bg-green-50 dark:bg-green-900/20" : ""}
      />
    </div>
  )

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4 pt-6 pb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <Button onClick={() => navigate("/orders")} color="gray">Back</Button>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">New Order</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">

            {/* ── Order Details ─────────────────────────────────────────────── */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-orange-500">📋</span> Order Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="channelName">
                    Select Channel Name <span className="text-gray-400">ⓘ</span>
                  </Label>
                  <Select id="channelName" name="channelName" value={formData.channelName}
                    onChange={handleChannelChange} required>
                    <option value="">Select Channel Name</option>
                    <option value={channelDisplayName}>{channelDisplayName}</option>
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
                    <TextInput id="orderId" name="orderId" type="text"
                      placeholder="Auto-generated Order ID"
                      value={formData.orderId} onChange={handleChange}
                      required className="flex-1" />
                    <Button type="button" color="gray"
                      onClick={() => setFormData({ ...formData, orderId: generateOrderId() })}
                      title="Generate new Order ID">
                      <HiRefresh className="h-5 w-5" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-generated unique order ID. Click refresh to generate a new one.
                  </p>
                </div>





















              </div>
            </Card>

            {/* ── Delivery Details ──────────────────────────────────────────── */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-orange-500">📍</span> Delivery Details
              </h3>
              <div className="space-y-4">

                {/* Seller (hidden for hub login) */}
                {!isHubLogin && (
                  <>
                    <Button type="button" color="gray" size="sm"
                      className="w-full border-orange-500 text-orange-500"
                      onClick={() => setShowSellerDetails(!showSellerDetails)}>
                      📝 {showSellerDetails ? "Hide" : "Add"} Seller Details
                    </Button>
                    {showSellerDetails && (
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { id: "sellerName",    label: "Seller Name",       ph: "Enter seller name" },
                          { id: "sellerAddress", label: "Seller Address",    ph: "Enter seller address" },
                          { id: "sellerInvoice", label: "Seller GST Number", ph: "Enter GST number" },
                        ].map(({ id, label, ph }) => (
                          <div key={id}>
                            <Label htmlFor={id}>{label}</Label>
                            <TextInput id={id} name={id}
                              value={(formData as any)[id]} onChange={handleChange} placeholder={ph} />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* ── Customer Details ──────────────────────────────────────── */}
                <Button type="button" color="gray" size="sm"
                  className="w-full border-orange-500 text-orange-500"
                  onClick={() => setShowCustomerDetails(!showCustomerDetails)}>
                  👤 {showCustomerDetails ? "Hide" : "Add"} Customer Details
                </Button>


                {showCustomerDetails && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* Manual fields */}
                    {[
                      { id: "customerName",    label: "Customer Name *",        ph: "Enter customer name",             type: "text" },
                      { id: "customerPhone",   label: "Customer Phone *",        ph: "10 digit mobile number",          type: "tel",  max: 10 },
                      { id: "deliveryAddress", label: "Delivery Address *",      ph: "Enter complete delivery address", type: "text" },
                    ].map(({ id, label, ph, type, max }) => (
                      <div key={id}>
                        <Label htmlFor={id}>{label}</Label>
                        <TextInput id={id} name={id} type={type}
                          value={(formData as any)[id]} onChange={handleChange}
                          placeholder={ph} maxLength={max} />
                      </div>
                    ))}

                    {/* Pincode — triggers autofill */}
                    <div>
                      <Label htmlFor="deliveryPincode" className="flex items-center gap-1.5">
                        Pincode *
                        {deliveryPinLoading && (
                          <span className="inline-flex items-center gap-1 text-xs font-normal text-orange-500 animate-pulse">
                            <Spinner /> looking up…
                          </span>
                        )}
                      </Label>
                      <TextInput id="deliveryPincode" name="deliveryPincode" type="text"
                        value={formData.deliveryPincode} onChange={handleChange}
                        placeholder="6 digit pincode" maxLength={6} />
                    </div>

                    {/* Autofilled fields */}
                    <AutofilledInput id="deliveryCity"    label="City"    isLoading={deliveryPinLoading} value={formData.deliveryCity}    onChange={handleChange} />
                    <AutofilledInput id="deliveryState"   label="State"   isLoading={deliveryPinLoading} value={formData.deliveryState}   onChange={handleChange} />

                  </div>
                )}

                {/* ── From Address ──────────────────────────────────────────── */}
                <Button type="button" color="gray" size="sm"
                  className="w-full border-orange-500 text-orange-500"
                  onClick={() => setShowFromDetails(!showFromDetails)}>
                  🏬 {showFromDetails ? "Hide" : "Add"} From Address Details
                </Button>
                {showFromDetails && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    {/* Manual fields */}
                    {[
                      { id: "fromName",  label: "From Name",  ph: "Enter sender/store name", type: "text" },
                      { id: "fromPhone", label: "From Phone", ph: "10 digit mobile number",  type: "tel", max: 10 },
                    ].map(({ id, label, ph, type, max }) => (
                      <div key={id}>
                        <Label htmlFor={id}>{label}</Label>
                        <TextInput id={id} name={id} type={type}
                          value={(formData as any)[id]} onChange={handleChange}
                          placeholder={ph} maxLength={max} />

































                      </div>
                    ))}

                    {/* From Pincode — triggers autofill */}
                    <div>
                      <Label htmlFor="fromPin" className="flex items-center gap-1.5">
                        From Pincode
                        {fromPinLoading && (
                          <span className="inline-flex items-center gap-1 text-xs font-normal text-orange-500 animate-pulse">
                            <Spinner /> looking up…
                          </span>
                        )}
                      </Label>
                      <TextInput id="fromPin" name="fromPin" type="text"
                        value={formData.fromPin} onChange={handleChange}
                        placeholder="6 digit pincode" maxLength={6} />
                    </div>

                    {/* From Address — full width */}
                    <div className="lg:col-span-3">
                      <Label htmlFor="fromAdd">From Address</Label>
                      <TextInput id="fromAdd" name="fromAdd" type="text"
                        value={formData.fromAdd} onChange={handleChange}
                        placeholder="Enter complete from address" />
                    </div>

                    {/* Autofilled fields */}
                    <AutofilledInput id="fromCity"    label="From City"    isLoading={fromPinLoading} value={formData.fromCity}    onChange={handleChange} />
                    <AutofilledInput id="fromState"   label="From State"   isLoading={fromPinLoading} value={formData.fromState}   onChange={handleChange} />

                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* ── Box Details ──────────────────────────────────────────────────── */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="text-orange-500">📦</span> Box Details
              </h3>
              <Button type="button" size="sm" onClick={addBox}
                className="bg-orange-500 hover:bg-orange-600">
                + Add Box
              </Button>
            </div>

            <div className="space-y-6">
              {boxes.map((box, index) => (
                <div key={box.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">BOX {index + 1}</h4>
                    {boxes.length > 1 && (
                      <button type="button" onClick={() => removeBox(box.id)}
                        className="text-red-500 hover:text-red-700">
                        <HiTrash className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Package Type</Label>
                      <Select value={box.packageType}
                        onChange={(e) => handleBoxChange(box.id, "packageType", e.target.value)}
                        required>
                        <option value="">Select Package</option>
                        <option value="Box">Box</option>
                        <option value="Envelope">Plastic cover / Flyer</option>
                      </Select>
                    </div>

                    <div>
                      <Label>
                        Dimensions (cm)
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["length", "breadth", "height"] as const).map((dim, i) => (
                          <TextInput key={dim} type="number"
                            placeholder={["L", "B", "H"][i]}
                            value={(box as any)[dim]}
                            onChange={(e) => handleBoxChange(box.id, dim, e.target.value)}
                            onKeyDown={preventInvalidKeys} min={1} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Length × Breadth × Height (min 15 cm each)</p>
                    </div>

                    <div>
                      <Label>Package Weight</Label>
                      <div className="flex gap-2 items-center">
                        <TextInput type="number" placeholder="Enter package weight"
                          value={box.weight}
                          onChange={(e) => handleBoxChange(box.id, "weight", e.target.value)}
                          onKeyDown={preventInvalidKeys} min={1} required className="flex-1" />
                        <span className="text-gray-500">gm</span>
                      </div>
                      {(box.packageType === "Box" || box.packageType === "Envelope") &&
                        box.length && box.breadth && box.height && box.weight && (
                          <p className="text-xs text-blue-600 mt-1">
                            {box.length} × {box.breadth} × {box.height} ÷ 5000 × 1000
                            = <strong>{volGrams(+box.length, +box.breadth, +box.height)} gm</strong>
                            &nbsp;({volKgDisplay(+box.length, +box.breadth, +box.height)} kg) — ceil
                            &nbsp;|&nbsp; Chargeable: <strong>{boxChargeableGrams(box)} gm</strong>
                          </p>
                        )}
                      <p className="text-xs text-gray-500 mt-1">Minimum 50 grams</p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  ⓘ The estimated cost may vary from the final shipping cost based on actual
                  dimensions &amp; weight measured before delivery.
                </p>
                <div>
                  <Label>Total Chargeable Weight <span>ⓘ</span></Label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {cgmDisplay ? `${cgmDisplay} gm` : "— gm"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    = sum of max(actual, volumetric) across all boxes
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* ── Shipping Mode ─────────────────────────────────────────────────── */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Choose shipping mode *
            </h3>

            {rateError && <p className="text-sm text-red-500 mb-3">{rateError}</p>}

            <div className="grid grid-cols-2 gap-4">
              <button type="button"
                onClick={() => setFormData({ ...formData, shippingMode: "Surface" })}
                className={`p-6 rounded-lg border-2 text-left transition-colors ${formData.shippingMode === "Surface"
                  ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                }`}>
                <div className="text-4xl mb-2">🚚</div>
                <h4 className="font-semibold text-gray-900 dark:text-white">SURFACE</h4>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  {rateLoading
                    ? <span className="text-sm font-normal text-gray-500">Calculating…</span>
                    : displaySurfaceRate !== null
                      ? `₹${displaySurfaceRate}`
                      : <span className="text-sm font-normal text-gray-400">—</span>}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Standard delivery (5–7 days)</p>
              </button>

              <button type="button"
                onClick={() => setFormData({ ...formData, shippingMode: "Express" })}
                className={`p-6 rounded-lg border-2 text-left transition-colors ${formData.shippingMode === "Express"
                  ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                }`}>
                <div className="text-4xl mb-2">✈️</div>
                <h4 className="font-semibold text-gray-900 dark:text-white">EXPRESS</h4>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  {rateLoading
                    ? <span className="text-sm font-normal text-gray-500">Calculating…</span>
                    : displayExpressRate !== null
                      ? `₹${displayExpressRate}`
                      : <span className="text-sm font-normal text-gray-400">—</span>}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Fast delivery (2–3 days)</p>
              </button>
            </div>

            {!rateLoading && (formData.shippingMode === "Express" ? expressRate : surfaceRate) && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400 flex gap-6 flex-wrap">
                {(() => {
                  const r = formData.shippingMode === "Express" ? expressRate : surfaceRate
                  return <>
                    <span>Shipping: ₹{r!.shipping.toFixed(2)}</span>
                    <span>GST (18%): ₹{r!.gst.toFixed(2)}</span>
                    <span>DPH: ₹{r!.dph.toFixed(2)}</span>
                    <span>Zone: {r!.zone}</span>
                    <span>Chargeable: {r!.chargedWeight} gm</span>
                  </>
                })()}
              </div>
            )}
          </Card>

          {/* ── Actions ───────────────────────────────────────────────────────── */}
          <div className="flex justify-end gap-4">
            <Button type="button" color="gray" onClick={() => navigate("/orders")} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={loading}>
              {loading ? "Creating…" : "Create Order"}
            </Button>
          </div>
        </form>
      </div>
    </NavbarSidebarLayout>
  )
}

export default NewOrderPage
