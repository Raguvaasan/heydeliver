import { FC, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { HiChevronDown } from "react-icons/hi"
import http from "../../common/httpRequest"

interface Props {
  routeId: string
  selectedBranches: string[]
  onSave: (routeId: string, branches: string[]) => Promise<void> | void
}

interface AgencyOption {
  id: string
  agencyName: string
}

const PAGE_SIZE = 10

const BranchSelector: FC<Props> = ({ routeId, selectedBranches, onSave }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState<string[]>(selectedBranches)
  const [saving, setSaving] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })
  const [agencies, setAgencies] = useState<AgencyOption[]>([])
  const [agencyLoading, setAgencyLoading] = useState(false)
  const [agencyPage, setAgencyPage] = useState(1)
  const [agencyPagination, setAgencyPagination] = useState({ totalPages: 1, total: 0, limit: PAGE_SIZE, page: 1 })

  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setDraft(selectedBranches)
  }, [selectedBranches])

  const openDropdown = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setCoords({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 224), // min ~w-56
      })
    }
    setIsOpen(true)
  }

  useEffect(() => {
    if (!isOpen) return
    let cancelled = false
    const fetchAgencies = async () => {
      setAgencyLoading(true)
      try {
        const response = await http.get("/admin/agency", {
          params: { page: agencyPage, limit: PAGE_SIZE },
        })
        if (cancelled) return
        const list = response.data?.data?.agencies || []
        setAgencies(list.map((item: any) => ({
          id: item._id || item.id,
          agencyName: item.agencyName || "",
        })))
        setAgencyPagination(response.data?.data?.pagination || { totalPages: 1, total: 0, limit: PAGE_SIZE, page: agencyPage })
      } finally {
        if (!cancelled) setAgencyLoading(false)
      }
    }
    fetchAgencies()
    return () => { cancelled = true }
  }, [isOpen, agencyPage])

  const closeDropdown = (discard: boolean) => {
    setIsOpen(false)
    if (discard) setDraft(selectedBranches)
  }

  // close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        panelRef.current && !panelRef.current.contains(target)
      ) {
        closeDropdown(true)
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, selectedBranches])

  // reposition on scroll/resize while open (e.g. table body scroll)
  useEffect(() => {
    if (!isOpen) return
    const reposition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        setCoords({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: Math.max(rect.width, 224),
        })
      }
    }
    window.addEventListener("scroll", reposition, true)
    window.addEventListener("resize", reposition)
    return () => {
      window.removeEventListener("scroll", reposition, true)
      window.removeEventListener("resize", reposition)
    }
  }, [isOpen])

  const toggleBranch = (branch: string) => {
    setDraft((prev) => (prev.includes(branch) ? prev.filter((b) => b !== branch) : [...prev, branch]))
  }

  const handleOk = async () => {
    setSaving(true)
    try {
      await onSave(routeId, draft) // only the checked branches in `draft` get saved
      setIsOpen(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (isOpen ? closeDropdown(true) : openDropdown())}
        className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:bg-gray-800 text-gray-700 dark:text-gray-300 min-w-[150px] justify-between"
      >
        <span className="truncate">
          {selectedBranches.length > 0
            ? selectedBranches.length === 1
              ? selectedBranches[0]
              : `${selectedBranches.length} branches`
            : "Select branches"}
        </span>
        <HiChevronDown className="w-4 h-4 flex-shrink-0" />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: "absolute", top: coords.top, left: coords.left, width: coords.width, zIndex: 9999 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-3"
          >
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
              Select Branches
            </p>

            <div className="max-h-48 overflow-y-auto space-y-2 mb-3">
              {agencyLoading && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading agencies...</p>
              )}
              {!agencyLoading && agencies.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">No agencies available</p>
              )}
              {agencies.map((branch) => (
                <label key={branch.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.includes(branch.agencyName)}
                    onChange={() => toggleBranch(branch.agencyName)}
                    className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{branch.agencyName}</span>
                </label>
              ))}
            </div>
            <hr />
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span>
                Page {agencyPagination.page} of {agencyPagination.totalPages}
              </span>
              <span>{agencyPagination.total} agencies</span>
            </div>

            <div className="flex justify-between gap-2">
              <button
                type="button"
                onClick={() => setAgencyPage((p) => Math.max(1, p - 1))}
                disabled={agencyPage <= 1 || agencyLoading}
                className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => setAgencyPage((p) => Math.min(agencyPagination.totalPages || 1, p + 1))}
                disabled={agencyPage >= (agencyPagination.totalPages || 1) || agencyLoading}
                className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => closeDropdown(true)}
                className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleOk}
                disabled={saving}
                className="px-3 py-1.5 text-xs text-white bg-orange-500 hover:bg-orange-600 rounded-lg disabled:opacity-50"
              >
                {saving ? "Saving..." : "OK"}
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

export default BranchSelector
