import express from 'express'
import { handleUpload } from '../../middleware/upload.middleware.js'

import { createCase, updateAccidentDetails, getAccident } from '../controllers/accident.controller.js'
import { createVictim, editVictim, listVictims, getVictim, removeVictim } from '../controllers/victim.controller.js'
import { createVehicle, editVehicle, listVehicles, removeVehicle } from '../controllers/vehicle.controller.js'
import { createMedicalDetail, editMedicalDetail, listMedical } from '../controllers/medical.controller.js'
import { upsertPoliceDetail, getPoliceDetail } from '../controllers/police.controller.js'
import { upsertLegalDetail, getLegalDetail } from '../controllers/legal.controller.js'
import {
  listDocuments, uploadDocument, replaceDocument, downloadDocument, verifyDocumentStatus,
} from '../controllers/document.controller.js'
import { submit, changeStatus, assign, close, reopen } from '../controllers/status.controller.js'
import { listCases, getCase, removeCase } from '../controllers/case.controller.js'
import { listRemarks, addRemark, editRemark } from '../controllers/remarks.controller.js'
import { listTimeline } from '../controllers/timeline.controller.js'

const router = express.Router()

// --- Case (listing / details / Step 1 create) ---
router.get('/', listCases)
router.post('/', createCase)                          // Step 1 — creates Case + Accident
router.get('/:caseId', getCase)
router.delete('/:caseId', removeCase)

// --- Step 1: Accident ---
router.get('/:caseId/accident', getAccident)
router.put('/:caseId/accident', updateAccidentDetails)

// --- Step 2: Victims ---
router.get('/:caseId/victims', listVictims)
router.post('/:caseId/victims', createVictim)
router.get('/:caseId/victims/:victimId', getVictim)
router.put('/:caseId/victims/:victimId', editVictim)
router.delete('/:caseId/victims/:victimId', removeVictim)

// --- Step 3: Vehicles & Insurance (one call per vehicle card) ---
router.get('/:caseId/vehicles', listVehicles)
router.post('/:caseId/vehicles', createVehicle)
router.put('/:caseId/vehicles/:vehicleId', editVehicle)
router.delete('/:caseId/vehicles/:vehicleId', removeVehicle)

// --- Step 4: Medical (nested under victim) ---
router.get('/:caseId/victims/:victimId/medical', listMedical)
router.post('/:caseId/victims/:victimId/medical', createMedicalDetail)
router.put('/:caseId/victims/:victimId/medical/:medicalDetailId', editMedicalDetail)

// --- Step 5: Police (one per case, upsert) ---
router.get('/:caseId/police', getPoliceDetail)
router.put('/:caseId/police', upsertPoliceDetail)

// --- Step 6: Legal / MVC (one per case, upsert) ---
router.get('/:caseId/legal', getLegalDetail)
router.put('/:caseId/legal', upsertLegalDetail)

// --- Step 7: Documents ---
router.get('/:caseId/documents', listDocuments)
router.post('/:caseId/documents/:documentId/upload', handleUpload, uploadDocument)
router.put('/:caseId/documents/:documentId/replace', handleUpload, replaceDocument)
router.get('/:caseId/documents/:documentId/download', downloadDocument)
router.put('/:caseId/documents/:documentId/verify', verifyDocumentStatus)

// --- Step 8 + case-level actions ---
router.put('/:caseId/submit', submit)
router.put('/:caseId/status', changeStatus)
router.put('/:caseId/assign', assign)
router.put('/:caseId/close', close)
router.put('/:caseId/reopen', reopen)

// --- Timeline & Remarks tabs ---
router.get('/:caseId/timeline', listTimeline)
router.get('/:caseId/remarks', listRemarks)
router.post('/:caseId/remarks', addRemark)
router.put('/:caseId/remarks/:remarkId', editRemark)

export default router
