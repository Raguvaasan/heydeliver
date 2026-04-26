import { create } from "zustand"

export interface RateCardData {
  baseFare: number[]
  additional250g: number[]
  additional500g: number[]
  additional1kg: number[]
  returnRTO: number[]
  reverseDTO: number[]
}

interface RateCardState {
  surfaceZones: string[]
  surfaceRates: RateCardData
  expressZones: string[]
  expressRates: RateCardData

  // Get rate for specific zone and weight
  calculateRateFromCard: (
    mode: "surface" | "express",
    zone: string,
    weightInGrams: number,
    shippingType: "forward" | "rto" | "reverse"
  ) => number
}

export const useRateCardStore = create<RateCardState>((set, get) => ({
  surfaceZones: [
    "ZONE A",
    "ZONE B",
    "ZONE C1",
    "ZONE C2",
    "ZONE D1",
    "ZONE D2",
    "ZONE E",
    "ZONE F",
  ],

  surfaceRates: {
    baseFare: [26.0, 30.0, 31.0, 32.0, 33.0, 34.0, 41.0, 46.0],
    additional250g: [5.0, 5.0, 8.0, 9.0, 8.0, 9.0, 10.0, 11.0],
    additional500g: [8.0, 13.0, 17.0, 22.0, 22.0, 25.0, 31.0, 35.0],
    additional1kg: [20.0, 22.0, 26.0, 29.0, 31.0, 33.0, 40.0, 47.0],
    returnRTO: [26.0, 30.0, 31.0, 32.0, 33.0, 34.0, 41.0, 46.0],
    reverseDTO: [31.0, 36.0, 37.0, 38.0, 40.0, 41.0, 49.0, 55.0],
  },

  expressZones: ["ZONE A", "ZONE B", "ZONE C", "ZONE D", "ZONE E", "ZONE F"],

  expressRates: {
    baseFare: [31.0, 36.0, 47.0, 51.0, 62.0, 69.0],
    additional250g: [7.0, 9.0, 14.0, 19.0, 20.0, 24.0],
    additional500g: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    additional1kg: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    returnRTO: [31.0, 36.0, 39.0, 41.0, 46.0, 52.0],
    reverseDTO: [50.0, 58.0, 62.0, 66.0, 74.0, 83.0],
  },

  calculateRateFromCard: (mode, zone, weightInGrams, shippingType) => {
    const state = get()
    const zones = mode === "surface" ? state.surfaceZones : state.expressZones
    const rates = mode === "surface" ? state.surfaceRates : state.expressRates

    // Normalize zone name (remove extra spaces, convert to uppercase)
    const normalizedZone = zone?.toUpperCase().trim() || ""

    // Find zone index (flexible matching)
    let zoneIndex = zones.findIndex((z) => z.toUpperCase().trim() === normalizedZone)

    // If exact match not found, try partial matching (e.g., "A" matches "ZONE A")
    if (zoneIndex === -1) {
      zoneIndex = zones.findIndex((z) =>
        z.toUpperCase().includes(normalizedZone) || normalizedZone.includes(z.toUpperCase())
      )
    }

    if (zoneIndex === -1) {
      return 0
    }

    // For RTO/Reverse, use specific rates
    if (shippingType === "rto") {
      return rates.returnRTO[zoneIndex] || 0
    }
    if (shippingType === "reverse") {
      return rates.reverseDTO[zoneIndex] || 0
    }

    // Forward shipment calculation
    let totalCharge = 0
    const weightInKg = weightInGrams / 1000
    if (weightInKg <= 0.25) {
      totalCharge = rates.baseFare[zoneIndex] || 0
    }
    // Up to 500g
    else if (weightInKg <= 0.5) {
      totalCharge = (rates.baseFare[zoneIndex] || 0) + (rates.additional250g[zoneIndex] || 0)
    }
    // Up to 5kg
    else if (weightInKg <= 5) {
      totalCharge = (rates.baseFare[zoneIndex] || 0) + (rates.additional250g[zoneIndex] || 0)
      const remaining = weightInKg - 0.5
      const units500g = Math.ceil(remaining / 0.5)
      totalCharge += units500g * (rates.additional500g[zoneIndex] || 0)
    }
    // Above 5kg
    else {
      totalCharge = (rates.baseFare[zoneIndex] || 0) + (rates.additional250g[zoneIndex] || 0)
      // First 4.5kg (0.5 to 5kg) in 500g units
      const units500g = Math.ceil(4.5 / 0.5)
      totalCharge += units500g * (rates.additional500g[zoneIndex] || 0)
      // Remaining in 1kg units
      const remaining = weightInKg - 5
      const units1kg = Math.ceil(remaining)
      totalCharge += units1kg * (rates.additional1kg[zoneIndex] || 0)
    }

    return totalCharge
  },
}))
