import React, { useEffect, useState } from 'react'
import {
  CarFront, ShieldCheck, User, UserCog, Tag, Layers, IdCard, Hash,
  Calendar, IndianRupee, X, Pencil, Trash2, Check,
} from 'lucide-react'
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

const VEHICLE_TYPE_STYLES = {
  BIKE: 'bg-amber-50 text-amber-600 ring-amber-100',
  CAR: 'bg-sky-50 text-sky-600 ring-sky-100',
  AUTO: 'bg-orange-50 text-orange-600 ring-orange-100',
  BUS: 'bg-purple-50 text-purple-600 ring-purple-100',
  LORRY: 'bg-red-50 text-red-600 ring-red-100',
  VAN: 'bg-indigo-50 text-indigo-600 ring-indigo-100',
  TRACTOR: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
  OTHER: 'bg-slate-100 text-slate-600 ring-slate-200',
}

const EMPTY_FORM = {
  registrationNumber: '', vehicleType: '', brand: '', model: '', ownerName: '',
  driverName: '', drivingLicence: '', rcNumber: '',
  insuranceCompany: '', policyNumber: '', policyHolder: '',
  policyStartDate: '', policyEndDate: '', surveyor: '',
  coverageAmount: '', estimatedClaimAmount: '',
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

/** Small stat with an icon chip, used in the per-vehicle header strip. */
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

export default function VehicleTab({ caseId, refetch }) {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)

  // Form is hidden until "Add Vehicle" or a card's edit icon is clicked.
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const loadVehicles = () => {
    setLoading(true)
    listVehicles(caseId).then(setVehicles).catch(() => setVehicles([])).finally(() => setLoading(false))
  }

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

  const openAddForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setErrors({})
    setFormOpen(true)
  }

  const openEditForm = (vehicle) => {
    const insurance = vehicle.insuranceDetails?.[0] || {}
    setEditingId(vehicle.id)
    setErrors({})
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
    try {
      if (editingId) {
        await updateVehicle(caseId, editingId, form)
      } else {
        await createVehicle(caseId, form)
      }
      closeForm()
      loadVehicles()
      refetch?.()
    } catch (err) {
      setErrors({ _form: err?.response?.data?.message || 'Something went wrong. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (vehicleId) => {
    if (!window.confirm('Remove this vehicle from the case?')) return
    try {
      await deleteVehicle(caseId, vehicleId)
      loadVehicles()
      refetch?.()
    } catch (err) {
      window.alert(err?.response?.data?.message || 'Failed to remove vehicle.')
    }
  }

  return (
    <>
      {/* Add / Edit form — hidden until requested */}
      {formOpen && (
        <div className="card mb-4 overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-border bg-slate-50/60 px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CarFront size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800">{editingId ? 'Edit Vehicle' : 'Add Vehicle'}</h3>
                <p className="text-xs text-slate-400">Vehicle and insurance information</p>
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
              <Input label="Vehicle Number *" name="registrationNumber" value={form.registrationNumber} onChange={handleChange} error={errors.registrationNumber} />
              <Select label="Vehicle Type *" name="vehicleType" options={VEHICLE_TYPE_OPTIONS} value={form.vehicleType} onChange={handleChange} error={errors.vehicleType} />
              <Input label="Owner Name *" name="ownerName" value={form.ownerName} onChange={handleChange} error={errors.ownerName} />
              <Input label="Driver Name" name="driverName" value={form.driverName} onChange={handleChange} />
              <Input label="Brand" name="brand" value={form.brand} onChange={handleChange} />
              <Input label="Model" name="model" value={form.model} onChange={handleChange} />
              <Input label="Driving Licence No." name="drivingLicence" value={form.drivingLicence} onChange={handleChange} />
              <Input label="RC Number" name="rcNumber" value={form.rcNumber} onChange={handleChange} />
            </div>

            <h4 className="mb-3 mt-6 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
              <ShieldCheck size={15} className="text-primary" /> Insurance Details
            </h4>
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

            <div className="mt-5 flex items-center gap-2">
              <Button onClick={handleAddOrUpdate} disabled={saving}>
                {saving ? 'Saving...' : (
                  <span className="flex items-center gap-1.5">
                    <Check size={15} /> {editingId ? 'Save Changes' : 'Add Vehicle'}
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
          <h3 className="text-base font-semibold text-slate-800">Vehicles</h3>
          <p className="text-xs text-slate-400">
            {loading ? 'Loading...' : `${vehicles.length} ${vehicles.length === 1 ? 'vehicle' : 'vehicles'} recorded on this case`}
          </p>
        </div>
        {!formOpen && (
          <button
            onClick={openAddForm}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:border-primary hover:text-primary"
          >
            <CarFront size={13} /> Add Vehicle
          </button>
        )}
      </div>

      {loading ? (
        <div className="card p-6"><p className="text-sm text-slate-400">Loading vehicles...</p></div>
      ) : vehicles.length === 0 ? (
        <div className="card p-6"><p className="text-sm italic text-slate-300">No vehicles added yet.</p></div>
      ) : (
        <div className="space-y-4">
          {vehicles.map((v) => {
            const insurance = v.insuranceDetails?.[0] || {}
            const coverage = formatCurrency(insurance.coverageAmount)
            const claim = formatCurrency(insurance.estimatedClaimAmount)
            const policyPeriod = insurance.policyStartDate || insurance.policyEndDate
              ? `${formatDate(insurance.policyStartDate) || '—'} – ${formatDate(insurance.policyEndDate) || '—'}`
              : null

            return (
              <div key={v.id} className="card overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 border-b border-border bg-slate-50/60 px-4 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <CarFront size={20} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-mono text-base font-semibold text-slate-800">{v.registrationNumber}</h3>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${VEHICLE_TYPE_STYLES[v.vehicleType] || VEHICLE_TYPE_STYLES.OTHER}`}>
                          {v.vehicleType || '—'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{v.brand || v.model ? [v.brand, v.model].filter(Boolean).join(' ') : 'Vehicle and insurance details'}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => openEditForm(v)}
                      className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:border-primary hover:text-primary"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button onClick={() => handleDelete(v.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-danger"><Trash2 size={16} /></button>
                  </div>
                </div>

                <div className="px-4 py-4 sm:px-6 sm:py-5">
                  {/* Stat strip */}
                  <div className="grid grid-cols-2 gap-y-4 border-b border-dashed border-border pb-5 sm:grid-cols-4">
                    <StatBlock icon={User} label="Owner" value={v.ownerName} />
                    <StatBlock icon={UserCog} label="Driver" value={v.driverName} />
                    <StatBlock icon={ShieldCheck} label="Insurer" value={insurance.insuranceCompany} />
                    <StatBlock icon={IndianRupee} label="Coverage" value={coverage} />
                  </div>

                  {/* Vehicle detail fields */}
                  <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                    <div className="divide-y divide-border sm:border-r sm:border-border sm:pr-8">
                      <FieldRow icon={Tag} label="Brand" value={v.brand} />
                      <FieldRow icon={Layers} label="Model" value={v.model} />
                    </div>
                    <div className="divide-y divide-border sm:pl-8">
                      <FieldRow icon={IdCard} label="Driving Licence No." value={v.drivingLicence} />
                      <FieldRow icon={Hash} label="RC Number" value={v.rcNumber} />
                    </div>
                  </div>

                  {/* Insurance detail fields */}
                  <p className="mb-1 mt-3 flex items-center gap-1.5 border-t border-border pt-4 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    <ShieldCheck size={12} /> Insurance Details
                  </p>
                  <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                    <div className="divide-y divide-border sm:border-r sm:border-border sm:pr-8">
                      <FieldRow icon={Hash} label="Policy Number" value={insurance.policyNumber} />
                      <FieldRow icon={User} label="Policy Holder" value={insurance.policyHolder} />
                      <FieldRow icon={UserCog} label="Surveyor" value={insurance.surveyor} />
                    </div>
                    <div className="divide-y divide-border sm:pl-8">
                      <FieldRow icon={Calendar} label="Policy Period" value={policyPeriod} />
                      <FieldRow icon={IndianRupee} label="Estimated Claim Amount" value={claim} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}