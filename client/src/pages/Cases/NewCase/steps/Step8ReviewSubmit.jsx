//client\src\pages\Cases\NewCase\steps\Step8ReviewSubmit.jsx
import React, { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import WizardNavButtons from '../WizardNavButtons.jsx'
import { getCaseById, submitCase } from '../../services/caseWizardService.js'
import { getCaseStatusMeta } from '../../../../constants/caseStatus.js'

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function ReviewSection({ title, onEdit, children }) {
  return (
    <div className="card mb-4 p-4 sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-700">{title}</h4>
        <button onClick={onEdit} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
          <Pencil size={13} /> Edit
        </button>
      </div>
      {children}
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-medium text-slate-700">{value ?? '—'}</p>
    </div>
  )
}

export default function Step8ReviewSubmit({ wizard }) {
  const { caseId, isFirstStep, goPrevious, goToStep, exitToListing } = wizard

  const [caseData, setCaseData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!caseId) return
    setLoading(true)
    getCaseById(caseId)
      .then(setCaseData)
      .catch(() => setCaseData(null))
      .finally(() => setLoading(false))
  }, [caseId])

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      await submitCase(caseId)
      window.alert('Case submitted successfully.')
      exitToListing()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit case. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !caseData) {
    return (
      <div className="card p-6">
        <p className="text-sm text-slate-400">Loading case summary...</p>
      </div>
    )
  }

  const { accident, victims = [], vehicles = [], policeDetails, legalDetail, status } = caseData
  const statusMeta = getCaseStatusMeta(status)

  return (
    <>
      <div className="card mb-4 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-800">Review & Submit</h3>
            <p className="text-sm text-slate-400">Case Number: {caseData.caseNumber}</p>
          </div>
          <span className={`badge ${statusMeta.className}`}>{statusMeta.label}</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-danger">{error}</div>
      )}

      <ReviewSection title="Accident Details" onEdit={() => goToStep('accident')}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Field label="Date" value={formatDate(accident?.accidentDate)} />
          <Field label="Time" value={accident?.accidentTime} />
          <Field label="District" value={accident?.district} />
          <Field label="Village/Town" value={accident?.village} />
          <Field label="Police Station" value={accident?.policeStation} />
          <Field label="Accident Type" value={accident?.accidentType} />
        </div>
      </ReviewSection>

      <ReviewSection title={`Victims (${victims.length})`} onEdit={() => goToStep('victim')}>
        {victims.length === 0 ? (
          <p className="text-sm text-slate-400">No victims added.</p>
        ) : (
          <div className="space-y-3">
            {victims.map((v) => (
              <div key={v.id} className="grid grid-cols-2 gap-3 border-b border-border pb-3 last:border-0 last:pb-0 sm:grid-cols-4">
                <Field label="Name" value={v.name} />
                <Field label="Age" value={v.age} />
                <Field label="Gender" value={v.gender} />
                <Field label="Mobile" value={v.mobile} />
              </div>
            ))}
          </div>
        )}
      </ReviewSection>

      <ReviewSection title={`Vehicles (${vehicles.length})`} onEdit={() => goToStep('vehicle')}>
        {vehicles.length === 0 ? (
          <p className="text-sm text-slate-400">No vehicles added.</p>
        ) : (
          <div className="space-y-3">
            {vehicles.map((v) => (
              <div key={v.id} className="grid grid-cols-2 gap-3 border-b border-border pb-3 last:border-0 last:pb-0 sm:grid-cols-4">
                <Field label="Reg. Number" value={v.registrationNumber} />
                <Field label="Owner" value={v.ownerName} />
                <Field label="Insurance Co." value={v.insuranceDetails?.[0]?.insuranceCompany} />
                <Field label="Policy No." value={v.insuranceDetails?.[0]?.policyNumber} />
              </div>
            ))}
          </div>
        )}
      </ReviewSection>

      <ReviewSection title="Police Details" onEdit={() => goToStep('police')}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Field label="FIR Number" value={policeDetails?.firNumber} />
          <Field label="Crime Number" value={policeDetails?.crimeNumber} />
          <Field label="Charge Sheet Filed" value={policeDetails?.chargeSheetFiled ? 'Yes' : 'No'} />
        </div>
      </ReviewSection>

      <ReviewSection title="Legal / MVC Details" onEdit={() => goToStep('legal')}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Field label="Advocate" value={legalDetail?.advocateName} />
          <Field label="MVC Number" value={legalDetail?.mvcNumber} />
          <Field label="Compensation Status" value={legalDetail?.compensationStatus} />
        </div>
      </ReviewSection>

      <WizardNavButtons
        isFirstStep={isFirstStep}
        isLastStep
        onPrevious={goPrevious}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </>
  )
}