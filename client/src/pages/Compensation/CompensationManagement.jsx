import React from 'react'
import { Wallet, CheckCircle2, Clock4, XCircle } from 'lucide-react'
import ManagementPage from '../../components/ManagementPage.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { COMPENSATIONS } from '../../data/compensation.js'
import { formatCurrency, formatDate } from '../../utils/format.js'

const columns = [
  { key: 'caseId', label: 'Case ID' },
  { key: 'claimant', label: 'Claimant' },
  { key: 'claimedAmount', label: 'Claimed', render: (row) => formatCurrency(row.claimedAmount) },
  { key: 'awardedAmount', label: 'Awarded', render: (row) => formatCurrency(row.awardedAmount) },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  { key: 'paymentStatus', label: 'Payment', render: (row) => <StatusBadge status={row.paymentStatus} /> },
]

const formFields = [
  { name: 'caseId', label: 'Case ID', fullWidth: true },
  { name: 'claimant', label: 'Claimant Name' },
  { name: 'claimedAmount', label: 'Claimed Amount', type: 'number' },
  { name: 'awardedAmount', label: 'Awarded Amount', type: 'number' },
  { name: 'dateAwarded', label: 'Date Awarded', type: 'date' },
  { name: 'status', label: 'Status', type: 'select', options: ['Pending', 'Approved', 'Settled', 'Rejected'] },
  { name: 'paymentStatus', label: 'Payment Status', type: 'select', options: ['Paid', 'Unpaid'] },
]

export default function CompensationManagement() {
  const totalAwarded = COMPENSATIONS.reduce((sum, c) => sum + c.awardedAmount, 0)
  const stats = [
    { label: 'Total Awarded', value: formatCurrency(totalAwarded), icon: Wallet, tone: 'primary' },
    { label: 'Approved', value: COMPENSATIONS.filter((c) => c.status === 'Approved').length, icon: CheckCircle2, tone: 'success' },
    { label: 'Pending', value: COMPENSATIONS.filter((c) => c.status === 'Pending').length, icon: Clock4, tone: 'warning' },
    { label: 'Rejected', value: COMPENSATIONS.filter((c) => c.status === 'Rejected').length, icon: XCircle, tone: 'danger' },
  ]

  return (
    <ManagementPage
      title="Compensation Management"
      subtitle="Track claim amounts, awards, and disbursement status."
      breadcrumbLabel="Compensation"
      initialData={COMPENSATIONS}
      columns={columns}
      formFields={formFields}
      searchKeys={['caseId', 'claimant']}
      filterField="status"
      filterOptions={['Pending', 'Approved', 'Settled', 'Rejected']}
      stats={stats}
      idPrefix="COMP"
    />
  )
}
