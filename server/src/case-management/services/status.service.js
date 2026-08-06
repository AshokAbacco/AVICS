import prisma from '../../../config/prismaClient.js'
import { recordCaseActivity } from '../utils/timeline.util.js'
import { canTransition, COMPENSATION_STATUS_SYNC_MAP } from '../constants/caseStatus.constants.js'

async function assertCaseExists(tx, caseId) {
  const existingCase = await tx.case.findUnique({ where: { id: caseId } })
  if (!existingCase) {
    const err = new Error('Case not found.')
    err.statusCode = 404
    throw err
  }
  return existingCase
}

// Central place every status change flows through — enforces the
// transition map, writes CaseStatusHistory, and syncs compensation status
// on the LegalDetail when relevant (Case.status is the source of truth).
export async function updateStatus({ caseId, newStatus, userId, remarks }) {
  return prisma.$transaction(async (tx) => {
    const existingCase = await assertCaseExists(tx, caseId)

    if (!canTransition(existingCase.status, newStatus)) {
      const err = new Error(`Cannot move a case from ${existingCase.status} to ${newStatus}.`)
      err.statusCode = 422
      throw err
    }

    const updatedCase = await tx.case.update({ where: { id: caseId }, data: { status: newStatus } })

    await tx.caseStatusHistory.create({
      data: { caseId, oldStatus: existingCase.status, newStatus, changedBy: userId, remarks: remarks || null },
    })

    const syncedCompensation = COMPENSATION_STATUS_SYNC_MAP[newStatus]
    if (syncedCompensation) {
      await tx.legalDetail.updateMany({
        where: { caseId },
        data: { compensationStatus: syncedCompensation },
      })
    }

    await recordCaseActivity(tx, {
      caseId,
      userId,
      title: `Status Changed to ${newStatus.replaceAll('_', ' ')}`,
      action: 'STATUS_UPDATED',
      oldValue: existingCase.status,
      newValue: newStatus,
    })

    return updatedCase
  })
}

// Step 8 "Submit Case" — the one business rule the spec calls out
// explicitly as needing to run as a single transaction across everything.
export async function submitCase({ caseId, userId }) {
  return updateStatus({ caseId, newStatus: 'SUBMITTED', userId, remarks: 'Case submitted for processing.' })
}

export async function assignCase({ caseId, assignedTo, assignedBy, remarks }) {
  return prisma.$transaction(async (tx) => {
    await assertCaseExists(tx, caseId)

    await tx.case.update({ where: { id: caseId }, data: { assignedOfficerId: assignedTo } })

    await tx.caseAssignment.create({
      data: { caseId, assignedTo, assignedBy, remarks: remarks || null },
    })

    await tx.notification.create({
      data: {
        userId: assignedTo,
        title: 'Case Assigned',
        message: `You have been assigned a case.`,
        type: 'INFO',
      },
    })

    await recordCaseActivity(tx, {
      caseId,
      userId: assignedBy,
      title: 'Case Assigned',
      action: 'CASE_ASSIGNED',
      newValue: assignedTo,
    })

    return tx.case.findUnique({ where: { id: caseId } })
  })
}

// Must come from COMPENSATION_APPROVED or COMPENSATION_REJECTED, enforced
// by the same transition map as everything else.
export async function closeCase({ caseId, userId, remarks }) {
  return updateStatus({ caseId, newStatus: 'CLOSED', userId, remarks: remarks || 'Case closed.' })
}

// The ONE legal way backward out of CLOSED — deliberately bypasses the
// forward-only transition map rather than adding CLOSED -> ... to it.
export async function reopenCase({ caseId, userId, remarks }) {
  return prisma.$transaction(async (tx) => {
    const existingCase = await assertCaseExists(tx, caseId)

    if (existingCase.status !== 'CLOSED') {
      const err = new Error('Only a closed case can be reopened.')
      err.statusCode = 422
      throw err
    }

    const updatedCase = await tx.case.update({
      where: { id: caseId }, data: { status: 'UNDER_INVESTIGATION' },
    })

    await tx.caseStatusHistory.create({
      data: {
        caseId, oldStatus: 'CLOSED', newStatus: 'UNDER_INVESTIGATION', changedBy: userId,
        remarks: remarks || 'Case reopened.',
      },
    })

    await recordCaseActivity(tx, {
      caseId, userId, title: 'Case Reopened', action: 'CASE_REOPENED',
      oldValue: 'CLOSED', newValue: 'UNDER_INVESTIGATION',
    })

    return updatedCase
  })
}
