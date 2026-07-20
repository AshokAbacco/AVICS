import React from 'react'
import { Briefcase, UserCheck, Scale, UserX } from 'lucide-react'
import ManagementPage from '../../components/ManagementPage.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { ADVOCATES } from '../../data/advocates.js'

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'barNo', label: 'Bar Registration No.' },
  { key: 'specialization', label: 'Specialization' },
  { key: 'activeCases', label: 'Active Cases' },
  { key: 'contact', label: 'Contact' },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
]

const formFields = [
  { name: 'name', label: 'Advocate Name', fullWidth: true },
  { name: 'barNo', label: 'Bar Registration No.' },
  { name: 'specialization', label: 'Specialization' },
  { name: 'activeCases', label: 'Active Cases', type: 'number' },
  { name: 'contact', label: 'Contact Number' },
  { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
]

export default function AdvocateManagement() {
  const stats = [
    { label: 'Total Advocates', value: ADVOCATES.length, icon: Briefcase, tone: 'primary' },
    { label: 'Active', value: ADVOCATES.filter((a) => a.status === 'Active').length, icon: UserCheck, tone: 'success' },
    { label: 'Total Active Cases', value: ADVOCATES.reduce((sum, a) => sum + a.activeCases, 0), icon: Scale, tone: 'accent' },
    { label: 'Inactive', value: ADVOCATES.filter((a) => a.status === 'Inactive').length, icon: UserX, tone: 'warning' },
  ]

  return (
    <ManagementPage
      title="Advocate Management"
      subtitle="Manage empanelled advocates handling motor accident claims."
      breadcrumbLabel="Advocates"
      initialData={ADVOCATES}
      columns={columns}
      formFields={formFields}
      searchKeys={['name', 'barNo', 'specialization']}
      filterField="status"
      filterOptions={['Active', 'Inactive']}
      stats={stats}
      idPrefix="ADV"
    />
  )
}
