//client\src\pages\Cases\NewCase\steps\Step5Police.jsx
import React, { useEffect, useState } from 'react'
import Button from '../../../../components/Button.jsx'
import Input from '../../../../components/Input.jsx'
import Select from '../../../../components/Select.jsx'
import WizardNavButtons from '../WizardNavButtons.jsx'
import { getPolice, savePolice } from '../../services/caseWizardService.js'

const YES_NO_OPTIONS = [
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
]

const EMPTY_FORM = {
  firNumber: '', firDate: '', crimeNumber: '', policeStation: '',
  investigatingOfficer: '', investigationStatus: '', chargeSheetFiled: 'false', remarks: '',
}

export default function Step5Police({ wizard }) {
  const { caseId, isFirstStep, goPrevious, goNext } = wizard

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!caseId) return
    setLoading(true)
    getPolice(caseId)
      .then((data) => {
        setForm({
          firNumber: data.firNumber || '',
          firDate: data.firDate?.slice(0, 10) || '',
          crimeNumber: data.crimeNumber || '',
          policeStation: data.policeStation || '',
          investigatingOfficer: data.investigatingOfficer || '',
          investigationStatus: data.investigationStatus || '',
          chargeSheetFiled: String(data.chargeSheetFiled),
          remarks: data.remarks || '',
        })
      })
      .catch(() => {}) // no police record saved yet — start blank
      .finally(() => setLoading(false))
  }, [caseId])

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

  const handleNext = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      await savePolice(caseId, { ...form, chargeSheetFiled: form.chargeSheetFiled === 'true' })
      goNext()
    } catch (err) {
      setErrors({ _form: err?.response?.data?.message || 'Something went wrong. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="card p-6">
        <p className="text-sm text-slate-400">Loading police details...</p>
      </div>
    )
  }

  return (
    <>
      <div className="card p-4 sm:p-6">
        <h3 className="mb-1 text-base font-semibold text-slate-800">Police Details</h3>
        <p className="mb-4 text-sm text-slate-400">FIR and investigation information for this case.</p>

        {errors._form && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-danger">{errors._form}</div>
        )}

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
      </div>

      <WizardNavButtons isFirstStep={isFirstStep} isLastStep={false} onPrevious={goPrevious} onNext={handleNext} saving={saving} />
    </>
  )
}