import React, { useEffect, useState } from 'react'
import {
  HeartPulse, Stethoscope, Hash, Calendar, IndianRupee, User, Skull,
  FileSearch, FileText, MessageSquare, X, Pencil, Check,
} from 'lucide-react'
import Button from '../../../../components/Button.jsx'
import Input from '../../../../components/Input.jsx'
import Select from '../../../../components/Select.jsx'
import { listVictims, listMedical, createMedical, updateMedical } from '../../services/caseWizardService.js'

const YES_NO_OPTIONS = [
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
]

const EMPTY_FORM = {
  hospitalName: '', doctorName: '', mlcNumber: '', admissionDate: '', dischargeDate: '',
  injuryDetails: '', death: 'false', postmortemDone: 'false', treatmentCost: '', remarks: '',
}

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return null
  const num = Number(value)
  if (Number.isNaN(num)) return null
  return `₹${num.toLocaleString('en-IN')}`
}

/** Small stat with an icon chip, used in the per-record header strip. */
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

export default function MedicalTab({ caseId }) {
  const [victims, setVictims] = useState([])
  const [selectedVictimId, setSelectedVictimId] = useState('')
  const [records, setRecords] = useState([])
  const [recordsLoading, setRecordsLoading] = useState(true)

  // Form is hidden until "Add Record" or a card's edit icon is clicked.
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    listVictims(caseId).then((data) => {
      setVictims(data)
      if (data.length > 0) setSelectedVictimId(data[0].id)
    }).catch(() => setVictims([]))
  }, [caseId])

  useEffect(() => {
    if (!selectedVictimId) return
    setRecordsLoading(true)
    listMedical(caseId, selectedVictimId).then(setRecords).catch(() => setRecords([])).finally(() => setRecordsLoading(false))
    closeForm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVictimId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.hospitalName) nextErrors.hospitalName = 'Hospital name is required.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const openAddForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setErrors({})
    setFormOpen(true)
  }

  const openEditForm = (record) => {
    setEditingId(record.id)
    setErrors({})
    setForm({
      hospitalName: record.hospitalName || '',
      doctorName: record.doctorName || '',
      mlcNumber: record.mlcNumber || '',
      admissionDate: record.admissionDate?.slice(0, 10) || '',
      dischargeDate: record.dischargeDate?.slice(0, 10) || '',
      injuryDetails: record.injuryDetails || '',
      death: String(record.death),
      postmortemDone: String(record.postmortemDone),
      treatmentCost: record.treatmentCost ?? '',
      remarks: record.remarks || '',
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
    const payload = { ...form, death: form.death === 'true', postmortemDone: form.postmortemDone === 'true' }
    try {
      if (editingId) {
        await updateMedical(caseId, selectedVictimId, editingId, payload)
      } else {
        await createMedical(caseId, selectedVictimId, payload)
      }
      const updated = await listMedical(caseId, selectedVictimId)
      setRecords(updated)
      closeForm()
    } catch (err) {
      setErrors({ _form: err?.response?.data?.message || 'Something went wrong. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  if (victims.length === 0) {
    return <div className="card p-6"><p className="text-sm italic text-slate-300">No victims on this case yet.</p></div>
  }

  return (
    <>
      <div className="card mb-4 p-4 sm:p-6">
        <Select label="Victim" value={selectedVictimId} onChange={(e) => setSelectedVictimId(e.target.value)}
          options={victims.map((v) => ({ value: v.id, label: v.name }))} />
      </div>

      {/* Add / Edit form — hidden until requested */}
      {formOpen && (
        <div className="card mb-4 overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-border bg-slate-50/60 px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <HeartPulse size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800">{editingId ? 'Edit Medical Record' : 'Add Medical Record'}</h3>
                <p className="text-xs text-slate-400">Treatment details for the selected victim</p>
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
              <Input label="Hospital Name *" name="hospitalName" value={form.hospitalName} onChange={handleChange} error={errors.hospitalName} />
              <Input label="MLC Number" name="mlcNumber" value={form.mlcNumber} onChange={handleChange} />
              <Input label="Doctor Name" name="doctorName" value={form.doctorName} onChange={handleChange} />
              <Input label="Treatment Cost" name="treatmentCost" type="number" value={form.treatmentCost} onChange={handleChange} />
              <Input label="Admission Date" name="admissionDate" type="date" value={form.admissionDate} onChange={handleChange} />
              <Input label="Discharge Date" name="dischargeDate" type="date" value={form.dischargeDate} onChange={handleChange} />
              <Select label="Death" name="death" options={YES_NO_OPTIONS} value={form.death} onChange={handleChange} />
              <Select label="Postmortem Done" name="postmortemDone" options={YES_NO_OPTIONS} value={form.postmortemDone} onChange={handleChange} />
              <Input label="Injury Details" name="injuryDetails" className="sm:col-span-2" value={form.injuryDetails} onChange={handleChange} />
              <Input label="Remarks" name="remarks" className="sm:col-span-2" value={form.remarks} onChange={handleChange} />
            </div>

            <div className="mt-5 flex items-center gap-2">
              <Button onClick={handleAddOrUpdate} disabled={saving}>
                {saving ? 'Saving...' : (
                  <span className="flex items-center gap-1.5">
                    <Check size={15} /> {editingId ? 'Save Changes' : 'Add Record'}
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
          <h3 className="text-base font-semibold text-slate-800">Medical Records</h3>
          <p className="text-xs text-slate-400">
            {recordsLoading ? 'Loading...' : `${records.length} ${records.length === 1 ? 'record' : 'records'} for this victim`}
          </p>
        </div>
        {!formOpen && (
          <button
            onClick={openAddForm}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:border-primary hover:text-primary"
          >
            <HeartPulse size={13} /> Add Record
          </button>
        )}
      </div>

      {recordsLoading ? (
        <div className="card p-6"><p className="text-sm text-slate-400">Loading medical records...</p></div>
      ) : records.length === 0 ? (
        <div className="card p-6"><p className="text-sm italic text-slate-300">No medical records added yet.</p></div>
      ) : (
        <div className="space-y-4">
          {records.map((r) => {
            const cost = formatCurrency(r.treatmentCost)
            return (
              <div key={r.id} className="card overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 border-b border-border bg-slate-50/60 px-4 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <HeartPulse size={20} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-800">{r.hospitalName}</h3>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${
                          r.death ? 'bg-red-50 text-red-600 ring-red-100' : 'bg-emerald-50 text-emerald-600 ring-emerald-100'
                        }`}>
                          {r.death ? 'Deceased' : 'Survived'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{r.doctorName ? `Dr. ${r.doctorName}` : 'Treatment record'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openEditForm(r)}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:border-primary hover:text-primary"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                </div>

                <div className="px-4 py-4 sm:px-6 sm:py-5">
                  {/* Stat strip */}
                  <div className="grid grid-cols-2 gap-y-4 border-b border-dashed border-border pb-5 sm:grid-cols-4">
                    <StatBlock icon={Hash} label="MLC Number" value={r.mlcNumber} />
                    <StatBlock icon={Calendar} label="Admission Date" value={formatDate(r.admissionDate)} />
                    <StatBlock icon={Calendar} label="Discharge Date" value={formatDate(r.dischargeDate)} />
                    <StatBlock icon={IndianRupee} label="Treatment Cost" value={cost} />
                  </div>

                  {/* Detail fields */}
                  <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                    <div className="divide-y divide-border sm:border-r sm:border-border sm:pr-8">
                      <FieldRow icon={User} label="Doctor Name" value={r.doctorName} />
                      <FieldRow icon={Skull} label="Death" value={r.death ? 'Yes' : 'No'} />
                    </div>
                    <div className="divide-y divide-border sm:pl-8">
                      <FieldRow icon={FileSearch} label="Postmortem Done" value={r.postmortemDone ? 'Yes' : 'No'} />
                    </div>
                  </div>

                  {(r.injuryDetails || r.remarks) && (
                    <div className="mt-1 grid grid-cols-1 gap-x-8 border-t border-border pt-1 sm:grid-cols-2">
                      {r.injuryDetails && (
                        <div className="py-3 sm:border-r sm:border-border sm:pr-8">
                          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            <FileText size={12} /> Injury Details
                          </p>
                          <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600">
                            {r.injuryDetails}
                          </p>
                        </div>
                      )}
                      {r.remarks && (
                        <div className="py-3 sm:pl-8">
                          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            <MessageSquare size={12} /> Remarks
                          </p>
                          <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600">
                            {r.remarks}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}