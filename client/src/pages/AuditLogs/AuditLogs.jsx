import React from 'react'
import { History, ShieldCheck, Activity, Users } from 'lucide-react'
import PageHeader from '../../components/PageHeader.jsx'
import StatCard from '../../components/StatCard.jsx'
import SearchBar from '../../components/SearchBar.jsx'
import DataTable from '../../components/DataTable.jsx'
import useTableData from '../../hooks/useTableData.js'
import { AUDIT_LOGS } from '../../data/auditLogs.js'
import { exportToCSV } from '../../utils/table.js'
import Button from '../../components/Button.jsx'
import { Download } from 'lucide-react'

const columns = [
  { key: 'timestamp', label: 'Timestamp' },
  { key: 'user', label: 'User' },
  { key: 'action', label: 'Action' },
  { key: 'target', label: 'Target Record' },
  { key: 'ipAddress', label: 'IP Address' },
]

export default function AuditLogs() {
  const { search, setSearch, page, setPage, totalPages, paginated } = useTableData(AUDIT_LOGS, {
    searchKeys: ['user', 'action', 'target'],
    pageSize: 6,
  })

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        subtitle="Review a complete trail of system activity for compliance."
        breadcrumbItems={[{ label: 'Audit Logs' }]}
        actions={
          <Button variant="outline" icon={Download} onClick={() => exportToCSV(AUDIT_LOGS, 'audit-logs.csv')}>
            Export
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Log Entries" value={AUDIT_LOGS.length} icon={History} tone="primary" />
        <StatCard label="Active Users Today" value={new Set(AUDIT_LOGS.map((l) => l.user)).size} icon={Users} tone="accent" />
        <StatCard label="Data Changes" value={AUDIT_LOGS.filter((l) => l.action.includes('Updated') || l.action.includes('Deleted')).length} icon={Activity} tone="warning" />
        <StatCard label="System Integrity" value="100%" icon={ShieldCheck} tone="success" />
      </div>

      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search audit logs..." />
      </div>

      <DataTable
        columns={columns}
        rows={paginated}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyTitle="No audit logs found"
        emptyDescription="Try a different search term."
      />
    </div>
  )
}
