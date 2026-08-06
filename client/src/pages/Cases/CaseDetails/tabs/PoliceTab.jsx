import React, { useEffect, useState } from 'react'
import {
  FileText, Calendar, Hash, Shield, UserCheck, Activity, ShieldCheck,
  MessageSquare, Pencil, Check, X,
} from 'lucide-react'
import Button from '../../../../components/Button.jsx'
import Input from '../../../../components/Input.jsx'
import Select from '../../../../components/Select.jsx'
import { getPolice, savePolice } from '../../services/caseWizardService.js'

const YES_NO_OPTIONS = [
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
]

const EMPTY_FORM = {
  firNumber: '', firDate: '', crimeNumber: '', policeStation: '',
  investigatingOfficer: '', investigationStatus: '', chargeSheetFiled: 'false', remarks: '',
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

export default function PoliceTab({ caseId }) {
  const buildForm = (data) => ({
    firNumber: data.firNumber || '',
    firDate: data.firDate?.slice(0, 10) || '',
    crimeNumber: data.crimeNumber || '',
    policeStation: data.policeStation || '',
    investigatingOfficer: data.investigatingOfficer || '',
    investigationStatus: data.investigationStatus || '',
    chargeSheetFiled: String(!!data.chargeSheetFiled),
    remarks: data.remarks || '',
  })

  const [police, setPolice] = useState({})
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    getPolice(caseId)
      .then((data) => {
        setPolice(data || {})
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

  const validate = () => {
    const nextErrors = {}
    if (!form.firNumber) nextErrors.firNumber = 'FIR number is required.'
    if (!form.policeStation) nextErrors.policeStation = 'Police station is required.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleCancel = () => {
    setForm(buildForm(police))
    setErrors({})
    setEditing(false)
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const updated = await savePolice(caseId, { ...form, chargeSheetFiled: form.chargeSheetFiled === 'true' })
      setPolice(updated || { ...police, ...form, chargeSheetFiled: form.chargeSheetFiled === 'true' })
      setSaved(true)
      setEditing(false)
    } catch (err) {
      setErrors({ _form: err?.response?.data?.message || 'Failed to save. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="card p-6"><p className="text-sm text-slate-400">Loading police details...</p></div>
  }

  if (!editing) {
    return (
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border bg-slate-50/60 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">Police Details</h3>
              <p className="text-xs text-slate-400">FIR and investigation information for this case</p>
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
            <StatBlock icon={FileText} label="FIR Number" value={police.firNumber} />
            <StatBlock icon={Calendar} label="FIR Date" value={formatDate(police.firDate)} />
            <StatBlock icon={Hash} label="Crime Number" value={police.crimeNumber} />
            <StatBadge
              icon={ShieldCheck}
              label="Charge Sheet"
              value={police.chargeSheetFiled ? 'Filed' : 'Not Filed'}
              styleClass={police.chargeSheetFiled ? 'bg-emerald-50 text-emerald-600 ring-emerald-100' : 'bg-slate-100 text-slate-500 ring-slate-200'}
            />
          </div>

          <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
            <div className="divide-y divide-border sm:border-r sm:border-border sm:pr-8">
              <FieldRow icon={Shield} label="Police Station" value={police.policeStation} />
              <FieldRow icon={UserCheck} label="Investigating Officer" value={police.investigatingOfficer} />
            </div>
            <div className="divide-y divide-border sm:pl-8">
              <FieldRow icon={Activity} label="Investigation Status" value={police.investigationStatus} />
            </div>
          </div>

          {police.remarks && (
            <div className="mt-3 border-t border-border pt-4">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                <MessageSquare size={12} /> Remarks
              </p>
              <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600">
                {police.remarks}
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
        <h3 className="text-base font-semibold text-slate-800">Edit Police Details</h3>
        <p className="text-sm text-slate-400">FIR and investigation information for this case.</p>
      </div>

      {errors._form && <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-danger">{errors._form}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="FIR Number *" name="firNumber" value={form.firNumber} onChange={handleChange} error={errors.firNumber} />
        <Input label="FIR Date" name="firDate" type="date" value={form.firDate} onChange={handleChange} />
        <Input label="Crime Number" name="crimeNumber" value={form.crimeNumber} onChange={handleChange} />
        <Input label="Police Station *" name="policeStation" value={form.policeStation} onChange={handleChange} error={errors.policeStation} />
        <Input label="Investigating Officer" name="investigatingOfficer" value={form.investigatingOfficer} onChange={handleChange} />
        <Input label="Investigation Status" name="investigationStatus" value={form.investigationStatus} onChange={handleChange} />
        <Select label="Charge Sheet Filed" name="chargeSheetFiled" options={YES_NO_OPTIONS} value={form.chargeSheetFiled} onChange={handleChange} />
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