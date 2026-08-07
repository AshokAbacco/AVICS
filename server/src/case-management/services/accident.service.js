// Accident Service

import prisma from '../../../config/prismaClient.js'
import { generateCaseNumber } from '../utils/caseNumber.util.js'
import { recordCaseActivity } from '../utils/timeline.util.js'
import { createChecklistForCase } from './document.service.js'

// Enum columns (AccidentType, WeatherCondition) reject '' — Prisma only
// accepts a real enum member or null/undefined. The wizard's Select
// components always send the field, just as '' when left unchosen, so we
// normalize '' -> null here rather than relying on callers to do it.
function sanitizeEnumValue(value) {
  return value === '' ? null : value
}

// Step 1 of the wizard. This is the ONLY place a Case row gets created.
// caseType/caseCategory aren't collected by the client's Step 1 fields, so
// they default sensibly here and can be edited later from Case Details.
export async function createCaseWithAccident({ userId, payload }) {
  const {
    accidentDate, accidentTime, district, village, taluk, policeStation,
    location, accidentType, weatherCondition, description,
    caseType, caseCategory, priority, source,
  } = payload

  return prisma.$transaction(async (tx) => {
    const caseNumber = await generateCaseNumber(tx)

    const createdCase = await tx.case.create({
      data: {
        caseNumber,
        caseType: caseType || 'Motor Vehicle Claim',
        caseCategory: caseCategory || 'General',
        priority: priority || 'MEDIUM',
        source: source || null,
        description: description || null,
        createdById: userId,
        status: 'DRAFT',
      },
    })

    const accident = await tx.accident.create({
      data: {
        caseId: createdCase.id,
        accidentDate: new Date(accidentDate),
        accidentTime,
        district,
        village: village || null,
        taluk: taluk || null,
        policeStation,
        location: location || null,
        accidentType: sanitizeEnumValue(accidentType),
        weatherCondition: sanitizeEnumValue(weatherCondition),
        description: description || null,
      },
    })

    // Case-level checklist (FIR Copy, Complaint Copy, etc.) exists from
    // the moment the case exists, per our "auto-create on creation" decision.
    await createChecklistForCase(tx, createdCase.id)

    await recordCaseActivity(tx, {
      caseId: createdCase.id,
      userId,
      title: 'Case Created',
      action: 'CASE_CREATED',
      newValue: caseNumber,
    })

    return { case: createdCase, accident }
  })
}

// Used both when editing Step 1 mid-wizard and when editing from the
// Accident tab on an already-submitted case.
export async function updateAccident({ caseId, payload, userId }) {
  const {
    accidentDate, accidentTime, district, village, taluk, policeStation,
    location, accidentType, weatherCondition, description,
  } = payload

  return prisma.$transaction(async (tx) => {
    const accident = await tx.accident.update({
      where: { caseId },
      data: {
        ...(accidentDate !== undefined && { accidentDate: new Date(accidentDate) }),
        ...(accidentTime !== undefined && { accidentTime }),
        ...(district !== undefined && { district }),
        ...(village !== undefined && { village }),
        ...(taluk !== undefined && { taluk }),
        ...(policeStation !== undefined && { policeStation }),
        ...(location !== undefined && { location }),
        ...(accidentType !== undefined && { accidentType: sanitizeEnumValue(accidentType) }),
        ...(weatherCondition !== undefined && { weatherCondition: sanitizeEnumValue(weatherCondition) }),
        ...(description !== undefined && { description }),
      },
    })

    await recordCaseActivity(tx, {
      caseId,
      userId,
      title: 'Accident Details Updated',
      action: 'ACCIDENT_UPDATED',
    })

    return accident
  })
}

export async function getAccidentByCaseId(caseId) {
  return prisma.accident.findUnique({ where: { caseId } })
}