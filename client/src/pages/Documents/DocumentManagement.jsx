//client\src\pages\Documents\DocumentManagement.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText, FileCheck, FileClock, FileX, User, Car, FolderClosed, Eye,
  AlertCircle, RefreshCw, ChevronLeft, ChevronRight,
} from 'lucide-react'
import PageHeader from '../../components/PageHeader.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import SearchBar from '../../components/SearchBar.jsx'
import { formatDate } from '../../utils/format.js'
import { listDocuments } from './services/documentService.js'

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'CASE', label: 'Case-Level' },
  { value: 'VICTIM', label: 'Victim' },
  { value: 'VEHICLE', label: 'Vehicle' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'REJECTED', label: 'Rejected' },
]

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: accent }} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-1.5 text-2xl font-bold text-slate-800">{value}</p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${accent}1A`, color: accent }}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  )
}

export default function DocumentManagement() {
  const [caseNumber, setCaseNumber] = useState('')
  const [category, setCategory] = useState('')
  const [verified, setVerified] = useState('')
  const [page, setPage] = useState(1)
  const limit = 10

  const [result, setResult] = useState({ documents: [], total: 0, stats: { total: 0, PENDING: 0, VERIFIED: 0, REJECTED: 0 } })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    listDocuments({ caseNumber: caseNumber || undefined, category: category || undefined, verified: verified || undefined, page, limit })
      .then(setResult)
      .catch((err) => setError(err?.response?.data?.message || 'Failed to load documents.'))
      .finally(() => setLoading(false))
  }

  // Debounced refetch whenever a filter or page changes.
  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseNumber, category, verified, page])

  // Any filter change resets to page 1.
  useEffect(() => { setPage(1) }, [caseNumber, category, verified])

  const totalPages = Math.max(1, Math.ceil(result.total / limit))

  return (
    <div>
      <PageHeader
        title="Document Management"
        subtitle="Browse, preview, and verify FIRs, medical reports, and case-related documents across every case."
        breadcrumbItems={[{ label: 'Documents' }]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Documents" value={result.stats.total} icon={FileText} accent="#0A4DB3" />
        <StatCard label="Verified" value={result.stats.VERIFIED} icon={FileCheck} accent="#22C55E" />
        <StatCard label="Pending Review" value={result.stats.PENDING} icon={FileClock} accent="#F59E0B" />
        <StatCard label="Rejected" value={result.stats.REJECTED} icon={FileX} accent="#EF4444" />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar value={caseNumber} onChange={setCaseNumber} placeholder="Search by case number..." />
        <div className="flex gap-2">
          <select className="input-base sm:w-48" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORY_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <select className="input-base sm:w-44" value={verified} onChange={(e) => setVerified(e.target.value)}>
            {STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      </div>

      <div className="card mt-4 overflow-hidden">
        {error ? (
          <div className="flex flex-col items-center gap-3 p-10 text-center">
            <AlertCircle className="text-danger" size={24} />
            <p className="text-sm text-slate-500">{error}</p>
            <button onClick={load} className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-primary hover:text-primary">
              <RefreshCw size={13} /> Retry
            </button>
          </div>
        ) : loading ? (
          <div className="p-10 text-center text-sm text-slate-400">Loading documents...</div>
        ) : result.documents.length === 0 ? (
          <div className="p-10 text-center text-sm italic text-slate-300">No documents match these filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead>
                <tr className="border-b border-border bg-slate-50/60 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3">Case</th>
                  <th className="px-4 py-3">Linked To</th>
                  <th className="px-4 py-3">Document Type</th>
                  <th className="px-4 py-3">File</th>
                  <th className="px-4 py-3">Received</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {result.documents.map((doc) => (
                  <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <Link to={`/cases/${doc.case?.id}`} className="text-sm font-medium text-primary hover:underline">
                        {doc.case?.caseNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        {doc.victim ? <User size={13} className="text-slate-400" /> : doc.vehicle ? <Car size={13} className="text-slate-400" /> : <FolderClosed size={13} className="text-slate-400" />}
                        {doc.victim ? doc.victim.name : doc.vehicle ? doc.vehicle.registrationNumber : 'Case-level'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {doc.documentType?.name}
                      {doc.documentType?.isMandatory && <span className="ml-1.5 text-[10px] font-semibold uppercase text-amber-500">required</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {doc.fileUpload ? (
                        <>
                          <span className="block max-w-[180px] truncate text-slate-700">{doc.fileUpload.originalName}</span>
                          <span className="text-xs text-slate-400">{formatBytes(doc.fileUpload.fileSize)}</span>
                        </>
                      ) : (
                        <span className="italic text-slate-300">Not uploaded</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{doc.receivedDate ? formatDate(doc.receivedDate) : '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={doc.verified} /></td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/documents/${doc.id}`}
                        className="flex w-fit items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:border-primary hover:text-primary"
                      >
                        <Eye size={13} /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && result.documents.length > 0 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-xs text-slate-400">
              Page {result.page} of {totalPages} · {result.total} document{result.total === 1 ? '' : 's'}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-slate-600 disabled:opacity-40"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-slate-600 disabled:opacity-40"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}