import prisma from '../../../config/prismaClient.js'
import { recordCaseActivity } from '../utils/timeline.util.js'

// PoliceDetail.caseId is @unique — a case has exactly one police record,
// so this is an upsert rather than a strict create, matching how the
// wizard can be re-visited and re-saved (Previous/Next navigation).
export async function savePoliceDetail({ caseId, payload, userId }) {
  const {
    firNumber, firDate, crimeNumber, policeStation,
    investigatingOfficer, investigationStatus, chargeSheetFiled, remarks,
  } = payload

  return prisma.$transaction(async (tx) => {
    const policeDetail = await tx.policeDetail.upsert({
      where: { caseId },
      create: {
        caseId,
        firNumber,
        firDate: firDate ? new Date(firDate) : null,
        crimeNumber: crimeNumber || null,
        policeStation,
        investigatingOfficer: investigatingOfficer || null,
        investigationStatus: investigationStatus || null,
        chargeSheetFiled: Boolean(chargeSheetFiled),
        remarks: remarks || null,
      },
      update: {
        firNumber,
        firDate: firDate ? new Date(firDate) : null,
        crimeNumber: crimeNumber || null,
        policeStation,
        investigatingOfficer: investigatingOfficer || null,
        investigationStatus: investigationStatus || null,
        chargeSheetFiled: Boolean(chargeSheetFiled),
        remarks: remarks || null,
      },
    })

    await recordCaseActivity(tx, {
      caseId,
      userId,
      title: 'Police Details Updated',
      action: 'POLICE_UPDATED',
      newValue: firNumber,
    })

    return policeDetail
  })
}

export async function getPoliceDetailByCaseId(caseId) {
  return prisma.policeDetail.findUnique({ where: { caseId } })
}
