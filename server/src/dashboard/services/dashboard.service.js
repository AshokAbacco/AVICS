// server/src/modules/dashboard/services/dashboard.service.js
//
// Adjust the relative import below to match your actual folder depth
// (this assumes the same depth as case.service.js: modules/<x>/services/).
import prisma from '../../../config/prismaClient.js'

const ATTENTION_STATUSES = [
  'PENDING_DOCUMENTS',
  'PENDING_VERIFICATION',
  'UNDER_INVESTIGATION',
  'UNDER_LEGAL_REVIEW',
  'CLAIM_PROCESSING',
]

// Compensation isn't tracked on Case itself — the only amount fields that
// are actually populated by the current wizard live on InsuranceDetail
// (estimatedClaimAmount, entered in Step 3 / VehicleTab). We treat a case's
// compensation as "real" once its status reaches COMPENSATION_APPROVED or
// CLOSED (Case.status is the source of truth per caseStatus.constants.js).
const COMPENSATION_ELIGIBLE_STATUSES = ['COMPENSATION_APPROVED', 'CLOSED']

function toNumber(decimal) {
  if (decimal === null || decimal === undefined) return 0
  const n = Number(decimal.toString())
  return Number.isNaN(n) ? 0 : n
}

function sumCaseInsurance(vehicles = []) {
  return vehicles.reduce(
    (vSum, v) => vSum + (v.insuranceDetails || []).reduce((iSum, ins) => iSum + toNumber(ins.estimatedClaimAmount), 0),
    0,
  )
}

// Builds an ordered array of the last `n` months (oldest first), each with
// a lookup key and a short display label (e.g. "Jan").
function lastNMonths(n) {
  const now = new Date()
  const months = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('en-IN', { month: 'short' }) })
  }
  return months
}

function monthKey(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${d.getMonth()}`
}

// --- Stat cards -------------------------------------------------------

export async function getDashboardStats() {
  const [totalCases, activeCases, closedCases, compensationEligibleCases] = await Promise.all([
    prisma.case.count({ where: { deletedAt: null } }),
    prisma.case.count({ where: { deletedAt: null, status: { not: 'CLOSED' } } }),
    prisma.case.count({ where: { deletedAt: null, status: 'CLOSED' } }),
    prisma.case.findMany({
      where: { deletedAt: null, status: { in: COMPENSATION_ELIGIBLE_STATUSES } },
      select: { vehicles: { select: { insuranceDetails: { select: { estimatedClaimAmount: true } } } } },
    }),
  ])

  const totalCompensation = compensationEligibleCases.reduce((sum, c) => sum + sumCaseInsurance(c.vehicles), 0)

  return { totalCases, activeCases, closedCases, totalCompensation }
}

// --- Case Filing Trend (new cases vs. cases closed, per month) -------

export async function getCaseFilingTrend(months = 6) {
  const buckets = lastNMonths(months)
  const rangeStart = new Date(new Date().getFullYear(), new Date().getMonth() - (months - 1), 1)

  const [newCases, closedEvents] = await Promise.all([
    prisma.case.findMany({ where: { deletedAt: null, createdAt: { gte: rangeStart } }, select: { createdAt: true } }),
    prisma.caseStatusHistory.findMany({
      where: { newStatus: 'CLOSED', changedAt: { gte: rangeStart } },
      select: { changedAt: true },
    }),
  ])

  const map = new Map(buckets.map((b) => [b.key, { month: b.label, cases: 0, settled: 0 }]))
  newCases.forEach((c) => { const bucket = map.get(monthKey(c.createdAt)); if (bucket) bucket.cases += 1 })
  closedEvents.forEach((e) => { const bucket = map.get(monthKey(e.changedAt)); if (bucket) bucket.settled += 1 })

  return Array.from(map.values())
}

// --- Case Status Breakdown (all 10 CaseStatus values) -----------------

export async function getCaseStatusBreakdown() {
  const grouped = await prisma.case.groupBy({
    by: ['status'],
    where: { deletedAt: null },
    _count: { _all: true },
  })
  return grouped.map((g) => ({ status: g.status, count: g._count._all }))
}

// --- Compensation Trend (₹ approved/disbursed per month) ---------------
// Dated by when the case's status changed to CLOSED, since that's the only
// timestamped "this is final" event currently recorded (CaseStatusHistory).

export async function getCompensationTrend(months = 6) {
  const buckets = lastNMonths(months)
  const rangeStart = new Date(new Date().getFullYear(), new Date().getMonth() - (months - 1), 1)

  const closedEvents = await prisma.caseStatusHistory.findMany({
    where: { newStatus: 'CLOSED', changedAt: { gte: rangeStart } },
    select: {
      changedAt: true,
      case: { select: { vehicles: { select: { insuranceDetails: { select: { estimatedClaimAmount: true } } } } } },
    },
  })

  const map = new Map(buckets.map((b) => [b.key, { month: b.label, amount: 0 }]))
  closedEvents.forEach((e) => {
    const bucket = map.get(monthKey(e.changedAt))
    if (bucket) bucket.amount += sumCaseInsurance(e.case?.vehicles)
  })

  return Array.from(map.values())
}

// --- Recent Cases -------------------------------------------------------

export async function getRecentCases(limit = 5) {
  const cases = await prisma.case.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      victims: { take: 1, orderBy: { createdAt: 'asc' }, select: { name: true } },
      vehicles: { take: 1, select: { registrationNumber: true } },
    },
  })

  return cases.map((c) => ({
    id: c.id,
    caseNumber: c.caseNumber,
    victim: c.victims[0]?.name || null,
    vehicle: c.vehicles[0]?.registrationNumber || null,
    status: c.status,
    createdAt: c.createdAt,
  }))
}

// --- Cases Needing Attention ---------------------------------------------
// Real, actionable replacement for a "hearings calendar" widget the schema
// doesn't back — cases mid-pipeline, oldest-untouched first.

export async function getCasesNeedingAttention(limit = 5) {
  const cases = await prisma.case.findMany({
    where: { deletedAt: null, status: { in: ATTENTION_STATUSES } },
    orderBy: { updatedAt: 'asc' },
    take: limit,
    include: { victims: { take: 1, orderBy: { createdAt: 'asc' }, select: { name: true } } },
  })

  return cases.map((c) => ({
    id: c.id,
    caseNumber: c.caseNumber,
    victim: c.victims[0]?.name || null,
    status: c.status,
    updatedAt: c.updatedAt,
  }))
}

// --- Latest Activities (real ActivityLog rows) ---------------------------

export async function getRecentActivity(limit = 5) {
  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      user: { select: { name: true } },
      case: { select: { caseNumber: true } },
    },
  })

  return logs.map((log) => ({
    id: log.id,
    user: log.user?.name || 'System',
    action: log.action,
    target: log.case?.caseNumber || null,
    createdAt: log.createdAt,
  }))
}

// --- Combined summary — one round trip for the whole Dashboard page ------

export async function getDashboardSummary() {
  const [stats, caseFilingTrend, statusBreakdown, compensationTrend, recentCases, casesNeedingAttention, recentActivity] =
    await Promise.all([
      getDashboardStats(),
      getCaseFilingTrend(6),
      getCaseStatusBreakdown(),
      getCompensationTrend(6),
      getRecentCases(5),
      getCasesNeedingAttention(5),
      getRecentActivity(5),
    ])

  return { stats, caseFilingTrend, statusBreakdown, compensationTrend, recentCases, casesNeedingAttention, recentActivity }
}