// server/src/scripts/backfillDocumentChecklist.js
//
// One-time fix for cases/victims/vehicles that were created before their
// matching DocumentType rows existed (or before a type was added), so they
// never got a Document checklist row — which is why they show up as
// "0 of 0 received" / "No documents in this checklist yet." even though
// document types exist in the master list.
//
// This script finds every case/victim/vehicle that is missing a Document
// row for any DocumentType matching its category, and creates the missing
// rows. It is safe to run more than once — it only inserts what's missing.
//
// HOW TO RUN (once):
//   1. Place this file at: server/src/scripts/backfillDocumentChecklist.js
//   2. Adjust the import path below to match where your prismaClient lives
//      relative to this file (currently assumes server/src/config/prismaClient.js).
//   3. From the server/ folder run:  node src/scripts/backfillDocumentChecklist.js

import prisma from '../../config/prismaClient.js'

async function backfillCaseDocuments() {
  const caseTypes = await prisma.documentType.findMany({ where: { category: 'CASE' } })
  if (caseTypes.length === 0) return 0

  const cases = await prisma.case.findMany({ where: { deletedAt: null }, select: { id: true } })
  const existing = await prisma.document.findMany({
    where: {
      victimId: null,
      vehicleId: null,
      documentTypeId: { in: caseTypes.map((t) => t.id) },
    },
    select: { caseId: true, documentTypeId: true },
  })
  const existingKeys = new Set(existing.map((d) => `${d.caseId}:${d.documentTypeId}`))

  const rowsToCreate = []
  for (const c of cases) {
    for (const t of caseTypes) {
      const key = `${c.id}:${t.id}`
      if (!existingKeys.has(key)) {
        rowsToCreate.push({ caseId: c.id, documentTypeId: t.id })
      }
    }
  }

  if (rowsToCreate.length > 0) {
    await prisma.document.createMany({ data: rowsToCreate })
  }
  return rowsToCreate.length
}

async function backfillVictimDocuments() {
  const victimTypes = await prisma.documentType.findMany({ where: { category: 'VICTIM' } })
  if (victimTypes.length === 0) return 0

  const victims = await prisma.victim.findMany({
    where: { deletedAt: null },
    select: { id: true, caseId: true },
  })
  const existing = await prisma.document.findMany({
    where: {
      victimId: { not: null },
      documentTypeId: { in: victimTypes.map((t) => t.id) },
    },
    select: { victimId: true, documentTypeId: true },
  })
  const existingKeys = new Set(existing.map((d) => `${d.victimId}:${d.documentTypeId}`))

  const rowsToCreate = []
  for (const v of victims) {
    for (const t of victimTypes) {
      const key = `${v.id}:${t.id}`
      if (!existingKeys.has(key)) {
        rowsToCreate.push({ caseId: v.caseId, victimId: v.id, documentTypeId: t.id })
      }
    }
  }

  if (rowsToCreate.length > 0) {
    await prisma.document.createMany({ data: rowsToCreate })
  }
  return rowsToCreate.length
}

async function backfillVehicleDocuments() {
  const vehicleTypes = await prisma.documentType.findMany({ where: { category: 'VEHICLE' } })
  if (vehicleTypes.length === 0) return 0

  const vehicles = await prisma.vehicle.findMany({
    where: { deletedAt: null },
    select: { id: true, caseId: true },
  })
  const existing = await prisma.document.findMany({
    where: {
      vehicleId: { not: null },
      documentTypeId: { in: vehicleTypes.map((t) => t.id) },
    },
    select: { vehicleId: true, documentTypeId: true },
  })
  const existingKeys = new Set(existing.map((d) => `${d.vehicleId}:${d.documentTypeId}`))

  const rowsToCreate = []
  for (const v of vehicles) {
    for (const t of vehicleTypes) {
      const key = `${v.id}:${t.id}`
      if (!existingKeys.has(key)) {
        rowsToCreate.push({ caseId: v.caseId, vehicleId: v.id, documentTypeId: t.id })
      }
    }
  }

  if (rowsToCreate.length > 0) {
    await prisma.document.createMany({ data: rowsToCreate })
  }
  return rowsToCreate.length
}

async function main() {
  console.log('Starting document checklist backfill...')

  const caseCount = await backfillCaseDocuments()
  console.log(`Case-level documents created: ${caseCount}`)

  const victimCount = await backfillVictimDocuments()
  console.log(`Victim-level documents created: ${victimCount}`)

  const vehicleCount = await backfillVehicleDocuments()
  console.log(`Vehicle-level documents created: ${vehicleCount}`)

  console.log('Backfill complete.')
}

main()
  .catch((err) => {
    console.error('Backfill failed:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })