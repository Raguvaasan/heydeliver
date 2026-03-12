import { FC, useEffect, useState } from "react"
import {
  Badge,
  Button,
  Card,
  Modal,
  Select,
  Spinner,
  TextInput,
  Label,
} from "flowbite-react"
import {
  HiSearch,
  HiTrash,
  HiPencil,
  HiEye,
  HiFilter,
  HiMail,
  HiPhone,
  HiUser,
  HiClipboardList,
  HiDocumentText,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import {
  useApplicationStore,
  Application,
  ApplicationStatus,
  ApplicationUpdatePayload,
} from "../../store/applicationStore"
import { useCareerStore } from "../../store/careerStore"

// ─── helpers ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  pending: "warning",
  reviewed: "info",
  accepted: "success",
  rejected: "failure",
}

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: "Pending",
  reviewed: "Reviewed",
  accepted: "Accepted",
  rejected: "Rejected",
}

const ALL_STATUSES: ApplicationStatus[] = ["pending", "reviewed", "accepted", "rejected"]

const jobTitle = (app: Application) =>
  typeof app.jobPostingId === "object" && app.jobPostingId !== null
    ? app.jobPostingId.title
    : "—"

const fmt = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"

// ─── View modal ──────────────────────────────────────────────────────────────

const ViewModal: FC<{ app: Application; onClose: () => void }> = ({ app, onClose }) => (
  <Modal show onClose={onClose} size="2xl">
    <Modal.Header>Application – {app.name}</Modal.Header>
    <Modal.Body>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <HiUser className="h-4 w-4 mt-0.5 text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Applicant Name</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">{app.name}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <HiClipboardList className="h-4 w-4 mt-0.5 text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Applied For</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">{jobTitle(app)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <HiMail className="h-4 w-4 mt-0.5 text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">{app.email}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <HiPhone className="h-4 w-4 mt-0.5 text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">{app.phone}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Status</p>
            <Badge color={STATUS_COLORS[app.status]}>{STATUS_LABELS[app.status]}</Badge>
          </div>
          <div>
            <p className="text-xs text-gray-500">Applied On</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{fmt(app.createdAt)}</p>
          </div>
        </div>

        {app.coveringMessage && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Covering Message</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 leading-relaxed">
              {app.coveringMessage}
            </p>
          </div>
        )}

        {app.resumePath && (
          <div className="flex items-center gap-2">
            <HiDocumentText className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Resume: {app.resumePath}</span>
          </div>
        )}
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button color="gray" onClick={onClose}>Close</Button>
    </Modal.Footer>
  </Modal>
)

// ─── Edit modal ───────────────────────────────────────────────────────────────

const EditModal: FC<{ app: Application; onClose: () => void }> = ({ app, onClose }) => {
  const { updateApplication } = useApplicationStore()
  const [form, setForm] = useState<ApplicationUpdatePayload>({
    name: app.name,
    phone: app.phone,
    email: app.email,
    coveringMessage: app.coveringMessage,
    status: app.status,
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateApplication(app._id, form)
      onClose()
    } catch {
      // Toast shown in store
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal show onClose={onClose} size="2xl">
      <Modal.Header>Edit Application – {app.name}</Modal.Header>
      <Modal.Body>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="e-name" value="Name" />
            <TextInput
              id="e-name"
              value={form.name ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="e-phone" value="Phone" />
            <TextInput
              id="e-phone"
              value={form.phone ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="e-email" value="Email" />
            <TextInput
              id="e-email"
              value={form.email ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="e-status" value="Status" />
            <Select
              id="e-status"
              value={form.status ?? "pending"}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value as ApplicationStatus }))
              }
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="e-cover" value="Covering Message" />
            <textarea
              id="e-cover"
              rows={4}
              value={form.coveringMessage ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, coveringMessage: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white resize-none"
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleSave} disabled={saving} className="bg-primary-500 hover:bg-primary-600">
          {saving && <Spinner size="sm" className="mr-2" />}
          Save Changes
        </Button>
        <Button color="gray" onClick={onClose} disabled={saving}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  )
}

// ─── Delete confirm ───────────────────────────────────────────────────────────

