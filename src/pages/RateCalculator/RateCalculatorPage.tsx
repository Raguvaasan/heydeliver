import { FC, useState, useEffect, useRef } from "react"
import { Button, Card, Label, Select, TextInput, Radio, Spinner, Alert } from "flowbite-react"
import { HiInformationCircle, HiCalculator } from "react-icons/hi"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { usePincodeStore } from "../../store/pincodeStore"
import { calculateRate, RateMarkupConfig, RateCalculationResult } from "../../common/rateCalculator"
import toast from "react-hot-toast"

// ─── API endpoints ────────────────────────────────────────────────────────────
const RATE_API = "/delhivery-api/api/kinko/v1/invoice/charges/.json"
const MARKUP_API = "/api/settings/rate-card-markup"

// ─── Markup config (fetched once, cached at module level) ─────────────────────
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
        markupType: d?.markup_type === "flat" ? "flat" : "percentage",
        markupValue: Math.max(0, Number(d?.markup_value ?? 0)),
        isActive: Boolean(d?.is_active),
      }
      return markupCache
    })
    .catch(() => markupCache)   // silently fall back to default (63%)
  return markupPromise
}

// ─── BFS key search ───────────────────────────────────────────────────────────
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
  return undefined
}

// Rate calculation is handled by shared logic in src/common/rateCalculator.ts

