import React from 'react'
import { Building2, BedDouble, Activity, MapPin } from 'lucide-react'
import ManagementPage from '../../components/ManagementPage.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { HOSPITALS } from '../../data/hospitals.js'

const columns = [
  { key: 'name', label: 'Hospital Name' },
  { key: 'city', label: 'City' },
  { key: 'type', label: 'Type' },
  { key: 'contact', label: 'Contact' },
  { key: 'patientsAdmitted', label: 'Patients Admitted' },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
]

const formFields = [
  { name: 'name', label: 'Hospital Name', fullWidth: true },
  { name: 'city', label: 'City' },
  { name: 'type', label: 'Type', type: 'select', options: ['Government', 'Private'] },
  { name: 'contact', label: 'Contact Number' },
  { name: 'patientsAdmitted', label: 'Patients Admitted', type: 'number' },
  { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
]

export default function HospitalManagement() {
  const stats = [
    { label: 'Total Hospitals', value: HOSPITALS.length, icon: Building2, tone: 'primary' },
    { label: 'Patients Admitted', value: HOSPITALS.reduce((sum, h) => sum + h.patientsAdmitted, 0), icon: BedDouble, tone: 'accent' },
    { label: 'Active', value: HOSPITALS.filter((h) => h.status === 'Active').length, icon: Activity, tone: 'success' },
    { label: 'Cities Covered', value: new Set(HOSPITALS.map((h) => h.city)).size, icon: MapPin, tone: 'warning' },
  ]

  return (
    <ManagementPage
      title="Hospital Management"
      subtitle="Manage hospitals treating accident victims."
      breadcrumbLabel="Hospitals"
      initialData={HOSPITALS}
      columns={columns}
      formFields={formFields}
      searchKeys={['name', 'city', 'contact']}
      filterField="type"
      filterOptions={['Government', 'Private']}
      filterLabel="Type"
      stats={stats}
      idPrefix="HOS"
    />
  )
}
