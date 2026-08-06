import React, { useState, useEffect, useCallback } from 'react'
import { Users, HeartPulse, Activity, AlertTriangle } from 'lucide-react'
import ManagementPage from '../../components/ManagementPage.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { INJURY_TYPES } from '../../data/victims.js'
import { victimsService } from './victims.service.js'

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
  { name: 'guardianRelation', label: 'Relation', type: 'select', options: ['Father', 'Mother', 'Husband', 'Wife', 'Guardian', 'Unknown'] },
  { name: 'guardianName', label: 'Guardian Name' },
  { name: 'age', label: 'Age', type: 'number' },
  { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
  { name: 'contact', label: 'Contact Number' },
  { name: 'aadhaarNumber', label: 'Aadhaar Number (Optional)' },
  { name: 'injuryType', label: 'Injury Type', type: 'select', options: INJURY_TYPES },
  { name: 'caseId', label: 'Linked Case ID' },
  { name: 'address', label: 'Address', fullWidth: true },
  { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
]

export default function VictimManagement() {
  const [victims, setVictims] = useState([])

  // Recompute stats whenever the live victims list changes, instead of the
  // old static VICTIMS mock array.
  const stats = [
    { label: 'Total Victims', value: victims.length, icon: Users, tone: 'primary' },
    { label: 'Minor Injuries', value: victims.filter((v) => v.injuryType === 'Minor').length, icon: HeartPulse, tone: 'success' },
    { label: 'Grievous Injuries', value: victims.filter((v) => v.injuryType === 'Grievous').length, icon: Activity, tone: 'warning' },
    { label: 'Fatal Cases', value: victims.filter((v) => v.injuryType === 'Fatal').length, icon: AlertTriangle, tone: 'danger' },
  ]

  const handleFetch = useCallback(async () => {
    const data = await victimsService.getAll()
    setVictims(data || [])
    return data
  }, [])

  const handleCreate = async (data) => {
    const created = await victimsService.create(data)
    setVictims((prev) => [created, ...prev])
    return created
  }

  const handleUpdate = async (id, data) => {
    const updated = await victimsService.update(id, data)
    setVictims((prev) => prev.map((v) => (v.id === id ? updated : v)))
    return updated
  }

  const handleDelete = async (id) => {
    await victimsService.remove(id)
    setVictims((prev) => prev.filter((v) => v.id !== id))
  }

  // Keep local stats array in sync even though ManagementPage owns its
  // own copy of `items` internally for table rendering.
  useEffect(() => {
    handleFetch()
  }, [handleFetch])

  return (
    <ManagementPage
      title="Victim Management"
      subtitle="Maintain victim records linked to accident claims."
      breadcrumbLabel="Victims"
      initialData={[]}
      columns={columns}
      formFields={formFields}
      searchKeys={['name', 'contact', 'caseId']}
      filterField="injuryType"
      filterOptions={INJURY_TYPES}
      filterLabel="Injury Type"
      stats={stats}
      idPrefix="VIC"
      onFetch={victimsService.getAll}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
    />
  )
}