// ─── Component ────────────────────────────────────────────────────────────────
const RateCalculatorPage: FC = () => {
  const [selectedTab, setSelectedTab] = useState<"domestic" | "international">("domestic")
  const [pickupPincode, setPickupPincode] = useState("110042")
  const [deliveryPincode, setDeliveryPincode] = useState("110053")
  const [packageType, setPackageType] = useState("plastic")
  const [packageWeight, setPackageWeight] = useState("500")
  const [length, setLength] = useState("10")
  const [breadth, setBreadth] = useState("10")
  const [height, setHeight] = useState("10")
  const [paymentMode, setPaymentMode] = useState<"Pre-paid" | "COD">("Pre-paid")
  const [shippingType, setShippingType] = useState<"forward" | "rto" | "reverse">("forward")
  const [deliveryMode, setDeliveryMode] = useState<"E" | "S">("E")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rateDetails, setRateDetails] = useState<RateCalculationResult | null>(null)

  const {
    pickupPincodeData, deliveryPincodeData,
    pickupLoading, deliveryLoading,
    fetchPickupPincode, fetchDeliveryPincode,
  } = usePincodeStore()

  // ── Load markup config once on mount ─────────────────────────────────────
  useEffect(() => { loadMarkupConfig() }, [])

  // ── Debounced pincode lookup ──────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => { if (pickupPincode.length === 6) fetchPickupPincode(pickupPincode) }, 500)
    return () => clearTimeout(t)
  }, [pickupPincode])

  useEffect(() => {
    const t = setTimeout(() => { if (deliveryPincode.length === 6) fetchDeliveryPincode(deliveryPincode) }, 500)
    return () => clearTimeout(t)
  }, [deliveryPincode])

  // ── Weight helpers ────────────────────────────────────────────────────────
  const supportsDimensions = packageType === "box" || packageType === "plastic"

  const volumetricGrams = (): number => {
    const l = parseFloat(length) || 0
    const b = parseFloat(breadth) || 0
    const h = parseFloat(height) || 0
    return Math.ceil((l * b * h) / 5000 * 1000)
  }

  const chargeableGrams = (): number => {
    const actual = Math.round(parseFloat(packageWeight) || 0)
    return supportsDimensions ? Math.max(actual, volumetricGrams()) : actual
  }

  // Derive kg display FROM volumetricGrams() so kg and gm are always consistent
  const volKgDisplay = (): string => (volumetricGrams() / 1000).toFixed(3)

  // ── Auto-recalc when mode/payment toggles ────────────────────────────────
  const autoCalcDeps = [shippingType, deliveryMode, paymentMode]
  const prevDepsRef = useRef(autoCalcDeps)

  useEffect(() => {
    const changed = autoCalcDeps.some((v, i) => v !== prevDepsRef.current[i])
    prevDepsRef.current = autoCalcDeps
    if (changed && pickupPincode.length === 6 && deliveryPincode.length === 6 && parseFloat(packageWeight) > 0) {
      callRateAPI()
    }
  }, autoCalcDeps)

  // ── Core API call ─────────────────────────────────────────────────────────
  const callRateAPI = async () => {
    if (pickupPincode.length !== 6) { toast.error("Enter a valid 6-digit pickup pincode"); return }
    if (deliveryPincode.length !== 6) { toast.error("Enter a valid 6-digit delivery pincode"); return }
    if (!(parseFloat(packageWeight) > 0)) { toast.error("Enter a valid package weight"); return }

    const cgm = chargeableGrams()
    const statusMap: Record<string, string> = { forward: "Delivered", rto: "RTO", reverse: "DTO" }

    const params = new URLSearchParams({
      md: deliveryMode,
      ss: statusMap[shippingType] || "Delivered",
      o_pin: pickupPincode,
      d_pin: deliveryPincode,
      cgm: String(cgm),
      pt: paymentMode,
    })

    setLoading(true)
    setError(null)

    try {
      // Force refresh markup config every time we calculate to reflect changes immediately
      await loadMarkupConfig(true)

      const res = await fetch(`${RATE_API}?${params}`)
      if (!res.ok) throw new Error(`API responded with ${res.status}`)
      const data = await res.json()

      // Parse raw fields from API response
      const totalAmount = Number(deepGet(data, ["total_amount"]) ?? 0)
      const dph = Number(deepGet(data, ["charge_dph"]) ?? 0)
      const zone = String(deepGet(data, ["zone", "zone_code"]) ?? "N/A")
      const cw = Number(deepGet(data, ["charged_weight", "chargeable_weight", "billed_weight"]) ?? cgm)

      // Apply markup and backward calculation
      const markupConfig: RateMarkupConfig = {
        markupType: markupCache.markupType,
        markupValue: markupCache.markupValue,
        isActive: markupCache.isActive,
      }

      setRateDetails(calculateRate({
        totalAmount,
        dph,
        zone,
        chargedWeight: cw,
        markupConfig,
      }))
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch rate"
      setError(msg)
      toast.error(msg)
      setRateDetails(null)
    } finally {
      setLoading(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4 pt-6 pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rate Calculator</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Calculate shipping rates for your packages</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT: Form ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <Card>

              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <div className="flex gap-8">
                  {(["domestic", "international"] as const).map((tab) => (
                    <button key={tab} onClick={() => setSelectedTab(tab)}
                      className={`pb-3 px-4 font-medium transition-colors capitalize ${selectedTab === tab
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                        }`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pincodes */}
              <div className="mb-6">
                <Label className="mb-2 block font-semibold text-gray-700 dark:text-gray-300">
                  Pickup and delivery pincode
                </Label>
                <div className="flex items-center gap-4">

                  {/* Pickup */}
                  <div className="flex-1">
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <div className="h-2 w-2 bg-green-500 rounded-full" />
                      </div>
                      <TextInput type="text" value={pickupPincode} maxLength={6}
                        onChange={(e) => { setPickupPincode(e.target.value); setRateDetails(null) }}
                        className="pl-8" placeholder="Pickup pincode" />
                      {pickupLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2"><Spinner size="sm" /></div>
                      )}
                      {pickupPincodeData && !pickupLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                            {pickupPincodeData.postal_code.state_code}
                          </span>
                        </div>
                      )}
                    </div>
                    {pickupPincodeData && (
                      <p className="text-xs text-gray-500 mt-1 ml-8">
                        {pickupPincodeData.postal_code.district || pickupPincodeData.postal_code.city}
                      </p>
                    )}
                    {pickupPincode.length === 6 && !pickupLoading && !pickupPincodeData && (
                      <p className="text-xs text-red-500 mt-1 ml-8">Invalid pincode</p>
                    )}
                  </div>

                  <div className="flex-shrink-0"><div className="w-8 h-px bg-gray-400" /></div>

                  {/* Delivery */}
                  <div className="flex-1">
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <div className="h-2 w-2 bg-red-500 rounded-full" />
                      </div>
                      <TextInput type="text" value={deliveryPincode} maxLength={6}
                        onChange={(e) => { setDeliveryPincode(e.target.value); setRateDetails(null) }}
                        className="pl-8" placeholder="Delivery pincode" />
                      {deliveryLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2"><Spinner size="sm" /></div>
                      )}
                      {deliveryPincodeData && !deliveryLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                            {deliveryPincodeData.postal_code.state_code}
                          </span>
                        </div>
                      )}
                    </div>
                    {deliveryPincodeData && (
                      <p className="text-xs text-gray-500 mt-1 ml-8">
                        {deliveryPincodeData.postal_code.district || deliveryPincodeData.postal_code.city}
                      </p>
                    )}
                    {deliveryPincode.length === 6 && !deliveryLoading && !deliveryPincodeData && (
                      <p className="text-xs text-red-500 mt-1 ml-8">Invalid pincode</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Package Type + Weight */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="packageType" className="mb-2 block font-semibold text-gray-700 dark:text-gray-300">
                    Package Type
                  </Label>
                  <Select id="packageType" value={packageType}
                    onChange={(e) => { setPackageType(e.target.value); setRateDetails(null) }}>
                    <option value="plastic">Plastic cover / Flyer</option>
                    <option value="box">Box</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="packageWeight" className="mb-2 block font-semibold text-gray-700 dark:text-gray-300">
                    Package Weight
                  </Label>
                  <div className="relative">
                    <TextInput id="packageWeight" type="number" min="1"
                      value={packageWeight}
                      onChange={(e) => { setPackageWeight(e.target.value); setRateDetails(null) }} />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span className="text-sm text-gray-500">gm</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Item weight + packaging weight</p>
                </div>
              </div>

              {/* Dimensions */}
              <div className="mb-6">
                <Label className="mb-2 block font-semibold text-gray-700 dark:text-gray-300">
                  Package Dimensions
                  {!supportsDimensions && (
                    <span className="ml-2 text-xs font-normal text-gray-400">
                      (not applicable for {packageType})
                    </span>
                  )}
                </Label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Length", val: length, set: setLength },
                    { label: "Breadth", val: breadth, set: setBreadth },
                    { label: "Height", val: height, set: setHeight },
                  ].map(({ label, val, set }) => (
                    <div key={label} className="relative">
                      <TextInput type="number" min="1" value={val}
                        disabled={!supportsDimensions}
                        className={!supportsDimensions ? "opacity-40" : ""}
                        onChange={(e) => { set(e.target.value); setRateDetails(null) }} />
                      <div className="absolute right-3 top-5 -translate-y-1/2">
                        <span className="text-sm text-gray-500">cm</span>
                      </div>
                      <span className="text-sm text-gray-600 mt-1 block">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Volumetric info */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <HiInformationCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Volumetric weight</h4>
                    <p>
                      {length} × {breadth} × {height} ÷ 5000 × 1000 = <strong>{volumetricGrams()} gm</strong>
                      &nbsp;({volKgDisplay()} kg) — rounded up (ceil)
                    </p>
                    {supportsDimensions ? (
                      <p className="text-blue-700 dark:text-blue-300 font-medium">
                        Chargeable = max(actual {packageWeight} gm, volumetric {volumetricGrams()} gm)
                        = <strong>{chargeableGrams()} gm</strong>
                      </p>
                    ) : (
                      <p className="text-gray-500">
                        Dimensions ignored for {packageType} — chargeable = actual weight ({packageWeight} gm)
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Mode */}
              {/* <div className="mb-6">
                <Label className="mb-3 block font-semibold text-gray-700 dark:text-gray-300">Payment Mode</Label>
                <div className="flex gap-6">
                  {(["Pre-paid", "COD"] as const).map((mode) => (
                    <div key={mode} className="flex items-center gap-2">
                      <Radio id={mode} name="paymentMode" value={mode}
                        checked={paymentMode === mode}
                        onChange={() => setPaymentMode(mode)} />
                      <Label htmlFor={mode} className="cursor-pointer">
                        {mode === "Pre-paid" ? "Prepaid" : "Cash on Delivery (COD)"}
                      </Label>
                    </div>
                  ))}
                </div>
              </div> */}

              {/* Calculate button */}
              <Button color="dark" size="lg" className="w-full" onClick={callRateAPI} disabled={loading}>
                {loading
                  ? <><Spinner size="sm" className="mr-2" /> Calculating…</>
                  : <><HiCalculator className="mr-2 h-5 w-5" /> Calculate Rate</>}
              </Button>
            </Card>
          </div>

          {/* ── RIGHT: Result ──────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <Card>

              {/* Shipping type */}
              <div className="flex gap-2 mb-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button onClick={() => setShippingType("forward")}
                  className="flex-1 py-2 px-4 rounded-md text-sm font-medium bg-white dark:bg-gray-700 text-blue-600 shadow-sm">
                  Forward
                </button>
              </div>

              {/* Express / Surface */}
              <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                {(["E", "S"] as const).map((m) => (
                  <button key={m} onClick={() => setDeliveryMode(m)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${deliveryMode === m
                      ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                      }`}>
                    {m === "E" ? "Express" : "Surface"}
                  </button>
                ))}
              </div>

              {/* Error */}
              {error && (
                <Alert color="failure" className="mb-4">
                  <span className="font-medium">Error! </span>{error}
                </Alert>
              )}

              {/* Loading */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-500 dark:text-gray-400">
                  <Spinner size="xl" />
                  <p className="text-sm">Fetching rate…</p>
                </div>
              )}

              {/* Rate card */}
              {!loading && rateDetails && (
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {deliveryMode === "E" ? "Express" : "Surface"} — Forward
                    </h3>
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                      <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                  </div>

                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    ₹{rateDetails.total}
                  </div>

                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
                    <div className="flex justify-between">
                      <span>Shipping Cost</span>
                      <span className="font-medium">₹{rateDetails.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (18%)</span>
                      <span className="font-medium">₹{rateDetails.gst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>DPH (Diesel)</span>
                      <span className="font-medium">₹{rateDetails.dph.toFixed(2)}</span>
                    </div>
                    <div className="border-t-2 border-blue-400 dark:border-blue-600 pt-2 mt-2 flex justify-between font-bold text-lg">
                      <span>Customer Price (Final)</span>
                      <span className="text-blue-600">₹{rateDetails.total}</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex items-center gap-1">
                      <HiInformationCircle className="h-3 w-3" />
                      <span>Zone: {rateDetails.zone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <HiInformationCircle className="h-3 w-3" />
                      <span>Chargeable Weight: {rateDetails.chargedWeight} gm</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <HiInformationCircle className="h-3 w-3" />
                      <span>
                        Rate Card markup and Rate Calculator markup are separate settings.
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <HiInformationCircle className="h-3 w-3" />
                      <span>Shipping Cost includes your configured markup.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!loading && !rateDetails && !error && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <HiCalculator className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Enter shipment details and click "Calculate Rate" to see pricing</p>
                </div>
              )}

            </Card>
          </div>
        </div>
      </div>
    </NavbarSidebarLayout>
  )
}

export default RateCalculatorPage
