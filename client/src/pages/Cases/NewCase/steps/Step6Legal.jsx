import React, { useEffect, useState } from 'react'
import Input from '../../../../components/Input.jsx'
import Select from '../../../../components/Select.jsx'
import WizardNavButtons from '../WizardNavButtons.jsx'
import { getLegal, saveLegal } from '../../services/caseWizardService.js'

const COMPENSATION_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'PAID', label: 'Paid' },
]

const EMPTY_FORM = {
  advocateName: '', advocateMobile: '', advocateEmail: '', mvcNumber: '',
  mvcFiledDate: '', courtName: '', compensationStatus: 'PENDING', remarks: '',
}

export default function Step6Legal({ wizard }) {
  const { caseId, isFirstStep, goPrevious, goNext } = wizard

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!caseId) return
    setLoading(true)
    getLegal(caseId)
      .then((data) => {
        setForm({
          advocateName: data.advocateName || '',
          advocateMobile: data.advocateMobile || '',
          advocateEmail: data.advocateEmail || '',
          mvcNumber: data.mvcNumber || '',
          mvcFiledDate: data.mvcFiledDate?.slice(0, 10) || '',
          courtName: data.courtName || '',
          compensationStatus: data.compensationStatus || 'PENDING',
          remarks: data.remarks || '',
        })
      })
      .catch(() => {}) // no legal record saved yet — start blank
      .finally(() => setLoading(false))
  }, [caseId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleNext = async () => {
    setSaving(true)
    try {
      await saveLegal(caseId, form)
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
        <p className="text-sm text-slate-400">Loading legal details...</p>
      </div>
    )
  }

  return (
    <>
      <div className="card p-4 sm:p-6">
        <h3 className="mb-1 text-base font-semibold text-slate-800">Legal / MVC Details</h3>
        <p className="mb-4 text-sm text-slate-400">Advocate, court, and compensation tracking for this case.</p>

        {errors._form && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-danger">{errors._form}</div>
        )}

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
      </div>

      <WizardNavButtons isFirstStep={isFirstStep} isLastStep={false} onPrevious={goPrevious} onNext={handleNext} saving={saving} />
    </>
  )
}