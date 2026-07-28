// Mirrors the CaseStatus enum in schema.prisma.
export const CASE_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  PENDING_DOCUMENTS: 'PENDING_DOCUMENTS',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  UNDER_INVESTIGATION: 'UNDER_INVESTIGATION',
  UNDER_LEGAL_REVIEW: 'UNDER_LEGAL_REVIEW',
  CLAIM_PROCESSING: 'CLAIM_PROCESSING',
  COMPENSATION_APPROVED: 'COMPENSATION_APPROVED',
  COMPENSATION_REJECTED: 'COMPENSATION_REJECTED',
  CLOSED: 'CLOSED',
}

// Forward-only transition map used by updateStatus(). CLOSED -> back out
// is intentionally NOT listed here; that only happens via reopenCase(),
// which bypasses this map on purpose (see status.service.js).
export const STATUS_TRANSITIONS = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['PENDING_DOCUMENTS', 'PENDING_VERIFICATION'],
  PENDING_DOCUMENTS: ['PENDING_VERIFICATION'],
  PENDING_VERIFICATION: ['UNDER_INVESTIGATION'],
  UNDER_INVESTIGATION: ['UNDER_LEGAL_REVIEW'],
  UNDER_LEGAL_REVIEW: ['CLAIM_PROCESSING'],
  CLAIM_PROCESSING: ['COMPENSATION_APPROVED', 'COMPENSATION_REJECTED'],
  COMPENSATION_APPROVED: ['CLOSED'],
  COMPENSATION_REJECTED: ['CLOSED'],
  CLOSED: [],
}

// Statuses that, when set, should also sync LegalDetail.compensationStatus
// (per our earlier decision — Case.status is the source of truth).
export const COMPENSATION_STATUS_SYNC_MAP = {
  COMPENSATION_APPROVED: 'APPROVED',
  COMPENSATION_REJECTED: 'REJECTED',
}

export function canTransition(fromStatus, toStatus) {
  const allowed = STATUS_TRANSITIONS[fromStatus] || []
  return allowed.includes(toStatus)
}
