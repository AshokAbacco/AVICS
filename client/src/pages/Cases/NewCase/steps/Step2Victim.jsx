//client\src\pages\Cases\NewCase\steps\Step2Victim.jsx
import React, { useEffect, useState } from 'react'
import { UserPlus, Pencil, Trash2 } from 'lucide-react'
import Button from '../../../../components/Button.jsx'
import Input from '../../../../components/Input.jsx'
import Select from '../../../../components/Select.jsx'
import WizardNavButtons from '../WizardNavButtons.jsx'
import { listVictims, createVictim, updateVictim, deleteVictim } from '../../services/caseWizardService.js'

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
]

const EMPTY_FORM = {
  name: '', guardianRelation: '', guardianName: '', age: '', gender: '',
  mobile: '', aadhaarNumber: '', address: '',
}

export default function Step2Victim({ wizard }) {
  const { caseId, isFirstStep, goPrevious, goNext } = wizard

  const [victims, setVictims] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [listError, setListError] = useState('')

  const loadVictims = () => {
    setLoading(true)
    listVictims(caseId)
      .then(setVictims)
      .catch(() => setVictims([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (caseId) loadVictims()
  }, [caseId])

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

  const resetForm = () => {
    setForm(EMPTY_FORM)
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
      resetForm()
      loadVictims()
    } catch (err) {
      setErrors({ _form: err?.response?.data?.message || 'Something went wrong. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (victim) => {
    setEditingId(victim.id)
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
  }

  const handleDelete = async (victimId) => {
    if (!window.confirm('Remove this victim from the case?')) return
    try {
      await deleteVictim(caseId, victimId)
      loadVictims()
    } catch (err) {
      window.alert(err?.response?.data?.message || 'Failed to remove victim.')
    }
  }

  const handleNext = () => {
    if (victims.length === 0) {
      setListError('Add at least one victim before continuing.')
      return
    }
    setListError('')
    goNext()
  }

  if (loading) {
    return (
      <div className="card p-6">
        <p className="text-sm text-slate-400">Loading victim details...</p>
      </div>
    )
  }

  return (
    <>
      <div className="card mb-4 p-4 sm:p-6">
        <h3 className="mb-1 text-base font-semibold text-slate-800">
          {editingId ? 'Edit Victim' : 'Add Victim'}
        </h3>
        <p className="mb-4 text-sm text-slate-400">A case can have more than one victim — add each one separately.</p>

        {errors._form && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-danger">{errors._form}</div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Victim Name *" name="name" value={form.name} onChange={handleChange} error={errors.name} />
          <Input label="Age *" name="age" type="number" value={form.age} onChange={handleChange} error={errors.age} />
          <Select
            label="Gender *" name="gender" value={form.gender} onChange={handleChange}
            options={GENDER_OPTIONS} error={errors.gender}
          />
          <Input label="Guardian Relation" name="guardianRelation" placeholder="Father / Husband" value={form.guardianRelation} onChange={handleChange} />
          <Input label="Guardian Name" name="guardianName" value={form.guardianName} onChange={handleChange} />
          <Input label="Mobile Number" name="mobile" value={form.mobile} onChange={handleChange} />
          <Input label="Aadhaar Number" name="aadhaarNumber" value={form.aadhaarNumber} onChange={handleChange} />
          <Input label="Address" name="address" className="sm:col-span-2" value={form.address} onChange={handleChange} />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Button icon={UserPlus} onClick={handleAddOrUpdate} disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Victim'}
          </Button>
          {editingId && (
            <Button variant="outline" onClick={resetForm} disabled={saving}>
              Cancel Edit
            </Button>
          )}
        </div>
      </div>

      <div className="card p-4 sm:p-6">
        <h3 className="mb-4 text-base font-semibold text-slate-800">
          Victims Added ({victims.length})
        </h3>

        {listError && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-danger">{listError}</div>
        )}

        {victims.length === 0 ? (
          <p className="text-sm text-slate-400">No victims added yet.</p>
        ) : (
          <div className="space-y-2">
            {victims.map((v) => (
              <div key={v.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-700">{v.name}</p>
                  <p className="text-xs text-slate-400">
                    {v.age} yrs · {v.gender} {v.mobile ? `· ${v.mobile}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEdit(v)} className="rounded-lg p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(v.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-danger">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <WizardNavButtons
        isFirstStep={isFirstStep}
        isLastStep={false}
        onPrevious={goPrevious}
        onNext={handleNext}
      />
    </>
  )
}