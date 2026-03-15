import { FC, useState, useEffect, useRef } from "react"
import { Button, Card, Label, TextInput, Select } from "flowbite-react"
import { useNavigate } from "react-router-dom"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { useOrderStore } from "../../store/orderStore"
import { usePincodeStore } from "../../store/pincodeStore"
import toast from "react-hot-toast"
import { HiTrash, HiRefresh } from "react-icons/hi"

// ─── API endpoints ────────────────────────────────────────────────────────────
const RATE_API = "https://admin.heydeliver.in/delhivery-api/api/kinko/v1/invoice/charges/.json"
const MARKUP_API = "https://freightrekapi.vercel.app/api/v1/settings/public/rate-card-markup"

// ─── Markup config (fetched once, cached in module scope) ─────────────────────
interface MarkupConfig {
  markupType: "percentage" | "flat"
  markupValue: number
  isActive: boolean
}

// Default fallback if API fails — 63% matches the HTML file default
let markupCache: MarkupConfig = { markupType: "percentage", markupValue: 63, isActive: true }
let markupPromise: Promise<MarkupConfig> | null = null

function loadMarkupConfig(): Promise<MarkupConfig> {
  if (markupPromise) return markupPromise
  markupPromise = fetch(MARKUP_API)
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
    .catch(() => markupCache)  // silently fall back to default
  return markupPromise
}

// Apply markup on gross_amount, recompute GST at 18%, keep DPH as-is
function applyMarkup(
  shipping: number, gstFromApi: number, dph: number,
  zone: string, chargedWeight: number
): RateResult {
  const cfg = markupCache

  // Markup is applied only on the base shipping (gross_amount)
  let markupAmt = 0
  if (cfg.isActive && cfg.markupValue > 0) {
    markupAmt = cfg.markupType === "percentage"
      ? (shipping * cfg.markupValue) / 100
      : cfg.markupValue
  }

  const shippingWithMarkup = shipping + markupAmt
  // GST is 18% of (shipping + markup) — recalculated, NOT taken from API directly
  const gst = shippingWithMarkup * 0.18
  const total = Math.round(shippingWithMarkup) + Math.round(gst) + Math.round(dph)

  return {
    shipping: Math.round(shippingWithMarkup),
    gst: Math.round(gst),
    dph: Math.round(dph),
    total,
    zone,
    chargedWeight,
  }
}

// BFS key search — finds first matching key anywhere in nested response
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

// Volumetric weight in GRAMS = ceil( L×B×H / 5000 × 1000 )
// Math.ceil because Delhivery always rounds UP for billing
const volGrams = (l: number, b: number, h: number): number =>
  Math.ceil((l * b * h) / 5000 * 1000)

// kg display derived FROM volGrams so both values are always consistent
const volKgDisplay = (l: number, b: number, h: number): string =>
  (volGrams(l, b, h) / 1000).toFixed(3)

// Chargeable grams for one box based on its package type
const boxChargeableGrams = (box: BoxDetails): number => {
  const actual = Math.round(parseFloat(box.weight) || 0)
  const isBox = box.packageType.toLowerCase() === "box"
  if (!isBox) return actual                                     // flyer/envelope/packet → actual only
  const l = parseFloat(box.length) || 0
  const b = parseFloat(box.breadth) || 0
  const h = parseFloat(box.height) || 0
  return Math.max(actual, volGrams(l, b, h))                   // box → max(actual, volumetric)
}

// Sum of chargeable grams across all boxes
const totalChargeableGrams = (boxes: BoxDetails[]): number =>
  boxes.reduce((sum, box) => sum + boxChargeableGrams(box), 0)

