import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderKanban, FolderOpen, CheckCircle2, Clock, Plus } from 'lucide-react'
import PageHeader from '../../components/PageHeader.jsx'
import StatCard from '../../components/StatCard.jsx'
import SearchBar from '../../components/SearchBar.jsx'
import FilterBar from '../../components/FilterBar.jsx'
import DataTable from '../../components/DataTable.jsx'
import Button from '../../components/Button.jsx'
import CaseStatusBadge from '../../components/CaseStatusBadge/CaseStatusBadge.jsx'
import { CASE_STATUS_OPTIONS } from '../../constants/caseStatus.js'
import { getCases, deleteCase } from './services/caseWizardService.js'

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// A draft still belongs in the wizard — send it back to resume there, not
// to the (not-yet-built) read-only Case Details page.
function getViewPath(caseRecord) {
  return caseRecord.status === 'DRAFT'
    ? `/cases/new/${caseRecord.id}/accident`
    : `/cases/${caseRecord.id}`
}

const columns = [
  { key: 'caseNumber', label: 'Case No.', render: (row) => <span className="font-medium text-primary">{row.caseNumber}</span> },
  { key: 'victim', label: 'Victim', render: (row) => row.victims?.[0]?.name || '—' },
  { key: 'vehicle', label: 'Vehicle', render: (row) => row.vehicles?.[0]?.registrationNumber || '—' },
  { key: 'accidentDate', label: 'Accident Date', render: (row) => formatDate(row.accident?.accidentDate) },
  { key: 'district', label: 'District', render: (row) => row.accident?.district || '—' },
  { key: 'status', label: 'Status', render: (row) => <CaseStatusBadge status={row.status} /> },
]

// FilterBar works with plain label strings (and prefixes "All {label}" itself),
// so we keep the selected *label* in state and map it back to the enum value
// only when calling the API.
const STATUS_LABELS = CASE_STATUS_OPTIONS.map((o) => o.label)
const LABEL_TO_VALUE = Object.fromEntries(CASE_STATUS_OPTIONS.map((o) => [o.label, o.value]))

export default function CaseManagement() {
  const navigate = useNavigate()

  const [cases, setCases] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [search, setSearch] = useState('')
  const [filterLabel, setFilterLabel] = useState('All')
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  const fetchCases = useCallback((page = 1) => {
    setLoading(true)
    setErrorMsg('')
    const status = filterLabel === 'All' ? undefined : LABEL_TO_VALUE[filterLabel]

    getCases({ search: search || undefined, status, page })
      .then((res) => {
        setCases(res.data)
        setPagination(res.pagination)
      })
      .catch((err) => setErrorMsg(err?.response?.data?.message || 'Failed to load cases.'))
      .finally(() => setLoading(false))
  }, [search, filterLabel])

  // Debounced so typing in search doesn't fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => fetchCases(1), 300)
    return () => clearTimeout(timer)
  }, [fetchCases])

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete case ${row.caseNumber}? This cannot be undone.`)) return
    try {
      await deleteCase(row.id)
      fetchCases(pagination.page)
    } catch (err) {
      window.alert(err?.response?.data?.message || 'Failed to delete case.')
    }
  }

  const stats = [
    { label: 'Total Cases', value: pagination.total, icon: FolderKanban, tone: 'primary' },
    { label: 'Under Investigation', value: cases.filter((c) => c.status === 'UNDER_INVESTIGATION').length, icon: FolderOpen, tone: 'accent' },
    { label: 'Compensation Approved', value: cases.filter((c) => c.status === 'COMPENSATION_APPROVED').length, icon: CheckCircle2, tone: 'success' },
    { label: 'Pending Verification', value: cases.filter((c) => c.status === 'PENDING_VERIFICATION').length, icon: Clock, tone: 'warning' },
  ]

  return (
    <div>
      <PageHeader
        title="Case Management"
        subtitle="Track and manage all motor accident claim cases."
        breadcrumbItems={[{ label: 'Cases' }]}
        actions={
          <Button icon={Plus} onClick={() => navigate('/cases/new')}>
            Add Case
          </Button>
        }
      />

      {errorMsg && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
          {errorMsg}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, idx) => (
          <StatCard key={stat.label} {...stat} delay={idx * 0.05} />
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          value={search} onChange={setSearch}
          placeholder="Search by case number, victim, vehicle, FIR, MVC..."
        />
        <FilterBar value={filterLabel} onChange={setFilterLabel} options={STATUS_LABELS} label="Status" />
      </div>

      <DataTable
        columns={columns}
        rows={cases}
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={fetchCases}
        onView={(row) => navigate(getViewPath(row))}
        onDelete={handleDelete}
        loading={loading}
        emptyTitle="No cases found"
        emptyDescription="Try a different search term or filter, or add a new case to get started."
      />
    </div>
  )
}