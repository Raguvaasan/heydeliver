// ParcelManagementPage.tsx
import { FC, useEffect, useMemo, useState } from "react"
import { Badge, Button, Card, Select, TextInput } from "flowbite-react"
import toast from "react-hot-toast"
import { HiDocumentDownload, HiEye, HiPencil, HiPlus, HiSearch, HiTrash } from "react-icons/hi"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import DeleteConfirmModal from "../AgencyManagement/DeleteConfirmModal"
import AddEditParcel, { Parcel } from "./addEditParcel"
import { resolveParcelAccess } from "./parcelBookingRole"
import ViewParcelModal from "./viewParcel"
import { jsPDF } from "jspdf"

const PAGE_SIZE = 10

const ADMIN_BASE = "/api/admin/parcel-order"
const BRANCH_BASE = "/api/admin/branch/parcel-order"
const HUB_BASE = "/api/hub/parcel-order"
const HUB_LIST_BASE = "/api/admin/hub"
const HUB_VEHICLE_OPTIONS_URL = `${HUB_BASE}/options/vehicles`
const HUB_DRIVER_OPTIONS_URL = `${HUB_BASE}/options/drivers`

const statusColor: Record<string, string> = {
    "Order Created": "warning",
    "Parcel Collected": "warning",
    "Hub Assigned": "indigo",
    "Parcel Dispatched": "info",
    "Parcel Arrived at Hub": "info",
    "Parcel Processed at Hub": "info",
    "Parcel Dispatched from Hub": "info",
    "Parcel Arrived at Agency": "purple",
    "Parcel Received at Agency": "purple",
    Delivered: "success",
    Cancelled: "failure",
}

const paymentTypeColor: Record<string, string> = {
    Paid: "success",
    "To Pay": "warning",
    Credit: "info",
}

const BRANCH_PRE_HUB_STATUSES = ["Order Created"]
const BRANCH_POST_HUB_STATUSES = [
    "Parcel Dispatched",
    "Parcel Arrived at Agency",
    "Parcel Received at Agency",
    "Delivered",
]
const ALL_BRANCH_STATUSES = [...BRANCH_PRE_HUB_STATUSES, ...BRANCH_POST_HUB_STATUSES]

const HUB_STATUSES = ["Parcel Arrived at Hub", "Parcel Processed at Hub", "Parcel Dispatched from Hub"]



const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = "Anonymous"
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = url
    })
}

interface Hub {
    id: string
    name: string
}

interface DriverOption {
    id: string
    name: string
    phoneNumber: string
    licenseNumber: string
    dateOfExpiry: string
}

interface VehicleOption {
    id: string
    type: string
    registrationNumber: string
    capacity: string
}



interface DriverOption {
    id: string
    name: string
    phoneNumber: string
    licenseNumber: string
    dateOfExpiry: string
}

interface VehicleOption {
    id: string
    type: string
    registrationNumber: string
    capacity: string
}

