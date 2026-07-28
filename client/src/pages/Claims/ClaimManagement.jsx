import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Wallet, CheckCircle2, Clock4, XCircle } from 'lucide-react'
import ManagementPage from '../../components/ManagementPage.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { claimService } from '../../services/claimService.js'
import { caseService } from '../../services/caseService.js'
import { formatCurrency } from '../../utils/format.js'

const columns = [
  { key: 'claimNumber', label: 'Claim No.' },
  { key: 'caseId', label: 'Case ID' },
  { key: 'claimantName', label: 'Claimant' },
  { key: 'claimAmount', label: 'Claim Amount', render: (row) => formatCurrency(Number(row.claimAmount || 0)) },
  { key: 'approvedAmount', label: 'Approved', render: (row) => formatCurrency(Number(row.approvedAmount || 0)) },
  { key: 'compensationAmount', label: 'Compensation', render: (row) => formatCurrency(Number(row.compensationAmount || 0)) },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  { key: 'paymentStatus', label: 'Payment', render: (row) => <StatusBadge status={row.paymentStatus} /> },
]

export default function ClaimManagement() {
  const [claims, setClaims] = useState([])
  const [caseOptions, setCaseOptions] = useState([])

  const stats = [
    { label: 'Total Claims', value: claims.length, icon: Wallet, tone: 'primary' },
    { label: 'Pending', value: claims.filter((c) => c.status === 'PENDING').length, icon: Clock4, tone: 'warning' },
    { label: 'Approved', value: claims.filter((c) => c.status === 'APPROVED').length, icon: CheckCircle2, tone: 'success' },
    { label: 'Paid', value: claims.filter((c) => c.paymentStatus === 'PAID').length, icon: XCircle, tone: 'danger' },
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

  useEffect(() => {
    handleFetch()
  }, [handleFetch])

  useEffect(() => {
    const loadCases = async () => {
      try {
        const cases = await caseService.getAll()
        const options = (cases || []).map((caseItem) => ({
          value: caseItem.id,
          label: caseItem.caseNumber ? `${caseItem.id} (${caseItem.caseNumber})` : caseItem.id,
        }))
        if (options.length) {
          setCaseOptions(options)
        }
      } catch (err) {
        setCaseOptions([
          { value: 'CASE-2401', label: 'CASE-2401' },
          { value: 'CASE-2402', label: 'CASE-2402' },
          { value: 'CASE-2403', label: 'CASE-2403' },
          { value: 'CASE-2404', label: 'CASE-2404' },
          { value: 'CASE-2405', label: 'CASE-2405' },
          { value: 'CASE-2406', label: 'CASE-2406' },
          { value: 'CASE-2407', label: 'CASE-2407' },
          { value: 'CASE-2408', label: 'CASE-2408' },
          { value: 'CASE-2409', label: 'CASE-2409' },
          { value: 'CASE-2410', label: 'CASE-2410' },
        ])
      }
    }

    loadCases()
  }, [])

  const formFields = useMemo(
    () => [
      { name: 'claimNumber', label: 'Claim Number' },
      { name: 'caseId', label: 'Case ID', type: 'select', options: caseOptions.length ? caseOptions : [
          { value: 'CASE-2401', label: 'CASE-2401' },
          { value: 'CASE-2402', label: 'CASE-2402' },
          { value: 'CASE-2403', label: 'CASE-2403' },
          { value: 'CASE-2404', label: 'CASE-2404' },
          { value: 'CASE-2405', label: 'CASE-2405' },
          { value: 'CASE-2406', label: 'CASE-2406' },
          { value: 'CASE-2407', label: 'CASE-2407' },
          { value: 'CASE-2408', label: 'CASE-2408' },
          { value: 'CASE-2409', label: 'CASE-2409' },
          { value: 'CASE-2410', label: 'CASE-2410' },
        ] },
      { name: 'claimantName', label: 'Claimant Name' },
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

  useEffect(() => {
    handleFetch()
  }, [handleFetch])

  return (
    <ManagementPage
      title="Claim & Compensation Management"
      subtitle="Manage claim intake, approvals, compensation amounts, and payment status."
      breadcrumbLabel="Claims"
      initialData={[]}
      columns={columns}
      formFields={formFields}
      searchKeys={['claimNumber', 'claimantName', 'caseId', 'policyNumber']}
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
