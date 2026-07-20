import React from 'react'
import { FileText, FileCheck, FileClock, HardDrive } from 'lucide-react'
import ManagementPage from '../../components/ManagementPage.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { DOCUMENTS, DOCUMENT_TYPES } from '../../data/documents.js'
import { formatDate } from '../../utils/format.js'

const columns = [
  { key: 'name', label: 'Document Name' },
  { key: 'caseId', label: 'Linked Case' },
  { key: 'type', label: 'Type' },
  { key: 'uploadedOn', label: 'Uploaded On', render: (row) => formatDate(row.uploadedOn) },
  { key: 'size', label: 'Size' },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
]

const formFields = [
  { name: 'name', label: 'Document Name', fullWidth: true },
  { name: 'caseId', label: 'Linked Case ID' },
  { name: 'type', label: 'Document Type', type: 'select', options: DOCUMENT_TYPES },
  { name: 'uploadedOn', label: 'Uploaded On', type: 'date' },
  { name: 'size', label: 'File Size' },
  { name: 'status', label: 'Status', type: 'select', options: ['Verified', 'Unverified'] },
]

export default function DocumentManagement() {
  const stats = [
    { label: 'Total Documents', value: DOCUMENTS.length, icon: FileText, tone: 'primary' },
    { label: 'Verified', value: DOCUMENTS.filter((d) => d.status === 'Verified').length, icon: FileCheck, tone: 'success' },
    { label: 'Pending Review', value: DOCUMENTS.filter((d) => d.status === 'Unverified').length, icon: FileClock, tone: 'warning' },
    { label: 'Storage Used', value: '18.4 MB', icon: HardDrive, tone: 'accent' },
  ]

  return (
    <ManagementPage
      title="Document Management"
      subtitle="Manage FIRs, medical reports, and case-related documents."
      breadcrumbLabel="Documents"
      initialData={DOCUMENTS}
      columns={columns}
      formFields={formFields}
      searchKeys={['name', 'caseId', 'type']}
      filterField="type"
      filterOptions={DOCUMENT_TYPES}
      filterLabel="Document Type"
      stats={stats}
      idPrefix="DOC"
    />
  )
}
