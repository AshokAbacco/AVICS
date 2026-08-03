import React, { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Download, FileBarChart, FileSpreadsheet, ShieldCheck, TrendingUp, Wallet } from 'lucide-react'
import PageHeader from '../../components/PageHeader.jsx'
import StatCard from '../../components/StatCard.jsx'
import Button from '../../components/Button.jsx'
import { formatCurrency } from '../../utils/format.js'
import { exportToCSV } from '../../utils/table.js'
import api from '../../services/api.js'

const REPORT_TYPES = [
  { id: 'cases', label: 'Case Summary Report', icon: FileBarChart, description: 'All cases with status and priority.' },
  { id: 'claims', label: 'Claim Management Report', icon: Wallet, description: 'Claim status, amounts and payment status by case.' },
  { id: 'insurance', label: 'Insurance Management Report', icon: ShieldCheck, description: 'Policy details and coverage by vehicle.' },
  { id: 'trend', label: 'Monthly Trend Report', icon: TrendingUp, description: 'Case filing and settlement trend.' },
]

// Statuses treated as "settled" for the filing-vs-settlement chart.
// Adjust this list if your workflow defines settlement differently.
const SETTLED_STATUSES = ['COMPENSATION_APPROVED', 'CLOSED']

// Flattens a nested API response into a CSV-friendly shape.
function toCsvRows(records, fields) {
  return records.map((record) =>
    fields.reduce((row, field) => {
      row[field.label] = field.value(record)
      return row
    }, {})
  )
}

const CASE_CSV_FIELDS = [
  { label: 'Case Number', value: (c) => c.caseNumber },
  { label: 'Case Type', value: (c) => c.caseType },
  { label: 'Case Category', value: (c) => c.caseCategory },
  { label: 'Priority', value: (c) => c.priority },
  { label: 'Status', value: (c) => c.status },
  { label: 'Source', value: (c) => c.source ?? '' },
  { label: 'Created At', value: (c) => (c.createdAt ? c.createdAt.slice(0, 10) : '') },
]

const CLAIM_CSV_FIELDS = [
  { label: 'Claim Number', value: (c) => c.claimNumber },
  { label: 'Case Number', value: (c) => c.case?.caseNumber ?? '' },
  { label: 'Claimant Name', value: (c) => c.claimantName },
  { label: 'Claim Type', value: (c) => c.claimType },
  { label: 'Claim Amount', value: (c) => Number(c.claimAmount || 0) },
  { label: 'Approved Amount', value: (c) => Number(c.approvedAmount || 0) },
  { label: 'Compensation Amount', value: (c) => Number(c.compensationAmount || 0) },
  { label: 'Status', value: (c) => c.status },
  { label: 'Payment Status', value: (c) => c.paymentStatus },
  { label: 'Submitted Date', value: (c) => (c.submittedDate ? c.submittedDate.slice(0, 10) : '') },
]

const INSURANCE_CSV_FIELDS = [
  { label: 'Policy Number', value: (i) => i.policyNumber },
  { label: 'Vehicle Registration', value: (i) => i.vehicle?.registrationNumber ?? '' },
  { label: 'Insurance Company', value: (i) => i.insuranceCompany },
  { label: 'Policy Holder', value: (i) => i.policyHolder },
  { label: 'Policy Start Date', value: (i) => (i.policyStartDate ? i.policyStartDate.slice(0, 10) : '') },
  { label: 'Policy End Date', value: (i) => (i.policyEndDate ? i.policyEndDate.slice(0, 10) : '') },
  { label: 'Coverage Amount', value: (i) => Number(i.coverageAmount || 0) },
  { label: 'Estimated Claim Amount', value: (i) => Number(i.estimatedClaimAmount || 0) },
]

// Builds an ordered list of the last `count` months as { key: 'YYYY-M', label: 'Jan' }.
function getLastMonths(count) {
  const months = []
  const now = new Date()
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleString('default', { month: 'short' }),
    })
  }
  return months
}

function monthKey(dateString) {
  if (!dateString) return null
  const d = new Date(dateString)
  if (Number.isNaN(d.getTime())) return null
  return `${d.getFullYear()}-${d.getMonth()}`
}

