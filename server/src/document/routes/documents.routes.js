// server/src/modules/document/routes/documents.routes.js
// Mount this at app.use('/api/documents', documentsRoutes) in your server
// entrypoint, alongside (not replacing) the existing case-scoped
// /api/cases/:caseId/documents/* routes.
import express from 'express'
import {
  listAllDocumentsController, getDocumentByIdController, downloadDocument, verifyDocumentStatus,
} from '../controllers/document.controller.js'

const router = express.Router()

// GET /api/documents?caseNumber=&category=&verified=&page=&limit=
router.get('/', listAllDocumentsController)

// GET /api/documents/:documentId
router.get('/:documentId', getDocumentByIdController)

// GET /api/documents/:documentId/download
router.get('/:documentId/download', downloadDocument)

// PUT /api/documents/:documentId/verify
router.put('/:documentId/verify', verifyDocumentStatus)

export default router