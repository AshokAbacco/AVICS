import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Wallet, CheckCircle2, Clock4, BadgeIndianRupee } from 'lucide-react'
import ManagementPage from '../../components/ManagementPage.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { claimService } from '../../services/claimService.js'
import { caseService } from '../../services/caseService.js'
import api from '../../services/api.js'
import { formatCurrency } from '../../utils/format.js'

const columns = [
  { key: 'claimNumber', label: 'Claim No.' },
  { key: 'case', label: 'Case', render: (row) => row.case?.caseNumber || row.caseId },
  { key: 'claimantName', label: 'Claimant' },
  { key: 'claimType', label: 'Type' },
  { key: 'claimAmount', label: 'Claim Amount', render: (row) => formatCurrency(Number(row.claimAmount || 0)) },
  { key: 'approvedAmount', label: 'Approved', render: (row) => formatCurrency(Number(row.approvedAmount || 0)) },
  { key: 'compensationAmount', label: 'Compensation', render: (row) => formatCurrency(Number(row.compensationAmount || 0)) },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  { key: 'paymentStatus', label: 'Payment', render: (row) => <StatusBadge status={row.paymentStatus} /> },
]

// Pulls the array out of an axios response regardless of whether the API
// wraps it as { success, data: [...] } (the pattern used everywhere else
// in this codebase) or returns the array directly -- defensive since the
// exact shape of listVictims/listVehicles wasn't confirmed.
function extractArray(res) {
  const body = res?.data
  if (Array.isArray(body?.data)) return body.data
  if (Array.isArray(body)) return body
  return []
}

// Case-scoped lookups, per case.routes.js:
//   GET /api/cases/:caseId/victims
//   GET /api/cases/:caseId/vehicles
async function loadVictimsForCase(caseId) {
  const res = await api.get(`/cases/${caseId}/victims`)
  return extractArray(res).map((v) => ({
    value: v.id,
    label: `${v.name}${v.age ? ` (${v.age} yrs${v.gender ? `, ${v.gender}` : ''})` : ''}`,
  }))
}

async function loadVehiclesForCase(caseId) {
  const res = await api.get(`/cases/${caseId}/vehicles`)
  return extractArray(res).map((v) => ({
    value: v.id,
    label: `${v.registrationNumber}${v.ownerName ? ` — ${v.ownerName}` : ''}`,
  }))
}

