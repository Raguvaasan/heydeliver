import { FC } from "react"

export const getStatusColor = (status?: string) => {
    switch (status) {
        case "CONFIRMED":
            return "success"
        case "IN_TRANSIT":
            return "info"
        case "DELIVERED":
            return "success"
        default:
            return "warning"
    }
}

export const formatStatus = (status?: string) => (status ? status.replace(/_/g, " ") : "N/A")

export const formatDate = (value: string) => {
    if (!value) return "-"
    const date = new Date(value)
    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })
}

export const SectionTitle: FC<{ title: string }> = ({ title }) => (
    <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-orange-600 dark:text-orange-400">{title}</h4>
)

export const Field: FC<{ label: string; value?: unknown; wide?: boolean }> = ({ label, value, wide = false }) => {
    const displayValue = value === undefined || value === null || value === "" ? "N/A" : String(value)
    return (
        <div className={`rounded-lg bg-white px-3 py-2.5 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700 ${wide ? "sm:col-span-2" : ""}`}>
            <div className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">{label}</div>
            <div className="mt-1 break-words text-sm font-semibold text-gray-900 dark:text-white">{displayValue}</div>
        </div>
    )
}