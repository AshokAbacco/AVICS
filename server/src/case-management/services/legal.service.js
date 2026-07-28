import prisma from '../../../config/prismaClient.js'
import { recordCaseActivity } from '../utils/timeline.util.js'

// No hard-required fields per the spec — an advocate/court may not be
// assigned yet at data-entry time, so this step is intentionally lenient.
export async function saveLegalDetail({ caseId, payload, userId }) {
  const {
    advocateName, advocateMobile, advocateEmail, mvcNumber, mvcFiledDate,
    courtName, compensationStatus, remarks,
  } = payload

  return prisma.$transaction(async (tx) => {
    const legalDetail = await tx.legalDetail.upsert({
      where: { caseId },
      create: {
        caseId,
        advocateName: advocateName || null,
        advocateMobile: advocateMobile || null,
        advocateEmail: advocateEmail || null,
        mvcNumber: mvcNumber || null,
        mvcFiledDate: mvcFiledDate ? new Date(mvcFiledDate) : null,
        courtName: courtName || null,
        compensationStatus: compensationStatus || 'PENDING',
        remarks: remarks || null,
      },
      update: {
        advocateName: advocateName || null,
        advocateMobile: advocateMobile || null,
        advocateEmail: advocateEmail || null,
        mvcNumber: mvcNumber || null,
        mvcFiledDate: mvcFiledDate ? new Date(mvcFiledDate) : null,
        courtName: courtName || null,
        ...(compensationStatus !== undefined && { compensationStatus }),
        remarks: remarks || null,
      },
    })

    await recordCaseActivity(tx, {
      caseId,
      userId,
      title: 'Legal / MVC Details Updated',
      action: 'LEGAL_UPDATED',
    })

    return legalDetail
  })
}

export async function getLegalDetailByCaseId(caseId) {
  return prisma.legalDetail.findUnique({ where: { caseId } })
}
