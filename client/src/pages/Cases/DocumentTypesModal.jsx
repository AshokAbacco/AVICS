// client/src/pages/Cases/DocumentTypesModal.jsx
import React, { useEffect, useState } from 'react'
import { FileStack, Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import Modal from '../../components/Modal.jsx'
import Button from '../../components/Button.jsx'
import Input from '../../components/Input.jsx'
import {
  getDocumentTypes, createDocumentType, updateDocumentType, deleteDocumentType,
} from './services/documentTypeService.js'

const CATEGORY_OPTIONS = [
  { value: 'CASE', label: 'Case-Level' },
  { value: 'VICTIM', label: 'Victim' },
  { value: 'VEHICLE', label: 'Vehicle' },
]

const CATEGORY_STYLES = {
  CASE: 'bg-slate-100 text-slate-600 ring-slate-200',
  VICTIM: 'bg-sky-50 text-sky-600 ring-sky-100',
  VEHICLE: 'bg-amber-50 text-amber-600 ring-amber-100',
}

const EMPTY_FORM = { name: '', category: 'CASE', description: '', isMandatory: false }

export default function DocumentTypesModal({ isOpen, onClose }) {
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    setListError('')
    getDocumentTypes()
      .then(setTypes)
      .catch((err) => setListError(err?.response?.data?.message || 'Failed to load document types.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (isOpen) load()
    else { setFormOpen(false); setEditingId(null) }
  }, [isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const openAddForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setErrors({})
    setFormOpen(true)
  }

  const openEditForm = (type) => {
    setEditingId(type.id)
    setErrors({})
    setForm({
      name: type.name || '',
      category: type.category || 'CASE',
      description: type.description || '',
      isMandatory: !!type.isMandatory,
    })
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingId(null)
    setErrors({})
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Document name is required.'
    if (!form.category) nextErrors.category = 'Checklist is required.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    const payload = { ...form, name: form.name.trim(), isMandatory: !!form.isMandatory }
    try {
      if (editingId) {
        await updateDocumentType(editingId, payload)
      } else {
        await createDocumentType(payload)
      }
      closeForm()
      load()
    } catch (err) {
      setErrors({ _form: err?.response?.data?.message || 'Failed to save document type.' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (type) => {
    if (!window.confirm(`Delete document type "${type.name}"? This cannot be undone.`)) return
    try {
      await deleteDocumentType(type.id)
      load()
    } catch (err) {
      window.alert(err?.response?.data?.message || 'Failed to delete document type.')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Document Types"
      footer={<Button variant="outline" onClick={onClose}>Close</Button>}
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-500">
          Manage the master checklist of document names required per case, victim, and vehicle.
        </p>

        {/* Add / Edit form */}
        {formOpen ? (
          <div className="rounded-xl border border-border bg-slate-50/60 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-700">{editingId ? 'Edit Document Type' : 'Add Document Type'}</h4>
              <button onClick={closeForm} disabled={saving} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            {errors._form && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-danger">{errors._form}</div>}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="Document Name *" name="name" value={form.name} onChange={handleChange} error={errors.name} />
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-600">Checklist *</span>
                <select className="input-base" name="category" value={form.category} onChange={handleChange}>
                  {CATEGORY_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-2 sm:col-span-2">
                <input type="checkbox" checked={form.isMandatory} onChange={(e) => setForm((p) => ({ ...p, isMandatory: e.target.checked }))} />
                <span className="text-sm font-medium text-slate-600">Required document</span>
              </label>
              <Input label="Description" name="description" className="sm:col-span-2" value={form.description} onChange={handleChange} />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : (<span className="flex items-center gap-1.5"><Check size={14} /> {editingId ? 'Save Changes' : 'Add Type'}</span>)}
              </Button>
              <button onClick={closeForm} disabled={saving} className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={openAddForm}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:border-primary hover:text-primary"
          >
            <Plus size={13} /> Add Document Type
          </button>
        )}

        {/* List */}
        {loading ? (
          <p className="py-6 text-center text-sm text-slate-400">Loading document types...</p>
        ) : listError ? (
          <p className="py-6 text-center text-sm text-danger">{listError}</p>
        ) : types.length === 0 ? (
          <p className="py-6 text-center text-sm italic text-slate-300">No document types yet. Add one above.</p>
        ) : (
          <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
            {types.map((type) => (
              <div
                key={type.id}
                className={`flex items-start justify-between gap-3 rounded-xl border px-3 py-2.5 ${
                  editingId === type.id && formOpen ? 'border-primary/40 bg-primary/5' : 'border-border'
                }`}
              >
                <div className="flex min-w-0 items-start gap-2.5">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400 ring-1 ring-slate-100">
                    <FileStack size={14} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-sm font-medium text-slate-800">{type.name}</p>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${CATEGORY_STYLES[type.category] || CATEGORY_STYLES.CASE}`}>
                        {CATEGORY_OPTIONS.find((c) => c.value === type.category)?.label || type.category}
                      </span>
                      {type.isMandatory && (
                        <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-danger ring-1 ring-red-100">
                          Required
                        </span>
                      )}
                    </div>
                    {type.description && <p className="mt-0.5 text-xs text-slate-400">{type.description}</p>}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button onClick={() => openEditForm(type)} className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-600"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(type)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-danger"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}