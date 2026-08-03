// server/src/case-management/services/document-type.service.js
import prisma from '../../../config/prismaClient.js'

export async function listDocumentTypes() {
  return prisma.documentType.findMany({ orderBy: { name: 'asc' } })
}

export async function createDocumentType({ name, category, description, isMandatory }) {
  return prisma.$transaction(async (tx) => {
    const type = await tx.documentType.create({
      data: { name, category, description, isMandatory: !!isMandatory },
    })

    // Backfill: existing cases/victims/vehicles were created before this
    // type existed, so they never got a Document checklist row for it.
    // Without this, the new type saves fine but never appears anywhere,
    // and there's nothing to upload/edit because the row doesn't exist.
    if (category === 'CASE') {
      const cases = await tx.case.findMany({ where: { deletedAt: null }, select: { id: true } })
      if (cases.length > 0) {
        await tx.document.createMany({
          data: cases.map((c) => ({ caseId: c.id, documentTypeId: type.id })),
        })
      }
    } else if (category === 'VICTIM') {
      const victims = await tx.victim.findMany({ where: { deletedAt: null }, select: { id: true, caseId: true } })
      if (victims.length > 0) {
        await tx.document.createMany({
          data: victims.map((v) => ({ caseId: v.caseId, victimId: v.id, documentTypeId: type.id })),
        })
      }
    } else if (category === 'VEHICLE') {
      const vehicles = await tx.vehicle.findMany({ where: { deletedAt: null }, select: { id: true, caseId: true } })
      if (vehicles.length > 0) {
        await tx.document.createMany({
          data: vehicles.map((v) => ({ caseId: v.caseId, vehicleId: v.id, documentTypeId: type.id })),
        })
      }
    }

    return type
  })
}

export async function updateDocumentType(id, { name, category, description, isMandatory }) {
  const data = { name, category, description, isMandatory }
  Object.keys(data).forEach((key) => data[key] === undefined && delete data[key])
  return prisma.documentType.update({ where: { id }, data })
}

export async function deleteDocumentType(id) {
  return prisma.documentType.delete({ where: { id } })
}