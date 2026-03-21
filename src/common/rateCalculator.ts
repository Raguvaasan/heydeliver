// src/common/rateCalculator.ts
// Shared rate calculation logic for both Rate Calculator and New Order pages

export interface RateMarkupConfig {
  markupType: "percentage" | "flat"
  markupValue: number
  isActive: boolean
}

export interface RateCalculationInput {
  totalAmount: number
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
 * Calculates rates using the required "markup-first on API total_amount" method.
 * 1. Apply markup directly on API total_amount.
 * 2. Round final total to 0 decimals.
 * 3. Reverse split because GST (18%) is included in final total:
 *    base = finalTotal / 1.18
 *    gst = finalTotal - base
 *    shipping = base - dph
 */
export function calculateRate({
  totalAmount,
  dph,
  zone,
  chargedWeight,
  markupConfig,
}: RateCalculationInput): RateCalculationResult {
  let finalTotalRaw = totalAmount
  if (markupConfig.isActive && markupConfig.markupValue > 0) {
    finalTotalRaw =
      markupConfig.markupType === "percentage"
        ? totalAmount * (1 + markupConfig.markupValue / 100)
        : totalAmount + markupConfig.markupValue
  }

  const finalTotal = Math.round(finalTotalRaw)
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
