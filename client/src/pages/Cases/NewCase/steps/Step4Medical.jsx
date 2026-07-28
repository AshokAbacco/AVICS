import React, { useEffect, useState } from 'react'
import { HeartPulse, Pencil } from 'lucide-react'
import Button from '../../../../components/Button.jsx'
import Input from '../../../../components/Input.jsx'
import Select from '../../../../components/Select.jsx'
import WizardNavButtons from '../WizardNavButtons.jsx'
import { listVictims, listMedical, createMedical, updateMedical } from '../../services/caseWizardService.js'

const YES_NO_OPTIONS = [
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
]

const EMPTY_FORM = {
  hospitalName: '', doctorName: '', mlcNumber: '', admissionDate: '', dischargeDate: '',
  injuryDetails: '', death: 'false', postmortemDone: 'false', treatmentCost: '', remarks: '',
}

export default function Step4Medical({ wizard }) {
  const { caseId, isFirstStep, goPrevious, goNext } = wizard

  const [victims, setVictims] = useState([])
  const [selectedVictimId, setSelectedVictimId] = useState('')
  const [records, setRecords] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!caseId) return
    setLoading(true)
    listVictims(caseId)
      .then((data) => {
        setVictims(data)
        if (data.length > 0) setSelectedVictimId(data[0].id)
      })
      .catch(() => setVictims([]))
      .finally(() => setLoading(false))
  }, [caseId])

  useEffect(() => {
    if (!selectedVictimId) return
    listMedical(caseId, selectedVictimId).then(setRecords).catch(() => setRecords([]))
    resetForm()
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

  const resetForm = () => {
    setForm(EMPTY_FORM)
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
      resetForm()
    } catch (err) {
      setErrors({ _form: err?.response?.data?.message || 'Something went wrong. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (record) => {
    setEditingId(record.id)
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
  }

  if (loading) {
    return (
      <div className="card p-6">
        <p className="text-sm text-slate-400">Loading medical details...</p>
      </div>
    )
  }

  if (victims.length === 0) {
    return (
      <>
        <div className="card p-6">
          <p className="text-sm text-slate-400">No victims found on this case — go back to Step 2 and add at least one victim first.</p>
        </div>
        <WizardNavButtons isFirstStep={isFirstStep} isLastStep={false} onPrevious={goPrevious} onNext={goNext} />
      </>
    )
  }

  return (
    <>
      <div className="card mb-4 p-4 sm:p-6">
        <h3 className="mb-1 text-base font-semibold text-slate-800">Medical Details</h3>
        <p className="mb-4 text-sm text-slate-400">Select a victim, then add their medical/hospital records.</p>

        <Select
          label="Victim" value={selectedVictimId}
          onChange={(e) => setSelectedVictimId(e.target.value)}
          options={victims.map((v) => ({ value: v.id, label: v.name }))}
        />
      </div>

      <div className="card mb-4 p-4 sm:p-6">
        <h4 className="mb-4 text-sm font-semibold text-slate-700">
          {editingId ? 'Edit Medical Record' : 'Add Medical Record'}
        </h4>

        {errors._form && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-danger">{errors._form}</div>
        )}

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

        <div className="mt-4 flex items-center gap-2">
          <Button icon={HeartPulse} onClick={handleAddOrUpdate} disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Record'}
          </Button>
          {editingId && (
            <Button variant="outline" onClick={resetForm} disabled={saving}>
              Cancel Edit
            </Button>
          )}
        </div>
      </div>

      <div className="card p-4 sm:p-6">
        <h4 className="mb-4 text-sm font-semibold text-slate-700">Records for this Victim ({records.length})</h4>
        {records.length === 0 ? (
          <p className="text-sm text-slate-400">No medical records added yet.</p>
        ) : (
          <div className="space-y-2">
            {records.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-700">{r.hospitalName}</p>
                  <p className="text-xs text-slate-400">
                    {r.mlcNumber ? `MLC: ${r.mlcNumber} · ` : ''}{r.death ? 'Deceased' : 'Survived'}
                  </p>
                </div>
                <button onClick={() => handleEdit(r)} className="rounded-lg p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600">
                  <Pencil size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <WizardNavButtons isFirstStep={isFirstStep} isLastStep={false} onPrevious={goPrevious} onNext={goNext} />
    </>
  )
}