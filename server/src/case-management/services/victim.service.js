import prisma from '../../../config/prismaClient.js'
import { recordCaseActivity } from '../utils/timeline.util.js'
import { createChecklistForVictim } from './document.service.js'

export async function addVictim({ caseId, payload, userId }) {
  const {
    name, guardianRelation, guardianName, age, gender, mobile, email,
    aadhaarNumber, address, injuryType, emergencyContact,
  } = payload

  return prisma.$transaction(async (tx) => {
    const victim = await tx.victim.create({
      data: {
        name,
        guardianRelation: guardianRelation || null,
        guardianName: guardianName || null,
        age: Number(age),
        gender,
        mobile: mobile || null,
        email: email || null,
        aadhaarNumber: aadhaarNumber || null,
        address: address || null,
        injuryType: injuryType || "UNKNOWN",
        emergencyContact: emergencyContact || null,

        case: {
          connect: {
            id: caseId,
          },
        },
      },
    });

    // Victim-level checklist (Aadhaar, PAN, Medical Bills, etc.) is created
    // once per victim, the moment that victim is added.
    await createChecklistForVictim(tx, caseId, victim.id)

    await recordCaseActivity(tx, {
      caseId,
      userId,
      title: 'Victim Details Added',
      action: 'VICTIM_ADDED',
      newValue: name,
    })

    return victim
  })
}

export async function updateVictim({ victimId, payload, userId }) {
  const data = { ...payload }
  if (data.age !== undefined) {
    if (isNaN(Number(data.age))) {
      const err = new Error('Age must be a valid number.')
      err.statusCode = 400
      throw err
    }
    data.age = Number(data.age)
  }
  delete data.caseId

  return prisma.$transaction(async (tx) => {
    const victim = await tx.victim.update({ where: { id: victimId }, data })

    await recordCaseActivity(tx, {
      caseId: victim.caseId,
      userId,
      title: 'Victim Details Updated',
      action: 'VICTIM_UPDATED',
    })

    return victim
  })
}

export async function listVictimsForCase(caseId) {
  return prisma.victim.findMany({ where: { caseId, deletedAt: null }, orderBy: { createdAt: 'asc' } })
}

export async function getVictimById(victimId) {
  return prisma.victim.findUnique({ where: { id: victimId }, include: { medicalDetails: true } })
}

export async function deleteVictim({ victimId, userId }) {
  return prisma.$transaction(async (tx) => {
    const victim = await tx.victim.update({
      where: { id: victimId },
      data: { deletedAt: new Date(), deletedBy: userId },
    })

    await recordCaseActivity(tx, {
      caseId: victim.caseId,
      userId,
      title: 'Victim Removed',
      action: 'VICTIM_DELETED',
    })

    return victim
  })
}
