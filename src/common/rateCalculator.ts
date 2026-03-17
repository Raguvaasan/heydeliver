// src/common/rateCalculator.ts
// Shared rate calculation logic for both Rate Calculator and New Order pages

export interface RateMarkupConfig {
  markupType: "percentage" | "flat"
  markupValue: number
  isActive: boolean
}

export interface RateCalculationInput {
  grossAmount: number
  dph: number
  zone: string
  chargedWeight: number
  markupConfig: RateMarkupConfig
}

export interface RateCalculationResult {
  shipping: number
  gst: number
  dph: number
  total: number
  zone: string
  chargedWeight: number
}

/**
 * Calculates rates using a backward calculation method to ensure precise splits.
 * 1. Calculate raw total with markup and 18% GST.
 * 2. Round total to nearest whole number.
 * 3. Deconstruct: Base = Total / 1.18, GST = Total - Base, Shipping = Base - Diesel.
 */
export function calculateRate({
  grossAmount,
  dph,
  zone,
  chargedWeight,
  markupConfig,
}: RateCalculationInput): RateCalculationResult {
  let markupAmt = 0
  if (markupConfig.isActive && markupConfig.markupValue > 0) {
    markupAmt =
      markupConfig.markupType === "percentage"
        ? (grossAmount * markupConfig.markupValue) / 100
        : markupConfig.markupValue
  }

  // Step 1: Calculate raw total with 18% GST
  const rawBase = grossAmount + markupAmt + dph
  const rawTotal = rawBase * 1.18
  
  // Step 2: Final selling price is rounded to 0 decimal places (as per user total 67)
  const finalTotal = Math.round(rawTotal)

  // Step 3: Backward deconstruction
  const baseAmount = Number((finalTotal / 1.18).toFixed(2))
  const gstAmount = Number((finalTotal - baseAmount).toFixed(2))
  const shippingCost = Number((baseAmount - dph).toFixed(2))

  return {
    shipping: shippingCost,
    gst: gstAmount,
    dph: dph,
    total: finalTotal,
    zone,
    chargedWeight,
  }
}
