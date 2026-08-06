import { FC, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { HiChevronDown } from "react-icons/hi"
import { BranchOption } from "../../../store/branchWalletStore"

interface Props {
  value: string
  options: BranchOption[]
  loading: boolean
  pagination?: { page: number; totalPages: number; total: number; limit: number } | null
  onChange: (branchId: string, balance?: number) => void
}

const BranchWalletBranchSelector: FC<Props> = ({ value, options, loading, pagination, onChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const selectedLabel = options.find((branch) => branch.id === value)?.name || "Select branches"

  const openDropdown = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setCoords({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX, width: Math.max(rect.width, 224) })
    }
    setIsOpen(true)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (buttonRef.current?.contains(target) || panelRef.current?.contains(target)) return
      setIsOpen(false)
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : openDropdown())}
        className="flex min-w-[220px] items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        <span className="truncate">
          {selectedLabel}
        </span>
        <HiChevronDown className="h-4 w-4 shrink-0" />
      </button>

      {isOpen && createPortal(
        <div
          ref={panelRef}
          style={{ position: "absolute", top: coords.top, left: coords.left, width: coords.width, zIndex: 9999 }}
          className="rounded-xl border border-gray-200 bg-white p-3 shadow-2xl dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="mb-2 text-xs font-semibold uppercase text-gray-500">Select branches</div>
          <div className="max-h-48 overflow-y-auto pr-1">
            {loading ? (
              <div className="py-4 text-sm text-gray-500">Loading branches...</div>
            ) : options.length ? (
              options.map((branch) => (
                <label key={branch.id} className="flex cursor-pointer items-center gap-3 rounded-md px-1 py-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="branchId"
                    checked={value === branch.id}
                    onChange={() => onChange(branch.id, Number(branch.walletBalance || 0))}
                    className="h-4 w-4 border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{branch.name}</span>
                </label>
              ))
            ) : (
              <div className="py-4 text-sm text-gray-500">No branches found</div>
            )}
          </div>
          <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
            <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
              <span>Page {pagination?.page || 1} of {pagination?.totalPages || 1}</span>
              <span>{pagination?.total || 0} agencies</span>
            </div>
            <div className="flex justify-between gap-2">
              <button type="button" disabled className="rounded-lg px-3 py-1.5 text-xs text-gray-600 disabled:opacity-50 dark:text-gray-300">Prev</button>
              <button type="button" disabled className="rounded-lg px-3 py-1.5 text-xs text-gray-600 disabled:opacity-50 dark:text-gray-300">Next</button>
            </div>
            <div className="mt-3 flex justify-end gap-2 border-t border-gray-200 pt-3 dark:border-gray-700">
              <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">Cancel</button>
              <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs text-white hover:bg-orange-600">OK</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default BranchWalletBranchSelector
