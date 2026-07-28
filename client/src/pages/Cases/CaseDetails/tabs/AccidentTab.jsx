import React, { useState } from 'react'
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

export default function AccidentTab({ caseId, caseData, refetch }) {
  const accident = caseData.accident || {}

  const [form, setForm] = useState({
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
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateAccident(caseId, form)
      setSaved(true)
      refetch()
    } catch (err) {
      setErrors({ _form: err?.response?.data?.message || 'Failed to save. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card p-4 sm:p-6">
      <h3 className="mb-1 text-base font-semibold text-slate-800">Accident Details</h3>
      <p className="mb-4 text-sm text-slate-400">Basic information about where and when the accident occurred.</p>

      {errors._form && <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-danger">{errors._form}</div>}
      {saved && <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">Saved successfully.</div>}

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

      <div className="mt-4">
        <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
      </div>
    </div>
  )
}