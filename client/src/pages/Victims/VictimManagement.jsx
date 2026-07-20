import React from 'react'
import { Users, HeartPulse, Activity, AlertTriangle } from 'lucide-react'
import ManagementPage from '../../components/ManagementPage.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { VICTIMS, INJURY_TYPES } from '../../data/victims.js'

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'age', label: 'Age' },
  { key: 'gender', label: 'Gender' },
  { key: 'contact', label: 'Contact' },
  { key: 'caseId', label: 'Linked Case' },
  { key: 'injuryType', label: 'Injury Type' },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
]

const formFields = [
  { name: 'name', label: 'Full Name', fullWidth: true },
  { name: 'age', label: 'Age', type: 'number' },
  { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
  { name: 'contact', label: 'Contact Number' },
  { name: 'caseId', label: 'Linked Case ID' },
  { name: 'injuryType', label: 'Injury Type', type: 'select', options: INJURY_TYPES },
  { name: 'address', label: 'Address', fullWidth: true },
  { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
]

export default function VictimManagement() {
  const stats = [
    { label: 'Total Victims', value: VICTIMS.length, icon: Users, tone: 'primary' },
    { label: 'Minor Injuries', value: VICTIMS.filter((v) => v.injuryType === 'Minor').length, icon: HeartPulse, tone: 'success' },
    { label: 'Grievous Injuries', value: VICTIMS.filter((v) => v.injuryType === 'Grievous').length, icon: Activity, tone: 'warning' },
    { label: 'Fatal Cases', value: VICTIMS.filter((v) => v.injuryType === 'Fatal').length, icon: AlertTriangle, tone: 'danger' },
  ]

  return (
    <ManagementPage
      title="Victim Management"
      subtitle="Maintain victim records linked to accident claims."
      breadcrumbLabel="Victims"
      initialData={VICTIMS}
      columns={columns}
      formFields={formFields}
      searchKeys={['name', 'contact', 'caseId']}
      filterField="injuryType"
      filterOptions={INJURY_TYPES}
      filterLabel="Injury Type"
      stats={stats}
      idPrefix="VIC"
    />
  )
}
