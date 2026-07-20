import React from 'react'
import { Car, ShieldCheck, ShieldAlert, Calendar } from 'lucide-react'
import ManagementPage from '../../components/ManagementPage.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { VEHICLES, VEHICLE_TYPES } from '../../data/vehicles.js'
import { formatDate } from '../../utils/format.js'

const columns = [
  { key: 'number', label: 'Vehicle No.' },
  { key: 'type', label: 'Type' },
  { key: 'owner', label: 'Owner' },
  { key: 'insurer', label: 'Insurer' },
  { key: 'policyNo', label: 'Policy No.' },
  { key: 'expiry', label: 'Expiry', render: (row) => formatDate(row.expiry) },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
]

const formFields = [
  { name: 'number', label: 'Vehicle Number', fullWidth: true },
  { name: 'type', label: 'Vehicle Type', type: 'select', options: VEHICLE_TYPES },
  { name: 'owner', label: 'Owner Name' },
  { name: 'insurer', label: 'Insurer' },
  { name: 'policyNo', label: 'Policy Number' },
  { name: 'expiry', label: 'Policy Expiry', type: 'date' },
  { name: 'status', label: 'Verification Status', type: 'select', options: ['Verified', 'Unverified'] },
]

export default function VehicleManagement() {
  const stats = [
    { label: 'Total Vehicles', value: VEHICLES.length, icon: Car, tone: 'primary' },
    { label: 'Verified', value: VEHICLES.filter((v) => v.status === 'Verified').length, icon: ShieldCheck, tone: 'success' },
    { label: 'Unverified', value: VEHICLES.filter((v) => v.status === 'Unverified').length, icon: ShieldAlert, tone: 'warning' },
    { label: 'Expiring Soon', value: 2, icon: Calendar, tone: 'danger' },
  ]

  return (
    <ManagementPage
      title="Vehicle Management"
      subtitle="Manage vehicle registration and insurance verification details."
      breadcrumbLabel="Vehicles"
      initialData={VEHICLES}
      columns={columns}
      formFields={formFields}
      searchKeys={['number', 'owner', 'insurer', 'policyNo']}
      filterField="type"
      filterOptions={VEHICLE_TYPES}
      filterLabel="Vehicle Type"
      stats={stats}
      idPrefix="VEH"
    />
  )
}
