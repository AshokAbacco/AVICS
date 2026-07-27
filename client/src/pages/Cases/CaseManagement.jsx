//client\src\pages\Cases\CaseManagement.jsx
import React from 'react'
import { FolderKanban, FolderOpen, CheckCircle2, Clock } from 'lucide-react'
import ManagementPage from '../../components/ManagementPage.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { CASES, CASE_STATUS_OPTIONS } from '../../data/cases.js'
import { formatCurrency, formatDate } from '../../utils/format.js'

const columns = [
  { key: 'claimNo', label: 'Claim No.' },
  { key: 'victim', label: 'Victim' },
  { key: 'vehicle', label: 'Vehicle' },
  { key: 'accidentDate', label: 'Accident Date', render: (row) => formatDate(row.accidentDate) },
  { key: 'court', label: 'Court' },
  { key: 'compensation', label: 'Compensation', render: (row) => formatCurrency(row.compensation) },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
]

const formFields = [
  { name: 'claimNo', label: 'Claim Number', fullWidth: true },
  { name: 'victim', label: 'Victim Name' },
  { name: 'vehicle', label: 'Vehicle Number' },
  { name: 'accidentDate', label: 'Accident Date', type: 'date' },
  { name: 'location', label: 'Accident Location', fullWidth: true },
  { name: 'court', label: 'Court' },
  { name: 'advocate', label: 'Advocate' },
  { name: 'compensation', label: 'Compensation Amount', type: 'number' },
  { name: 'status', label: 'Status', type: 'select', options: CASE_STATUS_OPTIONS },
]

export default function CaseManagement() {
  const stats = [
    { label: 'Total Cases', value: CASES.length, icon: FolderKanban, tone: 'primary' },
    { label: 'Open Cases', value: CASES.filter((c) => c.status === 'Open').length, icon: FolderOpen, tone: 'accent' },
    { label: 'Settled', value: CASES.filter((c) => c.status === 'Settled').length, icon: CheckCircle2, tone: 'success' },
    { label: 'Pending', value: CASES.filter((c) => c.status === 'Pending').length, icon: Clock, tone: 'warning' },
  ]

  return (
    <ManagementPage
      title="Case Management"
      subtitle="Track and manage all motor accident claim cases."
      breadcrumbLabel="Cases"
      initialData={CASES}
      columns={columns}
      formFields={formFields}
      searchKeys={['claimNo', 'victim', 'vehicle', 'court']}
      filterField="status"
      filterOptions={CASE_STATUS_OPTIONS}
      stats={stats}
      idPrefix="CASE"
    />
  )
}
