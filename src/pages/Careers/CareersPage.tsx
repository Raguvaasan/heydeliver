import { FC, useEffect, useState } from "react"
import { Button, Card, Badge, TextInput, Spinner, Modal, Label } from "flowbite-react"
import {
  HiSearch,
  HiPlus,
  HiPencil,
  HiTrash,
  HiX,
  HiBriefcase,
  HiAcademicCap,
  HiClock,
} from "react-icons/hi"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { useCareerStore, Career, CareerPayload } from "../../store/careerStore"

// ─── helpers ────────────────────────────────────────────────────────────────

const emptyForm = (): CareerPayload => ({
  title: "",
  experience: "",
  qualification: "",
  shortDesc: "",
  description: [],
  skills: [],
})

/** Convert a newline-separated string ↔ string[] */
const linesToArray = (s: string) =>
  s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)

const arrayToLines = (arr: string[]) => arr.join("\n")

// ─── Form modal ─────────────────────────────────────────────────────────────

interface CareerFormModalProps {
  isOpen: boolean
  onClose: () => void
  initial?: Career | null
}

const CareerFormModal: FC<CareerFormModalProps> = ({ isOpen, onClose, initial }) => {
  const { createCareer, updateCareer } = useCareerStore()
  const isEdit = Boolean(initial)

  const [form, setForm] = useState<CareerPayload>(emptyForm())
  const [descText, setDescText] = useState("")
  const [skillText, setSkillText] = useState("")
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof CareerPayload, string>>>({})

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title,
        experience: initial.experience,
        qualification: initial.qualification,
        shortDesc: initial.shortDesc,
        description: initial.description,
        skills: initial.skills,
      })
      setDescText(arrayToLines(initial.description))
      setSkillText(arrayToLines(initial.skills))
    } else {
      setForm(emptyForm())
      setDescText("")
      setSkillText("")
    }
    setErrors({})
  }, [initial, isOpen])

  const validate = () => {
    const e: typeof errors = {}
    if (!form.title.trim()) e.title = "Title is required"
    if (!form.experience.trim()) e.experience = "Experience is required"
    if (!form.qualification.trim()) e.qualification = "Qualification is required"
    if (!form.shortDesc.trim()) e.shortDesc = "Short description is required"
    if (!descText.trim()) e.description = "At least one responsibility is required"
    if (!skillText.trim()) e.skills = "At least one skill is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const payload: CareerPayload = {
        ...form,
        description: linesToArray(descText),
        skills: linesToArray(skillText),
      }
      if (isEdit && initial) {
        await updateCareer(initial._id, payload)
      } else {
        await createCareer(payload)
      }
      onClose()
    } catch {
      // errors shown via toast in store
    } finally {
      setSaving(false)
    }
  }

  const field = (key: keyof CareerPayload) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
    color: errors[key] ? ("failure" as const) : undefined,
    helperText: errors[key],
  })

  return (
    <Modal show={isOpen} onClose={onClose} size="3xl">
      <Modal.Header>{isEdit ? "Edit Career Posting" : "Add Career Posting"}</Modal.Header>
      <Modal.Body>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div className="md:col-span-2">
            <Label htmlFor="title" value="Job Title *" />
            <TextInput id="title" placeholder="e.g. Delivery Executive" {...field("title")} />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
          </div>

          {/* Experience */}
          <div>
            <Label htmlFor="experience" value="Experience *" />
            <TextInput id="experience" placeholder="e.g. 0-2 Years" {...field("experience")} />
            {errors.experience && (
              <p className="mt-1 text-xs text-red-500">{errors.experience}</p>
            )}
          </div>

          {/* Qualification */}
          <div>
            <Label htmlFor="qualification" value="Qualification *" />
            <TextInput
              id="qualification"
              placeholder="e.g. 10th / 12th Pass"
              {...field("qualification")}
            />
            {errors.qualification && (
              <p className="mt-1 text-xs text-red-500">{errors.qualification}</p>
            )}
          </div>

          {/* Short Description */}
          <div className="md:col-span-2">
            <Label htmlFor="shortDesc" value="Short Description *" />
            <textarea
              id="shortDesc"
              rows={2}
              placeholder="Brief summary of the role"
              value={form.shortDesc}
              onChange={(e) => setForm((f) => ({ ...f, shortDesc: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white resize-none"
            />
            {errors.shortDesc && (
              <p className="mt-1 text-xs text-red-500">{errors.shortDesc}</p>
            )}
          </div>

          {/* Responsibilities */}
          <div className="md:col-span-2">
            <Label htmlFor="description" value="Responsibilities * (one per line)" />
            <textarea
              id="description"
              rows={4}
              placeholder={"Deliver packages on time\nCollect payments from customers"}
              value={descText}
              onChange={(e) => setDescText(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white resize-none"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Skills */}
          <div className="md:col-span-2">
            <Label htmlFor="skills" value="Required Skills * (one per line)" />
            <textarea
              id="skills"
              rows={3}
              placeholder={"Valid Driving License\nBasic smartphone handling"}
              value={skillText}
              onChange={(e) => setSkillText(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white resize-none"
            />
            {errors.skills && (
              <p className="mt-1 text-xs text-red-500">{errors.skills}</p>
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleSubmit} disabled={saving} className="bg-primary-500 hover:bg-primary-600">
          {saving ? <Spinner size="sm" className="mr-2" /> : null}
          {isEdit ? "Save Changes" : "Create Posting"}
        </Button>
        <Button color="gray" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

// ─── Delete confirm modal ────────────────────────────────────────────────────

interface DeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
}

const DeleteConfirmModal: FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm, title }) => (
  <Modal show={isOpen} onClose={onClose} size="md">
    <Modal.Header>Delete Career Posting</Modal.Header>
    <Modal.Body>
      <p className="text-gray-700 dark:text-gray-300">
        Are you sure you want to delete{" "}
        <span className="font-semibold">"{title}"</span>? This action cannot be undone.
      </p>
    </Modal.Body>
    <Modal.Footer>
      <Button color="failure" onClick={onConfirm}>
        Yes, Delete
      </Button>
      <Button color="gray" onClick={onClose}>
        Cancel
      </Button>
    </Modal.Footer>
  </Modal>
)

// ─── Career card ─────────────────────────────────────────────────────────────

interface CareerCardProps {
  career: Career
  onEdit: (c: Career) => void
  onDelete: (c: Career) => void
}

const CareerCard: FC<CareerCardProps> = ({ career, onEdit, onDelete }) => (
  <Card className="h-full">
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
          {career.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
          {career.shortDesc}
        </p>
      </div>
      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => onEdit(career)}
          className="p-1.5 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors"
          title="Edit"
        >
          <HiPencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(career)}
          className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors"
          title="Delete"
        >
          <HiTrash className="h-4 w-4" />
        </button>
      </div>
    </div>

    <div className="flex flex-wrap gap-2 mt-3">
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-xs font-medium text-blue-700 dark:text-blue-300">
        <HiClock className="h-3 w-3" />
        {career.experience}
      </span>
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-50 dark:bg-green-900/30 text-xs font-medium text-green-700 dark:text-green-300">
        <HiAcademicCap className="h-3 w-3" />
        {career.qualification}
      </span>
    </div>

    {career.skills.length > 0 && (
      <div className="mt-3">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Skills</p>
        <div className="flex flex-wrap gap-1.5">
          {career.skills.map((s, i) => (
            <Badge key={i} color="gray" className="text-xs">
              {s}
            </Badge>
          ))}
        </div>
      </div>
    )}

    {career.description.length > 0 && (
      <div className="mt-3">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          Responsibilities
        </p>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5 list-disc list-inside">
          {career.description.slice(0, 3).map((d, i) => (
            <li key={i} className="truncate">
              {d}
            </li>
          ))}
          {career.description.length > 3 && (
            <li className="text-gray-400">+{career.description.length - 3} more</li>
          )}
        </ul>
      </div>
    )}
  </Card>
)

// ─── Page ────────────────────────────────────────────────────────────────────

const CareersPage: FC = () => {
  const { careers, loading, fetchCareers, deleteCareer } = useCareerStore()
  const [search, setSearch] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Career | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Career | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchCareers()
  }, [fetchCareers])

  const filtered = careers.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.shortDesc.toLowerCase().includes(search.toLowerCase()) ||
      c.qualification.toLowerCase().includes(search.toLowerCase())
  )

  const handleEdit = (c: Career) => {
    setEditTarget(c)
    setFormOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteCareer(deleteTarget._id)
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <NavbarSidebarLayout>
      <div className="px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <HiBriefcase className="h-6 w-6 text-primary-500" />
            Career Postings
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage job postings published on the careers page
          </p>
        </div>

        <Card>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div className="relative max-w-sm w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <HiSearch className="h-4 w-4 text-gray-400" />
              </div>
              <TextInput
                placeholder="Search by title, qualification..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              onClick={() => {
                setEditTarget(null)
                setFormOpen(true)
              }}
              className="bg-primary-500 hover:bg-primary-600 shrink-0"
            >
              <HiPlus className="mr-1.5 h-4 w-4" />
              Add Posting
            </Button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spinner size="xl" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <HiBriefcase className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                {search ? "No postings match your search" : "No career postings yet"}
              </p>
              {!search && (
                <Button
                  size="sm"
                  className="mt-4 mx-auto bg-primary-500 hover:bg-primary-600"
                  onClick={() => {
                    setEditTarget(null)
                    setFormOpen(true)
                  }}
                >
                  <HiPlus className="mr-1 h-4 w-4" />
                  Create first posting
                </Button>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {filtered.length} posting{filtered.length !== 1 ? "s" : ""} found
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((career) => (
                  <CareerCard
                    key={career._id}
                    career={career}
                    onEdit={handleEdit}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Create / Edit modal */}
      <CareerFormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditTarget(null)
        }}
        initial={editTarget}
      />

      {/* Delete modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          title={deleteTarget.title}
        />
      )}
    </NavbarSidebarLayout>
  )
}

export default CareersPage
