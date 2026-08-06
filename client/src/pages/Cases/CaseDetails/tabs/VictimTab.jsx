import React, { useEffect, useState } from 'react'
import {
  UserPlus, User, Cake, Users2, Phone, CreditCard, MapPin,
  X, Pencil, Trash2, Check,
} from 'lucide-react'
import Button from '../../../../components/Button.jsx'
import Input from '../../../../components/Input.jsx'
import Select from '../../../../components/Select.jsx'
import { listVictims, createVictim, updateVictim, deleteVictim } from '../../services/caseWizardService.js'

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
]

const GENDER_STYLES = {
  MALE: 'bg-sky-50 text-sky-600 ring-sky-100',
  FEMALE: 'bg-pink-50 text-pink-600 ring-pink-100',
  OTHER: 'bg-slate-100 text-slate-600 ring-slate-200',
}

const EMPTY_FORM = {
  name: '', guardianRelation: '', guardianName: '', age: '', gender: '',
  mobile: '', aadhaarNumber: '', address: '',
}

function initials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')
}

/** Small stat with an icon chip, used in the per-victim header strip. */
function StatBlock({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className={`truncate text-sm font-semibold ${value ? 'text-slate-800' : 'text-slate-300'}`}>
          {value || '—'}
        </p>
      </div>
    </div>
  )
}

/** Small stat rendered as a colored pill instead of plain text (gender). */
function StatBadge({ icon: Icon, label, value, styleClass }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
        {value ? (
          <span className={`mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${styleClass}`}>
            {value}
          </span>
        ) : (
          <p className="text-sm font-semibold text-slate-300">—</p>
        )}
      </div>
    </div>
  )
}

/** A labelled field in the detail grid, with icon chip — same language as AccidentTab. */
function FieldRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400 ring-1 ring-slate-100">
        <Icon size={15} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className={`mt-0.5 text-sm font-medium ${value ? 'text-slate-800' : 'italic text-slate-300'}`}>
          {value || 'Not recorded'}
        </p>
      </div>
    </div>
  )
}

