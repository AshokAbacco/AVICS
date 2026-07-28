import {
  listDocumentsForCase, uploadDocumentFile, replaceDocumentFile,
  getDocumentDownloadUrl, verifyDocument,
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
export const verifyDocumentStatus = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized.' })

    const { status, remarks } = req.body
    if (!['PENDING', 'VERIFIED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'status must be PENDING, VERIFIED, or REJECTED.' })
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
