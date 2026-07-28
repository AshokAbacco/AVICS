import prisma from '../../../config/prismaClient.js'

// Backs the Case Management landing page: search + advanced filters +
// pagination, per the spec's Search Section / Advanced Filters / Pagination.
export async function getAllCases(query) {
  const {
    search, status, district, village, policeStation, hospital,
    insuranceCompany, advocate, compensationStatus, assignedTo,
    dateFrom, dateTo, page = 1, pageSize = 20,
    sortBy = 'createdAt', sortOrder = 'desc',
  } = query

  const where = { deletedAt: null }

  if (status) where.status = status
  if (assignedTo) where.assignedOfficerId = assignedTo

  if (district) where.accident = { ...(where.accident || {}), district: { contains: district, mode: 'insensitive' } }
  if (village) where.accident = { ...(where.accident || {}), village: { contains: village, mode: 'insensitive' } }
  if (policeStation) where.accident = { ...(where.accident || {}), policeStation: { contains: policeStation, mode: 'insensitive' } }

  if (dateFrom || dateTo) {
    where.accident = {
      ...(where.accident || {}),
      accidentDate: {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo && { lte: new Date(dateTo) }),
      },
    }
  }

  if (hospital) {
    where.victims = { some: { medicalDetails: { some: { hospitalName: { contains: hospital, mode: 'insensitive' } } } } }
  }
  if (insuranceCompany) {
    where.vehicles = { some: { insuranceDetails: { some: { insuranceCompany: { contains: insuranceCompany, mode: 'insensitive' } } } } }
  }
  if (advocate) {
    where.legalDetail = { advocateName: { contains: advocate, mode: 'insensitive' } }
  }
  if (compensationStatus) {
    where.legalDetail = { ...(where.legalDetail || {}), compensationStatus }
  }

  // Partial-match search across the fields the spec's Search Section lists.
  if (search) {
    where.OR = [
      { caseNumber: { contains: search, mode: 'insensitive' } },
      { victims: { some: { name: { contains: search, mode: 'insensitive' } } } },
      { victims: { some: { mobile: { contains: search, mode: 'insensitive' } } } },
      { victims: { some: { aadhaarNumber: { contains: search, mode: 'insensitive' } } } },
      { vehicles: { some: { registrationNumber: { contains: search, mode: 'insensitive' } } } },
      { policeDetails: { firNumber: { contains: search, mode: 'insensitive' } } },
      { legalDetail: { mvcNumber: { contains: search, mode: 'insensitive' } } },
      { legalDetail: { advocateName: { contains: search, mode: 'insensitive' } } },
      { vehicles: { some: { insuranceDetails: { some: { insuranceCompany: { contains: search, mode: 'insensitive' } } } } } },
    ]
  }

  const take = Math.min(Number(pageSize) || 20, 100)
  const skip = (Math.max(Number(page), 1) - 1) * take

  const [cases, total] = await Promise.all([
    prisma.case.findMany({
      where,
      include: {
        accident: true,
        victims: { take: 1, orderBy: { createdAt: 'asc' } },
        vehicles: { take: 1, include: { insuranceDetails: true } },
        legalDetail: true,
        assignedOfficer: { select: { id: true, name: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      take,
      skip,
    }),
    prisma.case.count({ where }),
  ])

  return { data: cases, pagination: { page: Number(page), pageSize: take, total, totalPages: Math.ceil(total / take) } }
}

// Full nested fetch — backs the Case Details page and Step 8 Review screen.
export async function getCaseById(caseId) {
  return prisma.case.findFirst({
    where: { id: caseId, deletedAt: null },
    include: {
      accident: true,
      victims: { where: { deletedAt: null }, include: { medicalDetails: true, documents: { include: { documentType: true, fileUpload: true } } } },
      vehicles: { where: { deletedAt: null }, include: { insuranceDetails: true, documents: { include: { documentType: true, fileUpload: true } } } },
      policeDetails: true,
      legalDetail: true,
      documents: { where: { victimId: null, vehicleId: null }, include: { documentType: true, fileUpload: true } },
      caseAssignments: { orderBy: { assignedDate: 'desc' } },
      statusHistory: { orderBy: { changedAt: 'desc' } },
      assignedOfficer: { select: { id: true, name: true, role: true } },
      createdBy: { select: { id: true, name: true } },
    },
  })
}

export async function deleteCase({ caseId, userId }) {
  return prisma.case.update({
    where: { id: caseId },
    data: { deletedAt: new Date(), deletedBy: userId },
  })
}
