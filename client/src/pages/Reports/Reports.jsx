import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  Download, FileBarChart, ShieldCheck, TrendingUp, Wallet,
  AlertTriangle, Loader2,
} from 'lucide-react'
import { formatCurrency } from '../../utils/format.js'
import { exportToCSV } from '../../utils/table.js'
import api from '../../services/api.js'

/* ============================================================
   DESIGN TOKENS — purple (#8433EC) + white only, shared with
   Dashboard.jsx / CaseManagement.jsx / ClaimManagement.jsx /
   DocumentManagement.jsx
   ============================================================ */
const PURPLE = {
  50: "#F5EEFD",
  100: "#ECE0FB",
  200: "#DAC2F7",
  300: "#BE96F1",
  400: "#A166E9",
  500: "#8433EC", // base
  600: "#6E22C9",
  700: "#571AA0",
  800: "#3F1276",
  900: "#2A0B52",
};
const WHITE = "#FFFFFF";

const cardShadow = `8px 8px 20px ${PURPLE[200]}66, -8px -8px 20px ${WHITE}`;
const cardShadowHover = `10px 10px 26px ${PURPLE[300]}66, -10px -10px 26px ${WHITE}`;
const neumorphismStyle = { boxShadow: cardShadow, background: WHITE, borderRadius: 16, transition: "all 0.3s ease" };

/* ============================================================
   UI PRIMITIVES — mirrors Dashboard.jsx / CaseManagement.jsx
   ============================================================ */
const Card = ({ children, style = {} }) => (
  <motion.div
    style={{ ...neumorphismStyle, background: WHITE, ...style }}
    whileHover={{ scale: 1.005, boxShadow: cardShadowHover }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

const NeumorphismButton = ({ onClick, children, disabled }) => (
  <motion.button
    style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
      width: "100%", padding: "10px 18px", borderRadius: 12, border: `1px solid ${PURPLE[100]}`,
      background: WHITE, boxShadow: `6px 6px 14px ${PURPLE[200]}55, -6px -6px 14px ${WHITE}`,
      cursor: disabled ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 13.5,
      color: PURPLE[700], opacity: disabled ? 0.6 : 1, transition: "all 0.3s ease",
    }}
    whileHover={disabled ? {} : { scale: 1.02, boxShadow: cardShadowHover }}
    whileTap={disabled ? {} : { scale: 0.97 }}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </motion.button>
);

/* ============================================================
   FRAMER MOTION VARIANTS
   ============================================================ */
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

/* ============================================================
   STAT TILE
   ============================================================ */
const StatTile = ({ label, value, icon: Icon }) => (
  <Card style={{ padding: 20 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: PURPLE[900] }}>{label}</span>
      <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: PURPLE[50], display: "flex", alignItems: "center", justifyContent: "center", color: PURPLE[500], border: `1px solid ${PURPLE[100]}` }}>
        <Icon size={20} />
      </div>
    </div>
    <div style={{ marginTop: 12, fontSize: 26, fontWeight: 800, color: PURPLE[900], letterSpacing: "-0.03em" }}>{value}</div>
  </Card>
);

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

  const stats = [
    { label: 'Total Cases', value: loading ? '…' : cases.length, icon: FileBarChart },
    { label: 'Total Claims', value: loading ? '…' : claims.length, icon: Wallet },
    { label: 'Total Compensation Paid', value: loading ? '…' : formatCurrency(totalClaimCompensation), icon: Wallet },
    { label: 'Total Insurance Coverage', value: loading ? '…' : formatCurrency(totalCoverage), icon: ShieldCheck },
  ]

  return (
    <div style={{ background: "#faf9fe", minHeight: "100vh", fontFamily: "'Inter', system-ui, -apple-system, sans-serif", paddingBottom: 20 }}>
      <style>{`
        * { box-sizing: border-box; }
        .spin-icon { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <main style={{ maxWidth: 1600, margin: "0 auto", padding: "24px 28px" }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible">

          {/* Page header — plain, no gradient banner */}
          <motion.div variants={itemVariants} style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", margin: 0, color: PURPLE[900] }}>
              <span style={{ color: PURPLE[500] }}>Reports</span>
            </h1>
            <p style={{ fontSize: 13.5, color: PURPLE[600], marginTop: 4, maxWidth: 620, lineHeight: 1.5 }}>
              Generate and export analytical reports across all modules.
            </p>
          </motion.div>

          {error && (
            <motion.div
              variants={itemVariants}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 14, marginBottom: 20, background: PURPLE[900], color: WHITE, fontSize: 13.5, fontWeight: 600 }}
            >
              <AlertTriangle size={16} /> {error}
            </motion.div>
          )}

          {/* Stat tiles */}
          <motion.div variants={containerVariants} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 20 }}>
            {stats.map((s) => <StatTile key={s.label} {...s} />)}
          </motion.div>

          {/* Charts */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, marginBottom: 20 }}>
            <Card style={{ padding: 24 }}>
              <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: PURPLE[900] }}>Case Filing vs Settlement</h3>
              <div style={{ width: "100%", height: 260, borderRadius: 16, overflow: "hidden" }}>
                <ResponsiveContainer>
                  <BarChart data={monthlyCases}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={PURPLE[100]} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: PURPLE[600] }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{ fontSize: 12, fill: PURPLE[600] }} axisLine={false} tickLine={false} width={35} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: `1px solid ${PURPLE[100]}`, boxShadow: `0 10px 25px -5px ${PURPLE[300]}40`, fontSize: 12.5 }}
                    />
                    <Bar dataKey="cases" name="Filed" fill={PURPLE[600]} radius={[6, 6, 0, 0]} />
                    <Bar dataKey="settled" name="Settled" fill={PURPLE[300]} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card style={{ padding: 24 }}>
              <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: PURPLE[900] }}>Compensation Trend</h3>
              <div style={{ width: "100%", height: 260, borderRadius: 16, overflow: "hidden" }}>
                <ResponsiveContainer>
                  <BarChart data={compensationTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={PURPLE[100]} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: PURPLE[600] }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis
                      tick={{ fontSize: 11, fill: PURPLE[600] }}
                      axisLine={false}
                      tickLine={false}
                      width={45}
                      tickFormatter={(v) => (v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${v}`)}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ borderRadius: 12, border: `1px solid ${PURPLE[100]}`, boxShadow: `0 10px 25px -5px ${PURPLE[300]}40`, fontSize: 12.5 }}
                    />
                    <Bar dataKey="amount" name="Amount" fill={PURPLE[500]} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Report type cards */}
          <motion.div
            variants={containerVariants}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}
          >
            {REPORT_TYPES.map((report) => (
              <Card key={report.id} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: PURPLE[50], display: "flex", alignItems: "center", justifyContent: "center", color: PURPLE[500], border: `1px solid ${PURPLE[100]}` }}>
                  <report.icon size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: PURPLE[900] }}>{report.label}</h4>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: PURPLE[600], lineHeight: 1.5 }}>{report.description}</p>
                </div>
                <div style={{ marginTop: "auto" }}>
                  <NeumorphismButton onClick={() => handleGenerate(report.id)} disabled={generating === report.id || loading}>
                    {generating === report.id ? <Loader2 size={15} className="spin-icon" /> : <Download size={15} />}
                    {generating === report.id ? 'Generating...' : 'Export CSV'}
                  </NeumorphismButton>
                </div>
              </Card>
            ))}
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}