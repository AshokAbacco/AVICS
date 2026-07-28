import prisma from '../../../config/prismaClient.js'
import { recordCaseActivity } from '../utils/timeline.util.js'

export async function addMedicalDetail({ victimId, payload, userId }) {
  const {
    hospitalName, doctorName, mlcNumber, admissionDate, dischargeDate,
    injuryDetails, death, postmortemDone, treatmentCost, remarks,
  } = payload

  const victim = await prisma.victim.findUnique({ where: { id: victimId } })
  if (!victim) {
    const err = new Error('Victim not found.')
    err.statusCode = 404
    throw err
  }

  return prisma.$transaction(async (tx) => {
    const medicalDetail = await tx.medicalDetail.create({
      data: {
        victimId,
        hospitalName,
        doctorName: doctorName || null,
        mlcNumber: mlcNumber || null,
        admissionDate: admissionDate ? new Date(admissionDate) : null,
        dischargeDate: dischargeDate ? new Date(dischargeDate) : null,
        injuryDetails: injuryDetails || null,
        death: Boolean(death),
        postmortemDone: Boolean(postmortemDone),
        treatmentCost: treatmentCost || null,
        remarks: remarks || null,
      },
    })

    await recordCaseActivity(tx, {
      caseId: victim.caseId,
      userId,
      title: 'Medical Details Added',
      action: 'MEDICAL_ADDED',
      newValue: hospitalName,
    })

    return medicalDetail
  })
}

export async function updateMedicalDetail({ medicalDetailId, payload, userId }) {
  const data = { ...payload }
  if (data.admissionDate) data.admissionDate = new Date(data.admissionDate)
  if (data.dischargeDate) data.dischargeDate = new Date(data.dischargeDate)
  if (data.death !== undefined) data.death = Boolean(data.death)
  if (data.postmortemDone !== undefined) data.postmortemDone = Boolean(data.postmortemDone)
  delete data.victimId

  return prisma.$transaction(async (tx) => {
    const medicalDetail = await tx.medicalDetail.update({ where: { id: medicalDetailId }, data })
    const victim = await tx.victim.findUnique({ where: { id: medicalDetail.victimId } })

    await recordCaseActivity(tx, {
      caseId: victim.caseId,
      userId,
      title: 'Medical Details Updated',
      action: 'MEDICAL_UPDATED',
    })

    return medicalDetail
  })
}

export async function listMedicalForVictim(victimId) {
  return prisma.medicalDetail.findMany({ where: { victimId, deletedAt: null }, orderBy: { createdAt: 'asc' } })
}
