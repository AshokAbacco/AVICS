//  prisma/seed.js

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const USER_SEED = [
  {
    id: 'dev-admin-user-001',
    name: 'Admin User',
    email: 'admin@avics.local',
    password: 'Admin@123',
    role: 'Administrator',
    department: 'Administration',
    status: 'ACTIVE',
  },
  {
    id: 'dev-agent-user-001',
    name: 'Agent User',
    email: 'agent@avics.local',
    password: 'Agent@123',
    role: 'Agent',
    department: 'Case Management',
    status: 'ACTIVE',
  },
]

async function seedUsers() {
  for (const u of USER_SEED) {
    const hashedPassword = await bcrypt.hash(u.password, 10)
    await prisma.user.upsert({
      where: { id: u.id },
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        password: hashedPassword,
        role: u.role,
        department: u.department,
        status: u.status,
      },
      update: {
        // Re-running the seed shouldn't silently reset a password someone
        // already changed via the real app — only sync the non-secret fields.
        name: u.name,
        role: u.role,
        department: u.department,
        status: u.status,
      },
    })
  }
  console.log(`Seeded ${USER_SEED.length} users.`)
  console.log('Login credentials (change these before production):')
  USER_SEED.forEach((u) => console.log(`  ${u.role}: ${u.email} / ${u.password}`))
}

// ======================================================
// CASE + CLAIM SEED
// ======================================================
// Fixed IDs (like the user seed above) so re-running this script updates
// the same records instead of duplicating them. Owned by the Agent user
// seeded above.

const AGENT_ID = 'dev-agent-user-001'
const CASE_ID = 'dev-case-001'
const CASE_NUMBER = 'MVC-2026-SEED01'

