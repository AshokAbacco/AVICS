import React from 'react'
import { Shield, FileWarning, CheckCircle2, Clock3 } from 'lucide-react'
import ManagementPage from '../../components/ManagementPage.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { POLICE_STATIONS } from '../../data/police.js'

const columns = [
  { key: 'name', label: 'Police Station' },
  { key: 'jurisdiction', label: 'Jurisdiction' },
  { key: 'firNo', label: 'FIR No.' },
  { key: 'officer', label: 'Investigating Officer' },
  { key: 'contact', label: 'Contact' },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
]

const formFields = [
  { name: 'name', label: 'Police Station', fullWidth: true },
  { name: 'jurisdiction', label: 'Jurisdiction' },
  { name: 'firNo', label: 'FIR Number' },
  { name: 'officer', label: 'Investigating Officer' },
  { name: 'contact', label: 'Contact Number' },
  { name: 'status', label: 'Status', type: 'select', options: ['Open', 'In Progress', 'Closed'] },
]

export default function PoliceManagement() {
  const stats = [
    { label: 'Total FIRs', value: POLICE_STATIONS.length, icon: Shield, tone: 'primary' },
    { label: 'Open', value: POLICE_STATIONS.filter((p) => p.status === 'Open').length, icon: FileWarning, tone: 'warning' },
    { label: 'In Progress', value: POLICE_STATIONS.filter((p) => p.status === 'In Progress').length, icon: Clock3, tone: 'accent' },
    { label: 'Closed', value: POLICE_STATIONS.filter((p) => p.status === 'Closed').length, icon: CheckCircle2, tone: 'success' },
  ]

  return (
    <ManagementPage
      title="Police Management"
      subtitle="Track FIR records and investigating officer details."
      breadcrumbLabel="Police"
      initialData={POLICE_STATIONS}
      columns={columns}
      formFields={formFields}
      searchKeys={['name', 'firNo', 'officer']}
      filterField="status"
      filterOptions={['Open', 'In Progress', 'Closed']}
      stats={stats}
      idPrefix="POL"
    />
  )
}
