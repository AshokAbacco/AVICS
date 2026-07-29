import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  FolderKanban, Gavel, ShieldCheck, Wallet, FilePlus2, Users, FileBarChart,
  AlertCircle, RefreshCw,
} from 'lucide-react'
import PageHeader from '../../components/PageHeader.jsx'
import StatCard from '../../components/StatCard.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { CHART_COLORS } from '../../constants/theme.js'
import { formatCurrency, formatDate } from '../../utils/format.js'
import { getDashboardSummary } from './services/dashboardService.js'

const QUICK_ACTIONS = [
  { label: 'New Case', icon: FilePlus2, to: '/cases/new' },
  { label: 'Case Management', icon: FolderKanban, to: '/cases' },
  { label: 'Manage Users', icon: Users, to: '/users' },
  { label: 'Generate Report', icon: FileBarChart, to: '/reports' },
]

// Mirrors CaseStatus in schema.prisma / caseStatus.constants.js — used to
// turn enum values into readable Pie chart labels.
const STATUS_LABELS = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  PENDING_DOCUMENTS: 'Pending Documents',
  PENDING_VERIFICATION: 'Pending Verification',
  UNDER_INVESTIGATION: 'Under Investigation',
  UNDER_LEGAL_REVIEW: 'Under Legal Review',
  CLAIM_PROCESSING: 'Claim Processing',
  COMPENSATION_APPROVED: 'Compensation Approved',
  COMPENSATION_REJECTED: 'Compensation Rejected',
  CLOSED: 'Closed',
}

function formatActivityAction(action) {
  if (!action) return ''
  return action.replaceAll('_', ' ').toLowerCase()
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = () => {
    setLoading(true)
    setError(null)
    getDashboardSummary()
      .then(setSummary)
      .catch((err) => setError(err?.response?.data?.message || 'Failed to load dashboard data.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Dashboard"
          subtitle="Overview of claims, hearings, and compensation activity."
          breadcrumbItems={[{ label: 'Dashboard' }]}
        />
        <div className="card p-10 text-center text-sm text-slate-400">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <PageHeader
          title="Dashboard"
          subtitle="Overview of claims, hearings, and compensation activity."
          breadcrumbItems={[{ label: 'Dashboard' }]}
        />
        <div className="card flex flex-col items-center gap-3 p-10 text-center">
          <AlertCircle className="text-danger" size={28} />
          <p className="text-sm text-slate-500">{error}</p>
          <button
            onClick={load}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-primary hover:text-primary"
          >
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      </div>
    )
  }

  const { stats, caseFilingTrend, statusBreakdown, compensationTrend, recentCases, casesNeedingAttention, recentActivity } = summary

  const statusPieData = statusBreakdown.map((s) => ({ name: STATUS_LABELS[s.status] || s.status, value: s.count }))

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of claims, hearings, and compensation activity."
        breadcrumbItems={[{ label: 'Dashboard' }]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Cases" value={stats.totalCases} icon={FolderKanban} tone="primary" delay={0} />
        <StatCard label="Active Cases" value={stats.activeCases} icon={ShieldCheck} tone="accent" delay={0.05} />
        <StatCard label="Closed Cases" value={stats.closedCases} icon={Gavel} tone="success" delay={0.1} />
        <StatCard label="Compensation Approved" value={formatCurrency(stats.totalCompensation)} icon={Wallet} tone="warning" delay={0.15} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="card p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Case Filing Trend</h3>
            <span className="text-xs text-slate-400">Last 6 months</span>
          </div>
          {caseFilingTrend.every((m) => m.cases === 0 && m.settled === 0) ? (
            <p className="py-16 text-center text-sm italic text-slate-300">No case activity in the last 6 months yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={caseFilingTrend}>
                <defs>
                  <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0A4DB3" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0A4DB3" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSettled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="cases" name="New Cases" stroke="#0A4DB3" fill="url(#colorCases)" strokeWidth={2} />
                <Area type="monotone" dataKey="settled" name="Closed" stroke="#22C55E" fill="url(#colorSettled)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Case Status Breakdown</h3>
          {statusPieData.length === 0 ? (
            <p className="py-16 text-center text-sm italic text-slate-300">No cases recorded yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusPieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {statusPieData.map((entry, index) => (
                    <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="mt-5 card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Compensation Approved on Case Closure</h3>
          <span className="text-xs text-slate-400">Monthly (₹)</span>
        </div>
        {compensationTrend.every((m) => m.amount === 0) ? (
          <p className="py-16 text-center text-sm italic text-slate-300">No cases closed in the last 6 months yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={compensationTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="amount" name="Compensation" fill="#2563EB" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="card p-5 xl:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Recent Cases</h3>
            <Link to="/cases" className="text-xs font-medium text-primary hover:underline">View all</Link>
          </div>
          {recentCases.length === 0 ? (
            <p className="py-6 text-sm italic text-slate-300">No cases recorded yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {recentCases.map((c) => (
                <Link key={c.id} to={`/cases/${c.id}`} className="flex items-center justify-between py-3 hover:bg-slate-50/60">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{c.caseNumber}</p>
                    <p className="text-xs text-slate-400">{c.victim || 'No victim recorded'} · {c.vehicle || 'No vehicle recorded'}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className="flex flex-col items-center gap-2 rounded-xl border border-border p-4 text-center hover:border-primary hover:bg-primary-50/60"
              >
                <action.icon size={20} className="text-primary" />
                <span className="text-xs font-medium text-slate-600">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Cases Needing Attention</h3>
            <Link to="/cases" className="text-xs font-medium text-primary hover:underline">View all</Link>
          </div>
          {casesNeedingAttention.length === 0 ? (
            <p className="py-6 text-sm italic text-slate-300">Nothing waiting on action right now.</p>
          ) : (
            <div className="divide-y divide-border">
              {casesNeedingAttention.map((c) => (
                <Link key={c.id} to={`/cases/${c.id}`} className="flex items-center justify-between py-3 hover:bg-slate-50/60">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{c.caseNumber}</p>
                    <p className="text-xs text-slate-400">{c.victim || 'No victim recorded'} · updated {formatDate(c.updatedAt)}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Latest Activities</h3>
            <Link to="/audit-logs" className="text-xs font-medium text-primary hover:underline">View all</Link>
          </div>
          {recentActivity.length === 0 ? (
            <p className="py-6 text-sm italic text-slate-300">No activity recorded yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {recentActivity.map((log) => (
                <div key={log.id} className="py-3">
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">{log.user}</span> {formatActivityAction(log.action)}{' '}
                    {log.target && <span className="font-medium text-primary">{log.target}</span>}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">{formatDate(log.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}