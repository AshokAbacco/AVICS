import React, { useEffect, useState } from 'react'
import {
  Calendar, Clock, Car, Cloud, Building2, Landmark, MapPin, Shield, Map,
  FileText, Pencil, Check, X,
} from 'lucide-react'
import Button from '../../../../components/Button.jsx'
import Input from '../../../../components/Input.jsx'
import Select from '../../../../components/Select.jsx'
import { updateAccident } from '../../services/caseWizardService.js'

const ACCIDENT_TYPE_OPTIONS = [
  { value: 'COLLISION', label: 'Collision' },
  { value: 'SELF_ACCIDENT', label: 'Self Accident' },
  { value: 'HIT_AND_RUN', label: 'Hit and Run' },
  { value: 'PEDESTRIAN', label: 'Pedestrian' },
  { value: 'VEHICLE_FIRE', label: 'Vehicle Fire' },
  { value: 'OVERTURN', label: 'Overturn' },
  { value: 'OTHER', label: 'Other' },
]

const WEATHER_OPTIONS = [
  { value: 'CLEAR', label: 'Clear' },
  { value: 'RAIN', label: 'Rain' },
  { value: 'FOG', label: 'Fog' },
  { value: 'STORM', label: 'Storm' },
  { value: 'CLOUDY', label: 'Cloudy' },
  { value: 'OTHER', label: 'Other' },
]

// Pill colors per value, kept subtle (tinted bg + matching text + ring)
const ACCIDENT_TYPE_STYLES = {
  COLLISION: 'bg-red-50 text-red-600 ring-red-100',
  SELF_ACCIDENT: 'bg-amber-50 text-amber-600 ring-amber-100',
  HIT_AND_RUN: 'bg-rose-50 text-rose-600 ring-rose-100',
  PEDESTRIAN: 'bg-orange-50 text-orange-600 ring-orange-100',
  VEHICLE_FIRE: 'bg-red-50 text-red-700 ring-red-100',
  OVERTURN: 'bg-purple-50 text-purple-600 ring-purple-100',
  OTHER: 'bg-slate-100 text-slate-600 ring-slate-200',
}

const WEATHER_STYLES = {
  CLEAR: 'bg-sky-50 text-sky-600 ring-sky-100',
  RAIN: 'bg-blue-50 text-blue-600 ring-blue-100',
  FOG: 'bg-slate-100 text-slate-500 ring-slate-200',
  STORM: 'bg-indigo-50 text-indigo-600 ring-indigo-100',
  CLOUDY: 'bg-gray-100 text-gray-600 ring-gray-200',
  OTHER: 'bg-slate-100 text-slate-600 ring-slate-200',
}

function optionLabel(options, value) {
  return options.find((o) => o.value === value)?.label || null
}

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatTime(t) {
  if (!t) return null
  const [h, m] = t.split(':')
  if (h === undefined) return t
  const hour = parseInt(h, 10)
  const period = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 === 0 ? 12 : hour % 12
  return `${hour12}:${m} ${period}`
}

/** Small top-row stat: an icon, a label, and a plain value (date / time). */
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

/** Small top-row stat rendered as a colored pill instead of plain text. */
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

/** A labelled field in the detail grid, with icon chip. */
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

export default function AccidentTab({ caseId, caseData, refetch }) {
  const accident = caseData.accident || {}

  const buildForm = () => ({
    accidentDate: accident.accidentDate?.slice(0, 10) || '',
    accidentTime: accident.accidentTime || '',
    district: accident.district || '',
    village: accident.village || '',
    taluk: accident.taluk || '',
    policeStation: accident.policeStation || '',
    location: accident.location || '',
    accidentType: accident.accidentType || '',
    weatherCondition: accident.weatherCondition || '',
    description: accident.description || '',
  })

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(buildForm)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Keep the view in sync if the parent case data refreshes.
  useEffect(() => {
    if (!editing) setForm(buildForm())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseData])

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
    setForm(buildForm())
    setErrors({})
    setEditing(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateAccident(caseId, form)
      setSaved(true)
      setEditing(false)
      refetch()
    } catch (err) {
      setErrors({ _form: err?.response?.data?.message || 'Failed to save. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const typeLabel = optionLabel(ACCIDENT_TYPE_OPTIONS, accident.accidentType)
  const weatherLabel = optionLabel(WEATHER_OPTIONS, accident.weatherCondition)

  // ---------------------------------------------------------------------
  // VIEW MODE — the default, read-first presentation of saved data.
  // ---------------------------------------------------------------------
  if (!editing) {
    return (
      <div className="card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-border bg-slate-50/60 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Car size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">Accident Details</h3>
              <p className="text-xs text-slate-400">Where and when the accident occurred</p>
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
          {/* Hero stat strip: date, time, type, weather */}
          <div className="grid grid-cols-2 gap-y-4 border-b border-dashed border-border pb-5 sm:grid-cols-4">
            <StatBlock icon={Calendar} label="Date" value={formatDate(accident.accidentDate)} />
            <StatBlock icon={Clock} label="Time" value={formatTime(accident.accidentTime)} />
            <StatBadge icon={Car} label="Type" value={typeLabel} styleClass={ACCIDENT_TYPE_STYLES[accident.accidentType] || ACCIDENT_TYPE_STYLES.OTHER} />
            <StatBadge icon={Cloud} label="Weather" value={weatherLabel} styleClass={WEATHER_STYLES[accident.weatherCondition] || WEATHER_STYLES.OTHER} />
          </div>

          {/* Location detail grid */}
          <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
            <div className="divide-y divide-border sm:border-r sm:border-border sm:pr-8">
              <FieldRow icon={Building2} label="District" value={accident.district} />
              <FieldRow icon={Landmark} label="Taluk" value={accident.taluk} />
            </div>
            <div className="divide-y divide-border sm:pl-8">
              <FieldRow icon={MapPin} label="Village / Town" value={accident.village} />
              <FieldRow icon={Shield} label="Police Station" value={accident.policeStation} />
            </div>
          </div>
          <div className="border-t border-border">
            <FieldRow icon={Map} label="Exact Location" value={accident.location} />
          </div>

          {/* Narrative */}
          {accident.description && (
            <div className="mt-3 border-t border-border pt-4">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                <FileText size={12} /> Narrative
              </p>
              <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600">
                {accident.description}
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------
  // EDIT MODE — same fields, presented as an editable form.
  // ---------------------------------------------------------------------
  return (
    <div className="card p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Edit Accident Details</h3>
          <p className="text-sm text-slate-400">Basic information about where and when the accident occurred.</p>
        </div>
      </div>

      {errors._form && <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-danger">{errors._form}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Accident Date" name="accidentDate" type="date" value={form.accidentDate} onChange={handleChange} />
        <Input label="Approx. Time" name="accidentTime" type="time" value={form.accidentTime} onChange={handleChange} />
        <Input label="District" name="district" value={form.district} onChange={handleChange} />
        <Input label="Village / Town" name="village" value={form.village} onChange={handleChange} />
        <Input label="Police Station" name="policeStation" value={form.policeStation} onChange={handleChange} />
        <Input label="Taluk" name="taluk" value={form.taluk} onChange={handleChange} />
        <Select label="Accident Type" name="accidentType" options={ACCIDENT_TYPE_OPTIONS} value={form.accidentType} onChange={handleChange} />
        <Select label="Weather Condition" name="weatherCondition" options={WEATHER_OPTIONS} value={form.weatherCondition} onChange={handleChange} />
        <Input label="Exact Location" name="location" className="sm:col-span-2" value={form.location} onChange={handleChange} />
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