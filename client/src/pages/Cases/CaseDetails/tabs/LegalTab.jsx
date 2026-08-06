import React, { useEffect, useState } from 'react'
import {
  Scale, User, Phone, Mail, Hash, Calendar, Landmark, MessageSquare,
  Pencil, Check, X,
} from 'lucide-react'
import Button from '../../../../components/Button.jsx'
import Input from '../../../../components/Input.jsx'
import Select from '../../../../components/Select.jsx'
import { getLegal, saveLegal } from '../../services/caseWizardService.js'

const COMPENSATION_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'PAID', label: 'Paid' },
]

const STATUS_STYLES = {
  PENDING: 'bg-amber-50 text-amber-600 ring-amber-100',
  PROCESSING: 'bg-sky-50 text-sky-600 ring-sky-100',
  APPROVED: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
  REJECTED: 'bg-red-50 text-red-600 ring-red-100',
  PAID: 'bg-purple-50 text-purple-600 ring-purple-100',
}

const EMPTY_FORM = {
  advocateName: '', advocateMobile: '', advocateEmail: '', mvcNumber: '',
  mvcFiledDate: '', courtName: '', compensationStatus: 'PENDING', remarks: '',
}

function optionLabel(options, value) {
  return options.find((o) => o.value === value)?.label || value
}

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function StatBlock({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className={`font-mono text-sm font-semibold ${value ? 'text-slate-800' : 'text-slate-300'}`}>
          {value || '—'}
        </p>
      </div>
    </div>
  )
}

function StatBadge({ icon: Icon, label, value, styleClass }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <span className={`mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${styleClass}`}>
          {value}
        </span>
      </div>
    </div>
  )
}

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

export default function LegalTab({ caseId, refetch }) {
  const buildForm = (data) => ({
    advocateName: data.advocateName || '',
    advocateMobile: data.advocateMobile || '',
    advocateEmail: data.advocateEmail || '',
    mvcNumber: data.mvcNumber || '',
    mvcFiledDate: data.mvcFiledDate?.slice(0, 10) || '',
    courtName: data.courtName || '',
    compensationStatus: data.compensationStatus || 'PENDING',
    remarks: data.remarks || '',
  })

  const [legal, setLegal] = useState({})
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    getLegal(caseId)
      .then((data) => {
        setLegal(data || {})
        setForm(buildForm(data || {}))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [caseId])

  useEffect(() => {
    if (!saved) return
    const t = setTimeout(() => setSaved(false), 3000)
    return () => clearTimeout(t)
  }, [saved])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleCancel = () => {
    setForm(buildForm(legal))
    setErrors({})
    setEditing(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await saveLegal(caseId, form)
      setLegal(updated || { ...legal, ...form })
      setSaved(true)
      setEditing(false)
      refetch?.()
    } catch (err) {
      setErrors({ _form: err?.response?.data?.message || 'Failed to save. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="card p-6"><p className="text-sm text-slate-400">Loading legal details...</p></div>
  }

  if (!editing) {
    const statusLabel = optionLabel(COMPENSATION_STATUS_OPTIONS, legal.compensationStatus)

    return (
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border bg-slate-50/60 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Scale size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">Legal / MVC Details</h3>
              <p className="text-xs text-slate-400">Advocate, court, and compensation tracking</p>
            </div>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:border-primary hover:text-primary"
          >
            <Pencil size={13} /> Edit
          </button>
        </div>

        {saved && (
          <div className="mx-4 mt-4 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 sm:mx-6">
            Saved successfully.
          </div>
        )}

        <div className="px-4 py-4 sm:px-6 sm:py-5">
          <div className="grid grid-cols-2 gap-y-4 border-b border-dashed border-border pb-5 sm:grid-cols-4">
            <StatBlock icon={Hash} label="MVC Number" value={legal.mvcNumber} />
            <StatBlock icon={Calendar} label="MVC Filed" value={formatDate(legal.mvcFiledDate)} />
            <StatBlock icon={Landmark} label="Court" value={legal.courtName} />
            <StatBadge
              icon={Scale}
              label="Compensation"
              value={statusLabel}
              styleClass={STATUS_STYLES[legal.compensationStatus] || STATUS_STYLES.PENDING}
            />
          </div>

          <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
            <div className="divide-y divide-border sm:border-r sm:border-border sm:pr-8">
              <FieldRow icon={User} label="Advocate Name" value={legal.advocateName} />
              <FieldRow icon={Phone} label="Advocate Mobile" value={legal.advocateMobile} />
            </div>
            <div className="divide-y divide-border sm:pl-8">
              <FieldRow icon={Mail} label="Advocate Email" value={legal.advocateEmail} />
            </div>
          </div>

          {legal.remarks && (
            <div className="mt-3 border-t border-border pt-4">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                <MessageSquare size={12} /> Remarks
              </p>
              <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600">
                {legal.remarks}
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="card p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-800">Edit Legal / MVC Details</h3>
        <p className="text-sm text-slate-400">Advocate, court, and compensation tracking for this case.</p>
      </div>

      {errors._form && <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-danger">{errors._form}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Advocate Name" name="advocateName" value={form.advocateName} onChange={handleChange} />
        <Input label="Advocate Mobile" name="advocateMobile" value={form.advocateMobile} onChange={handleChange} />
        <Input label="Advocate Email" name="advocateEmail" type="email" value={form.advocateEmail} onChange={handleChange} />
        <Input label="Court Name" name="courtName" value={form.courtName} onChange={handleChange} />
        <Input label="MVC Number" name="mvcNumber" value={form.mvcNumber} onChange={handleChange} />
        <Input label="MVC Filed Date" name="mvcFiledDate" type="date" value={form.mvcFiledDate} onChange={handleChange} />
        <Select label="Compensation Status" name="compensationStatus" options={COMPENSATION_STATUS_OPTIONS} value={form.compensationStatus} onChange={handleChange} />
        <Input label="Remarks" name="remarks" className="sm:col-span-2" value={form.remarks} onChange={handleChange} />
      </div>

      <div className="mt-5 flex items-center gap-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : (<span className="flex items-center gap-1.5"><Check size={15} /> Save Changes</span>)}
        </Button>
        <button
          onClick={handleCancel}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          <X size={15} /> Cancel
        </button>
      </div>
    </div>
  )
}