async function seedCaseAndClaim() {
  // ---- Case ----
  const caseRecord = await prisma.case.upsert({
    where: { id: CASE_ID },
    create: {
      id: CASE_ID,
      caseNumber: CASE_NUMBER,
      caseType: 'Motor Vehicle Claim',
      caseCategory: 'General',
      priority: 'HIGH',
      status: 'CLAIM_PROCESSING',
      source: 'POLICE',
      description: 'Two-wheeler vs car collision near NH-44; victim sustained fracture injuries.',
      createdById: AGENT_ID,
      assignedOfficerId: AGENT_ID,
    },
    update: {
      caseType: 'Motor Vehicle Claim',
      caseCategory: 'General',
      priority: 'HIGH',
      status: 'CLAIM_PROCESSING',
      source: 'POLICE',
      description: 'Two-wheeler vs car collision near NH-44; victim sustained fracture injuries.',
    },
  })

  // ---- Accident (one-to-one via unique caseId) ----
  await prisma.accident.upsert({
    where: { caseId: caseRecord.id },
    create: {
      caseId: caseRecord.id,
      accidentDate: new Date('2026-07-18'),
      accidentTime: '17:45',
      district: 'Sri Sathya Sai',
      taluk: 'Puttaparthi',
      village: 'Bukkapatnam',
      location: 'NH-44, near Bukkapatnam toll gate',
      policeStation: 'Puttaparthi Town PS',
      accidentType: 'COLLISION',
      weatherCondition: 'CLEAR',
      description: 'Car hit motorcycle while overtaking on NH-44.',
    },
    update: {
      accidentDate: new Date('2026-07-18'),
      accidentTime: '17:45',
      district: 'Sri Sathya Sai',
      taluk: 'Puttaparthi',
      village: 'Bukkapatnam',
      location: 'NH-44, near Bukkapatnam toll gate',
      policeStation: 'Puttaparthi Town PS',
      accidentType: 'COLLISION',
      weatherCondition: 'CLEAR',
      description: 'Car hit motorcycle while overtaking on NH-44.',
    },
  })

  // ---- Victim ----
  const victim = await prisma.victim.upsert({
    where: { id: 'dev-victim-001' },
    create: {
      id: 'dev-victim-001',
      caseId: caseRecord.id,
      name: 'Ramesh Kumar',
      guardianRelation: 'Father',
      guardianName: 'Venkata Reddy',
      age: 34,
      gender: 'MALE',
      mobile: '9876543210',
      aadhaarNumber: '123456789012',
      address: '12-4-56, Bukkapatnam, Sri Sathya Sai District',
      status: 'ACTIVE',
      occupation: 'Driver',
      maritalStatus: 'MARRIED',
      bloodGroup: 'B+',
    },
    update: {
      name: 'Ramesh Kumar',
      age: 34,
      gender: 'MALE',
      mobile: '9876543210',
      status: 'ACTIVE',
    },
  })

  // ---- Medical Detail (belongs to the victim) ----
  await prisma.medicalDetail.upsert({
    where: { id: 'dev-medical-001' },
    create: {
      id: 'dev-medical-001',
      victimId: victim.id,
      hospitalName: 'Sri Sathya Sai Institute of Higher Medical Sciences',
      doctorName: 'Dr. Lakshmi Narayan',
      mlcNumber: 'MLC-2026-0417',
      admissionDate: new Date('2026-07-18'),
      dischargeDate: new Date('2026-07-25'),
      injuryDetails: 'Compound fracture, right femur; minor lacerations.',
      death: false,
      postmortemDone: false,
      treatmentCost: 185000,
      remarks: 'Follow-up physiotherapy ongoing.',
    },
    update: {
      dischargeDate: new Date('2026-07-25'),
      treatmentCost: 185000,
    },
  })

  // ---- Vehicle ----
  const vehicle = await prisma.vehicle.upsert({
    where: { id: 'dev-vehicle-001' },
    create: {
      id: 'dev-vehicle-001',
      caseId: caseRecord.id,
      registrationNumber: 'KA-01-AB-4521',
      vehicleType: 'CAR',
      brand: 'Maruti Suzuki',
      model: 'Swift Dzire',
      ownerName: 'Suresh Babu',
      driverName: 'Suresh Babu',
      drivingLicence: 'KA0120210012345',
      rcNumber: 'RC-KA01-778812',
    },
    update: {
      ownerName: 'Suresh Babu',
      driverName: 'Suresh Babu',
    },
  })

  // ---- Insurance Detail (belongs to the vehicle) ----
  await prisma.insuranceDetail.upsert({
    where: { id: 'dev-insurance-001' },
    create: {
      id: 'dev-insurance-001',
      vehicleId: vehicle.id,
      insuranceCompany: 'ICICI Lombard General Insurance',
      policyNumber: 'ICICI-POL-2026-778812',
      policyHolder: 'Suresh Babu',
      policyStartDate: new Date('2026-01-01'),
      policyEndDate: new Date('2026-12-31'),
      surveyor: 'A. Suresh',
      coverageAmount: 500000,
      estimatedClaimAmount: 185000,
      remarks: 'Comprehensive policy — third-party + own damage.',
    },
    update: {
      estimatedClaimAmount: 185000,
      surveyor: 'A. Suresh',
    },
  })

  // ---- Police Detail (one-to-one via unique caseId) ----
  await prisma.policeDetail.upsert({
    where: { caseId: caseRecord.id },
    create: {
      caseId: caseRecord.id,
      firNumber: 'FIR-2026-0417',
      firDate: new Date('2026-07-18'),
      crimeNumber: 'CR-417/2026',
      policeStation: 'Puttaparthi Town PS',
      investigatingOfficer: 'SI Manjunath',
      investigationStatus: 'Charge sheet under preparation',
      chargeSheetFiled: false,
      remarks: 'Eyewitness statements recorded.',
    },
    update: {
      investigationStatus: 'Charge sheet under preparation',
      chargeSheetFiled: false,
    },
  })

  // ---- Legal Detail (one-to-one via unique caseId) ----
  await prisma.legalDetail.upsert({
    where: { caseId: caseRecord.id },
    create: {
      caseId: caseRecord.id,
      advocateName: 'K. Ramachandra Rao',
      advocateMobile: '9845098450',
      advocateEmail: 'ramachandra.rao@example.com',
      mvcNumber: 'MVC-OP-2026-0417',
      mvcFiledDate: new Date('2026-08-01'),
      courtName: 'MACT, Anantapur',
      compensationStatus: 'PROCESSING',
      remarks: 'Petition filed under Section 166, Motor Vehicles Act.',
    },
    update: {
      compensationStatus: 'PROCESSING',
    },
  })

  // ---- Claim ----
  await prisma.claim.upsert({
    where: { id: 'dev-claim-001' },
    create: {
      id: 'dev-claim-001',
      caseId: caseRecord.id,
      victimId: victim.id,
      claimNumber: 'CLM-2026-000417',
      policyNumber: 'ICICI-POL-2026-778812',
      claimantName: victim.name,
      claimType: 'MEDICAL',
      claimAmount: 185000,
      approvedAmount: 150000,
      compensationAmount: 0,
      submittedDate: new Date('2026-07-26'),
      decisionDate: new Date('2026-08-02'),
      status: 'PARTIALLY_APPROVED',
      paymentStatus: 'PENDING',
      surveyorName: 'A. Suresh',
      insuranceCompany: 'ICICI Lombard General Insurance',
      remarks: 'Awaiting final medical bills for balance settlement.',
    },
    update: {
      status: 'PARTIALLY_APPROVED',
      approvedAmount: 150000,
      paymentStatus: 'PENDING',
    },
  })

  // ---- Status history + activity log (for realistic dashboard/timeline data) ----
  await prisma.caseStatusHistory.upsert({
    where: { id: 'dev-status-history-001' },
    create: {
      id: 'dev-status-history-001',
      caseId: caseRecord.id,
      oldStatus: 'SUBMITTED',
      newStatus: 'CLAIM_PROCESSING',
      changedBy: AGENT_ID,
      remarks: 'Moved to claim processing after document verification.',
    },
    update: {},
  })

  await prisma.activityLog.upsert({
    where: { id: 'dev-activity-log-001' },
    create: {
      id: 'dev-activity-log-001',
      caseId: caseRecord.id,
      userId: AGENT_ID,
      action: 'CLAIM_CREATED',
      newValue: 'CLM-2026-000417',
    },
    update: {},
  })

  console.log(`Seeded case ${caseRecord.caseNumber} with 1 victim, 1 vehicle, 1 claim.`)
}

async function main() {
  await seedUsers()
  await seedCaseAndClaim()
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })