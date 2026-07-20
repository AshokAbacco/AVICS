import React from 'react'
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
import { FolderKanban, Gavel, ShieldCheck, Wallet, FilePlus2, UserPlus, CalendarPlus, FileBarChart } from 'lucide-react'
import PageHeader from '../../components/PageHeader.jsx'
import StatCard from '../../components/StatCard.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { CASES } from '../../data/cases.js'
import { COURT_CASES } from '../../data/court.js'
import { AUDIT_LOGS } from '../../data/auditLogs.js'
import { MONTHLY_CASES, CASE_STATUS_BREAKDOWN, COMPENSATION_TREND } from '../../data/analytics.js'
import { CHART_COLORS } from '../../constants/theme.js'
import { formatCurrency, formatDate } from '../../utils/format.js'

const QUICK_ACTIONS = [
  { label: 'New Case', icon: FilePlus2, to: '/cases' },
  { label: 'Add Victim', icon: UserPlus, to: '/victims' },
  { label: 'Schedule Hearing', icon: CalendarPlus, to: '/calendar' },
  { label: 'Generate Report', icon: FileBarChart, to: '/reports' },
]

export default function Dashboard() {
  const recentCases = CASES.slice(0, 5)
  const upcomingHearings = COURT_CASES.filter((c) => c.status === 'Scheduled').slice(0, 5)
  const recentActivity = AUDIT_LOGS.slice(0, 5)

  const totalCompensation = CASES.reduce((sum, c) => sum + c.compensation, 0)
  const activeCases = CASES.filter((c) => c.status !== 'Closed' && c.status !== 'Settled').length
  const settledCases = CASES.filter((c) => c.status === 'Settled').length

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of claims, hearings, and compensation activity."
        breadcrumbItems={[{ label: 'Dashboard' }]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Cases" value={CASES.length} icon={FolderKanban} tone="primary" trend="+8% this month" delay={0} />
        <StatCard label="Active Cases" value={activeCases} icon={ShieldCheck} tone="accent" trend="6 in progress" delay={0.05} />
        <StatCard label="Settled Cases" value={settledCases} icon={Gavel} tone="success" trend="+2 this week" delay={0.1} />
        <StatCard label="Total Compensation" value={formatCurrency(totalCompensation)} icon={Wallet} tone="warning" delay={0.15} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="card p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Case Filing Trend</h3>
            <span className="text-xs text-slate-400">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={MONTHLY_CASES}>
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
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="cases" name="New Cases" stroke="#0A4DB3" fill="url(#colorCases)" strokeWidth={2} />
              <Area type="monotone" dataKey="settled" name="Settled" stroke="#22C55E" fill="url(#colorSettled)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Case Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={CASE_STATUS_BREAKDOWN}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
              >
                {CASE_STATUS_BREAKDOWN.map((entry, index) => (
                  <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-5 card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Compensation Disbursed</h3>
          <span className="text-xs text-slate-400">Monthly (₹)</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={COMPENSATION_TREND}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Bar dataKey="amount" name="Compensation" fill="#2563EB" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="card p-5 xl:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Recent Cases</h3>
            <Link to="/cases" className="text-xs font-medium text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {recentCases.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-700">{c.claimNo}</p>
                  <p className="text-xs text-slate-400">{c.victim} · {c.vehicle}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
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
            <h3 className="text-sm font-semibold text-slate-700">Upcoming Hearings</h3>
            <Link to="/court" className="text-xs font-medium text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {upcomingHearings.map((h) => (
              <div key={h.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-700">{h.court}</p>
                  <p className="text-xs text-slate-400">{h.caseId} · {h.stage}</p>
                </div>
                <span className="text-xs font-medium text-slate-500">{formatDate(h.nextHearing)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Latest Activities</h3>
            <Link to="/audit-logs" className="text-xs font-medium text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {recentActivity.map((log) => (
              <div key={log.id} className="py-3">
                <p className="text-sm text-slate-700">
                  <span className="font-medium">{log.user}</span> {log.action.toLowerCase()}{' '}
                  <span className="font-medium text-primary">{log.target}</span>
                </p>
                <p className="mt-0.5 text-xs text-slate-400">{log.timestamp}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
