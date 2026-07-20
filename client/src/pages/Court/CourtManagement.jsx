import React from 'react'
import { Gavel, CalendarClock, FileCheck2, ScrollText } from 'lucide-react'
import ManagementPage from '../../components/ManagementPage.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { COURT_CASES } from '../../data/court.js'
import { formatDate } from '../../utils/format.js'

const columns = [
  { key: 'caseId', label: 'Case ID' },
  { key: 'court', label: 'Court' },
  { key: 'judge', label: 'Judge' },
  { key: 'stage', label: 'Stage' },
  { key: 'nextHearing', label: 'Next Hearing', render: (row) => formatDate(row.nextHearing) },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
]

const formFields = [
  { name: 'caseId', label: 'Case ID', fullWidth: true },
  { name: 'court', label: 'Court Name' },
  { name: 'judge', label: 'Presiding Judge' },
  { name: 'stage', label: 'Case Stage', type: 'select', options: ['Written Statement', 'Evidence', 'Arguments', 'Judgment'] },
  { name: 'nextHearing', label: 'Next Hearing Date', type: 'date' },
  { name: 'status', label: 'Status', type: 'select', options: ['Scheduled', 'Disposed'] },
]

export default function CourtManagement() {
  const stats = [
    { label: 'Total Hearings', value: COURT_CASES.length, icon: Gavel, tone: 'primary' },
    { label: 'Scheduled', value: COURT_CASES.filter((c) => c.status === 'Scheduled').length, icon: CalendarClock, tone: 'accent' },
    { label: 'Disposed', value: COURT_CASES.filter((c) => c.status === 'Disposed').length, icon: FileCheck2, tone: 'success' },
    { label: 'In Arguments', value: COURT_CASES.filter((c) => c.stage === 'Arguments').length, icon: ScrollText, tone: 'warning' },
  ]

  return (
    <ManagementPage
      title="Court Management"
      subtitle="Track hearing schedules and case progress across MACT courts."
      breadcrumbLabel="Court"
      initialData={COURT_CASES}
      columns={columns}
      formFields={formFields}
      searchKeys={['caseId', 'court', 'judge']}
      filterField="status"
      filterOptions={['Scheduled', 'Disposed']}
      stats={stats}
      idPrefix="CRT"
    />
  )
}