export default function ClaimManagement() {
  const [claims, setClaims] = useState([])
  const [caseOptions, setCaseOptions] = useState([])

  const stats = [
    { label: 'Total Claims', value: claims.length, icon: Wallet, tone: 'primary' },
    { label: 'Pending', value: claims.filter((c) => c.status === 'PENDING').length, icon: Clock4, tone: 'warning' },
    { label: 'Approved', value: claims.filter((c) => c.status === 'APPROVED').length, icon: CheckCircle2, tone: 'success' },
    { label: 'Paid', value: claims.filter((c) => c.paymentStatus === 'PAID').length, icon: BadgeIndianRupee, tone: 'success' },
  ]

  const handleFetch = useCallback(async () => {
    const data = await claimService.getAll()
    setClaims(data || [])
    return data
  }, [])

  const handleCreate = async (data) => {
    const created = await claimService.create(data)
    setClaims((prev) => [created, ...prev])
    return created
  }

  const handleUpdate = async (id, data) => {
    const updated = await claimService.update(id, data)
    setClaims((prev) => prev.map((item) => (item.id === id ? updated : item)))
    return updated
  }

  const handleDelete = async (id) => {
    await claimService.remove(id)
    setClaims((prev) => prev.filter((item) => item.id !== id))
  }

  // Single fetch on mount.
  useEffect(() => {
    handleFetch()
  }, [handleFetch])

  // Case options for the top-level dropdown -- this is the field the
  // victim/vehicle dropdowns depend on.
  useEffect(() => {
    caseService.getAll()
      .then((cases) => {
        setCaseOptions(
          (cases || []).map((c) => ({ value: c.id, label: c.caseNumber || c.id }))
        )
      })
      .catch(() => setCaseOptions([]))
  }, [])

  const formFields = useMemo(
    () => [
      { name: 'claimNumber', label: 'Claim Number' },
      { name: 'caseId', label: 'Case', type: 'select', options: caseOptions, placeholder: 'Select a case first' },

      // Pick ONE of these depending on who the claim is actually for.
      // Both are dependent on caseId -- options load fresh from that
      // case's own victims/vehicles the moment a case is selected above,
      // and reset whenever the case selection changes.
      {
        name: 'victimId', label: 'Victim (for Medical / Death / Disability claims)', type: 'select',
        dependsOn: 'caseId', loadOptions: loadVictimsForCase, placeholder: 'Select case first, then victim',
      },
      {
        name: 'vehicleId', label: 'Vehicle (for Vehicle / Property Damage claims)', type: 'select',
        dependsOn: 'caseId', loadOptions: loadVehiclesForCase, placeholder: 'Select case first, then vehicle',
      },

      // Auto-filled server-side from the linked victim/vehicle if left
      // blank; still editable in case the claimant is a legal heir/nominee
      // whose name differs from the victim's own name.
      { name: 'claimantName', label: 'Claimant Name (auto-filled if linked above)' },

      { name: 'policyNumber', label: 'Policy Number' },
      { name: 'claimType', label: 'Claim Type', type: 'select', options: [
          { value: 'VEHICLE_DAMAGE', label: 'Vehicle Damage' },
          { value: 'MEDICAL', label: 'Medical' },
          { value: 'DEATH', label: 'Death' },
          { value: 'DISABILITY', label: 'Disability' },
          { value: 'PROPERTY_DAMAGE', label: 'Property Damage' },
          { value: 'THIRD_PARTY', label: 'Third Party' },
          { value: 'OTHER', label: 'Other' },
        ] },
      { name: 'claimAmount', label: 'Claim Amount', type: 'number' },
      { name: 'approvedAmount', label: 'Approved Amount', type: 'number' },
      { name: 'compensationAmount', label: 'Compensation Amount', type: 'number' },
      { name: 'submittedDate', label: 'Submitted Date', type: 'date' },
      { name: 'decisionDate', label: 'Decision Date', type: 'date' },
      { name: 'paymentDate', label: 'Payment Date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: [
          { value: 'PENDING', label: 'Pending' },
          { value: 'UNDER_REVIEW', label: 'Under Review' },
          { value: 'APPROVED', label: 'Approved' },
          { value: 'PARTIALLY_APPROVED', label: 'Partially Approved' },
          { value: 'REJECTED', label: 'Rejected' },
          { value: 'CLOSED', label: 'Closed' },
        ] },
      { name: 'paymentStatus', label: 'Payment Status', type: 'select', options: [
          { value: 'UNPAID', label: 'Unpaid' },
          { value: 'PROCESSING', label: 'Processing' },
          { value: 'PAID', label: 'Paid' },
          { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
          { value: 'PENDING', label: 'Pending' },
        ] },
      { name: 'insuranceCompany', label: 'Insurance Company' },
      { name: 'surveyorName', label: 'Surveyor Name' },
      { name: 'remarks', label: 'Remarks', fullWidth: true },
      { name: 'rejectionReason', label: 'Rejection Reason', fullWidth: true },
    ],
    [caseOptions]
  )

  return (
    <ManagementPage
      title="Claim & Compensation Management"
      subtitle="Manage claim intake, approvals, compensation amounts, and payment status."
      breadcrumbLabel="Claims"
      initialData={[]}
      columns={columns}
      formFields={formFields}
      searchKeys={['claimNumber', 'claimantName', 'policyNumber']}
      filterField="status"
      filterOptions={[
        { value: 'PENDING', label: 'Pending' },
        { value: 'UNDER_REVIEW', label: 'Under Review' },
        { value: 'APPROVED', label: 'Approved' },
        { value: 'PARTIALLY_APPROVED', label: 'Partially Approved' },
        { value: 'REJECTED', label: 'Rejected' },
        { value: 'CLOSED', label: 'Closed' },
      ]}
      filterLabel="Status"
      stats={stats}
      idPrefix="CLM"
      onFetch={handleFetch}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
    />
  )
}