export default function Reports() {
  const [generating, setGenerating] = useState(null)
  const [cases, setCases] = useState([])
  const [claims, setClaims] = useState([])
  const [insurance, setInsurance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function loadReportData() {
      setLoading(true)
      setError(null)
      try {
        const [casesRes, claimsRes, insuranceRes] = await Promise.all([
          api.get('/cases'),
          api.get('/claims'),
          api.get('/insurance'),
        ])
        if (cancelled) return
        setCases(casesRes.data?.data ?? [])
        setClaims(claimsRes.data?.data ?? [])
        setInsurance(insuranceRes.data?.data ?? [])
      } catch (err) {
        if (!cancelled) setError('Failed to load report data from the server.')
        console.error('Reports data fetch error:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadReportData()
    return () => {
      cancelled = true
    }
  }, [])

  const handleGenerate = async (reportId) => {
    setGenerating(reportId)
    try {
      if (reportId === 'cases') {
        const data = cases.length ? cases : (await api.get('/cases')).data?.data ?? []
        exportToCSV(toCsvRows(data, CASE_CSV_FIELDS), 'case-summary-report.csv')
      }
      if (reportId === 'trend') {
        exportToCSV(monthlyCases, 'monthly-trend-report.csv')
      }
      if (reportId === 'claims') {
        const data = claims.length ? claims : (await api.get('/claims')).data?.data ?? []
        exportToCSV(toCsvRows(data, CLAIM_CSV_FIELDS), 'claim-management-report.csv')
      }
      if (reportId === 'insurance') {
        const data = insurance.length ? insurance : (await api.get('/insurance')).data?.data ?? []
        exportToCSV(toCsvRows(data, INSURANCE_CSV_FIELDS), 'insurance-management-report.csv')
      }
    } catch (err) {
      console.error('Report export error:', err)
      setError(`Failed to generate the ${reportId} report.`)
    } finally {
      setGenerating(null)
    }
  }

  const totalClaimCompensation = claims.reduce((sum, c) => sum + Number(c.compensationAmount || 0), 0)
  const totalCoverage = insurance.reduce((sum, i) => sum + Number(i.coverageAmount || 0), 0)

  // Case filing vs settlement, last 6 months.
  // "Filed" = cases created in that month. "Settled" = cases currently in a
  // settled status (see SETTLED_STATUSES), bucketed by their last-updated month.
  const monthlyCases = useMemo(() => {
    const months = getLastMonths(6)
    const buckets = Object.fromEntries(months.map((m) => [m.key, { month: m.label, cases: 0, settled: 0 }]))

    cases.forEach((c) => {
      const filedKey = monthKey(c.createdAt)
      if (filedKey && buckets[filedKey]) buckets[filedKey].cases += 1

      if (SETTLED_STATUSES.includes(c.status)) {
        const settledKey = monthKey(c.updatedAt)
        if (settledKey && buckets[settledKey]) buckets[settledKey].settled += 1
      }
    })

    return months.map((m) => buckets[m.key])
  }, [cases])

  // Compensation trend, last 6 months — sum of claim compensationAmount by submitted month.
  const compensationTrend = useMemo(() => {
    const months = getLastMonths(6)
    const buckets = Object.fromEntries(months.map((m) => [m.key, { month: m.label, amount: 0 }]))

    claims.forEach((c) => {
      const key = monthKey(c.submittedDate)
      if (key && buckets[key]) buckets[key].amount += Number(c.compensationAmount || 0)
    })

    return months.map((m) => buckets[m.key])
  }, [claims])

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Generate and export analytical reports across all modules."
        breadcrumbItems={[{ label: 'Reports' }]}
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Cases"
          value={loading ? '...' : cases.length}
          icon={FileBarChart}
          tone="primary"
        />
        <StatCard
          label="Total Claims"
          value={loading ? '...' : claims.length}
          icon={Wallet}
          tone="accent"
        />
        <StatCard
          label="Total Compensation Paid"
          value={loading ? '...' : formatCurrency(totalClaimCompensation)}
          icon={Wallet}
          tone="success"
        />
        <StatCard
          label="Total Insurance Coverage"
          value={loading ? '...' : formatCurrency(totalCoverage)}
          icon={ShieldCheck}
          tone="warning"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Case Filing vs Settlement</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyCases}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="cases" name="Filed" fill="#0A4DB3" radius={[6, 6, 0, 0]} />
              <Bar dataKey="settled" name="Settled" fill="#22C55E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Compensation Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={compensationTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="amount" name="Amount" fill="#60A5FA" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
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
              disabled={generating === report.id || loading}
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