// ─── Component ────────────────────────────────────────────────────────────────
const NewOrderPage: FC = () => {
  const navigate = useNavigate()
  const { createDelhiveryShipment, loading } = useOrderStore()

  const loginType = sessionStorage.getItem("loginType")
  const profileDataStr = sessionStorage.getItem("profileData")
  const profileData = profileDataStr ? JSON.parse(profileDataStr) : null

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
    paymentMode: "",
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
  })

  const [boxes, setBoxes] = useState<BoxDetails[]>([
    { id: 1, packageType: "Box", length: "", breadth: "", height: "", weight: "" },
  ])

  const [showSellerDetails, setShowSellerDetails] = useState(false)
  const [showCustomerDetails, setShowCustomerDetails] = useState(false)
  const [showFromDetails, setShowFromDetails] = useState(false)

  // ── Rate state (managed here — no external rate store needed) ───────────────
  const [expressRate, setExpressRate] = useState<RateResult | null>(null)
  const [surfaceRate, setSurfaceRate] = useState<RateResult | null>(null)
  const [rateLoading, setRateLoading] = useState(false)
  const [rateError, setRateError] = useState<string | null>(null)
  const rateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Load markup config once on mount ────────────────────────────────────────
  useEffect(() => { loadMarkupConfig() }, [])

  // ── Set pickupLocation from profile for franchise login ─────────────────────
  useEffect(() => {
    if (loginType !== "franchise" || !profileDataStr) return
    const p = JSON.parse(profileDataStr)
    const name = p?.agencyName || p?.name || ""
    if (name) setFormData((prev) => ({ ...prev, pickupLocation: name }))
  }, [loginType, profileDataStr])

  // ── Direct API call for a single mode ───────────────────────────────────────
  const fetchRate = async (
    cgm: number, oPin: string, dPin: string,
    md: "E" | "S", pt: string
  ): Promise<RateResult | null> => {
    const params = new URLSearchParams({
      md, ss: "Delivered",
      o_pin: oPin, d_pin: dPin,
      cgm: String(cgm),
      pt: pt === "COD" ? "COD" : "Pre-paid",
    })
    const res = await fetch(`${RATE_API}?${params}`)
    if (!res.ok) throw new Error(`API ${res.status}`)
    const data = await res.json()

    // Parse raw API fields
    const shipping = Number(deepGet(data, ["gross_amount"]) ?? 0)
    const dph = Number(deepGet(data, ["charge_dph"]) ?? 0)
    const zone = String(deepGet(data, ["zone", "zone_code"]) ?? "N/A")
    const cw = Number(deepGet(data, ["charged_weight", "chargeable_weight", "billed_weight"]) ?? cgm)

    // GST from API (only used as fallback if shipping is 0)
    const gstApi = Number(deepGet(data, ["gst_amount", "gst", "tax_amount"]) ?? 0)

    // Apply markup on gross_amount → recompute GST at 18%
    return applyMarkup(shipping || Number(deepGet(data, ["total_amount"]) ?? 0), gstApi, dph, zone, cw)
  }

  // ── Auto-fetch both rates whenever relevant inputs change ────────────────────
  useEffect(() => {
    const cgm = totalChargeableGrams(boxes)
    const oPin = profileData?.pincode || ""
    const dPin = formData.deliveryPincode

    // Reset
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
  }, [boxes, formData.deliveryPincode, formData.paymentMode])

  // Convenient display values (already final from API — no markup re-apply)
  const displaySurfaceRate = surfaceRate?.total ?? null
  const displayExpressRate = expressRate?.total ?? null

  // Currently selected rate for order submission
  const selectedRate =
    formData.shippingMode === "Express" ? displayExpressRate : displaySurfaceRate

  // ── Form handlers ────────────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleChannelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setFormData((prev) => ({
      ...prev,
      channelName: value,
      sellerName: value ? (profileData?.agencyName || prev.sellerName) : prev.sellerName,
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
    if (!formData.pickupLocation) {
      toast.error("Please enter pickup location/warehouse name"); return
    }

    try {
      const totalWeight = boxes.reduce((s, b) => s + (parseFloat(b.weight) || 0), 0)
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
        return_pin: profileData?.pincode || "",
        return_city: profileData?.city || "",
        return_phone: profileData?.phone || "",
        return_add: profileData?.address || "",
        return_state: profileData?.state || "",
        return_country: formData.returnCountry || "",
        products_desc: formData.productsDesc || "",
        hsn_code: formData.hsnCode || "",
        cod_amount: formData.paymentMode === "COD" ? formData.codAmount : "",
        order_date: new Date().toLocaleString(),
        // Use the API-returned total for the selected mode
        total_amount: selectedRate?.toString() || formData.totalAmount || formData.codAmount,
        seller_add: profileData?.address || "",
        seller_name: profileData?.agencyOwner || "",
        seller_inv: formData.sellerInvoice || "",
        quantity: formData.quantity || "",
        waybill: "",
        shipment_width: firstBox?.breadth || "100",
        shipment_height: firstBox?.height || "100",
        weight: totalWeight.toString(),
        shipping_mode: formData.shippingMode,
        address_type: formData.addressType || "",
      }

      await createDelhiveryShipment(shipmentData, formData.pickupLocation, {
        fromName: formData.fromName,
        fromAdd: formData.fromAdd,
        fromPin: formData.fromPin,
        fromCity: formData.fromCity,
        fromState: formData.fromState,
        fromCountry: formData.fromCountry,
        fromPhone: formData.fromPhone,
      })

      setTimeout(() => navigate("/orders"), 1500)
    } catch {
      // errors handled by orderStore
    }
  }

  // ── Derived display ─────────────────────────────────────────────────────────
  const cgmDisplay = totalChargeableGrams(boxes)

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

            {/* Order Details */}
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
                    <option value="Offline">{profileData?.agencyName || "Offline"}</option>
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

            {/* Delivery Details */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-orange-500">📍</span> Delivery Details
              </h3>
              <div className="space-y-4">

                {/* Seller */}
                <Button type="button" color="gray" size="sm"
                  className="w-full border-orange-500 text-orange-500"
                  onClick={() => setShowSellerDetails(!showSellerDetails)}>
                  📝 {showSellerDetails ? "Hide" : "Add"} Seller Details
                </Button>
                {showSellerDetails && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: "sellerName", label: "Seller Name", ph: "Enter seller name" },
                      { id: "sellerAddress", label: "Seller Address", ph: "Enter seller address" },
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

                {/* Customer */}
                <Button type="button" color="gray" size="sm"
                  className="w-full border-orange-500 text-orange-500"
                  onClick={() => setShowCustomerDetails(!showCustomerDetails)}>
                  👤 {showCustomerDetails ? "Hide" : "Add"} Customer Details
                </Button>
                {showCustomerDetails && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { id: "customerName", label: "Customer Name *", ph: "Enter customer name", type: "text" },
                      { id: "customerPhone", label: "Customer Phone *", ph: "10 digit mobile number", type: "tel", max: 10 },
                      { id: "customerEmail", label: "Customer Email", ph: "Enter email address", type: "email" },
                      { id: "deliveryAddress", label: "Delivery Address *", ph: "Enter complete delivery address", type: "text" },
                      { id: "deliveryCity", label: "City", ph: "City", type: "text" },
                      { id: "deliveryState", label: "State", ph: "State", type: "text" },
                      { id: "deliveryPincode", label: "Pincode *", ph: "6 digit pincode", type: "text", max: 6 },
                      { id: "deliveryCountry", label: "Country", ph: "Country", type: "text" },
                    ].map(({ id, label, ph, type, max }) => (
                      <div key={id}>
                        <Label htmlFor={id}>{label}</Label>
                        <TextInput id={id} name={id} type={type}
                          value={(formData as any)[id]} onChange={handleChange}
                          placeholder={ph} maxLength={max} />
                      </div>
                    ))}
                  </div>
                )}

                {/* From Address */}
                <Button type="button" color="gray" size="sm"
                  className="w-full border-orange-500 text-orange-500"
                  onClick={() => setShowFromDetails(!showFromDetails)}>
                  🏬 {showFromDetails ? "Hide" : "Add"} From Address Details
                </Button>
                {showFromDetails && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { id: "fromName", label: "From Name", ph: "Enter sender/store name", type: "text" },
                      { id: "fromPhone", label: "From Phone", ph: "10 digit mobile number", type: "tel", max: 10 },
                      { id: "fromPin", label: "From Pincode", ph: "6 digit pincode", type: "text", max: 6 },
                      { id: "fromAdd", label: "From Address", ph: "Enter complete from address", type: "text", span: 3 },
                      { id: "fromCity", label: "From City", ph: "City", type: "text" },
                      { id: "fromState", label: "From State", ph: "State", type: "text" },
                      { id: "fromCountry", label: "From Country", ph: "Country", type: "text" },
                    ].map(({ id, label, ph, type, max, span }) => (
                      <div key={id} className={span ? `lg:col-span-${span}` : ""}>
                        <Label htmlFor={id}>{label}</Label>
                        <TextInput id={id} name={id} type={type}
                          value={(formData as any)[id]} onChange={handleChange}
                          placeholder={ph} maxLength={max} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Box Details */}
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
                        <option value="Envelope">Envelope</option>
                        <option value="Packet">Packet</option>
                      </Select>
                      {box.packageType && box.packageType !== "Box" && (
                        <p className="text-xs text-gray-400 mt-1">
                          Dimensions not used for {box.packageType} — chargeable = actual weight only
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>
                        Dimensions (cm)
                        {box.packageType !== "Box" && (
                          <span className="ml-1 text-gray-400 font-normal">(not applicable for {box.packageType || "this type"})</span>
                        )}
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["length", "breadth", "height"] as const).map((dim, i) => (
                          <TextInput key={dim} type="number"
                            placeholder={["L", "B", "H"][i]}
                            value={(box as any)[dim]}
                            disabled={box.packageType !== "Box"}
                            className={box.packageType !== "Box" ? "opacity-40" : ""}
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
                      {/* Per-box volumetric info when box type and all dims are filled */}
                      {box.packageType === "Box" &&
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

              {/* Summary row */}
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

          {/* Shipping Mode */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Choose shipping mode *
            </h3>

            {rateError && (
              <p className="text-sm text-red-500 mb-3">{rateError}</p>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Surface */}
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

              {/* Express */}
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

            {/* Breakdown for selected mode */}
            {!rateLoading && (formData.shippingMode === "Express" ? expressRate : surfaceRate) && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400 flex gap-6 flex-wrap">
                {(() => {
                  const r = formData.shippingMode === "Express" ? expressRate : surfaceRate
                  return <>
                    <span>Shipping: ₹{r!.shipping}</span>
                    <span>GST (18%): ₹{r!.gst}</span>
                    <span>DPH: ₹{r!.dph}</span>
                    <span>Zone: {r!.zone}</span>
                    <span>Chargeable: {r!.chargedWeight} gm</span>
                  </>
                })()}
              </div>
            )}
          </Card>

          {/* Payment Details */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-orange-500">💳</span> Payment Details *
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="paymentMode">Payment Mode</Label>
                <Select id="paymentMode" name="paymentMode"
                  value={formData.paymentMode} onChange={handleChange} required>
                  <option value="">Select Payment Mode</option>
                  <option value="Prepaid">Prepaid</option>
                  {/* <option value="COD">Cash on Delivery (COD)</option> */}
                </Select>
              </div>
              {formData.paymentMode === "COD" && (
                <div>
                  <Label htmlFor="codAmount">COD Amount (₹) *</Label>
                  <TextInput id="codAmount" name="codAmount" type="number"
                    value={formData.codAmount} onChange={handleChange}
                    placeholder="Amount to collect from customer"
                    required={formData.paymentMode === "COD"} />
                  <p className="text-xs text-gray-500 mt-1">Amount to be collected from customer</p>
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
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