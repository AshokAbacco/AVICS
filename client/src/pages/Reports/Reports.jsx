import React, { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Download, FileBarChart, FileSpreadsheet, TrendingUp, Wallet } from 'lucide-react'
import PageHeader from '../../components/PageHeader.jsx'
import StatCard from '../../components/StatCard.jsx'
import Button from '../../components/Button.jsx'
import { CASES } from '../../data/cases.js'
import { COMPENSATIONS } from '../../data/compensation.js'
import { MONTHLY_CASES, COMPENSATION_TREND } from '../../data/analytics.js'
import { formatCurrency } from '../../utils/format.js'
import { exportToCSV } from '../../utils/table.js'

const REPORT_TYPES = [
  { id: 'cases', label: 'Case Summary Report', icon: FileBarChart, description: 'All cases with status and compensation.' },
  { id: 'compensation', label: 'Compensation Report', icon: Wallet, description: 'Claimed vs awarded amounts by case.' },
  { id: 'trend', label: 'Monthly Trend Report', icon: TrendingUp, description: 'Case filing and settlement trend.' },
]

export default function Reports() {
  const [generating, setGenerating] = useState(null)

  const handleGenerate = (reportId) => {
    setGenerating(reportId)
    setTimeout(() => {
      if (reportId === 'cases') exportToCSV(CASES, 'case-summary-report.csv')
      if (reportId === 'compensation') exportToCSV(COMPENSATIONS, 'compensation-report.csv')
      if (reportId === 'trend') exportToCSV(MONTHLY_CASES, 'monthly-trend-report.csv')
      setGenerating(null)
    }, 500)
  }

  const totalCompensation = CASES.reduce((sum, c) => sum + c.compensation, 0)

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Generate and export analytical reports across all modules."
        breadcrumbItems={[{ label: 'Reports' }]}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Cases" value={CASES.length} icon={FileBarChart} tone="primary" />
        <StatCard label="Total Compensation" value={formatCurrency(totalCompensation)} icon={Wallet} tone="success" />
        <StatCard label="Reports Available" value={REPORT_TYPES.length} icon={FileSpreadsheet} tone="accent" />
        <StatCard label="Avg. Settlement Time" value="94 days" icon={TrendingUp} tone="warning" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Case Filing vs Settlement</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={MONTHLY_CASES}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="cases" name="Filed" fill="#0A4DB3" radius={[6, 6, 0, 0]} />
              <Bar dataKey="settled" name="Settled" fill="#22C55E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Compensation Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={COMPENSATION_TREND}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="amount" name="Amount" fill="#60A5FA" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {REPORT_TYPES.map((report) => (
          <div key={report.id} className="card flex flex-col gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary">
              <report.icon size={20} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800">{report.label}</h4>
              <p className="mt-1 text-xs text-slate-500">{report.description}</p>
            </div>
            <Button
              variant="outline"
              icon={Download}
              onClick={() => handleGenerate(report.id)}
              disabled={generating === report.id}
              className="mt-auto"
            >
              {generating === report.id ? 'Generating...' : 'Export CSV'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
