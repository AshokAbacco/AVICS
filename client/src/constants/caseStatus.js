// Matches the CaseStatus enum in schema.prisma exactly. Kept separate from
// constants/status.js because "Approved"/"Rejected" there are shared across
// documents/notifications, and would collide in meaning with case statuses.
export const CASE_STATUS_META = {
  DRAFT:                  { label: 'Draft',                 className: 'bg-slate-100 text-slate-600' },
  SUBMITTED:              { label: 'Submitted',              className: 'bg-primary-50 text-primary-700' },
  PENDING_DOCUMENTS:      { label: 'Pending Documents',      className: 'bg-amber-50 text-amber-700' },
  PENDING_VERIFICATION:   { label: 'Pending Verification',   className: 'bg-amber-50 text-amber-700' },
  UNDER_INVESTIGATION:    { label: 'Under Investigation',    className: 'bg-primary-50 text-primary-700' },
  UNDER_LEGAL_REVIEW:     { label: 'Under Legal Review',     className: 'bg-primary-50 text-primary-700' },
  CLAIM_PROCESSING:       { label: 'Claim Processing',       className: 'bg-primary-50 text-primary-700' },
  COMPENSATION_APPROVED:  { label: 'Compensation Approved',  className: 'bg-emerald-50 text-emerald-700' },
  COMPENSATION_REJECTED:  { label: 'Compensation Rejected',  className: 'bg-red-50 text-red-700' },
  CLOSED:                 { label: 'Closed',                 className: 'bg-slate-100 text-slate-600' },
}

export const CASE_STATUS_OPTIONS = Object.entries(CASE_STATUS_META).map(([value, meta]) => ({
  value,
  label: meta.label,
}))

export const getCaseStatusMeta = (status) =>
  CASE_STATUS_META[status] || { label: status || 'Unknown', className: 'bg-slate-100 text-slate-600' }