import { FC, useMemo, useState } from "react"
import { Card, Label, TextInput } from "flowbite-react"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"

const toNumber = (v: string) => {
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

const RateCalculatorPage: FC = () => {
  const [pricePerKg, setPricePerKg] = useState("5")
  const [length, setLength] = useState("10")
  const [breadth, setBreadth] = useState("10")
  const [height, setHeight] = useState("10")
  const [actualWeightGrams, setActualWeightGrams] = useState("500")

  const volumetricWeightGrams = useMemo(() => {
    const l = toNumber(length)
    const b = toNumber(breadth)
    const h = toNumber(height)
    return Math.ceil(((l * b * h) / 5000) * 1000)
  }, [length, breadth, height])

  const volumetricWeightKg = useMemo(
    () => (volumetricWeightGrams / 1000).toFixed(3),
    [volumetricWeightGrams]
  )

  const actual = useMemo(() => Math.ceil(toNumber(actualWeightGrams)), [actualWeightGrams])
  const chargeable = useMemo(
    () => Math.max(actual, volumetricWeightGrams),
    [actual, volumetricWeightGrams]
  )

  const finalPrice = useMemo(() => {
    const perKg = toNumber(pricePerKg)
    const chargeableKg = chargeable / 1000
    return (perKg * chargeableKg).toFixed(2)
  }, [pricePerKg, chargeable])

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4 pt-6 pb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rate Calculator (B2B Calculator Demo)</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Calculate volumetric, chargeable weight and price from actual weight.
        </p>

        <Card className="mt-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="pricePerKg" className="mb-2 block text-gray-700 dark:text-gray-200">Price per 1 kg (Rs)</Label>
              <TextInput
                id="pricePerKg"
                type="number"
                min="0"
                value={pricePerKg}
                onChange={(e) => setPricePerKg(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="actualWeight" className="mb-2 block text-gray-700 dark:text-gray-200">Package Weight (gm)</Label>
              <TextInput
                id="actualWeight"
                type="number"
                min="0"
                value={actualWeightGrams}
                onChange={(e) => setActualWeightGrams(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
            <div>
              <Label htmlFor="length" className="mb-2 block text-gray-700 dark:text-gray-200">Length (cm)</Label>
              <TextInput id="length" type="number" min="0" value={length} onChange={(e) => setLength(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="breadth" className="mb-2 block text-gray-700 dark:text-gray-200">Breadth (cm)</Label>
              <TextInput id="breadth" type="number" min="0" value={breadth} onChange={(e) => setBreadth(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="height" className="mb-2 block text-gray-700 dark:text-gray-200">Height (cm)</Label>
              <TextInput id="height" type="number" min="0" value={height} onChange={(e) => setHeight(e.target.value)} />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700 p-4 mt-5 text-sm text-gray-800 dark:text-gray-100">
            <p className="font-semibold mb-2 text-gray-900 dark:text-white">Volumetric weight</p>
            <p>
              {length} × {breadth} × {height} ÷ 5000 × 1000 = <strong>{volumetricWeightGrams} gm</strong> ({volumetricWeightKg} kg) - rounded up (ceil)
            </p>
            <p className="mt-2">
              Chargeable = max(actual {actual} gm, volumetric {volumetricWeightGrams} gm) = <strong>{chargeable} gm</strong>
            </p>
            <p className="mt-3 text-base">
              Price (based on chargeable weight): <strong>Rs {finalPrice}</strong>
            </p>
          </div>
        </Card>
      </div>
    </NavbarSidebarLayout>
  )
}

export default RateCalculatorPage
