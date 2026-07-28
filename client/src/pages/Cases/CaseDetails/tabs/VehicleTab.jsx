import React, { useEffect, useState } from 'react'
import { CarFront, Pencil, Trash2 } from 'lucide-react'
import Button from '../../../../components/Button.jsx'
import Input from '../../../../components/Input.jsx'
import Select from '../../../../components/Select.jsx'
import { listVehicles, createVehicle, updateVehicle, deleteVehicle } from '../../services/caseWizardService.js'

const VEHICLE_TYPE_OPTIONS = [
  { value: 'BIKE', label: 'Bike' },
  { value: 'CAR', label: 'Car' },
  { value: 'AUTO', label: 'Auto' },
  { value: 'BUS', label: 'Bus' },
  { value: 'LORRY', label: 'Lorry' },
  { value: 'VAN', label: 'Van' },
  { value: 'TRACTOR', label: 'Tractor' },
  { value: 'OTHER', label: 'Other' },
]

const EMPTY_FORM = {
  registrationNumber: '', vehicleType: '', brand: '', model: '', ownerName: '',
  driverName: '', drivingLicence: '', rcNumber: '',
  insuranceCompany: '', policyNumber: '', policyHolder: '',
  policyStartDate: '', policyEndDate: '', surveyor: '',
  coverageAmount: '', estimatedClaimAmount: '',
}

export default function VehicleTab({ caseId, refetch }) {
  const [vehicles, setVehicles] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const loadVehicles = () => listVehicles(caseId).then(setVehicles).catch(() => setVehicles([]))

  useEffect(() => { loadVehicles() }, [caseId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.registrationNumber) nextErrors.registrationNumber = 'Vehicle number is required.'
    if (!form.vehicleType) nextErrors.vehicleType = 'Vehicle type is required.'
    if (!form.ownerName) nextErrors.ownerName = 'Owner name is required.'
    if (!form.insuranceCompany) nextErrors.insuranceCompany = 'Insurance company is required.'
    if (!form.policyNumber) nextErrors.policyNumber = 'Policy number is required.'
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
        await updateVehicle(caseId, editingId, form)
      } else {
        await createVehicle(caseId, form)
      }
      resetForm()
      loadVehicles()
      refetch()
    } catch (err) {
      setErrors({ _form: err?.response?.data?.message || 'Something went wrong. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (vehicle) => {
    const insurance = vehicle.insuranceDetails?.[0] || {}
    setEditingId(vehicle.id)
    setForm({
      registrationNumber: vehicle.registrationNumber || '',
      vehicleType: vehicle.vehicleType || '',
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      ownerName: vehicle.ownerName || '',
      driverName: vehicle.driverName || '',
      drivingLicence: vehicle.drivingLicence || '',
      rcNumber: vehicle.rcNumber || '',
      insuranceCompany: insurance.insuranceCompany || '',
      policyNumber: insurance.policyNumber || '',
      policyHolder: insurance.policyHolder || '',
      policyStartDate: insurance.policyStartDate?.slice(0, 10) || '',
      policyEndDate: insurance.policyEndDate?.slice(0, 10) || '',
      surveyor: insurance.surveyor || '',
      coverageAmount: insurance.coverageAmount ?? '',
      estimatedClaimAmount: insurance.estimatedClaimAmount ?? '',
    })
  }

  const handleDelete = async (vehicleId) => {
    if (!window.confirm('Remove this vehicle from the case?')) return
    try {
      await deleteVehicle(caseId, vehicleId)
      loadVehicles()
      refetch()
    } catch (err) {
      window.alert(err?.response?.data?.message || 'Failed to remove vehicle.')
    }
  }

  return (
    <>
      <div className="card mb-4 p-4 sm:p-6">
        <h3 className="mb-1 text-base font-semibold text-slate-800">{editingId ? 'Edit Vehicle' : 'Add Vehicle'}</h3>

        {errors._form && <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-danger">{errors._form}</div>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Vehicle Number *" name="registrationNumber" value={form.registrationNumber} onChange={handleChange} error={errors.registrationNumber} />
          <Select label="Vehicle Type *" name="vehicleType" options={VEHICLE_TYPE_OPTIONS} value={form.vehicleType} onChange={handleChange} error={errors.vehicleType} />
          <Input label="Owner Name *" name="ownerName" value={form.ownerName} onChange={handleChange} error={errors.ownerName} />
          <Input label="Driver Name" name="driverName" value={form.driverName} onChange={handleChange} />
          <Input label="Brand" name="brand" value={form.brand} onChange={handleChange} />
          <Input label="Model" name="model" value={form.model} onChange={handleChange} />
          <Input label="Driving Licence No." name="drivingLicence" value={form.drivingLicence} onChange={handleChange} />
          <Input label="RC Number" name="rcNumber" value={form.rcNumber} onChange={handleChange} />
        </div>

        <h4 className="mb-3 mt-6 text-sm font-semibold text-slate-700">Insurance Details</h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Insurance Company *" name="insuranceCompany" value={form.insuranceCompany} onChange={handleChange} error={errors.insuranceCompany} />
          <Input label="Policy Number *" name="policyNumber" value={form.policyNumber} onChange={handleChange} error={errors.policyNumber} />
          <Input label="Policy Holder" name="policyHolder" value={form.policyHolder} onChange={handleChange} />
          <Input label="Surveyor" name="surveyor" value={form.surveyor} onChange={handleChange} />
          <Input label="Policy Start Date" name="policyStartDate" type="date" value={form.policyStartDate} onChange={handleChange} />
          <Input label="Policy End Date" name="policyEndDate" type="date" value={form.policyEndDate} onChange={handleChange} />
          <Input label="Coverage Amount" name="coverageAmount" type="number" value={form.coverageAmount} onChange={handleChange} />
          <Input label="Estimated Claim Amount" name="estimatedClaimAmount" type="number" value={form.estimatedClaimAmount} onChange={handleChange} />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Button icon={CarFront} onClick={handleAddOrUpdate} disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Vehicle'}
          </Button>
          {editingId && <Button variant="outline" onClick={resetForm} disabled={saving}>Cancel Edit</Button>}
        </div>
      </div>

      <div className="card p-4 sm:p-6">
        <h3 className="mb-4 text-base font-semibold text-slate-800">Vehicles ({vehicles.length})</h3>
        {vehicles.length === 0 ? (
          <p className="text-sm text-slate-400">No vehicles added yet.</p>
        ) : (
          <div className="space-y-2">
            {vehicles.map((v) => (
              <div key={v.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-700">{v.registrationNumber}</p>
                  <p className="text-xs text-slate-400">{v.vehicleType} · {v.ownerName}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEdit(v)} className="rounded-lg p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(v.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-danger"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}