const DeleteModal: FC<{ app: Application; onClose: () => void }> = ({ app, onClose }) => {
  const { deleteApplication } = useApplicationStore()
  const [deleting, setDeleting] = useState(false)

  const handleConfirm = async () => {
    setDeleting(true)
    try {
      await deleteApplication(app._id)
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Modal show onClose={onClose} size="md">
      <Modal.Header>Delete Application</Modal.Header>
      <Modal.Body>
        <p className="text-gray-700 dark:text-gray-300">
          Are you sure you want to delete the application from{" "}
          <span className="font-semibold">{app.name}</span>? This action cannot be undone.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button color="failure" onClick={handleConfirm} disabled={deleting}>
          {deleting && <Spinner size="sm" className="mr-2" />}
          Yes, Delete
        </Button>
        <Button color="gray" onClick={onClose} disabled={deleting}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  )
}

// ─── Row ──────────────────────────────────────────────────────────────────────

const AppRow: FC<{
  app: Application
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}> = ({ app, onView, onEdit, onDelete }) => (
  <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
    <td className="px-4 py-3">
      <div className="font-medium text-gray-900 dark:text-white text-sm">{app.name}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{app.email}</div>
    </td>
    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hidden md:table-cell">
      {jobTitle(app)}
    </td>
    <td className="px-4 py-3 hidden sm:table-cell">
      <div className="text-sm text-gray-700 dark:text-gray-300">{app.phone}</div>
    </td>
    <td className="px-4 py-3">
      <Badge color={STATUS_COLORS[app.status]} className="w-fit">
        {STATUS_LABELS[app.status]}
      </Badge>
    </td>
    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 hidden lg:table-cell">
      {fmt(app.createdAt)}
    </td>
    <td className="px-4 py-3">
      <div className="flex items-center gap-1">
        <button
          onClick={onView}
          className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
          title="View"
        >
          <HiEye className="h-4 w-4" />
        </button>
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors"
          title="Edit / Change Status"
        >
          <HiPencil className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors"
          title="Delete"
        >
          <HiTrash className="h-4 w-4" />
        </button>
      </div>
    </td>
  </tr>
)

// ─── Page ─────────────────────────────────────────────────────────────────────

const ApplicationsPage: FC = () => {
  const { applications, loading, pagination, fetchApplications } = useApplicationStore()
  const { careers, fetchCareers } = useCareerStore()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "">("")
  const [jobFilter, setJobFilter] = useState("")
  const [page, setPage] = useState(1)
  const LIMIT = 15

  const [viewTarget, setViewTarget] = useState<Application | null>(null)
  const [editTarget, setEditTarget] = useState<Application | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Application | null>(null)

  useEffect(() => {
    fetchCareers()
  }, [fetchCareers])

  useEffect(() => {
    fetchApplications({
      page,
      limit: LIMIT,
      status: statusFilter || undefined,
      jobPostingId: jobFilter || undefined,
      email: search.includes("@") ? search : undefined,
    })
  }, [page, statusFilter, jobFilter])

  // client-side name/email filter for fast UX
  const filtered = applications.filter((a) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      a.name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.phone.includes(q)
    )
  })

  const handleSearch = () => {
    setPage(1)
    fetchApplications({
      page: 1,
      limit: LIMIT,
      status: statusFilter || undefined,
      jobPostingId: jobFilter || undefined,
      email: search.includes("@") ? search : undefined,
    })
  }

  return (
    <NavbarSidebarLayout>
      <div className="px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <HiClipboardList className="h-6 w-6 text-primary-500" />
            Career Applications
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Review and manage all job applications
          </p>
        </div>

        <Card>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-5 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <HiSearch className="h-4 w-4 text-gray-400" />
              </div>
              <TextInput
                placeholder="Search name, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9"
              />
            </div>

            {/* Status filter */}
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as ApplicationStatus | "")
                setPage(1)
              }}
              className="min-w-[140px]"
            >
              <option value="">All Statuses</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </Select>

            {/* Job posting filter */}
            <Select
              value={jobFilter}
              onChange={(e) => {
                setJobFilter(e.target.value)
                setPage(1)
              }}
              className="min-w-[180px]"
            >
              <option value="">All Positions</option>
              {careers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </Select>

            <Button onClick={handleSearch} className="bg-primary-500 hover:bg-primary-600 shrink-0">
              <HiFilter className="mr-1.5 h-4 w-4" />
              Apply Filters
            </Button>
          </div>

          {/* Summary badges */}
          {!loading && applications.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {ALL_STATUSES.map((s) => {
                const count = applications.filter((a) => a.status === s).length
                if (count === 0) return null
                return (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer select-none"
                    style={{ backgroundColor: "var(--tw-badge-bg)" }}
                    onClick={() => {
                      setStatusFilter(statusFilter === s ? "" : s)
                      setPage(1)
                    }}
                  >
                    <Badge color={STATUS_COLORS[s]}>{STATUS_LABELS[s]}: {count}</Badge>
                  </span>
                )
              })}
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spinner size="xl" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <HiClipboardList className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                No applications found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-3">Applicant</th>
                    <th className="px-4 py-3 hidden md:table-cell">Position</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Phone</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 hidden lg:table-cell">Applied On</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((app) => (
                    <AppRow
                      key={app._id}
                      app={app}
                      onView={() => setViewTarget(app)}
                      onEdit={() => setEditTarget(app)}
                      onDelete={() => setDeleteTarget(app)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page {pagination.page} of {pagination.totalPages} &middot; {pagination.total} total
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  color="gray"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <HiChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  color="gray"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <HiChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {viewTarget && <ViewModal app={viewTarget} onClose={() => setViewTarget(null)} />}
      {editTarget && <EditModal app={editTarget} onClose={() => setEditTarget(null)} />}
      {deleteTarget && <DeleteModal app={deleteTarget} onClose={() => setDeleteTarget(null)} />}
    </NavbarSidebarLayout>
  )
}

export default ApplicationsPage
