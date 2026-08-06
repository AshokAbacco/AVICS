//client\src\pages\Cases\NewCase\steps\Step1Accident.jsx
import React, { useEffect, useState } from 'react'
import Button from '../../../../components/Button.jsx'
import Input from '../../../../components/Input.jsx'
import Select from '../../../../components/Select.jsx'
import WizardNavButtons from '../WizardNavButtons.jsx'
import { getAccident, updateAccident } from '../../services/caseWizardService.js'

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

const EMPTY_FORM = {
  accidentDate: '', accidentTime: '', district: '', village: '', taluk: '',
  policeStation: '', location: '', accidentType: '', weatherCondition: '', description: '',
}

export default function Step1Accident({ wizard }) {
  const { caseId, isFirstStep, startCase, goNext } = wizard

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!caseId) return
    setLoading(true)
    getAccident(caseId)
      .then((accident) => {
        setForm({
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
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [caseId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.accidentDate) nextErrors.accidentDate = 'Accident date is required.'
    if (!form.accidentTime) nextErrors.accidentTime = 'Approx. time is required.'
    if (!form.district) nextErrors.district = 'District is required.'
    if (!form.policeStation) nextErrors.policeStation = 'Police station is required.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleNext = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      if (caseId) {
        await updateAccident(caseId, form)
        goNext()
      } else {
        await startCase(form)
      }
    } catch (err) {
      setErrors({ _form: err?.response?.data?.message || 'Something went wrong. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="card p-6">
        <p className="text-sm text-slate-400">Loading accident details...</p>
      </div>
    )
  }

  return (
    <>
      <div className="card p-4 sm:p-6">
        <h3 className="mb-1 text-base font-semibold text-slate-800">Accident Details</h3>
        <p className="mb-4 text-sm text-slate-400">Basic information about where and when the accident occurred.</p>

        {errors._form && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-danger">{errors._form}</div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Accident Date *" name="accidentDate" type="date"
            value={form.accidentDate} onChange={handleChange} error={errors.accidentDate}
          />
          <Input
            label="Approx. Time *" name="accidentTime" type="time"
            value={form.accidentTime} onChange={handleChange} error={errors.accidentTime}
          />
          <Input
            label="District *" name="district"
            value={form.district} onChange={handleChange} error={errors.district}
          />
          <Input
            label="Village / Town" name="village"
            value={form.village} onChange={handleChange}
          />
          <Input
            label="Police Station *" name="policeStation"
            value={form.policeStation} onChange={handleChange} error={errors.policeStation}
          />
          <Input
            label="Taluk" name="taluk"
            value={form.taluk} onChange={handleChange}
          />
          <Select
            label="Accident Type" name="accidentType" options={ACCIDENT_TYPE_OPTIONS}
            value={form.accidentType} onChange={handleChange}
          />
          <Select
            label="Weather Condition" name="weatherCondition" options={WEATHER_OPTIONS}
            value={form.weatherCondition} onChange={handleChange}
          />
          <Input
            label="Exact Location" name="location" className="sm:col-span-2"
            placeholder="Landmark, road name, KM stone, etc."
            value={form.location} onChange={handleChange}
          />
        </div>
      </div>

      <WizardNavButtons
        isFirstStep={isFirstStep}
        isLastStep={false}
        onPrevious={() => {}}
        onNext={handleNext}
        saving={saving}
      />
    </>
  )
}