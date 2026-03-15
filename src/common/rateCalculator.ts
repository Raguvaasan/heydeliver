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
 * Applies markup and GST to the base shipping amount, returns all rate details.
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
  const shippingWithMarkup = grossAmount + markupAmt
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
