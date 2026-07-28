// Backs the prisma seed script and the checklist auto-creation logic in
// document.service.js. Category matches DocumentType.category in schema.prisma.

export const CASE_LEVEL_DOCUMENTS = [
  'FIR Copy',
  'Complaint Copy',
  'Spot Panchanama',
  'Inquest Report',
  'Charge Sheet',
  'Final Report',
]

export const VICTIM_LEVEL_DOCUMENTS = [
  'PM Report (Post Mortem)',
  'Wound Certificate',
  'MLC Report',
  'Death Certificate',
  'Hospital Records',
  'Discharge Summary',
  'Medical Bills',
  'Aadhaar Card',
  'PAN Card',
  'Bank Passbook',
  'Legal Heir Certificate',
  'Income Certificate',
  'Salary Certificate',
  'Photographs',
]

export const VEHICLE_LEVEL_DOCUMENTS = [
  'RC Book',
  'Insurance Policy',
  'Fitness Certificate',
  'Permit',
  'Driving Licence',
  'Pollution Certificate',
  'Vehicle Photos',
  'IMV Report',
  'Seizure Mahazar',
  'Owner Details',
]

// Combined list used by prisma/seed.js to populate DocumentType rows once.
export const DOCUMENT_TYPE_SEED = [
  ...CASE_LEVEL_DOCUMENTS.map((name) => ({ name, category: 'CASE' })),
  ...VICTIM_LEVEL_DOCUMENTS.map((name) => ({ name, category: 'VICTIM' })),
  ...VEHICLE_LEVEL_DOCUMENTS.map((name) => ({ name, category: 'VEHICLE' })),
]