export default function VictimTab({ caseId, refetch }) {
  const [victims, setVictims] = useState([])
  const [loading, setLoading] = useState(true)

  // Form is hidden until "Add Victim" or a card's edit icon is clicked.
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const loadVictims = () => {
    setLoading(true)
    listVictims(caseId).then(setVictims).catch(() => setVictims([])).finally(() => setLoading(false))
  }

  useEffect(() => { loadVictims() }, [caseId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.name) nextErrors.name = 'Victim name is required.'
    if (!form.age || isNaN(Number(form.age))) nextErrors.age = 'A valid age is required.'
    if (!form.gender) nextErrors.gender = 'Gender is required.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const openAddForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setErrors({})
    setFormOpen(true)
  }

  const openEditForm = (victim) => {
    setEditingId(victim.id)
    setErrors({})
    setForm({
      name: victim.name || '',
      guardianRelation: victim.guardianRelation || '',
      guardianName: victim.guardianName || '',
      age: victim.age ?? '',
      gender: victim.gender || '',
      mobile: victim.mobile || '',
      aadhaarNumber: victim.aadhaarNumber || '',
      address: victim.address || '',
    })
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingId(null)
    setErrors({})
  }

  const handleAddOrUpdate = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      if (editingId) {
        await updateVictim(caseId, editingId, form)
      } else {
        await createVictim(caseId, form)
      }
      closeForm()
      loadVictims()
      refetch?.()
    } catch (err) {
      setErrors({ _form: err?.response?.data?.message || 'Something went wrong. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (victimId) => {
    if (!window.confirm('Remove this victim from the case?')) return
    try {
      await deleteVictim(caseId, victimId)
      loadVictims()
      refetch?.()
    } catch (err) {
      window.alert(err?.response?.data?.message || 'Failed to remove victim.')
    }
  }

  return (
    <>
      {/* Add / Edit form — hidden until requested */}
      {formOpen && (
        <div className="card mb-4 overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-border bg-slate-50/60 px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UserPlus size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800">{editingId ? 'Edit Victim' : 'Add Victim'}</h3>
                <p className="text-xs text-slate-400">Personal and contact details for this victim</p>
              </div>
            </div>
            <button
              onClick={closeForm}
              disabled={saving}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              <X size={13} /> Cancel
            </button>
          </div>

          <div className="px-4 py-4 sm:px-6 sm:py-5">
            {errors._form && <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-danger">{errors._form}</div>}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Victim Name *" name="name" value={form.name} onChange={handleChange} error={errors.name} />
              <Input label="Age *" name="age" type="number" value={form.age} onChange={handleChange} error={errors.age} />
              <Select label="Gender *" name="gender" value={form.gender} onChange={handleChange} options={GENDER_OPTIONS} error={errors.gender} />
              <Input label="Guardian Relation" name="guardianRelation" value={form.guardianRelation} onChange={handleChange} />
              <Input label="Guardian Name" name="guardianName" value={form.guardianName} onChange={handleChange} />
              <Input label="Mobile Number" name="mobile" value={form.mobile} onChange={handleChange} />
              <Input label="Aadhaar Number" name="aadhaarNumber" value={form.aadhaarNumber} onChange={handleChange} />
              <Input label="Address" name="address" className="sm:col-span-2" value={form.address} onChange={handleChange} />
            </div>

            <div className="mt-5 flex items-center gap-2">
              <Button onClick={handleAddOrUpdate} disabled={saving}>
                {saving ? 'Saving...' : (
                  <span className="flex items-center gap-1.5">
                    <Check size={15} /> {editingId ? 'Save Changes' : 'Add Victim'}
                  </span>
                )}
              </Button>
              <button
                onClick={closeForm}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                <X size={15} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List header / Add button */}
      <div className="mb-4 flex items-center justify-between gap-3 px-1">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Victims</h3>
          <p className="text-xs text-slate-400">
            {loading ? 'Loading...' : `${victims.length} ${victims.length === 1 ? 'person' : 'people'} recorded on this case`}
          </p>
        </div>
        {!formOpen && (
          <button
            onClick={openAddForm}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:border-primary hover:text-primary"
          >
            <UserPlus size={13} /> Add Victim
          </button>
        )}
      </div>

      {loading ? (
        <div className="card p-6"><p className="text-sm text-slate-400">Loading victims...</p></div>
      ) : victims.length === 0 ? (
        <div className="card p-6"><p className="text-sm italic text-slate-300">No victims added yet.</p></div>
      ) : (
        <div className="space-y-4">
          {victims.map((v) => (
            <div key={v.id} className="card overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between gap-3 border-b border-border bg-slate-50/60 px-4 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {initials(v.name)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-800">{v.name}</h3>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${GENDER_STYLES[v.gender] || GENDER_STYLES.OTHER}`}>
                        {v.gender || '—'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {v.guardianName ? `${v.guardianRelation ? v.guardianRelation + ' of' : 'Guardian:'} ${v.guardianName}` : 'Victim details'}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => openEditForm(v)}
                    className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:border-primary hover:text-primary"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button onClick={() => handleDelete(v.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-danger"><Trash2 size={16} /></button>
                </div>
              </div>

              <div className="px-4 py-4 sm:px-6 sm:py-5">
                {/* Stat strip */}
                <div className="grid grid-cols-2 gap-y-4 border-b border-dashed border-border pb-5 sm:grid-cols-4">
                  <StatBlock icon={Cake} label="Age" value={v.age ? `${v.age} yrs` : null} />
                  <StatBadge icon={User} label="Gender" value={v.gender} styleClass={GENDER_STYLES[v.gender] || GENDER_STYLES.OTHER} />
                  <StatBlock icon={Phone} label="Mobile" value={v.mobile} />
                  <StatBlock icon={CreditCard} label="Aadhaar" value={v.aadhaarNumber} />
                </div>

                {/* Detail fields */}
                <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                  <div className="divide-y divide-border sm:border-r sm:border-border sm:pr-8">
                    <FieldRow icon={Users2} label="Guardian Relation" value={v.guardianRelation} />
                    <FieldRow icon={User} label="Guardian Name" value={v.guardianName} />
                  </div>
                  <div className="divide-y divide-border sm:pl-8">
                    <FieldRow icon={MapPin} label="Address" value={v.address} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}