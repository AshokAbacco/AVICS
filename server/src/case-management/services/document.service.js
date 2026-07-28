import prisma from '../../../config/prismaClient.js'
import { buildObjectKey, uploadToR2, deleteFromR2, getSignedDownloadUrl } from '../utils/r2Client.util.js'

// Called inside the case-creation transaction. Bulk-inserts one empty
// Document row per CASE-category DocumentType (no fileUploadId yet).
export async function createChecklistForCase(tx, caseId) {
  const types = await tx.documentType.findMany({ where: { category: 'CASE' } })
  if (types.length === 0) return
  await tx.document.createMany({
    data: types.map((t) => ({ caseId, documentTypeId: t.id })),
  })
}

// Called inside the victim-creation transaction.
export async function createChecklistForVictim(tx, caseId, victimId) {
  const types = await tx.documentType.findMany({ where: { category: 'VICTIM' } })
  if (types.length === 0) return
  await tx.document.createMany({
    data: types.map((t) => ({ caseId, victimId, documentTypeId: t.id })),
  })
}

// Called inside the vehicle-creation transaction.
export async function createChecklistForVehicle(tx, caseId, vehicleId) {
  const types = await tx.documentType.findMany({ where: { category: 'VEHICLE' } })
  if (types.length === 0) return
  await tx.document.createMany({
    data: types.map((t) => ({ caseId, vehicleId, documentTypeId: t.id })),
  })
}

export async function listDocumentsForCase(caseId) {
  return prisma.document.findMany({
    where: { caseId, deletedAt: null },
    include: { documentType: true, victim: true, vehicle: true, fileUpload: true },
    orderBy: { createdAt: 'asc' },
  })
}

// Attaches an uploaded file to an existing checklist row (Document).
// documentId must already exist (created by the checklist auto-creation).
export async function uploadDocumentFile({ documentId, file, uploadedBy }) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { documentType: true, case: true, victim: true, vehicle: true },
  })
  if (!document) {
    const err = new Error('Document checklist row not found.')
    err.statusCode = 404
    throw err
  }

  const entityType = document.victimId ? 'victim' : document.vehicleId ? 'vehicle' : 'case'
  const entityId = document.victimId || document.vehicleId || null
  const extension = file.originalname.split('.').pop().toLowerCase()

  const objectKey = buildObjectKey({
    caseNumber: document.case.caseNumber,
    entityType,
    entityId,
    documentName: document.documentType.name,
    extension,
  })

  await uploadToR2(file.buffer, objectKey, file.mimetype)

  const result = await prisma.$transaction(async (tx) => {
    const fileUpload = await tx.fileUpload.create({
      data: {
        originalName: file.originalname,
        storedName: objectKey.split('/').pop(),
        bucket: process.env.R2_BUCKET_NAME,
        objectKey,
        fileUrl: objectKey, // resolved to a signed URL on demand, never stored as public
        mimeType: file.mimetype,
        extension,
        fileSize: file.size,
        uploadedBy,
      },
    })

    const updatedDocument = await tx.document.update({
      where: { id: documentId },
      data: {
        fileUploadId: fileUpload.id,
        received: true,
        receivedDate: new Date(),
        uploaded: true,
      },
    })

    await tx.timeline.create({
      data: {
        caseId: document.caseId,
        title: `${document.documentType.name} Uploaded`,
        eventDate: new Date(),
        createdBy: uploadedBy,
      },
    })
    await tx.activityLog.create({
      data: { caseId: document.caseId, userId: uploadedBy, action: `Uploaded ${document.documentType.name}` },
    })

    return updatedDocument
  })

  return result
}

// Replaces an existing file: deletes the old R2 object, uploads the new one.
export async function replaceDocumentFile({ documentId, file, uploadedBy }) {
  const document = await prisma.document.findUnique({ where: { id: documentId }, include: { fileUpload: true } })
  if (document?.fileUpload) {
    await deleteFromR2(document.fileUpload.objectKey)
  }
  return uploadDocumentFile({ documentId, file, uploadedBy })
}

export async function getDocumentDownloadUrl(documentId) {
  const document = await prisma.document.findUnique({ where: { id: documentId }, include: { fileUpload: true } })
  if (!document?.fileUpload) {
    const err = new Error('No file has been uploaded for this document yet.')
    err.statusCode = 404
    throw err
  }
  return getSignedDownloadUrl(document.fileUpload.objectKey)
}

export async function verifyDocument({ documentId, verifiedBy, status, remarks }) {
  return prisma.document.update({
    where: { id: documentId },
    data: { verified: status, verifiedBy, remarks: remarks ?? undefined },
  })
}
