import prisma from '../../../config/prismaClient.js'
import { recordCaseActivity } from '../utils/timeline.util.js'
import { createChecklistForVehicle } from './document.service.js'

// Adds one Vehicle + its nested InsuranceDetail. Called once per vehicle
// card in Step 3 — a case with 3 vehicles means 3 calls to this.
export async function addVehicle({ caseId, payload, userId }) {
  const {
    registrationNumber, vehicleType, brand, model, ownerName, driverName,
    drivingLicence, rcNumber,
    insuranceCompany, policyNumber, policyHolder, policyStartDate,
    policyEndDate, surveyor, coverageAmount, estimatedClaimAmount,
  } = payload

  return prisma.$transaction(async (tx) => {
    const vehicle = await tx.vehicle.create({
      data: {
        caseId,
        registrationNumber,
        vehicleType,
        brand: brand || null,
        model: model || null,
        ownerName,
        driverName: driverName || null,
        drivingLicence: drivingLicence || null,
        rcNumber: rcNumber || null,
      },
    })

    await tx.insuranceDetail.create({
      data: {
        vehicleId: vehicle.id,
        insuranceCompany,
        policyNumber,
        // Defaults to the vehicle owner unless the form explicitly overrides it —
        // avoids asking the user to type the same name twice.
        policyHolder: policyHolder || ownerName,
        policyStartDate: policyStartDate ? new Date(policyStartDate) : null,
        policyEndDate: policyEndDate ? new Date(policyEndDate) : null,
        surveyor: surveyor || null,
        coverageAmount: coverageAmount || null,
        estimatedClaimAmount: estimatedClaimAmount || null,
      },
    })

    // Vehicle-level checklist (RC Book, Insurance Policy, etc.) created
    // once per vehicle, the moment that vehicle is added.
    await createChecklistForVehicle(tx, caseId, vehicle.id)

    await recordCaseActivity(tx, {
      caseId,
      userId,
      title: 'Vehicle Added',
      action: 'VEHICLE_ADDED',
      newValue: registrationNumber,
    })

    return tx.vehicle.findUnique({ where: { id: vehicle.id }, include: { insuranceDetails: true } })
  })
}

export async function updateVehicle({ vehicleId, payload, userId }) {
  const { insuranceCompany, policyNumber, policyHolder, policyStartDate, policyEndDate, surveyor, coverageAmount, estimatedClaimAmount, ...vehicleFields } = payload

  return prisma.$transaction(async (tx) => {
    const vehicle = await tx.vehicle.update({ where: { id: vehicleId }, data: vehicleFields })

    const insuranceUpdate = {}
    if (insuranceCompany !== undefined) insuranceUpdate.insuranceCompany = insuranceCompany
    if (policyNumber !== undefined) insuranceUpdate.policyNumber = policyNumber
    if (policyHolder !== undefined) insuranceUpdate.policyHolder = policyHolder
    if (policyStartDate !== undefined) insuranceUpdate.policyStartDate = new Date(policyStartDate)
    if (policyEndDate !== undefined) insuranceUpdate.policyEndDate = new Date(policyEndDate)
    if (surveyor !== undefined) insuranceUpdate.surveyor = surveyor
    if (coverageAmount !== undefined) insuranceUpdate.coverageAmount = coverageAmount
    if (estimatedClaimAmount !== undefined) insuranceUpdate.estimatedClaimAmount = estimatedClaimAmount

    if (Object.keys(insuranceUpdate).length > 0) {
      const [primaryInsurance] = await tx.insuranceDetail.findMany({ where: { vehicleId }, take: 1 })
      if (primaryInsurance) {
        await tx.insuranceDetail.update({ where: { id: primaryInsurance.id }, data: insuranceUpdate })
      }
    }

    await recordCaseActivity(tx, {
      caseId: vehicle.caseId,
      userId,
      title: 'Vehicle Details Updated',
      action: 'VEHICLE_UPDATED',
    })

    return tx.vehicle.findUnique({ where: { id: vehicleId }, include: { insuranceDetails: true } })
  })
}

export async function listVehiclesForCase(caseId) {
  return prisma.vehicle.findMany({
    where: { caseId, deletedAt: null },
    include: { insuranceDetails: true },
    orderBy: { createdAt: 'asc' },
  })
}

export async function deleteVehicle({ vehicleId, userId }) {
  return prisma.$transaction(async (tx) => {
    const vehicle = await tx.vehicle.update({
      where: { id: vehicleId },
      data: { deletedAt: new Date(), deletedBy: userId },
    })

    await recordCaseActivity(tx, {
      caseId: vehicle.caseId,
      userId,
      title: 'Vehicle Removed',
      action: 'VEHICLE_DELETED',
    })

    return vehicle
  })
}
