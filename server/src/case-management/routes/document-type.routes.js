// server/src/case-management/routes/document-type.routes.js
//
// Lives inside case-management/ alongside case.routes.js, but is mounted
// separately at the TOP LEVEL as /document-types (not nested under /cases) —
// document types are global master data shared across every case, not a
// sub-resource of one case, and the frontend already calls /document-types
// directly. See routes.index.js: router.use('/document-types', ...)
import express from 'express'
import {
  getDocumentTypes, addDocumentType, editDocumentType, removeDocumentType,
} from '../controllers/document-type.controller.js'

const router = express.Router()

router.get('/', getDocumentTypes)
router.post('/', addDocumentType)
router.put('/:id', editDocumentType)
router.delete('/:id', removeDocumentType)

export default router