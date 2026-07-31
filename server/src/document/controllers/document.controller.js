import {
  listDocumentsForCase, listAllDocuments, uploadDocumentFile, replaceDocumentFile,
  getDocumentDownloadUrl, verifyDocument, getDocumentById,
} from '../services/document.service.js'

// GET /api/cases/:caseId/documents
export const listDocuments = async (req, res, next) => {
  try {
    const documents = await listDocumentsForCase(req.params.caseId)
    return res.status(200).json({ success: true, data: documents })
  } catch (err) {
    next(err)
  }
}

// GET /api/documents?caseNumber=&category=&verified=&page=&limit=
// Global, cross-case document browser — backs the Document Management page.
export const listAllDocumentsController = async (req, res, next) => {
  try {
    const { caseNumber, category, verified, page, limit } = req.query
    const result = await listAllDocuments({ caseNumber, category, verified, page, limit })
    return res.status(200).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

// GET /api/documents/:documentId
// Global, single-document lookup — backs the standalone document viewer page.
export const getDocumentByIdController = async (req, res, next) => {
  try {
    const document = await getDocumentById(req.params.documentId)
    return res.status(200).json({ success: true, data: document })
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message })
    next(err)
  }
}

// POST /api/cases/:caseId/documents/:documentId/upload  (multipart, via upload.middleware.js)
export const uploadDocument = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized.' })

    const document = await uploadDocumentFile({
      documentId: req.params.documentId,
      file: req.file,
      uploadedBy: userId,
    })
    return res.status(200).json({ success: true, data: document })
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message })
    next(err)
  }
}

// PUT /api/cases/:caseId/documents/:documentId/replace  (multipart)
export const replaceDocument = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized.' })

    const document = await replaceDocumentFile({
      documentId: req.params.documentId,
      file: req.file,
      uploadedBy: userId,
    })
    return res.status(200).json({ success: true, data: document })
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message })
    next(err)
  }
}

// GET /api/cases/:caseId/documents/:documentId/download
// GET /api/documents/:documentId/download  (global alias — doesn't use caseId)
// Returns a short-lived pre-signed URL — the bucket itself stays private.
export const downloadDocument = async (req, res, next) => {
  try {
    const url = await getDocumentDownloadUrl(req.params.documentId)
    return res.status(200).json({ success: true, data: { url } })
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message })
    next(err)
  }
}

// PUT /api/cases/:caseId/documents/:documentId/verify
// PUT /api/documents/:documentId/verify  (global alias — doesn't use caseId)
export const verifyDocumentStatus = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized.' })

    const { status, remarks } = req.body
    if (!['PENDING', 'VERIFIED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'status must be PENDING, VERIFIED, or REJECTED.' })
    }
    if (status === 'REJECTED' && !remarks?.trim()) {
      return res.status(400).json({ success: false, message: 'A reason is required when rejecting a document.' })
    }

    const document = await verifyDocument({
      documentId: req.params.documentId, verifiedBy: userId, status, remarks,
    })
    return res.status(200).json({ success: true, data: document })
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Document not found.' })
    }
    next(err)
  }
}