const ParcelManagementPage: FC = () => {
    const getProfileData = () => {
        try {
            const profileData = sessionStorage.getItem("profileData")
            return profileData ? JSON.parse(profileData) : null
        } catch (error) {
            return null
        }
    }

    const profileData = getProfileData()
    const loginType = (sessionStorage.getItem("loginType") || "").toLowerCase()
    const { isAdmin, isHub, isBranch } = resolveParcelAccess(loginType, profileData)

    const API_BASE = isAdmin ? ADMIN_BASE : isHub ? HUB_BASE : BRANCH_BASE

    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [dateFrom, setDateFrom] = useState("")
    const [dateTo, setDateTo] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [parcels, setParcels] = useState<Parcel[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [apiError, setApiError] = useState<string | null>(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: PAGE_SIZE,
        total: 0,
        totalPages: 1,
    })

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState<"add" | "edit">("add")
    const [selectedParcel, setSelectedParcel] = useState<Parcel | undefined>(undefined)

    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isGeneratingInvoice, setIsGeneratingInvoice] = useState<string | null>(null)

    const [hubs, setHubs] = useState<Hub[]>([])
    const [driverOptions, setDriverOptions] = useState<DriverOption[]>([])
    const [vehicleOptions, setVehicleOptions] = useState<VehicleOption[]>([])
    const [rowActionError, setRowActionError] = useState<string | null>(null)

    const getAuthToken = () => {
        const authToken = sessionStorage.getItem("authToken")
        if (!authToken) throw new Error("Authorization token missing")
        return authToken
    }

    const isAgencyLogin = (() => {
        const type = String(sessionStorage.getItem("loginType") || "").toLowerCase()
        return type === "agency" || type === "collection-agency" || type === "collectionagency"
    })()

    const handleGenerateInvoice = async (orderId: string) => {
        setIsGeneratingInvoice(orderId)
        try {
            const authToken = getAuthToken()
            const endpoint = isAgencyLogin
                ? `/admin/agency/invoice?orderId=${encodeURIComponent(orderId)}`
                : `/admin/invoice?orderId=${encodeURIComponent(orderId)}`

            const response = await fetch(`/api${endpoint}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            })

            if (!response.ok) {
                const errText = await response.text()
                throw new Error(errText || "Failed to generate invoice")
            }

            const payload = await response.json().catch(() => null)
            const invoiceData = payload?.data?.invoices?.[0] || payload?.data?.invoice || payload?.data || payload || {}
            const order = invoiceData?.order || {}
            const billTo = invoiceData?.billTo || {}
            const shipTo = invoiceData?.shipTo || {}
            const issuedByAgency = invoiceData?.issuedByAgency || invoiceData?.agency || {}
            const parcelDetails = invoiceData?.parcelDetails || {}
            const charges = invoiceData?.charges || {}
            const amount = charges?.totalAmount ?? order?.totalAmount ?? invoiceData?.invoiceAmount ?? 0
            const transportationCharge = charges?.transportationCharge ?? 0
            const loadingCharge = charges?.loadingCharge ?? 0
            const miscellaneousCharge = charges?.miscellaneousCharge ?? 0
            const orderDate = invoiceData?.invoiceDate || order?.createdAt || invoiceData?.createdAt || ""
            const dObj = orderDate ? new Date(orderDate) : new Date()
            const dateStr = dObj.toLocaleDateString()
            const pickupAddress = invoiceData?.pickupAddress || order?.pickupAddress || billTo?.address || ""
            const deliveryAddressFull = invoiceData?.deliveryAddress || order?.deliveryAddress || shipTo?.address || ""

            const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
            const margin = 20
            const pageWidth = doc.internal.pageSize.getWidth()
            const contentWidth = pageWidth - margin * 2

            try {
                const logoImg = await loadImage("https://truecargos.com/admin/images/logo.png")
                const logoW = 40
                const logoH = (logoImg.height / logoImg.width) * logoW
                doc.addImage(logoImg, "PNG", margin, margin, logoW, logoH)
            } catch {
                doc.setFont("helvetica", "bold")
                doc.setFontSize(24)
                doc.setTextColor(249, 115, 22)
                doc.text("TRUECARGO", margin, margin + 10)
            }

            doc.setTextColor(0)
            doc.setFontSize(24)
            doc.setFont("helvetica", "bold")
            doc.text("INVOICE", pageWidth - margin, margin + 10, { align: "right" })
            doc.setDrawColor(200)
            doc.line(margin, margin + 25, pageWidth - margin, margin + 25)

            // ---------- FROM (sender / booking customer) ----------
            let currentY = margin + 35
            doc.setFontSize(10)
            doc.setFont("helvetica", "bold")
            doc.text("FROM:", margin, currentY)
            doc.setFont("helvetica", "normal")
            currentY += 5
            doc.text(String(billTo?.name || "-"), margin, currentY)
            currentY += 5
            if (billTo?.mobileNumber) {
                doc.text(`Phone: ${billTo.mobileNumber}`, margin, currentY)
                currentY += 5
            }
            const senderLines = doc.splitTextToSize(String(pickupAddress || "-"), 80)
            doc.text(senderLines, margin, currentY)
            const fromBlockEndY = currentY + senderLines.length * 5

            // ---------- Invoice meta (right column, consistently aligned) ----------
            const infoLabelX = pageWidth - 75
            const infoValueX = pageWidth - margin
            let infoY = margin + 35
            doc.setFontSize(10)
            const infoRow = (label: string, value: string) => {
                doc.setFont("helvetica", "bold")
                doc.text(label, infoLabelX, infoY)
                doc.setFont("helvetica", "normal")
                doc.text(value, infoValueX, infoY, { align: "right" })
                infoY += 7
            }
            infoRow("Invoice:", String(invoiceData?.invoiceNumber || order?.orderNumber || orderId))
            infoRow("Date:", dateStr)
            infoRow("LR Number:", String(order?.orderNumber || invoiceData?.orderNumber || orderId))
            infoRow("Agency:", String(issuedByAgency?.agencyName || invoiceData?.agency?.agencyName || "-"))

            currentY = Math.max(fromBlockEndY, infoY) + 10

            // ---------- SHIP TO (receiver) ----------
            // ---------- SHIP TO (receiver) ----------
            doc.setFillColor(245, 245, 245)
            doc.rect(margin, currentY, contentWidth, 10, "F")
            doc.setFont("helvetica", "bold")
            doc.setFontSize(10)
            doc.text("SHIP TO", margin + 5, currentY + 7)
            doc.setFontSize(9)
            doc.text(`PAY: ${invoiceData?.paymentType || order?.paymentType || "-"}`, pageWidth - margin - 5, currentY + 7, { align: "right" })
            currentY += 15
            doc.setFontSize(11)
            doc.text(String(shipTo?.name || "-").toUpperCase(), margin, currentY)
            currentY += 6
            doc.setFontSize(10)
            doc.setFont("helvetica", "normal")

            // Use deliveryAddressFull directly if present, else fall back to composed shipTo parts
            const shipAddrParts = deliveryAddressFull
                || [shipTo?.address, shipTo?.city, shipTo?.state, shipTo?.pincode].filter(Boolean).join(", ")

            const receiverLines = doc.splitTextToSize(shipAddrParts, contentWidth - 10)
            doc.text(receiverLines, margin, currentY)
            currentY += receiverLines.length * 5 + 5
            doc.text(`Phone: ${shipTo?.mobileNumber || shipTo?.phone || "-"}`, margin, currentY)
            if (shipTo?.agencyName) {
                currentY += 5
                doc.text(`Delivery Agency: ${shipTo.agencyName}`, margin, currentY)
            }

            currentY += 10
            doc.setLineWidth(0.1)
            doc.line(margin, currentY, pageWidth - margin, currentY)
            currentY += 10

            // ---------- BOOKING AGENCY (replaces Return Address) ----------
            doc.setFont("helvetica", "bold")
            doc.setFontSize(9)
            doc.text("BOOKING AGENCY:", margin, currentY)
            doc.setFont("helvetica", "normal")
            currentY += 5
            doc.text(String(issuedByAgency?.name || issuedByAgency?.agencyName || "-"), margin, currentY)
            currentY += 5
            const bookingAddrParts = [issuedByAgency?.address, issuedByAgency?.city, issuedByAgency?.state, issuedByAgency?.pincode]
                .filter(Boolean)
                .join(", ")
            if (bookingAddrParts) {
                const bookingLines = doc.splitTextToSize(bookingAddrParts, contentWidth)
                doc.text(bookingLines, margin, currentY)
                currentY += bookingLines.length * 5
            }
            if (issuedByAgency?.mobileNumber) {
                doc.text(`Phone: ${issuedByAgency.mobileNumber}`, margin, currentY)
                currentY += 5
            }
            if (issuedByAgency?.gstNumber) {
                doc.text(`GSTIN: ${issuedByAgency.gstNumber}`, margin, currentY)
                currentY += 5
            }
            currentY += 5

            // ---------- Charges table ----------
            doc.setDrawColor(0)
            doc.setFillColor(50, 50, 50)
            doc.rect(margin, currentY, contentWidth, 10, "F")
            doc.setTextColor(255)
            doc.setFont("helvetica", "bold")
            doc.text("Description", margin + 5, currentY + 7)
            doc.text("Qty", pageWidth - 70, currentY + 7, { align: "center" })
            doc.text("Unit Price", pageWidth - 45, currentY + 7, { align: "center" })
            doc.text("Total", pageWidth - margin - 5, currentY + 7, { align: "right" })
            doc.setTextColor(0)
            currentY += 10
            doc.setFont("helvetica", "normal")
            doc.line(margin, currentY, pageWidth - margin, currentY)
            currentY += 8
            doc.text(`Logistic Services - ${parcelDetails?.article || "Courier Charges"}`, margin + 5, currentY)
            doc.text("1", pageWidth - 70, currentY, { align: "center" })
            doc.text(`INR ${transportationCharge}`, pageWidth - 45, currentY, { align: "center" })
            doc.text(`INR ${transportationCharge}`, pageWidth - margin - 5, currentY, { align: "right" })
            currentY += 20
            const totalX = pageWidth - margin - 80
            doc.setFontSize(8)
            doc.setFont("helvetica", "normal")
            doc.setTextColor(90)
            doc.text(
                `Loading Charge: INR ${loadingCharge} | Miscellaneous Charge: INR ${miscellaneousCharge}`,
                totalX,
                currentY - 10
            )
            doc.setFont("helvetica", "bold")
            doc.setFontSize(14)
            doc.setTextColor(0)
            doc.text("Total Amount:", totalX, currentY)
            doc.setTextColor(249, 115, 22)
            doc.text(`INR ${amount}`, pageWidth - margin - 5, currentY, { align: "right" })

            const pdfUrl = doc.output("bloburl")
            window.open(pdfUrl, "_blank", "noopener,noreferrer")
            toast.success("Invoice generated")
        } catch (error: any) {
            toast.error(error?.message || "Failed to generate invoice")
        } finally {
            setIsGeneratingInvoice(null)
        }
    }

    const resolveHubValue = (hub: any) => {
        if (!hub) return { id: "", name: "" }

        if (typeof hub === "string") {
            return { id: hub, name: hub }
        }

        if (typeof hub === "object") {
            const id = String(hub._id || hub.id || hub.hubId || "")
            const name = String(hub.hubName || hub.name || hub.hub || "")
            return { id, name }
        }

        return { id: String(hub), name: String(hub) }
    }

    const extractAssignedHub = (payload: any) => {
        const source = payload?.hub || payload?.data?.hub || payload?.data?.assignedHub || payload?.assignedHub || payload?.hubDetails || payload?.hubData
        return resolveHubValue(source)
    }

    const resolveDriverValue = (driver: any) => {
        if (!driver) return { id: "", name: "" }
        if (typeof driver === "string") return { id: driver, name: driver }
        const id = String(driver._id || driver.id || "")
        const name = String(driver.driverName || driver.name || "")
        return { id, name }
    }

    const resolveVehicleValue = (vehicle: any) => {
        if (!vehicle) return { id: "", label: "" }
        if (typeof vehicle === "string") return { id: vehicle, label: vehicle }
        const id = String(vehicle._id || vehicle.id || "")
        const reg = String(vehicle.vehicleRegistrationNumber || vehicle.registrationNumber || "")
        const type = String(vehicle.vehicleType || vehicle.type || "")
        const label = [type, reg].filter(Boolean).join(" - ") || reg || type
        return { id, label }
    }

    const extractAssignedDriver = (payload: any) => {
        const source = payload?.driver || payload?.data?.driver || payload?.data?.assignedDriver || payload?.assignedDriver
        return resolveDriverValue(source)
    }

    const extractAssignedVehicle = (payload: any) => {
        const source = payload?.vehicle || payload?.data?.vehicle || payload?.data?.assignedVehicle || payload?.assignedVehicle
        return resolveVehicleValue(source)
    }

    const fetchParcels = async () => {
        setIsLoading(true)
        setApiError(null)

        try {
            const authToken = getAuthToken()
            const query = new URLSearchParams({
                page: String(currentPage),
                limit: String(PAGE_SIZE),
            })
            if (searchTerm.trim()) query.set("search", searchTerm.trim())
            if (statusFilter) query.set("status", statusFilter)
            if (dateFrom) query.set("dateFrom", dateFrom)
            if (dateTo) query.set("dateTo", dateTo)

            const response = await fetch(`${API_BASE}?${query.toString()}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            })

            if (!response.ok) {
                const errBody = await response.json().catch(() => null)
                throw new Error(errBody?.message || "Failed to load parcel bookings")
            }

            const payload = await response.json()
            const orders = payload?.data?.orders ?? payload?.orders ?? []
            const meta = payload?.data?.pagination || payload?.pagination || null

            const resolveDeliveryBranch = (branch: any) => {
                if (!branch) return { id: "", name: "" }
                if (typeof branch === "string") return { id: "", name: branch }
                const id = String(branch._id || branch.id || branch.branchId || branch.deliveryBranchId || "")
                const name = String(branch.agencyName || branch.name || branch.branchName || id || "")
                return { id, name }
            }

            const normalizedParcels: Parcel[] = orders.map((item: any) => {
                const hub = resolveHubValue(item.hub)
                const deliveryBranch = resolveDeliveryBranch(item.deliveryCustomer?.deliveryBranch)
                const driver = resolveDriverValue(item.driver)
                const vehicle = resolveVehicleValue(item.vehicle)
                const charges = item.charges || item.invoice?.charges || item.invoiceData?.charges || {}
                const loadingCharge = charges.loadingCharge ?? item.loadingCharge ?? item.loading_charge ?? 0
                const miscellaneousCharge = charges.miscellaneousCharge ?? item.miscellaneousCharge ?? item.miscellaneous_charge ?? 0
                const totalAmount = charges.totalAmount ?? item.totalAmount ?? item.total_amount ?? item.invoiceAmount ?? 0
                return {
                    id: item._id,
                    orderId: item.orderNumber,
                    bookingDate: item.bookingDate || item.createdAt || "",
                    deliveryCustomerName: item.deliveryCustomer?.name || "",
                    deliveryCustomerMobileNumber: item.deliveryCustomer?.mobileNumber || "",
                    deliveryCustomerAddress: item.deliveryCustomer?.address || "",
                    deliveryBranch: deliveryBranch.name || item.deliveryCustomer?.deliveryBranch || "",
                    deliveryBranchId: deliveryBranch.id || "",
                    bookingCustomerName: item.bookingCustomer?.name || "",
                    bookingMobileNumber: item.bookingCustomer?.mobileNumber || "",
                    bookingCustomerAddress: item.bookingCustomer?.address || "",
                    pickupAddress: item.pickupAddress || "",
                    deliveryAddress: item.deliveryAddress || "",
                    paymentType:
                        item.paymentType === "Paid" ||
                            item.paymentType === "To Pay" ||
                            item.paymentType === "Credit"
                            ? item.paymentType
                            : "Paid",
                    article: item.parcelDetails?.article || "",
                    remarks: item.parcelDetails?.remarks || "",
                    numberOfParcels: String(item.parcelDetails?.numberOfParcels ?? ""),
                    approximateValue: String(item.parcelDetails?.approximateValue ?? ""),
                    transportationCharge: String(item.transportationCharge ?? "0"),
                    loadingCharge,
                    miscellaneousCharge,
                    totalAmount,
                    charges: {
                        loadingCharge,
                        miscellaneousCharge,
                        totalAmount,
                    },
                    status: item.status,
                    branchName: item.branch?.agencyName || "",
                    hubId: hub.id,
                    hubName: hub.name || item.hub?.hubName || "",
                    statusHistory: Array.isArray(item.statusHistory) ? item.statusHistory : (Array.isArray(item.data?.statusHistory) ? item.data.statusHistory : []),
                    assignedDriverId: driver.id,
                    assignedDriverName: driver.name,
                    assignedVehicleId: vehicle.id,
                    assignedVehicleLabel: vehicle.label,
                    bookingCustomer: item.bookingCustomer && typeof item.bookingCustomer === "object" ? item.bookingCustomer : undefined,
                    deliveryCustomer: item.deliveryCustomer && typeof item.deliveryCustomer === "object" ? item.deliveryCustomer : undefined,
                    // Raw objects (as returned by the API) so ViewParcelModal can
                    // render full driver/vehicle details, not just the flattened
                    // id/name used for the dropdowns.
                    driver: item.driver && typeof item.driver === "object" ? item.driver : undefined,
                    vehicle: item.vehicle && typeof item.vehicle === "object" ? item.vehicle : undefined,
                }
            })

            setParcels(normalizedParcels)
            if (meta) {
                const metaLimit = Number(meta.limit || PAGE_SIZE)
                const metaTotal = Number(meta.total || normalizedParcels.length)
                const metaTotalPages = Number(meta.totalPages || Math.max(1, Math.ceil(metaTotal / metaLimit)))
                setPagination({
                    page: Number(meta.page || currentPage),
                    limit: metaLimit,
                    total: metaTotal,
                    totalPages: metaTotalPages,
                })
            } else {
                setPagination({
                    page: currentPage,
                    limit: PAGE_SIZE,
                    total: normalizedParcels.length,
                    totalPages: Math.max(1, Math.ceil(normalizedParcels.length / PAGE_SIZE)),
                })
            }
        } catch (error) {
            setApiError(error instanceof Error ? error.message : "Failed to load parcel bookings")
            setParcels([])
            setPagination({
                page: currentPage,
                limit: PAGE_SIZE,
                total: 0,
                totalPages: 1,
            })
        } finally {
            setIsLoading(false)
        }
    }

    const fetchHubs = async () => {
        try {
            const authToken = getAuthToken()
            const response = await fetch(HUB_LIST_BASE, {
                headers: { Authorization: `Bearer ${authToken}` },
            })
            if (!response.ok) return

            const payload = await response.json()
            const records = Array.isArray(payload)
                ? payload
                : Array.isArray(payload?.data?.hubs)
                    ? payload.data.hubs
                    : Array.isArray(payload?.data?.data)
                        ? payload.data.data
                        : Array.isArray(payload?.data)
                            ? payload.data
                            : Array.isArray(payload?.hubs)
                                ? payload.hubs
                                : []

            setHubs(
                records.map((h: any) => ({
                    id: String(h._id || h.id || h.hubId || ""),
                    name: String(h.hubName || h.name || h.hub || h._id || h.id || ""),
                }))
            )
        } catch {
            // Non-critical — assignment dropdown just stays empty.
        }
    }

    const fetchDriverOptions = async () => {
        try {
            const authToken = getAuthToken()
            const response = await fetch(HUB_DRIVER_OPTIONS_URL, {
                headers: { Authorization: `Bearer ${authToken}` },
            })
            if (!response.ok) return

            const payload = await response.json()
            const records = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : []

            setDriverOptions(
                records.map((d: any) => ({
                    id: String(d._id || d.id || ""),
                    name: String(d.driverName || d.name || ""),
                    phoneNumber: String(d.phoneNumber || ""),
                    licenseNumber: String(d.licenseNumber || ""),
                    dateOfExpiry: String(d.dateOfExpiry || ""),
                }))
            )
        } catch {
            // Non-critical — dropdown just stays empty.
        }
    }

    const fetchVehicleOptions = async () => {
        try {
            const authToken = getAuthToken()
            const response = await fetch(HUB_VEHICLE_OPTIONS_URL, {
                headers: { Authorization: `Bearer ${authToken}` },
            })
            if (!response.ok) return

            const payload = await response.json()
            const records = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : []

            setVehicleOptions(
                records.map((v: any) => ({
                    id: String(v._id || v.id || ""),
                    type: String(v.vehicleType || v.type || ""),
                    registrationNumber: String(v.vehicleRegistrationNumber || v.registrationNumber || ""),
                    capacity: String(v.capacity || ""),
                }))
            )
        } catch {
            // Non-critical — dropdown just stays empty.
        }
    }

    useEffect(() => {
        fetchParcels()
        if (isAdmin) fetchHubs()
        if (isHub) {
            fetchDriverOptions()
            fetchVehicleOptions()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        fetchParcels()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, searchTerm, statusFilter, dateFrom, dateTo])

    const totalPages = pagination.totalPages || 1
    const paginatedParcels = useMemo(() => parcels, [parcels])

    const handleAdd = () => {
        setModalMode("add")
        setSelectedParcel(undefined)
        setIsModalOpen(true)
    }

    const handleEdit = (parcel: Parcel) => {
        setModalMode("edit")
        setSelectedParcel(parcel)
        setIsModalOpen(true)
    }

    const handleView = (parcel: Parcel) => {
        setSelectedParcel(parcel)
        setIsViewModalOpen(true)
    }

    const handleDeleteClick = (id: string) => {
        setSelectedId(id)
        setIsDeleteModalOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!selectedId) return
        setIsDeleting(true)
        setRowActionError(null)

        try {
            const authToken = getAuthToken()
            const res = await fetch(`${ADMIN_BASE}/${selectedId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${authToken}` },
            })
            if (!res.ok) {
                const errBody = await res.json().catch(() => null)
                throw new Error(errBody?.message || "Failed to delete booking")
            }
            setParcels((prev) => prev.filter((p) => p.id !== selectedId))
            setCurrentPage(1)
            fetchParcels()
        } catch (error) {
            setRowActionError(error instanceof Error ? error.message : "Failed to delete booking")
        } finally {
            setIsDeleting(false)
            setIsDeleteModalOpen(false)
            setSelectedId(null)
        }
    }

    const handleAssignHub = async (parcelId: string, hubId: string) => {
        const previous = parcels.find((p) => p.id === parcelId)?.hubId ?? ""
        setParcels((prev) => prev.map((p) => (p.id === parcelId ? { ...p, hubId } : p)))
        setRowActionError(null)

        try {
            const authToken = getAuthToken()
            const res = await fetch(`${ADMIN_BASE}/${parcelId}/assign-hub`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({ hub: hubId }),
            })
            if (!res.ok) {
                const errBody = await res.json().catch(() => null)
                throw new Error(errBody?.message || "Failed to assign hub")
            }

            const responsePayload = await res.json().catch(() => null)
            const assignedHub = extractAssignedHub(responsePayload)
            const fallbackHubName = hubs.find((hub) => hub.id === hubId)?.name || ""

            setParcels((prev) =>
                prev.map((p) =>
                    p.id === parcelId
                        ? {
                            ...p,
                            hubId: assignedHub.id || hubId,
                            hubName: assignedHub.name || fallbackHubName,
                        }
                        : p
                )
            )
            fetchParcels()
            toast.success("Status updated")
        } catch (error) {
            setParcels((prev) => prev.map((p) => (p.id === parcelId ? { ...p, hubId: previous } : p)))
            setRowActionError(error instanceof Error ? error.message : "Failed to assign hub")
        }
    }

    // Shared status-update handler for both branch and hub actors — only the
    // base URL and value set differ.
    const handleStatusChange = async (parcelId: string, status: string, base: string) => {
        const previous = parcels.find((p) => p.id === parcelId)?.status
        setParcels((prev) => prev.map((p) => (p.id === parcelId ? { ...p, status } : p)))
        setRowActionError(null)

        try {
            const authToken = getAuthToken()
            const res = await fetch(`${base}/${parcelId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({ status }),
            })
            if (!res.ok) {
                const errBody = await res.json().catch(() => null)
                throw new Error(errBody?.message || "Failed to update status")
            }

            toast.success(`Status updated to ${status}`)
            fetchParcels()
        } catch (error) {
            setParcels((prev) => prev.map((p) => (p.id === parcelId ? { ...p, status: previous as string } : p)))
            const message = error instanceof Error ? error.message : "Failed to update status"
            setRowActionError(message)
            toast.error(message)
        }
    }

    // Shared handler for assigning/clearing a driver or vehicle on a hub order.
    // field: "driver" | "vehicle" — value "" clears the assignment (sent as null).
    const handleAssignVehicleOrDriver = async (parcelId: string, field: "driver" | "vehicle", value: string) => {
        const target = parcels.find((p) => p.id === parcelId)
        const previousDriverId = target?.assignedDriverId ?? ""
        const previousDriverName = target?.assignedDriverName ?? ""
        const previousVehicleId = target?.assignedVehicleId ?? ""
        const previousVehicleLabel = target?.assignedVehicleLabel ?? ""
        const previousDriverRaw = target?.driver
        const previousVehicleRaw = target?.vehicle

        // Optimistic update — also patches the raw driver/vehicle object so
        // ViewParcelModal reflects the change immediately, ahead of the
        // background fetchParcels() refetch below.
        setParcels((prev) =>
            prev.map((p) => {
                if (p.id !== parcelId) return p
                if (field === "driver") {
                    const selected = driverOptions.find((d) => d.id === value)
                    const rawDriver = selected
                        ? {
                            _id: selected.id,
                            driverName: selected.name,
                            phoneNumber: selected.phoneNumber,
                            licenseNumber: selected.licenseNumber,
                        }
                        : undefined
                    return { ...p, assignedDriverId: value, assignedDriverName: selected?.name || "", driver: rawDriver }
                }
                const selected = vehicleOptions.find((v) => v.id === value)
                const label = selected ? [selected.type, selected.registrationNumber].filter(Boolean).join(" - ") : ""
                const rawVehicle = selected
                    ? {
                        _id: selected.id,
                        vehicleType: selected.type,
                        vehicleRegistrationNumber: selected.registrationNumber,
                        capacity: selected.capacity,
                    }
                    : undefined
                return { ...p, assignedVehicleId: value, assignedVehicleLabel: label, vehicle: rawVehicle }
            })
        )
        setRowActionError(null)

        try {
            const authToken = getAuthToken()
            const res = await fetch(`${HUB_BASE}/${parcelId}/assign-vehicle`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({ [field]: value || null }),
            })

            if (!res.ok) {
                const errBody = await res.json().catch(() => null)
                throw new Error(errBody?.message || `Failed to assign ${field}`)
            }

            const responsePayload = await res.json().catch(() => null)
            const assignedDriver = extractAssignedDriver(responsePayload)
            const assignedVehicle = extractAssignedVehicle(responsePayload)

            setParcels((prev) =>
                prev.map((p) => {
                    if (p.id !== parcelId) return p
                    if (field === "driver") {
                        return {
                            ...p,
                            assignedDriverId: assignedDriver.id || value,
                            assignedDriverName: assignedDriver.name || p.assignedDriverName,
                        }
                    }
                    return {
                        ...p,
                        assignedVehicleId: assignedVehicle.id || value,
                        assignedVehicleLabel: assignedVehicle.label || p.assignedVehicleLabel,
                    }
                })
            )

            toast.success(`${field === "driver" ? "Driver" : "Vehicle"} updated`)
            fetchParcels()
        } catch (error) {
            // Roll back optimistic update on failure
            setParcels((prev) =>
                prev.map((p) =>
                    p.id === parcelId
                        ? {
                            ...p,
                            assignedDriverId: previousDriverId,
                            assignedDriverName: previousDriverName,
                            assignedVehicleId: previousVehicleId,
                            assignedVehicleLabel: previousVehicleLabel,
                            driver: previousDriverRaw,
                            vehicle: previousVehicleRaw,
                        }
                        : p
                )
            )
            const message = error instanceof Error ? error.message : `Failed to assign ${field}`
            setRowActionError(message)
            toast.error(message)
        }
    }

    const showAmountColumn = !isBranch
    const showDeliveryBranchColumn = !isBranch
    const assignmentColumnCount = (isAdmin ? 1 : 0) + (isHub ? 2 : 0)
    const baseColumnCount = 5 + (showDeliveryBranchColumn ? 1 : 0) + (showAmountColumn ? 1 : 0)
    const totalColumnCount = baseColumnCount + assignmentColumnCount + 1

    const formatDate = (value?: string) => {
        if (!value) return "-"

        const parsedDate = new Date(value)
        if (Number.isNaN(parsedDate.getTime())) return value

        return parsedDate.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        })
    }

    return (
        <NavbarSidebarLayout>
            <div className="px-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Parcel Booking Management</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage parcel bookings</p>
                </div>

                <Card>
                    {apiError && (
                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
                            {apiError}
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div className="flex-1">
                            <div className="flex justify-between">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">List of Bookings</h2>
                                {!isAdmin && !isHub && (
                                    <Button color="warning" onClick={() => handleAdd()} className="bg-orange-500 hover:bg-orange-600">
                                        <HiPlus className="mr-2 h-5 w-5" />
                                        ADD
                                    </Button>
                                )}
                            </div>
                            <div className="flex flex-col md:flex-row gap-3 mt-2">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <HiSearch className="h-5 w-5 text-gray-400" />
                                    </div>

                                    <TextInput
                                        type="search"
                                        placeholder="Search LR Number, Customer name, Phone number"
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setCurrentPage(1)
                                            setSearchTerm(e.target.value)
                                        }}
                                        className="pl-10"
                                    />
                                </div>

                                <Select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setCurrentPage(1)
                                        setStatusFilter(e.target.value)
                                    }}
                                >
                                    <option value="">All Status</option>
                                    {Object.keys(statusColor).map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </Select>

                                <TextInput
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => {
                                        setCurrentPage(1)
                                        setDateFrom(e.target.value)
                                    }}
                                    aria-label="Date from"
                                />

                                <TextInput
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => {
                                        setCurrentPage(1)
                                        setDateTo(e.target.value)
                                    }}
                                    aria-label="Date to"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-800 text-white text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-3">LR Number</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Delivery Agency</th>
                                    <th className="px-4 py-3">Booking Customer</th>
                                    <th className="px-4 py-3">Payment Type</th>
                                    {showAmountColumn && <th className="px-4 py-3">Trans Charge</th>}
                                    <th className="px-4 py-3">Status</th>
                                    {isAdmin && <th className="px-4 py-3">Assign Hub</th>}
                                    {isHub && <th className="px-4 py-3">Assign Driver</th>}
                                    {isHub && <th className="px-4 py-3">Assign Vehicle</th>}
                                    <th className="px-4 py-3 text-center">Action</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={totalColumnCount} className="px-4 py-8 text-center text-gray-500">
                                            Loading bookings...
                                        </td>
                                    </tr>
                                ) : paginatedParcels.length > 0 ? (
                                    paginatedParcels.map((parcel) => {
                                        const hubAssigned = Boolean(parcel.hubId)
                                        const branchOptions = hubAssigned ? ALL_BRANCH_STATUSES : BRANCH_PRE_HUB_STATUSES

                                        return (
                                            <tr key={parcel.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{parcel.orderId}</td>
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{formatDate(parcel.bookingDate || parcel.createdAt)}</td>
                                                {/* {showDeliveryBranchColumn && ( */}
                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                                    {parcel.deliveryBranch || "-"}
                                                    {parcel.deliveryAddress ? (
                                                        <div
                                                            className="mt-1 max-w-[150px] truncate text-xs text-gray-500 dark:text-gray-400"
                                                            title={parcel.deliveryAddress}
                                                        >
                                                            Delivery: {parcel.deliveryAddress}
                                                        </div>
                                                    ) : null}
                                                </td>
                                                {/* )} */}

                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                                    <div>{parcel.bookingCustomerName}</div>

                                                    {parcel.pickupAddress ? (
                                                        <div
                                                            className="mt-1 max-w-[150px] truncate text-xs text-gray-500 dark:text-gray-400"
                                                            title={parcel.pickupAddress}
                                                        >
                                                            Pickup: {parcel.pickupAddress}
                                                        </div>
                                                    ) : null}
                                                </td>

                                                <td className="px-4 py-3 inline-block">
                                                    <div>
                                                        <Badge className="py-2" color={paymentTypeColor[parcel.paymentType] ?? "gray"}>
                                                            {parcel.paymentType}
                                                        </Badge>
                                                    </div>

                                                </td>

                                                {showAmountColumn && <td className="px-4 py-3 text-gray-900 dark:text-white">{parcel.transportationCharge}</td>}

                                                {/* Status cell: dropdown for branch/hub, read-only badge for admin */}
                                                <td className="px-4 py-3">
                                                    {isBranch ? (
                                                        <>
                                                            <Select
                                                                value={branchOptions.includes(parcel.status) ? parcel.status : ""}
                                                                onChange={(e) => handleStatusChange(parcel.id, e.target.value, BRANCH_BASE)}
                                                                disabled={branchOptions.length === 0}
                                                                className="min-w-[190px]"
                                                            >
                                                                <option value="" disabled>
                                                                    {parcel.status}
                                                                </option>
                                                                {branchOptions.map((status) => (
                                                                    <option key={status} value={status}>
                                                                        {status}
                                                                    </option>
                                                                ))}
                                                            </Select>
                                                            {!hubAssigned && (
                                                                <p className="mt-1 text-[11px] text-gray-400">Waiting for hub assignment</p>
                                                            )}
                                                        </>
                                                    ) : isHub ? (
                                                        <Select
                                                            value={HUB_STATUSES.includes(parcel.status) ? parcel.status : ""}
                                                            onChange={(e) => handleStatusChange(parcel.id, e.target.value, HUB_BASE)}
                                                            className="min-w-[190px]"
                                                        >
                                                            <option value="" disabled>
                                                                {parcel.status}
                                                            </option>
                                                            {HUB_STATUSES.map((status) => (
                                                                <option key={status} value={status}>
                                                                    {status}
                                                                </option>
                                                            ))}
                                                        </Select>
                                                    ) : (
                                                        <Badge className="inline-block py-2" color={statusColor[parcel.status] ?? "gray"}>
                                                            {parcel.status}
                                                        </Badge>
                                                    )}
                                                </td>

                                                {isAdmin && (
                                                    <td>
                                                        <Select
                                                            value={parcel.hubId || (parcel.hubName ? hubs.find((hub) => hub.name === parcel.hubName)?.id ?? "" : "") || ""}
                                                            onChange={(e) => handleAssignHub(parcel.id, e.target.value)}
                                                        >
                                                            <option value="">Unassigned</option>
                                                            {parcel.hubName && (!hubs.some((hub) => hub.id === parcel.hubId) || !parcel.hubId) && (
                                                                <option value={parcel.hubId || parcel.hubName}>{parcel.hubName}</option>
                                                            )}
                                                            {hubs.map((hub) => (
                                                                <option key={hub.id} value={hub.id}>
                                                                    {hub.name}
                                                                </option>
                                                            ))}
                                                        </Select>
                                                    </td>
                                                )}

                                                {isHub && (
                                                    <td>
                                                        <Select
                                                            value={parcel.assignedDriverId || ""}
                                                            onChange={(e) => handleAssignVehicleOrDriver(parcel.id, "driver", e.target.value)}
                                                        >
                                                            <option value="">Unassigned</option>
                                                            {parcel.assignedDriverId && !driverOptions.some((d) => d.id === parcel.assignedDriverId) && (
                                                                <option value={parcel.assignedDriverId}>{parcel.assignedDriverName}</option>
                                                            )}
                                                            {driverOptions.map((driver) => (
                                                                <option key={driver.id} value={driver.id}>
                                                                    {driver.name}
                                                                </option>
                                                            ))}
                                                        </Select>
                                                    </td>
                                                )}

                                                {isHub && (
                                                    <td>
                                                        <Select
                                                            value={parcel.assignedVehicleId || ""}
                                                            onChange={(e) => handleAssignVehicleOrDriver(parcel.id, "vehicle", e.target.value)}
                                                        >
                                                            <option value="">Unassigned</option>
                                                            {parcel.assignedVehicleId && !vehicleOptions.some((v) => v.id === parcel.assignedVehicleId) && (
                                                                <option value={parcel.assignedVehicleId}>{parcel.assignedVehicleLabel}</option>
                                                            )}
                                                            {vehicleOptions.map((vehicle) => (
                                                                <option key={vehicle.id} value={vehicle.id}>
                                                                    {vehicle.type} - {vehicle.registrationNumber}
                                                                </option>
                                                            ))}
                                                        </Select>
                                                    </td>
                                                )}

                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button onClick={() => handleGenerateInvoice(parcel.id)} className="p-1.5 text-gray-600 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400" title="Generate Invoice" disabled={isGeneratingInvoice === parcel.orderId}>
                                                            <HiDocumentDownload className="h-5 w-5" />
                                                        </button>
                                                        <button onClick={() => handleView(parcel)} className="p-1.5 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400" title="View">
                                                            <HiEye className="h-5 w-5" />
                                                        </button>

                                                        {!isHub && !isAdmin && (
                                                            <button onClick={() => handleEdit(parcel)} className="p-1.5 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400" title={isAdmin ? "Update Charge" : "Edit"}>
                                                                <HiPencil className="h-5 w-5" />
                                                            </button>
                                                        )}

                                                        {isAdmin && (
                                                            <button onClick={() => handleDeleteClick(parcel.id)} className="p-1.5 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400" title="Delete">
                                                                <HiTrash className="h-5 w-5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={totalColumnCount} className="px-4 py-8 text-center text-gray-500">
                                            No bookings found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Page {currentPage} of {totalPages}
                        </p>

                        <div className="flex gap-2">
                            <Button size="sm" color="gray" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1}>
                                Previous
                            </Button>

                            <Button size="sm" color="gray" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
                                Next
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>

            <AddEditParcel
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode={modalMode}
                parcel={selectedParcel}
                chargeOnly={isAdmin}
                onSuccess={() => {
                    fetchParcels().catch(() => undefined)
                }}
            />

            <ViewParcelModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} parcel={selectedParcel} />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Booking"
                message="Are you sure you want to delete this parcel booking? This action cannot be undone."

            />
        </NavbarSidebarLayout>
    )
}

export default ParcelManagementPage
